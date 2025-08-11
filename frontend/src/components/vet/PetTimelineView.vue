<template>
  <div v-if="selectedPet && !showForm" class="space-y-6">
    <!-- Timeline Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <button @click="$emit('goBack')" class="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ selectedPet.name }} - Timeline</h2>
          <p class="text-gray-600">{{ selectedPet.species }} • {{ selectedPet.breed }}</p>
          <p class="text-sm text-gray-500">Owner: {{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</p>
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
    
    <!-- Timeline Controls -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              v-model="timelineSortKey"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="type">Type</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <div class="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                @click="timelineSortOrder = 'desc'"
                :class="[
                  'px-3 py-2 text-sm transition-colors',
                  timelineSortOrder === 'desc' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                Newest First
              </button>
              <button
                @click="timelineSortOrder = 'asc'"
                :class="[
                  'px-3 py-2 text-sm transition-colors',
                  timelineSortOrder === 'asc' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                ]"
              >
                Oldest First
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="$emit('addMedicalRecord')"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <PlusIcon class="w-4 h-4" />
            Add Medical Record
          </button>
          <button
            @click="$emit('addVaccination')"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <PlusIcon class="w-4 h-4" />
            Add Vaccination
          </button>
        </div>
      </div>
    </div>
    
    <!-- Timeline View -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Complete Timeline</h3>
      
      <div v-if="timelineRecords.length > 0" class="space-y-6">
        <div 
          v-for="(record, index) in timelineRecords" 
          :key="`${record.type}-${index}`"
          class="relative"
        >
          <!-- Timeline Line -->
          <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <!-- Timeline Item -->
          <div class="relative flex items-start">
            <!-- Timeline Icon -->
            <div class="relative z-10 flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
              <component 
                :is="getTimelineIcon(record.type)" 
                class="w-5 h-5 text-gray-600"
              />
            </div>
            
            <!-- Timeline Content -->
            <div class="ml-6 flex-1 bg-gray-50 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-900">{{ getTimelineTitle(record) }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(record.date) }}</span>
                    <span 
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getTimelineBadgeClass(record)
                      ]"
                    >
                      {{ getTimelineBadgeText(record) }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-700 mb-2">{{ getTimelineDescription(record) }}</p>
                  
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span v-if="record.vet">Vet: {{ record.vet }}</span>
                    <span v-if="record.treatment">Treatment: {{ record.treatment }}</span>
                    <span v-if="record.medication">Medication: {{ record.medication }}</span>
                    <span v-if="record.batchNumber">Batch: {{ record.batchNumber }}</span>
                    <span v-if="record.nextDueDate">Next Due: {{ formatDate(record.nextDueDate) }}</span>
                  </div>
                </div>
                
                <button
                  @click="$emit('deleteTimelineRecord', record, index)"
                  class="text-red-500 hover:text-red-700 transition-colors ml-4"
                  title="Delete record"
                >
                  <XIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-12 text-gray-500">
        <ActivityIcon class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h4 class="text-lg font-medium text-gray-700 mb-2">No timeline records yet</h4>
        <p class="text-gray-500">Start building the pet's medical history by adding records and vaccinations.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ArrowLeftIcon, 
  Edit, 
  PlusIcon, 
  XIcon, 
  ActivityIcon,
  FileText,
  Syringe,
  File,
  Video
} from 'lucide-vue-next'

const props = defineProps({
  selectedPet: Object,
  selectedOwner: Object,
  showForm: Boolean,
  timelineSortKey: String,
  timelineSortOrder: String
})

const emit = defineEmits([
  'goBack', 
  'editPet', 
  'addMedicalRecord', 
  'addVaccination',
  'deleteTimelineRecord'
])

// Computed properties
const timelineRecords = computed(() => {
  const records = []
  
  // Add medical history records
  if (props.selectedPet.medicalHistory) {
    props.selectedPet.medicalHistory.forEach(record => {
      records.push({ ...record, type: 'medical' })
    })
  }
  
  // Add vaccination records
  if (props.selectedPet.vaccinations) {
    props.selectedPet.vaccinations.forEach(record => {
      records.push({ ...record, type: 'vaccination' })
    })
  }
  
  // Add telehealth records
  if (props.selectedPet.telehealthRecords) {
    props.selectedPet.telehealthRecords.forEach(record => {
      records.push({ ...record, type: 'telehealth' })
    })
  }
  
  // Add document records
  if (props.selectedPet.documents) {
    props.selectedPet.documents.forEach(record => {
      records.push({ ...record, type: 'document' })
    })
  }
  
  // Sort records
  records.sort((a, b) => {
    let aValue, bValue
    
    if (props.timelineSortKey === 'date') {
      aValue = new Date(a.date)
      bValue = new Date(b.date)
    } else {
      aValue = a.type
      bValue = b.type
    }
    
    if (props.timelineSortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return records
})

// Helper functions
function getTimelineIcon(type) {
  switch (type) {
    case 'medical':
      return FileText
    case 'vaccination':
      return Syringe
    case 'telehealth':
      return Video
    case 'document':
      return File
    default:
      return FileText
  }
}

function getTimelineTitle(record) {
  switch (record.type) {
    case 'medical':
      return record.condition || 'Medical Record'
    case 'vaccination':
      return record.name || 'Vaccination'
    case 'telehealth':
      return record.sessionType || 'Telehealth Session'
    case 'document':
      return record.name || 'Document'
    default:
      return 'Record'
  }
}

function getTimelineDescription(record) {
  switch (record.type) {
    case 'medical':
      return record.description || 'Medical condition recorded'
    case 'vaccination':
      return `Vaccination administered: ${record.name}`
    case 'telehealth':
      return record.notes || 'Telehealth consultation'
    case 'document':
      return record.description || 'Document uploaded'
    default:
      return 'Record details'
  }
}

function getTimelineBadgeClass(record) {
  switch (record.type) {
    case 'medical':
      return 'bg-blue-100 text-blue-800'
    case 'vaccination':
      return isVaccineExpired(record) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
    case 'telehealth':
      return 'bg-purple-100 text-purple-800'
    case 'document':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getTimelineBadgeText(record) {
  switch (record.type) {
    case 'medical':
      return 'Medical'
    case 'vaccination':
      return isVaccineExpired(record) ? 'Expired' : 'Active'
    case 'telehealth':
      return 'Telehealth'
    case 'document':
      return 'Document'
    default:
      return 'Record'
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

function isVaccineExpired(vaccine) {
  if (!vaccine.expiryDate) return false
  return new Date(vaccine.expiryDate) < new Date()
}
</script> 