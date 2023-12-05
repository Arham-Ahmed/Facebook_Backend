const { response } = require("express");
const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const UserModel = require("../Models/User");

const Like = async (req, res) => {
  try {
    const postId = req?.params?.id;
    if (!postId)
      return res.status(400).json({
        sucuess: false,
        message: "No Post Id Found",
      });
    const currPost = await Post?.findById({ _id: postId });
    if (!currPost)
      return res.status(400).json({
        sucuess: false,
        message: "No UserFound",
      });
    if (currPost?.likes?.includes(req.user?._id)) {
      const postIndex = currPost?.likes?.indexOf(req.user?._id);
      currPost?.likes?.splice(postIndex, 1);
      await currPost?.save();
      return res.status(200).json({
        sucuess: true,
        message: "UnLiked",
        likerId: req.user?._id,
      });
    } else {
      currPost?.likes?.push(req.user?._id);
      await currPost?.save();
      return res.status(200).json({
        sucuess: true,
        message: "Liked",
        likerId: await UserModel.findById({ _id: req.user.id }).select([
          "-role",
          "-token",
          "-posts",
          "-todos",
          "-followers",
          "-following",
          "-cover_photo",
          "-email",
          "-isDelete",
        ]),
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

    const currPost = await Post?.findById({ _id: id });

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
    const Commenter = await UserModel.findById({
      _id: newComment?.owner,
    }).select([
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
      payload: { newComment, user },
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
      return res.status(404).json({
        sucess: false,
        message: "Cannot Delete Some Issue with your request",
      });
    const comment = await Comment?.findById({ _id: id });
    if (!comment)
      return res
        .status(404)
        .json({ sucess: false, message: "Comments are Empty" });
    const postID = comment.postid.toHexString();
    const post = await Post?.findById({ _id: postID });
    const indexofComment = post?.comments?.indexOf(id);
    post?.comments?.splice(indexofComment, 1);
    await post?.save();
    await Comment?.findByIdAndDelete({ _id: id });
    // await Comment?.save();
    res.status(200).json({
      sucess: true,
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
