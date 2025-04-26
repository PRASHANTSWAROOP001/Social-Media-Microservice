import Search from "../model/search.js"
import logger from "../utils/logger.js"

const searchPost=async (req, res)=>{

    logger.info(" Search End point hit")

    
    try {
         const {query }= req.query;

         logger.info(query);

         const result = await Search.find(
         { 
            $text: {
                $search: query
            }
         },
         {
            score: { $meta: "textScore" }
         }
         ,
         ).sort({score: {$meta: 'textScore'}}).limit(10)
      

         res.json(result)


    } catch (error) {
        logger.error("Error while searching post: ", error)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}


export {searchPost};

