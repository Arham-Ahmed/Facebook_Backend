const jwt = require("jsonwebtoken");
const jwtGenrator = (user) => {
  try {
    return jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
      expiresIn: "90d",
    });
  } catch (e) {
    let err = new Error(e.message);
    err.statusCode = 500;
    throw err;
  }
};

module.exports = jwtGenrator;
