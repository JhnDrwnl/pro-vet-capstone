// services/notificationSyncService.js
// services/notificationSyncService.js
import { db } from "@shared/firebase"
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore"

class NotificationSyncService {
  constructor() {
    this.initialized = false
    this.notificationsStore = null // Will be set later, NOT in constructor
    this.syncInProgress = false
    this.lastSyncTime = 0
    this.syncInterval = null
  }

  // Set notifications store - will be called from main.js AFTER Pinia is initialized
  setNotificationsStore(store) {
    this.notificationsStore = store
    console.log("Notification store set in sync service")
  }

  async initialize() {
    if (this.initialized) return

    try {
      // Check if store is available
      if (!this.notificationsStore) {
        console.warn("Notifications store not available, cannot initialize sync service")
        return
      }

      console.log("Initializing notification sync service")

      // Do initial sync
      await this.syncNotifications()

      // Set up periodic sync every 15 seconds
      this.syncInterval = setInterval(() => {
        this.syncNotifications()
      }, 15000)

      // Also sync when service worker sends a message
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "NOTIFICATION_RECEIVED") {
            console.log("Received notification from service worker, triggering sync")
            // Wait a moment for Firebase to process
            setTimeout(() => this.syncNotifications(), 500)
          }
        })
      }

      this.initialized = true
      console.log("Notification sync service initialized")
    } catch (error) {
      console.error("Error initializing notification sync service:", error)
    }
  }

  async syncNotifications() {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      console.log("Sync already in progress, skipping")
      return
    }

    this.syncInProgress = true

    try {
      // Check if store is available
      if (!this.notificationsStore) {
        console.warn("Notifications store not available, cannot sync notifications")
        this.syncInProgress = false
        return
      }

      // Get current user
      const user = window.currentUser || null
      if (!user || !user.userId) {
        console.warn("No user logged in, cannot sync notifications")
        this.syncInProgress = false
        return
      }

      // Check if we need to do a full sync or just get new notifications
      let shouldDoFullSync = false

      // Do full sync if:
      // 1. It's been more than 5 minutes since last sync
      // 2. We don't have any notifications cached
      if (Date.now() - this.lastSyncTime > 5 * 60 * 1000 || this.notificationsStore.notifications.length === 0) {
        shouldDoFullSync = true
      }

      if (shouldDoFullSync) {
        console.log("Performing full notifications sync")
        await this.notificationsStore.fetchNotifications(user.userId)
      } else {
        console.log("Checking for new notifications since last sync")

        // Get most recent notification timestamp
        let lastTimestamp = null
        if (this.notificationsStore.notifications.length > 0) {
          // Find the most recent notification timestamp
          const mostRecent = [...this.notificationsStore.notifications].sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date)
            const dateB = b.date instanceof Date ? b.date : new Date(b.date)
            return dateB - dateA
          })[0]

          if (mostRecent && mostRecent.date) {
            lastTimestamp = mostRecent.date instanceof Date ? mostRecent.date : new Date(mostRecent.date)
          }
        }

        // If we couldn't determine a timestamp, do a full sync instead
        if (!lastTimestamp) {
          await this.notificationsStore.fetchNotifications(user.userId)
        } else {
          // Otherwise, query for notifications newer than our most recent one
          try {
            const notificationsRef = collection(db, "notifications")
            const q = query(
              notificationsRef,
              where("userId", "==", user.userId),
              where("deleted", "==", false),
              where("createdAt", ">", lastTimestamp),
              orderBy("createdAt", "desc"),
              limit(20),
            )

            const querySnapshot = await getDocs(q)
            let newNotificationsFound = false

            querySnapshot.forEach((doc) => {
              const data = doc.data()

              // Skip if already processed
              if (this.notificationsStore.processedIds.has(doc.id)) {
                return
              }

              newNotificationsFound = true

              // Convert Firestore timestamp to Date
              const date = data.createdAt
                ? data.createdAt.toDate
                  ? data.createdAt.toDate()
                  : data.createdAt
                : new Date()

              // Add to store's local state for immediate display
              this.notificationsStore.addLocalNotification({
                id: doc.id,
                title: data.title || "Notification",
                description: data.description || "",
                type: data.type || "general",
                read: data.read || false,
                date: date,
                url: data.url || null,
                data: data.data || {},
                deleted: data.deleted || false,
              })
            })

            if (newNotificationsFound) {
              console.log("Found new notifications, added to local state")
            } else {
              console.log("No new notifications found")
            }
          } catch (error) {
            console.error("Error querying for new notifications:", error)
            // Fall back to full sync on error
            await this.notificationsStore.fetchNotifications(user.userId)
          }
        }
      }

      this.lastSyncTime = Date.now()
    } catch (error) {
      console.error("Error syncing notifications:", error)
    } finally {
      this.syncInProgress = false
    }
  }

  async syncFromServiceWorker() {
    if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller) {
      console.log("No active service worker, cannot sync from service worker")
      return
    }

    try {
      // Create a message channel for the response
      const messageChannel = new MessageChannel()

      // Create a promise to handle the response
      const responsePromise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.type === "UNSYNCED_NOTIFICATIONS") {
            resolve(event.data.notifications || [])
          } else {
            resolve([])
          }
        }
      })

      // Send message to service worker
      navigator.serviceWorker.controller.postMessage({ type: "GET_UNSYNCED_NOTIFICATIONS" }, [messageChannel.port2])

      // Wait for response with 5-second timeout
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 5000))
      const notifications = await Promise.race([responsePromise, timeoutPromise])

      if (notifications.length > 0) {
        console.log(`Found ${notifications.length} unsynced notifications in service worker`)

        // Get current user
        const user = window.currentUser || null
        if (!user || !user.userId) {
          console.warn("No user logged in, cannot save service worker notifications")
          return
        }

        // Process each notification
        const processedIds = []
        for (const notification of notifications) {
          try {
            // Add to Firestore via store
            const notificationData = {
              userId: user.userId,
              title: notification.title,
              description: notification.body || "",
              type: notification.data?.type || "general",
              read: false,
              url: notification.data?.url || "/user/notifications",
              data: notification.data || {},
            }

            const docId = await this.notificationsStore.addNotification(notificationData)

            if (docId) {
              processedIds.push(notification.id)

              // Also add to local state for immediate display
              this.notificationsStore.addLocalNotification({
                id: docId,
                ...notificationData,
                date: new Date(),
              })
            }
          } catch (error) {
            console.error("Error processing service worker notification:", error)
          }
        }

        // Mark notifications as synced in service worker
        if (processedIds.length > 0) {
          navigator.serviceWorker.controller.postMessage({
            type: "MARK_NOTIFICATIONS_SYNCED",
            ids: processedIds,
          })

          console.log(`Marked ${processedIds.length} notifications as synced in service worker`)
        }
      } else {
        console.log("No unsynced notifications found in service worker")
      }
    } catch (error) {
      console.error("Error syncing from service worker:", error)
    }
  }

  // Clean up when no longer needed
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    this.initialized = false
    console.log("Notification sync service destroyed")
  }
}

// Create a singleton instance
const notificationSyncService = new NotificationSyncService()

// Export the singleton instance
export default notificationSyncService

