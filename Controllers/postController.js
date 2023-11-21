const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const User = require("../Models/User");

// For Creating Post
const createPost = async (req, res) => {
  try {
    const newPost = {
      caption: req?.body?.caption,
      imageUrl: `http://localhost:5000/${req?.files?.imageUrl[0]?.filename}`,
      owner: req?.user?._id,
    };
    console.log(req.files);
    const post = new Post(newPost);
    if (!post) return res.status(500).json({ message: "Some Error Occur" });
    await post?.save();
    const user = await User?.findById(req?.user?._id);
    user?.posts?.push(post?._id);
    await user?.save();
    res.status(201).json({
      resStatus: res.status,
      message: "Post Created SucessFully ",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
// For getall Posts
const getallPost = async (req, res) => {
  const { id, name, email } = req?.body;
  try {
    const posts = await Post?.find({})
      ?.sort()
      .populate(["owner", "likes", "comments"]);
    if (id) {
      const posts = await Post?.find({})
        ?.sort()
        .populate(["owner", "likes", "comments"]);
    }
    if (name) {
      const posts = await Post?.find({})
        ?.sort()
        .populate(["owner", "likes", "comments"]);
    }
    if (email) {
      const posts = await Post?.find({})
        ?.sort()
        .populate(["owner", "likes", "comments"]);
    }
    if (posts?.length === 0) return res.json({ message: "No Posts Available" });
    res.status(200).json({
      sucess: true,
      resStatus: res.status,
      Posts: posts,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};
const getallUserPost = async (req, res) => {
  try {
    const posts = await Post?.find({ owner: req.user._id })
      ?.sort()
      .populate(["owner", "likes", "comments"]);
    if (posts?.length === 0) return res.json({ message: "No Posts Available" });
    res.status(200).json({
      sucess: true,
      resStatus: res.status,
      Posts: posts,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

////////////////////////////////////// For Removing Posts ///////////////////////////////
const removePost = async (req, res) => {
  const { id } = req?.params;
  try {
    const post = await Post?.findByIdAndDelete({ _id: id });

    if (!post)
      return res.status(404).json({ sucess: false, message: "Post are Empty" });
    res.status(200).json({
      sucess: true,
      message: "Post Deleted Sucessfully",
    });
    post.comments;
    if (post?.comments?.length > 0) {
      for (let index = 0; index < post?.comments?.length; index++) {
        Comment?.findByIdAndDelete({ _id });
      }
    }
    const user = await User?.findById({ _id: req.user.id });
    const indexofPost = user?.posts?.indexOf(post._id);
    user?.posts?.splice(indexofPost, 1);
    await user?.save();
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};
module.exports = {
  createPost,
  getallPost,
  removePost,
  getallUserPost,
  //   updatePost,
  //   searchPost,
};
