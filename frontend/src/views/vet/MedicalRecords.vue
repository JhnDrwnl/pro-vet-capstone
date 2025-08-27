<template>
  <div class="medical-records-container min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b rounded-lg mb-6">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Medical Records</h1>
            <p class="text-sm text-gray-600">Comprehensive medical history for all clients and pets</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="exportRecords"
              :disabled="!selectedClientId || loading || exporting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="!exporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div v-else class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              {{ exporting ? 'Exporting...' : 'Export to Excel' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Selection Panel -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Client Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
          <select 
            v-model="selectedClientId" 
            @change="onClientChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a client...</option>
            <option 
              v-for="client in clients" 
              :key="client.id" 
              :value="client.id"
            >
              {{ client.firstName }} {{ client.lastName }} 
              ({{ client.petCount || 0 }} pets)
            </option>
          </select>
        </div>
        
        <!-- Pet Selector -->
        <div v-if="selectedClientId">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Pet</label>
          <select 
            v-model="selectedPetId" 
            @change="onPetChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All pets</option>
            <option 
              v-for="pet in selectedClientPets" 
              :key="pet.id" 
              :value="pet.id"
            >
              {{ pet.name }} ({{ pet.species }})
            </option>
          </select>
        </div>
        
        <!-- Service Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
          <select 
            v-model="selectedServiceCategory" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Services</option>
            <option value="consultation">Consultations</option>
            <option value="vaccination">Vaccinations</option>
            <option value="treatment">Treatments</option>
            <option value="surgery">Surgeries</option>
            <option value="dental">Dental Care</option>
            <option value="emergency">Emergency Care</option>
            <option value="wellness">Wellness Check</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading medical records...</p>
      </div>
    </div>

    <!-- Records Display -->
    <div v-else-if="selectedClientId" class="records-display">
      <!-- Summary Statistics -->
      <div class="stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div class="text-2xl font-bold text-blue-600">{{ totalRecords }}</div>
          <div class="text-sm text-blue-600">Total Appointments</div>
        </div>
        <div class="stat-card bg-green-50 p-4 rounded-lg border border-green-200">
          <div class="text-2xl font-bold text-green-600">{{ totalConsultations }}</div>
          <div class="text-sm text-green-600">Consultations</div>
        </div>
        <div class="stat-card bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div class="text-2xl font-bold text-purple-600">{{ totalVaccinations }}</div>
          <div class="text-sm text-purple-600">Vaccinations</div>
        </div>
        <div class="stat-card bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div class="text-2xl font-bold text-orange-600">{{ totalTreatments }}</div>
          <div class="text-sm text-orange-600">Treatments</div>
        </div>
      </div>

      <!-- Records Timeline -->
      <div class="records-timeline bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Medical Records Timeline
              <span v-if="selectedPetId" class="text-sm font-normal text-gray-500 ml-2">
                - {{ getSelectedPetName() }}
              </span>
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              Showing {{ filteredRecords.length }} appointments
            </p>
          </div>
          
          <!-- Search -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search appointments..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            >
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Timeline Items -->
        <div v-if="filteredRecords.length > 0" class="timeline-container">
          <div 
            v-for="record in filteredRecords" 
            :key="record.id" 
            class="timeline-item relative pl-8 pb-6"
          >
            <!-- Timeline Dot -->
            <div class="absolute left-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                 :class="getTimelineDotClass(record.serviceCategory)">
              <component :is="getRecordIcon(record.serviceCategory)" class="w-2.5 h-2.5 text-white" />
            </div>
            
            <!-- Timeline Content -->
            <div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-900">{{ record.title }}</span>
                    <span class="text-xs px-2 py-1 rounded-full" :class="getRecordBadgeClass(record.serviceCategory)">
                      {{ formatServiceCategory(record.serviceCategory) }}
                    </span>
                    <span v-if="record.petName" class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      {{ record.petName }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ record.description }}</p>
                </div>
                <div class="text-right ml-4">
                  <div class="text-xs text-gray-400">{{ formatDate(record.date) }}</div>
                  <div v-if="record.doctor" class="text-xs text-gray-500">{{ record.doctor }}</div>
                </div>
              </div>
              
              <!-- Appointment details -->
              <div class="appointment-details mt-3 pt-3 border-t border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Services:</span>
                    <span class="ml-2 font-medium">{{ record.services?.join(', ') || 'N/A' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Status:</span>
                    <span class="ml-2 font-medium" :class="getStatusClass(record.status)">
                      {{ record.status }}
                    </span>
                  </div>
                  <div v-if="record.treatmentSummary" class="md:col-span-2">
                    <span class="text-gray-500">Treatment Summary:</span>
                    <p class="ml-2 font-medium text-gray-700 mt-1">{{ record.treatmentSummary }}</p>
                  </div>
                  <div v-if="record.ownerInstructions" class="md:col-span-2">
                    <span class="text-gray-500">Owner Instructions:</span>
                    <p class="ml-2 font-medium text-gray-700 mt-1">{{ record.ownerInstructions }}</p>
                  </div>
                  <div v-if="record.nextSteps" class="md:col-span-2">
                    <span class="text-gray-500">Next Steps:</span>
                    <p class="ml-2 font-medium text-gray-700 mt-1">{{ record.nextSteps }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Records State -->
        <div v-else class="text-center py-20">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
          <p class="text-gray-500">
            {{ selectedPetId ? 'No medical records found for this pet' : 'No medical records found for the selected filters' }}
          </p>
        </div>
      </div>
    </div>

    <!-- No Client Selected State -->
    <div v-else class="text-center py-20">
      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Select a Client</h3>
      <p class="text-gray-500">Choose a client to view their pets' medical records</p>
    </div>
  </div>
  
  <!-- Export Loading Overlay -->
  <LoadingSpinner 
    v-if="exporting" 
    text="Exporting to Excel..." 
    :is-overlay="true" 
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@shared/firebase'
import { 
  CalendarIcon, 
  SyringeIcon, 
  ActivityIcon,
  FileTextIcon,
  TrendingUpIcon,
  HeartIcon,
  StethoscopeIcon,
  AlertTriangleIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/modules/authStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// Stores
const authStore = useAuthStore()

// State
const clients = ref([])
const selectedClientId = ref('')
const selectedPetId = ref('')
const selectedServiceCategory = ref('all')
const medicalRecords = ref([])
const loading = ref(false)
const searchQuery = ref('')
const exporting = ref(false) // New state for export loading

// Computed properties
const selectedClientPets = computed(() => {
  if (!selectedClientId.value) return []
  const client = clients.value.find(c => c.id === selectedClientId.value)
  return client?.pets || []
})

const filteredRecords = computed(() => {
  let records = medicalRecords.value
  
  // Filter by pet if selected
  if (selectedPetId.value) {
    records = records.filter(record => record.petId === selectedPetId.value)
  }
  
  // Filter by service category
  if (selectedServiceCategory.value !== 'all') {
    records = records.filter(record => record.serviceCategory === selectedServiceCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    records = records.filter(record => 
      record.title.toLowerCase().includes(query) ||
      record.description.toLowerCase().includes(query) ||
      record.petName.toLowerCase().includes(query) ||
      record.doctor.toLowerCase().includes(query) ||
      record.services?.some(service => service.toLowerCase().includes(query))
    )
  }
  
  return records.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : 0
    const dateB = b.date instanceof Date ? b.date.getTime() : 0
    return dateB - dateA
  })
})

const totalRecords = computed(() => medicalRecords.value.length)
const totalConsultations = computed(() => 
  medicalRecords.value.filter(r => r.serviceCategory === 'consultation').length
)
const totalVaccinations = computed(() => 
  medicalRecords.value.filter(r => r.serviceCategory === 'vaccination').length
)
const totalTreatments = computed(() => 
  medicalRecords.value.filter(r => r.serviceCategory === 'treatment').length
)

// Methods
const fetchClients = async () => {
  try {
    loading.value = true
    
    // Get current vet's user ID (this is what's stored in doctorId field)
    const currentVetUserId = authStore.user?.userId
    if (!currentVetUserId) {
      console.error('No vet user ID found')
      return
    }
    
    console.log('Current vet user ID:', currentVetUserId)
    
    // Fetch clients who have appointments with this vet
    // Use doctorId field which contains the vet's user ID
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', currentVetUserId),
      orderBy('createdAt', 'desc'),
      limit(100)
    )
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    console.log('Found appointments:', appointmentsSnapshot.docs.length)
    
    const clientIds = [...new Set(appointmentsSnapshot.docs.map(doc => doc.data().userId))]
    console.log('Unique client IDs:', clientIds)
    
    // Fetch client data and their pets
    const clientsData = []
    for (const clientId of clientIds) {
      try {
        // The clientId is the document ID in users collection
        const clientDoc = await getDoc(doc(db, 'users', clientId))
        if (clientDoc.exists()) {
          const clientData = clientDoc.data()
          console.log('Client data for', clientId, ':', clientData)
          
          // Fetch pets for this client using ownerId field
          const petsQuery = query(
            collection(db, 'pets'),
            where('ownerId', '==', clientId)
          )
          const petsSnapshot = await getDocs(petsQuery)
          const pets = petsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          console.log('Pets for client', clientId, ':', pets)
          
          clientsData.push({
            id: clientId, // This is the document ID
            ...clientData,
            pets,
            petCount: pets.length
          })
        }
      } catch (error) {
        console.error(`Error fetching client ${clientId}:`, error)
      }
    }
    
    clients.value = clientsData
    console.log('Final clients data:', clientsData)
    
  } catch (error) {
    console.error('Error fetching clients:', error)
  } finally {
    loading.value = false
  }
}

const fetchMedicalRecords = async () => {
  if (!selectedClientId.value) return
  
  try {
    loading.value = true
    const records = []
    
    // Get all pets for the selected client
    const client = clients.value.find(c => c.id === selectedClientId.value)
    if (!client?.pets) return
    
    const petIds = client.pets.map(pet => pet.id)
    console.log('Fetching records for pet IDs:', petIds)
    
    // Fetch completed appointments for this client's pets
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('petIds', 'array-contains-any', petIds),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    )
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    console.log('Found completed appointments:', appointmentsSnapshot.docs.length)
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data()
      
      // Determine service category based on services
      const serviceCategory = determineServiceCategory(appointmentData.serviceNames || [])
      
      // Create appointment record
      records.push({
        id: `appointment-${appointmentDoc.id}`,
        type: 'appointment',
        serviceCategory: serviceCategory,
        date: getSafeDate(appointmentData.completedAt || appointmentData.date),
        title: appointmentData.serviceNames?.join(', ') || 'Veterinary Appointment',
        description: appointmentData.treatmentSummary || 'Appointment completed',
        petId: appointmentData.petIds?.[0], // Primary pet
        petName: client.pets.find(p => p.id === appointmentData.petIds?.[0])?.name,
        doctor: formatDoctorName(appointmentData.doctorName),
        services: appointmentData.serviceNames,
        status: appointmentData.status,
        treatmentSummary: appointmentData.treatmentSummary,
        ownerInstructions: appointmentData.ownerInstructions,
        nextSteps: appointmentData.nextSteps
      })
    }
    
    medicalRecords.value = records
    console.log('Final medical records:', records)
    
  } catch (error) {
    console.error('Error fetching medical records:', error)
  } finally {
    loading.value = false
  }
}

// Helper function to determine service category
const determineServiceCategory = (serviceNames) => {
  if (!serviceNames || serviceNames.length === 0) return 'consultation'
  
  const servicesLower = serviceNames.map(s => s.toLowerCase())
  
  // Check for vaccination services
  if (servicesLower.some(s => 
    s.includes('vaccination') || 
    s.includes('vaccine') || 
    s.includes('shot') || 
    s.includes('immunization') ||
    s.includes('rabies') ||
    s.includes('dhpp') ||
    s.includes('bordetella')
  )) {
    return 'vaccination'
  }
  
  // Check for surgery services
  if (servicesLower.some(s => 
    s.includes('surgery') || 
    s.includes('operation') || 
    s.includes('procedure')
  )) {
    return 'surgery'
  }
  
  // Check for dental services
  if (servicesLower.some(s => 
    s.includes('dental') || 
    s.includes('teeth') || 
    s.includes('cleaning')
  )) {
    return 'dental'
  }
  
  // Check for emergency services
  if (servicesLower.some(s => 
    s.includes('emergency') || 
    s.includes('urgent') || 
    s.includes('critical')
  )) {
    return 'emergency'
  }
  
  // Check for wellness services
  if (servicesLower.some(s => 
    s.includes('wellness') || 
    s.includes('checkup') || 
    s.includes('examination')
  )) {
    return 'wellness'
  }
  
  // Check for treatment services
  if (servicesLower.some(s => 
    s.includes('treatment') || 
    s.includes('therapy') || 
    s.includes('medication')
  )) {
    return 'treatment'
  }
  
  // Default to consultation
  return 'consultation'
}

// Helper function to safely create a Date object
const getSafeDate = (dateString) => {
  if (!dateString) {
    return new Date(0)
  }
  
  // Handle Firebase Timestamp objects
  if (dateString && typeof dateString === 'object' && dateString.toDate) {
    return dateString.toDate()
  }
  
  // Handle regular date strings
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return new Date(0)
  }
  return date
}

// Helper function to format doctor name
const formatDoctorName = (name) => {
  if (!name) return 'N/A'
  const lowerCaseName = name.toLowerCase()
  if (lowerCaseName.includes('dr.')) {
    return name.replace('dr.', 'Dr.').replace('dr ', 'Dr ')
  }
  if (lowerCaseName.includes('dr ')) {
    return name.replace('dr ', 'Dr ')
  }
  return name
}

// Event handlers
const onClientChange = () => {
  selectedPetId.value = '' // Reset pet selection
  fetchMedicalRecords()
}

const onPetChange = () => {
  // Pet change doesn't require refetching, just filtering
}

const getSelectedPetName = () => {
  if (!selectedPetId.value) return 'All Pets'
  const pet = selectedClientPets.value.find(p => p.id === selectedPetId.value)
  return pet?.name || 'Unknown Pet'
}

// Helper functions
const getTimelineDotClass = (serviceCategory) => {
  const baseClasses = 'w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center'
  
  switch (serviceCategory) {
    case 'consultation':
      return `${baseClasses} bg-blue-500`
    case 'vaccination':
      return `${baseClasses} bg-green-500`
    case 'treatment':
      return `${baseClasses} bg-purple-500`
    case 'surgery':
      return `${baseClasses} bg-red-500`
    case 'dental':
      return `${baseClasses} bg-yellow-500`
    case 'emergency':
      return `${baseClasses} bg-red-600`
    case 'wellness':
      return `${baseClasses} bg-indigo-500`
    default:
      return `${baseClasses} bg-gray-500`
  }
}

const getRecordIcon = (serviceCategory) => {
  switch (serviceCategory) {
    case 'consultation':
      return StethoscopeIcon
    case 'vaccination':
      return SyringeIcon
    case 'treatment':
      return ActivityIcon
    case 'surgery':
      return AlertTriangleIcon
    case 'dental':
      return TrendingUpIcon
    case 'emergency':
      return AlertTriangleIcon
    case 'wellness':
      return HeartIcon
    default:
      return CalendarIcon
  }
}

const getRecordBadgeClass = (serviceCategory) => {
  switch (serviceCategory) {
    case 'consultation':
      return 'bg-blue-100 text-blue-700'
    case 'vaccination':
      return 'bg-green-100 text-green-700'
    case 'treatment':
      return 'bg-purple-100 text-purple-700'
    case 'surgery':
      return 'bg-red-100 text-red-700'
    case 'dental':
      return 'bg-yellow-100 text-yellow-700'
    case 'emergency':
      return 'bg-red-100 text-red-700'
    case 'wellness':
      return 'bg-indigo-100 text-indigo-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatServiceCategory = (serviceCategory) => {
  switch (serviceCategory) {
    case 'consultation':
      return 'Consultation'
    case 'vaccination':
      return 'Vaccination'
    case 'treatment':
      return 'Treatment'
    case 'surgery':
      return 'Surgery'
    case 'dental':
      return 'Dental Care'
    case 'emergency':
      return 'Emergency Care'
    case 'wellness':
      return 'Wellness Check'
    default:
      return 'Appointment'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'text-green-600'
    case 'pending':
      return 'text-yellow-600'
    case 'cancelled':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const exportRecords = async () => {
  if (!selectedClientId.value || medicalRecords.value.length === 0) {
    alert('No records to export')
    return
  }

  if (exporting.value) {
    return // Prevent multiple export attempts
  }

  try {
    exporting.value = true // Start loading for export
    // Dynamic import of xlsx library
    const XLSX = await import('xlsx')
    
    // Get client and pet info
    const client = clients.value.find(c => c.id === selectedClientId.value)
    const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'
    
    // Create workbook
    const workbook = XLSX.utils.book_new()
    
    // 1. MAIN RECORDS SHEET
    const mainRecordsData = medicalRecords.value.map(record => ({
      'Date & Time': formatDate(record.date),
      'Service Category': formatServiceCategory(record.serviceCategory),
      'Appointment Title': record.title || 'N/A',
      'Description': record.description || 'N/A',
      'Pet Name': record.petName || 'N/A',
      'Veterinarian': record.doctor || 'N/A',
      'Services Provided': record.services?.join('; ') || 'N/A',
      'Status': record.status || 'N/A',
      'Treatment Summary': record.treatmentSummary || 'N/A',
      'Owner Instructions': record.ownerInstructions || 'N/A',
      'Next Steps': record.nextSteps || 'N/A'
    }))
    
    const mainSheet = XLSX.utils.json_to_sheet(mainRecordsData)
    
    // Style the main sheet
    mainSheet['!cols'] = [
      { width: 20 }, // Date & Time
      { width: 15 }, // Service Category
      { width: 30 }, // Appointment Title
      { width: 25 }, // Description
      { width: 15 }, // Pet Name
      { width: 20 }, // Veterinarian
      { width: 30 }, // Services Provided
      { width: 12 }, // Status
      { width: 30 }, // Treatment Summary
      { width: 25 }, // Owner Instructions
      { width: 20 }  // Next Steps
    ]
    
    // Add header styling
    const range = XLSX.utils.decode_range(mainSheet['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C })
      if (!mainSheet[address]) continue
      mainSheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center" }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Medical Records')
    
    // 2. SUMMARY STATISTICS SHEET
    const summaryData = [
      { 'Metric': 'Total Appointments', 'Count': totalRecords.value },
      { 'Metric': 'Consultations', 'Count': totalConsultations.value },
      { 'Metric': 'Vaccinations', 'Count': totalVaccinations.value },
      { 'Metric': 'Treatments', 'Count': totalTreatments.value },
      { 'Metric': 'Surgeries', 'Count': medicalRecords.value.filter(r => r.serviceCategory === 'surgery').length },
      { 'Metric': 'Dental Care', 'Count': medicalRecords.value.filter(r => r.serviceCategory === 'dental').length },
      { 'Metric': 'Emergency Care', 'Count': medicalRecords.value.filter(r => r.serviceCategory === 'emergency').length },
      { 'Metric': 'Wellness Checks', 'Count': medicalRecords.value.filter(r => r.serviceCategory === 'wellness').length }
    ]
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    summarySheet['!cols'] = [
      { width: 20 }, // Metric
      { width: 15 }  // Count
    ]
    
    // Add header styling to summary sheet
    const summaryRange = XLSX.utils.decode_range(summarySheet['!ref'])
    for (let C = summaryRange.s.c; C <= summaryRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C })
      if (!summarySheet[address]) continue
      summarySheet[address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "70AD47" } },
        alignment: { horizontal: "center" }
      }
    }
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Statistics')
    
    // 3. PET-SPECIFIC RECORDS SHEET
    if (selectedPetId.value) {
      const petRecords = medicalRecords.value.filter(record => record.petId === selectedPetId.value)
      const petName = client.pets.find(p => p.id === selectedPetId.value)?.name || 'Unknown Pet'
      
      const petData = petRecords.map(record => ({
        'Date': formatDate(record.date),
        'Service Type': formatServiceCategory(record.serviceCategory),
        'Services': record.services?.join('; ') || 'N/A',
        'Veterinarian': record.doctor || 'N/A',
        'Treatment Summary': record.treatmentSummary || 'N/A',
        'Next Steps': record.nextSteps || 'N/A'
      }))
      
      const petSheet = XLSX.utils.json_to_sheet(petData)
      petSheet['!cols'] = [
        { width: 20 }, // Date
        { width: 20 }, // Service Type
        { width: 30 }, // Services
        { width: 20 }, // Veterinarian
        { width: 30 }, // Treatment Summary
        { width: 25 }  // Next Steps
      ]
      
      XLSX.utils.book_append_sheet(workbook, petSheet, `${petName} Records`)
    }
    
    // 4. CLIENT INFORMATION SHEET
    const clientInfo = [
      { 'Field': 'Client Name', 'Value': `${client.firstName} ${client.lastName}` },
      { 'Field': 'Total Pets', 'Value': client.petCount || 0 },
      { 'Field': 'Export Date', 'Value': new Date().toLocaleDateString() },
      { 'Field': 'Export Time', 'Value': new Date().toLocaleTimeString() },
      { 'Field': 'Total Records', 'Value': medicalRecords.value.length }
    ]
    
    // Add pet details
    client.pets?.forEach(pet => {
      clientInfo.push({ 'Field': `Pet: ${pet.name}`, 'Value': `${pet.species} - ${pet.breed || 'Unknown'}` })
    })
    
    const clientSheet = XLSX.utils.json_to_sheet(clientInfo)
    clientSheet['!cols'] = [
      { width: 25 }, // Field
      { width: 30 }  // Value
    ]
    
    XLSX.utils.book_append_sheet(workbook, clientSheet, 'Client Information')
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const filename = `Medical_Records_${clientName.replace(/\s+/g, '_')}_${timestamp}.xlsx`
    
    // Export the workbook
    XLSX.writeFile(workbook, filename)
    
    console.log('Excel file exported successfully:', filename)
    
  } catch (error) {
    console.error('Error exporting records:', error)
    
    // Check if xlsx library is not installed
    if (error.message.includes('xlsx')) {
      alert('Excel export library not found. Please install xlsx package:\n\nnpm install xlsx')
    } else {
      alert('Failed to export records. Please try again.')
    }
  } finally {
    exporting.value = false // End loading for export
  }
}

// Lifecycle
onMounted(() => {
  fetchClients()
})

// Watch for changes
watch(selectedClientId, () => {
  if (selectedClientId.value) {
    fetchMedicalRecords()
  }
})
</script>

<style scoped>
.medical-records-container {
  min-height: 100vh;
}

.stat-card {
  transition: all 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-container {
  position: relative;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
}

.timeline-item {
  position: relative;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:last-child::after {
  display: none;
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 24px;
  bottom: -6px;
  width: 1px;
  background: #e5e7eb;
}

.records-timeline {
  max-height: 70vh;
  overflow-y: auto;
}

/* Custom scrollbar */
.records-timeline::-webkit-scrollbar {
  width: 6px;
}

.records-timeline::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.records-timeline::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.records-timeline::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .selection-panel .grid {
    grid-template-columns: 1fr;
  }
}
</style>
