import express from "express";
import { registerUser, loginUser, refreshUserToken, logoutUser } from "../controller/identityController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshToken",refreshUserToken);
router.post("/logout", logoutUser);
export default router;