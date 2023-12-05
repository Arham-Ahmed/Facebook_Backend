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
// const { multi } = require("../Middlewares/multermiddleware/multiupload"); /// no more use
const {
  validateMiddleware,
} = require("../Middlewares/validatorMiddleware/validateMiddleware");
const {
  loginPagevalidator,
} = require("../Middlewares/validatorMiddleware/loginPagevalidator");
const { response } = require("../utils/response");
const userRouter = express.Router();

userRouter
  .get("/", isauthenticated, getallUsers)
  .get("/user", isauthenticated, userCall)
  .post(
    "/register",
    [
      (req, res, next) => {
        upload().fields([
          {
            name: "profile_photo",
            maxCount: 1,
          },
        ])(req, res, (err) => {
          if (err) {
            return response(res, 500, false, "Multer Error", err);
          } else {
            next();
          }
        });
      },
      validateMiddleware,
    ],
    createUser
  )
  .post("/login", loginPagevalidator, loginUser)
  .get("/logout", isauthenticated, LogoutUser)
  .delete("/delete", isauthenticated, removeUser)
  .put(
    "/update-user",
    isauthenticated,
    upload().fields([
      {
        name: "profile_photo",
        maxCount: 1,
      },
    ]),
    updateUser
  );

module.exports = { userRouter };
