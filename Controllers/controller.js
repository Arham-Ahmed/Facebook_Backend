const todosModel = require("../Models/Todo");
const userModel = require("../Models/User");
const { response } = require("../utils/response");

const addTodo = async (req, res) => {
  try {
    const todo = req?.body;
    const newTodo = new todosModel(todo);
    const user = await userModel?.findOne(req?.user?._id);
    user?.todos?.push(newTodo);
    newTodo.owner = user?._id;
    await newTodo?.save();
    await user?.save();
    return response(res, 201, "Data submitted");
    res.status(201)?.json({
      resStatus: res.status,
      message: "Data Submitied",
    });
  } catch (e) {
    res.status(500).send({ error: e?.message });
  }
};
const removeTodo = async (req, res) => {
  try {
    const todo_iD = req?.params?.id;
    await todosModel.findOneAndDelete({ _id: todo_iD });
    const user = await userModel?.findById(req?.user?._id);
    const todoIndex = user?.todos?.indexOf(todo_iD);
    user?.todos?.splice(todoIndex, 1);
    await user?.save();
    res.status(200)?.json({
      resStatus: res?.status,
      message: "Deleted SucessFully",
    });
  } catch (e) {
    res.status(500).json({
      message: e?.message,
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
      return res.status(500)?.json({
        success: false,
        message: "Internal server error",
      });
    res.status(200).json({ success: true, message: "Done SucessFully" });
  } catch (e) {
    res.status(500)?.json({
      message: e.message,
    });
  }
};
const getallTodo = async (req, res) => {
  try {
    const user = await userModel?.findOne(req?.user?._id)?.populate("todos");
    if (!user)
      return res
        ?.status(404)
        ?.json({ sucess: false, message: "userModel Not Found" });
    TodosData = user?.todos;
    res.status(200).json({
      success: true,
      Todos: TodosData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const searchTodo = async (req, res) => {
  try {
    const todo = req?.body?.todo;
    res.status(200).json({
      resStatus: res?.status,
      Todos: await todosModel.find({ todo: todo }),
    });
  } catch (error) {
    res.status(500).json({
      message: e.message,
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
