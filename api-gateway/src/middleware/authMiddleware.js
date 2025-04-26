import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      logger.warn("Access to post/service is attempted without valid token");
      return res.status(401).json({
        success: false,
        message: "Token is not present",
      });
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      logger.warn("Token validation error", err);
      return res.status(403).json({ success: false, message: "Token is invalid" });
    }

    logger.error("Auth middleware crashed:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export default validateToken;
