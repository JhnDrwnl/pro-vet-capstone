import { defineStore } from 'pinia';
import { db } from '@shared/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
    lastFetched: null,
    processedIds: new Set() // Track processed notification IDs
  }),
  
  getters: {
    getNotifications: (state) => state.notifications,
    getUnreadCount: (state) => state.unreadCount,
    getFilteredNotifications: (state) => (filterType, searchQuery) => {
      let filtered = state.notifications;
      
      // Filter by read/unread status
      if (filterType === 'unread') {
        filtered = filtered.filter(notification => !notification.read);
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(notification => 
          notification.title.toLowerCase().includes(query) ||
          notification.description.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  
  actions: {
    // Fetch notifications for the current user
    async fetchNotifications(userId) {
      if (!userId) return;
      
      console.log('fetchNotifications called for userId:', userId);
      
      this.loading = true;
      this.error = null;
      
      try {
        // First try with the composite index
        try {
          const notificationsRef = collection(db, 'notifications');
          const q = query(
            notificationsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
          
          const querySnapshot = await getDocs(q);
          const notifications = [];
          
          querySnapshot.forEach((doc) => {
            // Skip if we've already processed this notification
            if (this.processedIds.has(doc.id)) return;
            
            // Add to processed IDs
            this.processedIds.add(doc.id);
            
            notifications.push({
              id: doc.id,
              ...doc.data(),
              date: doc.data().createdAt?.toDate() || new Date()
            });
          });
          
          // Merge with existing notifications, avoiding duplicates
          this.mergeNotifications(notifications);
          this.calculateUnreadCount();
          this.lastFetched = new Date();
          
          console.log('Notifications fetched:', this.notifications.length);
        } catch (indexError) {
          // If the index error occurs, try a simpler query without orderBy
          if (indexError.message && indexError.message.includes('requires an index')) {
            console.warn('Firestore index required. Falling back to simpler query.');
            
            const notificationsRef = collection(db, 'notifications');
            const q = query(
              notificationsRef,
              where('userId', '==', userId),
              limit(50)
            );
            
            const querySnapshot = await getDocs(q);
            const notifications = [];
            
            querySnapshot.forEach((doc) => {
              // Skip if we've already processed this notification
              if (this.processedIds.has(doc.id)) return;
              
              // Add to processed IDs
              this.processedIds.add(doc.id);
              
              notifications.push({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate() || new Date()
              });
            });
            
            // Sort manually since we can't use orderBy
            notifications.sort((a, b) => b.date - a.date);
            
            // Merge with existing notifications, avoiding duplicates
            this.mergeNotifications(notifications);
            this.calculateUnreadCount();
            this.lastFetched = new Date();
            
            console.log('Notifications fetched with fallback query:', this.notifications.length);
            
            // Still throw the original error so the user knows to create the index
            throw indexError;
          } else {
            // If it's not an index error, rethrow
            throw indexError;
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Merge notifications, avoiding duplicates
    mergeNotifications(newNotifications) {
      if (!newNotifications || newNotifications.length === 0) return;
      
      // Create a map of existing notifications by ID for quick lookup
      const existingMap = new Map();
      this.notifications.forEach(notification => {
        existingMap.set(notification.id, notification);
      });
      
      // Add only new notifications
      newNotifications.forEach(notification => {
        if (!existingMap.has(notification.id)) {
          this.notifications.push(notification);
        }
      });
      
      // Sort by date (newest first)
      this.notifications.sort((a, b) => b.date - a.date);
      
      // Limit to 100 notifications to prevent memory issues
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }
    },
    
    // Set up real-time listener for new notifications
    subscribeToNotifications(userId) {
      if (!userId) return null;
      
      try {
        // First try with the composite index
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        return onSnapshot(q, (snapshot) => {
          const newNotifications = [];
          
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              // Skip if we've already processed this notification
              if (this.processedIds.has(change.doc.id)) return;
              
              // Add to processed IDs
              this.processedIds.add(change.doc.id);
              
              const notification = {
                id: change.doc.id,
                ...change.doc.data(),
                date: change.doc.data().createdAt?.toDate() || new Date()
              };
              
              newNotifications.push(notification);
            }
            
            if (change.type === 'modified') {
              const updatedNotification = {
                id: change.doc.id,
                ...change.doc.data(),
                date: change.doc.data().createdAt?.toDate() || new Date()
              };
              
              const index = this.notifications.findIndex(n => n.id === updatedNotification.id);
              if (index !== -1) {
                this.notifications[index] = updatedNotification;
              }
            }
          });
          
          // Merge new notifications with existing ones
          this.mergeNotifications(newNotifications);
          this.calculateUnreadCount();
        }, (error) => {
          console.error('Error in notifications subscription:', error);
          this.error = error.message;
          
          // If it's an index error, try a simpler query
          if (error.message && error.message.includes('requires an index')) {
            console.warn('Firestore index required for subscription. Falling back to simpler query.');
            
            // Use a simpler query without orderBy
            const simpleQ = query(
              notificationsRef,
              where('userId', '==', userId),
              limit(50)
            );
            
            return onSnapshot(simpleQ, (snapshot) => {
              const newNotifications = [];
              
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  // Skip if we've already processed this notification
                  if (this.processedIds.has(change.doc.id)) return;
                  
                  // Add to processed IDs
                  this.processedIds.add(change.doc.id);
                  
                  const notification = {
                    id: change.doc.id,
                    ...change.doc.data(),
                    date: change.doc.data().createdAt?.toDate() || new Date()
                  };
                  
                  newNotifications.push(notification);
                }
                
                if (change.type === 'modified') {
                  const updatedNotification = {
                    id: change.doc.id,
                    ...change.doc.data(),
                    date: change.doc.data().createdAt?.toDate() || new Date()
                  };
                  
                  const index = this.notifications.findIndex(n => n.id === updatedNotification.id);
                  if (index !== -1) {
                    this.notifications[index] = updatedNotification;
                  }
                }
              });
              
              // Merge new notifications with existing ones
              this.mergeNotifications(newNotifications);
              this.calculateUnreadCount();
            }, (fallbackError) => {
              console.error('Error in fallback notifications subscription:', fallbackError);
              this.error = fallbackError.message;
            });
          }
        });
      } catch (error) {
        console.error('Error setting up notifications subscription:', error);
        this.error = error.message;
        return null;
      }
    },
    
    // Add a new notification to Firestore
    async addNotification(notification) {
      try {
        // Check if this notification has a notificationId and if we've already processed it
        if (notification.notificationId && this.processedIds.has(notification.notificationId)) {
          console.log('Notification already processed, skipping:', notification.notificationId);
          return null;
        }
        
        const notificationsRef = collection(db, 'notifications');
        const notificationData = {
          ...notification,
          read: false,
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(notificationsRef, notificationData);
        
        // Add to processed IDs
        if (notification.notificationId) {
          this.processedIds.add(notification.notificationId);
        }
        this.processedIds.add(docRef.id);
        
        return docRef.id;
      } catch (error) {
        console.error('Error adding notification:', error);
        this.error = error.message;
        return null;
      }
    },
    
    // Mark a notification as read
    async markAsRead(notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
          read: true,
          updatedAt: serverTimestamp()
        });
        
        // Update local state
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          this.notifications[index].read = true;
          this.calculateUnreadCount();
        }
        
        return true;
      } catch (error) {
        console.error('Error marking notification as read:', error);
        this.error = error.message;
        return false;
      }
    },
    
    // Mark all notifications as read
    async markAllAsRead(userId) {
      if (!userId) return false;
      
      try {
        // Get all unread notifications for the user
        const unreadNotifications = this.notifications.filter(n => !n.read);
        
        // Update each notification in Firestore
        const updatePromises = unreadNotifications.map(notification => {
          const notificationRef = doc(db, 'notifications', notification.id);
          return updateDoc(notificationRef, {
            read: true,
            updatedAt: serverTimestamp()
          });
        });
        
        await Promise.all(updatePromises);
        
        // Update local state
        this.notifications.forEach(notification => {
          notification.read = true;
        });
        
        this.unreadCount = 0;
        return true;
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        this.error = error.message;
        return false;
      }
    },
    
    // Calculate the number of unread notifications
    calculateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    },
    
    // Clear notifications state (e.g., on logout)
    clearNotifications() {
      this.notifications = [];
      this.unreadCount = 0;
      this.lastFetched = null;
      this.error = null;
      this.processedIds.clear();
    }
  }
});