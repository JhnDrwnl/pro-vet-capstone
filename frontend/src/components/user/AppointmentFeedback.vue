<!-- components/user/AppointmentFeedback.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {{ isViewingExisting ? 'Your Feedback' : 'Appointment Feedback' }}
      </h3>
      <p class="text-sm text-gray-600">
        {{ isViewingExisting ? 'Here\'s the feedback you provided' : 'Help us improve our services' }}
      </p>
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
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Pet:</span>
        <span class="text-sm text-gray-900">{{ appointment.petName }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Date:</span>
        <span class="text-sm text-gray-900">{{ formatDate(appointment.date) }}</span>
      </div>
    </div>

    <!-- Existing Feedback Display -->
    <div v-if="isViewingExisting" class="mb-6">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-3">
          <CheckCircleIcon class="w-5 h-5 text-green-600" />
          <h4 class="text-lg font-semibold text-green-800">Feedback Submitted</h4>
        </div>
        
        <!-- Overall Rating -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-green-700">Overall Experience:</span>
            <div class="flex">
              <span 
                v-for="star in 5" 
                :key="star"
                class="text-lg"
                :class="star <= appointment.existingFeedback.overallRating ? 'text-yellow-400' : 'text-gray-300'"
              >
                ★
              </span>
            </div>
            <span class="text-sm text-green-600 ml-2">
              {{ getRatingText(appointment.existingFeedback.overallRating) }}
            </span>
          </div>
        </div>

        <!-- Service Ratings -->
        <div v-if="appointment.existingFeedback.serviceRatings" class="mb-4">
          <h5 class="text-sm font-medium text-green-700 mb-2">Service Ratings:</h5>
          <div class="space-y-2">
            <div 
              v-for="(rating, service) in appointment.existingFeedback.serviceRatings" 
              :key="service"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-green-700">{{ service }}:</span>
              <div class="flex items-center gap-1">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  class="text-sm"
                  :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </span>
                <span class="text-green-600 ml-1">{{ getRatingText(rating) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Positive Aspects -->
        <div v-if="appointment.existingFeedback.positiveAspects && appointment.existingFeedback.positiveAspects.length > 0" class="mb-4">
          <h5 class="text-sm font-medium text-green-700 mb-2">What went well:</h5>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="aspect in appointment.existingFeedback.positiveAspects" 
              :key="aspect"
              class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
            >
              {{ getCategoryLabel(aspect, positiveCategories) }}
            </span>
          </div>
        </div>

        <!-- Areas for Improvement -->
        <div v-if="appointment.existingFeedback.areasForImprovement && appointment.existingFeedback.areasForImprovement.length > 0" class="mb-4">
          <h5 class="text-sm font-medium text-green-700 mb-2">Areas for improvement:</h5>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="aspect in appointment.existingFeedback.areasForImprovement" 
              :key="aspect"
              class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
            >
              {{ getCategoryLabel(aspect, improvementCategories) }}
            </span>
          </div>
        </div>

        <!-- Comments -->
        <div v-if="appointment.existingFeedback.comments" class="mb-4">
          <h5 class="text-sm font-medium text-green-700 mb-2">Additional Comments:</h5>
          <p class="text-green-700 text-sm bg-white rounded p-3 border border-green-200">
            {{ appointment.existingFeedback.comments }}
          </p>
        </div>

        <!-- Follow-up Preference -->
        <div v-if="appointment.existingFeedback.followUpPreference && appointment.existingFeedback.followUpPreference !== 'none'" class="mb-4">
          <h5 class="text-sm font-medium text-green-700 mb-2">Follow-up Preference:</h5>
          <div class="text-green-700 text-sm">
            <span v-if="appointment.existingFeedback.followUpPreference === 'schedule'">
              Schedule follow-up consultation
              <span v-if="appointment.existingFeedback.followUpTiming" class="text-green-600">
                ({{ appointment.existingFeedback.followUpTiming.replace('_', ' ') }})
              </span>
            </span>
            <span v-else-if="appointment.existingFeedback.followUpPreference === 'contact'">
              Contact me to discuss
            </span>
          </div>
        </div>

        <!-- Submission Date -->
        <div class="text-xs text-green-600 pt-2 border-t border-green-200">
          Submitted on {{ formatDate(appointment.existingFeedback.submittedAt) }}
        </div>
      </div>
    </div>

    <!-- Service-Specific Feedback -->
    <div v-if="!isViewingExisting" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Service Quality Rating</label>
      <div class="space-y-3">
        <div v-for="service in appointment.serviceNames || ['Veterinary Service']" :key="service" class="border border-gray-200 rounded-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ service }}</span>
            <div class="flex space-x-1">
              <button
                v-for="star in 5"
                :key="star"
                @click="serviceRatings[service] = star"
                class="text-lg transition-colors duration-200"
                :class="star <= (serviceRatings[service] || 0) ? 'text-yellow-400' : 'text-gray-300'"
              >
                ★
              </button>
            </div>
          </div>
          <div class="text-center">
            <span class="text-xs text-gray-500">
              {{ getRatingText(serviceRatings[service] || 0) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Overall Rating -->
    <div v-if="!isViewingExisting" class="mb-6">
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
    <div v-if="!isViewingExisting" class="mb-6">
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
    <div v-if="!isViewingExisting" class="mb-6">
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
    <div v-if="!isViewingExisting" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
      <textarea
        v-model="comments"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="Share your experience or suggestions..."
      ></textarea>
    </div>

    <!-- Follow-up Consultation -->
    <div v-if="!isViewingExisting" class="mb-6">
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
        {{ isViewingExisting ? 'Close' : 'Cancel' }}
      </button>
      <button
        v-if="!isViewingExisting"
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
import { saveFeedback } from '@/services/feedbackService';

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  }
});

// Check if this is viewing existing feedback
const isViewingExisting = computed(() => {
  return props.appointment.hasFeedback && props.appointment.existingFeedback;
});

const emit = defineEmits(['close', 'feedback-submitted']);

const appointmentStore = useAppointmentStore();
const notificationStore = useNotificationsStore();

// Form data
const rating = ref(0);
const serviceRatings = ref({}); // Store ratings for each service
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

// Helper function for service rating text
const getRatingText = (rating) => {
  const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  return texts[rating] || '';
};

// Helper function to get category label from value
const getCategoryLabel = (value, categories) => {
  const category = categories.find(cat => cat.value === value);
  return category ? category.label : value;
};



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
  if (!rating.value) {
    alert('Please provide an overall rating');
    return;
  }
  
  // Check if all services have ratings
  const services = props.appointment.serviceNames || ['Veterinary Service'];
  const missingServiceRatings = services.filter(service => !serviceRatings.value[service]);
  
  if (missingServiceRatings.length > 0) {
    alert(`Please rate all services: ${missingServiceRatings.join(', ')}`);
    return;
  }
  
  // Validate required appointment data
  if (!props.appointment.petName) {
    alert('Pet name is missing. Please contact support.');
    console.error('Missing petName in appointment:', props.appointment);
    return;
  }
  
  if (!props.appointment.userId) {
    alert('User ID is missing. Please contact support.');
    console.error('Missing userId in appointment:', props.appointment);
    return;
  }
  
  if (!props.appointment.doctorId) {
    alert('Doctor ID is missing. Please contact support.');
    console.error('Missing doctorId in appointment:', props.appointment);
    return;
  }
  
  loading.value = true;
  
  try {
    const feedbackData = {
      appointmentId: props.appointment.id,
      userId: props.appointment.userId,
      doctorId: props.appointment.doctorId,
      petName: props.appointment.petName,
      serviceNames: props.appointment.serviceNames || ['Veterinary Service'],
      overallRating: rating.value,
      serviceRatings: serviceRatings.value,
      positiveAspects: selectedPositive.value,
      areasForImprovement: selectedImprovements.value,
      comments: comments.value,
      followUpPreference: followUpPreference.value,
      followUpTiming: followUpTiming.value,
      submittedAt: new Date(),
      status: 'submitted'
    };

    // Save feedback to Firebase
    await saveFeedback(feedbackData);
    
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
    alert('Failed to submit feedback. Please try again.');
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
  // If viewing existing feedback, populate the form with existing data
  if (isViewingExisting.value && props.appointment.existingFeedback) {
    const feedback = props.appointment.existingFeedback;
    
    // Populate form fields with existing feedback
    rating.value = feedback.overallRating || 5;
    serviceRatings.value = feedback.serviceRatings || {};
    selectedPositive.value = feedback.positiveAspects || [];
    selectedImprovements.value = feedback.areasForImprovement || [];
    comments.value = feedback.comments || '';
    followUpPreference.value = feedback.followUpPreference || 'none';
    followUpTiming.value = feedback.followUpTiming || '';
  } else {
    // Set default rating to 5 (excellent)
    rating.value = 5;
    
    // Initialize service ratings with default values
    if (props.appointment.serviceNames && props.appointment.serviceNames.length > 0) {
      props.appointment.serviceNames.forEach(service => {
        serviceRatings.value[service] = 5; // Default to excellent
      });
    } else {
      serviceRatings.value['Veterinary Service'] = 5; // Default service
    }
  }
});
</script>

<style scoped>
/* Custom styles if needed */
</style> 