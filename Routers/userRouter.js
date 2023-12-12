const express = require("express");
const {
  userCall,
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  logoutUser,
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
    [
      upload([
        { name: "profile_photo", maxcount: 1 },
        { name: "cover_photo", maxcount: 1 },
      ]),
      validator(userSignupSchema),
    ],
    createUser
  )
  .post("/login", validator(userLoginSchema), loginUser)
  .post("/logout", isauthenticated, logoutUser)
  .delete("/delete", isauthenticated, removeUser)
  .put(
    "/updateUser",
    [
      isauthenticated,
      upload([
        { name: "profile_photo", maxcount: 1 },
        { name: "cover_photo", maxcount: 1 },
      ]),
      validator(userUpdateSchema),
    ],
    updateUser
  );

module.exports = userRouter;
