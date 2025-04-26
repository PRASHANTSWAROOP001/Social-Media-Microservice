import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    content : {
        type:String,
        required:true
    },
    mediaIds:[{
        type:String
    }],
    draftId:{
        type:String,
        unique:true,
        required:true
    },
    createdAt:{
        type:Date,
        default: new Date()
    }

}, {timestamps:true})


postSchema.index({content:"text"})

const Post = mongoose.model("Post", postSchema);

export default Post;