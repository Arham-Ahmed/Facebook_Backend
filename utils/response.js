const response = async (res, statusCode, sucessBoolean, Message, payload) => {
  return await res.status(statusCode)?.json({
    sucess: sucessBoolean,
    message: Message,
    payload,
  });
};

module.exports = { response };
