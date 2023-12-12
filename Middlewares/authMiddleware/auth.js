require("dotenv").config({ path: "../Secrets/.env" });
const userModel = require("../../Models/user");
const tokenModel = require("../../Models/token");
const response = require("../../utils/response");
const { jwtVerifier, validateUserPresence } = require("../../helper");

const isauthenticated = async (req, res, next) => {
  try {
    const authorization = req?.headers?.authorization;

    const token = authorization && authorization?.split(" ")[1];

    if (!authorization || !token)
      return response({
        res: res,
        statusCode: 401,
        successBoolean: false,
        message: "Unauthorized !", /// or No authorization token found confused
      });

    const databaseToken = await tokenModel.findOne({ token: token });

    if (!databaseToken || databaseToken?.expireAt < Date.now())
      return response({
        res,
        statusCode: 401,
        successBoolean: false,
        message: "Unauthorized -- Login again",
      });

    const decode = jwtVerifier(databaseToken, res);
    const user = await userModel.findById(decode?._id);
    validateUserPresence(user, res);
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    return response({
      res: res,
      statusCode: e?.statusCode || 500,
      successBoolean: false,
      message: e?.message || "Internal server error",
    });
  }
};
module.exports = { isauthenticated };
