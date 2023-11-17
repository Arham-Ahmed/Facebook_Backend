const express = require("express");
const {
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
} = require("../Controllers/controller");
const { isauthenticated } = require("../Middlewares/auth");
const { multi } = require("../Middlewares/multermiddleware/multiupload");

const router = express.Router();

router.use(multi);
router
  .get("/", isauthenticated, getallTodo)
  .get("/search", isauthenticated, searchTodo)
  .post("/add", isauthenticated, addTodo)
  .delete("/remove/:id", isauthenticated, removeTodo)
  .put("/update", isauthenticated, updateTodo);

module.exports = { router };
