import logger from "../utility/logger.js";
import { validateRegistration, validateLogin } from "../utility/validation.js";
import User from "../model/User.js"
import generateToken from "../utility/generateToken.js";
import RefreshToken from "../model/RefreshToken.js";


const registerUser = async (req, res) => {
    logger.info("Registration endpoint hit.")
    try {
        const { error } = validateRegistration(req.body);

        if (error) {
            logger.warn("Validation Error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            })
        }

        const { email, username, password } = req.body;

        let user = await User.findOne({ $or: [{ email }, { username }] })

        if (user) {
            logger.warn("User alreday exits");

            return res.status(400).json({
                success: false,
                message: "User already exits",
            })

        }


        user = new User({ username, email, password });
        await user.save();

        logger.warn("User Details Saved", user._id);

        const { accessToken, refreshToken } = await generateToken(user);

        res.status(201).json({
            success: false,
            message: "User registered successfully",
            accessToken,
            refreshToken,
        })
    } catch (error) {
        logger.error("Registration error occurred", e)
        res.status(500).json({
            success: true,
            message: "Internal server error"
        })
    }
}


const loginUser = async (req, res) => {

    logger.info("Login endpoint hit.")

    try {

        const { error } = validateLogin(req.body);

        if (error) {
            logger.warn("Validation Error", error.details[0].message)
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            logger.warn('Invalid user')
            return res.status(400).json({
                success: true,
                message: "Invalid user details"
            })
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            logger.warn('Invalid Password')
            return res.status(400).json({
                success: true,
                message: "Invalid password"
            })
        }

        const {accessToken, refreshToken} = await generateToken(user);

        return res.json({
            success:true,
            message:"Logged in successfully",
            userId:user._id,
            accessToken,
            refreshToken,
        })


    } catch (error) {

        logger.error("Error occurred while logging ", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}


const refreshUserToken = async (req, res)=>{
    try {

        const {refreshToken} = req.body;

        if(!refreshToken){
            logger.warn("No refresh avilable");
            return res.status(400).json({
                success:false,
                message:"Refresh Token is not avilable"
            })
        }

        const storedToken = await RefreshToken.findOne({token: refreshToken});

        if(!storedToken || storedToken.expiresAt < new Date()){

            logger.warn("Stored(RefreshToken) token either expired or not present");

            return res.status(400).json({
                success:false,
                message:"Invalid or expired refresh token"
            })

        }

        const user = await User.findById(storedToken.user);

        if(!user){
  
            logger.warn("User could not be found");

            return res.status(400).json({
                success:false,
                message:"User could not be found"
            })

        }

        const {accessToken:newAccessToken, refreshToken: newRefreshToken} = await generateToken(user);

        await RefreshToken.findByIdAndDelete(storedToken._id);

        res.json({
            newAccessToken, 
            newRefreshToken
        })
        
    } catch (error) {

        logger.error("Error happend at while refreshing token: ", error)

        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
        
    }
}


const logoutUser = async(req, res)=>{
    try {
        
        const {refreshToken} = req.body;

        if(!refreshToken){
            logger.warn("No refresh avilable");
            return res.status(400).json({
                success:false,
                message:"Refresh Token is not avilable"
            })
        }

        await RefreshToken.findOneAndDelete({token:refreshToken});
        logger.info("Refresh token deleted for logout");

        return res.json({
            success:true,
            message:"Logged out successfull."
        })

        
    } catch (error) {
        logger.error("Error happend at logout:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error :("
        })
    }
}


export { registerUser, loginUser, refreshUserToken, logoutUser }