const Users = require("../Models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../Models/Token");
const { response } = require("../utils/response");
const moment = require("moment");

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
    const user = {
      name: req?.body?.name,
      email: req?.body?.email,
      password: req?.body?.password,
      profile_photo: `http://localhost:5000/${req?.files?.profile_photo[0]?.filename}`,
    };

    const existsuser = await Users?.findOne({ email: user?.email });
    if (!existsuser) {
      const newUser = new Users(user);
      if (!newUser)
        return response(
          500,
          false,
          "Some error occur on creating account",
          res
        );
      await newUser?.save();

      return response(201, true, "User created sucessfully", res, user);
    }

    if (existsuser?.isDelete) {
      const userRplace = await Users?.findOneAndDelete({ email: user?.email });
      const newUser = new Users(user);
      if (!newUser)
        return response(
          500,
          false,
          "Some error occur on creating account",
          res
        );
      await newUser?.save();

      response(200, true, "User created sucessfully", res, userRplace);
    }
    if (!existsuser?.isDelete)
      return response(400, false, "User Already exist", res);
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
    console.log(user?.isDelete);
    if (user?.isDelete !== null)
      return response(400, false, "Can't Find User", res);

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
    if (!token)
      return response(401, false, "Unable To Logout Login First", res);
    const user = await Users?.findById({ _id: req.user?._id });
    if (!user) return response(401, false, "UnAuthorized");
    user.token = user?.token?.filter((elem) => elem !== token);
    await user?.save();
    return res.clearCookie("token").json({
      sucess: true,
      message: "Logout SucessFully",
    });
  } catch (error) {
    return response(500, false, error?.message, res);
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
    return response(500, false, e.message, res);
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

    if (!UpdatedUser) return response(500, false, "Some Error Occured", res);

    UpdatedUser?.profile_photo?.push(
      `http://localhost:5000/${req?.files?.profile_photo[0]?.filename}`
    );
    await UpdatedUser?.save();

    return response(200, true, "Updated sucessfully", res);
  } catch (e) {
    return response(500, false, e?.message, res);
  }
};
///////////////////////////////////////////// For Getting All Users /////////////////////////////////////

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
      return response(404, false, "No user found", res);

    return response(200, true, "allUsers", res, allUsers);
  } catch (error) {
    return response(500, false, error?.message, res);
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
