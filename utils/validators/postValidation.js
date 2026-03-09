const Joi = require('joi')

const Joi = require("joi");

const PostValidator = Joi.object({
  caption: Joi.string().max(255).required(),
  //required = not null
  contentType: Joi.string()
    .valid("RECIPE", "DISH", "POST", "REEL")
    .optional(),

  mediaType: Joi.string()
    .valid("IMAGE", "VIDEO", "NONE")
    .optional(),

  video: Joi.string().max(255).optional(),
});


const UpdatePostValidator = Joi.object({ //pour update post, on peut changer que le caption et isPinned
  caption: Joi.string().max(500).optional(),
  isPinned: Joi.boolean().optional(),
})

module.exports = { PostValidator, UpdatePostValidator }