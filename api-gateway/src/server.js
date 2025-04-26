import dotenv from "dotenv"
import express from "express"
import { Redis } from "ioredis"
import helmet from "helmet"
import { RedisStore } from "rate-limit-redis"
import { rateLimit } from "express-rate-limit"
import logger from './utils/logger.js'
import proxy from "express-http-proxy"
import errorHandler from "./middleware/errorhandler.js"
import cors from "cors"
import validateToken from "./middleware/authMiddleware.js"

const app = express()

dotenv.config();

const PORT = process.env.PORT || 3000

const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet())
app.use(cors())
app.use(express.json())

// rate limit express end points 

const ratelimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`express rate limit exhausted for ip ${req.ip}`);
        res.status(429).json({
            success: false,
            message: "Too many request too little time (:"
        })
    },
    // uses redis to count the no of Requests.
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use(ratelimitOptions);

app.use((req, res, next) => {

    logger.info(`Recieved ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
})


// this proxyOptions is used to control how the proxy will be done

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        const rewrittenPath = req.originalUrl.replace(/^\/v1/, ''); // edits the path /v1/api to only /api
        logger.debug(`Rewritten path: ${rewrittenPath}`);
        return rewrittenPath;
    },
    // this one is used to handle or log response if some error happens while doing proxy
    proxyErrorHandler: (error, res, next) => {
        logger.error(`Proxy error: ${error.message} `);
        res.status(500).json({
            message: "Internal server Error",
            error: error.message
        })
    }
}


// setting up proxy for identity service

app.use(
    "/v1/api/auth",
    // for all the path that matches /v1/api/auth will be proxied to process.env.IDENTITY_SERVICE..
    // here options are also spacified 
    proxy(process.env.IDENTITY_SERVICE_URL, {
        ...proxyOptions, // Inherits path rewrite and error handling

        //This sets headers on the outgoing request that gets sent to the service.
        // Useful when your backend needs specific headers like Authorization, Content-Type, etc.
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers["Content-Type"] = "application/json";
            return proxyReqOpts;
        },

        // This lets you log or modify the response before sending it back to the original client.
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.info(`Response from Identity service: ${proxyRes.statusCode}`);
            return proxyResData;
        },
    })
);


// proxy for posts service 
app.use("/v1/api/posts", validateToken, proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        console.log("Adding x-user-id:", srcReq.user?.userId);  
        proxyReqOpts.headers["Content-Type"] = "application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from POST service: ${proxyRes.statusCode}`);
        return proxyResData;
    },

}))

// proxy for media service

app.use('/v1/api/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        console.log("Adding x-user-id:", srcReq.user?.userId);  
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        if(!srcReq.headers['content-type'].startsWith("multipart/form-data")){
            proxyReqOpts.headers["Content-Type"] = "application/json"
        }
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from MEDIA service: ${proxyRes.statusCode}`);
        return proxyResData;
    },

}))


// proxy for SEARCH SERVICE


app.use("/v1/api/search", validateToken, proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        console.log("Adding x-user-id:", srcReq.user?.userId);  
        proxyReqOpts.headers["Content-Type"] = "application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response from Search service: ${proxyRes.statusCode}`);
        return proxyResData;
    },
}))



app.use(errorHandler)

app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.originalUrl}`);
    res.status(404).json({ message: "Route not found" });
});


app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`)
    logger.info(`Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`Redis Url ${process.env.REDIS_URL}`)
    logger.info(`Post service is running on port ${process.env.POST_SERVICE_URL}`)
    logger.info(`MEDIA service is running on port ${process.env.MEDIA_SERVICE_URL}`)
    logger.info(`SEARCH service is running on port ${process.env.SEARCH_SERVICE_URL}`)
})


