import jwt from "jsonwebtoken";

export const authToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRETE || process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    });

    return token;
};