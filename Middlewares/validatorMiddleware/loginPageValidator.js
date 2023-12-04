const Joi = require("joi");
const { response } = require("../../utils/response");

const loginPagevalidator = (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      id: Joi.string().hex().length(24),
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
    });
    const { error } = schema.validate(req?.body, { abortEarly: false });
    if (error) return response(res, 400, false, "Error :", error?.details);
  } catch (error) {
    return response(res, 500, false, error?.message);
  }
  next();
};

module.exports = { loginPagevalidator };
