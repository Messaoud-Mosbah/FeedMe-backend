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
  check("identity")
    .notEmpty().withMessage("Email or Username is required"),

  check("password")
    .notEmpty().withMessage("Password is required"),

  validatorMiddleware
];

const updateUserRoleValidtor = [
  check("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["USER", "RESTAURANT"]).withMessage("Invalid role type"),
  validatorMiddleware,
];
// ------USER PROFILE VALIDATOR

// BASIC PROFILE VALIDATOR
// ---- CONSTANTS ----
const KITCHEN_TYPES = ["vegetarian", "Fast Food", "Deserts & Sweets", "Seafood", "Healthy Food", "Traditional dishes"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---- USER PROFILE VALIDATORS ----
const ProfileBasicValidator = [
  check("fullName").optional().isString().withMessage("Full name must be a string"),
  check("profilePicture").optional().isURL().withMessage("Profile picture must be a valid URL"),
  check("city").optional().isString().withMessage("City must be a string"),
  check("phone").optional().isMobilePhone("any").withMessage("Invalid phone number"),
  check("bio").optional().isLength({ max: 200 }).withMessage("Bio must not exceed 200 characters"),
  // حذفنا التحقق القديم من socialLinks لأنه سيكون JSON Object وليس Array بسيط
  validatorMiddleware,
];

const PreferencesValidator = [
  check("foodPreferences.favorites").optional().isArray().withMessage("Favorites must be an array"),
  check("foodPreferences.allergies").optional().isArray().withMessage("Allergies must be an array"),
  check("usagePreferences.discoverRestaurants").optional().isBoolean().toBoolean(),
  check("usagePreferences.sharePhotos").optional().isBoolean().toBoolean(),
  check("usagePreferences.writeReviews").optional().isBoolean().toBoolean(),
  check("usagePreferences.followCreators").optional().isBoolean().toBoolean(),
  validatorMiddleware,
];

// ---- RESTAURANT VALIDATORS ----

const RestaurantBasicValidator = [
  check("restaurantName").notEmpty().withMessage("Restaurant name is required"),
  check("businessEmail").optional().isEmail().withMessage("Valid business email is required"),
  check("phoneNumber").notEmpty().isMobilePhone("any").withMessage("Phone number is required"),
  validatorMiddleware,
];

const RestaurantLocationValidator = [
  check("city").notEmpty().withMessage("City is required"),
  check("wilaya").notEmpty().withMessage("Wilaya is required"),
  check("googleMapsLink").optional().isURL().withMessage("Invalid Google Maps link"),
  validatorMiddleware,
];

const RestaurantDetailsValidator = [
  check("kitchenCategories")
    .isArray({ min: 1 })
    .withMessage("At least one kitchen category is required")
    .custom((value) => {
      const isValid = value.every((cat) => KITCHEN_TYPES.includes(cat));
      if (!isValid) throw new Error(`Allowed categories: ${KITCHEN_TYPES.join(", ")}`);
      return true;
    }),
  check("openingHoursFrom").notEmpty().withMessage("Opening time is required"),
  check("openingHoursTo").notEmpty().withMessage("Closing time is required"),
  check("daysOpen")
    .optional()
    .isArray()
    .custom((value) => {
      const isValid = value.every((day) => DAYS_OF_WEEK.includes(day));
      if (!isValid) throw new Error(`Allowed days: ${DAYS_OF_WEEK.join(", ")}`);
      return true;
    }),
  validatorMiddleware,
];

const RestaurantServicesValidator = [
  check("services.dineIn").optional().isBoolean().toBoolean(),
  check("services.takeaway").optional().isBoolean().toBoolean(),
  check("services.delivery").optional().isBoolean().toBoolean(),
  check("services.reservation").optional().isBoolean().toBoolean(),
  validatorMiddleware,
];
const validatePassword = [
  check("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters") // تم التعديل لـ 8
    .isLength({ max: 50 }).withMessage("Password must be at most 50 characters") // تم التعديل لـ 50
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

module.exports = { signupValidator, loginValidator, 
  updateUserRoleValidtor,
  validatePassword,
ProfileBasicValidator,
PreferencesValidator,
RestaurantBasicValidator ,
RestaurantLocationValidator,
RestaurantDetailsValidator,
RestaurantServicesValidator
 };