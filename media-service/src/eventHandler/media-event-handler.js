import logger from "../utils/logger.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import Media from "../model/Media.js";
import mongoose from "mongoose";


const handlePostDeleted = async (event) => {
    console.log(event, "event hanlder functions")

    const {postId, mediaIds} = event;

    const objectIds = mediaIds.map((id)=>(new mongoose.Types.ObjectId(id)))

    console.log(objectIds);



    try {

        const mediaToDelete = await Media.find({_id:{$in:objectIds}}) // object id is different next time take care of it while querying

        console.log(mediaToDelete);

        for(const media of mediaToDelete){
            // could use promise.all to resolve things in parallel
            
            await deleteFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);

            logger.info(
                `Deleted media ${media._id} associated with this deleted post ${postId}`
              );

        }

        logger.info(`Processed deletion of media for post id ${postId}`);
        
    } catch (error) {
        logger.error("Error happend at handlePostDelete", error);
    }
}


export {handlePostDeleted};