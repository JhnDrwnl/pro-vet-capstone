//store/modules/notification.js
import { defineStore } from 'pinia'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  writeBatch,
  getDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@shared/firebase'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
    processedIds: new Set(), // Track processed notification IDs
    unreadCount: 0,
    activeSubscription: null,
    lastSyncTimestamp: null
  }),

  getters: {
    getNotifications: (state) => state.notifications,
    
    getUnreadCount: (state) => {
      return state.notifications.filter(notification => !notification.read).length
    },
    
    getFilteredNotifications: (state) => (filterType, filterQuery) => {
      let filtered = [...state.notifications]
      
      // Apply type filter
      if (filterType === 'unread') {
        filtered = filtered.filter(notification => !notification.read)
      }
      
      // Apply search query filter
      if (filterQuery && filterQuery.trim() !== '') {
        const query = filterQuery.toLowerCase().trim()
        filtered = filtered.filter(notification => 
          notification.title.toLowerCase().includes(query) || 
          notification.description.toLowerCase().includes(query)
        )
      }
      
      return filtered
    }
  },

  actions: {
    clearNotifications() {
      this.notifications = []
      this.processedIds.clear()
      this.unreadCount = 0
      this.lastSyncTimestamp = null
    },
    
    calculateUnreadCount() {
      this.unreadCount = this.notifications.filter(notification => !notification.read).length
    },
    
    async fetchNotifications(userId) {
      if (!userId) {
        console.error('No user ID provided to fetch notifications')
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const notificationsRef = collection(db, 'notifications')
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          where('deleted', '==', false),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
        
        const querySnapshot = await getDocs(q)
        const notifications = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          
          // Skip if already processed
          if (this.processedIds.has(doc.id)) {
            return
          }
          
          // Add to processed IDs
          this.processedIds.add(doc.id)
          
          // Convert Firestore timestamp to Date
          const date = data.createdAt ? 
            (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : 
            new Date()
          
          notifications.push({
            id: doc.id,
            title: data.title || 'Notification',
            description: data.description || '',
            type: data.type || 'general',
            read: data.read || false,
            date: date,
            url: data.url || null,
            data: data.data || {},
            deleted: data.deleted || false
          })
        })
        
        // Filter out deleted notifications
        const validNotifications = notifications.filter(n => !n.deleted)
        
        // Merge with existing notifications, avoiding duplicates
        const existingIds = new Set(this.notifications.map(n => n.id))
        const newNotifications = validNotifications.filter(n => !existingIds.has(n.id))
        
        // Update existing notifications with fresh data
        const updatedNotifications = this.notifications.map(existing => {
          const updated = validNotifications.find(n => n.id === existing.id)
          return updated || existing
        })
        
        // Combine updated existing notifications with new ones
        this.notifications = [...updatedNotifications, ...newNotifications]
        
        // Filter out any deleted notifications
        this.notifications = this.notifications.filter(n => !n.deleted)
        
        // Sort by date (newest first)
        this.notifications.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date)
          const dateB = b.date instanceof Date ? b.date : new Date(b.date)
          return dateB - dateA
        })
        
        // Calculate unread count
        this.calculateUnreadCount()
        
        // Update last sync timestamp
        this.lastSyncTimestamp = new Date()
        
        console.log(`Fetched ${notifications.length} notifications, ${newNotifications.length} new`)
        
        this.loading = false
      } catch (error) {
        console.error('Error fetching notifications:', error)
        this.error = error.message
        this.loading = false
      }
    },
    
    subscribeToNotifications(userId) {
      if (!userId) {
        console.error('No user ID provided for notification subscription')
        return null
      }
      
      // Unsubscribe from any existing subscription
      if (this.activeSubscription) {
        this.activeSubscription()
        this.activeSubscription = null
      }
      
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('deleted', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      
      // Set up real-time listener
      this.activeSubscription = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data()
          const id = change.doc.id
          
          // Skip processing if the notification is deleted
          if (data.deleted === true) {
            // If it's in our local state, remove it
            if (this.processedIds.has(id)) {
              this.notifications = this.notifications.filter(n => n.id !== id)
              this.processedIds.delete(id)
              console.log('Removed deleted notification:', id)
            }
            return
          }
          
          // Convert Firestore timestamp to Date
          const date = data.createdAt ? 
            (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : 
            new Date()
          
          const notification = {
            id: id,
            title: data.title || 'Notification',
            description: data.description || '',
            type: data.type || 'general',
            read: data.read || false,
            date: date,
            url: data.url || null,
            data: data.data || {},
            deleted: data.deleted || false
          }
          
          if (change.type === 'added') {
            // Skip if already processed
            if (this.processedIds.has(id)) {
              return
            }
            
            // Add to processed IDs
            this.processedIds.add(id)
            
            // Add to notifications array
            this.notifications.unshift(notification)
            
            // Sort by date (newest first)
            this.notifications.sort((a, b) => {
              const dateA = a.date instanceof Date ? a.date : new Date(a.date)
              const dateB = b.date instanceof Date ? b.date : new Date(b.date)
              return dateB - dateA
            })
            
            console.log('New notification added:', id)
          } else if (change.type === 'modified') {
            // Update existing notification
            const index = this.notifications.findIndex(n => n.id === id)
            if (index !== -1) {
              this.notifications[index] = notification
              console.log('Notification updated:', id)
            }
          } else if (change.type === 'removed') {
            // Remove from notifications array
            this.notifications = this.notifications.filter(n => n.id !== id)
            // Remove from processed IDs
            this.processedIds.delete(id)
            console.log('Notification removed:', id)
          }
          
          // Calculate unread count
          this.calculateUnreadCount()
        })
      }, (error) => {
        console.error('Error in notification subscription:', error)
        this.error = error.message
      })
      
      console.log('Subscribed to notifications for user:', userId)
      
      // Return unsubscribe function
      return this.activeSubscription
    },
    
    async markAsRead(notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId)
        
        // Update in Firestore
        await updateDoc(notificationRef, {
          read: true,
          updatedAt: serverTimestamp()
        })
        
        // Update local state
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          this.notifications[index].read = true
        }
        
        // Recalculate unread count
        this.calculateUnreadCount()
        
        console.log('Notification marked as read:', notificationId)
        return true
      } catch (error) {
        console.error('Error marking notification as read:', error)
        return false
      }
    },
    
    async markAllAsRead(userId) {
      if (!userId) {
        console.error('No user ID provided to mark all notifications as read')
        return false
      }
      
      try {
        const batch = writeBatch(db)
        const unreadNotifications = this.notifications.filter(n => !n.read)
        
        // Update in Firestore using batch
        for (const notification of unreadNotifications) {
          const notificationRef = doc(db, 'notifications', notification.id)
          batch.update(notificationRef, {
            read: true,
            updatedAt: serverTimestamp()
          })
        }
        
        // Commit the batch
        await batch.commit()
        
        // Update local state
        this.notifications.forEach(notification => {
          notification.read = true
        })
        
        // Recalculate unread count
        this.calculateUnreadCount()
        
        console.log(`Marked ${unreadNotifications.length} notifications as read for user:`, userId)
        return true
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }
    },
    
    async addNotification(notificationData) {
      try {
        // Ensure deleted flag is set to false
        const dataToAdd = {
          ...notificationData,
          deleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        // Add to Firestore
        const notificationsRef = collection(db, 'notifications')
        const docRef = await addDoc(notificationsRef, dataToAdd)
        
        console.log('Notification added to Firestore with ID:', docRef.id)
        return docRef.id
      } catch (error) {
        console.error('Error adding notification to Firestore:', error)
        return null
      }
    },
    
    // New method to add a notification directly to the local state
    addLocalNotification(notification) {
      // Skip if already processed
      if (this.processedIds.has(notification.id)) {
        return
      }
      
      // Skip if deleted
      if (notification.deleted) {
        return
      }
      
      // Add to processed IDs
      this.processedIds.add(notification.id)
      
      // Add to notifications array
      this.notifications.unshift(notification)
      
      // Sort by date (newest first)
      this.notifications.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date)
        const dateB = b.date instanceof Date ? b.date : new Date(b.date)
        return dateB - dateA
      })
      
      // Recalculate unread count
      this.calculateUnreadCount()
      
      console.log('Added local notification:', notification.id)
    },
    
    async deleteNotification(notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId)
        
        // First check if the notification exists
        const docSnap = await getDoc(notificationRef)
        if (!docSnap.exists()) {
          console.log('Notification does not exist:', notificationId)
          return false
        }
        
        // Instead of actually deleting, mark as deleted
        await updateDoc(notificationRef, {
          deleted: true,
          updatedAt: serverTimestamp()
        })
        
        // Remove from local state
        this.notifications = this.notifications.filter(n => n.id !== notificationId)
        
        // Remove from processed IDs
        this.processedIds.delete(notificationId)
        
        // Recalculate unread count
        this.calculateUnreadCount()
        
        console.log('Notification deleted:', notificationId)
        return true
      } catch (error) {
        console.error('Error deleting notification:', error)
        return false
      }
    },
    
    // Permanently delete a notification (admin only)
    async permanentlyDeleteNotification(notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId)
        
        // Actually delete from Firestore
        await deleteDoc(notificationRef)
        
        // Remove from local state
        this.notifications = this.notifications.filter(n => n.id !== notificationId)
        
        // Remove from processed IDs
        this.processedIds.delete(notificationId)
        
        // Recalculate unread count
        this.calculateUnreadCount()
        
        console.log('Notification permanently deleted:', notificationId)
        return true
      } catch (error) {
        console.error('Error permanently deleting notification:', error)
        return false
      }
    },
    
    // Validate notifications against Firestore
    async validateNotifications(userId) {
      if (!userId) {
        console.error('No user ID provided to validate notifications')
        return
      }
      
      try {
        // Get all notifications from Firestore
        const notificationsRef = collection(db, 'notifications')
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(100)
        )
        
        const querySnapshot = await getDocs(q)
        const firestoreIds = new Set()
        
        // Build set of valid notification IDs from Firestore
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (!data.deleted) {
            firestoreIds.add(doc.id)
          }
        })
        
        // Remove any notifications from local state that don't exist in Firestore
        const localIds = Array.from(this.processedIds)
        for (const id of localIds) {
          if (!firestoreIds.has(id)) {
            this.notifications = this.notifications.filter(n => n.id !== id)
            this.processedIds.delete(id)
            console.log('Removed invalid notification from local state:', id)
          }
        }
        
        // Recalculate unread count
        this.calculateUnreadCount()
        
        console.log('Notifications validated successfully')
      } catch (error) {
        console.error('Error validating notifications:', error)
      }
    }
  }
})
