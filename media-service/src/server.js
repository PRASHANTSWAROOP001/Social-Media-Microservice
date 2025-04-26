import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import mediaRoute from "./router/media-route.js"
import errorHander from "./middleware/errorHandler.js"
import logger from './utils/logger.js'
import mongoose from "mongoose"

import { connectToRabbitMq, consumeEvent } from "./utils/rabbitMq.js"

import { handlePostDeleted } from "./eventHandler/media-event-handler.js"

dotenv.config()



const app = express();

const PORT = process.env.PORT || 3003

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    logger.info("Connect to mongodb data successfully");
})
.catch((error)=>{
    logger.error("Error happend while connecting to mongodb database", error);
})

app.use(helmet());
app.use(cors());
app.use(express.json())



app.use((req, res, next)=>{
    logger.info(`Recieved ${req.method} request to ${req.url}`)
    logger.info(`Request body`, req.body);
    next();
})

// implement rate limits

app.use('/api/media', mediaRoute)
app.use(errorHander)

async function startServer(){
    try {
        await connectToRabbitMq();
        await consumeEvent("post.delete", handlePostDeleted)
        app.listen(PORT, ()=>{
            logger.info(`Media service started listening on port ${PORT}`);
        })
    } catch (error) {
        logger.error("Failed to connect to server", error)
        process.exit(1)
    }
}

startServer();

process.on("unhandledRejection", (reason, promise)=>{
    logger.error(`Unhandled rejection at ${promise} for reason ${reason}`);
})
