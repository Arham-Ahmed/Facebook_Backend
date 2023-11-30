const {
  firebaseUploder,
  firebaseImageDelete,
} = require("../helper/firebaseUploader/firebaseUploader");
const Comment = require("../Models/Comment");
const Post = require("../Models/Post");
const User = require("../Models/User");
const { response } = require("../utils/response");

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

    // if (!req?.files) {
    // }
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

        const image = req?.files?.imageUrl[index];

        const postdownloadUrl = await firebaseUploder("/post_images", image);
        return postdownloadUrl;
      });
      const allPromis = await Promise.all(imageArray);
      post.imageUrl.push(...allPromis);
      await post.save();
    }
    await post?.save();

    return res.status(201).json({
      resStatus: res.status,
      message: "Post Created SucessFully ",
      postimageUrl: post.imageUrl,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
////////////////////////////////// For getall Posts ////////////////////////////////
const getallPost = async (req, res) => {
  let posts;
  try {
    const { id, name, email } = req?.query;

    if (id) {
      posts = await Post?.find({ _id: id })
        ?.sort()
        .populate([
          {
            path: "owner",
            select: ["name", "profile_photo"],
          },
          {
            path: "comments",
            populate: {
              path: "owner",
              model: "User",
              select: ["name", "profile_photo", "createdAt"],
            },
          },
          {
            path: "likes",
            select: ["name", "profile_photo", "createdAt"],
          },
        ]);
    }
    if (name) {
      posts = await Post?.find({ name: { $regex: name, $options: "i" } })
        ?.sort()
        .populate([
          {
            path: "owner",
            select: ["name", "profile_photo"],
          },
          {
            path: "comments",
            populate: {
              path: "owner",
              model: "User",
              select: ["name", "profile_photo", "createdAt"],
            },
          },
          {
            path: "likes",
            select: ["name", "profile_photo", "createdAt"],
          },
        ]);
      console.log(
        "🚀 ~ file: postController.js:93 ~ getallPost ~ posts:",
        posts
      );
    }
    if (email) {
      posts = await Post?.find({ email: { $regex: email, $option: i } })
        ?.sort()
        .populate([
          {
            path: "owner",
            select: ["name", "profile_photo"],
          },
          {
            path: "comments",
            populate: {
              path: "owner",
              model: "User",
              select: ["name", "profile_photo", "createdAt"],
            },
          },
          {
            path: "likes",
            select: ["name", "profile_photo", "createdAt"],
          },
        ]);
    }
    posts = await Post?.find({})
      ?.sort()
      .populate([
        {
          path: "owner",
          select: ["name", "profile_photo"],
        },
        {
          path: "comments",
          populate: {
            path: "owner",
            model: "User",
            select: ["name", "profile_photo", "createdAt"],
          },
        },
        {
          path: "likes",
          select: ["name", "profile_photo", "createdAt"],
        },
      ]);
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
///////////////////////////// For getallPosts of User ////////////////////////////////

const getallUserPost = async (req, res) => {
  try {
    const posts = await Post?.find({ owner: req.user?._id })
      ?.sort("-1")
      .populate([
        {
          path: "owner",
          select: ["name", "profile_photo"],
        },
        {
          path: "comments",
          populate: {
            path: "owner",
            model: "User",
            select: ["name", "profile_photo", "createdAt"],
          },
        },
        {
          path: "likes",
          select: ["name", "profile_photo", "createdAt"],
        },
      ]);
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

      await firebaseImageDelete(deleteImagPath, res);
    });
    const Deletepost = await Post?.findByIdAndDelete({ _id: id });

    res.status(200).json({
      sucess: true,
      message: "Post Deleted Sucessfully",
    });
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
