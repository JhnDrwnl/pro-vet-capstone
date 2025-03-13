//functions/index.js
const { onRequest } = require("firebase-functions/v2/https")
const { onDocumentCreated } = require("firebase-functions/v2/firestore")
const admin = require("firebase-admin")
const cors = require("cors")({ origin: true })
const logger = require("firebase-functions/logger")

// Initialize Firebase Admin SDK
admin.initializeApp()

/**
* Cloud function to send a notification to a specific device
* This function can be called from your client application
*/
exports.sendNotification = onRequest((req, res) => {
 return cors(req, res, async () => {
   // Only allow POST requests
   if (req.method !== "POST") {
     res.status(405).send("Method Not Allowed")
     return
   }

   try {
     const { token, notification, data, browser } = req.body

     if (!token) {
       res.status(400).json({ success: false, error: "FCM token is required" })
       return
     }

     if (!notification || !notification.title) {
       res.status(400).json({ success: false, error: "Notification title is required" })
       return
     }

     // Check if this is Microsoft Edge
     const isEdge = browser && browser.includes("edge")
     logger.info("Browser info:", browser || "Not provided", isEdge ? "(Edge detected)" : "")

     // Ensure data has a URL, default to notifications panel if not provided
     const messageData = data || {}
     if (!messageData.url) {
       messageData.url = "/user/notifications"
     }

     // Prepare message
     const message = {
       token: token,
       notification: {
         title: notification.title,
         body: notification.body || "",
       },
       data: messageData,
       android: {
         notification: {
           icon: "ic_notification",
           color: "#4285F4",
           clickAction: "FLUTTER_NOTIFICATION_CLICK",
         },
       },
       apns: {
         payload: {
           aps: {
             badge: 1,
             sound: "default",
           },
         },
       },
       webpush: {
         notification: {
           icon: "/favicon.ico",
           badge: "/notification-badge.png",
           requireInteraction: true, // Keep notification until user interacts with it
         },
         fcmOptions: {
           link: messageData.url,
         },
         // Edge-specific headers
         headers: isEdge
           ? {
               Urgency: "high",
               TTL: "86400",
             }
           : undefined,
       },
     }

     // Send message
     const response = await admin.messaging().send(message)
     logger.info("Successfully sent message:", response)

     res.status(200).json({ success: true, messageId: response })
   } catch (error) {
     logger.error("Error sending notification:", error)
     res.status(500).json({ success: false, error: error.message })
   }
 })
})

/**
* Trigger function to send notifications when a new document is created in the 'notifications' collection
*/
exports.sendNotificationOnCreate = onDocumentCreated("notifications/{notificationId}", async (event) => {
 try {
   // Get the document data
   const snapshot = event.data
   if (!snapshot) {
     logger.error("No data associated with the event")
     return null
   }

   const notificationData = snapshot.data()

   if (!notificationData.token) {
     logger.error("No FCM token provided for notification")
     return null
   }

   // Check if this is Microsoft Edge
   const isEdge = notificationData.browser && notificationData.browser.includes("edge")
   logger.info("Browser info:", notificationData.browser || "Not provided", isEdge ? "(Edge detected)" : "")

   // Ensure data has a URL, default to notifications panel if not provided
   const messageData = notificationData.data || {}
   if (!messageData.url) {
     messageData.url = "/user/notifications"
   }

   const message = {
     token: notificationData.token,
     notification: {
       title: notificationData.title,
       body: notificationData.body || "",
     },
     data: messageData,
     android: {
       notification: {
         icon: "ic_notification",
         color: "#4285F4",
       },
     },
     apns: {
       payload: {
         aps: {
           badge: 1,
           sound: "default",
         },
       },
     },
     webpush: {
       notification: {
         icon: "/favicon.ico",
         badge: "/notification-badge.png",
         requireInteraction: true, // Keep notification until user interacts with it
       },
       fcmOptions: {
         link: messageData.url,
       },
       // Edge-specific headers
       headers: isEdge
         ? {
             Urgency: "high",
             TTL: "86400",
           }
         : undefined,
     },
   }

   const response = await admin.messaging().send(message)
   logger.info("Successfully sent notification:", response)

   // Update the notification document with sent status
   await snapshot.ref.update({
     sent: true,
     sentAt: admin.firestore.FieldValue.serverTimestamp(),
     messageId: response,
   })

   return response
 } catch (error) {
   logger.error("Error sending notification:", error)

   // If we have the document reference, update it with the error
   if (event.data) {
     try {
       await event.data.ref.update({
         sent: false,
         error: error.message,
         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
       })
     } catch (updateError) {
       logger.error("Error updating notification document:", updateError)
     }
   }

   return null
 }
})