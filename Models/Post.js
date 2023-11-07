const mongoose = require("mongoose");

const PostScehma = new mongoose.Schema({
  caption: {
    type: String,
    required: [true, "Plz Add Some Text"],
  },
  image: {
    img_url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  likes: [
    {
      users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comments: {
        type: String,
        required: true,
      },
    },
  ],
});
module.exports = mongoose.model("post", PostScehma);
