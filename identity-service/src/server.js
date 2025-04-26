import mongoose from "mongoose";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv"
import  logger from "../src/utility/logger.js" 
import {RateLimiterRedis} from "rate-limiter-flexible"
import { Redis } from "ioredis"
import rateLimit from "express-rate-limit"
import {RedisStore} from "rate-limit-redis"
import  errorHandler from "./middleware/errorHandler.js"
import routes  from "./routers/identity-service.js"

dotenv.config();



mongoose.connect(process.env.MONGODB_URL).then(()=>{
    logger.info("Connected To mongodbDatabase")
})
.catch((error)=>{
    logger.error("MongoDb connection error :", error)
})


const PORT = process.env.PORT || 3001

const redisClient = new Redis(process.env.REDIS_URL)


const app = express()

app.use(helmet());
app.use(cors());
app.use(express.json())


// DDOS PROTECTION AND RATE LIMIT

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration:1
})


app.use((req, res, next)=>{
    rateLimiter.consume(req.ip).then(()=>(next())).catch(()=>{
        logger.warn(`Rate limit exceeded for ip : ${req.ip}`)
        res.status(429).json({success:false, message:"Too many requests"})
    })
})

// Ip based rate limiting for senstive endpoints

const senstiveEndpointsLimiter = rateLimit({
    windowMs: 15*60*1000,
    max:50,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`Sensitive endpoint rate limit exceeded for ip: ${req.ip}`);
        res.status(429).json({success:false, nessage:"Too many requests"})
    },
    store: new RedisStore({
        sendCommand: (...args)=> redisClient.call(...args)
    })
})

app.use('/api/auth/registraion', senstiveEndpointsLimiter);

app.use('/api/auth', routes)

app.use(errorHandler)

app.listen(PORT, ()=>{
    logger.info(`App started listening on port ${PORT}`)
})

process.on("unhandledRejection", (reason, promise)=>{
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
})