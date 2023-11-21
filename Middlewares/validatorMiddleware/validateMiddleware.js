const { response } = require("../../utils/response");

const validateMiddleware = (validater) => {
  return (req, res, next) => {
    const { error } = validater(req?.body);
    if (error) {
      response(400, false, error?.details[1]?.message, res);
    }
    next();
  };
};

module.exports = { validateMiddleware };
