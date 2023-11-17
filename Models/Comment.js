const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  comment: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Comment", CommentSchema);
