const response = (res, statusCode, sucessBoolean, Message, payload) => {
  return res.status(statusCode)?.json({
    sucess: sucessBoolean,
    message: Message,
    payload,
  });
};

module.exports = { response };
