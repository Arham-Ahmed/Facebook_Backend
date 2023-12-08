const  {isValidObjectId}  = require("mongoose");

const idValidator = (id) => {
  return isValidObjectId(id);
};

module.exports = idValidator;
