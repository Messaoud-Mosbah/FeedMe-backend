

const { check, param } = require("express-validator");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// 1. Create User Validator
exports.createUserValidator = [
  check("userName")
    .trim()
    .notEmpty().withMessage("User name is required")
    .isLength({ min: 6 }).withMessage("User name is too short (min 6)") // تطابق الموديل
    .isLength({ max: 18 }).withMessage("User name is too long (max 18)")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (val) => {
      const user = await User.findOne({ where: { userName: val } }); // استخدام where
      if (user) throw new Error("Username already exists");
      return true;
    }),

  check("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(async (val) => {
      const user = await User.findOne({ where: { email: val } }); // استخدام where
      if (user) throw new Error("Email already registered");
      return true;
    }),

  check("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .isLength({ max: 18 }).withMessage("Password must be at most 18 characters"),

  check("passwordConfirm")
    .notEmpty().withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  check("role")
    .optional()
    .isIn(["user", "resturant", "admin"]).withMessage("Invalid role type"),

  validatorMiddleware,
];

// 2. Update User Validator
exports.updateUserValidator = [
  // التغيير: استخدام isInt بدلاً من isMongoId
  param("id").isInt().withMessage("Invalid user ID format (must be integer)"),

  check("userName")
    .optional()
    .trim()
    .isLength({ min: 6 }).withMessage("User name is too short")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ where: { userName: val } });
      // التغيير: استخدام id بدلاً من _id
      if (user && user.id.toString() !== req.params.id) {
        throw new Error("Username already in use by another user");
      }
      return true;
    }),

  check("email")
    .optional()
    .isEmail().withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ where: { email: val } });
      if (user && user.id.toString() !== req.params.id) {
        throw new Error("Email already in use by another user");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),
  check("currentPassword")
    .notEmpty().withMessage("Current password is required"),
  check("password")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password too short")
    .isLength({ max: 18 }).withMessage("Password too long"),

  check("passwordConfirm")
    .notEmpty().withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  validatorMiddleware,
];

// 3. Get/Delete User Validator
exports.getUserValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),
  validatorMiddleware,
];

exports.getUserByIdentifierValidator = [
  check("identifier")
    .notEmpty()
    .withMessage("user name or email are required"),
  validatorMiddleware,
];