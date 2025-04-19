<template>
  <div class="bg-white shadow-lg rounded-lg p-4 mb-8">
  <div class="max-w-7xl mx-auto">
    <!-- Header with Search -->
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Medical Records</h1>
      <div class="flex items-center gap-4">
        <div class="relative">
          <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files..."
            class="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-64"
            v-model="searchQuery"
          >
        </div>
        <div class="relative">
          <button 
            @click="toggleFilter"
            :class="['p-2 rounded-lg flex items-center gap-2', isFilterActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100']"
          >
            <FilterIcon class="w-5 h-5" />
            <span class="text-sm">Filter</span>
          </button>

          <!-- Filter Panel -->
          <div v-if="isFilterActive" class="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <div class="flex justify-between items-center mb-4">
              <span class="text-sm font-medium text-gray-900">Filters</span>
              <button @click="clearFilters" class="text-sm text-blue-600 hover:text-blue-700">
                Clear all
              </button>
            </div>

            <!-- Document Types -->
            <div class="mb-6">
              <h3 class="text-xs font-medium text-gray-500 uppercase mb-3">Document Types</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.types.all"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">All documents</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.types.pdf"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">PDF Files</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.types.doc"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">DOC Files</span>
                </label>
              </div>
            </div>

            <!-- Time Period -->
            <div>
              <h3 class="text-xs font-medium text-gray-500 uppercase mb-3">Time Period</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.time.week"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">Last week</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.time.recent"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">Last 30 days</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.time.quarter"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">Last quarter</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="filters.time.year"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-700">Last year</span>
                </label>
              </div>
            </div>

            <!-- Apply Filters Button -->
            <button 
              @click="applyFilters"
              class="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
        <button 
          @click="toggleSelect"
          :class="['p-2 rounded-lg', isSelectActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100']"
        >
          <CheckSquareIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Selected Files Actions -->
    <div v-if="selectedFiles.length > 0" class="mb-4 flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
      <span class="text-gray-700">{{ selectedFiles.length }} file(s) selected</span>
      <div class="flex gap-2">
        <button @click="cancelSelection" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          Cancel
        </button>
        <button @click="deleteSelectedFiles" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Delete
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex gap-6">
      <!-- Files List -->
      <div class="flex-1">
        <!-- All Files Section -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
          <table class="w-full">
            <thead>
              <tr class="text-sm text-gray-500">
                <th v-if="isSelectActive" class="pb-4 font-medium text-left w-8"></th>
                <th class="pb-4 font-medium text-left">Name</th>
                <th class="pb-4 font-medium text-left">Date added</th>
                <th class="pb-4 font-medium text-left">Pet Name</th>
                <th class="pb-4 font-medium text-left">File size</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="file in filteredFiles" 
                :key="file.id"
                @click="selectFile(file)"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td v-if="isSelectActive" class="py-3">
                  <input 
                    type="checkbox" 
                    :checked="selectedFiles.includes(file)"
                    @click.stop="toggleFileSelection(file)"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                </td>
                <td class="py-3">
                  <div class="flex items-center gap-3">
                    <div :class="[
                      'w-8 h-8 rounded flex items-center justify-center',
                      file.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
                    ]">
                      <FileIcon class="w-4 h-4" :class="file.type === 'pdf' ? 'text-red-500' : 'text-blue-500'" />
                    </div>
                    <span class="text-gray-900">{{ file.name }}</span>
                  </div>
                </td>
                <td class="py-3 text-gray-500">{{ file.dateAdded }}</td>
                <td class="py-3 text-gray-500">{{ file.petName }}</td>
                <td class="py-3 text-gray-500">{{ file.size }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Recently Added Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Recently Added</h2>
            <button class="p-2 hover:bg-gray-100 rounded-full">
              <MoreVerticalIcon class="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <table class="w-full">
            <thead>
              <tr class="text-sm text-gray-500">
                <th v-if="isSelectActive" class="pb-4 font-medium text-left w-8"></th>
                <th class="pb-4 font-medium text-left">Name</th>
                <th class="pb-4 font-medium text-left">Date added</th>
                <th class="pb-4 font-medium text-left">Pet Name</th>
                <th class="pb-4 font-medium text-left">File size</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="file in recentFiles" 
                :key="file.id"
                @click="selectFile(file)"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td v-if="isSelectActive" class="py-3">
                  <input 
                    type="checkbox" 
                    :checked="selectedFiles.includes(file)"
                    @click.stop="toggleFileSelection(file)"
                    class="rounded text-blue-600 focus:ring-blue-500"
                  >
                </td>
                <td class="py-3">
                  <div class="flex items-center gap-3">
                    <div :class="[
                      'w-8 h-8 rounded flex items-center justify-center',
                      file.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
                    ]">
                      <FileIcon class="w-4 h-4" :class="file.type === 'pdf' ? 'text-red-500' : 'text-blue-500'" />
                    </div>
                    <span class="text-gray-900">{{ file.name }}</span>
                  </div>
                </td>
                <td class="py-3 text-gray-500">{{ file.dateAdded }}</td>
                <td class="py-3 text-gray-500">{{ file.petName }}</td>
                <td class="py-3 text-gray-500">{{ file.size }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- File Details Sidebar -->
      <div v-if="selectedFile" class="w-80 bg-white rounded-xl shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900">File Details</h2>
          <button @click="closeFileDetails" class="p-1 hover:bg-gray-100 rounded-full">
            <XIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <!-- File Icon -->
        <div class="flex justify-center mb-6">
          <div :class="[
            'w-32 h-32 rounded-xl flex items-center justify-center',
            selectedFile.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
          ]">
            <FileIcon class="w-16 h-16" :class="selectedFile.type === 'pdf' ? 'text-red-500' : 'text-blue-500'" />
          </div>
        </div>

        <!-- File Info -->
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-900">File name</h3>
            <p class="text-gray-500">{{ selectedFile.name }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900">Description</h3>
            <p class="text-gray-500">{{ selectedFile.description }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900">Size</h3>
            <p class="text-gray-500">{{ selectedFile.size }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900">Added</h3>
            <p class="text-gray-500">{{ selectedFile.dateAdded }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900">Pet Name</h3>
            <p class="text-gray-500">{{ selectedFile.petName }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-4 mt-8">
          <button class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <CopyIcon class="w-5 h-5 text-gray-600" />
            <span class="text-sm text-gray-600">Duplicate</span>
          </button>
          <button class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <SaveIcon class="w-5 h-5 text-gray-600" />
            <span class="text-sm text-gray-600">Save</span>
          </button>
          <button class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50">
            <Trash2Icon class="w-5 h-5 text-gray-600" />
            <span class="text-sm text-gray-600">Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
SearchIcon,
BellIcon,
FileIcon,
MoreVerticalIcon,
CopyIcon,
SaveIcon,
Trash2Icon,
FilterIcon,
CheckSquareIcon,
XIcon
} from 'lucide-vue-next'

const searchQuery = ref('')
const selectedFile = ref(null)
const isFilterActive = ref(false)
const isSelectActive = ref(false)
const selectedFiles = ref([])

// Sample data - only document types
const files = ref([
{
  id: 1,
  name: 'Medical Report 2024.pdf',
  type: 'pdf',
  dateAdded: '28',
  petName: 'Max',
  size: '40 MB',
  description: 'Annual medical examination report'
},
{
  id: 2,
  name: 'Lab Results.pdf',
  type: 'pdf',
  dateAdded: '2',
  petName: 'Bella',
  size: '16 MB',
  description: 'Complete blood work and analysis results'
},
{
  id: 3,
  name: 'Prescription.doc',
  type: 'doc',
  dateAdded: '4',
  petName: 'Charlie',
  size: '1.2 MB',
  description: 'Current medication prescription'
},
{
  id: 4,
  name: 'Treatment Plan.pdf',
  type: 'pdf',
  dateAdded: '12',
  petName: 'Luna',
  size: '8 MB',
  description: 'Detailed treatment plan and schedule'
},
{
  id: 5,
  name: 'Medical History.doc',
  type: 'doc',
  dateAdded: '12',
  petName: 'Rocky',
  size: '12 MB',
  description: 'Complete medical history documentation'
}
])

// Recent files (showing last 3)
const recentFiles = computed(() => files.value.slice(0, 3))

// Filter state
const filters = ref({
types: {
  all: true,
  pdf: false,
  doc: false
},
time: {
  week: false,
  recent: false,
  quarter: false,
  year: false
}
})

// Function to clear all filters
const clearFilters = () => {
filters.value = {
  types: {
    all: true,
    pdf: false,
    doc: false
  },
  time: {
    week: false,
    recent: false,
    quarter: false,
    year: false
  }
}
}

// Function to apply filters
const applyFilters = () => {
// Implementation of filter logic
isFilterActive.value = false
}

// Updated filteredFiles computed property
const filteredFiles = computed(() => {
let result = files.value

// Apply search filter
if (searchQuery.value) {
  result = result.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    file.petName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

// Apply document type filters
if (!filters.value.types.all) {
  if (filters.value.types.pdf) {
    result = result.filter(file => file.type === 'pdf')
  }
  if (filters.value.types.doc) {
    result = result.filter(file => file.type === 'doc')
  }
}

// Apply time filters
if (filters.value.time.week) {
  result = result.filter(file => {
    const days = parseInt(file.dateAdded)
    return days && days <= 7
  })
}
if (filters.value.time.recent) {
  result = result.filter(file => {
    const days = parseInt(file.dateAdded)
    return days && days <= 30
  })
}
if (filters.value.time.quarter) {
  result = result.filter(file => {
    const days = parseInt(file.dateAdded)
    return days && days <= 90
  })
}
if (filters.value.time.year) {
  result = result.filter(file => {
    const days = parseInt(file.dateAdded)
    return days && days <= 365
  })
}

return result
})

// Function to select a file
const selectFile = (file) => {
selectedFile.value = file
}

// Function to close file details
const closeFileDetails = () => {
selectedFile.value = null
}

// Function to toggle filter
const toggleFilter = () => {
isFilterActive.value = !isFilterActive.value
}

// Function to toggle select mode
const toggleSelect = () => {
isSelectActive.value = !isSelectActive.value
if (!isSelectActive.value) {
  selectedFiles.value = []
}
}

// Function to toggle file selection
const toggleFileSelection = (file) => {
const index = selectedFiles.value.indexOf(file)
if (index === -1) {
  selectedFiles.value.push(file)
} else {
  selectedFiles.value.splice(index, 1)
}
}

// Function to cancel selection
const cancelSelection = () => {
selectedFiles.value = []
isSelectActive.value = false
}

// Function to delete selected files
const deleteSelectedFiles = () => {
files.value = files.value.filter(file => !selectedFiles.value.includes(file))
selectedFiles.value = []
isSelectActive.value = false
}
</script>

<style scoped>
/* Add if you need any specific styles */
</style>