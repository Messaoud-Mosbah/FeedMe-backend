const { query, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const ALLOWED_CATEGORIES = [
  "vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];

const ALLOWED_SORTS = [
  "price_desc",
  "price_asc",
  "preparationTime_asc",
  "preparationTime_desc",
];

exports.browseProductsValidator = [
  query("cursor")
    .optional()
    .isISO8601()
    .withMessage("cursor must be a valid ISO date"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be a number between 1 and 50"),

  query("category")
    .optional()
    .custom((value) => {
      let categories = value;

      // parse if it arrived as a JSON string
      if (typeof value === "string") {
        try {
          categories = JSON.parse(value);
        } catch {
          categories = [value]; // single plain string like "Fast Food"
        }
      }

      categories = Array.isArray(categories) ? categories : [categories];

      const invalid = categories.filter(
        (cat) => !ALLOWED_CATEGORIES.includes(cat),
      );
      if (invalid.length > 0)
        throw new Error(`Invalid categories: ${invalid.join(", ")}`);
      return true;
    }),
  query("sort")
    .optional()
    .isIn(ALLOWED_SORTS)
    .withMessage(`Invalid sort. Allowed: ${ALLOWED_SORTS.join(", ")}`),

  validatorMiddleware,
];
exports.productDetailValidator = [
  param("id").isUUID(4).withMessage("Invalid product ID"),
  validatorMiddleware,
];
