import {v2 as cloudinary} from "cloudinary";
import logger from "./logger.js"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME ,
    api_key:process.env.API_KEY ,
    api_secret:process.env.API_SECRET 
})


const uploadMediaToCloudinary = (file)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type:"auto"
        }, (error, result)=>{
            if(error){
                logger.error("Error while uploading media to the cloudinary", error);
                reject(error)
            }
            else{
                resolve(result)
            }
        })
        uploadStream.end(file.buffer)
    });
}

const deleteFromCloudinary = async(publicId)=>{
    try {

        const deleteResult =await  cloudinary.uploader.destroy(publicId)

        logger.info("media deleted from cloudinary.", deleteResult);
        
        return deleteResult;

    } catch (error) {

        logger.error("Error happend while deleting files at cloudinary", error);
        
    }
}

export { uploadMediaToCloudinary, deleteFromCloudinary}