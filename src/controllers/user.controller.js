import {asyncHandler} from "../utils/Asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"




const generateAccessAndRefreshTokens = async(userId)=>{
    try {
       const user= await User.findById(userId)
       const accessToken = user.generateAccessTokens() 
       const refreshToken = user.generateRefreshTokens()

       user.refreshToken = refreshToken
       user.accessToken = accessToken
       await user.save({validateBeforeSave: false})
       
       return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser= asyncHandler( async(req,res)=>{
   //get user details from frontend 
   //validation
   // check if user already exists: username , email.
   // check for images and check for avatar 
   // upload them to cloudinary,avatar
   //create user object-  create entry in db
   //remove password and refresh token feild from response 
   // check for user creation 
   // return response 

   
    const {fullName,email,username,password} = req.body
    console.log("email:",email);
    console.log("username:",username);
    console.log("fullName:",fullName);

   if ([fullName,email,username,password].some((feild)=> feild?.trim()==="")) {
    throw new ApiError(400,"all feilds are required")    
   }

    const existedUser = await User.findOne(
       { $or: [
            {username},
            {email}
        ]
    }
    )
if (existedUser) {
    throw new ApiError(409,"user already exists");
}

const avatarLocalPath =req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;


let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }



if (!avatarLocalPath) {
    throw new ApiError(400,"avatar is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath); 


if (!avatar) {
    throw new ApiError(400,"avatar is required");
}
const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage : coverImage?.url || "",
    password,
    email,
    username:username.toLowerCase(),
   
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken" 
)
if (!createdUser) {
    throw new ApiError(500,"something went wrong while registering the user");
}

res.status(201).json(
    new ApiResponse(200, createdUser , "user registered successfully")
)

})

const loginUser = asyncHandler(async(req,res)=>{

    //req body -> data  
    //username or email
    //check  if user exists
    // check password
    // give access token and refresh token 
    // send cookies securely 
    // send response 

    const {email,username, password} = req.body
    if (!(email || !username)) {
        throw new ApiError(404, "username or email is required ")
    }
    const user = await User.findOne(
        {
            $or:[

                {email},
                {username}
                
            ]
        }
    )
    if (!user) {
        throw new ApiError(404,"user does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

if (!isPasswordValid) {
    throw new ApiError(401,"password is incorrect")
}

const {accessToken , refreshToken}=   await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
const options = {
    httpOnly:true,
    secure: true
}
 return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken", refreshToken,options).json(
    new ApiResponse(200,{
        user: loggedInUser,
        accessToken,
        refreshToken
    },
"user logged in successfully")
 )
})

const logoutUser = asyncHandler(async(req,res)=>{

User.findByIdAndUpdate(
   await req.User._id,{
       $set:{refreshToken: undefined}
    },
    {
        new: true
    }
)
const options = {
    httpOnly:true,
    secure: true
}
return res.status(200).
    clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
    new ApiResponse(200,"user logged out successfully")
)

})


export {registerUser,loginUser,logoutUser};