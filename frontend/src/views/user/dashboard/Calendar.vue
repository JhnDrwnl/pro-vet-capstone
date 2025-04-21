<template>
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
      
      <!-- Selected date info with appointment details -->
      <div v-if="selectedDate" class="mt-4 pt-4 border-t border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-medium text-gray-800">
            {{ monthNames[currentMonth] }} {{ selectedDate }}, {{ currentYear }}
          </h3>
          <span v-if="isToday(selectedDate)" class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">Today</span>
        </div>
        
        <div v-if="getSelectedDateAppointments().length > 0">
          <div v-for="(appt, index) in getSelectedDateAppointments().slice(0, 2)" :key="index" 
            class="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors mb-2">
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
              </div>
            </div>
          </div>
          <div v-if="getSelectedDateAppointments().length > 2" class="text-center text-xs text-blue-600 mt-2">
            + {{ getSelectedDateAppointments().length - 2 }} more appointments
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
</template>

<script setup>
import { ref, computed, defineExpose } from 'vue';
import { 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  User as UserIcon
} from 'lucide-vue-next';

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(today.getDate());

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

// Expose methods and data that might be needed by the parent component
defineExpose({
  currentMonth,
  currentYear,
  selectedDate,
  monthNames,
  daysInMonth,
  firstDayOfMonth,
  nextMonth,
  prevMonth,
  selectDate,
  isToday,
  hasAppointment,
  getAppointmentTypes,
  getSelectedDateAppointments,
  getDateClass
});
</script>