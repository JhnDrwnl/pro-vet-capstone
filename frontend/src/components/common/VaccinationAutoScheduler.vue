<!-- components/common/VaccinationAutoScheduler.vue -->
<template>
  <div class="vaccination-auto-scheduler">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Vaccination Auto-Scheduler</h3>
          <p class="text-sm text-gray-600">Automatically schedule next vaccination appointments for your pets</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-flex items-center gap-2 text-gray-600">
        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading vaccination schedule...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-2 text-red-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="font-medium">Error loading vaccination schedule</span>
      </div>
      <p class="text-sm text-red-700 mt-1">{{ error }}</p>
      <button 
        @click="loadVaccinationSchedule"
        class="mt-2 text-sm text-red-700 hover:text-red-800 underline"
      >
        Try again
      </button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Pet Selection -->
      <div v-if="userPets.length > 1" class="bg-white rounded-lg border border-gray-200 p-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Pet</label>
        <select 
          v-model="selectedPetId" 
          @change="onPetChange"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">All Pets</option>
          <option 
            v-for="pet in userPets" 
            :key="pet.id" 
            :value="pet.id"
          >
            {{ pet.name }} ({{ pet.species }})
          </option>
        </select>
      </div>

      <!-- Vaccination Schedule Summary -->
      <div v-if="scheduleSummary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ scheduleSummary.total }}</div>
          <div class="text-sm text-gray-600">Total Vaccinations</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ scheduleSummary.completed }}</div>
          <div class="text-sm text-gray-600">Completed</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ scheduleSummary.pending }}</div>
          <div class="text-sm text-gray-600">Pending</div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ scheduleSummary.overdue }}</div>
          <div class="text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="scheduleSummary && scheduleSummary.total > 0" class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Vaccination Progress</span>
          <span class="text-sm text-gray-600">{{ scheduleSummary.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${scheduleSummary.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Vaccination Suggestions -->
      <div v-if="vaccinationSuggestions.length > 0" class="bg-white rounded-lg border border-gray-200">
        <div class="px-4 py-3 border-b border-gray-200">
          <h4 class="text-lg font-medium text-gray-900">Upcoming Vaccinations</h4>
          <p class="text-sm text-gray-600">Click on any suggestion to schedule an appointment</p>
        </div>
        
        <div class="divide-y divide-gray-200">
          <div 
            v-for="suggestion in vaccinationSuggestions" 
            :key="suggestion.id"
            class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="openSchedulingModal(suggestion)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h5 class="font-medium text-gray-900">{{ suggestion.serviceName }}</h5>
                  <span 
                    v-if="suggestion.isCore"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    Core
                  </span>
                  <span 
                    v-if="suggestion.priority === 'high'"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    High Priority
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-2">{{ suggestion.description }}</p>
                
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Due: {{ formatDate(suggestion.suggestedDate) }}
                  </span>
                  
                  <span v-if="suggestion.dose !== 'booster'">
                    <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    Dose {{ suggestion.dose }} of {{ suggestion.totalDoses }}
                  </span>
                  
                  <span v-else>
                    <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    Booster
                  </span>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button 
                  @click.stop="openSchedulingModal(suggestion)"
                  class="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule
                </button>
                <button 
                  @click.stop="dismissSuggestion(suggestion.id)"
                  class="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Suggestions -->
      <div v-else-if="!loading && !error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h4>
        <p class="text-gray-600">Your pets are up to date on their vaccinations.</p>
      </div>

      <!-- Auto-Schedule Button -->
      <div v-if="userPets.length > 0" class="bg-white rounded-lg border border-gray-200 p-4">
        <button 
          @click="runAutoScheduling"
          :disabled="autoSchedulingLoading"
          class="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="autoSchedulingLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Running Auto-Scheduling...
          </span>
          <span v-else>Run Auto-Scheduling for All Pets</span>
        </button>
        <p class="text-xs text-gray-500 mt-2 text-center">
          This will analyze all your pets and create vaccination appointment suggestions
        </p>
      </div>
    </div>

    <!-- Scheduling Modal -->
    <div v-if="showSchedulingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Schedule Vaccination</h3>
          <p class="text-sm text-gray-600">Book an appointment for {{ selectedSuggestion?.serviceName }}</p>
        </div>
        
        <div class="px-6 py-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Pet</label>
            <div class="text-sm text-gray-900">{{ selectedSuggestion?.petName }}</div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Service</label>
            <div class="text-sm text-gray-900">{{ selectedSuggestion?.serviceName }}</div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Suggested Date</label>
            <div class="text-sm text-gray-900">{{ formatDate(selectedSuggestion?.suggestedDate) }}</div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <div class="text-sm text-gray-600">{{ selectedSuggestion?.notes }}</div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button 
            @click="closeSchedulingModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="scheduleAppointment"
            :disabled="schedulingLoading"
            class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <span v-if="schedulingLoading">Scheduling...</span>
            <span v-else>Schedule Appointment</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { 
  getUserVaccinationSuggestions, 
  convertSuggestionToAppointment,
  getVaccinationScheduleSummary 
} from '@/services/vaccinationAutoScheduler'
import { getVaccinationSeriesForPet } from '@/services/vaccinationSeriesService'

// Props
const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  userPets: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['appointment-scheduled', 'suggestion-dismissed'])

// Stores
const authStore = useAuthStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const vaccinationSuggestions = ref([])
const selectedPetId = ref('')
const autoSchedulingLoading = ref(false)
const showSchedulingModal = ref(false)
const selectedSuggestion = ref(null)
const schedulingLoading = ref(false)

// Computed
const scheduleSummary = computed(() => {
  if (!selectedPetId.value || vaccinationSuggestions.value.length === 0) return null
  
  const pet = props.userPets.find(p => p.id === selectedPetId.value)
  if (!pet) return null
  
  return getVaccinationScheduleSummary(pet, [])
})

// Methods
const loadVaccinationSchedule = async () => {
  if (!props.userId) return
  
  loading.value = true
  error.value = null
  
  try {
    const suggestions = await getUserVaccinationSuggestions(props.userId)
    vaccinationSuggestions.value = suggestions
    
    // Filter by selected pet if specified
    if (selectedPetId.value) {
      vaccinationSuggestions.value = suggestions.filter(s => s.petId === selectedPetId.value)
    }
  } catch (err) {
    error.value = err.message
    console.error('Error loading vaccination schedule:', err)
  } finally {
    loading.value = false
  }
}

const onPetChange = () => {
  loadVaccinationSchedule()
}

const runAutoScheduling = async () => {
  autoSchedulingLoading.value = true
  
  try {
    // This would typically call a backend service to run auto-scheduling
    // For now, we'll just reload the suggestions
    await loadVaccinationSchedule()
    
    // Show success message
    console.log('Auto-scheduling completed successfully')
  } catch (err) {
    error.value = err.message
    console.error('Error running auto-scheduling:', err)
  } finally {
    autoSchedulingLoading.value = false
  }
}

const openSchedulingModal = (suggestion) => {
  selectedSuggestion.value = suggestion
  showSchedulingModal.value = true
}

const closeSchedulingModal = () => {
  showSchedulingModal.value = false
  selectedSuggestion.value = null
}

const scheduleAppointment = async () => {
  if (!selectedSuggestion.value) return
  
  schedulingLoading.value = true
  
  try {
    const appointment = await convertSuggestionToAppointment(selectedSuggestion.value.id, {
      userId: props.userId
    })
    
    // Emit event for parent component
    emit('appointment-scheduled', appointment)
    
    // Close modal and reload
    closeSchedulingModal()
    await loadVaccinationSchedule()
    
    console.log('Appointment scheduled successfully:', appointment)
  } catch (err) {
    error.value = err.message
    console.error('Error scheduling appointment:', err)
  } finally {
    schedulingLoading.value = false
  }
}

const dismissSuggestion = async (suggestionId) => {
  try {
    // Update suggestion status to dismissed
    // This would typically call a service to update the status
    vaccinationSuggestions.value = vaccinationSuggestions.value.filter(s => s.id !== suggestionId)
    
    emit('suggestion-dismissed', suggestionId)
  } catch (err) {
    console.error('Error dismissing suggestion:', err)
  }
}

const formatDate = (date) => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadVaccinationSchedule()
})

// Watch for user pets changes
watch(() => props.userPets, () => {
  if (props.userPets.length > 0 && !selectedPetId.value) {
    selectedPetId.value = props.userPets[0].id
  }
}, { immediate: true })
</script>

<style scoped>
.vaccination-auto-scheduler {
  @apply max-w-4xl mx-auto;
}
</style>
