const mongoose = require("mongoose");

const postScehma = new mongoose.Schema(
  {
    caption: {
      type: String,
      minLength: 0,
      maxLength: [150, "Caption must be shorter than 150 character"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("post", postScehma);
