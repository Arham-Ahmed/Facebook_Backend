require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const User = require("../Models/User");
const JWTSCERET = process.env.JWTSCERET;
const isauthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unable to acess PLz Login First" });
    }
    const decode = jwt.verify(token, JWTSCERET);
    if (!decode)
      return res
        .status(404)
        .json({ success: false, message: "Server Error Plz Try again" });
    req.user = await Users.findById(decode._id);
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Does not Find The User" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  next();
};

const isLogin = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unable to acess Please Login First" });
  }
  const decode = jwt.verify(token, JWTSCERET);
  if (!decode)
    return res
      .status(404)
      .json({ success: false, message: "Server Error Plz Try again" });
  req.user = await Users.findById(decode._id);
  console.log("🚀 ~ file: auth.js:48 ~ isLogin ~ req.user:", req.user);
  next();
};
module.exports = { isauthenticated, isLogin };
