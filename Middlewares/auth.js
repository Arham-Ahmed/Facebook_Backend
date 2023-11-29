require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const { response } = require("../utils/response");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    const { token } = req?.cookies;
    if (!token) {
      return response(
        res,
        401,
        false,
        "Unable to acess PLz Login First --- please send cookies "
      );
    }
    const decode = jwt?.verify(token, JWTSCERET);
    if (!decode) return response(res, 404, false, "Server Error Plz Try again");
    req.user = await Users.findById(decode._id);
    if (!req?.user) return response(res, 401, false, "Does not Find The User");
  } catch (error) {
    return response(res, 500, false, error.message);
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
