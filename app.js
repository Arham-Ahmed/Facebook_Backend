require("dotenv").config({ path: "./Secrets/.env" });
const express = require("express");
const multer = require("multer");
const upload = multer();
const ConnectDb = require("./db/connect");
const { router } = require("./Routers/router");
const { userRouter } = require("./Routers/userRouter");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { isauthenticated } = require("./Middlewares/auth");
const { postRouter } = require("./Routers/postRouter");
const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: ["http://localhost:3000", "*"],
  credentials: true,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use(cors(corsOptions));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to Todo app using Node js");
});
app.use("/todos", router);
app.use("/users", userRouter);
app.use("/posts", isauthenticated, postRouter);

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
