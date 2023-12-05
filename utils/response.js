const response = ({ res, statusCode, sucessBoolean, message, payload }) => {
  return res.status(statusCode)?.json({
    sucess: sucessBoolean,
    message: message,
    payload,
  });
};

module.exports = { response };
