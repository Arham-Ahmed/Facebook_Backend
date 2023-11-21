const multer = require("multer");
const fs = require("fs");

const fileDestination = (req, file, cb /*callback*/) => {
  if (!fs?.existsSync("public")) {
    fs?.mkdir("public");
  }
  if (!fs?.existsSync("public/images")) {
    fs?.mkdir("public/images");
  }
  cb(null, "public/images");
};
const filename = (req, file, cb) => {
  cb(null, Date?.now() + file?.originalname);
};
const storage = multer?.diskStorage({
  destination: fileDestination,
  filename: filename,
});

const filefilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported File Format"));
  }
};
const imgUpload = multer({
  storage: storage,
  fileFilter: filefilter,
});

module.exports = { imgUpload };
