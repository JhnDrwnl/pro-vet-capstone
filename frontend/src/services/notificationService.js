// src/services/notificationService.js
import { messaging } from '@shared/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@shared/firebase';

class NotificationService {
  constructor() {
    this.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    this.initialized = false;
    this.isEdge = this.detectEdgeBrowser();
    this.router = null; // Will be set later
    this.processedNotifications = new Set(); // Track processed notifications
    this.notificationsStore = null; // Will be set later, NOT in constructor
  }

  // Set router instance
  setRouter(router) {
    this.router = router;
  }

  // Set notifications store - will be called from main.js AFTER Pinia is initialized
  setNotificationsStore(store) {
    this.notificationsStore = store;
  }

  // Detect if browser is Microsoft Edge
  detectEdgeBrowser() {
    return navigator.userAgent.indexOf("Edg") !== -1;
  }

  // Initialize the service
  async initialize() {
    if (this.initialized || !messaging) return;
    
    try {
      // Set up foreground message handler
      this.setupForegroundHandler();
      this.initialized = true;
      console.log('Notification service initialized', this.isEdge ? '(Microsoft Edge detected)' : '');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Request permission and get FCM token
  async requestPermission() {
    try {
      if (!messaging) {
        console.warn('Firebase messaging is not available');
        return null;
      }

      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        console.log('Notification permission already granted');
        return await this.getFCMToken();
      }

      // Request permission
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission response:', permission);
      
      if (permission === 'granted') {
        return await this.getFCMToken();
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      if (!messaging) {
        console.warn('Firebase messaging is not available');
        return null;
      }

      console.log('Getting FCM token with vapid key...');
      const currentToken = await getToken(messaging, {
        vapidKey: this.vapidKey
      });

      if (currentToken) {
        console.log('FCM token obtained:', currentToken.substring(0, 10) + '...');
        
        // For Edge, we need to manually register the token with the service worker
        if (this.isEdge) {
          this.registerTokenWithServiceWorker(currentToken);
        }
        
        return currentToken;
      } else {
        console.log('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      
      // Special handling for Edge-specific errors
      if (this.isEdge && error.code === 'messaging/permission-blocked') {
        console.log('Edge-specific permission issue. Trying alternative approach...');
        return this.getEdgeToken();
      }
      
      return null;
    }
  }
  
  // Edge-specific token retrieval
  async getEdgeToken() {
    try {
      // For Edge, we might need to use a different approach
      // This is a fallback method that might work in some Edge versions
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
        });
        
        // Generate a pseudo-token from the subscription
        const token = btoa(JSON.stringify(subscription));
        console.log('Edge alternative token generated');
        return token;
      }
      return null;
    } catch (error) {
      console.error('Edge alternative token error:', error);
      return null;
    }
  }
  
  // Helper function to convert base64 to Uint8Array for push subscription
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  // Register token with service worker for Edge
  async registerTokenWithServiceWorker(token) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.active.postMessage({
          type: 'REGISTER_TOKEN',
          token: token
        });
        console.log('Token registered with service worker for Edge');
      } catch (error) {
        console.error('Error registering token with service worker:', error);
      }
    }
  }

  // Save FCM token to user document
  async saveTokenToDatabase(token) {
    try {
      // Get current user from global window object if available
      const user = window.currentUser || null;
      
      if (!user || !user.userId) {
        console.warn('No user logged in or user data not available');
        return false;
      }

      const userId = user.userId;
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        fcmToken: token,
        notificationsEnabled: true,
        notificationsConfigured: true,
        browser: this.isEdge ? 'edge' : navigator.userAgent,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('FCM token saved to database');
      return true;
    } catch (error) {
      console.error('Error saving FCM token to database:', error);
      return false;
    }
  }

  // Set up foreground message handler
  setupForegroundHandler() {
    if (!messaging) {
      console.warn('Firebase messaging is not available');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Check if this notification has already been processed
      const notificationId = payload.data?.id || `${payload.notification.title}_${Date.now()}`;
      
      if (this.processedNotifications.has(notificationId)) {
        console.log('Duplicate notification detected, ignoring:', notificationId);
        return;
      }
      
      // Mark this notification as processed
      this.processedNotifications.add(notificationId);
      
      // Display a notification
      if (payload.notification) {
        this.showNotification(
          payload.notification.title,
          payload.notification.body,
          payload.data || { url: '/user/notifications', id: notificationId } // Default to user notifications panel
        );
        
        // Store notification in Firestore
        this.storeNotificationInFirestore(
          payload.notification.title,
          payload.notification.body,
          payload.data
        );
      }
      
      // Clean up old processed notifications (keep only last 50)
      if (this.processedNotifications.size > 50) {
        const iterator = this.processedNotifications.values();
        this.processedNotifications.delete(iterator.next().value);
      }
    });
  }

  // Store notification in Firestore
  async storeNotificationInFirestore(title, body, data = {}) {
    try {
      // Check if store is available
      if (!this.notificationsStore) {
        console.warn('Notifications store not available, cannot store notification');
        return null;
      }
      
      // Get current user
      const user = window.currentUser || null;
      
      if (!user || !user.userId) {
        console.warn('No user logged in, cannot store notification');
        return null;
      }
      
      const userId = user.userId;
      
      // Prepare notification data
      const notificationData = {
        userId: userId,
        title: title,
        description: body,
        type: data.type || 'general',
        read: false,
        url: data.url || '/user/notifications',
        createdAt: serverTimestamp(),
        data: data || {}
      };
      
      // Use the notifications store to add the notification
      const notificationId = await this.notificationsStore.addNotification(notificationData);
      
      console.log('Notification stored in Firestore:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error storing notification in Firestore:', error);
      return null;
    }
  }

  // Show a notification
  showNotification(title, body, data = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // If no URL is provided, default to the notifications panel
        if (!data.url) {
          data.url = '/user/notifications';
        }
        
        // Check if this notification has already been processed
        const notificationId = data.id || `${title}_${Date.now()}`;
        
        if (this.processedNotifications.has(notificationId)) {
          console.log('Duplicate notification detected, ignoring:', notificationId);
          return false;
        }
        
        // Mark this notification as processed
        this.processedNotifications.add(notificationId);
        
        const notification = new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          data: data,
          requireInteraction: true, // Keep notification until user interacts with it
          tag: notificationId // Use tag to replace existing notifications with the same ID
        });

        notification.onclick = () => {
          notification.close();
          window.focus();
          
          // Handle click action
          if (data && data.url) {
            // If we have a router instance, use it for navigation
            if (this.router) {
              this.router.push(data.url);
            } else {
              // Fallback to direct navigation
              window.location.href = data.url;
            }
          }
        };
        
        // Store notification in Firestore
        this.storeNotificationInFirestore(title, body, data);
        
        console.log('Client-side notification shown');
        return true;
      } catch (error) {
        console.error('Error showing notification:', error);
        return false;
      }
    } else {
      console.warn('Notifications not available or permission not granted');
      return false;
    }
  }
  
  // Test notification (for debugging)
  async testNotification() {
    const notificationData = { 
      url: '/user/notifications',
      id: `test_${Date.now()}`, // Add unique ID
      type: 'test'
    };
    
    const shown = this.showNotification(
      'Test Notification',
      'This is a test notification to verify if notifications are working.',
      notificationData
    );
    
    return shown;
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Export the singleton instance
export default notificationService;