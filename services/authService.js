const asyncHandler = require('express-async-handler');
const { User, UserProfile, RestaurantProfile } = require("../models"); 
const { GENERATE_TOKEN } = require('../utils/createToken');
const bcrypt = require('bcryptjs');
const ApiError = require("../utils/apiError");
const { Op } = require('sequelize');
const crypto = require("crypto");
const { sendEmail } = require('../utils/sendEmail');
const jwt = require("jsonwebtoken"); 

//des        Signup
//route      post /api/authentication/signup
//access     public
const signup = asyncHandler(async (req, res) => {
    const { userName, email, password} = req.body;
    const user = await User.create({
        userName,
        email,
        password,
    });
    await sendVerificationEmail(user);
    const token = await GENERATE_TOKEN({ email: user.email, id: user.id, userName: user.userName });
    user.password = undefined;
    res.status(201).json({ STATUS: 'success',
        MESSAGE: "sign up successfully",
         DATA: { user,token},
         ERRORS:[] 
        });
});
//des        Verification E-mail sent automatically

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
// @desc    Verify Email work automatically 
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
    res.status(200).json({ STATUS: "success", MESSAGE: "Email verified successfully" ,DATA:{},ERRORS:[]});
});

//des         Update User Role
//route      post /api/authentication/signup/role(we need token)
//access     public
const updateUserRole = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new ApiError("User not found", 404));
    user.role = req.body.role; 
    await user.save();
    user.password = undefined;
    res.status(200).json({ STATUS: 'success',
    MESSAGE: "update user role successfully",
   DATA:{user}
   ,ERRORS:[] 
});
});


//des         Login
//route      post /api/authentication/login
//access     public
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

//des        Forgot Password(give me the e-mail)
//route      post /api/authentication/forgot-password
//access     public
const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ApiError("if the email found we will sent an E-mail for you", 404));
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق
    await user.save();
    const resetURL = `${process.env.NGROK_URL}/api/authentication/reset-password/${resetToken}`;
    try{ await sendEmail({
        email: user.email,
        subject: "Password Reset",
        message: `Hi ${user.userName} \n  Forgot your password? Click here to reset:\n ${resetURL}`,
    });
   }catch(err){
    user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save();
        return next(new ApiError('There is an error in sending the email', 500));
}
  res.status(200).json({ STATUS: "success",
         Message: "Token sent to email!",
        DATA: {  },
        ERRORS:[],
        });
}); 
   
//des       Reset Password(verify token and set the new password)
//route      post /api/authentication/reset-password/:token
//access     public
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
    res.status(201).json({ STATUS: "success", MESSAGE: "Password reset successfully" ,DATA:{},ERRORS:[]});
});


// @desc    Protect Middleware to verify if the user logged

const protect = asyncHandler(async (req, res, next) => {
    let token;
    //check if token existe
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
   if (!token) {
        return next(new ApiError('You are not logged in, please login', 401));
    }
//verify token expired time 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    //verfiy that the user existe
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
        return next(new ApiError('The user belonging to this token no longer exists', 401));
    }
//check if user change the password after token creating
    if(currentUser.passwordChangedAt){
   const passwordChangedAtTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);    
    if(passwordChangedAtTimestamp>decoded.iat){
                    return next(new ApiError('the user change his password .please login again...', 401));}
    }
    req.user= currentUser;
    next();
});

//// @desc    verify the permissons of the user

const allwodTo=(...roles)=>
    asyncHandler(async(req,res,next) => {
    if(!roles.includes(req.user.role)){
                    return  next(new ApiError('you are not allow to access to this routes', 403)); 
                  }
                  next();
})





/////////////////////////////////////////////////

//des       update user profile
//route      patch /api/authentication/user/....(give me the token)
//access     user admin
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
    DATA: {profile}, 
    ERRORS: [] 
  });
});
//des       update restaurant profile
//route      patch /api/authentication/restaurant/....(give me the token)
//access    restaurant admin
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
    DATA: {profile}, 
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
    updateRestaurantProfile,
    allwodTo
};
