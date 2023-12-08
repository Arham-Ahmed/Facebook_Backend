const { isauthenticated } = require("./authMiddleware/auth");
const errorHandler = require("./errorMiddleware/errorMiddleware");
const upload = require("./multerMiddlewares/upload");
const validator = require("./validatorMiddleware/Validator");
const userLoginSchema = require("./validatorMiddleware/ValidatorSchemas/userLoginSchema");
const userSignupSchema = require("./validatorMiddleware/ValidatorSchemas/userSignupSchema");
const userUpdateSchema = require("./validatorMiddleware/ValidatorSchemas/userUpdateValidator");
const idValidator = require("./validatorMiddleware/idValidator");

module.exports = {
  errorHandler,
  upload,
  validator,
  userLoginSchema,
  userSignupSchema,
  userUpdateSchema,
  isauthenticated,
  idValidator,
};
