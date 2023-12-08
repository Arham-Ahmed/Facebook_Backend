const jwt = require("jsonwebtoken");
const jwtGenrator = (user) => {
  return jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
    expiresIn: "90d",
  });
};

module.exports = jwtGenrator;
