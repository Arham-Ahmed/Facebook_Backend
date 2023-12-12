const response = ({ res, statusCode, successBoolean, message, payload }) => {
  return res.status(statusCode)?.json({
    sucess: successBoolean,
    message: message,
    payload,
  });
};

module.exports = response;
