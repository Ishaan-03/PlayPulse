import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
videFile:{
    type: String, //cloudinary url
    required: true,
},
thumbnail:{
    type: String, //cloudinary url
    required: true,
},
title:{
    type: String,
    required: true,
},
description:{
    type: String,
    required: true,
},
duration:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
views:{
    type: Number,
    default:0
},
isPublished:{
    type: Boolean,
    default: true
},
videoOwner:{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
}
  },
  {  timestamps:true}

);
VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",VideoSchema);