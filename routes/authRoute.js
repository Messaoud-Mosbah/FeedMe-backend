const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    updateUserRole,
    protect,
    forgotPassword,
    resetPassword,
    verifyEmail,
    sendVerificationEmail,
    updateUserProfile,
    updateRestaurantProfile

} = require('../services/authService');

const { 
    signupValidator,
    loginValidator,
    updateUserRoleValidtor,
    ProfileBasicValidator,
    validatePassword,
PreferencesValidator,
RestaurantBasicValidator ,
RestaurantLocationValidator,
RestaurantDetailsValidator,
RestaurantServicesValidator
} = require("../utils/validators/authValidators");

// --- مسارات التسجيل والدخول (أساس MAIN) ---
router.post("/login", loginValidator, login);
router.post("/signup", signupValidator, signup);
//verify the existe of the email
router.get('/verify-email/:token', verifyEmail);

router.post('/send-verificati-on-email', protect, sendVerificationEmail);
router.patch("/signup/role", protect, updateUserRoleValidtor, updateUserRole);


// 1. طلب رابط نسيان كلمة المرور
router.post('/forgot-password', forgotPassword);

// 2. عرض واجهة إعادة تعيين كلمة المرور (HTML Form)
router.get('/reset-password/:token', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h2>Reset Password</h2>
        <form method="POST" action="/api/authentication/reset-password/${req.params.token}">
            <input type="password" name="password" placeholder="New Password" required style="padding: 10px; margin: 5px;"/><br>
            <input type="password" name="passwordConfirm" placeholder="Confirm Password" required style="padding: 10px; margin: 5px;"/><br>
            <button type="submit" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; cursor: pointer;">Reset Password</button>
        </form>
    </div>
  `);
});

router.post('/reset-password/:token',validatePassword, resetPassword);




//----- NORMAL USER PROFILE

///----- NORMAL USER PROFILE

// Page 1 – Basic Info
router.put("/profile/basic", protect, ...ProfileBasicValidator, updateUserProfile);

// Page 2 – Preferences (Food + Usage)
router.put(
  "/profile/preferences",
  protect,
  ...PreferencesValidator,
  updateUserProfile,
);

//------- RESTAURANT PROFILE

// Page 1 – Basic Info
router.put(
  "/restaurant/basic",
  protect,
  ...RestaurantBasicValidator,
  updateRestaurantProfile,
);

// Page 2 – Location Info
router.put(
  "/restaurant/location",
  protect,
  ...RestaurantLocationValidator,
  updateRestaurantProfile,
);

// Page 3 – Details
router.put(
  "/restaurant/details",
  protect,
  ...RestaurantDetailsValidator,
  updateRestaurantProfile,
);

// Page 4 – Services
router.put(
  "/restaurant/services",
  protect,
  ...RestaurantServicesValidator,
  updateRestaurantProfile,
);

module.exports = router;