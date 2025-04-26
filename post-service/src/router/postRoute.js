import express from "express";
import {createPost, getAllPost, getPost, deletePost} from "../controller/postController.js"
import authenticateRequest from "../middleware/authMiddleware.js";
import { senstiveEndpointsLimit } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/create-post",senstiveEndpointsLimit,authenticateRequest,createPost);

router.get("/get-all-post", senstiveEndpointsLimit , getAllPost);

router.get("/single-post/:id", getPost);

router.delete("/delete/:id",authenticateRequest,deletePost);


export default router;