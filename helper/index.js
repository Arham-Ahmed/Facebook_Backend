const firebaseImageDelete = require("./firebaseHelper/firebaseDeleter");
const firebaseUploder = require("./firebaseHelper/firebaseUploader");
const imageMimetype = require("./imageHelper/imageMimeType");
const imagePathMaker = require("./imageHelper/imagePathMaker");
const imageCompressor = require("./imageHelper/imageCompressor");

module.exports = {
  firebaseImageDelete,
  firebaseUploder,
  imageMimetype,
  imagePathMaker,
  imageCompressor,
};
