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
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const updateProfileValidator = [
  check("role")
    .notEmpty().withMessage("Account type (role) is required to complete profile.")
    .isIn(["USER", "RESTAURANT"]).withMessage("Invalid role type. Must be USER or RESTAURANT."),

  // --- USER Section ---
  check("profile.userBasicInformation.fullName")
    .if((value, { req }) => req.body.role === "USER")
    .notEmpty().withMessage("Full name is required for user profile."),

  check("profile.userBasicInformation.phoneNumber")
    .if((value, { req }) => req.body.role === "USER" && req.body.userBasicInformation?.phoneNumber)
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/).withMessage("Please provide a valid Algerian phone number (e.g., 0550123456)."),

  check("profile.userUsagePreferences.usageGoal")
    .if((value, { req }) => req.body.role === "USER")
    .optional({ checkFalsy: true }) 
    .isArray().withMessage("Usage goal must be an array."),

  check("profile.userUsagePreferences.kitchenCategory")
    .if((value, { req }) => req.body.role === "USER")
    .optional({ checkFalsy: true }) 
    .isArray().withMessage("Kitchen category must be an array.")
    .custom((value) => {
      if (value && value.length > 0) {
        const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
        if (!isValid) throw new Error("One or more selected categories are invalid.");
      }
      return true;
    }),

  // --- RESTAURANT Section ---
  check("profile.restaurantBasicInformation.restaurantName")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .notEmpty().withMessage("Restaurant name is mandatory."),

  check("profile.restaurantLocationAndContact.city")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .notEmpty().withMessage("City location is required."),

  check("profile.restaurantDetails.kitchenCategory")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .isArray({ min: 1 }).withMessage("Select at least one kitchen category.")
    .custom((value) => {
      const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
      if (!isValid) throw new Error(`Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`);
      return true;
    }),
// --- Opening Hours (Optional) ---
  check("profile.restaurantDetails.openingHours")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .optional({ checkFalsy: true }) 
    .isArray().withMessage("Opening hours must be an array.")
    .custom((value) => {
      if (value && value.length > 0) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 
        value.forEach((item, index) => {
          if (!item.day || !DAYS_OF_WEEK.includes(item.day)) {
            throw new Error(`Item at index ${index + 1}: Invalid day name.`);
          }
          if (!item.from || !item.to) {
            throw new Error(`Day ${item.day}: 'from' and 'to' times are required.`);
          }
          if (!timeRegex.test(item.from) || !timeRegex.test(item.to)) {
            throw new Error(`Day ${item.day}: Invalid time format (HH:mm).`);
          }
        });
      }
      return true;
    }),

  check("profile.restaurantServices")
    .if((value, { req }) => req.body.role === "RESTAURANT")
    .optional({ checkFalsy: true }) 
    .custom((value) => {
      if (value && Object.keys(value).length > 0) {
        const allowedKeys = ["dineIn", "takeaway", "delivery", "reservation", "parkAvailability"];
        Object.keys(value).forEach((key) => {
          if (!allowedKeys.includes(key)) throw new Error(`Invalid service key: ${key}`);
          if (!["YES", "NO"].includes(value[key])) throw new Error(`Service '${key}' must be YES or NO.`);
        });
      }
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