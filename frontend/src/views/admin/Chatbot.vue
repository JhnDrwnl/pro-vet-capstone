<template>
    <div class="flex h-screen bg-gray-50">
      <!-- Main Content -->
      <main class="flex-1 ml-64">
    
        <!-- Dashboard Content -->
        <div class="p-6">
          <!-- Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Total Appointments -->
            <div class="bg-white p-6 rounded-xl border border-gray-200">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Total Appointments</h3>
                  <p class="text-2xl font-semibold text-gray-800">245</p>
                </div>
                <span class="px-2 py-1 text-sm text-green-600 bg-green-50 rounded-full">+12.5%</span>
              </div>
              <div class="h-12 flex items-end space-x-1">
                <div class="w-1/6 bg-blue-100 rounded-t" style="height: 40%"></div>
                <div class="w-1/6 bg-blue-100 rounded-t" style="height: 60%"></div>
                <div class="w-1/6 bg-blue-100 rounded-t" style="height: 30%"></div>
                <div class="w-1/6 bg-blue-100 rounded-t" style="height: 80%"></div>
                <div class="w-1/6 bg-blue-100 rounded-t" style="height: 50%"></div>
                <div class="w-1/6 bg-blue-300 rounded-t" style="height: 70%"></div>
              </div>
            </div>
  
            <!-- Revenue -->
            <div class="bg-white p-6 rounded-xl border border-gray-200">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p class="text-2xl font-semibold text-gray-800">$12.5k</p>
                </div>
                <span class="px-2 py-1 text-sm text-green-600 bg-green-50 rounded-full">+8.2%</span>
              </div>
              <div class="h-12 flex items-end space-x-1">
                <div class="w-1/6 bg-green-100 rounded-t" style="height: 60%"></div>
                <div class="w-1/6 bg-green-100 rounded-t" style="height: 40%"></div>
                <div class="w-1/6 bg-green-100 rounded-t" style="height: 80%"></div>
                <div class="w-1/6 bg-green-100 rounded-t" style="height: 30%"></div>
                <div class="w-1/6 bg-green-100 rounded-t" style="height: 50%"></div>
                <div class="w-1/6 bg-green-300 rounded-t" style="height: 90%"></div>
              </div>
            </div>
  
            <!-- Patient Visits -->
            <div class="bg-white p-6 rounded-xl border border-gray-200">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Patient Visits</h3>
                  <p class="text-2xl font-semibold text-gray-800">186</p>
                </div>
                <span class="px-2 py-1 text-sm text-red-600 bg-red-50 rounded-full">-4.3%</span>
              </div>
              <div class="h-12 flex items-end space-x-1">
                <div class="w-1/6 bg-purple-100 rounded-t" style="height: 70%"></div>
                <div class="w-1/6 bg-purple-100 rounded-t" style="height: 50%"></div>
                <div class="w-1/6 bg-purple-100 rounded-t" style="height: 60%"></div>
                <div class="w-1/6 bg-purple-100 rounded-t" style="height: 40%"></div>
                <div class="w-1/6 bg-purple-100 rounded-t" style="height: 30%"></div>
                <div class="w-1/6 bg-purple-300 rounded-t" style="height: 20%"></div>
              </div>
            </div>
          </div>
  
          <!-- Bottom Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Upcoming Appointment -->
            <div class="bg-white p-6 rounded-xl border border-gray-200">
              <h3 class="text-lg font-medium mb-4">Upcoming Appointment</h3>
              <div class="space-y-4">
                <div class="border-b border-gray-200 pb-4">
                  <p class="text-sm text-gray-600"><strong>Time:</strong> 10:30 AM</p>
                  <p class="text-sm text-gray-600"><strong>Pet:</strong> Dog (Max)</p>
                  <p class="text-sm text-gray-600"><strong>Owner:</strong> John Doe</p>
                  <p class="text-sm text-gray-600"><strong>Type of Service:</strong> Vaccination</p>
                </div>
                <div class="border-b border-gray-200 pb-4">
                  <p class="text-sm text-gray-600"><strong>Time:</strong> 11:00 AM</p>
                  <p class="text-sm text-gray-600"><strong>Pet:</strong> Cat (Luna)</p>
                  <p class="text-sm text-gray-600"><strong>Owner:</strong> Jane Smith</p>
                  <p class="text-sm text-gray-600"><strong>Type of Service:</strong> Check-up</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600"><strong>Time:</strong> 1:00 PM</p>
                  <p class="text-sm text-gray-600"><strong>Pet:</strong> Bird (Polly)</p>
                  <p class="text-sm text-gray-600"><strong>Owner:</strong> Mark Brown</p>
                  <p class="text-sm text-gray-600"><strong>Type of Service:</strong> Wing Clipping</p>
                </div>
              </div>
            </div>
  
            <!-- Pet Type Distribution (Pie Chart) -->
            <div class="bg-white p-6 rounded-xl border border-gray-200">
              <h3 class="text-lg font-medium mb-4">Pet Type Distribution</h3>
              <PieChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { Calendar } from 'lucide-vue-next';
  import { Pie } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
  
  // Register chart components
  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
  
  // Data for Pet Type Distribution
  const chartData = {
    labels: ['Dogs', 'Cats', 'Birds'],
    datasets: [
      {
        data: [45, 35, 20], // The percentages of dogs, cats, and birds
        backgroundColor: ['#4A90E2', '#F5A623', '#E94E77'], // Color for each segment
        hoverBackgroundColor: ['#3578C6', '#D88B1B', '#D13C66'],
      },
    ],
  };
  
  // Options for Pie chart
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
          },
        },
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add styles as needed */
  </style>
  