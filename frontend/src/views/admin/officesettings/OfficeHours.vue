<!-- views/admin/officesettings/OfficeHours.vue -->
<template>
    <div class="p-6 bg-white rounded-2xl">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Office Hours Management</h1>
        <p class="text-gray-500 mt-1">Configure when your veterinary office is open for appointments.</p>
      </div>
  
      <!-- Show loading spinner during initial data load -->
      <LoadingSpinner v-if="initialLoading" isOverlay text="Loading data..." />
    
      <!-- Only show content when data is loaded -->
      <div v-else>
        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <div class="flex space-x-8">
            <button 
              @click="switchTab('regular')"
              class="pb-4 px-1 font-medium text-sm"
              :class="activeTab === 'regular' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
            >
              Regular Hours
            </button>
            <button 
              @click="switchTab('holidays')"
              class="pb-4 px-1 font-medium text-sm"
              :class="activeTab === 'holidays' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
            >
              Holidays & Closures
            </button>
          </div>
        </div>
  
        <!-- Regular Hours Tab -->
        <div v-if="activeTab === 'regular'">
          <!-- Search and Add -->
          <div v-if="!showForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div class="w-full sm:w-auto">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search by day..."
                  class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  v-model="searchQuery"
                >
                <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div>
              <button 
                @click="openAddForm"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 w-full sm:w-auto justify-center"
              >
                <PlusCircle class="w-4 h-4" />
                Add Office Hours
              </button>
            </div>
          </div>
  
          <!-- Regular Hours Table -->
          <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-100">
                <tr class="border-b border-gray-200">
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Day</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Status</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Open Time</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Close Time</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Lunch Break</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Notes</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="hours in filteredOfficeHours" :key="hours.id">
                  <td class="py-4 px-6 text-sm font-medium text-gray-900">{{ hours.day }}</td>
                  <td class="py-4 px-6">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      hours.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]">
                      {{ hours.isOpen ? 'Open' : 'Closed' }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-900 hidden sm:table-cell">{{ formatTime(hours.openTime) }}</td>
                  <td class="py-4 px-6 text-sm text-gray-900 hidden sm:table-cell">{{ formatTime(hours.closeTime) }}</td>
                  <td class="py-4 px-6 text-sm text-gray-900 hidden md:table-cell">
                    {{ hours.lunchStart && hours.lunchEnd ? `${formatTime(hours.lunchStart)} - ${formatTime(hours.lunchEnd)}` : 'N/A' }}
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-900 hidden lg:table-cell">{{ hours.notes || 'N/A' }}</td>
                  <td class="py-4 px-6 text-sm">
                    <div class="flex items-center gap-2">
                      <button 
                        @click="editOfficeHours(hours)"
                        class="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit class="w-5 h-5" />
                      </button>
                      <button 
                        @click="openDeleteModal(hours)"
                        class="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="officeStore.getOfficeHours.length === 0">
                  <td colspan="7" class="py-8 text-center text-gray-500">
                    <Clock class="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No office hours configured yet.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Regular Hours Form -->
          <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold mb-4">{{ isEditing ? 'Edit Office Hours' : 'Add Office Hours' }}</h2>
            <form @submit.prevent="saveOfficeHours" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select 
                  v-model="formData.day" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  :disabled="isEditing"
                >
                  <option v-for="day in weekdays" :key="day" :value="day">{{ day }}</option>
                </select>
              </div>
              
              <div class="flex items-center">
                <input 
                  id="isOpen" 
                  type="checkbox" 
                  v-model="formData.isOpen" 
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="isOpen" class="ml-2 block text-sm text-gray-700">
                  Office is open on this day
                </label>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                  <input 
                    type="time" 
                    v-model="formData.openTime" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    :disabled="!formData.isOpen"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                  <input 
                    type="time" 
                    v-model="formData.closeTime" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    :disabled="!formData.isOpen"
                  >
                </div>
              </div>
              
              <div>
                <div class="flex items-center mb-2">
                  <input 
                    id="hasLunch" 
                    type="checkbox" 
                    v-model="formData.hasLunchBreak" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    :disabled="!formData.isOpen"
                  >
                  <label for="hasLunch" class="ml-2 block text-sm text-gray-700">
                    Include lunch break
                  </label>
                </div>
                
                <div v-if="formData.hasLunchBreak" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lunch Start</label>
                    <input 
                      type="time" 
                      v-model="formData.lunchStart" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lunch End</label>
                    <input 
                      type="time" 
                      v-model="formData.lunchEnd" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                  </div>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  v-model="formData.notes" 
                  rows="2" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="Any special instructions or notes"
                ></textarea>
              </div>
              
              <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <button
                  type="button"
                  @click="closeForm"
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2"
                  :disabled="officeStore.isLoading"
                >
                  {{ isEditing ? 'Save Changes' : 'Add Office Hours' }}
                </button>
              </div>
            </form>
          </div>
        </div>
  
        <!-- Holidays Tab -->
        <div v-if="activeTab === 'holidays'">
          <!-- Search and Add -->
          <div v-if="!showHolidayForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div class="w-full sm:w-auto">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search holidays..."
                  class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  v-model="holidaySearchQuery"
                >
                <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div>
              <button 
                @click="openAddHolidayForm"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 w-full sm:w-auto justify-center"
              >
                <PlusCircle class="w-4 h-4" />
                Add Holiday
              </button>
            </div>
          </div>
  
          <!-- Holidays Table -->
          <div v-if="!showHolidayForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-100">
                <tr class="border-b border-gray-200">
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Holiday Name</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Date</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Type</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Description</th>
                  <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="holiday in filteredHolidays" :key="holiday.id">
                  <td class="py-4 px-6 text-sm font-medium text-gray-900">{{ holiday.name }}</td>
                  <td class="py-4 px-6 text-sm text-gray-900">
                    <span v-if="holiday.isRecurringYearly">
                      {{ formatRecurringDate(holiday.date) }} (Yearly)
                    </span>
                    <span v-else>
                      {{ formatDate(holiday.date) }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      holiday.type === 'holiday' ? 'bg-red-100 text-red-800' : 
                      holiday.type === 'special-hours' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    ]">
                      {{ formatHolidayType(holiday.type) }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-sm text-gray-900 hidden md:table-cell">{{ holiday.description || 'N/A' }}</td>
                  <td class="py-4 px-6 text-sm">
                    <div class="flex items-center gap-2">
                      <button 
                        @click="editHoliday(holiday)"
                        class="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit class="w-5 h-5" />
                      </button>
                      <button 
                        @click="openDeleteHolidayModal(holiday)"
                        class="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="officeStore.getHolidays.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-500">
                    <Calendar class="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No holidays or special closures configured yet.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Holiday Form -->
          <div v-if="showHolidayForm" class="bg-white rounded-lg border border-gray-200 p-6">
            <h2 class="text-xl font-semibold mb-4">{{ isEditingHoliday ? 'Edit Holiday' : 'Add Holiday' }}</h2>
            <form @submit.prevent="saveHoliday" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <input 
                  type="text" 
                  v-model="holidayFormData.name" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="e.g., Christmas Day, Staff Training"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  v-model="holidayFormData.date" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
              </div>
              
              <div class="flex items-center">
                <input 
                  id="isRecurringYearly" 
                  type="checkbox" 
                  v-model="holidayFormData.isRecurringYearly" 
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="isRecurringYearly" class="ml-2 block text-sm text-gray-700">
                  This holiday repeats every year
                </label>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  v-model="holidayFormData.type" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="holiday">Holiday (Closed)</option>
                  <option value="special-hours">Special Hours</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div v-if="holidayFormData.type === 'special-hours'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                  <input 
                    type="time" 
                    v-model="holidayFormData.openTime" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                  <input 
                    type="time" 
                    v-model="holidayFormData.closeTime" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  v-model="holidayFormData.description" 
                  rows="2" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="Additional information about this holiday or closure"
                ></textarea>
              </div>
              
              <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <button
                  type="button"
                  @click="closeHolidayForm"
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2"
                  :disabled="officeStore.isLoading"
                >
                  {{ isEditingHoliday ? 'Save Changes' : 'Add Holiday' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Delete Office Hours</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete the office hours for <span class="font-semibold">{{ deleteItem?.day }}</span>? 
            This action cannot be undone.
          </p>
          <div class="flex justify-center gap-3">
            <button 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="deleteOfficeHours" 
              class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              :disabled="officeStore.isLoading"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
  
      <!-- Delete Holiday Modal -->
      <div v-if="showDeleteHolidayModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Delete Holiday</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete <span class="font-semibold">{{ deleteHolidayItem?.name }}</span>? 
            This action cannot be undone.
          </p>
          <div class="flex justify-center gap-3">
            <button 
              @click="showDeleteHolidayModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="deleteHoliday" 
              class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              :disabled="officeStore.isLoading"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
  
      <!-- Success Modal -->
      <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle class="h-6 w-6 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Success</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            {{ statusMessage }}
          </p>
          <div class="flex justify-center">
            <button 
              @click="showSuccessModal = false" 
              class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
  
      <!-- Error Modal -->
      <div v-if="showErrorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <XCircle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Error</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            {{ statusMessage }}
          </p>
          <div class="flex justify-center">
            <button 
              @click="showErrorModal = false" 
              class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
  
      <!-- Loading Spinner for operations (not initial loading) -->
      <LoadingSpinner v-if="officeStore.isLoading && !initialLoading && !showForm && !showHolidayForm" isOverlay text="Processing..." />
      
      <!-- Loading Spinner Overlay - Show for all operations -->
      <LoadingSpinner v-if="officeStore.isLoading || initialLoading" isOverlay :text="initialLoading ? 'Loading data...' : 'Processing...'" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useOfficeStore } from '@/stores/modules/officeStore'
  import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
  import { 
    PlusCircle, 
    Edit, 
    Trash2, 
    Clock, 
    AlertTriangle, 
    Search,
    Calendar,
    CheckCircle,
    XCircle
  } from 'lucide-vue-next'
  
  // Initialize the office store
  const officeStore = useOfficeStore()
  
  // Tab state
  const activeTab = ref('regular')
  
  // Regular hours state
  const showForm = ref(false)
  const showDeleteModal = ref(false)
  const isEditing = ref(false)
  const editId = ref(null)
  const deleteItem = ref(null)
  const statusMessage = ref('')
  const statusType = ref('success')
  const searchQuery = ref('')
  
  // Holidays state
  const showHolidayForm = ref(false)
  const showDeleteHolidayModal = ref(false)
  const isEditingHoliday = ref(false)
  const editHolidayId = ref(null)
  const deleteHolidayItem = ref(null)
  const holidaySearchQuery = ref('')
  
  // Add these after the statusType ref
  const showSuccessModal = ref(false)
  const showErrorModal = ref(false)
  const initialLoading = ref(true) // Add initialLoading state
  
  // Form data
  const formData = ref({
    day: 'Monday',
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    hasLunchBreak: true,
    lunchStart: '12:00',
    lunchEnd: '13:00',
    notes: ''
  })
  
  // Holiday form data
  const holidayFormData = ref({
    name: '',
    date: '',
    isRecurringYearly: false,
    type: 'holiday',
    openTime: '09:00',
    closeTime: '17:00',
    description: ''
  })
  
  // Constants
  const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]
  
  // Filtered office hours based on search
  const filteredOfficeHours = computed(() => {
    if (!searchQuery.value) return officeStore.getOfficeHours
    
    const query = searchQuery.value.toLowerCase()
    return officeStore.getOfficeHours.filter(hours => 
      hours.day.toLowerCase().includes(query) || 
      (hours.notes && hours.notes.toLowerCase().includes(query))
    )
  })
  
  // Filtered holidays based on search
  const filteredHolidays = computed(() => {
    if (!holidaySearchQuery.value) return officeStore.getHolidays
    
    const query = holidaySearchQuery.value.toLowerCase()
    return officeStore.getHolidays.filter(holiday => 
      holiday.name.toLowerCase().includes(query) || 
      (holiday.description && holiday.description.toLowerCase().includes(query))
    )
  })
  
  // Watch for store errors and display them
  watch(() => officeStore.getError, (error) => {
    if (error) {
      showStatus(error, 'error')
    }
  })
  
  // Watch for tab changes to refresh data
  watch(activeTab, () => {
    // We don't need this watch anymore since we're using the switchTab function
  })
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    
    try {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours, 10))
      date.setMinutes(parseInt(minutes, 10))
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return timeString
    }
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (e) {
      return dateString
    }
  }
  
  // Format recurring date (month and day only)
  const formatRecurringDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, { 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (e) {
      return dateString
    }
  }
  
  // Format holiday type
  const formatHolidayType = (type) => {
    switch (type) {
      case 'holiday': return 'Holiday'
      case 'special-hours': return 'Special Hours'
      case 'maintenance': return 'Maintenance'
      default: return type
    }
  }
  
  // Switch tab with loading state
  const switchTab = async (tab) => {
    if (activeTab.value === tab) return;
    
    initialLoading.value = true;
    activeTab.value = tab;
    
    try {
      if (tab === 'regular') {
        await officeStore.fetchOfficeHours();
      } else {
        await officeStore.fetchHolidays();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      showStatus('Failed to load data. Please try again.', 'error');
    } finally {
      initialLoading.value = false;
    }
  }
  
  // Open add form
  const openAddForm = () => {
    isEditing.value = false
    editId.value = null
    
    // Reset form
    formData.value = {
      day: 'Monday',
      isOpen: true,
      openTime: '09:00',
      closeTime: '17:00',
      hasLunchBreak: true,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      notes: ''
    }
    
    showForm.value = true
  }
  
  // Open add holiday form
  const openAddHolidayForm = () => {
    isEditingHoliday.value = false
    editHolidayId.value = null
    
    // Reset form
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    
    holidayFormData.value = {
      name: '',
      date: formattedDate,
      isRecurringYearly: false,
      type: 'holiday',
      openTime: '09:00',
      closeTime: '17:00',
      description: ''
    }
    
    showHolidayForm.value = true
  }
  
  // Open edit form
  const editOfficeHours = (hours) => {
    isEditing.value = true
    editId.value = hours.id
    
    formData.value = {
      day: hours.day,
      isOpen: hours.isOpen,
      openTime: hours.openTime || '09:00',
      closeTime: hours.closeTime || '17:00',
      hasLunchBreak: !!hours.lunchStart && !!hours.lunchEnd,
      lunchStart: hours.lunchStart || '12:00',
      lunchEnd: hours.lunchEnd || '13:00',
      notes: hours.notes || ''
    }
    
    showForm.value = true
  }
  
  // Open edit holiday form
  const editHoliday = (holiday) => {
    isEditingHoliday.value = true
    editHolidayId.value = holiday.id
    
    holidayFormData.value = {
      name: holiday.name,
      date: holiday.date,
      isRecurringYearly: holiday.isRecurringYearly || false,
      type: holiday.type || 'holiday',
      openTime: holiday.openTime || '09:00',
      closeTime: holiday.closeTime || '17:00',
      description: holiday.description || ''
    }
    
    showHolidayForm.value = true
  }
  
  // Open delete modal
  const openDeleteModal = (hours) => {
    deleteItem.value = hours
    showDeleteModal.value = true
  }
  
  // Open delete holiday modal
  const openDeleteHolidayModal = (holiday) => {
    deleteHolidayItem.value = holiday
    showDeleteHolidayModal.value = true
  }
  
  // Close form
  const closeForm = () => {
    showForm.value = false
  }
  
  // Close holiday form
  const closeHolidayForm = () => {
    showHolidayForm.value = false
  }
  
  // Save office hours
  const saveOfficeHours = async () => {
    try {
      if (isEditing.value && editId.value) {
        // Update existing record
        const success = await officeStore.updateOfficeHours(editId.value, formData.value)
        if (success) {
          showStatus('Office hours updated successfully', 'success')
          showForm.value = false
        }
      } else {
        // Check if day already exists (this is also checked in the store, but we check here for UX)
        const existingDay = officeStore.getOfficeHours.find(h => h.day === formData.value.day)
        if (existingDay) {
          showStatus(`Office hours for ${formData.value.day} already exist`, 'error')
          return
        }
        
        // Add new record
        const newHours = await officeStore.createOfficeHours(formData.value)
        if (newHours) {
          showStatus('Office hours added successfully', 'success')
          showForm.value = false
        }
      }
    } catch (error) {
      showStatus(error.message || 'Failed to save office hours', 'error')
    }
  }
  
  // Save holiday
  const saveHoliday = async () => {
    try {
      if (isEditingHoliday.value && editHolidayId.value) {
        // Update existing record
        const success = await officeStore.updateHoliday(editHolidayId.value, holidayFormData.value)
        if (success) {
          showStatus('Holiday updated successfully', 'success')
          showHolidayForm.value = false
        }
      } else {
        // Add new record
        const newHoliday = await officeStore.createHoliday(holidayFormData.value)
        if (newHoliday) {
          showStatus('Holiday added successfully', 'success')
          showHolidayForm.value = false
        }
      }
    } catch (error) {
      showStatus(error.message || 'Failed to save holiday', 'error')
    }
  }
  
  // Delete office hours
  const deleteOfficeHours = async () => {
    if (!deleteItem.value || !deleteItem.value.id) return
    
    try {
      const success = await officeStore.deleteOfficeHours(deleteItem.value.id)
      if (success) {
        showStatus(`Office hours for ${deleteItem.value.day} deleted successfully`, 'success')
        showDeleteModal.value = false
        deleteItem.value = null
      }
    } catch (error) {
      showStatus(error.message || 'Failed to delete office hours', 'error')
    }
  }
  
  // Delete holiday
  const deleteHoliday = async () => {
    if (!deleteHolidayItem.value || !deleteHolidayItem.value.id) return
    
    try {
      const success = await officeStore.deleteHoliday(deleteHolidayItem.value.id)
      if (success) {
        showStatus(`Holiday "${deleteHolidayItem.value.name}" deleted successfully`, 'success')
        showDeleteHolidayModal.value = false
        deleteHolidayItem.value = null
      }
    } catch (error) {
      showStatus(error.message || 'Failed to delete holiday', 'error')
    }
  }
  
  // Show status message
  const showStatus = (message, type = 'success') => {
    statusMessage.value = message
    statusType.value = type
    
    if (type === 'success') {
      showSuccessModal.value = true
    } else {
      showErrorModal.value = true
    }
  }
  
  // Fetch data on component mount
  onMounted(async () => {
    initialLoading.value = true; // Set initial loading to true
    try {
      await Promise.all([
        officeStore.fetchOfficeHours(),
        officeStore.fetchHolidays()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showStatus('Failed to load data. Please try again.', 'error');
    } finally {
      initialLoading.value = false; // Set initial loading to false when done
    }
  })
  </script>