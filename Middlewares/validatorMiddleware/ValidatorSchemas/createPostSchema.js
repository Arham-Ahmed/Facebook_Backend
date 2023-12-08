const Joi = require("joi");
const createPostSchema = Joi.object().keys({
  caption: Joi.string().optional().max(150),
  imageUrl: Joi.string().optional(),
});
module.exports = createPostSchema;
