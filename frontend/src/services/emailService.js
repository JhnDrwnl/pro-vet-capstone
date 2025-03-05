// src/services/emailService.js
import axios from 'axios'

// Update this to point to your actual backend server
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

class EmailService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      // Add withCredentials if you need to send cookies
      withCredentials: false
    })
    
    // Add response interceptor to handle common errors
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('Email service error:', error.response?.data || error.message)
        
        // Enhance error message based on status code
        if (error.response) {
          const status = error.response.status
          const message = error.response.data?.message || 'Unknown error'
          
          if (status === 400 && message.includes('expired')) {
            error.message = 'Verification code has expired. Please request a new one.'
          } else if (status === 404) {
            error.message = 'Service not available. Please try again later.'
          } else if (status >= 500) {
            error.message = 'Server error. Please try again later.'
          } else {
            error.message = message
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  async sendOTP(email, firstName) {
    try {
      const response = await this.client.post('/auth/send-otp', {
        email,
        firstName,
        purpose: 'verification'
      })
      return response.data
    } catch (error) {
      console.error('Send OTP error:', error)
      throw error
    }
  }

  async resendOTP(email, firstName) {
    try {
      const response = await this.client.post('/auth/resend-otp', {
        email,
        firstName,
        purpose: 'verification'
      })
      return response.data
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw error
    }
  }

  async verifyOTP(email, otp, purpose = 'verification') {
    try {
      const response = await this.client.post('/auth/verify-otp', {
        email,
        otp,
        purpose
      })
      return response.data
    } catch (error) {
      console.error('Verify OTP error:', error)
      throw error
    }
  }

  async sendPasswordResetOTP(email) {
    try {
      const response = await this.client.post('/auth/send-otp', {
        email,
        purpose: 'password-reset'
      })
      return response.data
    } catch (error) {
      console.error('Send password reset OTP error:', error)
      throw error
    }
  }

  async resetPasswordWithOTP(email, otp, newPassword) {
    try {
      const response = await this.client.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      })
      return response.data
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }
}

export default new EmailService()