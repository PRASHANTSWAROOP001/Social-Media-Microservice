import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import logger from "../utils/logger.js";


const redisClient = new Redis(process.env.REDIS_URL);

const  senstiveEndpointsLimit = rateLimit({
    windowMs: 10*60*1000,
    max:50,
    handler: (req, res)=>{
        logger.warn("Rate limit exceeded for the api end point for ip: ",req.ip);
        res.status(429).json({
            success:false,
            message:"You have exceeded the request limit to this endpoint."
        })
    },
    legacyHeaders:false,
    standardHeaders:true,
    store: new RedisStore({
        //sends commands to redis store for example could increase the ips request column by one
        sendCommand: (...args) => redisClient.call(...args)
    })
})

const  generalRateLimit = rateLimit({
    windowMs: 10*60*1000,
    max:100,
    handler: (req, res)=>{
        logger.warn("Rate limit exceeded for the api end point for ip: ",req.ip);
        res.status(429).json({
            success:false,
            message:"You have exceeded the request limit to this endpoint."
        })
    },
    legacyHeaders:false,
    standardHeaders:true,
    store: new RedisStore({
        //sends commands to redis store for example could increase the ips request column by one
        sendCommand: (...args) => redisClient.call(...args)
    })
})

export {senstiveEndpointsLimit, generalRateLimit}





