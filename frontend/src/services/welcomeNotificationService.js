// services/welcomeNotificationService.js
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@shared/firebase';
import axios from 'axios';
import notificationService from './notificationService';

class WelcomeNotificationService {
  constructor() {
    this.apiUrl = 'https://us-central1-provet-calapan-3bc89.cloudfunctions.net/sendNotification';
    this.isEdge = navigator.userAgent.indexOf("Edg") !== -1;
  }

  async sendWelcomeNotification(userId, token) {
    try {
      // Get user data to personalize the message
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error('User document not found');
        return false;
      }
      
      const userData = userDoc.data();
      const firstName = userData.firstName || 'there';
      
      const title = 'Welcome to Provincial Veterinary!';
      const body = `Hi ${firstName}, thanks for enabling notifications. You'll now receive updates about your pet's health.`;
      const data = {
        type: 'welcome',
        url: '/user/notifications', // Direct to user notifications panel
        // Add a unique ID to prevent duplicate notifications
        id: `welcome_${userId}_${Date.now()}`
      };
      
      // Try methods in sequence, stopping after the first success
      let success = false;
      
      // Method 1: Call the HTTP function directly (preferred method)
      if (!success) {
        try {
          const notificationPayload = {
            token: token,
            notification: {
              title: title,
              body: body
            },
            data: data,
            browser: this.isEdge ? 'edge' : navigator.userAgent
          };
          
          const response = await axios.post(this.apiUrl, notificationPayload, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.status === 200 && response.data.success) {
            console.log('Welcome notification sent successfully via HTTP function');
            success = true;
          } else {
            console.warn('HTTP function response:', response.data);
          }
        } catch (httpError) {
          console.error('Error calling HTTP function:', httpError);
        }
      }
      
      // Method 2: Add to Firestore for the cloud function to handle (fallback)
      if (!success) {
        try {
          const notificationsRef = collection(db, 'notifications');
          await addDoc(notificationsRef, {
            token: token,
            title: title,
            body: body,
            data: data,
            browser: this.isEdge ? 'edge' : navigator.userAgent,
            createdAt: new Date(),
            sent: false
          });
          console.log('Welcome notification added to Firestore queue');
          success = true;
        } catch (firestoreError) {
          console.error('Error adding notification to Firestore:', firestoreError);
        }
      }
      
      // Method 3: Client-side fallback (last resort, especially for Edge)
      if (!success || this.isEdge) {
        const clientSuccess = notificationService.showNotification(title, body, data);
        if (clientSuccess) {
          console.log('Welcome notification shown via client-side fallback');
          success = true;
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return false;
    }
  }
  
  // Add a test method for debugging
  async testWelcomeNotification() {
    const title = 'Test Welcome Notification';
    const body = 'This is a test welcome notification.';
    const data = { 
      type: 'test', 
      url: '/user/notifications',
      id: `test_${Date.now()}` // Add unique ID
    };
    
    return notificationService.showNotification(title, body, data);
  }
}

export default new WelcomeNotificationService();