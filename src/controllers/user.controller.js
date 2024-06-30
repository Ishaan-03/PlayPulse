import {asyncHandler} from "../utils/Asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = user.generateAccessTokens();
        const refreshToken = user.generateRefreshTokens();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
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


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(404, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Ensure secure cookies only in production
    };

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});


export const logoutUser = asyncHandler(async (req, res) => {
    // Ensure req.user is defined
    if (!req.user) {
        throw new ApiError(401, "User not found");
    }

    const userId = req.user._id;  // Access _id from req.user

    // Update the user's refresh token
    await User.findByIdAndUpdate(userId, {
        $set: { refreshToken: undefined }
    }, {
        new: true
    });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Ensure secure cookies only in production
    };

    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {

const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken

if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
}
try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET)
    
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid refresh token: User not found");
        }
        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "refresh token is expired or used");
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
       const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(new ApiResponse(200, { accessToken, newrefreshToken }, "Access and refresh tokens generated successfully"))
    
    
} catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token");
}

});
export {registerUser,loginUser,refreshAccessToken};