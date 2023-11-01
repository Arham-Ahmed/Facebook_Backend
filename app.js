require("dotenv").config();
const express = require("express");
// const addTodo =require("./Controllers/controller")
const { router } = require("./Routers/router");

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  try {
    console.log(`Listening on ${PORT}`);
  } catch (er) {
    console.log(er);
  }
});
app.get("/", (req, res) => {
  res.send("Welcome to Todo app using Node js");
});
app.use("/", router);
