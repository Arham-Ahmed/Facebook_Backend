const express = require("express");
const {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  LogoutUser,
  loginUser,
} = require("../Controllers/userController");
const { isLogin } = require("../Middlewares/auth");
const userRouter = express.Router();

userRouter
  .get("/", getallUsers)
  .post("/register", createUser)
  .post("/login", loginUser)
  .post("/logout", isLogin, LogoutUser)
  .delete("/delete", isLogin, removeUser)
  .put("/update-user", updateUser);

module.exports = { userRouter };
