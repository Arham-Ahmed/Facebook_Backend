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
const { isauthenticated, hasRole } = require("../Middlewares/auth");
const { upload } = require("../Middlewares/multermiddleware/upload");
// const { multi } = require("../Middlewares/multermiddleware/multiupload"); /// no more use
const {
  validateMiddleware,
} = require("../Middlewares/validatorMiddleware/validateMiddleware");
const {
  loginPagevalidator,
} = require("../Middlewares/validatorMiddleware/loginPagevalidator");
const { response } = require("../utils/response");
const userRouter = express.Router();

userRouter
  .get("/", isauthenticated, getallUsers)
  .get("/user", isauthenticated, userCall)
  .post(
    "/register",
    [upload("profile_photo", 1), validateMiddleware],
    createUser
  )
  .post("/login", loginPagevalidator, loginUser)
  .get("/logout", isauthenticated, LogoutUser)
  .delete("/delete", isauthenticated, removeUser)
  .put("/update-user", isauthenticated, upload("profile_photo", 1), updateUser);

module.exports = { userRouter };
