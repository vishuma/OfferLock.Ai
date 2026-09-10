import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token is required to be added"],
    },
  },
  {
    timestamps: true,
  }
);

export const blacklistModel = mongoose.model("blacklist", blacklistSchema);