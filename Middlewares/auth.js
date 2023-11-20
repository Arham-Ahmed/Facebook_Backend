require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const User = require("../Models/User");
const { response } = require("../utils/response");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    const { token } = req?.cookies;
    if (!token) {
      return response(401, false, "Unable to acess PLz Login First", res);
      // res
      //   .status(401)
      //   .json({ success: false, message: "Unable to acess PLz Login First" });
    }
    const decode = jwt?.verify(token, JWTSCERET);
    if (!decode) return response(404, false, "Server Error Plz Try again", res);
    // res
    //   .status(404)
    //   .json({ success: false, message: "Server Error Plz Try again" });

    req.user = await Users.findById(decode._id);
    if (!req?.user) return response(401, false, "Does not Find The User", res);
    // res.status(401).json({ success: false, message: "Does not Find The User" });
  } catch (error) {
    return response(500, false, error.message, res);
    // res.status(500).json({
    //   success: false,
    //   message: error.message,
    // });
  }

  next();
};

const hasRole = async (req, res, next) => {
  if (req?.user?.role !== "admin")
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });

  next();
};
module.exports = { isauthenticated, hasRole };
