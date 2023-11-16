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
const { upload } = require("../utils/upload");
const { multi } = require("../utils/multiupload");
const userRouter = express.Router();

userRouter
  .get("/", multi, isauthenticated, getallUsers)
  .get("/user", multi, isauthenticated, userCall)
  .post(
    "/register",
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
  .put("/update-user", multi, isauthenticated, updateUser);

module.exports = { userRouter };
