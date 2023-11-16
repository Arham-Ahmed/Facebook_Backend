const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Joi = require("joi");
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
  profile_photo: [
    {
      type: String,
      default:
        "https://cfd.nu.edu.pk/wp-content/uploads/2020/05/5906-e1646889042179-290x333.jpg",
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
  },
  token: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Token",
    },
  ],
});
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcryptjs.hash(this.password, 8);
    this.password = hash;
  }
  next();
});
UserSchema.methods.JoiValidation = () => {
  let schema = {
    name: Joi.types
      .String()
      .alphanum()
      .min(6)
      .max(20)
      .trim(true)
      .regex(/^[^\s]+$/)
      .required(),
    email: Joi.types
      .String()
      .email()
      .trim(true)
      .regex(/^[^\s]+$/)
      .required(),
    password: Joi.types
      .String()
      .trim(true)
      .min(6)
      .max(20)
      .regex(/^[^\s]+$/)
      .required(),
    phoneNumber: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required(),
  };
  return Joi.validate(obj, schema);
};

module.exports = mongoose.model("User", UserSchema);
