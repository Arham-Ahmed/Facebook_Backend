const jwt = require("jsonwebtoken");

const jwtVerifier = (databaseToken) => {
  try {
    return jwt?.verify(databaseToken?.token, process.env.JWTSCERET);
  } catch (e) {
    let err = new Error(`Unauthorized ! ${e.message}`);
    err.statusCode = 401;
    throw err;
  }
};

module.exports = jwtVerifier;
