<template>
  <main class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Veterinary Dashboard
          </h1>
          <p class="text-slate-600 mt-1">Monitor your veterinary practice performance</p>
        </div>
        
        <!-- Time Period Filter -->
        <div class="relative">
          <select
            v-model="selectedPeriod"
            @change="updateVetDashboard"
            class="appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 py-3 px-6 pr-10 text-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option v-for="period in periodOptions" :key="period.value" :value="period.value">
              {{ period.label }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Row: Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="(stat, index) in filteredStats" :key="stat.title" 
           class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
           :style="{ animationDelay: `${index * 100}ms` }">
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-slate-500 mb-2">{{ stat.title }}</p>
              <h3 class="text-3xl font-bold text-slate-800">
                <span v-if="statsLoading" class="animate-pulse bg-slate-200 h-8 w-16 rounded"></span>
                <span v-else>{{ stat.value }}</span>
              </h3>
            </div>
            <div :class="`bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`">
              <LottieIcon :animationPath="stat.icon" width="32px" height="32px" />
            </div>
          </div>
          
          <div class="flex items-center">
            <span v-if="statsLoading" class="animate-pulse bg-slate-200 h-4 w-20 rounded"></span>
            <template v-else>
              <div class="flex items-center gap-2">
                <component :is="stat.trend === 'up' ? ArrowUp : ArrowDown" 
                          :class="`w-4 h-4 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`" />
                <span :class="`${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'} text-sm font-medium`">
                  {{ stat.percentage }}
                </span>
              </div>
              <span class="text-slate-500 text-sm ml-3">{{ getComparisonLabel() }}</span>
            </template>
          </div>
        </div>
        
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <!-- Appointments Overview (Larger) -->
      <div class="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">Appointments Overview</h3>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <span class="text-sm text-slate-600">Total Appointments</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm text-slate-500">Period</span>
                <span class="text-sm font-semibold text-slate-700">{{ getPeriodLabel() }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">Total</span>
                <span class="text-sm font-semibold text-slate-700">{{ filteredAppointments.reduce((sum, count) => sum + count, 0) }} appointments</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="h-[400px] relative">
            <div v-if="loading" class="w-full h-full flex items-center justify-center">
              <div class="animate-pulse bg-slate-200 w-full h-full rounded-xl"></div>
            </div>
            <canvas v-else ref="appointmentsChart" class="w-full h-full"></canvas>
          </div>
        </div>
      </div>

      <!-- Today's Appointments -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-slate-800">Today's Schedule</h3>
        </div>
        <div class="p-6">
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="animate-pulse bg-slate-200 h-4 w-4 rounded-full"></div>
                <div class="animate-pulse bg-slate-200 h-4 w-4 rounded"></div>
                <div class="flex-1">
                  <div class="animate-pulse bg-slate-200 h-4 w-20 rounded mb-1"></div>
                  <div class="animate-pulse bg-slate-200 h-3 w-32 rounded"></div>
                </div>
              </div>
              <div class="animate-pulse bg-slate-200 h-4 w-16 rounded"></div>
            </div>
          </div>
          <div v-else-if="filteredTodaysAppointments.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p class="text-slate-500 font-medium">No appointments today</p>
            <p class="text-sm text-slate-400 mt-1">Enjoy a quiet day!</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="appointment in filteredTodaysAppointments.slice(0, 3)" :key="appointment.id" 
                 class="group p-4 rounded-xl transition-all duration-300 border bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-200/50">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" 
                         :class="appointment.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'">
                    </div>
                    <component 
                      :is="appointment.petType === 'Cat' ? Cat : PawPrint" 
                      class="w-4 h-4 text-slate-500"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ appointment.time }}</p>
                    <p class="text-xs text-slate-600">{{ appointment.petName }} - {{ appointment.service }}</p>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-xs font-medium px-2 py-1 rounded-full" 
                        :class="appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'">
                    {{ appointment.status }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="filteredTodaysAppointments.length > 3" class="text-center pt-2">
              <p class="text-sm text-slate-500">+{{ filteredTodaysAppointments.length - 3 }} more appointments</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pet Categories Donut Chart -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-slate-800">Pet Distribution</h3>
        </div>
        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center">
            <div class="relative w-48 h-48">
              <div class="animate-pulse bg-slate-200 w-48 h-48 rounded-full"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="animate-pulse bg-slate-200 h-8 w-16 rounded mb-2"></div>
                <div class="animate-pulse bg-slate-200 h-4 w-20 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center">
            <div class="relative w-48 h-48">
              <canvas ref="petDistributionChart" class="w-full h-full"></canvas>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-slate-800">{{ totalPets }}</span>
                <span class="flex items-center text-sm text-emerald-500 mt-1">
                  <svg 
                    class="w-3 h-3 mr-1" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path d="M7 13l5-5 5 5" />
                  </svg>
                  {{ totalPets > 0 ? '100%' : '0%' }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="loading" class="space-y-3 mt-6">
            <div v-for="i in 4" :key="i" class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2">
                <div class="animate-pulse bg-slate-200 w-3 h-3 rounded-full"></div>
                <div class="animate-pulse bg-slate-200 h-4 w-16 rounded"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="animate-pulse bg-slate-200 h-4 w-8 rounded"></div>
                <div class="animate-pulse bg-slate-200 h-4 w-12 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else-if="filteredSegments.length === 0" class="text-center py-8">
            <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <p class="text-slate-500">No pet data available</p>
          </div>
          <div v-else class="space-y-3 mt-6">
            <div v-for="segment in filteredSegments" :key="segment.label" 
                 class="flex items-center justify-between py-2 hover:bg-slate-50 rounded-lg px-2 transition-colors duration-200">
              <div class="flex items-center gap-3">
                <div :style="{ backgroundColor: segment.color }" class="w-3 h-3 rounded-full shadow-sm"></div>
                <span class="text-sm font-medium text-slate-700">{{ segment.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800">{{ segment.value }}</span>
                <span class="text-sm text-slate-500">({{ segment.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Telehealth Sessions -->
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden mb-8">
      <div class="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-1">Telehealth Sessions</h3>
            <p class="text-sm text-slate-600">Today's online consultations</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span class="text-xs font-medium text-emerald-600">Live</span>
          </div>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div class="h-3 bg-slate-200 rounded w-32"></div>
                </div>
              </div>
              <div class="text-right">
                <div class="h-3 bg-slate-200 rounded w-16 mb-1"></div>
                <div class="h-4 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="telehealthSessions.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video class="w-10 h-10 text-slate-400" />
          </div>
          <h3 class="text-lg font-semibold text-slate-700 mb-2">No Telehealth Sessions</h3>
          <p class="text-sm text-slate-500 mb-4">No online consultations scheduled for today</p>
          <div class="w-16 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>
        <div v-else class="space-y-4">
          <div v-for="session in telehealthSessions" :key="session.id" 
               class="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50 hover:border-indigo-300 hover:shadow-md transition-all duration-300">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Video class="w-6 h-6 text-white" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">{{ session.petName }}</p>
                  <div class="flex items-center gap-1 mt-1">
                    <User class="w-3 h-3 text-slate-400" />
                    <p class="text-xs text-slate-500">{{ session.ownerName }}</p>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-600">{{ session.date }}, {{ session.time }}</p>
                <span :class="`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${session.status === 'In Progress' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`">
                  {{ session.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
      <div class="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-800 mb-1">Recent Activity</h2>
            <p class="text-sm text-slate-600">Latest updates and notifications</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span class="text-xs font-medium text-emerald-600">Live Updates</span>
          </div>
        </div>
      </div>
      <div class="p-6">
        <div v-if="loading" class="space-y-6">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-slate-200 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                <div class="h-3 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="filteredRecentActivities.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-700 mb-2">No Recent Activities</h3>
          <p class="text-sm text-slate-500 mb-4">When new appointments or updates occur, they'll appear here</p>
          <div class="w-16 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
        </div>
        <div v-else class="space-y-6">
          <div v-for="(activity, index) in filteredRecentActivities" :key="index" 
               class="group relative">
            <!-- Activity Timeline -->
            <div class="flex items-start gap-4">
              <!-- Timeline Line -->
              <div class="relative flex flex-col items-center">
                <div :class="`w-12 h-12 rounded-full ${activity.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 border-2 border-white`">
                  <component :is="activity.icon" class="w-6 h-6" :class="activity.iconColor" />
                </div>
                <div v-if="index < filteredRecentActivities.length - 1" class="w-0.5 h-12 bg-gradient-to-b from-slate-200 to-transparent mt-2"></div>
              </div>
              
              <!-- Activity Content -->
              <div class="flex-1 min-w-0">
                <div class="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200/50 hover:border-slate-300 hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-sm font-bold text-slate-800 mb-1">{{ activity.title }}</h3>
                      <p class="text-sm text-slate-600 leading-relaxed">{{ activity.description }}</p>
                    </div>
                    <div class="flex items-center gap-2 ml-4">
                      <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {{ activity.time }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Status Badge -->
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <div class="w-2 h-2 rounded-full" 
                           :class="activity.status === 'completed' ? 'bg-emerald-500' : 
                                  activity.status === 'approved' ? 'bg-indigo-500' : 
                                  activity.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'">
                      </div>
                      <span class="text-xs font-medium capitalize" 
                            :class="activity.status === 'completed' ? 'text-emerald-600' : 
                                   activity.status === 'approved' ? 'text-indigo-600' : 
                                   activity.status === 'pending' ? 'text-amber-600' : 'text-rose-600'">
                        {{ activity.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- View All Activities Button -->
          <div class="text-center pt-4">
            <button class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200 group">
              <span>View All Activities</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>


<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { 
  Calendar,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Clock,
  PawPrint,
  Cat,
  User,
  Video
} from 'lucide-vue-next'
import LottieIcon from "@/components/icons/LottieIcon.vue"
import { useAppointmentStore } from '@/stores/modules/appointmentStore'
import { useAuthStore } from '@/stores/modules/authStore'
import vetDashboardStatsService from '@/services/vetDashboardStatsService'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// Initialize stores
const appointmentStore = useAppointmentStore()
const authStore = useAuthStore()

// References for chart canvases
const appointmentsChart = ref(null)
const petDistributionChart = ref(null)

// Chart instances
let lineChart = null
let doughnutChart = null

// Get current vet ID
const vetId = computed(() => authStore.currentUser?.userId)

// Loading states
const loading = ref(false)
const statsLoading = ref(false)

const selectedPeriod = ref('1')
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const periodOptions = [
  { value: '1', label: 'Current Month' },
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' }
]

// Get current month and year for chart labels
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()


// Dashboard data refs
const stats = ref([
  { title: 'Total Appointments', value: '0', icon: 'https://cdn.lordicon.com/jkzgajyr.json', color: 'blue', trend: 'up', percentage: '0%' },
  { title: 'Active Patients', value: '0', icon: 'https://cdn.lordicon.com/oqdmuxru.json', color: 'green', trend: 'up', percentage: '0%' },
  { title: 'Online Session', value: '0', icon: 'https://cdn.lordicon.com/jdgfsfzr.json', color: 'purple', trend: 'up', percentage: '0%' },
  { title: 'Walk-in Session', value: '0', icon: 'https://cdn.lordicon.com/vmkushle.json', color: 'orange', trend: 'up', percentage: '0%' }
])

const todaysAppointments = ref([])
const segments = ref([])
const recentActivities = ref([])
const appointments = ref([])
const chartLabels = ref([])

// Fetch dashboard data
const fetchVetDashboardData = async () => {
  try {
    loading.value = true
    statsLoading.value = true
    
    if (!vetId.value) {
      console.error('No vet ID found')
      return
    }
    
    const periodMonths = parseInt(selectedPeriod.value)
    const dashboardStats = await vetDashboardStatsService.getVetDashboardStats(vetId.value, periodMonths)
    
    // Update stats
    stats.value = [
    { 
      title: 'Total Appointments', 
        value: dashboardStats.totalAppointments.toString(), 
      icon: 'https://cdn.lordicon.com/jkzgajyr.json',
      color: 'blue', 
        trend: dashboardStats.comparisonStats.totalAppointments.trend, 
        percentage: `${dashboardStats.comparisonStats.totalAppointments.change}%` 
    },
    { 
      title: 'Active Patients', 
        value: dashboardStats.approvedAppointments.toString(), 
      icon: 'https://cdn.lordicon.com/oqdmuxru.json',
      color: 'green', 
        trend: dashboardStats.comparisonStats.approvedAppointments.trend, 
        percentage: `${dashboardStats.comparisonStats.approvedAppointments.change}%` 
    },
    { 
      title: 'Online Session', 
        value: dashboardStats.onlineSessions.toString(), 
      icon: 'https://cdn.lordicon.com/jdgfsfzr.json',
      color: 'purple', 
        trend: dashboardStats.comparisonStats.onlineSessions.trend, 
        percentage: `${dashboardStats.comparisonStats.onlineSessions.change}%` 
    },
    { 
      title: 'Walk-in Session', 
        value: dashboardStats.walkInSessions.toString(), 
      icon: 'https://cdn.lordicon.com/vmkushle.json',
      color: 'orange', 
        trend: dashboardStats.comparisonStats.walkInSessions.trend, 
        percentage: `${dashboardStats.comparisonStats.walkInSessions.change}%` 
      }
    ]
    
    // Update today's appointments
    todaysAppointments.value = dashboardStats.todayAppointments
    
    // Update pet distribution
    segments.value = dashboardStats.petDistribution
    
    // Update recent activities
    recentActivities.value = dashboardStats.recentActivities.map(activity => ({
      ...activity,
      icon: getActivityIcon(activity.status)
    }))
    
    // Update monthly trend data
    appointments.value = dashboardStats.monthlyTrend.map(item => item.count)
    
    // Update chart labels from service data
    chartLabels.value = dashboardStats.monthlyTrend.map(item => item.period)
    
  } catch (error) {
    console.error('Error fetching vet dashboard data:', error)
    // Set default values on error
    stats.value = [
      { title: 'Total Appointments', value: '0', icon: 'https://cdn.lordicon.com/jkzgajyr.json', color: 'blue', trend: 'up', percentage: '0%' },
      { title: 'Active Patients', value: '0', icon: 'https://cdn.lordicon.com/oqdmuxru.json', color: 'green', trend: 'up', percentage: '0%' },
      { title: 'Online Session', value: '0', icon: 'https://cdn.lordicon.com/jdgfsfzr.json', color: 'purple', trend: 'up', percentage: '0%' },
      { title: 'Walk-in Session', value: '0', icon: 'https://cdn.lordicon.com/vmkushle.json', color: 'orange', trend: 'up', percentage: '0%' }
    ]
    todaysAppointments.value = []
    segments.value = []
    recentActivities.value = []
    appointments.value = Array.from({ length: 12 }, () => 0)
    chartLabels.value = []
  } finally {
    loading.value = false
    statsLoading.value = false
  }
}

const getActivityIcon = (status) => {
  switch (status) {
    case 'approved': return Calendar
    case 'completed': return CheckCircle
    case 'cancelled': return AlertCircle
    case 'pending': return Clock
    default: return Calendar
  }
}


// Computed properties
const filteredStats = computed(() => {
  return stats.value
})

const filteredAppointments = computed(() => {
  return appointments.value
})

const filteredTodaysAppointments = computed(() => {
  return todaysAppointments.value
})

const filteredSegments = computed(() => {
  return segments.value
})

const filteredRecentActivities = computed(() => {
  return recentActivities.value
})

const totalPets = computed(() => filteredSegments.value.reduce((sum, segment) => sum + segment.value, 0))

const telehealthSessions = computed(() => {
  return todaysAppointments.value
    .filter(app => 
      app.service?.toLowerCase().includes('video consultation')
    )
    .map(app => ({
      id: app.id,
      petName: app.petName || 'Unknown Pet',
      ownerName: app.ownerName || 'Unknown Owner',
      date: new Date().toISOString().split('T')[0],
      time: app.time || 'TBD',
      status: app.status || 'Scheduled'
    }))
})

// Helper functions
const getPeriodLabel = () => {
  const period = parseInt(selectedPeriod.value)
  return period === 1 ? 'Current Month' : `Last ${period} Months`
}

const getComparisonLabel = () => {
  const period = parseInt(selectedPeriod.value)
  if (period === 1) {
    return 'from last month'
  } else {
    return `from previous ${period} months`
  }
}

const getChartLabels = () => {
  const period = parseInt(selectedPeriod.value)
  const labels = []
  
  if (period === 1) {
    // For current month, show days from 1st to today
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    for (let day = 1; day <= today.getDate(); day++) {
      labels.push(`${day}/${currentMonth + 1}`)
    }
  } else if (period === 3) {
    // For 3 months, show last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - (i * 7))
      const monthName = months[date.getMonth()]
      const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7)
      labels.push(`${monthName} W${weekNumber}`)
    }
  } else {
    // For 6 and 12 months, show months
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      labels.push(months[date.getMonth()])
    }
  }
  
  return labels
}





// Total appointments count
const totalAppointments = computed(() => {
  return filteredAppointments.value.reduce((sum, count) => sum + count, 0)
})

// Current month appointments count
const currentMonthAppointments = computed(() => {
  return filteredAppointments.value[filteredAppointments.value.length - 1] || 0
})



const generateNewData = () => {
  // No longer needed as we're using real data
  console.log('Chart data updated with real appointments')
}

const formatDate = (date, offset = 0) => {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  return `${months[d.getMonth()]} ${d.getDate()}`
}

// Initialize and update the line chart for appointments overview
const initLineChart = () => {
  if (!appointmentsChart.value) return
  
  const ctx = appointmentsChart.value.getContext('2d')
  
  // Destroy existing chart if it exists
  if (lineChart) lineChart.destroy()
  
  // Create gradient for area fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)')
  gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')
  
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels.value.length > 0 ? chartLabels.value : getChartLabels(),
      datasets: [{
        label: 'Total Appointments',
        data: filteredAppointments.value,
        backgroundColor: gradient,
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgba(168, 85, 247, 1)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#f0f0f0'
          },
          ticks: {
            stepSize: Math.max(1, Math.ceil(Math.max(...filteredAppointments.value) / 5))
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} appointments`;
            }
          }
        }
      }
    }
  })
}

// Initialize and update the doughnut chart for pet distribution
const initDoughnutChart = () => {
  if (!petDistributionChart.value) return
  
  const ctx = petDistributionChart.value.getContext('2d')
  
  // Destroy existing chart if it exists
  if (doughnutChart) doughnutChart.destroy()
  
  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: filteredSegments.value.map(segment => segment.label),
      datasets: [{
        data: filteredSegments.value.map(segment => segment.value),
        backgroundColor: filteredSegments.value.map(segment => segment.color),
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  })
}

const updateCharts = () => {
  initLineChart()
  initDoughnutChart()
}

// Watch for changes in filtered data to update charts
watch([filteredAppointments, filteredSegments], () => {
  updateCharts()
}, { deep: true })

const updateVetDashboard = async () => {
  await fetchVetDashboardData()
  updateCharts()
}

onMounted(async () => {
  selectedPeriod.value = '1'
  
  // Fetch initial dashboard data
  await fetchVetDashboardData()
  
  // Initialize charts after the DOM has been updated
  nextTick(() => {
    updateCharts()
  })
})
</script>
