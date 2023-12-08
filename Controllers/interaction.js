const response = require("../utils/response");
const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const UserModel = require("../Models/User");
const { isValidObjectId } = require("mongoose");

const Like = async (req, res) => {
  try {
    const postId = req?.params?.id;

    if (!postId || !isValidObjectId(postId))
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : Invalid post id",
      });
    const currPost = await Post?.findById(postId);
    if (!currPost)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error :( no post Found",
      });

    if (currPost?.likes?.includes(req.user?.id)) {
      currPost.likes = currPost?.likes?.filter(
        (like) => like.toString() !== req.user.id.toString()
      );
      await currPost?.save();
      return response({
        res: res,
        statusCode: 200,
        sucessBoolean: true,
        message: "UnLiked :(",
        payload: currPost,
      });
    } else {
      currPost?.likes?.push(req.user?._id);
      await currPost?.save();
      const likerId = await UserModel.findById(req.user._id).select([
        "profile_photo",
        "name",
      ]);
      if (!likerId)
        return response({
          res: res,
          statusCode: 400,
          sucessBoolean: false,
          message: "Error :( Id not found",
        });

      return response({
        res: res,
        statusCode: 200,
        sucessBoolean: true,
        message: "Liked :)",
        payload: likerId,
      });
    }
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
const CreateComment = async (req, res) => {
  try {
    const { comment, id } = req?.body;
    if (!id || !isValidObjectId(id))
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : comment id not found",
      });

    const currPost = await Post.findById(id);

    if (!currPost)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : No UserFound",
      });
    const newComment = new Comment({
      owner: req?.user?._id,
      postid: currPost?._id,
      comment: comment,
    });
    if (!newComment)
      response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : Some error occur while creating comment",
      });

    currPost.comments.push(newComment._id);

    await newComment.save();
    await currPost.save();

    /// Commenter Means Who Comment
    const Commenter = await UserModel.findById(newComment?.owner).select([
      "profile_photo",
      "name",
    ]);
    if (!Commenter)
      return response({
        res: res,
        statusCode: 404,
        message: "Some error occured ",
      });
    return response({
      res: res,
      statusCode: 200,
      message: "Comment add sucessfully",
      payload: { newComment, Commenter },
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
const DeleteComment = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id || !isValidObjectId(id))
      return response({
        res: res,
        statusCode: 422,
        sucessBoolean: false,
        message: "inavalid comment id",
      });

    const comment = await Comment?.findById(id);
    if (!comment)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No comments found",
      });
    await Comment?.findByIdAndDelete(id);
    const postID = comment.postid._id;
    const post = await Post.findById(postID);
    if (!post)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No post found",
      });
    post?.comments?.filter(
      (comment) => comment._id.toString() != id.toString()
    );
    await post?.save();

    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: false,
      message: "Comment Deleted Sucessfully",
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};

module.exports = { Like, CreateComment, DeleteComment };
