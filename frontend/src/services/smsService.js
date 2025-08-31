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
      const message = `InnoVet Verification Code: ${otp}. Valid for 5 minutes. Do not share this code.`
      
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

  // Send appointment reminder SMS
  async sendAppointmentReminder(phone, petName, time) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      const message = `InnoVet: ${petName} appointment at ${time} today.`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'appointment_reminder'
      }

      const response = await axios.post(`${this.baseURL}/send-appointment-reminder`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      if (response.data.success) {
        console.log('SMS appointment reminder sent successfully via Semaphore')
        return {
          success: true,
          messageId: response.data.messageId,
          message: response.data.message
        }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS reminder')
      }
    } catch (error) {
      console.error('SMS appointment reminder error:', error)
      
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
      
      throw new Error('Failed to send SMS appointment reminder. Please try again.')
    }
  }

  // Send appointment confirmation SMS
  async sendAppointmentConfirmation(phone, petNames, date, time, isHealthCert = false) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      
      // Create short SMS message
      const pets = Array.isArray(petNames) ? petNames.join(', ') : petNames
      const shortDate = this.formatDateForSMS(date)
      const service = isHealthCert ? 'Health Cert' : 'appt'
      
      const message = `${pets} ${service} on ${shortDate} at ${time} booked. Pending.`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'appointment_confirmation'
      }

      const response = await axios.post(`${this.baseURL}/send-appointment-confirmation`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      if (response.data.success) {
        console.log('SMS appointment confirmation sent successfully via Semaphore')
        return {
          success: true,
          messageId: response.data.messageId,
          message: response.data.message
        }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS confirmation')
      }
    } catch (error) {
      console.error('SMS appointment confirmation error:', error)
      
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
      
      throw new Error('Failed to send SMS appointment confirmation. Please try again.')
    }
  }

  // Helper function to format date for SMS (MMM dd format)
  formatDateForSMS(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const d = new Date(date)
    const month = months[d.getMonth()]
    const day = d.getDate().toString().padStart(2, '0')
    return `${month} ${day}`
  }

  // Send appointment approval SMS
  async sendAppointmentApproval(phone, petNames, date, time, isHealthCert = false) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      
      // Create short SMS message for approval
      const pets = Array.isArray(petNames) ? petNames.join(', ') : petNames
      const shortDate = this.formatDateForSMS(date)
      const service = isHealthCert ? 'Health Cert' : 'appt'
      
      const message = `${pets} ${service} on ${shortDate} at ${time} approved. See you soon!`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'appointment_approval'
      }
      const response = await axios.post(`${this.baseURL}/send-appointment-approval`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      })
      if (response.data.success) {
        console.log('SMS appointment approval sent successfully via Semaphore')
        return { success: true, messageId: response.data.messageId, message: response.data.message }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS approval')
      }
    } catch (error) {
      console.error('SMS appointment approval error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send SMS approval',
        details: error.response?.data || null
      }
    }
  }

  // Send appointment rejection SMS
  async sendAppointmentRejection(phone, petNames, date, time, isHealthCert = false) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      
      // Create short SMS message for rejection
      const pets = Array.isArray(petNames) ? petNames.join(', ') : petNames
      const shortDate = this.formatDateForSMS(date)
      const service = isHealthCert ? 'Health Cert' : 'appt'
      
      const message = `${pets} ${service} on ${shortDate} at ${time} rejected. Please contact us.`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'appointment_rejection'
      }
      const response = await axios.post(`${this.baseURL}/send-appointment-rejection`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      })
      if (response.data.success) {
        console.log('SMS appointment rejection sent successfully via Semaphore')
        return { success: true, messageId: response.data.messageId, message: response.data.message }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS rejection')
      }
    } catch (error) {
      console.error('SMS appointment rejection error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send SMS rejection',
        details: error.response?.data || null
      }
    }
  }

  // Send appointment reschedule SMS
  async sendAppointmentReschedule(phone, petNames, date, time, isHealthCert = false) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      
      // Create short SMS message for reschedule
      const pets = Array.isArray(petNames) ? petNames.join(', ') : petNames
      const shortDate = this.formatDateForSMS(date)
      const service = isHealthCert ? 'Health Cert' : 'appt'
      
      const message = `${pets} ${service} ${shortDate} at ${time} rescheduled. Please check new time.`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'appointment_reschedule'
      }
      const response = await axios.post(`${this.baseURL}/send-appointment-reschedule`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      })
      if (response.data.success) {
        console.log('SMS appointment reschedule sent successfully via Semaphore')
        return { success: true, messageId: response.data.messageId, message: response.data.message }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS reschedule')
      }
    } catch (error) {
      console.error('SMS appointment reschedule error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send SMS reschedule',
        details: error.response?.data || null
      }
    }
  }

  // Send appointment completion SMS
  async sendAppointmentCompletion(phone, petNames, date, time, isHealthCert = false) {
    try {
      const formattedPhone = this.formatPhoneForSMS(phone)
      
      // Create short SMS message for completion with feedback reminder
      const pets = Array.isArray(petNames) ? petNames.join(', ') : petNames
      const shortDate = this.formatDateForSMS(date)
      const service = isHealthCert ? 'Health Cert' : 'appt'
      
      const message = `${pets} ${service} on ${shortDate} at ${time} completed. Please leave feedback.`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'appointment_completion'
      }
      const response = await axios.post(`${this.baseURL}/send-appointment-completion`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      })
      if (response.data.success) {
        console.log('SMS appointment completion sent successfully via Semaphore')
        return { success: true, messageId: response.data.messageId, message: response.data.message }
      } else {
        throw new Error(response.data.message || 'Failed to send SMS completion')
      }
    } catch (error) {
      console.error('SMS appointment completion error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send SMS completion',
        details: error.response?.data || null
      }
    }
  }
}

export default new SMSService()
