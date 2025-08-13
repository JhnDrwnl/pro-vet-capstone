<!-- components/common/HistoryPanel.vue -->
<template>
    <Transition name="slide-fade">
      <div 
        v-if="isVisible"
        class="bg-white overflow-hidden z-30 transition-all duration-300 ease-in-out flex flex-col fixed"
        :class="[
          isMobileView 
            ? 'inset-0 pt-14 pb-20' 
            : 'left-20 top-4 h-[calc(100vh-2rem)] w-[400px] border border-gray-100 rounded-2xl shadow-sm'
        ]"
      >
        <!-- History Header -->
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Appointment History</h2>
            <button 
              v-if="isMobileView"
              @click="closeHistory" 
              class="text-gray-500 hover:text-gray-700"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
    
        <!-- History Content -->
        <div class="px-6 overflow-y-auto flex-grow">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-semibold">Recent Appointments</h3>
            <div class="text-xs text-gray-500">
              {{ appointments.length }} appointments
            </div>
          </div>
          
          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center items-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          
          <!-- Error state -->
          <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            <AlertCircleIcon class="w-6 h-6 mx-auto mb-2" />
            <p>{{ error }}</p>
            <button 
              @click="fetchUserAppointments" 
              class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full"
            >
              Try Again
            </button>
          </div>
          
          <!-- Appointments list -->
          <div v-else-if="appointments.length > 0">
            <div 
              v-for="appointment in appointments" 
              :key="appointment.id"
              class="mb-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
            >
              <div class="flex justify-between items-start mb-1">
                <div class="font-medium">
                  {{ appointment.serviceNames && appointment.serviceNames.length > 0 
                    ? appointment.serviceNames[0] 
                    : 'Unnamed Service' }}
                </div>
                <span :class="getStatusClass(appointment)">
                  {{ isExpired(appointment) ? 'Expired' : formatStatus(appointment.status) }}
                </span>
              </div>
              <div class="text-sm text-gray-700 mb-1">
                <span>{{ appointment.doctorName || 'Unknown Doctor' }}</span>
              </div>
              <div class="text-sm text-gray-700 mb-1">
                <span>Pet: {{ appointment.petName || 'Unknown Pet' }}</span>
              </div>
              <div class="text-sm text-gray-500 flex justify-between">
                <span>{{ formatDate(appointment.date) }}</span>
                <span>{{ appointment.time }}</span>
              </div>
              
              <!-- Created date -->
              <div class="text-xs text-gray-400 mt-1">
                Created: {{ formatDateTime(appointment.createdAt) }}
              </div>
              
              <!-- Feedback status indicator -->
              <div v-if="appointment.status === 'completed'" class="text-xs mt-1">
                <span 
                  v-if="appointment.hasFeedback" 
                  class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Feedback Submitted
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
                  </svg>
                  Feedback Pending
                </span>
              </div>
              
              <!-- Action buttons -->
              <div class="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                <!-- Three-dot menu button -->
                <div class="relative action-menu-container">
                  <button 
                    @click="toggleActionMenu(appointment.id)"
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    :title="'Actions for ' + (appointment.petName || 'appointment')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                  </button>
                  
                  <!-- Dropdown menu -->
                  <div 
                    v-if="openActionMenu === appointment.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    <!-- Cancel option for pending appointments -->
                <button 
                  v-if="appointment.status === 'pending'"
                  @click="confirmCancel(appointment)"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancel Appointment
                    </button>
                    
                    <!-- View Notes option for completed appointments -->
                    <button 
                      v-if="appointment.status === 'completed' && appointment.completionData"
                      @click="viewAppointmentSummary(appointment)"
                      class="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View Notes
                </button>
                
                    <!-- Feedback option for completed appointments -->
                <button 
                  v-if="appointment.status === 'completed'"
                  @click="openFeedback(appointment)"
                      class="w-full text-left px-4 py-2 text-sm flex items-center gap-2"
                      :class="appointment.hasFeedback ? 'text-green-600 hover:bg-green-50' : 'text-blue-600 hover:bg-blue-50'"
                >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      {{ appointment.hasFeedback ? 'View Feedback' : 'Leave Feedback' }}
                </button>
                
                                        <!-- Create New Appointment option for completed appointments -->
                    <button 
                      v-if="appointment.status === 'completed'"
                      @click="goToCreateAppointment(appointment)"
                      class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Create New Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-else class="flex flex-col items-center justify-center py-10">
            <CalendarIcon class="w-12 h-12 text-gray-300 mb-3" />
            <div class="text-gray-500 text-sm text-center">
              No appointment history found.
            </div>
          </div>
        </div>
      </div>
    </Transition>
  
    <!-- Confirmation Modal -->
    <div 
      v-if="showCancelModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangleIcon class="w-6 h-6 text-red-600" />
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h2>
          <p class="text-gray-600 mb-4">
            Are you sure you want to cancel your appointment on 
            <span class="font-medium">{{ selectedAppointment ? formatDate(selectedAppointment.date) : '' }}</span> 
            at <span class="font-medium">{{ selectedAppointment ? selectedAppointment.time : '' }}</span>?
          </p>
          
          <!-- Cancellation Reason Input -->
          <div class="w-full mb-4">
            <label for="cancellation-reason" class="block text-left text-sm font-medium text-gray-700 mb-1">
              Please provide a reason for cancellation:
            </label>
            <textarea
              id="cancellation-reason"
              v-model="cancellationReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Enter your reason for cancelling this appointment..."
              required
            ></textarea>
            <p v-if="reasonError" class="mt-1 text-left text-xs text-red-600">
              {{ reasonError }}
            </p>
          </div>
          
          <div class="flex space-x-3 w-full">
            <button 
              @click="closeCancelModal" 
              class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
            >
              No, Keep It
            </button>
            <button 
              @click="cancelAppointment" 
              :disabled="cancelLoading || !cancellationReason.trim()"
              class="flex-1 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="cancelLoading">Cancelling...</span>
              <span v-else>Yes, Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Modal -->
    <div 
      v-if="showFeedbackModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">Appointment Feedback</h2>
            <button 
              @click="closeFeedbackModal" 
              class="text-gray-400 hover:text-gray-600"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>
          <AppointmentFeedback 
            :appointment="selectedAppointment" 
            @close="closeFeedbackModal"
            @feedback-submitted="onFeedbackSubmitted"
          />
        </div>
      </div>
    </div>

         

    <!-- Appointment Summary Modal -->
    <div 
      v-if="showSummaryModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">Appointment Summary</h2>
            <button 
              @click="closeSummaryModal" 
              class="text-gray-400 hover:text-gray-600"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Appointment Details Header -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ selectedAppointment?.serviceNames && selectedAppointment.serviceNames.length > 0 
                    ? selectedAppointment.serviceNames.join(', ') 
                    : 'Appointment' }}
                </h3>
                <div class="space-y-1 text-sm text-gray-600">
                  <div><strong>Doctor:</strong> {{ selectedAppointment?.doctorName }}</div>
                  <div><strong>Pet:</strong> {{ selectedAppointment?.petName }}</div>
                  <div><strong>Date:</strong> {{ selectedAppointment ? formatDate(selectedAppointment.date) : '' }}</div>
                  <div><strong>Time:</strong> {{ selectedAppointment?.time }}</div>
                  <div><strong>Status:</strong> <span class="text-green-600 font-medium">Completed</span></div>
                </div>
              </div>
              <div class="flex items-center justify-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Completion Summary Content -->
          <div v-if="selectedAppointment?.completionData" class="space-y-6">
            <!-- Services Summary -->
            <div v-if="selectedAppointment.completionData.services && selectedAppointment.completionData.services.length > 0">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Services Completed
              </h4>
              <div class="space-y-3">
                <div v-for="(service, index) in selectedAppointment.completionData.services" :key="index" class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-base font-medium text-blue-800">{{ service.name || `Service ${index + 1}` }}</span>
                    <span class="text-xs text-blue-600 capitalize bg-blue-100 px-2 py-1 rounded-full">{{ service.status?.replace('_', ' ') || 'completed' }}</span>
                  </div>
                  <div v-if="service.duration" class="text-sm text-blue-600 mb-2">Duration: {{ service.duration }} minutes</div>
                  <div v-if="service.notes" class="text-sm text-blue-700 bg-white rounded p-3 border border-blue-200">
                    {{ service.notes }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Pet Health Assessment -->
            <div v-if="selectedAppointment.completionData.pets && selectedAppointment.completionData.pets.length > 0">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                Health Assessment
              </h4>
              <div class="space-y-3">
                <div v-for="(pet, index) in selectedAppointment.completionData.pets" :key="index" class="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-base font-medium text-green-800">{{ pet.name || `Pet ${index + 1}` }}</span>
                    <span class="text-xs text-green-600 capitalize bg-green-100 px-2 py-1 rounded-full">{{ pet.overallHealth || 'assessed' }}</span>
                  </div>
                  <div v-if="pet.weight" class="text-sm text-green-600 mb-2">Weight: {{ pet.weight }} kg</div>
                  <div v-if="pet.healthNotes" class="text-sm text-green-700 bg-white rounded p-3 border border-green-200">
                    {{ pet.healthNotes }}
                  </div>
                  <div v-if="pet.followUpRequired" class="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-sm font-medium text-orange-700">Follow-up Required:</span>
                      <span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Yes</span>
                    </div>
                    <div v-if="pet.followUpNotes" class="text-sm text-orange-700">
                      {{ pet.followUpNotes }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- General Notes -->
            <div v-if="selectedAppointment.completionData.generalNotes" class="space-y-4">
              <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Additional Notes
              </h4>
              
              <div v-if="selectedAppointment.completionData.generalNotes.treatmentSummary" class="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div class="text-sm font-medium text-purple-800 mb-2">Treatment Summary:</div>
                <div class="text-sm text-purple-700">{{ selectedAppointment.completionData.generalNotes.treatmentSummary }}</div>
              </div>
              
              <div v-if="selectedAppointment.completionData.generalNotes.ownerInstructions" class="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div class="text-sm font-medium text-indigo-800 mb-2">Owner Instructions:</div>
                <div class="text-sm text-indigo-700">{{ selectedAppointment.completionData.generalNotes.ownerInstructions }}</div>
              </div>
              
              <div v-if="selectedAppointment.completionData.generalNotes.nextSteps" class="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div class="text-sm font-medium text-amber-800 mb-2">Next Steps:</div>
                <div class="text-sm text-amber-700">{{ selectedAppointment.completionData.generalNotes.nextSteps }}</div>
              </div>
            </div>
          </div>
          
          <!-- No completion data message -->
          <div v-else class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Completion Notes Available</h3>
            <p class="text-gray-500">This appointment was completed but no detailed notes were added by the veterinarian.</p>
          </div>
          
          <!-- Close button -->
          <div class="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button 
              @click="closeSummaryModal" 
              class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
  import { 
    X as XIcon, 
    Calendar as CalendarIcon, 
    AlertTriangle as AlertTriangleIcon,
    AlertCircle as AlertCircleIcon
  } from 'lucide-vue-next';
  import { useAppointmentStore } from '@/stores/modules/appointmentStore';
  import { useAuthStore } from '@/stores/modules/authStore';
  import { useNotificationsStore } from '@/stores/modules/notifications';
  import { parseISO, format } from 'date-fns';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
  import AppointmentFeedback from '@/components/user/AppointmentFeedback.vue';
  
  const props = defineProps({
    isMobileView: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close']);
  
  // State
  const loading = ref(false);
  const error = ref(null);
  const appointments = ref([]);
  const showCancelModal = ref(false);
  const showFeedbackModal = ref(false);
  const showSummaryModal = ref(false);
  const selectedAppointment = ref(null);
  const openActionMenu = ref(null); // Track which action menu is open
  const cancelLoading = ref(false);
  const cancellationReason = ref('');
  const reasonError = ref('');
  const isVisibleRef = ref(false);
  
  // Store instances
  const appointmentStore = useAppointmentStore();
  const authStore = useAuthStore();
  const notificationStore = useNotificationsStore();
  const router = useRouter();
  
  // Computed property to determine if the panel is visible
  const panelVisibility = computed(() => props.isVisible);
  
  // Methods
  const closeHistory = () => {
    emit('close');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      if (typeof dateString === 'string') {
        // Handle ISO string
        date = parseISO(dateString);
      } else if (dateString instanceof Date) {
        // Handle Date object
        date = dateString;
      } else if (dateString && typeof dateString === 'object' && dateString.seconds) {
        // Handle Firebase Timestamp
        date = new Date(dateString.seconds * 1000);
      } else {
        return 'Invalid date';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      if (typeof dateString === 'string') {
        // Handle ISO string
        date = parseISO(dateString);
      } else if (dateString instanceof Date) {
        // Handle Date object
        date = dateString;
      } else if (dateString && typeof dateString === 'object' && dateString.seconds) {
        // Handle Firebase Timestamp
        date = new Date(dateString.seconds * 1000);
      } else {
        return 'Unknown';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date time:', error, dateString);
      return 'Unknown';
    }
  };
  
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };
  
  // UPDATED: Status class function to use consistent colors with processing status
  const getStatusClass = (appointment) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    if (isExpired(appointment)) {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
    const status = appointment?.status?.toLowerCase();
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'processing':
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case 'cancelled':
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'ended':
        return `${baseClasses} bg-slate-200 text-slate-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Determine if appointment is expired (past scheduled time) and not final statuses
  const isExpired = (appointment) => {
    if (!appointment) return false;
    
    try {
      const status = (appointment.status || '').toLowerCase();
      if (['approved','completed','cancelled','rejected','ended'].includes(status)) return false;
      if (!appointment.date || !appointment.time) return false;
      
      let appointmentDate;
      if (appointment.date instanceof Date) {
        appointmentDate = appointment.date;
      } else if (typeof appointment.date === 'string') {
        appointmentDate = new Date(appointment.date);
      } else if (appointment.date && typeof appointment.date === 'object' && appointment.date.seconds) {
        // Handle Firebase Timestamp
        appointmentDate = new Date(appointment.date.seconds * 1000);
      } else {
        return false;
      }
      
      // Check if date is valid
      if (isNaN(appointmentDate.getTime())) {
        return false;
      }
      
      const timeStr = String(appointment.time);
      // Parse end time from range "h:mm AM - h:mm PM"; fallback to first time if missing range
      const matches = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s*-\s*(\d{1,2}):(\d{1,2})\s*(AM|PM))?/i);
      if (!matches) return false;
      
      let endHour, endMinute, endPeriod;
      if (matches[4]) {
        endHour = parseInt(matches[4]);
        endMinute = parseInt(matches[5]);
        endPeriod = matches[6].toUpperCase();
      } else {
        endHour = parseInt(matches[1]);
        endMinute = parseInt(matches[2]);
        endPeriod = matches[3].toUpperCase();
      }
      
      if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
      if (endPeriod === 'AM' && endHour === 12) endHour = 0;
      
      const endDateTime = new Date(appointmentDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      return new Date() > endDateTime;
    } catch (error) {
      console.error('Error checking if appointment is expired:', error, appointment);
      return false;
    }
  };
  
  const fetchUserAppointments = async () => {
    if (!authStore.user || !authStore.user.userId) {
      error.value = 'You must be logged in to view appointments';
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId);
      appointments.value = userAppointments;
      
      // Sort appointments by date (newest first)
      appointments.value.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      
      // Check for existing feedback for completed appointments
      await checkExistingFeedback();
    } catch (err) {
      console.error('Error fetching appointments:', err);
      error.value = 'Failed to load your appointments. Please try again.';
    } finally {
      loading.value = false;
    }
  };
  
  // Check for existing feedback for completed appointments
  const checkExistingFeedback = async () => {
    try {
      const { getFeedbackByAppointmentId } = await import('@/services/feedbackService');
      
      // Check only completed appointments
      const completedAppointments = appointments.value.filter(app => app.status === 'completed');
      
      if (completedAppointments.length === 0) {
        return; // No completed appointments to check
      }
      
      for (const appointment of completedAppointments) {
        try {
          if (!appointment.id) {
            console.warn('Appointment missing ID, skipping feedback check');
            continue;
          }
          
          const existingFeedback = await getFeedbackByAppointmentId(appointment.id);
          if (existingFeedback) {
            appointment.hasFeedback = true;
            appointment.existingFeedback = existingFeedback;
          } else {
            appointment.hasFeedback = false;
            appointment.existingFeedback = null;
          }
        } catch (error) {
          console.error(`Error checking feedback for appointment ${appointment.id}:`, error);
          appointment.hasFeedback = false;
          appointment.existingFeedback = null;
        }
      }
    } catch (error) {
      console.error('Error importing feedback service:', error);
      // Don't set error state here as it's not critical for the main functionality
    }
  };
  
  // Simplified canCancel function - we're now checking directly in the template
  // This function is kept for potential future use
  const canCancel = (appointment) => {
    return appointment && appointment.status?.toLowerCase() === 'pending';
  };
  
  const confirmCancel = (appointment) => {
    selectedAppointment.value = appointment;
    cancellationReason.value = ''; // Reset reason
    reasonError.value = ''; // Reset error
    showCancelModal.value = true;
    closeActionMenu(); // Close menu after action
  };
  
  const closeCancelModal = () => {
    showCancelModal.value = false;
    selectedAppointment.value = null;
    cancellationReason.value = '';
    reasonError.value = '';
  };
  
  const cancelAppointment = async () => {
    if (!selectedAppointment.value) return;
    
    // Validate reason
    if (!cancellationReason.value.trim()) {
      reasonError.value = 'Please provide a reason for cancellation';
      return;
    }
    
    cancelLoading.value = true;
    
    try {
      // Update the appointment status to cancelled with reason
      await appointmentStore.updateAppointment(
        selectedAppointment.value.id, 
        {
          status: 'cancelled',
          cancellationReason: cancellationReason.value.trim(),
          cancelledBy: 'user',
          cancelledAt: new Date()
        }
      );
      
      // Update the local state
      const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
      if (index !== -1) {
        appointments.value[index].status = 'cancelled';
        appointments.value[index].cancellationReason = cancellationReason.value.trim();
        appointments.value[index].cancelledBy = 'user';
        appointments.value[index].cancelledAt = new Date();
      }
      
      // Close the modal
      closeCancelModal();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      error.value = 'Failed to cancel appointment. Please try again.';
    } finally {
      cancelLoading.value = false;
    }
  };

  // Feedback methods
  const openFeedback = async (appointment) => {
    // Ensure appointment has all required data for feedback
    if (!appointment.petName) {
      console.warn('Appointment missing petName, attempting to fetch pet data...');
      
      try {
        // Try to get pet information from the pets collection
        const db = getFirestore();
        const petsRef = collection(db, 'pets');
        
        // First try to find pet by petId if it exists in the appointment
        let petQuery;
        if (appointment.petId) {
          petQuery = query(petsRef, where('__name__', '==', appointment.petId));
        } else {
          // Fallback to finding by ownerId
          petQuery = query(petsRef, where('ownerId', '==', appointment.userId));
        }
        
        const petSnapshot = await getDocs(petQuery);
        
        if (!petSnapshot.empty) {
          // Find the pet that matches the appointment
          let petDoc;
          if (appointment.petId) {
            petDoc = petSnapshot.docs[0]; // Should be only one if searching by petId
          } else {
            // Find the first pet for this owner (you might need to adjust this logic)
            petDoc = petSnapshot.docs[0];
          }
          
          if (petDoc) {
            const petData = petDoc.data();
            appointment.petName = petData.name || petData.petName || 'Unknown Pet';
          } else {
            appointment.petName = 'Unknown Pet';
          }
        } else {
          appointment.petName = 'Unknown Pet';
        }
      } catch (error) {
        console.error('Error fetching pet data:', error);
        appointment.petName = 'Unknown Pet';
      }
    }
    
    // Check if feedback already exists for this appointment
    try {
      const { getFeedbackByAppointmentId } = await import('@/services/feedbackService');
      const existingFeedback = await getFeedbackByAppointmentId(appointment.id);
      
      if (existingFeedback) {
        // Mark appointment as having feedback
        appointment.hasFeedback = true;
        appointment.existingFeedback = existingFeedback;
      } else {
        appointment.hasFeedback = false;
        appointment.existingFeedback = null;
      }
    } catch (error) {
      console.error('Error checking for existing feedback:', error);
      appointment.hasFeedback = false;
      appointment.existingFeedback = null;
    }
    
    selectedAppointment.value = appointment;
    showFeedbackModal.value = true;
    closeActionMenu(); // Close menu after action
  };

  const closeFeedbackModal = () => {
    showFeedbackModal.value = false;
    selectedAppointment.value = null;
  };

  const onFeedbackSubmitted = async (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    
    // Update the appointment's feedback status
    if (selectedAppointment.value) {
      selectedAppointment.value.hasFeedback = true;
      selectedAppointment.value.existingFeedback = feedbackData;
    }
    
    // Refresh the feedback status for all appointments
    await checkExistingFeedback();
  };

  // Action menu methods
  const toggleActionMenu = (appointmentId) => {
    if (openActionMenu.value === appointmentId) {
      openActionMenu.value = null; // Close if already open
    } else {
      openActionMenu.value = appointmentId; // Open this menu
    }
  };

  const closeActionMenu = () => {
    openActionMenu.value = null;
  };

  // Summary modal methods
  const viewAppointmentSummary = (appointment) => {
    selectedAppointment.value = appointment;
    showSummaryModal.value = true;
    closeActionMenu(); // Close menu after action
  };

  const closeSummaryModal = () => {
    showSummaryModal.value = false;
    selectedAppointment.value = null;
  };

        // Create New Appointment - Simple redirect
   const goToCreateAppointment = (appointment) => {
     if (!appointment) {
       console.error('No appointment provided to goToCreateAppointment');
       return;
     }
     
     // Validate required appointment data
     if (!appointment.id || !appointment.petName || !appointment.doctorId) {
       console.error('Appointment missing required data:', appointment);
       error.value = 'Cannot create new appointment: Missing appointment information';
       return;
     }
     
     try {
       // Store appointment context for the appointments page
       const newAppointmentData = {
         type: 'new_appointment',
         originalAppointmentId: appointment.id,
         petName: appointment.petName,
         doctorId: appointment.doctorId,
         serviceNames: appointment.serviceNames || ['Veterinary Service'],
         originalAppointmentDate: appointment.date
       };
       
       // Store data in sessionStorage for the appointments page to use
       sessionStorage.setItem('newAppointmentData', JSON.stringify(newAppointmentData));
       
       // Close action menu
       closeActionMenu();
       
       // Redirect to appointments page
       router.push('/user/userappointments');
     } catch (error) {
       console.error('Error in goToCreateAppointment:', error);
       error.value = 'Failed to redirect to appointment creation. Please try again.';
     }
   };
  
  // Fetch appointments when component is mounted
  onMounted(() => {
    fetchUserAppointments();
    
    // Add click outside handler for action menus
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu-container')) {
        closeActionMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup function
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });
  });
  
  // Watch for changes in panel visibility
  watch(() => props.isVisible, (newValue) => {
    isVisibleRef.value = newValue;
    if (isVisibleRef.value && authStore.user) {
      // console.log('Panel became visible, fetching appointments');
      fetchUserAppointments();
    }
  });
  </script>
  
  <style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }
  
  /* Add slide-out animation */
  .v-leave-active {
    transition: all 0.3s ease-in-out;
  }
  
  .v-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
  
  /* Add slide-in animation */
  .v-enter-active {
    transition: all 0.3s ease-in-out;
  }
  
  .v-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }
  </style>