import logger from "../utils/logger.js";
import Post from "../model/post.js";

async function updatePostWithMedia(event) {
    logger.info(`updatePost is intialized for event ${event}`);

    try {

        console.log("event", event)
        const findPostWithDraftId = await Post.find({draftId: event.draftId})

        if(!findPostWithDraftId){
            logger.warn(`No post could be found associated: ${event.draftId}`);
            return
        }
        
       const updatedPostDetails =  await Post.findOneAndUpdate({draftId:event.draftId}, {$set:{mediaIds:[event.mediaId]}}, {new:true})

       logger.info(`Updated post is: ${updatedPostDetails}`)
        
    } catch (error) {
        logger.error(`Error happend while updating post with draftId: ${event?.draftId}`)
    }
    
}

export default updatePostWithMedia;