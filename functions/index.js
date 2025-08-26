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
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', 'https://innovet-project.vercel.app');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

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

/**
* Cloud function to send emails (OTP, verification, etc.)
* This function handles all email-related operations
*/
exports.sendEmail = onRequest((req, res) => {
  return cors(req, res, async () => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', 'https://innovet-project.vercel.app');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const { email, firstName, purpose, otp, newPassword } = req.body;
      const endpoint = req.path.split('/').pop(); // Get the last part of the URL

      logger.info(`Email function called with endpoint: ${endpoint}`, { email, purpose, endpoint });

      switch (endpoint) {
        case 'send-otp':
          // Generate OTP and send email
          const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Store OTP in Firestore with expiry (5 minutes)
          const otpRef = admin.firestore().collection('otps').doc(email);
          await otpRef.set({
            otp: generatedOTP,
            purpose: purpose || 'verification',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            attempts: 0
          });

          // TODO: Integrate with your email service (SendGrid, Nodemailer, etc.)
          // For now, just log the OTP
          logger.info(`OTP generated for ${email}: ${generatedOTP}`);
          
          res.status(200).json({ 
            success: true, 
            message: 'OTP sent successfully',
            // Remove this in production - only for testing
            otp: generatedOTP 
          });
          break;

        case 'verify-otp':
          // Verify OTP
          const otpDoc = await admin.firestore().collection('otps').doc(email).get();
          
          if (!otpDoc.exists) {
            res.status(400).json({ success: false, message: 'No OTP found for this email' });
            return;
          }

          const otpData = otpDoc.data();
          
          // Check if OTP is expired
          if (otpData.expiresAt.toDate() < new Date()) {
            res.status(400).json({ success: false, message: 'OTP has expired' });
            return;
          }

          // Check if OTP matches
          if (otpData.otp !== otp) {
            // Increment attempts
            await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
            
            if (otpData.attempts >= 3) {
              res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
              return;
            }
            
            res.status(400).json({ success: false, message: 'Invalid OTP' });
            return;
          }

          // OTP is valid - delete it and return success
          await otpRef.delete();
          
          res.status(200).json({ 
            success: true, 
            message: 'OTP verified successfully',
            valid: true 
          });
          break;

        case 'resend-otp':
          // Resend OTP (same logic as send-otp)
          const resendOTP = Math.floor(100000 + Math.random() * 900000).toString();
          
          const resendOtpRef = admin.firestore().collection('otps').doc(email);
          await resendOtpRef.set({
            otp: resendOTP,
            purpose: purpose || 'verification',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            attempts: 0
          });

          logger.info(`OTP resent for ${email}: ${resendOTP}`);
          
          res.status(200).json({ 
            success: true, 
            message: 'OTP resent successfully',
            // Remove this in production - only for testing
            otp: resendOTP 
          });
          break;

        case 'reset-password':
          // Handle password reset
          if (!otp || !newPassword) {
            res.status(400).json({ success: false, message: 'OTP and new password are required' });
            return;
          }

          // Verify OTP first
          const resetOtpDoc = await admin.firestore().collection('otps').doc(email).get();
          
          if (!resetOtpDoc.exists) {
            res.status(400).json({ success: false, message: 'No OTP found for this email' });
            return;
          }

          const resetOtpData = resetOtpDoc.data();
          
          if (resetOtpData.otp !== otp) {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
            return;
          }

          if (resetOtpData.expiresAt.toDate() < new Date()) {
            res.status(400).json({ success: false, message: 'OTP has expired' });
            return;
          }

          // TODO: Update user password in Firebase Auth
          // For now, just delete the OTP
          await resetOtpDoc.ref.delete();
          
          res.status(200).json({ 
            success: true, 
            message: 'Password reset successfully' 
          });
          break;

        default:
          res.status(404).json({ success: false, message: 'Endpoint not found' });
      }

    } catch (error) {
      logger.error("Error in sendEmail function:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});