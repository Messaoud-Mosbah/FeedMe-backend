const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");

const { User, UserProfile, RestaurantProfile } = require("../models/index");

/* CREATE USER */
exports.createUser = asyncHandler(async (req, res) => {
  const { role } = req.body;

  // Create main User only
  const user = await User.create({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    role: role || "user",
  });

  res.status(201).json({ status: "success", data: user });
});
// GET ALL USERS
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    include: [UserProfile, RestaurantProfile],
  });
  res
    .status(200)
    .json({ results: users.length, status: "success", data: users });
});

// GET SINGLE USER BY ID

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    include: [UserProfile, RestaurantProfile],
  });
  if (!user)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));
  res.status(200).json({ status: "success", data: user });
});

// GET USER BY IDENTIFIER (email or username)
const { Op } = require("sequelize");

exports.getUserByIdentifier = asyncHandler(async (req, res, next) => {
  const { identifier } = req.query;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { userName: identifier }],
    },
    include: [UserProfile, RestaurantProfile],
  });

  if (!user) return next(new ApiError(`No user found for: ${identifier}`, 404));

  res.status(200).json({ status: "success", data: user });
});

//UPDATE USER
exports.updateUserMain = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));

  const { userName, email } = req.body;

  if (userName) user.userName = userName;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({ status: "success", data: user });
});
// UPDATE USER PROFILE
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user || user.role !== "user")
    return next(new ApiError("User profile not found", 404));

  const allowedFields = [
    "fullName",
    "profilePicture",
    "city",
    "phone",
    "bio",
    "socialLinks",
    "foodPreferences",
    "usagePreferences",
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      filteredData[field] = req.body[field];
    }
  });

  let profile = await UserProfile.findOne({
    where: { userId: user.id },
  });

  if (profile) {
    await profile.update(filteredData);
  } else {
    profile = await UserProfile.create({
      userId: user.id,
      ...filteredData,
    });
  }

  res.status(200).json({ status: "success", data: profile });
});
// UPDATE RESTURANT PROFILE
exports.updateRestaurantProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user || user.role !== "restaurant") {
    return next(new ApiError("Restaurant profile not found", 404));
  }

  const allowedFields = [
    "restaurantName",
    "businessEmail",
    "phoneNumber",
    "profilePicture",
    "city",
    "wilaya",
    "street",
    "postalCode",
    "googleMapsLink",
    "kitchenCategories",
    "openingHoursFrom",
    "openingHoursTo",
    "daysOpen",
    "services",
    "businessRegistrationNumber",
    "description",
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) filteredData[field] = req.body[field];
  });

  let profile = await RestaurantProfile.findOne({ where: { userId: user.id } });

  if (profile) {
    await profile.update(filteredData, { fields: Object.keys(filteredData) });
  } else {
    profile = await RestaurantProfile.create({
      userId: user.id,
      ...filteredData,
    });
  }

  res.status(200).json({ status: "success", data: profile });
});
//CHANGE PASSWORD

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));

  const isCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  );
  if (!isCorrect) return next(new ApiError("Current password is wrong", 401));

  user.password = req.body.password;
  user.passwordChangedAt = Date.now();
  await user.save();

  res
    .status(200)
    .json({ status: "success", message: "Password changed successfully" });
});

// DELETE USER
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const deleted = await User.destroy({
    where: { id: req.params.id },
  });

  if (!deleted)
    return next(new ApiError(`No user found for id ${req.params.id}`, 404));

  res
    .status(200)
    .json({ status: "success", message: "User deleted successfully" });
});
