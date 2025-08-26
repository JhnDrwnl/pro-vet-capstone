// src/services/smsService.js
import axios from 'axios'

// Use the main API URL for SMS services (Node.js backend)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class SMSService {
  constructor() {
    // Semaphore SMS service configuration
    this.baseURL = `${API_URL}/sms` // Backend SMS API endpoint
  }

  // Generate a 6-digit OTP code
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Format Philippine phone number for SMS
  formatPhoneForSMS(phone) {
    // Remove all non-digits
    let cleanNumber = phone.replace(/\D/g, '')
    
    // If it starts with 0, replace with 63
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '63' + cleanNumber.substring(1)
    }
    
    // If it doesn't start with 63, add it
    if (!cleanNumber.startsWith('63')) {
      cleanNumber = '63' + cleanNumber
    }
    
    return cleanNumber
  }

  // Send SMS OTP via Semaphore
  async sendOTP(phone, otp) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      const message = `🔐 *InnoVet Verification Code*

Your verification code is: *${otp}*

⏰ Valid for 5 minutes
🔒 Do not share this code with anyone

---
*This is an automated message from InnoVet*`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        otp: otp
      }

      const response = await axios.post(`${this.baseURL}/send-otp`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      })

      if (response.data.success) {
        console.log('SMS OTP sent successfully via Semaphore')
        return {
          success: true,
          messageId: response.data.messageId,
          otp: otp
        }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS')
      }
    } catch (error) {
      console.error('SMS sending error:', error)
      
      // Handle specific Semaphore errors
      if (error.response?.data?.error) {
        const semaphoreError = error.response.data.error
        
        if (semaphoreError.includes('insufficient') || semaphoreError.includes('balance')) {
          throw new Error('SMS service temporarily unavailable due to insufficient credits. Please try again later.')
        } else if (semaphoreError.includes('invalid') || semaphoreError.includes('number')) {
          throw new Error('Invalid phone number format. Please check your number and try again.')
        } else if (semaphoreError.includes('rate limit') || semaphoreError.includes('too many')) {
          throw new Error('Too many SMS requests. Please wait a moment before trying again.')
        } else {
          throw new Error(`SMS service error: ${semaphoreError}`)
        }
      }
      
      throw new Error('Failed to send SMS verification code. Please try again.')
    }
  }

  // Verify OTP (you can implement additional verification logic here)
  async verifyOTP(phone, otp) {
    try {
      // For now, we'll just return success
      // In a real implementation, you might want to store OTPs in a database
      // and verify them against the stored value
      return {
        success: true,
        valid: true
      }
    } catch (error) {
      console.error('SMS verification error:', error)
      throw new Error('Failed to verify SMS code')
    }
  }

  // Get SMS balance from Semaphore
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseURL}/balance`)
      
      if (response.data.success) {
        return {
          success: true,
          balance: response.data.balance,
          currency: response.data.currency || 'PHP'
        }
      } else {
        throw new Error(response.data.message || 'Failed to get balance')
      }
    } catch (error) {
      console.error('Balance check error:', error)
      throw new Error('Failed to check SMS balance')
    }
  }

  // Check SMS service status
  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/status`)
      return response.data
    } catch (error) {
      console.error('SMS status check error:', error)
      throw new Error('Failed to check SMS service status')
    }
  }

  // Send test message
  async sendTestMessage(phone, message) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message
      }

      const response = await axios.post(`${this.baseURL}/send-test`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        console.log('SMS test message sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send test message')
      }
    } catch (error) {
      console.error('SMS test message error:', error)
      throw new Error(error.response?.data?.message || 'Failed to send test message')
    }
  }
}

export default new SMSService()
