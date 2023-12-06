const express = require("express");
const {
  userCall,
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  LogoutUser,
  loginUser,
} = require("../Controllers/userController");
const { isauthenticated } = require("../Middlewares/auth");
const { upload } = require("../Middlewares/multermiddleware/upload");
// const { multi } = require("../Middlewares/multermiddleware/multiupload"); /// no more use
const {
  validator,
} = require("../Middlewares/validatorMiddleware/ValidatorFunc/Validator");
const {
  userLoginSchema,
} = require("../Middlewares/validatorMiddleware/ValidatorSchemas/userLoginSchema");
const {
  userUpdateSchema,
} = require("../Middlewares/validatorMiddleware/ValidatorSchemas/userUpdateValidator");
const {
  userSignupSchema,
} = require("../Middlewares/validatorMiddleware/ValidatorSchemas/userSignupSchema");

const userRouter = express.Router();

userRouter
  .get("/", isauthenticated, getallUsers)
  .get("/user", isauthenticated, userCall)
  .post(
    "/register",
    [upload("profile_photo", 1), validator(userSignupSchema)],
    createUser
  )
  .post("/login", validator(userLoginSchema), loginUser)
  .get("/logout", isauthenticated, LogoutUser)
  .delete("/delete", isauthenticated, removeUser)
  .put(
    "/update-user",
    [isauthenticated, upload("profile_photo", 1), validator(userUpdateSchema)],
    updateUser
  );

module.exports = { userRouter };
