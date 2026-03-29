
const Joi = require("joi")
const ApiError = require("../apiError")
const asyncHandler = require('express-async-handler')

// ── CREATE POST VALIDATOR ─────────────────
const validateCreatePost = asyncHandler(async (req, res, next) => {
  const images = req.files?.images || [] //get all images
  const video  = req.files?.video?.[0]

  // erreur si images + video ensemble
  if (images.length > 0 && video) {
    throw new ApiError('Cannot upload images and video together', 400)
  }



  // schema avec caption obligatoire
  const schema = Joi.object({
    caption: Joi.string().max(255).required(),
    contentType: Joi.string()
      .valid('RECIPE', 'DISH')
      .optional(),
     mediaType: Joi.string()
     .valid('IMAGE', 'VIDEO', 'NONE')
    //  .required(),
  })


  
 

  //  Valider le body et vérifier les erreurs
  const { error } = schema.validate(req.body)
  if (error) throw new ApiError(error.details[0].message, 400)


  next()
 })


// ── GET all POSTS VALIDATOR ((feed))─────────────────
//GET /posts?cursor=post5.createdAt&limit=3
const validateGetPosts = asyncHandler(async (req, res, next) => {
  const schema = Joi.object({
    cursor: Joi.date().iso().optional(), // cursor = last post createdAt
    limit: Joi.number().integer().min(1).max(50).optional(), // max 50 posts per request
  });

  const { error } = schema.validate(req.query);
  if (error) throw new ApiError(error.details[0].message, 400);

  next();
});

// ── GET ONE POST VALIDATOR─────────────────
const validateidpost = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
        id: Joi.string().uuid().required() //verifier que postId est un uuid et qu'il est present dans req.params
    });

    const { error } = schema.validate(req.params); //call joi to validate req.params (postId)
    if (error) throw new ApiError(error.details[0].message, 400);

    next();
});



// ── UPDATE POST VALIDATOR ─────────────────
const validateUpdatePost = asyncHandler(async (req, res, next) => {
  const images = req.files?.images || [] //get all images
  const video  = req.files?.video?.[0]

  // erreur si images + video ensemble
  if (images.length > 0 && video) {
    throw new ApiError('Cannot upload images and video together', 400)
  }



  // schema avec caption obligatoire
  const schema = Joi.object({
    caption: Joi.string().max(255).optional(),
    contentType: Joi.string()
      .valid('RECIPE', 'DISH', 'POST', 'REEL')
      .optional(),
    //  mediaType: Joi.string()
    // .valid('IMAGE', 'VIDEO', 'NONE')
    //  .required(),
  })


  
 

  //  Valider le body et vérifier les erreurs
  const { error } = schema.validate(req.body)
  if (error) throw new ApiError(error.details[0].message, 400)


  next()
 })





module.exports = { validateCreatePost
  , validateUpdatePost
  ,validateGetPosts,
  validateidpost  
 }