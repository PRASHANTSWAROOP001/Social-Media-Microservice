import { uploadMedia } from "../controller/media-controller.js";
import authenticateRequest from "../middleware/authMiddleware.js";
import logger from "../utils/logger.js";
import express from "express"

import multer from "multer"

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits:{
        fileSize: 5 * 1024 * 1024
    }
}).single("file")

router.post('/upload', authenticateRequest, (req, res, next)=>{
    upload(req, res, function(err){
        if(err instanceof multer.MulterError){
            logger.error("Multer error while uploading", err)
            return res.status(400).json({
                message:"Multer error while uploading",
                error:err.message,
                stack:err.stack
            })
        }
        else if(err){
            logger.error("Some unknown error happend", err)
            return res.status(500).json({
                message:"Some unknown error happend",
                error:err.message,
                stack:err.stack
            })
        }

        if(!req.file){
            return res.status(400).json({
                message:"No file found",
            })
        }

        next();


    })
}, uploadMedia)

export default router