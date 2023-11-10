const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true,
    unique: false,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  done: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("todo", TodoSchema);