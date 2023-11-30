const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenModel = require("../Models/Token");
const { response } = require("../utils/response");
const moment = require("moment");

const { firebaseUploder } = require("../Middlewares/multermiddleware/upload");
const { imageCompressor } = require("../utils/imageCompressor/imageCompressor");
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
    // const img = req?.files?.profile_photo[0]?.buffer; //  Confusion on using this is right
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
      const Filemimetype = req?.files?.profile_photo[0].mimetype;
      if (!Filemimetype.includes("image/"))
        return response(
          res,
          500,
          false,
          "Invalid file format -- Please upload an image"
        );

      // firebase Image Uploading ...
      if (req?.files?.profile_photo[0]?.length > 1) {
        return response(res, 400, false, "You can Upload 1 image at a time");
      }
      const compressedImage = await imageCompressor(
        req?.files?.profile_photo[0]
      );
      const downloadUrl = await firebaseUploder(
        // res,
        // req,
        // req?.files?.profile_photo[0]?.length,
        "profile_photo",
        compressedImage
      );
      newUser?.profile_photo.push(downloadUrl);
      await newUser.save();

      // firebase Image Uploading end...
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

      const compressedImage = await imageCompressor(
        req?.files?.profile_photo[0]
      );
      const downloadUrl = await firebaseUploder(
        // res,
        // req,
        // req?.files?.profile_photo[0]?.length,
        "profile_photo",
        await compressedImage
      );
      newUser.profile_photo.push(downloadUrl);
      await newUser.save();

      return response(res, 201, true, "User created sucessfully", newUser);
    }
    if (!existsuser?.isDelete)
      return response(res, 400, false, "User Already exist");
  } catch (e) {
    return response(res, 500, false, e.message);
  }
};
///////////////////////////////////////////// For Loggin Users /////////////////////////////////////
const loginUser = async (req, res) => {
  try {
    const { email, password } = req?.body;

    const user = await Users?.findOne({ email: email })?.select("+password");

    if (!user) return response(res, 401, false, "User doesn't exist");
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

    res
      .status(200)
      ?.cookie("token", token, Option)
      ?.json({
        sucess: true,
        message: "Loggin SucessFully",
        user: await Users?.findById({ _id: user?.id })?.select([
          "-password",
          "-role",
          "-token",
        ]),
        token,
      });
  } catch (e) {
    return response(res, 500, false, e.message);
  }
};
const LogoutUser = async (req, res) => {
  try {
    const { token } = req?.cookies;
    if (!token)
      return response(res, 401, false, "Unable To Logout Login First");
    return res.clearCookie("token").json({
      sucess: true,
      message: "Logout SucessFully",
    });
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
      res.status(404).json({
        sucess: false,
        message: "User Dosent Exists",
      });
    }
    const isMatch = bcryptjs?.compare(password, user?.password);
    if (!isMatch) {
      res.status(404).json({
        sucess: false,
        message: "Invalid Credential",
      });
    }

    const deleteUser = await Users?.findByIdAndUpdate(
      { _id: req?.user?._id },
      {
        isDelete: moment().format("YYYY MMMM Do , h:mm:ss a"),
      }
    );
    if (deleteUser) {
      res.status(200)?.clearCookie("token")?.json({
        sucess: true,
        message: "Deleted SucessFully",
      });
    }
  } catch (e) {
    return response(res, 500, false, e.message);
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
      { _id: req?.user?._id },
      { name: name, email: email }
    );

    if (!UpdatedUser) return response(res, 500, false, "Some Error Occured");

    // const mimetype = req?.files?.profile_photo[0][];
    // const Filemimetype = Object?.values(req?.files)[0][0].mimetype;
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
    const compressedImage = await imageCompressor(req?.files?.profile_photo[0]);
    const downloadUrl = await firebaseUploder(
      res,
      req,
      req?.files?.profile_photo?.length - 1,
      "profile_photo",
      compressedImage
    );
    UpdatedUser?.profile_photo?.push(downloadUrl);
    await UpdatedUser?.save();

    // await UpdatedUser?.save();

    return response(res, 200, true, "Updated sucessfully", UpdatedUser);
  } catch (e) {
    response(
      res,
      500,
      false,
      `error on userController line number 234${e?.message}`
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
    const user_id = req?.user?._id;
    const user = await Users?.findById({ _id: user_id })
      .select(["-token", "-role", "-password"])
      .populate(["todos", "posts"]);
    return res.status(200).json({
      success: true,
      User: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
