import { db } from '@shared/firebase';

class NotificationSyncService {
  constructor() {
    this.initialized = false;
    this.notificationsStore = null; // Will be set later, NOT in constructor
  }
  
  // Set notifications store - will be called from main.js AFTER Pinia is initialized
  setNotificationsStore(store) {
    this.notificationsStore = store;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Check if store is available
      if (!this.notificationsStore) {
        console.warn('Notifications store not available, cannot initialize sync service');
        return;
      }
      
      // Check if service worker is available
      if ('serviceWorker' in navigator) {
        // Request to sync notifications from service worker
        await this.syncNotificationsFromServiceWorker();
        
        // Set up periodic sync
        setInterval(() => {
          this.syncNotificationsFromServiceWorker();
        }, 60000); // Sync every minute
      }
      
      this.initialized = true;
      console.log('Notification sync service initialized');
    } catch (error) {
      console.error('Error initializing notification sync service:', error);
    }
  }
  
  async syncNotificationsFromServiceWorker() {
    try {
      // Check if store is available
      if (!this.notificationsStore) {
        console.warn('Notifications store not available, cannot sync notifications');
        return;
      }
      
      // Get current user
      const user = window.currentUser || null;
      if (!user || !user.userId) {
        console.warn('No user logged in, cannot sync notifications');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      
      // Create a message channel for the response
      const messageChannel = new MessageChannel();
      
      // Create a promise to handle the response
      const responsePromise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.type === 'UNSYNCED_NOTIFICATIONS') {
            resolve(event.data.notifications);
          } else {
            resolve([]);
          }
        };
      });
      
      // Send message to service worker
      registration.active.postMessage(
        { type: 'SYNC_NOTIFICATIONS' },
        [messageChannel.port2]
      );
      
      // Wait for response
      const unsyncedNotifications = await responsePromise;
      
      if (unsyncedNotifications.length > 0) {
        console.log(`Found ${unsyncedNotifications.length} unsynced notifications`);
        
        // Add each notification to Firestore
        const syncPromises = unsyncedNotifications.map(async (notification) => {
          // Prepare notification data for Firestore
          const notificationData = {
            userId: user.userId,
            title: notification.title,
            description: notification.body,
            type: notification.data?.type || 'general',
            read: false,
            url: notification.data?.url || '/user/notifications',
            data: notification.data || {}
          };
          
          // Add to Firestore
          await this.notificationsStore.addNotification(notificationData);
          
          return notification.id;
        });
        
        // Wait for all notifications to be added
        const syncedIds = await Promise.all(syncPromises);
        
        // Mark notifications as synced in service worker
        registration.active.postMessage({
          type: 'MARK_NOTIFICATIONS_SYNCED',
          ids: syncedIds
        });
        
        console.log(`Synced ${syncedIds.length} notifications to Firestore`);
      }
    } catch (error) {
      console.error('Error syncing notifications from service worker:', error);
    }
  }
}

// Create a singleton instance
const notificationSyncService = new NotificationSyncService();

// Export the singleton instance
export default notificationSyncService;