<template>
  <div v-if="showForm" class="space-y-6">
    <!-- Form Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$emit('goBack')" class="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isEditing ? 'Edit Pet' : 'Add New Pet' }}
          </h2>
          <p class="text-gray-600 mt-1">
            {{ isEditing ? 'Update pet information' : 'Add a new pet to the owner\'s profile' }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Pet Form -->
    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <!-- Basic Information Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Pet Name *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter pet name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Species *</label>
            <select
              v-model="formData.species"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="fish">Fish</option>
              <option value="hamster">Hamster</option>
              <option value="rabbit">Rabbit</option>
              <option value="snake">Snake</option>
              <option value="turtle">Turtle</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Breed</label>
            <input
              v-model="formData.breed"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter breed"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div class="relative">
              <button
                type="button"
                @click="genderDropdownOpen = !genderDropdownOpen"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {{ formData.gender || 'Select gender' }}
              </button>
              
              <div v-if="genderDropdownOpen" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div class="py-1">
                  <button
                    v-for="option in genderOptions"
                    :key="option.value"
                    type="button"
                    @click="selectGender(option.value)"
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
            <input
              v-model="formData.birthDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              v-model="formData.weight"
              type="number"
              step="0.1"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              v-model="formData.color"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter color"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Microchip ID</label>
            <input
              v-model="formData.microchipId"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter microchip ID"
            />
          </div>
        </div>
      </div>
      
      <!-- Additional Information Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="formData.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional notes about the pet"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('goBack')"
          class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSaving"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <LoadingSpinner v-if="isSaving" class="w-4 h-4" />
          {{ isSaving ? 'Saving...' : (isEditing ? 'Update Pet' : 'Add Pet') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps({
  showForm: Boolean,
  selectedPet: Object,
  isSaving: Boolean,
  defaultFormData: Object
})

const emit = defineEmits(['goBack', 'submit'])

// Form data
const formData = ref({
  name: '',
  species: '',
  breed: '',
  gender: '',
  birthDate: '',
  weight: '',
  color: '',
  microchipId: '',
  notes: ''
})

// Gender dropdown state
const genderDropdownOpen = ref(false)
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Unknown', label: 'Unknown' }
]

// Computed properties
const isEditing = computed(() => !!props.selectedPet)

// Watch for changes in selectedPet to populate form
watch(() => props.selectedPet, (newPet) => {
  if (newPet) {
    formData.value = {
      name: newPet.name || '',
      species: newPet.species || '',
      breed: newPet.breed || '',
      gender: newPet.gender || '',
      birthDate: newPet.birthDate || '',
      weight: newPet.weight || '',
      color: newPet.color || '',
      microchipId: newPet.microchipId || '',
      notes: newPet.notes || ''
    }
  } else {
    // Reset form when not editing
    formData.value = {
      name: '',
      species: '',
      breed: '',
      gender: '',
      birthDate: '',
      weight: '',
      color: '',
      microchipId: '',
      notes: ''
    }
  }
}, { immediate: true })

// Methods
function selectGender(gender) {
  formData.value.gender = gender
  genderDropdownOpen.value = false
}

function handleSubmit() {
  emit('submit', formData.value)
}

// Close gender dropdown when clicking outside
function closeGenderDropdown() {
  genderDropdownOpen.value = false
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', closeGenderDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeGenderDropdown)
})
</script> 