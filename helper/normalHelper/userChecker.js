const userChecker = (user) => {
  if (!user || user?.isDelete) {
    let err = new Error("User not found");
    err.statusCode = 401;
    throw err;
  }
};

module.exports = userChecker;
