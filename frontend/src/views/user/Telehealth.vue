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
                    <!-- UPDATED: Using getStatusClass function for status styling -->
                    <span :class="getStatusClass(appointment.status)">
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
                    
                    <!-- UPDATED: Doctor section with profile image -->
                    <div class="flex items-start">
                      <div class="w-5 h-5 rounded-full overflow-hidden bg-blue-100 mr-3 flex-shrink-0 mt-0.5">
                        <img 
                          v-if="appointment.doctorPhotoURL" 
                          :src="appointment.doctorPhotoURL" 
                          :alt="appointment.doctorName || 'Doctor'"
                          class="w-full h-full object-cover"
                          @error="onDoctorImageError"
                        />
                        <UserIcon v-else class="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">Doctor</div>
                        <div class="text-xs sm:text-sm font-medium break-words">{{ appointment.doctorName || 'Not assigned' }}</div>
                      </div>
                    </div>
                    
                    <!-- UPDATED: Pet section with paw icon -->
                    <div class="flex items-start">
                      <PawPrintIcon class="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <div class="text-xs sm:text-sm text-gray-500">
                          {{ hasPet(appointment) ? (hasMultiplePets(appointment) ? 'Pets' : 'Pet') : 'Pet' }}
                        </div>
                        
                        <!-- No pets case -->
                        <div v-if="!hasPet(appointment)" class="text-xs sm:text-sm font-medium break-words">
                          Not specified
                        </div>
                        
                        <!-- Single pet case -->
                        <div v-else-if="!hasMultiplePets(appointment)" class="flex items-center space-x-2">
                          <div class="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <img 
                              v-if="getPetImage(appointment)" 
                              :src="getPetImage(appointment)" 
                              alt="Pet" 
                              class="w-full h-full object-cover"
                              @error="onPetImageError"
                            />
                            <PawPrintIcon v-else class="w-4 h-4 absolute inset-0 m-auto text-gray-400" />
                          </div>
                          <div class="text-xs sm:text-sm font-medium">
                            {{ getPetName(appointment) }}
                            <span v-if="getPetSpecies(appointment)" class="text-gray-500">
                              ({{ getPetSpecies(appointment) }})
                            </span>
                          </div>
                        </div>
                        
                        <!-- Multiple pets case - with overlapping images -->
                        <div v-else class="flex flex-col">
                          <!-- Overlapping profile pictures with proper styling -->
                          <div class="flex items-center">
                            <div class="flex mr-2 relative" style="width: 40px; height: 24px;">
                              <!-- Render in reverse order so first pet is at the back -->
                              <div 
                                v-for="(petIndex, photoIndex) in [...Array(Math.min(3, getPetCount(appointment))).keys()].reverse()" 
                                :key="photoIndex"
                                class="absolute h-6 w-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                                :style="{ 
                                  left: `${photoIndex * 8}px`, 
                                  zIndex: photoIndex + 1
                                }"
                              >
                                <img 
                                  v-if="appointment.petPhotos && appointment.petPhotos[petIndex]"
                                  :src="appointment.petPhotos[petIndex]" 
                                  :alt="appointment.petNames ? appointment.petNames[petIndex] : 'Pet'"
                                  class="h-6 w-6 rounded-full object-cover" 
                                  @error="onPetImageError"
                                />
                                <PawPrintIcon v-else class="w-4 h-4 text-gray-400" />
                              </div>
                              
                              <!-- Show +X more if there are more than 3 pets -->
                              <div 
                                v-if="getPetCount(appointment) > 3" 
                                class="absolute h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                                :style="{ left: '16px', zIndex: 4 }"
                              >
                                +{{ getPetCount(appointment) - 3 }}
                              </div>
                            </div>
                            
                            <!-- Pet count -->
                            <div class="text-xs sm:text-sm font-medium">
                              {{ getPetCount(appointment) }} pets
                            </div>
                          </div>
                          
                          <!-- Pet names with species groups -->
                          <div class="mt-1 ml-1">
                            <div v-for="(group, groupIndex) in getPetGroups(appointment)" :key="groupIndex" class="text-xs text-gray-600">
                              <span v-if="group.indices.length <= 2">
                                {{ group.indices.map(idx => appointment.petNames[idx]).join(', ') }}
                              </span>
                              <span v-else>
                                {{ group.indices.slice(0, 2).map(idx => appointment.petNames[idx]).join(', ') }} 
                                +{{ group.indices.length - 2 }}
                              </span>
                              <span class="text-gray-500">({{ group.species }})</span>
                            </div>
                          </div>
                        </div>
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
                <!-- UPDATED: Using getStatusClass function for status styling -->
                <span :class="getStatusClass(selectedSession.status)">
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
                  
                  <!-- UPDATED: Doctor section with profile image -->
                  <div class="flex items-start">
                    <div class="w-10 h-10 rounded-full overflow-hidden bg-blue-100 mr-3 sm:mr-4 mt-0.5">
                      <img 
                        v-if="selectedSession.doctorPhotoURL" 
                        :src="selectedSession.doctorPhotoURL" 
                        :alt="selectedSession.doctorName || 'Doctor'"
                        class="w-full h-full object-cover"
                        @error="onDoctorImageError"
                      />
                      <UserIcon v-else class="w-10 h-10 p-2 text-blue-600" />
                    </div>
                    <div>
                      <div class="text-sm sm:text-base text-gray-500">Doctor</div>
                      <div class="text-sm sm:text-base font-medium">{{ selectedSession.doctorName || 'Not assigned' }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-3 sm:space-y-4">
                  <!-- UPDATED: Pet section in details view with paw icon -->
                  <div class="flex items-start">
                    <PawPrintIcon class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3 sm:mr-4 mt-0.5" />
                    <div>
                      <div class="text-sm sm:text-base text-gray-500">
                        {{ hasPet(selectedSession) ? (hasMultiplePets(selectedSession) ? 'Pets' : 'Pet') : 'Pet' }}
                      </div>
                      
                      <!-- No pets case -->
                      <div v-if="!hasPet(selectedSession)" class="text-sm sm:text-base font-medium">
                        Not specified
                      </div>
                      
                      <!-- Single pet case -->
                      <div v-else-if="!hasMultiplePets(selectedSession)" class="flex items-center space-x-2">
                        <div class="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <img 
                            v-if="getPetImage(selectedSession)" 
                            :src="getPetImage(selectedSession)" 
                            alt="Pet" 
                            class="w-full h-full object-cover"
                            @error="onPetImageError"
                          />
                          <PawPrintIcon v-else class="w-5 h-5 absolute inset-0 m-auto text-gray-400" />
                        </div>
                        <div class="text-sm sm:text-base font-medium">
                          {{ getPetName(selectedSession) }}
                          <span v-if="getPetSpecies(selectedSession)" class="text-gray-500">
                            ({{ getPetSpecies(selectedSession) }})
                          </span>
                        </div>
                      </div>
                      
                      <!-- Multiple pets case - with overlapping images -->
                      <div v-else>
                        <div class="flex items-center mb-2">
                          <div class="flex -space-x-2 mr-2">
                            <div 
                              v-for="(petIndex, photoIndex) in [...Array(Math.min(3, getPetCount(selectedSession))).keys()]" 
                              :key="photoIndex" 
                              class="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-white"
                              :style="{ zIndex: 3 - photoIndex }"
                            >
                              <img 
                                v-if="selectedSession.petPhotos && selectedSession.petPhotos[petIndex]" 
                                :src="selectedSession.petPhotos[petIndex]" 
                                :alt="selectedSession.petNames ? selectedSession.petNames[petIndex] : 'Pet'" 
                                class="w-full h-full object-cover"
                                @error="onPetImageError"
                              />
                              <PawPrintIcon v-else class="w-5 h-5 absolute inset-0 m-auto text-gray-400" />
                            </div>
                            <div 
                              v-if="getPetCount(selectedSession) > 3" 
                              class="relative w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                            >
                              +{{ getPetCount(selectedSession) - 3 }}
                            </div>
                          </div>
                          <div class="text-sm sm:text-base font-medium">
                            {{ getPetCount(selectedSession) }} pets
                          </div>
                        </div>
                        
                        <!-- List all pets by species groups -->
                        <div class="space-y-2 mt-2">
                          <div v-for="(group, groupIndex) in getPetGroups(selectedSession)" :key="groupIndex" class="text-sm">
                            <div class="font-medium text-gray-700">{{ group.species }} <span class="text-gray-500">({{ group.indices.length }})</span></div>
                            <ul class="text-sm space-y-1 mt-1 ml-2">
                              <li v-for="idx in group.indices" :key="idx" class="flex items-center">
                                <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                <span>{{ selectedSession.petNames[idx] }}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
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
        <!-- Mobile header (visible on small screens) -->
        <div class="sm:hidden">
          <!-- Top row: Title and End Call button -->
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900">
              {{ cleanTitle(activeSession.title) || 'Telehealth Appointment' }}
            </h2>
            <button 
              @click="endCall" 
              class="inline-flex items-center justify-center px-3 py-0.5 bg-red-600 text-white text-xs rounded-full hover:bg-red-700"
            >
              <PhoneOffIcon class="w-3 h-3 mr-1" />
              End Call
            </button>
          </div>
          
          <!-- Bottom row: User/pet info and Connected status -->
          <div class="flex items-center justify-between mt-1">
            <div class="flex items-center text-xs text-gray-600 space-x-2">
              <!-- UPDATED: Doctor with profile image -->
              <span class="flex items-center">
                <div class="w-5 h-5 rounded-full overflow-hidden bg-blue-100 mr-1">
                  <img 
                    v-if="activeSession.doctorPhotoURL" 
                    :src="activeSession.doctorPhotoURL" 
                    :alt="activeSession.doctorName || 'Veterinarian'"
                    class="w-full h-full object-cover"
                    @error="onDoctorImageError"
                  />
                  <UserIcon v-else class="w-5 h-5 p-1 text-blue-600" />
                </div>
                {{ activeSession.doctorName || 'Veterinarian' }}
              </span>
              
              <!-- Pet display for mobile - Updated to match table style -->
              <div v-if="!hasPet(activeSession)" class="flex items-center">
                <PawPrintIcon class="w-3 h-3 mr-1" /> 
                No Pet
              </div>
              <div v-else-if="!hasMultiplePets(activeSession)" class="flex items-center">
                <div class="w-5 h-5 rounded-full bg-gray-100 overflow-hidden mr-1">
                  <img 
                    v-if="getPetImage(activeSession)"
                    :src="getPetImage(activeSession)" 
                    :alt="getPetName(activeSession)"
                    class="w-full h-full object-cover" 
                    @error="onPetImageError"
                  />
                  <PawPrintIcon v-else class="w-3 h-3 absolute inset-0 m-auto text-gray-400" />
                </div>
                {{ getPetName(activeSession) }}
              </div>
              <div v-else class="flex items-center">
                <div class="flex relative w-5 h-5 mr-1">
                  <div 
                    v-for="(petIndex, photoIndex) in [0, 1].slice(0, Math.min(2, getPetCount(activeSession)))" 
                    :key="photoIndex"
                    class="absolute w-4 h-4 rounded-full border border-white bg-gray-100 overflow-hidden"
                    :style="{ left: `${photoIndex * 3}px`, zIndex: photoIndex + 1 }"
                  >
                    <img 
                      v-if="activeSession.petPhotos && activeSession.petPhotos[petIndex]"
                      :src="activeSession.petPhotos[petIndex]" 
                      :alt="activeSession.petNames ? activeSession.petNames[petIndex] : 'Pet'"
                      class="w-full h-full object-cover" 
                      @error="onPetImageError"
                    />
                    <PawPrintIcon v-else class="w-3 h-3 absolute inset-0 m-auto text-gray-400" />
                  </div>
                </div>
                {{ getPetCount(activeSession) }} Pets
              </div>
            </div>
            
            <!-- Connection status -->
            <div class="flex items-center">
              <span 
                class="w-2 h-2 rounded-full mr-1"
                :class="remoteStreamActive ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'"
              ></span>
              <span class="text-xs text-gray-600">{{ remoteStreamActive ? 'Connected' : 'Connecting...' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Desktop header (hidden on small screens) -->
        <div class="hidden sm:flex items-center justify-between">
          <!-- Left side: Title and patient info -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 truncate">
              {{ cleanTitle(activeSession.title) || 'Telehealth Appointment' }}
            </h2>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <!-- UPDATED: Doctor with profile image -->
              <span class="flex items-center">
                <div class="w-6 h-6 rounded-full overflow-hidden bg-blue-100 mr-2">
                  <img 
                    v-if="activeSession.doctorPhotoURL" 
                    :src="activeSession.doctorPhotoURL" 
                    :alt="activeSession.doctorName || 'Veterinarian'"
                    class="w-full h-full object-cover"
                    @error="onDoctorImageError"
                  />
                  <UserIcon v-else class="w-6 h-6 p-1 text-blue-600" />
                </div>
                {{ activeSession.doctorName || 'Veterinarian' }}
              </span>
            
              <!-- Pet display for desktop - Updated to match table style -->
              <div v-if="!hasPet(activeSession)" class="flex items-center">
                <PawPrintIcon class="w-4 h-4 mr-1" /> No Pet
              </div>
              <div v-else-if="!hasMultiplePets(activeSession)" class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6 mr-2 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img 
                    v-if="getPetImage(activeSession)"
                    :src="getPetImage(activeSession)" 
                    :alt="getPetName(activeSession)"
                    class="h-6 w-6 rounded-full object-cover" 
                    @error="onPetImageError"
                  />
                  <PawPrintIcon v-else class="w-4 h-4 text-gray-400" />
                </div>
                <span class="font-medium">
                  {{ getPetName(activeSession) }}
                  <span v-if="getPetSpecies(activeSession)" class="text-gray-500">({{ getPetSpecies(activeSession) }})</span>
                </span>
              </div>
              <div v-else class="flex items-center">
                <!-- Overlapping profile pictures for multiple pets -->
                <div class="flex mr-2 relative" style="width: 40px; height: 24px;">
                  <!-- Render in reverse order so first pet is at the back -->
                  <div 
                    v-for="(petIndex, photoIndex) in [...Array(Math.min(3, getPetCount(activeSession))).keys()].reverse()" 
                    :key="photoIndex"
                    class="absolute h-6 w-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                    :style="{ 
                      left: `${photoIndex * 10}px`, 
                      zIndex: photoIndex + 1
                    }"
                  >
                    <img 
                      v-if="activeSession.petPhotos && activeSession.petPhotos[petIndex]"
                      :src="activeSession.petPhotos[petIndex]" 
                      :alt="activeSession.petNames ? activeSession.petNames[petIndex] : 'Pet'"
                      class="h-6 w-6 rounded-full object-cover" 
                      @error="onPetImageError"
                    />
                    <PawPrintIcon v-else class="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <!-- Show +X more if there are more than 3 pets -->
                  <div 
                    v-if="getPetCount(activeSession) > 3" 
                    class="absolute h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                    :style="{ left: '20px', zIndex: 4 }"
                  >
                    +{{ getPetCount(activeSession) - 3 }}
                  </div>
                </div>
                
                <!-- Pet names by species groups -->
                <div v-for="(group, groupIndex) in getPetGroups(activeSession)" :key="groupIndex" class="mr-2">
                  <span class="font-medium">
                    <span v-if="group.indices.length <= 2">
                      {{ group.indices.map(idx => activeSession.petNames[idx]).join(', ') }}
                    </span>
                    <span v-else>
                      {{ group.indices.slice(0, 2).map(idx => activeSession.petNames[idx]).join(', ') }} 
                      +{{ group.indices.length - 2 }}
                    </span>
                    <span class="text-gray-500">({{ group.species }})</span>
                  </span>
                </div>
              </div>
            
              <span class="flex items-center"><ClockIcon class="w-4 h-4 mr-1" /> Time remaining: {{ remainingTime }}</span>
            </div>
          </div>
          
          <!-- Right side: Connection status and End Call button -->
          <div class="flex items-center">
            <div class="flex items-center mr-4">
              <span 
                class="w-2 h-2 rounded-full mr-2"
                :class="remoteStreamActive ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'"
              ></span>
              <span class="text-sm text-gray-600">{{ remoteStreamActive ? 'Connected' : 'Connecting...' }}</span>
            </div>
            <button 
              @click="endCall" 
              class="inline-flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-full hover:bg-red-700"
            >
              <PhoneOffIcon class="w-4 h-4 mr-1" />
              End Call
            </button>
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
                  <!-- UPDATED: Doctor profile image in waiting screen -->
                  <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    <img 
                      v-if="activeSession.doctorPhotoURL" 
                      :src="activeSession.doctorPhotoURL" 
                      :alt="activeSession.doctorName || 'Veterinarian'"
                      class="w-full h-full object-cover"
                      @error="onDoctorImageError"
                    />
                    <UserIcon v-else class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
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
          <!-- UPDATED: Doctor profile image in incoming call modal -->
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <img 
              v-if="incomingCall && incomingCall.callerPhotoURL" 
              :src="incomingCall.callerPhotoURL" 
              :alt="incomingCall.callerName || 'Doctor'"
              class="w-full h-full object-cover"
              @error="onDoctorImageError"
            />
            <PhoneIcon v-else class="w-10 h-10 text-green-600" />
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
import { usePetsStore } from "@/stores/modules/petsStore";
import { db } from '@shared/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, arrayUnion, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import WebRTCService from "@/services/webrtc-service";
import { parseISO, format, isToday, isFuture, addMinutes, subMinutes, isAfter, isBefore, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Router and stores
const router = useRouter();
const appointmentStore = useAppointmentStore();
const authStore = useAuthStore();
const serviceCategoryStore = useServiceCategoryStore();
const petsStore = usePetsStore();

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

const getStatusClass = (status) => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  switch (status?.toLowerCase()) {
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'processing':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'completed':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'cancelled':
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'ended':
      return `${baseClasses} bg-slate-200 text-slate-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

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

// Pet helper functions
const hasPet = (appointment) => {
  if (!appointment) return false;
  
  // Check for petIds array
  if (appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 0) {
    return true;
  }

  // Check for single petId
  if (appointment.petId && typeof appointment.petId === 'string' && appointment.petId.trim() !== '') {
    return true;
  }

  // Check for petName (as a fallback)
  if (appointment.petName && typeof appointment.petName === 'string' && appointment.petName.trim() !== '') {
    return true;
  }

  return false;
};

const hasMultiplePets = (appointment) => {
  if (!appointment) return false;
  return appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 1;
};

const getPetCount = (appointment) => {
  if (!appointment) return 0;
  
  if (appointment.petIds && Array.isArray(appointment.petIds)) {
    return appointment.petIds.length;
  } else if (appointment.petId || appointment.petName) {
    return 1;
  }
  return 0;
};

const getPetName = (appointment) => {
  if (!appointment) return 'Not specified';
  
  // If we have a direct pet name on the appointment
  if (appointment.petName && appointment.petName !== 'Not specified') {
    return appointment.petName;
  }
  
  // If we have multiple pet names, return the first one
  if (appointment.petNames && appointment.petNames.length > 0) {
    return appointment.petNames[0];
  }
  
  return 'Not specified';
};

const getPetSpecies = (appointment) => {
  if (!appointment) return '';
  
  // If we have a direct species on the appointment
  if (appointment.petSpecies) {
    return appointment.petSpecies;
  }
  
  // If we have multiple pet species, return the first one
  if (appointment.petSpeciesArray && appointment.petSpeciesArray.length > 0) {
    return appointment.petSpeciesArray[0];
  }
  
  return '';
};

const getPetImage = (appointment) => {
  if (!appointment) return null;
  
  // If we have a direct photo URL on the appointment
  if (appointment.petPhotoURL) {
    return appointment.petPhotoURL;
  }
  
  // If we have multiple pet photos, return the first one
  if (appointment.petPhotos && appointment.petPhotos.length > 0) {
    return appointment.petPhotos[0];
  }
  
  return null;
};

const getPetGroups = (appointment) => {
  if (!appointment || !appointment.petNames || !appointment.petSpeciesArray) {
    return [];
  }

  // Create a map to group pets by species
  const speciesGroups = new Map();

  // Process each pet
  appointment.petNames.forEach((name, index) => {
    const species = appointment.petSpeciesArray[index] || 'Unknown';

    // If this species doesn't exist in the map yet, create it
    if (!speciesGroups.has(species)) {
      speciesGroups.set(species, {
        species: species,
        indices: [], // Store the indices of pets in this group
        image: appointment.petPhotos && appointment.petPhotos[index] ? appointment.petPhotos[index] : null,
        name: name
      });
    }

    // Add this pet's index to the group
    speciesGroups.get(species).indices.push(index);
  });

  // Convert the map to an array
  return Array.from(speciesGroups.values());
};

const getPetList = (appointment) => {
  if (!appointment || !appointment.petNames) {
    return [];
  }
  
  const pets = [];
  
  appointment.petNames.forEach((name, index) => {
    pets.push({
      name: name,
      species: appointment.petSpeciesArray ? appointment.petSpeciesArray[index] : '',
      image: appointment.petPhotos ? appointment.petPhotos[index] : null
    });
  });
  
  return pets;
};

// Handle pet image loading errors
const onPetImageError = (event) => {
  // Replace with paw print icon or default pet image
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E';
};

// Handle doctor image loading errors
const onDoctorImageError = (event) => {
  // Replace with user icon or default doctor image
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="12" cy="8" r="5"/%3E%3Cpath d="M20 21a8 8 0 0 0-16 0"/%3E%3C/g%3E%3C/svg%3E';
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
  currentPage.value = 1;

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
    
    // Process each appointment to load pet data
    const dataFetchPromises = [];
    
    userAppointments.forEach(appointment => {
      // Handle multiple pets
      if (appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 0) {
        // Initialize arrays to store pet data
        appointment.petNames = [];
        appointment.petPhotos = [];
        appointment.petSpeciesArray = []; 
        
        // Fetch data for each pet
        appointment.petIds.forEach((petId, index) => {
          if (petId && typeof petId === 'string' && petId.trim() !== '') {
            const petPromise = petsStore.getPetById(authStore.user.userId, petId)
              .then(petData => {
                if (petData) {
                  // Add pet data to arrays
                  appointment.petNames[index] = petData.name || 'Unnamed Pet';
                  appointment.petPhotos[index] = petData.photoURL || null;
                  appointment.petSpeciesArray[index] = petData.species || '';
                  
                  // Set the first pet's data as the main pet data for backward compatibility
                  if (index === 0) {
                    appointment.petName = petData.name || 'Unnamed Pet';
                    appointment.petPhotoURL = petData.photoURL || null;
                    appointment.petSpecies = petData.species || '';
                  }
                }
              })
              .catch(error => {
                console.error(`Error fetching pet data for appointment ${appointment.id}, pet ${petId}:`, error);
              });
            
            dataFetchPromises.push(petPromise);
          }
        });
      } else if (appointment.petId) {
        // Handle single pet case
        const isValidPetId = typeof appointment.petId === 'string' && appointment.petId.trim() !== '';
        
        if (isValidPetId) {
          const petPromise = petsStore.getPetById(authStore.user.userId, appointment.petId)
            .then(petData => {
              if (petData) {
                appointment.petName = petData.name || 'Unnamed Pet';
                appointment.petPhotoURL = petData.photoURL || null;
                appointment.petSpecies = petData.species || '';
                
                // Initialize arrays for consistency
                appointment.petNames = [petData.name || 'Unnamed Pet'];
                appointment.petPhotos = [petData.photoURL || null];
                appointment.petSpeciesArray = [petData.species || ''];
              }
            })
            .catch(error => {
              console.error(`Error fetching pet data for appointment ${appointment.id}:`, error);
              // Set default pet data to prevent UI issues
              appointment.petPhotoURL = null;
              appointment.petSpecies = 'Unknown';
            });
          
          dataFetchPromises.push(petPromise);
        }
      }
      
      // Fetch doctor photo if doctorId is available
      if (appointment.doctorId) {
        const doctorPromise = getDoc(doc(db, 'users', appointment.doctorId))
          .then(docSnapshot => {
            if (docSnapshot.exists()) {
              const doctorData = docSnapshot.data();
              appointment.doctorPhotoURL = doctorData.photoURL || null;
              
              // Update doctor name if not already set
              if (!appointment.doctorName && (doctorData.firstName || doctorData.lastName)) {
                appointment.doctorName = `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim();
              }
            }
          })
          .catch(error => {
            console.error(`Error fetching doctor data for appointment ${appointment.id}:`, error);
          });
        
        dataFetchPromises.push(doctorPromise);
      }
    });
    
    // Wait for all pet and doctor data to be fetched
    await Promise.allSettled(dataFetchPromises);
    
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
    
    // Process each appointment to load pet data
    const dataFetchPromises = [];
    
    userAppointments.forEach(appointment => {
      // Handle multiple pets
      if (appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 0) {
        // Initialize arrays to store pet data
        appointment.petNames = [];
        appointment.petPhotos = [];
        appointment.petSpeciesArray = []; 
        
        // Fetch data for each pet
        appointment.petIds.forEach((petId, index) => {
          if (petId && typeof petId === 'string' && petId.trim() !== '') {
            const petPromise = petsStore.getPetById(authStore.user.userId, petId)
              .then(petData => {
                if (petData) {
                  // Add pet data to arrays
                  appointment.petNames[index] = petData.name || 'Unnamed Pet';
                  appointment.petPhotos[index] = petData.photoURL || null;
                  appointment.petSpeciesArray[index] = petData.species || '';
                  
                  // Set the first pet's data as the main pet data for backward compatibility
                  if (index === 0) {
                    appointment.petName = petData.name || 'Unnamed Pet';
                    appointment.petPhotoURL = petData.photoURL || null;
                    appointment.petSpecies = petData.species || '';
                  }
                }
              })
              .catch(error => {
                console.error(`Error fetching pet data for appointment ${appointment.id}, pet ${petId}:`, error);
              });
            
            dataFetchPromises.push(petPromise);
          }
        });
      } else if (appointment.petId) {
        // Handle single pet case
        const isValidPetId = typeof appointment.petId === 'string' && appointment.petId.trim() !== '';
        
        if (isValidPetId) {
          const petPromise = petsStore.getPetById(authStore.user.userId, appointment.petId)
            .then(petData => {
              if (petData) {
                appointment.petName = petData.name || 'Unnamed Pet';
                appointment.petPhotoURL = petData.photoURL || null;
                appointment.petSpecies = petData.species || '';
                
                // Initialize arrays for consistency
                appointment.petNames = [petData.name || 'Unnamed Pet'];
                appointment.petPhotos = [petData.photoURL || null];
                appointment.petSpeciesArray = [petData.species || ''];
              }
            })
            .catch(error => {
              console.error(`Error fetching pet data for appointment ${appointment.id}:`, error);
              // Set default pet data to prevent UI issues
              appointment.petPhotoURL = null;
              appointment.petSpecies = 'Unknown';
            });
          
          dataFetchPromises.push(petPromise);
        }
      }
      
      // Fetch doctor photo if doctorId is available
      if (appointment.doctorId) {
        const doctorPromise = getDoc(doc(db, 'users', appointment.doctorId))
          .then(docSnapshot => {
            if (docSnapshot.exists()) {
              const doctorData = docSnapshot.data();
              appointment.doctorPhotoURL = doctorData.photoURL || null;
              
              // Update doctor name if not already set
              if (!appointment.doctorName && (doctorData.firstName || doctorData.lastName)) {
                appointment.doctorName = `${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim();
              }
            }
          })
          .catch(error => {
            console.error(`Error fetching doctor data for appointment ${appointment.id}:`, error);
          });
        
        dataFetchPromises.push(doctorPromise);
      }
    });
    
    // Wait for all pet and doctor data to be fetched
    await Promise.allSettled(dataFetchPromises);

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
            }).catch(error => {
              console.error('Error updating connection state:', error);
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
        doctorName: incomingCall.value.callerName,
        doctorPhotoURL: incomingCall.value.callerPhotoURL
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
      async (callData) => {
        // Find the appointment details
        const appointment = sessions.value.find(s => s.id === callData.id);
        
        // FIXED: Fetch caller (vet) information if not already included
        if (callData.callerId && (!callData.callerName || !callData.callerPhotoURL)) {
          try {
            const callerDoc = await getDoc(doc(db, 'users', callData.callerId));
            if (callerDoc.exists()) {
              const callerData = callerDoc.data();
              callData.callerName = `${callerData.firstName || ''} ${callerData.lastName || ''}`.trim() || 'Veterinarian';
              callData.callerPhotoURL = callerData.photoURL || null;
            }
          } catch (error) {
            console.error('Error fetching caller info:', error);
          }
        }
        
        // Set the incoming call data
        incomingCall.value = {
          ...callData,
          appointment: appointment
        };
        
        // Play a ringtone
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.loop = true;
        audio.play().catch(error => {
          console.error('Error playing ringtone:', error);
        });
        
        // Store the audio element to stop it later
        incomingCall.value.ringtone = audio;
      },
      () => {
        // Call was cancelled by the caller
        if (incomingCall.value && incomingCall.value.ringtone) {
          incomingCall.value.ringtone.pause();
          incomingCall.value.ringtone = null;
        }
        incomingCall.value = null;
      }
    );
  } catch (error) {
    console.error('Error setting up incoming calls listener:', error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  // Initialize auth if needed
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  // Check for mobile view
  checkMobileView();
  window.addEventListener('resize', checkMobileView);

  // Initialize Lottie animations
  initializeLottieAnimations();

  // Start autoplay for carousel
  startAutoplay();

  // Setup network monitoring
  setupNetworkMonitoring();

  // Fetch sessions
  await refreshSessions();

  // Setup incoming calls listener
  setupIncomingCallsListener();

  // Watch for changes in the current slide
  watch(currentSlide, (newSlide, oldSlide) => {
    // Pause the old animation
    if (lottieInstances[oldSlide]) {
      lottieInstances[oldSlide].pause();
    }

    // Play the new animation
    if (lottieInstances[newSlide]) {
      lottieInstances[newSlide].play();
    }
  });

  // Watch for changes in the active session
  watch(activeSession, (newSession, oldSession) => {
    if (newSession) {
      // We have an active session, ensure we're in call view
      currentView.value = 'call';
    } else if (oldSession) {
      // We had an active session but now we don't, go back to sessions view
      currentView.value = 'sessions';
    }
  });

  // Watch for changes in chat messages to scroll to bottom
  watch(chatMessages, () => {
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
  });
});

onUnmounted(() => {
  // Clean up event listeners
  window.removeEventListener('resize', checkMobileView);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);

  // Stop autoplay
  stopAutoplay();

  // Clean up Lottie animations
  lottieInstances.forEach((instance) => {
    if (instance) {
      instance.destroy();
    }
  });

  // Clean up network monitoring
  if (networkStatusInterval) {
    clearInterval(networkStatusInterval);
  }

  // Clean up WebRTC
  WebRTCService.hangUp();

  // Clean up local stream
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
  }

  // Clean up incoming calls listener
  if (incomingCallsUnsubscribe) {
    incomingCallsUnsubscribe();
  }

  // Clean up chat messages subscription
  if (chatMessagesUnsubscribe) {
    chatMessagesUnsubscribe();
  }

  // Clean up appointment timer
  if (appointmentTimer) {
    clearInterval(appointmentTimer);
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