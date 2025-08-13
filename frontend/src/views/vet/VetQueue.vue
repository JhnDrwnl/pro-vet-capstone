<!-- views/vet/VetQueue.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold text-gray-900">Queue Management</h1>
        <p class="mt-2 text-gray-600">Manage today's patient consultations</p>
      </div>

      <!-- Queue Stats -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="text-2xl font-semibold text-gray-900">{{ queueStats.total }}</div>
          <div class="text-sm text-gray-500">Total</div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="text-2xl font-semibold text-green-600">{{ queueStats.waiting }}</div>
          <div class="text-sm text-gray-500">Waiting</div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="text-2xl font-semibold text-blue-600">{{ queueStats.inProgress }}</div>
          <div class="text-sm text-gray-500">In Progress</div>
        </div>
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="text-2xl font-semibold text-gray-600">{{ queueStats.completed }}</div>
          <div class="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      <!-- Current Patient -->
      <div v-if="currentPatient" class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Currently Consulting</h2>
          <span class="text-sm text-gray-500">Started: {{ formatTime(currentPatient.startTime) }}</span>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <div class="text-lg font-medium text-gray-900 mb-1">{{ currentPatient.ownerName }}</div>
          <div class="text-gray-600">{{ currentPatient.petName }} - {{ currentPatient.serviceName }}</div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="completeConsultation(currentPatient.id)"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Complete
          </button>
          <button 
            @click="skipPatient(currentPatient.id)"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

      <!-- Queue Controls -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Queue Controls</h2>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="queuePaused ? 'bg-red-500' : 'bg-green-500'"></div>
            <span class="text-sm text-gray-600">{{ queuePaused ? 'Paused' : 'Active' }}</span>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="callNext"
            :disabled="!canCallNext"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Call Next
          </button>
          <button 
            @click="pauseQueue"
            :disabled="!canPause"
            class="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {{ queuePaused ? 'Resume' : 'Pause' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-400 mb-4">Loading...</div>
        <p class="text-gray-500">Fetching today's appointments</p>
      </div>

      <!-- Waiting Queue -->
      <div v-else class="bg-white rounded-lg border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Waiting Queue</h2>
        </div>
        
        <div v-if="waitingQueue.length === 0" class="text-center py-12 text-gray-500">
          <p class="text-lg">No patients waiting</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div v-for="(patient, index) in waitingQueue" :key="patient.id" 
               class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {{ index + 1 }}
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ patient.ownerName }}</div>
                  <div class="text-sm text-gray-600">{{ patient.petName }}</div>
                  <div class="text-xs text-gray-500">{{ patient.serviceName }}</div>
                  <div class="text-xs text-gray-400 mt-1">
                    Scheduled: {{ formatDateTime(patient.date, patient.time) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right text-sm text-gray-500">
                  <div>Position #{{ index + 1 }}</div>
                  <div v-if="index === 0" class="text-blue-600 font-medium">Next in line</div>
                  <div v-else>~{{ getEstimatedWaitTime(index + 1) }} min wait</div>
                  <div class="text-xs text-gray-400">
                    Est. start: {{ getEstimatedStartTime(index + 1) }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button 
                    @click="transferPatient(patient.id, 'up')"
                    :disabled="index === 0"
                    class="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    @click="transferPatient(patient.id, 'down')"
                    :disabled="index === waitingQueue.length - 1"
                    class="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button 
                  @click="startConsultation(patient.id)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { collection, query, where, getDocs, orderBy, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@shared/firebase'

const authStore = useAuthStore()

// State
const appointments = ref([])
const waitingQueue = ref([])
const currentPatient = ref(null)
const isLoading = ref(true)
const queuePaused = ref(false)
const currentTime = ref(new Date())

// Computed properties
const queueStats = computed(() => ({
  total: waitingQueue.value.length + (currentPatient.value ? 1 : 0),
  waiting: waitingQueue.value.length,
  inProgress: currentPatient.value ? 1 : 0,
  completed: 0 // You can track completed consultations if needed
}))

const canCallNext = computed(() => 
  !queuePaused.value && waitingQueue.value.length > 0 && !currentPatient.value
)

const canPause = computed(() => 
  waitingQueue.value.length > 0 || currentPatient.value
)

// Queue status indicator
const queueStatus = computed(() => {
  if (queuePaused.value) return { text: 'PAUSED', color: 'red', icon: '⏸️' }
  if (currentPatient.value) return { text: 'IN PROGRESS', color: 'orange', icon: '👨‍⚕️' }
  if (waitingQueue.value.length > 0) return { text: 'ACTIVE', color: 'green', icon: '📋' }
  return { text: 'EMPTY', color: 'gray', icon: '🎉' }
})

// Get today's date range
const getTodayRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  return { startOfDay, endOfDay }
}

// Fetch appointments
const fetchAppointments = async () => {
  try {
    isLoading.value = true
    
    // First, try to restore queue from Firestore
    const queueRestored = await initializeQueueFromFirestore()
    
    if (queueRestored) {
      // Queue was restored from Firestore, no need to fetch appointments again
      isLoading.value = false
      return
    }
    
    const { startOfDay, endOfDay } = getTodayRange()
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('status', '==', 'approved'),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('doctorId', '==', authStore.user?.userId),
      orderBy('date', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const appointmentsData = []
    
    for (const doc of querySnapshot.docs) {
      const appointment = doc.data()
      
      // Get user name
      let ownerName = 'Unknown Owner'
      if (appointment.userId) {
        try {
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', appointment.userId)))
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data()
            ownerName = userData.firstName || userData.name || 'Unknown Owner'
          }
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
      
      appointmentsData.push({
        id: doc.id,
        ...appointment,
        ownerName,
        petName: appointment.petNames?.[0] || 'Unknown Pet',
        serviceName: appointment.serviceNames?.[0] || 'Unknown Service'
      })
      
      // Debug logging for date field
      console.log(`Appointment ${doc.id} date field:`, {
        date: appointment.date,
        dateType: typeof appointment.date,
        hasToDate: appointment.date && typeof appointment.date === 'object' && appointment.date.toDate,
        hasSeconds: appointment.date && typeof appointment.date === 'object' && appointment.date.seconds,
        time: appointment.time
      })
    }
    
    appointments.value = appointmentsData
    waitingQueue.value = [...appointmentsData].sort((a, b) => {
      // Sort by date in ascending order (earliest first)
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
      return dateA - dateB
    })
    
    // Update Firestore queue with initial data
    updateFirestoreQueue()
    
  } catch (error) {
    console.error('Error fetching appointments:', error)
  } finally {
    isLoading.value = false
  }
}

// Queue management methods
const callNext = () => {
  if (!canCallNext.value) return
  
  const nextPatient = waitingQueue.value[0]
  currentPatient.value = {
    ...nextPatient,
    startTime: new Date()
  }
  waitingQueue.value.shift()
  
  // Update Firestore queue
  updateFirestoreQueue()
}

const startConsultation = (patientId) => {
  const patient = waitingQueue.value.find(p => p.id === patientId)
  if (patient) {
    currentPatient.value = {
      ...patient,
      startTime: new Date()
    }
    waitingQueue.value = waitingQueue.value.filter(p => p.id !== patientId)
    
    // Update appointment status to 'in-progress'
    updateAppointmentStatus(patientId, 'in-progress')
    
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

const completeConsultation = (patientId) => {
  if (currentPatient.value?.id === patientId) {
    // Update appointment status to 'completed'
    updateAppointmentStatus(patientId, 'completed')
    
    currentPatient.value = null
    
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

const skipPatient = (patientId) => {
  if (currentPatient.value?.id === patientId) {
    // Add back to end of queue
    waitingQueue.value.push(currentPatient.value)
    // Re-sort to maintain date order
    sortQueueByDate()
    currentPatient.value = null
    
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

const pauseQueue = () => {
  queuePaused.value = !queuePaused.value
  
  // Update Firestore queue
  updateFirestoreQueue()
}

// Enhanced queue management methods
const sortQueueByDate = () => {
  waitingQueue.value.sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
    return dateA - dateB
  })
}

const transferPatient = (patientId, direction) => {
  const patientIndex = waitingQueue.value.findIndex(p => p.id === patientId)
  if (patientIndex === -1) return
  
  const newIndex = direction === 'up' ? Math.max(0, patientIndex - 1) : Math.min(waitingQueue.value.length - 1, patientIndex + 1)
  
  if (newIndex !== patientIndex) {
    const patient = waitingQueue.value.splice(patientIndex, 1)[0]
    waitingQueue.value.splice(newIndex, 0, patient)
    // Re-sort to maintain date order
    sortQueueByDate()
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

// Firestore queue management functions
const getQueueDocRef = () => {
  const today = new Date()
  const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
  return doc(db, 'queues', `${authStore.user?.userId}_${dateString}`)
}

const updateFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    const queueData = {
      doctorId: authStore.user?.userId,
      date: new Date(),
      currentPatient: currentPatient.value ? {
        id: currentPatient.value.id,
        userId: currentPatient.value.userId,
        petNames: currentPatient.value.petNames,
        serviceNames: currentPatient.value.serviceNames,
        startTime: currentPatient.value.startTime,
        ownerName: currentPatient.value.ownerName,
        petName: currentPatient.value.petName,
        serviceName: currentPatient.value.serviceName
      } : null,
      waitingQueue: waitingQueue.value.map(patient => ({
        id: patient.id,
        userId: patient.userId,
        petNames: patient.petNames,
        serviceNames: patient.serviceNames,
        date: patient.date,
        time: patient.time,
        ownerName: patient.ownerName,
        petName: patient.petName,
        serviceName: patient.serviceName,
        duration: patient.duration
      })),
      queueStatus: queuePaused.value ? 'paused' : 'active',
      lastUpdated: new Date(),
      totalPatients: waitingQueue.value.length + (currentPatient.value ? 1 : 0)
    }
    
    await setDoc(queueDocRef, queueData, { merge: true })
    console.log('Queue updated in Firestore')
  } catch (error) {
    console.error('Error updating Firestore queue:', error)
  }
}

const clearFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    await deleteDoc(queueDocRef)
    console.log('Queue cleared from Firestore')
  } catch (error) {
    console.error('Error clearing Firestore queue:', error)
  }
}

const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId)
    await updateDoc(appointmentRef, {
      status: status,
      lastUpdated: new Date()
    })
    console.log(`Appointment ${appointmentId} status updated to ${status}`)
  } catch (error) {
    console.error('Error updating appointment status:', error)
  }
}

const initializeQueueFromFirestore = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    const queueDoc = await getDocs(query(collection(db, 'queues'), where('__name__', '==', queueDocRef.id)))
    
    if (!queueDoc.empty) {
      const queueData = queueDoc.docs[0].data()
      
      // Restore current patient if exists
      if (queueData.currentPatient) {
        currentPatient.value = {
          ...queueData.currentPatient,
          startTime: queueData.currentPatient.startTime ? new Date(queueData.currentPatient.startTime) : new Date()
        }
      }
      
      // Restore waiting queue
      if (queueData.waitingQueue) {
        waitingQueue.value = queueData.waitingQueue.map(patient => ({
          ...patient,
          date: patient.date?.toDate ? patient.date.toDate() : new Date(patient.date)
        }))
      }
      
      // Restore queue status
      queuePaused.value = queueData.queueStatus === 'paused'
      
      console.log('Queue restored from Firestore')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error initializing queue from Firestore:', error)
    return false
  }
}

const getEstimatedWaitTime = (position) => {
  if (position === 0) return 0
  
  // Get the actual duration from the appointment data
  const getServiceDuration = (patient) => {
    // Use the duration field from the appointment, or fallback to service-based estimates
    if (patient.duration) {
      return patient.duration
    }
    
    // Service-based duration estimates (in minutes)
    const serviceDurations = {
      'General Checkup': 20,
      'Vaccination': 15,
      'Emergency': 45,
      'Surgery': 120,
      'Dental': 60,
      'Grooming': 45,
      'Treatment': 30
    }
    
    const service = patient.serviceName || ''
    for (const [key, duration] of Object.entries(serviceDurations)) {
      if (service.toLowerCase().includes(key.toLowerCase())) {
        return duration
      }
    }
    
    return 30 // Default fallback
  }
  
  // Calculate total wait time based on patients ahead
  let totalWaitTime = 0
  
  // Add time for current patient if they're still consulting
  if (currentPatient.value) {
    const currentPatientDuration = getServiceDuration(currentPatient.value)
    const consultationStartTime = currentPatient.value.startTime
    const elapsedTime = consultationStartTime ? (Date.now() - new Date(consultationStartTime).getTime()) / 60000 : 0
    const remainingTime = Math.max(0, currentPatientDuration - elapsedTime)
    totalWaitTime += remainingTime
  }
  
  // Add time for patients ahead in the queue
  for (let i = 0; i < position; i++) {
    const patient = waitingQueue.value[i]
    if (patient) {
      totalWaitTime += getServiceDuration(patient)
    }
  }
  
  // Add some buffer time between patients (5 minutes)
  const bufferTime = position * 5
  totalWaitTime += bufferTime
  
  return Math.round(totalWaitTime)
}

const getEstimatedStartTime = (position) => {
  if (position === 0) return 'Immediate'
  
  const waitMinutes = getEstimatedWaitTime(position)
  const estimatedStart = new Date(currentTime.value.getTime() + (waitMinutes * 60000))
  
  return estimatedStart.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

// Format functions
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    let date
    // Handle Firebase Timestamp
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      // Handle Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }
    
    if (isNaN(date.getTime())) return 'Invalid Time'
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    console.error('Error formatting time:', error, timestamp)
    return 'Invalid Time'
  }
}

const formatDateTime = (date, time) => {
  if (!date) return 'N/A'
  try {
    let dateObj
    
    // Handle Firebase Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate()
    } else if (date && typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp object
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date)
      return 'Invalid Date'
    }
    
    const dateStr = dateObj.toLocaleDateString()
    const timeStr = time || 'No time specified'
    
    return `${dateStr} at ${timeStr}`
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Invalid Date'
  }
}

// Lifecycle
onUnmounted(() => {
  // Clear the queue from Firestore when component unmounts
  // This ensures the queue is reset for the next day
  clearFirestoreQueue()
})

// Add end-of-day cleanup
const checkEndOfDay = () => {
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  
  if (now > endOfDay) {
    // It's a new day, clear the queue
    clearFirestoreQueue()
    // Reset local state
    currentPatient.value = null
    waitingQueue.value = []
    queuePaused.value = false
  }
}

// Check end of day every hour
onMounted(() => {
  fetchAppointments()
  
  // Update current time every minute to refresh wait estimates
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000) // Update every minute
  
  // Check end of day every hour
  const endOfDayTimer = setInterval(() => {
    checkEndOfDay()
  }, 3600000) // Check every hour
  
  // Cleanup timers on unmount
  onUnmounted(() => {
    clearInterval(timer)
    clearInterval(endOfDayTimer)
  })
})
</script>

<style scoped>
/* Add any specific styles here */
</style>
