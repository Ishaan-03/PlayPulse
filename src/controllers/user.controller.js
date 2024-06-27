import {asyncHandler} from "../utils/Asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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

    const existedUser =User.findOne(
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
const coverImageLocalpPath = req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {
    throw new ApiError(400,"avatar is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalpPath); 


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




export {registerUser};