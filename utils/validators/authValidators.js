const { check, body, param } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require("../../models/userModel");

const signupValidator = [
  check("userName")
    .trim()
    .notEmpty().withMessage("User name is required")
    .isLength({ min: 3 }).withMessage("User name is too short (min 3)") // عدلتها لتطابق الموديل (6-18)
    .isLength({ max: 30 }).withMessage("User name is too long (max 30)")
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage("Username can only contain letters, numbers and underscores")
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
    .isLength({ min: 8 }).withMessage("Password must be at least 6 characters")
    .isLength({ max: 50 }).withMessage("Password must be at most 18 characters")
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~\-=]/).withMessage('Password must contain at least one special character'),
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
  check("identifier")
    .notEmpty().withMessage("Email or Username is required"),

  check("password")
    .notEmpty().withMessage("Password is required"),

  validatorMiddleware
];


// ------USER PROFILE VALIDATOR




const KITCHEN_TYPES = ["vegetarian", "Fast Food", "Deserts & Sweets", "Seafood", "Healthy Food", "Traditional dishes"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const updateProfileValidator = [
  check("role")
    .notEmpty().withMessage("Account type (role) is required to complete profile.")
    .isIn(["USER", "RESTAURANT"]).withMessage("Invalid role type. Must be USER or RESTAURANT."),

  check("basicInformation.fullName")
    .if((value, { req }) => req.body.role === "USER")
    .notEmpty().withMessage("Full name is required for user profile."),

  check("basicInformation.phoneNumber")
    .if((value, { req }) => req.body.role === "USER" && req.body.basicInformation?.phoneNumber)
    .isMobilePhone("any").withMessage("Please provide a valid phone number."),

  check("usagePreferences.usageGoal")
    .if((value, { req }) => req.body.role === "USER")
    .notEmpty().withMessage("Usage goal is required for personalization."),

  check("basicInformation.restaurantName")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .notEmpty().withMessage("Restaurant name is mandatory."),

  check("locationAndContact.city")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .notEmpty().withMessage("City location is required."),

  check("locationAndContact.wilaya")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .notEmpty().withMessage("Wilaya (Province) is required."),

  check("restaurantDetails.kitchenCategories")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .isArray({ min: 1 }).withMessage("Select at least one kitchen category.")
    .custom((value) => {
      const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
      if (!isValid) throw new Error(`Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`);
      return true;
    }),

  check("restaurantDetails.openingHours")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .isArray().withMessage("Opening hours must be provided as an array.")
    .custom((value) => {
      const hours = value[0];
      if (!hours || !hours.openingHoursFrom || !hours.openingHoursTO) {
        throw new Error("Both opening (From) and closing (TO) times are required.");
      }
      if (!Array.isArray(hours.daysOpen) || hours.daysOpen.length === 0) {
        throw new Error("Please select at least one operating day.");
      }
      const isValidDays = hours.daysOpen.every(d => DAYS_OF_WEEK.includes(d));
      if (!isValidDays) throw new Error("One or more selected days are invalid.");
      return true;
    }),

  validatorMiddleware,
];

// @desc    validate  reset password
const validatePassword = [
  check("password")
    .notEmpty().withMessage("Password field cannot be empty.")
    .isLength({ min: 8, max: 50 }).withMessage("Password must be between 8 and 50 characters.")
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit.')
    .matches(/[!@#$%^&*()_+]/).withMessage('Password must include a special character (e.g., @, #, $).'),
  
  check("passwordConfirm")
    .notEmpty().withMessage("Please confirm your password.")
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error("Passwords do not match. Please re-enter.");
      return true;
    }),
  validatorMiddleware
];

module.exports = { 
  signupValidator,
   loginValidator,

  validatePassword,

updateProfileValidator
 };