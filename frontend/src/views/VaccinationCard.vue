<!-- VaccinationCard.vue - Dedicated page for vaccination card viewing and printing -->
<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Vaccination Card</h1>
        <p class="text-gray-600">Professional vaccination record for your pet</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner text="Loading vaccination data..." />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 mb-4">
          <ShieldOffIcon class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to Load Vaccination Card</h3>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button 
          @click="loadVaccinationData"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Vaccination Card Content -->
      <div v-else-if="pet && vaccinationRecords" class="space-y-6">
        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 mb-6">
          <button 
            @click="printCard"
            :disabled="isPrinting"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PrinterIcon class="w-5 h-5" />
            {{ isPrinting ? 'Printing...' : 'Print Card' }}
          </button>
          <button 
            @click="exportPDF"
            :disabled="isExporting"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon class="w-5 h-5" />
            {{ isExporting ? 'Exporting...' : 'Export PDF' }}
          </button>
          <button 
            @click="goBack"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon class="w-5 h-5" />
            Go Back
          </button>
        </div>

        <!-- The Vaccination Card -->
        <div class="vaccination-card-container">
          <div class="vaccination-id-card bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 text-center">
              <div class="flex items-center justify-center gap-3 mb-2">
                <SyringeIcon class="w-8 h-8 text-white" />
                <h1 class="text-xl font-bold">VACCINATION CARD</h1>
              </div>
              <p class="text-sm text-blue-100">Official Veterinary Record</p>
            </div>

            <!-- Pet Information -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center gap-4 mb-3">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {{ pet.name ? pet.name.charAt(0).toUpperCase() : 'P' }}
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-bold text-gray-900">{{ pet.name }}</h2>
                  <p class="text-sm text-gray-600">{{ pet.breed }} • {{ pet.species }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="bg-gray-50 p-2 rounded">
                  <span class="font-medium text-gray-700">Age:</span>
                  <span class="text-gray-600 ml-1">{{ (pet.ageYears || 0) }}y {{ (pet.ageMonths || 0) }}m</span>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                  <span class="font-medium text-gray-700">Gender:</span>
                  <span class="text-gray-600 ml-1">{{ pet.gender || 'N/A' }}</span>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                  <span class="font-medium text-gray-700">Weight:</span>
                  <span class="text-gray-600 ml-1">{{ pet.weight || 'N/A' }} kg</span>
                </div>
                <div class="bg-gray-50 p-2 rounded">
                  <span class="font-medium text-gray-700">Owner:</span>
                  <span class="text-gray-600 ml-1">{{ pet.ownerName || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Vaccination Status -->
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldIcon class="w-5 h-5 text-green-600" />
                Vaccination Status
              </h3>
              <div class="grid grid-cols-3 gap-2">
                <div class="text-center p-2 bg-green-50 rounded border border-green-200">
                  <div class="text-lg font-bold text-green-600">{{ activeVaccinations }}</div>
                  <div class="text-xs text-green-700">Completed</div>
                </div>
                <div class="text-center p-2 bg-blue-50 rounded border border-blue-200">
                  <div class="text-lg font-bold text-blue-600">{{ totalVaccinations }}</div>
                  <div class="text-xs text-blue-700">Total</div>
                </div>
                <div class="text-center p-2 bg-orange-50 rounded border border-orange-200">
                  <div class="text-lg font-bold text-orange-600">{{ upcomingVaccinations }}</div>
                  <div class="text-xs text-orange-700">Scheduled</div>
                </div>
              </div>
            </div>

            <!-- Recent Vaccinations -->
            <div class="p-4">
              <h4 class="text-md font-semibold text-gray-900 mb-3">Recent Vaccinations</h4>
              
              <div v-if="vaccinationRecords.length === 0" class="text-center py-4 text-gray-500">
                <ShieldOffIcon class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p class="text-sm">No vaccination records found</p>
              </div>

              <div v-else class="space-y-2">
                <div 
                  v-for="(record, index) in sortedVaccinationRecords.slice(0, 3)" 
                  :key="index"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded border-l-4"
                  :class="record.completed ? 'border-l-green-500' : 'border-l-blue-500'"
                >
                  <div class="flex-1">
                    <div class="font-medium text-sm text-gray-900">{{ record.name }}</div>
                    <div class="text-xs text-gray-600">{{ formatDate(record.date) }}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span :class="getStatusBadgeClass(record)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusText(record) }}
                    </span>
                    <div v-if="record.isAutoGenerated" class="w-2 h-2 bg-blue-500 rounded-full" title="Auto-generated"></div>
                  </div>
                </div>
                
                <div v-if="vaccinationRecords.length > 3" class="text-center pt-2">
                  <span class="text-xs text-gray-500">+{{ vaccinationRecords.length - 3 }} more records</span>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="bg-gray-50 p-3 text-center border-t border-gray-200">
              <div class="text-xs text-gray-600">
                <p>Generated on {{ formatDate(new Date()) }}</p>
                <p class="mt-1">Keep this card for your pet's health documentation</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Print Instructions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">Printing Instructions</h3>
          <p class="text-blue-700 text-sm">
            Click "Print Card" to open the print dialog. The card will be formatted to fit on a single page.
            For best results, use A4 or Letter size paper and ensure "Background graphics" is enabled in your print settings.
          </p>
        </div>
      </div>
    </div>

    <!-- Loading Overlay for Print/Export -->
    <div v-if="isPrinting || isExporting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 flex flex-col items-center">
        <LoadingSpinner :text="isPrinting ? 'Creating vaccination card...' : 'Preparing PDF export...'" />
        <p class="mt-4 text-gray-600">{{ isPrinting ? 'Preparing print dialog...' : 'Generating PDF...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  SyringeIcon, 
  ShieldIcon, 
  ShieldOffIcon, 
  CheckIcon, 
  ClockIcon,
  PrinterIcon,
  DownloadIcon,
  ArrowLeftIcon
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

// Reactive state
const loading = ref(true)
const error = ref(null)
const pet = ref(null)
const vaccinationRecords = ref([])
const isPrinting = ref(false)
const isExporting = ref(false)

// Computed properties
const sortedVaccinationRecords = computed(() => {
  return [...vaccinationRecords.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalVaccinations = computed(() => vaccinationRecords.value.length)
const activeVaccinations = computed(() => {
  return vaccinationRecords.value.filter(record => record.completed).length
})
const upcomingVaccinations = computed(() => {
  return vaccinationRecords.value.filter(record => !record.completed).length
})

// Helper functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusBadgeClass = (record) => {
  if (record.completed) return 'bg-green-100 text-green-800'
  return 'bg-blue-100 text-blue-800'
}

const getStatusText = (record) => {
  if (record.completed) return 'Completed'
  return 'Scheduled'
}

// Navigation
const goBack = () => {
  router.go(-1)
}

// Load vaccination data
const loadVaccinationData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Get data from route params or query
    const petId = route.params.petId || route.query.petId
    const userId = route.params.userId || route.query.userId
    
    if (!petId || !userId) {
      throw new Error('Missing pet or user information')
    }

    // For now, use mock data - replace with actual API calls
    // Mock pet data
    pet.value = {
      name: 'Sample Pet',
      breed: 'Golden Retriever',
      species: 'Dog',
      ageYears: 3,
      ageMonths: 6,
      gender: 'Male',
      weight: '25',
      ownerName: 'John Doe'
    }

    // Mock vaccination records
    vaccinationRecords.value = [
      {
        name: 'Rabies Vaccine',
        date: new Date('2024-01-15'),
        completed: true,
        isAutoGenerated: true
      },
      {
        name: 'DHPP Vaccine',
        date: new Date('2024-02-20'),
        completed: true,
        isAutoGenerated: true
      },
      {
        name: 'Bordetella Vaccine',
        date: new Date('2024-06-15'),
        completed: false,
        isAutoGenerated: false
      }
    ]

  } catch (err) {
    error.value = err.message || 'An error occurred while loading the vaccination card'
    console.error('Error loading vaccination data:', err)
  } finally {
    loading.value = false
  }
}

// Print functionality
const printCard = async () => {
  if (isPrinting.value) return
  
  try {
    isPrinting.value = true
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Create print styles
    const printStyle = document.createElement('style')
    printStyle.textContent = `
      @media print {
        body * { 
          visibility: hidden !important; 
          display: none !important; 
        }
        
        .vaccination-id-card { 
          visibility: visible !important; 
          display: block !important; 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 100% !important; 
          height: auto !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          background: white !important; 
          box-shadow: none !important; 
          border: 2px solid #000 !important; 
          border-radius: 0 !important; 
          overflow: visible !important; 
          z-index: 9999 !important; 
        }
        
        .vaccination-id-card * { 
          visibility: visible !important; 
          display: revert !important; 
        }
        
        @page { 
          margin: 1cm; 
          size: A4; 
        }
      }
    `
    document.head.appendChild(printStyle)
    
    // Small delay to ensure styles are applied
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Print
    window.print()
    
    // Cleanup after a delay
    setTimeout(() => {
      document.head.removeChild(printStyle)
    }, 1000)
    
  } catch (error) {
    console.error('Error printing vaccination card:', error)
    alert('An error occurred while printing. Please try again.')
  } finally {
    isPrinting.value = false
  }
}

// Export PDF (using print for now)
const exportPDF = async () => {
  if (isExporting.value) return
  
  try {
    isExporting.value = true
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For now, use the same print functionality
    // In the future, this could integrate with jsPDF or similar library
    await printCard()
    
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('An error occurred while exporting. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadVaccinationData()
})
</script>

<style scoped>
/* ID Card Style Vaccination Card */
.vaccination-id-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.vaccination-id-card .bg-gradient-to-r {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.vaccination-id-card .w-16.h-16 {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.vaccination-id-card .grid.grid-cols-2 {
  gap: 12px;
}

.vaccination-id-card .bg-gray-50 {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.vaccination-id-card .border-l-4 {
  border-left-width: 4px;
}

.vaccination-id-card .border-l-green-500 {
  border-left-color: #10b981;
}

.vaccination-id-card .border-l-blue-500 {
  border-left-color: #3b82f6;
}

/* Print container */
.vaccination-card-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
