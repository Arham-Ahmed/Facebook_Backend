require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const JWTSCERET = process.env.JWTSCERET;
const isLogin = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(404)
      .json({ success: false, message: "Unable to acess PLz Login First" });
  }
  const decode = jwt.verify(token, JWTSCERET);
  if (!decode)
    return res
      .status(404)
      .json({ success: false, message: "Server Error Plz Try again" });
  req.user = await Users.findById(decode._id);
  next();
};

module.exports = { isLogin };
