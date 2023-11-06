const Users = require("../Models/user_schema");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const expressValidation = require("express-validator");

const Option = {
  expires: new Date(Date.now() * 60 * 60 * 24 * 90),
  httpOnly: true,
};
// For Creating Users
const createUser = async (req, res) => {
  const user = req.body;
  try {
    const newUser = new Users(user);
    await newUser.save();
    const token = jwt.sign({ _id: this._id }, process.env.JWTSCERET);
    res.status(201).cookie("token", token, [Option]).json({
      resStatus: res.status,
      message: "User Created SucessFully ",
      user: newUser,
      token: token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
// For Loggin Users

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email: email });
    if (!user) {
      res.status(404).json({
        sucess: false,
        message: "User Dosent Exists",
      });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      res.status(404).json({
        sucess: false,
        message: "Invalid Credential",
      });
    }
    const token = jwt.sign({ _id: this._id }, process.env.JWTSCERET);
    res.status(200).cookie("token", token, Option).json({
      sucess: true,
      user: user,
      token,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};
// For Removing Users
const removeUser = async (req, res) => {
  const { email, password, id } = req.body;
  try {
    const user = await Users.findOne({ email: email });
    if (!user) {
      res.status(404).json({
        sucess: false,
        message: "User Dosent Exists",
      });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      res.status(404).json({
        sucess: false,
        message: "Invalid Credential",
      });
    }

    const deleteUser = await Users.findOneAndDelete({ email: email });
    if (deleteUser) {
      res.status(200).clearCookie("token").json({
        sucess: true,
        user: user,
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
  const { email, password, id } = req.body;
  try {
    await Todos.findOneAndUpdate({ _id: user_id }, User);
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
  try {
    AllUsers = (await Users.find({}))?.reverse();
    res.status(200).json({
      resStatus: res.status,
      Users: AllUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// For Searching Users
const searchUser = async (req, res) => {
  try {
    const user = req.body.user;
    res.status(200).json({
      resStatus: res.status,
      Users: await Users.find({ user: user }),
    });
  } catch (error) {
    res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = {
  createUser,
  getallUsers,
  removeUser,
  updateUser,
  searchUser,
  loginUser,
};
