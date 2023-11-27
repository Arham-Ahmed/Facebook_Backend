const express = require("express");
const {
  createPost,
  getallPost,
  removePost,
  getallUserPost,
  // updatePost,
  // searchPost,
} = require("../Controllers/postController");
const { multi } = require("../Middlewares/multermiddleware/multiupload");
const { isauthenticated } = require("../Middlewares/auth");
const {
  Like,
  CreateComment,
  DeleteComment,
} = require("../Controllers/interaction");
const { upload } = require("../Middlewares/multermiddleware/upload");
// const { isLogin } = require("../Middlewares/auth");
const postRouter = express.Router();
// postRouter.use(multi);
postRouter.use(isauthenticated);
postRouter
  .get("/", getallPost)
  .get("/user-post", getallUserPost)
  .post(
    "/create-post",
    upload.fields([
      {
        name: "imageUrl",
        maxCount: 5,
      },
    ]),
    createPost
  )
  .post("/like/:id", Like)
  .post("/comment", multi, CreateComment)
  .delete("/delete-post/:id", multi, removePost)
  .delete("/delete-comment/:id", DeleteComment);

// .post("/search/:id", searchPost)
// .put("/update-post", updatePost);

module.exports = { postRouter };
