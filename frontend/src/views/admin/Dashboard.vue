<template>
  <main class="min-h-screen bg-gray-100">
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

      <!-- Pet Categories Donut Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800">Pet Distribution</h3>
        </div>
        <div class="flex items-center justify-center">
          <div class="relative w-48 h-48">
            <svg viewBox="0 0 100 100" class="transform -rotate-90">
              <circle cx="50" cy="50" r="40" class="fill-white" />
              <circle cx="50" cy="50" r="40" class="fill-none stroke-gray-300 stroke-2" />
              <path
                v-for="(segment, index) in filteredSegments"
                :key="segment.label"
                :d="describeArc(50, 50, 39, getStartAngle(index), getEndAngle(index))"
                :fill="segment.color"
              />
              <circle cx="50" cy="50" r="32" class="fill-white" />
            </svg>
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
import { ref, computed, onMounted } from 'vue'
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

const selectedDate = ref('')
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septembar', 'October', 'November', 'December']
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

const getStartAngle = (index) => {
  const prevSegments = filteredSegments.value.slice(0, index)
  const prevTotal = prevSegments.reduce((sum, segment) => sum + segment.value, 0)
  return (prevTotal / totalPets.value) * 360
}

const getEndAngle = (index) => {
  const prevSegments = filteredSegments.value.slice(0, index + 1)
  const prevTotal = prevSegments.reduce((sum, segment) => sum + segment.value, 0)
  return (prevTotal / totalPets.value) * 360
}

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z'
  ].join(' ')
}

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

const updateDashboard = () => {
  // In a real application, you would fetch new data based on selectedDate
  generateNewData()
}

onMounted(() => {
  selectedDate.value = dateOptions.value[0].value
  generateNewData()
})
</script>

