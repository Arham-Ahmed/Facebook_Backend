const Post = require("../Models/Post");
const User = require("../Models/User");

// For Creating Users
const createPost = async (req, res) => {
  const newPost = {
    caption: req.body.caption,
    image: {
      img_url: req.body.img_url,
    },
    owner: req.user._id,
  };
  try {
    const post = new Post(newPost);
    if (!post) return res.status(500).json({ message: "Some Error Occur" });
    await post.save();
    const user = await User.findById(req.user._id);
    user.posts.push(post._id);
    await user.save();
    res.status(201).json({
      resStatus: res.status,
      message: "Post Created SucessFully ",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getallPost = async (req, res) => {
  try {
    const posts = await Post.find({}).sort();
    if (posts.length === 0) return res.json({ message: "No Posts Available" });
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

const removePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByIdAndDelete({ _id: id });
    if (!post)
      return res.status(404).json({ sucess: false, message: "Post are Empty" });
    res.status(200).json({
      sucess: true,
      message: "Post Deleted Sucessfully",
    });
    const user = await User.findById({ _id: req.user.id });
    const indexofPost = user.posts.indexOf(post._id);
    user.posts.splice(indexofPost, 1);
    await user.save();
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
  //   updatePost,
  //   searchPost,
};
