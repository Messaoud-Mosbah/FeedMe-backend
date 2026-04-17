const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.placeOrderValidator = [
  check("cartItemId")
    .notEmpty()
    .withMessage("Cart item ID is required")
    .isUUID(4)
    .withMessage("Invalid cart item ID"),
  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  param("id").isUUID(4).withMessage("Invalid order ID"),
  validatorMiddleware,
];
