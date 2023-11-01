const Todos = require("../Models/mode_schema");
const addTodo = async (req, res) => {
  const todo = req.body;
  try {
    const newTodo = new Todos(todo);
    await newTodo.save();
    res.send({ message: "Data Submitied" });
  } catch (e) {
    res.send({ error: e.message });
  }
};
const removeTodo = async (req, res) => {
  const todo_iD = req.body;
  console.log(todo_iD);
  try {
    await Todos.findOneAndDelete({ _id: todo_iD });

    res.send({ message: "Deleted SucessFully" });
  } catch (e) {
    res.send({ error: e.message });
  }
};
const updateTodo = async (req, res) => {
  const todo = req.body.todo;
  const todo_id = req.body._id;
  const done = req.body.done;
  console.log(req.body._id);
  try {
    await Todos.findOneAndUpdate(
      { _id: todo_id },
      { todo: todo },
      { done: done }
    );
    // await Todos.findOneAndUpdate({ _id: todo_id }, { todo });

    res.send({ message: "Done SucessFully" });
  } catch (e) {
    res.send({ error: e.message });
  }
};
const getallTodo = async (req, res) => {
  res.status(200).json({
    res: res.status,
    Todos: await Todos.find({}),
    nbHits: Todos.length,
  });
};
const searchTodo = async (req, res) => {
  const todo = req.body.todo;
  res.status(200).json({
    res: res.status,
    Todos: await Todos.find({ todo: todo }),
    nbHits: Todos.length,
  });
};

module.exports = {
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
};
