require("dotenv").config();
const express = require("express");
const connectDb = require("./Config/dbConfig/connect");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");

const path = require("path");
// const multer = require("multer");

// Routes
const { router } = require("./Routers/router");
const { userRouter } = require("./Routers/userRouter");
const { isauthenticated } = require("./Middlewares/auth");
const { postRouter } = require("./Routers/postRouter");
// const { rateLimit } = require("express-rate-limit");
// middelware

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
let user = 1;
io.on("connection", (socket) => {
  // socket.emit("connection", socket.id, "connected to server");
  // socket.emit("connection", user++, {
  //   message: `total user ${user}`,
  // });
  socket.on("join", function (data) {});

  socket.on("disconnect", (message) => {
    console.log("Client disconnected with id: ", message);
  });
});

const PORT = process?.env?.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3003",
      "http://192.168.0.228:3000",
      "http://192.168.0.130:3000",
      "http://192.168.0.71:3000",
      "http://192.168.0.130:3003",
      "http://192.168.0.214:3000",
      "*",
    ],
    credentials: true,
  })
);

// app.use(cookieParser());

// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minutes
//   limit: 400, //Limit
//   headers: true,
//   message: `Your can do 350 request per min`,
// });

// app.use(limiter);

// Api Call

app.get("/", (req, res) => {
  res.send("Welcome to Our Faceback app using MERN");
});
app.use("/todos", isauthenticated, router);
app.use("/users", userRouter);
app.use("/posts", isauthenticated, postRouter);
app.use(express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "public/Postimages")));

// Server Function

httpServer.listen(PORT, () => {
  console.log(
    "\x1b[39m",
    `Listening on port`,
    "\x1b[36m",
    // "\x1b[1m",
    // "\x1b[4m",
    // "\x1b[5m",
    "http://localhost:5000",
    "\x1b[0m"
  );
});
connectDb(process.env.MONGODB_URI)
  .then(() => console.log("\x1b[32m", "Connected Sucessfully", "\x1b[39m"))
  .catch((e) =>
    console.log(
      "\x1b[31m",
      "Connection Failed",
      "\x1b[39m",
      "\n",
      "\x1b[31m",
      "Error : ",
      "\x1b[39m",
      e
    )
  );
