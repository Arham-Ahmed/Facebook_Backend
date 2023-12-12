const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: [true, "Email alerady exists"],
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password must be longer than 6 character"],
      maxLength: [20, "Password must be shorter than 20 character"],
      select: false,
    },
    profilePhotos: [String],
    coverPhotos: [String],
    phoneNumber: {
      type: Number,
      match: [/^1[3,4,5,6,7,8,9]\d{9}$/, "Please enter a valid number"],
      min: [11, "Phone number must be shorter then 11 number"],
    },
    bio: {
      type: String,
    },
    livesIn: {
      type: String,
    },
    socialLinks: [String],
    role: {
      type: String,
      default: "user",
      select: false,
    },
    isDeleted: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcryptjs.hash(this.password, 8);
    this.password = hash;
  }
  next();
});

module.exports = mongoose.model("user", userSchema);
