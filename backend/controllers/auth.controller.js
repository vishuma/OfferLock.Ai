import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { authToken } from "../Auth/auth.token.js";
import { blacklistModel } from "../models/blacklist.model.js";

export const registerController = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please provide username, email and password fields" });
        }

        const alreadyUser = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (alreadyUser) {
            return res.status(400).json({ message: "Account already exists" });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username,
            email,
            password: hashPass
        });

        const token = authToken(user._id, res);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const existUser = await userModel.findOne({ email });
        if (!existUser) {
            return res.status(400).json({ message: "Invalid email and password" });
        }

        const validPass = await bcrypt.compare(password, existUser.password);
        if (!validPass) {
            return res.status(400).json({ message: "Invalid email and password" });
        }

        const token = authToken(existUser._id, res);

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: existUser._id,
                username: existUser.username,
                email: existUser.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            await blacklistModel.create({ token });
        }

        // FIXED: Changed clearCokkie to clearCookie
        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getMeController = async (req, res) => {
    try {
        // FIXED: Checked both req.user.id and req.user._id
        const userId = req.user?.id || req.user?._id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};