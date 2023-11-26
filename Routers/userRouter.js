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
const {
  imageCompresser,
} = require("../Middlewares/imageCompresser/imageCompresser");
const userRouter = express.Router();

userRouter
  .get("/", multi, isauthenticated, getallUsers)
  .get("/user", multi, isauthenticated, userCall)
  .post(
    "/register",
    [
      // upload.fields([
      //   {
      //     name: "profile_photo",
      //     maxCount: 5,
      //   },
      // ]),
      upload.single("profile_photo"),
      imageCompresser,

      validateMiddleware,
    ],
    createUser
  )
  .post("/login", [multi /*validateMiddleware*/], loginUser)
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
