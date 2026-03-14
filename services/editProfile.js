const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const { User, UserProfile, RestaurantProfile } = require("../models");

// check if the user has the right role before doing anything

exports.allwodTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.authenticatedUser)
      return next(new ApiError("You are not logged in", 401));
    if (!roles.includes(req.authenticatedUser.role))
      return next(
        new ApiError("You are not allowed to access this route", 403),
      );
    next();
  });

//edit user profile
exports.editUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);

  if (req.body.userName !== undefined) {
    user.userName = req.body.userName;
    await user.save();
  }

  let profile = await UserProfile.findOne({ where: { userId } });
  if (!profile) profile = await UserProfile.create({ userId });

  const allowedFields = [
    "fullName",
    "city",
    "phoneNumber",
    "bio",
    "profilePicture",
    "usageGoal",
    "kitchenCategory",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });

  await profile.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "User profile updated successfully",
    data: { userName: user.userName, slug: user.slug, profile },
    errors: null,
  });
});
//edit restaurant profile
exports.editRestaurantProfile = asyncHandler(async (req, res, next) => {
  const userId = req.authenticatedUser.id;
  const user = await User.findByPk(userId);

  if (req.body.userName !== undefined) {
    user.userName = req.body.userName;
    await user.save();
  }

  let profile = await RestaurantProfile.findOne({ where: { userId } });
  if (!profile) profile = await RestaurantProfile.create({ userId });

  const allowedFields = [
    "restaurantName",
    "businessEmail",
    "phoneNumber",
    "restaurantLogoUrl",
    "city",
    "street",
    "wilaya",
    "postalCode",
    "googleMapsLink",
    "kitchenCategory",
    "openingHours",
    "services",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });

  await profile.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Restaurant profile updated successfully",
    data: { userName: user.userName, slug: user.slug, profile },
    errors: null,
  });
});

// change psw
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, password } = req.body;
  const user = await User.findByPk(req.authenticatedUser.id);

  const correct = await bcrypt.compare(currentPassword, user.password);
  if (!correct) return next(new ApiError("Current password is incorrect", 401));

  user.password = password;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Password changed successfully",
    data: null,
    errors: null,
  });
});

// change user email
exports.changeUserEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return next(new ApiError("Email already in use", 400));

  const user = await User.findByPk(req.authenticatedUser.id);
  if (user.email === email)
    return next(new ApiError("This is already your current email", 400));

  const token = jwt.sign(
    { userId: user.id, newEmail: email },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );

  const verificationURL = `${process.env.NGROK_URL}/api/profile/verify-new-email/${token}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; color: #333333;">
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">DZ Community Food</h1>
        </div>
        <div style="padding: 40px 30px;">
            <h2 style="color: #2d3436; margin-top: 0;">Confirm your new email, ${user.userName}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #636e72;">
                You requested to change your email address to <strong>${email}</strong>. Click below to confirm.
            </p>
            <div style="background-color: #fff5f5; border-left: 4px solid #ff7675; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; color: #d63031; font-weight: bold; font-size: 14px;">
                    ⚠️ Important: This link will expire in 10 minutes.
                </p>
            </div>
            <div style="text-align: center; margin: 35px 0;">
                <a href="${verificationURL}" style="background-color: #2ecc71; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
                   Confirm New Email
                </a>
            </div>
            <p style="font-size: 12px; color: #0984e3; word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                ${verificationURL}
            </p>
        </div>
        <div style="background-color: #f1f2f6; padding: 20px; text-align: center; font-size: 12px; color: #95a5a6;">
            <p style="margin: 0;">&copy; 2026 DZ Community Food. All rights reserved.</p>
            <p style="margin: 5px 0 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    </div>
  `;

  await sendEmail({
    email: email,
    subject: "Confirm your new email address (10 min expiration)",
    html: htmlContent,
  });

  res.status(200).json({
    status: "SUCCESS",
    message: "Verification email sent to your new address. Please confirm it.",
    data: null,
    errors: null,
  });
});

// verify email
exports.verifyNewEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ApiError("Token is invalid or has expired", 400));
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) return next(new ApiError("User not found", 404));

  const existing = await User.findOne({ where: { email: decoded.newEmail } });
  if (existing) return next(new ApiError("Email already in use", 400));

  user.email = decoded.newEmail;
  await user.save();

  res.status(200).json({
    status: "SUCCESS",
    message: "Email updated successfully!",
    data: null,
    errors: null,
  });
});
