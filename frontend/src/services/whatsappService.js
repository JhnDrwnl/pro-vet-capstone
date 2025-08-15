// src/services/whatsappService.js
import axios from 'axios'

class WhatsAppService {
  constructor() {
    this.baseURL = '/api/whatsapp' // Assuming your backend API route
  }

  // Generate a 6-digit OTP code
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Format Philippine phone number for WhatsApp
  formatPhoneForWhatsApp(phone) {
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

  // Send WhatsApp OTP
  async sendOTP(phone, otp) {
    try {
      const formattedPhone = this.formatPhoneForWhatsApp(phone)
      const message = `🔐 *InnoVet Verification Code*

Your verification code is: *${otp}*

⏰ Valid for 5 minutes
🔒 Do not share this code with anyone

---
*This is an automated message from InnoVet*
Reply with "STOP" to unsubscribe.`
      
      const payload = {
        phoneNumber: formattedPhone,
        message: message
      }

      const response = await axios.post(`${this.baseURL}/send-otp`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        console.log('WhatsApp OTP sent successfully')
        return {
          success: true,
          messageId: response.data.messageId,
          otp: otp
        }
      } else {
        throw new Error(response.data.message || 'Failed to send WhatsApp message')
      }
    } catch (error) {
      console.error('WhatsApp sending error:', error)
      throw new Error(error.response?.data?.message || 'Failed to send WhatsApp verification code')
    }
  }

  // Send appointment approval notification
  async sendAppointmentApproval(phoneNumber, appointment, retryCount = 0) {
    try {
      console.log('🔍 DEBUG: sendAppointmentApproval called with:', { phoneNumber, appointment, retryCount });
      
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber)
      console.log('🔍 DEBUG: Formatted phone:', formattedPhone);
      
      const payload = {
        phoneNumber: formattedPhone,
        appointment: appointment
      }
      console.log('🔍 DEBUG: Request payload:', payload);
      console.log('🔍 DEBUG: Request URL:', `${this.baseURL}/send-approval`);

      const response = await axios.post(`${this.baseURL}/send-approval`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })

      console.log('🔍 DEBUG: Response received:', response);

      if (response.data.success) {
        console.log('WhatsApp approval notification sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send approval notification')
      }
    } catch (error) {
      console.error('WhatsApp approval notification error:', error)
      console.error('🔍 DEBUG: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        retryCount
      });
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
        console.log(`🔄 Retrying WhatsApp approval notification (attempt ${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.sendAppointmentApproval(phoneNumber, appointment, retryCount + 1);
      }
      
      // If all retries failed, return a fallback response
      console.log('⚠️ WhatsApp approval failed after retries, using fallback');
      return {
        success: false,
        messageId: null,
        fallback: true,
        error: error.message
      };
    }
  }

  // Send appointment rejection notification
  async sendAppointmentRejection(phoneNumber, appointment, reason, retryCount = 0) {
    try {
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber)
      
      const payload = {
        phoneNumber: formattedPhone,
        appointment: appointment,
        reason: reason
      }

      const response = await axios.post(`${this.baseURL}/send-rejection`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })

      if (response.data.success) {
        console.log('WhatsApp rejection notification sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send rejection notification')
      }
    } catch (error) {
      console.error('WhatsApp rejection notification error:', error)
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
        console.log(`🔄 Retrying WhatsApp rejection notification (attempt ${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.sendAppointmentRejection(phoneNumber, appointment, reason, retryCount + 1);
      }
      
      // If all retries failed, return a fallback response
      console.log('⚠️ WhatsApp rejection failed after retries, using fallback');
      return {
        success: false,
        messageId: null,
        fallback: true,
        error: error.message
      };
    }
  }

  // Send appointment cancellation notification
  async sendAppointmentCancellation(phoneNumber, appointment, reason, retryCount = 0) {
    try {
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber)
      
      const payload = {
        phoneNumber: formattedPhone,
        appointment: appointment,
        reason: reason
      }

      const response = await axios.post(`${this.baseURL}/send-cancellation`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })

      if (response.data.success) {
        console.log('WhatsApp cancellation notification sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send cancellation notification')
      }
    } catch (error) {
      console.error('WhatsApp cancellation notification error:', error)
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
        console.log(`🔄 Retrying WhatsApp cancellation notification (attempt ${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.sendAppointmentCancellation(phoneNumber, appointment, reason, retryCount + 1);
      }
      
      // If all retries failed, return a fallback response
      console.log('⚠️ WhatsApp cancellation failed after retries, using fallback');
      return {
        success: false,
        messageId: null,
        fallback: true,
        error: error.message
      };
    }
  }

  // Send appointment completion notification
  async sendAppointmentCompletion(phoneNumber, appointment, retryCount = 0) {
    try {
      console.log('🔍 DEBUG: sendAppointmentCompletion called with:', { phoneNumber, appointment, retryCount });
      
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber)
      console.log('🔍 DEBUG: Formatted phone:', formattedPhone);
      
      const payload = {
        phoneNumber: formattedPhone,
        appointment: appointment
      }
      console.log('🔍 DEBUG: Request payload:', payload);
      console.log('🔍 DEBUG: Request URL:', `${this.baseURL}/send-completion`);

      const response = await axios.post(`${this.baseURL}/send-completion`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })

      console.log('🔍 DEBUG: Response received:', response);

      if (response.data.success) {
        console.log('WhatsApp completion notification sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send completion notification')
      }
    } catch (error) {
      console.error('WhatsApp completion notification error:', error)
      console.error('🔍 DEBUG: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        retryCount
      });
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
        console.log(`🔄 Retrying WhatsApp completion notification (attempt ${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.sendAppointmentCompletion(phoneNumber, appointment, retryCount + 1);
      }
      
      // If all retries failed, return a fallback response
      console.log('⚠️ WhatsApp completion failed after retries, using fallback');
      return {
        success: false,
        messageId: null,
        fallback: true,
        error: error.message
      };
    }
  }

  // Send reschedule notification
  async sendRescheduleNotification(phoneNumber, appointment, rescheduleData, retryCount = 0) {
    try {
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber)
      
      const payload = {
        phoneNumber: formattedPhone,
        appointment: appointment,
        rescheduleData: rescheduleData
      }

      const response = await axios.post(`${this.baseURL}/send-reschedule`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })

      if (response.data.success) {
        console.log('WhatsApp reschedule notification sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send reschedule notification')
      }
    } catch (error) {
      console.error('WhatsApp reschedule notification error:', error)
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
        console.log(`🔄 Retrying WhatsApp reschedule notification (attempt ${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.sendRescheduleNotification(phoneNumber, appointment, rescheduleData, retryCount + 1);
      }
      
      // If all retries failed, return a fallback response
      console.log('⚠️ WhatsApp reschedule failed after retries, using fallback');
      return {
        success: false,
        messageId: null,
        fallback: true,
        error: error.message
      };
    }
  }

  // Handle WhatsApp failure with fallback options
  async handleWhatsAppFailure(actionType, appointment, phoneNumber, reason = null) {
    console.log(`🔄 Handling WhatsApp failure for ${actionType} - implementing fallback...`);
    
    try {
      // Option 1: Try to send via email if available (future implementation)
      // Option 2: Store in a retry queue for later processing
      // Option 3: Log the failure for manual follow-up
      
      // For now, we'll log the failure and return a fallback response
      const fallbackData = {
        actionType,
        appointmentId: appointment.id,
        phoneNumber,
        reason,
        timestamp: new Date().toISOString(),
        status: 'failed'
      };
      
      console.log('📝 WhatsApp failure logged for manual follow-up:', fallbackData);
      
      // You could also store this in Firestore for admin review
      // await this.logWhatsAppFailure(fallbackData);
      
      return {
        success: false,
        messageId: null,
        fallback: true,
        error: 'WhatsApp service unavailable',
        fallbackData
      };
      
    } catch (fallbackError) {
      console.error('❌ Fallback handling also failed:', fallbackError);
      return {
        success: false,
        messageId: null,
        fallback: false,
        error: 'Both WhatsApp and fallback failed'
      };
    }
  }

  // Check WhatsApp service status
  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/status`)
      return response.data
    } catch (error) {
      console.error('WhatsApp status check error:', error)
      throw new Error('Failed to check WhatsApp service status')
    }
  }

  // Send test message
  async sendTestMessage(phone, message) {
    try {
      const formattedPhone = this.formatPhoneForWhatsApp(phone)
      
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
        console.log('WhatsApp test message sent successfully')
        return {
          success: true,
          messageId: response.data.messageId
        }
      } else {
        throw new Error(response.data.message || 'Failed to send test message')
      }
    } catch (error) {
      console.error('WhatsApp test message error:', error)
      throw new Error(error.response?.data?.message || 'Failed to send test message')
    }
  }
}

export default new WhatsAppService()
