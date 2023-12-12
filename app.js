require("dotenv").config();
const express = require("express");
const connectDb = require("./Config/dbConfig/connect");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io"); /// Future use

const path = require("path");

// Routes
const userRouter = require("./Routers/userRouter");
const postRouter = require("./Routers/postRouter");

//Middlewares
const { isauthenticated, errorHandler } = require("./Middlewares/index");
// const { rateLimit } = require("express-rate-limit");
// middelware

const app = express();
const httpServer = createServer(app);

// socket io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  io.emit("connection", `${socket.id} connected to server`);
  socket.on("join", function (data) {
    console.log(data);
  });

  socket.on("disconnect", (message) => {
    console.log("Client disconnected with id: ", message);
  });
});

const PORT = process?.env?.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Api Call

app.get("/", (req, res) => {
  res.send("Welcome to Our Faceback app using MERN");
});
app.use("/users", userRouter);
app.use("/posts", isauthenticated, postRouter);
app.use(express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "public/Postimages")));
app.use(errorHandler);
// app.use(require("express-status-monitor")()); // For mointer the memory usage

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
