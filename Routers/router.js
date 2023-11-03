const express = require("express");
const {
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
} = require("../Controllers/controller");
const router = express.Router();

router
  .get("/", getallTodo)
  .get("/search", searchTodo)
  .post("/add", addTodo)
  .delete("/remove", removeTodo)
  .put("/update", updateTodo);

module.exports = { router };
