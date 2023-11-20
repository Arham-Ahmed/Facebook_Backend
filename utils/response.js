const response = async (statusCode, sucessBoolean, Message, res, payload) => {
  try {
    return await res?.status(statusCode)?.json({
      sucess: sucessBoolean,
      message: Message,
    });
  } catch (error) {
    console.log(error?.message);
  }
};

module.exports = { response };
