const response = async (statusCode, sucessBoolean, Message, res, payload) => {
  try {
    return await res.status(statusCode)?.json({
      sucess: sucessBoolean,
      message: Message,
      User: payload,
    });
  } catch (error) {
    return await res.status(statusCode)?.json({
      sucess: false,
      message: error?.message,
    });
  }
};

module.exports = { response };
