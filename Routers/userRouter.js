const express = require("express");
const {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  searchUser,
} = require("../Controllers/userController");
const userRouter = express.Router();

userRouter
  .get("/", getallUsers)
  .get("/search", searchUser)
  .post("/create-user", createUser)
  .delete("/remove-user", removeUser)
  .put("/update-user", updateUser);

module.exports = { userRouter };
