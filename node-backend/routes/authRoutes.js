// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Check if controller methods exist
console.log('Controller methods:', {
  register: typeof authController.register,
  completeRegistration: typeof authController.completeRegistration,
  sendOTP: typeof authController.sendOTP,
  resendOTP: typeof authController.resendOTP,
  verifyOTP: typeof authController.verifyOTP,
  resetPasswordWithOTP: typeof authController.resetPasswordWithOTP
});

// Registration routes
router.post('/register', authController.register);
router.post('/complete-registration', authController.completeRegistration);

// OTP routes
router.post('/send-otp', authController.sendOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Password reset routes
router.post('/reset-password', authController.resetPasswordWithOTP);

module.exports = router;