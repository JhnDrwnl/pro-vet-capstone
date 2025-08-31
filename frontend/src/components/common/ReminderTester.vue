<!-- components/common/ReminderTester.vue -->
<!-- 
  REMINDER TESTER - HIDDEN FOR PRODUCTION
  This component is hidden but the code is preserved for development/testing purposes.
  To re-enable: uncomment the toggle button below and set showTester default to true.
-->
<template>
  <div v-if="showTester" class="fixed bottom-4 right-4 z-50">
    <div class="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-semibold text-sm">🔔 Reminder Tester</h3>
        <button 
          @click="showTester = false"
          class="text-white/80 hover:text-white text-lg"
        >
          ×
        </button>
      </div>
      
      <p class="text-xs text-blue-100 mb-3">
        Test the appointment reminder system manually
      </p>
      
      <div class="space-y-2">
        <button 
          @click="testReminders"
          :disabled="testing"
          class="w-full bg-white text-blue-600 px-3 py-2 rounded text-sm font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ testing ? 'Sending...' : 'Send Test Reminders' }}
        </button>
        
        <button 
          @click="testSingleReminder"
          :disabled="testing"
          class="w-full bg-green-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Single Reminder
        </button>
        
        <button 
          @click="debugNotificationData"
          :disabled="testing"
          class="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Debug Notification Data
        </button>
        
        <button 
          @click="resetReminderSystem"
          :disabled="testing"
          class="w-full bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Reminder System
        </button>
        
        <button 
          @click="checkCurrentTime"
          class="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-400"
        >
          Check Current Time
        </button>
        
        <div class="text-xs text-blue-100">
          <p>Current time: {{ currentTime }}</p>
          <p>Next check: {{ nextCheckTime }}</p>
        </div>
      </div>
      
      <div v-if="lastResult" class="mt-3 p-2 bg-white/10 rounded text-xs">
        <p class="font-medium">Last Result:</p>
        <p>{{ lastResult }}</p>
      </div>
    </div>
  </div>
  
    <!-- Test Button - Now Hidden for Production -->
  <!-- <button 
    @click="showTester = !showTester"
    class="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
    title="Toggle Reminder Tester"
  >
    ��
  </button> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { sendDailyAppointmentReminders, createTestAppointmentReminder } from '@/services/notificationService'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { useAuthStore } from '@/stores/modules/authStore'
import smsService from '@/services/smsService'

// Props
const props = defineProps({
  appointmentReminderRef: {
    type: Object,
    default: null
  }
})

const showTester = ref(false)
const testing = ref(false)
const lastResult = ref('')
const currentTime = ref('')
const nextCheckTime = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
  
  // Calculate next 6 AM check
  const next6AM = new Date(now)
  if (now.getHours() >= 6) {
    next6AM.setDate(next6AM.getDate() + 1)
  }
  next6AM.setHours(6, 0, 0, 0)
  
  const timeUntil6AM = next6AM.getTime() - now.getTime()
  const hours = Math.floor(timeUntil6AM / (1000 * 60 * 60))
  const minutes = Math.floor((timeUntil6AM % (1000 * 60 * 60)) / (1000 * 60))
  
  nextCheckTime.value = `${hours}h ${minutes}m until next 6 AM check`
}

const testReminders = async () => {
  testing.value = true
  try {
    console.log('🧪 Testing appointment reminder system...')
    const result = await sendDailyAppointmentReminders()
    lastResult.value = `✅ Successfully sent ${result} appointment reminders`
    console.log(`✅ Test completed: ${result} reminders sent`)
  } catch (error) {
    lastResult.value = `❌ Error: ${error.message}`
    console.error('❌ Test failed:', error)
  } finally {
    testing.value = false
  }
}

const testSingleReminder = async () => {
  testing.value = true
  try {
    console.log('🧪 Testing single appointment reminder...')
    const result = await createTestAppointmentReminder()
    lastResult.value = `✅ Successfully sent single reminder: ${result}`
    console.log(`✅ Test completed: ${result} single reminder sent`)
  } catch (error) {
    lastResult.value = `❌ Error: ${error.message}`
    console.error('❌ Test failed:', error)
  } finally {
    testing.value = false
  }
}

const debugNotificationData = async () => {
  testing.value = true
  try {
    console.log('🔍 Debugging notification data...')
    
    // Fetch recent notifications from Firestore
    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(5)
    )
    
    const querySnapshot = await getDocs(q)
    console.log(`📊 Found ${querySnapshot.size} recent notifications`)
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data()
      console.log(`📋 Notification ${index + 1} (${doc.id}):`, {
        type: data.type,
        title: data.title,
        description: data.description,
        appointmentTime: data.appointmentTime,
        time: data.time,
        petNames: data.petNames,
        petName: data.petName,
        serviceNames: data.serviceNames,
        serviceName: data.serviceName,
        appointmentDate: data.appointmentDate,
        date: data.date,
        createdAt: data.createdAt,
        userId: data.userId
      })
    })
    
    lastResult.value = `🔍 Debug completed. Check console for ${querySnapshot.size} notifications.`
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    lastResult.value = `❌ Debug failed: ${error.message}`
  } finally {
    testing.value = false
  }
}

const resetReminderSystem = async () => {
  testing.value = true
  try {
    console.log('🔄 Resetting reminder system...')
    
    // Try to access the AppointmentReminder component and reset it
    if (props.appointmentReminderRef && props.appointmentReminderRef.manualResetSystem) {
      props.appointmentReminderRef.manualResetSystem()
      lastResult.value = '✅ Reminder system reset successfully'
      console.log('✅ Reminder system reset successfully')
    } else {
      lastResult.value = '⚠️ AppointmentReminder component not accessible'
      console.log('⚠️ AppointmentReminder component not accessible')
    }
  } catch (error) {
    lastResult.value = `❌ Error resetting: ${error.message}`
    console.error('❌ Error resetting:', error)
  } finally {
    testing.value = false
  }
}

const checkCurrentTime = () => {
  updateTime()
  lastResult.value = `⏰ Time checked: ${currentTime.value}`
}

const testSMSReminders = async () => {
  testing.value = true
  try {
    console.log('🧪 Testing SMS appointment reminder system...')
    
    // Get current user's phone number and verification status
    const authStore = useAuthStore()
    
    if (!authStore.currentUser) {
      lastResult.value = '❌ No user logged in'
      console.log('❌ No user logged in')
      return
    }
    
    console.log('✅ User logged in:', authStore.currentUser.userId)
    
    // Get user document from Firestore
    const userRef = doc(db, 'users', authStore.currentUser.userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      lastResult.value = '❌ User document not found'
      console.log('❌ User document not found')
      return
    }
    
    const userData = userDoc.data()
    const userPhone = userData.phone
    const isPhoneVerified = userData.phoneVerified
    
    console.log('📱 User phone data:', { phone: userPhone, verified: isPhoneVerified })
    
    // Check if phone is verified
    if (!isPhoneVerified) {
      lastResult.value = '⚠️ Phone number not verified. Please verify your phone first.'
      console.log('⚠️ Phone number not verified:', { phone: userPhone, verified: isPhoneVerified })
      return
    }
    
    if (!userPhone || userPhone.trim() === '') {
      lastResult.value = '⚠️ No phone number found in user profile'
      console.log('⚠️ No phone number found')
      return
    }
    
    // Test with sample appointment data
    const testPetName = 'Max'
    const testTime = '2:00 PM'
    
    console.log('📱 Sending test SMS to verified phone:', userPhone)
    console.log('📱 Test data:', { petName: testPetName, time: testTime })
    
    // Call SMS service directly
    console.log('📱 Calling smsService.sendAppointmentReminder...')
    const result = await smsService.sendAppointmentReminder(userPhone, testPetName, testTime)
    
    console.log('📱 SMS service result:', result)
    
    if (result.success) {
      lastResult.value = `✅ SMS reminder sent successfully to ${userPhone}! Message ID: ${result.messageId}`
      console.log('✅ SMS test completed:', result)
    } else {
      lastResult.value = `❌ SMS reminder failed: ${result.message || 'Unknown error'}`
      console.log('❌ SMS test failed:', result)
    }
  } catch (error) {
    lastResult.value = `❌ Error: ${error.message}`
    console.error('❌ SMS test error:', error)
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Component styles */
</style>
