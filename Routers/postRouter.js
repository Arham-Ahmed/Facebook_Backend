const express = require("express");
const {
  createPost,
  getallPost,
  removePost,
  getallUserPost,
  // updatePost,
  // searchPost,
} = require("../Controllers/postController");
// const { multi } = require("../Middlewares/multermiddleware/multiupload"); //no more use
const { isauthenticated } = require("../Middlewares/auth");
const {
  Like,
  CreateComment,
  DeleteComment,
} = require("../Controllers/interaction");
const { upload } = require("../Middlewares/multermiddleware/upload");
const { response } = require("../utils/response");
// const { isLogin } = require("../Middlewares/auth");
const postRouter = express.Router();
// postRouter.use(multi);
postRouter.use(isauthenticated);
postRouter
  .get("/", getallPost)
  .get("/user-post", getallUserPost)
  .post(
    "/create-post",
    [
      // (req, res, next) => {
      //   upload().fields([
      //     {
      //       name: "imageUrl",
      //       maxCount: 6,
      //     },
      //   ])(req, res, (err) => {
      //     if (err) {
      //       return response({
      //         res: res,
      //         statusCode: 500,
      //         sucessBoolean: false,
      //         message: "Multer Error",
      //         payload: err,
      //       });
      //     } else {
      //       next();
      //     }
      //   });
      // },
      upload("imageUrl", 1),
    ],
    createPost
  )
  .post("/like/:id", Like)
  .post("/comment", CreateComment)
  .delete("/delete-post/:id", removePost)
  .delete("/delete-comment/:id", DeleteComment);

// .post("/search/:id", searchPost)
// .put("/update-post", updatePost);

module.exports = { postRouter };
