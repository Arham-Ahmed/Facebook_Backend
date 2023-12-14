const { isValidObjectId } = require("mongoose");
const postModel = require("../Models/Post");
const userModel = require("../Models/user");
const mediaSchema = require("../Models/media");
const {
  firebaseUploder,
  firebaseImageDelete,
  imagePathMaker,
  imageMimetype,
  validateUserPresence,
  imageUploader,
} = require("../helper/index");

const response = require("../utils/response");

////////////////////////////////// For Creating Post /////////////////////////////
const createPost = async (req, res) => {
  try {
    if (!Object.keys(req?.body).length) {
      return response({
        res: res,
        statusCode: 400,
        successBoolean: false,
        message: "You can't create an empty post",
      });
    }
    const newPost = {
      caption: req?.body?.caption,
      owner: req.user?._id,
    };
    const post = new postModel(newPost);
    // const user = await userModel.findById(req.user?._id, { isDeleted: null });

    if (req?.files && Object.keys(req?.files).length > 0) {
      await Promise.all(
        Object?.keys(req.files)?.map(async (key) => {
          if (req.files[key]) {
            const newMedia = new mediaSchema({
              type: key,
              post: post._id,
              url: await imageUploader(key, req),
            });
            await newMedia.save();
          }
        })
      );
    }
    await post.save();
    const userPost = await postModel.aggregate([
      { $match: { _id: post._id } },
      {
        $lookup: {
          from: "media",
          localField: "_id",
          foreignField: "post",
          as: "postImage",
        },
      },
      // { $project: { owner: 0 } },
    ]);
    return response({
      res: res,
      statusCode: 201,
      message: "Post created sucessfully",
      payload: userPost,
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
  try {
    let posts = await postModel.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "postOwner",
        },
      },
      {
        $lookup: {
          from: "media",
          localField: "postOwner._id",
          foreignField: "owner",
          as: "profileImages",
        },
      },
      { $unwind: "$postOwner" },
      // { $unwind: "$profileImages" },
      {
        $lookup: {
          from: "media",
          localField: "_id",
          foreignField: "post",
          as: "postimages",
        },
      },

      {
        $unset: [
          "postOwner.password",
          "postOwner.role",
          "postOwner.isDeleted",
          "postOwner.__v",
        ],
      },
    ]);
    if (!posts?.length)
      return response({
        res: res,
        statusCode: 200,
        successBoolean: true,
        message: "No post found",
      });
    // const allPosts = posts
    //   .filter((post) => post?.owner?.isDelete === null)
    //   .sort((a, b) => b.createdAt - a.createdAt);
    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "All posts",
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
          model: "user",
          select: ["name", "profile_photo", "createdAt"],
        },
      },
      {
        path: "likes",
        select: ["name", "profile_photo", "createdAt"],
      },
    ];
    const posts = await postModel
      .find({ owner: req.user?._id })
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
      return response({
        res: res,
        statusCode: 400,
        successBoolean: true,
        message: "Invalid post id",
      });
    const post = await postModel?.findOne({ _id: id });
    if (!post)
      return response({
        res: res,
        statusCode: 200,
        successBoolean: true,
        message: "No post found",
      });
    const deletedImages = post?.imageUrl?.map((image) => {
      const deleteImagPath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagPath);
    });
    const user = await userModel.findById(req.user?.id);
    validateUserPresence(user, res);
    post.set({ isDeleted: Date.now() });
    // await postModel.findByIdAndDelete(id);
    // user?.posts?.filter((post) => post.toString() != post._id.toString());
    // user?.post?.pull(post?._id);
    await post?.save();
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
