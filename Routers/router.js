const express = require("express");
const {
  addTodo,
  getallTodo,
  removeTodo,
  updateTodo,
  searchTodo,
} = require("../Controllers/controller");
const router = express.Router();

router.route("/").get(getallTodo);
router.route("/search").get(searchTodo);
router.route("/add").post(addTodo);
router.route("/remove").delete(removeTodo);
router.route("/update").put(updateTodo);

module.exports = { router };
