const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const ALLOWED_CATEGORIES = [
  "vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];

const categoryValidator = (isRequired) => {
  const chain = check("category");
  if (isRequired) chain.notEmpty().withMessage("Category is required");
  else chain.optional();

  return chain.custom((value) => {
    let parsed = value;
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error("Category must be a valid JSON array");
      }
    }
    if (!Array.isArray(parsed) || parsed.length === 0)
      throw new Error("Category must be a non-empty array");
    const isValid = parsed.every((cat) => ALLOWED_CATEGORIES.includes(cat));
    if (!isValid)
      throw new Error(
        `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}`,
      );
    return true;
  });
};

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  check("description").notEmpty().withMessage("Description is required"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  categoryValidator(true),

  check("image").custom((value, { req }) => {
    if (!req.files?.image?.[0]) throw new Error("Product image is required");
    return true;
  }),

  validatorMiddleware,
];

exports.updateProductValidator = [
  param("id").isUUID(4).withMessage("Invalid product ID"),

  check("title")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  check("description").optional(),

  check("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  categoryValidator(false),

  validatorMiddleware,
];

exports.productIdValidator = [
  param("id").isUUID(4).withMessage("Invalid product ID"),
  validatorMiddleware,
];
