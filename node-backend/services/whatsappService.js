const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    
    this.isReady = false;
    this.initialize();
  }
  
  initialize() {
    this.client.on('qr', (qr) => {
      console.log('🔐 WhatsApp QR Code Generated:');
      qrcode.generate(qr, { small: true });
      console.log('📱 Scan this QR code with your WhatsApp to log in');
      console.log('💡 Make sure to scan with the phone number you want to use for sending messages');
    });
    
    this.client.on('ready', () => {
      console.log('✅ WhatsApp client is ready!');
      console.log('📱 You can now send WhatsApp notifications');
      this.isReady = true;
    });
    
    this.client.on('disconnected', () => {
      console.log('❌ WhatsApp client disconnected');
      this.isReady = false;
    });
    
    this.client.on('auth_failure', (msg) => {
      console.log('❌ WhatsApp authentication failed:', msg);
    });
    
    this.client.initialize();
  }
  
  async sendRescheduleNotification(phoneNumber, appointmentData, rescheduleData) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet. Please scan the QR code first.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = this.createRescheduleMessage(appointmentData, rescheduleData);
      
      console.log(`📱 Sending WhatsApp message to: ${formattedNumber}`);
      
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      
      console.log('✅ WhatsApp message sent successfully:', result.id._serialized);
      return result;
      
    } catch (error) {
      console.error('❌ WhatsApp sending failed:', error);
      throw error;
    }
  }
  
  formatPhoneNumber(phone) {
    // Remove +, spaces, and dashes
    let cleaned = phone.replace(/[\+\s\-\(\)]/g, '');
    
    // Add country code if not present (assuming Philippines +63)
    if (!cleaned.startsWith('63') && cleaned.length === 10) {
      cleaned = '63' + cleaned;
    }
    
    return cleaned;
  }
  
  createRescheduleMessage(appointment, rescheduleData) {
    const petName = appointment.petNames?.join(', ') || appointment.petName || 'Pet';
    const currentDate = this.formatDate(appointment.date) || 'Date not specified';
    const currentTime = appointment.time || 'Time not specified';
    const ownerName = appointment.ownerName || 'Valued Client';
    
    return `🏥 *ProVet Calapan - Appointment Reschedule Request*

Dear ${ownerName},

Your appointment for *${petName}* has a reschedule request from your veterinarian.

📅 *Current Appointment:*
   Date: ${currentDate}
   Time: ${currentTime}

🔄 *Reschedule Request:*
   Reason: ${rescheduleData.reason}
   Suggested Date: ${this.formatDate(rescheduleData.suggestedDate)}
   Suggested Time: ${rescheduleData.suggestedTime}

📞 *Please contact the clinic to:*
   • Accept the suggested time
   • Propose an alternative time
   • Discuss any concerns

🏥 *Clinic Contact:*
   Phone: [Your Clinic Phone]
   Address: [Your Clinic Address]

Thank you for your understanding.

---
*This is an automated message from ProVet Calapan*
Reply with "STOP" to unsubscribe from notifications.`;
  }
  
  formatDate(date) {
    if (date?.toDate) {
      date = date.toDate();
    }
    return new Date(date).toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  getStatus() {
    return {
      isReady: this.isReady,
      isConnected: this.client.isConnected
    };
  }
  
  // Test method for sending simple messages
  async sendTestMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet. Please scan the QR code first.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      console.log(`📱 Sending test message to: ${formattedNumber}`);
      
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      
      console.log('✅ Test message sent successfully:', result.id._serialized);
      return result;
      
    } catch (error) {
      console.error('❌ Test message failed:', error);
      throw error;
    }
  }

  // Send appointment approval notification
  async sendAppointmentApproval(phoneNumber, appointmentData) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet. Please scan the QR code first.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = this.createApprovalMessage(appointmentData);
      
      console.log(`📱 Sending approval notification to: ${formattedNumber}`);
      console.log(`📝 Message content: ${message.substring(0, 100)}...`);
      
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      
      console.log('✅ Approval notification sent successfully:', result.id._serialized);
      return result;
      
    } catch (error) {
      console.error('❌ Approval notification failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        phoneNumber,
        appointmentData: JSON.stringify(appointmentData, null, 2)
      });
      throw error;
    }
  }

  // Send appointment rejection notification
  async sendAppointmentRejection(phoneNumber, appointmentData, reason) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet. Please scan the QR code first.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = this.createRejectionMessage(appointmentData, reason);
      
      console.log(`📱 Sending rejection notification to: ${formattedNumber}`);
      
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      
      console.log('✅ Rejection notification sent successfully:', result.id._serialized);
      return result;
      
    } catch (error) {
      console.error('❌ Rejection notification failed:', error);
      throw error;
    }
  }

  // Send appointment cancellation notification
  async sendAppointmentCancellation(phoneNumber, appointmentData, reason) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet. Please scan the QR code first.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = this.createCancellationMessage(appointmentData, reason);
      
      console.log(`📱 Sending cancellation notification to: ${formattedNumber}`);
      
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      
      console.log('✅ Cancellation notification sent successfully:', result.id._serialized);
      return result;
      
    } catch (error) {
      console.error('❌ Cancellation notification failed:', error);
      throw error;
    }
  }

  // Send appointment completion notification
  async sendAppointmentCompletion(phoneNumber, appointmentData) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready yet. Please scan the QR code first.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = this.createCompletionMessage(appointmentData);
      
      console.log(`📱 Sending completion notification to: ${formattedNumber}`);
      
      const result = await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      
      console.log('✅ Completion notification sent successfully:', result.id._serialized);
      return result;
      
    } catch (error) {
      console.error('❌ Completion notification failed:', error);
      throw error;
    }
  }

  // Create approval message
  createApprovalMessage(appointment) {
    const petName = appointment.petNames?.join(', ') || appointment.petName || 'Pet';
    const appointmentDate = this.formatDate(appointment.date) || 'Date not specified';
    const appointmentTime = appointment.time || 'Time not specified';
    const ownerName = appointment.ownerName || 'Valued Client';
    
    return `✅ *ProVet Calapan - Appointment Approved!*

Dear ${ownerName},

Great news! Your appointment has been approved by our veterinary team.

📅 *Appointment Details:*
   Pet: ${petName}
   Date: ${appointmentDate}
   Time: ${appointmentTime}
   Services: ${appointment.services?.map(s => this.getServiceDisplayName(s)).join(', ') || 'Not specified'}

🏥 *Important Reminders:*
   • Please arrive 10-15 minutes early
   • Bring your pet's medical records if available
   • Have your pet on a leash or in a carrier
   • Bring any current medications

📞 *Contact Information:*
   Phone: [Your Clinic Phone]
   Address: [Your Clinic Address]

We look forward to seeing you and ${petName}!

---
*This is an automated message from ProVet Calapan*
Reply with "STOP" to unsubscribe from notifications.`;
  }

  // Create rejection message
  createRejectionMessage(appointment, reason) {
    const petName = appointment.petNames?.join(', ') || appointment.petName || 'Pet';
    const appointmentDate = this.formatDate(appointment.date) || 'Date not specified';
    const appointmentTime = appointment.time || 'Time not specified';
    const ownerName = appointment.ownerName || 'Valued Client';
    
    return `❌ *ProVet Calapan - Appointment Not Available*

Dear ${ownerName},

We regret to inform you that we cannot accommodate your appointment request.

📅 *Requested Appointment:*
   Pet: ${petName}
   Date: ${appointmentDate}
   Time: ${appointmentTime}

📋 *Reason:*
   ${reason || 'Schedule conflict or unavailability'}

🔄 *Next Steps:*
   • Please contact us to reschedule
   • We can suggest alternative dates and times
   • We apologize for any inconvenience

📞 *Contact Information:*
   Phone: [Your Clinic Phone]
   Address: [Your Clinic Address]

Thank you for understanding.

---
*This is an automated message from ProVet Calapan*
Reply with "STOP" to unsubscribe from notifications.`;
  }

  // Create cancellation message
  createCancellationMessage(appointment, reason) {
    const petName = appointment.petNames?.join(', ') || appointment.petName || 'Pet';
    const appointmentDate = this.formatDate(appointment.date) || 'Date not specified';
    const appointmentTime = appointment.time || 'Time not specified';
    const ownerName = appointment.ownerName || 'Valued Client';
    
    return `🚫 *ProVet Calapan - Appointment Cancelled*

Dear ${ownerName},

Your appointment has been cancelled as requested.

📅 *Cancelled Appointment:*
   Pet: ${petName}
   Date: ${appointmentDate}
   Time: ${appointmentTime}

📋 *Reason for Cancellation:*
   ${reason || 'Cancelled by request'}

🔄 *To Reschedule:*
   • Contact us to book a new appointment
   • We're happy to accommodate your schedule
   • No cancellation fees apply

📞 *Contact Information:*
   Phone: [Your Clinic Phone]
   Address: [Your Clinic Address]

We hope to see you and ${petName} soon!

---
*This is an automated message from ProVet Calapan*
Reply with "STOP" to unsubscribe from notifications.`;
  }

  // Create completion message
  createCompletionMessage(appointment) {
    const petName = appointment.petNames?.join(', ') || appointment.petName;
    const appointmentDate = this.formatDate(appointment.date);
    
    return `🎉 *ProVet Calapan - Appointment Completed!*

Dear ${appointment.ownerName},

Thank you for choosing ProVet Calapan! Your appointment has been completed successfully.

📅 *Completed Appointment:*
   Pet: ${petName}
   Date: ${appointmentDate}

💊 *Follow-up Instructions:*
   • Follow any medication instructions provided
   • Schedule follow-up if recommended
   • Contact us if you have any concerns
   • Keep your pet's medical records updated

⭐ *We'd love your feedback!*
   Your experience helps us improve our services.

📞 *Contact Information:*
   Phone: [Your Clinic Phone]
   Address: [Your Clinic Address]

Thank you for trusting us with ${petName}'s care!

---
*This is an automated message from ProVet Calapan*
Reply with "STOP" to unsubscribe from notifications.`;
  }

  // Helper method to get service display name
  getServiceDisplayName(serviceId) {
    // This should be implemented to get service names from your services collection
    // For now, return the serviceId as a fallback
    return serviceId || 'Service';
  }
}

module.exports = new WhatsAppService();
