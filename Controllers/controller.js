const Todos = require("../Models/mode_schema");
const addTodo = async (req, res) => {
  const todo = req.body;
  try {
    const newTodo = new Todos(todo);
    await newTodo.save();
    res.status(201).json({
      resStatus: res.status,
      message: "Data Submitied",
    });
  } catch (e) {
    res.send({ error: e.message });
  }
};
const removeTodo = async (req, res) => {
  const todo_iD = req.body;
  try {
    await Todos.findOneAndDelete({ _id: todo_iD });
    res.status(200).json({
      resStatus: res.status,
      message: "Deleted SucessFully",
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
const updateTodo = async (req, res) => {
  const todo_id = req.body._id;
  const todo = req.body;
  try {
    await Todos.findOneAndUpdate({ _id: todo_id }, todo);
    res
      .status(200)
      .json({ resStatus: res.status, message: "Done SucessFully" });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};
const getallTodo = async (req, res) => {
  try {
    TodosData = (await Todos.find({})).reverse();
    res.status(200).json({
      resStatus: res.status,
      Todos: TodosData,
    });
  } catch (error) {
    res.status(500).json({
      message: e.message,
    });
  }
};
const searchTodo = async (req, res) => {
  try {
    const todo = req.body.todo;
    res.status(200).json({
      resStatus: res.status,
      Todos: await Todos.find({ todo: todo }),
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
