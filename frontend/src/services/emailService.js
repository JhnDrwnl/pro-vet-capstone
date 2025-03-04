//services/emailService.js
import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.otpStore = new Map();
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email, firstName) {
    try {
      const otp = this.generateOTP();
      
      this.otpStore.set(email, {
        code: otp,
        expires: Date.now() + 2 * 60 * 1000 // 2 minutes expiration
      });

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          to_name: firstName,
          otp: otp
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      if (response.status === 200) {
        return otp;
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send verification code');
    }
  }

  async verifyOTP(email, submittedOTP) {
    try {
      const storedData = this.otpStore.get(email);
      
      if (!storedData) {
        throw new Error('Verification code has expired or is invalid');
      }

      if (Date.now() > storedData.expires) {
        this.otpStore.delete(email);
        throw new Error('Verification code has expired');
      }

      const isValid = storedData.code === submittedOTP;
      
      if (isValid) {
        this.otpStore.delete(email);
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expires) {
        this.otpStore.delete(email);
      }
    }
  }
}

const emailService = new EmailService();
export default emailService;