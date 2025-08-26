// src/utils/mailer.js
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
let db;
try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
  db = admin.firestore();
} catch (error) {
  console.warn('Firebase Admin already initialized or failed to initialize:', error.message);
  if (admin.apps.length > 0) {
    db = admin.apps[0].firestore();
  }
}

// Create transporter for sending emails
const createTransporter = () => {
  // For development/testing, you can use Gmail or other services
  // For production, consider using SendGrid, AWS SES, or similar
  
  // Option 1: Gmail (for testing - requires app password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use App Password, not regular password
      }
    });
  }
  
  // Option 2: SendGrid (recommended for production)
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Option 3: Custom SMTP
  if (process.env.EMAIL_SERVICE === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Default: Use Gmail if no specific service is configured
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
    }
  });
};

// Generate and store OTP
const generateOTP = (email, purpose = 'verification') => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryMinutes = 5; // 5 minutes expiry
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;
  
  // Store OTP with purpose
  db.collection('otps').doc(email).set({
    [purpose]: {
      code: otp,
      expiry: expiryTime
    }
  }, { merge: true })
  .then(() => {
    console.log(`Generated OTP for ${email} (${purpose}): ${otp}, expires at: ${new Date(expiryTime).toLocaleTimeString()}`);
  })
  .catch(error => {
    console.error(`Error storing OTP for ${email} (${purpose}):`, error);
  });
  
  return otp;
};

// Send OTP email
const sendOTP = async (email, firstName) => {
  try {
    const otp = generateOTP(email, 'verification');
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@innovet.com',
      to: email,
      subject: 'InnoVet - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4285F4; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">InnoVet</h1>
            <p style="margin: 10px 0 0 0;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName || 'there'}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with InnoVet. To complete your registration, 
              please use the verification code below:
            </p>
            
            <div style="background-color: white; border: 2px solid #4285F4; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h1 style="color: #4285F4; font-size: 32px; margin: 0; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              <strong>Important:</strong> This code will expire in 5 minutes for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this verification code, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                Best regards,<br>
                The InnoVet Team
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}:`, info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, firstName) => {
  try {
    const otp = generateOTP(email, 'password-reset');
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@innovet.com',
      to: email,
      subject: 'InnoVet - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #EA4335; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">InnoVet</h1>
            <p style="margin: 10px 0 0 0;">Password Reset</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${firstName || 'there'}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. To proceed with the password reset, 
              please use the verification code below:
            </p>
            
            <div style="background-color: white; border: 2px solid #EA4335; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h1 style="color: #EA4335; font-size: 32px; margin: 0; letter-spacing: 5px; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              <strong>Important:</strong> This code will expire in 5 minutes for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                Best regards,<br>
                The InnoVet Team
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent successfully to ${email}:`, info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending password reset OTP email to ${email}:`, error);
    throw new Error(`Failed to send password reset OTP email: ${error.message}`);
  }
};

// Verify OTP
const verifyOTP = async (email, otp, purpose = 'verification') => {
  console.log(`Verifying OTP for ${email} (${purpose}): ${otp}`);
  
  try {
    const docRef = db.collection('otps').doc(email);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log(`No OTP found for ${email} (${purpose})`);
      return false;
    }

    const data = docSnap.data();
    console.log(`OTP data found for ${email}:`, data);
    
    if (!data[purpose]) {
      console.log(`No OTP found for ${email} with purpose ${purpose}`);
      return false;
    }

    const storedOTP = data[purpose];
    console.log(`Stored OTP for ${email} (${purpose}):`, {
      code: storedOTP.code,
      expiry: storedOTP.expiry,
      currentTime: Date.now(),
      isExpired: Date.now() > storedOTP.expiry
    });
    
    if (Date.now() > storedOTP.expiry) {
      // OTP expired, clean up
      console.log(`OTP expired for ${email} (${purpose})`);
      await clearOTP(email, purpose);
      return false;
    }
    
    const isValid = storedOTP.code === otp;
    console.log(`OTP validation result: ${isValid ? 'valid' : 'invalid'}`);
    console.log(`Comparing: stored="${storedOTP.code}" vs provided="${otp}"`);
    
    // Clear OTP after successful verification (except for password reset)
    if (isValid && purpose !== 'password-reset') {
      await clearOTP(email, purpose);
    }
    
    return isValid;
  } catch (error) {
    console.error(`Error verifying OTP for ${email} (${purpose}):`, error);
    return false;
  }
};

// Clear OTP after successful verification
const clearOTP = async (email, purpose = 'verification') => {
  try {
    const docRef = db.collection('otps').doc(email);
    await docRef.update({
      [purpose]: admin.firestore.FieldValue.delete()
    });
    console.log(`Cleared OTP for ${email} (${purpose})`);
  } catch (error) {
    console.error(`Error clearing OTP for ${email} (${purpose}):`, error);
  }
};

// Cleanup expired OTPs
const cleanupExpiredOTPs = async () => {
  try {
    const now = Date.now();
    const otpsRef = db.collection('otps');
    const snapshot = await otpsRef.get();
    
    let cleanedCount = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      let hasExpired = false;
      
      Object.keys(data).forEach(purpose => {
        if (data[purpose].expiry && now > data[purpose].expiry) {
          hasExpired = true;
          delete data[purpose];
        }
      });
      
      if (hasExpired) {
        if (Object.keys(data).length === 0) {
          // Delete entire document if no OTPs left
          doc.ref.delete();
        } else {
          // Update document with expired OTPs removed
          doc.ref.set(data);
        }
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired OTP documents`);
    }
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};

// Verify email connection
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email connection verified successfully');
    return true;
  } catch (error) {
    console.error('Email connection verification failed:', error);
    return false;
  }
};

// Generic email sending function
const sendEmail = async (emailOptions) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(emailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Export functions
module.exports = {
  sendOTP,
  sendPasswordResetOTP,
  verifyOTP,
  clearOTP,
  verifyConnection,
  sendEmail,
  cleanupExpiredOTPs
};