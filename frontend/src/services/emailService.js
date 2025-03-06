// src/services/emailService.js
import axios from 'axios'

// Update this to point to your actual backend server
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'

class EmailService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // Increased timeout to 15 seconds
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
          
          if (status === 400) {
            // Distinguish between invalid and expired OTPs
            if (message.includes('expired') && !message.includes('Invalid')) {
              error.message = 'Verification code has expired. Please request a new one.'
              error.status = 'expired'
            } else if (message.includes('Invalid')) {
              error.message = 'The verification code you entered is incorrect. Please try again.'
              error.status = 'invalid'
            } else {
              error.message = message
            }
          } else if (status === 404) {
            error.message = 'Service not available. Please try again later.'
          } else if (status >= 500) {
            error.message = 'Server error. Please try again later.'
          } else {
            error.message = message
          }
        } else if (error.code === 'ECONNABORTED') {
          // Handle timeout specifically
          error.message = 'Request timed out. The server might be busy, but your request may still be processing.'
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Helper method to implement retry logic
  async retryRequest(requestFn, maxRetries = 2) {
    let retryCount = 0
    let lastError = null

    while (retryCount <= maxRetries) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        
        // Don't retry if it's a client error (4xx) other than timeout
        if (error.response && error.response.status >= 400 && error.response.status < 500 && 
            error.code !== 'ECONNABORTED') {
          throw error
        }
        
        retryCount++
        if (retryCount <= maxRetries) {
          // Exponential backoff
          const delay = 1000 * Math.pow(2, retryCount - 1)
          console.log(`Retrying request (${retryCount}/${maxRetries}) after ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }

  async sendOTP(email, firstName) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/auth/send-otp', {
        email,
        firstName,
        purpose: 'verification'
      })
      return response.data
    })
  }

  async resendOTP(email, firstName) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/auth/resend-otp', {
        email,
        firstName,
        purpose: 'verification'
      })
      return response.data
    })
  }

  async verifyOTP(email, otp, purpose = 'verification') {
    return this.retryRequest(async () => {
      const response = await this.client.post('/auth/verify-otp', {
        email,
        otp,
        purpose
      })
      return response.data
    })
  }

  async sendPasswordResetOTP(email) {
    return this.retryRequest(async () => {
      const response = await this.client.post('/auth/send-otp', {
        email,
        purpose: 'password-reset'
      })
      return response.data
    })
  }

  async resetPasswordWithOTP(email, otp, newPassword) {
    console.log('Sending password reset request with:', { 
      email, 
      otpProvided: !!otp, 
      passwordLength: newPassword?.length 
    })
    
    return this.retryRequest(async () => {
      const response = await this.client.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      })
      return response.data
    })
  }
}

export default new EmailService()