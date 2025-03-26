// services/welcomeNotificationService.js
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@shared/firebase"
import axios from "axios"
import notificationService from "./notificationService"

class WelcomeNotificationService {
  constructor() {
    this.apiUrl = "https://us-central1-provet-calapan-3bc89.cloudfunctions.net/sendNotification"
    this.userAgent = navigator.userAgent
    this.browserInfo = this.detectBrowser()
    this.notificationSaved = false // Track if notification has been saved to Firestore
    this.notificationShown = false // Track if notification has been shown

    console.log(
      `WelcomeNotificationService initialized with browser: ${this.browserInfo.name} ${this.browserInfo.version}`,
    )
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

  // Check if welcome notification already exists for this user
  async checkExistingWelcomeNotification(userId, notificationId) {
    try {
      const notificationsRef = collection(db, "notifications")
      const q = query(notificationsRef, where("userId", "==", userId), where("type", "==", "welcome"))

      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error("Error checking existing welcome notification:", error)
      return false
    }
  }

  async sendWelcomeNotification(userId, token) {
    let success = false // Declare success variable
    try {
      // Reset notification flags
      this.notificationSaved = false
      this.notificationShown = false

      console.log(`Attempting to send welcome notification to user ${userId}`)
      console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`)

      // Clear notification cache to ensure welcome notification is shown
      notificationService.clearProcessedNotifications()

      // Get user data to personalize the message
      const userRef = doc(db, "users", userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        console.error("User document not found")
        return false
      }

      const userData = userDoc.data()
      const firstName = userData.firstName || "there"

      const title = "Welcome to Provincial Veterinary!"
      const body = `Hi ${firstName}, thanks for enabling notifications. You'll now receive updates about your pet's health.`

      // Generate a unique ID with timestamp to avoid duplicates
      const notificationId = `welcome_${userId}_${Date.now()}`

      const data = {
        type: "welcome",
        url: "/user/notifications",
        id: notificationId,
      }

      // Check if welcome notification already exists
      const welcomeExists = await this.checkExistingWelcomeNotification(userId, notificationId)
      if (welcomeExists) {
        console.log("Welcome notification already exists for this user, skipping")
        return true
      }

      // Try methods in sequence, stopping after the first success

      // Method 1: Call the HTTP function directly (preferred method)
      if (!success && !this.notificationShown) {
        try {
          console.log("Trying HTTP function method")

          // Sanitize the data for the HTTP function
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
          // Add fromFirebase flag as string
          sanitizedData.fromFirebase = "true"

          const notificationPayload = {
            token: token,
            notification: {
              title: title,
              body: body,
            },
            data: sanitizedData, // Use sanitized data
            userId: userId,
            browser: this.browserInfo.name,
            browserVersion: this.browserInfo.version,
            isMobile: this.browserInfo.isMobile,
          }

          console.log("Sending payload:", JSON.stringify(notificationPayload))

          const response = await axios.post(this.apiUrl, notificationPayload, {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 5000, // 5 second timeout - reduced from 10s to fail faster
          })

          console.log("HTTP function response:", response.data)

          if (response.status === 200 && response.data.success) {
            console.log("Welcome notification sent successfully via HTTP function")
            success = true
            this.notificationShown = true

            // Wait a moment to ensure the notification is processed by Firebase
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            console.warn("HTTP function response:", response.data)
          }
        } catch (httpError) {
          console.error("Error calling HTTP function:", httpError)
        }
      }

      // Method 2: Add to Firestore for the cloud function to handle (fallback)
      if (!success && !this.notificationShown && !this.notificationSaved) {
        try {
          console.log("Trying Firestore queue method")

          // Check if notification already exists in Firestore
          const notificationsRef = collection(db, "notifications")
          const q = query(notificationsRef, where("userId", "==", userId), where("type", "==", "welcome"))

          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            console.log("Welcome notification already exists in Firestore, skipping")
            this.notificationSaved = true
          } else {
            // Sanitize the data object
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
            // Add fromFirebase flag as string
            sanitizedData.fromFirebase = "true"

            await addDoc(notificationsRef, {
              token: token,
              title: title,
              body: body,
              description: body,
              type: "welcome",
              read: false,
              data: sanitizedData, // Use sanitized data
              userId: userId,
              browser: this.browserInfo.name,
              browserVersion: this.browserInfo.version,
              isMobile: this.browserInfo.isMobile,
              createdAt: new Date(),
              sent: false,
              deleted: false,
            })
            console.log("Welcome notification added to Firestore queue")

            // Mark as saved to prevent duplicate storage
            this.notificationSaved = true

            // Wait a moment to ensure the notification is processed
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        } catch (firestoreError) {
          console.error("Error adding notification to Firestore:", firestoreError)
        }
      }

      // Method 3: Client-side fallback (for ALL browsers)
      // Always try the client-side method if notification hasn't been shown yet
      if (!this.notificationShown) {
        console.log("Trying client-side fallback method")

        // Check if notification permission is granted
        if (Notification.permission !== "granted") {
          console.log("Notification permission not granted, requesting permission")

          try {
            const newPermission = await Notification.requestPermission()
            console.log(`New notification permission: ${newPermission}`)

            if (newPermission !== "granted") {
              console.log("Permission still not granted, cannot show notification")
              return success // Return previous success state
            }
          } catch (permError) {
            console.error("Error requesting notification permission:", permError)
          }
        }

        console.log("Showing notification via client-side method")
        // Use a different ID for the client-side notification to avoid duplicate detection
        const clientNotificationId = `welcome_client_${userId}_${Date.now()}`

        try {
          // First try with the notification service
          // Set storeInFirestore based on whether we've already saved to Firestore
          const clientSuccess = await notificationService.showNotification(title, body, {
            ...data,
            id: clientNotificationId,
            userId: userId,
            forceFallback: true, // Force using the fallback method
            fromClient: true, // Mark as coming from client
            icon: "/favicon.ico", // Ensure icon is set
            badge: "/notification-badge.png",
            requireInteraction: true, // Make notification stay until user interacts with it
            vibrate: [100, 50, 100, 50, 100], // Add vibration pattern for mobile
            timestamp: Date.now(), // Add timestamp
            storeInFirestore: !this.notificationSaved, // Only store if not already saved
            skipDuplicateCheck: true, // Skip duplicate check for this notification
          })

          if (clientSuccess) {
            console.log("Welcome notification shown via client-side fallback")
            success = true
            this.notificationShown = true
          } else {
            console.log("Client-side notification service failed, trying direct Notification API")

            // Try direct Notification API as last resort
            if ("Notification" in window && Notification.permission === "granted") {
              const notification = new Notification(title, {
                body: body,
                icon: "/favicon.ico",
                badge: "/notification-badge.png",
                tag: clientNotificationId,
                requireInteraction: true,
                vibrate: [100, 50, 100, 50, 100],
                data: {
                  url: "/user/notifications",
                  id: clientNotificationId,
                  type: "welcome",
                  userId: userId,
                },
              })

              // Add click handler
              notification.onclick = () => {
                console.log("Notification clicked")
                window.focus()
                notification.close()
                window.location.href = "/user/notifications"
              }

              console.log("Welcome notification shown via direct Notification API")
              success = true
              this.notificationShown = true

              // Store the notification in Firestore if not already saved
              if (!this.notificationSaved) {
                // Sanitize the data object
                const sanitizedData = {}
                const notificationData = {
                  url: "/user/notifications",
                  id: clientNotificationId,
                  type: "welcome",
                  userId: userId,
                  fromClient: true,
                }

                Object.keys(notificationData).forEach((key) => {
                  if (notificationData[key] === null) {
                    sanitizedData[key] = "null"
                  } else if (typeof notificationData[key] === "object") {
                    try {
                      sanitizedData[key] = JSON.stringify(notificationData[key])
                    } catch (e) {
                      sanitizedData[key] = String(notificationData[key])
                    }
                  } else {
                    sanitizedData[key] = String(notificationData[key])
                  }
                })

                await notificationService.storeNotificationInFirestore(title, body, {
                  ...sanitizedData,
                  skipDuplicateCheck: true, // Skip duplicate check for this notification
                })
                this.notificationSaved = true
              }
            } else {
              console.error("All notification methods failed")
            }
          }
        } catch (clientError) {
          console.error("Error showing client-side notification:", clientError)

          // Last resort: alert
          if (!this.notificationShown) {
            try {
              setTimeout(() => {
                alert(`${title}\n\n${body}`)

                // Store the notification in Firestore if not already saved
                if (!this.notificationSaved) {
                  // Sanitize the data object
                  const sanitizedData = {}
                  const notificationData = {
                    url: "/user/notifications",
                    id: clientNotificationId,
                    type: "welcome",
                    userId: userId,
                    fromClient: true,
                  }

                  Object.keys(notificationData).forEach((key) => {
                    if (notificationData[key] === null) {
                      sanitizedData[key] = "null"
                    } else if (typeof notificationData[key] === "object") {
                      try {
                        sanitizedData[key] = JSON.stringify(notificationData[key])
                      } catch (e) {
                        sanitizedData[key] = String(notificationData[key])
                      }
                    } else {
                      sanitizedData[key] = String(notificationData[key])
                    }
                  })

                  notificationService.storeNotificationInFirestore(title, body, {
                    ...sanitizedData,
                    skipDuplicateCheck: true, // Skip duplicate check for this notification
                  })
                  this.notificationSaved = true
                }
              }, 500)
              console.log("Showed notification as alert")
              success = true
              this.notificationShown = true
            } catch (alertError) {
              console.error("Even alert failed:", alertError)
            }
          }
        }
      }

      return success || this.notificationShown || this.notificationSaved
    } catch (error) {
      console.error("Error sending welcome notification:", error)
      return false
    }
  }

  // Add a test method for debugging
  async testWelcomeNotification() {
    console.log("Testing welcome notification")
    console.log(`Browser: ${this.browserInfo.name} ${this.browserInfo.version}`)

    // Reset notification flags
    this.notificationSaved = false
    this.notificationShown = false

    // Clear notification cache to ensure test notification is shown
    notificationService.clearProcessedNotifications()

    // Check notification permission
    const permission = Notification.permission
    console.log(`Current notification permission: ${permission}`)

    // If permission is not granted, try to request it
    if (permission !== "granted" && "Notification" in window) {
      try {
        console.log("Requesting notification permission")
        const newPermission = await Notification.requestPermission()
        console.log(`New notification permission: ${newPermission}`)
      } catch (error) {
        console.error("Error requesting notification permission:", error)
      }
    }

    const title = "Test Welcome Notification"
    const body = "This is a test welcome notification."
    const data = {
      type: "test",
      url: "/user/notifications",
      id: `test_${Date.now()}`, // Add unique ID
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100],
    }

    let success = false

    // Try multiple notification methods
    try {
      // 1. Try notification service first
      if (!this.notificationShown) {
        console.log("Trying notification service")

        // Sanitize the data object
        const sanitizedData = {}
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

        const result = await notificationService.showNotification(title, body, {
          ...sanitizedData,
          forceFallback: true, // Force using the fallback method
          fromClient: true, // Mark as coming from client
          storeInFirestore: !this.notificationSaved, // Only store if not already saved
          skipDuplicateCheck: true, // Skip duplicate check for this notification
        })

        if (result) {
          console.log("Test notification shown via notification service")
          success = true
          this.notificationShown = true
          this.notificationSaved = true // Mark as saved since notificationService will save it
        } else {
          console.log("Notification service failed, trying direct API")

          // 2. Try direct Notification API
          if (!this.notificationShown && "Notification" in window && Notification.permission === "granted") {
            const notification = new Notification(title, {
              body: body,
              icon: "/favicon.ico",
              badge: "/notification-badge.png",
              tag: data.id,
              requireInteraction: true,
              vibrate: [100, 50, 100, 50, 100],
              data: {
                url: "/user/notifications",
                id: data.id,
                type: "test",
              },
            })

            // Add click handler
            notification.onclick = () => {
              console.log("Test notification clicked")
              window.focus()
              notification.close()
              window.location.href = "/user/notifications"
            }

            console.log("Test notification shown via direct Notification API")
            success = true
            this.notificationShown = true

            // Store the notification in Firestore if not already saved
            if (!this.notificationSaved) {
              // Sanitize the data object
              const sanitizedData = {}
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

              await notificationService.storeNotificationInFirestore(title, body, {
                ...sanitizedData,
                skipDuplicateCheck: true, // Skip duplicate check for this notification
              })
              this.notificationSaved = true
            }
          } else {
            console.log("Direct Notification API failed or not available")
          }
        }
      }
    } catch (error) {
      console.error("Error showing test notification:", error)
    }

    // 3. Last resort: alert
    if (!success && !this.notificationShown) {
      try {
        setTimeout(() => {
          alert(`${title}\n\n${body}`)

          // Store the notification in Firestore if not already saved
          if (!this.notificationSaved) {
            // Sanitize the data object
            const sanitizedData = {}
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

            notificationService.storeNotificationInFirestore(title, body, {
              ...sanitizedData,
              skipDuplicateCheck: true, // Skip duplicate check for this notification
            })
            this.notificationSaved = true
          }
        }, 500)
        console.log("Showed test notification as alert")
        success = true
        this.notificationShown = true
      } catch (alertError) {
        console.error("Even alert failed:", alertError)
      }
    }

    console.log("Test notification result:", success)
    return success
  }
}

export default new WelcomeNotificationService()

