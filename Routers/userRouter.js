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
const { multi } = require("../Middlewares/multermiddleware/multiupload");
const {
  validateMiddleware,
} = require("../Middlewares/validatorMiddleware/validateMiddleware");
const { joiUserValidator } = require("../Models/User");
const userRouter = express.Router();

userRouter
  .get("/", multi, isauthenticated, getallUsers)
  .get("/user", multi, isauthenticated, userCall)
  .post(
    "/register",
    [validateMiddleware(joiUserValidator)],
    upload.fields([
      {
        name: "profile_photo",
        maxCount: 5,
      },
    ]),
    createUser
  )
  .post("/login", multi, loginUser)
  .get("/logout", multi, isauthenticated, LogoutUser)
  .delete("/delete", multi, isauthenticated, removeUser)
  .put(
    "/update-user",
    upload.fields([
      {
        name: "profile_photo",
        maxCount: 5,
      },
    ]),
    isauthenticated,
    updateUser
  );

module.exports = { userRouter };
