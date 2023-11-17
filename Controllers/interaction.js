const Comment = require("../Models/Comment");
const Post = require("../Models/Post");

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
        currPost,
      });
    } else {
      currPost?.likes?.push(req.user?._id);
      await currPost?.save();
      return res.status(200).json({
        sucuess: true,
        message: "Liked",
        currPost,
      });
    }
  } catch (error) {
    res.status(500).json({
      sucuess: false,
      message: error.message,
    });
  }
};
const CreateComment = async (req, res) => {
  try {
    const { comment, id } = req?.body;
    if (!id)
      return res.status(400).json({
        sucuess: false,
        message: "No Post Id Found",
      });
    const currPost = await Post?.findById({ _id: id });

    if (!currPost)
      return res.status(400).json({
        sucuess: false,
        message: "No UserFound",
      });
    const newComment = new Comment({
      owner: req.user?._id,
      postid: currPost?._id,
      comment: comment,
    });
    if (!newComment)
      return res.status(500).json({
        sucuess: false,
        message: "Some error occur while creating comment",
      });
    currPost.comments.push(newComment._id);

    await currPost.save();
    await newComment.save();

    res.status(200).json({
      sucuess: true,
      message: "Comment Add",
    });
  } catch (error) {
    res.status(500).json({
      sucuess: false,
      message: error.message,
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
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

module.exports = { Like, CreateComment, DeleteComment };
