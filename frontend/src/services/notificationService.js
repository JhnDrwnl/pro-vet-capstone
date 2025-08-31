// frontend/src/services/notificationService.js
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import smsService from './smsService' // Assuming smsService.js is in the same directory

// Notification types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  GENERAL: 'general'
}

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// Service state
let router = null
let notificationsStore = null
let lastDailyReminderDate = null // Prevent spam: track last date reminders were sent
let isReminderProcessRunning = false // Prevent concurrent reminder processes

/**
 * Set router instance for navigation
 */
export const setRouter = (routerInstance) => {
  router = routerInstance
  console.log('Router set in notification service')
}

/**
 * Set notifications store instance
 */
export const setNotificationsStore = (store) => {
  notificationsStore = store
  console.log('Notifications store set in notification service')
}

/**
 * Initialize the notification service
 */
export const initialize = async () => {
  try {
    console.log('Initializing notification service...')
    
    // Note: Daily reminders are now handled by AppointmentReminder.vue component
    // No need to initialize duplicate scheduler here
    
    console.log('Notification service initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing notification service:', error)
    return false
  }
}

/**
 * Create a notification in Firestore
 */
export const createNotification = async (notificationData) => {
  try {
    console.log('🔧 createNotification called with data:', notificationData);
    
    const notificationsRef = collection(db, 'notifications')
    
    const notification = {
      ...notificationData,
      createdAt: new Date(),
      read: false,
      id: Date.now().toString() // Simple ID for now
    }
    
    console.log('📝 Prepared notification data:', notification);
    
    const docRef = await addDoc(notificationsRef, notification)
    console.log('✅ Notification created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return false
  }
}

/**
 * Get notifications for a specific user
 */
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const notifications = []
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return notifications.slice(0, limit)
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // This would typically use updateDoc, but for now we'll just return success
    // In a real implementation, you'd update the 'read' field to true
    console.log(`Notification ${notificationId} marked as read`)
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Show a notification (client-side notification display)
 */
export const showNotification = async (title, body, options = {}) => {
  try {
    console.log('🔔 showNotification called:', { title, body, options })
    
    // If we have a notifications store, add to it (this will handle Firestore storage)
    if (notificationsStore) {
      console.log('📱 Using notifications store for storage')
      
      const notificationData = {
        type: options.type || NOTIFICATION_TYPES.GENERAL,
        priority: options.priority || NOTIFICATION_PRIORITIES.MEDIUM,
        userId: options.userId,
        title: title,
        description: body,
        message: body,
        appointmentId: options.appointmentId,
        url: options.url,
        data: options.data || {},
        read: false,
        createdAt: new Date()
      }
      
      // Add to store if available (this will also store in Firestore)
      if (notificationsStore.addNotification) {
        console.log('💾 Storing notification via notifications store...')
        const result = await notificationsStore.addNotification(notificationData)
        if (result) {
          console.log('✅ Notification stored successfully via store with ID:', result)
          return { success: true, message: 'Notification shown and stored via store' }
        } else {
          console.log('⚠️ Store failed, falling back to direct Firestore storage')
          // If store failed, fallback to direct Firestore storage
          if (options.storeInFirestore !== false) {
            const notificationId = await createNotification(notificationData)
            return { success: true, message: 'Notification stored directly in Firestore', id: notificationId }
          }
        }
      }
      
      return { success: true, message: 'Notification shown via store' }
    }
    
    // Fallback: just store in Firestore when no store is available
    console.log('📱 No notifications store available, using direct Firestore storage')
    if (options.storeInFirestore !== false) {
      const notificationData = {
        type: options.type || NOTIFICATION_TYPES.GENERAL,
        priority: options.priority || NOTIFICATION_PRIORITIES.MEDIUM,
        userId: options.userId,
        title: title,
        description: body,
        message: body,
        appointmentId: options.appointmentId,
        url: options.url,
        data: options.data || {},
        read: false,
        createdAt: new Date()
      }
      
      const notificationId = await createNotification(notificationData)
      return { success: true, message: 'Notification stored directly in Firestore', id: notificationId }
    }
    
    return { success: true, message: 'Notification shown' }
  } catch (error) {
    console.error('❌ Error showing notification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Store notification in Firestore
 */
export const storeNotificationInFirestore = async (title, body, options = {}) => {
  try {
    console.log('Storing notification in Firestore:', { title, body, options })
    
    const notificationData = {
      type: options.type || NOTIFICATION_TYPES.GENERAL,
      priority: options.priority || NOTIFICATION_PRIORITIES.MEDIUM,
      userId: options.userId,
      title: title,
      description: body,
      message: body,
      appointmentId: options.appointmentId,
      url: options.url,
      data: options.data || {},
      read: false,
      createdAt: new Date()
    }
    
    const result = await createNotification(notificationData)
    if (result) {
      return { success: true, message: 'Notification stored in Firestore', id: result }
    } else {
      return { success: false, message: 'Failed to store notification in Firestore' }
    }
  } catch (error) {
    console.error('Error storing notification in Firestore:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create appointment reminder notification
 */
export const createAppointmentReminder = async (appointment) => {
  try {
    console.log('Creating reminder for appointment:', {
      id: appointment.id,
      time: appointment.time,
      petNames: appointment.petNames,
      serviceNames: appointment.serviceNames,
      date: appointment.date
    })
    
    // Extract and validate appointment data
    const appointmentTime = appointment.time || 'Time not specified'
    const petNames = appointment.petNames || appointment.petName || ['Pet not specified']
    const serviceNames = appointment.serviceNames || appointment.serviceName || ['Service not specified']
    const appointmentDate = appointment.date || new Date()
    
    // Ensure petNames and serviceNames are arrays
    const petNamesArray = Array.isArray(petNames) ? petNames : [petNames]
    const serviceNamesArray = Array.isArray(serviceNames) ? serviceNames : [serviceNames]
    
    const notificationData = {
      type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      userId: appointment.userId,
      title: 'Appointment Reminder',
      description: `Don't forget your appointment today at ${appointmentTime} for ${petNamesArray.join(', ')}`,
      message: `Don't forget your appointment today at ${appointmentTime} for ${petNamesArray.join(', ')}`,
      appointmentId: appointment.id,
      petNames: petNamesArray,
      serviceNames: serviceNamesArray,
      appointmentTime: appointmentTime,
      appointmentDate: appointmentDate,
      date: new Date(), // This is what the notification panel displays
      time: appointmentTime, // Additional time field for display
      petName: petNamesArray[0] || 'Pet not specified', // Single pet name for display
      serviceName: serviceNamesArray[0] || 'Service not specified' // Single service name for display
    }
    
    console.log('Notification data created:', notificationData)
    
    const notificationId = await createNotification(notificationData)
    if (notificationId) {
      console.log('✅ Appointment reminder notification created with ID:', notificationId)
      return notificationId
    } else {
      console.log('❌ Failed to create appointment reminder notification')
      return false
    }
  } catch (error) {
    console.error('Error creating appointment reminder:', error)
    return false
  }
}

/**
 * Get today's appointments for a specific user
 */
export const getTodaysAppointments = async (userId) => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('userId', '==', userId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('status', '==', 'approved')
    )
    
    const querySnapshot = await getDocs(q)
    const appointments = []
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return appointments
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error)
    return []
  }
}

/**
 * Create a single test appointment reminder (for testing)
 */
export const createTestAppointmentReminder = async (userId = 'test_user') => {
  try {
    const testAppointment = {
      id: 'test-appointment-' + Date.now(),
      userId: userId,
      time: '2:00 PM',
      petNames: ['Max', 'Luna'],
      serviceNames: ['General Checkup', 'Vaccination'],
      date: new Date(),
      petName: 'Max', // Single pet name (fallback)
      serviceName: 'General Checkup' // Single service name (fallback)
    }
    
    console.log('Creating test appointment reminder with data:', testAppointment)
    
    const notificationId = await createAppointmentReminder(testAppointment)
    if (notificationId) {
      console.log('✅ Test appointment reminder created successfully with ID:', notificationId)
      return notificationId
    } else {
      console.log('❌ Failed to create test appointment reminder')
      return false
    }
  } catch (error) {
    console.error('Error creating test appointment reminder:', error)
    return false
  }
}

/**
 * Create a simple test notification (for debugging)
 */
export const createTestNotification = async (userId = 'test_user') => {
  try {
    console.log('🧪 Creating test notification for user:', userId)
    
    const testNotification = {
      userId: userId,
      title: 'Test Notification',
      description: 'This is a test notification to verify the system is working',
      type: 'test',
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      data: {
        type: 'test',
        message: 'Test notification created successfully'
      }
    }
    
    const notificationId = await createNotification(testNotification)
    if (notificationId) {
      console.log('✅ Test notification created successfully with ID:', notificationId)
      return notificationId
    } else {
      console.log('❌ Failed to create test notification')
      return false
    }
  } catch (error) {
    console.error('❌ Error creating test notification:', error)
    return false
  }
}

/**
 * Send daily appointment reminders to all users with appointments
 */
export const sendDailyAppointmentReminders = async (testMode = false) => {
  try {
    if (testMode) {
      console.log('Creating test appointment reminder...')
      return await createTestAppointmentReminder()
    }
    
    // Prevent spam: only send reminders once per day
    const today = new Date().toDateString()
    if (lastDailyReminderDate === today) {
      console.log('🕕 Daily reminders already sent today, skipping...')
      return 0
    }
    
    // Prevent concurrent reminder processes
    if (isReminderProcessRunning) {
      console.log('🕕 Reminder process already running, skipping...')
      return 0
    }
    
    isReminderProcessRunning = true
    console.log('Starting daily appointment reminder process...')
    
    // Get all users with appointments today
    const todayDate = new Date()
    const startOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate())
    const endOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59, 999)
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('status', '==', 'approved')
    )

    const querySnapshot = await getDocs(q)
    const appointments = []
    
    // Collect all appointments
    querySnapshot.forEach((doc) => {
      const appointment = doc.data()
      if (appointment.userId) {
        appointments.push({
          id: doc.id,
          ...appointment
        })
      }
    })
    
    console.log(`Found ${appointments.length} appointments today`)
    
    // Create reminder notifications for EACH appointment (not per user)
    let successCount = 0
    let smsSuccessCount = 0
    let smsFailureCount = 0
    
    for (const appointment of appointments) {
      // Create in-app notification
      const notificationId = await createAppointmentReminder(appointment)
      if (notificationId) {
        successCount++
        console.log(`✅ Reminder sent for appointment: ${appointment.id} - ${appointment.time} for ${appointment.petNames?.join(', ') || 'pet'} (Notification ID: ${notificationId})`)
      } else {
        console.log(`❌ Failed to send reminder for appointment: ${appointment.id}`)
      }
      
      // Also send SMS reminder (only for verified phone numbers)
      try {
        console.log(`📱 Processing SMS for appointment: ${appointment.id}`)
        
        // Get user's phone number and verification status
        const userRef = doc(db, 'users', appointment.userId)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const userPhone = userData.phone
          const isPhoneVerified = userData.phoneVerified
          
          console.log(`📱 User data for ${appointment.userId}:`, { phone: userPhone, verified: isPhoneVerified })
          
          // Only send SMS if phone is verified and phone number exists
          if (isPhoneVerified && userPhone && userPhone.trim() !== '') {
            // Extract pet name and time
            const petName = appointment.petNames?.[0] || appointment.petName || 'Pet'
            const appointmentTime = appointment.time || 'Time not specified'
            
            console.log(`📱 Sending SMS to ${userPhone} for ${petName} at ${appointmentTime}`)
            
            // Send SMS reminder
            const smsResult = await smsService.sendAppointmentReminder(userPhone, petName, appointmentTime)
            
            if (smsResult.success) {
              smsSuccessCount++
              console.log(`📱 SMS reminder sent for appointment: ${appointment.id} - ${petName} at ${appointmentTime} to ${userPhone}`)
            } else {
              smsFailureCount++
              console.log(`❌ SMS reminder failed for appointment: ${appointment.id} - ${smsResult.error}`)
            }
          } else {
            console.log(`⚠️ Skipping SMS for user ${appointment.userId}: phone not verified (${isPhoneVerified}) or no phone number`)
          }
        } else {
          console.log(`⚠️ User not found: ${appointment.userId}`)
        }
      } catch (error) {
        smsFailureCount++
        console.error(`❌ Error processing SMS reminder for appointment ${appointment.id}:`, error)
      }
    }
    
    // Mark that reminders were sent today
    lastDailyReminderDate = today
    console.log(`Successfully sent ${successCount} in-app appointment reminders and ${smsSuccessCount} SMS reminders for ${today}`)
    if (smsFailureCount > 0) {
      console.log(`⚠️ ${smsFailureCount} SMS reminders failed`)
    }
    return { successCount, smsSuccessCount, smsFailureCount }
  } catch (error) {
    console.error('Error sending daily appointment reminders:', error)
    return 0
  } finally {
    // Always reset the running flag
    isReminderProcessRunning = false
  }
}

/**
 * Set up a daily reminder system (this would typically run on a server)
 * For now, this is a placeholder that can be called manually or integrated with a cron job
 */
export const setupDailyReminders = () => {
  // Check if it's 6 AM
  const now = new Date()
  const currentHour = now.getHours()
  
  if (currentHour === 6) {
    console.log('It\'s 6 AM, sending daily appointment reminders...')
    sendDailyAppointmentReminders()
  }
}

/**
 * Initialize the notification system
 */
export const initializeNotificationSystem = () => {
  // Check every hour if it's time to send reminders
  setInterval(() => {
    setupDailyReminders()
  }, 60 * 60 * 1000) // Check every hour
  
  // Also check immediately when the system starts
  setupDailyReminders()
  
  console.log('Notification system initialized')
}

export default {
  setRouter,
  setNotificationsStore,
  initialize,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  showNotification,
  storeNotificationInFirestore,
  createAppointmentReminder,
  createTestAppointmentReminder,
  createTestNotification,
  getTodaysAppointments,
  sendDailyAppointmentReminders,
  setupDailyReminders,
  initializeNotificationSystem,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
}
