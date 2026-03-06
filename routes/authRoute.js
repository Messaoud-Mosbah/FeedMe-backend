const express = require("express");
const crypto = require("crypto"); // تأكد من وجود هذا السطر في الأعلى
const router = express.Router();

// استيراد الخدمات والمحققين (Validators)
const {
setPassword,
  signup,
signin,
logout,
  send_verification_email,
  protect, // دالة الحماية ضرورية جداً هنا
forgetPassword,
  verifyEmail,
  updateUserProfile,
  updateRestaurantProfile,
  allwodTo,
} = require("../services/authService");


const {
  signupValidator,
  loginValidator,
  updateUserRoleValidtor,
  ProfileBasicValidator,
  validatePassword,
  PreferencesValidator,
  RestaurantBasicValidator,
  RestaurantLocationValidator,
  RestaurantDetailsValidator,
  RestaurantServicesValidator,
} = require("../utils/validators/authValidators");


router.post("/sign-up", signupValidator, signup);
router.get("/verify-email-token/:token", verifyEmail);
router.post("/send-verification-email",send_verification_email);

router.post("/log-out", protect, logout);

router.post("/sign-in", loginValidator, signin);

router.post("/forget-password", forgetPassword); 
// router.get("/verify-reset-password-token", resetPassword); // verify the token 
// router.post("/reset-password", validatePassword, setPassword); // set the password

router.patch(
  "/user/basic",
  protect,
  allwodTo("USER", "ADMIN"),
  ProfileBasicValidator,
  updateUserProfile,
);
router.patch(
  "/user/preferences",
  protect,
  allwodTo("USER", "ADMIN"),
  PreferencesValidator,
  updateUserProfile,
);

// مطاعم
router.patch(
  "/restaurant/basic",
  protect,
  allwodTo("RESTAURANT", "ADMIN"),
  RestaurantBasicValidator,
  updateRestaurantProfile,
);
router.patch(
  "/restaurant/location",
  protect,
  allwodTo("RESTAURANT", "ADMIN"),
  RestaurantLocationValidator,
  updateRestaurantProfile,
);
router.put(
  "/restaurant/details",
  protect,
  allwodTo("RESTAURANT", "ADMIN"),
  RestaurantDetailsValidator,
  updateRestaurantProfile,
);
router.put(
  "/restaurant/services",
  protect,
  allwodTo("RESTAURANT", "ADMIN"),
  RestaurantServicesValidator,
  updateRestaurantProfile,
);

module.exports = router;
