<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
    <IncomingCallNotification 
      v-if="incomingCall" 
      :call="incomingCall" 
      @answer="handleAnswerCall"
      @reject="handleRejectCall"
      @close="incomingCall = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { useTelehealthStore } from '@/stores/modules/teleHealthStore'
import { useRouter } from 'vue-router'
import IncomingCallNotification from '@/components/telehealth/IncomingCallNotification.vue'

const authStore = useAuthStore()
const telehealthStore = useTelehealthStore()
const router = useRouter()
const incomingCall = ref(null)

// Handle incoming call events
const handleIncomingCallEvent = (event) => {
  incomingCall.value = event.detail
}

// Handle answer call
const handleAnswerCall = async () => {
  try {
    // Navigate to telehealth page
    router.push({ name: 'Telehealth' })
    incomingCall.value = null
  } catch (error) {
    console.error('Error handling answer call:', error)
  }
}

// Handle reject call
const handleRejectCall = async () => {
  try {
    await telehealthStore.rejectCall()
    incomingCall.value = null
  } catch (error) {
    console.error('Error handling reject call:', error)
  }
}

onMounted(async () => {
  try {
    await authStore.initializeAuth()
    console.log('Authentication initialized successfully')
    
    // Add event listener for incoming calls
    window.addEventListener('incomingCall', handleIncomingCallEvent)
  } catch (error) {
    console.error('Failed to initialize authentication:', error)
  }
})

onUnmounted(() => {
  // Remove event listener when component is unmounted
  window.removeEventListener('incomingCall', handleIncomingCallEvent)
})
</script>