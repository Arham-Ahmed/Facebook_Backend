const mongoose = require("mongoose");

const ConnectDb = (uri) => {
  console.log("Connecting to DataBase");
  return mongoose.connect("mongodb://localhost:27017/facebook");
};

module.exports = ConnectDb;
