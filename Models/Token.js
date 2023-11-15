const mongoose = require("mongoose");
const TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  GenratedAt: {
    type: Date,
    default: new Date(Date.now()).toLocaleDateString("en-US"),
  },
  ExpireAt: {
    type: Date,
    default: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-US"
    ),
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  Device: { type: String, required: true },
});

module.exports = mongoose.model("Token", TokenSchema);
