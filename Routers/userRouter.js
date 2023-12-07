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

const {
  validator,
  userLoginSchema,
  userUpdateSchema,
  userSignupSchema,
  isauthenticated,
  upload,
} = require("../Middlewares/index");

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

module.exports = userRouter;
