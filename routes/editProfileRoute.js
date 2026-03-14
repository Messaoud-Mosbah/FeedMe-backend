const express = require("express");
const router = express.Router();
const { protect } = require("../services/authService");
const {
  editRestaurantProfile,
  editUserProfile,
  changeUserPassword,
  changeUserEmail,
  verifyNewEmail,
  allwodTo,
} = require("../services/editProfile");
const {
  RestaurantProfileValidator,
  UserProfileValidator,
  changePasswordValidator,
  changeEmailValidator,
} = require("../utils/validators/editProfileValidator");

router.patch(
  "/user/edit-profile",
  protect,
  allwodTo("USER"),
  UserProfileValidator,
  editUserProfile,
);
router.patch(
  "/restaurant/edit-profile",
  protect,
  allwodTo("RESTAURANT"),
  RestaurantProfileValidator,
  editRestaurantProfile,
);
router.patch(
  "/change-password",
  protect,
  allwodTo("USER", "RESTAURANT"),
  changePasswordValidator,
  changeUserPassword,
);
router.patch("/change-email", protect, changeEmailValidator, changeUserEmail);
router.get("/verify-new-email/:token", verifyNewEmail);

module.exports = router;
