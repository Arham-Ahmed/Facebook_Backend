const addTodo = (req, res) => {
  res.send("add Sucessfully");
};
const removeTodo = (req, res) => {
  res.send("remove Sucessfully");
};

module.exports = { addTodo, removeTodo };
