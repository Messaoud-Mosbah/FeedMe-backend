const { check, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.placeOrderValidator = [
  check("restaurantProfileId")
    .notEmpty()
    .withMessage("Restaurant ID is required")
    .isUUID(4)
    .withMessage("Invalid restaurant ID"),

  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  param("id").isUUID(4).withMessage("Invalid order ID"),
  validatorMiddleware,
];
