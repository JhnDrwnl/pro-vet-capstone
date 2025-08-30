<!-- views/vet/VetQueue.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 -mt-4 md:mt-0">
    <!-- Main content area with adjusted padding for mobile -->
    <div class="flex flex-col flex-1 px-0 md:px-4 pb-20 pt-14 md:pt-0 md:pb-4">
      <!-- Page Header -->
      <div class="mb-6 md:mb-8">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Queue Management</h1>
        <p class="text-gray-600 mt-2 text-sm md:text-base">Manage today's patient consultations and monitor queue status</p>
      </div>

      <!-- Queue Stats - Enhanced with gradients and better styling -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 md:p-6 shadow-sm border border-blue-200">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-xl md:text-2xl font-bold text-gray-900">{{ queueStats.total }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 md:p-6 shadow-sm border border-green-200">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Waiting</p>
              <p class="text-xl md:text-2xl font-bold text-green-600">{{ queueStats.waiting }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 md:p-6 shadow-sm border border-blue-200">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">In Progress</p>
              <p class="text-xl md:text-2xl font-bold text-blue-600">{{ queueStats.inProgress }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Completed</p>
              <p class="text-xl md:text-2xl font-bold text-gray-600">{{ queueStats.completed }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Patient - Enhanced Design -->
      <div v-if="currentPatient" class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-bold text-gray-900">Currently Consulting</h2>
              <p class="text-green-600 font-medium text-sm md:text-base">Session in Progress</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500 mb-1">Started at</div>
            <div class="text-lg font-semibold text-gray-900">{{ formatTime(currentPatient.startTime) }}</div>
          </div>
        </div>
        
        <!-- Patient Info Section -->
        <div class="mb-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-1">{{ currentPatient.ownerName }}</h3>
              <p class="text-base md:text-lg text-blue-600 font-medium">{{ currentPatient.petName }}</p>
              <p class="text-sm md:text-base text-gray-600">{{ currentPatient.serviceName }}</p>
            </div>
          </div>
          
          <!-- Telehealth indicator -->
          <div v-if="isTelehealthAppointment(currentPatient)" class="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Telehealth Session
          </div>
        </div>
      
      <!-- Action Buttons - Compact Design -->
      <div class="space-y-4">

        
        <!-- Primary Actions Row -->
        <div class="flex flex-wrap gap-2">
          <!-- Main Action Button -->
          <button 
            v-if="!currentPatient.hasVaccinationServices"
            @click="openCompletionForm(currentPatient)"
            class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Mark as Done
          </button>
          
          <button 
            v-else
            @click="redirectToApprovalPage(currentPatient.id)"
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Complete Vaccination
          </button>
          
          <!-- Telehealth Button -->
          <button 
            v-if="isTelehealthAppointment(currentPatient)"
            @click="startTelehealthConsultation"
            :disabled="!canStartTelehealth(currentPatient)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm',
              canStartTelehealth(currentPatient) 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            {{ canRejoinCall ? 'Rejoin Call' : getStartButtonText(currentPatient) }}
          </button>
        </div>
        
        <!-- Secondary Actions Row -->
        <div class="flex flex-wrap gap-2">
          <!-- Secondary Action Buttons -->
          <button 
            @click="redirectToRescheduleReconsideration(currentPatient.id)"
            class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm"
            title="Reconsider reschedule for current patient"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Reschedule
          </button>
          
          <button 
            @click="returnPatientToQueue"
            class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm"
            title="Return patient to queue (if accidentally called)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            Return to Queue
          </button>
          
          <button 
            @click="clearCurrentPatient"
            class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md flex items-center gap-2 text-sm"
            title="Clear current patient (for debugging)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Clear
          </button>
        </div>
      </div>
      
      <!-- Time Status for Current Patient -->
      <div v-if="isTelehealthAppointment(currentPatient)" class="mt-6 p-4 bg-white rounded-xl border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                 :class="getTimeStatusClass(currentPatient)">
              <span v-if="getTimeStatus(currentPatient) === 'ready'">🟢 Ready for Call</span>
              <span v-else-if="getTimeStatus(currentPatient) === 'waiting'">🟡 Waiting for Time</span>
              <span v-if="getTimeStatus(currentPatient) === 'early'">🔵 Too Early</span>
              <span v-if="getTimeStatus(currentPatient) === 'expired'">🔴 Time Expired</span>
            </div>
            <div class="text-sm text-gray-600 mt-2">
              {{ getTimeInfo(currentPatient) }}
            </div>
          </div>
          
          <!-- Debug info and refresh button -->
          <div class="flex items-center gap-3">
            <button 
              @click="refreshAppointmentData"
              class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
              title="Refresh appointment data"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
            <span v-if="currentPatient._fromQueue" class="px-3 py-2 text-sm text-orange-600 bg-orange-100 rounded-lg border border-orange-200">
              From Queue
            </span>
          </div>
        </div>
      </div>
    </div>

      <!-- Queue Controls - Enhanced Design -->
      <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8 mb-6 md:mb-8 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Queue Management</h2>
              <p class="text-gray-600 text-sm">Control patient flow and system status</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Xirsys Status Indicator -->
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm" 
                 :class="{
                   'bg-green-100 text-green-800 border border-green-200': xirsysStatus === 'available',
                   'bg-yellow-100 text-yellow-800 border border-yellow-200': xirsysStatus === 'limited',
                   'bg-red-100 text-red-800 border border-red-200': xirsysStatus === 'unavailable',
                   'bg-yellow-100 text-yellow-800 border border-yellow-200': xirsysStatus === 'checking'
                 }">
              <div class="w-2 h-2 rounded-full" :class="{
                'bg-green-500': xirsysStatus === 'available',
                'bg-yellow-500': xirsysStatus === 'limited',
                'bg-red-500': xirsysStatus === 'unavailable',
                'bg-yellow-500': xirsysStatus === 'checking'
              }"></div>
              <span class="text-sm font-medium">
                {{ xirsysStatus === 'available' ? 'Xirsys Ready' : 
                   xirsysStatus === 'limited' ? 'Xirsys Limited' :
                   xirsysStatus === 'unavailable' ? 'Xirsys Unavailable' : 
                   'Checking Xirsys...' }}
              </span>
            </div>
            
            <!-- Queue Status -->
            <div class="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm"
                 :class="queuePaused ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'">
              <div class="w-2 h-2 rounded-full" :class="queuePaused ? 'bg-red-500' : 'bg-green-500'"></div>
              <span class="text-sm font-medium">{{ queuePaused ? 'Queue Paused' : 'Queue Active' }}</span>
            </div>
            

          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button 
            @click="callNextWithConfirmation"
            :disabled="!canCallNext"
            class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:transform-none flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            Call Next Patient
          </button>
          <button 
            @click="pauseQueue"
            :disabled="!canPause"
            class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:transform-none flex items-center justify-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7 3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ queuePaused ? 'Resume Queue' : 'Pause Queue' }}
          </button>
        </div>
      </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-500">Fetching today's appointments</p>
    </div>

      <!-- Waiting Queue - Enhanced Design -->
      <div v-if="!isLoading" class="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 overflow-hidden shadow-lg">
        <div class="px-6 md:px-8 py-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Patient Queue</h2>
                <p class="text-blue-100 text-sm">{{ waitingQueue.length }} patient{{ waitingQueue.length !== 1 ? 's' : '' }} waiting</p>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
              <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span class="text-white text-sm font-medium">Live Updates</span>
            </div>
          </div>
        </div>
        
        <div v-if="waitingQueue.length === 0" class="text-center py-16">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Queue is Empty</h3>
          <p class="text-gray-500">No patients are currently waiting</p>
        </div>

        <div v-else class="p-6 space-y-4">
        <div v-for="(patient, index) in waitingQueue" :key="patient.id" 
             class="group relative bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30">
          
          <!-- Position Badge -->
          <div class="absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
               :class="{
                 'bg-gradient-to-r from-green-500 to-green-600': index === 0,
                 'bg-gradient-to-r from-blue-500 to-blue-600': index === 1,
                 'bg-gradient-to-r from-purple-500 to-purple-600': index === 2,
                 'bg-gradient-to-r from-gray-500 to-gray-600': index > 2
               }">
            {{ index + 1 }}
          </div>
          
          <!-- Next in Line Indicator -->
          <div v-if="index === 0" class="absolute -top-2 -right-2">
            <div class="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse">
              NEXT
            </div>
          </div>
          
          <div class="flex items-start justify-between">
            <div class="flex-1 ml-8">
              <!-- Patient Info -->
              <div class="mb-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">{{ patient.ownerName }}</h3>
                    <p class="text-blue-600 font-medium">{{ patient.petName }}</p>
                    <p class="text-sm text-gray-600">{{ patient.serviceName }}</p>
                    <!-- Vaccination Service Indicator -->
                    <div v-if="patient.hasVaccinationServices" class="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200 mt-1">
                      🩺 Vaccination Service
                    </div>
                  </div>
                </div>
                
                <!-- Schedule Info -->
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{{ formatDate(patient.date) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ patient.time }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Telehealth Status -->
              <div v-if="isTelehealthAppointment(patient)" class="mb-4">
                <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                     :class="{
                       'bg-green-100 text-green-800 border border-green-200': getTimeStatus(patient) === 'ready',
                       'bg-yellow-100 text-yellow-800 border border-yellow-200': getTimeStatus(patient) === 'waiting',
                       'bg-blue-100 text-blue-800 border border-blue-200': getTimeStatus(patient) === 'early',
                       'bg-red-100 text-red-800 border border-red-200': getTimeStatus(patient) === 'expired'
                     }">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span v-if="getTimeStatus(patient) === 'ready'">🟢 Ready for Call</span>
                  <span v-else-if="getTimeStatus(patient) === 'waiting'">🟡 Waiting for Time</span>
                  <span v-else-if="getTimeStatus(patient) === 'early'">🔵 Too Early</span>
                  <span v-else-if="getTimeStatus(patient) === 'expired'">🔴 Time Expired</span>
                </div>
                
                <div class="text-xs text-gray-500 mt-1">
                  {{ getTimeInfo(patient) }}
                </div>
              </div>
            </div>
            
            <!-- Right Side - Actions and Info -->
            <div class="flex flex-col items-end gap-4">
              <!-- Queue Position Info -->
              <div class="text-right">
                <div v-if="index === 0" class="text-green-600 font-bold text-lg">Ready Now</div>
                <div v-else class="text-gray-600">
                  <div class="text-sm">Position #{{ index + 1 }}</div>
                  <div class="text-lg font-semibold text-blue-600">~{{ getEstimatedWaitTime(index + 1) }} min</div>
                </div>
                <div class="text-xs text-gray-400">
                  Est. start: {{ getEstimatedStartTime(index + 1) }}
                </div>
              </div>
              
              <!-- Action Buttons - Compact Design -->
              <div class="flex flex-col gap-2">
                <!-- Queue Controls -->
                <div class="flex gap-1 mb-2">
                  <button 
                    @click="transferPatient(patient.id, 'up')"
                    :disabled="index === 0"
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:text-gray-200 disabled:cursor-not-allowed rounded transition-colors"
                    title="Move up in queue"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </button>
                  <button 
                    @click="transferPatient(patient.id, 'down')"
                    :disabled="index === waitingQueue.length - 1"
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:text-gray-200 disabled:cursor-not-allowed rounded transition-colors"
                    title="Move down in queue"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Main Action Buttons -->
                <div class="space-y-1.5">
                  <!-- Start Consultation Button -->
                  <button 
                    @click="startConsultationWithConfirmation(patient.id)"
                    class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    :disabled="getTimeStatus(patient) === 'early' || getTimeStatus(patient) === 'expired'"
                  >
                    <div class="flex items-center justify-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Start</span>
                    </div>
                  </button>
                  
                  <!-- Reschedule Button -->
                  <button 
                    @click="redirectToRescheduleReconsideration(patient.id)"
                    class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md text-sm"
                    title="Reconsider reschedule for this appointment"
                  >
                    <div class="flex items-center justify-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>Reschedule</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  <!-- Completion Form Modal -->
  <div v-if="showCompletionFormModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Complete Appointment</h2>
        <button @click="closeCompletionFormModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="p-6">
        <!-- Vaccination Service Notice -->
        <div v-if="selectedAppointment?.hasVaccinationServices" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h3 class="text-lg font-medium text-yellow-800">Vaccination Service Detected</h3>
          </div>
          <p class="text-yellow-700 text-sm">
            This appointment contains vaccination services that require detailed completion and auto-scheduling. 
            You will be redirected to the approval page for proper completion.
          </p>
        </div>
        
        <!-- Appointment Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-3">Appointment Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 mb-1">Owner</div>
              <div class="font-medium text-gray-900">{{ selectedAppointment?.ownerName || 'Unknown' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Pet(s)</div>
              <div class="font-medium text-gray-900">
                {{ selectedAppointment?.petNames?.join(', ') || selectedAppointment?.petName || 'No pet info' }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Date & Time</div>
              <div class="font-medium text-gray-900">
                {{ formatDate(selectedAppointment?.date) }} at {{ selectedAppointment?.time }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Services</div>
              <div class="font-medium text-gray-900">
                {{ (selectedAppointment?.['Service Names'] || selectedAppointment?.serviceNames || []).join(', ') }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Completion Form -->
        <form @submit.prevent="submitCompletionForm" class="space-y-6">
          <!-- Service Summary Section -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Service Summary
            </h3>
            
            <!-- Services with individual notes -->
            <div class="space-y-4">
              <div v-for="(service, index) in (selectedAppointment?.['Service Names'] || selectedAppointment?.serviceNames || [])" :key="index" class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-gray-900">{{ service }}</h4>
                  <span class="text-sm text-gray-500">Service {{ index + 1 }}</span>
                </div>
                
                <!-- Category Information -->
                <div v-if="getServiceCategory(service)" class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span class="text-sm font-medium text-blue-800">Category</span>
                  </div>
                  <div class="text-sm text-blue-700">
                    <div class="font-medium">{{ getServiceCategory(service)?.name }}</div>
                    <div class="text-blue-600">{{ getServiceCategory(service)?.description }}</div>
                  </div>
                </div>
                
                <!-- Service Details (if available) -->
                <div v-if="getServiceById(service) || getServiceByName(service)" class="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm font-medium text-green-800">Service Details</span>
                  </div>
                  <div class="text-sm text-green-700">
                    <div v-if="getServiceByName(service)?.fees" class="mb-1">
                      <span class="font-medium">Fees:</span> {{ getServiceByName(service)?.fees }}
                    </div>
                    <div v-if="getServiceByName(service)?.processingTime" class="mb-1">
                      <span class="font-medium">Processing Time:</span> {{ getServiceByName(service)?.processingTime }}
                    </div>
                    <div v-if="getServiceByName(service)?.classification" class="mb-1">
                      <span class="font-medium">Classification:</span> {{ getServiceByName(service)?.classification }}
                    </div>
                  </div>
                </div>
                
                <!-- Service-specific fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="completionForm.services[index].status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="completed">Completed</option>
                      <option value="partially_completed">Partially Completed</option>
                      <option value="requires_followup">Requires Follow-up</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input 
                      v-model.number="completionForm.services[index].duration" 
                      type="number" 
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Service Notes</label>
                    <textarea 
                      v-model="completionForm.services[index].notes" 
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what was done, findings, recommendations..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pet Health Assessment -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Pet Health Assessment
            </h3>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ selectedAppointment?.petName || 'Pet' }}</h4>
                    <p class="text-sm text-gray-500">Health Assessment</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Overall Health</label>
                    <select v-model="completionForm.pets[0].overallHealth" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input 
                      v-model.number="completionForm.pets[0].weight" 
                      type="number" 
                      step="0.1"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5.2"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Health Notes</label>
                    <textarea 
                      v-model="completionForm.pets[0].healthNotes" 
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe pet's condition, any issues found, recommendations..."
                    ></textarea>
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Follow-up Required</label>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input 
                          v-model="completionForm.pets[0].followUpRequired" 
                          type="checkbox" 
                          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm text-gray-700">Schedule follow-up appointment</span>
                      </label>
                      
                      <div v-if="completionForm.pets[0].followUpRequired" class="ml-6">
                        <input 
                          v-model="completionForm.pets[0].followUpNotes" 
                          type="text"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason for follow-up, recommended timeline..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- General Notes -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              General Notes & Recommendations
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Treatment Summary</label>
                <textarea 
                  v-model="completionForm.generalNotes.treatmentSummary" 
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Overall summary of treatments provided, procedures performed..."
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Owner Instructions</label>
                <textarea 
                  v-model="completionForm.generalNotes.ownerInstructions" 
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructions for pet owner, home care, medications, diet changes..."
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
                <textarea 
                  v-model="completionForm.generalNotes.nextSteps" 
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Recommended next steps, when to return, preventive care..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              @click="closeCompletionFormModal" 
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="completionFormLoading"
              class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <span v-if="completionFormLoading">Completing...</span>
              <span v-else>Complete Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Time Warning Modal -->
  <div v-if="showTimeWarningModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="text-center">
        <!-- Warning Icon -->
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Cannot Start Video Call</h3>
        <p class="text-sm text-gray-600 mb-6">{{ timeWarningMessage }}</p>
        
        <div class="flex gap-3 justify-center">
          <button 
            @click="showTimeWarningModal = false"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Telehealth Loading Modal -->
  <div v-if="isInitializingTelehealth" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="text-center">
        <!-- Loading Animation -->
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">Initializing Telehealth</h3>
        <p class="text-sm text-gray-600 mb-4">Setting up your video consultation...</p>
        
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${telehealthProgress}%` }"
          ></div>
        </div>
        
        <!-- Current Step -->
        <div class="text-sm text-blue-600 font-medium mb-2">
          {{ telehealthSteps[Math.floor(telehealthProgress / 25)] || 'Almost ready...' }}
        </div>
        
        <!-- Progress Percentage -->
        <div class="text-xs text-gray-500">
          {{ Math.round(telehealthProgress) }}% Complete
        </div>
      </div>
    </div>
  </div>

  <!-- Action Confirmation Modal -->
  <div v-if="showActionConfirm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="text-center">
        <!-- Warning Icon -->
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Action</h3>
        <p class="text-sm text-gray-600 mb-6">{{ actionMessage }}</p>
        
        <div class="flex gap-3 justify-center">
          <button 
            @click="cancelActionConfirm"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ actionCancelText }}
          </button>
          <button 
            @click="executeConfirmedAction"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {{ actionConfirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Telehealth Modal -->
  <div v-if="showTelehealthModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Video Call Setup</h2>
        <button @click="cancelTelehealthConsultation" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Google Meet Style Layout -->
      <div class="flex flex-col lg:flex-row h-full">
        <!-- Left Side: Camera Preview (Main Focus) -->
        <div class="flex-1 p-6 flex flex-col items-center justify-center">
          <!-- Camera Preview Container -->
          <div class="relative mb-6">
            <div class="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              <video 
                ref="localVideoRef" 
                autoplay 
                muted 
                class="w-full h-80 lg:h-96 object-cover"
              ></video>
              
              <!-- Camera Overlay Info -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div class="text-white text-center">
                  <div class="text-sm font-medium">{{ telehealthAppointment?.ownerName }}</div>
                  <div class="text-xs text-gray-300">{{ telehealthAppointment?.petName }}</div>
                </div>
              </div>
            </div>
            
            <!-- Camera Controls Overlay -->
            <div class="absolute top-4 right-4 flex gap-2">
              <button 
                @click="toggleMute"
                class="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                :class="isMuted ? 'bg-red-500' : ''"
                title="Toggle Microphone"
              >
                <svg v-if="isMuted" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </button>
              
              <button 
                @click="toggleVideo"
                class="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                :class="isVideoOff ? 'bg-red-500' : ''"
                title="Toggle Camera"
              >
                <svg v-if="isVideoOff" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Join Call Button -->
          <button 
            @click="joinVideoCall"
            :disabled="!canStartTelehealth(telehealthAppointment)"
            :class="[
              'px-8 py-4 rounded-full font-medium text-lg flex items-center gap-3 shadow-lg transition-all',
              canStartTelehealth(telehealthAppointment) 
                ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-xl' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            ]"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            {{ canStartTelehealth(telehealthAppointment) ? 'Join Call' : 'Time Not Ready' }}
          </button>
          
          <!-- Time Status in Modal -->
          <div v-if="telehealthAppointment" class="mt-4 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                 :class="getTimeStatusClass(telehealthAppointment)">
              <span v-if="getTimeStatus(telehealthAppointment) === 'ready'">🟢 Ready to Start</span>
              <span v-else-if="getTimeStatus(telehealthAppointment) === 'waiting'">🟡 Waiting for Time</span>
              <span v-else-if="getTimeStatus(telehealthAppointment) === 'early'">🔵 Too Early</span>
              <span v-else-if="getTimeStatus(telehealthAppointment) === 'expired'">🔴 Time Expired</span>
            </div>
            <div class="text-sm text-gray-600 mt-2">
              {{ getTimeInfo(telehealthAppointment) }}
            </div>
          </div>
        </div>
        
        <!-- Right Side: Brief Info Panel -->
        <div class="lg:w-80 bg-gray-50 p-6 border-l border-gray-200">
          <!-- Patient Info -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Patient Info</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-sm text-gray-700">{{ telehealthAppointment?.ownerName }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span class="text-sm text-gray-700">{{ telehealthAppointment?.petName }}</span>
              </div>
            </div>
          </div>
          
          <!-- Services -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Services</h4>
            <div class="space-y-1">
              <div v-for="service in (telehealthAppointment?.['Service Names'] || telehealthAppointment?.serviceNames || [])" :key="service" class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-600">{{ service }}</span>
              </div>
            </div>
          </div>
          
          <!-- Connection Status -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Connection</h4>
            <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg" :class="{
              'bg-green-100 text-green-800': xirsysStatus === 'available',
              'bg-yellow-100 text-yellow-800': xirsysStatus === 'limited',
              'bg-red-100 text-red-800': xirsysStatus === 'unavailable',
              'bg-yellow-100 text-yellow-800': xirsysStatus === 'checking'
            }">
              <div class="w-2 h-2 rounded-full" :class="{
                'bg-green-500': xirsysStatus === 'available',
                'bg-yellow-500': xirsysStatus === 'limited',
                'bg-red-500': xirsysStatus === 'unavailable',
                'bg-yellow-500': xirsysStatus === 'checking'
              }"></div>
              <span class="text-sm font-medium">
                {{ xirsysStatus === 'available' ? 'Ready' : 
                   xirsysStatus === 'limited' ? 'Limited' :
                   xirsysStatus === 'unavailable' ? 'Unavailable' : 
                   'Checking...' }}
              </span>
            </div>
          </div>
          
          <!-- Cancel Button -->
          <button 
            @click="cancelTelehealthConsultation"
            class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { collection, query, where, getDocs, orderBy, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import XirsysService from '@/services/xirsys-service'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// State
const appointments = ref([])
const waitingQueue = ref([])
const currentPatient = ref(null)
const isLoading = ref(true)
const queuePaused = ref(false)
const currentTime = ref(new Date())

// Real-time appointment listener
const appointmentListener = ref(null)
const isListeningToAppointments = ref(false)

// Telehealth state
const isTelehealthEnabled = ref(false)
const telehealthAppointment = ref(null)
const showTelehealthModal = ref(false)
const xirsysStatus = ref('checking') // 'checking', 'available', 'unavailable'
const isInitializingTelehealth = ref(false)
const telehealthProgress = ref(0)
const showCameraPreview = ref(false)
const isMuted = ref(false)
const isVideoOff = ref(false)
const localVideoRef = ref(null)
const telehealthSteps = ref([
  'Initializing...',
  'Fetching servers...',
  'Configuring WebRTC...',
  'Opening video interface...'
])

// Time warning modal state
const showTimeWarningModal = ref(false)
const timeWarningMessage = ref('')

// Completion form state
const showCompletionFormModal = ref(false)
const selectedAppointment = ref(null)
const completionFormLoading = ref(false)
const completionForm = ref({
  services: [],
  pets: [{
    name: '',
    overallHealth: 'good',
    weight: '',
    healthNotes: '',
    followUpRequired: false,
    followUpNotes: ''
  }],
  generalNotes: {
    treatmentSummary: '',
    ownerInstructions: '',
    nextSteps: ''
  }
})

// Service categories state
const serviceCategories = ref({})
const servicesData = ref({})
const categoriesData = ref({})

// Action confirmation state
const showActionConfirm = ref(false)
const actionToConfirm = ref(null)
const actionData = ref(null)
const actionMessage = ref('')
const actionConfirmText = ref('')
const actionCancelText = ref('')

// Computed properties
const queueStats = computed(() => ({
  total: waitingQueue.value.length + (currentPatient.value ? 1 : 0),
  waiting: waitingQueue.value.length,
  inProgress: currentPatient.value ? 1 : 0,
  completed: getCompletedAppointmentsCount()
}))

// Helper function to count completed appointments
const getCompletedAppointmentsCount = () => {
  // Count from appointments array, but only include today's appointments
  const today = new Date().toDateString()
  return appointments.value.filter(appointment => {
    if (appointment.status !== 'completed') return false
    
    // Check if appointment is from today
    const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
    return appointmentDate.toDateString() === today
  }).length
}

// Helper function to get service data from appointment
const getAppointmentServices = (appointment) => {
  return {
    serviceIds: appointment.Services || appointment.services || [],
    serviceNames: appointment['Service Names'] || appointment.serviceNames || []
  }
}

// Time validation function
const validateAppointmentTime = (appointment) => {
  if (!appointment.date || !appointment.time) {
    return { valid: false, reason: 'No appointment date/time specified' }
  }
  
  const now = new Date()
  
  // Handle different date formats
  let appointmentDate
  if (appointment.date instanceof Date) {
    appointmentDate = appointment.date
  } else if (typeof appointment.date === 'string') {
    // Try to parse the date string
    appointmentDate = new Date(appointment.date)
  } else if (appointment.date && appointment.date.toDate) {
    // Handle Firestore Timestamp
    appointmentDate = appointment.date.toDate()
  } else {
    return { valid: false, reason: 'Invalid appointment date format' }
  }
  
  // Check if date is valid
  if (isNaN(appointmentDate.getTime())) {
    return { valid: false, reason: 'Invalid appointment date' }
  }
  
  // Check if it's the same day
  const nowDateString = now.toDateString()
  const appointmentDateString = appointmentDate.toDateString()
  
  if (appointmentDateString !== nowDateString) {
    return { valid: false, reason: 'Appointment is not scheduled for today' }
  }
  
  // Parse appointment time - handle "1:00 PM - 1:30 PM" format
  let startTime, endTime
  if (typeof appointment.time === 'string') {
    if (appointment.time.includes(' - ')) {
      // Handle "1:00 PM - 1:30 PM" format
      [startTime, endTime] = appointment.time.split(' - ')
      console.log('Start time:', startTime, 'End time:', endTime)
    } else if (appointment.time.includes(':')) {
      // Handle "1:00 PM" format
      startTime = appointment.time
      endTime = appointment.time
    } else {
      console.log('Invalid time format:', appointment.time)
      return { valid: false, reason: 'Invalid appointment time format' }
    }
  } else if (typeof appointment.time === 'object' && appointment.time.hours !== undefined) {
    // Handle object format
    startTime = `${appointment.time.hours}:${appointment.time.minutes} ${appointment.time.period || 'AM'}`
    endTime = startTime
  } else {
    console.log('Invalid time format:', appointment.time)
    return { valid: false, reason: 'Invalid appointment time format' }
  }
  
  // Parse start time to get hours and minutes
  const parseTimeString = (timeStr) => {
    // Handle "1:00 PM" format
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!timeMatch) {
      console.log('Could not parse time string:', timeStr)
      return null
    }
    
    let hours = parseInt(timeMatch[1])
    const minutes = parseInt(timeMatch[2])
    const period = timeMatch[3].toUpperCase()
    
    console.log('Parsed time components:', { hours, minutes, period })
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }
    
    console.log('24-hour format:', { hours, minutes })
    return { hours, minutes }
  }
  
  const startTimeObj = parseTimeString(startTime)
  if (!startTimeObj) {
    return { valid: false, reason: 'Could not parse appointment start time' }
  }
  
  console.log('Parsed start time:', startTimeObj)
  
  // Create appointment datetime using start time
  const appointmentDateTime = new Date(appointmentDate)
  appointmentDateTime.setHours(startTimeObj.hours, startTimeObj.minutes, 0, 0)
  
  console.log('Appointment datetime:', appointmentDateTime)
  
  // Allow call 5 minutes before and 15 minutes after scheduled time
  const earlyBuffer = new Date(appointmentDateTime.getTime() - (5 * 60 * 1000))
  const lateBuffer = new Date(appointmentDateTime.getTime() + (15 * 60 * 1000))
  
  console.log('Early buffer:', earlyBuffer)
  console.log('Late buffer:', lateBuffer)
  console.log('Is now < early buffer?', now < earlyBuffer)
  console.log('Is now > late buffer?', now > lateBuffer)
  
  if (now < earlyBuffer) {
    const diffMinutes = Math.ceil((earlyBuffer - now) / (1000 * 60))
    console.log('Too early - wait', diffMinutes, 'minutes')
    return { valid: false, reason: `Appointment time has not started yet. Please wait ${diffMinutes} more minutes.` }
  }
  
  if (now > lateBuffer) {
    const diffMinutes = Math.ceil((now - lateBuffer) / (1000 * 60))
    console.log('Too late - expired', diffMinutes, 'minutes ago')
    return { valid: false, reason: `Appointment time has expired ${diffMinutes} minutes ago.` }
  }
  
  console.log('Time validation passed - can start call')
  return { valid: true }
}

// Get time status for appointment
const getTimeStatus = (appointment) => {
  try {
    console.log('=== GETTING TIME STATUS ===')
    console.log('Appointment:', appointment)
    
    if (!appointment.date || !appointment.time) {
      console.log('No date or time - returning expired')
      return 'expired'
    }
    
    const now = new Date()
    console.log('Current time:', now)
    
    // Handle different date formats
    let appointmentDate
    if (appointment.date instanceof Date) {
      appointmentDate = appointment.date
    } else if (typeof appointment.date === 'string') {
      appointmentDate = new Date(appointment.date)
    } else if (appointment.date && appointment.date.toDate) {
      appointmentDate = appointment.date.toDate()
    } else {
      console.log('Invalid date format - returning expired')
      return 'expired'
    }
    
    console.log('Parsed appointment date:', appointmentDate)
    
    // Check if date is valid
    if (isNaN(appointmentDate.getTime())) {
      console.log('Invalid date - returning expired')
      return 'expired'
    }
    
    // Check if it's the same day
    const nowDateString = now.toDateString()
    const appointmentDateString = appointmentDate.toDateString()
    
    if (appointmentDateString !== nowDateString) {
      console.log('Different days - returning expired')
      return 'expired'
    }
    
    // Parse appointment time - handle "1:00 PM - 1:30 PM" format
    let startTime, endTime
    if (typeof appointment.time === 'string') {
      if (appointment.time.includes(' - ')) {
        // Handle "1:00 PM - 1:30 PM" format
        [startTime, endTime] = appointment.time.split(' - ')
        console.log('Start time:', startTime, 'End time:', endTime)
      } else if (appointment.time.includes(':')) {
        // Handle "1:00 PM" format
        startTime = appointment.time
        endTime = appointment.time
      } else {
        console.log('Invalid time format - returning expired')
        return 'expired'
      }
    } else if (typeof appointment.time === 'object' && appointment.time.hours !== undefined) {
      // Handle object format
      startTime = `${appointment.time.hours}:${appointment.time.minutes} ${appointment.time.period || 'AM'}`
      endTime = startTime
    } else {
      console.log('Invalid time format - returning expired')
      return 'expired'
    }
    
    // Parse start time to get hours and minutes
    const parseTimeString = (timeStr) => {
      // Handle "1:00 PM" format
      const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!timeMatch) {
        console.log('Could not parse time string:', timeStr)
        return null
      }
      return { hours: parseInt(timeMatch[1]), minutes: parseInt(timeMatch[2]), period: timeMatch[3].toUpperCase() }
    }
    
    const startTimeObj = parseTimeString(startTime)
    if (!startTimeObj) {
      console.log('Could not parse start time - returning expired')
      return 'expired'
    }
    
    console.log('Parsed start time:', startTimeObj)
    
    // Convert to 24-hour format
    let hours = startTimeObj.hours
    const minutes = startTimeObj.minutes
    
    if (startTimeObj.period === 'PM' && hours !== 12) {
      hours += 12
    } else if (startTimeObj.period === 'AM' && hours === 12) {
      hours = 0
    }
    
    console.log('24-hour format - Hours:', hours, 'Minutes:', minutes)
    
    // Create appointment datetime using start time
    const appointmentDateTime = new Date(appointmentDate)
    appointmentDateTime.setHours(hours, minutes, 0, 0)
    
    console.log('Appointment datetime:', appointmentDateTime)
    
    // Allow call 5 minutes before and 15 minutes after scheduled time
    const earlyBuffer = new Date(appointmentDateTime.getTime() - (5 * 60 * 1000))
    const lateBuffer = new Date(appointmentDateTime.getTime() + (15 * 60 * 1000))
    
    console.log('Early buffer:', earlyBuffer)
    console.log('Late buffer:', lateBuffer)
    
    if (now < earlyBuffer) {
      console.log('Too early - returning early')
      return 'early'
    }
    
    if (now > lateBuffer) {
      console.log('Too late - returning expired')
      return 'expired'
    }
    
    if (now >= appointmentDateTime) {
      console.log('Within time window - returning ready')
      return 'ready'
    } else {
      console.log('Waiting for time - returning waiting')
      return 'waiting'
    }
  } catch (error) {
    console.error('Error in getTimeStatus:', error)
    return 'expired'
  }
}

// Get CSS classes for time status
const getTimeStatusClass = (appointment) => {
  const status = getTimeStatus(appointment)
  switch (status) {
    case 'ready': return 'bg-green-100 text-green-800'
    case 'waiting': return 'bg-yellow-100 text-yellow-800'
    case 'early': return 'bg-blue-100 text-blue-800'
    case 'expired': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Check if telehealth can be started
const canStartTelehealth = (appointment) => {
  return getTimeStatus(appointment) === 'ready'
}

// Get start button text based on status
const getStartButtonText = (appointment) => {
  const status = getTimeStatus(appointment)
  switch (status) {
    case 'ready': return 'Start Video Call'
    case 'waiting': return 'Wait for Time'
    case 'early': return 'Too Early'
    case 'expired': return 'Time Expired'
    default: return 'Cannot Start'
  }
}

// Get time information for display
const getTimeInfo = (appointment) => {
  if (!appointment.date || !appointment.time) return 'No time specified'
  
  try {
    const now = new Date()
    
    // Handle different date formats
    let appointmentDate
    if (appointment.date instanceof Date) {
      appointmentDate = appointment.date
    } else if (typeof appointment.date === 'string') {
      appointmentDate = new Date(appointment.date)
    } else if (appointment.date && appointment.date.toDate) {
      appointmentDate = appointment.date.toDate()
    } else {
      return 'Invalid date format'
    }
    
    // Check if date is valid
    if (isNaN(appointmentDate.getTime())) {
      return 'Invalid date'
    }
    
    // Parse appointment time - handle "1:00 PM - 1:30 PM" format
    let startTime
    if (typeof appointment.time === 'string') {
      if (appointment.time.includes(' - ')) {
        // Handle "1:00 PM - 1:30 PM" format
        [startTime] = appointment.time.split(' - ')
      } else if (appointment.time.includes(':')) {
        // Handle "1:00 PM" format
        startTime = appointment.time
      } else {
        return 'Invalid time format'
      }
    } else if (typeof appointment.time === 'object' && appointment.time.hours !== undefined) {
      // Handle object format
      startTime = `${appointment.time.hours}:${appointment.time.minutes} ${appointment.time.period || 'AM'}`
    } else {
      return 'Invalid time format'
    }
    
    // Parse start time to get hours and minutes
    const timeMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!timeMatch) {
      return 'Could not parse time'
    }
    
    let hours = parseInt(timeMatch[1])
    const minutes = parseInt(timeMatch[2])
    const period = timeMatch[3].toUpperCase()
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }
    
    // Create appointment datetime using start time
    const appointmentDateTime = new Date(appointmentDate)
    appointmentDateTime.setHours(hours, minutes, 0, 0)
    
    const diffMs = appointmentDateTime - now
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes > 0) {
      return `Starts in ${diffMinutes} minutes`
    } else if (diffMinutes >= -15) {
      return `Started ${Math.abs(diffMinutes)} minutes ago`
    } else {
      return 'Appointment time has passed'
    }
  } catch (error) {
    console.error('Error in getTimeInfo:', error)
    return 'Error parsing time'
  }
}

// Telehealth detection function
const isTelehealthAppointment = (appointment) => {
  // First, check if the appointment has the isTelehealth field set
  if (appointment.isTelehealth === true) {
    return true
  }
  
  // Check all possible field names for services based on actual data structure
  const serviceIds = appointment.servicesIds || appointment.Services || appointment.services || []
  const serviceNames = appointment.serviceNames || appointment['Service Names'] || []
  
  if (!serviceIds.length && !serviceNames.length) {
    console.log('❌ No services found in appointment')
    return false
  }
  
  console.log('🔍 Checking telehealth for appointment:', appointment.id)
  console.log('🔍 Service IDs found:', serviceIds)
  console.log('🔍 Service Names found:', serviceNames)
  console.log('🔍 Available services data:', Object.keys(servicesData.value))
  
  // First try to check by service IDs (more reliable)
  if (serviceIds.length > 0) {
    console.log('🔍 Checking by service IDs...')
    const hasTelehealthService = serviceIds.some(serviceId => {
      console.log(`🔍 Checking service ID: ${serviceId}`)
      const service = servicesData.value[serviceId]
      console.log(`🔍 Service data for ${serviceId}:`, service)
      
      if (!service) {
        console.log(`❌ Service ${serviceId} not found in servicesData`)
        return false
      }
      
      // Check if the service itself is marked as telehealth
      if (service.isTelehealth === true) {
        console.log(`✅ Found telehealth service by ID: ${service.name}`)
        return true
      }
      
      if (!service.categoryId) {
        return false
      }
      
      const category = categoriesData.value[service.categoryId]
      if (!category) {
        return false
      }
      
      // Check if the category is marked as telehealth
      if (category.isTelehealth === true) {
        return true
      }
      
      // Fallback: check if category name contains 'telehealth'
      const isTelehealth = category.name.toLowerCase().includes('telehealth')
      
      return isTelehealth
    })
    
    if (hasTelehealthService) {
      return true
    }
  }
  
  // Fallback: check by service names if no telehealth found by ID
  if (serviceNames.length > 0) {
    console.log('🔍 Checking by service names...')
    const hasTelehealthService = serviceNames.some(serviceName => {
      console.log(`🔍 Checking service name: ${serviceName}`)
      
      // Check if service name contains telehealth keywords
      const telehealthKeywords = ['video consultation', 'telehealth', 'video call', 'online consultation', 'remote consultation']
      const hasTelehealthKeyword = telehealthKeywords.some(keyword => 
        serviceName.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (hasTelehealthKeyword) {
        console.log(`✅ Found telehealth service by name keyword: ${serviceName}`)
        return true
      }
      
      // Try to find service by name and check its flag
      const service = getServiceByName(serviceName)
      if (service && service.isTelehealth === true) {
        console.log(`✅ Found telehealth service by name lookup: ${serviceName}`)
        return true
      }
      
      console.log(`❌ Service name "${serviceName}" is not telehealth`)
      return false
    })
    
    if (hasTelehealthService) {
      console.log('✅ Telehealth detected by service names')
      return true
    }
  }
  
  console.log('❌ No telehealth services found')
  return false
}

// Removed auto-redirect countdown - now manual only



// Check if appointment has vaccination services that require detailed completion
const checkForVaccinationServices = async (appointment) => {
  try {
    // Check both possible field names for services
    const serviceIds = appointment.Services || appointment.services || []
    const serviceNames = appointment['Service Names'] || appointment.serviceNames || []
    
    if (!serviceIds.length && !serviceNames.length) {
      return false
    }
    
    // First try to check by service IDs (more reliable)
    if (serviceIds.length > 0) {
      for (const serviceId of serviceIds) {
        const service = servicesData.value[serviceId]
        
        if (service && service.isVaccination === true) {
          return true
        }
      }
    }
    
    // Fallback: check by service names if no vaccination found by ID
    if (serviceNames.length > 0) {
      for (const serviceName of serviceNames) {
        const service = getServiceByName(serviceName)
        
        if (service && service.isVaccination === true) {
          return true
        }
        
        // Additional fallback: Check if service name contains vaccination keywords
        if (serviceName && typeof serviceName === 'string') {
          const vaccinationKeywords = ['vaccine', 'vaccination', 'shot', 'immunization', 'rabies', 'dhpp', 'fvr', 'felv']
          const hasVaccinationKeyword = vaccinationKeywords.some(keyword => 
            serviceName.toLowerCase().includes(keyword.toLowerCase())
          )
          
          if (hasVaccinationKeyword) {
            return true
          }
        }
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking for vaccination services:', error)
    return false
  }
}

// Redirect to approval page for detailed completion
const redirectToApprovalPage = (appointmentId) => {
  try {
    // Navigate to the approval page with the appointment ID
    console.log('🔄 Redirecting to approval page for appointment:', appointmentId)
    router.push(`/vet/appointments/vetappointmentapproval?id=${appointmentId}`)
  } catch (error) {
    console.error('Error redirecting to approval page:', error)
    // Fallback: show error message
    alert('Error redirecting to approval page. Please navigate manually.')
  }
}

// Redirect to approval page for reschedule reconsideration
const redirectToRescheduleReconsideration = (appointmentId) => {
  try {
    // Navigate to the approval page with the appointment ID and reschedule mode
    console.log('🔄 Redirecting to approval page for reschedule reconsideration:', appointmentId)
    router.push(`/vet/appointments/vetappointmentapproval?id=${appointmentId}&mode=reschedule`)
  } catch (error) {
    console.error('Error redirecting to reschedule reconsideration:', error)
    // Fallback: show error message
    alert('Error redirecting to reschedule reconsideration. Please navigate manually.')
  }
}

// Check Xirsys availability
const checkXirsysAvailability = async () => {
  try {
    xirsysStatus.value = 'checking'
    
    
    const iceConfig = await XirsysService.getIceServers()
    
    if (iceConfig && iceConfig.iceServers && iceConfig.iceServers.length > 0) {
      // Check if we have actual TURN servers (not just STUN)
      const hasTurnServers = iceConfig.iceServers.some(server => 
        server.urls && server.urls.some(url => url.startsWith('turn:'))
      )
      
      if (hasTurnServers) {
        xirsysStatus.value = 'available'
        isTelehealthEnabled.value = true
        
      } else {
        // Only STUN servers available (fallback)
        xirsysStatus.value = 'limited'
        isTelehealthEnabled.value = true
        console.warn('Only STUN servers available - limited connectivity')
      }
    } else {
      xirsysStatus.value = 'unavailable'
      isTelehealthEnabled.value = false
      console.warn('No ICE servers available from Xirsys')
    }
  } catch (error) {
    console.error('Error checking Xirsys availability:', error)
    xirsysStatus.value = 'unavailable'
    isTelehealthEnabled.value = false
    
    // Check if it's a credentials issue
    if (error.message.includes('credentials') || error.message.includes('Missing Xirsys')) {
      console.warn('Xirsys credentials missing - check environment variables')
    }
  }
}

// Enhanced start consultation function
const startConsultation = async (patientId) => {
  try {
    // Validate input
    if (!patientId) {
      console.error('No patient ID provided for consultation start')
      return
    }
    
    // Check if there's already a current patient
    if (currentPatient.value) {
      console.warn('Consultation already in progress with:', currentPatient.value.ownerName)
      // You could add a confirmation dialog here if needed
    }
    
    const patient = waitingQueue.value.find(p => p.id === patientId)
    if (!patient) {
      console.error('Patient not found in waiting queue:', patientId)
      return
    }
    
    // Check both possible field names for services
    const serviceIds = patient.Services || patient.services || []
    const serviceNames = patient['Service Names'] || patient.serviceNames || []
    
    // Check if this is a telehealth appointment
    const isTelehealth = isTelehealthAppointment(patient)
    
    if (isTelehealth) {
      // Store the telehealth appointment and show modal
      telehealthAppointment.value = patient
      
      // Also set currentPatient for the UI to work properly
      currentPatient.value = {
        ...patient,
        startTime: new Date(),
        isTelehealth: true
      }
      
      // Remove from waiting queue
      waitingQueue.value = waitingQueue.value.filter(p => p.id !== patientId)
      
      // Update appointment status to 'in-progress'
      await updateAppointmentStatus(patientId, 'in-progress')
      
      // Update Firestore queue
      updateFirestoreQueue()
      
      console.log(`✅ Telehealth consultation started for ${patient.ownerName} with ${patient.petName}`)
      
      showTelehealthModal.value = true
      return
    }
    
    // Check if this patient has vaccination services
    const hasVaccinationServices = await checkForVaccinationServices(patient)
    
    // Regular appointment - proceed as before
    currentPatient.value = {
      ...patient,
      startTime: new Date(),
      hasVaccinationServices // Add this property for UI display
    }
    
    // Remove from waiting queue
    waitingQueue.value = waitingQueue.value.filter(p => p.id !== patientId)
    
    // Update appointment status to 'in-progress'
    await updateAppointmentStatus(patientId, 'in-progress')
    
    // Update Firestore queue
    updateFirestoreQueue()
    
    console.log(`✅ Consultation started for ${patient.ownerName} with ${patient.petName}`)
    
    if (hasVaccinationServices) {
      console.log('🩺 This patient has vaccination services - manual completion required')
      // No auto-redirect - vet must manually click the button
    }
    
  } catch (error) {
    console.error('Error starting consultation:', error)
    // Revert changes if there was an error
    if (currentPatient.value?.id === patientId) {
      currentPatient.value = null
    }
    // You can add a toast notification here to inform the user of the error
  }
}

// Start consultation with confirmation if there's a current patient
const startConsultationWithConfirmation = (patientId) => {
  if (currentPatient.value) {
    // Show confirmation dialog
    showActionConfirmDialog(
      'startConsultation',
      'Start New Consultation',
      `Are you sure you want to start a consultation with "${waitingQueue.value.find(p => p.id === patientId)?.ownerName}"? This will end the current consultation with "${currentPatient.value.ownerName}".`,
      'Start Consultation',
      'Cancel'
    )
    actionData.value = patientId
  } else {
    // No current patient, start consultation directly
    startConsultation(patientId)
  }
}

// Join the actual video call (navigate to full interface)
const joinVideoCall = async () => {
  try {
    // Check if this is a rejoin attempt
    const endedAppointment = sessionStorage.getItem('telehealth_appointment_ended')
    const isRejoin = endedAppointment && JSON.parse(endedAppointment).id === telehealthAppointment.value.id
    
    if (isRejoin) {
      console.log('Detected rejoin attempt for appointment:', telehealthAppointment.value.id)
      const endedData = JSON.parse(endedAppointment)
      
      // Check if rejoin is allowed based on appointment time
      if (endedData.canRejoin) {
        // Validate if we're still within the appointment time window
        const timeValidation = validateAppointmentTime(telehealthAppointment.value)
        
        if (timeValidation.valid) {
          // Rejoin is allowed, use existing data
          console.log('Rejoining existing call within appointment time window')
          await rejoinTelehealthCall(endedData)
          return
        } else {
          // Appointment time has passed, clear old data and start fresh
          sessionStorage.removeItem('telehealth_appointment_ended')
          sessionStorage.removeItem('telehealth_ice_config_ended')
          console.log('Rejoin not allowed - appointment time expired, starting fresh consultation')
        }
      }
    }
    
    // Validate appointment time before proceeding
    const timeValidation = validateAppointmentTime(telehealthAppointment.value)
    
    if (!timeValidation.valid) {
      // Log failed attempt
      await logTelehealthAttempt(telehealthAppointment.value.id, false, timeValidation.reason)
      
      // Show time warning modal
      showTimeWarningModal.value = true
      timeWarningMessage.value = timeValidation.reason
      return
    }
    
    // Show loading modal and start progress
    isInitializingTelehealth.value = true
    telehealthProgress.value = 0
    xirsysStatus.value = 'checking'
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      if (telehealthProgress.value < 90) {
        telehealthProgress.value += Math.random() * 15
      }
    }, 300)
    
    // Step 1: Initialize Xirsys and get ICE servers
    telehealthProgress.value = 25
    
    const iceConfig = await XirsysService.getIceServers()
    
    if (!iceConfig || !iceConfig.iceServers || iceConfig.iceServers.length === 0) {
      throw new Error('Failed to get ICE servers from Xirsys')
    }
    
    // Step 2: ICE servers fetched successfully
    telehealthProgress.value = 50
    
    // Step 3: Configure WebRTC
    telehealthProgress.value = 75
    
    // Update Xirsys status
    xirsysStatus.value = 'available'
    isTelehealthEnabled.value = true
    
    // Step 4: Update appointment status
    await updateAppointmentStatus(telehealthAppointment.value.id, 'in-progress')
    
    // Remove from waiting queue
    waitingQueue.value = waitingQueue.value.filter(p => p.id !== telehealthAppointment.value.id)
    
    // Set as current patient with telehealth flag and ICE config
    currentPatient.value = {
      ...telehealthAppointment.value,
      startTime: new Date(),
      isTelehealth: true,
      iceConfig: iceConfig // Store ICE configuration for the video call
    }
    
    // Update Firestore queue with telehealth data
    updateFirestoreQueue()
    
    // Step 5: Prepare for navigation
    telehealthProgress.value = 90
    
    // Store ICE configuration in sessionStorage for the telehealth interface
    
    // Store the ORIGINAL appointment data (not the processed currentPatient)
    // This ensures date/time objects remain in their original format
    const originalAppointmentData = {
      id: telehealthAppointment.value.id,
      userId: telehealthAppointment.value.userId,
      ownerName: telehealthAppointment.value.ownerName,
      petName: telehealthAppointment.value.petNames?.[0] || 'Unknown Pet',
      serviceName: telehealthAppointment.value.serviceNames?.[0] || 'Unknown Service',
      date: telehealthAppointment.value.date, // Keep original date format
      time: telehealthAppointment.value.time, // Keep original time format
      duration: telehealthAppointment.value.duration,
      doctorId: telehealthAppointment.value.doctorId,
      doctorName: telehealthAppointment.value.doctorName,
      isHealthCertificate: telehealthAppointment.value.isHealthCertificate,
      ownerAvatar: telehealthAppointment.value.ownerAvatar
    }
    
    sessionStorage.setItem('telehealth_ice_config', JSON.stringify(iceConfig))
    sessionStorage.setItem('telehealth_appointment', JSON.stringify(originalAppointmentData))
    
    // Complete progress
    telehealthProgress.value = 100
    
    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Clear progress interval
    clearInterval(progressInterval)
    
    // Close modal and navigate to full telehealth page
    showTelehealthModal.value = false
    isInitializingTelehealth.value = false
    
    // Navigate to full telehealth interface
    
    try {
      console.log('About to navigate to VetVideoCall route')
      console.log('Current route:', router.currentRoute.value)
      console.log('Available routes:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
      
      // Try multiple navigation methods
      const navigationTarget = {
        path: '/telehealth/vet/call',
        query: { 
          appointmentId: currentPatient.value.id,
          mode: 'consultation',
          iceConfig: btoa(JSON.stringify(iceConfig)) // Encode ICE config in URL
        }
      }
      
      console.log('Navigation target:', navigationTarget)
      
          // Log successful attempt
    await logTelehealthAttempt(currentPatient.value.id, true, 'Telehealth started successfully')
    
    // First try with path
    await router.push(navigationTarget)
    console.log('Navigation successful with path')
    
    // Verify the navigation actually happened
    setTimeout(() => {
      console.log('Current route after navigation:', router.currentRoute.value)
      if (router.currentRoute.value.path !== '/telehealth/vet/call') {
        console.warn('Navigation may have been intercepted, current path:', router.currentRoute.value.path)
      }
    }, 100)
      
    } catch (error) {
      console.error('Navigation failed:', error)
      
      // Fallback: try using window.location
      console.log('Trying fallback navigation with window.location')
      const queryString = new URLSearchParams({
        appointmentId: currentPatient.value.id,
        mode: 'consultation',
        iceConfig: btoa(JSON.stringify(iceConfig))
      }).toString()
      
      window.location.href = `/telehealth/vet/call?${queryString}`
    }
    
  } catch (error) {
    console.error('Error starting full video call:', error)
    
    // Clear progress interval if it exists
    if (window.progressInterval) {
      clearInterval(window.progressInterval)
    }
    
    // Hide loading modal
    isInitializingTelehealth.value = false
    telehealthProgress.value = 0
    
    xirsysStatus.value = 'unavailable'
    isTelehealthEnabled.value = false
    
    // Show detailed error message
    let errorMessage = 'Failed to start video call. '
    if (error.message.includes('ICE servers')) {
      errorMessage += 'Xirsys ICE servers are not available. Please check your configuration.'
    } else if (error.message.includes('credentials')) {
      errorMessage += 'Xirsys credentials are missing. Please check your environment variables.'
    } else {
      errorMessage += 'Please try again or contact support.'
    }
    
    alert(errorMessage)
  }
}

// Start video call setup (show camera preview)
const startTelehealthConsultation = async () => {
  // If no telehealth appointment is set, use current patient
  if (!telehealthAppointment.value && currentPatient.value?.isTelehealth) {
    telehealthAppointment.value = currentPatient.value
  }
  
  if (!telehealthAppointment.value) return
  
  // Validate appointment time before proceeding
  const timeValidation = validateAppointmentTime(telehealthAppointment.value)
  
  if (!timeValidation.valid) {
    // Log failed attempt
    await logTelehealthAttempt(telehealthAppointment.value.id, false, timeValidation.reason)
    
    // Show time warning modal
    showTimeWarningModal.value = true
    timeWarningMessage.value = timeValidation.reason
    return
  }
  
  // Show the telehealth modal first
  showTelehealthModal.value = true
  
  // Show camera preview immediately
  showCameraPreview.value = true
  
  // Initialize camera preview
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = stream
    }
  } catch (error) {
    console.error('Error accessing camera/microphone:', error)
    // Don't show error, just continue without preview
  }
}

// Rejoin telehealth call
const rejoinTelehealthCall = async (endedData) => {
  try {
    console.log('=== REJOINING TELEHEALTH CALL ===')
    
    // Get the stored ICE config
    const storedIceConfig = sessionStorage.getItem('telehealth_ice_config_ended')
    if (!storedIceConfig) {
      throw new Error('No ICE configuration found for rejoin')
    }
    
    const iceConfig = JSON.parse(storedIceConfig)
    
    // Validate appointment time for rejoin - this ensures we're still within the appointment window
    const timeValidation = validateAppointmentTime(telehealthAppointment.value)
    if (!timeValidation.valid) {
      await logTelehealthAttempt(telehealthAppointment.value.id, false, `Rejoin failed: ${timeValidation.reason}`)
      showTimeWarningModal.value = true
      timeWarningMessage.value = `Cannot rejoin: ${timeValidation.reason}`
      
      // Clear expired rejoin data since appointment time has passed
      sessionStorage.removeItem('telehealth_appointment_ended')
      sessionStorage.removeItem('telehealth_ice_config_ended')
      return
    }
    
    // Set as current patient with telehealth flag and existing ICE config
    currentPatient.value = {
      ...telehealthAppointment.value,
      startTime: new Date(),
      isTelehealth: true,
      iceConfig: iceConfig,
      isRejoin: true
    }
    
    // Update Firestore queue
    updateFirestoreQueue()
    
    // Store data for video call
    sessionStorage.setItem('telehealth_ice_config', storedIceConfig)
    sessionStorage.setItem('telehealth_appointment', JSON.stringify(telehealthAppointment.value))
    
    // Log successful rejoin
    await logTelehealthAttempt(telehealthAppointment.value.id, true, 'Call rejoined successfully')
    
    // Close modal and navigate to video call
    showTelehealthModal.value = false
    isInitializingTelehealth.value = false
    
    // Navigate to video call interface
    router.push({
      path: '/telehealth/vet/call',
      query: {
        appointmentId: telehealthAppointment.value.id,
        mode: 'consultation',
        iceConfig: btoa(storedIceConfig)
      }
    })
    
    // Clear ended data since we're rejoining
    sessionStorage.removeItem('telehealth_appointment_ended')
    sessionStorage.removeItem('telehealth_ice_config_ended')
    
  } catch (error) {
    console.error('Error rejoining telehealth call:', error)
    await logTelehealthAttempt(telehealthAppointment.value.id, false, `Rejoin error: ${error.message}`)
    alert('Failed to rejoin call. Starting fresh consultation instead.')
    
    // Clear ended data and continue with fresh start
    sessionStorage.removeItem('telehealth_appointment_ended')
    sessionStorage.removeItem('telehealth_ice_config_ended')
    
    // Continue with normal flow
    throw error
  }
}

// Log telehealth attempt for audit purposes
const logTelehealthAttempt = async (appointmentId, success, reason = '') => {
  try {
    const logData = {
      appointmentId,
      vetId: authStore.user?.userId,
      timestamp: new Date(),
      success,
      reason,
      userAgent: navigator.userAgent,
      // Note: IP address would need to be captured server-side
    }
    
    console.log('Logging telehealth attempt:', logData)
    
    // You can store this in Firestore for audit purposes
    // await addDoc(collection(db, 'telehealth_logs'), logData)
  } catch (error) {
    console.error('Error logging telehealth attempt:', error)
  }
}



// Cancel telehealth consultation
const cancelTelehealthConsultation = () => {
  showTelehealthModal.value = false
  telehealthAppointment.value = null
  showCameraPreview.value = false
  
  // Stop camera stream if it exists
  if (localVideoRef.value && localVideoRef.value.srcObject) {
    const stream = localVideoRef.value.srcObject
    stream.getTracks().forEach(track => track.stop())
    localVideoRef.value.srcObject = null
  }
}

// Computed properties
const canCallNext = computed(() => 
  !queuePaused.value && waitingQueue.value.length > 0 && !currentPatient.value
)

const canPause = computed(() => 
  waitingQueue.value.length > 0 || currentPatient.value
)

// Check if rejoin is available
const canRejoinCall = computed(() => {
  try {
    const endedAppointment = sessionStorage.getItem('telehealth_appointment_ended')
    if (!endedAppointment) return false
    
    const endedData = JSON.parse(endedAppointment)
    
    // Check if this is the same appointment and rejoin is allowed
    if (endedData.canRejoin && endedData.endTime && currentPatient.value) {
      if (endedData.id === currentPatient.value.id) {
        // Check if we're still within the appointment time window
        const timeValidation = validateAppointmentTime(currentPatient.value)
        return timeValidation.valid
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking rejoin availability:', error)
    return false
  }
})

// Get remaining rejoin time based on appointment schedule
const getRemainingRejoinTime = computed(() => {
  try {
    if (!canRejoinCall.value || !currentPatient.value) return null
    
    const timeStatus = getTimeStatus(currentPatient.value)
    
    if (timeStatus === 'ready') {
      return 'Available now'
    } else if (timeStatus === 'waiting') {
      const timeInfo = getTimeInfo(currentPatient.value)
      return timeInfo
    } else if (timeStatus === 'early') {
      const timeInfo = getTimeInfo(currentPatient.value)
      return `Starts ${timeInfo}`
    } else {
      return 'Expired'
    }
  } catch (error) {
    console.error('Error getting remaining rejoin time:', error)
    return null
  }
})

// Queue status indicator
const queueStatus = computed(() => {
  if (queuePaused.value) return { text: 'PAUSED', color: 'red', icon: '⏸️' }
  if (currentPatient.value) return { text: 'IN PROGRESS', color: 'orange', icon: '👨‍⚕️' }
  if (waitingQueue.value.length > 0) return { text: 'ACTIVE', color: 'green', icon: '📋' }
  return { text: 'EMPTY', color: 'gray', icon: '🎉' }
})

// Get today's date range
const getTodayRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  return { startOfDay, endOfDay }
}

// Check for ongoing consultations
const checkForOngoingConsultations = async () => {
  try {
    // Check if there are any appointments marked as 'in-progress' for this doctor
    const { startOfDay, endOfDay } = getTodayRange()
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('status', '==', 'in-progress'),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('doctorId', '==', authStore.user?.userId)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const ongoingAppointment = querySnapshot.docs[0].data()
              
      
      // If we don't have a current patient but there's an ongoing appointment,
      // restore it from the appointment data
      if (!currentPatient.value && ongoingAppointment) {
        // Get user name
        let ownerName = 'Unknown Owner'
        if (ongoingAppointment.userId) {
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', ongoingAppointment.userId)))
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data()
              ownerName = userData.firstName || userData.name || 'Unknown Owner'
            }
          } catch (error) {
            console.error('Error fetching user:', error)
          }
        }
        
        currentPatient.value = {
          id: ongoingAppointment.id,
          ...ongoingAppointment,
          ownerName,
          petName: ongoingAppointment.petNames?.[0] || 'Unknown Pet',
          serviceName: ongoingAppointment['Service Names']?.[0] || ongoingAppointment.serviceNames?.[0] || 'Unknown Service',
          startTime: ongoingAppointment.startTime || new Date(),
          isTelehealth: isTelehealthAppointment(ongoingAppointment)
        }
        
        // Update the queue to reflect this
        updateFirestoreQueue()
      }
    }
  } catch (error) {
    console.error('Error checking for ongoing consultations:', error)
  }
  
  // Check for potential rejoin opportunities
  await checkForRejoinOpportunities()
}

// Manual database check function for debugging
const manualCheckDatabase = async () => {
  try {
    console.log('🔍 Manual database check...')
    
    if (!authStore.user?.userId) {
      console.log('❌ No user ID available')
      return
    }
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    
    console.log('📅 Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString())
    console.log('👨‍⚕️ Doctor ID:', authStore.user.userId)
    
    // Check all appointments for the doctor
    const appointmentsRef = collection(db, 'appointments')
    const doctorQuery = query(
      appointmentsRef,
      where('doctorId', '==', authStore.user.userId)
    )
    
    const doctorAppointments = await getDocs(doctorQuery)
    console.log('📋 All appointments for doctor:', doctorAppointments.size)
    
    // Check approved appointments specifically
    const approvedQuery = query(
      appointmentsRef,
      where('doctorId', '==', authStore.user.userId),
      where('status', '==', 'approved')
    )
    
    const approvedAppointments = await getDocs(approvedQuery)
    console.log('📋 Approved appointments for doctor:', approvedAppointments.size)
    
    // Check today's appointments
    const todayQuery = query(
      appointmentsRef,
      where('doctorId', '==', authStore.user.userId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    )
    
    const todayAppointments = await getDocs(todayQuery)
    console.log('📋 Today appointments for doctor:', todayAppointments.size)
    
    // Show detailed information about today's appointments
    todayAppointments.forEach(doc => {
      const apt = doc.data()
      console.log('📝 Today appointment:', {
        id: doc.id,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        userId: apt.userId,
        petNames: apt.petNames,
        serviceNames: apt.serviceNames
      })
    })
    
    // Check if there are any appointments for today (all statuses)
    const todayAllAppointmentsQuery = query(
      appointmentsRef,
      where('doctorId', '==', authStore.user.userId),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    )
    
    const todayAllAppointments = await getDocs(todayAllAppointmentsQuery)
    console.log('📋 Today appointments for doctor:', todayAllAppointments.size)
    
    // Show all appointments with their statuses
    todayAllAppointments.forEach(doc => {
      const apt = doc.data()
      console.log(`📝 Today appointment (${apt.status}):`, {
        id: doc.id,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        userId: apt.userId,
        petNames: apt.petNames,
        serviceNames: apt.serviceNames
      })
    })
    
    // Check if there are any approved appointments that might be missing from the queue
    const todayApprovedAppointments = todayAllAppointments.docs.filter(doc => {
      const apt = doc.data()
      return apt.status === 'approved'
    })
    
    const missingAppointments = todayApprovedAppointments.filter(doc => {
      const apt = doc.data()
      
      // Skip appointments with reschedule requests
      if (apt.rescheduleRequest && apt.rescheduleRequest.status) {
        const rescheduleStatus = apt.rescheduleRequest.status
        if (['reschedule_requested', 'reschedule_approved', 'reschedule_rejected'].includes(rescheduleStatus)) {
          console.log(`⏭️ Skipping appointment with reschedule status for queue addition: ${doc.id} (${rescheduleStatus})`)
          return false
        }
      }
      
      // Check if this appointment is already in the waiting queue
      const inQueue = waitingQueue.value.some(queueItem => queueItem.id === doc.id)
      // Check if this appointment is the current patient
      const isCurrentPatient = currentPatient.value?.id === doc.id
      
      return !inQueue && !isCurrentPatient
    })
    
    if (missingAppointments.length > 0) {
      console.log('⚠️ Found approved appointments not in queue:', missingAppointments.length)
      missingAppointments.forEach(doc => {
        const apt = doc.data()
        console.log('⚠️ Missing from queue:', {
          id: doc.id,
          date: apt.date,
          time: apt.time,
          userId: apt.userId,
          petNames: apt.petNames,
          serviceNames: apt.serviceNames
        })
      })
      
      // Try to add missing appointments to the queue
      console.log('🔄 Attempting to add missing appointments to queue...')
      const missingAppointmentsData = missingAppointments.map(doc => {
        const apt = doc.data()
        return {
          id: doc.id,
          ...apt,
          ownerName: 'Unknown Owner', // Will be updated by real-time listener
          petName: apt.petNames?.[0] || 'Unknown Pet',
          serviceName: apt['Service Names']?.[0] || apt.serviceNames?.[0] || 'Unknown Service'
        }
      })
      
      updateWaitingQueueFromAppointments([...appointments.value, ...missingAppointmentsData])
      
    } else {
      console.log('✅ All approved appointments are properly in the queue')
    }
    
  } catch (error) {
    console.error('❌ Error in manual database check:', error)
  }
}

// Check if there are opportunities to rejoin calls
const checkForRejoinOpportunities = async () => {
  try {
    const endedAppointment = sessionStorage.getItem('telehealth_appointment_ended')
    if (!endedAppointment) return
    
    const endedData = JSON.parse(endedAppointment)
    
          // Check if rejoin is still valid based on appointment time
      if (endedData.canRejoin) {
        // Find the current appointment to validate time
        const currentAppointment = appointments.value.find(apt => apt.id === endedData.id)
      
      if (currentAppointment) {
        const timeValidation = validateAppointmentTime(currentAppointment)
        
        if (!timeValidation.valid) {
          // Appointment time has passed, clear rejoin data
          sessionStorage.removeItem('telehealth_appointment_ended')
          sessionStorage.removeItem('telehealth_ice_config_ended')
          console.log('Rejoin opportunity expired - appointment time passed:', endedData.id)
        } else {
          // Rejoin is still available within appointment time
          console.log('Rejoin opportunity available for appointment:', endedData.id)
        }
      } else {
        // Appointment not found, clear rejoin data
        sessionStorage.removeItem('telehealth_appointment_ended')
        sessionStorage.removeItem('telehealth_ice_config_ended')
        console.log('Rejoin opportunity cleared - appointment not found:', endedData.id)
      }
    }
  } catch (error) {
    console.error('Error checking for rejoin opportunities:', error)
  }
}

// Set up real-time appointment monitoring
const setupAppointmentListener = () => {
  if (isListeningToAppointments.value || !authStore.user?.userId) {
    return
  }
  
  try {
    const { startOfDay, endOfDay } = getTodayRange()
    const appointmentsRef = collection(db, 'appointments')
    
    // Listen for changes to appointments for this doctor
    const q = query(
      appointmentsRef,
      where('doctorId', '==', authStore.user.userId)
      // Remove status filter to get all appointments, then filter in code
    )
    
    appointmentListener.value = onSnapshot(q, async (snapshot) => {
      const appointmentsData = []
      
      // Process appointments sequentially to handle async user name fetching
      for (const doc of snapshot.docs) {
        const appointment = doc.data()
        
        // Skip appointments that shouldn't be in the queue
        const excludedStatuses = ['completed', 'cancelled', 'ended', 'expired', 'rejected', 'pending']
        
        // Check main status - exclude pending appointments
        if (excludedStatuses.includes(appointment.status)) {
          continue
        }
        
        // Check if appointment has a reschedule request (new structure)
        if (appointment.rescheduleRequest && appointment.rescheduleRequest.status) {
          const rescheduleStatus = appointment.rescheduleRequest.status
          if (['reschedule_requested', 'reschedule_approved', 'reschedule_rejected'].includes(rescheduleStatus)) {
            console.log(`🗑️ Skipping appointment with reschedule status: ${appointment.id} (${rescheduleStatus})`)
            continue
          }
        }
        
        // Additional check: exclude approved appointments that have reschedule_requested status
        if (appointment.status === 'approved' && appointment.rescheduleRequest && appointment.rescheduleRequest.status === 'reschedule_requested') {
          console.log(`🗑️ Skipping approved appointment with reschedule_requested status: ${appointment.id}`)
          continue
        }
        
        // Check if appointment is for today
        let appointmentDate = null
        if (appointment.date) {
          if (appointment.date.toDate) {
            appointmentDate = appointment.date.toDate()
          } else if (appointment.date instanceof Date) {
            appointmentDate = appointment.date
          } else {
            appointmentDate = new Date(appointment.date)
          }
        }
        
        if (!appointmentDate || isNaN(appointmentDate.getTime())) {
          continue
        }
        
        // Check if appointment is within today's range
        const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate())
        const todayDay = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate())
        
        if (appointmentDay.getTime() !== todayDay.getTime()) {
          continue
        }
        
        // Get user name
        let ownerName = 'Unknown Owner'
        if (appointment.userId) {
          try {
            // Fetch user name synchronously for immediate display
            ownerName = await getUserName(appointment.userId)
          } catch (error) {
            console.error('Error fetching user name in listener:', error)
            ownerName = 'Unknown Owner'
          }
        }
        
        appointmentsData.push({
          id: doc.id,
          ...appointment,
          ownerName,
          petName: appointment.petNames?.[0] || 'Unknown Pet',
          serviceName: appointment['Service Names']?.[0] || appointment.serviceNames?.[0] || 'Unknown Service'
        })
      }
      
      // Update appointments array
      appointments.value = appointmentsData
      
      // Update waiting queue if no current patient
      if (!currentPatient.value) {
        updateWaitingQueueFromAppointments(appointmentsData)
      }
      
    }, (error) => {
      console.error('Error in appointment listener:', error)
    })
    
    isListeningToAppointments.value = true
    
  } catch (error) {
    console.error('Error setting up appointment listener:', error)
  }
}

// Helper function to get user name asynchronously
const getUserName = async (userId) => {
  try {
    if (!userId) {
      console.warn('No userId provided to getUserName')
      return 'Unknown Owner'
    }
    
    // Use getDoc instead of getDocs for single document fetch
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      const name = userData.firstName || userData.name || userData.displayName || 'Unknown Owner'
      console.log(`✅ Found user name for ${userId}: ${name}`)
      return name
    } else {
      console.warn(`❌ User document not found for ID: ${userId}`)
      return 'Unknown Owner'
    }
  } catch (error) {
    console.error(`Error fetching user name for ${userId}:`, error)
    return 'Unknown Owner'
  }
}

// Update waiting queue from appointments array
const updateWaitingQueueFromAppointments = (appointmentsData) => {
  // Filter out invalid appointments before sorting
  const validAppointments = appointmentsData.filter(appointment => {
    // Ensure appointment has required fields
    if (!appointment.id || !appointment.date || !appointment.time) {
      return false
    }
    
    // Ensure date is valid
    const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
    if (isNaN(appointmentDate.getTime())) {
      return false
    }
    
    return true
  })
  
  // Sort by date and time
  waitingQueue.value = validAppointments.sort((a, b) => {
    // Sort by date in ascending order (earliest first)
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB
    }
    
    // If dates are the same, sort by time
    const timeA = a.time || '00:00'
    const timeB = b.time || '00:00'
    return timeA.localeCompare(timeB)
  })
  
  // Update Firestore queue
  updateFirestoreQueue()
}

// Enhanced fetch appointments function
const fetchAppointments = async () => {
  try {
    isLoading.value = true
    
    // First, try to restore queue from Firestore
    const queueRestored = await initializeQueueFromFirestore()
    
    if (queueRestored) {
      isLoading.value = false
      return
    }
    
    // If no queue was restored, check for ongoing consultations
    await checkForOngoingConsultations()
    
    // Only fetch appointments if we don't have a current patient
    if (!currentPatient.value) {
      const { startOfDay, endOfDay } = getTodayRange()
      
      const appointmentsRef = collection(db, 'appointments')
      
      // Simplified query without orderBy to avoid Firestore limitations
      const q = query(
        appointmentsRef,
        where('doctorId', '==', authStore.user.userId)
        // Remove status filter to get all appointments, then filter in code
      )
      
      const querySnapshot = await getDocs(q)
      const appointmentsData = []
      
      for (const doc of querySnapshot.docs) {
        const appointment = doc.data()
        
        // Skip appointments that shouldn't be in the queue
        const excludedStatuses = ['completed', 'cancelled', 'ended', 'expired', 'rejected', 'pending']
        
        // Check main status - exclude pending appointments
        if (excludedStatuses.includes(appointment.status)) {
          continue
        }
        
        // Check if appointment has a reschedule request (new structure)
        if (appointment.rescheduleRequest && appointment.rescheduleRequest.status) {
          const rescheduleStatus = appointment.rescheduleRequest.status
          if (['reschedule_requested', 'reschedule_approved', 'reschedule_rejected'].includes(rescheduleStatus)) {
            console.log(`🗑️ Skipping appointment with reschedule status: ${appointment.id} (${rescheduleStatus})`)
            continue
          }
        }
        
        // Additional check: exclude approved appointments that have reschedule_requested status
        if (appointment.status === 'approved' && appointment.rescheduleRequest && appointment.rescheduleRequest.status === 'reschedule_requested') {
          console.log(`🗑️ Skipping approved appointment with reschedule_requested status: ${appointment.id}`)
          continue
        }
        
        // Check if appointment is for today
        let appointmentDate = null
        if (appointment.date) {
          if (appointment.date.toDate) {
            appointmentDate = appointment.date.toDate()
          } else if (appointment.date instanceof Date) {
            appointmentDate = appointment.date
          } else {
            appointmentDate = new Date(appointment.date)
          }
        }
        
        if (!appointmentDate || isNaN(appointmentDate.getTime())) {
          continue
        }
        
        // Check if appointment is within today's range
        const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate())
        const todayDay = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate())
        
        if (appointmentDay.getTime() !== todayDay.getTime()) {
          continue
        }
        
        // Get user name
        let ownerName = 'Unknown Owner'
        if (appointment.userId) {
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', appointment.userId)))
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data()
              ownerName = userData.firstName || userData.name || 'Unknown Owner'
            }
          } catch (error) {
            console.error('Error fetching user:', error)
          }
        }
        
        // Check if this appointment has vaccination services
        const hasVaccinationServices = await checkForVaccinationServices(appointment)
        
        appointmentsData.push({
          id: doc.id,
          ...appointment,
          ownerName,
          petName: appointment.petNames?.[0] || 'Unknown Pet',
          serviceName: appointment['Service Names']?.[0] || appointment.serviceNames?.[0] || 'Unknown Service',
          hasVaccinationServices // Add vaccination service flag
        })
      }
      
      appointments.value = appointmentsData
      
      // Filter out invalid appointments before sorting
      const validAppointments = appointmentsData.filter(appointment => {
        // Ensure appointment has required fields
        if (!appointment.id || !appointment.date || !appointment.time) {
          return false
        }
        
        // Ensure date is valid
        const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
        if (isNaN(appointmentDate.getTime())) {
          return false
        }
        
        return true
      })
      
      // Sort by date and time
      waitingQueue.value = validAppointments.sort((a, b) => {
        // Sort by date in ascending order (earliest first)
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB
        }
        
        // If dates are the same, sort by time
        const timeA = a.time || '00:00'
        const timeB = b.time || '00:00'
        return timeA.localeCompare(timeB)
      })
      
      // Update Firestore queue with initial data
      await updateFirestoreQueue()
    }
    
  } catch (error) {
    console.error('Error fetching appointments:', error)
    // Show more detailed error information
    if (error.code === 'permission-denied') {
      console.error('Permission denied - check if user is authenticated and has correct role')
    } else if (error.code === 'unavailable') {
      console.error('Firestore unavailable - check network connection')
    }
  } finally {
    isLoading.value = false
  }
}

// Queue management methods
const callNext = async () => {
  try {
    if (!canCallNext.value) {
      return
    }
    
    if (waitingQueue.value.length === 0) {
      return
    }
    
    const nextPatient = waitingQueue.value[0]
    if (!nextPatient) {
      return
    }
    
    // Check if this patient has vaccination services
    const hasVaccinationServices = await checkForVaccinationServices(nextPatient)
    
    // Set current patient and remove from waiting queue
    currentPatient.value = {
      ...nextPatient,
      startTime: new Date(),
      hasVaccinationServices // Add this property for UI display
    }
    
    // Remove from waiting queue
    waitingQueue.value.shift()
    
    // Update Firestore queue
    updateFirestoreQueue()
    
  } catch (error) {
    console.error('Error calling next patient:', error)
    // Revert changes if there was an error
    if (currentPatient.value?.id === nextPatient?.id) {
      currentPatient.value = null
    }
    // You can add a toast notification here to inform the user of the error
  }
}

// Call next patient with confirmation if there's a current patient
const callNextWithConfirmation = () => {
  if (currentPatient.value) {
    // Show confirmation dialog
    showActionConfirmDialog(
      'callNext',
      'Call Next Patient',
      `Are you sure you want to call the next patient? This will end the current consultation with "${currentPatient.value.ownerName}" and start a new one.`,
      'Call Next Patient',
      'Cancel'
    )
  } else {
    // No current patient, call next directly
    callNext()
  }
}

// Completion form functions
const openCompletionForm = async (appointment) => {
  try {
    // Ensure services data is loaded first
    if (Object.keys(servicesData.value).length === 0) {
      await fetchServiceData()
    }
    
    // Now check if this appointment has vaccination services
    const hasVaccinationServices = await checkForVaccinationServices(appointment)
    
    if (hasVaccinationServices) {
      // Redirect to approval page for vaccination appointments
      redirectToApprovalPage(appointment.id)
      return
    }
    
    // Regular appointment - show completion form modal
    selectedAppointment.value = appointment
    
    // Initialize completion form with appointment data
    completionForm.value = {
      services: (appointment['Service Names'] || appointment.serviceNames || []).map(service => ({
        name: service,
        status: 'completed',
        duration: 30,
        notes: '',
        category: getServiceCategory(service) // Add category information
      })),
      pets: [{
        name: appointment.petName || 'Pet',
        overallHealth: 'good',
        weight: '',
        healthNotes: '',
        followUpRequired: false,
        followUpNotes: ''
      }],
      generalNotes: {
        treatmentSummary: '',
        ownerInstructions: '',
        nextSteps: ''
      }
    }
    
    showCompletionFormModal.value = true
    
  } catch (error) {
    console.error('Error in openCompletionForm:', error)
    // Fallback: show modal
    showCompletionFormModal.value = true
  }
}

const closeCompletionFormModal = () => {
  showCompletionFormModal.value = false
  selectedAppointment.value = null
  completionForm.value = {
    services: [],
    pets: [{
      name: '',
      overallHealth: 'good',
      weight: '',
      healthNotes: '',
      followUpRequired: false,
      followUpNotes: ''
    }],
    generalNotes: {
      treatmentSummary: '',
      ownerInstructions: '',
      nextSteps: ''
    }
  }
}

const submitCompletionForm = async () => {
  if (!selectedAppointment.value) return
  
  completionFormLoading.value = true
  try {
    // Create completion data object
    const completionData = {
      appointmentId: selectedAppointment.value.id,
      completedAt: new Date(),
      completedBy: authStore.user?.userId,
      services: completionForm.value.services,
      pets: completionForm.value.pets,
      generalNotes: completionForm.value.generalNotes,
      status: 'completed'
    }
    
    // Update appointment status and add completion data
    await updateAppointmentStatus(selectedAppointment.value.id, 'completed')
    
    // Store completion data
    await storeCompletionData(completionData)
    
    // CRITICAL: Remove completed patient from current patient and queue
    if (currentPatient.value?.id === selectedAppointment.value.id) {
      currentPatient.value = null
      console.log('Completed patient removed from current patient')
      
          // Auto-call next patient if available
    if (waitingQueue.value.length > 0) {
      console.log('Auto-calling next patient...')
      setTimeout(() => {
        callNext()
      }, 1000) // Small delay to show completion
    } else {
      console.log('No more patients in queue - all consultations completed!')
      // Update Firestore queue to clear current patient
      await updateFirestoreQueue()
    }
    }
    
    // Close modal and refresh data
    closeCompletionFormModal()
    await fetchAppointments()
    
    // Update Firestore queue to reflect the change
    await updateFirestoreQueue()
    
    // Show success message (you can add a toast notification here)
    console.log('Appointment completed successfully!')
            
    
  } catch (error) {
    console.error('Error completing appointment:', error)
    // Show error message (you can add a toast notification here)
    console.error('Failed to complete appointment. Please try again.')
  } finally {
    completionFormLoading.value = false
  }
}

const storeCompletionData = async (completionData) => {
  try {
    const appointmentRef = doc(db, 'appointments', completionData.appointmentId)
    await updateDoc(appointmentRef, {
      status: 'completed',
      completedAt: completionData.completedAt,
      completedBy: completionData.completedBy,
      completionData: {
        services: completionData.services,
        pets: completionData.pets,
        generalNotes: completionData.generalNotes
      }
    })
  } catch (error) {
    console.error('Error storing completion data:', error)
    throw error
  }
}

// Fetch service categories and services data
const fetchServiceData = async () => {
  try {
    // Fetch categories
    const categoriesRef = collection(db, 'categories')
    const categoriesSnapshot = await getDocs(categoriesRef)
    categoriesData.value = {}
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data()
      categoriesData.value[doc.id] = {
        id: doc.id,
        name: data.name,
        description: data.description,
        coverPhoto: data.coverPhoto,
        archived: data.archived
      }
    })
    
    // Fetch services
    const servicesRef = collection(db, 'services')
    const servicesSnapshot = await getDocs(servicesRef)
    servicesData.value = {}
    
    servicesSnapshot.forEach(doc => {
      const data = doc.data()
      servicesData.value[doc.id] = {
        id: doc.id,
        name: data.name,
        categoryId: data.categoryId,
        classification: data.classification,
        fees: data.fees,
        processingTime: data.processingTime,
        transactionType: data.transactionType,
        isVaccination: data.isVaccination || false, // Include vaccination field
        isTelehealth: data.isTelehealth || false // Include telehealth field
      }
    })
    
    // Build service-category mapping by service ID for better accuracy
    serviceCategories.value = {}
    Object.values(servicesData.value).forEach(service => {
      if (service.categoryId && categoriesData.value[service.categoryId]) {
        serviceCategories.value[service.id] = categoriesData.value[service.categoryId]
        // Also keep the name mapping for backward compatibility
        serviceCategories.value[service.name] = categoriesData.value[service.categoryId]
      }
    })
    
    // Log service counts for monitoring
    console.log(`Services loaded: ${Object.keys(servicesData.value).length}`)
    console.log(`Vaccination services: ${Object.values(servicesData.value).filter(s => s.isVaccination).length}`)
    console.log(`Telehealth services: ${Object.values(servicesData.value).filter(s => s.isTelehealth).length}`)
    
  } catch (error) {
    console.error('Error fetching service data:', error)
  }
}

// Get service category by service name
const getServiceCategory = (serviceName) => {
  return serviceCategories.value[serviceName] || null
}

// Helper function to get service details by ID
const getServiceById = (serviceId) => {
  return servicesData.value[serviceId] || null
}

// Helper function to get service details by name
const getServiceByName = (serviceName) => {
  return Object.values(servicesData.value).find(service => service.name === serviceName) || null
}



// Execute return patient to queue after confirmation
const returnPatientToQueueConfirmed = async () => {
  if (currentPatient.value) {
    try {
      console.log('Returning patient to queue:', currentPatient.value.ownerName)
      
      // Validate that the patient has required data
      if (!currentPatient.value.id || !currentPatient.value.userId) {
        console.error('Patient missing required data for queue return')
        throw new Error('Patient data incomplete')
      }
      
      // Update appointment status back to 'approved'
      await updateAppointmentStatus(currentPatient.value.id, 'approved')
      
      // Create a clean patient object for the queue (remove consultation-specific data)
      const queuePatient = {
        ...currentPatient.value,
        startTime: undefined, // Remove consultation start time
        hasVaccinationServices: undefined, // Remove vaccination flag
        isTelehealth: undefined, // Remove telehealth flag
        iceConfig: undefined // Remove ICE config
      }
      
      // Add patient back to the beginning of the queue (priority)
      waitingQueue.value.unshift(queuePatient)
      
      // Re-sort to maintain date order
      sortQueueByDate()
      
      // Clear current patient
      currentPatient.value = null
      
      // Update Firestore queue immediately to prevent state inconsistency
      await updateFirestoreQueue()
      
      console.log('Patient returned to queue successfully')
      
    } catch (error) {
      console.error('Error returning patient to queue:', error)
      // Show error message (you can add a toast notification here)
      // You can add a toast notification here to inform the user of the error
    }
  }
}

// Mark patient as expired (missed appointment) and clear consultation
const markPatientAsExpired = async () => {
  if (currentPatient.value) {
    try {
      console.log('Marking patient as expired:', currentPatient.value.ownerName)
      
      // Validate that the patient has required data
      if (!currentPatient.value.id) {
        console.error('Patient missing required data for expiration')
        throw new Error('Patient data incomplete')
      }
      
      // Update appointment status to 'expired'
      await updateAppointmentStatus(currentPatient.value.id, 'expired')
      
      // Add expiration metadata
      const appointmentRef = doc(db, 'appointments', currentPatient.value.id)
      await updateDoc(appointmentRef, {
        expiredAt: new Date(),
        expiredBy: authStore.user?.userId || 'system',
        expirationReason: 'Patient did not show up for appointment',
        consultationStartTime: currentPatient.value.startTime || null,
        consultationEndTime: new Date()
      })
      
      // Clear current patient
      currentPatient.value = null
      
      // Update Firestore queue immediately to prevent state inconsistency
      await updateFirestoreQueue()
      
      console.log('Patient marked as expired successfully')
      
      // Auto-call next patient if available
      if (waitingQueue.value.length > 0) {
        console.log('Auto-calling next patient after marking previous as expired...')
        setTimeout(() => {
          callNext()
        }, 1000) // Small delay to show expiration
      }
      
    } catch (error) {
      console.error('Error marking patient as expired:', error)
      // You can add a toast notification here to inform the user of the error
    }
  }
}



// Function to return current patient back to the queue (if accidentally called)
const returnPatientToQueue = () => {
  if (currentPatient.value) {
    // Show confirmation dialog
    showActionConfirmDialog(
      'returnToQueue',
      'Return Patient to Queue',
      `Are you sure you want to return "${currentPatient.value.ownerName}" to the queue? This will put them back in line for consultation.`,
      'Return to Queue',
      'Cancel'
    )
  }
}

// Function to manually clear current patient (useful for debugging or manual control)
const clearCurrentPatient = () => {
  if (currentPatient.value) {
    // Show confirmation dialog for marking patient as expired
    showActionConfirmDialog(
      'clearPatient',
      'Mark Patient as Expired',
      `Are you sure you want to mark "${currentPatient.value.ownerName}" as expired? This will mark their appointment as missed and remove them from the current consultation.`,
      'Mark as Expired',
      'Cancel'
    )
  }
}

// Execute the confirmed action
const executeConfirmedAction = () => {
  if (!actionToConfirm.value) return
  
  switch (actionToConfirm.value) {
    case 'returnToQueue':
      if (currentPatient.value) {
        returnPatientToQueueConfirmed()
      }
      break
      
    case 'clearPatient':
      if (currentPatient.value) {
        // Mark patient as expired and clear consultation
        markPatientAsExpired()
      }
      break
      

      
    case 'transferPatient':
      if (actionData.value) {
        const { patientId, direction } = actionData.value
        transferPatientConfirmed(patientId, direction)
      }
      break
      
    case 'pauseQueue':
      pauseQueueConfirmed()
      break
      
    case 'callNext':
      callNext()
      break
      
    case 'startConsultation':
      if (actionData.value) {
        startConsultation(actionData.value)
      }
      break
  }
  
  // Close confirmation dialog
  showActionConfirm.value = false
  actionToConfirm.value = null
  actionData.value = null
}

// Show action confirmation dialog
const showActionConfirmDialog = (action, title, message, confirmText = 'Confirm', cancelText = 'Cancel') => {
  actionToConfirm.value = action
  actionMessage.value = message
  actionConfirmText.value = confirmText
  actionCancelText.value = cancelText
  showActionConfirm.value = true
}

// Cancel action confirmation
const cancelActionConfirm = () => {
  showActionConfirm.value = false
  actionToConfirm.value = null
  actionData.value = null
}

const pauseQueue = () => {
  const action = queuePaused.value ? 'resume' : 'pause'
  const actionText = queuePaused.value ? 'resume' : 'pause'
  
  // Show confirmation dialog
  showActionConfirmDialog(
    'pauseQueue',
    `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Queue`,
    `Are you sure you want to ${actionText} the queue? This will ${queuePaused.value ? 'allow' : 'stop'} new patients from being called.`,
    queuePaused.value ? 'Resume Queue' : 'Pause Queue',
    'Cancel'
  )
}

// Execute pause/resume queue after confirmation
const pauseQueueConfirmed = () => {
  queuePaused.value = !queuePaused.value
  
  // Update Firestore queue
  updateFirestoreQueue()
}

// Enhanced queue management methods
const sortQueueByDate = () => {
  waitingQueue.value.sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
    return dateA - dateB
  })
}

const transferPatient = (patientId, direction) => {
  const patientIndex = waitingQueue.value.findIndex(p => p.id === patientId)
  if (patientIndex === -1) return
  
  const patient = waitingQueue.value[patientIndex]
  const directionText = direction === 'up' ? 'up' : 'down'
  
  // Show confirmation dialog
  showActionConfirmDialog(
    'transferPatient',
    'Move Patient in Queue',
    `Are you sure you want to move "${patient.ownerName}" ${directionText} in the queue? This will change their position from #${patientIndex + 1}.`,
    'Move Patient',
    'Cancel'
  )
  actionData.value = { patientId, direction }
}

// Execute transfer patient after confirmation
const transferPatientConfirmed = (patientId, direction) => {
  const patientIndex = waitingQueue.value.findIndex(p => p.id === patientId)
  if (patientIndex === -1) return
  
  const newIndex = direction === 'up' ? Math.max(0, patientIndex - 1) : Math.min(waitingQueue.value.length - 1, patientIndex + 1)
  
  if (newIndex !== patientIndex) {
    const patient = waitingQueue.value.splice(patientIndex, 1)[0]
    waitingQueue.value.splice(newIndex, 0, patient)
    // Re-sort to maintain date order
    sortQueueByDate()
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

// Firestore queue management functions
const getQueueDocRef = () => {
  const today = new Date()
  const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
  return doc(db, 'queues', `${authStore.user?.userId}_${dateString}`)
}

const updateFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    
    // Prepare current patient data
    let currentPatientData = null
    if (currentPatient.value) {
      currentPatientData = {
        id: currentPatient.value.id || null,
        userId: currentPatient.value.userId || null,
        petNames: currentPatient.value.petNames || [],
        Services: currentPatient.value.Services || currentPatient.value.services || [],
        'Service Names': currentPatient.value['Service Names'] || currentPatient.value.serviceNames || [],
        startTime: currentPatient.value.startTime || new Date(),
        ownerName: currentPatient.value.ownerName || 'Unknown Owner',
        petName: currentPatient.value.petName || 'Unknown Pet',
        serviceName: currentPatient.value.serviceName || 'Unknown Service',
        isTelehealth: currentPatient.value.isTelehealth || false,
        iceConfig: currentPatient.value.iceConfig || null,
        // CRITICAL: Preserve original appointment scheduling data
        date: currentPatient.value.date || null,
        time: currentPatient.value.time || null,
        duration: currentPatient.value.duration || 30,
        // Add additional fields that might be needed
        appointmentId: currentPatient.value.id || null,
        status: 'in-progress'
      }
      
      // Remove any undefined values
      Object.keys(currentPatientData).forEach(key => {
        if (currentPatientData[key] === undefined) {
          delete currentPatientData[key]
        }
      })
    }
    
    const queueData = {
      doctorId: authStore.user?.userId || null,
      date: new Date(),
      currentPatient: currentPatientData,
      waitingQueue: waitingQueue.value.map(patient => {
        // Filter out undefined values and provide defaults
        const cleanPatient = {
          id: patient.id || null,
          userId: patient.userId || null,
          petNames: patient.petNames || [],
          Services: patient.Services || patient.services || [],
          'Service Names': patient['Service Names'] || patient.serviceNames || [],
          // CRITICAL: Preserve original appointment scheduling data
          date: patient.date || null,
          time: patient.time || null,
          duration: patient.duration || 30,
          ownerName: patient.ownerName || 'Unknown Owner',
          petName: patient.petName || 'Unknown Pet',
          serviceName: patient.serviceName || 'Unknown Service'
        }
        
        // Remove any remaining undefined values
        Object.keys(cleanPatient).forEach(key => {
          if (cleanPatient[key] === undefined) {
            delete cleanPatient[key]
          }
        })
        
        return cleanPatient
      }),
      queueStatus: queuePaused.value ? 'paused' : 'active',
      lastUpdated: new Date(),
      totalPatients: waitingQueue.value.length + (currentPatient.value ? 1 : 0)
    }
    
    await setDoc(queueDocRef, queueData, { merge: true })
            
  } catch (error) {
    console.error('Error updating Firestore queue:', error)
  }
}

const clearFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    await deleteDoc(queueDocRef)
            
  } catch (error) {
    console.error('Error clearing Firestore queue:', error)
  }
}

// Load queue data from Firestore
const loadFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    const queueDoc = await getDoc(queueDocRef)
    
    if (queueDoc.exists()) {
      const queueData = queueDoc.data()
      console.log('Loaded queue data from Firestore:', queueData)
      
      // Restore current patient if exists
      if (queueData.currentPatient && !currentPatient.value) {
        console.log('Restoring current patient from queue:', queueData.currentPatient)
        
        // Try to get fresh appointment data to ensure we have correct scheduling info
        let freshAppointmentData = null
        try {
          if (queueData.currentPatient.id) {
            const appointmentRef = doc(db, 'appointments', queueData.currentPatient.id)
            const appointmentDoc = await getDoc(appointmentRef)
            if (appointmentDoc.exists()) {
              freshAppointmentData = appointmentDoc.data()
              console.log('Found fresh appointment data:', freshAppointmentData)
            }
          }
        } catch (error) {
          console.error('Error fetching fresh appointment data:', error)
        }
        
        // Ensure date and time are properly preserved
        const restoredPatient = {
          ...queueData.currentPatient,
          // Use fresh appointment data if available, otherwise fall back to queue data
          date: freshAppointmentData?.date ? new Date(freshAppointmentData.date) : 
                 queueData.currentPatient.date ? new Date(queueData.currentPatient.date) : null,
          time: freshAppointmentData?.time || queueData.currentPatient.time || null,
          duration: freshAppointmentData?.duration || queueData.currentPatient.duration || 30,
          // Ensure startTime is a proper Date object
          startTime: queueData.currentPatient.startTime ? new Date(queueData.currentPatient.startTime) : new Date(),
          // Mark as from queue for debugging
          _fromQueue: true
        }
        
        currentPatient.value = restoredPatient
        console.log('Restored patient with date:', restoredPatient.date, 'and time:', restoredPatient.time)
      }
      
      // Restore waiting queue if exists
      if (queueData.waitingQueue && Array.isArray(queueData.waitingQueue)) {
        console.log('Restoring waiting queue from Firestore:', queueData.waitingQueue)
        
        const restoredWaitingQueue = queueData.waitingQueue.map(patient => ({
          ...patient,
          // Ensure date is a proper Date object
          date: patient.date ? new Date(patient.date) : null,
          // Ensure time is preserved as string
          time: patient.time || null,
          // Mark as from queue for debugging
          _fromQueue: true
        }))
        
        waitingQueue.value = restoredWaitingQueue
        console.log('Restored waiting queue with dates and times preserved')
      }
    }
  } catch (error) {
    console.error('Error loading Firestore queue:', error)
  }
}

const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId)
    await updateDoc(appointmentRef, {
      status: status,
      lastUpdated: new Date()
    })
            
  } catch (error) {
    console.error('Error updating appointment status:', error)
  }
}

const initializeQueueFromFirestore = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    const queueDoc = await getDocs(query(collection(db, 'queues'), where('__name__', '==', queueDocRef.id)))
    
    if (!queueDoc.empty) {
      const queueData = queueDoc.docs[0].data()
              
      
      // Restore current patient if exists
      if (queueData.currentPatient) {
        
        currentPatient.value = {
          ...queueData.currentPatient,
          startTime: queueData.currentPatient.startTime ? new Date(queueData.currentPatient.startTime) : new Date(),
          // Handle iceConfig properly - it might be stored as a string or object
          iceConfig: queueData.currentPatient.iceConfig ? 
            (typeof queueData.currentPatient.iceConfig === 'string' ? 
              JSON.parse(queueData.currentPatient.iceConfig) : 
              queueData.currentPatient.iceConfig) : null
        }
        
        // Mark telehealth as enabled if we have a current patient with iceConfig
        if (currentPatient.value.iceConfig) {
          isTelehealthEnabled.value = true
          xirsysStatus.value = 'available'
        }
      }
      
      // Restore waiting queue
      if (queueData.waitingQueue) {
        
        waitingQueue.value = queueData.waitingQueue.map(patient => ({
          ...patient,
          date: patient.date?.toDate ? patient.date.toDate() : new Date(patient.date)
        }))
      }
      
      // Restore queue status
      queuePaused.value = queueData.queueStatus === 'paused'
      
              
      return true
    }
    
            
    return false
  } catch (error) {
    console.error('Error initializing queue from Firestore:', error)
    return false
  }
}

const getEstimatedWaitTime = (position) => {
  if (position === 0) return 0
  
  // Get the actual duration from the appointment data
  const getServiceDuration = (patient) => {
    // Use the duration field from the appointment, or fallback to service-based estimates
    if (patient.duration) {
      return patient.duration
    }
    
    // Service-based duration estimates (in minutes)
    const serviceDurations = {
      'General Checkup': 20,
      'Vaccination': 15,
      'Emergency': 45,
      'Surgery': 120,
      'Dental': 60,
      'Grooming': 45,
      'Treatment': 30
    }
    
    const service = patient.serviceName || ''
    for (const [key, duration] of Object.entries(serviceDurations)) {
      if (service.toLowerCase().includes(key.toLowerCase())) {
        return duration
      }
    }
    
    return 30 // Default fallback
  }
  
  // Calculate total wait time based on patients ahead
  let totalWaitTime = 0
  
  // Add time for current patient if they're still consulting
  if (currentPatient.value) {
    const currentPatientDuration = getServiceDuration(currentPatient.value)
    const consultationStartTime = currentPatient.value.startTime
    const elapsedTime = consultationStartTime ? (Date.now() - new Date(consultationStartTime).getTime()) / 60000 : 0
    const remainingTime = Math.max(0, currentPatientDuration - elapsedTime)
    totalWaitTime += remainingTime
  }
  
  // Add time for patients ahead in the queue
  for (let i = 0; i < position; i++) {
    const patient = waitingQueue.value[i]
    if (patient) {
      totalWaitTime += getServiceDuration(patient)
    }
  }
  
  // Add some buffer time between patients (5 minutes)
  const bufferTime = position * 5
  totalWaitTime += bufferTime
  
  return Math.round(totalWaitTime)
}

const getEstimatedStartTime = (position) => {
  if (position === 0) return 'Immediate'
  
  const waitMinutes = getEstimatedWaitTime(position)
  const estimatedStart = new Date(currentTime.value.getTime() + (waitMinutes * 60000))
  
  return estimatedStart.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

// Format functions
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    let date
    // Handle Firebase Timestamp
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      // Handle Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }
    
    if (isNaN(date.getTime())) return 'Invalid Time'
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    console.error('Error formatting time:', error, timestamp)
    return 'Invalid Time'
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    let dateObj
    
    // Handle Firebase Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate()
    } else if (date && typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp object
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date)
      return 'Invalid Date'
    }
    
    return dateObj.toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Invalid Date'
  }
}

const formatDateTime = (date, time) => {
  if (!date) return 'N/A'
  try {
    let dateObj
    
    // Handle Firebase Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate()
    } else if (date && typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp object
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date)
      return 'Invalid Date'
    }
    
    const dateStr = dateObj.toLocaleDateString()
    const timeStr = time || 'No time specified'
    
    return `${dateStr} at ${timeStr}`
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Invalid Date'
  }
}

// Video control functions for preview
const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (localVideoRef.value && localVideoRef.value.srcObject) {
    const audioTrack = localVideoRef.value.srcObject.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !isMuted.value
    }
  }
}

const toggleVideo = () => {
  isVideoOff.value = !isVideoOff.value
  if (localVideoRef.value && localVideoRef.value.srcObject) {
    const videoTrack = localVideoRef.value.srcObject.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !isVideoOff.value
    }
  }
}

// Periodic queue sync to prevent data loss
const syncQueueState = async () => {
  try {
    // If we have a current patient, ensure the queue is synced
    if (currentPatient.value) {
      await updateFirestoreQueue()
    }
    
    // Also refresh appointment data to ensure we have correct scheduling info
    await refreshAppointmentData()
  } catch (error) {
    console.error('Error syncing queue state:', error)
  }
}

// Refresh appointment data to ensure correct scheduling information
const refreshAppointmentData = async () => {
  try {
    // Refresh current patient data if it exists
    if (currentPatient.value?.id) {
      const appointmentRef = doc(db, 'appointments', currentPatient.value.id)
      const appointmentDoc = await getDoc(appointmentRef)
      
      if (appointmentDoc.exists()) {
        const freshData = appointmentDoc.data()
        console.log('Refreshing current patient appointment data:', freshData)
        
        // Update only the scheduling fields, preserve other state
        currentPatient.value = {
          ...currentPatient.value,
          date: freshData.date ? new Date(freshData.date) : currentPatient.value.date,
          time: freshData.time || currentPatient.value.time,
          duration: freshData.duration || currentPatient.value.duration
        }
        
        console.log('Updated current patient with fresh scheduling data')
      }
    }
    
    // Refresh waiting queue data
    for (let i = 0; i < waitingQueue.value.length; i++) {
      const patient = waitingQueue.value[i]
      if (patient.id) {
        try {
          const appointmentRef = doc(db, 'appointments', patient.id)
          const appointmentDoc = await getDoc(appointmentRef)
          
          if (appointmentDoc.exists()) {
            const freshData = appointmentDoc.data()
            console.log(`Refreshing waiting patient ${patient.id} appointment data:`, freshData)
            
            // Update only the scheduling fields
            waitingQueue.value[i] = {
              ...patient,
              date: freshData.date ? new Date(freshData.date) : patient.date,
              time: freshData.time || patient.time,
              duration: freshData.duration || patient.duration
            }
          }
        } catch (error) {
          console.error(`Error refreshing patient ${patient.id} data:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error refreshing appointment data:', error)
  }
}

// Add end-of-day cleanup
const checkEndOfDay = () => {
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  
  if (now > endOfDay) {
    // It's a new day, clear the queue
    clearFirestoreQueue()
    // Reset local state
    currentPatient.value = null
    waitingQueue.value = []
    queuePaused.value = false
  }
}

// Check user authentication and role
const checkUserAuth = () => {
  if (!authStore.user?.userId) {
    console.error('No user ID - user not authenticated')
    return false
  }
  
  if (authStore.user?.role !== 'veterinary') {
    console.error('User role is not veterinary:', authStore.user?.role)
    return false
  }
  
  return true
}

// Debug function to check user data fetching
const debugUserDataFetching = async () => {
  try {
    console.log('🔍 Debugging user data fetching...')
    
    if (!authStore.user?.userId) {
      console.log('❌ No authenticated user')
      return
    }
    
    // First, clean up any excluded appointments
    console.log('🧹 Cleaning up excluded appointments...')
    cleanupExcludedAppointments()
    
    // Check if we have any appointments with userIds
    const appointmentsWithUsers = appointments.value.filter(apt => apt.userId)
    console.log(`📋 Appointments with userIds: ${appointmentsWithUsers.length}`)
    
    if (appointmentsWithUsers.length > 0) {
      const sampleAppointment = appointmentsWithUsers[0]
      console.log('📝 Sample appointment:', {
        id: sampleAppointment.id,
        userId: sampleAppointment.userId,
        ownerName: sampleAppointment.ownerName,
        status: sampleAppointment.status
      })
      
      // Try to fetch user data for the first appointment
      if (sampleAppointment.userId) {
        console.log(`🔍 Attempting to fetch user data for userId: ${sampleAppointment.userId}`)
        const userName = await getUserName(sampleAppointment.userId)
        console.log(`✅ Fetched user name: ${userName}`)
        
        // Also check the users collection structure
        const usersRef = collection(db, 'users')
        const usersSnapshot = await getDocs(usersRef.limit(1))
        if (!usersSnapshot.empty) {
          const sampleUser = usersSnapshot.docs[0].data()
          console.log('👤 Sample user document structure:', Object.keys(sampleUser))
          console.log('👤 Sample user data:', {
            id: usersSnapshot.docs[0].id,
            firstName: sampleUser.firstName,
            name: sampleUser.name,
            displayName: sampleUser.displayName
          })
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error in debugUserDataFetching:', error)
  }
}

// Clean up appointment listener
const cleanupAppointmentListener = () => {
  if (appointmentListener.value) {
    appointmentListener.value()
    appointmentListener.value = null
    isListeningToAppointments.value = false
  }
}

// Clean up any appointments with excluded statuses from the current queue
const cleanupExcludedAppointments = () => {
  const excludedStatuses = ['completed', 'cancelled', 'ended', 'expired', 'rejected']
  
  // Clean waiting queue
  waitingQueue.value = waitingQueue.value.filter(patient => {
    // Check main status
    if (excludedStatuses.includes(patient.status)) {
      console.log(`🗑️ Removing excluded appointment from queue: ${patient.id} (${patient.status})`)
      return false
    }
    
    // Check reschedule request status (new structure)
    if (patient.rescheduleRequest && patient.rescheduleRequest.status) {
      const rescheduleStatus = patient.rescheduleRequest.status
      if (['reschedule_requested', 'reschedule_approved', 'reschedule_rejected'].includes(rescheduleStatus)) {
        console.log(`🗑️ Removing appointment with reschedule status from queue: ${patient.id} (${rescheduleStatus})`)
        return false
      }
    }
    
    return true
  })
  
  // Clean current patient if they have excluded status
  if (currentPatient.value) {
    let shouldClear = false
    
    // Check main status
    if (excludedStatuses.includes(currentPatient.value.status)) {
      console.log(`🗑️ Clearing current patient with excluded status: ${currentPatient.value.id} (${currentPatient.value.status})`)
      shouldClear = true
    }
    
    // Check reschedule request status
    if (currentPatient.value.rescheduleRequest && currentPatient.value.rescheduleRequest.status) {
      const rescheduleStatus = currentPatient.value.rescheduleRequest.status
      if (['reschedule_requested', 'reschedule_approved', 'reschedule_rejected'].includes(rescheduleStatus)) {
        console.log(`🗑️ Clearing current patient with reschedule status: ${currentPatient.value.id} (${rescheduleStatus})`)
        shouldClear = true
      }
    }
    
    if (shouldClear) {
      currentPatient.value = null
    }
  }
  
  // Update Firestore queue after cleanup
  updateFirestoreQueue()
}

// Lifecycle
onUnmounted(() => {
  // Don't clear the queue on unmount - this can cause data loss
  // The queue should persist across navigation
  // Only clear on end-of-day or manual reset
})

// Check end of day every hour
onMounted(async () => {
  // First check user authentication
  const authOk = checkUserAuth()
  if (!authOk) {
    console.error('Authentication check failed, stopping initialization')
    return
  }
  
  await fetchServiceData() // Fetch service categories and services
  
  // Check Xirsys availability on mount
  await checkXirsysAvailability()
  
  // Set up real-time appointment listener
  setupAppointmentListener()
  
  // Fetch appointments and restore queue state
  await fetchAppointments()
  
  // Load queue data from Firestore to restore state
  await loadFirestoreQueue()
  
  // Clean up any excluded appointments that might have been loaded
  cleanupExcludedAppointments()
  
  // Update current time every minute to refresh wait estimates
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000) // Update every minute
  
  // Check Xirsys availability every minute
  const xirsysTimer = setInterval(checkXirsysAvailability, 60000)
  
  // Sync queue state every 30 seconds to prevent data loss
  const queueSyncTimer = setInterval(syncQueueState, 30000)
  
  // Update time status every minute for real-time updates
  const timeUpdateTimer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000) // Update every minute
  
  // Check end of day every hour
  const endOfDayTimer = setInterval(() => {
    checkEndOfDay()
  }, 3600000) // Check every hour
  
  // Cleanup timers on unmount
  onUnmounted(() => {
    clearInterval(timer)
    clearInterval(xirsysTimer) // Clear Xirsys timer
    clearInterval(queueSyncTimer) // Clear queue sync timer
    clearInterval(timeUpdateTimer) // Clear time update timer
    clearInterval(endOfDayTimer)
    
    // Clean up appointment listener
    cleanupAppointmentListener()
  })
})
</script>

<style scoped>
/* Add any specific styles here */
</style>
