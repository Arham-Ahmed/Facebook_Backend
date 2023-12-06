const Joi = require("joi");
// const { response } = require("../../utils/response");

// const userUpdateValidator = (req, res, next) => {
//   try {
//     const schema = Joi.object()
//       .keys({
//         email: Joi.string()
//           .email()
//           .trim(true)
//           .regex(/^[^\s]+$/),
//         password: Joi.string()
//           .trim(true)
//           .min(3)
//           .max(20)
//           .regex(/^[^\s]+$/),
//         phoneNumber: Joi.string()
//           .length(10)
//           .pattern(/[6-9]{1}[0-9]{9}/)
//           .optional(),
//       })
//       .unknown(true);
//     const { error } = schema.validate(req?.body, { abortEarly: false });
//     if (error)
//       return response({
//         res: res,
//         statusCode: 400,
//         sucessBoolean: false,
//         message: "Error",
//         payload: error?.details,
//       });
//   } catch (e) {
//     return response({
//       res: res,
//       statusCode: 500,
//       sucessBoolean: false,
//       message: "Error",
//       payload: e.message,
//     });
//   }
//   next();
// };

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

module.exports = { userUpdateSchema };
