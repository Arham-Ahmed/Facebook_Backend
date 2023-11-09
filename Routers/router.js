const express = require("express");
const {
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
} = require("../Controllers/controller");
const multer = require("multer");
const { isauthenticated } = require("../Middlewares/auth");
const router = express.Router();

router
  .get("/", isauthenticated, getallTodo)
  .get("/search", isauthenticated, searchTodo)
  .post("/add", isauthenticated, addTodo)
  .delete("/remove/:id", isauthenticated, removeTodo)
  .put("/update", isauthenticated, updateTodo);

module.exports = { router };
