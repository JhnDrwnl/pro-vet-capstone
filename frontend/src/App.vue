<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
    <!-- Global appointment reminder system -->
    <AppointmentReminder />
    <!-- Reminder tester for development/testing -->
    <ReminderTester />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import AppointmentReminder from '@/components/common/AppointmentReminder.vue'
import ReminderTester from '@/components/common/ReminderTester.vue'

const authStore = useAuthStore()

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