const mongoose = require("mongoose");

const ConnectDb = (uri) => {
  console.log("\x1b[33m", "Connecting to DataBase");
  return mongoose.connect("mongodb://localhost:27017/facebook");
};

module.exports = ConnectDb;
