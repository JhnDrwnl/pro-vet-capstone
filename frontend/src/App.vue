<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
    <!-- Global appointment reminder system -->
    <AppointmentReminder ref="appointmentReminderRef" />
    <!-- Reminder tester for development/testing -->
    <ReminderTester :appointment-reminder-ref="appointmentReminderRef" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import AppointmentReminder from '@/components/common/AppointmentReminder.vue'
import ReminderTester from '@/components/common/ReminderTester.vue'

const authStore = useAuthStore()
const appointmentReminderRef = ref(null)

onMounted(() => {
  authStore.initializeAuth()
    .then(() => {
      console.log('Authentication initialized successfully')
    })
    .catch(error => {
      console.error('Failed to initialize authentication:', error)
    })
})
</script>