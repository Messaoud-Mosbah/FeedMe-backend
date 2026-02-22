const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  getUserByIdentifier,
  updateUserMain,
  updateUserProfile,
  updateRestaurantProfile,
  deleteUser,
  changeUserPassword,
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  getUserByIdentifierValidator,
  changeUserPasswordValidator,
  ProfileBasicValidator,
  PreferencesValidator,
  RestaurantBasicValidator,
  RestaurantLocationValidator,
  RestaurantDetailsValidator,
  RestaurantServicesValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

//-----AUTH & BASIC CRUD

router.post("/", ...createUserValidator, createUser);
router.get("/", getAllUsers);
router.get("/user", ...getUserByIdentifierValidator, getUserByIdentifier);
router.put(
  "/changeUserPassword/:id",
  ...changeUserPasswordValidator,
  changeUserPassword,
);
router.get("/:id", ...getUserValidator, getUser);
router.put("/:id", ...updateUserValidator, updateUserMain);
router.delete("/:id", ...deleteUserValidator, deleteUser);

//----- NORMAL USER PROFILE

// Page 1 – Basic Info
router.put("/profile/basic/:id", ...ProfileBasicValidator, updateUserProfile);
// Page 2 – Preferences (Food + Usage)
router.put(
  "/profile/preferences/:id",
  ...PreferencesValidator,
  updateUserProfile,
);

//------- RESTAURANT PROFILE
// Page 1 – Basic Info
router.put(
  "/restaurant/basic/:id",
  ...RestaurantBasicValidator,
  updateRestaurantProfile,
);

// Page 2 – Location Info
router.put(
  "/restaurant/location/:id",
  ...RestaurantLocationValidator,
  updateRestaurantProfile,
);
// Page 3 – Details
router.put(
  "/restaurant/details/:id",
  ...RestaurantDetailsValidator,
  updateRestaurantProfile,
);

// Page 4 – Services
router.put(
  "/restaurant/services/:id",
  ...RestaurantServicesValidator,
  updateRestaurantProfile,
);

module.exports = router;
