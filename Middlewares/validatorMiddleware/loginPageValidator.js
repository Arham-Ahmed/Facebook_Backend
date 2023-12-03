const joi = require("joi");

const loginPagevalidator = () => {
  try {
    const schema = joi.object().keys({
      id: joi.string().hex().length(24),
      email: joi
        .string()
        .email()
        .trim(true)
        .regex(/^[^\s]+$/)
        .required(),
      password: joi
        .string()
        .trim(true)
        .min(3)
        .max(20)
        .regex(/^[^\s]+$/)
        .required(),
    });
    const { error } = schema.validate(req?.body);
    if (error) return response(res, 400, false, error?.details);
  } catch (error) {}
};
