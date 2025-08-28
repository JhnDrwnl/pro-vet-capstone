<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Vaccination AutoScheduler Test</h1>
        
        <!-- Test Controls -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-blue-900 mb-4">Test Controls</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Pet Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Pet</label>
              <select v-model="selectedPetId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Choose a pet...</option>
                <option v-for="pet in availablePets" :key="pet.id" :value="pet.id">
                  {{ pet.name }} ({{ pet.species }})
                </option>
              </select>
            </div>
            
            <!-- Service Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Vaccination Service</label>
              <select v-model="selectedServiceId" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Choose a service...</option>
                <option v-for="service in vaccinationServices" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="mt-6 flex gap-4">
            <button
              @click="testAutoScheduling"
              :disabled="!selectedPetId || !selectedServiceId || isTesting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isTesting ? 'Testing...' : 'Test AutoScheduling' }}
            </button>
            
            <button
              @click="clearLogs"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        <!-- Pet Information -->
        <div v-if="selectedPet" class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-green-900 mb-4">Selected Pet Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600">Name:</span>
              <p class="text-green-900">{{ selectedPet.name }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Species:</span>
              <p class="text-green-900">{{ selectedPet.species }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Breed:</span>
              <p class="text-green-900">{{ selectedPet.breed || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Birth Date:</span>
              <p class="text-green-900">{{ formatDate(selectedPet.birthDate) || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Age (Weeks):</span>
              <p class="text-green-900">{{ selectedPet.ageWeeks || 'N/A' }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Age (Months):</span>
              <p class="text-green-900">{{ selectedPet.ageMonths || 'N/A' }}</p>
            </div>
          </div>
        </div>
        
        <!-- Test Results -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 class="text-xl font-semibold text-yellow-900 mb-4">Test Results</h2>
          
          <div v-if="testResults" class="space-y-4">
            <div class="bg-white rounded-lg p-4 border">
              <h3 class="font-semibold text-gray-900 mb-2">Vaccination Record Created</h3>
              <pre class="text-sm text-gray-700 bg-gray-100 p-3 rounded overflow-auto">{{ JSON.stringify(testResults.vaccinationRecord, null, 2) }}</pre>
            </div>
            
            <div v-if="testResults.autoScheduled" class="bg-white rounded-lg p-4 border">
              <h3 class="font-semibold text-gray-900 mb-2">Auto-Scheduled Appointments ({{ testResults.newSuggestions.length }})</h3>
              <div v-for="(appointment, index) in testResults.newSuggestions" :key="index" class="mb-3">
                <div class="bg-blue-50 p-3 rounded">
                  <p class="font-medium">{{ appointment.serviceName }}</p>
                  <p class="text-sm text-gray-600">Date: {{ formatDate(appointment.date) }}</p>
                  <p class="text-sm text-gray-600">Status: {{ appointment.status }}</p>
                  <p class="text-sm text-gray-600">Auto-approved: {{ appointment.isAutoApproved ? 'Yes' : 'No' }}</p>
                </div>
              </div>
            </div>
            
            <div v-else class="bg-white rounded-lg p-4 border">
              <p class="text-gray-700">No appointments were auto-scheduled.</p>
            </div>
          </div>
          
          <div v-else class="text-gray-600">
            Run a test to see results here.
          </div>
        </div>
        
        <!-- Console Logs -->
        <div class="bg-gray-900 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">Console Logs</h2>
          <div class="bg-black rounded-lg p-4 h-96 overflow-y-auto">
            <div v-for="(log, index) in consoleLogs" :key="index" class="text-sm font-mono mb-1">
              <span class="text-gray-400">[{{ log.timestamp }}]</span>
              <span :class="getLogColor(log.type)">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { generateVaccinationRecordWithAutoScheduling } from '@/services/vaccinationService'

// Reactive state
const selectedPetId = ref('')
const selectedServiceId = ref('')
const availablePets = ref([])
const vaccinationServices = ref([])
const isTesting = ref(false)
const testResults = ref(null)
const consoleLogs = ref([])

// Computed properties
const selectedPet = computed(() => 
  availablePets.value.find(pet => pet.id === selectedPetId.value)
)

// Methods
const addLog = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  consoleLogs.value.push({ message, type, timestamp })
  
  // Keep only last 100 logs
  if (consoleLogs.value.length > 100) {
    consoleLogs.value = consoleLogs.value.slice(-100)
  }
}

const getLogColor = (type) => {
  switch (type) {
    case 'error': return 'text-red-400'
    case 'success': return 'text-green-400'
    case 'warning': return 'text-yellow-400'
    default: return 'text-white'
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

const loadPets = async () => {
  try {
    addLog('Loading pets...', 'info')
    const petsRef = collection(db, 'pets')
    const snapshot = await getDocs(petsRef)
    
    availablePets.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    addLog(`Loaded ${availablePets.value.length} pets`, 'success')
  } catch (error) {
    addLog(`Error loading pets: ${error.message}`, 'error')
  }
}

const loadVaccinationServices = async () => {
  try {
    addLog('Loading vaccination services...', 'info')
    const servicesRef = collection(db, 'services')
    const q = query(servicesRef, where('isVaccination', '==', true))
    const snapshot = await getDocs(q)
    
    vaccinationServices.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    addLog(`Loaded ${vaccinationServices.value.length} vaccination services`, 'success')
  } catch (error) {
    addLog(`Error loading vaccination services: ${error.message}`, 'error')
  }
}

const testAutoScheduling = async () => {
  if (!selectedPetId.value || !selectedServiceId.value) {
    addLog('Please select both a pet and a service', 'warning')
    return
  }
  
  isTesting.value = true
  testResults.value = null
  
  try {
    addLog('Starting vaccination autoscheduling test...', 'info')
    
    // Create a mock appointment
    const mockAppointment = {
      id: 'test_appointment_' + Date.now(),
      services: [selectedServiceId.value],
      completedAt: new Date(),
      doctorName: 'Test Doctor',
      location: 'Test Clinic',
      completionData: {
        generalNotes: {
          treatmentSummary: 'Test vaccination completion'
        }
      }
    }
    
    // Get service details
    const selectedService = vaccinationServices.value.find(s => s.id === selectedServiceId.value)
    const serviceDetails = [selectedService]
    
    addLog(`Testing with pet: ${selectedPet.value.name}`, 'info')
    addLog(`Testing with service: ${selectedService.name}`, 'info')
    
    // Test the autoscheduling
    const result = await generateVaccinationRecordWithAutoScheduling(
      mockAppointment,
      selectedPet.value,
      serviceDetails,
      { id: 'test_user' }
    )
    
    testResults.value = result
    
    if (result.vaccinationRecord) {
      addLog('✅ Vaccination record created successfully', 'success')
    } else {
      addLog('❌ No vaccination record created', 'warning')
    }
    
    if (result.autoScheduled) {
      addLog(`✅ Auto-scheduled ${result.newSuggestions.length} appointments`, 'success')
    } else {
      addLog('❌ No appointments were auto-scheduled', 'warning')
    }
    
    if (result.error) {
      addLog(`❌ Error during autoscheduling: ${result.error}`, 'error')
    }
    
  } catch (error) {
    addLog(`❌ Test failed: ${error.message}`, 'error')
    console.error('Test error:', error)
  } finally {
    isTesting.value = false
  }
}

const clearLogs = () => {
  consoleLogs.value = []
  testResults.value = null
}

// Lifecycle
onMounted(async () => {
  addLog('Vaccination AutoScheduler Test Page Loaded', 'success')
  await Promise.all([loadPets(), loadVaccinationServices()])
})
</script>
