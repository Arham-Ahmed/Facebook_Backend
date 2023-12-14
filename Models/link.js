const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("link", linkSchema);
