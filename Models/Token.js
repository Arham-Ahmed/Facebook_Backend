const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      default: Date.now() + 90 * 24 * 60 * 60 * 1000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    device: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("token", tokenSchema);
