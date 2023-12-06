const mongoose = require("mongoose");
const TokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },

    expireAt: {
      type: Date,
      default: Date.now() + 90 * 24 * 60 * 60 * 1000,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Device: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
