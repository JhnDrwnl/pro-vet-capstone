<!-- components/common/AppointmentReminder.vue -->
<template>
  <div class="hidden">
    <!-- This component runs in the background to send appointment reminders -->
    <!-- No visible UI needed -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { sendDailyAppointmentReminders, setupDailyReminders } from '@/services/notificationService'

const authStore = useAuthStore()
let reminderInterval = null

// Function to check if it's 6 AM and send reminders
const checkAndSendReminders = () => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Check if it's exactly 6:00 AM (within a 1-minute window)
  if (currentHour === 6 && currentMinute === 0) {
    console.log('🕕 6:00 AM - Sending daily appointment reminders...')
    sendDailyAppointmentReminders()
  }
}

// Function to set up the reminder system
const setupReminderSystem = () => {
  // Check every minute if it's time to send reminders
  reminderInterval = setInterval(() => {
    checkAndSendReminders()
  }, 60 * 1000) // Check every minute
  
  // Also check immediately when component mounts
  checkAndSendReminders()
  
  console.log('📅 Appointment reminder system initialized - checking every minute for 6:00 AM')
}

// Function to manually trigger reminders (for testing)
const manualTriggerReminders = async () => {
  console.log('🔔 Manually triggering appointment reminders...')
  const result = await sendDailyAppointmentReminders()
  console.log(`✅ Manual reminder trigger completed. ${result} reminders sent.`)
}

// Expose manual trigger for testing purposes
defineExpose({
  manualTriggerReminders
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
  }
}, { immediate: true })
</script>

<style scoped>
/* No styles needed for this background component */
</style>
