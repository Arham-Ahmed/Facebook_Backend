const Joi = require("joi");
const userSignupSchema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .max(20)
      // .trim(true)
      .regex(/^[^\{}]+$/)
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

module.exports = userSignupSchema;
