import jwt from "jsonwebtoken";
import { blacklistModel } from "../models/blacklist.model.js";

export const authUser = async (req, res, next) => {
    try {
        const token = 
            req.cookies?.token || 
            req.headers?.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token not provided" });
        }

        const isBlackListed = await blacklistModel.findOne({ token });
        if (isBlackListed) {
            return res.status(401).json({ message: "Token is invalid or revoked" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_SECRETE);
        req.user = decoded;
        
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};