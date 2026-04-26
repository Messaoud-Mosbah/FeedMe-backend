const { query, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");



exports.allProductsValidators = [
  query("cursor")
    .optional()
    .isISO8601()
    .withMessage("cursor must be a valid ISO date"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be a number between 1 and 50"),

 

 
  validatorMiddleware,
];
