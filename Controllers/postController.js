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
const imageMimetype = require("../helper/imageHelperFunc's/imageMimeType");

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
        imageMimetype(img, res);
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
      statusCode: e.statusCode || 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
////////////////////////////////// For getall Posts ////////////////////////////////
const getallPost = async (req, res) => {
  let posts;
  const populateValue = [
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
  ];
  try {
    const { id, caption, email } = req?.query;
    posts = await Post?.find({})?.sort().populate(populateValue);
    if (id) {
      posts = await Post?.find({ _id: id })?.sort().populate(populateValue);
    }
    if (caption) {
      posts = await Post?.find({ caption: { $regex: caption, $options: "i" } })
        ?.sort()
        .populate(populateValue);
    }
    if (email) {
      posts = await Post?.find({ email: { $regex: email, $option: i } })
        ?.sort()
        .populate(populateValue);
    }

    if (!posts?.length)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No post available",
      });
    const allPosts = posts.filter((post) => post?.owner?.isDelete === null);

    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "All posts",
      payload: allPosts,
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
    const populateValue = [
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
    ];
    const posts = await Post?.find({ owner: req.user?._id })
      ?.sort("-1")
      .populate(populateValue);
    if (!posts?.length)
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
