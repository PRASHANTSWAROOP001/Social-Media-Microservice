import logger from "../utils/logger.js";


const authenticateRequest = async (req, res, next)=>{
    const userId = req.headers['x-user-id']
    logger.info("Bkl authmiddleware inside post service is working.")
    if(!userId){
        logger.warn("Access to post attempted without userId");
        res.status(400).json({
            success:false,
            message:"Invalid post request without proper headers"
        })
    }
    req.user = userId;
    next();

}

export default authenticateRequest;