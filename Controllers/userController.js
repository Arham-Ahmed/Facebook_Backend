const Users = require("../Models/user_schema");
const bcryptjs = require("bcryptjs");

// For Creating Users
const createUser = async (req, res) => {
  const user = req.body;
  try {
    const newUser = new Users(user);
    await newUser.save();
    res.status(201).json({
      resStatus: res.status,
      message: "User Created SucessFully ",
      user: newUser,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
// For Loggin Users
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email: email, password: password });
    if (!user) {
      res.status(404).json({
        sucess: false,
        message: "User Dosent Exists",
      });
    }
    // const isMatch = await bcryptjs.compare(password, req.body.password);
    // if (!isMatch) {
    //   res.status(404).json({
    //     sucess: false,
    //     message: "Invalid Credential",
    //   });
    // }
    const token = await Users.genratetoken();
    res.status(200).json({
      sucess: true,
      user: user,
      token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
// For Removing Users
const removeUser = async (req, res) => {
  const user_iD = req.body;
  try {
    await Todos.findOneAndDelete({ _id: user_iD });
    res.status(200).json({
      resStatus: res.status,
      message: "User Deleted SucessFully",
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
// For Updating Users
const updateUser = async (req, res) => {
  const user_id = req.body._id;
  const User = req.body;
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
