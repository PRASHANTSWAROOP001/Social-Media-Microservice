import {uploadMediaToCloudinary} from "../utils/cloudinary.js";
import logger from "../utils/logger.js"
import Media from "../model/Media.js";
import { publishEvent } from "../utils/rabbitMq.js";

const uploadMedia = async(req, res)=>{
    logger.info("Starting media upload");

    try {

        if(!req.file){
            logger.error("No file found. Add a file and try again.")
            return res.status(400).json({
                success:false,
                message:"No file found. Please add a file and try again."
            })
        }

        const {originalname, mimetype, buffer} = req.file

        const userId = req.user; // userId for authenticated users

        const {draftId} = req.body;

        logger.info(`File details: name=${originalname}, type=${mimetype}`);
        logger.info("upload to cloudinary started")
        
        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
        logger.info(`Cloudinary Upload successfully. Public Id ${cloudinaryUploadResult.public_id}`)

        const newlyCreatedMedia = new Media({
           publicId: cloudinaryUploadResult.public_id,
           originalName:originalname,
           mimeType:mimetype,
           url: cloudinaryUploadResult.secure_url,
           userId
        })

        await newlyCreatedMedia.save();
        // added this to test the automated post updation with mediaIds
        await publishEvent("media.success", {
            draftId: draftId,
            publicUrl: newlyCreatedMedia.url,
            userId:userId,
            mediaId: newlyCreatedMedia._id
        })

        res.json({
            success:true,
            mediaId:newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
            message:"Media Upload is successful"
        })

    } catch (error) {
        logger.error("Error happend while uploading.", error)

        res.status(500).json({
            success:false,
            message:"Internal Server Error Happend At Our Side"
        })
        
    }

}

export {uploadMedia}