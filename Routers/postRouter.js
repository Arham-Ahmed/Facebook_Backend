const express = require("express");
const {
  createPost,
  getallPost,
  removePost,
  getallUserPost,
} = require("../Controllers/postController");

const {
  isauthenticated,
  upload,
  createPostSchema,
  validator,
} = require("../Middlewares/index");
const {
  Like,
  CreateComment,
  DeleteComment,
} = require("../Controllers/interaction");

const postRouter = express.Router();

postRouter.use(isauthenticated);
postRouter
  .get("/", getallPost)
  .get("/user-post", getallUserPost)
  .post(
    "/create-post",
    [upload([{ name: "imageUrl", maxcount: 6 }]), validator(createPostSchema)],
    createPost
  )
  .post("/like/:id", Like)
  .post("/comment", CreateComment)
  .delete("/delete-post/:id", removePost)
  .delete("/delete-comment/:id", DeleteComment);

module.exports = postRouter;
