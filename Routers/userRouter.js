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
const { isauthenticated, isLogin } = require("../Middlewares/auth");
const userRouter = express.Router();

userRouter
  .get("/", isauthenticated, getallUsers)
  .get("/", isauthenticated, userCall)
  .post("/register", createUser)
  .post("/login", loginUser)
  .get("/logout", isauthenticated, LogoutUser)
  .delete("/delete", isauthenticated, removeUser)
  .put("/update-user", isauthenticated, updateUser);

module.exports = { userRouter };
