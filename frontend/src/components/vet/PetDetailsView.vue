<template>
  <div v-if="selectedPet && !showForm" class="space-y-6">
    <!-- Pet Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$emit('goBack')" class="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <div class="flex items-center">
          <img 
            :src="selectedPet.photoURL || defaultPetPhotoURL" 
            :alt="selectedPet.name"
            class="w-16 h-16 rounded-full object-cover mr-4"
          />
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ selectedPet.name }}</h2>
            <p class="text-gray-600">{{ selectedPet.species }} • {{ selectedPet.breed }}</p>
            <p class="text-sm text-gray-500">Owner: {{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="$emit('editPet', selectedPet)"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Edit class="w-4 h-4" />
          Edit Pet
        </button>
      </div>
    </div>
    
    <!-- Tabs - Desktop View -->
    <div class="hidden md:block">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Dropdown - Mobile View -->
    <div class="md:hidden">
      <div class="relative">
        <button
          @click="showTabDropdown = !showTabDropdown"
          class="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white text-left"
        >
          <span>{{ getCurrentTabLabel() }}</span>
          <ChevronDown class="w-4 h-4" />
        </button>
        
        <div v-if="showTabDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div class="py-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="selectTab(tab.id)"
              class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Basic Information Tab -->
      <div v-if="activeTab === 'basics'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <p class="text-gray-900">{{ selectedPet.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <p class="text-gray-900 capitalize">{{ selectedPet.species }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Breed</label>
              <p class="text-gray-900">{{ selectedPet.breed || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <p class="text-gray-900 capitalize">{{ selectedPet.gender || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              <p class="text-gray-900">{{ formatDate(selectedPet.birthDate) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Weight</label>
              <p class="text-gray-900">{{ selectedPet.weight ? `${selectedPet.weight} kg` : '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <p class="text-gray-900">{{ selectedPet.color || '—' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Microchip ID</label>
              <p class="text-gray-900">{{ selectedPet.microchipId || '—' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Medical History Tab -->
      <div v-if="activeTab === 'medical'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Medical History</h3>
            <button
              @click="$emit('addMedicalRecord')"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon class="w-4 h-4" />
              Add Record
            </button>
          </div>
          
          <div v-if="selectedPet.medicalHistory && selectedPet.medicalHistory.length > 0" class="space-y-4">
            <div 
              v-for="(record, index) in sortedMedicalHistory" 
              :key="index"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-900">{{ record.condition }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(record.date) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 mb-2">{{ record.description }}</p>
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span v-if="record.vet">Vet: {{ record.vet }}</span>
                    <span v-if="record.treatment">Treatment: {{ record.treatment }}</span>
                    <span v-if="record.medication">Medication: {{ record.medication }}</span>
                  </div>
                </div>
                <button
                  @click="$emit('deleteMedicalRecord', record.id || index)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete record"
                >
                  <XIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <FileText class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No medical records found</p>
          </div>
        </div>
      </div>
      
      <!-- Vaccinations Tab -->
      <div v-if="activeTab === 'vaccinations'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Vaccinations</h3>
            <button
              @click="$emit('addVaccination')"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon class="w-4 h-4" />
              Add Vaccination
            </button>
          </div>
          
          <div v-if="selectedPet.vaccinations && selectedPet.vaccinations.length > 0" class="space-y-4">
            <div 
              v-for="(vaccine, index) in sortedVaccinations" 
              :key="index"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-900">{{ vaccine.name }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(vaccine.date) }}</span>
                  </div>
                  <div class="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <span v-if="vaccine.vet">Vet: {{ vaccine.vet }}</span>
                    <span v-if="vaccine.batchNumber">Batch: {{ vaccine.batchNumber }}</span>
                  </div>
                  <div class="flex items-center gap-4 text-xs">
                    <span class="text-gray-500">Next Due: {{ formatDate(vaccine.nextDueDate) }}</span>
                    <span 
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        isVaccineExpired(vaccine) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      ]"
                    >
                      {{ isVaccineExpired(vaccine) ? 'Expired' : 'Active' }}
                    </span>
                  </div>
                </div>
                <button
                  @click="$emit('deleteVaccination', vaccine.id || index)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete vaccination"
                >
                  <XIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <Syringe class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No vaccination records found</p>
          </div>
        </div>
      </div>
      
      <!-- Documents Tab -->
      <div v-if="activeTab === 'documents'" class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Documents</h3>
            <button
              @click="$emit('addDocument')"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <PlusIcon class="w-4 h-4" />
              Add Document
            </button>
          </div>
          
          <div v-if="selectedPet.documents && selectedPet.documents.length > 0" class="space-y-4">
            <div 
              v-for="(document, index) in sortedDocuments" 
              :key="index"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <File class="w-4 h-4 text-gray-400" />
                    <span class="text-sm font-medium text-gray-900">{{ document.name }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(document.date) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 mb-2">{{ document.description }}</p>
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span v-if="document.type">Type: {{ document.type }}</span>
                    <span v-if="document.uploadedBy">Uploaded by: {{ document.uploadedBy }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="$emit('downloadDocument', document)"
                    class="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Download document"
                  >
                    <DownloadIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="$emit('deleteDocument', document.id || index)"
                    class="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete document"
                  >
                    <XIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            <File class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No documents found</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ArrowLeftIcon, 
  Edit, 
  ChevronDown, 
  PlusIcon, 
  XIcon, 
  FileText, 
  Syringe, 
  File, 
  DownloadIcon 
} from 'lucide-vue-next'

const props = defineProps({
  selectedPet: Object,
  selectedOwner: Object,
  showForm: Boolean,
  activeTab: String,
  showTabDropdown: Boolean,
  defaultPetPhotoURL: String
})

const emit = defineEmits([
  'goBack', 
  'editPet', 
  'addMedicalRecord', 
  'addVaccination', 
  'addDocument',
  'deleteMedicalRecord',
  'deleteVaccination', 
  'deleteDocument',
  'downloadDocument'
])

// Tab configuration
const tabs = [
  { id: 'basics', label: 'Basic Information' },
  { id: 'medical', label: 'Medical History' },
  { id: 'vaccinations', label: 'Vaccinations' },
  { id: 'documents', label: 'Documents' }
]

// Computed properties for sorted data
const sortedMedicalHistory = computed(() => {
  if (!props.selectedPet.medicalHistory) return []
  return [...props.selectedPet.medicalHistory].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const sortedVaccinations = computed(() => {
  if (!props.selectedPet.vaccinations) return []
  return [...props.selectedPet.vaccinations].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const sortedDocuments = computed(() => {
  if (!props.selectedPet.documents) return []
  return [...props.selectedPet.documents].sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Helper functions
function getCurrentTabLabel() {
  const currentTab = tabs.find(tab => tab.id === props.activeTab)
  return currentTab ? currentTab.label : 'Select Tab'
}

function selectTab(tabId) {
  emit('update:activeTab', tabId)
  emit('update:showTabDropdown', false)
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function isVaccineExpired(vaccine) {
  if (!vaccine.expiryDate) return false
  return new Date(vaccine.expiryDate) < new Date()
}
</script> 