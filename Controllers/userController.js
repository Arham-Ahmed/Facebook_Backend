const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenModel = require("../Models/Token");
const { response } = require("../utils/response");
const moment = require("moment");

const {
  firebaseUploder,
  firebaseImageDelete,
} = require("../helper/firebaseUploader/firebaseUploader");
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
        const userRplace = await Users?.findOneAndDelete({
          email: user?.email,
        });
      }

      const newUser = new Users(user);
      if (!newUser)
        return response(
          res,
          500,
          false,
          "Some error occur on creating account"
        );
      if (req?.files?.profile_photo?.length) {
        const Filemimetype = req?.files?.profile_photo[0].mimetype;
        if (!Filemimetype.includes("image/"))
          return response({
            res: res,
            statusCode: 500,
            sucessBoolean: false,
            message: "Invalid file format -- Please upload an image",
          });

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
        // await newUser.save();
        // return response(res, 201, true, "User created sucessfully", newUser);
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

    // if (existsuser?.isDelete) {
    //   const userRplace = await Users?.findOneAndDelete({ email: user?.email });
    //   const newUser = new Users(user);
    //   if (!newUser)
    //     return response(
    //       res,
    //       500,
    //       false,
    //       "Some error occur on creating account"
    //     );
    //   if (req?.files?.profile_photo?.length > 0) {
    //     const image = req?.files?.profile_photo[0];
    //     const downloadUrl = await firebaseUploder("profile_photo", image);
    //     newUser.profile_photo.push(downloadUrl);
    //     await newUser.save();
    //   }
    //   await newUser.save();

    //   return response(res, 201, true, "User created sucessfully", newUser);
    // }
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
    if (!user)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Invalid Credential",
      });
    if (user?.isDelete)
      return response({
        res: res,
        statusCode: 400,
        sucessBoolean: false,
        message: "User not found",
      });

    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Invalid Credential",
      });

    const token = jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
      expiresIn: "90d",
    });
    if (!token)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Somthing went wrong",
      });

    const newToken = new tokenModel({
      token: token,
      Device: req?.headers["user-agent"],
      user_id: user?._id,
    });
    await newToken?.save();
    user.token?.push(newToken?._id);
    await user?.save();
    // res
    //   .status(200)
    //   ?.cookie("token", token, Option)
    //   ?.json({
    //     sucess: true,
    //     message: "Loggin SucessFully",
    //     user: await Users?.findById({ _id: user?.id })?.select([
    //       "-password",
    //       "-role",
    //       "-token",
    //     ]),
    //     token,
    //   });
    // res
    //   .status(200)
    //   ?.cookie("token", token, Option)
    //   ?.json({
    //     sucess: true,
    //     message: "Loggin SucessFully",
    //     user: await Users?.findById({ _id: user?.id })?.select([
    //       "-password",
    //       "-role",
    //       "-token",
    //     ]),
    //     token,
    //   });
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
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
///////////////////////////////////////////// For Logout Users /////////////////////////////////////

const LogoutUser = async (req, res) => {
  try {
    const authorization = req?.headers?.authorization;
    if (!authorization)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unauthorized",
      });
    const token = authorization.split(" ")[1];
    if (!token)
      return response({
        res: res,
        statusCode: 401,
        sucessBoolean: false,
        message: "Unable To Logout Login First",
      });
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

    const refr = user?.profile_photo?.map(async (image, index) => {
      const deleteImagPath = image
        .split("/")
        [image.split("/").length - 1].replaceAll("%", "")
        .split("?")[0]
        .replace("2F", "/");

      await firebaseImageDelete(deleteImagPath, res);
    });
    user.profile_photo = [];
    await user.save();

    const deleteUser = await Users?.findByIdAndUpdate(
      { _id: req.user?._id },
      {
        isDelete: moment().format("YYYY MMMM Do , h:mm:ss a"),
      }
    );

    if (deleteUser) {
      await res?.clearCookie("token");
      return response({
        res: res,
        statusCode: 200,
        sucessBoolean: true,
        message: "Deleted sucessfully",
      });
    }
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
    const { email, name } = req?.body;
    const UpdatedUser = await Users?.findOneAndUpdate(
      { _id: req.user?._id },
      { name: name, email: email }
    );

    if (!UpdatedUser)
      return response({
        res: res,
        statusCode: 500,
        sucessBoolean: false,
        message: "Some Error Occured",
      });

    if (req?.files?.profile_photo) {
      const Filemimetype = req?.files?.profile_photo[0].mimetype;
      if (!Filemimetype.includes("image/"))
        return response({
          res: res,
          statusCode: 500,
          sucessBoolean: false,
          message: "Invalid file format -- Please upload an image",
        });
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
      statusCode: 500,
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
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
    });
  }
};
const userCall = async (req, res) => {
  try {
    const user_id = req.user?._id;
    const user = await Users?.findById({ _id: user_id })
      .select(["-token", "-role", "-password"])
      .populate(["todos", "posts"]);
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
      statusCode: 500,
      sucessBoolean: false,
      message: "Error",
      payload: e.message,
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
