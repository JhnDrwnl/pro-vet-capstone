<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 rounded-[8px]">
    <div class="flex gap-6">
      <!-- Main Content -->
      <div class="flex-1">
        <!-- Header Controls -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <!-- Search and Filter -->
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="relative flex-1 lg:w-80">
              <input 
                type="text"
                v-model="searchQuery"
                placeholder="Search feedback by pet name or owner..."
                class="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300"
              >
              <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button 
              @click="showFilters = !showFilters"
              class="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
            >
              <FilterIcon class="w-5 h-5 text-gray-600" />
            </button>
            <button 
              @click="fetchFeedback"
              class="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
            >
              Refresh
            </button>
          </div>

          <!-- Sort Control -->
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="relative">
              <button 
                @click="showSortMenu = !showSortMenu"
                class="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
              >
                <ArrowDownIcon class="w-5 h-5 text-gray-600" />
                <span class="text-sm text-gray-600">Sort by</span>
              </button>
              <!-- Sort Menu -->
              <div v-if="showSortMenu" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                <button 
                  v-for="option in sortOptions" 
                  :key="option.value"
                  @click="handleSort(option.value)"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Panel -->
        <div v-if="showFilters" class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Rating Filter -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Rating</h3>
              <div class="space-y-2">
                <label v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="rating"
                    v-model="filters.ratings"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-600">{{ rating }} Stars</span>
                </label>
              </div>
            </div>

            <!-- Date Filter -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
              <input
                type="date"
                v-model="filters.startDate"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
            </div>

            <!-- Service Filter -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Service Type</h3>
              <select 
                v-model="filters.serviceType"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">All Services</option>
                <option value="vaccination">Vaccination</option>
                <option value="health_check">Health Check</option>
                <option value="surgery">Surgery</option>
                <option value="dental">Dental Care</option>
                <option value="emergency">Emergency Care</option>
              </select>
            </div>
          </div>
        </div>

                 

         <!-- Feedback Statistics Cards -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Total Feedback -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-1">Total Feedback</p>
              <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.totalFeedbacks || 0 }}</p>
            </div>
          </div>

          <!-- Average Rating -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-1">Average Rating</p>
              <p class="text-2xl font-bold text-gray-900">{{ feedbackStats.averageRating || 0 }}/5</p>
            </div>
          </div>

          <!-- This Month -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-1">This Month</p>
              <p class="text-2xl font-bold text-gray-900">{{ monthlyFeedback || 0 }}</p>
            </div>
          </div>

          <!-- Response Rate -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-1">Response Rate</p>
              <p class="text-2xl font-bold text-gray-900">{{ responseRate || 0 }}%</p>
            </div>
          </div>
        </div>



        <!-- Feedback List -->
        <div class="space-y-6">
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-xl text-center">
            <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <p class="text-lg font-medium mb-2">{{ error }}</p>
            <button 
              @click="fetchFeedback" 
              class="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Feedback Items -->
          <div v-else-if="filteredFeedback.length > 0" class="space-y-6">
            <div 
              v-for="feedback in filteredFeedback" 
              :key="feedback.id"
              @click="selectFeedback(feedback)"
              class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              :class="{ 'ring-2 ring-blue-500': selectedFeedback?.id === feedback.id }"
            >
                             <!-- Feedback Header -->
               <div class="flex items-center justify-between mb-3">
                 <div class="flex items-center gap-3">
                   <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                     {{ feedback.petName?.charAt(0) || 'P' }}
                   </div>
                <div>
                     <h3 class="font-medium text-gray-900">{{ feedback.petName }}</h3>
                     <p class="text-sm text-gray-500">{{ formatDate(feedback.submittedAt) }}</p>
                </div>
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
                   <span class="font-medium text-gray-700">{{ feedback.overallRating }}/5</span>
              </div>
            </div>

                             <!-- Service Ratings -->
               <div v-if="feedback.serviceRatings" class="mb-3">
                 <div class="text-sm text-gray-600 mb-2">Service Ratings:</div>
                 <div class="flex flex-wrap gap-2">
                   <div 
                     v-for="(rating, service) in feedback.serviceRatings" 
                     :key="service"
                     class="bg-gray-50 rounded px-3 py-2 text-sm"
                   >
                     <span class="text-gray-700">{{ service }}</span>
                     <span class="text-gray-500 ml-2">{{ rating }}/5</span>
                   </div>
                 </div>
            </div>

                             <!-- Feedback Categories -->
               <div class="flex flex-wrap gap-2 mb-3">
                 <span 
                   v-for="aspect in feedback.positiveAspects || []" 
                   :key="aspect"
                   class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                 >
                   {{ formatCategoryLabel(aspect) }}
                 </span>
                 <span 
                   v-for="area in feedback.areasForImprovement || []" 
                   :key="area"
                   class="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded"
                 >
                   {{ formatCategoryLabel(area) }}
                 </span>
               </div>

                             <!-- Comments Preview -->
               <div v-if="feedback.comments" class="mb-3">
                 <p class="text-gray-600 text-sm">
                   "{{ feedback.comments }}"
                 </p>
              </div>

               <!-- Follow-up Request -->
               <div v-if="feedback.followUpPreference && feedback.followUpPreference !== 'none'" class="pt-2 border-t border-gray-100">
                 <div class="flex items-center gap-2 text-sm">
                   <span class="text-blue-600">Follow-up:</span>
                   <span class="text-gray-600">
                     {{ formatFollowUpPreference(feedback.followUpPreference, feedback.followUpTiming) }}
                   </span>
            </div>
          </div>
        </div>
      </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p class="text-gray-500">When patients provide feedback, it will appear here.</p>
          </div>
        </div>
      </div>

             <!-- Feedback Details Sidebar -->
       <div v-if="selectedFeedback" class="hidden lg:block w-[400px] bg-white rounded-lg border border-gray-200 h-fit sticky top-6">
        <!-- Header -->
         <div class="flex items-center justify-between p-4 border-b border-gray-200">
           <div class="flex items-center gap-3">
             <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
               {{ selectedFeedback.petName?.charAt(0) || 'P' }}
             </div>
            <div>
               <h3 class="font-medium text-gray-900">{{ selectedFeedback.petName }}</h3>
               <p class="text-xs text-gray-500">Patient Feedback</p>
            </div>
          </div>
           <button @click="closeFeedbackDetails" class="p-1 hover:bg-gray-100 rounded">
             <XIcon class="w-4 h-4 text-gray-600" />
          </button>
        </div>

                 <!-- Rating Display -->
         <div class="p-4 border-b border-gray-200">
           <div class="text-center">
             <div class="flex justify-center mb-2">
               <span 
                 v-for="star in 5" 
                 :key="star"
                 class="text-2xl"
                 :class="star <= selectedFeedback.overallRating ? 'text-yellow-400' : 'text-gray-300'"
               >
                 ★
               </span>
             </div>
             <p class="text-xl font-medium text-gray-900">{{ selectedFeedback.overallRating }}/5</p>
             <p class="text-sm text-gray-500">{{ getRatingText(selectedFeedback.overallRating) }}</p>
           </div>
         </div>

                 <!-- Detailed Service Ratings -->
         <div v-if="selectedFeedback.serviceRatings" class="p-4 border-b border-gray-200">
           <h4 class="font-medium text-gray-900 mb-3">Service Breakdown</h4>
           <div class="space-y-2">
             <div 
               v-for="(rating, service) in selectedFeedback.serviceRatings" 
               :key="service"
               class="bg-gray-50 rounded p-2"
             >
              <div class="flex items-center justify-between">
                 <span class="text-sm text-gray-700">{{ service }}</span>
                 <span class="text-sm text-gray-500">{{ rating }}/5</span>
                </div>
              </div>
            </div>
          </div>

                 <!-- Full Comments -->
         <div v-if="selectedFeedback.comments" class="p-4 border-b border-gray-200">
           <h4 class="font-medium text-gray-900 mb-3">Patient Comments</h4>
           <div class="bg-gray-50 rounded p-3">
             <p class="text-gray-700 text-sm">
               "{{ selectedFeedback.comments }}"
             </p>
           </div>
        </div>

                 <!-- Follow-up Details -->
         <div v-if="selectedFeedback.followUpPreference && selectedFeedback.followUpPreference !== 'none'" class="p-4 border-b border-gray-200">
           <h4 class="font-medium text-gray-900 mb-3">Follow-up Request</h4>
           <div class="bg-blue-50 rounded p-3">
             <p class="text-blue-800 text-sm">
               {{ formatFollowUpPreference(selectedFeedback.followUpPreference, selectedFeedback.followUpTiming) }}
             </p>
          </div>
        </div>

                 
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  SearchIcon, 
  FilterIcon, 
  ArrowDownIcon, 
  XIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/modules/authStore'
import { getFeedbackByDoctorId, getFeedbackStats } from '@/services/feedbackService'
import { format } from 'date-fns'

const authStore = useAuthStore()

// State for feedback management
const loading = ref(false)
const error = ref(null)
const feedbackStats = ref({})
const selectedFeedback = ref(null)

const searchQuery = ref('')
const showFilters = ref(false)
const showSortMenu = ref(false)

const sortOptions = [
  { label: 'Newest First', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'Highest Rating', value: 'rating-desc' },
  { label: 'Lowest Rating', value: 'rating-asc' },
  { label: 'Pet Name A-Z', value: 'name-asc' },
  { label: 'Pet Name Z-A', value: 'name-desc' }
]

const filters = ref({
  ratings: [],
  startDate: '',
  serviceType: ''
})

// Empty array for feedback - will be populated from Firebase
const feedbackList = ref([])

// Computed Properties
const monthlyFeedback = computed(() => {
  if (!feedbackList.value.length) return 0
  
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  return feedbackList.value.filter(feedback => {
    const feedbackDate = feedback.submittedAt?.toDate?.() || new Date(feedback.submittedAt)
    return feedbackDate.getMonth() === thisMonth && feedbackDate.getFullYear() === thisYear
  }).length
})

const responseRate = computed(() => {
  // Calculate response rate based on feedback with follow-up requests
  if (!feedbackList.value.length) return 0
  
  const followUpRequests = feedbackList.value.filter(feedback => 
    feedback.followUpPreference && feedback.followUpPreference !== 'none'
  ).length
  
  return Math.round((followUpRequests / feedbackList.value.length) * 100)
})

const filteredFeedback = computed(() => {
  let result = [...feedbackList.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(feedback => 
      feedback.petName?.toLowerCase().includes(query) ||
      feedback.comments?.toLowerCase().includes(query)
    )
  }

  // Rating filter
  if (filters.value.ratings.length) {
    result = result.filter(feedback => 
      filters.value.ratings.includes(feedback.overallRating)
    )
  }

  // Date filter
  if (filters.value.startDate) {
    const filterDate = new Date(filters.value.startDate)
    result = result.filter(feedback => {
      const feedbackDate = feedback.submittedAt?.toDate?.() || new Date(feedback.submittedAt)
      return feedbackDate >= filterDate
    })
  }

  // Service type filter
  if (filters.value.serviceType) {
    result = result.filter(feedback => 
      feedback.serviceNames?.some(service => 
        service.toLowerCase().includes(filters.value.serviceType.toLowerCase())
      )
    )
  }

  return result
})

// Methods
const fetchFeedback = async () => {
  if (!authStore.user?.userId) {
    error.value = 'User not authenticated'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // For vets, we need to use their doctor ID to fetch feedback
    // The doctorId in feedback corresponds to the vet's user ID
    const doctorId = authStore.user.userId
    
    // Validate that we have a valid doctor ID
    if (!doctorId || typeof doctorId !== 'string') {
      throw new Error('Invalid doctor ID')
    }
    
    // Fetch feedback and stats in parallel
    const [feedback, stats] = await Promise.all([
      getFeedbackByDoctorId(doctorId, 50),
      getFeedbackStats(doctorId)
    ])
    
    // Verify that all feedback belongs to the current vet
    const verifiedFeedback = feedback.filter(item => {
      return item.doctorId === doctorId
    })
    
    if (verifiedFeedback.length !== feedback.length) {
      console.warn(`Filtered out ${feedback.length - verifiedFeedback.length} feedback items that didn't match doctor ID`)
    }
    
    feedbackList.value = verifiedFeedback
    feedbackStats.value = stats
  } catch (err) {
    console.error('Error fetching feedback:', err)
    error.value = 'Failed to load feedback. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleSort = (value) => {
  showSortMenu.value = false
  
  switch (value) {
    case 'date-desc':
      feedbackList.value.sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt)
        const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt)
        return dateB - dateA
      })
      break
    case 'date-asc':
      feedbackList.value.sort((a, b) => {
        const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt)
        const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt)
        return dateA - dateB
      })
      break
    case 'rating-desc':
      feedbackList.value.sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0))
      break
    case 'rating-asc':
      feedbackList.value.sort((a, b) => (a.overallRating || 0) - (b.overallRating || 0))
      break
    case 'name-asc':
      feedbackList.value.sort((a, b) => (a.petName || '').localeCompare(b.petName || ''))
      break
    case 'name-desc':
      feedbackList.value.sort((a, b) => (b.petName || '').localeCompare(a.petName || ''))
      break
  }
}

const selectFeedback = (feedback) => {
  // Security check: ensure the feedback belongs to the current vet
  if (feedback.doctorId !== authStore.user?.userId) {
    console.error('Attempted to select feedback not belonging to current vet')
    error.value = 'Access denied: This feedback does not belong to you'
    return
  }
  
  selectedFeedback.value = feedback
}

const closeFeedbackDetails = () => {
  selectedFeedback.value = null
}



const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date'
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, 'MMM d, yyyy')
  } catch (err) {
    return 'Invalid date'
  }
}

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
  }
  
  return labels[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatFollowUpPreference = (preference, timing) => {
  if (preference === 'schedule' && timing) {
    return `Schedule in ${timing.replace('_', ' ')}`
  } else if (preference === 'contact') {
    return 'Contact to discuss'
  }
  return preference
}

const getRatingText = (rating) => {
  const texts = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  return texts[rating] || ''
}

// Fetch feedback when component mounts
onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
/* Input focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>
