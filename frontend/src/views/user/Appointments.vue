<template>
  <div class="space-y-6">
    <!-- Main Content -->
    <div class="bg-white shadow rounded-lg">
      <!-- Stepper -->
      <div class="p-6 border-b border-[#D1D5DB]">
        <div class="flex justify-between items-center">
          <div v-for="(step, index) in steps" :key="step.id" class="relative flex flex-col items-center flex-1">
            <!-- Connector line -->
            <div 
              v-if="index < steps.length - 1" 
              class="absolute w-full h-0.5 top-5 left-1/2"
              :class="[ 
                currentStepIndex >= index + 1 ? 'bg-[#2d80eb]' : 'bg-[#D1D5DB]' 
              ]"
            ></div>
            
            <!-- Icon -->
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-200"
              :class="[ 
                currentStepIndex > index ? 'bg-[#2d80eb] text-[#4B5563]' : 
                currentStepIndex === index ? 'bg-[#2d80eb] text-[#4B5563]' : 
                'bg-[#F9FAFB] text-[#D1D5DB]'
              ]"
            >
              <component :is="step.icon" class="w-5 h-5" />
            </div>
            
            <!-- Label -->
            <span 
              class="mt-2 text-xs font-medium"
              :class="[ 
                currentStepIndex >= index ? 'text-[#4B5563]' : 'text-[#D1D5DB]' 
              ]"
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="p-6">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold text-[#4B5563]">{{ currentStep.label }}</h2>
          <p class="mt-1 text-sm text-[#4B5563]">{{ currentStep.description }}</p>
        </div>

        <!-- Service Selection -->
        <Services
          v-if="currentStep.id === 'service'"
          :selected-service="selectedService"
          @select="selectService"
        />

        <!-- Pet Selection -->
        <Pets
          v-if="currentStep.id === 'pet'"
          :selected-pet="selectedPet"
          @select="selectPet"
        />

        <!-- Doctor Selection -->
        <Doctors
          v-if="currentStep.id === 'doctor'"
          :selected-doctor="selectedDoctor"
          @select="selectDoctor"
        />

        <!-- Date & Time Selection -->
        <Schedule
          v-if="currentStep.id === 'datetime'"
          :selected-date="selectedDate"
          :selected-time="selectedTime"
          @select-date="selectDate"
          @select-time="selectTime"
        />

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8">
          <button
            v-if="currentStepIndex > 0"
            @click="previousStep"
            class="px-6 py-2 text-sm font-medium text-[#4B5563] hover:text-[#2d80eb]"
          >
            Back
          </button>
          
          <button
            v-if="currentStepIndex < steps.length - 1"
            @click="nextStep"
            :disabled="!canProceed"
            class="ml-auto px-6 py-2 text-sm font-medium bg-[#E3FF75] text-[#4B5563] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          
          <button
            v-else
            @click="bookAppointment"
            :disabled="!canBook"
            class="ml-auto"
          >
            <div class="flex items-center justify-between bg-[#E3FF75] rounded-lg px-6 py-2">
              <div class="flex items-center space-x-2 text-sm text-[#4B5563]">
                <Calendar class="w-4 h-4" />
                <span>{{ selectedDate ? formatDate(selectedDate.value) : 'Select date' }}</span>
                <span class="text-[#D1D5DB]">|</span>
                <Clock class="w-4 h-4" />
                <span>{{ selectedTime || 'Select time' }}</span>
              </div>
              <span class="font-medium ml-4 text-[#4B5563]">Book</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { 
  Stethoscope, 
  User2,
  Calendar,
  Clock,
  CalendarDays,
  PawPrint,
} from 'lucide-vue-next'
import Services from '@/components/user/Services.vue'
import Pets from '@/components/user/Pets.vue'
import Doctors from '@/components/user/Doctors.vue'
import Schedule from '@/components/user/Schedules.vue'

const db = getFirestore()

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

const currentStepIndex = ref(0)
const currentStep = computed(() => steps[currentStepIndex.value])

const selectedService = ref(null)
const selectedDoctor = ref(null)
const selectedPet = ref(null)
const selectedDate = ref(null)
const selectedTime = ref(null)

const canBook = computed(() => 
  selectedService.value && 
  selectedDoctor.value && 
  selectedPet.value && 
  selectedDate.value && 
  selectedTime.value
)

const canProceed = computed(() => {
  switch (currentStep.value.id) {
    case 'service':
      return !!selectedService.value
    case 'pet':
      return !!selectedPet.value
    case 'doctor':
      return !!selectedDoctor.value
    case 'datetime':
      return !!selectedDate.value && !!selectedTime.value
    default:
      return false
  }
})

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateString))
}

const selectService = (service) => {
  selectedService.value = service
  nextStep()
}

const selectPet = (pet) => {
  selectedPet.value = pet
  nextStep()
}

const selectDoctor = (doctor) => {
  selectedDoctor.value = doctor
  nextStep()
}

const selectDate = (date) => {
  selectedDate.value = date
}

const selectTime = (time) => {
  selectedTime.value = time
}

const nextStep = () => {
  if (currentStepIndex.value < steps.length - 1 && canProceed.value) {
    currentStepIndex.value++
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

const bookAppointment = async () => {
  if (!canBook.value) return

  try {
    await addDoc(collection(db, 'appointments'), {
      serviceId: selectedService.value.id,
      doctorId: selectedDoctor.value.id,
      petId: selectedPet.value.id,
      date: selectedDate.value.value,
      time: selectedTime.value,
      userId: 'current-user-id',
      status: 'pending',
      createdAt: new Date()
    })

    // Reset form after successful booking
    selectedService.value = null
    selectedDoctor.value = null
    selectedPet.value = null
    selectedDate.value = null
    selectedTime.value = null
    currentStepIndex.value = 0

    alert('Appointment booked successfully!')
  } catch (error) {
    console.error('Error booking appointment:', error)
    alert('Failed to book appointment. Please try again.')
  }
}
</script>
