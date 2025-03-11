// public/firebase-messaging-sw.js
// public/firebase-messaging-sw.js
// Firebase messaging service worker

importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js")

// Initialize the Firebase app in the service worker
// Don't try to reference firebase before it's imported
const firebaseApp = firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
})

const messaging = firebase.messaging()

// Cache for processed notification IDs to avoid duplicates
let processedNotifications = new Set()
let db = null

// Initialize IndexedDB for storing user preferences
function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("NotificationsDB", 1)

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event.target.error)
      reject(event.target.error)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains("processedNotifications")) {
        db.createObjectStore("processedNotifications", { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains("userPreferences")) {
        db.createObjectStore("userPreferences", { keyPath: "userId" })
      }
    }

    request.onsuccess = (event) => {
      db = event.target.result
      console.log("IndexedDB initialized successfully")

      // Load processed notifications from IndexedDB
      loadProcessedNotifications()
        .then(() => {
          resolve(db)
        })
        .catch((error) => {
          console.error("Error loading processed notifications:", error)
          resolve(db) // Still resolve even if loading fails
        })
    }
  })
}

// Load processed notifications from IndexedDB
function loadProcessedNotifications() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("IndexedDB not initialized"))
      return
    }

    const transaction = db.transaction(["processedNotifications"], "readonly")
    const store = transaction.objectStore("processedNotifications")
    const request = store.getAll()

    request.onerror = (event) => {
      console.error("Error loading processed notifications:", event.target.error)
      reject(event.target.error)
    }

    request.onsuccess = (event) => {
      const notifications = event.target.result
      processedNotifications = new Set(notifications.map((n) => n.id))
      console.log(`Loaded ${processedNotifications.size} processed notifications from IndexedDB`)
      resolve()
    }
  })
}

// Save a processed notification to IndexedDB
function saveProcessedNotification(id) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("IndexedDB not initialized"))
      return
    }

    const transaction = db.transaction(["processedNotifications"], "readwrite")
    const store = transaction.objectStore("processedNotifications")
    const request = store.put({ id, timestamp: Date.now() })

    request.onerror = (event) => {
      console.error("Error saving processed notification:", event.target.error)
      reject(event.target.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Clean up old processed notifications
function cleanupProcessedNotifications() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("IndexedDB not initialized"))
      return
    }

    const transaction = db.transaction(["processedNotifications"], "readwrite")
    const store = transaction.objectStore("processedNotifications")
    const request = store.getAll()

    request.onerror = (event) => {
      console.error("Error getting processed notifications for cleanup:", event.target.error)
      reject(event.target.error)
    }

    request.onsuccess = (event) => {
      const notifications = event.target.result

      // Keep only the 50 most recent notifications
      if (notifications.length > 100) {
        // Sort by timestamp (newest first)
        notifications.sort((a, b) => b.timestamp - a.timestamp)

        // Delete older notifications
        const toDelete = notifications.slice(50)

        const deleteTransaction = db.transaction(["processedNotifications"], "readwrite")
        const deleteStore = deleteTransaction.objectStore("processedNotifications")

        toDelete.forEach((notification) => {
          deleteStore.delete(notification.id)
        })

        console.log(`Cleaned up ${toDelete.length} old processed notifications`)
      }

      resolve()
    }
  })
}

// Save user preference to IndexedDB
function saveUserPreference(userId, enabled) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("IndexedDB not initialized"))
      return
    }

    const transaction = db.transaction(["userPreferences"], "readwrite")
    const store = transaction.objectStore("userPreferences")
    const request = store.put({
      userId,
      notificationsEnabled: enabled,
      timestamp: Date.now(),
    })

    request.onerror = (event) => {
      console.error("Error saving user preference:", event.target.error)
      reject(event.target.error)
    }

    request.onsuccess = () => {
      resolve()
    }
  })
}

// Check if notifications are enabled for a user
async function areNotificationsEnabled(userId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      // Default to false if DB is not initialized
      resolve(false)
      return
    }

    if (!userId) {
      // Default to false if no user ID
      resolve(false)
      return
    }

    const transaction = db.transaction(["userPreferences"], "readonly")
    const store = transaction.objectStore("userPreferences")
    const request = store.get(userId)

    request.onerror = (event) => {
      console.error("Error checking user preference:", event.target.error)
      resolve(false) // Default to false on error
    }

    request.onsuccess = (event) => {
      const preference = event.target.result
      if (preference) {
        resolve(preference.notificationsEnabled === true)
      } else {
        // Default to false if no preference is found
        resolve(false)
      }
    }
  })
}

// Initialize IndexedDB when the service worker starts
initializeDB().catch((error) => {
  console.error("Failed to initialize IndexedDB:", error)
})

// Handle background messages
messaging.onBackgroundMessage(async (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload)

  try {
    // Extract user ID from the payload
    const userId = payload.data?.userId

    // Check if notifications are enabled for this user
    const notificationsEnabled = await areNotificationsEnabled(userId)
    if (!notificationsEnabled) {
      console.log("Notifications disabled for user, not showing notification")
      return
    }

    // Generate notification ID
    const notificationId = payload.data?.id || `${payload.notification.title}_${Date.now()}`

    // Check if this is a duplicate notification
    if (processedNotifications.has(notificationId)) {
      console.log("Duplicate notification detected, ignoring:", notificationId)
      return
    }

    // Mark this notification as processed
    processedNotifications.add(notificationId)
    await saveProcessedNotification(notificationId)

    // Clean up old processed notifications
    cleanupProcessedNotifications().catch((error) => {
      console.error("Error cleaning up processed notifications:", error)
    })

    // Show the notification
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || "/favicon.ico",
      badge: "/notification-badge.png",
      tag: notificationId, // Use tag to replace existing notifications with the same ID
      data: {
        ...payload.data,
        id: notificationId,
        url: payload.data?.url || "/user/notifications",
      },
    }

    // Show the notification
    return self.registration.showNotification(payload.notification.title, notificationOptions)
  } catch (error) {
    console.error("Error processing background message:", error)
  }
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event.notification)

  // Close the notification
  event.notification.close()

  // Get the notification data
  const notificationData = event.notification.data

  // Extract the URL from the notification data
  const urlToOpen = notificationData?.url || "/user/notifications"

  console.log("[firebase-messaging-sw.js] URL to open:", urlToOpen)

  // This will focus an existing window or open a new one if needed
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        console.log("[firebase-messaging-sw.js] Found " + clientList.length + " clients")

        // If we have at least one client
        if (clientList.length > 0) {
          // Try to find a client that's already open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            console.log("[firebase-messaging-sw.js] Client:", client.url)

            if ("focus" in client) {
              client.focus()
              console.log("[firebase-messaging-sw.js] Focused client and sending message")

              // Send message to client with URL to navigate to
              client.postMessage({
                type: "NOTIFICATION_CLICKED",
                url: urlToOpen,
                data: notificationData,
              })
              return
            }
          }
        }

        // If no client is available or none could be focused, open a new window
        console.log("[firebase-messaging-sw.js] No client available, opening new window")
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})

// Listen for messages from the client
self.addEventListener("message", (event) => {
  console.log("[firebase-messaging-sw.js] Received message from client:", event.data)

  if (event.data && event.data.type === "REGISTER_TOKEN") {
    console.log("Received FCM token from client:", event.data.token.substring(0, 10) + "...")
  }

  if (event.data && event.data.type === "CLEAR_DUPLICATE_CACHE") {
    console.log("Clearing duplicate notification cache")
    processedNotifications.clear()

    // Clear IndexedDB store
    if (db) {
      const transaction = db.transaction(["processedNotifications"], "readwrite")
      const store = transaction.objectStore("processedNotifications")
      const request = store.clear()

      request.onsuccess = () => {
        console.log("Successfully cleared processed notifications store")
      }

      request.onerror = (event) => {
        console.error("Error clearing processed notifications store:", event.target.error)
      }
    }
  }

  if (event.data && event.data.type === "UPDATE_USER_PREFERENCE") {
    const { userId, enabled } = event.data
    console.log(`Updating notification preference for user ${userId}: ${enabled ? "enabled" : "disabled"}`)

    saveUserPreference(userId, enabled)
      .then(() => {
        console.log("Successfully saved user preference")
      })
      .catch((error) => {
        console.error("Error saving user preference:", error)
      })
  }
})

