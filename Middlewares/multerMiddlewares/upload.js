const multer = require("multer");
const response = require("../../utils/response");
const storage = multer.memoryStorage();
const upload = (fields) => {
  return (req, res, next) => {
    multer({ storage: storage }).fields(
      fields?.map((fieldName) => ({
        name: fieldName.name,
        maxCount: fieldName.maxcount,
      }))
    )(req, res, (error) => {
      if (error) {
        return response({
          res: res,
          statusCode: 413,
          sucessBoolean: false,
          message: "MulterError limit exceed",
          payload: error,
        });
      } else {
        next();
      }
    });
  };
};

module.exports = upload;
