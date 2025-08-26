<!-- views/vet/VaccinationCardPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50 vaccination-card-page">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <button 
              @click="$router.go(-1)"
              class="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-xl font-semibold text-gray-900">Vaccination Card</h1>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              @click="printCard"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print Card
            </button>
            
            <button 
              @click="downloadPDF"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading vaccination card...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Card</h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button 
          @click="retryLoad"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Vaccination Card Content -->
    <div v-else-if="pet && vaccinationRecords.length > 0" class="max-w-4xl mx-auto p-6">
      <!-- Print-friendly container -->
      <div id="vaccination-card" class="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none print:rounded-none">
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 print:bg-blue-600">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold print:text-2xl">Vaccination Card</h1>
              <p class="text-blue-100 mt-1">Official Pet Health Record</p>
            </div>
            <div class="text-right print:hidden">
              <div class="text-sm text-blue-100">Generated on</div>
              <div class="font-medium">{{ formatDate(new Date()) }}</div>
            </div>
          </div>
        </div>

        <!-- Pet Information -->
        <div class="p-6 border-b border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex items-center gap-4">
              <img 
                :src="pet.photoURL || defaultPetPhotoURL" 
                :alt="pet.name"
                class="w-20 h-20 rounded-full object-cover border-4 border-gray-200 print:w-16 print:h-16"
              >
              <div>
                <h2 class="text-2xl font-bold text-gray-900 print:text-xl">{{ pet.name }}</h2>
                <p class="text-gray-600">{{ pet.species }} • {{ pet.breed }}</p>
                <p class="text-sm text-gray-500">{{ pet.ageYears }}y {{ pet.ageMonths }}m • {{ pet.gender }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-500">Owner:</span>
                <span class="font-medium">{{ ownerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Contact:</span>
                <span class="font-medium">{{ ownerContact }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Address:</span>
                <span class="font-medium">{{ ownerAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vaccination Records -->
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4 print:text-lg">Vaccination History</h3>
          
          <div class="space-y-4">
            <div 
              v-for="(record, index) in vaccinationRecords" 
              :key="record.id || index"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow print:shadow-none print:border-gray-300"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h4 class="font-medium text-gray-900">{{ record.vaccineName || 'Vaccination' }}</h4>
                  <p class="text-sm text-gray-500">{{ record.vaccineType || 'Standard vaccine' }}</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">Date Administered</div>
                  <div class="font-medium text-gray-900">{{ formatDate(record.date) }}</div>
                </div>
              </div>
              
                             <div class="text-sm">
                 <div>
                   <span class="text-gray-500">Processing Time:</span>
                   <span class="ml-2 font-medium">{{ record.processingTime || 'N/A' }}</span>
                 </div>
               </div>
              
              <div v-if="record.notes" class="mt-3 pt-3 border-t border-gray-100">
                <span class="text-gray-500">Notes:</span>
                <span class="ml-2 text-gray-900">{{ record.notes }}</span>
              </div>
              
              <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500">Administered by:</span>
                  <span class="font-medium">{{ record.administeredBy || 'Veterinarian' }}</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-gray-500">Location:</span>
                  <span class="font-medium">{{ record.location || 'Veterinary Clinic' }}</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-gray-500">Appointment ID:</span>
                  <span class="font-medium text-sm text-gray-600">{{ record.appointmentId || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

                 
      </div>
    </div>

    <!-- No Vaccination Records -->
    <div v-else-if="pet && vaccinationRecords.length === 0" class="max-w-4xl mx-auto p-6">
      <div class="text-center py-20">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
          <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Vaccination Records</h3>
        <p class="text-gray-500 mb-6">{{ pet.name }} doesn't have any vaccination records yet.</p>
        <button 
          @click="$router.go(-1)"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@shared/firebase'

// Route and router
const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const error = ref(null)
const pet = ref(null)
const owner = ref(null)
const vaccinationRecords = ref([])

// Default pet photo
const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E'

// Clinic information
const clinicName = 'ProVet Veterinary Clinic'
const clinicPhone = '+1 (555) 123-4567'

// Computed properties
const ownerName = computed(() => {
  if (!owner.value) return 'N/A'
  return `${owner.value.firstName || ''} ${owner.value.lastName || ''}`.trim() || 'N/A'
})

const ownerContact = computed(() => {
  if (!owner.value) return 'N/A'
  return owner.value.phone || owner.value.email || 'N/A'
})

const ownerAddress = computed(() => {
  if (!owner.value) return 'N/A'
  return owner.value.address || 'N/A'
})

// Methods
async function loadPetData() {
  try {
    loading.value = true
    error.value = null
    
    const petId = route.params.petId
    if (!petId) {
      throw new Error('Pet ID is required')
    }
    
    // Fetch pet data
    const petDoc = await getDoc(doc(db, 'pets', petId))
    if (!petDoc.exists()) {
      throw new Error('Pet not found')
    }
    
    pet.value = {
      id: petDoc.id,
      ...petDoc.data()
    }
    
    // Fetch owner data
    if (pet.value.ownerId) {
      const ownerDoc = await getDoc(doc(db, 'users', pet.value.ownerId))
      if (ownerDoc.exists()) {
        owner.value = ownerDoc.data()
      }
    }
    
    // Load vaccination records
    await loadVaccinationRecords()
    
  } catch (err) {
    console.error('Error loading pet data:', err)
    error.value = err.message || 'Failed to load pet data'
  } finally {
    loading.value = false
  }
}

async function loadVaccinationRecords() {
  try {
    const records = []
    
    // Fetch appointments for this pet that have vaccination services
    const appointmentsRef = collection(db, 'appointments')
    const appointmentsQuery = query(
      appointmentsRef,
      where('petIds', 'array-contains', pet.value.id),
      where('status', '==', 'completed')
    )
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery)
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data()
      
      // Check if this appointment has vaccination services
      if (appointmentData.services && appointmentData.services.length > 0) {
        // Fetch service details to check if they are vaccinations
        for (const serviceId of appointmentData.services) {
          try {
            const serviceDoc = await getDoc(doc(db, 'services', serviceId))
            if (serviceDoc.exists()) {
              const serviceData = serviceDoc.data()
              
              // Check if this service is a vaccination
              if (serviceData.isVaccination === true) {
                                 // Create vaccination record from appointment data
                 const vaccinationRecord = {
                   id: `${appointmentDoc.id}-${serviceId}`,
                   vaccineName: serviceData.name || 'Vaccination',
                   vaccineType: serviceData.classification || 'Standard Vaccine',
                   date: appointmentData.date?.toDate?.() || new Date(appointmentData.date),
                   notes: appointmentData.completionData?.services?.find(s => s.name === serviceData.name)?.notes || 
                          appointmentData.completionData?.generalNotes?.treatmentSummary || 
                          'Vaccination completed successfully',
                   administeredBy: appointmentData.doctorName || 'Veterinarian',
                   location: appointmentData.location || 'ProVet Clinic',
                   appointmentId: appointmentDoc.id,
                   serviceId: serviceId,
                   processingTime: serviceData.processingTime || 'N/A'
                 }
                
                records.push(vaccinationRecord)
              }
            }
          } catch (serviceError) {
            console.error(`Error fetching service ${serviceId}:`, serviceError)
          }
        }
      }
    }
    
    // Sort vaccinations by date (newest first)
    vaccinationRecords.value = records.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    console.log('Loaded vaccination records:', vaccinationRecords.value)
    
  } catch (err) {
    console.error('Error loading vaccination records:', err)
    vaccinationRecords.value = []
  }
}

function formatDate(date) {
  if (!date) return 'N/A'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function printCard() {
  window.print()
}

function downloadPDF() {
  // This would integrate with a PDF generation library like jsPDF or html2pdf
  // For now, we'll just trigger the print dialog
  window.print()
}

function retryLoad() {
  loadPetData()
}

// Lifecycle
onMounted(() => {
  loadPetData()
})
</script>

<style scoped>
/* Print styles */
@media print {
  @page {
    margin: 0.5in;
    size: A4;
  }
  
  /* Global print styles to hide layout elements */
  /* Use a more aggressive approach to hide all layout elements */
  /* Hide the entire layout wrapper and all its children */
  .min-h-screen.bg-gray-100.relative,
  .min-h-screen.bg-gray-100.relative * {
    display: none !important;
  }
  
  /* Show only the vaccination card page content */
  .vaccination-card-page {
    display: block !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    z-index: 9999 !important;
  }
  
  /* Reset body and html for print */
  body, html {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    overflow: visible !important;
  }
  
  /* Hide all elements except the vaccination card page */
  .vaccination-card-page * {
    visibility: hidden;
  }
  
  /* Show only the vaccination card content */
  #vaccination-card,
  #vaccination-card * {
    visibility: visible !important;
  }
  
  /* Ensure the card takes full page width */
  #vaccination-card {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background: white !important;
  }
  
  /* Hide the header with navigation buttons */
  .bg-white.shadow-sm.border-b {
    display: none !important;
  }
  
  /* Ensure proper spacing for print */
  .p-6 {
    padding: 0.5in !important;
  }
  
  /* Hide any hover effects */
  .hover\\:shadow-md {
    box-shadow: none !important;
  }
  
  /* Ensure text colors are visible */
  body {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .print\\:hidden {
    display: none !important;
  }
  
  .print\\:shadow-none {
    box-shadow: none !important;
  }
  
  .print\\:rounded-none {
    border-radius: 0 !important;
  }
  
  .print\\:bg-blue-600 {
    background-color: #2563eb !important;
  }
  
  .print\\:bg-gray-100 {
    background-color: #f3f4f6 !important;
  }
  
  .print\\:border-gray-300 {
    border-color: #d1d5db !important;
  }
  
  .print\\:text-2xl {
    font-size: 1.5rem !important;
  }
  
  .print\\:text-lg {
    font-size: 1.125rem !important;
  }
  
  .print\\:w-16 {
    width: 4rem !important;
  }
  
  .print\\:h-16 {
    height: 4rem !important;
  }
}
</style>
