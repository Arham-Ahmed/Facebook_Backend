const express = require("express");
const {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  searchUser,
  loginUser,
} = require("../Controllers/userController");
const userRouter = express.Router();

userRouter
  .get("/", getallUsers)
  .get("/search", searchUser)
  .post("/register", createUser)
  .post("/login", loginUser)
  .delete("/remove-user", removeUser)
  .put("/update-user", updateUser);

module.exports = { userRouter };
