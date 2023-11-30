const multer = require("multer");
const upload = () => {
  return multer({ storage: multer.memoryStorage() });
};

module.exports = { upload };
