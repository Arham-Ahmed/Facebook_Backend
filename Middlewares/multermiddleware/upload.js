const multer = require("multer");
const { response } = require("../../utils/response");
const upload = (fieldname, maxcount) => {
  return (req, res, next) => {
    multer({ storage: multer.memoryStorage() }).fields([
      {
        name: fieldname,
        maxCount: maxcount,
      },
    ])(req, res, (error) => {
      if (error) {
        return response({
          res: res,
          statusCode: 500,
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

module.exports = { upload };
