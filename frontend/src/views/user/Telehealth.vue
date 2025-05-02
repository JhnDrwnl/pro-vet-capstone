<!-- views/user/Telehealth.vue -->
<template>
  <div class="telehealth-container">
    <!-- Loading spinner during initial data load -->
    <LoadingSpinner v-if="loading" isOverlay text="Loading appointments..." />
  
    <!-- Carousel View (Optimized for small screens) -->
    <div v-if="currentView === 'carousel'" class="h-full flex flex-col bg-gray-50 overflow-auto">
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
                        @click="navigateToAppointments"
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
                    :class="{ 'text-blue-600': statusFilter === 'all' }"
                  >
                    All Appointments
                  </button>
                  <button 
                    @click="setStatusFilter('approved')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': statusFilter === 'approved' }"
                  >
                    Approved
                  </button>
                  <button 
                    @click="setStatusFilter('scheduled')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': statusFilter === 'scheduled' }"
                  >
                    Scheduled
                  </button>
                  <button 
                    @click="setStatusFilter('completed')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': statusFilter === 'completed' }"
                  >
                    Completed
                  </button>
                  <button 
                    @click="setStatusFilter('cancelled')"
                    class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
                    :class="{ 'text-blue-600': statusFilter === 'cancelled' }"
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
            
            <!-- Optimized grid for mobile -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div 
                v-for="appointment in filteredSessions" 
                :key="appointment.id" 
                class="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div class="p-3 sm:p-4 lg:p-6">
                  <div class="flex justify-between items-start mb-2 sm:mb-4">
                    <div>
                      <h2 class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1 line-clamp-1">
                        {{ cleanTitle(appointment.title) || (appointment.serviceNames && cleanTitle(appointment.serviceNames[0])) || 'Telehealth Session' }}
                      </h2>
                      <div class="flex items-center text-xs sm:text-sm text-gray-500">
                        <ClockIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                        <span>{{ appointment.time || formatTime(appointment.scheduledTime || appointment.date) }}</span>
                      </div>
                    </div>
                    <span 
                      :class="[
                        'px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full',
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ appointment.status }}
                    </span>
                  </div>
                  
                  <div class="space-y-2 sm:space-y-3 mb-3 sm:mb-4 lg:mb-6">
                    <div class="flex items-start">
                      <CalendarIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Date</div>
                        <div class="text-xs sm:text-sm font-medium">{{ formatDateOnly(appointment.scheduledTime || appointment.date) }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start">
                      <UserIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Doctor</div>
                        <div class="text-xs sm:text-sm font-medium">{{ appointment.doctorName || 'Not assigned' }}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start">
                      <PawPrintIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Pet</div>
                        <div class="text-xs sm:text-sm font-medium">{{ appointment.petName || 'Not specified' }}</div>
                      </div>
                    </div>
                    
                    <div v-if="appointment.serviceNames && appointment.serviceNames.length > 0" class="flex items-start">
                      <StethoscopeIcon class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Services</div>
                        <div class="text-xs sm:text-sm font-medium line-clamp-1">{{ appointment.serviceNames.join(', ') }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex">
                    <button 
                      v-if="(appointment.status === 'scheduled' || appointment.status === 'approved')" 
                      class="w-full inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-full hover:bg-blue-700"
                      @click="joinSession(appointment)"
                    >
                      <PhoneIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Join Call
                    </button>
                    <button 
                      v-else
                      class="w-full inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-700 text-xs sm:text-sm rounded-full cursor-not-allowed" 
                      disabled
                    >
                      <ClockIcon class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
                    selectedSession.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
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
                  v-if="(selectedSession.status === 'scheduled' || selectedSession.status === 'approved')" 
                  class="flex-1 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-full hover:bg-blue-700"
                  @click="joinSession(selectedSession)"
                >
                  <PhoneIcon class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Join Call
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
    <!-- Header remains the same -->
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
          
          <div 
            v-if="callStatus" 
            class="flex items-center justify-end sm:order-1"
          >
            <span 
              :class="[
                'w-2 h-2 rounded-full mr-1 sm:mr-2',
                callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              ]"
            ></span>
            <span class="text-xs sm:text-sm text-gray-600">{{ callStatusText }}</span>
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
            <div class="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-gray-900/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
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
          </div>
          
          <!-- Mobile Chat Panel - Same height as video on mobile -->
          <div v-if="showChatPanel && isMobileView" class="bg-white rounded-xl shadow-sm flex flex-col h-[450px] sm:h-[500px]">
            <div class="p-2 border-b border-gray-100">
              <h3 class="text-base font-medium text-gray-900">Chat</h3>
            </div>
            
            <div class="flex-1 overflow-y-auto p-2 space-y-2" ref="mobileChatMessagesRef">
              <div 
                v-for="(message, index) in chatMessages" 
                :key="index"
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
                    'text-[9px] mt-0.5',
                    message.sender === 'vet' ? 'text-left text-gray-500' : 'text-right text-gray-500'
                  ]"
                >
                  {{ formatTime(message.timestamp) }}
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
              v-for="(message, index) in chatMessages" 
              :key="index"
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
                  'text-xs mt-1',
                  message.sender === 'vet' ? 'text-left text-gray-500' : 'text-right text-gray-500'
                ]"
              >
                {{ formatTime(message.timestamp) }}
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
    <div v-if="incomingCall" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
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
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
import lottie from "lottie-web"
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
} from "lucide-vue-next"
import UserAppointments from "@/views/user/Appointments.vue"
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"
import { useAppointmentStore } from "@/stores/modules/appointmentStore"
import { useAuthStore } from "@/stores/modules/authStore"
import { useServiceCategoryStore } from "@/stores/modules/ServiceCategoryStore"
import { db } from '@shared/firebase'
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import WebRTCService from "@/services/webrtc-service"

// Initialize router
const router = useRouter()
const appointmentStore = useAppointmentStore()
const authStore = useAuthStore()
const serviceCategoryStore = useServiceCategoryStore()

// View state
const currentView = ref("carousel")

// State variables
const loading = ref(false)
const sessions = ref([])

// Status filter
const statusFilter = ref("all")
const activeSession = ref(null)
const selectedSession = ref(null)
const chatMessages = ref([])
const newMessage = ref("")
const chatMessagesRef = ref(null)
const mobileChatMessagesRef = ref(null)
const incomingCall = ref(null)
const showingApprovedOnly = ref(false)
const errorMessage = ref("")

// New filter UI state
const showStatusFilter = ref(false)

// Chat panel visibility state
const showChatPanel = ref(false)

// Mobile view detection
const isMobileView = ref(false)

// Carousel state
const currentSlide = ref(0)
const slides = [
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
  },
]

// WebRTC state
const localVideoRef = ref(null)
const remoteVideoRef = ref(null)
const localStream = ref(null)
const remoteStream = ref(null)
const isMuted = ref(false)
const isVideoOff = ref(false)
const isScreenSharing = ref(false)
const isSpeakerMuted = ref(false)
const remoteStreamActive = ref(false)
const callStatus = ref("")
let incomingCallsUnsubscribe = null

// Network status monitoring
const isOnline = ref(navigator.onLine)
let networkStatusInterval = null

// Auto-advance slides
let autoplayInterval

// Lottie animations
let lottieInstances = []

// Function to clean title by removing empty parentheses
const cleanTitle = (text) => {
  if (!text) return text
  // Remove empty parentheses and trim
  return text.replace(/$$\s*$$/g, '').trim()
}

// Function to remove minutes from title
const removeMinutes = (text) => {
  if (!text) return text
  return text.replace(/\s*\d+\s*minutes/, '')
}

// Check for mobile view
const checkMobileView = () => {
  isMobileView.value = window.innerWidth < 768
}

// Toggle chat panel visibility
const toggleChatPanel = () => {
  showChatPanel.value = !showChatPanel.value

  // Scroll to bottom of chat when opening
  if (showChatPanel.value) {
    nextTick(() => {
      if (isMobileView.value) {
        if (mobileChatMessagesRef.value) {
          mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight
        }
      } else {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
        }
      }
    })
  }
}

// Navigation method for appointments
const navigateToAppointments = () => {
  router.push({ name: 'UserAppointments' })
}

// Computed properties
const filteredSessions = computed(() => {
  // First filter by status
  let filtered = sessions.value
  if (statusFilter.value !== "all") {
    filtered = filtered.filter((session) => session.status === statusFilter.value)
  }

  // Then filter by category - only show Telehealth Services
  return filtered.filter(appointment => {
    // Check if the appointment has a direct category property
    if (appointment.category && appointment.category.toLowerCase().includes('telehealth')) {
      return true
    }
    
    // If not, check if any of the services belong to the Telehealth category
    if (appointment.services && appointment.services.length > 0) {
      // Check if any service name contains "telehealth" or "follow-up"
      if (appointment.serviceNames && appointment.serviceNames.some(name => 
        name.toLowerCase().includes('telehealth') || 
        name.toLowerCase().includes('follow-up'))) {
        return true
      }
      
      // Try to find the service in the service store
      return appointment.services.some(serviceId => {
        const service = serviceCategoryStore.services.find(s => s.id === serviceId)
        if (!service) return false
        
        // Check if the service belongs to a telehealth category
        const category = serviceCategoryStore.categories.find(c => c.id === service.categoryId)
        return category && category.name.toLowerCase().includes('telehealth')
      })
    }
    
    return false
  })
})

const callStatusText = computed(() => {
  switch (callStatus.value) {
    case "connected":
      return "Connected"
    case "reconnecting":
      return "Reconnecting..."
    case "failed":
      return "Connection failed"
    case "ended":
      return "Call ended"
    default:
      return "Connecting..."
  }
})

// Status filter label for display
const statusFilterLabel = computed(() => {
  switch (statusFilter.value) {
    case "all":
      return "All Appointments"
    case "approved":
      return "Approved"
    case "scheduled":
      return "Scheduled"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    default:
      return "All Appointments"
  }
})

// Format functions for displaying appointment data correctly
const formatDateOnly = (timestamp) => {
  if (!timestamp) return "N/A"

  // Ensure timestamp is a valid Date object
  let date
  try {
    date = timestamp instanceof Date ? timestamp : new Date(timestamp)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }

  // Format date only (without time)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Format time function
const formatTime = (timestamp) => {
  if (!timestamp) return ""

  try {
    // Ensure we have a valid Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

    // Format the time
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  } catch (error) {
    console.error("Error formatting time:", error)
    return ""
  }
}

// Carousel methods
const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}

// Initialize Lottie animations
const initializeLottieAnimations = () => {
  // Destroy previous instances if they exist
  lottieInstances.forEach((instance) => {
    if (instance) {
      instance.destroy()
    }
  })

  lottieInstances = []

  // Initialize new instances
  slides.forEach((slide, index) => {
    const container = document.getElementById(`lottie-container-${index}`)
    if (container) {
      const animation = lottie.loadAnimation({
        container: container,
        renderer: "svg",
        loop: true,
        autoplay: index === currentSlide.value,
        path: slide.lottieUrl,
      })

      lottieInstances.push(animation)
    }
  })
}

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  clearInterval(autoplayInterval)
}

// Network status monitoring
const setupNetworkMonitoring = () => {
  // Listen for online/offline events
  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Also check periodically
  networkStatusInterval = setInterval(() => {
    const currentStatus = navigator.onLine
    if (isOnline.value !== currentStatus) {
      isOnline.value = currentStatus
      if (currentStatus) {
        handleOnline()
      } else {
        handleOffline()
      }
    }
  }, 5000)
}

const handleOnline = () => {
  console.log("Network connection restored")
  isOnline.value = true
}

const handleOffline = () => {
  console.log("Network connection lost")
  isOnline.value = false

  if (callStatus.value === "connected") {
    callStatus.value = "reconnecting"
  }
}

const attemptReconnect = () => {
  isOnline.value = true
  refreshSessions()
}

// Toggle status filter dropdown
const toggleStatusFilter = () => {
  showStatusFilter.value = !showStatusFilter.value
}

// Set status filter
const setStatusFilter = (status) => {
  statusFilter.value = status
  showStatusFilter.value = false

  // Reset approved only flag if selecting a different filter
  if (status !== 'approved') {
    showingApprovedOnly.value = false
  } else {
    showingApprovedOnly.value = true
  }
}

// Update the refreshSessions method to fetch real data
const refreshSessions = async () => {
  loading.value = true
  showingApprovedOnly.value = false

  try {
    // Initialize auth if needed
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
    
    if (!authStore.user || !authStore.user.userId) {
      console.log("No user logged in, cannot fetch appointments")
      sessions.value = []
      return
    }
    
    // Fetch categories first
    await serviceCategoryStore.fetchCategories()
    
    // Fetch services to get category information
    await serviceCategoryStore.fetchServices()
    
    // Fetch appointments for the current user
    const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId)
    sessions.value = userAppointments || []
    
    console.log(`Fetched ${sessions.value.length} appointments for user`)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    errorMessage.value = "Failed to load appointments. Please try again."
  } finally {
    loading.value = false
  }
}

// Load only approved sessions
const loadApprovedSessions = async () => {
  loading.value = true
  showingApprovedOnly.value = true

  try {
    // Initialize auth if needed
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }
    
    if (!authStore.user || !authStore.user.userId) {
      console.log("No user logged in, cannot fetch appointments")
      sessions.value = []
      return
    }
    
    // Fetch categories first
    await serviceCategoryStore.fetchCategories()
    
    // Fetch services to get category information
    await serviceCategoryStore.fetchServices()
    
    // Fetch appointments for the current user
    const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId)
    
    // Filter to only show approved appointments
    sessions.value = (userAppointments || []).filter(appointment => appointment.status === 'approved')
    
    console.log(`Fetched ${sessions.value.length} approved appointments for user`)
    
    // Set filter to show approved sessions
    statusFilter.value = "approved"
  } catch (error) {
    console.error("Error fetching approved appointments:", error)
    errorMessage.value = "Failed to load approved appointments. Please try again."
  } finally {
    loading.value = false
  }
}

// View session details instead of starting a call
const viewSessionDetails = (session) => {
  selectedSession.value = session
  currentView.value = 'details'
}

// Join session using WebRTC
const joinSession = async (session) => {
  try {
    if (!isOnline.value) {
      errorMessage.value = "You appear to be offline. Please check your internet connection and try again."
      return
    }

    // Request camera and microphone access
    try {
      localStream.value = await WebRTCService.setupLocalStream();
      
      // Set the stream to the video element
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      return;
    }

    // Set current appointment and activate call view
    activeSession.value = session;
    callStatus.value = "connecting";
    
    // Initialize chat for this session
    chatMessages.value = [];
    
    // Wait for DOM update before initializing video elements
    await nextTick();
    
    // Make sure video elements are properly set up after DOM update
    if (localVideoRef.value && localStream.value) {
      localVideoRef.value.srcObject = localStream.value;
    }

    // Start the WebRTC call
    try {
      const streams = await WebRTCService.startCall(
        session.id, 
        authStore.user.userId, 
        session.doctorId
      );
      
      // Set remote stream to video element
      if (remoteVideoRef.value && streams.remoteStream) {
        remoteVideoRef.value.srcObject = streams.remoteStream;
        remoteStream.value = streams.remoteStream;
        
        // Listen for remote tracks to update UI
        streams.remoteStream.onaddtrack = () => {
          remoteStreamActive.value = true;
        };
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  } catch (error) {
    console.error("Error joining session:", error);
    errorMessage.value = "Failed to join call. Please try again.";
  }
}

// Accept incoming call
const acceptIncomingCall = async () => {
  if (!incomingCall.value) return;

  try {
    // Request camera and microphone access
    try {
      localStream.value = await WebRTCService.setupLocalStream();
      
      // Set the stream to the video element
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      return;
    }

    // Set current appointment and activate call view
    const session = sessions.value.find(s => s.id === incomingCall.value.id);
    if (!session) {
      errorMessage.value = "Session not found. The call may have ended.";
      incomingCall.value = null;
      return;
    }
    
    activeSession.value = session;
    callStatus.value = "connected";
    
    // Initialize chat for this session
    chatMessages.value = [];
    
    // Wait for DOM update before initializing video elements
    await nextTick();
    
    // Make sure video elements are properly set up after DOM update
    if (localVideoRef.value && localStream.value) {
      localVideoRef.value.srcObject = localStream.value;
    }

    // Accept the WebRTC call
    try {
      const streams = await WebRTCService.answerCall(incomingCall.value.id);
      
      // Set remote stream to video element
      if (remoteVideoRef.value && streams.remoteStream) {
        remoteVideoRef.value.srcObject = streams.remoteStream;
        remoteStream.value = streams.remoteStream;
        remoteStreamActive.value = true;
      }
    } catch (error) {
      console.error('Error accepting call:', error);
    }
    
    // Clear the incoming call
    incomingCall.value = null;
  } catch (error) {
    console.error("Error accepting call:", error);
    errorMessage.value = "Failed to accept call. Please try again.";
  }
}

// Decline incoming call
const declineIncomingCall = () => {
  if (incomingCall.value) {
    WebRTCService.rejectCall(incomingCall.value.id);
    incomingCall.value = null;
  }
}

// End call
const endCall = () => {
  // Use WebRTCService to hang up
  WebRTCService.hangUp();

  // Clean up local state
  remoteStream.value = null;
  remoteStreamActive.value = false;
  activeSession.value = null;
  chatMessages.value = [];
  isMuted.value = false;
  isVideoOff.value = false;
  isScreenSharing.value = false;
  isSpeakerMuted.value = false;
  showChatPanel.value = false;
  currentView.value = 'sessions';
}

// Toggle mute
const toggleMute = () => {
  isMuted.value = !isMuted.value;
  WebRTCService.toggleMute(isMuted.value);
}

// Toggle video
const toggleVideo = () => {
  isVideoOff.value = !isVideoOff.value;
  WebRTCService.toggleVideo(isVideoOff.value);
}

// Toggle speaker
const toggleSpeaker = () => {
  isSpeakerMuted.value = !isSpeakerMuted.value;

  // If we have a remote video element, mute/unmute it
  if (remoteVideoRef.value) {
    remoteVideoRef.value.muted = isSpeakerMuted.value;
  }
}

// Toggle screen share
const toggleScreenShare = async () => {
  try {
    localStream.value = await WebRTCService.toggleScreenShare(isScreenSharing.value);
    
    // Update video element
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = localStream.value;
    }
    
    isScreenSharing.value = !isScreenSharing.value;
  } catch (error) {
    console.error('Error toggling screen share:', error);
  }
}

// Send chat message
const sendMessage = () => {
  if (newMessage.value.trim() === '') return;

  const message = {
    text: newMessage.value,
    sender: 'patient',
    timestamp: new Date()
  };

  chatMessages.value.push(message);
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

  // Simulate vet response
  setTimeout(() => {
    const vetResponse = {
      text: 'Thank you for your message!',
      sender: 'vet',
      timestamp: new Date()
    };
    chatMessages.value.push(vetResponse);
    
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
  }, 2000);
}

// Check for incoming calls
const checkForIncomingCalls = async () => {
  if (!authStore.user || !authStore.user.userId) return;
  
  try {
    const incomingCalls = await WebRTCService.checkForIncomingCalls(authStore.user.userId);
    
    if (incomingCalls.length > 0) {
      // Find the appointment details for the first incoming call
      const call = incomingCalls[0];
      const appointment = sessions.value.find(s => s.id === call.id);
      
      if (appointment) {
        incomingCall.value = {
          id: call.id,
          callerId: call.callerId,
          callerName: appointment.doctorName || 'Doctor',
          sessionTitle: appointment.title || 'Telehealth Session'
        };
      } else {
        incomingCall.value = {
          id: call.id,
          callerId: call.callerId,
          callerName: 'Doctor',
          sessionTitle: 'Telehealth Session'
        };
      }
    }
  } catch (error) {
    console.error('Error checking for incoming calls:', error);
  }
}

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
          incomingCall.value = {
            id: callData.id,
            callerId: callData.callerId,
            callerName: appointment.doctorName || 'Doctor',
            sessionTitle: appointment.title || 'Telehealth Session'
          };
        } else {
          incomingCall.value = {
            id: callData.id,
            callerId: callData.callerId,
            callerName: 'Doctor',
            sessionTitle: 'Telehealth Session'
          };
        }
      }
    );
  } catch (error) {
    console.error('Error setting up incoming calls listener:', error);
  }
}

// Lifecycle hooks
onMounted(async () => {
  checkMobileView();
  window.addEventListener("resize", checkMobileView);

  // Initialize auth if needed
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  // Fetch categories first
  await serviceCategoryStore.fetchCategories();

  // Fetch services to get category information
  await serviceCategoryStore.fetchServices();

  // Load approved sessions by default
  await loadApprovedSessions();

  // Initialize Lottie animations
  initializeLottieAnimations();
  startAutoplay();

  // Setup network monitoring
  setupNetworkMonitoring();

  // Setup incoming calls listener
  setupIncomingCallsListener();
  
  // Check for incoming calls immediately
  checkForIncomingCalls();
  
  // Then check periodically
  const checkInterval = setInterval(checkForIncomingCalls, 30000); // Check every 30 seconds
  
  // Clean up interval on unmount
  onUnmounted(() => {
    clearInterval(checkInterval);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobileView);
  stopAutoplay();
  clearInterval(networkStatusInterval);
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);

  // Clean up WebRTC
  if (activeSession.value) {
    endCall();
  }

  // Unsubscribe from incoming calls listener
  if (incomingCallsUnsubscribe) {
    incomingCallsUnsubscribe();
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