import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
    path:"./env"
});
connectDb()
.then(()=>{
    app.listen(process.env.PORT ||8000,()=>{
        console.log(`app listening on port : ${process.env.PORT || 8000}`);
    })
})
.catch((err)=>{
    console.log("mongodb connection failed",err);
})






















// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";

// const app = express();

// ;(async()=>{
//     try {
//       await mongoose.connect(`${process.env.MONGDB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("error:",error)
//             throw error;
//         }
//     )
//     app.listen(process.env.PORT,()=>{
//         console.log(`App listening on port ${process.env.PORT}`);
//     })
      
//     } catch (error) {
//         console.error("error", error)
//         throw error;
//     }
    
// })()