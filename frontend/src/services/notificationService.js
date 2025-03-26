// services/notificationService.js
import { getToken } from "firebase/messaging"
import { doc, setDoc, getDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore"
import { db } from "@shared/firebase"
import { nanoid } from "nanoid"

class NotificationService {
  constructor() {
    this.messaging = null
    this.router = null
    this.notificationsStore = null
    this.initialized = false
    this.userToken = null
    this.processedNotifications = new Set() // Track processed notifications to avoid duplicates
    this.initializationPromise = null // Track initialization promise
    this.userAgent = navigator.userAgent
    this.browserInfo = this.detectBrowser()

    console.log(`NotificationService initialized with browser: ${this.browserInfo.name} ${this.browserInfo.version}`)
  }

  // Add a method to detect browser type
  detectBrowser() {
    const ua = this.userAgent
    let browserName = "Unknown"
    let browserVersion = "Unknown"

    // Detect Edge (Chromium-based)
    if (ua.indexOf("Edg") !== -1) {
      browserName = "Edge"
      const edgMatch = ua.match(/(Edg|Edge)\/([0-9]+\.[0-9]+)/)
      browserVersion = edgMatch ? edgMatch[2] : "Unknown"
    }
    // Detect Chrome
    else if (ua.indexOf("Chrome") !== -1 && ua.indexOf("OPR") === -1 && ua.indexOf("Edg") === -1) {
      browserName = "Chrome"
      const chromeMatch = ua.match(/Chrome\/([0-9]+\.[0-9]+)/)
      browserVersion = chromeMatch ? chromeMatch[1] : "Unknown"
    }
    // Detect Firefox
    else if (ua.indexOf("Firefox") !== -1) {
      browserName = "Firefox"
      const ffMatch = ua.match(/Firefox\/([0-9]+\.[0-9]+)/)
      browserVersion = ffMatch ? ffMatch[1] : "Unknown"
    }
    // Detect Safari
    else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) {
      browserName = "Safari"
      const safariMatch = ua.match(/Version\/([0-9]+\.[0-9]+)/)
      browserVersion = safariMatch ? safariMatch[1] : "Unknown"
    }
    // Detect Opera
    else if (ua.indexOf("OPR") !== -1) {
      browserName = "Opera"
      const operaMatch = ua.match(/OPR\/([0-9]+\.[0-9]+)/)
      browserVersion = operaMatch ? operaMatch[1] : "Unknown"
    }
    // Detect mobile browsers
    else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      browserName = "Mobile Browser"
      if (ua.indexOf("Android") !== -1) {
        browserName = "Android Browser"
      } else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) {
        browserName = "Mobile Safari"
      }
    }

    return {
      name: browserName,
      version: browserVersion,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    }
  }

  setRouter(router) {
    this.router = router
  }

  setNotificationsStore(store) {
    this.notificationsStore = store
  }

  async initialize() {
    // If already initialized, return immediately
    if (this.initialized) return

    // If initialization is in progress, wait for it to complete
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    // Start initialization
    this.initializationPromise = this._doInitialize()
    return this.initializationPromise
  }

  async _doInitialize() {
    try {
      console.log("Initializing notification service...")
      console.log(`Browser detected: ${this.browserInfo.name} ${this.browserInfo.version}`)

      // Check if notifications are supported in this browser
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications")
        this.initialized = true // Mark as initialized even though it's not supported
        return
      }

      // Check notification permission
      const permission = Notification.permission
      console.log(`Current notification permission: ${permission}`)

      // Initialize Firebase Messaging only if service workers are supported
      if ("serviceWorker" in navigator) {
        try {
          // Get messaging from the app instance instead of directly importing firebase
          const { getMessaging: getMessagingFromApp } = await import("firebase/messaging")
          const { app } = await import("@shared/firebase")
          this.messaging = getMessagingFromApp(app)
          console.log("Firebase messaging initialized")

          // Handle foreground messages
          const { onMessage } = await import("firebase/messaging")
          onMessage(this.messaging, async (payload) => {
            console.log("Message received in foreground:", payload)

            // First check if user has disabled notifications in the database
            const shouldShow = await this.shouldShowNotifications()
            if (!shouldShow) {
              console.log("Notifications disabled by user preference, ignoring message")
              return
            }

            // Generate a notification ID if not provided
            const notificationId = payload.data?.id || `${payload.notification.title}_${Date.now()}`

            // Show the notification - don't check for duplicates here
            // as this is a real-time message from Firebase
            this.showNotification(payload.notification.title, payload.notification.body, {
              ...(payload.data || {}),
              id: notificationId,
              fromFirebase: true, // Mark as coming from Firebase
            })

            // Store in Firestore if store is available
            this.storeNotificationInFirestore(payload.notification.title, payload.notification.body, {
              ...(payload.data || {}),
              id: notificationId,
              fromFirebase: true,
            })
          })
        } catch (error) {
          console.error("Error initializing Firebase messaging:", error)
          // Continue initialization even if Firebase messaging fails
        }
      } else {
        console.log("Service workers not supported, skipping Firebase messaging initialization")
      }

      // Set up service worker message listener for notification clicks
      if ("serviceWorker" in navigator) {
        try {
          // First, make sure we have a listener for messages from the service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            console.log("Received message from service worker:", event.data)

            if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
              console.log("Notification click event received from service worker")

              // If we have a notifications store, force refresh
              if (this.notificationsStore) {
                // Clear the notifications cache first
                this.notificationsStore.clearNotifications()

                // Get current user
                const user = window.currentUser || null
                if (user && user.userId) {
                  // Fetch notifications immediately
                  this.notificationsStore.fetchNotifications(user.userId)
                }
              }

              // If we have a router and URL, navigate
              if (this.router && event.data.url) {
                console.log("Navigating to:", event.data.url)

                // Focus the window first
                window.focus()

                // Then navigate using the router
                this.router.push(event.data.url).catch((err) => {
                  if (err.name !== "NavigationDuplicated") {
                    console.error("Navigation error:", err)
                  }
                })
              } else {
                console.warn("Router or URL not available, cannot navigate")

                // Fallback: use window.location if router is not available
                if (event.data.url) {
                  window.location.href = event.data.url
                }
              }
            }
          })

          console.log("Service worker message listener set up")
        } catch (error) {
          console.error("Error setting up service worker message listener:", error)
        }
      } else {
        console.warn("Service worker not available, cannot set up message listener")
      }

      this.initialized = true
      console.log("Notification service initialized successfully")
    } catch (error) {
      console.error("Error initializing notification service:", error)
      this.initialized = false // Mark as not initialized on error
      this.initializationPromise = null // Clear the promise so we can try again
      throw error
    }
  }

  async checkPermission() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return "denied"
    }

    return Notification.permission
  }

  async requestPermission() {
    try {
      // Request permission
      console.log("Requesting notification permission")
      const permission = await Notification.requestPermission()
      console.log(`Permission result: ${permission}`)

      if (permission === "granted") {
        console.log("Notification permission granted")

        // Get token if service workers are supported
        if ("serviceWorker" in navigator) {
          const token = await this.getToken()
          if (token) {
            console.log("Notification token obtained")
            this.userToken = token
            return token
          }
        } else {
          console.log("Service workers not supported, skipping token retrieval")
          return "no-token-needed"
        }
      } else {
        console.log("Notification permission denied")
        return null
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return null
    }

    return null
  }

  async getToken() {
    try {
      // Check if permission is already granted
      if (Notification.permission !== "granted") {
        console.log("Notification permission not granted")
        return null
      }

      // Check if service workers are supported
      if (!("serviceWorker" in navigator)) {
        console.log("Service workers not supported, cannot get token")
        return null
      }

      // Ensure messaging is initialized
      if (!this.messaging) {
        await this.initialize()

        // If still not initialized, return null
        if (!this.messaging) {
          console.log("Messaging not initialized, cannot get token")
          return null
        }
      }

      // Get token
      console.log("Getting FCM token")
      const currentToken = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      })

      if (currentToken) {
        console.log("Current token:", currentToken.substring(0, 10) + "...")

        // Notify the service worker about the token
        if ("serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready
            registration.active.postMessage({
              type: "REGISTER_TOKEN",
              token: currentToken,
              browser: this.browserInfo.name,
              browserVersion: this.browserInfo.version,
              isMobile: this.browserInfo.isMobile,
            })
            console.log("Token sent to service worker")
          } catch (error) {
            console.error("Error sending token to service worker:", error)
          }
        }

        return currentToken
      } else {
        console.log("No token available")
        return null
      }
    } catch (error) {
      console.error("Error getting token:", error)
      return null
    }
  }

  async saveTokenToDatabase(token) {
    try {
      const user = window.currentUser

      // Return if no user is logged in
      if (!user || !user.userId) {
        console.log("No user logged in, cannot save token")
        return false
      }

      // Save the token to the user's document
      const userId = user.userId
      const userRef = doc(db, "users", userId)

      // First, check if user document exists
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        // Update the user's FCM tokens
        await setDoc(
          userRef,
          {
            fcmTokens: {
              [token]: true,
            },
            notificationsEnabled: true,
            notificationsConfigured: true,
            browserInfo: this.browserInfo,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        console.log("Token saved to database for user:", userId)
        return true
      } else {
        console.log("User document does not exist")
        return false
      }
    } catch (error) {
      console.error("Error saving token to database:", error)
      return false
    }
  }

  // Check if notifications should be shown based on user preference
  async shouldShowNotifications() {
    try {
      // Get current user
      const user = window.currentUser || null
      if (!user || !user.userId) {
        console.log("No user logged in, cannot check notification preferences")
        return false
      }

      const userId = user.userId
      const userRef = doc(db, "users", userId)

      // Get user document
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()

        // If user has explicitly configured notifications
        if (userData.notificationsConfigured === true) {
          // Return the user's preference
          return userData.notificationsEnabled === true
        }
      }

      // Default to false if no preference is set
      return false
    } catch (error) {
      console.error("Error checking notification preferences:", error)
      return false
    }
  }

  async showNotification(title, body, data = {}) {
    console.log(`Attempting to show notification: "${title}"`)
    console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`)

    // Check if notifications should be shown based on user preference
    // Skip this check if forceFallback is true
    if (!data.forceFallback) {
      const shouldShow = await this.shouldShowNotifications()
      if (!shouldShow) {
        console.log("Notifications disabled by user preference, not showing notification")
        return null
      }
    }

    // Default notification options
    const options = {
      body: body,
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/notification-badge.png",
      data: {
        ...data,
        url: data.url || "/user/notifications",
        browser: this.browserInfo.name,
        browserVersion: this.browserInfo.version,
        isMobile: this.browserInfo.isMobile,
      },
      requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true,
      vibrate: data.vibrate || [100, 50, 100],
      timestamp: data.timestamp || Date.now(),
    }

    // Generate a unique ID for this notification
    const notificationId = data.id || `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    options.data.id = notificationId
    options.tag = notificationId // Use tag to replace existing notifications with the same ID

    // Check if this notification has already been processed
    // Only check for duplicates if not forced, not from Firebase, and not skipping duplicate check
    if (
      !data.forceFallback &&
      !data.fromFirebase &&
      !data.fromClient &&
      !data.skipDuplicateCheck &&
      this.processedNotifications.has(notificationId)
    ) {
      console.log("Duplicate notification detected, ignoring:", notificationId)
      return null
    }

    // Mark this notification as processed
    this.processedNotifications.add(notificationId)

    // If we have permission, show native notification
    if (Notification.permission === "granted") {
      try {
        console.log("Creating native notification")
        // Create and show the notification
        const notification = new Notification(title, options)

        // Handle notification click
        notification.onclick = (event) => {
          console.log("Notification clicked:", options.data)
          event.preventDefault() // Prevent the browser from focusing the Notification's tab
          notification.close()

          // Focus window
          window.focus()

          // Handle navigation if URL is provided
          if (options.data.url && this.router) {
            console.log("Navigating to:", options.data.url)
            this.router.push(options.data.url).catch((err) => {
              if (err.name !== "NavigationDuplicated") {
                console.error("Navigation error:", err)
              }
            })
          } else if (options.data.url) {
            // Fallback if router is not available
            window.location.href = options.data.url
          }
        }

        // Store the notification in Firestore if it's a client notification and storeInFirestore is true
        // Only store if skipStore is not true
        if (data.storeInFirestore && !data.skipStore) {
          await this.storeNotificationInFirestore(title, body, {
            ...data,
            id: notificationId,
          })
        }

        console.log("Native notification shown successfully")
        return notification
      } catch (error) {
        console.error("Error showing native notification:", error)

        // Try service worker notification as fallback
        if ("serviceWorker" in navigator) {
          try {
            console.log("Trying service worker notification as fallback")
            const registration = await navigator.serviceWorker.ready
            await registration.showNotification(title, options)

            // Store the notification in Firestore if it's a client notification and storeInFirestore is true
            // Only store if skipStore is not true
            if (data.storeInFirestore && !data.skipStore) {
              await this.storeNotificationInFirestore(title, body, {
                ...data,
                id: notificationId,
              })
            }

            console.log("Service worker notification shown successfully")
            return true
          } catch (swError) {
            console.error("Error showing service worker notification:", swError)
          }
        }
      }
    } else {
      console.log("Notification permission not granted")

      // If forceFallback is true, try to request permission
      if (data.forceFallback && "Notification" in window) {
        try {
          console.log("Requesting notification permission")
          const permission = await Notification.requestPermission()
          console.log(`Permission result: ${permission}`)

          if (permission === "granted") {
            // Try again with granted permission
            return this.showNotification(title, body, data)
          }
        } catch (permError) {
          console.error("Error requesting notification permission:", permError)
        }
      }
    }

    // If we reach here, all notification methods failed
    console.log("All notification methods failed")

    // If forceFallback is true, use alert as last resort
    if (data.forceFallback) {
      console.log("Using alert as last resort fallback")
      setTimeout(() => {
        alert(`${title}\n\n${body}`)

        // Store the notification in Firestore if it's a client notification and storeInFirestore is true
        // Only store if skipStore is not true
        if (data.storeInFirestore && !data.skipStore) {
          this.storeNotificationInFirestore(title, body, {
            ...data,
            id: notificationId,
          })
        }
      }, 500)
      return true
    }

    return null
  }

  async storeNotificationInFirestore(title, body, data = {}) {
    try {
      // Check if notifications should be shown based on user preference
      if (!data.forceFallback) {
        const shouldShow = await this.shouldShowNotifications()
        if (!shouldShow) {
          console.log("Notifications disabled by user preference, not storing notification")
          return
        }
      }

      // Check if store is available
      if (!this.notificationsStore) {
        console.warn("Notifications store not available, cannot store notification")
        return
      }

      // Get current user
      const user = window.currentUser || null
      if (!user || !user.userId) {
        console.warn("No user logged in, cannot store notification")
        return
      }

      const userId = user.userId
      const notificationId = data.id || `notification_${nanoid(8)}`

      // Check if notification with this ID already exists to prevent duplicates
      const notificationsRef = collection(db, "notifications")
      const q = query(notificationsRef, where("notificationId", "==", notificationId), where("userId", "==", userId))

      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        console.log(`Notification with ID ${notificationId} already exists, skipping storage`)
        return
      }

      // Sanitize the data object to ensure all values are strings
      const sanitizedData = {}
      if (data) {
        Object.keys(data).forEach((key) => {
          if (data[key] === null) {
            sanitizedData[key] = "null"
          } else if (typeof data[key] === "object") {
            try {
              sanitizedData[key] = JSON.stringify(data[key])
            } catch (e) {
              sanitizedData[key] = String(data[key])
            }
          } else {
            sanitizedData[key] = String(data[key])
          }
        })
      }

      // Create notification object
      const notificationData = {
        userId: userId,
        notificationId: notificationId,
        title: title,
        description: body,
        type: data.type || "general",
        read: false,
        url: data.url || "/user/notifications",
        data: sanitizedData, // Use sanitized data
        browser: this.browserInfo.name,
        browserVersion: this.browserInfo.version,
        isMobile: this.browserInfo.isMobile,
        createdAt: serverTimestamp(),
      }

      // Add to Firestore via the store
      const docId = await this.notificationsStore.addNotification(notificationData)
      console.log("Notification stored in Firestore:", notificationId, "with doc ID:", docId)

      // Force UI update by manually adding the notification to the store's local state
      if (docId) {
        // Create a local copy with a date for immediate display
        const localNotification = {
          ...notificationData,
          id: docId,
          date: new Date(),
          read: false,
        }

        // Add to local state for immediate display
        this.notificationsStore.addLocalNotification(localNotification)
      }
    } catch (error) {
      console.error("Error storing notification in Firestore:", error)
    }
  }

  // Clear the processed notifications cache
  clearProcessedNotifications() {
    this.processedNotifications.clear()
    console.log("Cleared processed notifications cache")

    // Also clear the service worker's cache if available
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.active.postMessage({
            type: "CLEAR_DUPLICATE_CACHE",
          })
        })
        .catch((err) => {
          console.error("Error clearing service worker cache:", err)
        })
    }
  }

  async updateServiceWorkerPreference(userId, enabled) {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "UPDATE_USER_PREFERENCE",
          userId,
          enabled,
          browser: this.browserInfo.name,
          browserVersion: this.browserInfo.version,
          isMobile: this.browserInfo.isMobile,
        })
        console.log(`Sent preference update to service worker: ${enabled ? "enabled" : "disabled"}`)
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating service worker preference:", error)
      return false
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService()

// Export the singleton instance
export default notificationService

