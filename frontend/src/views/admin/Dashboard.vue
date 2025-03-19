<template>
  <main class="min-h-screen bg-gray-100 rounded-2xl">
    <!-- Combined Month and Year Filter -->
    <div class="mb-4 rounded-md flex justify-end">
      <select
        v-model="selectedDate"
        @change="updateDashboard"
        class="bg-white py-2 px-4 ml-0 text-gray-700 rounded-lg shadow"
      >
        <option v-for="date in dateOptions" :key="date.value" :value="date.value">
          {{ date.label }}
        </option>
      </select>
    </div>

    <!-- Top Row: Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in filteredStats" :key="stat.title" class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500">{{ stat.title }}</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-2">{{ stat.value }}</h3>
          </div>
          <div :class="`bg-${stat.color}-100 p-2 rounded-lg`">
            <component :is="stat.icon" class="w-6 h-6" :class="`text-${stat.color}-600`" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <component :is="stat.trend === 'up' ? ArrowUp : ArrowDown" 
                     :class="`w-4 h-4 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`" />
          <span :class="`${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} text-sm ml-1`">
            {{ stat.percentage }}
          </span>
          <span class="text-gray-500 text-sm ml-2">from last month</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <!-- Appointments Overview (Larger) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Appointments Overview</h3>
            <div class="flex items-center gap-4 mt-2">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                <span class="text-sm text-gray-600">Total Appointments</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ formatDate(new Date(selectedYear, selectedMonth)) }}</span>
                <span class="text-sm font-medium">{{ filteredAppointments[filteredAppointments.length - 2] }} appointments</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">{{ formatDate(new Date(selectedYear, selectedMonth), 1) }}</span>
                <span class="text-sm font-medium">{{ filteredAppointments[filteredAppointments.length - 1] }} appointments</span>
              </div>
            </div>
          </div>
        </div>
        <div class="h-[400px]">
          <canvas ref="appointmentsChart"></canvas>
        </div>
      </div>

      <!-- Today's Appointments -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h3>
        <div class="space-y-4">
          <div v-for="appointment in filteredTodaysAppointments" :key="appointment.id" 
               class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" 
                     :class="appointment.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'">
                </div>
                <component 
                  :is="appointment.petType === 'Cat' ? Cat : PawPrint" 
                  class="w-4 h-4 text-gray-500"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ appointment.time }}</p>
                <p class="text-xs text-gray-500">{{ appointment.petName }} - {{ appointment.service }}</p>
              </div>
            </div>
            <span class="text-xs font-medium" 
                  :class="appointment.status === 'Completed' ? 'text-green-500' : 'text-blue-500'">
              {{ appointment.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pet Categories Donut Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800">Pet Distribution</h3>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-48 h-48">
            <canvas ref="petDistributionChart"></canvas>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-gray-800">{{ totalPets }}</span>
              <span class="flex items-center text-sm text-green-500 mt-1">
                <svg 
                  class="w-3 h-3 mr-1" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <path d="M7 13l5-5 5 5" />
                </svg>
                17.98%
              </span>
            </div>
          </div>
        </div>
        <div class="space-y-2 mt-6">
          <div v-for="segment in filteredSegments" :key="segment.label" 
               class="flex items-center justify-between py-2">
            <div class="flex items-center gap-2">
              <div :style="{ backgroundColor: segment.color }" class="w-3 h-3 rounded-full"></div>
              <span class="text-sm text-gray-600">{{ segment.label }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ segment.value }}</span>
              <span class="text-sm text-gray-500">({{ segment.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Recent Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div class="space-y-4">
          <div v-for="(activity, index) in filteredRecentActivities" :key="index" 
               class="flex items-center justify-between border-b pb-4">
            <div class="flex items-center">
              <div :class="`w-10 h-10 rounded-full ${activity.bgColor} flex items-center justify-center`">
                <component :is="activity.icon" class="w-5 h-5" :class="activity.iconColor" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-800">{{ activity.title }}</p>
                <p class="text-xs text-gray-500">{{ activity.description }}</p>
              </div>
            </div>
            <span class="text-sm text-gray-500">{{ activity.time }}</span>
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
  Users,  
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Clock,
  FootprintsIcon,
  VideoIcon,
  PawPrint,
  Cat
} from 'lucide-vue-next'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

// References for chart canvases
const appointmentsChart = ref(null)
const petDistributionChart = ref(null)

// Chart instances
let lineChart = null
let doughnutChart = null

const selectedDate = ref('')
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const yAxisLabels = ['300', '250', '200', '150', '100', '50']

const dateOptions = computed(() => {
  const options = []
  const currentDate = new Date()
  for (let i = 0; i < 24; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    const label = `${months[date.getMonth()]} ${date.getFullYear()}`
    options.push({ value, label })
  }
  return options
})

const selectedMonth = computed(() => parseInt(selectedDate.value.split('-')[1]) - 1)
const selectedYear = computed(() => parseInt(selectedDate.value.split('-')[0]))

const stats = ref([
  { title: 'Total Appointments', value: '245', icon: Calendar, color: 'blue', trend: 'up', percentage: '12%' },
  { title: 'Active Patients', value: '1,234', icon: Users, color: 'green', trend: 'up', percentage: '8%' },
  { title: 'Online Session', value: '20', icon: VideoIcon, color: 'purple', trend: 'up', percentage: '15%' },
  { title: 'Walk-in Session', value: '18', icon: FootprintsIcon, color: 'orange', trend: 'down', percentage: '4%' }
])

const appointments = ref([])
const todaysAppointments = ref([
  { id: 1, petName: 'Max', ownerName: 'John Doe', service: 'Vaccination', time: '09:00 AM', status: 'Scheduled', petType: 'Dog' },
  { id: 2, petName: 'Luna', ownerName: 'Jane Smith', service: 'Checkup', time: '10:30 AM', status: 'In Progress', petType: 'Cat' },
  { id: 3, petName: 'Buddy', ownerName: 'Mike Johnson', service: 'Grooming', time: '01:00 PM', status: 'Scheduled', petType: 'Dog' },
  { id: 4, petName: 'Whiskers', ownerName: 'Emily Brown', service: 'Dental Cleaning', time: '03:30 PM', status: 'Scheduled', petType: 'Cat' },
  { id: 5, petName: 'Charlie', ownerName: 'Sarah Wilson', service: 'Vaccination', time: '11:00 AM', status: 'Completed', petType: 'Dog' },
  { id: 6, petName: 'Bella', ownerName: 'David Lee', service: 'Checkup', time: '02:30 PM', status: 'In Progress', petType: 'Cat' },
])

const segments = ref([
  { label: 'Dogs', value: 1257, color: '#ef4444', percentage: '35' },  // Red
  { label: 'Cats', value: 984, color: '#f97316', percentage: '32' },   // Orange
  { label: 'Birds', value: 612, color: '#3b82f6', percentage: '20' },  // Blue
  { label: 'Rabbits', value: 306, color: '#a855f7', percentage: '8' }, // Purple
  { label: 'Hamsters', value: 200, color: '#22c55e', percentage: '3' },// Green
  { label: 'Others', value: 100, color: '#eab308', percentage: '2' }   // Yellow  
])

const recentActivities = ref([
  {
    icon: Calendar,
    title: 'New Appointment',
    description: 'Max - Vaccination',
    time: '5 mins ago',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    icon: CheckCircle,
    title: 'Completed Checkup',
    description: 'Luna - Annual Checkup',
    time: '1 hour ago',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    icon: AlertCircle,
    title: 'Emergency Case',
    description: 'Charlie - Stomach Issues',
    time: '2 hours ago',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    icon: Clock,
    title: 'Appointment Rescheduled',
    description: 'Bella - Dental Cleaning',
    time: '3 hours ago',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  }
])

const filteredStats = computed(() => {
  // In a real application, you would filter the stats based on selectedDate
  return stats.value
})

const filteredAppointments = computed(() => {
  // In a real application, you would filter the appointments based on selectedDate
  return appointments.value
})

const filteredTodaysAppointments = computed(() => {
  // In a real application, you would filter today's appointments based on selectedDate
  return todaysAppointments.value
})

const filteredSegments = computed(() => {
  // In a real application, you would filter the segments based on selectedDate
  return segments.value
})

const filteredRecentActivities = computed(() => {
  // In a real application, you would filter the recent activities based on selectedDate
  return recentActivities.value
})

const totalPets = computed(() => filteredSegments.value.reduce((sum, segment) => sum + segment.value, 0))

const formatDate = (date, offset = 0) => {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  return `${months[d.getMonth()]} ${d.getDate()}`
}

const generateNewData = () => {
  appointments.value = Array.from({ length: 12 }, () => Math.floor(Math.random() * (300 - 50 + 1) + 50))
}

const updateDashboard = () => {
  // In a real application, you would fetch new data based on selectedDate
  generateNewData()
  updateCharts()
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
      labels: months,
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
          beginAtZero: false,
          min: 50,
          max: 300,
          grid: {
            color: '#f0f0f0'
          },
          ticks: {
            stepSize: 50
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

onMounted(() => {
  selectedDate.value = dateOptions.value[0].value
  generateNewData()
  
  // Initialize charts after the DOM has been updated
  nextTick(() => {
    updateCharts()
  })
})
</script>