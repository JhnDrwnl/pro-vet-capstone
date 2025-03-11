// src/services/notificationService.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@shared/firebase';
import { nanoid } from 'nanoid';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.router = null;
    this.notificationsStore = null;
    this.initialized = false;
    this.userToken = null;
    this.processedNotifications = new Set(); // Track processed notifications to avoid duplicates
    this.initializationPromise = null; // Track initialization promise
  }

  setRouter(router) {
    this.router = router;
  }

  setNotificationsStore(store) {
    this.notificationsStore = store;
  }

  async initialize() {
    // If already initialized, return immediately
    if (this.initialized) return;
    
    // If initialization is in progress, wait for it to complete
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // Start initialization
    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }
  
  async _doInitialize() {
    try {
      console.log('Initializing notification service...');
      
      // Check if notifications are supported in this browser
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        this.initialized = true; // Mark as initialized even though it's not supported
        return;
      }

      // Initialize Firebase Messaging
      // Get messaging from the app instance instead of directly importing firebase
      const { getMessaging: getMessagingFromApp } = await import('firebase/messaging');
      const { app } = await import('@shared/firebase');
      this.messaging = getMessagingFromApp(app);

      // Handle foreground messages
      onMessage(this.messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        
        // Check if this is a duplicate notification
        const notificationId = payload.data?.id || `${payload.notification.title}_${Date.now()}`;
        
        if (this.processedNotifications.has(notificationId)) {
          console.log('Duplicate notification detected, ignoring:', notificationId);
          return;
        }
        
        // Mark this notification as processed
        this.processedNotifications.add(notificationId);
        
        // Clean up old processed notifications (keep only last 50)
        this.cleanupProcessedNotifications();

        // Show the notification
        this.showNotification(
          payload.notification.title,
          payload.notification.body,
          { ...(payload.data || {}), id: notificationId }
        );
        
        // Store in Firestore if store is available
        this.storeNotificationInFirestore(
          payload.notification.title,
          payload.notification.body,
          { ...(payload.data || {}), id: notificationId }
        );
      });

      // Set up service worker message listener for notification clicks
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
            console.log('Received notification click event from service worker');
            
            // If we have a notifications store, force refresh
            if (this.notificationsStore) {
              this.notificationsStore.clearNotifications();
              
              // Get current user
              const user = window.currentUser || null;
              if (user && user.userId) {
                this.notificationsStore.fetchNotifications(user.userId);
              }
            }
            
            // If we have a router and URL, navigate
            if (this.router && event.data.url) {
              console.log('Navigating to:', event.data.url);
              this.router.push(event.data.url);
            }
          }
        });
      }

      this.initialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      this.initialized = false; // Mark as not initialized on error
      this.initializationPromise = null; // Clear the promise so we can try again
      throw error;
    }
  }
  
  // Clean up old processed notifications
  cleanupProcessedNotifications() {
    if (this.processedNotifications.size > 100) {
      // Keep only the 50 most recent notifications
      const toRemove = this.processedNotifications.size - 50;
      const iterator = this.processedNotifications.values();
      
      for (let i = 0; i < toRemove; i++) {
        this.processedNotifications.delete(iterator.next().value);
      }
      
      console.log(`Cleaned up processed notifications cache, now tracking ${this.processedNotifications.size} notifications`);
    }
  }

  async checkPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    return Notification.permission;
  }

  async requestPermission() {
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Get token
        const token = await this.getToken();
        if (token) {
          console.log('Notification token obtained');
          this.userToken = token;
          return token;
        }
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }

    return null;
  }

  async getToken() {
    try {
      // Check if permission is already granted
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return null;
      }

      // Ensure messaging is initialized
      if (!this.messaging) {
        await this.initialize();
      }

      // Get token
      const currentToken = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      if (currentToken) {
        console.log('Current token:', currentToken.substring(0, 10) + '...');
        
        // Notify the service worker about the token (helpful for Edge browser)
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          registration.active.postMessage({
            type: 'REGISTER_TOKEN',
            token: currentToken
          });
        }
        
        return currentToken;
      } else {
        console.log('No token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async saveTokenToDatabase(token) {
    try {
      const user = window.currentUser;
      
      // Return if no user is logged in
      if (!user || !user.userId) {
        console.log('No user logged in, cannot save token');
        return false;
      }

      // Save the token to the user's document
      const userId = user.userId;
      const userRef = doc(db, 'users', userId);
      
      // First, check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update the user's FCM tokens
        await setDoc(userRef, {
          fcmTokens: {
            [token]: true
          },
          notificationsEnabled: true,
          notificationsConfigured: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('Token saved to database for user:', userId);
        return true;
      } else {
        console.log('User document does not exist');
        return false;
      }
    } catch (error) {
      console.error('Error saving token to database:', error);
      return false;
    }
  }

  // Check if a notification already exists in Firestore
  async isNotificationAlreadyInFirestore(userId, notificationId) {
    try {
      if (!userId || !notificationId) return false;
      
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('notificationId', '==', notificationId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking for existing notification in Firestore:', error);
      return false;
    }
  }

  showNotification(title, body, data = {}) {
    // Default notification options
    const options = {
      body: body,
      icon: '/favicon.ico',
      badge: '/notification-badge.png',
      data: {
        ...data,
        url: data.url || '/user/notifications'
      },
      requireInteraction: true
    };
    
    // Generate a unique ID for this notification
    const notificationId = data.id || `notification_${nanoid(8)}`;
    options.data.id = notificationId;
    options.tag = notificationId; // Use tag to replace existing notifications with the same ID

    // Check if this notification has already been processed
    if (this.processedNotifications.has(notificationId)) {
      console.log('Duplicate notification detected, ignoring:', notificationId);
      return null;
    }
    
    // Mark this notification as processed
    this.processedNotifications.add(notificationId);
    
    // Clean up old processed notifications
    this.cleanupProcessedNotifications();

    // If we have permission, show native notification
    if (Notification.permission === 'granted') {
      // Create and show the notification
      const notification = new Notification(title, options);
      
      // Handle notification click
      notification.onclick = () => {
        console.log('Notification clicked:', options.data);
        notification.close();
        
        // Focus window
        window.focus();
        
        // Handle navigation if URL is provided
        if (options.data.url && this.router) {
          console.log('Navigating to:', options.data.url);
          this.router.push(options.data.url);
        }
      };
      
      // Store in Firestore if store is available
      this.storeNotificationInFirestore(title, body, { ...data, id: notificationId });
      
      return notification;
    } else {
      console.log('Notification permission not granted');
      return null;
    }
  }

  async storeNotificationInFirestore(title, body, data = {}) {
    try {
      // Check if store is available
      if (!this.notificationsStore) {
        console.warn('Notifications store not available, cannot store notification');
        return;
      }
      
      // Get current user
      const user = window.currentUser || null;
      if (!user || !user.userId) {
        console.warn('No user logged in, cannot store notification');
        return;
      }
      
      const userId = user.userId;
      const notificationId = data.id || `notification_${nanoid(8)}`;
      
      // Check if this notification already exists in Firestore
      const alreadyExists = await this.isNotificationAlreadyInFirestore(userId, notificationId);
      if (alreadyExists) {
        console.log('Notification already exists in Firestore, skipping:', notificationId);
        return;
      }
      
      // Create notification object
      const notificationData = {
        userId: userId,
        notificationId: notificationId, // Store the ID for deduplication
        title: title,
        description: body,
        type: data.type || 'general',
        read: false,
        url: data.url || '/user/notifications',
        data: data || {},
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore via the store
      await this.notificationsStore.addNotification(notificationData);
      console.log('Notification stored in Firestore:', notificationId);
    } catch (error) {
      console.error('Error storing notification in Firestore:', error);
    }
  }
  
  // Clear the processed notifications cache (for testing)
  clearProcessedNotifications() {
    this.processedNotifications.clear();
    console.log('Cleared processed notifications cache');
    
    // Also clear the service worker's cache if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active.postMessage({
          type: 'CLEAR_DUPLICATE_CACHE'
        });
      }).catch(err => {
        console.error('Error clearing service worker cache:', err);
      });
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

// Export the singleton instance
export default notificationService;