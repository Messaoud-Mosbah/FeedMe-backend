const asyncHandler = require('express-async-handler');
const { User, UserProfile, RestaurantProfile } = require("../models"); // تأكد من المسار الصحيحconst jwt = require('jsonwebtoken');
const { GENERATE_TOKEN } = require('../utils/createToken');
const bcrypt = require('bcryptjs');
const ApiError = require("../utils/apiError");
const { Op } = require('sequelize');
const crypto = require("crypto");
const { sendEmail } = require('../utils/sendEmail');
const jwt = require("jsonwebtoken"); 
const sendVerificationEmail = async (user) => {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.verificationToken = hashedToken;
    await user.save();

    const verificationURL = `${process.env.NGROK_URL}/api/authentication/verify-email/${verificationToken}`;
    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        message: `Please verify your email by clicking here: ${verificationURL}`,
    });
};

// @desc    Signup
const signup = asyncHandler(async (req, res) => {
    const { userName, email, password} = req.body;

    const user = await User.create({
        userName,
        email,
        password,
    });

    // إرسال بريد التحقق تلقائياً عند التسجيل
    await sendVerificationEmail(user);

    const token = await GENERATE_TOKEN({ email: user.email, id: user.id, userName: user.userName });
    
    user.password = undefined;
    res.status(201).json({ STATUS: 'success',
        MESSAGE: "sign up successfully",
         DATA: { user,token},ERRORS:[] });
});

// @desc    Update User Role
const updateUserRole = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new ApiError("User not found", 404));

    user.role = req.body.role; 
    await user.save();
    user.password = undefined;

    res.status(200).json({ STATUS: 'success',
                MESSAGE: "update user role successfully",
 DATA:  user,ERRORS:[] });
});

// @desc    Login
const login = asyncHandler(async (req, res, next) => {
    const { identity, password } = req.body;

    if (!identity || !password) {
        return next(new ApiError("Email/Username and password are required", 400));
    }

    const user = await User.findOne({
        where: {
            [Op.or]: [{ email: identity }, { userName: identity }]
        }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new ApiError("Invalid email/username or password", 401));
    }

    const token = GENERATE_TOKEN({
        id: user.id,
        email: user.email,
        userName: user.userName
    });

    user.password = undefined;
    res.status(200).json({
        STATUS: "success",
                MESSAGE: "log in successfully",

        DATA: { user,token },
        ERRORS:[]
    });
});

// @desc    Forgot Password
const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return next(new ApiError("No user with this email", 404));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

    await user.save();

    const resetURL = `${process.env.NGROK_URL}/api/authentication/reset-password/${resetToken}`;
    await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message: `Forgot your password? Click here to reset: ${resetURL}`,
    });

    res.status(200).json({ STATUS: "success",
         Message: "Token sent to email!",
        DATA: {  },
        ERRORS:[],
        });
}); 
// @desc    Protect Middleware
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError('You are not logged in, please login', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findByPk(decoded.id);
    
    if (!currentUser) {
        return next(new ApiError('The user belonging to this token no longer exists', 401));
    }
    
    req.user = currentUser;
    next();
});




// @desc    Reset Password
const resetPassword = asyncHandler(async (req, res, next) => {
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
        return next(new ApiError("Password and confirm password are required", 400));
    }

    if (password !== passwordConfirm) {
        return next(new ApiError("Passwords do not match", 400));
    }

    const resetTokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        where: {
            passwordResetToken: resetTokenHash,
            passwordResetExpires: { [Op.gt]: new Date() },
        },
    });

    if (!user) {
        return next(new ApiError("Token is invalid or expired", 400));
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.send("<h2>Password reset successfully ✅</h2>");
});

// @desc    Verify Email
const verifyEmail = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        where: { verificationToken: hashedToken },
    });

    if (!user) {
        return next(new ApiError("Token is invalid", 400));
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ STATUS: "success", MESSAE: "Email verified successfully" ,DATA:{},ERRORS:[]});
});
/////////////////////////////////////////////////
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // 1. التحقق من الصلاحية (Role Check)
  if (req.user.role !== "USER") {
    return next(new ApiError("Access denied. This is not a user account", 403));
  }

  const allowedFields = [
    "fullName", "profilePicture", "city", "phone", 
    "bio", "socialLinks", "kitchenCategories", "usagePreferences"
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) filteredData[field] = req.body[field];
  });

  let profile = await UserProfile.findOne({ where: { userId } });

  if (profile) {
    await profile.update(filteredData);
  } else {
    profile = await UserProfile.create({ userId, ...filteredData });
  }

  res.status(200).json({ 
    STATUS: "success", 
    MESSAGE: "User profile updated successfully", 
    DATA: profile, 
    ERRORS: [] 
  });
});
///////////
const updateRestaurantProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  if (req.user.role !== "RESTAURANT") {
    return next(new ApiError("Access denied. This is not a restaurant account", 403));
  }

  const allowedFields = [
    "restaurantName", "businessEmail", "phoneNumber", "profilePicture",
    "city", "wilaya", "street", "postalCode", "googleMapsLink",
    "kitchenCategories", "openingHoursFrom", "openingHoursTo",
    "daysOpen", "services", "businessRegistrationNumber", "description"
  ];

  const filteredData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) filteredData[field] = req.body[field];
  });

  let profile = await RestaurantProfile.findOne({ where: { userId } });

  if (profile) {
    await profile.update(filteredData);
  } else {
    profile = await RestaurantProfile.create({ userId, ...filteredData });
  }

  res.status(200).json({ 
    STATUS: "success", 
    MESSAGE: "Restaurant profile updated successfully", 
    DATA: profile, 
    ERRORS: [] 
  });
});
module.exports = { 
    signup, 
    login, 
    updateUserRole, 
    protect, 
    forgotPassword, 
    resetPassword, 
    verifyEmail, 
    sendVerificationEmail ,
    updateUserProfile,
    updateRestaurantProfile
};
