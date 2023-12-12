const response = require("../utils/response");
const comment = require("../Models/comment");
const Post = require("../Models/Post");
const UserModel = require("../Models/user");
const { isValidObjectId } = require("mongoose");

const Like = async (req, res) => {
  try {
    const postId = req?.params?.id;

    if (!postId || !isValidObjectId(postId))
      return response({
        res: res,
        statusCode: 400,
        successBoolean: false,
        message: "Error : Invalid post id",
      });
    const currPost = await Post?.findById(postId);
    if (!currPost)
      return response({
        res: res,
        statusCode: 400,
        successBoolean: false,
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
        successBoolean: true,
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
          successBoolean: false,
          message: "Error :( Id not found",
        });

      return response({
        res: res,
        statusCode: 200,
        successBoolean: true,
        message: "Liked :)",
        payload: likerId,
      });
    }
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      successBoolean: false,
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
        successBoolean: false,
        message: "Error : comment id not found",
      });

    const currPost = await Post.findById(id);

    if (!currPost)
      return response({
        res: res,
        statusCode: 400,
        successBoolean: false,
        message: "Error : No UserFound",
      });
    const newComment = new comment({
      owner: req?.user?._id,
      postid: currPost?._id,
      comment: comment,
    });
    if (!newComment)
      response({
        res: res,
        statusCode: 400,
        successBoolean: false,
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
      successBoolean: false,
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
        successBoolean: false,
        message: "inavalid comment id",
      });

    const comment = await comment?.findById(id);
    if (!comment)
      return response({
        res: res,
        statusCode: 404,
        successBoolean: false,
        message: "No comments found",
      });
    await comment?.findByIdAndDelete(id);
    const postID = comment.postid._id;
    const post = await Post.findById(postID);
    if (!post)
      return response({
        res: res,
        statusCode: 404,
        successBoolean: false,
        message: "No post found",
      });
    post?.comments?.filter(
      (comment) => comment._id.toString() != id.toString()
    );
    await post?.save();

    return response({
      res: res,
      statusCode: 200,
      successBoolean: false,
      message: "Comment Deleted Sucessfully",
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      successBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};

module.exports = { Like, CreateComment, DeleteComment };
