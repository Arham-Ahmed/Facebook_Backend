require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../Models/User");
const { response } = require("../utils/response");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    const authorization = req?.headers?.authorization;
    if (!authorization)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized",
      });

    const token = authorization.split(" ")[1];
    if (!token) {
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unable to acess PLz Login First --- Please send token ",
      });
    }
    const decode = jwt?.verify(token, JWTSCERET);
    if (!decode)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "Unauthorized -- Login agian",
      });
    const user = await Users.findById(decode._id);
    if (!user)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "User not found",
      });
    req.user = user;
    req.token = token;
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }

  next();
};

const hasRole = async (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });

  next();
};
module.exports = { isauthenticated, hasRole };
