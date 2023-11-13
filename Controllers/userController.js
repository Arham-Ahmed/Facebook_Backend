const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const Option = {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "none",
  secure: true,
  Expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  path: "http://localhost:5000/users/user",
};
// For Creating Users
const createUser = async (req, res) => {
  try {
    const user = {
      name: req?.body?.name,
      email: req?.body?.email,
      password: req?.body?.password,
      profile_photo: req?.body?.profilePhoto,
    };
    const ExistsUser = await Users?.findOne({ email: user.email });
    if (ExistsUser)
      return res.status(400).json({
        sucess: false,
        message: "User Already Exists",
      });
    const newUser = new Users(user);
    await newUser?.save();
    if (!newUser)
      return res
        .status(500)
        .json({ message: "Some Error Occur on Creating Account" });

    res.status(201).json({
      resStatus: res.status,
      message: "User Created SucessFully ",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
// For Loggin Users
const loginUser = async (req, res) => {
  try {
    const { email, password } = req?.body;
    const user = await Users?.findOne({ email: email })?.select("+password");
    if (!user) {
      return res.status(401).json({
        sucess: false,
        message: "User Dosent Exists",
      });
    }
    const isMatch = await bcryptjs?.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        sucess: false,
        message: "Invalid Password",
      });
    }
    const token = jwt?.sign({ _id: user._id }, process?.env?.JWTSCERET);
    if (!token)
      return res.status(500).json({ message: "Something Went Wrong" });

    res.status(200)?.cookie("token", token, Option)?.json({
      sucess: true,
      message: "Loggin SucessFully",
      token,
    });
    user.token?.push(token);
    await user?.save();
  } catch (e) {
    return res?.status(500)?.json({
      error: e.message,
    });
  }
};
const LogoutUser = async (req, res) => {
  try {
    const { token } = req?.cookies;
    if (!token)
      return res
        .status(401)
        .json({ sucess: false, message: "Unable To Logout Login First" });

    const user = await User?.findById({ _id: req.user._id });
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
      message: error.message,
    });
  }
};
// For Removing Users
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
    const isMatch = await bcryptjs?.compare(password, user.password);
    if (!isMatch) {
      res.status(404).json({
        sucess: false,
        message: "Invalid Credential",
      });
    }

    const deleteUser = await Users?.findOneAndDelete({ email: email });
    if (deleteUser) {
      res.status(200)?.clearCookie("token")?.json({
        sucess: true,
        message: "Deleted SucessFully",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};
// For Updating Users
const updateUser = async (req, res) => {
  try {
    const { email, name } = req?.body;
    const UpdatedUser = await Users?.findOneAndUpdate(
      { _id: req.user._id },
      { name: name, email: email }
    );
    if (!UpdatedUser)
      return res
        .status(500)
        .json({ sucess: false, message: "Some Error Occured" });
    res
      .status(200)
      .json({ resStatus: res.status, message: "Updation SucessFully" });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
// For Getting All Users
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
  const user = await User?.findById({ _id: user_id })
    .select("-token")
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
