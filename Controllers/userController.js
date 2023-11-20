const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../Models/Token");
const { response } = require("../utils/response");
const moment = require("moment");

const Option = {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  Expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  // path: "http://localhost:5000/users/user",
};
///////////////////////////////////////////// For Creating Users /////////////////////////////////////
const createUser = async (req, res) => {
  try {
    const user = {
      name: req?.body?.name,
      email: req?.body?.email,
      password: req?.body?.password,
      profile_photo: `http://localhost:5000/${req?.files?.profile_photo[0]?.filename}`,
    };
    const ExistsUser = await Users?.findOne({ email: user?.email });
    if (ExistsUser) return response(400, false, "User Already exist", res);
    const newUser = new Users(user);
    await newUser?.save();
    if (!newUser)
      return response(500, false, "Some error occur on creating account", res);

    return response(201, true, "User created sucessfully", res);
  } catch (e) {
    return response(500, false, e.message, res);
  }
};
///////////////////////////////////////////// For Loggin Users /////////////////////////////////////
const loginUser = async (req, res) => {
  try {
    const { email, password } = req?.body;

    const user = await Users?.findOne({ email: email })?.select("+password");

    if (!user) return response(401, false, "User doesn't exist", res);

    if (!user?.isDelete) return response(400, false, "Can't Find User", res);

    const isMatch = await bcryptjs?.compare(password, user?.password);

    if (!isMatch) return response(401, false, "Invalid Credential", res);

    const token = jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
      expiresIn: "90d",
    });
    if (!token) return response(500, false, "Somthing went wrong", res);

    const newToken = new Token({
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
    return response(500, false, e.message);
  }
};
const LogoutUser = async (req, res) => {
  try {
    const { token } = req?.cookies;
    if (!token) return response(401, false, "Unable To Logout Login First");
    const user = await Users?.findById({ _id: req.user?._id });
    if (!user)
      return res.status(401).json({ sucess: false, message: "UnAuthorized" });
    user.token = user?.token?.filter((elem) => elem !== token);
    await user?.save();
    return res.clearCookie("token").json({
      sucess: true,
      message: "Logout SucessFully",
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error?.message,
    });
  }
};
///////////////////////////////////////////// For Removing Users /////////////////////////////////////

const removeUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const user = await Users?.findOne({ email: email })?.select("+password");
    if (!user) {
      res.status(404).json({
        sucess: false,
        message: "User Dosent Exists",
      });
    }
    const isMatch = await bcryptjs?.compare(password, user?.password);
    if (!isMatch) {
      res.status(404).json({
        sucess: false,
        message: "Invalid Credential",
      });
    }

    const deleteUser = await Users?.findByIdAndUpdate(
      { _id: req?.user?._id },
      { isDelete: moment().format("MMMM Do YYYY, h:mm:ss a") }
    );
    if (deleteUser) {
      res.status(200)?.clearCookie("token")?.json({
        sucess: true,
        message: "Deleted SucessFully",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e?.message,
    });
  }
};
// For Updating Users
const updateUser = async (req, res) => {
  try {
    const { email, name } = req?.body;
    const UpdatedUser = await Users?.findOneAndUpdate(
      { _id: req?.user?._id },
      { name: name, email: email }
    );

    if (!UpdatedUser)
      return res
        .status(500)
        .json({ sucess: false, message: "Some Error Occured" });
    UpdatedUser.profile_photo.push(
      `http://localhost:5000/${req?.files?.profile_photo[0]?.filename}`
    );
    await UpdatedUser?.save();
    res
      .status(200)
      .json({ resStatus: res.status, message: "Updation SucessFully" });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
///////////////////////////////////////////// For Getting All Users /////////////////////////////////////

const getallUsers = async (req, res) => {
  let AllUsers;
  const { email, name } = req?.query;
  AllUsers = await Users?.find({});
  if (email) {
    AllUsers = await Users?.find({ email: email }); //.select("+password");
  }
  if (name) {
    AllUsers = await Users?.find({
      name: { $regex: name, $options: "i" },
    });
  }
  if (AllUsers.length == 0)
    return res.status(404).json({ message: "No User Found" });
  try {
    return res.status(200).json({
      resStatus: res.status,
      Users: AllUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
const userCall = async (req, res) => {
  const user_id = req?.user?._id;
  const user = await Users?.findById({ _id: user_id })
    .select(["-token", "-role", "-password"])
    .populate(["todos", "posts"]);
  try {
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
