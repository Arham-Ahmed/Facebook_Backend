const mongoose = require("mongoose");

const ConnectDb = (uri) => {
  console.log("Connecting to DataBase");
  return mongoose.connect(uri);
};

module.exports = ConnectDb;
