const { response } = require("../utils/response");
const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const UserModel = require("../Models/User");

const Like = async (req, res) => {
  try {
    const postId = req?.params?.id;
    if (!postId)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error :( no post id found",
      });
    const currPost = await Post?.findById(postId);
    if (!currPost)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error :( no userFound",
      });
    if (currPost?.likes?.includes(req.user?._id)) {
      const postIndex = currPost?.likes?.indexOf(req.user?._id);
      currPost?.likes?.splice(postIndex, 1);
      await currPost?.save();

      return response({
        res: res,
        statusCode: 200,
        sucessBoolean: true,
        message: "UnLiked :(",
      });
    } else {
      currPost?.likes?.push(req.user?._id);
      await currPost?.save();
      const likerId = await UserModel?.findById(req.user.id).select([
        "-role",
        "-token",
        "-posts",
        "-todos",
        "-followers",
        "-following",
        "-cover_photo",
        "-email",
        "-isDelete",
      ]);
      if (!likerId)
        return response({
          res: res,
          statusCode: 400,
          sucessBoolean: false,
          message: "Error :( no likerId id found",
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
    if (!id)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : Please send comment id",
      });

    const currPost = await Post?.findById(id);

    if (!currPost)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : No UserFound",
      });
    const newComment = new Comment({
      owner: req.user?._id,
      postid: currPost?._id,
      comment: comment,
    });
    if (!newComment)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Error : Some error occur while creating comment",
      });

    currPost.comments.push(newComment._id);

    await currPost.save();
    await newComment.save();

    /// Commenter Means Who Comment
    const Commenter = await UserModel.findById(newComment?.owner).select([
      "-role",
      "-token",
      "-posts",
      "-todos",
      "-followers",
      "-following",
      "-cover_photo",
      "-email",
      "-isDelete",
    ]);
    if (!Commenter)
      return response({
        res: res,
        statusCode: 404,
        message: "Some error occured on interaction.js line 76",
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
    if (!id)
      return response({
        res: res,
        statusCode: 422,
        sucessBoolean: false,
        message: "Cannot Delete Some Issue with your request",
      });

    const comment = await Comment?.findById(id);
    if (!comment)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "Comments are Empty",
      });
    const postID = comment.postid.toHexString();
    const post = await Post?.findById(postID);
    const indexofComment = post?.comments?.indexOf(id);
    post?.comments?.splice(indexofComment, 1);
    await post?.save();
    await Comment?.findByIdAndDelete(id);

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
// const Authreply = async (req, res) => {
//   try {
//     const replyComment = req?.params?.id;
//     const userwhoReply = req.user?._id;

//     if (!replyComment || !userwhoReply)
//       return res.status(400).json({
//         sucuess: false,
//         message: "Error on reply to comment",
//       });

//     console.log(replyComment, userwhoReply);

//     res.status(200).json({
//       sucess: true,
//       message: "Reply add sucessfully",
//     });
//   } catch (error) {}
// };
////////////////////////////////// Temparay Stop/////////////////////////////////

module.exports = { Like, CreateComment, DeleteComment };
