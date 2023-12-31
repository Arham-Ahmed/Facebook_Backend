const Joi = require("joi");
const userUpdateSchema = Joi.object().keys({
  name: Joi.string()
    .min(3)
    .max(20)
    // .trim(true)
    .regex(/^[^\{}]+$/)
    .optional(),
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
  bio: Joi.string().min(0).max(150).optional(),
  liveIn: Joi.string().min(0).max(50).optional(),
  socialLinks: Joi.string().uri().optional(),
  profile_photo: Joi.string().optional(),
  cover_photo: Joi.string().optional(),
});
// .unknown(true);

module.exports = userUpdateSchema;
