<template>
  <div class="min-h-screen bg-white rounded-2xl p-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2/3 width on large screens) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-[#1e3a8a] rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
          <div class="text-white z-10 max-w-[60%]">
            <h1 class="text-2xl font-bold mb-2">Pet Care Made Easy!</h1>
            <p class="text-sm text-blue-100 mb-4">Track your pet's health, manage appointments, and get reminders for vaccinations.</p>
            <button class="bg-white text-[#1e3a8a] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors">
              Book Appointment
            </button>
          </div>
          <div class="absolute right-0 top-0 h-full">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gsTlbnx0KsjionRScbFtOgLtZZFIBI.png" 
              alt="Pet owner with dog" 
              class="h-full object-cover opacity-20 lg:opacity-100"
            />
          </div>
        </div>

        <!-- Educational Resources -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-800">Educational Resources</h2>
            <button class="text-blue-600 text-xs font-medium">View All</button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(resource, index) in educationalResources" :key="index" 
                 class="flex border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div class="w-24 h-24 bg-blue-100 flex-shrink-0">
                <img :src="resource.image" :alt="resource.title" class="w-full h-full object-cover" />
              </div>
              <div class="p-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center mb-1">
                    <span :class="`text-xs px-2 py-0.5 rounded-full ${resource.tagColor} ${resource.tagTextColor}`">
                      {{ resource.tag }}
                    </span>
                  </div>
                  <h3 class="text-sm font-medium text-gray-800 line-clamp-2">{{ resource.title }}</h3>
                </div>
                <div class="flex items-center text-xs text-gray-500">
                  <ClockIcon class="w-3 h-3 mr-1" />
                  <span>{{ resource.duration }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Pets -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-800">My Pets</h2>
            <button class="text-blue-600 text-xs font-medium flex items-center">
              <PlusIcon class="w-4 h-4 mr-1" />
              Add Pet
            </button>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="(pet, index) in pets" :key="index" 
                 class="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div class="h-32 bg-blue-50 relative">
                <img :src="pet.image" :alt="pet.name" class="w-full h-full object-cover" />
                <div class="absolute bottom-0 right-0 m-2">
                  <span :class="`text-xs px-2 py-0.5 rounded-full bg-white ${pet.statusColor}`">
                    {{ pet.status }}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-base font-medium text-gray-800">{{ pet.name }}</h3>
                  <span class="text-xs text-gray-500">{{ pet.age }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ pet.breed }}</p>
                <div class="flex justify-between items-center mt-3">
                  <button class="text-blue-600 text-xs font-medium">View Details</button>
                  <div class="flex items-center text-xs text-gray-500">
                    <CalendarIcon class="w-3 h-3 mr-1" />
                    <span>{{ pet.nextAppointment }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column (1/3 width on large screens) -->
      <div class="space-y-6">
        <!-- Calendar -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">October 2023</h2>
            <div class="flex space-x-2">
              <button class="text-gray-400">
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              <button class="text-gray-400">
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <!-- Calendar days -->
          <div class="grid grid-cols-7 gap-2 text-center mb-2">
            <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day" class="text-xs text-gray-500">
              {{ day }}
            </span>
          </div>
          
          <!-- Calendar dates -->
          <div class="grid grid-cols-7 gap-2 text-center">
            <div v-for="date in 31" :key="date" 
                 :class="[
                   'w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-full',
                   date === 8 ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 text-gray-700'
                 ]">
              {{ date }}
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-800">Schedule</h2>
            <button class="text-blue-600 text-xs font-medium">View All</button>
          </div>
          
          <!-- Appointment items -->
          <div class="space-y-4">
            <div v-for="(appointment, index) in appointments" :key="index" 
                 class="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
              <div :class="`w-10 h-10 rounded-lg flex items-center justify-center ${appointment.bgColor}`">
                <span :class="`text-lg ${appointment.textColor}`">{{ appointment.icon }}</span>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-sm font-medium text-gray-800">{{ appointment.title }}</h3>
                <p class="text-xs text-gray-500">{{ appointment.time }} • {{ appointment.doctor }}</p>
              </div>
              <ChevronRightIcon class="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <!-- Emergency Contact (Moved from left column) -->
        <div class="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100">
          <div class="flex flex-col">
            <div class="flex items-center mb-4">
              <div class="bg-red-100 p-2 rounded-full mr-3">
                <PhoneIcon class="w-5 h-5 text-red-600" />
              </div>
              <h2 class="text-lg font-semibold text-gray-800">Emergency Contact</h2>
            </div>
            
            <p class="text-sm text-gray-600 mb-4">
              If your pet is experiencing a medical emergency, please call our emergency line immediately:
            </p>
            
            <a href="tel:+1234567890" class="bg-red-600 text-white px-4 py-3 rounded-full text-center font-medium hover:bg-red-700 transition-colors flex items-center justify-center mb-3">
              <PhoneIcon class="w-4 h-4 mr-2" />
              (123) 456-7890
            </a>
            
            <p class="text-xs text-gray-500 text-center">
              Available 24/7 for urgent care
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  Phone as PhoneIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Plus as PlusIcon
} from 'lucide-vue-next';

// Educational Resources
const educationalResources = [
  {
    title: "How to Brush Your Dog's Teeth: A Step-by-Step Guide",
    image: "/placeholder.svg?height=96&width=96",
    tag: "Article",
    tagColor: "bg-blue-100",
    tagTextColor: "text-blue-600",
    duration: "5 min read"
  },
  {
    title: "Common Cat Behaviors Explained",
    image: "/placeholder.svg?height=96&width=96",
    tag: "Video",
    tagColor: "bg-red-100",
    tagTextColor: "text-red-600",
    duration: "8 min watch"
  },
  {
    title: "Puppy Vaccination Schedule: What You Need to Know",
    image: "/placeholder.svg?height=96&width=96",
    tag: "Guide",
    tagColor: "bg-green-100",
    tagTextColor: "text-green-600",
    duration: "7 min read"
  },
  {
    title: "Recognizing Signs of Pain in Your Pet",
    image: "/placeholder.svg?height=96&width=96",
    tag: "FAQ",
    tagColor: "bg-purple-100",
    tagTextColor: "text-purple-600",
    duration: "4 min read"
  }
];

// Pets
const pets = [
  {
    name: "Max",
    image: new URL('@/assets/media/images/pets/max.jpg', import.meta.url).href,
    breed: "Golden Retriever",
    age: "3 years",
    status: "Healthy",
    statusColor: "text-green-600",
    nextAppointment: "Oct 15"
  },
  {
    name: "Luna",
    image: new URL('@/assets/media/images/pets/luna.jpg', import.meta.url).href,
    breed: "Siamese Cat",
    age: "2 years",
    status: "Vaccination Due",
    statusColor: "text-yellow-600",
    nextAppointment: "Oct 8"
  },
  {
    name: "Charlie",
    image: new URL('@/assets/media/images/pets/beagle.jpg', import.meta.url).href,
    breed: "Beagle",
    age: "5 years",
    status: "Medication",
    statusColor: "text-blue-600",
    nextAppointment: "Oct 22"
  }
];

// Appointments
const appointments = [
  {
    title: "Vaccination",
    time: "09:30 - 10:30",
    doctor: "Dr. Martinez",
    icon: "💉",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600"
  },
  {
    title: "Dental Cleaning",
    time: "13:00 - 14:00",
    doctor: "Dr. Johnson",
    icon: "🦷",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600"
  },
  
];
</script>

<style scoped>
/* Add any additional custom styles here */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

