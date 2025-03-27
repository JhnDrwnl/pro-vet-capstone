// server/controllers/authController.js
const mailer = require('../utils/mailer');
const admin = require('../config/firebase');
const userDataUtils = require('../utils/userDataUtils');
const logger = require('../utils/logger');

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

/**
 * Update user authentication status (enable/disable)
 * This function will disable or enable a user in Firebase Authentication
 */
exports.updateUserAuthStatus = async (req, res) => {
  try {
    const { uid, disabled } = req.body;
    
    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }
    
    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Disabled status must be a boolean' 
      });
    }
    
    console.log(`Updating auth status for user ${uid}: disabled=${disabled}`);
    
    // Update the user in Firebase Auth
    await admin.auth().updateUser(uid, { disabled });
    
    return res.status(200).json({
      success: true,
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully`
    });
  } catch (error) {
    console.error('Error updating user auth status:', error);
    
    // Check for specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update user authentication status',
      error: error.message
    });
  }
};

/**
 * Create a new user (admin function)
 * This allows admins to create users without being logged out
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password, displayName, firstName, lastName, role = 'user' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    console.log(`Admin creating new user: ${email}, role: ${role}`);
    
    // Create the user with Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim(),
      emailVerified: false
    });
    
    console.log(`User created with UID: ${userRecord.uid}`);
    
    return res.status(200).json({ 
      success: true, 
      uid: userRecord.uid,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Check for specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    } else if (error.code === 'auth/invalid-password') {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create user' 
    });
  }
};

/**
 * Get users sign-in data
 * This function retrieves the last sign-in time and provider data for all users
 */
exports.getUsersSignInData = async (req, res) => {
  try {
    console.log('Fetching users sign-in data');
    
    // List all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    
    // Map to include only the necessary data
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      lastSignInTime: user.metadata.lastSignInTime,
      creationTime: user.metadata.creationTime,
      providerData: user.providerData || [], // Include provider data
      disabled: user.disabled
    }));
    
    console.log(`Retrieved sign-in data for ${users.length} users`);
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users sign-in data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users sign-in data',
      error: error.message
    });
  }
};

/**
 * Delete a user (soft delete - move to archive)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    logger.info(`Archiving user with ID: ${uid}`);
    
    // Archive the user and related data
    const archiveResult = await userDataUtils.archiveUser(uid);
    
    if (!archiveResult.success) {
      throw new Error(archiveResult.message);
    }
    
    // Send email notification to the user
    try {
      // Get user email from Firebase Auth since the Firestore document is now deleted
      const userRecord = await admin.auth().getUser(uid);
      if (userRecord.email) {
        await mailer.sendEmail({
          to: userRecord.email,
          subject: 'Your account has been archived',
          text: `Your account has been archived. It will be permanently deleted in 30 days if not restored.`,
          html: `
            <h2>Your account has been archived</h2>
            <p>Your account has been archived and will be permanently deleted in 30 days if not restored.</p>
            <p>If you believe this was done in error, please contact our support team.</p>
          `
        });
      }
    } catch (emailError) {
      logger.error('Error sending email notification:', emailError);
      // Continue with the process even if email fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'User archived successfully',
      data: archiveResult
    });
  } catch (error) {
    logger.error('Error archiving user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive user',
      error: error.message
    });
  }
};