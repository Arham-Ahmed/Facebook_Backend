require("dotenv").config({ path: "../Secrets/.env" });
const Users = require("../../Models/User");
const tokenModel = require("../../Models/Token");
const { response } = require("../../utils/response");
const { jwtVerifier } = require("../../helper");

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
        statusCode: 401,
        sucessBoolean: false,
        message: "Un Authorized",
      });

    if (databaseToken?.expireAt < Date.now())
      return response({
        res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized !",
      });

    const decode = jwtVerifier(databaseToken, res);
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
  } catch (e) {
    return response({
      res: res,
      statusCode: e?.statusCode || 500,
      sucessBoolean: false,
      message: e?.message || "Internal server error",
    });
  }
};
module.exports = { isauthenticated };
