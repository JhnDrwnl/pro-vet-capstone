<!-- views/user/Appointments.vue -->
<template>
  <!-- Main wrapper with fixed height and no scrolling, aligned with sidebar -->
  <div class="h-screen flex flex-col bg-gray-50 -mt-4 md:mt-0">
    <!-- Fixed header with stepper - adjusted padding to align with sidebar -->
    <div class="bg-white shadow-lg rounded-2xl p-3 mb-2 mx-0 md:mx-4 mt-0">
      <div class="flex w-full justify-between items-start">
        <!-- Steps -->
        <div ref="stepsContainer" class="flex-1 flex justify-between relative px-1 md:px-8">
          <!-- Connector Line - Using dynamic positioning -->
          <div ref="connectorLine" class="absolute top-4 h-[2px] bg-gray-200">
            <div 
              class="h-full bg-[#2d80eb] transition-all duration-300"
              :style="{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }"
            ></div>
          </div>
      
          <!-- Steps - Make them clickable to navigate directly to that step -->
          <div 
            v-for="(step, index) in steps" 
            :key="step.id" 
            class="flex flex-col items-center relative cursor-pointer z-10 step-item"
            @click="goToStep(index)"
            :ref="el => { if (el) stepRefs[index] = el }"
          >
            <!-- Icon -->
            <div
              class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-200 step-circle"
              :class="[ 
                currentStepIndex > index ? 'bg-[#2d80eb] text-white' : 
                currentStepIndex === index ? 'bg-[#2d80eb] text-white' : 
                'bg-blue-100 text-blue-500' 
              ]"
            >
              <component 
                :is="currentStepIndex > index ? Check : step.icon" 
                class="w-3 h-3 md:w-4 md:h-4"
              />
            </div>
            
            <!-- Label -->
            <span 
              class="mt-1 text-[10px] md:text-xs font-medium"
              :class="[
                currentStepIndex >= index ? 'text-gray-900' : 'text-gray-400'
              ]"
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Content area with fixed height and no overflow on the container -->
    <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 flex-1 min-h-0 px-0 md:px-4 pb-4">
      <!-- Left Container - Scrollable content inside, not the container itself -->
      <!-- On mobile: Show only when showSecondColumn is false -->
      <div 
        class="w-full md:w-1/2 bg-blue-50 shadow-lg rounded-2xl overflow-hidden flex flex-col"
        v-show="!showSecondColumn || !isMobile"
      >
        <div class="p-2 md:p-4 space-y-3 md:space-y-4 overflow-y-auto flex-1">
          <div class="flex justify-between items-center">
            <h2 class="text-xl md:text-2xl font-semibold text-[#4B5563]">{{ currentStep.label }}</h2>
            
            <!-- Add a reset button for the current step -->
            <button 
              @click="resetCurrentStep" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <RefreshCw class="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
          <p class="text-sm text-[#4B5563] mb-4 md:mb-6">{{ currentStep.description }}</p>
      
          <!-- Service Selection -->
          <div v-if="currentStep.id === 'service'" class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="relative bg-white rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-md transition-all duration-200 cursor-pointer"
              :class="{ 'ring-2 ring-blue-500': selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              <!-- Image container taking full width - Updated with placeholder -->
              <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <img 
                  v-if="category.coverPhoto" 
                  :src="category.coverPhoto" 
                  :alt="category.name" 
                  class="w-full h-full object-cover"
                />
                <div 
                  v-else 
                  class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <ImageIcon class="w-12 h-12" />
                </div>
              </div>
              
              <!-- Content below image -->
              <div class="space-y-1 md:space-y-2">
                <h3 class="font-semibold text-gray-900 text-base md:text-lg">{{ category.name }}</h3>
                <p class="text-xs md:text-sm text-gray-500">{{ category.description }}</p>
              </div>
      
              <!-- Selection button -->
              <button 
                @click.stop="selectCategory(category.id)"
                class="absolute right-4 top-4 w-7 h-7 md:w-8 md:h-8 bg-orange-300 text-orange-900 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-500 transition-colors z-10"
              >
                <component :is="selectedCategory === category.id ? Check : Plus" class="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
      
          <!-- Pet Species Selection -->
          <div v-if="currentStep.id === 'pet'" class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div 
              v-for="species in petSpecies" 
              :key="species.id" 
              class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
              :class="{ 'ring-2 ring-blue-500': selectedSpecies === species.id }"
              @click="selectSpecies(species.id)"
            >
              <div class="p-3 md:p-4 flex flex-col items-center flex-grow">
                <div class="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mb-2 md:mb-3">
                  <img 
                    v-if="species.image" 
                    :src="species.image" 
                    :alt="species.name" 
                    class="w-full h-full object-cover"
                  />
                  <div 
                    v-else 
                    class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
                  >
                    <svg v-if="species.id === 'other'" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" class="text-gray-500">
                      <path fill="currentColor" d="M6 10.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m4.5 1.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0m6 0a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0"/>
                    </svg>
                    <ImageIcon v-else class="w-8 h-8" />
                  </div>
                </div>
                <h3 class="text-xs md:text-sm font-semibold text-center mb-1 md:mb-2">{{ species.name }}</h3>
                <p class="text-[10px] md:text-xs text-gray-500 text-center mb-2 md:mb-4">Common household pet</p>
              </div>
              <div class="flex justify-center items-center px-3 md:px-4 py-2 md:py-3 bg-gray-50 border-t border-gray-100">
                <button 
                  @click.stop="selectSpecies(species.id)"
                  class="p-1 md:p-2 rounded-full bg-green-500 hover:bg-green-800 transition-colors"
                >
                  <component :is="selectedSpecies === species.id ? Check : Plus" class="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
      
          <!-- Doctor List -->
          <div v-if="currentStep.id === 'doctor'" class="space-y-3">
            <!-- Loading state for veterinarians -->
            <div v-if="loadingVeterinarians" class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p class="ml-3 text-gray-600">Loading veterinarians...</p>
            </div>
            
            <!-- Error state -->
            <div v-else-if="veterinarianError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p class="text-red-600">{{ veterinarianError }}</p>
              <button 
                @click="fetchVeterinarians" 
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
            
            <!-- Empty state -->
            <div v-else-if="veterinarians.length === 0" class="bg-gray-50 rounded-lg p-6 text-center">
              <User2 class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-600 font-medium">No veterinarians available</p>
              <p class="text-sm text-gray-500 mt-1">Please try again later or contact the office</p>
            </div>
            
            <!-- Veterinarian list -->
            <div 
              v-else
              v-for="doctor in veterinarians" 
              :key="doctor.userId || doctor.id" 
              class="flex flex-col p-3 md:p-4 border rounded-2xl cursor-pointer transition-all duration-200"
              :class="[
                selectedDoctor === doctor
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-100 hover:border-blue-100 hover:bg-gray-50'
              ]"
              @click="selectDoctor(doctor)"
            >
              <div class="flex items-center mb-3">
                <!-- Doctor image with placeholder -->
                <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden">
                  <img
                    v-if="doctor.photoURL"
                    :src="processPhotoURL(doctor.photoURL)"
                    :alt="`Dr. ${doctor.firstName} ${doctor.lastName}`"
                    class="w-full h-full object-cover"
                    @error="handleImageError($event, doctor)"
                  />
                  <div 
                    v-else 
                    class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
                  >
                    <User2 class="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                </div>
                <div class="ml-3 md:ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-base md:text-lg font-semibold text-gray-900">
                      {{ `${getDoctorTitle(doctor)} ${doctor.firstName} ${doctor.lastName}` }}
                    </h3>
                  </div>
                  <p class="text-xs md:text-sm text-gray-500">{{ doctor.specialty || 'Veterinarian' }}</p>
                  <div class="flex items-center mt-1">
                    <Star 
                      v-for="i in 5" 
                      :key="i"
                      class="w-3 h-3 md:w-4 md:h-4"
                      :class="i <= (doctor.rating || 5) ? 'text-yellow-400' : 'text-gray-200'"
                      :fill="i <= (doctor.rating || 5) ? 'currentColor' : 'none'"
                    />
                    <span class="ml-1 text-xs md:text-sm text-gray-600">{{ doctor.rating || 5 }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Schedule/Availability Section -->
              <div class="mt-1 border-t border-gray-100 pt-3">
                <div class="flex items-center mb-2">
                  <CalendarDays class="w-4 h-4 text-blue-500 mr-2" />
                  <span class="text-sm font-medium text-gray-700">Schedule & Availability</span>
                </div>
                
                <!-- Schedule display -->
                <div class="text-xs text-gray-600 mb-2">
                  {{ doctor.schedule || 'Mon-Fri, 9:00 AM to 5:00 PM' }}
                </div>
                
                <!-- Availability indicators -->
                <div class="flex flex-wrap gap-1">
                  <!-- Parse the schedule to show availability for today -->
                  <div 
                    class="px-2 py-1 rounded-full text-xs"
                    :class="isDoctorAvailableToday(doctor) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'"
                  >
                    {{ isDoctorAvailableToday(doctor) ? 'Available Today' : 'Not Available Today' }}
                  </div>
                  
                  <!-- Show next available day if not available today -->
                  <div 
                    v-if="!isDoctorAvailableToday(doctor)"
                    class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                  >
                    Next Available: {{ getNextAvailableDay(doctor) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          <!-- Date and Time Selection -->
          <div v-if="currentStep.id === 'datetime'" class="space-y-3 md:space-y-4">
            <!-- Calendar Section -->
            <div class="bg-white rounded-lg shadow-lg p-3 md:p-4">
              <div class="flex justify-between items-center mb-3 md:mb-4 bg-blue-100 p-2 md:p-3 rounded-lg">
                <button @click="previousMonth" class="text-gray-600 hover:text-gray-800">
                  <ChevronLeft class="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <h3 class="text-base md:text-lg font-semibold">{{ currentMonthYear }}</h3>
                <button @click="nextMonth" class="text-gray-600 hover:text-gray-800">
                  <ChevronRight class="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              
              <!-- Calendar header (days of week) -->
              <div class="grid grid-cols-7 gap-1 md:gap-2 mb-1">
                <div 
                  v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
                  :key="day" 
                  class="text-center text-xs md:text-sm font-medium p-1 md:p-2"
                  :class="day === 'Sun' || day === 'Sat' ? 'text-red-500' : 'text-gray-500'"
                >
                  {{ day }}
                </div>
              </div>
              
              <!-- Calendar grid with proper sizing -->
              <div class="grid grid-cols-7 gap-1 md:gap-2">
                <!-- Empty cells for days before the month starts -->
                <div
                  v-for="emptyDay in startingDayOffset"
                  :key="'empty-' + emptyDay"
                  class="p-1 md:p-2 h-10 md:h-11"
                ></div>
                
                <!-- Calendar days with proper sizing and centered content -->
                <div
                  v-for="{ date, isCurrentMonth, isToday, isWeekend } in calendarDays"
                  :key="date.toISOString()"
                  class="relative h-10 md:h-11 mb-4"
                >
                  <!-- For available days - use button -->
                  <button
                    v-if="isCurrentMonth && isDayAvailable(date)"
                    @click="handleDateClick(date)"
                    class="w-full h-full flex items-center justify-center rounded-full text-xs md:text-sm"
                    :class="getDateClasses(date, isCurrentMonth, isToday, isWeekend)"
                  >
                    {{ date.getDate() }}
                    
                    <!-- Status indicator dot -->
                    <div 
                      v-if="getDayStatusIndicator(date)" 
                      class="absolute bottom-1 w-1.5 h-1.5 rounded-full" 
                      :class="getDayStatusIndicator(date)"
                    ></div>
                  </button>
                  
                  <!-- For unavailable days - use div instead of button -->
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center rounded-full text-xs md:text-sm cursor-not-allowed"
                    :class="getDateClasses(date, isCurrentMonth, isToday, isWeekend)"
                    @click="handleDateClick(date)"
                  >
                    {{ date.getDate() }}
                    
                    <!-- Status indicator dot -->
                    <div 
                      v-if="getDayStatusIndicator(date)" 
                      class="absolute bottom-1 w-1.5 h-1.5 rounded-full" 
                      :class="getDayStatusIndicator(date)"
                    ></div>
                  </div>
                  
                  <!-- Holiday name label - positioned below the date cell -->
                  <div 
                    v-if="getHolidayName(date) && isCurrentMonth" 
                    class="absolute top-full left-0 right-0 text-[8px] md:text-[9px] leading-tight px-1 truncate text-center mt-0.5"
                    :class="getHolidayTextClass(date)"
                  >
                    {{ getHolidayName(date) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Legend for calendar -->
            <div class="flex flex-wrap gap-4 mb-6 text-xs mt-4">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Available</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span>Holiday</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span>Special Hours</span>
              </div>
            </div>
      
            <!-- Time Selection -->
            <div class="space-y-3 md:space-y-4">
              <h3 class="text-base md:text-lg font-semibold text-gray-900">Select Time</h3>
              
              <!-- Loading state for time slots -->
              <div v-if="isLoadingTimeSlots" class="flex justify-center items-center py-6 bg-gray-50 rounded-lg">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p class="ml-3 text-gray-600 text-sm">Loading available times...</p>
              </div>
              
              <!-- No services selected message -->
              <div v-else-if="selectedServices.length === 0" class="text-center py-3 md:py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-xs md:text-sm text-yellow-700">Please select a service first to see available time slots.</p>
              </div>
              
              <!-- Current day's schedule is closed message -->
              <div v-else-if="isCurrentDayScheduleClosed" class="text-center py-6 md:py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Clock class="mx-auto h-8 w-8 md:h-10 md:w-10 text-gray-400 mb-2" />
                <p class="text-sm md:text-base font-medium text-gray-700">Appointment schedule for today is closed</p>
                <p class="mt-1 text-xs md:text-sm text-gray-500">
                  Office hours are from {{ formatOfficeHours.openTime }} to {{ formatOfficeHours.closeTime }}
                </p>
                <p class="mt-2 text-xs md:text-sm text-gray-500">Please select another date for your appointment</p>
              </div>
              
              <!-- No time slots available message -->
              <div v-else-if="availableTimeSlots.length === 0" class="text-center py-6 md:py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Clock class="mx-auto h-8 w-8 md:h-10 md:w-10 text-gray-400 mb-2" />
                <p class="text-sm md:text-base font-medium text-gray-700">No available time slots</p>
                <p class="mt-1 text-xs md:text-sm text-gray-500">
                  Please select another date for your appointment
                </p>
              </div>
              
              <!-- Time slots grid -->
              <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  v-for="timeSlot in availableTimeSlots"
                  :key="timeSlot.startTime"
                  @click="selectTime(timeSlot.timeRange)"
                  :disabled="timeSlot.isBooked"
                  class="p-2 md:p-3 rounded-lg text-center flex flex-col items-center"
                  :class="[
                    selectedTime === timeSlot.timeRange ? 'bg-blue-500 text-white' : 
                    timeSlot.isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  ]"
                >
                  <span class="text-xs md:text-sm font-medium">{{ timeSlot.timeRange }}</span>
                  <span v-if="timeSlot.isBooked" class="text-[10px] md:text-xs mt-1 text-red-400">Booked</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      
        <!-- Navigation Buttons for First Column (Mobile) -->
        <div class="p-3 md:p-4 bg-blue-50 border-t border-blue-100" v-if="isMobile">
          <div class="flex justify-between">
            <!-- Back button for mobile first column -->
            <button
              v-if="currentStepIndex > 0"
              @click="previousStep"
              class="px-4 md:px-6 py-2 text-xs md:text-sm bg-gray-300 font-medium rounded-full text-[#4B5563] hover:bg-gray-100"
            >
              Back
            </button>
            
            <!-- Continue button for mobile first column -->
            <button
              v-if="currentStepIndex < steps.length - 1"
              @click="nextStep"
              :disabled="isLoading"
              class="ml-auto px-4 md:px-6 py-2 text-xs md:text-sm font-medium bg-blue-300 text-blue-800 rounded-full"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      
      <!-- Right Container - Scrollable content inside, not the container itself -->
      <!-- On mobile: Show only when showSecondColumn is true -->
      <div 
        class="w-full md:w-1/2 bg-blue-50 shadow-lg rounded-2xl overflow-hidden flex flex-col"
        v-show="showSecondColumn || !isMobile"
      >
        <div class="p-3 md:p-6 overflow-y-auto flex-1">
          <div v-if="!selectedCategory && !selectedPet && !selectedDoctor && !selectedDate" class="flex flex-col items-center justify-center h-full">
            <img 
              :src="docuImage" 
              alt="Elective Appointment" 
              class="w-48 h-48 md:w-64 md:h-64 object-cover"
            />
            <p class="text-xs md:text-sm text-gray-500 text-center">Select options on the left to see your appointment details here.</p>
          </div>
      
          <!-- Service Details - Updated with equal spacing from top and sides -->
          <div v-else-if="currentStep.id === 'service' && selectedCategory" class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div 
              v-for="service in filteredServices" 
              :key="service.id"
              class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
              :class="{ 'ring-2 ring-blue-500': selectedServices.includes(service.id) }"
            >
              <!-- Updated image container with equal padding on top and sides -->
              <div class="p-3 pt-3">
                <div class="w-full aspect-[4/3] rounded-lg overflow-hidden">
                  <img 
                    v-if="service.coverPhoto" 
                    :src="service.coverPhoto" 
                    :alt="service.name" 
                    class="w-full h-full object-cover"
                  />
                  <div 
                    v-else 
                    class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
                  >
                    <ImageIcon class="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <!-- Content below image -->
              <div class="px-3 pb-2 flex flex-col items-center">
                <h3 class="text-xs md:text-sm font-semibold text-center mb-1">{{ service.name }}</h3>
                <p v-if="service.processingTime" class="text-[10px] md:text-xs text-blue-600 font-medium">
                  {{ service.processingTime }}
                </p>
              </div>
              
              <div class="flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-gray-100 mt-auto">
                <span class="text-xs md:text-sm font-semibold">{{ service.fees || 'Free' }}</span>
                <button 
                  @click="toggleService(service.id)"
                  class="p-1 md:p-2 rounded-full bg-green-500 hover:bg-green-700 transition-colors"
                >
                  <component :is="selectedServices.includes(service.id) ? Check : Plus" class="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
      
          <!-- Pet Selection - MODIFIED FOR MULTIPLE SELECTION -->
          <div v-else-if="currentStep.id === 'pet' && selectedSpecies" class="space-y-4">
            <!-- User's pets section -->
            <div v-if="userPets.length > 0">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold text-gray-900">Your Pets</h3>
                
                <!-- Show selected count -->
                <span v-if="selectedPets.length > 0" class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {{ selectedPets.length }} selected
                </span>
              </div>
              
              <!-- No pets of selected species message -->
              <div v-if="filteredUserPets.length === 0" class="bg-white rounded-lg p-4 text-center">
                <PawPrint class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-600">You don't have any {{ getSpeciesName(selectedSpecies) }} pets registered.</p>
                <p class="text-sm text-gray-500 mt-1">Would you like to add one?</p>
                <button 
                  @click="goToAddPet" 
                  class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                >
                  Add New Pet
                </button>
              </div>
              
              <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div 
                  v-for="pet in filteredUserPets" 
                  :key="pet.id" 
                  class="bg-white px shadow-lg rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  :class="{ 'ring-2 ring-blue-500': isPetSelected(pet) }"
                  @click="togglePetSelection(pet)"
                >
                  <div class="bg-gradient-to-b from-emerald-400 to-emerald-300 h-24 md:h-28 relative">
                    <div class="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                      <!-- Perfect circle container with consistent dimensions -->
                      <div class="bg-white rounded-full p-1.5 shadow-lg" style="aspect-ratio: 1/1;">
                        <!-- Pet image container - perfectly circular -->
                        <div class="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden" style="aspect-ratio: 1/1;">
                          <img 
                            v-if="pet.photoURL || pet.image" 
                            :src="pet.photoURL || pet.image" 
                            :alt="pet.name" 
                            class="w-full h-full object-cover"
                          />
                          <div 
                            v-else 
                            class="w-full h-full bg-emerald-100 flex items-center justify-center"
                          >
                            <PawPrint class="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Selection indicator -->
                    <div 
                      v-if="isPetSelected(pet)"
                      class="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-md"
                    >
                      <Check class="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                  </div>
                  <div class="pt-10 md:pt-14 pb-3 md:pb-4 px-2 md:px-3">
                    <div class="text-center mb-2 md:mb-3">
                      <h3 class="text-base md:text-xl font-semibold text-gray-900 break-words">{{ pet.name }}</h3>
                      <p class="text-xs text-gray-500">{{ pet.species }}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-1 text-[10px] md:text-xs">
                      <div class="px-2 md:px-4 text-center">
                        <span class="block text-gray-500">Breed</span>
                        <span class="font-medium text-gray-900 break-words">{{ pet.breed || 'Unknown' }}</span>
                      </div>
                      <div class="px-2 md:px-4 text-center">
                        <span class="block text-gray-500">Age</span>
                        <span class="font-medium text-gray-900 break-words">{{ formatPetAge(pet) }}</span>
                      </div>
                      <div class="px-2 md:px-4 text-center">
                        <span class="block text-gray-500">Weight</span>
                        <span class="font-medium text-gray-900 break-words">{{ pet.weight ? `${pet.weight} kg` : 'Unknown' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No pets section - Show Add New Pet button for users with no pets -->
            <div v-else class="bg-white rounded-lg p-6 text-center">
              <PawPrint class="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-700 font-medium">You don't have any pets registered</p>
              <p class="text-sm text-gray-500 mt-2 mb-4">Add a pet to book an appointment</p>
              <button 
                @click="goToAddPet" 
                class="px-6 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                Add New Pet
              </button>
            </div>
          </div>
      
          <!-- Doctor Information -->
          <div v-else-if="currentStep.id === 'doctor' && selectedDoctor" class="space-y-4 md:space-y-6">
            <div class="flex flex-col items-center">
              <!-- Updated doctor image with placeholder -->
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden mb-3 md:mb-4">
                <img 
                  v-if="selectedDoctor.photoURL" 
                  :src="processPhotoURL(selectedDoctor.photoURL)" 
                  :alt="`${selectedDoctor.firstName} ${selectedDoctor.lastName}`"
                  class="w-full h-full object-cover"
                  @error="handleImageError($event, selectedDoctor)"
                />
                <div 
                  v-else 
                  class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500"
                >
                  <User2 class="w-10 h-10 md:w-12" />
                </div>
              </div>
              <h2 class="text-xl md:text-2xl font-semibold text-gray-900">
                {{ getDoctorTitle(selectedDoctor) }} {{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}
              </h2>
              <p class="text-sm md:text-base text-gray-500">{{ selectedDoctor.specialty || 'Veterinarian' }}</p>
              <div class="flex items-center mt-1">
                <span class="text-xs md:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full" v-if="selectedDoctor.experience">
                  {{ selectedDoctor.experience }} years experience
                </span>
              </div>
            </div>
            
            <!-- Schedule & Availability Section -->
            <div class="bg-white rounded-xl p-4 shadow-md">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CalendarDays class="w-5 h-5 text-blue-600 mr-2" />
                Schedule & Availability
              </h3>
              
              <div class="space-y-3">
                <!-- Regular schedule -->
                <div class="flex items-start">
                  <Clock class="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p class="text-sm font-medium text-gray-700">Regular Hours</p>
                    <p class="text-sm text-gray-600">{{ selectedDoctor.schedule || 'Mon-Fri, 9:00 AM to 5:00 PM' }}</p>
                  </div>
                </div>
                
                <!-- Current availability status -->
                <div class="flex items-start">
                  <div 
                    class="w-5 h-5 rounded-full mr-2 mt-0.5 flex items-center justify-center"
                    :class="isDoctorAvailableToday(selectedDoctor) ? 'bg-green-100' : 'bg-red-100'"
                  >
                    <div 
                      class="w-3 h-3 rounded-full"
                      :class="isDoctorAvailableToday(selectedDoctor) ? 'bg-green-500' : 'bg-red-500'"
                    ></div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-700">Current Status</p>
                    <p 
                      class="text-sm"
                      :class="isDoctorAvailableToday(selectedDoctor) ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ isDoctorAvailableToday(selectedDoctor) ? 'Available Today' : 'Not Available Today' }}
                    </p>
                  </div>
                </div>
                
                <!-- Next available day if not available today -->
                <div v-if="!isDoctorAvailableToday(selectedDoctor)" class="flex items-start">
                  <CalendarDays class="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p class="text-sm font-medium text-gray-700">Next Available</p>
                    <p class="text-sm text-blue-600">{{ getNextAvailableDay(selectedDoctor) }}</p>
                  </div>
                </div>
                
                <!-- Weekly availability calendar -->
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <p class="text-sm font-medium text-gray-700 mb-2">Weekly Availability</p>
                  <div class="grid grid-cols-7 gap-1">
                    <div 
                      v-for="(day, index) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
                      :key="day"
                      class="flex flex-col items-center"
                    >
                      <span class="text-xs text-gray-500 mb-1">{{ day }}</span>
                      <div 
                        class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        :class="isDoctorAvailableOnDay(selectedDoctor, index) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'"
                      >
                        {{ isDoctorAvailableOnDay(selectedDoctor, index) ? '✓' : '✕' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Biography</h3>
              <div class="text-xs md:text-sm text-gray-600 leading-relaxed">
                <p v-if="!isExpanded && getBiographyText(selectedDoctor).length > 150">
                  {{ getBiographyText(selectedDoctor).substring(0, 150) }}...
                  <button 
                    @click="isExpanded = true" 
                    class="text-blue-500 hover:text-blue-600 text-xs md:text-sm font-medium ml-1"
                  >
                    Read more
                  </button>
                </p>
                <p v-else>
                  {{ getBiographyText(selectedDoctor) }}
                  <button 
                    v-if="isExpanded && getBiographyText(selectedDoctor).length > 150" 
                    @click="isExpanded = false" 
                    class="text-blue-500 hover:text-blue-600 text-xs md:text-sm font-medium ml-1"
                  >
                    Show less
                  </button>
                </p>
              </div>
            </div>
      
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Location</h3>
              <div class="relative h-36 md:h-48 rounded-xl overflow-hidden">
                <!-- Google Maps integration when doctor has location -->
                <div v-if="hasLocation && !mapError" ref="mapContainer" class="w-full h-full"></div>
                
                <!-- Default map when no location is specified -->
                <div v-else class="w-full h-full">
                  <iframe
                    class="w-full h-full rounded-xl"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.1133764799847!2d121.17753535223962!3d13.405483407767067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bce8c944c00001%3A0xc1737c53b71c753c!2sOriental%20Mindoro%20Provincial%20Capitol!5e0!3m2!1sen!2sph!4v1739966044972!5m2!1sen!2sph"
                    frameborder="0"
                    style="border:0;"
                    allowfullscreen
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                <!-- View larger map button - fixed size across all screens -->
                <button 
                  @click="openLargerMap" 
                  class="absolute top-3 right-3 bg-white py-1 px-2 rounded-lg shadow-md text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <MapPin class="w-3 h-3 mr-1" />
                  View larger map
                </button>
                
                <!-- Location label - fixed width percentage and consistent styling across screens -->
                <div class="absolute top-3 left-3 bg-white py-1 px-2 rounded-lg shadow-md" style="width: 45%;">
                  <p class="text-xs text-gray-900 break-words">
                    {{ selectedDoctor?.address || selectedDoctor?.city || 'Oriental Mindoro Provincial Capitol' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
      
          <!-- Appointment Summary - MODIFIED FOR MULTIPLE PETS -->
          <div v-else-if="currentStep.id === 'datetime'" class="space-y-4 md:space-y-6">
            <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Appointment Summary</h2>
      
            <div class="rounded-xl space-y-3 md:space-y-4">
              <div v-if="selectedServices.length > 0" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-blue-100 rounded-full p-1 md:p-2">
                  <Stethoscope class="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-gray-500">Services</p>
                  <div>
                    <p v-for="serviceId in selectedServices" :key="serviceId" class="text-base md:text-lg font-semibold text-gray-900">
                      {{ getServiceNameWithDuration(serviceId) }}
                    </p>
                  </div>
                </div>
                <!-- Add edit button to go back to service step -->
                <button 
                  @click="goToStep(0)" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <Edit class="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              
              <!-- Estimated Duration -->
              <div v-if="selectedServices.length > 0 && totalDurationMinutes > 0" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-purple-100 rounded-full p-1 md:p-2">
                  <Clock class="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <p class="text-sm md:text-base font-medium text-gray-500">Estimated Duration</p>
                  <p class="text-base md:text-xl font-semibold text-gray-900">{{ formatTotalDuration(totalDurationMinutes) }}</p>
                </div>
              </div>
              
              <!-- Multiple Pets Section - MODIFIED: Removed X buttons -->
              <div v-if="selectedPets.length > 0" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-green-100 rounded-full p-1 md:p-2">
                  <PawPrint class="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-gray-500">Pets ({{ selectedPets.length }})</p>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <div 
                      v-for="pet in selectedPets" 
                      :key="pet.id"
                      class="flex items-center bg-green-50 rounded-full px-2 py-1"
                    >
                      <span class="text-sm font-medium text-green-800">{{ pet.name }}</span>
                    </div>
                  </div>
                </div>
                <!-- Add edit button to go back to pet step -->
                <button 
                  @click="goToStep(1)" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <Edit class="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              
              <div v-if="selectedDoctor" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-purple-100 rounded-full p-1 md:p-2">
                  <User2 class="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-gray-500">Doctor</p>
                  <p class="text-base md:text-xl font-semibold text-gray-900">
                    {{ `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}` }}
                  </p>
                </div>
                <!-- Add edit button to go back to doctor step -->
                <button
                  @click="goToStep(2)" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <Edit class="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div v-if="selectedDate" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-red-100 rounded-full p-1 md:p-2">
                  <Calendar class="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-gray-500">Date</p>
                  <p class="text-base md:text-xl font-semibold text-gray-900">{{ formatDate(selectedDate) }}</p>
                </div>
                <!-- Add edit button to go back to datetime step -->
                <button 
                  @click="goToStep(3)" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <Edit class="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div v-if="selectedTime" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-yellow-100 rounded-full p-1 md:p-2">
                  <Clock class="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-gray-500">Time</p>
                  <p class="text-base md:text-xl font-semibold text-gray-900">
                    {{ selectedTime }}
                  </p>
                </div>
                <!-- Add edit button to go back to datetime step -->
                <button 
                  @click="goToStep(3)" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <Edit class="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
      
            <!-- Book Button -->
            <button
              v-if="canBook"
              @click="bookAppointment"
              :disabled="isLoading"
              class="w-full mt-4 md:mt-6 px-4 md:px-6 py-3 md:py-4 text-lg md:text-xl font-bold bg-blue-600 shadow-lg text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Book Appointment
            </button>
      
            <div 
              v-if="currentStep.id === 'datetime' && !canBook"
              class="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500"
            >
              Please select a date and time to book your appointment
            </div>
          </div>
        </div>
      
        <!-- Navigation Buttons - For desktop and mobile second column -->
        <div class="p-3 md:p-4 bg-blue-50 border-t border-blue-100">
          <div class="flex justify-between">
            <!-- Back button for mobile second column view -->
            <button
              v-if="isMobile"
              @click="showSecondColumn = false"
              class="px-4 md:px-6 py-2 text-xs md:text-sm bg-gray-300 font-medium rounded-full text-[#4B5563] hover:bg-gray-100"
            >
              Back
            </button>
            
            <!-- Back button for desktop view -->
            <button
              v-if="!isMobile && currentStepIndex > 0"
              @click="previousStep"
              class="px-4 md:px-6 py-2 text-xs md:text-sm bg-gray-300 font-medium rounded-full text-[#4B5563] hover:bg-gray-100"
            >
              Back
            </button>
            
            <!-- Continue button for both views -->
            <button
              v-if="currentStepIndex < steps.length - 1"
              @click="nextStep"
              :disabled="!canProceed || isLoading"
              class="ml-auto px-4 md:px-6 py-2 text-xs md:text-sm font-medium bg-blue-300 text-blue-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl p-6 md:p-8 max-w-md w-full mx-4 transform transition-all">
      <div class="flex flex-col items-center text-center">
        <div class="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
          <Check class="w-6 h-6 md:w-8 md:h-8 text-green-600" />
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
        <p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          Your appointment has been successfully booked. We look forward to seeing you and your pets on {{ selectedBookingDetails.formattedDate }} at {{ selectedBookingDetails.time }}.
        </p>
        <div class="bg-gray-50 rounded-lg p-3 md:p-4 w-full mb-4 md:mb-6">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Services:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ selectedBookingDetails.services.join(', ') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Pets:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ selectedBookingDetails.petNames.join(', ') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Doctor:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ selectedBookingDetails.doctorName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Duration:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ formatTotalDuration(selectedBookingDetails.duration) }}</span>
            </div>
          </div>
        </div>
        <button 
          @click="closeSuccessModal" 
          class="w-full py-2 md:py-3 px-3 md:px-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  </div>
  
  <!-- Weekend Modal -->
  <div v-if="showWeekendModalState" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl p-4 md:p-6 max-w-md w-full mx-4 transform transition-all">
      <div class="flex flex-col items-center text-center">
        <div class="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
          <component :is="modalIcon" class="w-6 h-6 md:w-8 md:h-8 text-red-600" />
        </div>
        <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2">{{ modalTitle }}</h2>
        <p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          {{ modalMessage }}
        </p>
        <button 
          @click="closeWeekendModal" 
          class="w-full py-2 md:py-3 px-3 md:px-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
        >
          Understood
        </button>
      </div>
    </div>
  </div>
  
  <!-- Loading Spinner for initial data loading and when clicking Continue -->
  <LoadingSpinner v-if="initialLoading || isLoading" isOverlay :text="initialLoading ? 'Loading data...' : 'Processing...'" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount, onBeforeUnmount, nextTick } from "vue"
import { useRouter } from "vue-router"
import {
  Stethoscope,
  User2,
  Clock,
  CalendarDays,
  PawPrint,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Check,
  Edit,
  RefreshCw,
  Image as ImageIcon,
  MapPin,
  AlertTriangle,
  AlertCircle,
} from "lucide-vue-next"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  parse,
  addMinutes,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  isToday,
  isSameDay,
  addDays,
  getDay,
} from "date-fns"
import docuImage from "@/assets/media/images/appointment/docu.png"
import { useServiceCategoryStore } from "@/stores/modules/ServiceCategoryStore"
import { usePetsStore } from "@/stores/modules/petsStore"
import { useAuthStore } from "@/stores/modules/authStore"
import { useProfileStore } from "@/stores/modules/profileStore"
import { useOfficeStore } from "@/stores/modules/officeStore"
import { useAppointmentStore } from "@/stores/modules/appointmentStore"
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"
import dogImage from "@/assets/media/images/appointment/Dog.png"
import catImage from "@/assets/media/images/appointment/Cat.png"
import birdImage from "@/assets/media/images/appointment/Bird.png"
import reptilesImage from "@/assets/media/images/appointment/Reptiles.png"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"

// Define props to accept isSidebarOpen from parent component
const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
})

const db = getFirestore()
const router = useRouter()
const categoryStore = useServiceCategoryStore()
const petsStore = usePetsStore()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const officeStore = useOfficeStore()
const appointmentStore = useAppointmentStore()

// Google Maps API Key
const mapApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""

// User pets
const userPets = ref([])

// Mobile view state
const isMobile = ref(false)
const showSecondColumn = ref(false)

// Loading states
const isLoading = ref(false)
const initialLoading = ref(true)
const loadingVeterinarians = ref(false)
const veterinarianError = ref(null)
const isLoadingTimeSlots = ref(false) // Add this for time slots loading state

// Veterinarians state
const veterinarians = ref([])

// Map container and state
const mapContainer = ref(null)
const mapError = ref(false)
const map = ref(null)
const marker = ref(null)
const hasLocation = ref(false)
const isMapInitialized = ref(false)

// Modal state for unavailable days
const modalTitle = ref("Office Closed")
const modalMessage = ref("Provincial Veterinary Office is closed on this day. Please select another date.")
const modalIcon = ref(Calendar)
const modalIconClass = ref("bg-red-100")
const modalIconColor = ref("text-red-600")
const selectedDateForModal = ref(null)

// Default coordinates for Provincial Veterinary Office
const defaultCoordinates = { lat: 13.405483407767067, lng: 121.1775353522396 }

// Google variable declaration for global scope
let google = window.google || {}

// Function to clean up the map
const cleanupMap = () => {
  if (map.value) {
    // Remove the marker from the map
    if (marker.value) {
      marker.value.setMap(null)
      marker.value = null
    }

    // Clear any event listeners or other resources
    map.value = null
  }
  isMapInitialized.value = false
}

// Function to initialize the map
const initMap = () => {
  if (!mapContainer.value) return

  try {
    // Clean up any existing map instance
    cleanupMap()

    // Check if the doctor has a location
    hasLocation.value = !!(selectedDoctor.value && (selectedDoctor.value.address || selectedDoctor.value.city))

    // If no location and no map container, exit early
    if (!hasLocation.value && !mapContainer.value) return

    // Get the address to geocode
    const address = selectedDoctor.value?.address
      ? `${selectedDoctor.value.address}, ${selectedDoctor.value.city || ""}, ${selectedDoctor.value.province || ""}, ${selectedDoctor.value.country || ""}`.trim()
      : selectedDoctor.value?.city
        ? `${selectedDoctor.value.city}, ${selectedDoctor.value.province || ""}, ${selectedDoctor.value.country || ""}`.trim()
        : "Provincial Veterinary Office"

    // Ensure google is available before using it
    if (typeof google === "undefined" || !google.maps) {
      console.error("Google Maps API not loaded")
      mapError.value = true
      return
    }

    // Create the map
    const mapOptions = {
      zoom: 14,
      center: defaultCoordinates,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    }

    // Create a new map instance
    map.value = new google.maps.Map(mapContainer.value, mapOptions)

    // Create a marker
    marker.value = new google.maps.Marker({
      position: defaultCoordinates,
      map: map.value,
      title: address,
      animation: google.maps.Animation.DROP,
    })

    // Try to geocode the address to get precise coordinates
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location
        map.value.setCenter(location)
        marker.value.setPosition(location)
      }
    })

    mapError.value = false
    isMapInitialized.value = true
    console.log("Map initialized for doctor:", selectedDoctor.value?.firstName, selectedDoctor.value?.lastName)
  } catch (error) {
    console.error("Error initializing map:", error)
    mapError.value = true
    hasLocation.value = false
  }
}

// Function to load the Google Maps API
const loadGoogleMapsApi = () => {
  if (!mapApiKey) {
    mapError.value = true
    return
  }

  // Check if the doctor has a location
  hasLocation.value = !!(selectedDoctor.value && (selectedDoctor.value.address || selectedDoctor.value.city))

  // If Google Maps API is already loaded, initialize the map directly
  if (typeof google !== "undefined" && google.maps) {
    nextTick(() => {
      initMap()
    })
    return
  }

  // If the API is not loaded yet, load it
  const script = document.createElement("script")
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&callback=initGoogleMap`
  script.async = true
  script.defer = true

  // Define the callback function
  window.initGoogleMap = () => {
    nextTick(() => {
      initMap()
    })
  }

  // Handle script loading error
  script.onerror = () => {
    console.error("Failed to load Google Maps API")
    mapError.value = true
  }

  document.head.appendChild(script)
}

// Function to open a larger map in a new tab
const openLargerMap = () => {
  let mapUrl

  if (selectedDoctor.value && (selectedDoctor.value.address || selectedDoctor.value.city)) {
    const address = selectedDoctor.value.address
      ? `${selectedDoctor.value.address}, ${selectedDoctor.value.city || ""}, ${selectedDoctor.value.province || ""}, ${selectedDoctor.value.country || ""}`.trim()
      : selectedDoctor.value.city
        ? `${selectedDoctor.value.city}, ${selectedDoctor.value.province || ""}, ${selectedDoctor.value.country || ""}`.trim()
        : "Provincial Veterinary Office"

    mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  } else {
    // Default to the provided coordinates
    mapUrl = `https://www.google.com/maps?ll=${defaultCoordinates.lat},${defaultCoordinates.lng}&z=16&t=m&hl=en&gl=PH&mapclient=embed`
  }

  window.open(mapUrl, "_blank")
}

// Helper methods for photo URLs
const isGooglePhotoURL = (url) => {
  return url && url.startsWith("https://lh3.googleusercontent.com")
}

const isFirebaseStorageURL = (url) => {
  return url && url.startsWith("https://firebasestorage.googleapis.com")
}

const getProxyPhotoURL = (originalURL) => {
  if (!originalURL || !isGooglePhotoURL(originalURL)) {
    return originalURL
  }

  // Use the API endpoint to proxy the Google photo
  return `/api/profile/photo-proxy?url=${encodeURIComponent(originalURL)}`
}

// Process photo URL based on its source
const processPhotoURL = (url) => {
  if (!url) return ""

  // For Google photos, use a proxy URL
  if (isGooglePhotoURL(url)) {
    return getProxyPhotoURL(url)
  }

  // For all other photos, return as is
  return url
}

// Handle image loading errors
const handleImageError = (event, doctor) => {
  console.log(`Image error for doctor: ${doctor.firstName} ${doctor.lastName}`)
  // Set the doctor's photoURL to null to show the placeholder instead
  if (doctor) {
    doctor.photoURL = null
  }
}

// Function to handle map errors
const handleMapError = () => {
  mapError.value = true
  hasLocation.value = false
}

// Check if the screen is mobile size
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // 768px is the md breakpoint in Tailwind
}

// Initialize mobile detection
onBeforeMount(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

// Clean up event listener
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile)
  cleanupMap()
})

// Fetch office hours data
const fetchOfficeHours = async () => {
  try {
    await officeStore.fetchOfficeHours()
    await officeStore.fetchHolidays()
  } catch (error) {
    console.error("Error fetching office hours:", error)
  }
}

// Helper function to format a Date to YYYY-MM-DD in local timezone
const formatDateToLocalISOString = (date) => {
  if (!date) return ""

  // Get year, month, and day in local timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  // Return YYYY-MM-DD format
  return `${year}-${month}-${day}`
}

// Helper function to check holiday status
const checkHolidayStatus = (dateString) => {
  if (!officeStore || !officeStore.holidays) return null

  // Check for exact date match or recurring yearly match
  const holiday = officeStore.holidays.find((h) => {
    // Get just the date part from the holiday date
    const holidayDateStr = h.date.split("T")[0]

    // Check for exact date match (string comparison)
    if (holidayDateStr === dateString) {
      console.log(`Found holiday for ${dateString}:`, h.name, h.type)
      return true
    }

    // For recurring yearly holidays, compare month and day
    if (h.isRecurringYearly) {
      // Create Date objects with noon time to avoid timezone issues
      const checkDate = new Date(dateString + "T12:00:00")
      const holidayDate = new Date(holidayDateStr + "T12:00:00")

      const isMatch = checkDate.getMonth() === holidayDate.getMonth() && checkDate.getDate() === holidayDate.getDate()
      if (isMatch) {
        console.log(`Found recurring yearly holiday for ${dateString}:`, h.name, h.type)
      }
      return isMatch
    }

    return false
  })

  return holiday || null
}

// Function to get the holiday name for a date
const getHolidayName = (date) => {
  if (!date || !officeStore || !officeStore.holidays) return null

  // Convert the date to YYYY-MM-DD format in local timezone
  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)

  if (holiday) {
    return holiday.name
  }

  return null
}

// Function to check if today is a holiday or has special hours
const isTodayWithSpecialHours = (date) => {
  if (!date || !officeStore || !officeStore.holidays) return false

  // Check if the date is today
  if (!isToday(date)) return false

  // Convert the date to YYYY-MM-DD format in local timezone
  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)

  // Return true if today is a holiday or has special hours
  return !!holiday
}

// Function to get the appropriate text class for holiday names
const getHolidayTextClass = (date) => {
  if (!date || !officeStore || !officeStore.holidays) return ""

  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)

  if (holiday) {
    if (holiday.type === "holiday" || holiday.type === "maintenance") {
      return "text-red-500 font-semibold"
    } else if (holiday.type === "special-hours") {
      return "text-yellow-600 font-semibold"
    }
  }

  return ""
}

// Function to check if a day is available for appointments
const isDayAvailable = (date) => {
  if (!officeStore || !officeStore.getOfficeHours) return false

  // Convert the date to YYYY-MM-DD format in local timezone
  const dateString = formatDateToLocalISOString(date)

  // Check if the day is a holiday
  const holiday = checkHolidayStatus(dateString)

  // If it's a holiday with type 'holiday' or 'maintenance', it's not available
  if (holiday && (holiday.type === "holiday" || holiday.type === "maintenance")) {
    return false
  }

  // If it's a holiday with special hours, it is available
  if (holiday && holiday.type === "special-hours") {
    return true
  }

  // Get the day of week
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]

  // Check if office is open on this day according to admin configuration
  const officeHours = officeStore.getOfficeHoursForDay(dayOfWeek)

  // Return true only if the office is configured to be open on this day
  return officeHours && officeHours.isOpen
}

// Function to check if a date is a weekend (Saturday or Sunday)
const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
}

// Function to get special hours for a date if it exists
const getSpecialHoursForDate = (date) => {
  if (!date) return null

  // Convert the date to YYYY-MM-DD format in local timezone
  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)

  if (holiday && holiday.type === "special-hours") {
    return {
      openTime: holiday.openTime,
      closeTime: holiday.closeTime,
      isOpen: true,
    }
  }

  return null
}

// Function to get tooltip text for a date
const getDateTooltip = (date) => {
  if (!date) return ""

  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)

  if (holiday) {
    return holiday.name
  }

  if (isWeekend(date)) {
    return "Weekend - Office Closed"
  }

  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]
  const officeHours = officeStore.getOfficeHoursForDay(dayOfWeek)

  if (!officeHours || !officeHours.isOpen) {
    return "Office Closed"
  }

  return "Available for Appointments"
}

// Function to get CSS classes for a date
const getDateClasses = (date, isCurrentMonth, isToday, isWeekend) => {
  if (!officeStore || !officeStore.holidays) return ""

  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)
  const isAvailable = isDayAvailable(date)
  const isSelected = selectedDate.value && date.toDateString() === selectedDate.value.toDateString()

  // Selected date styling - apply this first to ensure it takes precedence
  if (isSelected) {
    // Apply the blue background and white text for selected dates on both mobile and desktop
    return "bg-blue-500 text-white"
  }

  const classes = []

  // Base styling
  if (isCurrentMonth) {
    if (isAvailable) {
      // If the day is available (including Saturdays configured as available), use consistent styling
      classes.push("hover:bg-blue-100")
    } else if (isWeekend) {
      classes.push("text-red-400 bg-red-50")
    } else if (holiday && (holiday.type === "holiday" || holiday.type === "maintenance")) {
      classes.push("text-red-400 bg-red-50")
    } else if (holiday && holiday.type === "special-hours") {
      classes.push("text-yellow-700 hover:bg-yellow-100")
    } else {
      classes.push("text-gray-400 bg-gray-200")
    }
  } else {
    classes.push("text-gray-300")
  }

  // Today styling
  if (isToday) {
    classes.push("bg-blue-100 text-blue-600 font-semibold")
  }

  // Add extra padding at the bottom for dates with holiday names
  if (getHolidayName(date)) {
    classes.push("pb-6 md:pb-7")
  }

  return classes.join(" ")
}

// Function to get indicator dot color for a date
const getDayStatusIndicator = (date) => {
  if (!date || !officeStore) return null

  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)

  // First check for holidays
  if (holiday) {
    if (holiday.type === "holiday" || holiday.type === "maintenance") {
      return "bg-red-500"
    } else if (holiday.type === "special-hours") {
      return "bg-yellow-500"
    }
  }

  // Then check if the day is available according to admin configuration
  // This will now properly handle Saturdays that are configured as available
  if (isDayAvailable(date)) {
    return "bg-green-500"
  }

  return null
}

// Add this helper function to convert 24-hour time to 12-hour format with AM/PM
const formatTo12Hour = (timeString) => {
  if (!timeString) return ""

  // Parse the hours and minutes
  const [hours, minutes] = timeString.split(":").map(Number)

  // Determine AM/PM
  const period = hours >= 12 ? "PM" : "AM"

  // Convert hours to 12-hour format
  const hours12 = hours % 12 || 12

  // Format the time string
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Function to handle date click - Update the message formatting for special hours
const handleDateClick = (date) => {
  // First check if the day is available according to admin configuration
  const isAvailable = isDayAvailable(date)
  
  // Convert the date to YYYY-MM-DD format in local timezone
  const dateString = formatDateToLocalISOString(date)
  const holiday = checkHolidayStatus(dateString)
  const isWeekendDay = isWeekend(date)

  if (!isAvailable) {
    // If it's a weekend but not available according to admin configuration
    if (isWeekendDay) {
      showWeekendModal(
        date,
        "Weekend - Office Closed",
        "Provincial Veterinary Office is closed on weekends. Please select a weekday (Monday to Friday) for your appointment."
      )
      return
    }
    
    // If it's a holiday
    if (holiday) {
      let title = "Office Closed"
      let message = `Provincial Veterinary Office is ${holiday.type === "special-hours" ? "operating with special hours" : "closed"} for ${holiday.name}. ${holiday.type === "special-hours" ? "" : "Please select another date."}`
      let icon = Calendar

      if (holiday.type === "maintenance") {
        title = "Office Maintenance"
        icon = AlertTriangle
      } else if (holiday.type === "holiday") {
        title = "Holiday - Office Closed"
      } else if (holiday.type === "special-hours") {
        // For special hours, always show modal and don't allow selection
        title = "Special Hours"

        // Format the open and close times to 12-hour format
        const formattedOpenTime = formatTo12Hour(holiday.openTime || "N/A")
        const formattedCloseTime = formatTo12Hour(holiday.closeTime || "N/A")

        message = `Provincial Veterinary Office is operating with special hours for ${holiday.name}: ${formattedOpenTime} - ${formattedCloseTime}. Please select a regular business day.`
        showWeekendModal(date, title, message, icon)
        return
      }

      // For holidays and maintenance, show modal
      showWeekendModal(date, title, message, icon)
      return
    }
    
    // For regular weekdays that are closed
    showWeekendModal(
      date,
      "Office Closed",
      "Provincial Veterinary Office is closed on this day. Please select another date."
    )
    return
  }

  // If the date is available, select it (even if it's a weekend)
  selectDate(date)
}

// Show weekend modal with custom message
const showWeekendModal = (
  date,
  title = "Weekend - Office Closed",
  message = "Provincial Veterinary Office is closed on weekends. Please select a weekday (Monday to Friday) for your appointment.",
  icon = Calendar,
  iconClass = "bg-red-100",
  iconColor = "text-red-600",
) => {
  selectedDateForModal.value = date
  modalTitle.value = title
  modalMessage.value = message
  modalIcon.value = icon
  modalIconClass.value = iconClass
  modalIconColor.value = iconColor
  showWeekendModalState.value = true
}

// Close weekend modal
const closeWeekendModal = () => {
  showWeekendModalState.value = false
  selectedDateForModal.value = null
}

// Helper function to convert time to minutes (HH:MM format)
const convertTimeToMinutes = (time) => {
  if (!time) return 0
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// State for success modal
const showSuccessModal = ref(false)
const selectedBookingDetails = ref({
  petNames: [],
  formattedDate: "",
  time: "",
  services: [],
  doctorName: "",
  duration: 0,
})

// State for weekend modal
const showWeekendModalState = ref(false)

// State for tracking booked appointments
const bookedAppointments = ref([])

// Categories and services
const categories = ref([])
const services = ref([])
const selectedCategory = ref(null)
const selectedServices = ref([])

const steps = [
  {
    id: "service",
    label: "Service",
    icon: Stethoscope,
    description: "Choose the type of service you need",
  },
  {
    id: "pet",
    label: "Pet",
    icon: PawPrint,
    description: "Select your pet for the appointment",
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: User2,
    description: "Choose your preferred veterinarian",
  },
  {
    id: "datetime",
    label: "Schedule",
    icon: CalendarDays,
    description: "Pick a convenient date and time",
  },
]

// Update the petSpecies array with imported images
const petSpecies = [
  { id: "dog", name: "Dog", image: dogImage },
  { id: "cat", name: "Cat", image: catImage },
  { id: "bird", name: "Bird", image: birdImage },
  { id: "reptile", name: "Reptiles", image: reptilesImage },
  { id: "other", name: "Other", image: null },
]

const currentStepIndex = ref(0)
const currentStep = computed(() => steps[currentStepIndex.value])

const selectedSpecies = ref(null)
// Replace single pet selection with multiple pets array
const selectedPet = ref(null) // Keep for backward compatibility
const selectedPets = ref([]) // New array for multiple pet selection
const selectedDoctor = ref(null)
const selectedDate = ref(null)
const selectedTime = ref(null)
const currentDate = ref(new Date())

// Add these new refs for the connector line positioning
const stepsContainer = ref(null)
const connectorLine = ref(null)
const stepRefs = ref([])

// Check if selected category is "Veterinary Health Certificate"
const isVeterinaryHealthCertificateCategory = computed(() => {
  if (!selectedCategory.value) return false
  const category = categories.value.find(cat => cat.id === selectedCategory.value)
  return category && category.name === "Veterinary Health Certificate"
})

// Function to fetch veterinarians from Firestore
const fetchVeterinarians = async () => {
  loadingVeterinarians.value = true
  veterinarianError.value = null

  try {
    // Query users collection for veterinarians (using role 'veterinary')
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("role", "==", "veterinary"))
    const querySnapshot = await getDocs(q)

    const vets = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()

      // Process the photoURL if it's a Google photo
      let photoURL = userData.photoURL
      let originalPhotoURL = userData.photoURL

      // Store both the original and processed URLs
      vets.push({
        ...userData,
        userId: doc.id,
        photoURL: photoURL,
        originalPhotoURL: originalPhotoURL,
        // Add name field for sorting convenience
        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
        // Ensure we have the address for the map
        address: userData.address || "",
        // Format the full address for the map if we have city/province data
        fullAddress: userData.address
          ? `${userData.address}, ${userData.city || ""}, ${userData.province || ""}`.trim()
          : "Provincial Veterinary Office",
      })
    })

    veterinarians.value = vets
    console.log(`Fetched ${vets.length} veterinarians:`, vets)
  } catch (error) {
    console.error("Error fetching veterinarians:", error)
    veterinarianError.value = "Failed to load veterinarians. Please try again."
  } finally {
    loadingVeterinarians.value = false
  }
}

// Function to position the connector line
const positionConnectorLine = () => {
  nextTick(() => {
    if (!stepsContainer.value || !connectorLine.value || stepRefs.value.length === 0) return

    const firstStep = stepRefs.value[0]
    const lastStep = stepRefs.value[stepRefs.value.length - 1]

    if (!firstStep || !lastStep) return

    // Get the first and last circle elements
    const firstCircle = firstStep.querySelector(".step-circle")
    const lastCircle = lastStep.querySelector(".step-circle")

    if (!firstCircle || !lastCircle) return

    // Calculate positions relative to the container
    const containerRect = stepsContainer.value.getBoundingClientRect()
    const firstRect = firstCircle.getBoundingClientRect()
    const lastRect = lastCircle.getBoundingClientRect()

    // Calculate the left and right positions
    const left = firstRect.left + firstRect.width / 2 - containerRect.left
    const right = containerRect.right - (lastRect.left + lastRect.width / 2)

    // Set the connector line position
    connectorLine.value.style.left = `${left}px`
    connectorLine.value.style.right = `${right}px`
  })
}

// Filtered services based on selected category
const filteredServices = computed(() => {
  if (!selectedCategory.value) return []
  return services.value.filter((service) => service.categoryId === selectedCategory.value)
})

// Filtered user pets based on selected species
const filteredUserPets = computed(() => {
  if (!selectedSpecies.value || userPets.value.length === 0) return []
  return userPets.value.filter(
    (pet) => pet.species && pet.species.toLowerCase() === selectedSpecies.value.toLowerCase(),
  )
})

// Format pet age for display
const formatPetAge = (pet) => {
  if (!pet) return "Unknown"

  // Check if we have the age structure
  if (pet.ageYears !== undefined || pet.ageMonths !== undefined || pet.ageWeeks !== undefined) {
    const years = pet.ageYears || 0
    const months = pet.ageMonths || 0
    const weeks = pet.ageWeeks || 0

    const parts = []
    if (years > 0) parts.push(`${years} ${years > 1 ? "yrs" : "yr"}`)
    if (months > 0) parts.push(`${months} ${months > 1 ? "mos" : "mo"}`)
    if (weeks > 0) parts.push(`${weeks} ${weeks > 1 ? "wks" : "wk"}`)

    return parts.join(", ") || "Newborn"
  }

  // If it's just a number, assume it's years
  if (typeof pet.age === "number") {
    return `${pet.age} ${pet.age !== 1 ? "yrs" : "yr"}`
  }

  return pet.age || "Unknown"
}

// Get species name by ID
const getSpeciesName = (speciesId) => {
  const species = petSpecies.find((s) => s.id === speciesId)
  return species ? species.name : speciesId
}

// Navigate to add pet page
const goToAddPet = () => {
  // Navigate to the profile page with the pet-info tab
  router.push("/user/profile?tab=pet-info")
}

// Filtered pets based on selected species
const filteredPets = computed(() => {
  if (!selectedSpecies.value) return []
  return []
})

// Parse duration string into minutes
const parseDuration = (durationStr) => {
  if (!durationStr) return 0

  // If it's just a number, assume it's minutes
  if (/^\d+$/.test(durationStr)) {
    return parseInt(durationStr)
  }

  // Check for common duration formats
  const hoursMatch = durationStr.match(/(\d+)\s*(?:hour|hr|h)/i)
  const minutesMatch = durationStr.match(/(\d+)\s*(?:minute|min|m)/i)
  const secondsMatch = durationStr.match(/(\d+)\s*(?:second|sec|s)/i)

  let totalMinutes = 0
  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60
  if (minutesMatch) totalMinutes += parseInt(minutesMatch[1])
  if (secondsMatch) totalMinutes += Math.ceil(parseInt(secondsMatch[1]) / 60)

  return totalMinutes
}

// Calculate total duration in minutes - UPDATED FOR MULTIPLE PETS
const totalDurationMinutes = computed(() => {
  if (selectedServices.value.length === 0) return 0

  // Calculate base duration from selected services
  const baseDuration = selectedServices.value.reduce((total, serviceId) => {
    const service = services.value.find((s) => s.id === serviceId)
    if (!service || !service.processingTime) return total

    const duration = parseDuration(service.processingTime)
    console.log(`Service ${service.name} has duration: ${duration} minutes`)
    return total + duration
  }, 0)
  
  // For Veterinary Health Certificate category, don't multiply by pet count
  if (isVeterinaryHealthCertificateCategory.value) {
    return baseDuration
  }
  
  // Multiply by the number of pets selected
  const petCount = selectedPets.value.length || 1
  const totalDuration = baseDuration * petCount
  
  console.log(`Base duration: ${baseDuration} minutes, Pet count: ${petCount}, Total duration: ${totalDuration} minutes`)
  return totalDuration
})

// Format total duration for display
const formatTotalDuration = (minutes) => {
  if (!minutes || minutes <= 0) return ""

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`
  } else {
    return `${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}`
  }
}

// Add this function to get service name with duration
const getServiceNameWithDuration = (serviceId) => {
  const service = services.value.find((s) => s.id === serviceId)
  if (!service) return ""

  // If the service has a processing time, display it with the name
  if (service.processingTime) {
    return `${service.name} (${service.processingTime})`
  }

  // Otherwise just return the name
  return service.name
}

// Check if we should use exact times (for today with no duration or any day with 0 duration)
const shouldUseExactTimes = computed(() => {
  const hasDuration = totalDurationMinutes.value > 0
  console.log(`Total duration: ${totalDurationMinutes.value} minutes, shouldUseExactTimes: ${!hasDuration}`)
  return !hasDuration
})

// Function to get available time slots for a date
const getAvailableTimeSlots = (date) => {
  if (!date) return []

  const dateString = formatDateToLocalISOString(date)
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]

  console.log(`Getting time slots for date: ${dateString}, day of week: ${dayOfWeek}`)

  // First check if it's a holiday
  const holiday = checkHolidayStatus(dateString)

  if (holiday) {
    console.log(`Holiday detected for ${dateString}:`, holiday.name, holiday.type)
    
    // If it's a holiday with special hours, use those hours
    if (holiday.type === 'special-hours' && holiday.openTime && holiday.closeTime) {
      console.log(`Special hours for ${holiday.name}: ${holiday.openTime} - ${holiday.closeTime}`)
      return generateTimeSlotsForRange(date, holiday.openTime, holiday.closeTime)
    }
    
    // If it's a regular holiday or maintenance, no slots available
    if (holiday.type === 'holiday' || holiday.type === 'maintenance') {
      console.log(`Office closed for holiday: ${holiday.name}`)
      return []
    }
  }

  // If it's not a holiday, check regular office hours
  const officeHours = officeStore.getOfficeHoursForDay(dayOfWeek)

  if (!officeHours || !officeHours.isOpen) {
    console.log(`Office closed on ${dayOfWeek}`)
    return []
  }

  console.log(`Regular office hours for ${dayOfWeek}: ${officeHours.openTime} - ${officeHours.closeTime}`)
  
  // Check if a doctor is selected and if the date is a day they work
  if (selectedDoctor.value) {
    // Check if the doctor is available on this day
    const doctorAvailable = isDoctorAvailableOnDay(selectedDoctor.value, date.getDay())
    
    if (!doctorAvailable) {
      console.log(`Doctor ${selectedDoctor.value.firstName} ${selectedDoctor.value.lastName} is not available on ${dayOfWeek}`)
      return []
    }
    
    console.log(`Doctor ${selectedDoctor.value.firstName} ${selectedDoctor.value.lastName} is available on ${dayOfWeek}`)
    
    // Parse the doctor's working hours if available
    const doctorHours = parseDoctorWorkingHours(selectedDoctor.value, dayOfWeek)
    
    if (doctorHours) {
      console.log(`Doctor's working hours: ${doctorHours.openTime} - ${doctorHours.closeTime}`)
      
      // Generate time slots based on the doctor's working hours
      return generateTimeSlotsForRange(date, doctorHours.openTime, doctorHours.closeTime, officeHours.lunchStart, officeHours.lunchEnd)
    }
  }
  
  // If no doctor is selected or no specific hours found, use office hours
  return generateTimeSlotsForRange(date, officeHours.openTime, officeHours.closeTime, officeHours.lunchStart, officeHours.lunchEnd)
}

// New function to parse doctor's working hours from their schedule
const parseDoctorWorkingHours = (doctor, dayOfWeek) => {
  if (!doctor || !doctor.schedule) return null
  
  // Default office hours to use if we can't parse specific times
  const defaultHours = { openTime: "09:00", closeTime: "17:00" }
  
  try {
    const schedule = doctor.schedule
    
    // Check if the schedule contains time information
    const timeMatch = schedule.match(/(\d+:\d+\s*(?:AM|PM))\s*(?:to|-)\s*(\d+:\d+\s*(?:AM|PM))/i)
    
    if (timeMatch) {
      // Convert 12-hour format to 24-hour format
      const openTime = convertTo24HourFormat(timeMatch[1])
      const closeTime = convertTo24HourFormat(timeMatch[2])
      
      return { openTime, closeTime }
    }
    
    // If no specific time found, return default hours
    return defaultHours
  } catch (error) {
    console.error("Error parsing doctor working hours:", error)
    return defaultHours
  }
}

// Helper function to convert 12-hour time format to 24-hour format
const convertTo24HourFormat = (timeStr) => {
  if (!timeStr) return "09:00"
  
  // Clean up the time string
  timeStr = timeStr.trim().toUpperCase()
  
  // Parse the time components
  const match = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)/)
  if (!match) return "09:00"
  
  let hours = parseInt(match[1], 10)
  const minutes = match[2] ? parseInt(match[2], 10) : 0
  const period = match[3]
  
  // Convert to 24-hour format
  if (period === "PM" && hours < 12) {
    hours += 12
  } else if (period === "AM" && hours === 12) {
    hours = 0
  }
  
  // Format as HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Helper function to generate time slots for a given range - UPDATED FOR MULTIPLE PETS
const generateTimeSlotsForRange = (date, openTime, closeTime, lunchStart = null, lunchEnd = null) => {
  const slots = []
  const now = new Date()
  let startTime = new Date(date)

  console.log(`Generating time slots for range: ${openTime} - ${closeTime}`)

  // Set start time
  const openHourParts = openTime.split(":")
  startTime.setHours(parseInt(openHourParts[0], 10), parseInt(openHourParts[1], 10), 0, 0)

  // Set end time
  const endTime = new Date(date)
  const closeHourParts = closeTime.split(":")
  endTime.setHours(parseInt(closeHourParts[0], 10), parseInt(closeHourParts[1], 10), 0, 0)

  // If it's today, start from the current hour (rounded up)
  if (isToday(date) && startTime < now) {
    startTime = new Date(now)
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / 20) * 20, 0, 0)
  }

  // Determine the interval based on total duration
  // If no services selected or duration is 0, use default 60 minutes
  const interval = totalDurationMinutes.value > 0 ? totalDurationMinutes.value : 60
  
  console.log(`Using interval of ${interval} minutes for time slots`)

  while (startTime < endTime) {
    const slotEndTime = new Date(startTime)
    slotEndTime.setMinutes(startTime.getMinutes() + interval)
    
    // Skip lunch break if specified
    if (lunchStart && lunchEnd) {
      const lunchStartTime = new Date(date)
      const lunchStartParts = lunchStart.split(":")
      lunchStartTime.setHours(parseInt(lunchStartParts[0], 10), parseInt(lunchStartParts[1], 10), 0, 0)
      
      const lunchEndTime = new Date(date)
      const lunchEndParts = lunchEnd.split(":")
      lunchEndTime.setHours(parseInt(lunchEndParts[0], 10), parseInt(lunchEndParts[1], 10), 0, 0)
      
      // Skip this slot if it overlaps with lunch
      if (startTime < lunchEndTime && slotEndTime > lunchStartTime) {
        startTime = new Date(lunchEndTime)
        continue
      }
    }
    
    if (slotEndTime <= endTime) {
      const formattedStartTime = format(startTime, "h:mm a")
      const formattedEndTime = format(slotEndTime, "h:mm a")
      
      // Create the time range string
      let displayTime
      if (totalDurationMinutes.value === 0) {
        displayTime = formattedStartTime
      } else {
        displayTime = `${formattedStartTime} - ${formattedEndTime}`
      }
      
      slots.push({
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        timeRange: displayTime,
        isBooked: false
      })
    }
    
    // Increment by the interval
    startTime = new Date(slotEndTime)
  }

  console.log(`Generated ${slots.length} time slots`)
  return slots
}

// Update the dynamicTimeSlots computed property to use the new function
const dynamicTimeSlots = computed(() => {
  if (!selectedDate.value) return []
  
  console.log(`Getting time slots for selected date: ${formatDate(selectedDate.value)}`)
  return getAvailableTimeSlots(selectedDate.value)
})

// Update the available time slots computed property to correctly parse appointment times
const availableTimeSlots = computed(() => {
  if (!dynamicTimeSlots.value.length) return []

  isLoadingTimeSlots.value = true

  try {
    const slots = dynamicTimeSlots.value.map((slot) => {
      // Parse the start and end times of this slot
      const slotStartTime = parse(slot.startTime, "h:mm a", new Date(selectedDate.value))
      const slotEndTime = parse(slot.endTime, "h:mm a", new Date(selectedDate.value))

      // Check if this time slot overlaps with any existing appointment for the selected doctor
      const isBooked = bookedAppointments.value.some((appointment) => {
        // Only consider appointments for the selected doctor
        if (selectedDoctor.value && appointment.doctorId !== (selectedDoctor.value.userId || selectedDoctor.value.id)) {
          return false
        }
        
        // Check if the appointment status should block the time slot
        const blockingStatuses = ['approved', 'processing', 'completed']
        if (!blockingStatuses.includes(appointment.status)) {
          return false // Don't block for pending, cancelled, or ended appointments
        }
        
        // Extract just the start time from the appointment time range
        const appointmentTimeString = appointment.time.split(" - ")[0].trim()

        // Parse the appointment start time
        const appointmentStartTime = parse(appointmentTimeString, "h:mm a", new Date(selectedDate.value))

        // Calculate the appointment end time based on its duration
        const appointmentEndTime = new Date(appointmentStartTime)
        appointmentEndTime.setMinutes(appointmentStartTime.getMinutes() + (appointment.duration || 60))

        // Check for overlap:
        // If slot starts before appointment ends AND slot ends after appointment starts
        return slotStartTime < appointmentEndTime && slotEndTime > appointmentStartTime
      })

      return {
        ...slot,
        isBooked,
      }
    })
    
    console.log(`Available time slots after booking check: ${slots.length}`)
    return slots
  } finally {
    isLoadingTimeSlots.value = false
  }
})

// Fetch booked appointments for the selected date
const fetchBookedAppointments = async () => {
  if (!selectedDate.value) return
  
  isLoadingTimeSlots.value = true
  
  try {
    // Create start and end of day timestamps for the selected date in local timezone
    const dateString = formatDateToLocalISOString(selectedDate.value)
  
    // Create start of day (midnight)
    const start = new Date(`${dateString}T00:00:00`)
  
    // Create end of day (23:59:59)
    const end = new Date(`${dateString}T23:59:59`)
  
    // Query Firestore for appointments on the selected date
    const appointmentsRef = collection(db, "appointments")
    const q = query(appointmentsRef, where("date", ">=", start), where("date", "<=", end))
  
    const querySnapshot = await getDocs(q)
    bookedAppointments.value = []
  
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      bookedAppointments.value.push({
        id: doc.id,
        time: data.time,
        doctorId: data.doctorId,
        duration: data.duration,
        status: data.status // Make sure to include the status
      })
    })
    
    console.log(`Fetched ${bookedAppointments.value.length} booked appointments for ${dateString}`)
    console.log("Booked appointments:", bookedAppointments.value)
  } catch (error) {
    console.error("Error fetching booked appointments:", error)
  } finally {
    isLoadingTimeSlots.value = false
  }
}

// Get service name by ID
const getServiceName = (serviceId) => {
  const service = services.value.find((s) => s.id === serviceId)
  return service ? service.name : ""
}

// Watch for changes in selected services to reset time if needed
watch(selectedServices, (newServices, oldServices) => {
  if (
    newServices.length !== oldServices.length ||
    !newServices.every((service, index) => service === oldServices[index])
  ) {
    selectedTime.value = null
  
    // Recalculate time slots based on new service selection
    if (selectedDate.value) {
      fetchBookedAppointments()
    }
  }
})

// Watch for changes in selected date to fetch booked appointments
watch(selectedDate, (newDate) => {
  if (newDate) {
    selectedTime.value = null
    fetchBookedAppointments()
  }
})

// Watch for changes in selectedDoctor to update the map and refresh time slots
watch(
  () => selectedDoctor.value,
  (newDoctor, oldDoctor) => {
    if (newDoctor) {
      // Force map reinitialization when doctor changes
      cleanupMap()
  
      // Use nextTick to ensure the DOM is updated
      nextTick(() => {
        // Delay the map initialization slightly to ensure the container is ready
        setTimeout(() => {
          loadGoogleMapsApi()
        }, 100)
      })
      
      // Refresh time slots if a date is already selected
      if (selectedDate.value) {
        // Reset time selection when doctor changes
        selectedTime.value = null
        fetchBookedAppointments()
      }
    }
  },
)

// Watch for changes in the current step to reinitialize the map if needed
watch(
  () => currentStep.value.id,
  (newStepId, oldStepId) => {
    if (newStepId === "doctor" && selectedDoctor.value && !isMapInitialized.value) {
      nextTick(() => {
        loadGoogleMapsApi()
      })
    }
  
    // If we're on the datetime step and no date is selected, default to today
    if (newStepId === "datetime" && !selectedDate.value) {
      // Set today as the default date if it's available
      const today = new Date()
      if (isDayAvailable(today) && !isTodayWithSpecialHours(today)) {
        selectDate(today)
      }
    }
  },
)

// Add this computed property to calculate the offset for the first day of the month
const startingDayOffset = computed(() => {
  const start = startOfMonth(currentDate.value)
  return start.getDay() // Returns 0-6 (Sunday-Saturday)
})

// Modify the calendarDays computed property
const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)
  
  // Get all days in the month
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    isCurrentMonth: true,
    isToday: isToday(date),
    isWeekend: isWeekend(date),
  }))
})

const currentMonthYear = computed(() => format(currentDate.value, "MMMM yyyy"))

// Update canBook to handle both cases - regular services with pets and Veterinary Health Certificate
const canBook = computed(() => {
  if (isVeterinaryHealthCertificateCategory.value) {
    // For Veterinary Health Certificate, we don't need pet selection
    return selectedServices.value.length > 0 &&
           selectedDoctor.value &&
           selectedDate.value &&
           selectedTime.value
  } else {
    // For regular services, we need pet selection
    return selectedServices.value.length > 0 &&
           selectedPets.value.length > 0 &&
           selectedDoctor.value &&
           selectedDate.value &&
           selectedTime.value
  }
})

// Updated to ensure both date AND time are selected for the datetime step
// And to handle Veterinary Health Certificate special case
const canProceed = computed(() => {
  switch (currentStep.value.id) {
    case "service":
      return selectedServices.value.length > 0
    case "pet":
      // For Veterinary Health Certificate, we don't require pet selection
      if (isVeterinaryHealthCertificateCategory.value) {
        return true
      }
      return selectedPets.value.length > 0
    case "doctor":
      return !!selectedDoctor.value
    case "datetime":
      return !!selectedDate.value && !!selectedTime.value // Both date and time must be selected
    default:
      return false
  }
})

const formatDate = (date) => {
  return format(date, "EEEE, MMMM d, yyyy")
}

// Function to go to a specific step
const goToStep = (index) => {
  // Only allow going to steps that have been completed or the current step
  if (index <= currentStepIndex.value) {
    currentStepIndex.value = index
  
    // On mobile, show the first column when changing steps
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  }
}

// Function to reset the current step
const resetCurrentStep = () => {
  switch (currentStep.value.id) {
    case "service":
      selectedCategory.value = null
      selectedServices.value = []
      break
    case "pet":
      selectedSpecies.value = null
      selectedPet.value = null
      selectedPets.value = [] // Clear the pets array
      break
    case "doctor":
      selectedDoctor.value = null
      break
    case "datetime":
      selectedDate.value = null
      selectedTime.value = null // Clear the time selection when resetting
      break
  }
  
  // On mobile, ensure we're showing the first column after reset
  if (isMobile.value) {
    showSecondColumn.value = false
  }
}

// Select category and show services in second column
const selectCategory = (categoryId) => {
  // Toggle selection
  if (selectedCategory.value === categoryId) {
    selectedCategory.value = null
    selectedServices.value = []
  } else {
    selectedCategory.value = categoryId
    selectedServices.value = []
  
    // Show second column on mobile after selection
    if (isMobile.value) {
      showSecondColumn.value = true
    }
  }
}

// Toggle service selection
const toggleService = (serviceId) => {
  const index = selectedServices.value.indexOf(serviceId)
  if (index === -1) {
    selectedServices.value.push(serviceId)
  } else {
    selectedServices.value.splice(index, 1)
  }
}

// Modified to automatically show second column on mobile when selected
const selectSpecies = (speciesId) => {
  // Toggle selection
  if (selectedSpecies.value === speciesId) {
    selectedSpecies.value = null
    selectedPet.value = null
    selectedPets.value = [] // Clear the pets array
    // Go back to previous step if deselecting
    if (currentStepIndex.value > 1) {
      currentStepIndex.value = 1
    }
  
    // On mobile, go back to first column when deselecting
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  } else {
    selectedSpecies.value = speciesId
    selectedPet.value = null
    selectedPets.value = [] // Clear the pets array
  
    // Show second column on mobile after selection
    if (isMobile.value) {
      showSecondColumn.value = true
    }
  }
}

// Helper function to check if a pet is selected
const isPetSelected = (pet) => {
  return selectedPets.value.some(p => p.id === pet.id)
}

// Function to toggle pet selection (for multiple selection)
const togglePetSelection = (pet) => {
  if (isPetSelected(pet)) {
    // Remove pet from selection
    selectedPets.value = selectedPets.value.filter(p => p.id !== pet.id)
    
    // If no pets are selected, clear selectedPet as well
    if (selectedPets.value.length === 0) {
      selectedPet.value = null
    }
  } else {
    // Add pet to selection
    selectedPets.value.push(pet)
    
    // Keep selectedPet in sync with the first selected pet for backward compatibility
    if (selectedPets.value.length === 1) {
      selectedPet.value = pet
    }
  }
  
  // Show second column on mobile after selection
  if (isMobile.value && selectedPets.value.length > 0) {
    showSecondColumn.value = true
  }
}

// Function to remove a pet from selection
const removePet = (pet) => {
  selectedPets.value = selectedPets.value.filter(p => p.id !== pet.id)
  
  // Update selectedPet for backward compatibility
  if (selectedPets.value.length > 0) {
    selectedPet.value = selectedPets.value[0]
  } else {
    selectedPet.value = null
  }
}

// Modified to automatically show second column on mobile when selected
const selectDoctor = (doctor) => {
  // Toggle selection if clicking the same doctor
  if (selectedDoctor.value === doctor) {
    selectedDoctor.value = null
    // Go back to previous step if deselecting
    if (currentStepIndex.value > 2) {
      currentStepIndex.value = 2
    }
  
    // On mobile, go back to first column when deselecting
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  } else {
    selectedDoctor.value = doctor
  
    // Show second column on mobile after selection
    if (isMobile.value) {
      showSecondColumn.value = true
    }
    
    // Reset date and time when changing doctors
    selectedDate.value = null
    selectedTime.value = null
  }
}

// Modified to automatically show second column on mobile when selected
// and to toggle date selection
const selectDate = (date) => {
  // Only select the date if it's available (removed weekend check)
  if (isDayAvailable(date)) {
    // Toggle selection if clicking the same date
    if (selectedDate.value && isSameDay(date, selectedDate.value)) {
      selectedDate.value = null
      selectedTime.value = null
      // Go back to previous step if deselecting
      if (currentStepIndex.value > 3) {
        currentStepIndex.value = 3
      }

      // On mobile, go back to first column when deselecting
      if (isMobile.value) {
        showSecondColumn.value = false
      }
    } else {
      selectedDate.value = date
      selectedTime.value = null
      fetchBookedAppointments()

      // Don't automatically show second column on mobile after date selection
      // Let the user select a time first
    }
  }
}

// Modified to handle time ranges
const selectTime = (timeRange) => {
  // Toggle selection if clicking the same time
  if (selectedTime.value === timeRange) {
    selectedTime.value = null
  
    // On mobile, go back to first column when deselecting
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  } else {
    selectedTime.value = timeRange
  
    // Show second column on mobile after time selection
    if (isMobile.value) {
      showSecondColumn.value = true
    }
  }
}

// Modified to handle skipping the pet step for Veterinary Health Certificate
const nextStep = async () => {
  if (currentStepIndex.value < steps.length - 1 && canProceed.value && !isLoading.value) {
    isLoading.value = true
  
    try {
      // Simulate loading time (you can remove this in production)
      await new Promise((resolve) => setTimeout(resolve, 800))
  
      currentStepIndex.value++
      
      // Skip the pet selection step for Veterinary Health Certificate
      if (isVeterinaryHealthCertificateCategory.value && currentStepIndex.value === 1) {
        // Go directly to doctor selection (step index 2)
        currentStepIndex.value = 2
      }
  
      // On mobile, go back to first column for next step
      if (isMobile.value) {
        showSecondColumn.value = false
      }
    } finally {
      isLoading.value = false
    }
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    // If we're at doctor selection (index 2) and have Veterinary Health Certificate,
    // we need to go back to service (index 0) instead of pet (index 1)
    if (isVeterinaryHealthCertificateCategory.value && currentStepIndex.value === 2) {
      currentStepIndex.value = 0
    } else {
      currentStepIndex.value--
    }
  
    // On mobile, go back to first column for previous step
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  }
}

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
}

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  
  // Reset form after closing the modal
  selectedCategory.value = null
  selectedServices.value = []
  selectedSpecies.value = null
  selectedPet.value = null
  selectedPets.value = [] // Clear the pets array
  
  selectedDoctor.value = null
  selectedDate.value = null
  selectedTime.value = null
  currentStepIndex.value = 0
  showSecondColumn.value = false
}

// Fix the time slot display in the appointment summary
const getTimeRangeForDisplay = (startTime) => {
  // If we should use exact times, return just the start time
  if (shouldUseExactTimes.value) {
    return startTime
  }
  
  // Otherwise, calculate and return the time range
  const startDate = parse(startTime, "h:mm a", new Date())
  const endDate = new Date(startDate)
  endDate.setMinutes(startDate.getMinutes() + totalDurationMinutes.value)
  
  return `${startTime} - ${format(endDate, "h:mm a")}`
}

// Book appointment function - Updated for multiple pets and Veterinary Health Certificate
const bookAppointment = async () => {
  if (!canBook.value || isLoading.value) return
  
  isLoading.value = true
  
  try {
    // Get service names with durations for the booking details
    const serviceNames = selectedServices.value
      .map((id) => {
        const service = services.value.find((s) => s.id === id)
        return service ? `${service.name} (${service.processingTime || "0 minutes"})` : ""
      })
      .filter((name) => name)
    
    // Get pet names for the booking details - handle Veterinary Health Certificate case
    const petNames = isVeterinaryHealthCertificateCategory.value ? [] : selectedPets.value.map(pet => pet.name)
    
    // Create appointment data with proper date handling
    const appointmentData = {
      services: selectedServices.value,
      serviceNames: serviceNames,
      duration: totalDurationMinutes.value,
      petIds: isVeterinaryHealthCertificateCategory.value ? [] : selectedPets.value.map(pet => pet.id), // Store all pet IDs
      petNames: petNames, // Store all pet names
      doctorId: selectedDoctor.value.userId || selectedDoctor.value.id,
      doctorName: `${getDoctorTitle(selectedDoctor.value)} ${selectedDoctor.value.firstName} ${selectedDoctor.value.lastName}`,
      // Store the date as a JavaScript Date object at noon to avoid timezone issues
      date: new Date(`${formatDateToLocalISOString(selectedDate.value)}T12:00:00`),
      time: selectedTime.value,
      userId: authStore.user?.userId || "guest-user",
      status: "pending",
      isHealthCertificate: isVeterinaryHealthCertificateCategory.value, // Flag for health certificate
    }
  
    // Use the appointment store to add the appointment
    const result = await appointmentStore.addAppointment(appointmentData)
  
    if (!result) {
      throw new Error("Failed to save appointment")
    }
  
    console.log("Appointment saved successfully:", result)
  
    // Set booking details for success modal
    selectedBookingDetails.value = {
      petNames: petNames,
      formattedDate: formatDate(selectedDate.value),
      time: selectedTime.value,
      services: serviceNames,
      doctorName: `${getDoctorTitle(selectedDoctor.value)} ${selectedDoctor.value.firstName} ${selectedDoctor.value.lastName}`,
      duration: totalDurationMinutes.value,
    }
  
    // Show success modal
    showSuccessModal.value = true
  } catch (error) {
    console.error("Error booking appointment:", error)
    alert("Failed to book appointment. Please try again.")
  } finally {
    isLoading.value = false
  }
}

// Add a ref to track whether auth has been initialized
const authInitialized = ref(false)

// Function to initialize auth and fetch user data
const initializeAuthAndFetchData = async () => {
  // Initialize auth and fetch user data only once
  if (!authInitialized.value) {
    authInitialized.value = true // Mark auth as initialized
    try {
      // If auth is not initialized yet, initialize it
      if (!authStore.isInitialized) {
        await authStore.initialize()
      }
      // User data will be available in authStore.user after initialization
    } catch (error) {
      console.error("Error initializing auth:", error)
    }
  
    // Fetch user's pets if user is logged in
    if (authStore.user && authStore.user.userId) {
      try {
        userPets.value = (await petsStore.fetchUserPets(authStore.user.userId)) || []
      } catch (error) {
        console.error("Error fetching user pets:", error)
        userPets.value = []
      }
    }
  }
}

// Function to get doctor title based on gender
const getDoctorTitle = (doctor) => {
  if (!doctor) return "Dr."
  
  // Check if gender is explicitly set
  if (doctor.gender) {
    return doctor.gender.toLowerCase() === "female" ? "Dra." : "Dr."
  }
  
  // If no gender is set, use Dr. as default
  return "Dr."
}

// Function to check if a doctor is available today
const isDoctorAvailableToday = (doctor) => {
  if (!doctor) return false
  
  // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay()
  
  // Check if the doctor is available on this day
  return isDoctorAvailableOnDay(doctor, today)
}

// Function to check if a doctor is available on a specific day
const isDoctorAvailableOnDay = (doctor, dayIndex) => {
  if (!doctor || !doctor.schedule) return false
  
  // Default schedule is Monday to Friday
  const defaultAvailableDays = [1, 2, 3, 4, 5] // Monday to Friday
  
  // Check if the schedule contains specific days
  const schedule = doctor.schedule.toLowerCase()
  
  // Check for common day patterns
  if (schedule.includes("mon-fri") || schedule.includes("monday to friday") || schedule.includes("monday-friday")) {
    return defaultAvailableDays.includes(dayIndex)
  }
  
  // Check for specific days
  const days = [
    { name: "sunday", abbr: "sun", index: 0 },
    { name: "monday", abbr: "mon", index: 1 },
    { name: "tuesday", abbr: "tue", index: 2 },
    { name: "wednesday", abbr: "wed", index: 3 },
    { name: "thursday", abbr: "thu", index: 4 },
    { name: "friday", abbr: "fri", index: 5 },
    { name: "saturday", abbr: "sat", index: 6 },
  ]
  
  // Check if the day is mentioned in the schedule
  return days.some(day => 
    (day.index === dayIndex) && 
    (schedule.includes(day.name) || schedule.includes(day.abbr))
  )
}

// Function to get the next available day for a doctor
const getNextAvailableDay = (doctor) => {
  if (!doctor) return "Unknown"
  
  // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay()
  
  // Check the next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (today + i) % 7
    if (isDoctorAvailableOnDay(doctor, nextDayIndex)) {
      // Return the day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      return dayNames[nextDayIndex]
    }
  }
  
  return "Not available in the next 7 days"
}

// Function to get the biography text for a doctor
const getBiographyText = (doctor) => {
  if (!doctor) return ""
  
  // Check if the doctor has a bio field
  if (doctor.bio) {
    return doctor.bio
  }
  
  // Generate a default bio without experience years if not available
  return `${getDoctorTitle(doctor)} ${doctor.firstName} ${doctor.lastName} is a ${doctor.specialty || "veterinarian"} specializing in providing compassionate care for all types of pets and is dedicated to ensuring the health and wellbeing of your furry family members.`
}

// State for biography expansion
const isExpanded = ref(false)

// Format office hours for display
const formatOfficeHours = computed(() => {
  if (!officeStore || !officeStore.getOfficeHours) {
    return { openTime: "9:00 AM", closeTime: "5:00 PM" }
  }
  
  // Get the day of week for the selected date or today
  const date = selectedDate.value || new Date()
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]
  
  // Get office hours for this day
  const officeHours = officeStore.getOfficeHoursForDay(dayOfWeek)
  
  if (!officeHours || !officeHours.isOpen) {
    return { openTime: "Closed", closeTime: "Closed" }
  }
  
  // Format the times to 12-hour format
  const openTime = formatTo12Hour(officeHours.openTime)
  const closeTime = formatTo12Hour(officeHours.closeTime)
  
  return { openTime, closeTime }
})

// Check if the current day's schedule is closed
const isCurrentDayScheduleClosed = computed(() => {
  if (!selectedDate.value || !officeStore || !officeStore.getOfficeHours) return true
  
  // Get the day of week for the selected date
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDate.value.getDay()]
  
  // Get office hours for this day
  const officeHours = officeStore.getOfficeHoursForDay(dayOfWeek)
  
  // Check if the office is closed on this day
  if (!officeHours || !officeHours.isOpen) {
    return true
  }
  
  // If it's today, check if the current time is after closing time
  if (isToday(selectedDate.value)) {
    const now = new Date()
    const closeHourParts = officeHours.closeTime.split(":")
    const closeTime = new Date()
    closeTime.setHours(parseInt(closeHourParts[0], 10), parseInt(closeHourParts[1], 10), 0, 0)
    
    // If current time is after closing time, the schedule is closed
    if (now > closeTime) {
      return true
    }
  }
  
  return false
})

// Initialize data on component mount
onMounted(async () => {
  try {
    initialLoading.value = true
    
    // Initialize auth and fetch user data
    await initializeAuthAndFetchData()
    
    // Fetch categories and services
    await categoryStore.fetchCategories()
    await categoryStore.fetchServices()
    
    // Set local data
    categories.value = categoryStore.categories
    services.value = categoryStore.services
    
    // Fetch office hours
    await fetchOfficeHours()
    
    // Fetch veterinarians
    await fetchVeterinarians()
    
    // Position the connector line
    positionConnectorLine()
    
    // Add window resize event listener for connector line
    window.addEventListener("resize", positionConnectorLine)
    
    console.log("Initialization complete")
  } catch (error) {
    console.error("Error initializing component:", error)
  } finally {
    initialLoading.value = false
  }
})

// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener("resize", positionConnectorLine)
})

// Use authStore.isInitialized directly in the conditional check
const shouldInitializeAuth = computed(() => !authStore.isInitialized);

// Call initializeAuthAndFetchData conditionally using a watcher
watch(shouldInitializeAuth, async (newVal) => {
  if (newVal) {
    try {
      await initializeAuthAndFetchData();
    } catch (error) {
      console.error("Error during conditional initialization:", error);
    }
  }
}, { immediate: true });
</script>

<style>
/* Prevent the main container from scrolling */
.h-screen {
  height: 100vh;
  overflow: hidden;
}

/* Ensure the content areas have proper scrolling */
.overflow-y-auto {
  overflow-y: auto;
}

/* Add media query for mobile devices */
@media (max-width: 767px) {
  .h-screen {
    height: calc(100vh - 20px);
  }
}
</style>