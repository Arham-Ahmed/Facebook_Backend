const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["profileImage", "coverImage", "postImage"],
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("media", mediaSchema);
