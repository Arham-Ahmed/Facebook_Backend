const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Post = require("./Post");
const Todo = require("./Todo");
const UserSchema = new mongoose.Schema({
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
  profile_photo: {
    type: String,
    default:
      "https://www.iprcenter.gov/image-repository/blank-profile-picture.png/@@images/image.png",
  },
  phone: {
    type: String,
    min: [11, "Plz Enter a valid number"],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
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
      ref: "todo",
    },
  ],
  token: [String],
});
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcryptjs.hash(this.password, 8);
    this.password = hash;
  }
});

module.exports = mongoose.model("user", UserSchema);
