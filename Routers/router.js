const express = require("express");
const { addTodo } = require("../Controllers/controller");
const { removeTodo } = require("../Controllers/controller");
const router = express.Router();

router.route("/").get((req, res) => {
  res.send("somtihung");
});
router.route("/add").get(addTodo);
router.route("/remove").get(removeTodo);

module.exports = { router };
