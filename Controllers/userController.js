const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const tokenModel = require("../Models/Token");
const response = require("../utils/response");
const moment = require("moment");

const {
  firebaseImageDelete,
  imagePathMaker,
  userChecker,
  jwtGenrator,
  imageUploader,
} = require("../helper");
// Initialize Firebase

///////////////////////////////////////////// For Creating Users /////////////////////////////////////
const createUser = async (req, res) => {
  try {
    const user = {
      name: req?.body?.name,
      email: req?.body?.email,
      password: req?.body?.password,
    };
    const existsuser = await Users?.findOne({ email: user?.email });
    if (!existsuser || existsuser?.isDelete) {
      if (existsuser?.isDelete) {
        await Users?.findOneAndDelete({
          email: user?.email,
        });
      }

      const newUser = new Users(user);
      if (!newUser)
        return response({
          res: res,
          statusCode: 500,
          sucessBoolean: false,
          message: "Some error occur on creating account",
        });

      if (req?.files && Object.keys(req?.files).length > 0) {
        await Promise.all(
          Object?.keys(req.files)?.map((key) => {
            return imageUploader(key, req, newUser);
          })
        );
      }
      await newUser.save();
      return response({
        res: res,
        statusCode: 201,
        sucessBoolean: true,
        message: "User created sucessfully",
        payload: newUser,
      });
    }

    if (!existsuser?.isDelete)
      return response({
        res: res,
        statusCode: 409,
        sucessBoolean: false,
        message: "User with this email already exist ",
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
///////////////////////////////////////////// For Loggin Users /////////////////////////////////////
const loginUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const user = await Users?.findOne({ email: email })?.select("+password");
    userChecker(user, res);
    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Invalid Credential",
      });

    const token = jwtGenrator(user);
    if (!token)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Internal server error",
      });

    // tokenSave in database
    const newToken = new tokenModel({
      token: token,
      Device: req?.headers["user-agent"],
      user_id: user?._id,
    });
    if (!newToken)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Internal server error",
      });
    await newToken?.save();
    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
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
      sucessBoolean: false,
      message: e?.message || "Internal server error",
    });
  }
};
///////////////////////////////////////////// For Logout Users /////////////////////////////////////

const LogoutUser = async (req, res) => {
  try {
    const authorization = req?.headers?.authorization;
    const token = authorization?.split(" ")[1];
    if (!authorization && !token)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized !!",
      });
    const databaseToken = await tokenModel.findOne({ token: token });
    if (!databaseToken)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: true,
        message: "Failed to logout. Please try again.",
      });
    databaseToken.expireAt = Date.now();
    await databaseToken.save();
    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "Logout sucessfully",
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
///////////////////////////////////////////// For Removing Users /////////////////////////////////////
const removeUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const user = await Users?.findOne({ email: email })?.select([
      "+password",
      "+isDelete",
    ]);

    userChecker(user, res);

    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch) {
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "Invalid Credential",
      });
    }

    const deletedProfileImages = user?.profile_photo?.map(async (image) => {
      const deleteImagePath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagePath, res);
    });
    const deletedCoverImages = user?.cover_photo?.map(async (image) => {
      const deleteImagePath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagePath, res);
    });
    const deleteUser = await Users?.findByIdAndUpdate(req.user?._id, {
      isDelete: moment().format("YYYY MMMM Do , h:mm:ss a"),
    });
    if (!deleteUser) {
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "User not found",
      });
    }
    user.profile_photo = [];
    await user.save();
    const databaseToken = await tokenModel.findOne({ token: req.token });
    if (!databaseToken)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: true,
        message: "Failed to logout. Please try again.",
      });
    databaseToken.expireAt = Date.now();
    await databaseToken.save();
    await Promise.all(deletedProfileImages);
    await Promise.all(deletedCoverImages);

    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "Deleted sucessfully",
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
///////////////////////////////////////////// For Updating Users /////////////////////////////////////
const updateUser = async (req, res) => {
  try {
    const { email, name, bio, liveIn, socialLinks } = req?.body;
    const user = await Users?.findOne({ _id: req.user?._id });
    userChecker(user);
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
      sucessBoolean: true,
      message: "Updated sucessfully",
      payload: user,
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
    let allUsers = await Users?.find(queryObject);
    if (!allUsers?.length)
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "No user found",
      });

    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "allUsers",
      payload: allUsers,
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
//////////////////////////////////////////// Me OR User Call /////////////////////////////////////////
const userCall = async (req, res) => {
  try {
    const user_id = req.user?._id;
    const user = await Users?.findById(user_id)
      .select(["-token", "-role", "-password"])
      .populate("posts");
    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
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
      sucessBoolean: false,
      message: e?.message || "Internal server error",
    });
  }
};
//////////////////////////////////////////// Friend Request  ////////////////////////////////////////
const friendReq = () => {};
module.exports = {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  loginUser,
  LogoutUser,
  userCall,
};
