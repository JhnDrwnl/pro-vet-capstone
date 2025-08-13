<!-- components/vet/FeedbackViewer.vue -->
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Patient Feedback</h3>
        <p class="text-sm text-gray-600">Reviews and ratings from your patients</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-sm text-gray-600">Average: {{ averageRating }}/5</span>
        </div>
        <div class="text-sm text-gray-500">
          {{ totalFeedbacks }} feedback{{ totalFeedbacks !== 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
      <p>{{ error }}</p>
      <button 
        @click="fetchFeedback" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full"
      >
        Try Again
      </button>
    </div>

    <!-- Feedback List -->
    <div v-else-if="feedbackList.length > 0" class="space-y-4">
      <div 
        v-for="feedback in feedbackList" 
        :key="feedback.id"
        class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
      >
        <!-- Feedback Header -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="font-medium text-gray-900">{{ feedback.petName }}</div>
            <div class="text-sm text-gray-600">{{ formatDate(feedback.submittedAt) }}</div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex">
              <span 
                v-for="star in 5" 
                :key="star"
                class="text-lg"
                :class="star <= feedback.overallRating ? 'text-yellow-400' : 'text-gray-300'"
              >
                ★
              </span>
            </div>
            <span class="text-sm font-medium text-gray-700">{{ feedback.overallRating }}/5</span>
          </div>
        </div>

        <!-- Service Ratings -->
        <div v-if="feedback.serviceRatings" class="mb-3">
          <div class="text-sm font-medium text-gray-700 mb-2">Service Ratings:</div>
          <div class="space-y-2">
            <div 
              v-for="(rating, service) in feedback.serviceRatings" 
              :key="service"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-gray-600">{{ service }}</span>
              <div class="flex items-center gap-1">
                <span class="text-xs text-gray-500">{{ rating }}/5</span>
                <div class="flex">
                  <span 
                    v-for="star in 5" 
                    :key="star"
                    class="text-xs"
                    :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ★
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Positive Aspects -->
        <div v-if="feedback.positiveAspects && feedback.positiveAspects.length > 0" class="mb-3">
          <div class="text-sm font-medium text-green-700 mb-1">What went well:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="aspect in feedback.positiveAspects" 
              :key="aspect"
              class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
            >
              {{ formatCategoryLabel(aspect) }}
            </span>
          </div>
        </div>

        <!-- Areas for Improvement -->
        <div v-if="feedback.areasForImprovement && feedback.areasForImprovement.length > 0" class="mb-3">
          <div class="text-sm font-medium text-orange-700 mb-1">Areas for improvement:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="area in feedback.areasForImprovement" 
              :key="area"
              class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
            >
              {{ formatCategoryLabel(area) }}
            </span>
          </div>
        </div>

        <!-- Comments -->
        <div v-if="feedback.comments" class="mb-3">
          <div class="text-sm font-medium text-gray-700 mb-1">Additional comments:</div>
          <div class="text-sm text-gray-600 bg-gray-50 rounded p-3">
            "{{ feedback.comments }}"
          </div>
        </div>

        <!-- Follow-up Preference -->
        <div v-if="feedback.followUpPreference && feedback.followUpPreference !== 'none'" class="pt-3 border-t border-gray-100">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-blue-600 font-medium">Follow-up requested:</span>
            <span class="text-gray-600">
              {{ formatFollowUpPreference(feedback.followUpPreference, feedback.followUpTiming) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
      <p class="text-gray-500">When patients provide feedback, it will appear here.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/modules/authStore';
import { getFeedbackByDoctorId, getFeedbackStats } from '@/services/feedbackService';
import { parseISO, format } from 'date-fns';

const props = defineProps({
  doctorId: {
    type: String,
    required: true
  }
});

const authStore = useAuthStore();

// State
const loading = ref(false);
const error = ref(null);
const feedbackList = ref([]);
const feedbackStats = ref({});

// Computed
const averageRating = computed(() => {
  return feedbackStats.value.averageRating || 0;
});

const totalFeedbacks = computed(() => {
  return feedbackStats.value.totalFeedbacks || 0;
});

// Methods
const fetchFeedback = async () => {
  if (!props.doctorId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch feedback and stats in parallel
    const [feedback, stats] = await Promise.all([
      getFeedbackByDoctorId(props.doctorId, 50),
      getFeedbackStats(props.doctorId)
    ]);
    
    feedbackList.value = feedback;
    feedbackStats.value = stats;
  } catch (err) {
    console.error('Error fetching feedback:', err);
    error.value = 'Failed to load feedback. Please try again.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  } catch (err) {
    return 'Invalid date';
  }
};

const formatCategoryLabel = (category) => {
  const labels = {
    'professional_staff': 'Professional Staff',
    'clean_facility': 'Clean Facility',
    'clear_communication': 'Clear Communication',
    'timely_service': 'Timely Service',
    'thorough_examination': 'Thorough Examination',
    'affordable_pricing': 'Affordable Pricing',
    'wait_time': 'Wait Time',
    'communication': 'Communication',
    'facility_cleanliness': 'Facility Cleanliness',
    'staff_attitude': 'Staff Attitude',
    'pricing': 'Pricing',
    'appointment_scheduling': 'Scheduling'
  };
  
  return labels[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatFollowUpPreference = (preference, timing) => {
  if (preference === 'schedule' && timing) {
    return `Schedule in ${timing.replace('_', ' ')}`;
  } else if (preference === 'contact') {
    return 'Contact to discuss';
  }
  return preference;
};

// Fetch feedback when component mounts
onMounted(() => {
  fetchFeedback();
});
</script>

<style scoped>
/* Custom styles if needed */
</style>


