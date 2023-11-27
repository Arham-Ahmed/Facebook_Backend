const response = async (res, statusCode, sucessBoolean, Message, payload) => {
  // try {
  return await res.status(statusCode)?.json({
    sucess: sucessBoolean,
    message: Message,
    User: payload,
  });
  // } catch (error) {
  //   return await res.status(statusCode)?.json({
  //     sucess: sucessBoolean,
  //     message: Message,
  //   });
  // }
};

module.exports = { response };
