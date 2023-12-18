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
  .get("/userPost", getallUserPost)
  .post(
    "/createPost",
    [upload([{ name: "postImage", maxcount: 6 }]), validator(createPostSchema)],
    createPost
  )
  .post("/like/:id", Like)
  .post("/comment", CreateComment)
  .delete("/deletePost/:id", removePost)
  .delete("/deleteComment/:id", DeleteComment);

module.exports = postRouter;
