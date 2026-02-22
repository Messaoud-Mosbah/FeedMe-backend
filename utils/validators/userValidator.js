const { check, param } = require("express-validator");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// CREATE USER VALIDATOR

exports.createUserValidator = [
  check("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 6, max: 18 })
    .withMessage("Username must be 6-18 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom(async (val) => {
      const user = await User.findOne({ where: { userName: val } });
      if (user) throw new Error("Username already exists");
      return true;
    }),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (val) => {
      const user = await User.findOne({ where: { email: val } });
      if (user) throw new Error("Email already registered");
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 18 })
    .withMessage("Password must be 6-18 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password)
        throw new Error("Password confirmation does not match password");
      return true;
    }),

  check("role")
    .optional()
    .isIn(["user", "restaurant", "admin"])
    .withMessage("Invalid role type"),

  validatorMiddleware,
];

// UPDATE USER VALIDATOR

exports.updateUserValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  check("userName")
    .optional()
    .trim()
    .isLength({ min: 6, max: 18 })
    .withMessage("Username must be 6-18 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Invalid username format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ where: { userName: val } });
      if (user && user.id.toString() !== req.params.id)
        throw new Error("Username already in use by another user");
      return true;
    }),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ where: { email: val } });
      if (user && user.id.toString() !== req.params.id)
        throw new Error("Email already in use by another user");
      return true;
    }),

  validatorMiddleware,
];

// CHANGE PASSWORD
exports.changeUserPasswordValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  check("password")
    .notEmpty()
    .isLength({ min: 6, max: 18 })
    .withMessage("New password must be 6-18 characters"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((val, { req }) => {
      if (val !== req.body.password)
        throw new Error("Password confirmation does not match password");
      return true;
    }),

  validatorMiddleware,
];

// GET
exports.getUserValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),
  validatorMiddleware,
];
// DELETE
exports.deleteUserValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),
  validatorMiddleware,
];
// get USER
exports.getUserByIdentifierValidator = [
  check("identifier")
    .notEmpty()
    .isString()
    .withMessage("Username or email is required"),
  validatorMiddleware,
];

// ------USER PROFILE VALIDATOR

// BASIC PROFILE VALIDATOR
exports.ProfileBasicValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  // Make fullName and phone optional to prevent notNull errors on creation
  check("fullName")
    .optional()
    .isString()
    .withMessage("Full name must be a string"),
  check("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL"),
  check("city").optional().isString().withMessage("City must be a string"),
  check("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  check("bio")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Bio must not exceed 200 characters"),
  check("socialLinks") //we should delete it
    .optional()
    .isArray()
    .withMessage("Social links must be an array"),
  check("socialLinks.*")
    .optional()
    .isURL()
    .withMessage("Each social link must be a valid URL"),

  validatorMiddleware,
];

//  PREFERENCES VALIDATOR
exports.PreferencesValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  check("foodPreferences.favorites")
    .optional()
    .isArray()
    .withMessage("Favorites must be an array"),
  check("foodPreferences.allergies")
    .optional()
    .isArray()
    .withMessage("Allergies must be an array"),
  check("usagePreferences.discoverRestaurants")
    .optional()
    .isBoolean()
    .toBoolean(),
  check("usagePreferences.sharePhotos").optional().isBoolean().toBoolean(),
  check("usagePreferences.writeReviews").optional().isBoolean().toBoolean(),
  check("usagePreferences.followCreators").optional().isBoolean().toBoolean(),

  validatorMiddleware,
];

//---- RESTAURANT VALIDATORS

const KITCHEN_TYPES = [
  "vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dishes",
];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

exports.RestaurantBasicValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  // Only basic info
  check("restaurantName").notEmpty().withMessage("Restaurant name is required"),
  check("businessEmail")
    .optional()
    .isEmail()
    .withMessage("Valid business email is required"),
  check("phoneNumber")
    .notEmpty()
    .isMobilePhone()
    .withMessage("Phone number is required"),
  check("profilePicture")
    .optional()
    .isString()
    .withMessage("Profile picture must be a string"),

  validatorMiddleware,
];
exports.RestaurantLocationValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  // Only location info
  check("city").notEmpty().withMessage("City is required"),
  check("wilaya").notEmpty().withMessage("Wilaya is required"),
  check("street").optional().isString().withMessage("Street must be a string"),
  check("postalCode")
    .optional()
    .isNumeric()
    .withMessage("Postal code must be a number"),
  check("googleMapsLink")
    .optional()
    .isURL()
    .withMessage("Invalid Google Maps link"),

  validatorMiddleware,
];
exports.RestaurantDetailsValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  check("kitchenCategories")
    .isArray({ min: 1 })
    .withMessage("Kitchen categories are required")
    .custom((value) => {
      const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
      if (!isValid) {
        throw new Error(
          `Invalid kitchen category. Allowed: ${KITCHEN_TYPES.join(", ")}`,
        );
      }
      return true;
    }),

  check("openingHoursFrom").notEmpty().withMessage("Opening time is required"),
  check("openingHoursTo").notEmpty().withMessage("Closing time is required"),
  check("daysOpen")
    .optional()
    .isArray()
    .withMessage("Days open must be an array")
    .custom((value) => {
      const isValid = value.every((day) => DAYS_OF_WEEK.includes(day));
      if (!isValid) {
        throw new Error(`Invalid day. Allowed: ${DAYS_OF_WEEK.join(", ")}`);
      }
      return true;
    }),

  validatorMiddleware,
];

exports.RestaurantServicesValidator = [
  param("id").isInt().withMessage("Invalid user ID format"),

  check("services.dineIn").notEmpty().isBoolean().toBoolean(),
  check("services.takeaway").notEmpty().isBoolean().toBoolean(),
  check("services.delivery").notEmpty().isBoolean().toBoolean(),
  check("services.reservation").notEmpty().isBoolean().toBoolean(),

  validatorMiddleware,
];
