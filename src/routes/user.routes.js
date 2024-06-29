import { Router } from "express";
// import { registerUser } from "../controllers/user.controller";
import {loginUser,registerUser, logoutUser} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post( upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name: "coverImage",
        maxCount:1
    }
]),registerUser)

Router.route("/login").post(loginUser);

Router.route("/logout").post(verifyJWT, logoutUser);

export {userRouter};