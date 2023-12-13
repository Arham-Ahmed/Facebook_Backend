const jwt = require("jsonwebtoken");
const jwtGenerator = (user) => {
  return jwt?.sign({ _id: user?._id }, process?.env?.JWTSCERET, {
    expiresIn: "90d",
  });
};

module.exports = jwtGenerator;
