import logger from "../utils/logger.js"
import Search from "../model/search.js"
import e from "express";


async function handleSearchPost(event) {
    logger.info("inside the event handler", event);
    try {


        const newSearchPost =  new Search({
            userId:event.userId,
            content:event.content,
            createdAt: event.createdAt,
            postId: event.postId
        })
        

        await newSearchPost.save();

        logger.info("Search Post data saved by consuming even: ", event.postId);
    } catch (error) {
        logger.error("error happend while handling the handle search post event", error)

    }
    
}


async function handlePostDelete(event) {
    try {
        
        await Search.findOneAndDelete({postId:event.postId});

        logger.info(`Search document deleted for postId ${event.postId}`)

    } catch (error) {
        
        logger.error("Error happend while deleting Seach Item", error);
    }
    
}

export { handleSearchPost, handlePostDelete}