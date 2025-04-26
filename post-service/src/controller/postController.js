import logger from "../utils/logger.js";
import Post from "../model/post.js";
import { validatePost } from "../middleware/validation.js";
import {publishEvent} from "../utils/rabbitMq.js" 

const createPost = async(req,res)=>{
    logger.info("create-post endpoint hit")
    try {
        
        const {error} = validatePost(req.body);

        if(error){
            logger.warn("validation error", error.details[0].message);
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }

        const {content, mediaIds, draftId} = req.body;

                
        const newlyCreatedPost = new Post({
            user:req.user, // should come from a middleware
            content,
            mediaIds: mediaIds || [],
            draftId: draftId // added to test media.success event
        })


        await newlyCreatedPost.save();

        await publishEvent("post.created", {
            postId:newlyCreatedPost._id.toString(),
            userId:newlyCreatedPost.user.toString(),
            content:newlyCreatedPost.content,
            createdAt: newlyCreatedPost.createdAt
        })

        await invalidatePost(req, newlyCreatedPost._id.toString())

        logger.info("Post created successfully", newlyCreatedPost)

        res.json({
            success:true,
            message:"Post created Successfully"
        })

    } catch (error) {

        logger.error("Error creating post", error)
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


const invalidatePost = async (req, input) => {

    const keys = await req.redisClient.keys("posts:*") // this will get us all the keys matching pattern posts:....

    if(keys.length > 0 ){
        await req.redisClient.del(keys);
        // deletes all the cached data for keys matching pattern posts:*..

    }
    
}

const getAllPost = async(req, res)=>{
    logger.info("get-all-post endpoint hit.")
    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page -1) * limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);

        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts));
        }

        const posts = await  Post.find({}).sort({createdAt:-1}).skip(startIndex).limit(limit);

        const totalNoOfPosts = await Post.countDocuments();

        const result = {
            posts,
            currentpage:page,
            totalPages: Math.ceil(totalNoOfPosts/limit),
            totalPosts: totalNoOfPosts
        }

        await req.redisClient.setex(cacheKey,300, JSON.stringify(result));

        res.json(result);
        
    } catch (error) {
        logger.error("Error happend while getting post", error);
        return res.status(500).json({
            success:false,
            message:"Internal server happend."
        })
    }
}

const getPost = async (req, res) => {

    logger.info("get post/single post end point hit.")
    
    try {
        const postId = req.params.id;
        
        if(!postId){

            logger.warn("missing params");

            return res.status(401).json({
                success:false,
                message:"params are missing"
            })
        }

        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);

        if(cachedPost){
            return res.json({
                success:true,
                post:JSON.parse(cachedPost)
            })
        }

        const singlePostDetails = await Post.findById(postId);

        if(!singlePostDetails){
            return res.status(404).json({
                success:false,
                message:"Post could not be found"
            })
        }

        await req.redisClient.setex(cacheKey, 3600, JSON.stringify(singlePostDetails));

        res.json({
            success:true,
            post:singlePostDetails
        });


    } catch (error) {

        logger.error("Error while fetching details of single posts.");

        return res.status(500).json({
            success:false,
            message:"internal server error happend at our side."
        })
        
    }
}


const deletePost = async (req, res)=>{
    logger.info("delete end point hit.");

    try {

        const postId = req.params.id;

        if(!postId){
            logger.warn("params missing to perform delete on deletePost");

            return res.status(400).json({
                success:false,
                message:"Paramas missing."
            })
        }

        const singlePostDetails = await Post.findById(postId)

        if(!singlePostDetails){
            return res.status(404).json({
                success:false,
                message:"Post Could Not Be Found"
            })
        }
        else if(singlePostDetails?.user == req.user){
            await req.redisClient.del(`post:${postId}`);
            logger.info(`Deleted post and invalidated cache for post:${postId}`);
            await Post.findByIdAndDelete(postId);

            await publishEvent("post.delete",{
                postId:singlePostDetails._id.toString(),
                userId: req.user,
                mediaIds: singlePostDetails.mediaIds

            } )

            return res.json({
                success:true,
                message:"post deleted successfully"
            })
        }
        else{

            console.log(singlePostDetails?.user.toString())
            console.log(req.user)
            res.json({
                success:false,
                message:"You can only delete your own posts :("
            })
        }
        
    } catch (error) {

        logger.error("Error happend while deleting post", error);

        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
        
    }
}


export {createPost , getAllPost, getPost, deletePost}