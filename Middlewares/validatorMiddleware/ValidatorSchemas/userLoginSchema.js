const Joi = require("joi");
const userLoginSchema = Joi.object().keys({
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
module.exports = userLoginSchema;
