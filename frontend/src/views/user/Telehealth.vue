<!-- views/user/Telehealth.vue -->
<template>
  <div class="telehealth-container">
    <!-- Loading spinner during initial data load -->
    <LoadingSpinner v-if="loading" isOverlay text="Loading appointments..." />

    <!-- Carousel View (Optimized for small screens) -->
    <div v-if="currentView === 'carousel' && !activeSession" class="h-full flex flex-col bg-gray-50 overflow-auto">
      <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 flex-1 min-h-0 px-2 md:px-4 pb-4">
        <div class="w-full bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div class="p-4 md:p-6 pb-8 md:pb-10 space-y-3 md:space-y-4 overflow-y-auto flex-1">
            <!-- Optimized grid layout for mobile -->
            <div class="grid lg:grid-cols-2 gap-4 lg:gap-8 min-h-0 lg:min-h-[600px]">
              <!-- Left Column - Adjusted padding for mobile -->
              <div class="flex flex-col px-2 md:px-4">
                <!-- Reduced padding for small screens -->
                <div class="pt-6 sm:pt-12 md:pt-24 lg:pt-48">
                  <div class="space-y-3">
                    <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
                      {{ slides[currentSlide].title }}
                    </h1>
                    <p class="text-base sm:text-lg md:text-xl text-gray-600">
                      {{ slides[currentSlide].subtitle }}
                    </p>
                  </div>

                  <!-- Meeting Controls - Responsive spacing -->
                  <div class="mt-4 sm:mt-6 md:mt-8">
                    <div class="flex flex-wrap gap-2 sm:gap-4">
                      <button 
                        @click="currentView = 'sessions'"
                        class="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <VideoIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Sessions
                      </button>
                      <button 
                        @click="navigateToAppointments()"
                        class="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <CalendarPlusIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        Create New
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column - Animation centered & sized appropriately -->
              <div class="flex items-center justify-center py-4 sm:py-6">
                <!-- Animation container with better responsive sizing -->
                <div class="relative w-full max-w-[250px] sm:max-w-[300px] md:max-w-md mx-auto">
                  <div class="aspect-square relative">
                    <div class="absolute inset-0 bg-blue-50 rounded-full overflow-hidden">
                      <TransitionGroup name="slide">
                        <div 
                          v-for="(slide, index) in slides" 
                          :key="slide.id"
                          v-show="currentSlide === index"
                          class="absolute inset-0 transition-all duration-300"
                        >
                          <div :id="`lottie-container-${index}`" class="w-full h-full"></div>
                        </div>
                      </TransitionGroup>
                    </div>
                  </div>

                  <!-- Carousel Dots - Centered below animation -->
                  <div class="flex justify-center gap-2 mt-4 sm:mt-6">
                    <button 
                      v-for="(slide, index) in slides" 
                      :key="slide.id"
                      @click="goToSlide(index)"
                      :aria-label="`Go to slide ${index + 1}`"
                      :class="[
                        'w-2 h-2 rounded-full transition-all',
                        currentSlide === index 
                          ? 'bg-blue-600 w-4' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      ]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session List View - Optimized for mobile -->
    <div v-else-if="currentView === 'sessions' && !activeSession" class="h-full flex flex-col bg-gray-50 overflow-auto">
      <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 flex-1 min-h-0 px-2 md:px-4 pb-4">
        <div class="w-full bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <!-- Updated to better spacing on mobile -->
          <div class="p-4 md:p-6 pb-8 md:pb-10 space-y-3 md:space-y-4 overflow-y-auto flex-1">
            <div class="flex items-center mb-4 sm:mb-6">
              <button 
                @click="currentView = 'carousel'" 
                class="p-1 sm:p-2 mr-2 sm:mr-4 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeftIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Telehealth Sessions
              </h1>
            </div>
            
            <!-- Updated Filter Section - Better mobile spacing -->
            <div class="flex justify-between items-center mb-4 sm:mb-6">
              <div class="relative">
                <div class="flex items-center gap-1 sm:gap-2">
                  <button 
                    @click="toggleStatusFilter"
                    class="p-1.5 sm:p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <FilterIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  </button>
                  <span class="text-sm sm:text-base text-gray-700">{{ statusFilterLabel }}</span>
                </div>
                
                <!-- Status Filter Dropdown - Positioned better for mobile -->
                <div v-if="showStatusFilter" class="absolute top-full mt-1 sm:mt-2 left-0 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <div class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-100">Filter by:</div>
                  <button 
                    @click="setStatusFilter('all')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': currentStatusFilter === 'all' }"
                  >
                    All Appointments
                  </button>
                  <button 
                    @click="setStatusFilter('approved')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': currentStatusFilter === 'approved' }"
                  >
                    Approved
                  </button>
                  <button 
                    @click="setStatusFilter('pending')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': currentStatusFilter === 'pending' }"
                  >
                    Pending
                  </button>
                  <button 
                    @click="setStatusFilter('ended')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': currentStatusFilter === 'ended' }"
                  >
                    Ended
                  </button>
                  <button 
                    @click="setStatusFilter('completed')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': currentStatusFilter === 'completed' }"
                  >
                    Completed
                  </button>
                  <button 
                    @click="setStatusFilter('cancelled')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': currentStatusFilter === 'cancelled' }"
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="filteredSessions.length === 0" class="bg-gray-50 rounded-xl p-8 sm:p-12 text-center">
              <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CalendarIcon class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No telehealth appointments found.</p>
              <button 
                @click="refreshSessions" 
                class="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
              >
                <RefreshCwIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Refresh Appointments
              </button>
            </div>
            
            <!-- UPDATED: Optimized grid for mobile with consistent card sizes -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div 
                v-for="appointment in filteredSessions" 
                :key="appointment.id" 
                class="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
              >
                <div class="p-4 sm:p-5 flex flex-col flex-grow">
                  <div class="flex justify-between items-start mb-3 sm:mb-4">
                    <div class="flex-1 min-w-0">
                      <h2 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 break-words">
                        {{ cleanTitle(appointment.title) || (appointment.serviceNames && cleanTitle(appointment.serviceNames[0])) || 'Telehealth Session' }}
                      </h2>
                      <div class="flex items-center text-xs sm:text-sm text-gray-500">
                        <ClockIcon class="w-4 h-4 flex-shrink-0 mr-1" />
                        <span>{{ appointment.time || formatTime(appointment.scheduledTime || appointment.date) }}</span>
                      </div>
                    </div>
                    <span 
                      :class="[
                        'ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap',
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'ended' ? 'bg-slate-200 text-slate-700' :
                        appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ appointment.status }}
                    </span>
                  </div>
                  
                  <div class="space-y-3 mb-4 flex-grow">
                    <div class="flex items-start">
                      <CalendarIcon class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Date</div>
                        <div class="text-xs sm:text-sm font-medium">{{ formatDateOnly(appointment.scheduledTime || appointment.date) }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start">
                      <UserIcon class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Doctor</div>
                        <div class="text-xs sm:text-sm font-medium break-words">{{ appointment.doctorName || 'Not assigned' }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start">
                      <PawPrintIcon class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Pet</div>
                        <div class="text-xs sm:text-sm font-medium break-words">{{ appointment.petName || 'Not specified' }}</div>
                      </div>
                    </div>
                    
                    <div v-if="appointment.serviceNames && appointment.serviceNames.length > 0" class="flex items-start">
                      <StethoscopeIcon class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div class="min-w-0">
                        <div class="text-xs sm:text-sm text-gray-500">Services</div>
                        <div class="text-xs sm:text-sm font-medium break-words">{{ appointment.serviceNames.join(', ') }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-auto">
                    <button 
                      v-if="appointment.status === 'approved' && isAppointmentTime(appointment)" 
                      class="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm rounded-full hover:bg-blue-700"
                      @click="joinSession(appointment)"
                    >
                      <PhoneIcon class="w-4 h-4 mr-2 flex-shrink-0" />
                      Join Call
                    </button>
                    <button 
                      v-else-if="appointment.status === 'approved' && isAppointmentPast(appointment)"
                      class="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-gray-300 text-gray-700 text-xs sm:text-sm rounded-full cursor-not-allowed" 
                      disabled
                    >
                      <ClockIcon class="w-4 h-4 mr-2 flex-shrink-0" />
                      Appointment Ended
                    </button>
                    <button 
                      v-else-if="appointment.status === 'approved' && !isAppointmentTime(appointment)"
                      class="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-gray-300 text-gray-700 text-xs sm:text-sm rounded-full cursor-not-allowed" 
                      disabled
                    >
                      <ClockIcon class="w-4 h-4 mr-2 flex-shrink-0" />
                      {{ getTimeUntilAppointment(appointment) }}
                    </button>
                    <button 
                      v-else
                      class="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-gray-300 text-gray-700 text-xs sm:text-sm rounded-full cursor-not-allowed" 
                      disabled
                    >
                      <ClockIcon class="w-4 h-4 mr-2 flex-shrink-0" />
                      Not Available
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Added bottom spacing to match Carousel view -->
            <div class="h-4 sm:h-6 md:h-8"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Details View -->
    <div v-else-if="currentView === 'details' && !activeSession" class="h-full flex flex-col bg-gray-50 overflow-auto">
      <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 flex-1 min-h-0 px-2 md:px-4 pb-4">
        <div class="w-full bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div class="p-4 md:p-6 pb-8 md:pb-10 space-y-3 md:space-y-4 overflow-y-auto flex-1">
            <div class="flex items-center mb-4 sm:mb-6">
              <button 
                @click="currentView = 'sessions'" 
                class="p-1 sm:p-2 mr-2 sm:mr-4 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeftIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Session Details
              </h1>
            </div>
            
            <div v-if="selectedSession" class="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden p-4 sm:p-6">
              <div class="flex justify-between items-start mb-4 sm:mb-6">
                <div>
                  <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                    {{ cleanTitle(selectedSession.title) || (selectedSession.serviceNames && cleanTitle(selectedSession.serviceNames[0])) || 'Telehealth Session' }}
                  </h2>
                  <div class="flex items-center text-sm sm:text-base text-gray-500">
                    <ClockIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span>{{ selectedSession.time || formatTime(selectedSession.scheduledTime || selectedSession.date) }}</span>
                  </div>
                </div>
                <span 
                  :class="[
                    'px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium rounded-full',
                    selectedSession.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    selectedSession.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedSession.status === 'ended' ? 'bg-slate-200 text-slate-700' :
                    selectedSession.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ selectedSession.status }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div class="space-y-3 sm:space-y-4">
                  <div class="flex items-start">
                    <CalendarIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3 sm:mr-4 mt-0.5" />
                    <div>
                      <div class="text-sm sm:text-base text-gray-500">Date</div>
                      <div class="text-sm sm:text-base font-medium">{{ formatDateOnly(selectedSession.scheduledTime || selectedSession.date) }}</div>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <UserIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3 sm:mr-4 mt-0.5" />
                    <div>
                      <div class="text-sm sm:text-base text-gray-500">Doctor</div>
                      <div class="text-sm sm:text-base font-medium">{{ selectedSession.doctorName || 'Not assigned' }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-3 sm:space-y-4">
                  <div class="flex items-start">
                    <PawPrintIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3 sm:mr-4 mt-0.5" />
                    <div>
                      <div class="text-sm sm:text-base text-gray-500">Pet</div>
                      <div class="text-sm sm:text-base font-medium">{{ selectedSession.petName || 'Not specified' }}</div>
                    </div>
                  </div>
                  
                  <div v-if="selectedSession.serviceNames && selectedSession.serviceNames.length > 0" class="flex items-start">
                    <StethoscopeIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3 sm:mr-4 mt-0.5" />
                    <div>
                      <div class="text-sm sm:text-base text-gray-500">Services</div>
                      <div class="text-sm sm:text-base font-medium">{{ selectedSession.serviceNames.join(', ') }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedSession.notes" class="mb-6 sm:mb-8">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Notes</h3>
                <div class="bg-white p-3 sm:p-4 rounded-lg text-sm sm:text-base text-gray-700">
                  {{ selectedSession.notes }}
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  v-if="selectedSession.status === 'approved' && isAppointmentTime(selectedSession)" 
                  class="flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-full hover:bg-blue-700"
                  @click="joinSession(selectedSession)"
                >
                  <PhoneIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Join Call
                </button>
                <button
                  v-else-if="selectedSession.status === 'approved' && isAppointmentPast(selectedSession)"
                  class="flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 text-sm sm:text-base rounded-full cursor-not-allowed" 
                  disabled
                >
                  <ClockIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Appointment Ended
                </button>
                <button
                  v-else-if="selectedSession.status === 'approved' && !isAppointmentTime(selectedSession)"
                  class="flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 text-sm sm:text-base rounded-full cursor-not-allowed" 
                  disabled
                >
                  <ClockIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  {{ getTimeUntilAppointment(selectedSession) }}
                </button>
                <button 
                  v-else
                  class="flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 text-sm sm:text-base rounded-full cursor-not-allowed" 
                  disabled
                >
                  <ClockIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Not Available
                </button>
                
                <button 
                  class="flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 text-sm sm:text-base rounded-full hover:bg-gray-300"
                  @click="currentView = 'sessions'"
                >
                  <ArrowLeftIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Back to Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Session View - Better mobile responsiveness -->
    <div v-if="activeSession" class="h-full flex flex-col bg-gray-100 overflow-hidden">
      <!-- Header with connection status indicator -->
      <div class="bg-white border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3">
        <div class="flex items-center justify-between">
          <!-- Left side: Title and patient info -->
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {{ cleanTitle(activeSession.title) || 'Telehealth Appointment' }}
            </h2>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
              <span class="flex items-center"><UserIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {{ activeSession.doctorName || 'Veterinarian' }}</span>
              <span class="flex items-center"><PawPrintIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> {{ activeSession.petName || 'Your Pet' }}</span>
              <span class="flex items-center"><ClockIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Time remaining: {{ remainingTime }}</span>
            </div>
          </div>
          
          <!-- Right side: Controls -->
          <div class="flex flex-col sm:flex-row sm:items-center">
            <button 
              @click="endCall" 
              class="inline-flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded-full hover:bg-red-700 whitespace-nowrap mb-1.5 sm:mb-0 sm:order-2 sm:ml-3"
            >
              <PhoneOffIcon class="w-3 h-3 mr-1" />
              End Call
            </button>
            
            <!-- UPDATED: Always show connection status indicator -->
            <div class="flex items-center justify-end sm:order-1">
              <span 
                :class="[
                  'w-2 h-2 rounded-full mr-1 sm:mr-2',
                  remoteStreamActive ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                ]"
              ></span>
              <span class="text-xs sm:text-sm text-gray-600">{{ remoteStreamActive ? 'Connected' : 'Connecting...' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- UPDATED: Responsive layout with equal height for video and chat on mobile -->
      <div class="flex-1 overflow-y-auto">
        <div class="flex flex-col md:flex-row gap-3 p-3 sm:gap-4 sm:p-4">
          <!-- Video Container - Takes full width on mobile, 2/3 on desktop -->
          <div class="flex-1 flex flex-col gap-3 sm:gap-4">
            <!-- Video Container - Tall height on small screens -->
            <div class="relative bg-gray-900 rounded-xl overflow-hidden md:aspect-video h-[450px] sm:h-[500px] md:h-auto">
              <!-- Remote Video -->
              <video id="remote-video" ref="remoteVideoRef" autoplay playsinline class="w-full h-full object-cover"></video>
              
              <!-- Waiting Placeholder -->
              <div v-if="!remoteStreamActive" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white">
                <div class="relative mb-4 sm:mb-6">
                  <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center">
                    <UserIcon class="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div class="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <p class="text-base sm:text-xl font-medium mb-1 sm:mb-2">Waiting for veterinarian to join...</p>
                <p class="text-xs sm:text-sm text-gray-400">Your veterinarian will appear here when they join</p>
              </div>
              
              <!-- Local Video (PiP) - Increased height on small screens -->
              <div 
                class="absolute top-2 right-2 sm:top-4 sm:right-4 w-1/2 md:w-1/3 h-[120px] sm:h-[150px] md:aspect-video md:h-auto bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              >
                <video id="local-video" ref="localVideoRef" autoplay playsinline muted class="w-full h-full object-cover transform scale-x-[-1]"></video>
              </div>
              
              <!-- Call Controls - Made more compact on mobile -->
              <div class="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-gray-900/80 px-3 py-1.5 sm:py-2 rounded-full">
                <button 
                  @click="toggleMute" 
                  :class="[
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                    isMuted ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                  ]"
                >
                  <MicOffIcon v-if="isMuted" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <MicIcon v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleVideo" 
                  :class="[
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                    isVideoOff ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                  ]"
                >
                  <VideoOffIcon v-if="isVideoOff" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <VideoIcon v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleChatPanel" 
                  :class="[
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                    showChatPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                  ]"
                >
                  <MessageSquareIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleScreenShare"
                  :class="[
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                    isScreenSharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                  ]"
                >
                  <MonitorIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleSpeaker" 
                  :class="[
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                    isSpeakerMuted ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                  ]"
                >
                  <VolumeXIcon v-if="isSpeakerMuted" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <Volume2Icon v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <!-- Time Remaining Indicator (Mobile) -->
              <div class="sm:hidden absolute top-4 left-4 bg-gray-900/80 px-2 py-1 rounded-full text-white text-xs">
                <span class="flex items-center">
                  <ClockIcon class="w-3 h-3 mr-1" />
                  {{ remainingTime }}
                </span>
              </div>
            </div>
            
            <!-- Mobile Chat Panel - Same height as video on mobile -->
            <div v-if="showChatPanel && isMobileView" class="bg-white rounded-xl shadow-sm flex flex-col h-[450px] sm:h-[500px]">
              <div class="p-2 border-b border-gray-100">
                <h3 class="text-base font-medium text-gray-900">Chat</h3>
              </div>
              
              <div class="flex-1 overflow-y-auto p-2 space-y-2" ref="mobileChatMessagesRef">
                <div 
                  v-for="message in chatMessages" 
                  :key="message.id"
                  :class="[
                    'max-w-[80%]',
                    message.sender === 'vet' ? 'mr-auto' : 'ml-auto'
                  ]"
                >
                  <div 
                    :class="[
                      'px-2 py-1 rounded-xl text-xs sm:text-sm',
                      message.sender === 'vet' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                    ]"
                  >
                    {{ message.text }}
                  </div>
                  <div 
                    :class="[
                      'text-[9px] mt-0.5 flex items-center',
                      message.sender === 'vet' ? 'text-left text-gray-500' : 'text-right text-gray-500'
                    ]"
                  >
                    <span>{{ message.sender === 'vet' ? message.senderName || 'Doctor' : 'You' }}</span>
                    <span class="mx-1">•</span>
                    <span>{{ formatTime(message.timestamp) }}</span>
                    <CheckIcon v-if="message.sender === 'vet' && message.read" class="w-2 h-2 ml-1 text-blue-500" />
                  </div>
                </div>
              </div>
              
              <div class="p-2 border-t border-gray-100">
                <div class="flex gap-2">
                  <input 
                    v-model="newMessage" 
                    @keyup.enter="sendMessage"
                    placeholder="Type a message..."
                    class="flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    @click="sendMessage" 
                    class="min-w-[32px] h-[32px] bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
                  >
                    <SendIcon class="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Desktop Chat Section - UPDATED: Fixed responsive issues -->
          <div v-if="showChatPanel && !isMobileView" class="bg-white rounded-xl shadow-sm flex flex-col md:w-1/3 max-w-sm">
            <div class="p-4 border-b border-gray-100">
              <h3 class="text-lg font-medium text-gray-900">Chat</h3>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatMessagesRef">
              <div 
                v-for="message in chatMessages" 
                :key="message.id"
                :class="[
                  'max-w-[85%]',
                  message.sender === 'vet' ? 'mr-auto' : 'ml-auto'
                ]"
              >
                <div 
                  :class="[
                    'px-4 py-2 rounded-full',
                    message.sender === 'vet' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                  ]"
                >
                  {{ message.text }}
                </div>
                <div 
                  :class="[
                    'text-xs mt-1 flex items-center',
                    message.sender === 'vet' ? 'text-left text-gray-500' : 'text-right text-gray-500'
                  ]"
                >
                  <span>{{ message.sender === 'vet' ? message.senderName || 'Doctor' : 'You' }}</span>
                  <span class="mx-1">•</span>
                  <span>{{ formatTime(message.timestamp) }}</span>
                  <CheckIcon v-if="message.sender === 'vet' && message.read" class="w-3 h-3 ml-1 text-blue-500" />
                </div>
              </div>
            </div>
            
            <!-- UPDATED: Fixed chat input container for desktop -->
            <div class="p-3 border-t border-gray-100">
              <div class="flex items-center gap-2 w-full">
                <input 
                  v-model="newMessage" 
                  @keyup.enter="sendMessage"
                  placeholder="Type a message..."
                  class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  @click="sendMessage" 
                  class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
                >
                  <SendIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Add bottom padding to ensure content isn't hidden behind navigation -->
        <div class="h-16 sm:h-20"></div>
      </div>
    </div>

    <!-- Network Status Banner -->
    <div v-if="!isOnline" class="fixed bottom-0 left-0 right-0 bg-red-100 text-red-800 px-4 py-3 flex items-center justify-center rounded-t-lg">
      <AlertTriangleIcon class="w-5 h-5 mr-2" />
      <span>You are currently offline. Some features may not work properly.</span>
      <button @click="attemptReconnect" class="ml-4 text-red-800 underline">Try to reconnect</button>
    </div>

    <!-- Incoming Call Modal -->
    <div v-if="incomingCall && !isAcceptingCall" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl max-w-md w-full overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <PhoneIcon class="w-10 h-10 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ incomingCall.callerName || 'Someone' }} is calling</h3>
          <p class="text-gray-600 mb-8">{{ incomingCall.sessionTitle || 'Telehealth Session' }}</p>
          
          <div class="flex gap-4">
            <button 
              @click="acceptIncomingCall" 
              class="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              <PhoneIcon class="w-5 h-5 mr-2" />
              Accept
            </button>
            <button 
              @click="declineIncomingCall" 
              class="flex-1 inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              <PhoneOffIcon class="w-5 h-5 mr-2" />
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Call Time Expired Modal -->
    <div v-if="showCallExpiredModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full overflow-hidden">
        <div class="p-6 text-center">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon class="w-10 h-10 text-red-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Appointment Time Ended</h3>
          <p class="text-gray-600 mb-8">The scheduled time for this appointment has ended.</p>
          
          <button 
            @click="acknowledgeCallExpired" 
            class="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <CheckIcon class="w-5 h-5 mr-2" />
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import lottie from "lottie-web";
import {
  RefreshCwIcon,
  PhoneIcon,
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  SendIcon,
  UserIcon,
  MonitorIcon,
  AlertTriangleIcon,
  CheckIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarPlusIcon,
  ClockIcon,
  XIcon,
  PawPrintIcon,
  StethoscopeIcon,
  FilterIcon,
  MessageSquareIcon,
  FolderIcon,
  Volume2Icon,
  VolumeXIcon
} from "lucide-vue-next";
import LoadingSpinner from "@/components/common/LoadingSpinner.vue";
import { useAppointmentStore } from "@/stores/modules/appointmentStore";
import { useAuthStore } from "@/stores/modules/authStore";
import { useServiceCategoryStore } from "@/stores/modules/ServiceCategoryStore";
import { db } from '@shared/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, arrayUnion, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import WebRTCService from "@/services/webrtc-service";
import { parseISO, format, isToday, isFuture, addMinutes, subMinutes, isAfter, isBefore, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Router and stores
const router = useRouter();
const appointmentStore = useAppointmentStore();
const authStore = useAuthStore();
const serviceCategoryStore = useServiceCategoryStore();

// View state
const currentView = ref("carousel");
const loading = ref(false);
const sessions = ref([]);
const currentStatusFilter = ref("all");
const activeSession = ref(null);
const selectedSession = ref(null);
const showStatusFilter = ref(false);
const showChatPanel = ref(false);
const isMobileView = ref(false);
const isAcceptingCall = ref(false);
const isInitiatingCall = ref(false);
const isCallInitializing = ref(false);
const unsubscribeCallStatus = ref(null);
const isOnline = ref(navigator.onLine);
const errorMessage = ref("");
const showingApprovedOnly = ref(false);

// Carousel state
const currentSlide = ref(0);
const slides = ref([
  {
    id: 1,
    title: "Video calls and meetings for everyone",
    subtitle: "Connect, collaborate, and celebrate from anywhere",
    lottieUrl: "https://lottie.host/eef5246b-5eb6-4e59-aa95-4f876e907fbe/w8vlGAQY2p.json",
  },
  {
    id: 2,
    title: "Connect with healthcare professionals",
    subtitle: "Get expert medical advice from the comfort of your home",
    lottieUrl: "https://lottie.host/8e319c9a-aa16-4c67-9762-5e8a6f1fb661/c6cXxUKVrd.json",
  },
  {
    id: 3,
    title: "Therapy sessions",
    subtitle: "Join supportive communities and share experiences",
    lottieUrl: "https://lottie.host/1e246ac2-6990-4be8-aae7-ce4c1ca7a244/OQ88rj0UOx.json",
  },
  {
    id: 4,
    title: "Follow up consultation",
    subtitle: "Access counseling whenever you need it",
    lottieUrl: "https://lottie.host/61024576-6d81-4689-a26b-377afb392172/gNHIvH2Tin.json",
  }
]);

// WebRTC state
const localVideoRef = ref(null);
const remoteVideoRef = ref(null);
const localStream = ref(null);
const remoteStream = ref(null);
const isMuted = ref(false);
const isVideoOff = ref(false);
const isScreenSharing = ref(false);
const isSpeakerMuted = ref(false);
const remoteStreamActive = ref(false);
const callStatus = ref("");
const chatMessages = ref([]);
const newMessage = ref("");
const chatMessagesRef = ref(null);
const mobileChatMessagesRef = ref(null);
const incomingCall = ref(null);
let incomingCallsUnsubscribe = null;
let networkStatusInterval = null;
let autoplayInterval;
let lottieInstances = [];
let chatMessagesUnsubscribe = null;
const appointmentEndTime = ref(null);
const remainingTime = ref('');
let appointmentTimer = null;
const showCallExpiredModal = ref(false);

// Function to clean title by removing empty parentheses
const cleanTitle = (text) => {
  if (!text) return text;
  // Remove empty parentheses and trim
  return text.replace(/()\s*()/g, '').trim();
};

// Function to remove minutes from title
const removeMinutes = (text) => {
  if (!text) return text;
  return text.replace(/\s*\d+\s*minutes/, '');
};

// Check for mobile view
const checkMobileView = () => {
  isMobileView.value = window.innerWidth < 768;
};

// Toggle chat panel visibility
const toggleChatPanel = () => {
  showChatPanel.value = !showChatPanel.value;

  // Scroll to bottom of chat when opening
  if (showChatPanel.value) {
    nextTick(() => {
      if (isMobileView.value) {
        if (mobileChatMessagesRef.value) {
          mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight;
        }
      } else {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
        }
      }
    });
  }
};

// Navigation method for appointments
const navigateToAppointments = () => {
  router.push({ name: 'UserAppointments' });
};

// Computed properties
const filteredSessions = computed(() => {
  // First filter by status
  let filtered = sessions.value;
  if (currentStatusFilter.value !== "all") {
    filtered = filtered.filter((session) => session.status === currentStatusFilter.value);
  }

  // Then filter by category - only show Telehealth Services
  return filtered.filter(appointment => {
    // Check if the appointment has a direct category property
    if (appointment.category && appointment.category.toLowerCase().includes('telehealth')) {
      return true;
    }

    // If not, check if any of the services belong to the Telehealth category
    if (appointment.services && appointment.services.length > 0) {
      // Check if any service name contains "telehealth" or "follow-up"
      if (appointment.serviceNames && appointment.serviceNames.some(name => 
        name.toLowerCase().includes('telehealth') || 
        name.toLowerCase().includes('follow-up'))) {
        return true;
      }
      
      // Try to find the service in the service store
      return appointment.services.some(serviceId => {
        const service = serviceCategoryStore.services.find(s => s.id === serviceId);
        if (!service) return false;
        
        // Check if the service belongs to a telehealth category
        const category = serviceCategoryStore.categories.find(c => c.id === service.categoryId);
        return category && category.name.toLowerCase().includes('telehealth');
      });
    }

    return false;
  });
});

const callStatusText = computed(() => {
  switch (callStatus.value) {
    case "connected":
      return "Connected";
    case "reconnecting":
      return "Reconnecting...";
    case "failed":
      return "Connection failed";
    case "ended":
      return "Call ended";
    default:
      return "Connecting...";
  }
});

// Status filter label for display
const statusFilterLabel = computed(() => {
  switch (currentStatusFilter.value) {
    case "all":
      return "All Appointments";
    case "approved":
      return "Approved";
    case "pending":
      return "Pending";
    case "ended":
      return "Ended";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "All Appointments";
  }
});

// Format functions for displaying appointment data correctly
const formatDateOnly = (timestamp) => {
  if (!timestamp) return "N/A";

  // Ensure timestamp is a valid Date object
  let date;
  try {
    date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }

  // Format date only (without time)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Format time function
const formatTime = (timestamp) => {
  if (!timestamp) return "";

  try {
    // Ensure we have a valid Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Format the time
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

// Carousel methods
const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

// Initialize Lottie animations
const initializeLottieAnimations = () => {
  // Destroy previous instances if they exist
  lottieInstances.forEach((instance) => {
    if (instance) {
      instance.destroy();
    }
  });

  lottieInstances = [];

  // Initialize new instances
  slides.value.forEach((slide, index) => {
    const container = document.getElementById(`lottie-container-${index}`);
    if (container) {
      const animation = lottie.loadAnimation({
        container: container,
        renderer: "svg",
        loop: true,
        autoplay: index === currentSlide.value,
        path: slide.lottieUrl,
      });

      lottieInstances.push(animation);
    }
  });
};

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoplay = () => {
  clearInterval(autoplayInterval);
};

// Network status monitoring
const setupNetworkMonitoring = () => {
  // Listen for online/offline events
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Also check periodically
  networkStatusInterval = setInterval(() => {
    const currentStatus = navigator.onLine;
    if (isOnline.value !== currentStatus) {
      isOnline.value = currentStatus;
      if (currentStatus) {
        handleOnline();
      } else {
        handleOffline();
      }
    }
  }, 5000);
};

const handleOnline = () => {
  console.log("Network connection restored");
  isOnline.value = true;

  // If we have an active session, ensure we're in call view
  if (activeSession.value) {
    currentView.value = 'call';
  }
};

const handleOffline = () => {
  console.log("Network connection lost");
  isOnline.value = false;

  if (callStatus.value === "connected") {
    callStatus.value = "reconnecting";
  }
};

const attemptReconnect = () => {
  isOnline.value = true;
  // If we have an active session, ensure we're in call view
  if (activeSession.value) {
    currentView.value = 'call';
  } else {
    refreshSessions();
  }
};

// Toggle status filter dropdown
const toggleStatusFilter = () => {
  showStatusFilter.value = !showStatusFilter.value;
};

// Set status filter
const setStatusFilter = (status) => {
  currentStatusFilter.value = status;
  showStatusFilter.value = false;

  // Reset approved only flag if selecting a different filter
  if (status !== 'approved') {
    showingApprovedOnly.value = false;
  } else {
    showingApprovedOnly.value = true;
  }
};

// Update the refreshSessions method to fetch real data
const refreshSessions = async () => {
  loading.value = true;
  showingApprovedOnly.value = false;

  try {
    // Initialize auth if needed
    if (!authStore.isInitialized) {
      await authStore.initialize();
    }

    if (!authStore.user || !authStore.user.userId) {
      console.log("No user logged in, cannot fetch appointments");
      sessions.value = [];
      return;
    }

    // Fetch categories first
    await serviceCategoryStore.fetchCategories();

    // Fetch services to get category information
    await serviceCategoryStore.fetchServices();

    // Fetch appointments for the current user
    const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId);
    sessions.value = userAppointments || [];

    console.log(`Fetched ${sessions.value.length} appointments for user`);

    // Check if we have an active call session
    checkForActiveCallSession();
  } catch (error) {
    console.error("Error fetching appointments:", error);
    errorMessage.value = "Failed to load appointments. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Check if there's an active call session
const checkForActiveCallSession = async () => {
  if (!authStore.user || !authStore.user.userId) return;

  try {
    // Query for active calls where the user is involved
    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      where('status', 'in', ['initiating', 'accepted', 'connected']),
      where('callerId', '==', authStore.user.userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // We found an active call
      const callData = querySnapshot.docs[0].data();
      const callId = querySnapshot.docs[0].id;
      
      // Find the corresponding session
      const session = sessions.value.find(s => s.id === callId);
      
      if (session) {
        console.log('Found active call session, resuming call view');
        // Set the active session and view
        activeSession.value = session;
        currentView.value = 'call';
        
        // Try to reconnect to the call
        await reconnectToCall(callId);
      }
    }
  } catch (error) {
    console.error('Error checking for active call sessions:', error);
  }
};

// Function to reconnect to an existing call
const reconnectToCall = async (callId) => {
  try {
    console.log(`Reconnecting to call: ${callId}`);
    
    // Get local media stream
    localStream.value = await WebRTCService.setupLocalStream();
    
    // Attach local stream to video element
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = localStream.value;
    }
    
    // Try to reconnect to the call
    const result = await WebRTCService.reconnectCall(
      callId,
      (stream) => {
        // When we receive the remote stream
        if (remoteVideoRef.value) {
          remoteVideoRef.value.srcObject = stream;
          remoteStreamActive.value = true;
        }
      }
    );
    
    // Handle the result
    if (result && result.remoteStream) {
      remoteStream.value = result.remoteStream;
      
      // Set the remote stream to the video element
      if (remoteVideoRef.value) {
        remoteVideoRef.value.srcObject = result.remoteStream;
        
        // Check if there are already tracks in the remote stream
        if (result.remoteStream.getTracks().length > 0) {
          remoteStreamActive.value = true;
        }
      }
    }
    
    // Update the UI for active call
    callStatus.value = 'connecting';
    
  } catch (error) {
    console.error('Error reconnecting to call:', error);
    errorMessage.value = "Could not reconnect to the call. Please try again.";
  }
};

// Load only approved sessions
const loadApprovedSessions = async () => {
  loading.value = true;
  showingApprovedOnly.value = true;

  try {
    // Initialize auth if needed
    if (!authStore.isInitialized) {
      await authStore.initialize();
    }

    if (!authStore.user || !authStore.user.userId) {
      console.log("No user logged in, cannot fetch appointments");
      sessions.value = [];
      return;
    }

    // Fetch categories first
    await serviceCategoryStore.fetchCategories();

    // Fetch services to get category information
    await serviceCategoryStore.fetchServices();

    // Fetch appointments for the current user
    const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId);

    // Filter to only show approved appointments
    sessions.value = userAppointments || [];

    console.log(`Fetched ${sessions.value.length} appointments for user`);

    // Set filter to show all appointments initially
    currentStatusFilter.value = "all";

    // Check if we have an active call session
    checkForActiveCallSession();
  } catch (error) {
    console.error("Error fetching approved appointments:", error);
    errorMessage.value = "Failed to load approved appointments. Please try again.";
  } finally {
    loading.value = false;
  }
};

// View session details instead of starting a call
const viewSessionDetails = (session) => {
  selectedSession.value = session;
  currentView.value = 'details';
};

// Function to check if it's time for the appointment
const isAppointmentTime = (appointment) => {
  if (!appointment.date || !appointment.time) return false;

  try {
    // Handle date properly whether it's a string or Date object
    const appointmentDate = appointment.date instanceof Date 
      ? appointment.date 
      : parseISO(appointment.date);
    
    // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
    if (appointment.time) {
      const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
      if (timeMatch && timeMatch.length >= 3) {
        // Get the start time part
        const startTimeStr = timeMatch[1].trim();
        // Get the end time part
        const endTimeStr = timeMatch[2].trim();
        
        // Create date objects for the appointment start and end times
        const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
        const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
        
        if (startTimeParts && endTimeParts) {
          // Parse start time
          let startHours = parseInt(startTimeParts[1]);
          const startMinutes = parseInt(startTimeParts[2]);
          const startPeriod = startTimeParts[3].toUpperCase();
          
          // Convert to 24-hour format
          if (startPeriod === 'PM' && startHours < 12) startHours += 12;
          if (startPeriod === 'AM' && startHours === 12) startHours = 0;
          
          // Parse end time
          let endHours = parseInt(endTimeParts[1]);
          const endMinutes = parseInt(endTimeParts[2]);
          const endPeriod = endTimeParts[3].toUpperCase();
          
          // Convert to 24-hour format
          if (endPeriod === 'PM' && endHours < 12) endHours += 12;
          if (endPeriod === 'AM' && endHours === 12) endHours = 0;
          
          // Create appointment start and end datetime objects
          const startTime = new Date(appointmentDate);
          startTime.setHours(startHours, startMinutes, 0, 0);
          
          const endTime = new Date(appointmentDate);
          endTime.setHours(endHours, endMinutes, 0, 0);
          
          // If end time is earlier than start time, it means the appointment ends the next day
          if (endTime < startTime) {
            endTime.setDate(endTime.getDate() + 1);
          }
          
          // Get current time
          const now = new Date();
          
          // Check if current time is within the appointment time range
          return now >= startTime && now <= endTime;
        }
      }
    }
    
    // If we couldn't parse the time string, return false
    return false;
  } catch (error) {
    console.error('Error checking appointment time:', error);
    return false;
  }
};

// Function to check if an appointment is in the past
const isAppointmentPast = (appointment) => {
  if (!appointment.date || !appointment.time) return false;

  try {
    // Handle date properly whether it's a string or Date object
    const appointmentDate = appointment.date instanceof Date 
      ? appointment.date 
      : parseISO(appointment.date);
    
    // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
    if (appointment.time) {
      const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
      if (timeMatch && timeMatch.length >= 3) {
        // Get the end time part
        const endTimeStr = timeMatch[2].trim();
        
        // Create date objects for the appointment end time
        const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
        
        if (endTimeParts) {
          // Parse end time
          let endHours = parseInt(endTimeParts[1]);
          const endMinutes = parseInt(endTimeParts[2]);
          const endPeriod = endTimeParts[3].toUpperCase();
          
          // Convert to 24-hour format
          if (endPeriod === 'PM' && endHours < 12) endHours += 12;
          if (endPeriod === 'AM' && endHours === 12) endHours = 0;
          
          // Create appointment end datetime object
          const endTime = new Date(appointmentDate);
          endTime.setHours(endHours, endMinutes, 0, 0);
          
          // Get current time
          const now = new Date();
          
          // Check if current time is after the appointment end time
          return now > endTime;
        }
      }
    }
    
    // If we couldn't parse the time string, return false
    return false;
  } catch (error) {
    console.error('Error checking if appointment is past:', error);
    return false;
  }
};

// Function to get time until appointment
const getTimeUntilAppointment = (appointment) => {
  if (!appointment.date || !appointment.time) return 'N/A';

  try {
    // Handle date properly whether it's a string or Date object
    const appointmentDate = appointment.date instanceof Date 
      ? appointment.date 
      : parseISO(appointment.date);
    
    // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
    if (appointment.time) {
      const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
      if (timeMatch && timeMatch.length >= 3) {
        // Get the start time part
        const startTimeStr = timeMatch[1].trim();
        
        // Create date objects for the appointment start time
        const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
        
        if (startTimeParts) {
          // Parse start time
          let startHours = parseInt(startTimeParts[1]);
          const startMinutes = parseInt(startTimeParts[2]);
          const startPeriod = startTimeParts[3].toUpperCase();
          
          // Convert to 24-hour format
          if (startPeriod === 'PM' && startHours < 12) startHours += 12;
          if (startPeriod === 'AM' && startHours === 12) startHours = 0;
          
          // Create appointment start datetime object
          const startTime = new Date(appointmentDate);
          startTime.setHours(startHours, startMinutes, 0, 0);
          
          // Get current time
          const now = new Date();
          
          // Calculate the difference in minutes
          const diffInMinutes = differenceInMinutes(startTime, now);
          
          if (diffInMinutes <= 0) {
            return 'Starting now';
          } else if (diffInMinutes < 60) {
            return `Starts in ${diffInMinutes} minutes`;
          } else {
            const hours = Math.floor(diffInMinutes / 60);
            const minutes = diffInMinutes % 60;
            return `Starts in ${hours}h ${minutes}m`;
          }
        }
      }
    }
    
    // If we couldn't parse the time string, return a generic message
    return 'Check appointment time';
  } catch (error) {
    console.error('Error getting time until appointment:', error);
    return 'N/A';
  }
};

// Add this function to properly handle the remote stream when joining a session
const joinSession = async (session) => {
  try {
    // Check if it's time for the appointment
    if (!isAppointmentTime(session)) {
      alert('This appointment is not currently available for video call. You can join during the scheduled appointment time.');
      return;
    }
    
    if (!isOnline.value) {
      errorMessage.value = "You appear to be offline. Please check your internet connection and try again.";
      return;
    }

    // Set flag to indicate call is being initiated
    isInitiatingCall.value = true;
    isCallInitializing.value = true;
    
    console.log(`Joining session: ${session.id}`);
    activeSession.value = session;
    
    // Check if call document exists first
    const callDoc = doc(db, 'calls', session.id);
    const callSnapshot = await getDoc(callDoc);
    
    if (!callSnapshot.exists()) {
      // Create the call document if it doesn't exist
      console.log('Call document does not exist, creating it now');
      await setDoc(callDoc, {
        status: 'initiating',
        initiatedAt: new Date(),
        initiatedBy: 'user', // The patient/pet-owner is initiating
        receiverId: session.doctorId,
        callerId: authStore.user.userId,
        callerName: authStore.user.displayName || 'Patient',
        hasRemoteTracks: false,
        iceConnectionState: 'new',
        connectionState: 'new'
      });
    } else {
      // Update existing call document
      await updateDoc(callDoc, {
        status: 'initiating',
        initiatedAt: new Date(),
        initiatedBy: 'user', // The patient/pet-owner is initiating
        receiverId: session.doctorId,
        callerId: authStore.user.userId,
        callerName: authStore.user.displayName || 'Patient'
      });
    }
    
    // Initialize WebRTC
    try {
      // Get local media stream
      localStream.value = await WebRTCService.setupLocalStream();
      
      // Attach local stream to video element
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
      
      // Start the call with onTrack callback
      const result = await WebRTCService.startCall(
        session.id,
        authStore.user.userId,
        session.doctorId,
        localStream.value,
        (stream) => {
          // When we receive the remote stream
          if (remoteVideoRef.value) {
            remoteVideoRef.value.srcObject = stream;
            // Note that we've received tracks
            remoteStreamActive.value = true;
            
            // Update Firestore to indicate the call is connected with video
            updateDoc(callDoc, {
              hasRemoteTracks: true,
              status: 'connected'
            });
          }
        }
      );
      
      // Handle the result properly
      if (result && result.remoteStream) {
        remoteStream.value = result.remoteStream;
        
        // Set the remote stream to the video element
        if (remoteVideoRef.value) {
          remoteVideoRef.value.srcObject = result.remoteStream;
          
          // Check if there are already tracks in the remote stream
          if (result.remoteStream.getTracks().length > 0) {
            remoteStreamActive.value = true;
          }
        }
      } else {
        console.log('WebRTCService.startCall did not return expected structure:', result);
      }
      
      // Update the UI for active call
      callStatus.value = 'connecting';
      currentView.value = 'call';
      
      // Set document title to indicate active call
      document.title = "In Call - Telehealth";
      
      // Reset initialization flags once call has started
      isCallInitializing.value = false;
      isInitiatingCall.value = false;
      
      // Start appointment timer
      startAppointmentTimer(session);
      
      // Subscribe to chat messages for this call
      subscribeToChatMessages(session.id);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      errorMessage.value = "Could not access camera or microphone. Please check your device permissions.";
      isCallInitializing.value = false;
      isInitiatingCall.value = false;
    }
  } catch (error) {
    console.error('Error joining session:', error);
    errorMessage.value = "Failed to join the session. Please try again.";
    isCallInitializing.value = false;
    isInitiatingCall.value = false;
  }
};

// Subscribe to chat messages
const subscribeToChatMessages = (callId) => {
  // Clean up any existing subscription
  if (chatMessagesUnsubscribe) {
    chatMessagesUnsubscribe();
    chatMessagesUnsubscribe = null;
  }

  try {
    // Create a reference to the messages collection for this call
    const messagesRef = collection(db, 'calls', callId, 'messages');
    
    // Create a query to get messages ordered by timestamp
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    // Subscribe to the query
    chatMessagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      // Process the snapshot to update the chat messages
      const newMessages = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert server timestamp to Date object
        const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
        
        // Add the message to the array
        newMessages.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: timestamp,
          read: data.read
        });
      });
      
      // Update the chat messages
      chatMessages.value = newMessages;
      
      // Scroll to bottom of chat
      nextTick(() => {
        if (isMobileView.value) {
          if (mobileChatMessagesRef.value) {
            mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight;
          }
        } else {
          if (chatMessagesRef.value) {
            chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
          }
        }
      });
      
      // Mark messages as read
      markMessagesAsRead(newMessages);
    });
  } catch (error) {
    console.error('Error subscribing to chat messages:', error);
  }
};

// Mark messages as read
const markMessagesAsRead = async (messages) => {
  if (!activeSession.value || !authStore.user) return;

  try {
    // Find messages that are from vet (not user) and are unread
    const unreadMessages = messages.filter(msg => 
      msg.sender === 'vet' && 
      msg.senderId !== authStore.user.userId && 
      !msg.read
    );
    
    // Mark each unread message as read
    for (const message of unreadMessages) {
      const messageRef = doc(db, 'calls', activeSession.value.id, 'messages', message.id);
      await updateDoc(messageRef, { read: true });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Similarly update the acceptIncomingCall function
const acceptIncomingCall = async () => {
  if (!incomingCall.value) return;

  try {
    // Check if it's time for the appointment
    if (incomingCall.value.appointment && !isAppointmentTime(incomingCall.value.appointment)) {
      alert('This appointment is not currently available for video call. You can join during the scheduled appointment time.');
      declineIncomingCall();
      return;
    }
    
    // Set accepting call flag to true to hide the modal immediately
    isAcceptingCall.value = true;
    isCallInitializing.value = true;
    
    console.log(`Accepting call: ${incomingCall.value.id}`);
    
    // Find the session for this call
    const session = sessions.value.find(s => s.id === incomingCall.value.id);
    if (session) {
      activeSession.value = session;
    } else {
      // Create a temporary session object if not found
      activeSession.value = {
        id: incomingCall.value.id,
        title: incomingCall.value.sessionTitle,
        doctorId: incomingCall.value.callerId,
        doctorName: incomingCall.value.callerName
      };
    }
    
    // Update call status in Firebase
    const callDoc = doc(db, 'calls', incomingCall.value.id);
    await updateDoc(callDoc, {
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedBy: 'user' // The patient/pet-owner is accepting
    });
    
    // Initialize WebRTC
    try {
      // Get local media stream
      localStream.value = await WebRTCService.setupLocalStream();
      
      // Attach local stream to video element
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
      
      // Answer the call with onTrack callback - using answerCall instead of joinCall
      const result = await WebRTCService.answerCall(
        incomingCall.value.id,
        localStream.value,
        (stream) => {
          // When we receive the remote stream
          if (remoteVideoRef.value) {
            remoteVideoRef.value.srcObject = stream;
            remoteStreamActive.value = true;
          }
        }
      );
      
      // Handle the result properly
      if (result && result.remoteStream) {
        remoteStream.value = result.remoteStream;
        
        // Set the remote stream to the video element
        if (remoteVideoRef.value) {
          remoteVideoRef.value.srcObject = result.remoteStream;
          
          // Check if there are already tracks in the remote stream
          if (result.remoteStream.getTracks().length > 0) {
            remoteStreamActive.value = true;
          }
        }
      } else {
        console.log('WebRTCService.answerCall did not return expected structure:', result);
      }
      
      // Update the UI for active call
      callStatus.value = 'connecting';
      currentView.value = 'call';
      
      // Set document title to indicate active call
      document.title = "In Call - Telehealth";
      
      // Start appointment timer if we have a session
      if (activeSession.value) {
        startAppointmentTimer(activeSession.value);
      }
      
      // Subscribe to chat messages for this call
      subscribeToChatMessages(incomingCall.value.id);
      
      // Clear incoming call state
      incomingCall.value = null;
      isAcceptingCall.value = false;
      isCallInitializing.value = false;
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      errorMessage.value = "Could not access camera or microphone. Please check your device permissions.";
      incomingCall.value = null;
      isAcceptingCall.value = false;
      isCallInitializing.value = false;
    }
  } catch (error) {
    console.error('Error accepting call:', error);
    errorMessage.value = "Failed to accept the call. Please try again.";
    incomingCall.value = null;
    isAcceptingCall.value = false;
    isCallInitializing.value = false;
  }
};

// FIXED: Properly implemented declineIncomingCall function
const declineIncomingCall = async () => {
  try {
    if (!incomingCall.value) return;
    
    // Store the call ID in a local variable before any async operations
    const callId = incomingCall.value.id;
    
    if (!callId) {
      console.error('Invalid call ID');
      incomingCall.value = null;
      return;
    }
    
    console.log(`Declining call: ${callId}`);
    
    // Update the call status in Firestore to 'rejected'
    const callDoc = doc(db, 'calls', callId);
    await updateDoc(callDoc, {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: 'user' // The patient/pet-owner is rejecting
    });
    
    // Use WebRTCService to reject the call
    WebRTCService.rejectCall(callId);
    
    // Clear the incoming call state
    incomingCall.value = null;
  } catch (error) {
    console.error('Error declining call:', error);
    errorMessage.value = "Failed to decline the call. Please try again.";
    // Still clear the incoming call state even if there was an error
    incomingCall.value = null;
  }
};

// Function to start the appointment timer
const startAppointmentTimer = (appointment) => {
  if (!appointment.date || !appointment.time) return;

  try {
    // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
    if (appointment.time) {
      const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
      if (timeMatch && timeMatch.length >= 3) {
        // Get the end time part
        const endTimeStr = timeMatch[2].trim();
        
        // Create date objects for the appointment end time
        const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
        
        if (endTimeParts) {
          // Parse end time
          let endHours = parseInt(endTimeParts[1]);
          const endMinutes = parseInt(endTimeParts[2]);
          const endPeriod = endTimeParts[3].toUpperCase();
          
          // Convert to 24-hour format
          if (endPeriod === 'PM' && endHours < 12) endHours += 12;
          if (endPeriod === 'AM' && endHours === 12) endHours = 0;
          
          // Create appointment end datetime object
          const appointmentDate = appointment.date instanceof Date 
            ? appointment.date 
            : parseISO(appointment.date);
          const endTime = new Date(appointmentDate);
          endTime.setHours(endHours, endMinutes, 0, 0);
          
          // Set appointment end time
          appointmentEndTime.value = endTime;
          
          // Update remaining time every second
          appointmentTimer = setInterval(() => {
            const now = new Date();
            const diffInSeconds = differenceInSeconds(appointmentEndTime.value, now);
            
            if (diffInSeconds <= 0) {
              // Time is up, show modal and end call
              clearInterval(appointmentTimer);
              remainingTime.value = '00:00';
              showCallExpiredModal.value = true;
            } else {
              // Calculate remaining time
              const minutes = Math.floor(diffInSeconds / 60);
              const seconds = diffInSeconds % 60;
              remainingTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
          }, 1000);
        }
      }
    }
  } catch (error) {
    console.error('Error starting appointment timer:', error);
  }
};

// Function to acknowledge call expired
const acknowledgeCallExpired = () => {
  showCallExpiredModal.value = false;
  endCall();
};

// Updated sendMessage function to use Firebase for real-time communication
const sendMessage = async () => {
  if (newMessage.value.trim() === '' || !activeSession.value) return;

  try {
    // Create a reference to the messages collection for this call
    const messagesRef = collection(db, 'calls', activeSession.value.id, 'messages');
    
    // Add the new message to Firestore
    await addDoc(messagesRef, {
      text: newMessage.value,
      sender: 'user', // 'user' for patient/pet-owner, 'vet' for veterinarian
      senderId: authStore.user.userId,
      senderName: authStore.user.displayName || 'Patient',
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Clear the input field
    newMessage.value = '';
    
    // Scroll to bottom of chat
    nextTick(() => {
      if (isMobileView.value) {
        if (mobileChatMessagesRef.value) {
          mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight;
        }
      } else {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// End call - UPDATED to handle remoteStream safely
const endCall = async () => {
  try {
    // First, update the call status in Firestore to notify the vet
    if (activeSession.value) {
      const callDoc = doc(db, 'calls', activeSession.value.id);
      
      // Update the call status to 'ended' to trigger the vet's UI to update
      await updateDoc(callDoc, {
        status: 'ended',
        endedAt: new Date(),
        endedBy: 'user', // Indicate that the user (pet owner) ended the call
        iceConnectionState: 'closed',
        connectionState: 'closed'
      });
      
      console.log('Call status updated to ended in Firestore');
    }
    
    // Clean up chat messages subscription
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe();
      chatMessagesUnsubscribe = null;
    }
    
    // Clear appointment timer
    if (appointmentTimer) {
      clearInterval(appointmentTimer);
      appointmentTimer = null;
    }
    
    // Use WebRTCService to hang up
    WebRTCService.hangUp();

    // Clean up local state
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      localStream.value = null;
    }

    // Safely handle remoteStream cleanup
    if (remoteStream.value) {
      remoteStream.value.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping remote track:', e);
        }
      });
      remoteStream.value = null;
    }

    // Clear video elements' srcObject
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = null;
    }
    
    if (remoteVideoRef.value) {
      remoteVideoRef.value.srcObject = null;
    }

    // Reset all state variables
    remoteStreamActive.value = false;
    activeSession.value = null;
    chatMessages.value = [];
    isMuted.value = false;
    isVideoOff.value = false;
    isScreenSharing.value = false;
    isSpeakerMuted.value = false;
    showChatPanel.value = false;
    currentView.value = 'sessions';
    callStatus.value = "";
    remainingTime.value = '';

    // Reset flags
    isAcceptingCall.value = false;
    isInitiatingCall.value = false;
    isCallInitializing.value = false;
    
    // Reset document title to remove any "In Call" indicators
    document.title = "Telehealth Sessions";
    
    // Force garbage collection
    setTimeout(() => {
      if (window.gc) window.gc();
    }, 100);
  } catch (error) {
    console.error("Error ending call:", error);
    
    // Even if there's an error, still reset the UI state
    remoteStreamActive.value = false;
    activeSession.value = null;
    currentView.value = 'sessions';
    
    // Reset document title
    document.title = "Telehealth Sessions";
  }
};

// Toggle mute
const toggleMute = () => {
  isMuted.value = !isMuted.value;
  WebRTCService.toggleMute(isMuted.value);
};

// Toggle video
const toggleVideo = () => {
  isVideoOff.value = !isVideoOff.value;
  WebRTCService.toggleVideo(isVideoOff.value);
};

// Toggle speaker
const toggleSpeaker = () => {
  isSpeakerMuted.value = !isSpeakerMuted.value;

  // If we have a remote video element, mute/unmute it
  if (remoteVideoRef.value) {
    remoteVideoRef.value.muted = isSpeakerMuted.value;
  }
};

// Add this function to handle screen sharing ended event
const handleScreenShareEnded = () => {
  console.log('Screen sharing ended event received');
  isScreenSharing.value = false;
  
  // Try to recover camera if needed
  if (activeSession.value) {
    recoverFromScreenShareError().catch(error => {
      console.error('Error recovering from screen share end:', error);
    });
  }
};

// Add this function to recover from screen share errors
const recoverFromScreenShareError = async () => {
  try {
    console.log('Attempting to recover from screen share error');
    
    // Get a new camera stream
    const cameraStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: localStream.value && localStream.value.getAudioTracks().length > 0 
    });
    
    // Replace the video track
    const videoTrack = cameraStream.getVideoTracks()[0];
    if (videoTrack) {
      // Get the sender that's sending the current video track
      const sender = WebRTCService.getVideoSender();
      if (sender) {
        // Replace the track in the RTCPeerConnection
        await sender.replaceTrack(videoTrack);
      }
      
      // Create a new local stream if needed
      if (!localStream.value) {
        localStream.value = new MediaStream();
        
        // Add audio track if we had one before
        const audioTrack = cameraStream.getAudioTracks()[0];
        if (audioTrack) {
          localStream.value.addTrack(audioTrack);
        }
      } else {
        // Replace the track in our local stream
        const oldVideoTracks = localStream.value.getVideoTracks();
        oldVideoTracks.forEach(track => {
          track.stop(); // Stop the old track
          localStream.value.removeTrack(track);
        });
      }
      
      localStream.value.addTrack(videoTrack);
      
      // Update the local video element
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
    }
    
    // Reset screen sharing state
    isScreenSharing.value = false;
    
    console.log('Successfully recovered from screen share error');
  } catch (error) {
    console.error('Failed to recover from screen share error:', error);
  }
};

// Fix the toggleScreenShare function to properly handle browser UI screen share ending
const toggleScreenShare = async () => {
  try {
    // If we're currently screen sharing and trying to turn it off
    if (isScreenSharing.value) {
      // Get back to camera video
      try {
        // Get a new camera stream
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: localStream.value && localStream.value.getAudioTracks().length > 0 
        });
        
        // Replace the video track
        const videoTrack = cameraStream.getVideoTracks()[0];
        if (videoTrack) {
          // Get the sender that's sending the current video track
          const sender = WebRTCService.getVideoSender();
          if (sender) {
            // Replace the track in the RTCPeerConnection
            await sender.replaceTrack(videoTrack);
          }
          
          // Replace the track in our local stream
          const oldVideoTracks = localStream.value.getVideoTracks();
          oldVideoTracks.forEach(track => {
            track.stop(); // Stop the old track
            localStream.value.removeTrack(track);
          });
          
          localStream.value.addTrack(videoTrack);
          
          // Update the local video element
          if (localVideoRef.value) {
            localVideoRef.value.srcObject = localStream.value;
          }
        }
        
        // Toggle screen sharing state
        isScreenSharing.value = false;
      } catch (error) {
        console.error('Error switching back to camera:', error);
        isScreenSharing.value = false; // Still update the UI state
        throw error;
      }
    } else {
      // Starting screen share
      try {
        // Request screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false // Most screen sharing doesn't include audio
        });
        
        // Get the video track from screen sharing
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        
        if (screenVideoTrack) {
          // Listen for the "ended" event on the screen share track
          screenVideoTrack.addEventListener('ended', async () => {
            // The user has ended screen sharing via the browser UI
            console.log('Screen sharing ended by user');
            
            // Only attempt to switch back if we're still in screen sharing mode
            if (isScreenSharing.value) {
              try {
                // Get a new camera stream
                const cameraStream = await navigator.mediaDevices.getUserMedia({ 
                  video: true, 
                  audio: localStream.value && localStream.value.getAudioTracks().length > 0 
                });
                
                // Replace the video track
                const videoTrack = cameraStream.getVideoTracks()[0];
                if (videoTrack) {
                  // Get the sender that's sending the current video track
                  const sender = WebRTCService.getVideoSender();
                  if (sender) {
                    // Replace the track in the RTCPeerConnection
                    await sender.replaceTrack(videoTrack);
                  }
                  
                  // Replace the track in our local stream
                  const oldVideoTracks = localStream.value.getVideoTracks();
                  oldVideoTracks.forEach(track => {
                    track.stop(); // Stop the old track
                    localStream.value.removeTrack(track);
                  });
                  
                  localStream.value.addTrack(videoTrack);
                  
                  // Update the local video element
                  if (localVideoRef.value) {
                    localVideoRef.value.srcObject = localStream.value;
                  }
                }
                
                // Update UI state
                isScreenSharing.value = false;
              } catch (error) {
                console.error('Error switching back to camera after screen share ended:', error);
                // Still update UI state even if there was an error
                isScreenSharing.value = false;
              }
            }
          });
          
          // Get the sender that's sending the current video track
          const sender = WebRTCService.getVideoSender();
          if (sender) {
            // Replace the track in the RTCPeerConnection
            await sender.replaceTrack(screenVideoTrack);
          }
          
          // Replace the track in our local stream
          const oldVideoTracks = localStream.value.getVideoTracks();
          oldVideoTracks.forEach(track => {
            track.stop(); // Stop the old track
            localStream.value.removeTrack(track);
          });
          
          localStream.value.addTrack(screenVideoTrack);
          
          // Update the local video element
          if (localVideoRef.value) {
            localVideoRef.value.srcObject = localStream.value;
          }
          
          // Toggle screen sharing state
          isScreenSharing.value = true;
        }
      } catch (error) {
        // User cancelled the screen sharing prompt
        console.error('Error starting screen share:', error);
        isScreenSharing.value = false; // Ensure UI state is correct
        throw error;
      }
    }
    
    return localStream.value;
  } catch (error) {
    console.error('Error toggling screen share:', error);
    errorMessage.value = "Failed to toggle screen sharing. Please try again.";
    isScreenSharing.value = false; // Ensure UI state is correct
    throw error;
  }
};

// Setup incoming calls listener
const setupIncomingCallsListener = () => {
  if (!authStore.user || !authStore.user.userId) return;

  try {
    incomingCallsUnsubscribe = WebRTCService.listenForIncomingCalls(
      authStore.user.userId,
      (callData) => {
        // Find the appointment details
        const appointment = sessions.value.find(s => s.id === callData.id);
        
        if (appointment) {
          // Check if it's time for the appointment
          if (!isAppointmentTime(appointment)) {
            console.log("Ignoring incoming call outside of appointment time");
            return;
          }
          
          incomingCall.value = {
            id: callData.id,
            callerId: callData.callerId,
            callerName: appointment.doctorName || 'Doctor',
            sessionTitle: appointment.title || 'Telehealth Session',
            appointment: appointment
          };
          
          // Add a listener to check if the call gets canceled or ended by the vet
          const callDoc = doc(db, 'calls', callData.id);
          const callStatusUnsubscribe = onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (data) {
              // If the call was rejected or ended by the vet, hide the incoming call modal
              if (data.status === 'rejected' || data.status === 'ended') {
                console.log('Call was rejected or ended by the veterinarian');
                // Hide the incoming call modal
                if (incomingCall.value && incomingCall.value.id === callData.id) {
                  incomingCall.value = null;
                }
                // Unsubscribe from this listener
                callStatusUnsubscribe();
              }
            }
          });
        } else {
          incomingCall.value = {
            id: callData.id,
            callerId: callData.callerId,
            callerName: 'Doctor',
            sessionTitle: 'Telehealth Session'
          };
          
          // Add the same listener for unknown appointments
          const callDoc = doc(db, 'calls', callData.id);
          const callStatusUnsubscribe = onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (data) {
              // If the call was rejected or ended by the vet, hide the incoming call modal
              if (data.status === 'rejected' || data.status === 'ended') {
                console.log('Call was rejected or ended by the veterinarian');
                // Hide the incoming call modal
                if (incomingCall.value && incomingCall.value.id === callData.id) {
                  incomingCall.value = null;
                }
                // Unsubscribe from this listener
                callStatusUnsubscribe();
              }
            }
          });
        }
      }
    );
  } catch (error) {
    console.error('Error setting up incoming calls listener:', error);
  }
};

// Lifecycle hooks
onMounted(() => {
  checkMobileView();
  window.addEventListener("resize", checkMobileView);

  // Initialize auth if needed
  if (!authStore.isInitialized) {
    authStore.initialize();
  }

  // Fetch categories first
  serviceCategoryStore.fetchCategories();

  // Fetch services to get category information
  serviceCategoryStore.fetchServices();

  // Load approved sessions by default
  loadApprovedSessions();

  // Initialize Lottie animations
  initializeLottieAnimations();
  startAutoplay();

  // Setup network monitoring
  setupNetworkMonitoring();

  // Setup incoming calls listener
  setupIncomingCallsListener();

  // Listen for screen sharing state changes from WebRTCService
  window.addEventListener('webrtc-screenshare-ended', handleScreenShareEnded);
});

// Clean up when component is unmounted
onUnmounted(() => {
  stopAutoplay();
  clearInterval(networkStatusInterval);
  window.removeEventListener("resize", checkMobileView);
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
  window.removeEventListener('webrtc-screenshare-ended', handleScreenShareEnded);

  // Clean up WebRTC
  if (activeSession.value) {
    endCall();
  }

  // Unsubscribe from incoming calls listener
  if (incomingCallsUnsubscribe) {
    incomingCallsUnsubscribe();
  }
  
  // Clean up chat messages subscription
  if (chatMessagesUnsubscribe) {
    chatMessagesUnsubscribe();
    chatMessagesUnsubscribe = null;
  }
  
  // Clear appointment timer
  if (appointmentTimer) {
    clearInterval(appointmentTimer);
    appointmentTimer = null;
  }
});

// Watchers
watch(currentSlide, (newSlide, oldSlide) => {
  lottieInstances.forEach((instance, index) => {
    if (index === newSlide) {
      instance.play();
    } else {
      instance.pause();
    }
  });
});

// Watch for call status changes to update UI - UPDATED to safely check remoteStream
watch(() => callStatus.value, (newStatus) => {
  if (newStatus === 'connected') {
    // Double check remote stream when connection is established
    if (remoteStream.value && typeof remoteStream.value.getTracks === 'function') {
      try {
        const tracks = remoteStream.value.getTracks();
        if (tracks && tracks.length > 0) {
          remoteStreamActive.value = true;
        }
      } catch (error) {
        console.error('Error checking remote stream tracks:', error);
      }
    } else {
      // If remoteStream doesn't have getTracks, we might still be connected
      // if the remote video element has a srcObject
      if (remoteVideoRef.value && remoteVideoRef.value.srcObject) {
        remoteStreamActive.value = true;
      }
    }
  }
});

// Watch for Firestore call status updates
watch(() => activeSession.value, async (newSession) => {
  if (unsubscribeCallStatus.value) {
    unsubscribeCallStatus.value(); // Unsubscribe from previous listener
    unsubscribeCallStatus.value = null;
  }

  if (newSession) {
    // Listen for call status updates in Firestore
    const callDoc = doc(db, 'calls', newSession.id);
    const unsubscribe = onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        // Update call status based on Firestore
        if (data.status === 'connected') {
          callStatus.value = 'connected';
          remoteStreamActive.value = true; // Update remote stream active state when connected

          // Check if remote stream has tracks flag is set
          if (data.hasRemoteTracks) {
            remoteStreamActive.value = true;
          }
        } else if (data.status === 'ended' && !isCallInitializing.value) {
          callStatus.value = 'ended';
          // Auto end call if the other party ended it
          if (activeSession.value) {
            endCall();
          }
        }
      }
    });

    unsubscribeCallStatus.value = unsubscribe;
  }
});
</script>

<style scoped>
/* Slide transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.telehealth-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  height: 100%;
  padding-bottom: 1.5rem;
}

.telehealth-container > div:first-child {
  min-height: calc(100% + 1.25rem);
}

@media (min-width: 768px) {
  .telehealth-container {
    min-height: calc(100% + 1.25rem);
  }
}
</style>