const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    initiatorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    friendUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("friend", friendSchema);
