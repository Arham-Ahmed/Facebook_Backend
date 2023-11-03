const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: Number,
    required: true,
    min: [6, "Password must be Longer than 6 Character"],
    min: [20, "Password must be Shorter than 20 Character"],
  },
  profile_photo: {
    type: String,
    trim: true,
    default:
      "https://www.iprcenter.gov/image-repository/blank-profile-picture.png/@@images/image.png",
  },
});
// UserSchema.pre("save", function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     const salt = bcryptjs.genSaltSync(10);
//     const hash = bcryptjs.hashSync(user.password, salt);
//     user.password = hash;
//   }
//   next();
// });
// UserSchema.methods.comparePassword = function (password) {
//   const user = this;
//   return bcryptjs.compareSync(password, user.password);
// };
module.exports = mongoose.model("user", UserSchema);
