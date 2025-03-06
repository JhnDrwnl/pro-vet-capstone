// server/controllers/authController.js
const mailer = require('../utils/mailer');
const admin = require('../config/firebase');

/**
* User registration - sends OTP for email verification
* The actual user creation is handled in the frontend using Firebase client SDK
*/
exports.register = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, first name, and last name are required' 
      });
    }
    
    // Generate and send OTP
    await mailer.sendOTP(email, firstName);
    
    return res.status(201).json({
      success: true,
      message: 'Verification email sent successfully.'
    });
  } catch (error) {
    console.error('Error in register controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    });
  }
};

/**
* Send OTP for various purposes (verification, password reset)
*/
exports.sendOTP = async (req, res) => {
  try {
    const { email, firstName, purpose = 'verification' } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Generate and send OTP based on purpose
    if (purpose === 'password-reset') {
      await mailer.sendPasswordResetOTP(email, firstName || '');
    } else {
      await mailer.sendOTP(email, firstName || '');
    }
    
    return res.status(200).json({
      success: true,
      message: `OTP sent successfully for ${purpose}`
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

/**
* Resend OTP
*/
exports.resendOTP = async (req, res) => {
  try {
    const { email, firstName, purpose = 'verification' } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Generate and send OTP based on purpose
    if (purpose === 'password-reset') {
      await mailer.sendPasswordResetOTP(email, firstName || '');
    } else {
      await mailer.sendOTP(email, firstName || '');
    }
    
    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};

/**
* Verify OTP
*/
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'verification' } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    // Verify OTP
    const isValid = mailer.verifyOTP(email, otp, purpose);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    // Don't clear the OTP for password-reset here
    // It will be cleared after the actual password reset
    if (purpose !== 'password-reset') {
      mailer.clearOTP(email, purpose);
    }
    
    return res.status(200).json({
      success: true,
      valid: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

/**
* Reset password with OTP verification
* This function will verify the OTP and then update the Firebase password
*/
exports.resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    console.log('Reset password request received:', { 
      email, 
      otpProvided: !!otp, 
      passwordProvided: !!newPassword,
      otpLength: otp?.length,
      passwordLength: newPassword?.length
    });
    
    if (!email || !otp || !newPassword) {
      console.log('Missing required fields:', { 
        emailMissing: !email, 
        otpMissing: !otp, 
        passwordMissing: !newPassword 
      });
      
      return res.status(400).json({ 
        success: false, 
        message: 'Email, OTP, and new password are required' 
      });
    }
    
    // Verify the OTP first
    console.log('Verifying OTP for email:', email);
    const otpValid = mailer.verifyOTP(email, otp, 'password-reset');
    console.log('OTP verification result:', otpValid);
    
    if (!otpValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    try {
      // Log for debugging
      console.log('Attempting to update password for email:', email);
      
      // Find the user by email
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log('Found user with UID:', userRecord.uid);
      
      // Update the user's password
      await admin.auth().updateUser(userRecord.uid, {
        password: newPassword
      });
      
      console.log('Password updated successfully for user:', userRecord.uid);
      
      // Clear the OTP after successful password reset
      mailer.clearOTP(email, 'password-reset');
      
      return res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (firebaseError) {
      console.error('Firebase error updating password:', firebaseError);
      
      // Check for specific Firebase errors
      if (firebaseError.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      } else if (firebaseError.code === 'auth/invalid-password') {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      } else if (firebaseError.code === 'auth/weak-password') {
        return res.status(400).json({
          success: false,
          message: 'Password is too weak'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update password in Firebase',
        error: firebaseError.message
      });
    }
  } catch (error) {
    console.error('Error in password reset:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

/**
* Complete registration (verify OTP)
* The actual user verification is handled in the frontend using Firebase client SDK
*/
exports.completeRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    // Verify OTP
    const isValid = mailer.verifyOTP(email, otp);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    // Clear the OTP after successful verification
    mailer.clearOTP(email);
    
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error completing registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};