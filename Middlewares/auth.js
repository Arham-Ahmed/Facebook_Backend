require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const JWTSCERET = process.env.JWTSCERET;
const isauthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  console.log("🚀 ~ file: auth.js:7 ~ isauthenticated ~ token:", req.cookie);
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
  next();
};
module.exports = { isauthenticated, isLogin };
