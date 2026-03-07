const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const {
   signup, 
    verifyEmail,
    resend_verification_email,

    signin, 
    logout,
 
    forgetPassword,
    verifyResetToken,
    resetPassword,
 
    updateProfile,

    protect,
    allwodTo,
} = require("../services/authService");


const {
   signupValidator,
   loginValidator,

validatePassword,
  updateProfileValidator
 } = require("../utils/validators/authValidators");


router.post("/sign-up", signupValidator, signup);
router.get("/verify-email-token/:token", verifyEmail);
router.post("/resend-verification-email",resend_verification_email);

router.post("/sign-out", protect, logout);

router.post("/sign-in", loginValidator, signin);

router.post("/forget-password", forgetPassword); 
router.get("/verify-reset-password-token/:token", verifyResetToken);
////////////////////////////////////
router.post("/reset-password/:token", validatePassword, resetPassword);

router.patch("/onboarding",protect, updateProfileValidator,  updateProfile,); 


module.exports = router;
