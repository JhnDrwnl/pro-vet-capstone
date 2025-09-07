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
        </div>
      </div>
    </div>

    <!-- Selection Panel -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Client Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
          <div class="relative">
            <input
              v-model="clientSearchQuery"
              @focus="showClientDropdown = true"
              @blur="handleClientBlur"
              @input="filterClients"
              type="text"
              placeholder="Search for a client..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <svg class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            
            <!-- Client dropdown -->
            <div v-if="showClientDropdown && filteredClients.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              <div 
                v-for="client in filteredClients" 
              :key="client.id" 
                @mousedown.prevent="selectClient(client)"
                class="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div class="font-medium text-gray-900">{{ client.firstName }} {{ client.lastName }}</div>
                <div class="text-xs text-gray-500">{{ client.petCount || 0 }} pets</div>
              </div>
            </div>
            
            <!-- No clients found -->
            <div v-if="showClientDropdown && filteredClients.length === 0 && clientSearchQuery" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center text-gray-500 text-sm">
              No clients found matching "{{ clientSearchQuery }}"
            </div>
          </div>
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
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
            <option v-if="categories.length === 0" disabled>Loading categories...</option>
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
    <div v-else class="records-display">
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
              Medical Records
              <span v-if="selectedPetId" class="text-sm font-normal text-gray-500 ml-2">
                - {{ getSelectedPetName() }}
              </span>
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              Showing {{ filteredRecords.length }} appointments
            </p>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Export Button -->
            <button 
              @click="showExportModal = true"
              :disabled="loading || filteredRecords.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Export to PDF
            </button>
          
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
        </div>

        <!-- Table View -->
        <div>
          <div v-if="filteredRecords.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veterinarian
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment Summary
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
            v-for="record in filteredRecords" 
            :key="record.id" 
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(record.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-xs px-2 py-1 rounded-full" :class="getRecordBadgeClass(record.serviceCategory)">
                      {{ formatServiceCategory(record.serviceCategory) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getClientName(record.clientId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ record.petName || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ record.doctor || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium" :class="getStatusClass(record.status)">
                      {{ record.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div class="truncate" :title="record.services?.join(', ') || 'N/A'">
                      {{ record.services?.join(', ') || 'N/A' }}
                  </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div class="truncate" :title="record.treatmentSummary || 'N/A'">
                      {{ record.treatmentSummary || 'N/A' }}
                  </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Records State -->
        <div v-if="filteredRecords.length === 0" class="text-center py-20">
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

  </div>
  
  <!-- Export Modal -->
  <div v-if="showExportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Export Medical Records</h3>
          <button @click="showExportModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
          </button>
      </div>
        
        <div class="space-y-4">
          <!-- Client Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select v-model="exportFilters.clientId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Clients</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.firstName }} {{ client.lastName }}
              </option>
            </select>
          </div>
          
          <!-- Pet Filter -->
          <div v-if="exportFilters.clientId">
            <label class="block text-sm font-medium text-gray-700 mb-2">Pet</label>
            <select v-model="exportFilters.petId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Pets</option>
              <option v-for="pet in getClientPets(exportFilters.clientId)" :key="pet.id" :value="pet.id">
                {{ pet.name }} ({{ pet.species }})
              </option>
            </select>
          </div>
          
          <!-- Service Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
            <select v-model="exportFilters.serviceCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Services</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
              <option v-if="categories.length === 0" disabled>Loading categories...</option>
            </select>
          </div>
          
          <!-- Date Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input v-model="exportFilters.fromDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input v-model="exportFilters.toDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showExportModal = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button 
            @click="exportToPDF" 
            :disabled="exporting"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div v-if="exporting" class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            {{ exporting ? 'Exporting...' : 'Export to PDF' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Export Loading Overlay -->
  <LoadingSpinner 
    v-if="exporting" 
    text="Exporting to PDF..." 
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

// Categories and services data
const categories = ref([])
const services = ref([])
const serviceCategories = ref({}) // Map service ID to category

// Client search state
const clientSearchQuery = ref('')
const showClientDropdown = ref(false)
const filteredClients = ref([])

// Export modal state
const showExportModal = ref(false)
const exportFilters = ref({
  clientId: '',
  petId: '',
  serviceCategory: '',
  fromDate: '',
  toDate: ''
})

// Computed properties
const selectedClientPets = computed(() => {
  if (!selectedClientId.value) return []
  const client = clients.value.find(c => c.id === selectedClientId.value)
  return client?.pets || []
})

const filteredRecords = computed(() => {
  let records = medicalRecords.value
  
  // Filter by client if selected
  if (selectedClientId.value) {
    records = records.filter(record => record.clientId === selectedClientId.value)
  }
  
  // Filter by pet if selected (only if client is also selected)
  if (selectedPetId.value && selectedClientId.value) {
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
      record.title?.toLowerCase().includes(query) ||
      record.description?.toLowerCase().includes(query) ||
      record.petName?.toLowerCase().includes(query) ||
      record.doctor?.toLowerCase().includes(query) ||
      getClientName(record.clientId).toLowerCase().includes(query) ||
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

// Dynamic statistics based on actual categories
const categoryStats = computed(() => {
  const stats = {}
  categories.value.forEach(category => {
    stats[category.id] = medicalRecords.value.filter(r => r.serviceCategory === category.id).length
  })
  return stats
})

// Keep some common stats for backward compatibility
const totalConsultations = computed(() => {
  const consultationCategory = categories.value.find(c => c.name.toLowerCase().includes('consultation'))
  return consultationCategory ? categoryStats.value[consultationCategory.id] || 0 : 0
})

const totalVaccinations = computed(() => {
  const vaccinationCategory = categories.value.find(c => c.name.toLowerCase().includes('vaccination'))
  return vaccinationCategory ? categoryStats.value[vaccinationCategory.id] || 0 : 0
})

const totalTreatments = computed(() => {
  const treatmentCategory = categories.value.find(c => c.name.toLowerCase().includes('treatment'))
  return treatmentCategory ? categoryStats.value[treatmentCategory.id] || 0 : 0
})

// Methods
const fetchCategoriesAndServices = async () => {
  try {
    // Fetch categories - try with orderBy first, fallback without if index missing
    let categoriesSnapshot
    try {
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('archived', '==', false),
        orderBy('name')
      )
      categoriesSnapshot = await getDocs(categoriesQuery)
    } catch (orderByError) {
      console.warn('OrderBy index missing for categories, fetching without order:', orderByError)
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('archived', '==', false)
      )
      categoriesSnapshot = await getDocs(categoriesQuery)
    }
    
    const categoriesData = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    categories.value = categoriesData
    
    // Fetch services - try with orderBy first, fallback without if index missing
    let servicesSnapshot
    try {
      const servicesQuery = query(
        collection(db, 'services'),
        where('archived', '==', false),
        orderBy('name')
      )
      servicesSnapshot = await getDocs(servicesQuery)
    } catch (orderByError) {
      console.warn('OrderBy index missing for services, fetching without order:', orderByError)
      const servicesQuery = query(
        collection(db, 'services'),
        where('archived', '==', false)
      )
      servicesSnapshot = await getDocs(servicesQuery)
    }
    
    const servicesData = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    services.value = servicesData
    
    // Build service to category mapping
    const serviceCategoryMap = {}
    servicesData.forEach(service => {
      serviceCategoryMap[service.id] = service.categoryId
    })
    serviceCategories.value = serviceCategoryMap
    
    console.log('Fetched categories:', categoriesData.length, categoriesData)
    console.log('Fetched services:', servicesData.length, servicesData)
    console.log('Service category mapping:', serviceCategoryMap)
    
  } catch (error) {
    console.error('Error fetching categories and services:', error)
  }
}

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
    filteredClients.value = clientsData // Initialize filtered clients
    console.log('Final clients data:', clientsData)
    
  } catch (error) {
    console.error('Error fetching clients:', error)
  } finally {
    loading.value = false
  }
}

const fetchMedicalRecords = async () => {
  try {
    loading.value = true
    const records = []
    
    // Fetch all completed appointments for the current vet
    const currentVetUserId = authStore.user?.userId
    if (!currentVetUserId) {
      console.error('No vet user ID found')
      return
    }
    
    console.log('Fetching all records for vet:', currentVetUserId)
    
    // Fetch completed appointments for this vet
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', currentVetUserId),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    )
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    console.log('Found completed appointments:', appointmentsSnapshot.docs.length)
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data()
      
      // Get client and pet information for this appointment
      const clientId = appointmentData.userId
      const petId = appointmentData.petIds?.[0]
      
      // Find client data
      const client = clients.value.find(c => c.id === clientId)
      const petName = client?.pets?.find(p => p.id === petId)?.name || 'Unknown Pet'
      
      // Determine service category based on actual service IDs and categories
      const serviceCategory = determineServiceCategoryFromServices(appointmentData.services || [])
      
      // Create appointment record
      records.push({
        id: `appointment-${appointmentDoc.id}`,
        type: 'appointment',
        serviceCategory: serviceCategory,
        date: getSafeDate(appointmentData.completedAt || appointmentData.date),
        title: appointmentData.serviceNames?.join(', ') || 'Veterinary Appointment',
        description: appointmentData.treatmentSummary || 'Appointment completed',
        clientId: clientId,
        petId: petId,
        petName: petName,
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

// Helper function to determine service category from actual service IDs
const determineServiceCategoryFromServices = (serviceIds) => {
  if (!serviceIds || serviceIds.length === 0) {
    // Return first available category or 'consultation' as fallback
    return categories.value.length > 0 ? categories.value[0].id : 'consultation'
  }
  
  // Get the first service's category
  const firstServiceId = serviceIds[0]
  const categoryId = serviceCategories.value[firstServiceId]
  
  if (categoryId) {
    // Find the category name
    const category = categories.value.find(c => c.id === categoryId)
    return category ? category.id : 'consultation'
  }
  
  // Fallback to first available category
  return categories.value.length > 0 ? categories.value[0].id : 'consultation'
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

// Client search methods
const filterClients = () => {
  if (!clientSearchQuery.value || clientSearchQuery.value.trim() === '') {
    filteredClients.value = clients.value
    return
  }
  
  const search = clientSearchQuery.value.toLowerCase()
  filteredClients.value = clients.value.filter(client => 
    client.firstName.toLowerCase().includes(search) ||
    client.lastName.toLowerCase().includes(search) ||
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(search)
  )
}

const selectClient = (client) => {
  selectedClientId.value = client.id
  clientSearchQuery.value = `${client.firstName} ${client.lastName}`
  showClientDropdown.value = false
  onClientChange()
}

const handleClientBlur = () => {
  // Delay hiding dropdown to allow click events to complete
  setTimeout(() => {
    showClientDropdown.value = false
  }, 200)
}

// Event handlers
const onClientChange = () => {
  selectedPetId.value = '' // Reset pet selection
  // No need to refetch records since we have all records loaded
}

const onPetChange = () => {
  // Pet change doesn't require refetching, just filtering
}

const getSelectedPetName = () => {
  if (!selectedPetId.value) return 'All Pets'
  const pet = selectedClientPets.value.find(p => p.id === selectedPetId.value)
  return pet?.name || 'Unknown Pet'
}

const getClientName = (clientId) => {
  if (!clientId) return 'N/A'
  const client = clients.value.find(c => c.id === clientId)
  return client ? `${client.firstName} ${client.lastName}` : 'N/A'
}

const getClientPets = (clientId) => {
  if (!clientId) return []
  const client = clients.value.find(c => c.id === clientId)
  return client?.pets || []
}

// Helper functions

const getRecordBadgeClass = (serviceCategoryId) => {
  // Define color classes for different category types
  const colorClasses = {
    'consultation': 'bg-blue-100 text-blue-700',
    'vaccination': 'bg-green-100 text-green-700',
    'treatment': 'bg-purple-100 text-purple-700',
    'surgery': 'bg-red-100 text-red-700',
    'dental': 'bg-yellow-100 text-yellow-700',
    'emergency': 'bg-red-100 text-red-700',
    'wellness': 'bg-indigo-100 text-indigo-700'
  }
  
  // Find the category and check if it matches any predefined types
  const category = categories.value.find(c => c.id === serviceCategoryId)
  if (category) {
    const categoryName = category.name.toLowerCase()
    
    // Check for specific category types
    if (categoryName.includes('consultation')) return colorClasses.consultation
    if (categoryName.includes('vaccination')) return colorClasses.vaccination
    if (categoryName.includes('treatment')) return colorClasses.treatment
    if (categoryName.includes('surgery')) return colorClasses.surgery
    if (categoryName.includes('dental')) return colorClasses.dental
    if (categoryName.includes('emergency')) return colorClasses.emergency
    if (categoryName.includes('wellness')) return colorClasses.wellness
  }
  
  // Default color for unknown categories
  return 'bg-gray-100 text-gray-700'
}

const formatServiceCategory = (serviceCategoryId) => {
  if (!serviceCategoryId) return 'Appointment'
  
  // Find the category by ID
  const category = categories.value.find(c => c.id === serviceCategoryId)
  return category ? category.name : 'Appointment'
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

const exportToPDF = async () => {
  if (exporting.value) {
    return // Prevent multiple export attempts
  }

  try {
    exporting.value = true
    showExportModal.value = false
    
    // Filter records based on export filters
    let recordsToExport = medicalRecords.value
    
    // Apply filters
    if (exportFilters.value.clientId) {
      recordsToExport = recordsToExport.filter(record => record.clientId === exportFilters.value.clientId)
    }
    
    if (exportFilters.value.petId) {
      recordsToExport = recordsToExport.filter(record => record.petId === exportFilters.value.petId)
    }
    
    if (exportFilters.value.serviceCategory) {
      recordsToExport = recordsToExport.filter(record => record.serviceCategory === exportFilters.value.serviceCategory)
    }
    
    if (exportFilters.value.fromDate) {
      const fromDate = new Date(exportFilters.value.fromDate)
      recordsToExport = recordsToExport.filter(record => record.date >= fromDate)
    }
    
    if (exportFilters.value.toDate) {
      const toDate = new Date(exportFilters.value.toDate)
      toDate.setHours(23, 59, 59, 999) // End of day
      recordsToExport = recordsToExport.filter(record => record.date <= toDate)
    }
    
    if (recordsToExport.length === 0) {
      alert('No records found matching the selected filters.')
      return
    }
    
    // Try to use autotable first, fallback to simple table
    try {
      // Dynamic import of jsPDF library and autotable plugin
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default
      
      // Create PDF with autotable
      const doc = new jsPDF('l', 'mm', 'a4') // Landscape orientation
      
      // Add title
      doc.setFontSize(20)
      doc.text('Medical Records Report', 14, 22)
      
      // Add export info
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
      doc.text(`Total Records: ${recordsToExport.length}`, 14, 35)
      
      // Add filter info
      let filterInfo = 'Filters: '
      if (exportFilters.value.clientId) {
        const client = clients.value.find(c => c.id === exportFilters.value.clientId)
        filterInfo += `Client: ${client?.firstName} ${client?.lastName}`
      }
      if (exportFilters.value.serviceCategory) {
        filterInfo += ` | Service: ${formatServiceCategory(exportFilters.value.serviceCategory)}`
      }
      if (exportFilters.value.fromDate || exportFilters.value.toDate) {
        filterInfo += ` | Date Range: ${exportFilters.value.fromDate || 'All'} to ${exportFilters.value.toDate || 'All'}`
      }
      
      doc.text(filterInfo, 14, 40)
      
      // Prepare table data
      const tableData = recordsToExport.map(record => [
        formatDate(record.date),
        getClientName(record.clientId),
        record.petName || 'N/A',
        formatServiceCategory(record.serviceCategory),
        record.doctor || 'N/A',
        record.status,
        record.services?.join(', ') || 'N/A'
      ])
      
      // Add table using autotable
      autoTable(doc, {
        head: [['Date', 'Client', 'Pet', 'Service', 'Veterinarian', 'Status', 'Services']],
        body: tableData,
        startY: 50,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 114, 196] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      })
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const filename = `Medical_Records_${timestamp}.pdf`
      
      // Save the PDF
      doc.save(filename)
      
      console.log('PDF exported successfully with autotable:', filename)
      
    } catch (autotableError) {
      console.warn('Autotable failed, using simple table:', autotableError)
      
      // Fallback to simple table without autotable
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF('l', 'mm', 'a4') // Landscape orientation
      
      // Add title
      doc.setFontSize(20)
      doc.text('Medical Records Report', 14, 22)
      
      // Add export info
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
      doc.text(`Total Records: ${recordsToExport.length}`, 14, 35)
      
      // Add filter info
      let filterInfo = 'Filters: '
      if (exportFilters.value.clientId) {
        const client = clients.value.find(c => c.id === exportFilters.value.clientId)
        filterInfo += `Client: ${client?.firstName} ${client?.lastName}`
      }
      if (exportFilters.value.serviceCategory) {
        filterInfo += ` | Service: ${formatServiceCategory(exportFilters.value.serviceCategory)}`
      }
      if (exportFilters.value.fromDate || exportFilters.value.toDate) {
        filterInfo += ` | Date Range: ${exportFilters.value.fromDate || 'All'} to ${exportFilters.value.toDate || 'All'}`
      }
      
      doc.text(filterInfo, 14, 40)
      
      // Create simple table
      let yPosition = 60
      const pageWidth = doc.internal.pageSize.width
      const margin = 14
      const colWidth = (pageWidth - 2 * margin) / 7
      
      // Table headers
      doc.setFontSize(8)
      doc.setFont(undefined, 'bold')
      const headers = ['Date', 'Client', 'Pet', 'Service', 'Veterinarian', 'Status', 'Services']
      headers.forEach((header, index) => {
        doc.text(header, margin + index * colWidth, yPosition)
      })
      
      // Draw header line
      yPosition += 5
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 5
      
      // Table data
      doc.setFont(undefined, 'normal')
      recordsToExport.forEach((record, rowIndex) => {
        // Check if we need a new page
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        
        const rowData = [
          formatDate(record.date),
          getClientName(record.clientId),
          record.petName || 'N/A',
          formatServiceCategory(record.serviceCategory),
          record.doctor || 'N/A',
          record.status,
          record.services?.join(', ') || 'N/A'
        ]
        
        rowData.forEach((cell, colIndex) => {
          // Truncate long text
          const cellText = cell.length > 15 ? cell.substring(0, 15) + '...' : cell
          doc.text(cellText, margin + colIndex * colWidth, yPosition)
        })
        
        yPosition += 6
      })
      
      // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const filename = `Medical_Records_${timestamp}.pdf`
    
      // Save the PDF
      doc.save(filename)
    
      console.log('PDF exported successfully with simple table:', filename)
    }
    
  } catch (error) {
    console.error('Error exporting PDF:', error)
    
    // Check if jsPDF library is not installed
    if (error.message.includes('jspdf')) {
      alert('PDF export library not found. Please install jspdf package:\n\nnpm install jspdf jspdf-autotable')
    } else {
      alert('Failed to export PDF. Please try again.')
    }
  } finally {
    exporting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Fetch categories and services first, then clients
  await fetchCategoriesAndServices()
  await fetchClients()
})

// Watch for changes
watch(selectedClientId, (newClientId) => {
  if (newClientId) {
    // Update the search query to show the selected client's name
    const client = clients.value.find(c => c.id === newClientId)
    if (client) {
      clientSearchQuery.value = `${client.firstName} ${client.lastName}`
    }
  } else {
    // Clear the search query when no client is selected
    clientSearchQuery.value = ''
  }
})

// Watch for clients to be loaded, then fetch all records
watch(clients, (newClients) => {
  if (newClients.length > 0) {
    fetchMedicalRecords()
  }
}, { immediate: true })

// Watch for client search query changes to filter clients
watch(clientSearchQuery, () => {
  filterClients()
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
