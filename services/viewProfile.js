const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { User, UserProfile, RestaurantProfile } = require("../models");

const ALWAYS_EXCLUDE = [
  "password",
  "passwordResetTokenHash",
  "passwordResetExpires",
  "verificationTokenHash",
  "verificationTokenExpires",
];

const PUBLIC_EXTRA_EXCLUDE = [
  "email",
  "passwordChangedAt",
  "isLoggedOut",
  "isVerified",
  "isOnboardingCompleted",
  "status",
  "updatedAt",
  "role",
];

// view ur own profile
exports.getOwnProfile = asyncHandler(async (req, res, next) => {
  const role = req.authenticatedUser.role;
  const profileInclude =
    role === "RESTAURANT" ? RestaurantProfile : UserProfile;

  const user = await User.findByPk(req.authenticatedUser.id, {
    attributes: { exclude: ALWAYS_EXCLUDE },
    include: [profileInclude],
  });

  if (!user) return next(new ApiError("User not found", 404));

  res.status(200).json({
    status: "SUCCESS",
    message: "Profile fetched successfully",
    data: { profile: user },
    errors: null,
  });
});

//voew other's profile
exports.getUserProfileById = asyncHandler(async (req, res, next) => {
  const routeType = req.profileType;

  const profileInclude = {
    model: routeType === "RESTAURANT" ? RestaurantProfile : UserProfile,
    attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
  };

  const user = await User.findByPk(req.params.id, {
    // ✅ whitelist: only fetch what you need + role for the check
    attributes: ["id", "userName", "slug", "createdAt", "role"],
    include: [profileInclude],
  });

  if (!user) return next(new ApiError("User not found", 404));

  if (user.role !== routeType)
    return next(new ApiError("Profile not found", 404));

  // ✅ remove role AFTER the check — one simple delete
  const profile = user.toJSON();
  delete profile.role;

  res.status(200).json({
    status: "SUCCESS",
    message: "Profile fetched successfully",
    data: { profile },
    errors: null,
  });
});
