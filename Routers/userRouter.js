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
const userRouter = express.Router();

userRouter
  .get("/", isauthenticated, hasRole, getallUsers)
  .get("/user", isauthenticated, userCall)
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
  .post("/login", loginUser)
  .get("/logout", isauthenticated, LogoutUser)
  .delete("/delete", isauthenticated, removeUser)
  .put("/update-user", isauthenticated, updateUser);

module.exports = { userRouter };
