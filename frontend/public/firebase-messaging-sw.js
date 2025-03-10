// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker

// Add console logs for debugging
console.  type="vue"
// Firebase Cloud Messaging Service Worker

// Add console logs for debugging
console.log("Firebase Messaging SW loaded")

// Store received messages and tokens
const receivedMessages = []
const registeredTokens = []
const processedNotifications = new Set() // Track processed notifications

// Listen for push events
self.addEventListener("push", (event) => {
 console.log("Push event received:", event)

 let payload
 try {
   // Try to parse the data as JSON
   if (event.data) {
     try {
       payload = event.data.json()
     } catch (e) {
       // If JSON parsing fails, use text
       payload = {
         notification: {
           title: "New Notification",
           body: event.data.text(),
         },
       }
     }
     console.log("Push event payload:", payload)
   } else {
     console.warn("Push event has no data")
     return
   }
 } catch (e) {
   console.error("Error handling push event data:", e)
   return
 }

 // Check for duplicate notifications
 const notificationId = payload.data?.id || `${payload.notification.title}_${Date.now()}`
 
 if (processedNotifications.has(notificationId)) {
   console.log("Duplicate notification detected, ignoring:", notificationId)
   return
 }
 
 // Mark this notification as processed
 processedNotifications.add(notificationId)
 
 // Clean up old processed notifications (keep only last 50)
 if (processedNotifications.size > 50) {
   const iterator = processedNotifications.values()
   processedNotifications.delete(iterator.next().value)
 }

 // Store the message
 receivedMessages.push(payload)

 // Extract notification details
 const notificationTitle = payload.notification?.title || "New Notification"
 const notificationOptions = {
   body: payload.notification?.body || "",
   icon: "/favicon.ico",
   badge: "/notification-badge.png",
   data: payload.data || {},
   requireInteraction: true, // Keep notification until user interacts with it
   tag: notificationId // Use tag to replace existing notifications with the same ID
 }

 // Store notification in IndexedDB for later syncing to Firestore
 storeNotificationForSync(payload)

 // Show notification
 event.waitUntil(
   self.registration
     .showNotification(notificationTitle, notificationOptions)
     .then(() => console.log("Notification shown from service worker"))
     .catch((err) => console.error("Error showing notification:", err)),
 )
})

// Store notification data in IndexedDB for later syncing to Firestore
function storeNotificationForSync(payload) {
  // We'll use IndexedDB to store notifications that need to be synced to Firestore
  // This is because service workers don't have direct access to Firebase SDK
  
  // When the main app loads, it will check this storage and sync to Firestore
  if (payload && payload.notification) {
    const notificationData = {
      title: payload.notification.title,
      body: payload.notification.body,
      data: payload.data || {},
      timestamp: Date.now(),
      synced: false
    }
    
    // Store in IndexedDB
    if ('indexedDB' in self) {
      const request = indexedDB.open('notifications-sync', 1)
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true })
        }
      }
      
      request.onsuccess = function(event) {
        const db = event.target.result
        const transaction = db.transaction(['notifications'], 'readwrite')
        const store = transaction.objectStore('notifications')
        store.add(notificationData)
        
        console.log('Notification stored for later sync to Firestore')
      }
      
      request.onerror = function(event) {
        console.error('Error opening IndexedDB:', event.target.error)
      }
    }
  }
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
console.log("SW notification clicked:", event)
event.notification.close()

// Get the notification data
const notificationData = event.notification.data
console.log("SW notification data:", notificationData)

// Focus existing window or open new one
event.waitUntil(
  clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    // If we have notification data with a specific URL, use that
    // Default to the user notifications panel if no specific URL
    const urlToOpen = notificationData && notificationData.url ? notificationData.url : "/user/notifications"
    console.log("SW opening URL:", urlToOpen)

    // Check if a client is already open
    for (const client of clientList) {
      console.log("SW found client:", client.url)
      if ("focus" in client) {
        client.focus()
        console.log("SW focused client")
        // If the client is already on the correct page, we're done
        if (client.url.includes(urlToOpen)) {
          console.log("SW client already on correct page")
          return
        }
        // Otherwise, navigate to the new URL
        if ("navigate" in client) {
          console.log("SW navigating client to:", urlToOpen)
          return client.navigate(urlToOpen)
        }
        return
      }
    }

    // If no client is open, open a new window
    if (clients.openWindow) {
      console.log("SW opening new window:", urlToOpen)
      return clients.openWindow(urlToOpen)
    }
  })
)
})

// Listen for messages from the main app
self.addEventListener("message", (event) => {
 console.log("SW received message:", event.data)

 if (event.data && event.data.type === "GET_MESSAGES") {
   // Send back all received messages
   event.ports[0].postMessage({
     messages: receivedMessages,
   })
 } else if (event.data && event.data.type === "REGISTER_TOKEN") {
   // Store the token for Edge browser
   const token = event.data.token
   if (token && !registeredTokens.includes(token)) {
     registeredTokens.push(token)
     console.log("Token registered with service worker:", token.substring(0, 10) + "...")
   }
 } else if (event.data && event.data.type === "FIREBASE_CONFIG") {
   // Store Firebase config for later use
   self.firebaseConfig = event.data.config
   console.log("Firebase config received in service worker")
 } else if (event.data && event.data.type === "SYNC_NOTIFICATIONS") {
   // The main app is requesting to sync notifications
   // We'll send back any unsynchronized notifications
   if ('indexedDB' in self) {
     const request = indexedDB.open('notifications-sync', 1)
     
     request.onsuccess = function(event) {
       const db = event.target.result
       const transaction = db.transaction(['notifications'], 'readonly')
       const store = transaction.objectStore('notifications')
       const getAllRequest = store.getAll()
       
       getAllRequest.onsuccess = function() {
         const unsyncedNotifications = getAllRequest.result.filter(n => !n.synced)
         event.ports[0].postMessage({
           type: 'UNSYNCED_NOTIFICATIONS',
           notifications: unsyncedNotifications
         })
       }
     }
   }
 } else if (event.data && event.data.type === "MARK_NOTIFICATIONS_SYNCED") {
   // Mark notifications as synced in IndexedDB
   const ids = event.data.ids || []
   
   if (ids.length > 0 && 'indexedDB' in self) {
     const request = indexedDB.open('notifications-sync', 1)
     
     request.onsuccess = function(event) {
       const db = event.target.result
       const transaction = db.transaction(['notifications'], 'readwrite')
       const store = transaction.objectStore('notifications')
       
       ids.forEach(id => {
         const getRequest = store.get(id)
         getRequest.onsuccess = function() {
           const notification = getRequest.result
           if (notification) {
             notification.synced = true
             store.put(notification)
           }
         }
       })
       
       console.log(`Marked ${ids.length} notifications as synced`)
     }
   }
 }
})

// Add installation and activation handlers for more debugging
self.addEventListener("install", (event) => {
 console.log("SW installed")
 // Skip waiting to ensure the new service worker activates immediately
 self.skipWaiting()
})

self.addEventListener("activate", (event) => {
 console.log("SW activated")
 // Claim clients to ensure the service worker controls all clients immediately
 event.waitUntil(clients.claim())
})

// Add a fetch handler to keep the service worker alive
self.addEventListener("fetch", (event) => {
 // This empty fetch handler helps keep the service worker active
 // No need to actually do anything with the fetch event
})