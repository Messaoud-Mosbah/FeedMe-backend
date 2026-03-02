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
    updateRestaurantProfile,
    allwodTo

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

//des    sign up & log ib
router.post("/signup", signupValidator, signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/send-verificati-on-email', protect, sendVerificationEmail);
router.patch("/signup/role", protect, updateUserRoleValidtor, updateUserRole);

router.post("/login", loginValidator, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token',validatePassword, resetPassword);




//des   complete user profile
router.patch("/user/basic", protect,allwodTo("USER,ADMIN"),ProfileBasicValidator, updateUserProfile);
router.patch("/user/preferences",allwodTo("USER,ADMIN"),protect,PreferencesValidator,updateUserProfile,);

//des   complete restaurant profile
router.patch("/restaurant/basic", protect,allwodTo("RESTAURANT,ADMIN"),RestaurantBasicValidator,updateRestaurantProfile,);
router.patch("/restaurant/location",protect,allwodTo("RESTAURANT,ADMIN"),RestaurantLocationValidator,updateRestaurantProfile,);
router.put("/restaurant/details",protect,allwodTo("RESTAURANT,ADMIN"),RestaurantDetailsValidator,updateRestaurantProfile,);
router.put("/restaurant/services",protect,allwodTo("RESTAURANT,ADMIN"),RestaurantServicesValidator,updateRestaurantProfile,);

module.exports = router;