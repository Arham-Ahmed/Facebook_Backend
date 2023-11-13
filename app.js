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
const { rateLimit } = require("express-rate-limit");

const app = express();
const PORT = process?.env?.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.0.116:3000", "*"],
    credentials: true,
  })
);
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 300, //Limit
  headers: true,
  message: `Your can do 350 request per min`,
});

app.use(limiter);

app.get("/", (req, res) => {
  res.send("Welcome to Todo app using Node js");
});
app.use("/todos", isauthenticated, router);
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
