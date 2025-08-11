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
                <span>{{ appointment.doctorName }}</span>
              </div>
              <div class="text-sm text-gray-700 mb-1">
                <span>Pet: {{ appointment.petName }}</span>
              </div>
              <div class="text-sm text-gray-500 flex justify-between">
                <span>{{ formatDate(appointment.date) }}</span>
                <span>{{ appointment.time }}</span>
              </div>
              
              <!-- Created date -->
              <div class="text-xs text-gray-400 mt-1">
                Created: {{ formatDateTime(appointment.createdAt) }}
              </div>
              
              <!-- Action buttons -->
              <div class="mt-3 pt-2 border-t border-gray-100 flex justify-end space-x-2">
                <!-- Cancel button for pending appointments -->
                <button 
                  v-if="appointment.status === 'pending'"
                  @click="confirmCancel(appointment)"
                  class="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <!-- Feedback button for completed appointments -->
                <button 
                  v-if="appointment.status === 'completed'"
                  @click="openFeedback(appointment)"
                  class="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors duration-200"
                >
                  Leave Feedback
                </button>
                
                <!-- Schedule Follow-up button for completed appointments -->
                <button 
                  v-if="appointment.status === 'completed'"
                  @click="scheduleFollowUp(appointment)"
                  class="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-full transition-colors duration-200"
                >
                  Schedule Follow-up
                </button>
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

    <!-- Follow-up Modal -->
    <div 
      v-if="showFollowUpModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Schedule Follow-up</h2>
          <p class="text-gray-600 mb-4">
            Would you like to schedule a follow-up consultation for 
            <span class="font-medium">{{ selectedAppointment ? selectedAppointment.petName : '' }}</span>?
          </p>
          
          <!-- Follow-up timing selection -->
          <div class="w-full mb-4">
            <label for="follow-up-timing" class="block text-left text-sm font-medium text-gray-700 mb-2">
              Preferred timing:
            </label>
            <select
              id="follow-up-timing"
              v-model="followUpTiming"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">Select timing</option>
              <option value="1_week">1 week</option>
              <option value="2_weeks">2 weeks</option>
              <option value="1_month">1 month</option>
              <option value="3_months">3 months</option>
              <option value="6_months">6 months</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <!-- Additional notes -->
          <div class="w-full mb-4">
            <label for="follow-up-notes" class="block text-left text-sm font-medium text-gray-700 mb-2">
              Additional notes (optional):
            </label>
            <textarea
              id="follow-up-notes"
              v-model="followUpNotes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="Any specific concerns or topics to discuss..."
            ></textarea>
          </div>
          
          <div class="flex space-x-3 w-full">
            <button 
              @click="closeFollowUpModal" 
              class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="submitFollowUpRequest" 
              :disabled="followUpLoading || !followUpTiming"
              class="flex-1 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="followUpLoading">Scheduling...</span>
              <span v-else>Schedule Follow-up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed } from 'vue';
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
  const showFollowUpModal = ref(false);
  const selectedAppointment = ref(null);
  const cancelLoading = ref(false);
  const cancellationReason = ref('');
  const reasonError = ref('');
  const followUpLoading = ref(false);
  const followUpTiming = ref('');
  const followUpNotes = ref('');
  const isVisibleRef = ref(false);
  
  // Store instances
  const appointmentStore = useAppointmentStore();
  const authStore = useAuthStore();
  const notificationStore = useNotificationsStore();
  
  // Computed property to determine if the panel is visible
  const panelVisibility = computed(() => props.isVisible);
  
  // Methods
  const closeHistory = () => {
    emit('close');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    let date;
    if (typeof dateString === 'string') {
      // Handle ISO string
      date = parseISO(dateString);
    } else if (dateString instanceof Date) {
      // Handle Date object
      date = dateString;
    } else {
      return 'Invalid date';
    }
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    let date;
    if (typeof dateString === 'string') {
      // Handle ISO string
      date = parseISO(dateString);
    } else if (dateString instanceof Date) {
      // Handle Date object
      date = dateString;
    } else {
      return 'Unknown';
    }
    
    return format(date, 'MMM d, yyyy h:mm a');
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
    const status = (appointment.status || '').toLowerCase();
    if (['approved','completed','cancelled','rejected','ended'].includes(status)) return false;
    if (!appointment.date || !appointment.time) return false;
    const appointmentDate = new Date(appointment.date);
    const timeStr = String(appointment.time);
    // Parse end time from range "h:mm AM - h:mm PM"; fallback to first time if missing range
    const matches = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)(?:\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM))?/i);
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
  };
  
  const fetchUserAppointments = async () => {
    if (!authStore.user || !authStore.user.userId) {
      error.value = 'You must be logged in to view appointments';
      return;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      // console.log('Fetching appointments for user:', authStore.user.userId);
      const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId);
      // console.log('Fetched appointments:', userAppointments);
      appointments.value = userAppointments;
      
      // Sort appointments by date (newest first)
      appointments.value.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      error.value = 'Failed to load your appointments. Please try again.';
    } finally {
      loading.value = false;
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
  const openFeedback = (appointment) => {
    selectedAppointment.value = appointment;
    showFeedbackModal.value = true;
  };

  const closeFeedbackModal = () => {
    showFeedbackModal.value = false;
    selectedAppointment.value = null;
  };

  const onFeedbackSubmitted = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    // You can add additional logic here if needed
  };

  // Follow-up methods
  const scheduleFollowUp = (appointment) => {
    selectedAppointment.value = appointment;
    followUpTiming.value = '';
    followUpNotes.value = '';
    showFollowUpModal.value = true;
  };

  const closeFollowUpModal = () => {
    showFollowUpModal.value = false;
    selectedAppointment.value = null;
    followUpTiming.value = '';
    followUpNotes.value = '';
  };

  const submitFollowUpRequest = async () => {
    if (!selectedAppointment.value || !followUpTiming.value) return;
    
    followUpLoading.value = true;
    
    try {
      const notificationData = {
        type: 'follow_up_request',
        title: 'Follow-up Consultation Requested',
        message: `Follow-up consultation requested for ${selectedAppointment.value.petName} in ${followUpTiming.value.replace('_', ' ')}`,
        userId: selectedAppointment.value.userId,
        doctorId: selectedAppointment.value.doctorId,
        appointmentId: selectedAppointment.value.id,
        data: {
          followUpTiming: followUpTiming.value,
          followUpNotes: followUpNotes.value,
          petName: selectedAppointment.value.petName,
          serviceName: selectedAppointment.value.serviceNames?.[0] || 'Veterinary Service',
          originalAppointmentDate: selectedAppointment.value.date
        },
        status: 'pending',
        createdAt: new Date()
      };
      
      await notificationStore.createNotification(notificationData);
      
      // Close modal and show success message
      closeFollowUpModal();
      
      // You can add a success toast or message here
      console.log('Follow-up request submitted successfully');
      
    } catch (error) {
      console.error('Error submitting follow-up request:', error);
      error.value = 'Failed to submit follow-up request. Please try again.';
    } finally {
      followUpLoading.value = false;
    }
  };
  
  // Fetch appointments when component is mounted
  onMounted(() => {
    fetchUserAppointments();
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