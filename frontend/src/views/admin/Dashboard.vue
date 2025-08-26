<template>
  <main class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p class="text-slate-600 mt-1">Monitor your veterinary clinic's performance</p>
        </div>
        
        <!-- Time Period Filter -->
        <div class="relative">
      <select
            v-model="selectedPeriod"
        @change="updateDashboard"
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
            <component :is="stat.icon" class="w-6 h-6" :class="`text-${stat.color}-600`" />
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
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-800">Today's Schedule</h3>
            <button 
              @click="toggleTodaySidebar"
              class="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 hover:scale-105 transition-transform duration-200"
            >
              <span>View All</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
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
                 :class="[
                   'group p-4 rounded-xl transition-all duration-300 border',
                   appointment.timeStatus === 'past' 
                     ? 'bg-slate-50/50 border-slate-200/30 opacity-60' 
                     : appointment.timeStatus === 'current'
                     ? 'bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200/50 shadow-md'
                     : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border-slate-200/50'
                 ]">
              <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" 
                         :class="appointment.timeStatus === 'past' ? 'bg-slate-400' : 
                                appointment.timeStatus === 'current' ? 'bg-emerald-500 animate-pulse' : 
                                appointment.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'">
                </div>
                <component 
                  :is="appointment.petType === 'Cat' ? Cat : PawPrint" 
                      :class="[
                        'w-4 h-4',
                        appointment.timeStatus === 'past' ? 'text-slate-400' : 'text-slate-500'
                      ]"
                />
              </div>
              <div>
                    <p :class="[
                      'text-sm font-semibold',
                      appointment.timeStatus === 'past' ? 'text-slate-500' : 'text-slate-800'
                    ]">{{ appointment.time }}</p>
                    <p :class="[
                      'text-xs',
                      appointment.timeStatus === 'past' ? 'text-slate-400' : 'text-slate-600'
                    ]">{{ appointment.petName }} - {{ appointment.service }}</p>
                    <p :class="[
                      'text-xs',
                      appointment.timeStatus === 'past' ? 'text-slate-400' : 'text-slate-500'
                    ]">{{ appointment.doctorName }}</p>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-xs font-medium px-2 py-1 rounded-full" 
                        :class="appointment.timeStatus === 'past' ? 'bg-slate-100 text-slate-500' :
                               appointment.timeStatus === 'current' ? 'bg-emerald-100 text-emerald-700' :
                               appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'">
                    {{ appointment.status }}
                  </span>
                  <span v-if="appointment.timeStatus === 'past'" class="text-xs text-slate-400">
                    Completed
                  </span>
                  <span v-else-if="appointment.timeStatus === 'current'" class="text-xs text-emerald-600 font-medium">
                    In Progress
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

    <!-- Bottom Row: Recent Activity -->
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

  <!-- Today's Appointments Sidebar -->
  <div 
    v-if="showTodaySidebar" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    @click="closeTodaySidebar"
  ></div>
  
  <div 
    :class="`fixed top-0 right-0 h-full w-[500px] bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-500 ease-out z-50 ${
      showTodaySidebar ? 'translate-x-0' : 'translate-x-full'
    }`"
  >
    <div class="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 mb-1">Today's Schedule</h2>
        <p class="text-sm text-slate-600">Manage and view all appointments</p>
      </div>
      <button 
        @click="closeTodaySidebar"
        class="text-slate-500 hover:text-slate-700 hover:scale-110 transition-all duration-200 p-2 rounded-lg hover:bg-slate-100"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Filter Section -->
    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
      <div class="mb-4">
        <label class="block text-sm font-semibold text-slate-700 mb-2">Filter by Veterinary</label>
        <select 
          v-model="selectedVetFilter"
          @change="filterTodayAppointments"
          :disabled="loadingVets"
          class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
        >
          <option value="" v-if="!loadingVets">All Veterinaries</option>
          <option value="" v-if="loadingVets">Loading veterinaries...</option>
          <option v-for="vet in availableVets" :key="vet.doctorId" :value="vet.doctorId">
            {{ vet.doctorName }}
          </option>
        </select>
      </div>
      
      <div class="flex items-center justify-between text-sm text-slate-600">
        <span class="font-medium">Total: {{ filteredTodayAppointments.length }} appointments</span>
        <button 
          @click="clearVetFilter"
          v-if="selectedVetFilter"
          class="text-indigo-600 hover:text-indigo-700 font-medium hover:scale-105 transition-transform duration-200"
        >
          Clear Filter
        </button>
      </div>
    </div>

    <!-- Appointments List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-6 space-y-4">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="bg-slate-200 h-24 rounded-xl"></div>
        </div>
      </div>
      
      <div v-else-if="filteredTodayAppointments.length === 0" class="p-6 text-center">
        <div class="text-slate-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <p class="text-slate-500 font-medium">No appointments found</p>
        <p class="text-sm text-slate-400 mt-1">
          {{ selectedVetFilter ? 'Try changing the filter or check back later' : 'No appointments scheduled for today' }}
        </p>
      </div>
      
      <div v-else class="p-6 space-y-4">
        <div 
          v-for="appointment in filteredTodayAppointments" 
          :key="appointment.id"
          :class="[
            'rounded-xl p-6 border transition-all duration-300 group',
            appointment.timeStatus === 'past' 
              ? 'bg-slate-50/50 border-slate-200/30 opacity-70' 
              : appointment.timeStatus === 'current'
              ? 'bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200/50 shadow-lg'
              : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:border-indigo-300 hover:shadow-lg border-slate-200/50'
          ]"
        >
          <!-- Header with Status and Time -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" 
                     :class="appointment.timeStatus === 'past' ? 'bg-slate-400' : 
                            appointment.timeStatus === 'current' ? 'bg-emerald-500 animate-pulse' :
                            appointment.status === 'completed' ? 'bg-emerald-500' : 
                            appointment.status === 'approved' ? 'bg-indigo-500' : 
                            appointment.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'">
                </div>
                <component 
                  :is="appointment.petType === 'Cat' ? Cat : PawPrint" 
                  :class="[
                    'w-5 h-5 group-hover:scale-110 transition-transform duration-200',
                    appointment.timeStatus === 'past' ? 'text-slate-400' : 'text-slate-500'
                  ]"
                />
              </div>
              <div>
                <p :class="[
                  'text-lg font-bold',
                  appointment.timeStatus === 'past' ? 'text-slate-500' : 'text-slate-800'
                ]">{{ appointment.time }}</p>
                <p :class="[
                  'text-sm',
                  appointment.timeStatus === 'past' ? 'text-slate-400' : 'text-slate-600'
                ]">{{ appointment.service }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-xs font-medium px-3 py-1 rounded-full" 
                    :class="appointment.timeStatus === 'past' ? 'bg-slate-100 text-slate-500' :
                           appointment.timeStatus === 'current' ? 'bg-emerald-100 text-emerald-700' :
                           appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                           appointment.status === 'approved' ? 'bg-indigo-100 text-indigo-700' : 
                           appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'">
                {{ appointment.status }}
              </span>
              <span v-if="appointment.timeStatus === 'past'" class="text-xs text-slate-400">
                Completed
              </span>
              <span v-else-if="appointment.timeStatus === 'current'" class="text-xs text-emerald-600 font-medium">
                In Progress
              </span>
            </div>
          </div>
          
          <!-- Pet and Owner Info -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <p class="text-xs font-medium text-slate-500 mb-1">Pet Information</p>
              <p class="text-sm font-semibold text-slate-800">{{ appointment.petName }}</p>
              <p class="text-xs text-slate-600">{{ appointment.petType }}</p>
            </div>
            <div class="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <p class="text-xs font-medium text-slate-500 mb-1">Owner</p>
              <p class="text-sm font-semibold text-slate-800">{{ appointment.ownerName }}</p>
            </div>
          </div>
          
          <!-- Doctor Assignment - Highlighted -->
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-indigo-600 mb-1">ASSIGNED VETERINARY</p>
                <p class="text-lg font-bold text-slate-800">{{ appointment.doctorName }}</p>
              </div>
              <div class="text-right">
                <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
import dashboardStatsService from '@/services/dashboardStatsService'

// Register Chart.js components
Chart.register(...registerables)

// References for chart canvases
const appointmentsChart = ref(null)
const petDistributionChart = ref(null)

// Chart instances
let lineChart = null
let doughnutChart = null

// Loading states
const loading = ref(false)
const statsLoading = ref(false)

const selectedPeriod = ref('1')

// Sidebar state
const showTodaySidebar = ref(false)
const selectedVetFilter = ref('')
const filteredTodayAppointments = ref([])
const availableVets = ref([])
const loadingVets = ref(false)
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const yAxisLabels = ['300', '250', '200', '150', '100', '50']

const periodOptions = [
  { value: '1', label: 'Current Month' },
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' }
]

const stats = ref([
  { title: 'Total Appointments', value: '0', icon: Calendar, color: 'blue', trend: 'up', percentage: '0%' },
  { title: 'Active Patients', value: '0', icon: Users, color: 'green', trend: 'up', percentage: '0%' },
  { title: 'Online Session', value: '0', icon: VideoIcon, color: 'purple', trend: 'up', percentage: '0%' },
  { title: 'Walk-in Session', value: '0', icon: FootprintsIcon, color: 'orange', trend: 'down', percentage: '0%' }
])

const appointments = ref([])
const todaysAppointments = ref([])

const segments = ref([])

const recentActivities = ref([])

const filteredStats = computed(() => {
  return stats.value
})

const filteredAppointments = computed(() => {
  return appointments.value
})

const filteredTodaysAppointments = computed(() => {
  return todaysAppointments.value.map(appointment => {
    // Determine if appointment is past, current, or future
    const now = new Date();
    const appointmentTime = appointment.time; // e.g., "10:10 AM - 11:20 AM"
    
    // Extract start time from the time range
    let startTime = appointmentTime;
    if (appointmentTime && appointmentTime.includes('-')) {
      startTime = appointmentTime.split('-')[0].trim();
    }
    
    // Parse the start time
    let appointmentDateTime = new Date();
    if (startTime) {
      const timeMatch = startTime.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3]?.toLowerCase();
        
        // Convert to 24-hour format
        if (period === 'pm' && hours !== 12) {
          hours += 12;
        } else if (period === 'am' && hours === 12) {
          hours = 0;
        }
        
        appointmentDateTime.setHours(hours, minutes, 0, 0);
      }
    }
    
    // Calculate duration in minutes
    let durationMinutes = 30; // default
    if (appointmentTime && appointmentTime.includes('-')) {
      const [start, end] = appointmentTime.split('-').map(t => t.trim());
      const startMatch = start.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      const endMatch = end.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      
      if (startMatch && endMatch) {
        let startHour = parseInt(startMatch[1]);
        const startMinute = parseInt(startMatch[2]);
        const startPeriod = startMatch[3]?.toLowerCase();
        
        let endHour = parseInt(endMatch[1]);
        const endMinute = parseInt(endMatch[2]);
        const endPeriod = endMatch[3]?.toLowerCase();
        
        // Convert to 24-hour format
        if (startPeriod === 'pm' && startHour < 12) startHour += 12;
        if (startPeriod === 'am' && startHour === 12) startHour = 0;
        if (endPeriod === 'pm' && endHour < 12) endHour += 12;
        if (endPeriod === 'am' && endHour === 12) endHour = 0;
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        durationMinutes = endMinutes - startMinutes;
      }
    }
    
    // Calculate end time
    const endDateTime = new Date(appointmentDateTime.getTime() + durationMinutes * 60000);
    
    // Determine appointment status
    let timeStatus = 'future';
    if (now > endDateTime) {
      timeStatus = 'past';
    } else if (now >= appointmentDateTime && now <= endDateTime) {
      timeStatus = 'current';
    }
    
    return {
      ...appointment,
      timeStatus,
      appointmentDateTime,
      endDateTime
    };
  });
})

const filteredSegments = computed(() => {
  return segments.value
})

const filteredRecentActivities = computed(() => {
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

const fetchDashboardData = async () => {
  try {
    loading.value = true
    statsLoading.value = true
    
    const periodMonths = parseInt(selectedPeriod.value)
    const dashboardStats = await dashboardStatsService.getDashboardStats(periodMonths)
    
    // Update stats
    stats.value = [
      { 
        title: 'Total Appointments', 
        value: dashboardStats.totalAppointments.toString(), 
        icon: Calendar, 
        color: 'blue', 
        trend: dashboardStats.comparisonStats.totalAppointments.trend, 
        percentage: `${dashboardStats.comparisonStats.totalAppointments.change}%` 
      },
      { 
        title: 'Active Patients', 
        value: dashboardStats.approvedAppointments.toString(), 
        icon: Users, 
        color: 'green', 
        trend: dashboardStats.comparisonStats.approvedAppointments.trend, 
        percentage: `${dashboardStats.comparisonStats.approvedAppointments.change}%` 
      },
             { 
         title: 'Online Session', 
         value: dashboardStats.onlineSessions.toString(), 
         icon: VideoIcon, 
         color: 'purple', 
         trend: dashboardStats.comparisonStats.onlineSessions.trend, 
         percentage: `${dashboardStats.comparisonStats.onlineSessions.change}%` 
       },
       { 
         title: 'Walk-in Session', 
         value: dashboardStats.walkInSessions.toString(), 
         icon: FootprintsIcon, 
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
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Set default values on error
         stats.value = [
       { title: 'Total Appointments', value: '0', icon: Calendar, color: 'blue', trend: 'up', percentage: '0%' },
       { title: 'Active Patients', value: '0', icon: Users, color: 'green', trend: 'up', percentage: '0%' },
       { title: 'Online Session', value: '0', icon: VideoIcon, color: 'purple', trend: 'up', percentage: '0%' },
       { title: 'Walk-in Session', value: '0', icon: FootprintsIcon, color: 'orange', trend: 'up', percentage: '0%' }
     ]
    todaysAppointments.value = []
    segments.value = []
    recentActivities.value = []
    appointments.value = Array.from({ length: 12 }, () => 0)
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

const getPeriodLabel = () => {
  const period = parseInt(selectedPeriod.value)
  return period === 1 ? 'Current Month' : `Last ${period} Months`
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

const getComparisonLabel = () => {
  const period = parseInt(selectedPeriod.value)
  if (period === 1) {
    return 'from previous month'
  } else {
    return `from previous ${period} months`
  }
}

const updateDashboard = async () => {
  await fetchDashboardData()
  updateCharts()
}

// Sidebar methods
const toggleTodaySidebar = async () => {
  showTodaySidebar.value = !showTodaySidebar.value
  if (showTodaySidebar.value) {
    await initializeTodaySidebar()
  }
}

const closeTodaySidebar = () => {
  showTodaySidebar.value = false
}

const initializeTodaySidebar = async () => {
  // Set filtered appointments to all today's appointments
  filteredTodayAppointments.value = todaysAppointments.value
  
  // Fetch all active veterinaries from users collection
  loadingVets.value = true
  try {
    const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore')
    const db = getFirestore()
    
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('role', '==', 'veterinary'),
      where('status', '==', 'active')
    )
    
    const querySnapshot = await getDocs(q)
    const vets = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      vets.push({
        doctorId: doc.id,
        doctorName: `${data.title || ''} ${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown Veterinary'
      })
    })
    
    availableVets.value = vets
  } catch (error) {
    console.error('Error fetching veterinaries:', error)
    // Fallback to extracting from appointments if users fetch fails
    const vets = new Map()
    todaysAppointments.value.forEach(apt => {
      if (apt.doctorId && apt.doctorName) {
        vets.set(apt.doctorId, {
          doctorId: apt.doctorId,
          doctorName: apt.doctorName
        })
      }
    })
    availableVets.value = Array.from(vets.values())
  } finally {
    loadingVets.value = false
  }
}

const filterTodayAppointments = () => {
  if (!selectedVetFilter.value) {
    filteredTodayAppointments.value = todaysAppointments.value
  } else {
    filteredTodayAppointments.value = todaysAppointments.value.filter(
      apt => apt.doctorId === selectedVetFilter.value
    )
  }
}

const clearVetFilter = () => {
  selectedVetFilter.value = ''
  filteredTodayAppointments.value = todaysAppointments.value
}

// Initialize and update the line chart for appointments overview
const initLineChart = () => {
  if (!appointmentsChart.value) return
  
  const ctx = appointmentsChart.value.getContext('2d')
  
  // Destroy existing chart if it exists
  if (lineChart) lineChart.destroy()
  
  // Create gradient for area fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)') // Indigo
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
  
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: getChartLabels(),
      datasets: [{
        label: 'Total Appointments',
        data: filteredAppointments.value,
        backgroundColor: gradient,
        borderColor: 'rgba(99, 102, 241, 1)', // Indigo
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'white',
        pointBorderColor: 'rgba(99, 102, 241, 1)',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointHoverBorderColor: 'white'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.1)',
            drawBorder: false
          },
          ticks: {
            stepSize: Math.max(1, Math.ceil(Math.max(...filteredAppointments.value) / 5)),
            color: 'rgba(71, 85, 105, 0.8)',
            font: {
              size: 12,
              weight: '500'
            }
          },
          border: {
            display: false
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgba(71, 85, 105, 0.8)',
            font: {
              size: 12,
              weight: '500'
            }
          },
          border: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1e293b',
          bodyColor: '#475569',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          cornerRadius: 8,
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
        hoverOffset: 8,
        borderRadius: 4
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1e293b',
          bodyColor: '#475569',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
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

onMounted(async () => {
  selectedPeriod.value = '1'
  
  // Fetch initial dashboard data
  await fetchDashboardData()
  
  // Initialize charts after the DOM has been updated
  nextTick(() => {
    // Add a small delay to ensure DOM is fully rendered
    setTimeout(() => {
    updateCharts()
    }, 100)
  })
})
</script>