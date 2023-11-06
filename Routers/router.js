const express = require("express");
const {
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
} = require("../Controllers/controller");
const multer = require("multer");
const router = express.Router();

router
  .get("/", getallTodo)
  .get("/search", searchTodo)
  .post("/add", addTodo)
  .delete("/remove/:id", removeTodo)
  .put("/update", updateTodo);

module.exports = { router };
