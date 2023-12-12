const validateUserPresence = (user) => {
  if (!user || user?.isDeleted) {
    let error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }
};

module.exports = validateUserPresence;
