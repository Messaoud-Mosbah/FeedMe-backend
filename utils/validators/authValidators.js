const { check, body, param } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require("../../models/userModel");

const signupValidator = [
  check("userName")
    .trim()
    .notEmpty().withMessage("User name is required")
    .isLength({ min: 6 }).withMessage("User name is too short (min 6)") // عدلتها لتطابق الموديل (6-18)
    .isLength({ max: 18 }).withMessage("User name is too long (max 18)")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers and underscores")
    .custom(async (val) => {
      // التعديل: استخدام where في Sequelize
      const user = await User.findOne({ where: { userName: val } }); 
      if (user) throw new Error("Username already exists");
      return true;
    }),

  check("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .custom(async (val) => {
      // التعديل: استخدام where في Sequelize
      const user = await User.findOne({ where: { email: val } });
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

  validatorMiddleware
];

const loginValidator = [
  check("identity")
    .notEmpty().withMessage("Email or Username is required"),

  check("password")
    .notEmpty().withMessage("Password is required"),

  validatorMiddleware
];

const updateUserRoleValidtor = [
  check("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["user", "resturant"]).withMessage("Invalid role type"),
  validatorMiddleware,
];

module.exports = { signupValidator, loginValidator, updateUserRoleValidtor };