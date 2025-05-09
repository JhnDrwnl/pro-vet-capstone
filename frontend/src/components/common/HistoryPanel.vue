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
                <span :class="getStatusClass(appointment.status)">
                  {{ formatStatus(appointment.status) }}
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
              
              <!-- Action buttons - Always show for pending appointments -->
              <div v-if="appointment.status === 'pending'" class="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                <button 
                  @click="confirmCancel(appointment)"
                  class="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors duration-200"
                >
                  Cancel
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
  import { parseISO, isAfter, format } from 'date-fns';
  
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
  const selectedAppointment = ref(null);
  const cancelLoading = ref(false);
  const cancellationReason = ref('');
  const reasonError = ref('');
  const isVisibleRef = ref(false);
  
  // Store instances
  const appointmentStore = useAppointmentStore();
  const authStore = useAuthStore();
  
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
  
  const getStatusClass = (status) => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  switch (status?.toLowerCase()) {
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'processing':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'cancelled':
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'ended':
      return `${baseClasses} bg-slate-200 text-slate-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
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
      console.log('Fetching appointments for user:', authStore.user.userId);
      const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId);
      console.log('Fetched appointments:', userAppointments);
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
  
  // Fetch appointments when component is mounted
  onMounted(() => {
    fetchUserAppointments();
  });
  
  // Watch for changes in panel visibility
  watch(() => props.isVisible, (newValue) => {
    isVisibleRef.value = newValue;
    if (isVisibleRef.value && authStore.user) {
      console.log('Panel became visible, fetching appointments');
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