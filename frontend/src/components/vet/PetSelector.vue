<template>
  <div v-if="showPetSelector && selectedOwner && !selectedPet && !showForm" class="min-h-screen">
    <div class="flex items-center mb-8">
      <button @click="$emit('goBack')" class="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Select Pet</h2>
        <p class="text-gray-600 mt-1">Owner: <span class="font-semibold text-gray-800">{{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</span></p>
      </div>
    </div>
    
    <!-- Enhanced Pet Grid Layout -->
    <div v-if="selectedOwner.pets && selectedOwner.pets.length > 0" class="space-y-6">
      <!-- Pet Count and Quick Stats -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Pet Overview</h3>
            <p class="text-gray-600">{{ selectedOwner.pets.length }} {{ selectedOwner.pets.length === 1 ? 'pet' : 'pets' }} registered</p>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ getTotalMedicalRecords() }}</div>
              <div class="text-gray-500">Total Records</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ getActiveVaccinations() }}</div>
              <div class="text-gray-500">Active Vaccines</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pet Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="(pet, index) in selectedOwner.pets" 
          :key="pet.id"
          class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <!-- Pet Header with Photo -->
          <div class="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
            <img 
              :src="pet.photoURL || defaultPetPhotoURL" 
              :alt="pet.name" 
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            <!-- Pet Name Badge -->
            <div class="absolute bottom-4 left-4 right-4">
              <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <h3 class="font-bold text-lg text-gray-900">{{ pet.name }}</h3>
                <p class="text-sm text-gray-600">{{ pet.species }} • {{ pet.breed }}</p>
              </div>
            </div>
            
            <!-- Quick Action Buttons -->
            <div class="absolute top-4 right-4 flex gap-2">
              <button 
                @click="$emit('editPet', pet)"
                class="w-8 h-8 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-white transition-colors shadow-lg flex items-center justify-center"
                title="Edit Pet"
              >
                <Edit class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <!-- Pet Details -->
          <div class="p-6">
            <!-- Key Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-lg font-bold text-gray-900">{{ formatPetAge(pet) }}</div>
                <div class="text-xs text-gray-500">Age</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-lg font-bold text-gray-900">{{ pet.weight || '—' }} kg</div>
                <div class="text-xs text-gray-500">Weight</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-lg font-bold text-gray-900 capitalize">{{ pet.gender || '—' }}</div>
                <div class="text-xs text-gray-500">Gender</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-lg font-bold text-gray-900">{{ getPetRecordCount(pet) }}</div>
                <div class="text-xs text-gray-500">Records</div>
              </div>
            </div>
            
            <!-- Recent Activity Indicator -->
            <div v-if="getPetRecordCount(pet) > 0" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center text-sm text-green-700">
                <CheckCircleIcon class="w-4 h-4 mr-2" />
                Last updated: {{ formatDate(getLastUpdateDate(pet)) }}
              </div>
            </div>
            
            <!-- Primary Action Button -->
            <button 
              @click="$emit('viewPet', pet)"
              class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              View Complete History
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Enhanced Empty State -->
    <div v-else class="py-20 text-center">
      <div class="max-w-md mx-auto">
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-8 mx-auto">
          <PawPrintIcon class="w-16 h-16 text-blue-400" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-700 mb-3">No pets registered yet</h3>
        <p class="text-gray-500 mb-6 leading-relaxed">
          This owner hasn't added any pets to their profile. Pets will appear here once they are registered through the user portal.
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm font-medium">ℹ</span>
              </div>
            </div>
            <div class="ml-3 text-left">
              <p class="text-sm text-blue-800">
                <strong>Note:</strong> Pet owners add their pets through their user dashboard. 
                You can view and manage pet information once they're registered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftIcon, Edit, CheckCircleIcon, PawPrintIcon } from 'lucide-vue-next'

const props = defineProps({
  showPetSelector: Boolean,
  selectedOwner: Object,
  selectedPet: Object,
  showForm: Boolean,
  defaultPetPhotoURL: String
})

const emit = defineEmits(['goBack', 'editPet', 'viewPet'])

// Helper functions
function getTotalMedicalRecords() {
  if (!props.selectedOwner || !props.selectedOwner.pets) return 0
  return props.selectedOwner.pets.reduce((total, pet) => {
    return total + getPetRecordCount(pet)
  }, 0)
}

function getActiveVaccinations() {
  if (!props.selectedOwner || !props.selectedOwner.pets) return 0
  return props.selectedOwner.pets.reduce((total, pet) => {
    if (!pet.vaccinations) return total
    const now = new Date()
    return total + pet.vaccinations.filter(vaccine => {
      if (!vaccine.expiryDate) return false
      return new Date(vaccine.expiryDate) > now
    }).length
  }, 0)
}

function getPetRecordCount(pet) {
  if (!pet) return 0
  const medicalCount = pet.medicalHistory?.length || 0
  const vaccinationCount = pet.vaccinations?.length || 0
  const telehealthCount = pet.telehealthRecords?.length || 0
  const documentCount = pet.documents?.length || 0
  return medicalCount + vaccinationCount + telehealthCount + documentCount
}

function getLastUpdateDate(pet) {
  if (!pet) return null
  
  const dates = []
  
  // Check medical history
  if (pet.medicalHistory && pet.medicalHistory.length > 0) {
    dates.push(...pet.medicalHistory.map(record => new Date(record.date)))
  }
  
  // Check vaccinations
  if (pet.vaccinations && pet.vaccinations.length > 0) {
    dates.push(...pet.vaccinations.map(record => new Date(record.date)))
  }
  
  // Check telehealth records
  if (pet.telehealthRecords && pet.telehealthRecords.length > 0) {
    dates.push(...pet.telehealthRecords.map(record => new Date(record.date)))
  }
  
  // Check documents
  if (pet.documents && pet.documents.length > 0) {
    dates.push(...pet.documents.map(record => new Date(record.date)))
  }
  
  if (dates.length === 0) return null
  
  // Return the most recent date
  return new Date(Math.max(...dates))
}

function formatPetAge(pet) {
  if (!pet.birthDate) return '—'
  const birthDate = new Date(pet.birthDate)
  const now = new Date()
  const ageInMs = now - birthDate
  const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25))
  const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
  
  if (ageInYears > 0) {
    return ageInMonths > 0 ? `${ageInYears}y ${ageInMonths}m` : `${ageInYears}y`
  } else {
    return `${ageInMonths}m`
  }
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script> 