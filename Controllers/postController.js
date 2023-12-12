const { isValidObjectId } = require("mongoose");
const Post = require("../Models/Post");
const userModel = require("../Models/user");
const {
  firebaseUploder,
  firebaseImageDelete,
  imagePathMaker,
  imageMimetype,
  validateUserPresence,
} = require("../helper/index");

const response = require("../utils/response");

////////////////////////////////// For Creating Post /////////////////////////////
const createPost = async (req, res) => {
  try {
    const newPost = {
      caption: req?.body?.caption,
      owner: req.user?._id,
    };

    if (!Object.keys(req?.body).length) {
      return response({
        res: res,
        statusCode: 200,
        successBoolean: false,
        message: "Atleast 1 feild present",
      });
    }

    const post = new Post(newPost);
    if (!post)
      return response({
        res: res,
        statusCode: 500,
        successBoolean: false,
        message: "Some error on creating post",
      });
    const user = await userModel.findById(req.user?._id);
    validateUserPresence(user, res);
    user?.posts?.push(post?._id);
    await user?.save();

    if (req?.files?.imageUrl?.length) {
      const imageArray = req?.files?.imageUrl?.map(async (img, index) => {
        // imageMimeType checker
        imageMimetype(img, res);
        const image = req?.files?.imageUrl[index];
        // Firebase uploader

        return firebaseUploder("/post_images", image);
      });
      // const allPromis = ;
      post?.imageUrl?.push(...(await Promise.all(imageArray)));
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
      successBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
////////////////////////////////// For getall Posts ////////////////////////////////
const getallPost = async (req, res) => {
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
    let posts = await Post.find({}).populate(populateValue); //.sort("-createdAt");
    if (!posts?.length)
      return response({
        res: res,
        statusCode: 404,
        successBoolean: false,
        message: "No post found",
      });
    const allPosts = posts
      .filter((post) => post?.owner?.isDelete === null)
      .sort((a, b) => b.createdAt - a.createdAt);

    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "All posts",
      payload: allPosts,
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      successBoolean: false,
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
    const posts = await Post.find({ owner: req.user?._id })

      .populate(populateValue)
      .sort("-createdAt");
    if (!posts?.length)
      return response({
        res: res,
        statusCode: 200,
        successBoolean: true,
        message: "No post available",
      });
    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "All posts of User are",
      payload: posts,
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      successBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};

////////////////////////////////////// For Removing Posts ///////////////////////////////
const removePost = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id || !isValidObjectId(id))
      response({
        res: res,
        statusCode: 400,
        successBoolean: true,
        message: "Invalid post id",
      });
    const post = await Post?.findOne({ _id: id });
    if (!post)
      return response({
        res: res,
        statusCode: 200,
        successBoolean: true,
        message: "No post found",
      });
    const deletedImages = post?.imageUrl?.map((image, index) => {
      const deleteImagPath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagPath);
    });
    const user = await userModel.findById(req.user?.id);
    validateUserPresence(user, res);
    await Post.findByIdAndDelete(id);
    user?.posts?.filter((post) => post.toString() != post._id.toString());
    await user?.save();
    await Promise.all(deletedImages);

    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "Post deleted sucessfully",
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: 500,
      successBoolean: false,
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
