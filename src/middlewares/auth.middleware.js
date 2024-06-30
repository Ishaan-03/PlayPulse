
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract the token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user based on the token's ID
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid access token: User not found");
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid access token: Invalid token");
        }
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token has expired");
        }
        throw new ApiError(401, error?.message || "Unauthorized request");
    }
});

