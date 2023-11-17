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

module.exports = { Like };
