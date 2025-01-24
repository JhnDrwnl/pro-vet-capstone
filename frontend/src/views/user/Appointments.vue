<template>
    <div class="bg-white shadow-lg rounded-lg p-4 mb-8">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-medium text-gray-600">New Appointment</h1>
        <button
          @click="closePage"
          class="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
    <div class="flex justify-between items-center mb-6">
        <div v-for="(step, index) in steps" :key="step.id" class="relative flex flex-col items-center flex-1">
          <!-- Connector line -->
          <div 
            v-if="index < steps.length - 1" 
            class="absolute w-full h-1 top-8 left-1/2"
            :class="[ 
              currentStepIndex >= index + 1 ? 'bg-[#2d80eb]' : 'bg-[#D1D5DB]' 
            ]"
          ></div>
          
          <!-- Icon -->
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center relative z-10 transition-all duration-200"
            :class="[ 
              currentStepIndex > index ? 'bg-[#2d80eb] text-white' : 
              currentStepIndex === index ? 'bg-[#2d80eb] text-white' : 
              'bg-[#F9FAFB] text-[#D1D5DB]'
            ]"
          >
            <component :is="step.icon" class="w-8 h-8" />
          </div>
          
          <!-- Label -->
          <span 
            class="mt-2 text-sm font-medium"
            :class="[ 
              currentStepIndex >= index ? 'text-[#4B5563]' : 'text-[#D1D5DB]' 
            ]"
          >
            {{ step.label }}
          </span>
        </div>
      </div>

    <!-- Main Content -->
    <div class="flex space-x-6">
      <!-- Left Container -->
      <div class="w-1/2 bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-[#4B5563] mb-6">{{ currentStep.label }}</h2>
        <p class="text-sm text-[#4B5563] mb-6">{{ currentStep.description }}</p>

        <!-- Service Type Selection -->
        <div v-if="currentStep.id === 'service'" class="grid grid-cols-3 gap-4">
          <div 
            v-for="serviceType in serviceTypes" 
            :key="serviceType.id" 
            class="relative bg-white rounded-3xl p-4 shadow-lg hover:shadow-md transition-all duration-200 cursor-pointer"
            :class="{ 'ring-2 ring-blue-500': selectedServiceType === serviceType }"
          >
            <div class="relative aspect-square rounded-lg overflow-hidden mb-3">
              <img 
                :src="serviceType.image" 
                :alt="serviceType.name" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="text-center">
              <h3 class="font-semibold text-gray-900">{{ serviceType.name }}</h3>
              <p class="text-sm text-gray-500">{{ serviceType.category }}</p>
              <p class="text-xs text-gray-500">{{ serviceType.description }}</p>
              <p class="mt-2 text-lg font-bold">{{ serviceType.price }}</p>
            </div>
            <button 
              @click.stop="selectServiceType(serviceType)"
              class="absolute right-2 top-2 w-8 h-8 bg-orange-300 text-orange-900 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-500 transition-colors"
            >
              <component :is="selectedServiceType && selectedServiceType.id === serviceType.id ? Check : Plus" class="w-4 h-4" />
            </button>
          </div>
        </div>


        <!-- Pet Species Selection -->
        <div v-if="currentStep.id === 'pet'" class="grid grid-cols-3 gap-4">
          <div 
            v-for="species in petSpecies" 
            :key="species.id" 
            class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
            :class="{ 'ring-2 ring-blue-500': selectedSpecies === species.id }"
          >
            <div class="p-4 flex flex-col items-center flex-grow">
              <div class="w-24 h-24 rounded-full overflow-hidden mb-3">
                <img 
                  :src="species.image" 
                  :alt="species.name" 
                  class="w-full h-full object-cover"
                />
              </div>
              <h3 class="text-sm font-semibold text-center mb-2">{{ species.name }}</h3>
              <p class="text-xs text-gray-500 text-center mb-4">Common household pet</p>
            </div>
            <div class="flex justify-center items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button 
                @click="selectSpecies(species.id)"
                class="p-2 rounded-full bg-green-500 hover:bg-green-800 transition-colors"
              >
                <component :is="selectedSpecies === species.id ? Check : Plus" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Doctor List -->
        <div v-if="currentStep.id === 'doctor'" class="space-y-3">
          <div 
            v-for="doctor in doctors" 
            :key="doctor.id" 
            class="flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-200"
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
              class="w-16 h-16 rounded-xl object-cover"
            />
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">{{ doctor.name }}</h3>
                <button class="text-gray-400 hover:text-gray-600">
                  <MoreVertical class="w-5 h-5" />
                </button>
              </div>
              <p class="text-gray-500">{{ doctor.specialization }}</p>
              <div class="flex items-center mt-1">
                <Star 
                  v-for="i in 5" 
                  :key="i"
                  class="w-4 h-4"
                  :class="i <= doctor.rating ? 'text-yellow-400' : 'text-gray-200'"
                  :fill="i <= doctor.rating ? 'currentColor' : 'none'"
                />
                <span class="ml-1 text-sm text-gray-600">{{ doctor.rating }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Month Selection -->
        <div v-if="currentStep.id === 'datetime'" class="space-y-4">
          <div class="bg-white rounded-lg shadow-lg p-4">
            <div class="flex justify-between items-center mb-4 bg-blue-100 p-3 rounded-lg">
              <button @click="previousMonth" class="text-gray-600 hover:text-gray-800">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <h3 class="text-lg font-semibold">{{ currentMonthYear }}</h3>
              <button @click="nextMonth" class="text-gray-600 hover:text-gray-800">
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
            <div class="grid grid-cols-7 gap-2 mb-2">
              <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center text-sm font-medium text-gray-500">
                {{ day }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-2">
              <button
                v-for="{ date, isCurrentMonth, isToday } in calendarDays"
                :key="date.toISOString()"
                @click="selectDate(date)"
                :disabled="!isCurrentMonth"
                :class="[
                  'p-2 rounded-full text-sm',
                  isCurrentMonth ? 'hover:bg-blue-800' : 'text-gray-300',
                  isToday ? 'bg-blue-100 text-blue-600 font-semibold' : '',
                  selectedDate && date.toDateString() === selectedDate.toDateString() ? 'bg-blue-500 text-white' : ''
                ]"
              >
                {{ date.getDate() }}
              </button>
            </div>
          </div>

          <!-- Time Selection -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Select Time</h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="time in availableTimes"
                :key="time"
                @click="selectTime(time)"
                class="p-2 rounded-full text-center"
                :class="[
                  selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                ]"
              >
                {{ time }}
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-8">
          <button
            v-if="currentStepIndex > 0"
            @click="previousStep"
            class="px-6 py-2 text-sm bg-gray-300 font-medium rounded-full text-[#4B5563] hover:bg-gray-100"
          >
            Back
          </button>
          
          <button
            v-if="currentStepIndex < steps.length - 1"
            @click="nextStep"
            :disabled="!canProceed"
            class="ml-auto px-6 py-2 text-sm font-medium bg-blue-200 text-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Right Container -->
      <div class="w-1/2 bg-white shadow-lg rounded-lg p-6">
        <div v-if="!selectedServiceType && !selectedPet && !selectedDoctor && !selectedDate" class="flex flex-col items-center justify-center h-full">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png" alt="Empty state" class="w-32 h-32 mb-4" />
          <p class="text-lg text-gray-500 text-center">Select options on the left to see your appointment details here.</p>
        </div>
        <div v-else>

        <!-- Specific Service Selection -->
        <div v-if="currentStep.id === 'service' && selectedServiceType" class="grid grid-cols-3 gap-4">
          <div 
            v-for="service in selectedServiceType.services" 
            :key="service.name"
            class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
            :class="{ 'ring-2 ring-blue-500': selectedServices.includes(service.name) }"
          >
            <div class="p-4 flex flex-col items-center flex-grow">
              <div class="w-24 h-24 rounded-full overflow-hidden mb-3">
                <img 
                  :src="`https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png=${encodeURIComponent(service.name)}`" 
                  :alt="service.name" 
                  class="w-full h-full object-cover"
                />
              </div>
              <h3 class="text-sm font-semibold text-center mb-2">{{ service.name }}</h3>
              <p class="text-xs text-gray-500 text-center mb-4">Professional veterinary care</p>
            </div>
            <div class="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-100">
              <span class="text-sm font-semibold">{{ service.price }}</span>
              <button 
                @click="selectService(service)"
                class="p-2 rounded-full bg-green-500 hover:bg-gray-200 transition-colors"
              >
                <component :is="selectedServices.includes(service.name) ? Check : Plus" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pet Selection -->
        <div v-if="currentStep.id === 'pet' && selectedSpecies" class="grid grid-cols-3 gap-4">
          <div 
            v-for="pet in filteredPets" 
            :key="pet.id" 
            class="bg-white px shadow-lg rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          :class="{ 'ring-2 ring-blue-500': selectedPet === pet }"
            @click="selectPet(pet)"
          >
           <!-- Top Section with Background -->
           <div class="bg-gradient-to-b from-emerald-400 to-emerald-300 h-24 relative">
            <!-- Pet Icon Circle -->
            <div class="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
              <div class="bg-white rounded-full p-2 shadow-lg">
                <div class="bg-emerald-100 rounded-full p-3">
                  <PawPrint class="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
          <div class="pt-8 pb-4 px-3">
            <!-- Pet Information -->
            <div class="text-center mb-3">
              <h3 class="text-xl font-semibold text-gray-900">{{ pet.name }}</h3>
        </div>
        <div class="grid grid-cols-3 gap-1 text-xs">
              <div class="px-4 text-center">
                <span class="block text-gray-500">Breed</span>
                <span class="font-medium text-gray-900">{{ pet.breed }}</span>
              </div>
              <div class=" px-4 text-center">
                <span class="block text-gray-500">Age</span>
                <span class="font-medium text-gray-900">{{ pet.age || '2' }} yrs</span>
              </div>
              <div class=" px-4 text-center">
                <span class="block text-gray-500">Weight</span>
                <span class="font-medium text-gray-900">{{ pet.weight || '4.5' }} kg</span>
              </div>
            </div>
            </div>
      </div>
    </div>

        <!-- Doctor Information -->
        <div v-if="currentStep.id === 'doctor' && selectedDoctor" class="space-y-6">
          <!-- Doctor Header -->
          <div class="flex flex-col items-center">
            <img 
              :src="selectedDoctor.image" 
              :alt="selectedDoctor.name"
              class="w-32 h-32 rounded-2xl object-cover mb-4"
            />
            <h2 class="text-2xl font-semibold text-gray-900">{{ selectedDoctor.name }}</h2>
            <p class="text-gray-500">{{ selectedDoctor.specialization }}</p>
          </div>

          <!-- Contact Buttons -->
          <div class="flex justify-center space-x-4">
            <button class="p-3 rounded-full bg-orange-300 hover:bg-orange-200 transition-colors">
              <MessageSquare class="w-5 h-5 text-orange-700" />
            </button>
            <button class="p-3 rounded-full bg-red-300 hover:bg-red-200 transition-colors">
              <Phone class="w-5 h-5 text-red-700" />
            </button>
            <button class="p-3 rounded-full bg-green-300 hover:bg-green-200 transition-colors">
              <Video class="w-5 h-5 text-green-700" />
            </button>
          </div>

          <!-- Biography -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Biography</h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              {{ selectedDoctor.biography }}
              <button class="text-blue-500 hover:text-blue-600 text-sm font-medium">
                Read more
              </button>
            </p>
          </div>

          <!-- Location -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Location</h3>
            <div class="relative h-48 rounded-xl overflow-hidden">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png" 
                alt="Map location"
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-3 left-3 bg-white py-2 px-4 rounded-lg shadow-md">
                <p class="text-sm text-gray-900">{{ selectedDoctor.address }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Day and Time Selection -->
        <div v-if="currentStep.id === 'datetime'" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Appointment Summary</h2>

          <div class="rounded-xl p-6 space-y-4">
            <div v-if="selectedService" class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-md">
              <div class="bg-blue-100 rounded-full p-2">
                <Stethoscope class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p class="text-base font-medium text-gray-500">Service</p>
                <p class="text-xl font-semibold text-gray-900">{{ selectedService }}</p>
              </div>
            </div>
            <div v-if="selectedPet" class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-md">
              <div class="bg-green-100 rounded-full p-2">
                <PawPrint class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p class="text-base font-medium text-gray-500">Pet</p>
                <p class="text-xl font-semibold text-gray-900">{{ selectedPet.name }} ({{ selectedPet.species }})</p>
              </div>
            </div>
            <div v-if="selectedDoctor" class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-md">
              <div class="bg-purple-100 rounded-full p-2">
                <User2 class="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p class="text-base font-medium text-gray-500">Doctor</p>
                <p class="text-xl font-semibold text-gray-900">{{ selectedDoctor.name }}</p>
              </div>
            </div>
            <div v-if="selectedDate" class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-md">
              <div class="bg-red-100 rounded-full p-2">
                <Calendar class="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p class="text-base font-medium text-gray-500">Date</p>
                <p class="text-xl font-semibold text-gray-900">{{ formatDate(selectedDate) }}</p>
              </div>
            </div>
            <div v-if="selectedTime" class="flex items-center space-x-4 bg-white rounded-lg p-4 shadow-md">
              <div class="bg-yellow-100 rounded-full p-2">
                <Clock class="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p class="text-base font-medium text-gray-500">Time</p>
                <p class="text-xl font-semibold text-gray-900">{{ selectedTime }}</p>
              </div>
            </div>
          </div>

          <!-- Book Button -->
          <button
            v-if="canBook"
            @click="bookAppointment"
            class="w-full mt-6 px-6 py-4 text-xl font-bold bg-blue-600 shadow-lg text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Book Appointment
          </button>

          <!-- Empty State -->
          <div 
            v-if="currentStep.id === 'datetime' && !canBook"
            class="mt-6 text-center text-gray-500"
          >
            Please select a date and time to book your appointment
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
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
} from 'lucide-vue-next'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from 'date-fns'

const db = getFirestore()
const router = useRouter()

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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
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
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
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
    name: 'Dr. Liza Martin',
    specialization: 'Cardiologist',
    rating: 5.0,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
    biography: 'Dr. Liza Martin is a renowned cardiologist from a leading university medical school. Lisa received her degree in biology from Stanford University before she became a cardiologist.',
    address: '123 Main Street, New York, USA'
  },
  {
    id: 2,
    name: 'Dr. Robert Wilson',
    specialization: 'Cardiologist',
    rating: 4.5,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
    biography: 'Dr. Robert Wilson is a board-certified cardiologist with over 15 years of experience in treating various heart conditions.',
    address: '456 Park Avenue, New York, USA'
  },
  {
    id: 3,
    name: 'Dr. Sarah Johnson',
    specialization: 'Veterinary Surgeon',
    rating: 4.8,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oVmg5oLuNeuUvIQ9vHK5ZK1V1UBL7u.png',
    biography: 'Dr. Sarah Johnson specializes in advanced veterinary surgical procedures with a focus on minimally invasive techniques.',
    address: '789 Oak Street, New York, USA'
  }
]

const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']

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

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    isCurrentMonth: true,
    isToday: date.toDateString() === new Date().toDateString()
  }))
})

const currentMonthYear = computed(() => format(currentDate.value, 'MMMM yyyy'))

const filteredPets = computed(() => {
  return pets.filter(pet => pet.species === selectedSpecies.value)
})

const canBook = computed(() => 
  selectedService.value && 
  selectedPet.value && 
  selectedDoctor.value && 
  selectedDate.value &&
  selectedTime.value
)

const canProceed = computed(() => {
  switch (currentStep.value.id) {
    case 'service':
      return selectedServices.value.length > 0
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

const formatDate = (date) => {
  return format(date, 'EEEE, MMMM d, yyyy')
  
}

const selectServiceType = (serviceType) => {
  selectedServiceType.value = selectedServiceType.value && selectedServiceType.value.id === serviceType.id ? null : serviceType
  selectedService.value = null
  selectedServices.value = []
}

const selectService = (service) => {
  const index = selectedServices.value.indexOf(service.name)
  if (index === -1) {
    selectedServices.value.push(service.name)
  } else {
    selectedServices.value.splice(index, 1)
  }
  selectedService.value = selectedServices.value.length > 0 ? selectedServices.value[0] : null
}

const selectSpecies = (speciesId) => {
  selectedSpecies.value = speciesId === selectedSpecies.value ? null : speciesId
  selectedPet.value = null
}

const selectPet = (pet) => {
  selectedPet.value = pet
}

const selectDoctor = (doctor) => {
  selectedDoctor.value = doctor
}

const selectDate = (date) => {
  selectedDate.value = date
  selectedTime.value = null
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

const nextMonth = () => {
  currentDate.value = addMonths(currentDate.value, 1)
}

const previousMonth = () => {
  currentDate.value = subMonths(currentDate.value, 1)
}

const bookAppointment = async () => {
  if (!canBook.value) return

  try {
    await addDoc(collection(db, 'appointments'), {
      serviceType: selectedServiceType.value.name,
      service: selectedService.value,
      petId: selectedPet.value.id,
      petName: selectedPet.value.name,
      doctorId: selectedDoctor.value.id,
      doctorName: selectedDoctor.value.name,
      date: selectedDate.value,
      time: selectedTime.value,
      userId: 'current-user-id',
      status: 'pending',
      createdAt: new Date()
    })

    // Reset form after successful booking
    selectedServiceType.value = null
    selectedService.value = null
    selectedSpecies.value = null
    selectedPet.value = null
    selectedDoctor.value = null
    selectedDate.value = null
    selectedTime.value = null
    selectedServices.value = []
    currentStepIndex.value = 0

    alert('Appointment booked successfully!')
  } catch (error) {
    console.error('Error booking appointment:', error)
    alert('Failed to book appointment. Please try again.')
  }
}
</script>

