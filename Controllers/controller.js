const todosModel = require("../Models/Todo");
const userModel = require("../Models/User");
const { response } = require("../utils/response");

const addTodo = async (req, res) => {
  try {
    const todo = req?.body;
    const newTodo = new todosModel(todo);
    const user = await userModel?.findOne(req.user?._id);
    user?.todos?.push(newTodo);
    newTodo.owner = user?._id;
    await newTodo?.save();
    await user?.save();
    return response(res, 201, "Data submitted");
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
const removeTodo = async (req, res) => {
  try {
    const todo_iD = req?.params?.id;
    await todosModel.findOneAndDelete({ _id: todo_iD });
    const user = await userModel?.findById(req.user?._id);
    const todoIndex = user?.todos?.indexOf(todo_iD);
    user?.todos?.splice(todoIndex, 1);
    await user?.save();
    return response(res, 200, true, "Deleted sucessfully");
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
const updateTodo = async (req, res) => {
  try {
    const todo_id = req?.body?.id;
    const { todo, done } = req?.body;
    const updateTodo = await todosModel.findOneAndUpdate(
      { _id: todo_id },
      { todo: todo, done: done }
    );
    if (!updateTodo)
      return response(
        res,
        500,
        false,
        `Internal server error on controller line no 51`
      );
    return response(res, 200, true, "Todo update sucessfully");
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
const getallTodo = async (req, res) => {
  try {
    const user = await userModel?.findOne(req.user?._id)?.populate("todos");
    if (!user)
      return res
        ?.status(404)
        ?.json({ sucess: false, message: "userModel Not Found" });
    const TodosData = user?.todos;
    return response(res, 200, true, "All todos are", TodosData);
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
const searchTodo = async (req, res) => {
  try {
    const todo = req?.body?.todo;
    const todos = await todosModel.find({ todo: todo });
    return response(res, 200, true, "your todos", todos);
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
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
};
