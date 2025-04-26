import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import  { Redis } from "ioredis"
import errorHandler from "./middleware/errorHandler.js"
import logger from "./utils/logger.js"
import postRoute from "./router/postRoute.js"
import {connectToRabbitMq, consumeEvent} from "./utils/rabbitMq.js"
import updatePostWithMedia from "./eventHandler/handlePost.js" 

dotenv.config();

const PORT = process.env.PORT || 3002

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    logger.info("Connect to mongodb data successfully");
})
.catch((error)=>{
    logger.error("Error happend while connecting to mongodb database", error);
})


const redisClient = new Redis(process.env.REDIS_URL);

const app = express()

app.use(helmet());
app.use(cors());
app.use(express.json())


app.use((req, res, next) => {

    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
})

app.use(errorHandler);

app.use("/api/posts", (req,res, next)=>{
    req.redisClient = redisClient;
    next();
    // acts as a middleware forwards redisClient as a variable to each endpoint on this route
}, postRoute);


async function startServer(){
    try {
        await connectToRabbitMq();
        await consumeEvent("media.success",updatePostWithMedia)
        app.listen(PORT, ()=>{
            logger.info(`Post service started listening on port ${PORT}`);
        })
    } catch (error) {
        logger.error("Failed to connect to server")
        process.exit(1)
    }
}
startServer();


process.on("unhandledRejection", (reason, promise)=>{
    logger.error(`Unhandled rejection at ${promise} for reason ${reason}`);
})
