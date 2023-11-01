require("dotenv").config();
const express = require("express");
const ConnectDb = require("./db/connect");
const { router } = require("./Routers/router");

const app = express();

const PORT = process.env.PORT || 5000;

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Todo app using Node js");
});
app.use("/todos", router);

const start = async (url) => {
  try {
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
    await ConnectDb(process.env.MONGODB_URI);
    // console.log("Connected");
    if (ConnectDb) {
      console.log("Connected");
    } else {
      console.log("not Connected");
    }
  } catch (error) {
    console.log(error);
  }
};
start();
