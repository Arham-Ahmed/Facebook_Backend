const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
const moment = require("moment");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "PLz Enter your Name"],
    },
    email: {
      type: String,
      required: [true, "Plz Enter your Email"],
      unique: [true, "Email Alerady Exists"],
    },
    password: {
      type: String,
      required: [true, "Plz Enter your Password"],
      min: [6, "Password must be Longer than 6 Character"],
      min: [20, "Password must be Shorter than 20 Character"],
      select: false,
    },
    profile_photo: [
      {
        type: String,
      },
    ],
    cover_photo: [
      {
        type: String,
      },
    ],
    phoneNumber: {
      type: String,
      min: [11, "Plz Enter a valid number"],
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    todos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo",
      },
    ],
    role: {
      type: String,
      default: "user",
      select: false,
    },
    token: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Token",
        select: false,
      },
    ],
    isDelete: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcryptjs.hash(this.password, 8);
    this.password = hash;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
