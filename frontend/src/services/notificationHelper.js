// services/notificationHelper.js
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';

class NotificationHelper {
  /**
   * Add a notification to Firestore to be sent by the cloud function
   * @param {string} token - The FCM token
   * @param {string} title - The notification title
   * @param {string} body - The notification body
   * @param {Object} data - Additional data for the notification
   * @returns {Promise<string>} - The notification document ID
   */
  async addNotification(token, title, body, data = {}) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        token,
        title,
        body,
        data,
        createdAt: new Date(),
        sent: false
      });
      
      console.log('Notification added to queue with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a welcome notification to a user
   * @param {string} token - The user's FCM token
   * @param {string} firstName - The user's first name
   * @returns {Promise<string>} - The notification document ID
   */
  async sendWelcomeNotification(token, firstName = 'there') {
    return this.addNotification(
      token,
      'Welcome to Provincial Veterinary!',
      `Hi ${firstName}, thanks for enabling notifications. You'll now receive updates about your pet's health.`,
      {
        type: 'welcome',
        url: '/dashboard'
      }
    );
  }
  
  /**
   * Send an appointment reminder notification
   * @param {string} token - The user's FCM token
   * @param {Object} appointment - The appointment details
   * @returns {Promise<string>} - The notification document ID
   */
  async sendAppointmentReminder(token, appointment) {
    const { petName, date, time, doctorName } = appointment;
    
    return this.addNotification(
      token,
      `Appointment Reminder: ${petName}`,
      `Don't forget your appointment for ${petName} with Dr. ${doctorName} on ${date} at ${time}.`,
      {
        type: 'appointment',
        appointmentId: appointment.id,
        url: `/appointments/${appointment.id}`
      }
    );
  }
  
  /**
   * Send a medication reminder notification
   * @param {string} token - The user's FCM token
   * @param {Object} medication - The medication details
   * @returns {Promise<string>} - The notification document ID
   */
  async sendMedicationReminder(token, medication) {
    const { petName, medicationName } = medication;
    
    return this.addNotification(
      token,
      `Medication Reminder: ${petName}`,
      `Time to give ${medicationName} to ${petName}.`,
      {
        type: 'medication',
        medicationId: medication.id,
        url: `/pets/${medication.petId}/medications`
      }
    );
  }
}

export default new NotificationHelper();