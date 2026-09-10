import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:[true,"username already taken"]
    },
    email:{
        type:String,
        required:true,
        unique:[true,"account already exist with this email"]
    },
    password:{
        type:String,
        required:true
    }
});

export const userModel=mongoose.model("users",userSchema);