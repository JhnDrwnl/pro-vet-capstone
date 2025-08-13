<!-- components/common/AppointmentReminder.vue -->
<template>
  <div class="hidden">
    <!-- This component runs in the background to send appointment reminders -->
    <!-- No visible UI needed -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { sendDailyAppointmentReminders, setupDailyReminders } from '@/services/notificationService'

const authStore = useAuthStore()
let reminderInterval = null
let lastReminderDate = ref(null) // Track the last date reminders were sent

// Global flag to prevent multiple reminder systems from running
let globalReminderSystemActive = false

// Function to check if it's 6 AM and send reminders
const checkAndSendReminders = async () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const today = now.toDateString()
  
  // Check if it's exactly 6:00 AM (within a 1-minute window)
  if (currentHour === 6 && currentMinute === 0) {
    // Prevent spam: only send reminders once per day
    if (lastReminderDate.value === today) {
      console.log('🕕 6:00 AM - Reminders already sent today, skipping...')
      return
    }
    
    console.log('🕕 6:00 AM - Sending daily appointment reminders...')
    console.log('📅 Current date:', today)
    console.log('🕐 Current time:', now.toLocaleTimeString())
    
    try {
      const result = await sendDailyAppointmentReminders()
      lastReminderDate.value = today
      console.log('✅ Daily reminders sent successfully for', today, '- Count:', result)
    } catch (error) {
      console.error('❌ Error sending daily reminders:', error)
    }
  }
}

// Function to set up the reminder system
const setupReminderSystem = () => {
  // Prevent multiple reminder systems from running
  if (globalReminderSystemActive) {
    console.log('⚠️ Reminder system already active globally, skipping setup...')
    return
  }
  
  // Clean up any existing interval first
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
    console.log('🧹 Cleaned up existing reminder interval')
  }
  
  // Check every minute if it's time to send reminders
  reminderInterval = setInterval(() => {
    checkAndSendReminders()
  }, 60 * 1000) // Check every minute
  
  // Also check immediately when component mounts (but don't send if already sent today)
  checkAndSendReminders()
  
  // Mark as globally active
  globalReminderSystemActive = true
  
  console.log('📅 Appointment reminder system initialized - checking every minute for 6:00 AM')
  console.log('🕐 Current time:', new Date().toLocaleTimeString())
  console.log('📅 Current date:', new Date().toDateString())
  console.log('🌐 Global reminder system marked as active')
}

// Function to manually trigger reminders (for testing)
const manualTriggerReminders = async () => {
  console.log('🔔 Manually triggering appointment reminders...')
  try {
    const result = await sendDailyAppointmentReminders()
    console.log(`✅ Manual reminder trigger completed. ${result} reminders sent.`)
    // Update the last reminder date for manual triggers too
    lastReminderDate.value = new Date().toDateString()
  } catch (error) {
    console.error('❌ Manual reminder trigger failed:', error)
  }
}

// Function to manually reset the reminder system (for testing)
const manualResetSystem = () => {
  console.log('🔄 Manually resetting reminder system...')
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
  }
  lastReminderDate.value = null
  globalReminderSystemActive = false
  console.log('✅ Reminder system manually reset')
  
  // Re-setup the system
  setupReminderSystem()
}

// Expose manual trigger for testing purposes
defineExpose({
  manualTriggerReminders,
  manualResetSystem
})

onMounted(() => {
  // Only set up reminders if user is authenticated
  if (authStore.user?.userId) {
    setupReminderSystem()
  }
})

onUnmounted(() => {
  // Clean up interval when component unmounts
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
    console.log('🧹 Appointment reminder system cleaned up')
  }
  
  // Reset global flag if this was the active system
  if (globalReminderSystemActive) {
    globalReminderSystemActive = false
    console.log('🌐 Global reminder system flag reset')
  }
})

// Watch for user authentication changes
watch(() => authStore.user, (newUser) => {
  if (newUser?.userId) {
    // User logged in, set up reminders
    if (!reminderInterval) {
      setupReminderSystem()
    }
  } else {
    // User logged out, clean up reminders
    if (reminderInterval) {
      clearInterval(reminderInterval)
      reminderInterval = null
    }
    // Reset the last reminder date when user logs out
    lastReminderDate.value = null
    
    // Reset global flag if this was the active system
    if (globalReminderSystemActive) {
      globalReminderSystemActive = false
      console.log('🌐 Global reminder system flag reset due to logout')
    }
  }
}, { immediate: true })
</script>

<style scoped>
/* No styles needed for this background component */
</style>
