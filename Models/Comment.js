const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    comment: {
      type: String,
      required: true,
      maxLength: [50, "Comment must be shorter than 50 character"],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("comment", commentSchema);
