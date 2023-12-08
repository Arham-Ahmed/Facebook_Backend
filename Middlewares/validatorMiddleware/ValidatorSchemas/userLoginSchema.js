const Joi = require("joi");
const userLoginSchema = Joi.object().keys({
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
