import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";
import cors from 'cors';
import interviewRouter from "./routes/interview.routes.js"

dotenv.config()
const app=express();
const port=process.env.PORT;
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("db connected")
} catch (error) {
    console.log(error)
}


app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

app.listen(port,()=>{
    console.log(`listning on ${port}`)
})