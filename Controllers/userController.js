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
const Option = {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  // sameSite: "lax",
  sameSite: "none",
  secure: true,
  Expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  // path: "http://localhost:5000/users/user",
};

///////////////////////////////////////////// For Creating Users /////////////////////////////////////
const createUser = async (req, res) => {
  try {
    if (!req)
      return response(
        res,
        500,
        false,
        "Internal server error cannot get req file :~ userController.js on line 24 "
      );
    const user = {
      name: req?.body?.name,
      email: req?.body?.email,
      password: req?.body?.password,
    };
    const existsuser = await Users?.findOne({ email: user?.email });
    if (!existsuser) {
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
          return response(
            res,
            500,
            false,
            "Invalid file format -- Please upload an image"
          );

        // firebase Image Uploading ...
        if (req?.files?.profile_photo[0]?.length > 0) {
          return response(res, 400, false, "You can Upload 1 image at a time");
        }
        const image = req?.files?.profile_photo[0];
        const downloadUrl = await firebaseUploder("profile_photo", image);
        newUser?.profile_photo.push(downloadUrl);
        await newUser.save();
      }
      await newUser.save();
      return response(res, 201, true, "User created sucessfully", newUser);
    }

    if (existsuser?.isDelete) {
      const userRplace = await Users?.findOneAndDelete({ email: user?.email });
      const newUser = new Users(user);
      if (!newUser)
        return response(
          res,
          500,
          false,
          "Some error occur on creating account"
        );
      if (req?.files?.profile_photo?.length > 0) {
        const image = req?.files?.profile_photo[0];
        const downloadUrl = await firebaseUploder("profile_photo", image);
        newUser.profile_photo.push(downloadUrl);
        await newUser.save();
      }
      await newUser.save();

      return response(res, 201, true, "User created sucessfully", newUser);
    }
    if (!existsuser?.isDelete)
      return response(res, 409, false, "User with this email already exist ");
  } catch (e) {
    return response(res, 500, false, e.message);
  }
};
///////////////////////////////////////////// For Loggin Users /////////////////////////////////////
const loginUser = async (req, res) => {
  try {
    const { email, password } = req?.body;

    const user = await Users?.findOne({ email: email })?.select("+password");

    if (!user) return response(res, 401, false, "Invalid Credential");
    if (user?.isDelete) return response(res, 400, false, "Can't Find User");

    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch) return response(res, 401, false, "Invalid Credential");

    const token = jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
      expiresIn: "90d",
    });
    if (!token) return response(res, 500, false, "Somthing went wrong");

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
    return response(res, 200, true, "Login sucessfully", {
      user: user,
      token: token,
    });
  } catch (e) {
    return response(res, 500, false, e.message);
  }
};
///////////////////////////////////////////// For Logout Users /////////////////////////////////////

const LogoutUser = async (req, res) => {
  try {
    const authorization = req?.headers?.authorization;
    if (!authorization) return response(res, 401, false, "Unauthorized");
    const token = authorization.split(" ")[1];
    if (!token)
      return response(res, 401, false, "Unable To Logout Login First");
    jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
      expiresIn: "1s",
    });
    return response(res, 200, true, "Logout sucessfully");
  } catch (error) {
    return response(res, 500, false, error?.message);
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
      return response(res, 404, false, "Invalid Credential");
    }
    const isMatch = bcryptjs?.compare(password, user?.password);
    if (!isMatch) {
      return response(res, 404, false, "Invalid Credential");
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
      { _id: global.user?._id },
      {
        isDelete: moment().format("YYYY MMMM Do , h:mm:ss a"),
      }
    );

    if (deleteUser) {
      await res?.clearCookie("token");
      return response(res, 200, true, "Deleted sucessfully");
    }
  } catch (e) {
    return response(
      res,
      500,
      false,
      `Server error on userController line 190 ${e.message}`
    );
  }
};
///////////////////////////////////////////// For Updating Users /////////////////////////////////////
const updateUser = async (req, res) => {
  try {
    if (!req)
      return response(
        res,
        500,
        false,
        "Internal server error cannot get req file :~ userController.js on line 203 "
      );
    const { email, name } = req?.body;
    const UpdatedUser = await Users?.findOneAndUpdate(
      { _id: global.user?._id },
      { name: name, email: email }
    );

    if (!UpdatedUser) return response(res, 500, false, "Some Error Occured");

    if (req.files.profile_photo) {
      const Filemimetype = req?.files?.profile_photo[0].mimetype;
      if (!Filemimetype.includes("image/"))
        return response(
          res,
          500,
          false,
          "Invalid file format -- Please upload an image"
        );
      if (req?.files?.profile_photo?.length > 1) {
        return response(res, 400, false, `cant upload more than 1 image`);
      }
      const image = req?.files?.profile_photo[0];
      const downloadUrl = await firebaseUploder("profile_photo", image);
      UpdatedUser?.profile_photo?.push(downloadUrl);
      await UpdatedUser?.save();
    }

    // await UpdatedUser?.save();

    return response(res, 200, true, "Updated sucessfully", UpdatedUser);
  } catch (e) {
    return response(
      res,
      500,
      false,
      `Error on userController line number 234 ${e?.message}`
    );
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
    if (allUsers.length === 0 || allUsers == [])
      return response(res, 404, false, "No user found");

    return response(res, 200, true, "allUsers", allUsers);
  } catch (error) {
    return response(res, 500, false, error?.message);
  }
};
const userCall = async (req, res) => {
  try {
    const user_id = global.user?._id;
    const user = await Users?.findById({ _id: user_id })
      .select(["-token", "-role", "-password"])
      .populate(["todos", "posts"]);
    return response(res, 200, true, "user are", {
      user: user,
      token: global.token,
    });
  } catch (error) {
    return response(res, 500, false, error?.message);
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
