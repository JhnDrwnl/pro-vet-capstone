<template>
  <div class="min-h-screen bg-white rounded-2xl p-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column (2/3 width on large screens) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
          <div class="text-white z-10 max-w-[60%]">
            <h1 class="text-2xl font-bold mb-2">Welcome to ProVET!</h1>
            <p class="text-sm text-blue-100 mb-4">Track your pet's health, manage appointments, and get reminders for vaccinations.</p>
            <router-link 
              to="/user/userappointments" 
              class="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors inline-flex items-center"
            >
              Connect to Doctor
            </router-link>
          </div>
          <div class="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end">
            <img src="/src/assets/media/images/common/banner.png" 
     alt="Veterinarian with dog illustration" 
     class="h-full object-contain" />


          </div>
        </div>

        <!-- Educational Resources -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-blue/50">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-800">Educational Resources</h2>
            <button class="text-blue-600 text-xs font-medium">View All</button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(resource, index) in educationalResources" :key="index" 
                class="flex border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                @click="openResource(index)">
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
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-blue/50">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-800">My Pets</h2>
            <router-link 
              to="/user/profile" 
              class="text-blue-600 text-xs font-medium flex items-center"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              Add Pet 
            </router-link>
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
        <!-- Calendar Component -->
        <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue/50">
          <!-- Calendar Header with gradient background -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-bold flex items-center">
                <CalendarIcon class="w-5 h-5 mr-2" />
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <div class="flex space-x-1">
                <button @click="prevMonth" class="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors">
                  <ChevronLeftIcon class="h-4 w-4" />
                </button>
                <button @click="nextMonth" class="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors">
                  <ChevronRightIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="p-4">
            <!-- Days of the week -->
            <div class="grid grid-cols-7 gap-2 text-center mb-3">
              <span v-for="day in weekDays" :key="day" class="text-xs font-semibold text-gray-500">
                {{ day }}
              </span>
            </div>

            <!-- Calendar dates -->
            <div class="grid grid-cols-7 gap-2 text-center">
              <div v-for="i in firstDayOfMonth" :key="'b-' + i" class="w-9 h-9"></div>
              
              <div v-for="date in daysInMonth" :key="date"
                :class="[
                  'w-9 h-9 mx-auto flex items-center justify-center text-xs rounded-full cursor-pointer relative transition-all duration-200',
                  getDateClass(date)
                ]"
                @click="selectDate(date)"
              >
                {{ date }}
                <!-- Appointment indicator dots -->
                <div v-if="hasAppointment(date)" class="absolute -bottom-1 flex space-x-0.5 justify-center">
                  <div v-for="(type, index) in getAppointmentTypes(date)" :key="index"
                    :class="`w-1.5 h-1.5 rounded-full ${type.color}`"></div>
                </div>
              </div>
            </div>
            
            <!-- Selected date info with enhanced appointment details -->
            <div v-if="selectedDate" class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-sm font-medium text-gray-800">
                  {{ monthNames[currentMonth] }} {{ selectedDate }}, {{ currentYear }}
                </h3>
                <span v-if="isToday(selectedDate)" class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Today</span>
              </div>
              
              <div v-if="getSelectedDateAppointments().length > 0" class="space-y-3">
              
                <div v-for="(appt, index) in getSelectedDateAppointments()" :key="index" 
                  class="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center">
                    <div :class="`w-10 h-10 rounded-lg flex items-center justify-center ${getAppointmentBgColor(appt.type)}`">
                      <span :class="`text-lg ${getAppointmentTextColor(appt.type)}`">{{ getAppointmentIcon(appt.type) }}</span>
                    </div>
                    <div class="ml-3 flex-1">
                      <div class="flex justify-between items-start">
                        <h3 class="text-sm font-medium text-gray-800">{{ appt.title }}</h3>
                        <span :class="`text-xs px-2 py-0.5 rounded-full ${getAppointmentTagColor(appt.type)} ${getAppointmentTagTextColor(appt.type)}`">
                          {{ capitalizeFirstLetter(appt.type) }}
                        </span>
                      </div>
                      <div class="flex items-center text-xs text-gray-500 mt-1">
                        <ClockIcon class="w-3 h-3 mr-1" />
                        <span>{{ appt.time }}</span>
                        <span class="mx-1">•</span>
                        <span>{{ appt.duration || '30 min' }}</span>
                      </div>
                      <div class="flex items-center text-xs text-gray-500 mt-1">
                        <UserIcon class="w-3 h-3 mr-1" />
                        <span>{{ appt.doctor || 'Dr. Smith' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
                <CalendarIcon class="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p class="text-xs text-gray-500">No appointments scheduled</p>
                <button class="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                  + Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
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

    <!-- Resource Modal -->
    <div v-if="selectedResource !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <div class="flex items-center">
            <span :class="`px-2 py-0.5 rounded-full text-xs ${educationalResources[selectedResource].tagColor} ${educationalResources[selectedResource].tagTextColor}`">
              {{ educationalResources[selectedResource].tag }}
            </span>
            <span class="text-xs text-gray-500 ml-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              {{ educationalResources[selectedResource].duration }}
            </span>
          </div>
          <button @click="closeResource" class="p-1 rounded-full hover:bg-gray-100">
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div class="p-6">
          <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            <img :src="educationalResources[selectedResource].image" :alt="educationalResources[selectedResource].title" class="w-full h-full object-cover" />
          </div>
          
          <h1 class="text-2xl font-bold mb-4">{{ educationalResources[selectedResource].title }}</h1>
          
          <div class="prose max-w-none">
            <p v-html="educationalResources[selectedResource].content"></p>
          </div>
          
          <div class="mt-8 flex justify-between items-center pt-4 border-t">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ educationalResources[selectedResource].author }}</p>
                <p class="text-xs text-gray-500">{{ educationalResources[selectedResource].authorTitle }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button class="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <BookmarkIcon class="w-4 h-4 text-gray-600" />
              </button>
              <button class="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <ShareIcon class="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-lg font-medium mb-4">Related Resources</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="flex border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div class="w-16 h-16 bg-blue-50 flex-shrink-0">
                  <img :src="`/placeholder.svg?height=64&width=64`" alt="Related resource" class="w-full h-full object-cover" />
                </div>
                <div class="p-2 flex-1">
                  <h4 class="text-sm font-medium line-clamp-2">{{ i === 1 ? 'Common Health Issues in Pets' : 'Nutrition Guide for Pets' }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ i === 1 ? '4 min read' : '6 min read' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  Phone as PhoneIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Plus as PlusIcon,
  User as UserIcon,
  X as XIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon
} from 'lucide-vue-next';

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(today.getDate());
const selectedResource = ref(null);

const openResource = (index) => {
  selectedResource.value = index;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

const closeResource = () => {
  selectedResource.value = null;
  document.body.style.overflow = ''; // Restore scrolling
};

const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

const firstDayOfMonth = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  // Convert Sunday (0) to 7 for our Monday-first calendar
  return firstDay === 0 ? 6 : firstDay - 1;
});

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
  selectedDate.value = null;
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
  selectedDate.value = null;
};

const selectDate = (date) => {
  selectedDate.value = date;
};

const isToday = (date) => {
  return date === today.getDate() && 
         currentMonth.value === today.getMonth() && 
         currentYear.value === today.getFullYear();
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Calendar appointment data with enhanced details
const calendarAppointments = [
  { 
    date: 8, 
    title: 'Vaccination', 
    time: '9:30 AM', 
    duration: '45 min',
    doctor: 'Dr. Martinez',
    type: 'medical', 
    color: 'bg-blue-500' 
  },
  { 
    date: 15, 
    title: 'Grooming', 
    time: '2:00 PM', 
    duration: '1 hour',
    doctor: 'Emma Wilson',
    type: 'grooming', 
    color: 'bg-purple-500' 
  },
  { 
    date: 15, 
    title: 'Check-up', 
    time: '3:30 PM', 
    duration: '30 min',
    doctor: 'Dr. Johnson',
    type: 'medical', 
    color: 'bg-blue-500' 
  },
  { 
    date: 22, 
    title: 'Dental Cleaning', 
    time: '11:00 AM', 
    duration: '1 hour',
    doctor: 'Dr. Patel',
    type: 'dental', 
    color: 'bg-green-500' 
  },
  { 
    date: today.getDate(), 
    title: 'Annual Exam', 
    time: '10:00 AM', 
    duration: '45 min',
    doctor: 'Dr. Thompson',
    type: 'medical', 
    color: 'bg-blue-500' 
  }
];

const hasAppointment = (date) => {
  return calendarAppointments.some(appt => appt.date === date);
};

const getAppointmentTypes = (date) => {
  const appointments = calendarAppointments.filter(appt => appt.date === date);
  const types = [];
  const typeMap = {};
  
  appointments.forEach(appt => {
    if (!typeMap[appt.type]) {
      typeMap[appt.type] = true;
      types.push({ type: appt.type, color: appt.color });
    }
  });
  
  return types;
};

const getSelectedDateAppointments = () => {
  if (!selectedDate.value) return [];
  return calendarAppointments.filter(appt => 
    appt.date === selectedDate.value
  );
};

const getDateClass = (date) => {
  if (isToday(date)) {
    return 'bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md';
  } else if (selectedDate.value === date) {
    return 'bg-blue-100 text-blue-700 font-medium border-2 border-blue-500';
  } else if (hasAppointment(date)) {
    return 'hover:bg-blue-50 text-gray-800 font-medium pb-1';
  } else {
    return 'hover:bg-gray-100 text-gray-700';
  }
};

// Helper functions for appointment styling
const getAppointmentIcon = (type) => {
  switch(type) {
    case 'medical': return '💉';
    case 'grooming': return '✂️';
    case 'dental': return '🦷';
    default: return '📅';
  }
};

const getAppointmentBgColor = (type) => {
  switch(type) {
    case 'medical': return 'bg-blue-100';
    case 'grooming': return 'bg-purple-100';
    case 'dental': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

const getAppointmentTextColor = (type) => {
  switch(type) {
    case 'medical': return 'text-blue-600';
    case 'grooming': return 'text-purple-600';
    case 'dental': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const getAppointmentTagColor = (type) => {
  switch(type) {
    case 'medical': return 'bg-blue-100';
    case 'grooming': return 'bg-purple-100';
    case 'dental': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

const getAppointmentTagTextColor = (type) => {
  switch(type) {
    case 'medical': return 'text-blue-600';
    case 'grooming': return 'text-purple-600';
    case 'dental': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

// Educational Resources
const educationalResources = [
  {
    title: "How to Brush Your Dog's Teeth: A Step-by-Step Guide",
    image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nJTIwdGVldGh8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    tag: "Article",
    tagColor: "bg-blue-100",
    tagTextColor: "text-blue-600",
    duration: "5 min read",
    author: "Dr. Sarah Johnson",
    authorTitle: "Veterinary Dentist",
    content: `
      <h2>Introduction</h2>
      <p>Maintaining your dog's dental health is crucial for their overall well-being. Just like humans, dogs can suffer from plaque buildup, gum disease, and tooth decay. Regular brushing is one of the most effective ways to keep your dog's teeth clean and prevent dental issues.</p>
      
      <h2>Why Brush Your Dog's Teeth?</h2>
      <p>Dental disease affects up to 80% of dogs over the age of three. Poor dental hygiene can lead to:</p>
      <ul>
        <li>Bad breath</li>
        <li>Painful gums and teeth</li>
        <li>Tooth loss</li>
        <li>Bacterial infections that can spread to vital organs</li>
      </ul>
      
      <h2>What You'll Need</h2>
      <ul>
        <li>Dog-specific toothpaste (never use human toothpaste as it contains ingredients toxic to dogs)</li>
        <li>A dog toothbrush, finger brush, or soft children's toothbrush</li>
        <li>Treats for positive reinforcement</li>
        <li>Patience and a calm environment</li>
      </ul>
      
      <h2>Step 1: Get Your Dog Comfortable</h2>
      <p>Before you start brushing, spend a few days getting your dog used to having their mouth and teeth touched. Gently lift their lips and touch their teeth and gums with your finger. Reward them with praise and treats for staying calm.</p>
      
      <h2>Step 2: Introduce the Toothpaste</h2>
      <p>Let your dog taste a small amount of the toothpaste from your finger. Most dog toothpastes come in flavors like chicken or beef that dogs find appealing. This helps create a positive association with the toothpaste.</p>
      
      <h2>Step 3: Introduce the Toothbrush</h2>
      <p>Once your dog is comfortable with the toothpaste, put a small amount on the toothbrush and let them lick it off. This helps them get used to the brush.</p>
      
      <h2>Step 4: Begin Brushing</h2>
      <p>Start by brushing just a few teeth. Lift your dog's lip and place the brush at a 45-degree angle to the gumline. Use gentle, circular motions to clean the teeth and gumline. Focus on the outer surfaces of the teeth, as most plaque accumulates there.</p>
      
      <h2>Step 5: Gradually Increase Brushing Time</h2>
      <p>Over several sessions, gradually increase the number of teeth you brush until you can clean all of them in one sitting. Aim to brush for about 30 seconds on each side of your dog's mouth.</p>
      
      <h2>Step 6: Make it a Routine</h2>
      <p>For best results, brush your dog's teeth daily. If that's not possible, aim for at least 2-3 times per week. Consistency is key to preventing plaque buildup.</p>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Keep sessions short and positive, especially when starting out</li>
        <li>Always reward your dog with praise and treats after brushing</li>
        <li>Try to brush at the same time each day to establish a routine</li>
        <li>If your dog resists, take a step back and reintroduce more gradually</li>
        <li>Consider dental chews and toys as supplements to brushing, not replacements</li>
      </ul>
      
      <h2>When to See a Vet</h2>
      <p>If you notice any of the following signs, consult your veterinarian:</p>
      <ul>
        <li>Persistent bad breath</li>
        <li>Red, swollen, or bleeding gums</li>
        <li>Yellow or brown tartar buildup</li>
        <li>Loose or missing teeth</li>
        <li>Difficulty eating or decreased appetite</li>
        <li>Excessive drooling</li>
      </ul>
      
      <p>Remember, regular professional dental cleanings by your veterinarian are also an important part of your dog's dental care routine.</p>
    `
  },
  {
    title: "Common Cat Behaviors Explained",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    tag: "Video",
    tagColor: "bg-red-100",
    tagTextColor: "text-red-600",
    duration: "8 min watch",
    author: "Dr. Emily Chen",
    authorTitle: "Feline Behavior Specialist",
    content: `
      <h2>Understanding Your Cat's Behavior</h2>
      <p>Cats communicate primarily through body language and vocalizations. Learning to interpret these signals can help strengthen your bond with your feline friend and address any behavioral issues that may arise.</p>
      
      <div class="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
        <div class="text-center p-4">
          <PlayIcon class="w-12 h-12 text-gray-400 mx-auto" />
          <p class="text-sm text-gray-500 mt-2">Video player placeholder</p>
        </div>
      </div>
      
      <h2>Common Cat Behaviors Decoded</h2>
      
      <h3>Purring</h3>
      <p>While purring often indicates contentment, cats may also purr when they're anxious, ill, or in pain. It's a self-soothing mechanism. Context is key to understanding what your cat's purr means.</p>
      
      <h3>Kneading</h3>
      <p>That rhythmic pushing of paws against soft surfaces is a behavior cats retain from kittenhood. Kittens knead their mother's belly to stimulate milk flow. When adult cats do this, it typically indicates comfort and contentment.</p>
      
      <h3>Head Butting</h3>
      <p>When your cat bumps their head against you, they're marking you with scent glands located on their face. This "bunting" behavior is a sign of affection and ownership.</p>
      
      <h3>Slow Blinking</h3>
      <p>Often called a "cat kiss," slow blinking is a sign of trust and affection. Try slow blinking at your cat and see if they return the gesture!</p>
      
      <h3>Tail Positions</h3>
      <ul>
        <li><strong>Upright tail:</strong> Confidence, contentment</li>
        <li><strong>Puffed tail:</strong> Fear or aggression</li>
        <li><strong>Tail tucked under body:</strong> Anxiety or submission</li>
        <li><strong>Swishing tail:</strong> Concentration or irritation</li>
      </ul>
      
      <h3>Chattering</h3>
      <p>That distinctive chatter cats make when watching birds or insects is believed to be either excitement or frustration at not being able to catch prey.</p>
      
      <h3>Bringing "Gifts"</h3>
      <p>When your cat brings you dead prey, they're not being cruel. They're actually showing affection by sharing their hunting success with you or trying to teach you how to hunt.</p>
      
      <h2>Understanding Problematic Behaviors</h2>
      
      <h3>Inappropriate Elimination</h3>
      <p>If your cat stops using the litter box, it's often a sign of a medical issue or stress. Always rule out medical causes first, then look at environmental factors like litter box cleanliness, location, or household changes.</p>
      
      <h3>Aggression</h3>
      <p>Cat aggression can stem from fear, territorial disputes, play, or redirected frustration. Identifying the trigger is key to addressing the behavior.</p>
      
      <h3>Excessive Grooming</h3>
      <p>Cats are naturally fastidious, but excessive grooming that leads to bald spots or skin irritation can indicate stress, allergies, or other medical issues.</p>
      
      <p>Remember, sudden behavioral changes in cats often indicate health problems. When in doubt, consult your veterinarian.</p>
    `
  },
  {
    title: "Puppy Vaccination Schedule: What You Need to Know",
    image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHVwcHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    tag: "Guide",
    tagColor: "bg-green-100",
    tagTextColor: "text-green-600",
    duration: "7 min read",
    author: "Dr. Michael Rodriguez",
    authorTitle: "Veterinary Immunologist",
    content: `
      <h2>Why Vaccinations Are Important</h2>
      <p>Vaccinations protect your puppy from several potentially fatal diseases. They work by stimulating the immune system to recognize and fight specific infections. Proper vaccination is one of the most important things you can do to give your puppy a healthy start in life.</p>
      
      <h2>Core Vaccines for All Puppies</h2>
      <p>The following vaccines are considered essential for all dogs, regardless of lifestyle or location:</p>
      
      <h3>Distemper</h3>
      <p>Canine distemper is a highly contagious viral disease that affects the respiratory, gastrointestinal, and nervous systems. It can be fatal, and those who survive often have permanent neurological damage.</p>
      
      <h3>Parvovirus</h3>
      <p>Parvo is a highly contagious virus that causes severe vomiting, bloody diarrhea, and dehydration. It's often fatal, especially in young puppies, and the virus can remain in the environment for months or years.</p>
      
      <h3>Adenovirus (Hepatitis)</h3>
      <p>This virus causes infectious canine hepatitis, which affects the liver, kidneys, and eyes. Severe cases can be fatal.</p>
      
      <h3>Rabies</h3>
      <p>Rabies is a fatal viral disease that affects the central nervous system and is transmissible to humans. Vaccination is required by law in most areas.</p>
      
      <h2>Non-Core Vaccines</h2>
      <p>These vaccines may be recommended based on your puppy's risk factors:</p>
      
      <h3>Bordetella (Kennel Cough)</h3>
      <p>Recommended for dogs that will be in boarding facilities, dog parks, training classes, or other settings with many dogs.</p>
      
      <h3>Leptospirosis</h3>
      <p>Important for dogs who may be exposed to wildlife or standing water that could be contaminated with this bacterial infection.</p>
      
      <h3>Lyme Disease</h3>
      <p>Recommended in areas where Lyme disease is prevalent and for dogs who spend time in wooded or tick-infested areas.</p>
      
      <h3>Canine Influenza</h3>
      <p>Suggested for dogs in areas with outbreaks or those who will be in settings with many other dogs.</p>
      
      <h2>Typical Puppy Vaccination Schedule</h2>
      
      <h3>6-8 Weeks</h3>
      <ul>
        <li>Distemper, Parvovirus (some vets also include Adenovirus)</li>
        <li>Bordetella (if risk factors present)</li>
      </ul>
      
      <h3>10-12 Weeks</h3>
      <ul>
        <li>DHPP (Distemper, Hepatitis/Adenovirus, Parvovirus, Parainfluenza)</li>
        <li>Leptospirosis (if recommended)</li>
        <li>Lyme (if recommended)</li>
        <li>Canine Influenza (if recommended)</li>
      </ul>
      
      <h3>16 Weeks</h3>
      <ul>
        <li>DHPP</li>
        <li>Rabies</li>
        <li>Leptospirosis booster (if recommended)</li>
        <li>Lyme booster (if recommended)</li>
        <li>Canine Influenza booster (if recommended)</li>
      </ul>
      
      <h3>12-16 Months</h3>
      <ul>
        <li>DHPP booster</li>
        <li>Rabies booster (if 1-year vaccine was given initially)</li>
        <li>Other non-core vaccine boosters as recommended</li>
      </ul>
      
      <h3>Adult (Every 1-3 Years)</h3>
      <ul>
        <li>DHPP (typically every 3 years)</li>
        <li>Rabies (every 1-3 years, depending on vaccine used and local laws)</li>
        <li>Non-core vaccines as recommended</li>
      </ul>
      
      <h2>Important Considerations</h2>
      
      <h3>Timing Is Critical</h3>
      <p>Puppies receive antibodies from their mother's milk that protect them early in life but also interfere with vaccines. The vaccination schedule is designed to provide protection as these maternal antibodies wane.</p>
      
      <h3>Socialization During Vaccination Period</h3>
      <p>While your puppy isn't fully protected until they've completed their vaccination series, socialization during this critical period is also important. Discuss with your vet how to safely expose your puppy to new experiences while minimizing disease risk.</p>
      
      <h3>Vaccine Reactions</h3>
      <p>While rare, vaccine reactions can occur. Mild reactions include temporary soreness or mild fever. Severe reactions are uncommon but can include vomiting, facial swelling, or difficulty breathing. Contact your vet immediately if you notice concerning symptoms after vaccination.</p>
      
      <p>Always consult with your veterinarian to create a vaccination schedule tailored to your puppy's specific needs and risk factors.</p>
    `
  },
  {
    title: "Recognizing Signs of Pain in Your Pet",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2ljayUyMHBldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    tag: "FAQ",
    tagColor: "bg-purple-100",
    tagTextColor: "text-purple-600",
    duration: "4 min read",
    author: "Dr. Lisa Taylor",
    authorTitle: "Veterinary Pain Specialist",
    content: `
      <h2>Why Pain Recognition Matters</h2>
      <p>Our pets can't tell us when they're in pain, but they do communicate through behavioral and physical changes. Recognizing these signs early can lead to faster treatment and relief for your pet. Many pet owners are surprised to learn that animals instinctively hide their pain as a survival mechanism, making detection even more challenging.</p>
      
      <h2>Common Signs of Pain in Dogs</h2>
      
      <h3>Behavioral Changes</h3>
      <ul>
        <li><strong>Decreased activity:</strong> Reluctance to walk, climb stairs, jump, or play</li>
        <li><strong>Aggression:</strong> Growling, pinned ears, or biting when approached or touched</li>
        <li><strong>Vocalization:</strong> Whining, groaning, or crying, especially when moving</li>
        <li><strong>Antisocial behavior:</strong> Seeking isolation or avoiding interaction</li>
        <li><strong>Restlessness:</strong> Inability to get comfortable, pacing, or constant repositioning</li>
      </ul>
      
      <h3>Physical Signs</h3>
      <ul>
        <li><strong>Altered posture:</strong> Hunched back, "prayer position" (front end down, rear end up)</li>
        <li><strong>Limping or favoring a limb</strong></li>
        <li><strong>Stiff movement:</strong> Difficulty rising or lying down</li>
        <li><strong>Heavy panting</strong> when not hot or exercising</li>
        <li><strong>Trembling or shaking</strong></li>
        <li><strong>Swelling</strong> of joints or other body parts</li>
      </ul>
      
      <h2>Common Signs of Pain in Cats</h2>
      
      <h3>Behavioral Changes</h3>
      <ul>
        <li><strong>Reduced activity:</strong> Less jumping, playing, or climbing</li>
        <li><strong>Litter box issues:</strong> Avoiding the litter box or difficulty getting in/out</li>
        <li><strong>Decreased grooming:</strong> Unkempt appearance (or conversely, excessive grooming of a painful area)</li>
        <li><strong>Hiding:</strong> Spending more time under beds or in closets</li>
        <li><strong>Aggression:</strong> Hissing or scratching when touched</li>
        <li><strong>Changes in appetite</strong></li>
      </ul>
      
      <h3>Physical Signs</h3>
      <ul>
        <li><strong>Altered facial expression:</strong> Squinted eyes, flattened ears</li>
        <li><strong>Hunched posture</strong></li>
        <li><strong>Stiff or stilted gait</strong></li>
        <li><strong>Lameness</strong> or favoring a limb</li>
        <li><strong>Guarding:</strong> Protecting a specific body part</li>
      </ul>
      
      <h2>Frequently Asked Questions</h2>
      
      <h3>Q: How can I tell if my pet's pain is an emergency?</h3>
      <p><strong>A:</strong> Seek immediate veterinary care if your pet shows any of these signs:</p>
      <ul>
        <li>Inability to walk</li>
        <li>Extreme vocalization</li>
        <li>Difficulty breathing</li>
        <li>Severe bleeding</li>
        <li>Inability to urinate or defecate</li>
        <li>Collapse or loss of consciousness</li>
      </ul>
      
      <h3>Q: Are certain pets more likely to hide pain?</h3>
      <p><strong>A:</strong> Yes, cats are notorious for hiding pain until it becomes severe. Senior pets may also show less obvious signs as they've adapted to chronic pain over time.</p>
      
      <h3>Q: Can behavior changes be due to something other than pain?</h3>
      <p><strong>A:</strong> Absolutely. Behavior changes can also indicate stress, anxiety, or illness. However, pain should always be considered as a possible cause and ruled out by your veterinarian.</p>
      
      <h3>Q: How is pain treated in pets?</h3>
      <p><strong>A:</strong> Treatment depends on the cause but may include:</p>
      <ul>
        <li>Prescription pain medications (never give human pain medications without veterinary guidance)</li>
        <li>Anti-inflammatory drugs</li>
        <li>Physical therapy</li>
        <li>Acupuncture</li>
        <li>Weight management</li>
        <li>Surgery for underlying conditions</li>
      </ul>
      
      <h3>Q: Can I give my pet over-the-counter pain medication?</h3>
      <p><strong>A:</strong> No. Many human pain medications, including acetaminophen (Tylenol) and ibuprofen (Advil), are toxic to pets. Always consult your veterinarian before giving any medication.</p>
      
      <p>Remember, you know your pet best. If something seems "off," trust your instincts and consult your veterinarian. Early intervention can prevent suffering and lead to better outcomes.</p>
    `
  }
];

// Pets
const pets = [
  {
    name: "Max",
    image: "/placeholder.svg?height=128&width=128",
    breed: "Golden Retriever",
    age: "3 years",
    status: "Healthy",
    statusColor: "text-green-600",
    nextAppointment: "Oct 15"
  },
  {
    name: "Luna",
    image: "/placeholder.svg?height=128&width=128",
    breed: "Siamese Cat",
    age: "2 years",
    status: "Vaccination Due",
    statusColor: "text-yellow-600",
    nextAppointment: "Oct 8"
  },
  {
    name: "Charlie",
    image: "/placeholder.svg?height=128&width=128",
    breed: "Beagle",
    age: "5 years",
    status: "Medication",
    statusColor: "text-blue-600",
    nextAppointment: "Oct 22"
  }
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

.prose {
  color: #374151;
  max-width: 65ch;
  font-size: 1rem;
  line-height: 1.75;
}

.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose h2 {
  color: #111827;
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}

.prose h3 {
  color: #111827;
  font-weight: 600;
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
}

.prose ul {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
  list-style-type: disc;
}

.prose li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose strong {
  font-weight: 600;
  color: #111827;
}
</style>

