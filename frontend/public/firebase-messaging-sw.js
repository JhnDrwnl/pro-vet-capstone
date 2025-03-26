// Firebase messaging service worker

// This file is in the public folder, so it's at the root of the domain
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js")

// Initialize Firebase
const firebase = self.firebase || {} // Ensure firebase is defined

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
})

const messaging = firebase.messaging()

// Cache for tracking processed notifications to avoid duplicates
const processedNotifications = new Set()

// Cache for storing unsynced notifications
const unsyncedNotifications = new Map()

// Function to generate a unique ID for notifications
function generateNotificationId(notification) {
  const title = notification.title || ""
  const body = notification.body || ""
  const timestamp = Date.now()
  return `${title.substring(0, 10)}_${timestamp}`
}

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload)

  // Extract notification details
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
    badge: "/notification-badge.png",
    data: {}, // Initialize empty data object
    requireInteraction: true,
    vibrate: [100, 50, 100],
  }

  // Sanitize data to ensure all values are strings
  if (payload.data) {
    Object.keys(payload.data).forEach((key) => {
      if (payload.data[key] === null) {
        notificationOptions.data[key] = "null"
      } else if (typeof payload.data[key] === "object") {
        try {
          notificationOptions.data[key] = JSON.stringify(payload.data[key])
        } catch (e) {
          notificationOptions.data[key] = String(payload.data[key])
        }
      } else {
        notificationOptions.data[key] = String(payload.data[key])
      }
    })
  }

  // Generate a notification ID if not provided
  const notificationId = payload.data?.id || generateNotificationId(payload.notification)
  notificationOptions.data.id = notificationId
  notificationOptions.tag = notificationId

  // Check if this notification has already been processed
  if (processedNotifications.has(notificationId)) {
    console.log("[firebase-messaging-sw.js] Duplicate notification detected, ignoring:", notificationId)
    return
  }

  // Mark as processed
  processedNotifications.add(notificationId)

  // Add to unsynced notifications for later syncing
  unsyncedNotifications.set(notificationId, {
    id: notificationId,
    title: notificationTitle,
    body: notificationOptions.body,
    data: notificationOptions.data,
    timestamp: Date.now(),
  })

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions)

  // Notify the client that a new notification has been received
  self.clients
    .matchAll({
      includeUncontrolled: true,
      type: "window",
    })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "NOTIFICATION_RECEIVED",
          notificationId: notificationId,
        })
      })
    })
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received")

  const notification = event.notification
  const notificationData = notification.data
  notification.close()

  // Default URL if none is provided
  const url = notificationData.url || "/user/notifications"

  // This looks to see if the current window is already open
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            client.focus()

            // Send message to client with click data
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              url: url,
              notificationId: notificationData.id,
            })

            return
          }
        }

        // Otherwise, open a new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      }),
  )
})

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data) {
    console.log("[firebase-messaging-sw.js] Received client message:", event.data.type)

    // Handle GET_UNSYNCED_NOTIFICATIONS request
    if (event.data.type === "GET_UNSYNCED_NOTIFICATIONS") {
      // Convert Map to Array for postMessage
      const notifications = Array.from(unsyncedNotifications.values())

      // Reply with unsynced notifications
      event.ports[0].postMessage({
        type: "UNSYNCED_NOTIFICATIONS",
        notifications: notifications,
      })
    }

    // Handle MARK_NOTIFICATIONS_SYNCED request
    else if (event.data.type === "MARK_NOTIFICATIONS_SYNCED" && event.data.ids) {
      const ids = event.data.ids

      // Remove synced notifications from unsynced map
      ids.forEach((id) => {
        unsyncedNotifications.delete(id)
      })

      console.log(`[firebase-messaging-sw.js] Marked ${ids.length} notifications as synced`)
    }

    // Handle CLEAR_DUPLICATE_CACHE request
    else if (event.data.type === "CLEAR_DUPLICATE_CACHE") {
      processedNotifications.clear()
      console.log("[firebase-messaging-sw.js] Cleared notification cache")
    }
  }
})

