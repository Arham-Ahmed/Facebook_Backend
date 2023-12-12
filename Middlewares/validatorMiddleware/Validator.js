const response = require("../../utils/response");

const validator = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req?.body, { abortEarly: false });
      if (error)
        return response({
          res: res,
          statusCode: 400,
          successBoolean: false,
          message: "Error",
          payload: error?.details,
        });
      next();
    } catch (e) {
      return response({
        res: res,
        statusCode: 500,
        successBoolean: false,
        message: "Error",
        payload: e.message,
      });
    }
  };
};

module.exports = validator;
