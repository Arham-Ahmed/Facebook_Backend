const Joi = require("joi");
const createPostSchema = Joi.object().keys({
  caption: Joi.string().max(150).min(0),
  imageUrl: Joi.string(),
});
module.exports = createPostSchema;
