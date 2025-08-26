<!-- components/common/VaccinationCard.vue -->
<template>
  <div class="vaccination-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header with Pet Info -->
    <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <SyringeIcon class="w-8 h-8" />
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ pet.name }}</h2>
            <p class="text-blue-100">{{ pet.breed }} • {{ pet.species }}</p>
            <p class="text-sm text-blue-100">ID: {{ pet.id }}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-blue-100">Generated on</div>
          <div class="text-lg font-semibold">{{ formatDate(new Date()) }}</div>
        </div>
      </div>
    </div>

    <!-- Vaccination Records -->
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShieldIcon class="w-6 h-6 text-green-600" />
          Vaccination Records
        </h3>
        <div class="flex gap-2">
          <button 
            @click="printCard"
            :disabled="isPrinting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PrinterIcon class="w-4 h-4" />
            {{ isPrinting ? 'Printing...' : 'Print Card' }}
          </button>
          <button 
            @click="exportPDF"
            :disabled="isExporting"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadIcon class="w-4 h-4" />
            {{ isExporting ? 'Exporting...' : 'Export PDF' }}
          </button>
          <button 
            v-if="isVet"
            @click="refreshVaccinations"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <RefreshCwIcon class="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <!-- Vaccination Status Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ activeVaccinations }}</div>
          <div class="text-sm text-green-700">Completed Vaccines</div>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalVaccinations }}</div>
          <div class="text-sm text-blue-700">Total Vaccinations</div>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-orange-600">{{ upcomingVaccinations }}</div>
          <div class="text-sm text-orange-700">Scheduled</div>
        </div>
      </div>

      <!-- Vaccination Timeline -->
      <div class="space-y-4">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Vaccination History</h4>
        
        <div v-if="vaccinationRecords.length === 0" class="text-center py-8 text-gray-500">
          <ShieldOffIcon class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg font-medium">No vaccination records found</p>
          <p class="text-sm">Vaccination records will appear here once they are added.</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="(record, index) in sortedVaccinationRecords" 
            :key="index"
            class="relative pl-8 border-l-2 border-gray-200 hover:border-blue-300 transition-colors"
            :class="getVaccinationStatusClass(record)"
          >
            <!-- Timeline Dot -->
            <div class="absolute left-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center -ml-2"
                 :class="getVaccinationDotClass(record)">
              <CheckIcon v-if="record.completed" class="w-2.5 h-2.5 text-white" />
              <ClockIcon v-else class="w-2.5 h-2.5 text-white" />
            </div>

            <!-- Vaccination Record -->
            <div class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h5 class="font-semibold text-gray-900 text-lg">{{ record.name }}</h5>
                  <p class="text-sm text-gray-600">{{ record.description || 'Vaccination administered' }}</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">{{ formatDate(record.date) }}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <span :class="getStatusBadgeClass(record)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusText(record) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Additional Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div v-if="record.administeredBy" class="flex items-center gap-2">
                  <span class="font-medium text-gray-700">Administered by:</span>
                  <span class="text-gray-600">{{ record.administeredBy }}</span>
                </div>
                <div v-if="record.location" class="flex items-center gap-2">
                  <span class="font-medium text-gray-700">Location:</span>
                  <span class="text-gray-600">{{ record.location }}</span>
                </div>
                <div v-if="record.isAutoGenerated" class="flex items-center gap-2">
                  <span class="font-medium text-gray-700">Source:</span>
                  <span class="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-full">
                    Auto-generated from appointment
                  </span>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="record.notes" class="mt-3 pt-3 border-t border-gray-200">
                <div class="text-sm">
                  <span class="font-medium text-gray-700">Notes:</span>
                  <span class="text-gray-600 ml-2">{{ record.notes }}</span>
                </div>
              </div>

              <!-- Action Buttons for Vets -->
              <div v-if="isVet && !record.completed" class="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                <button 
                  @click="markAsCompleted(record)"
                  class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
                <button 
                  @click="editVaccination(record)"
                  class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>This vaccination card is generated for {{ pet.name }} ({{ pet.species }})</p>
        <p class="mt-1">Keep this record for your pet's health documentation</p>
      </div>
    </div>

    <!-- Print Preview Modal -->
    <div v-if="showPrintPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Print Preview - Vaccination Card</h3>
          <div class="flex gap-2">
            <button 
              @click="confirmPrint"
              :disabled="isPrinting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PrinterIcon class="w-4 h-4" />
              {{ isPrinting ? 'Printing...' : 'Print Now' }}
            </button>
            <button 
              @click="closePrintPreview"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <!-- Preview Content -->
        <div class="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div class="print-preview-content">
            <!-- Professional ID Card Style Vaccination Card -->
            <div class="vaccination-id-card bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg max-w-md mx-auto">
              <!-- Card Header with Logo and Title -->
              <div class="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 text-center">
                <div class="flex items-center justify-center gap-3 mb-2">
                  <SyringeIcon class="w-8 h-8 text-white" />
                  <h1 class="text-xl font-bold">VACCINATION CARD</h1>
                </div>
                <p class="text-sm text-blue-100">Official Veterinary Record</p>
              </div>

              <!-- Pet Information Section -->
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
                
                <!-- Pet Details Grid -->
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

              <!-- Vaccination Summary -->
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
import { computed, ref } from 'vue'
import { 
  SyringeIcon, 
  ShieldIcon, 
  ShieldOffIcon, 
  CheckIcon, 
  ClockIcon, 
  CalendarIcon,
  PrinterIcon,
  DownloadIcon,
  RefreshCwIcon
} from 'lucide-vue-next'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  pet: {
    type: Object,
    required: true
  },
  vaccinationRecords: {
    type: Array,
    default: () => []
  },
  isVet: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['mark-completed', 'edit-vaccination'])

// Loading states
const isPrinting = ref(false)
const isExporting = ref(false)

// Preview state
const showPrintPreview = ref(false)

// Computed properties
const sortedVaccinationRecords = computed(() => {
  return [...props.vaccinationRecords].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalVaccinations = computed(() => props.vaccinationRecords.length)

const activeVaccinations = computed(() => {
  return props.vaccinationRecords.filter(record => record.completed).length
})

const upcomingVaccinations = computed(() => {
  return props.vaccinationRecords.filter(record => !record.completed).length
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

const getVaccinationStatusClass = (record) => {
  if (record.completed) return 'border-green-300'
  return 'border-gray-300'
}

const getVaccinationDotClass = (record) => {
  if (record.completed) return 'bg-green-500'
  return 'bg-blue-500'
}

const getStatusBadgeClass = (record) => {
  if (record.completed) return 'bg-green-100 text-green-800'
  return 'bg-blue-100 text-blue-800'
}

const getStatusText = (record) => {
  if (record.completed) return 'Completed'
  return 'Scheduled'
}

// Action functions
const markAsCompleted = (record) => {
  emit('mark-completed', record)
}

const editVaccination = (record) => {
  emit('edit-vaccination', record)
}

const printCard = async () => {
  // Show preview first
  showPrintPreview.value = true
}

const confirmPrint = async () => {
  if (isPrinting.value) return
  
  try {
    isPrinting.value = true
    showPrintPreview.value = false
    
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (props.pet && props.vaccinationRecords) {
      // Try multiple printing approaches
      let printSuccess = false
      
      // Approach 1: Try to print directly from current page
      try {
        console.log('Attempting direct print...')
        const printContent = document.querySelector('.print-preview-content')
        if (printContent) {
          // Create a temporary print-friendly version
          const originalDisplay = printContent.style.display
          printContent.style.display = 'block'
          
          // Add print styles temporarily
          const printStyle = document.createElement('style')
          printStyle.textContent = `
            @media print {
              /* Hide everything except the preview content */
              body * { 
                visibility: hidden !important; 
                display: none !important; 
              }
              
              /* Show only the preview content */
              .print-preview-content { 
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
                border: none !important; 
                border-radius: 0 !important; 
                overflow: visible !important; 
                z-index: 9999 !important; 
              }
              
              .print-preview-content * { 
                visibility: visible !important; 
                display: revert !important; 
              }
              
              /* Ensure proper page layout */
              @page { 
                margin: 1cm; 
                size: A4; 
              }
              
              /* Hide loading overlay and other UI elements */
              .fixed, .bg-black, .bg-opacity-50, .z-50 { 
                display: none !important; 
                visibility: hidden !important; 
              }
              
              /* Specifically hide the loading overlay */
              .fixed.inset-0.bg-black.bg-opacity-50.flex.items-center.justify-center.z-50 {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
              }
            }
          `
          document.head.appendChild(printStyle)
          
          // Small delay to ensure styles are applied
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Try to print
          window.print()
          
          // Cleanup after a delay to ensure print dialog is shown
          setTimeout(() => {
            document.head.removeChild(printStyle)
            printContent.style.display = originalDisplay
          }, 1000)
          printSuccess = true
        }
      } catch (error) {
        console.log('Direct print failed:', error)
      }
      
      // Approach 2: If direct print fails, try new window method
      if (!printSuccess) {
        try {
          console.log('Attempting new window print...')
          
          // Create a new window for printing
          const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
          
          if (!printWindow) {
            throw new Error('Pop-up blocked')
          }
          
          // Create the print HTML
          const printHTML = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Vaccination Card - ${props.pet.name}</title>
                <meta charset="utf-8">
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    margin: 0; 
                    padding: 20px; 
                    background: white;
                  }
                  .vaccination-id-card { 
                    max-width: 400px; 
                    margin: 0 auto; 
                    border: 2px solid #000; 
                    border-radius: 12px; 
                    overflow: hidden; 
                    background: white;
                  }
                  .card-header { 
                    background: linear-gradient(135deg, #2563eb, #7c3aed); 
                    color: white; 
                    padding: 20px; 
                    text-align: center;
                  }
                  .card-header h1 { 
                    font-size: 20px; 
                    margin: 0 0 8px 0; 
                    font-weight: bold;
                  }
                  .card-header p { 
                    font-size: 12px; 
                    margin: 0; 
                    opacity: 0.9;
                  }
                  .pet-info { 
                    padding: 20px; 
                    border-bottom: 1px solid #e5e7eb;
                  }
                  .pet-avatar { 
                    width: 64px; 
                    height: 64px; 
                    border-radius: 50%; 
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 24px; 
                    margin-right: 16px;
                  }
                  .pet-details { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 12px; 
                    margin-top: 16px;
                  }
                  .detail-box { 
                    background: #f9fafb; 
                    padding: 8px; 
                    border-radius: 6px; 
                    font-size: 12px;
                  }
                  .detail-box strong { 
                    color: #374151; 
                    margin-right: 4px;
                  }
                  .detail-box span { 
                    color: #6b7280;
                  }
                  .vaccination-status { 
                    padding: 20px; 
                    border-bottom: 1px solid #e5e7eb;
                  }
                  .status-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr 1fr; 
                    gap: 8px;
                  }
                  .status-box { 
                    text-align: center; 
                    padding: 8px; 
                    background: #f9fafb; 
                    border: 1px solid #d1d5db; 
                    border-radius: 6px;
                  }
                  .status-box .number { 
                    font-size: 18px; 
                    font-weight: bold; 
                    color: #1f2937;
                  }
                  .status-box .label { 
                    font-size: 10px; 
                    color: #6b7280;
                  }
                  .recent-vaccinations { 
                    padding: 20px;
                  }
                  .vaccination-item { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    padding: 8px; 
                    background: #f9fafb; 
                    border-radius: 6px; 
                    margin-bottom: 8px; 
                    border-left: 4px solid #3b82f6;
                  }
                  .vaccination-item.completed { 
                    border-left-color: #10b981;
                  }
                  .vaccination-item .name { 
                    font-weight: 500; 
                    font-size: 12px; 
                    color: #1f2937;
                  }
                  .vaccination-item .date { 
                    font-size: 10px; 
                    color: #6b7280;
                  }
                  .status-badge { 
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 10px; 
                    font-weight: 500;
                  }
                  .status-badge.completed { 
                    background: #d1fae5; 
                    color: #065f46;
                  }
                  .status-badge.scheduled { 
                    background: #dbeafe; 
                    color: #1e40af;
                  }
                  .card-footer { 
                    background: #f9fafb; 
                    padding: 16px; 
                    text-align: center; 
                    border-top: 1px solid #e5e7eb;
                  }
                  .card-footer p { 
                    margin: 0; 
                    font-size: 10px; 
                    color: #6b7280;
                  }
                  @media print {
                    @page { margin: 1cm; size: A4; }
                    body { background: white; }
                    .vaccination-id-card { box-shadow: none; }
                  }
                </style>
              </head>
              <body>
                <div class="vaccination-id-card">
                  <div class="card-header">
                    <h1>VACCINATION CARD</h1>
                    <p>Official Veterinary Record</p>
                  </div>
                  
                  <div class="pet-info">
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                      <div class="pet-avatar">
                        ${props.pet.name ? props.pet.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <h2 style="font-size: 20px; margin: 0; color: #1f2937; font-weight: bold;">${props.pet.name || 'Unknown Pet'}</h2>
                        <p style="font-size: 12px; margin: 4px 0 0 0; color: #6b7280;">${props.pet.breed || 'N/A'} • ${props.pet.species || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div class="pet-details">
                      <div class="detail-box">
                        <strong>Age:</strong><span>${(props.pet.ageYears || 0)}y ${(props.pet.ageMonths || 0)}m</span>
                      </div>
                      <div class="detail-box">
                        <strong>Gender:</strong><span>${props.pet.gender || 'N/A'}</span>
                      </div>
                      <div class="detail-box">
                        <strong>Weight:</strong><span>${props.pet.weight || 'N/A'} kg</span>
                      </div>
                      <div class="detail-box">
                        <strong>Owner:</strong><span>${props.pet.ownerName || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="vaccination-status">
                    <h3 style="font-size: 16px; margin: 0 0 12px 0; color: #1f2937; font-weight: 600;">Vaccination Status</h3>
                    <div class="status-grid">
                      <div class="status-box">
                        <div class="number">${props.vaccinationRecords.filter(record => record.completed).length}</div>
                        <div class="label">Completed</div>
                      </div>
                      <div class="status-box">
                        <div class="number">${props.vaccinationRecords.length}</div>
                        <div class="label">Total</div>
                      </div>
                      <div class="status-box">
                        <div class="number">${props.vaccinationRecords.filter(record => !record.completed).length}</div>
                        <div class="label">Scheduled</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="recent-vaccinations">
                    <h4 style="font-size: 14px; margin: 0 0 12px 0; color: #1f2937; font-weight: 600;">Recent Vaccinations</h4>
                    
                    ${props.vaccinationRecords.length === 0 ? `
                      <div style="text-align: center; padding: 16px; color: #6b7280;">
                        <p style="margin: 0; font-size: 12px;">No vaccination records found</p>
                      </div>
                    ` : props.vaccinationRecords
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 3)
                      .map(record => {
                        const statusText = record.completed ? 'Completed' : 'Scheduled'
                        const statusClass = record.completed ? 'completed' : ''
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
                        
                        return `
                          <div class="vaccination-item ${statusClass}">
                            <div>
                              <div class="name">${record.name || 'Unknown Vaccine'}</div>
                              <div class="date">${formatDate(record.date)}</div>
                            </div>
                            <span class="status-badge ${statusText.toLowerCase()}">${statusText}</span>
                          </div>
                        `
                      }).join('')}
                    
                    ${props.vaccinationRecords.length > 3 ? `
                      <div style="text-align: center; padding: 8px;">
                        <span style="font-size: 10px; color: #6b7280;">+${props.vaccinationRecords.length - 3} more records</span>
                      </div>
                    ` : ''}
                  </div>
                  
                  <div class="card-footer">
                    <p>Generated on ${(() => {
                      const now = new Date()
                      return now.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    })()}</p>
                    <p style="margin-top: 4px;">Keep this card for your pet's health documentation</p>
                  </div>
                </div>
              </body>
            </html>
          `
          
          // Write the HTML to the print window
          printWindow.document.write(printHTML)
          printWindow.document.close()
          
          // Set a timeout to print if onload doesn't work
          setTimeout(() => {
            if (printWindow && !printWindow.closed) {
              console.log('Timeout reached, attempting to print...')
              printWindow.print()
              setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                  printWindow.close()
                }
              }, 1000)
              printSuccess = true
            }
          }, 2000)
          
        } catch (error) {
          console.log('New window print failed:', error)
          throw error
        }
      }
      
      if (!printSuccess) {
        throw new Error('All printing methods failed')
      }
      
    } else {
      throw new Error('Missing pet or vaccination data')
    }
  } catch (error) {
    console.error('Error printing vaccination card:', error)
    
    if (error.message.includes('Pop-up blocked')) {
      alert('Pop-up was blocked. Please allow pop-ups for this site and try again.')
    } else if (error.message.includes('Missing')) {
      alert('Unable to generate vaccination card. Please try again.')
    } else {
      alert('An error occurred while printing. Please try again.')
    }
  } finally {
    isPrinting.value = false
  }
}

const closePrintPreview = () => {
  showPrintPreview.value = false
}

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

const refreshVaccinations = () => {
  // This function would typically trigger a re-fetch or re-generation of vaccination records
  // For now, it will just re-render the component to show the latest data
  console.log('Refreshing vaccination records...')
  // Example: emit an event to the parent component to trigger a refresh
  // emit('refresh-vaccinations', props.pet.id) 
}
</script>

<style scoped>
/* Hover effects */
.vaccination-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

/* Timeline animations */
.border-l-2 {
  transition: border-color 0.3s ease;
}

/* Status badge animations */
.px-2.py-1 {
  transition: all 0.2s ease;
}

.px-2.py-1:hover {
  transform: scale(1.05);
}

/* Print preview styles */
.print-preview-content {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.print-preview-content .vaccination-card {
  box-shadow: none;
  border: 1px solid #e5e7eb;
}

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
</style>
