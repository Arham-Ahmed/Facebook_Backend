const {
  firebaseUploder,
  firebaseImageDelete,
} = require("../Middlewares/multermiddleware/upload");
const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const User = require("../Models/User");
const { response } = require("../utils/response");
const { imageCompressor } = require("../utils/imageCompressor/imageCompressor");

////////////////////////////////// For Creating Post /////////////////////////////
const createPost = async (req, res) => {
  try {
    if (!req)
      return response(
        res,
        500,
        false,
        "Internal server error cannot get req file :~ userController.js on line 24 "
      );
    const newPost = {
      caption: req?.body?.caption,
      owner: req?.user?._id,
    };
    const post = new Post(newPost);
    if (!post) return res.status(500).json({ message: "Some Error Occur" });
    const user = await User?.findById(req?.user?._id);
    user?.posts?.push(post?._id);
    await user?.save();

    if (!req?.files) {
      await post?.save();
    }
    if (req?.files?.imageUrl?.length > 0) {
      const imageArray = req?.files?.imageUrl?.map(async (img, index) => {
        const Filemimetype = img.mimetype;
        if (!Filemimetype.includes("image/"))
          return response(
            res,
            500,
            false,
            "Invalid file format -- Please upload an image"
          );

        const CompressedImg = await imageCompressor(img).catch((err) =>
          response(
            res,
            500,
            `error on postController line no 45 ${err.message}`
          )
        );
        const postdownloadUrl = await firebaseUploder(
          res,
          req,
          index,
          "/post_images",
          CompressedImg
        ).catch((err) =>
          response(
            res,
            500,
            `error on postController line no 52 ${err.message}`
          )
        );
        return postdownloadUrl;
      });
      const allPromis = await Promise.all(imageArray);
      post.imageUrl.push(...allPromis);
      await post.save();
    }

    return res.status(201).json({
      resStatus: res.status,
      message: "Post Created SucessFully ",
      postimageUrl: post.imageUrl,
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
    const posts = await Post?.find({ owner: req.user?._id })
      ?.sort("-1")
      .populate(["owner", "likes", "comments"]);
    if (posts?.length === 0) return res.json({ message: "No Posts Available" });
    return res.status(200).json({
      sucess: true,
      resStatus: res.status,
      Posts: posts,
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

////////////////////////////////////// For Removing Posts ///////////////////////////////
const removePost = async (req, res) => {
  try {
    const { id } = req?.params;
    const post = await Post?.findOne({ _id: id });
    if (!post)
      return res.status(404).json({ sucess: false, message: "Post are Empty" });
    if (post.owner.toHexString() !== req?.user?.id) {
      return response(res, 400, false, "Your are not login with this account");
    }
    const refr = post?.imageUrl?.map(async (image, index) => {
      const deleteImagPath = image
        .split("/")
        [image.split("/").length - 1].replaceAll("%", "")
        .split("?")[0]
        .replace("2F", "/");

      await firebaseImageDelete(deleteImagPath, res).catch((err) =>
        response(res, 500, `error on postController line no 153 ${err.message}`)
      );

      // await firebaseImageDelete(deleteImagPath);
    });
    const Deletepost = await Post?.findByIdAndDelete({ _id: id });

    res.status(200).json({
      sucess: true,
      message: "Post Deleted Sucessfully",
    });
    // post.comments;
    // if (post?.comments?.length > 0) {
    //   for (let index = 0; index < post?.comments?.length; index++) {
    //     Comment?.findByIdAndDelete({ _id });
    //   }
    // }

    const user = await User?.findById({ _id: req.user.id });
    const indexofPost = user?.posts?.indexOf(post._id);
    user?.posts?.splice(indexofPost, 1);
    await user?.save();
  } catch (error) {
    return response(
      res,
      500,
      `Erro on postController line number 131 ${error.message}`
    );
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
