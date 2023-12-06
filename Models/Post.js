const mongoose = require("mongoose");

const PostScehma = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: [true, "Plz Add Some Text"],
      min: [150, "Password must be Shorter than 150 Character"],
    },
    imageUrl: [{ type: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Post", PostScehma);
