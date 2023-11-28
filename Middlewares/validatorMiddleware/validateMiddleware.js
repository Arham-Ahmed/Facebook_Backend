const Joi = require("joi");
const { response } = require("../../utils/response");

const validateMiddleware = (req, res, next) => {
  try {
    const schema = Joi.object()
      .keys({
        id: Joi.string().hex().length(24),
        name: Joi.string()
          .min(3)
          .max(20)
          // .trim(true)
          .regex(/^[^\s]+$/)
          .required(),
        email: Joi.string()
          .email()
          .trim(true)
          .regex(/^[^\s]+$/)
          .required(),
        password: Joi.string()
          .trim(true)
          .min(3)
          .max(20)
          .regex(/^[^\s]+$/)
          .required(),
        phoneNumber: Joi.string()
          .length(10)
          .pattern(/[6-9]{1}[0-9]{9}/)
          .optional(),
      })
      .unknown(true);
    const { error } = schema.validate(req?.body);
    if (error) return response(res, 400, false, error?.details);
  } catch (error) {
    return response(res, 500, false, error.message);
  }
  next();
};

module.exports = { validateMiddleware };
