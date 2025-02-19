<template>
  <main class="min-h-screen bg-gray-100">
    <!-- Combined Month and Year Filter -->
    <div class="mb-4 rounded-md flex justify-end">
      <select
        v-model="selectedDate"
        @change="updateVetDashboard"
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
            <LottieIcon :animationPath="stat.icon" width="32px" height="32px" />
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Appointments Overview (Larger) -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-20">
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
          <svg viewBox="0 0 800 300" class="w-full h-full">
            <!-- Gradient definition -->
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#a855f7" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
              </linearGradient>
            </defs>

            <!-- Grid lines -->
            <g stroke="#f0f0f0" stroke-width="1">
              <line v-for="i in 5" :key="i"
                    x1="40" 
                    :y1="50 + (i * 40)" 
                    x2="760" 
                    :y2="50 + (i * 40)" />
            </g>

            <!-- Current month vertical line -->
            <line 
              x1="680" 
              y1="50" 
              x2="680" 
              y2="250" 
              stroke="#e5e7eb" 
              stroke-width="2" 
              stroke-dasharray="4,4"/>

            <!-- Area fill -->
            <path
              :d="`${getLinePath(filteredAppointments)} L 760,250 L 40,250 Z`"
              fill="url(#areaGradient)"
            />

            <!-- Main line -->
            <path
              :d="getLinePath(filteredAppointments)"
              fill="none"
              stroke="#a855f7"
              stroke-width="2"
            />

            <!-- Data points for comparison -->
            <circle
              cx="680"
              :cy="getYPosition(filteredAppointments[filteredAppointments.length - 2])"
              r="4"
              class="fill-white stroke-purple-500 stroke-2"
            />
            <circle
              cx="700"
              :cy="getYPosition(filteredAppointments[filteredAppointments.length - 1])"
              r="4"
              class="fill-white stroke-purple-500 stroke-2"
            />

            <!-- X-axis labels -->
            <g class="text-xs text-gray-500">
              <text v-for="(month, index) in months" :key="month"
                    :x="40 + ((720) / (months.length-1) * index)"
                    y="280"
                    text-anchor="middle"
                    class="fill-gray-500 text-xs">
                {{ month }}
              </text>
            </g>

            <!-- Y-axis labels -->
            <g class="text-xs text-gray-500">
              <text v-for="(value, index) in yAxisLabels" :key="index"
                    x="35"
                    :y="50 + (index * 40)"
                    text-anchor="end"
                    class="fill-gray-500 text-xs">
                {{ value }}
              </text>
            </g>
          </svg>
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
    </div>

    <!-- Telehealth Sessions -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Telehealth Sessions</h3>
      <div class="space-y-4">
        <div v-for="session in telehealthSessions" :key="session.id" 
             class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <Video class="w-5 h-5 text-indigo-500" />
            <div>
              <p class="text-sm font-medium text-gray-800">{{ session.petName }}</p>
              <div class="flex items-center gap-1">
                <User class="w-3 h-3 text-gray-400" />
                <p class="text-xs text-gray-500">{{ session.ownerName }}</p>
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-600">{{ session.date }}, {{ session.time }}</p>
            <span :class="`text-xs font-medium ${session.status === 'In Progress' ? 'text-green-500' : 'text-blue-500'}`">
              {{ session.status }}
            </span>
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
import { ref, computed, onMounted } from 'vue'
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
  { 
    title: 'Total Appointments', 
    value: '245', 
    icon: 'https://cdn.lordicon.com/jkzgajyr.json', // Updated to flat calendar icon
    color: 'blue', 
    trend: 'up', 
    percentage: '12%' 
  },
  { 
    title: 'Active Patients', 
    value: '1,234', 
    icon: 'https://cdn.lordicon.com/oqdmuxru.json', // Updated to flat users icon
    color: 'green', 
    trend: 'up', 
    percentage: '8%' 
  },
  { 
    title: 'Online Session', 
    value: '20', 
    icon: 'https://cdn.lordicon.com/jdgfsfzr.json', // Updated to flat video icon
    color: 'purple', 
    trend: 'up', 
    percentage: '15%' 
  },
  { 
    title: 'Walk-in Session', 
    value: '18', 
    icon: 'https://cdn.lordicon.com/vmkushle.json', // Updated to flat footprints icon
    color: 'orange', 
    trend: 'down', 
    percentage: '4%' 
  }
])


const telehealthSessions = ref([
  { id: 1, petName: 'Buddy', ownerName: 'David Lee', date: '2023-06-15', time: '9:00 AM', status: 'Scheduled' },
  { id: 2, petName: 'Whiskers', ownerName: 'Emma Davis', date: '2023-06-15', time: '11:30 AM', status: 'In Progress' },
  { id: 3, petName: 'Max', ownerName: 'Frank Wilson', date: '2023-06-16', time: '2:00 PM', status: 'Scheduled' },
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

const filteredRecentActivities = computed(() => {
  // In a real application, you would filter the recent activities based on selectedDate
  return recentActivities.value
})

const getYPosition = (value) => {
  const maxValue = 300
  const minValue = 50
  const yScale = 200 / (maxValue - minValue)
  return 250 - ((value - minValue) * yScale)
}

const getLinePath = (data) => {
  const points = data.map((value, index) => ({
    x: 40 + ((720) / (data.length - 1) * index),
    y: getYPosition(value)
  }))

  return points.reduce((acc, point, index, points) => {
    if (index === 0) {
      return `M ${point.x},${point.y}`
    }

    const prev = points[index - 1]
    const curr = point

    const controlPoint1X = prev.x + (curr.x - prev.x) * 0.5
    const controlPoint1Y = prev.y
    const controlPoint2X = curr.x - (curr.x - prev.x) * 0.5
    const controlPoint2Y = curr.y

    return `${acc} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${curr.x},${curr.y}`
  }, '')
}

const generateNewData = () => {
  appointments.value = Array.from({ length: 12 }, () => Math.floor(Math.random() * (300 - 50 + 1) + 50))
}

const formatDate = (date, offset = 0) => {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  return `${months[d.getMonth()]} ${d.getDate()}`
}

const updateVetDashboard = () => {
  // In a real application, you would fetch new data based on selectedDate
  generateNewData()
}

onMounted(() => {
  selectedDate.value = dateOptions.value[0].value
  generateNewData()
})
</script>