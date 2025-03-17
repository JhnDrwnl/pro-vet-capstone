<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
      <p class="text-gray-500 mt-1">Track your veterinary practice performance metrics</p>
    </div>
    
      
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Peak Hours Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Peak Hours</h2>
        <p class="text-gray-500 text-sm mb-4">Busiest appointment times throughout the day</p>
        <div class="h-64">
          <Bar :data="peakHoursData" :options="peakHoursOptions" />
        </div>
      </div>
      
      <!-- Service Utilization Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Service Utilization</h2>
        <p class="text-gray-500 text-sm mb-4">Most frequently used veterinary services</p>
        <div class="h-64">
          <Pie :data="serviceUtilizationData" :options="pieOptions" />
        </div>
      </div>
      
      <!-- Online vs. Walk-in Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Online vs. Walk-in</h2>
        <p class="text-gray-500 text-sm mb-4">Appointment booking method distribution</p>
        <div class="h-64">
          <Bar :data="appointmentTypeData" :options="stackedBarOptions" />
        </div>
      </div>
      
      <!-- Chatbot Usage Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Chatbot Usage</h2>
        <p class="text-gray-500 text-sm mb-4">Number of chatbot interactions over time</p>
        <div class="h-64">
          <Line :data="chatbotUsageData" :options="lineOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar, Line, Pie } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
)

// Colors from Dashboard.vue
const colors = {
  purple: '#a855f7',      // Purple-500
  purpleLight: 'rgba(168, 85, 247, 0.2)',
  red: '#ef4444',         // Red from pet distribution
  orange: '#f97316',      // Orange from pet distribution
  blue: '#3b82f6',        // Blue from pet distribution
  green: '#22c55e',       // Green from pet distribution
  yellow: '#eab308'       // Yellow from pet distribution
}

// Peak Hours Data - Using purple from appointments chart
const peakHoursData = ref({
  labels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
  datasets: [
    {
      label: 'Number of Appointments',
      backgroundColor: colors.purpleLight,
      borderColor: colors.purple,
      borderWidth: 2,
      data: [5, 8, 12, 15, 10, 7, 14, 16, 9, 6]
    }
  ]
})

const peakHoursOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
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
      padding: 10
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f0f0f0'
      },
      title: {
        display: true,
        text: 'Number of Appointments',
        color: '#666'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
})

// Service Utilization Data - Using pet distribution colors
const serviceUtilizationData = ref({
  labels: ['Vaccinations', 'Check-ups', 'Surgeries', 'Dental Care', 'Grooming'],
  datasets: [
    {
      backgroundColor: [colors.red, colors.orange, colors.blue, colors.purple, colors.green],
      data: [35, 25, 15, 15, 10],
      borderWidth: 0
    }
  ]
})

const pieOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#666'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 10
    }
  }
})

// Online vs. Walk-in Data - Using purple and orange
const appointmentTypeData = ref({
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  datasets: [
    {
      label: 'Online',
      backgroundColor: colors.blue,
      data: [20, 25, 22, 18, 26, 15]
    },
    {
      label: 'Walk-in',
      backgroundColor: colors.red,
      data: [10, 8, 12, 9, 11, 5]
    }
  ]
})

const stackedBarOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 10
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false
      }
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: '#f0f0f0'
      },
      title: {
        display: true,
        text: 'Number of Appointments',
        color: '#666'
      }
    }
  }
})

// Chatbot Usage Data - Using purple gradient like appointments chart
const chatbotUsageData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  datasets: [
    {
      label: 'Chatbot Interactions',
      backgroundColor: colors.purpleLight,
      borderColor: colors.purple,
      borderWidth: 2,
      pointBackgroundColor: 'white',
      pointBorderColor: colors.purple,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
      data: [120, 150, 180, 220, 250, 310, 350, 410, 480]
    }
  ]
})

const lineOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 10
    },
    legend: {
      labels: {
        color: '#666'
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f0f0f0'
      },
      title: {
        display: true,
        text: 'Number of Interactions',
        color: '#666'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
})

// Create gradient for line chart on mount
onMounted(() => {
  const lineChartCanvas = document.querySelector('canvas')
  if (lineChartCanvas) {
    const ctx = lineChartCanvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)')
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')
      
      chatbotUsageData.value.datasets[0].backgroundColor = gradient
    }
  }
})
</script>