const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const KITCHEN_TYPES = [
  "vegetarian",
  "Fast Food",
  "Deserts & Sweets",
  "Seafood",
  "Healthy Food",
  "Traditional dish",
];

exports.UserProfileValidator = [
  check("userName")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers, _ and -"),
  check("fullName").optional(),

  check("city").optional(),

  check("phoneNumber")
    .optional()
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/)
    .withMessage(
      "Please provide a valid Algerian phone number (e.g., 0550123456).",
    ),

  check("bio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Bio must not exceed 300 characters."),

  check("profilePicture")
    .optional()
    .isURL()
    .withMessage("Profile picture must be a valid URL."),

  check("usageGoal")
    .optional()
    .isArray()
    .withMessage("Usage goal must be an array."),

  check("kitchenCategory")
    .optional()
    .isArray()
    .withMessage("Kitchen category must be an array.")
    .custom((value) => {
      if (value && value.length > 0) {
        const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
        if (!isValid) {
          throw new Error("One or more kitchen categories are invalid.");
        }
      }
      return true;
    }),

  validatorMiddleware,
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

exports.RestaurantProfileValidator = [
  check("userName")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Username can only contain letters, numbers, _ and -"),
  check("restaurantName").optional(),

  check("businessEmail")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email."),

  check("phoneNumber")
    .optional()
    .matches(/^(0)(5|6|7|2|3|4)\d{8}$/)
    .withMessage("Please provide a valid Algerian phone number."),

  check("restaurantLogoUrl")
    .optional()
    .isURL()
    .withMessage("Restaurant logo must be a valid URL."),

  check("city").optional(),

  check("street").optional(),

  check("postalCode").optional(),

  check("googleMapsLink")
    .optional()
    .isURL()
    .withMessage("Google Maps link must be a valid URL."),

  check("kitchenCategory")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Select at least one kitchen category.")
    .custom((value) => {
      const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
      if (!isValid) {
        throw new Error(
          `Invalid category. Allowed: ${KITCHEN_TYPES.join(", ")}`,
        );
      }
      return true;
    }),

  check("openingHours")
    .optional()
    .isArray()
    .withMessage("Opening hours must be an array.")
    .custom((value) => {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

      value.forEach((item, index) => {
        if (!item.day || !DAYS_OF_WEEK.includes(item.day)) {
          throw new Error(`Item ${index + 1}: Invalid day.`);
        }

        if (!item.from || !item.to) {
          throw new Error(`Day ${item.day}: 'from' and 'to' required.`);
        }

        if (!timeRegex.test(item.from) || !timeRegex.test(item.to)) {
          throw new Error(`Day ${item.day}: Time must be HH:mm.`);
        }
      });

      return true;
    }),

  check("services")
    .optional()
    .custom((value) => {
      const allowedKeys = [
        "dineIn",
        "takeaway",
        "delivery",
        "reservation",
        "parkAvailability",
      ];

      Object.keys(value).forEach((key) => {
        if (!allowedKeys.includes(key)) {
          throw new Error(`Invalid service key: ${key}`);
        }

        if (!["YES", "NO"].includes(value[key])) {
          throw new Error(`Service '${key}' must be YES or NO.`);
        }
      });

      return true;
    }),

  validatorMiddleware,
];

// PASSWORD CHANGE
exports.changePasswordValidator = [
  check("currentPassword").notEmpty().withMessage("Current password required"),

  check("password")
    .notEmpty()
    .withMessage("New password required")
    .isLength({ min: 8 }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Confirm password required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validatorMiddleware,
];

// EMAIL CHANGE
exports.changeEmailValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email"),

  validatorMiddleware,
];
