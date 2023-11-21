const Joi = require("joi");

const joiUserValidator = (User) => {
  let schema = Joi.object({
    name: Joi.string()
      .alphanum()
      .min(6)
      .max(20)
      .trim(true)
      .regex(/^[^\s]+$/)
      .required(),
    email: Joi.string()
      .email()
      .trim(true)
      .regex(/^[^\s]+$/)
      .required(),
    password: Joi.string()
      .trim(true)
      .min(6)
      .max(20)
      .regex(/^[^\s]+$/)
      .required(),
    phoneNumber: Joi.string()
      .length(10)
      .pattern(/[6-9]{1}[0-9]{9}/)
      .required(),
  });
  return schema.validate(User, schema, { abortEarly: false });
};

module.exports = { joiUserValidator };
