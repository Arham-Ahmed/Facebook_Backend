const userModel = require("../Models/user");
const bcryptjs = require("bcryptjs");
const tokenModel = require("../Models/token");
const mediaSchema = require("../Models/media");
const response = require("../utils/response");
const {
  firebaseImageDelete,
  imagePathMaker,
  validateUserPresence,
  jwtGenerator,
  imageUploader,
} = require("../helper");
const { isValidObjectId } = require("mongoose");
// const { isValidObjectId, default: mongoose } = require("mongoose");

///////////////////////////////////////////// For Creating Users /////////////////////////////////////
const createUser = async (req, res) => {
  try {
    const existingUser = await userModel.aggregate([
      {
        $match: { email: req.body.email, isDeleted: null },
      },
    ]);
    if (existingUser && existingUser?.length) {
      return response({
        res: res,
        statusCode: 409,
        successBoolean: false,
        message: "User with this email already exist ",
      });
    }
    const user = {
      name: req?.body?.name,
      email: req?.body?.email.toLowerCase(),
      password: req?.body?.password,
    };
    const newUser = new userModel(user);
    if (req?.files && Object.keys(req?.files).length > 0) {
      await Promise.all(
        Object?.keys(req.files)?.map(async (key) => {
          if (req.files[key]) {
            const newMedia = new mediaSchema({
              type: key,
              owner: newUser._id,
              url: await imageUploader(key, req),
            });
            await newMedia.save();
          }
        })
      );
    }
    await newUser.save();
    const createdUser = await userModel.aggregate([
      { $match: { _id: newUser._id } },
      {
        $lookup: {
          from: "media",
          localField: "_id",
          foreignField: "owner",
          as: "media",
        },
      },
      // {
      //   $group: {
      //     _id: "$type",
      //     total: { $sum: 1 },
      //   },
      // },
    ]);
    return response({
      res: res,
      statusCode: 201,
      successBoolean: true,
      message: "User created sucessfully",
      payload: createdUser,
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
///////////////////////////////////////////// For Loggin Users /////////////////////////////////////
const loginUser = async (req, res) => {
  try {
    const user = await userModel
      ?.findOne({ email: req?.body?.email })
      ?.select("+password");
    const { password } = req?.body;
    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch)
      return response({
        res: res,
        statusCode: 401,
        successBoolean: false,
        message: "Invalid Credential",
      });

    const token = jwtGenerator(user);
    if (!token)
      return response({
        res: res,
        statusCode: 500,
        successBoolean: false,
        message: "Internal server error",
      });

    // tokenSave in database
    const newToken = new tokenModel({
      token: token,
      device: req?.headers["user-agent"],
      user_id: user?._id,
    });

    await newToken?.save();

    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "Login sucessfully",
      payload: {
        user: user,
        token: token,
      },
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: e?.statusCode || 500,
      successBoolean: false,
      message: e?.message || "Internal server error",
    });
  }
};
///////////////////////////////////////////// For Logout Users /////////////////////////////////////

const logoutUser = async (req, res) => {
  try {
    const authorization = req?.headers?.authorization;
    const token = authorization?.split(" ")[1];
    if (!authorization && !token)
      return response({
        res: res,
        statusCode: 401,
        successBoolean: false,
        message: "Unauthorized !!",
      });
    const databaseToken = await tokenModel.findOne({ token: token });
    if (!databaseToken)
      return response({
        res: res,
        statusCode: 500,
        successBoolean: true,
        message: "Failed to logout. Please try again.",
      });
    databaseToken.expireAt = Date.now();
    await databaseToken.save();
    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "Logout sucessfully",
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
///////////////////////////////////////////// For Removing Users /////////////////////////////////////
const removeUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const user = await userModel
      ?.findOne({ email: email, isDeleted: null })
      ?.select("+password");
    // validateUserPresence(user);
    if (!user) {
      return response({
        res: res,
        statusCode: 400,
        message: "User not found",
      });
    }
    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch) {
      return response({
        res: res,
        statusCode: 401,
        successBoolean: false,
        message: "Invalid Credential",
      });
    }

    const deletedProfileImages = user?.profilePhotos?.map(async (image) => {
      const deleteImagePath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagePath, res);
    });
    const deletedCoverImages = user?.coverPhotos?.map(async (image) => {
      const deleteImagePath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagePath, res);
    });
    // const deleteUser = await userModel.findById(req.user?._id);
    // // if (!deleteUser) {
    // //   return response({
    // //     res: res,
    // //     statusCode: 400,
    // //     successBoolean: false,
    // //     message: "User not found",
    // //   });
    // // }
    // validateUserPresence(deleteUser);
    user.set({ isDeleted: Date.now() });
    user.profilePhotos = [];
    await user.save();
    const databaseToken = await tokenModel.findOne({ token: req.token });
    if (!databaseToken)
      return response({
        res: res,
        statusCode: 500,
        successBoolean: true,
        message: "Failed to logout. Please try again.",
      });
    databaseToken.expireAt = Date.now();
    await databaseToken.save();
    await Promise.all(deletedProfileImages);
    await Promise.all(deletedCoverImages);

    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "Deleted sucessfully",
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
///////////////////////////////////////////// For Updating Users /////////////////////////////////////
const updateUser = async (req, res) => {
  try {
    const { email, name, bio, liveIn, socialLinks } = req?.body;
    const user = await userModel.findOne({ _id: req.user?._id });
    validateUserPresence(user);
    user.set({
      email,
      name,
      bio,
      liveIn,
      socialLinks,
    });

    if (Object.keys(req?.files)?.length >= 1) {
      await Promise.all(
        Object?.keys(req.files)?.map(async (key) => {
          return imageUploader(key, req, user);
        })
      );
    }
    await user?.save();
    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "Updated sucessfully",
      payload: user,
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
//////////////////////////////////////////// For Getting All Users ////////////////////////////////////
const getallUsers = async (req, res) => {
  try {
    const { email, name } = req?.query;
    const queryObject = {};

    if (email) {
      queryObject.email = email;
    }
    if (name) {
      queryObject.name = { $regex: name, $options: "i" };
    }
    let allUsers = await userModel.find(queryObject);
    if (!allUsers?.length)
      return response({
        res: res,
        statusCode: 404,
        successBoolean: false,
        message: "No user found",
      });

    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "allUsers",
      payload: allUsers,
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
//////////////////////////////////////////// Me OR User Call /////////////////////////////////////////
const userCall = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
      return response({
        res,
        statusCode: 400,
        message: "Invalid user id",
      });
    }
    const user = await userModel.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: "post",
          localField: "owner",
          foreignField: "_id",
          as: "post",
        },
      },
    ]);
    // ?.findById(user_id)
    // .select(["-token", "-role", "-password"])
    // .populate("post");
    return response({
      res: res,
      statusCode: 200,
      successBoolean: true,
      message: "user are",
      payload: {
        user: user,
        token: req.token,
      },
    });
  } catch (e) {
    return response({
      res: res,
      statusCode: e?.statusCode || 500,
      successBoolean: false,
      message: e?.message || "Internal server error",
    });
  }
};
//////////////////////////////////////////// Friend Request  ////////////////////////////////////////
// const friendReq = async (req, res) => {
//   try {
//     const { id } = req.body;
//     if (!isValidObjectId(id)) {
//       return response({
//         res: res,
//         statusCode: 400,
//         message: "No user found",
//       });
//     }
//     const requester = req.user.id;
//     const receiver = await userModel.aggregate([
//       { $match: { _id: mongoose.Schema.Types.ObjectId(id) } },
//       {
//         $lookup: {
//           from: "FriendRequest",
//           localfeild: "requesterId",
//           foreignField: "_id",
//           // as: "requester",
//         },
//       },
//     ]);
//     console.log(
//       "🚀 ~ file: userController.js:365 ~ friendReq ~ receiver:",
//       receiver
//     );
//     validateUserPresence(receiver);
//     if (receiver) {
//     }
//     const FriendRequest = new friendRequestModel({
//       requesterId: requester,
//       recipientId: receiver._id,
//     });
//     if (!FriendRequest) {
//       return response({
//         res: res,
//         statusCode: 500,
//         message: "Internal server error",
//       });
//     }
//     await FriendRequest.save();
//     receiver?.friendRequests?.push(FriendRequest);
//     await receiver.save();
//     return response({
//       res: res,
//       statusCode: 200,
//       successBoolean: true,
//       message: "Request Submit Sucessfully",
//       payload: FriendRequest,
//     });
//   } catch (e) {
//     return response({
//       res: res,
//       statusCode: 500,
//       successBoolean: false,
//       message: "Error",
//       payload: e.message,
//     });
//   }
// };

// const friendAdd = async (req, res) => {
//   try {
//     const { id } = req.body;
//     if (!isValidObjectId(id)) {
//       return response({
//         res: res,
//         statusCode: 400,
//         message: "No user found",
//       });
//     }
//     // current User is accepter  //
//     // and friend Who where add in friends array   //
//     const accepter = await userModel.findById(req.user._id);
//     const friendReqUpadate = await friendRequestModel.findById(id);
//     if (!friendReqUpadate) {
//       return response({
//         res: res,
//         statusCode: 400,
//         message: "Id required",
//       });
//     }
//     const friend = await userModel.findById(
//       friendReqUpadate?.recipientId.toString()
//     );
//     validateUserPresence(friend);
//     friend.friends.push(accepter._id);
//     friendReqUpadate.set({ status: "Accepted" });
//     accepter.friendRequests.filter(
//       (request) => request._id.toString() != friend._id.toString()
//     );
//     friend.friendRequests.filter(
//       (request) => request._id.toString() != friend._id.toString()
//     );
//     await friendReqUpadate.save();
//     await friend.save();
//     await accepter.save();
//     return response({
//       res: res,
//       statusCode: 200,
//       message: `${friend.name} as a friend add sucessfully`,
//       payload: accepter,
//     });
//   } catch (e) {
//     return response({
//       res: res,
//       statusCode: 500,
//       successBoolean: false,
//       message: "Error",
//       payload: e.message,
//     });
//   }
// };

module.exports = {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  loginUser,
  logoutUser,
  userCall,
};
