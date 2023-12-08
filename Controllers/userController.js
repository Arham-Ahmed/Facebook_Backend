const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const tokenModel = require("../Models/Token");
const { response } = require("../utils/response");
const moment = require("moment");

const {
  firebaseUploder,
  firebaseImageDelete,
  imageMimetype,
  imagePathMaker,
  userChecker,
  jwtGenrator,
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
      if (req?.files?.profile_photo?.length) {
        const img = req?.files?.profile_photo[0];
        imageMimetype(img, res);
        // firebase Image Uploading ...
        if (req?.files?.profile_photo?.length > 1) {
          return response({
            res: res,
            statusCode: 400,
            sucessBoolean: false,
            message: "You can Upload 1 image at a time",
          });
        }
        const image = req?.files?.profile_photo[0];
        const downloadUrl = await firebaseUploder("profile_photo", image);
        newUser?.profile_photo.push(downloadUrl);
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
    if (!user) {
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "Invalid Credential",
      });
    }

    const isMatch = bcryptjs?.compare(password, user?.password);
    if (!isMatch) {
      return response({
        res: res,
        statusCode: 404,
        sucessBoolean: false,
        message: "Invalid Credential",
      });
    }

    const deletedImages = user?.profile_photo?.map(async (image, index) => {
      const deleteImagePath = imagePathMaker(image);
      return firebaseImageDelete(deleteImagePath, res);
    });
    await Promise.all(deletedImages)
      .then(async () => {
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

        return response({
          res: res,
          statusCode: 200,
          sucessBoolean: true,
          message: "Deleted sucessfully",
        });
      })
      .catch(async (error) => {
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
        return response({
          res: res,
          statusCode: 202,
          sucessBoolean: true,
          message: "Request fullfield but error ocuured",
          payload: error?.message,
        });
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
    const update = req?.body;
    const UpdatedUser = await Users?.findOneAndUpdate(
      { _id: req.user?._id },
      update,
      { new: true }
    );

    if (!UpdatedUser)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Some Error Occured",
      });

    if (req?.files?.profile_photo) {
      const img = req?.files?.profile_photo[0];
      imageMimetype(img, res);

      if (req?.files?.profile_photo?.length > 1) {
        return response({
          res: res,
          statusCode: 400,
          sucessBoolean: false,
          message: `cant upload more than 1 image`,
        });
      }
      const image = req?.files?.profile_photo[0];
      const downloadUrl = await firebaseUploder("profile_photo", image);
      UpdatedUser?.profile_photo?.push(downloadUrl);
    }

    await UpdatedUser?.save();

    return response({
      res: res,
      statusCode: 200,
      sucessBoolean: true,
      message: "Updated sucessfully",
      payload: UpdatedUser,
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
    let allUsers;
    const { email, name } = req?.query;

    allUsers = await Users?.find({});
    if (email) {
      allUsers = await Users?.find({ email: email });
    }
    if (name) {
      allUsers = await Users?.find({
        name: { $regex: name, $options: "i" },
      });
    }
    if (!allUsers.length)
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

module.exports = {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  loginUser,
  LogoutUser,
  userCall,
};

// user.profile_photo = [];
// await user.save();
// const deleteUser = await Users?.findByIdAndUpdate(req.user?._id, {
//   isDelete: moment().format("YYYY MMMM Do , h:mm:ss a"),
// });
// if (deleteUser) {
//   return response({
//     res: res,
//     statusCode: 200,
//     sucessBoolean: true,
//     message: "Deleted sucessfully",
//   });
// }
