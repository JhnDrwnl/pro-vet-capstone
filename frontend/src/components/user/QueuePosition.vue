<!-- components/user/QueuePosition.vue -->
<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Queue Position</h3>
          <p class="text-sm text-gray-500">Today's appointment status</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-500">{{ formatCurrentTime() }}</div>
        <div class="text-xs text-gray-400">{{ formatCurrentDate() }}</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="flex flex-col items-center">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-2 text-sm text-gray-600">Checking queue position...</p>
      </div>
    </div>

    <!-- No Appointments Today -->
    <div v-else-if="!hasAppointmentsToday" class="text-center py-8">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      <p class="text-gray-600 font-medium">No appointments today</p>
      <p class="text-sm text-gray-500 mt-1">You're all caught up!</p>
    </div>

    <!-- Queue Information -->
    <div v-else class="space-y-4">
      <!-- Current Status -->
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-blue-800">Current Status</span>
          <span :class="`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userAppointment.status)}`">
            {{ getStatusText(userAppointment.status) }}
          </span>
        </div>
        
        <div class="text-center">
          <div v-if="userAppointment.status === 'approved' && queuePosition > 0" class="mb-3">
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ queuePosition }}</div>
            <div class="text-sm text-blue-700">
              {{ queuePosition === 1 ? 'Next in line' : `${queuePosition}${getOrdinalSuffix(queuePosition)} in queue` }}
            </div>
          </div>
          
          <div v-else-if="userAppointment.status === 'in-progress'" class="mb-3">
            <div class="text-3xl font-bold text-green-600 mb-1">🎯</div>
            <div class="text-sm text-green-700">Currently consulting</div>
          </div>
          
          <div v-else-if="userAppointment.status === 'completed'" class="mb-3">
            <div class="text-3xl font-bold text-emerald-600 mb-1">✅</div>
            <div class="text-sm text-emerald-700">Appointment completed</div>
          </div>
        </div>
      </div>

      <!-- Wait Time Estimate -->
      <div v-if="userAppointment.status === 'approved' && queuePosition > 0" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700">Estimated Wait Time</span>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-800 mb-1">
            {{ estimatedWaitTime > 0 ? `~${estimatedWaitTime} min` : 'Starting soon' }}
          </div>
          <div class="text-sm text-gray-600">
            Est. start: {{ estimatedStartTime }}
          </div>
        </div>
      </div>

      <!-- Appointment Details -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ userAppointment.petNames?.join(', ') || 'Your Pet' }}</h4>
            <p class="text-sm text-gray-500">{{ userAppointment.time || 'Time TBD' }}</p>
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Services:</span>
            <span class="text-gray-900 font-medium">
              {{ (userAppointment['Service Names'] || userAppointment.serviceNames || []).join(', ') || 'General Consultation' }}
            </span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Doctor:</span>
            <span class="text-gray-900 font-medium">{{ getDoctorName(userAppointment.doctorId) }}</span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Duration:</span>
            <span class="text-gray-900 font-medium">{{ userAppointment.duration || '30' }} min</span>
          </div>
        </div>
      </div>

      <!-- Queue Progress -->
      <div v-if="userAppointment.status === 'approved' && queuePosition > 0" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-blue-800">Queue Progress</span>
          <span class="text-xs text-blue-600">{{ totalInQueue }} total patients</span>
        </div>
        
        <div class="relative">
          <div class="w-full bg-blue-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${getQueueProgress()}%` }"
            ></div>
          </div>
          
          <div class="flex justify-between text-xs text-blue-600 mt-2">
            <span>1st</span>
            <span>{{ queuePosition }}{{ getOrdinalSuffix(queuePosition) }}</span>
            <span>{{ totalInQueue }}{{ getOrdinalSuffix(totalInQueue) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button 
          @click="refreshQueuePosition"
          :disabled="isLoading"
          class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </button>
        
        <button 
          @click="viewAppointmentDetails"
          class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Details
        </button>
      </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div v-if="hasAppointmentsToday && userAppointment.status === 'approved'" class="mt-4 text-center">
      <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        Auto-refreshing every 30 seconds
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authStore'
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@shared/firebase'

const router = useRouter()
const authStore = useAuthStore()

// State
const isLoading = ref(true)
const userAppointment = ref(null)
const queuePosition = ref(0)
const totalInQueue = ref(0)
const estimatedWaitTime = ref(0)
const estimatedStartTime = ref('')
const currentTime = ref(new Date())
const autoRefreshInterval = ref(null)

// Computed properties
const hasAppointmentsToday = computed(() => {
  return userAppointment.value && userAppointment.value.status !== 'cancelled'
})

// Get today's date range
const getTodayRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  return { startOfDay, endOfDay }
}

// Fetch user's appointment for today
const fetchUserAppointment = async () => {
  try {
    isLoading.value = true
    
    if (!authStore.user?.userId) {
      console.log('No user ID, skipping appointment fetch')
      return
    }
    
    const { startOfDay, endOfDay } = getTodayRange()
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('userId', '==', authStore.user.userId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const appointment = querySnapshot.docs[0].data()
      userAppointment.value = {
        id: querySnapshot.docs[0].id,
        ...appointment
      }
      
      // Calculate queue position
      await calculateQueuePosition()
    } else {
      userAppointment.value = null
      queuePosition.value = 0
      totalInQueue.value = 0
    }
    
  } catch (error) {
    console.error('Error fetching user appointment:', error)
    userAppointment.value = null
  } finally {
    isLoading.value = false
  }
}

// Calculate queue position by checking all approved appointments for the doctor
const calculateQueuePosition = async () => {
  if (!userAppointment.value || !userAppointment.value.doctorId) return
  
  try {
    const { startOfDay, endOfDay } = getTodayRange()
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('doctorId', '==', userAppointment.value.doctorId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('status', 'in', ['approved', 'in-progress']),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const allAppointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Sort by date and time
    allAppointments.sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB
      }
      
      // If dates are the same, sort by time
      const timeA = a.time || '00:00'
      const timeB = b.time || '00:00'
      return timeA.localeCompare(timeB)
    })
    
    // Find user's position
    const userIndex = allAppointments.findIndex(apt => apt.id === userAppointment.value.id)
    
    if (userIndex !== -1) {
      queuePosition.value = userIndex + 1
      totalInQueue.value = allAppointments.length
      
      // Calculate estimated wait time
      calculateEstimatedWaitTime(userIndex, allAppointments)
    }
    
  } catch (error) {
    console.error('Error calculating queue position:', error)
  }
}

// Calculate estimated wait time
const calculateEstimatedWaitTime = (position, allAppointments) => {
  if (position === 0) {
    estimatedWaitTime.value = 0
    estimatedStartTime.value = 'Starting soon'
    return
  }
  
  // Calculate total wait time based on patients ahead
  let totalWaitTime = 0
  
  // Add time for patients ahead in the queue
  for (let i = 0; i < position; i++) {
    const patient = allAppointments[i]
    if (patient) {
      // Use duration from appointment or default to 30 minutes
      const duration = patient.duration || 30
      totalWaitTime += duration
      
      // Add buffer time between patients (5 minutes)
      if (i < position - 1) {
        totalWaitTime += 5
      }
    }
  }
  
  estimatedWaitTime.value = totalWaitTime
  
  // Calculate estimated start time
  const estimatedStart = new Date(currentTime.value.getTime() + (totalWaitTime * 60000))
  estimatedStartTime.value = estimatedStart.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-green-100 text-green-800',
    'completed': 'bg-emerald-100 text-emerald-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    'pending': 'Pending',
    'approved': 'Approved',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }
  return texts[status] || 'Unknown'
}

const getOrdinalSuffix = (num) => {
  if (num === 1) return 'st'
  if (num === 2) return 'nd'
  if (num === 3) return 'rd'
  return 'th'
}

const getQueueProgress = () => {
  if (totalInQueue.value === 0) return 0
  return ((totalInQueue.value - queuePosition.value + 1) / totalInQueue.value) * 100
}

const getDoctorName = (doctorId) => {
  // You can implement doctor name fetching here
  // For now, return a placeholder
  return 'Dr. Veterinarian'
}

const formatCurrentTime = () => {
  return currentTime.value.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

const formatCurrentDate = () => {
  return currentTime.value.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

// Actions
const refreshQueuePosition = async () => {
  await fetchUserAppointment()
}

const viewAppointmentDetails = () => {
  if (userAppointment.value) {
    router.push(`/user/appointments?id=${userAppointment.value.id}`)
  }
}

// Auto-refresh functionality
const startAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }
  
  autoRefreshInterval.value = setInterval(async () => {
    if (hasAppointmentsToday.value && userAppointment.value?.status === 'approved') {
      await calculateQueuePosition()
    }
    currentTime.value = new Date()
  }, 30000) // Refresh every 30 seconds
}

const stopAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await fetchUserAppointment()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
/* Add any specific styles here */
</style>


