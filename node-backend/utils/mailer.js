//utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Store OTPs with purpose
const otpStore = {};

// Generate and store OTP
const generateOTP = (email, purpose = 'verification') => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Use the OTP_EXPIRY from .env or default to 2 minutes
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY || 2);
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000; // 2 minutes expiry (changed from 10 minutes)
  
  // Store OTP with purpose
  if (!otpStore[email]) {
    otpStore[email] = {};
  }
  
  otpStore[email][purpose] = {
    code: otp,
    expiry: expiryTime
  };
  
  console.log(`Generated OTP for ${email} (${purpose}): ${otp}, expires at: ${new Date(expiryTime).toLocaleTimeString()}`);
  
  return otp;
};

// Verify OTP
const verifyOTP = (email, otp, purpose = 'verification') => {
  console.log(`Verifying OTP for ${email} (${purpose}): ${otp}`);
  console.log(`Current OTP store:`, JSON.stringify(otpStore, null, 2));
  
  if (!otpStore[email] || !otpStore[email][purpose]) {
    console.log(`No OTP found for ${email} (${purpose})`);
    return false;
  }
  
  const storedOTP = otpStore[email][purpose];
  console.log(`Stored OTP: ${storedOTP.code}, expires at: ${new Date(storedOTP.expiry).toLocaleTimeString()}`);
  
  if (Date.now() > storedOTP.expiry) {
    // OTP expired, clean up
    console.log(`OTP expired for ${email} (${purpose})`);
    delete otpStore[email][purpose];
    return false;
  }
  
  const isValid = storedOTP.code === otp;
  console.log(`OTP validation result: ${isValid ? 'valid' : 'invalid'}`);
  
  return isValid;
};

// Clear OTP after successful verification
const clearOTP = (email, purpose = 'verification') => {
  if (otpStore[email] && otpStore[email][purpose]) {
    console.log(`Clearing OTP for ${email} (${purpose})`);
    delete otpStore[email][purpose];
  }
};

// Send OTP for account verification
const sendOTP = async (email, firstName) => {
  const otp = generateOTP(email, 'verification');
  // Use the OTP_EXPIRY from .env or default to 2 minutes
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY || 2);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Verification - Provincial Veterinary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a5568; text-align: center;">Email Verification</h2>
        <p>Hello ${firstName || 'there'},</p>
        <p>Thank you for registering with Provincial Veterinary. Please use the following code to verify your email address:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in ${expiryMinutes} minutes.</p>
        <p>If you didn't request this verification, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>Provincial Veterinary Team</p>
      </div>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

// Send OTP for password reset
const sendPasswordResetOTP = async (email, firstName) => {
  const otp = generateOTP(email, 'password-reset');
  // Use the OTP_EXPIRY from .env or default to 2 minutes
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY || 2);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Code - Provincial Veterinary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a5568; text-align: center;">Password Reset</h2>
        <p>Hello ${firstName || 'there'},</p>
        <p>We received a request to reset your password. Please use the following code to complete the process:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in ${expiryMinutes} minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>Provincial Veterinary Team</p>
      </div>
    `
  };
  
  return await transporter.sendMail(mailOptions);
};

// Verify email connection
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};

// Export functions
module.exports = {
  sendOTP,
  sendPasswordResetOTP,
  verifyOTP,
  clearOTP,
  verifyConnection
};