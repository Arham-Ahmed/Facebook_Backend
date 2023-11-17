require("dotenv").config();
const express = require("express");
const ConnectDb = require("./db/connect");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
// const multer = require("multer");

// Routes
const { router } = require("./Routers/router");
const { userRouter } = require("./Routers/userRouter");
const { isauthenticated } = require("./Middlewares/auth");
const { postRouter } = require("./Routers/postRouter");
const { rateLimit } = require("express-rate-limit");

// middelware

const app = express();
const PORT = process?.env?.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.0.228:3000",
      "http://192.168.0.130:3000",
      "http://192.168.0.71:3000",
      "*",
    ],
    credentials: true,
  })
);

// app.use(multer().none());

app.use(cookieParser());
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 400, //Limit
  headers: true,
  message: `Your can do 350 request per min`,
});

// app.use(limiter);

// Api Call
app.get("/", (req, res) => {
  res.send("Welcome to Todo app using Node js");
});
app.use("/todos", isauthenticated, router);
app.use("/users", userRouter);
app.use("/posts", isauthenticated, postRouter);
app.use(express.static(path.join(__dirname, "public/images")));

// Server Function

const start = async (url) => {
  try {
    app.listen(PORT, () => {
      console.log(
        "\x1b[39m",
        `Listening on port`,
        "\x1b[36m",
        // "\x1b[1m",
        // "\x1b[4m",
        "\x1b[5m",
        "http://localhost:5000",
        "\x1b[0m"
      );
    });
    await ConnectDb(process.env.MONGODB_URI);
    // console.log("Connected");
    if (ConnectDb) {
      console.log("\x1b[32m", "Connected");
    } else {
      console.log("\x1b[31m", "not Connected");
    }
  } catch (error) {
    console.log(error);
  }
};
start();
