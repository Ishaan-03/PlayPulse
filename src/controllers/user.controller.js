import {asyncHandler} from "../utils/Asynchandler.js"

const registerUser= asyncHandler( async(req,res)=>{
    res.status(200).json({
        message:"will you marry me my love shrishty? "
    })
});



export {registerUser};