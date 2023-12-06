const Joi = require("joi");
const { response } = require("../../../utils/response");

const validator = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req?.body, { abortEarly: false });
      if (error)
        return response({
          res: res,
          statusCode: 400,
          sucessBoolean: false,
          message: "Error",
          payload: error?.details,
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
    next();
  };
};

module.exports = { validator };
