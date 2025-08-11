<!-- components/user/AppointmentFeedback.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Appointment Feedback</h3>
      <p class="text-sm text-gray-600">Help us improve our services</p>
    </div>

    <!-- Appointment Info -->
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Service:</span>
        <span class="text-sm text-gray-900">{{ appointment.serviceNames?.[0] || 'Veterinary Service' }}</span>
      </div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Doctor:</span>
        <span class="text-sm text-gray-900">{{ appointment.doctorName }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Date:</span>
        <span class="text-sm text-gray-900">{{ formatDate(appointment.date) }}</span>
      </div>
    </div>

    <!-- Rating -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Overall Experience</label>
      <div class="flex justify-center space-x-2">
        <button
          v-for="star in 5"
          :key="star"
          @click="rating = star"
          class="text-2xl transition-colors duration-200"
          :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
        >
          ★
        </button>
      </div>
      <div class="text-center mt-2">
        <span class="text-sm text-gray-600">
          {{ ratingText }}
        </span>
      </div>
    </div>

    <!-- Feedback Categories -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">What went well?</label>
      <div class="grid grid-cols-2 gap-2">
        <label 
          v-for="category in positiveCategories" 
          :key="category.value"
          class="flex items-center p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
          :class="selectedPositive.includes(category.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
        >
          <input
            type="checkbox"
            :value="category.value"
            v-model="selectedPositive"
            class="mr-2 text-blue-600"
          />
          <span class="text-sm">{{ category.label }}</span>
        </label>
      </div>
    </div>

    <!-- Areas for Improvement -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Areas for improvement</label>
      <div class="grid grid-cols-2 gap-2">
        <label 
          v-for="category in improvementCategories" 
          :key="category.value"
          class="flex items-center p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
          :class="selectedImprovements.includes(category.value) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'"
        >
          <input
            type="checkbox"
            :value="category.value"
            v-model="selectedImprovements"
            class="mr-2 text-orange-600"
          />
          <span class="text-sm">{{ category.label }}</span>
        </label>
      </div>
    </div>

    <!-- Additional Comments -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
      <textarea
        v-model="comments"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="Share your experience or suggestions..."
      ></textarea>
    </div>

    <!-- Follow-up Consultation -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <label class="text-sm font-medium text-gray-700">Schedule Follow-up?</label>
        <button
          @click="showFollowUpOptions = !showFollowUpOptions"
          class="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {{ showFollowUpOptions ? 'Hide' : 'Show' }} Options
        </button>
      </div>
      
      <div v-if="showFollowUpOptions" class="space-y-3">
        <div class="flex items-center space-x-3">
          <input
            type="radio"
            id="noFollowUp"
            value="none"
            v-model="followUpPreference"
            class="text-blue-600"
          />
          <label for="noFollowUp" class="text-sm text-gray-700">No follow-up needed</label>
        </div>
        
        <div class="flex items-center space-x-3">
          <input
            type="radio"
            id="scheduleFollowUp"
            value="schedule"
            v-model="followUpPreference"
            class="text-blue-600"
          />
          <label for="scheduleFollowUp" class="text-sm text-gray-700">Schedule follow-up consultation</label>
        </div>
        
        <div class="flex items-center space-x-3">
          <input
            type="radio"
            id="contactMe"
            value="contact"
            v-model="followUpPreference"
            class="text-blue-600"
          />
          <label for="contactMe" class="text-sm text-gray-700">Contact me to discuss</label>
        </div>
        
        <!-- Follow-up timing preference -->
        <div v-if="followUpPreference === 'schedule'" class="ml-6 space-y-2">
          <label class="block text-sm font-medium text-gray-700">Preferred timing:</label>
          <select
            v-model="followUpTiming"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex space-x-3">
      <button
        @click="$emit('close')"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        @click="submitFeedback"
        :disabled="!rating || loading"
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Submitting...
        </span>
        <span v-else>Submit Feedback</span>
      </button>
    </div>

    <!-- Success Message -->
    <div v-if="showSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <CheckCircleIcon class="w-5 h-5 text-green-500 mr-2" />
        <span class="text-sm text-green-700">Feedback submitted successfully!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { CheckCircle as CheckCircleIcon } from 'lucide-vue-next';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { useNotificationsStore } from '@/stores/modules/notifications';

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'feedback-submitted']);

const appointmentStore = useAppointmentStore();
const notificationStore = useNotificationsStore();

// Form data
const rating = ref(0);
const selectedPositive = ref([]);
const selectedImprovements = ref([]);
const comments = ref('');
const followUpPreference = ref('none');
const followUpTiming = ref('');
const showFollowUpOptions = ref(false);

// UI state
const loading = ref(false);
const showSuccess = ref(false);

// Feedback categories
const positiveCategories = [
  { value: 'professional_staff', label: 'Professional Staff' },
  { value: 'clean_facility', label: 'Clean Facility' },
  { value: 'clear_communication', label: 'Clear Communication' },
  { value: 'timely_service', label: 'Timely Service' },
  { value: 'thorough_examination', label: 'Thorough Examination' },
  { value: 'affordable_pricing', label: 'Affordable Pricing' }
];

const improvementCategories = [
  { value: 'wait_time', label: 'Wait Time' },
  { value: 'communication', label: 'Communication' },
  { value: 'facility_cleanliness', label: 'Facility Cleanliness' },
  { value: 'staff_attitude', label: 'Staff Attitude' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'appointment_scheduling', label: 'Scheduling' }
];

// Computed
const ratingText = computed(() => {
  const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  return texts[rating.value] || '';
});

// Methods
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const submitFeedback = async () => {
  if (!rating.value) return;
  
  loading.value = true;
  
  try {
    const feedbackData = {
      appointmentId: props.appointment.id,
      userId: props.appointment.userId,
      doctorId: props.appointment.doctorId,
      rating: rating.value,
      positiveAspects: selectedPositive.value,
      areasForImprovement: selectedImprovements.value,
      comments: comments.value,
      followUpPreference: followUpPreference.value,
      followUpTiming: followUpTiming.value,
      submittedAt: new Date(),
      status: 'submitted'
    };

    // Save feedback to Firestore
    await appointmentStore.saveAppointmentFeedback(feedbackData);
    
    // Create notification for follow-up if requested
    if (followUpPreference.value === 'schedule' && followUpTiming.value) {
      await createFollowUpNotification();
    }
    
    // Show success message
    showSuccess.value = true;
    
    // Emit event
    emit('feedback-submitted', feedbackData);
    
    // Close modal after delay
    setTimeout(() => {
      emit('close');
    }, 2000);
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Handle error (show error message)
  } finally {
    loading.value = false;
  }
};

const createFollowUpNotification = async () => {
  try {
    const notificationData = {
      type: 'follow_up_request',
      title: 'Follow-up Consultation Requested',
      message: `Follow-up consultation requested for ${props.appointment.petName} in ${followUpTiming.value.replace('_', ' ')}`,
      userId: props.appointment.userId,
      doctorId: props.appointment.doctorId,
      appointmentId: props.appointment.id,
      data: {
        followUpTiming: followUpTiming.value,
        petName: props.appointment.petName,
        serviceName: props.appointment.serviceNames?.[0] || 'Veterinary Service'
      },
      status: 'pending',
      createdAt: new Date()
    };
    
    await notificationStore.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating follow-up notification:', error);
  }
};

// Initialize with default values
onMounted(() => {
  // Set default rating to 5 (excellent)
  rating.value = 5;
});
</script>

<style scoped>
/* Custom styles if needed */
</style> 