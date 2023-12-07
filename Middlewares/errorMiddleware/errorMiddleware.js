const { response } = require("../../utils/response");

const errorHandler = async (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "An internal server error !";

  return response({
    res: res,
    statusCode: error.statusCode,
    message: "Error",
    payload: error.message,
  });
};

module.exports = errorHandler;
