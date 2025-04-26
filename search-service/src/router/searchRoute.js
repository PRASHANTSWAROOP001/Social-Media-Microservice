import express from "express"

import {searchPost} from "../controller/search-controller.js"

import authenticateRequest from "../middleware/authMiddleware.js"

const router = express.Router()


router.get("/post", authenticateRequest, searchPost);

export default router;



