const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    likerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    reactionType: {
      type: String,
      enum: ["like", "heart", "laugh", "sad", "angry"],
      required: true,
      default: "like",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("like", likeSchema);
