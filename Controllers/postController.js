const Post = require("../Models/Post");
const User = require("../Models/User");
const {
  firebaseUploder,
} = require("../helper/firebaseHelperFuncs/firebaseUploader");
const {
  firebaseImageDelete,
} = require("../helper/firebaseHelperFuncs/firebaseDeleter");
const imagePathMaker = require("../helper/imageHelperFunc's/imagePathMaker");
// const Comment = require("../Models/Comment");
const { response } = require("../utils/response");

////////////////////////////////// For Creating Post /////////////////////////////
const createPost = async (req, res) => {
  try {
    const newPost = {
      caption: req?.body?.caption,
      owner: req.user?._id,
    };
    const post = new Post(newPost);
    if (!post)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Some error creating post",
      });
    const user = await User?.findById(req.user?._id);
    user?.posts?.push(post?._id);
    await user?.save();

    if (req?.files?.imageUrl?.length > 0) {
      const imageArray = req?.files?.imageUrl?.map(async (img, index) => {
        const Filemimetype = img?.mimetype;
        if (!Filemimetype.includes("image/"))
          return response({
            res: res,
            statusCode: 500,
            sucessBoolean: false,
            message: "Invalid file format -- Please upload an image",
          });

        const image = req?.files?.imageUrl[index];

        const postdownloadUrl = await firebaseUploder("/post_images", image);
        return postdownloadUrl;
      });
      const allPromis = await Promise.all(imageArray);
      post.imageUrl.push(...allPromis);
    }
    await post.save();
    return response({
      res: res,
      statusCode: 201,
      message: "Post created sucessfully",
      payload: post,
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
          select: ["name", "profile_photo", "isDelete"],
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
    if (posts?.length === 0)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No post available",
      });
    const Allposts = posts.filter((post) => post?.owner?.isDelete === null);
    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "All posts",
      Allposts,
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
    if (posts?.length === 0)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No post available",
      });
    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "All posts of User are",
      payload: posts,
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

////////////////////////////////////// For Removing Posts ///////////////////////////////
const removePost = async (req, res) => {
  try {
    const { id } = req?.params;
    const post = await Post?.findOne({ _id: id });
    if (!post)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No Post available",
      });
    if (post?.owner?.toHexString() !== req.user?.id) {
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "Your are not login with this account",
      });
    }
    post?.imageUrl?.map(async (image, index) => {
      const deleteImagPath = imagePathMaker(image);
      await firebaseImageDelete(deleteImagPath);
    });
    const user = await User?.findById({ _id: req.user.id });
    const indexofPost = user?.posts?.indexOf(post._id);
    user?.posts?.splice(indexofPost, 1);
    await user?.save();
    const Deletepost = await Post?.findByIdAndDelete({ _id: id });
    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "Post deleted sucessfully",
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
module.exports = {
  createPost,
  getallPost,
  removePost,
  getallUserPost,
  //   updatePost,
  //   searchPost,
};
