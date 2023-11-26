require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const { response } = require("../utils/response");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    console.log("auth");
    console.log(
      "🚀 ~ file: auth.js:11 ~ isauthenticated ~ req?.cookies:",
      req?.cookies
    );
    const { token } = req?.cookies;
    if (!token) {
      return response(
        401,
        false,
        "Unable to acess PLz Login First --- please send cookies ",
        res
      );
    }
    const decode = jwt?.verify(token, JWTSCERET);
    if (!decode) return response(404, false, "Server Error Plz Try again", res);
    req.user = await Users.findById(decode._id);
    if (!req?.user) return response(401, false, "Does not Find The User", res);
  } catch (error) {
    return response(500, false, error.message, res);
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
