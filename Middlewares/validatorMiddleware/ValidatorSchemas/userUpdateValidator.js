const Joi = require("joi");
const userUpdateSchema = Joi.object()
  .keys({
    email: Joi.string()
      .email()
      .trim(true)
      .regex(/^[^\s]+$/),
    password: Joi.string()
      .trim(true)
      .min(3)
      .max(20)
      .regex(/^[^\s]+$/),
    phoneNumber: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .optional(),
  })
  .unknown(true);

module.exports = userUpdateSchema;
