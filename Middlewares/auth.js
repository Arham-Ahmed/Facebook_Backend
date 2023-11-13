require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const User = require("../Models/User");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    const { token } = req?.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unable to acess PLz Login First" });
    }
    const decode = jwt?.verify(token, JWTSCERET);
    if (!decode)
      return res
        .status(404)
        .json({ success: false, message: "Server Error Plz Try again" });

    req.user = await Users.findById(decode._id);
    if (!req?.user)
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

const hasRole = async (req, res, next) => {};
module.exports = { isauthenticated };
