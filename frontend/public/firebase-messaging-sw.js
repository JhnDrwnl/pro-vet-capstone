// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker

// Add console logs for debugging
console.log("Firebase Messaging SW loaded")

// Store received messages and tokens
const receivedMessages = []
const registeredTokens = []
const processedNotifications = new Set() // Track processed notifications

// Database version tracking
const DB_NAME = 'notifications-sync';
let currentDbVersion = 2; // Start with version 2 since we know it exists

// Initialize the IndexedDB for notifications with proper version handling
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    // First, try to open the database without specifying a version to get the current version
    const checkRequest = indexedDB.open(DB_NAME);
    
    checkRequest.onsuccess = function(event) {
      const db = event.target.result;
      const existingVersion = db.version;
      console.log(`Existing IndexedDB version: ${existingVersion}`);
      
      // Close the database before reopening with the correct version
      db.close();
      
      // Use the existing version or higher
      currentDbVersion = Math.max(existingVersion, currentDbVersion);
      
      // Now open with the correct version
      const request = indexedDB.open(DB_NAME, currentDbVersion);
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        console.log(`Upgrading IndexedDB to version ${currentDbVersion}`);
        
        // Check if the object store exists before creating it
        if (!db.objectStoreNames.contains('notifications')) {
          console.log('Creating notifications object store');
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = function(event) {
        console.log(`Successfully opened IndexedDB version ${currentDbVersion}`);
        resolve(event.target.result);
      };
      
      request.onerror = function(event) {
        console.error('Error opening IndexedDB with version:', event.target.error);
        reject(event.target.error);
      };
    };
    
    checkRequest.onerror = function(event) {
      console.error('Error checking IndexedDB version:', event.target.error);
      
      // If we can't check the version, try with our default version
      const request = indexedDB.open(DB_NAME, currentDbVersion);
      
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = function(event) {
        resolve(event.target.result);
      };
      
      request.onerror = function(event) {
        console.error('Error opening IndexedDB with fallback version:', event.target.error);
        reject(event.target.error);
      };
    };
  });
}

// Check if a notification has already been stored
async function isNotificationAlreadyStored(notificationId) {
  try {
    const db = await initIndexedDB();
    
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains('notifications')) {
        resolve(false);
        return;
      }
      
      const transaction = db.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      
      // Use an index to find notifications by a custom ID
      const range = IDBKeyRange.only(notificationId);
      const request = store.openCursor(range);
      
      request.onsuccess = function(event) {
        const cursor = event.target.result;
        resolve(!!cursor); // If cursor exists, notification is already stored
      };
      
      request.onerror = function() {
        console.error('Error checking for existing notification');
        resolve(false);
      };
    });
  } catch (error) {
    console.error('Error in isNotificationAlreadyStored:', error);
    return false;
  }
}

// Update the storeNotificationForSync function to handle errors better and prevent duplicates
async function storeNotificationForSync(payload) {
  if (payload && payload.notification) {
    // Generate a unique ID for this notification
    const notificationId = payload.data?.id || `${payload.notification.title}_${Date.now()}`;
    
    // Check if this notification has already been processed
    if (processedNotifications.has(notificationId)) {
      console.log('Duplicate notification detected in memory, ignoring:', notificationId);
      return;
    }
    
    // Check if this notification is already in the database
    const alreadyStored = await isNotificationAlreadyStored(notificationId);
    if (alreadyStored) {
      console.log('Notification already stored in IndexedDB, ignoring:', notificationId);
      processedNotifications.add(notificationId); // Add to in-memory set for future checks
      return;
    }
    
    // Mark this notification as processed
    processedNotifications.add(notificationId);
    
    const notificationData = {
      id: notificationId, // Use the same ID for deduplication
      title: payload.notification.title,
      body: payload.notification.body,
      data: payload.data || {},
      timestamp: Date.now(),
      synced: false
    };
    
    // Store in IndexedDB
    if ('indexedDB' in self) {
      initIndexedDB().then(db => {
        try {
          // Check if the object store exists
          if (!db.objectStoreNames.contains('notifications')) {
            console.warn('Notifications object store not found, recreating database');
            // Close the database and reopen with a new version to create the store
            db.close();
            currentDbVersion++; // Increment version
            const reopenRequest = indexedDB.open(DB_NAME, currentDbVersion);
            reopenRequest.onupgradeneeded = function(event) {
              const newDb = event.target.result;
              newDb.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
            };
            reopenRequest.onsuccess = function(event) {
              const newDb = event.target.result;
              const transaction = newDb.transaction(['notifications'], 'readwrite');
              const store = transaction.objectStore('notifications');
              store.add(notificationData);
            };
            return;
          }
          
          // If we get here, the store exists
          const transaction = db.transaction(['notifications'], 'readwrite');
          const store = transaction.objectStore('notifications');
          store.add(notificationData);
          
          console.log('Notification stored for later sync to Firestore:', notificationId);
        } catch (error) {
          console.error('Error in IndexedDB transaction:', error);
        }
      }).catch(error => {
        console.error('Error storing notification in IndexedDB:', error);
      });
    }
  }
}

// Clean up old processed notifications to prevent memory leaks
function cleanupProcessedNotifications() {
  if (processedNotifications.size > 100) {
    // Keep only the 50 most recent notifications
    const toRemove = processedNotifications.size - 50;
    const iterator = processedNotifications.values();
    
    for (let i = 0; i < toRemove; i++) {
      processedNotifications.delete(iterator.next().value);
    }
    
    console.log(`Cleaned up processed notifications cache, now tracking ${processedNotifications.size} notifications`);
  }
}

// Listen for the 'message' event to handle background sync requests
self.addEventListener('message', (event) => {
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
   initIndexedDB().then(db => {
     try {
       // Check if the object store exists
       if (!db.objectStoreNames.contains('notifications')) {
         console.warn('Notifications object store not found during sync');
         event.ports[0].postMessage({
           type: 'UNSYNCED_NOTIFICATIONS',
           notifications: []
         });
         return;
       }
       
       const transaction = db.transaction(['notifications'], 'readonly');
       const store = transaction.objectStore('notifications');
       const getAllRequest = store.getAll();
       
       getAllRequest.onsuccess = function() {
         const unsyncedNotifications = getAllRequest.result.filter(n => !n.synced);
         event.ports[0].postMessage({
           type: 'UNSYNCED_NOTIFICATIONS',
           notifications: unsyncedNotifications
         });
       };
       
       getAllRequest.onerror = function(error) {
         console.error('Error getting unsynced notifications:', error);
         event.ports[0].postMessage({
           type: 'UNSYNCED_NOTIFICATIONS',
           notifications: []
         });
       };
     } catch (error) {
       console.error('Error in IndexedDB transaction during sync:', error);
       event.ports[0].postMessage({
         type: 'UNSYNCED_NOTIFICATIONS',
         notifications: []
       });
     }
   }).catch(error => {
     console.error('Error opening IndexedDB for sync:', error);
     event.ports[0].postMessage({
       type: 'UNSYNCED_NOTIFICATIONS',
       notifications: []
     });
   });
 } else if (event.data && event.data.type === "MARK_NOTIFICATIONS_SYNCED") {
   // Mark notifications as synced in IndexedDB
   const ids = event.data.ids || []
   
   if (ids.length > 0 && 'indexedDB' in self) {
     initIndexedDB().then(db => {
       try {
         // Check if the object store exists
         if (!db.objectStoreNames.contains('notifications')) {
           console.warn('Notifications object store not found when marking as synced');
           return;
         }
         
         const transaction = db.transaction(['notifications'], 'readwrite');
         const store = transaction.objectStore('notifications');
         
         ids.forEach(id => {
           const getRequest = store.get(id);
           getRequest.onsuccess = function() {
             const notification = getRequest.result;
             if (notification) {
               notification.synced = true;
               store.put(notification);
             }
           };
         });
         
         console.log(`Marked ${ids.length} notifications as synced`);
       } catch (error) {
         console.error('Error marking notifications as synced:', error);
       }
     }).catch(error => {
       console.error('Error opening IndexedDB for marking as synced:', error);
     });
   }
 } else if (event.data && event.data.type === "CLEAR_DUPLICATE_CACHE") {
   // Clear the processed notifications cache for testing
   processedNotifications.clear();
   console.log("Cleared processed notifications cache");
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
 
 // Clean up old processed notifications
 cleanupProcessedNotifications();

 // Store the message
 receivedMessages.push(payload)

 // Extract notification details
 const notificationTitle = payload.notification?.title || "New Notification"
 const notificationOptions = {
   body: payload.notification?.body || "",
   icon: "/favicon.ico",
   badge: "/notification-badge.png",
   data: {
     ...(payload.data || {}),
     id: notificationId // Ensure the ID is in the data
   },
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

      // Notify all clients that a notification was clicked
      clientList.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          notificationId: notificationData?.id,
          url: urlToOpen
        });
      });

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