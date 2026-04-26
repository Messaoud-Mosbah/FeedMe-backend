const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const createCommentValidator = [
  check("text").notEmpty().withMessage("Comment text is required").isLength({ max: 500 }),
  validatorMiddleware
];