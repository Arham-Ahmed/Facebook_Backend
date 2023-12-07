require("dotenv").config({ path: "../Secrets/.env" });
const jwt = require("jsonwebtoken");
const Users = require("../../Models/User");
const tokenModel = require("../../Models/Token");
const { response } = require("../../utils/response");

const JWTSCERET = process.env.JWTSCERET;

const isauthenticated = async (req, res, next) => {
  try {
    const authorization = req?.headers?.authorization;
    if (!authorization)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized !", /// or No authorization token found confused
      });
    const token = authorization.split(" ")[1];
    if (!token)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized !", /// or No authorization token found confused
      });
    const databaseToken = await tokenModel.findOne({ token: token });
    if (!databaseToken)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Internal server error please try again later",
      });

    if (databaseToken?.expireAt < Date.now())
      return response({
        res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Unauthorized !",
      });

    jwt?.verify(databaseToken?.token, JWTSCERET, async (err, decode) => {
      if (err) {
        return response({
          res: res,
          statusCode: 404,
          sucessBoolean: false,
          message: "Unauthorized -- Login agian",
        });
      }
      const user = await Users.findById(decode?._id);
      if (!user)
        return response({
          res: res,
          statusCode: 401,
          sucessBoolean: false,
          message: "User not found",
        });
      req.user = user;
      req.token = token; /// for Future Use
      next();
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
module.exports = { isauthenticated };
