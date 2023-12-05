const mongoose = require("mongoose");
const TodoSchema = new mongoose.Schema(
  {
    todo: {
      type: String,
      required: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: {
      type: Date,
      default: Date.now(),
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", TodoSchema);
