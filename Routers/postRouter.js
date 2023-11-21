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
// const { isLogin } = require("../Middlewares/auth");
const postRouter = express.Router();
postRouter.use(multi);
postRouter.use(isauthenticated);
postRouter
  .get("/", getallPost)
  .get("/user-post", getallUserPost)
  .post("/create-post", createPost)
  .post("/like/:id", Like)
  .post("/comment", CreateComment)
  .delete("/delete-post/:id", removePost)
  .delete("/delete-comment/:id", DeleteComment);

// .post("/search/:id", searchPost)
// .put("/update-post", updatePost);

module.exports = { postRouter };
