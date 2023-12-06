const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
      maxLength: [50, "Comment must be Shorter than 50 Character"],
    },
    reply: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Comment", CommentSchema);
