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
              v-for="serviceType in serviceTypes" 
              :key="serviceType.id" 
              class="relative bg-white rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-md transition-all duration-200 cursor-pointer"
              :class="{ 'ring-2 ring-blue-500': selectedServiceType === serviceType }"
              @click="selectServiceType(serviceType)"
            >
              <!-- Image container taking full width -->
              <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <img 
                  :src="serviceType.image" 
                  :alt="serviceType.name" 
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- Content below image -->
              <div class="space-y-1 md:space-y-2">
                <h3 class="font-semibold text-gray-900 text-base md:text-lg">{{ serviceType.name }}</h3>
                <p class="text-xs md:text-sm text-gray-500">{{ serviceType.category }}</p>
                <p class="text-[10px] md:text-xs text-gray-500">{{ serviceType.description }}</p>
              </div>
    
              <!-- Selection button -->
              <button 
                @click.stop="selectServiceType(serviceType)"
                class="absolute right-4 top-4 w-7 h-7 md:w-8 md:h-8 bg-orange-300 text-orange-900 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-500 transition-colors z-10"
              >
                <component :is="selectedServiceType && selectedServiceType.id === serviceType.id ? Check : Plus" class="w-3 h-3 md:w-4 md:h-4" />
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
                    :src="species.image" 
                    :alt="species.name" 
                    class="w-full h-full object-cover"
                  />
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
            <div 
              v-for="doctor in doctors" 
              :key="doctor.id" 
              class="flex items-center p-3 md:p-4 border rounded-2xl cursor-pointer transition-all duration-200"
              :class="[
                selectedDoctor === doctor 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-100 hover:border-blue-100 hover:bg-gray-50'
              ]"
              @click="selectDoctor(doctor)"
            >
              <img 
                :src="doctor.image" 
                :alt="doctor.name"
                class="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover"
              />
              <div class="ml-3 md:ml-4 flex-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-base md:text-lg font-semibold text-gray-900">{{ doctor.name }}</h3>
                  <button class="text-gray-400 hover:text-gray-600">
                    <MoreVertical class="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                <p class="text-xs md:text-sm text-gray-500">{{ doctor.specialization }}</p>
                <div class="flex items-center mt-1">
                  <Star 
                    v-for="i in 5" 
                    :key="i"
                    class="w-3 h-3 md:w-4 md:h-4"
                    :class="i <= doctor.rating ? 'text-yellow-400' : 'text-gray-200'"
                    :fill="i <= doctor.rating ? 'currentColor' : 'none'"
                  />
                  <span class="ml-1 text-xs md:text-sm text-gray-600">{{ doctor.rating }}</span>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Date and Time Selection -->
          <div v-if="currentStep.id === 'datetime'" class="space-y-3 md:space-y-4">
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
              
              <div class="grid grid-cols-7 gap-1 md:gap-2">
                <div 
                  v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
                  :key="day" 
                  class="text-center text-xs md:text-sm font-medium p-1 md:p-2"
                  :class="day === 'Sun' || day === 'Sat' ? 'text-red-500' : 'text-gray-500'"
                >
                  {{ day }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-1 md:gap-2">
                <!-- Add empty cells for days before the month starts -->
                <div
                  v-for="emptyDay in startingDayOffset"
                  :key="'empty-' + emptyDay"
                  class="p-1 md:p-2"
                ></div>
                
                <button
                  v-for="{ date, isCurrentMonth, isToday, isWeekend } in calendarDays"
                  :key="date.toISOString()"
                  @click="isWeekend ? showWeekendModal() : selectDate(date)"
                  :disabled="!isCurrentMonth || isWeekend"
                  class="p-1 md:p-2 rounded-full text-xs md:text-sm relative"
                  :class="[
                    isCurrentMonth ? (
                      isWeekend ? 'text-red-400 hover:bg-red-50 cursor-not-allowed' : 'hover:bg-blue-800'
                    ) : 'text-gray-300',
                    isToday ? 'bg-blue-100 text-blue-600 font-semibold' : '',
                    selectedDate && date.toDateString() === selectedDate.toDateString() ? 'bg-blue-500 text-white' : '',
                    isWeekend && isCurrentMonth ? 'bg-red-50' : ''
                  ]"
                >
                  {{ date.getDate() }}
                </button>
              </div>
            </div>
    
            <!-- Time Selection -->
            <div class="space-y-3 md:space-y-4">
              <h3 class="text-base md:text-lg font-semibold text-gray-900">Select Time</h3>
              
              <div v-if="selectedServices.length === 0" class="text-center py-3 md:py-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="text-xs md:text-sm text-yellow-700">Please select a service first to see available time slots.</p>
              </div>
              
              <div v-else-if="isLoadingTimeSlots" class="text-center py-3 md:py-4">
                <div class="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-500"></div>
                <p class="mt-2 text-xs md:text-sm text-gray-600">Loading available time slots...</p>
              </div>
              
              <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  v-for="timeSlot in availableTimeSlots"
                  :key="timeSlot.startTime"
                  @click="selectTime(timeSlot.startTime)"
                  :disabled="timeSlot.isBooked"
                  class="p-2 md:p-3 rounded-lg text-center flex flex-col items-center"
                  :class="[
                    selectedTime === timeSlot.startTime ? 'bg-blue-500 text-white' : 
                    timeSlot.isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  ]"
                >
                  <span class="text-xs md:text-sm font-medium">{{ timeSlot.startTime }}</span>
                  <span class="text-[10px] md:text-xs mt-1" :class="selectedTime === timeSlot.startTime ? 'text-blue-100' : 'text-gray-500'">
                    {{ timeSlot.timeRange }}
                  </span>
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
              v-if="currentStepIndex < steps.length - 1 && canProceed"
              @click="nextStep"
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
          <div v-if="!selectedServiceType && !selectedPet && !selectedDoctor && !selectedDate" class="flex flex-col items-center justify-center h-full">
            <img 
              :src="docuImage" 
              alt="Elective Appointment" 
              class="w-48 h-48 md:w-64 md:h-64 object-cover"
            />
            <p class="text-xs md:text-sm text-gray-500 text-center">Select options on the left to see your appointment details here.</p>
          </div>
    
          <!-- Service Details -->
          <div v-else-if="currentStep.id === 'service' && selectedServiceType" class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div 
              v-for="service in selectedServiceType.services" 
              :key="service.name"
              class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
              :class="{ 'ring-2 ring-blue-500': selectedServices.includes(service.name) }"
            >
              <div class="p-3 md:p-4 flex flex-col items-center flex-grow">
                <div class="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden mb-2 md:mb-3">
                  <img 
                    :src="`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png=${encodeURIComponent(service.name)}`" 
                    :alt="service.name" 
                    class="w-full h-full object-cover"
                  />
                </div>
                <h3 class="text-xs md:text-sm font-semibold text-center mb-1 md:mb-2">{{ service.name }}</h3>
                <p v-if="serviceDurations[service.name]" class="text-[10px] md:text-xs text-blue-600 font-medium">
                  {{ serviceDurations[service.name] }} minutes
                </p>
              </div>
              <div class="flex justify-between items-center px-3 md:px-4 py-2 md:py-3 bg-gray-50 border-t border-gray-100">
                <span class="text-xs md:text-sm font-semibold">{{ service.price }}</span>
                <button 
                  @click="selectService(service)"
                  class="p-1 md:p-2 rounded-full bg-green-500 hover:bg-green-700 transition-colors"
                >
                  <component :is="selectedServices.includes(service.name) ? Check : Plus" class="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
    
          <!-- Pet Selection -->
          <div v-else-if="currentStep.id === 'pet' && selectedSpecies" class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div 
              v-for="pet in filteredPets" 
              :key="pet.id" 
              class="bg-white px shadow-lg rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :class="{ 'ring-2 ring-blue-500': selectedPet === pet }"
              @click="selectPet(pet)"
            >
              <div class="bg-gradient-to-b from-emerald-400 to-emerald-300 h-20 md:h-24 relative">
                <div class="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                  <div class="bg-white rounded-full p-1 md:p-2 shadow-lg">
                    <div class="bg-emerald-100 rounded-full p-2 md:p-3">
                      <PawPrint class="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="pt-6 md:pt-8 pb-3 md:pb-4 px-2 md:px-3">
                <div class="text-center mb-2 md:mb-3">
                  <h3 class="text-base md:text-xl font-semibold text-gray-900">{{ pet.name }}</h3>
                </div>
                <div class="grid grid-cols-3 gap-1 text-[10px] md:text-xs">
                  <div class="px-2 md:px-4 text-center">
                    <span class="block text-gray-500">Breed</span>
                    <span class="font-medium text-gray-900">{{ pet.breed }}</span>
                  </div>
                  <div class="px-2 md:px-4 text-center">
                    <span class="block text-gray-500">Age</span>
                    <span class="font-medium text-gray-900">{{ pet.age || '2' }} yrs</span>
                  </div>
                  <div class="px-2 md:px-4 text-center">
                    <span class="block text-gray-500">Weight</span>
                    <span class="font-medium text-gray-900">{{ pet.weight || '4.5' }} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Doctor Information -->
          <div v-else-if="currentStep.id === 'doctor' && selectedDoctor" class="space-y-4 md:space-y-6">
            <div class="flex flex-col items-center">
              <img 
                :src="selectedDoctor.image" 
                :alt="selectedDoctor.name"
                class="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover mb-3 md:mb-4"
              />
              <h2 class="text-xl md:text-2xl font-semibold text-gray-900">{{ selectedDoctor.name }}</h2>
              <p class="text-sm md:text-base text-gray-500">{{ selectedDoctor.specialization }}</p>
            </div>
    
            <div class="flex justify-center space-x-3 md:space-x-4">
              <button class="p-2 md:p-3 rounded-full bg-orange-300 hover:bg-orange-200 transition-colors">
                <MessageSquare class="w-4 h-4 md:w-5 md:h-5 text-orange-700" />
              </button>
              <button class="p-2 md:p-3 rounded-full bg-red-300 hover:bg-red-200 transition-colors">
                <Phone class="w-4 h-4 md:w-5 md:h-5 text-red-700" />
              </button>
              <button class="p-2 md:p-3 rounded-full bg-green-300 hover:bg-green-200 transition-colors">
                <Video class="w-4 h-4 md:w-5 md:h-5 text-green-700" />
              </button>
            </div>
    
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Biography</h3>
              <p class="text-xs md:text-sm text-gray-600 leading-relaxed">
                {{ selectedDoctor.biography }}
                <button class="text-blue-500 hover:text-blue-600 text-xs md:text-sm font-medium">
                  Read more
                </button>
              </p>
            </div>
    
            <div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Location</h3>
              <div class="relative h-36 md:h-48 rounded-xl overflow-hidden">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png" 
                  alt="Map location"
                  class="w-full h-full object-cover"
                />
                <div class="absolute bottom-3 left-3 bg-white py-1 md:py-2 px-3 md:px-4 rounded-lg shadow-md">
                  <p class="text-xs md:text-sm text-gray-900">{{ selectedDoctor.address }}</p>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Appointment Summary -->
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
                    <p v-for="service in selectedServices" :key="service" class="text-base md:text-lg font-semibold text-gray-900">
                      {{ service }}
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
              <div v-if="selectedServices.length > 0 && totalDuration" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-purple-100 rounded-full p-1 md:p-2">
                  <Clock class="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <p class="text-sm md:text-base font-medium text-gray-500">Estimated Duration</p>
                  <p class="text-base md:text-xl font-semibold text-gray-900">{{ totalDuration }} minutes</p>
                </div>
              </div>
              
              <div v-if="selectedPet" class="flex items-center space-x-3 md:space-x-4 bg-white rounded-lg p-3 md:p-4 shadow-md">
                <div class="bg-green-100 rounded-full p-1 md:p-2">
                  <PawPrint class="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm md:text-base font-medium text-gray-500">Pet</p>
                  <p class="text-base md:text-xl font-semibold text-gray-900">{{ selectedPet.name }} ({{ selectedPet.species }})</p>
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
                  <p class="text-base md:text-xl font-semibold text-gray-900">{{ selectedDoctor.name }}</p>
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
                    {{ getTimeRangeForDisplay(selectedTime) }}
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
              :disabled="!canProceed"
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
          Your appointment has been successfully booked. We look forward to seeing you and {{ selectedBookingDetails.petName }} on {{ selectedBookingDetails.formattedDate }} at {{ selectedBookingDetails.time }}.
        </p>
        <div class="bg-gray-50 rounded-lg p-3 md:p-4 w-full mb-4 md:mb-6">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Services:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ selectedBookingDetails.services.join(', ') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Doctor:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ selectedBookingDetails.doctorName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs md:text-sm text-gray-500">Duration:</span>
              <span class="text-xs md:text-sm text-gray-900 font-medium">{{ selectedBookingDetails.duration }} minutes</span>
            </div>
          </div>
        </div>
        <button 
          @click="closeSuccessModal" 
          class="w-full py-2 md:py-3 px-3 md:px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
          <Calendar class="w-6 h-6 md:w-8 md:h-8 text-red-600" />
        </div>
        <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2">Office Closed on Weekends</h2>
        <p class="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          Provincial Veterinary Office is closed every weekends. Please select a weekday (Monday to Friday) for your appointment.
        </p>
        <button 
          @click="closeWeekendModal" 
          class="w-full py-2 md:py-3 px-3 md:px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Understood
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeMount, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { 
  Stethoscope, 
  User2,
  Clock,
  CalendarDays,
  PawPrint,
  Star,
  MoreVertical,
  MessageSquare,
  Phone,
  Video,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Check,
  Edit,
  RefreshCw
} from 'lucide-vue-next'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, parse, addMinutes, setHours, setMinutes, startOfDay, endOfDay } from 'date-fns'
import docuImage from '@/assets/media/images/appointment/docu.png'

// Define props to accept isSidebarOpen from parent component
const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false
  }
})

const db = getFirestore()
const router = useRouter()

// Mobile view state
const isMobile = ref(false)
const showSecondColumn = ref(false)

// Check if the screen is mobile size
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 // 768px is the md breakpoint in Tailwind
}

// Initialize mobile detection
onBeforeMount(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// Clean up event listener
onMounted(() => {
  if (selectedDate.value) {
    fetchBookedAppointments()
  }
})

// Service durations in minutes
const serviceDurations = {
'Consultation': 30,
'Treatment': 60,
'Vaccination': 30,
'Deworming': 20,
'Supplementation': 30,
'Technical Assistance': 40,
'Mass Rabies vaccination': 30,
'Large animal castration': 60,
'Spay and neuter services': 90,
'Estrus synchronization and artificial insemination': 60,
'Epidemiological surveillance': 45,
'Veterinary medical mission': 60,
'Dog and Cat': 20,
'Pigs, Goat, Sheep': 20,
'Cattle, Carabao': 30,
'Poultry': 20,
'Ducks (1-500 heads)': 30,
'Ducks (501-1000 heads)': 45,
'Ducks (1001-2000 heads)': 60,
'Ducks (2001 above heads)': 90,
'Video Consultation': 30,
'Follow-up Consultation': 20
}

// Business hours
const businessHours = {
start: { hour: 9, minute: 0 },  // 9:00 AM
end: { hour: 17, minute: 0 }    // 5:00 PM
}

// Lunch break
const lunchBreak = {
start: { hour: 12, minute: 0 }, // 12:00 PM
end: { hour: 14, minute: 0 }    // 2:00 PM
}

// State for success modal
const showSuccessModal = ref(false)
const selectedBookingDetails = ref({
petName: '',
formattedDate: '',
time: '',
services: [],
doctorName: '',
duration: 0
})

// State for weekend modal
const showWeekendModalState = ref(false)

// State for tracking booked appointments
const bookedAppointments = ref([])
const isLoadingTimeSlots = ref(false)

const closePage = () => {
window.close()
// Fallback for browsers that don't support window.close()
if (!window.closed) {
window.history.back()
}
}

const steps = [
{ 
id: 'service', 
label: 'Service', 
icon: Stethoscope,
description: 'Choose the type of service you need'
},
{ 
id: 'pet', 
label: 'Pet', 
icon: PawPrint,
description: 'Select your pet for the appointment'
},
{ 
id: 'doctor', 
label: 'Doctor', 
icon: User2,
description: 'Choose your preferred veterinarian'
},
{ 
id: 'datetime', 
label: 'Schedule', 
icon: CalendarDays,
description: 'Pick a convenient date and time'
}
]

const serviceTypes = [
{
id: 'walk-in',
name: 'Walk-in Veterinary Services',
category: 'Consultation',
description: 'Immediate care for your pets',
image: new URL('@/assets/media/images/appointment/walkin.jpg', import.meta.url).href,
services: [
  { name: 'Consultation', price: '₱0.00' },
  { name: 'Treatment', price: '₱0.00' },
  { name: 'Vaccination', price: '₱0.00' },
  { name: 'Deworming', price: '₱0.00' },
  { name: 'Supplementation', price: '₱0.00' },
  { name: 'Technical Assistance', price: '₱0.00' }
]
},
{
id: 'elective',
name: 'Elective Veterinary Services',
category: 'Preventive Care',
description: 'Planned procedures and care',
image: new URL('@/assets/media/images/appointment/elective.jpg', import.meta.url).href, 
services: [
  { name: 'Mass Rabies vaccination', price: '₱0.00' },
  { name: 'Large animal castration', price: '₱0.00' },
  { name: 'Spay and neuter services', price: '₱0.00' },
  { name: 'Estrus synchronization and artificial insemination', price: '₱0.00' },
  { name: 'Epidemiological surveillance', price: '₱0.00' },
  { name: 'Veterinary medical mission', price: '₱0.00' }
]
},
{
id: 'health-certificate',
name: 'Veterinary Health Certificate',
category: 'Documentation',
description: 'Official documentation',
image: new URL('@/assets/media/images/appointment/certificate.jpg', import.meta.url).href,
services: [
  { name: 'Dog and Cat', price: '₱20' },
  { name: 'Pigs, Goat, Sheep', price: '₱10' },
  { name: 'Cattle, Carabao', price: '₱20' },
  { name: 'Poultry', price: '₱20' },
  { name: 'Ducks (1-500 heads)', price: '₱1/head' },
  { name: 'Ducks (501-1000 heads)', price: '₱800' },
  { name: 'Ducks (1001-2000 heads)', price: '₱1000' },
  { name: 'Ducks (2001 above heads)', price: '₱1500' },
]
},
{
id: 'telehealth',
name: 'Telehealth Services',
category: 'Virtual Care',
description: 'Remote veterinary consultations and care',
image: new URL('@/assets/media/images/appointment/online.jpg', import.meta.url).href,
services: [
  { name: 'Video Consultation', price: '₱0.00' },
  { name: 'Follow-up Consultation', price: '₱0.00' },
]
}
]

const petSpecies = [
{ id: 'dog', name: 'Dog', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png' },
{ id: 'cat', name: 'Cat', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png' },
{ id: 'bird', name: 'Bird', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png' },
{ id: 'reptile', name: 'Reptile', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png' },
{ id: 'other', name: 'Other', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png' }
]

const pets = [
{ id: 1, name: 'Max', species: 'dog', breed: 'Labrador' },
{ id: 2, name: 'Bella', species: 'dog', breed: 'Poodle' },
{ id: 3, name: 'Whiskers', species: 'cat', breed: 'Siamese' },
{ id: 4, name: 'Polly', species: 'bird', breed: 'Parrot' },
{ id: 5, name: 'Spike', species: 'reptile', breed: 'Bearded Dragon' },
]

const doctors = [
{
id: 1,
name: 'Dr. Anna Rochelle Boongaling',
specialization: 'Veterinarian',
rating: 5.0,
image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
biography: 'Dr. Liza Martin is a renowned cardiologist from a leading university medical school. Lisa received her degree in biology from Stanford University before she became a cardiologist.',
address: '123 Main Street, New York, USA'
},
{
id: 2,
name: 'Dr. Alfredo Manglicmot',
specialization: 'Veterinarian',
rating: 4.5,
image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
biography: 'Dr. Robert Wilson is a board-certified cardiologist with over 15 years of experience in treating various heart conditions.',
address: '456 Park Avenue, New York, USA'
},
] 

const currentStepIndex = ref(0)
const currentStep = computed(() => steps[currentStepIndex.value])

const selectedServiceType = ref(null)
const selectedService = ref(null)
const selectedSpecies = ref(null)
const selectedPet = ref(null)
const selectedDoctor = ref(null)
const selectedDate = ref(null)
const selectedTime = ref(null)
const selectedServices = ref([])
const currentDate = ref(new Date())

// Add these new refs for the connector line positioning
const stepsContainer = ref(null)
const connectorLine = ref(null)
const stepRefs = ref([])

// Function to position the connector line
const positionConnectorLine = () => {
  nextTick(() => {
    if (!stepsContainer.value || !connectorLine.value || stepRefs.value.length === 0) return
    
    const firstStep = stepRefs.value[0]
    const lastStep = stepRefs.value[stepRefs.value.length - 1]
    
    if (!firstStep || !lastStep) return
    
    // Get the first and last circle elements
    const firstCircle = firstStep.querySelector('.step-circle')
    const lastCircle = lastStep.querySelector('.step-circle')
    
    if (!firstCircle || !lastCircle) return
    
    // Calculate positions relative to the container
    const containerRect = stepsContainer.value.getBoundingClientRect()
    const firstRect = firstCircle.getBoundingClientRect()
    const lastRect = lastCircle.getBoundingClientRect()
    
    // Calculate the left and right positions
    const left = (firstRect.left + firstRect.width / 2) - containerRect.left
    const right = containerRect.right - (lastRect.left + lastRect.width / 2)
    
    // Set the connector line position
    connectorLine.value.style.left = `${left}px`
    connectorLine.value.style.right = `${right}px`
  })
}

// Calculate total duration from all selected services
const totalDuration = computed(() => {
if (selectedServices.value.length === 0) return null;

return selectedServices.value.reduce((total, service) => {
return total + (serviceDurations[service] || 0);
}, 0);
});

// Generate dynamic time slots based on total duration of selected services
const dynamicTimeSlots = computed(() => {
if (selectedServices.value.length === 0 || !totalDuration.value) {
return [];
}

const duration = totalDuration.value;
const slots = [];

// Create a date object for calculations
const baseDate = new Date();

// Start from business hours start
let currentHour = businessHours.start.hour;
let currentMinute = businessHours.start.minute;

while (currentHour < businessHours.end.hour || 
    (currentHour === businessHours.end.hour && currentMinute < businessHours.end.minute)) {

// Skip lunch break
if ((currentHour > lunchBreak.start.hour || 
    (currentHour === lunchBreak.start.hour && currentMinute >= lunchBreak.start.minute)) && 
    (currentHour < lunchBreak.end.hour || 
    (currentHour === lunchBreak.end.hour && currentMinute < lunchBreak.end.minute))) {
  
  // Jump to after lunch
  currentHour = lunchBreak.end.hour;
  currentMinute = lunchBreak.end.minute;
  continue;
}

// Set the current time
const startTime = setHours(setMinutes(baseDate, currentMinute), currentHour);

// Calculate end time based on total service duration
const endTime = addMinutes(startTime, duration);

// Check if the appointment would end after business hours
if (endTime.getHours() > businessHours.end.hour || 
    (endTime.getHours() === businessHours.end.hour && endTime.getMinutes() > businessHours.end.minute)) {
  break;
}

// Format times
const startTimeFormatted = format(startTime, 'h:mm a');
const endTimeFormatted = format(endTime, 'h:mm a');
const timeRange = `${startTimeFormatted}-${endTimeFormatted}`;

slots.push({
  startTime: startTimeFormatted,
  endTime: endTimeFormatted,
  timeRange: timeRange
});

// Move to next slot based on the service duration
currentMinute += duration;
if (currentMinute >= 60) {
  currentHour += Math.floor(currentMinute / 60);
  currentMinute = currentMinute % 60;
}
}

return slots;
});

// Available time slots (filtered to exclude booked slots)
const availableTimeSlots = computed(() => {
if (!dynamicTimeSlots.value.length) return [];

return dynamicTimeSlots.value.map(slot => {
// Check if this time slot is already booked
const isBooked = bookedAppointments.value.some(appointment => {
  return appointment.time === slot.startTime;
});

return {
  ...slot,
  isBooked
};
});
});

// Function to get time range for display in the appointment summary
const getTimeRangeForDisplay = (startTime) => {
if (selectedServices.value.length === 0 || !totalDuration.value) return startTime;

const duration = totalDuration.value;
const timeFormat = startTime.includes('AM') ? 'h:mm a' : 'h:mm a';
const parsedStartTime = parse(startTime, timeFormat, new Date());
const endTime = addMinutes(parsedStartTime, duration);
const formattedEndTime = format(endTime, 'h:mm a');

return `${startTime} - ${formattedEndTime}`;
}

// Function to check if a date is a weekend (Saturday or Sunday)
const isWeekend = (date) => {
const day = date.getDay();
return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

// Show weekend modal
const showWeekendModal = () => {
showWeekendModalState.value = true;
}

// Close weekend modal
const closeWeekendModal = () => {
showWeekendModalState.value = false;
}

// Fetch booked appointments for the selected date
const fetchBookedAppointments = async () => {
if (!selectedDate.value) return;

isLoadingTimeSlots.value = true;

try {
// Create start and end of day timestamps for the selected date
const start = startOfDay(selectedDate.value);
const end = endOfDay(selectedDate.value);

// Query Firestore for appointments on the selected date
const appointmentsRef = collection(db, 'appointments');
const q = query(
  appointmentsRef,
  where('date', '>=', start),
  where('date', '<=', end)
);

const querySnapshot = await getDocs(q);
bookedAppointments.value = [];

querySnapshot.forEach((doc) => {
  const data = doc.data();
  bookedAppointments.value.push({
    id: doc.id,
    time: data.time,
    doctorId: data.doctorId,
    duration: data.duration
  });
});
} catch (error) {
console.error('Error fetching booked appointments:', error);
} finally {
isLoadingTimeSlots.value = false;
}
};

// Watch for changes in selected services to reset time if needed
watch(selectedServices, (newServices, oldServices) => {
if (newServices.length !== oldServices.length || 
  !newServices.every((service, index) => service === oldServices[index])) {
selectedTime.value = null;
}
});

// Watch for changes in selected date to fetch booked appointments
watch(selectedDate, (newDate) => {
if (newDate) {
selectedTime.value = null;
fetchBookedAppointments();
}
});

// Add this computed property to calculate the offset for the first day of the month
const startingDayOffset = computed(() => {
const start = startOfMonth(currentDate.value);
return start.getDay(); // Returns 0-6 (Sunday-Saturday)
});

// Modify the calendarDays computed property
const calendarDays = computed(() => {
const start = startOfMonth(currentDate.value);
const end = endOfMonth(currentDate.value);

// Get all days in the month
return eachDayOfInterval({ start, end }).map(date => ({
date,
isCurrentMonth: true,
isToday: date.toDateString() === new Date().toDateString(),
isWeekend: isWeekend(date)
}));
});

const currentMonthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))

const filteredPets = computed(() => {
return pets.filter(pet => pet.species === selectedSpecies.value)
})

const canBook = computed(() => 
selectedServices.value.length > 0 && 
selectedPet.value && 
selectedDoctor.value && 
selectedDate.value &&
selectedTime.value
)

// Updated to ensure both date AND time are selected for the datetime step
const canProceed = computed(() => {
switch (currentStep.value.id) {
case 'service':
  return selectedServices.value.length > 0
case 'pet':
  return !!selectedPet.value
case 'doctor':
  return !!selectedDoctor.value
case 'datetime':
  return !!selectedDate.value && !!selectedTime.value // Both date and time must be selected
default:
  return false
}
})

const formatDate = (date) => {
return format(date, 'EEEE, MMMM d, yyyy')
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
    case 'service':
      selectedServiceType.value = null
      selectedService.value = null
      selectedServices.value = []
      break
    case 'pet':
      selectedSpecies.value = null
      selectedPet.value = null
      break
    case 'doctor':
      selectedDoctor.value = null
      break
    case 'datetime':
      selectedDate.value = null
      selectedTime.value = null
      break
  }
  
  // On mobile, ensure we're showing the first column after reset
  if (isMobile.value) {
    showSecondColumn.value = false
  }
}

// Modified to automatically show second column on mobile when selected
const selectServiceType = (serviceType) => {
// Toggle selection
if (selectedServiceType.value && selectedServiceType.value.id === serviceType.id) {
  selectedServiceType.value = null
  selectedService.value = null
  selectedServices.value = []
  // Go back to previous step if deselecting
  if (currentStepIndex.value > 0) {
    currentStepIndex.value = 0
  }
} else {
  selectedServiceType.value = serviceType
  selectedService.value = null
  selectedServices.value = []
  
  // Show second column on mobile after selection
  if (isMobile.value) {
    showSecondColumn.value = true
  }
}
}

const selectService = (service) => {
const index = selectedServices.value.indexOf(service.name)
if (index === -1) {
  selectedServices.value.push(service.name)
} else {
  selectedServices.value.splice(index, 1)
}

// Update the primary selected service for display purposes
selectedService.value = selectedServices.value.length > 0 ? selectedServices.value[0] : null
}

// Modified to automatically show second column on mobile when selected
const selectSpecies = (speciesId) => {
// Toggle selection
if (selectedSpecies.value === speciesId) {
  selectedSpecies.value = null
  selectedPet.value = null
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
  
  // Show second column on mobile after selection
  if (isMobile.value) {
    showSecondColumn.value = true
  }
}
}

// Modified to automatically show second column on mobile when selected
const selectPet = (pet) => {
// Toggle selection if clicking the same pet
if (selectedPet.value === pet) {
  selectedPet.value = null
  // Go back to previous step if deselecting
  if (currentStepIndex.value > 1) {
    currentStepIndex.value = 1
  }
  
  // On mobile, go back to first column when deselecting
  if (isMobile.value) {
    showSecondColumn.value = false
  }
} else {
  selectedPet.value = pet
  
  // Show second column on mobile after selection
  if (isMobile.value) {
    showSecondColumn.value = true
  }
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
}
}

// Modified to automatically show second column on mobile when selected
// and to toggle date selection
const selectDate = (date) => {
  // Only select the date if it's not a weekend
  if (!isWeekend(date)) {
    // Toggle selection if clicking the same date
    if (selectedDate.value && date.toDateString() === selectedDate.value.toDateString()) {
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

// Modified to automatically show second column on mobile when selected
// and to toggle time selection
const selectTime = (time) => {
  // Toggle selection if clicking the same time
  if (selectedTime.value === time) {
    selectedTime.value = null
    
    // On mobile, go back to first column when deselecting
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  } else {
    selectedTime.value = time
    
    // Show second column on mobile after time selection
    if (isMobile.value) {
      showSecondColumn.value = true
    }
  }
}

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1 && canProceed.value) {
    currentStepIndex.value++
    
    // On mobile, go back to first column for next step
    if (isMobile.value) {
      showSecondColumn.value = false
    }
  }
}

const previousStep = () => {
if (currentStepIndex.value > 0) {
  currentStepIndex.value--
  
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
selectedServiceType.value = null
selectedService.value = null
selectedSpecies.value = null
selectedPet.value = null
selectedDoctor.value = null
selectedDate.value = null
selectedTime.value = null
selectedServices.value = []
currentStepIndex.value = 0
showSecondColumn.value = false
}

const bookAppointment = async () => {
if (!canBook.value) return

try {
// Create appointment data
const appointmentData = {
  serviceType: selectedServiceType.value.name,
  services: selectedServices.value,
  duration: totalDuration.value,
  petId: selectedPet.value.id,
  petName: selectedPet.value.name,
  doctorId: selectedDoctor.value.id,
  doctorName: selectedDoctor.value.name,
  date: selectedDate.value,
  time: selectedTime.value,
  timeRange: getTimeRangeForDisplay(selectedTime.value),
  userId: 'current-user-id',
  status: 'pending',
  createdAt: new Date()
}

// Add to Firestore
const docRef = await addDoc(collection(db, 'appointments'), appointmentData)

// Update booked appointments list
bookedAppointments.value.push({
  id: docRef.id,
  time: selectedTime.value,
  doctorId: selectedDoctor.value.id,
  duration: totalDuration.value
})

// Set booking details for success modal
selectedBookingDetails.value = {
  petName: selectedPet.value.name,
  formattedDate: formatDate(selectedDate.value),
  time: selectedTime.value,
  services: selectedServices.value,
  doctorName: selectedDoctor.value.name,
  duration: totalDuration.value
}

// Show success modal
showSuccessModal.value = true

} catch (error) {
console.error('Error booking appointment:', error)
alert('Failed to book appointment. Please try again.')
}
}

// Call the positioning function on mount and when window resizes
onMounted(() => {
  // Initialize the step refs array
  stepRefs.value = Array(steps.length).fill(null)
  
  // Position the connector line
  positionConnectorLine()
  
  // Add resize listener
  window.addEventListener('resize', positionConnectorLine)
  
  // Fetch initial booked appointments if date is selected
  if (selectedDate.value) {
    fetchBookedAppointments()
  }
})

// Clean up the resize listener
onBeforeUnmount(() => {
  window.removeEventListener('resize', positionConnectorLine)
})

// Watch for changes that might affect the layout
watch(() => steps.length, positionConnectorLine)
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

