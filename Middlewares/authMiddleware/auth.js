require("dotenv").config({ path: "../Secrets/.env" });
const Users = require("../../Models/User");
const tokenModel = require("../../Models/Token");
const response = require("../../utils/response");
const { jwtVerifier, userChecker } = require("../../helper");

const isauthenticated = async (req, res, next) => {
  try {
    const authorization = req?.headers?.authorization;

    const token = authorization && authorization?.split(" ")[1];

    if (!authorization || !token)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized !", /// or No authorization token found confused
      });

    const databaseToken = await tokenModel.findOne({ token: token });

    if (!databaseToken || databaseToken?.expireAt < Date.now())
      return response({
        res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized -- Login again",
      });

    const decode = jwtVerifier(databaseToken, res);
    const user = await Users.findById(decode?._id);
    userChecker(user, res);
    req.user = user;
    req.token = token;
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
