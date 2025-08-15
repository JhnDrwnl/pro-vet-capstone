// node-backend/services/smsService.js
const axios = require('axios');
require('dotenv').config();

class SemaphoreSMSService {
  constructor() {
    // Semaphore API configuration
    this.apiKey = process.env.SEMAPHORE_API_KEY;
    this.baseURL = 'https://api.semaphore.co/api/v4';
    this.senderName = process.env.SEMAPHORE_SENDER_NAME || 'InnoVet';
    
    if (!this.apiKey) {
      console.warn('SEMAPHORE_API_KEY not found in environment variables');
    }
  }

  // Generate a 6-digit OTP code
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Format Philippine phone number for Semaphore
  formatPhoneForSemaphore(phone) {
    // Remove all non-digits
    let cleanNumber = phone.replace(/\D/g, '');
    
    // If it starts with 0, replace with 63
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '63' + cleanNumber.substring(1);
    }
    
    // If it doesn't start with 63, add it
    if (!cleanNumber.startsWith('63')) {
      cleanNumber = '63' + cleanNumber;
    }
    
    return cleanNumber;
  }

  // Send SMS OTP via Semaphore
  async sendOTP(phone, otp) {
    try {
      if (!this.apiKey) {
        throw new Error('Semaphore API key not configured');
      }

      const formattedPhone = this.formatPhoneForSemaphore(phone);
      const message = `🔐 InnoVet Verification Code

Your verification code is: ${otp}

⏰ Valid for 5 minutes
🔒 Do not share this code with anyone

---
This is an automated message from InnoVet
Reply with "STOP" to unsubscribe.`;

      const payload = {
        apikey: this.apiKey,
        number: formattedPhone,
        message: message,
        sendername: this.senderName
      };

      console.log('Sending SMS via Semaphore:', {
        phone: formattedPhone,
        messageLength: message.length,
        senderName: this.senderName
      });

      const response = await axios.post(`${this.baseURL}/messages`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        
        if (result.status === 'Pending' || result.status === 'Sent') {
          console.log('SMS sent successfully via Semaphore:', result);
          return {
            success: true,
            messageId: result.message_id || result.id || `sms_${Date.now()}`,
            status: result.status,
            otp: otp
          };
        } else {
          throw new Error(`SMS failed to send. Status: ${result.status}`);
        }
      } else {
        throw new Error('Invalid response from Semaphore API');
      }
    } catch (error) {
      console.error('Semaphore SMS sending error:', error);
      
      // Handle specific Semaphore errors
      if (error.response?.data) {
        const semaphoreError = error.response.data;
        
        if (semaphoreError.error) {
          if (semaphoreError.error.includes('insufficient') || semaphoreError.error.includes('balance')) {
            throw new Error('Insufficient SMS credits');
          } else if (semaphoreError.error.includes('invalid') || semaphoreError.error.includes('number')) {
            throw new Error('Invalid phone number format');
          } else if (semaphoreError.error.includes('rate limit') || semaphoreError.error.includes('too many')) {
            throw new Error('Rate limit exceeded. Please wait before trying again.');
          } else {
            throw new Error(`Semaphore error: ${semaphoreError.error}`);
          }
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw new Error('Failed to send SMS. Please try again later.');
    }
  }

  // Get SMS balance from Semaphore
  async getBalance() {
    try {
      if (!this.apiKey) {
        throw new Error('Semaphore API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/account`, {
        params: {
          apikey: this.apiKey
        },
        timeout: 15000
      });

      if (response.data) {
        const accountInfo = response.data;
        return {
          success: true,
          balance: accountInfo.credit_balance || 0,
          currency: 'PHP',
          accountType: accountInfo.account_type || 'Unknown',
          accountStatus: accountInfo.status || 'Unknown'
        };
      } else {
        throw new Error('Invalid response from Semaphore API');
      }
    } catch (error) {
      console.error('Error getting Semaphore balance:', error);
      throw new Error('Failed to get SMS balance');
    }
  }

  // Check SMS service status
  async getStatus() {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          status: 'not_configured',
          message: 'Semaphore API key not configured'
        };
      }

      // Try to get account info to check if API key is valid
      const balance = await this.getBalance();
      
      return {
        success: true,
        status: 'active',
        message: 'Semaphore SMS service is active',
        balance: balance.balance,
        currency: balance.currency
      };
    } catch (error) {
      console.error('Error checking Semaphore status:', error);
      return {
        success: false,
        status: 'error',
        message: 'Failed to check Semaphore service status',
        error: error.message
      };
    }
  }

  // Send test message
  async sendTestMessage(phone, message) {
    try {
      if (!this.apiKey) {
        throw new Error('Semaphore API key not configured');
      }

      const formattedPhone = this.formatPhoneForSemaphore(phone);
      
      const payload = {
        apikey: this.apiKey,
        number: formattedPhone,
        message: message,
        sendername: this.senderName
      };

      const response = await axios.post(`${this.baseURL}/messages`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        
        if (result.status === 'Pending' || result.status === 'Sent') {
          return {
            success: true,
            messageId: result.message_id || result.id || `test_${Date.now()}`,
            status: result.status
          };
        } else {
          throw new Error(`Test message failed. Status: ${result.status}`);
        }
      } else {
        throw new Error('Invalid response from Semaphore API');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      throw new Error('Failed to send test message');
    }
  }

  // Get message status
  async getMessageStatus(messageId) {
    try {
      if (!this.apiKey) {
        throw new Error('Semaphore API key not configured');
      }

      const response = await axios.get(`${this.baseURL}/messages/${messageId}`, {
        params: {
          apikey: this.apiKey
        },
        timeout: 15000
      });

      if (response.data) {
        return {
          success: true,
          messageId: response.data.message_id || response.data.id,
          status: response.data.status,
          timestamp: response.data.timestamp,
          recipient: response.data.recipient_number
        };
      } else {
        throw new Error('Invalid response from Semaphore API');
      }
    } catch (error) {
      console.error('Error getting message status:', error);
      throw new Error('Failed to get message status');
    }
  }
}

module.exports = new SemaphoreSMSService();
