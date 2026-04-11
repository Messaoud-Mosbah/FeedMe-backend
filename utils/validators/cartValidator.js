const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addToCartValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isUUID(4)
    .withMessage("Invalid product ID"),

  validatorMiddleware,
];

exports.updateCartItemValidator = [
  param("itemId").isUUID(4).withMessage("Invalid cart item ID"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  validatorMiddleware,
];

exports.cartItemIdValidator = [
  param("itemId").isUUID(4).withMessage("Invalid cart item ID"),
  validatorMiddleware,
];
