require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const { response } = require("../utils/response");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    const authorization = req?.headers?.authorization;
    if (!authorization) return response(res, 401, false, "Unauthorized");

    const token = authorization.split(" ")[1];
    if (!token) {
      return response(
        res,
        401,
        false,
        "Unable to acess PLz Login First --- please send token "
      );
    }
    const decode = jwt?.verify(token, JWTSCERET);
    if (!decode) return response(res, 404, false, "Server Error Plz Try again");
    global.user = await Users.findById(decode._id);
    global.token = token;
    if (!global.user)
      return response(res, 401, false, "Does not Find The User");
  } catch (error) {
    return response(res, 500, false, error.message);
  }

  next();
};

const hasRole = async (req, res, next) => {
  if (global.user?.role !== "admin")
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });

  next();
};
module.exports = { isauthenticated, hasRole };
