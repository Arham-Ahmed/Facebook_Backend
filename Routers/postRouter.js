const express = require("express");
const {
  createPost,
  getallPost,
  removePost,
  // updatePost,
  // searchPost,
} = require("../Controllers/postController");
const { multi } = require("../Middlewares/multermiddleware/multiupload");
// const { isLogin } = require("../Middlewares/auth");
const postRouter = express.Router();
postRouter.use(multi);
postRouter
  .get("/", getallPost)
  .post("/create-post", createPost)
  .delete("/delete-post/:id", removePost);
// .post("/search/:id", searchPost)
// .put("/update-post", updatePost);

module.exports = { postRouter };
