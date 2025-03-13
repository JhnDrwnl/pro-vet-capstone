<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Telehealth Management</h1>
      <p class="text-gray-500 mt-1">Manage telehealth appointments and settings.</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'virtual waiting room'"
          :class="[
             'whitespace-nowrap py-1 px-3 rounded-full font-medium mb-2 text-sm transition-colors duration-200',
            activeTab === 'virtual waiting room'
             ? 'bg-[#EBF5FF] text-[#0066FF]'
                : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          Virtual Waiting Room
        </button>
        <button
          @click="activeTab = 'telehealth settings'"
          :class="[
             'whitespace-nowrap py-1 px-3 rounded-full font-medium mb-2 text-sm transition-colors duration-200',
            activeTab === 'telehealth settings'
              ? 'bg-[#EBF5FF] text-[#0066FF]'
                : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          Telehealth Settings
        </button>
      </nav>
    </div>

    <!-- Virtual Waiting Room -->
    <div v-if="activeTab === 'virtual waiting room'" class="bg-white rounded-lg border border-gray-200">
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Client & Pet
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                Appointment Time
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                Veterinarian
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Waiting Time
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="(patient, index) in waitingRoom" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full object-cover" :src="patient.avatar" alt="" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ patient.clientName }}</div>
                    <div class="text-sm text-gray-500">{{ patient.petName }} ({{ patient.petType }})</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ patient.appointmentTime }}</div>
                <div class="text-sm text-gray-500">{{ patient.appointmentDate }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Dr. {{ patient.veterinarian }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(patient.status)">
                  {{ patient.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ patient.waitingTime }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button 
                    @click="notifyVeterinarian(patient)" 
                    class="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                    :disabled="patient.status !== 'Waiting'"
                  >
                    Notify Vet
                  </button>
                  <button 
                    v-if="patient.status === 'Disconnected'" 
                    @click="followUp(patient)" 
                    class="px-3 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-200 ml-2"
                  >
                    Follow Up
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="waitingRoom.length === 0">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                No patients currently in the waiting room
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Telehealth Settings -->
    <div v-if="activeTab === 'telehealth settings'" class="p-6 space-y-6">
      <!-- Enable Telehealth Services Card -->
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2 rounded-full">
              <Video class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-medium leading-6 text-gray-900">Enable Telehealth Services</h3>
              <p class="mt-1 text-sm text-gray-500">Turn telehealth services on or off for the entire platform</p>
            </div>
          </div>
          <button 
            @click="settings.enabled = !settings.enabled" 
            type="button" 
            :class="[
              settings.enabled ? 'bg-blue-600' : 'bg-gray-200',
              'relative inline-flex flex-shrink-0 h-7 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            ]"
            aria-pressed="false"
          >
            <span class="sr-only">Enable telehealth</span>
            <span 
              :class="[
                settings.enabled ? 'translate-x-7' : 'translate-x-0',
                'pointer-events-none relative inline-block h-6 w-6 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
              ]"
            >
              <span 
                :class="[
                  settings.enabled ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                  'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                ]"
                aria-hidden="true"
              >
                <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                  <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span 
                :class="[
                  settings.enabled ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                  'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                ]"
                aria-hidden="true"
              >
                <svg class="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                </svg>
              </span>
            </span>
          </button>
        </div>
      </div>
      
      <!-- Two-column layout for Session Configuration and Appointment Limits -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Session Configuration Card -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-blue-100 p-2 rounded-full">
              <Settings class="h-5 w-5 text-blue-600" />
            </div>
            <h3 class="text-lg font-medium leading-6 text-gray-900">Session Configuration</h3>
          </div>
          
          <div class="space-y-6">
            <!-- Session Duration -->
            <div class="space-y-2">
              <label for="session-duration" class="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock class="h-4 w-4 text-gray-500" />
                Session Duration
              </label>
              <select 
                id="session-duration" 
                v-model="settings.sessionDuration" 
                class="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
              <p class="text-xs text-gray-500">Define the default time limit for video call appointments</p>
            </div>
            
            <!-- Max Participants -->
            <div class="space-y-2">
              <label for="max-participants" class="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users class="h-4 w-4 text-gray-500" />
                Max Participants
              </label>
              <select 
                id="max-participants" 
                v-model="settings.maxParticipants" 
                class="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="2">2 participants</option>
                <option value="3">3 participants</option>
                <option value="4">4 participants</option>
                <option value="5">5 participants</option>
              </select>
              <p class="text-xs text-gray-500">Set how many people can join a single session</p>
            </div>
          </div>
        </div>
        
        <!-- Appointment Limits Card -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-blue-100 p-2 rounded-full">
              <Calendar class="h-5 w-5 text-blue-600" />
            </div>
            <h3 class="text-lg font-medium leading-6 text-gray-900">Appointment Limits</h3>
          </div>
          
          <div class="space-y-6">
            <!-- Daily Appointment Limit -->
            <div class="space-y-2">
              <label for="appointment-limit" class="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CalendarRange class="h-4 w-4 text-gray-500" />
                Daily Appointment Limit
              </label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input 
                  type="number" 
                  id="appointment-limit" 
                  v-model="settings.appointmentLimit" 
                  min="1" 
                  max="50" 
                  class="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md shadow-sm"
                />
              </div>
              <p class="text-xs text-gray-500">Control how many online sessions can be booked per day</p>
            </div>
            
            <!-- Allowed Hours -->
            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock class="h-4 w-4 text-gray-500" />
                Allowed Appointment Hours
              </label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="start-time" class="block text-xs text-gray-500 mb-1">Start Time</label>
                  <select 
                    id="start-time" 
                    v-model="settings.startTime" 
                    class="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option v-for="hour in availableHours" :key="`start-${hour}`" :value="hour">{{ hour }}</option>
                  </select>
                </div>
                <div>
                  <label for="end-time" class="block text-xs text-gray-500 mb-1">End Time</label>
                  <select 
                    id="end-time" 
                    v-model="settings.endTime" 
                    class="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option v-for="hour in availableHours" :key="`end-${hour}`" :value="hour">{{ hour }}</option>
                  </select>
                </div>
              </div>
              <p class="text-xs text-gray-500">Define when telehealth services are available</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Save Settings -->
      <div class="flex justify-end space-x-4 pt-4">
        <button 
          @click="resetSettings" 
          type="button" 
          class="inline-flex items-center px-4 py-2  shadow-sm text-sm font-medium rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
       
          <RefreshCw class="h-4 w-4 mr-2" />
          Reset to Default
        </button>
        <button 
          @click="saveSettings" 
          type="button" 
          class="inline-flex items-center px-4 py-2  shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save class="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Video, 
  Settings, 
  Clock, 
  Users, 
  Calendar, 
  CalendarRange, 
  RefreshCw, 
  Save 
} from 'lucide-vue-next'

// Add this near the top of your script setup section
const activeTab = ref('virtual waiting room')

// Sample data for the waiting room
const waitingRoom = ref([
  {
    clientName: 'Sarah Johnson',
    petName: 'Max',
    petType: 'Dog',
    appointmentTime: '10:30 AM',
    appointmentDate: 'Today',
    veterinarian: 'Emily Wilson',
    status: 'Waiting',
    waitingTime: '12 min',
    avatar: '/placeholder.svg?height=40&width=40'
  },
  {
    clientName: 'Michael Brown',
    petName: 'Luna',
    petType: 'Cat',
    appointmentTime: '10:45 AM',
    appointmentDate: 'Today',
    veterinarian: 'Robert Chen',
    status: 'In Session',
    waitingTime: '0 min',
    avatar: '/placeholder.svg?height=40&width=40'
  },
  {
    clientName: 'David Miller',
    petName: 'Buddy',
    petType: 'Dog',
    appointmentTime: '11:00 AM',
    appointmentDate: 'Today',
    veterinarian: 'Jessica Martinez',
    status: 'Waiting',
    waitingTime: '3 min',
    avatar: '/placeholder.svg?height=40&width=40'
  },
  {
    clientName: 'Emma Wilson',
    petName: 'Oliver',
    petType: 'Cat',
    appointmentTime: '11:15 AM',
    appointmentDate: 'Today',
    veterinarian: 'James Taylor',
    status: 'Disconnected',
    waitingTime: '5 min',
    avatar: '/placeholder.svg?height=40&width=40'
  }
])

// Telehealth settings
const defaultSettings = {
  enabled: true,
  sessionDuration: '30',
  maxParticipants: '3',
  appointmentLimit: 20,
  startTime: '9:00 AM',
  endTime: '5:00 PM'
}

const settings = ref({ ...defaultSettings })

// Available hours for time selection
const availableHours = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM'
]

// Get appropriate CSS class based on status
const getStatusClass = (status) => {
  const baseClass = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
  
  switch (status) {
    case 'Waiting':
      return `${baseClass} bg-yellow-100 text-yellow-800`
    case 'In Session':
      return `${baseClass} bg-green-100 text-green-800`
    case 'Disconnected':
      return `${baseClass} bg-red-100 text-red-800`
    default:
      return `${baseClass} bg-gray-100 text-gray-800`
  }
}

// Notify veterinarian about waiting patient
const notifyVeterinarian = (patient) => {
  alert(`Notification sent to Dr. ${patient.veterinarian} about ${patient.clientName}'s wait time.`)
}

// Follow up with disconnected patient
const followUp = (patient) => {
  alert(`Follow-up initiated for ${patient.clientName} regarding disconnection.`)
}

// Save settings
const saveSettings = () => {
  alert('Telehealth settings saved successfully!')
  // Here you would typically make an API call to save the settings
}

// Reset settings to default
const resetSettings = () => {
  settings.value = { ...defaultSettings }
}
</script>

