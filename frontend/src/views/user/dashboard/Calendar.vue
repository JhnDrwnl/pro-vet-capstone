<!-- views/user/dashboard/Calendar.vue -->
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
      <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
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
    <div v-for="(appt, index) in getSelectedDateAppointments()" :key="index" 
      class="p-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors mb-2">
      <!-- Appointment card styled exactly like the screenshot -->
      <div class="flex items-center">
        <!-- Service image - larger and without frame -->
        <img 
          v-if="getServiceImage(appt)" 
          :src="getServiceImage(appt)" 
          :alt="getAppointmentTitle(appt)"
          class="w-10 h-10 object-cover rounded mr-3"
        />
        <!-- Fallback to emoji or icon if no image -->
        <template v-else>
          <div class="w-10 h-10 flex items-center justify-center mr-3">
            <span v-if="getAppointmentIcon(appt) === '🦷'" class="text-2xl">🦷</span>
            <span v-else-if="getAppointmentIcon(appt) === '💉'" class="text-2xl">💉</span>
            <span v-else-if="getAppointmentIcon(appt) === '✂️'" class="text-2xl">✂️</span>
            <CalendarIcon v-else class="w-7 h-7 text-blue-600" />
          </div>
        </template>
        
        <div class="flex-1">
          <!-- Top row: Title with all services -->
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-medium text-gray-800">
              {{ getAllServicesTitle(appt) }}
            </h3>
            <!-- Service category badge - styled like the screenshot -->
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
              {{ getServiceCategory(appt) }}
            </span>
          </div>
          
          <!-- Bottom row: Time and duration -->
          <div class="flex items-center text-xs text-gray-500 mt-1">
            <ClockIcon class="w-3 h-3 mr-1" />
            <span>{{ appt.time || 'No time specified' }}</span>
            <span class="ml-1">• {{ calculateDurationFromTimeRange(appt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
    <CalendarIcon class="w-6 h-6 text-gray-400 mx-auto mb-2" />
    <p class="text-xs text-gray-500">No appointments scheduled</p>
  </div>
</div>
</div>
</div>
</template>

<script setup>
import { ref, computed, defineExpose, onMounted, watch } from 'vue';
import { 
Clock as ClockIcon, 
Calendar as CalendarIcon, 
ChevronLeft as ChevronLeftIcon,
ChevronRight as ChevronRightIcon
} from 'lucide-vue-next';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { useAuthStore } from '@/stores/modules/authStore';
import { useServiceCategoryStore } from '@/stores/modules/ServiceCategoryStore';
import { format, isToday as isTodayFn } from 'date-fns';

const appointmentStore = useAppointmentStore();
const authStore = useAuthStore();
const serviceCategoryStore = useServiceCategoryStore();

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(today.getDate());
const isLoading = ref(false);

// Store for services data
const services = ref([]);
const categories = ref([]);

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
currentMonth.value = (currentMonth.value + 1) % 12;
if (currentMonth.value === 0) {
  currentYear.value += 1;
}
selectedDate.value = null;
};

const prevMonth = () => {
currentMonth.value = (currentMonth.value + 11) % 12;
if (currentMonth.value === 11) {
  currentYear.value -= 1;
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

// Store for approved appointments
const approvedAppointments = ref([]);

// Function to get service image from storage
const getServiceImage = (appointment) => {
// If appointment has a service ID, try to find its image
if (appointment.services && appointment.services.length > 0) {
const serviceId = appointment.services[0];
const service = services.value.find(s => s.id === serviceId);

if (service && service.coverPhoto) {
  return service.coverPhoto;
}
}

// If appointment has a type, try to find a matching category image
if (appointment.type) {
const matchingCategory = categories.value.find(cat => 
  cat.name.toLowerCase().includes(appointment.type.toLowerCase())
);

if (matchingCategory && matchingCategory.coverPhoto) {
  return matchingCategory.coverPhoto;
}
}

// Return null if no image found
return null;
};

// Function to get service category
const getServiceCategory = (appointment) => {
// If appointment has services, try to find the category
if (appointment.services && appointment.services.length > 0) {
const serviceId = appointment.services[0];
const service = services.value.find(s => s.id === serviceId);

if (service) {
  // Find the category for this service
  const category = categories.value.find(cat => cat.id === service.categoryId);
  if (category) {
    return category.name;
  }
}
}

// Fallback to the appointment type if available
return appointment.type || 'Medical';
};

// Function to get all services as a single title
const getAllServicesTitle = (appointment) => {
if (appointment.serviceNames && appointment.serviceNames.length > 0) {
  // Join all service names with commas
  return appointment.serviceNames.join(', ');
}
return 'Appointment';
};

// Function to calculate duration from time range
const calculateDurationFromTimeRange = (appointment) => {
  // If we have a time range, calculate the duration
  if (appointment.time && appointment.time.includes('-')) {
    const [startTime, endTime] = appointment.time.split('-').map(t => t.trim());
    
    // Try to parse the times
    try {
      // Handle formats like "9:00 AM - 9:20 AM"
      const startParts = startTime.match(/(\d+):(\d+)\s*(am|pm)?/i);
      const endParts = endTime.match(/(\d+):(\d+)\s*(am|pm)?/i);
      
      if (startParts && endParts) {
        let startHour = parseInt(startParts[1], 10);
        const startMinute = parseInt(startParts[2], 10);
        const startPeriod = startParts[3]?.toLowerCase();
        
        let endHour = parseInt(endParts[1], 10);
        const endMinute = parseInt(endParts[2], 10);
        const endPeriod = endParts[3]?.toLowerCase();
        
        // Convert to 24-hour format if AM/PM is specified
        if (startPeriod) {
          if (startPeriod === 'pm' && startHour < 12) startHour += 12;
          if (startPeriod === 'am' && startHour === 12) startHour = 0;
        }
        
        if (endPeriod) {
          if (endPeriod === 'pm' && endHour < 12) endHour += 12;
          if (endPeriod === 'am' && endHour === 12) endHour = 0;
        }
        
        // Calculate duration in minutes
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const durationMinutes = endMinutes - startMinutes;
        
        // Ensure we don't return negative durations
        if (durationMinutes <= 0) {
          // If the calculated duration is 0 or negative, check if we have service durations
          if (appointment.serviceDurations && appointment.serviceDurations.length > 0) {
            const totalServiceDuration = appointment.serviceDurations.reduce((sum, duration) => sum + duration, 0);
            if (totalServiceDuration > 0) {
              return `${totalServiceDuration} minutes`;
            }
          }
          
          // If we have a duration from the appointment data, use it
          if (appointment.duration) {
            return appointment.duration;
          }
          
          // Default to 20 minutes if we can't calculate a positive duration
          return "20 minutes";
        }
        
        // Format the duration
        if (durationMinutes < 60) {
          return `${durationMinutes} minutes`;
        } else if (durationMinutes === 60) {
          return "1 hour";
        } else {
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          if (minutes === 0) {
            return `${hours} hours`;
          } else {
            return `${hours} hr ${minutes} min`;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating duration from time range:', error);
    }
  }
  
  // If we couldn't calculate from time range, check service durations
  if (appointment.serviceDurations && appointment.serviceDurations.length > 0) {
    const totalServiceDuration = appointment.serviceDurations.reduce((sum, duration) => sum + duration, 0);
    if (totalServiceDuration >= 0) {
      return `${totalServiceDuration} minutes`;
    }
  }
  
  // If we have a duration from the appointment data, use it
  if (appointment.duration) {
    return appointment.duration;
  }
  
  // If we have a durationMinutes value
  if (appointment.durationMinutes !== undefined && appointment.durationMinutes >= 0) {
    if (appointment.durationMinutes < 60) {
      return `${appointment.durationMinutes} minutes`;
    } else if (appointment.durationMinutes === 60) {
      return "1 hour";
    } else {
      const hours = Math.floor(appointment.durationMinutes / 60);
      const minutes = appointment.durationMinutes % 60;
      if (minutes === 0) {
        return `${hours} hours`;
      } else {
        return `${hours} hr ${minutes} min`;
      }
    }
  }
  
  // Default to 20 minutes if no duration information is available
  return "20 minutes";
};

// Fetch services and categories
const fetchServicesAndCategories = async () => {
try {
await serviceCategoryStore.fetchCategories();
await serviceCategoryStore.fetchServices();

categories.value = serviceCategoryStore.categories;
services.value = serviceCategoryStore.services;

console.log('Fetched services and categories:', services.value.length, categories.value.length);
} catch (error) {
console.error('Error fetching services and categories:', error);
}
};

// Fetch approved appointments
const fetchApprovedAppointments = async () => {
isLoading.value = true;
try {
// Get the current user ID
const userId = authStore.user?.userId;

if (!userId) {
console.error('No user ID found in auth store');
return;
}

// Fetch user's appointments
await appointmentStore.fetchAppointmentsByUserId(userId);

// Filter only approved appointments
const appointments = appointmentStore.appointments.filter(
appointment => appointment.status === 'approved'
);

// Transform appointments to calendar format
approvedAppointments.value = appointments.map(appointment => {
// Convert appointment date to a Date object if it's not already
const appointmentDate = appointment.date instanceof Date 
  ? appointment.date 
  : new Date(appointment.date);

// Extract service durations if available
let serviceDurations = [];
if (appointment.services && appointment.services.length > 0) {
  serviceDurations = appointment.services.map(serviceId => {
    const service = services.value.find(s => s.id === serviceId);
    return service && service.duration ? service.duration : 0;
  });
}

// Calculate duration in minutes if possible from time range
let durationMinutes = null;
if (appointment.time && appointment.time.includes('-')) {
  const [startTime, endTime] = appointment.time.split('-').map(t => t.trim());
  
  // Try to parse the times
  try {
    const startParts = startTime.match(/(\d+):(\d+)\s*(am|pm)?/i);
    const endParts = endTime.match(/(\d+):(\d+)\s*(am|pm)?/i);
    
    if (startParts && endParts) {
      let startHour = parseInt(startParts[1], 10);
      const startMinute = parseInt(startParts[2], 10);
      const startPeriod = startParts[3]?.toLowerCase();
      
      let endHour = parseInt(endParts[1], 10);
      const endMinute = parseInt(endParts[2], 10);
      const endPeriod = endParts[3]?.toLowerCase();
      
      // Convert to 24-hour format if AM/PM is specified
      if (startPeriod) {
        if (startPeriod === 'pm' && startHour < 12) startHour += 12;
        if (startPeriod === 'am' && startHour === 12) startHour = 0;
      }
      
      if (endPeriod) {
        if (endPeriod === 'pm' && endHour < 12) endHour += 12;
        if (endPeriod === 'am' && endHour === 12) endHour = 0;
      }
      
      // Calculate duration in minutes
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      durationMinutes = endMinutes - startMinutes;
    }
  } catch (error) {
    console.error('Error calculating duration from time range:', error);
  }
}

return {
  ...appointment,
  day: appointmentDate.getDate(),
  month: appointmentDate.getMonth(),
  year: appointmentDate.getFullYear(),
  serviceDurations: serviceDurations,
  durationMinutes: durationMinutes
};
});

console.log(`Loaded ${approvedAppointments.value.length} approved appointments`);
} catch (error) {
console.error('Error fetching approved appointments:', error);
} finally {
isLoading.value = false;
}
};

// Filter appointments for the current month and year
const currentMonthAppointments = computed(() => {
return approvedAppointments.value.filter(appointment => 
appointment.month === currentMonth.value && 
appointment.year === currentYear.value
);
});

// Check if a date has appointments
const hasAppointment = (date) => {
return currentMonthAppointments.value.some(appt => appt.day === date);
};

// Get appointments for the selected date
const getSelectedDateAppointments = () => {
if (!selectedDate.value) return [];

// Get appointments for the selected date
const appointments = currentMonthAppointments.value.filter(appt => 
appt.day === selectedDate.value
);

// Sort by time
return appointments.sort((a, b) => {
// Extract hours and minutes for comparison
const timeA = a.time ? a.time.split(':').map(Number) : [0, 0];
const timeB = b.time ? b.time.split(':').map(Number) : [0, 0];

// Compare hours first
if (timeA[0] !== timeB[0]) {
return timeA[0] - timeB[0];
}

// If hours are the same, compare minutes
return timeA[1] - timeB[1];
});
};

// Get a readable title for the appointment
const getAppointmentTitle = (appointment) => {
if (appointment.serviceNames && appointment.serviceNames.length > 0) {
// Return the first service name as the main title
return appointment.serviceNames[0];
}
return 'Appointment';
};

// Get appointment icon
const getAppointmentIcon = (appointment) => {
const type = appointment.type?.toLowerCase() || '';

if (type.includes('dental')) {
return '🦷';
} else if (type.includes('medical') || type.includes('exam')) {
return '💉';
} else if (type.includes('groom')) {
return '✂️';
}

return 'calendar';
};

// Styling for calendar dates
const getDateClass = (date) => {
let classes = ['']; // Initialize with an empty class

if (isToday(date)) {
classes.push('bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md');
} else if (selectedDate.value === date) {
classes.push('bg-blue-100 text-blue-700 font-medium border-2 border-blue-500');
} else if (hasAppointment(date)) {
classes.push('hover:bg-blue-50 text-gray-800 font-medium pb-1');
} else {
classes.push('hover:bg-gray-100 text-gray-700');
}

return classes.join(' ');
};

// Fetch appointments and services when component mounts
onMounted(async () => {
await fetchServicesAndCategories();
await fetchApprovedAppointments();
});

// Watch for changes in the appointment store
watch(() => appointmentStore.appointments, async () => {
await fetchApprovedAppointments();
}, { deep: true });

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
getSelectedDateAppointments,
getDateClass,
fetchApprovedAppointments
});
</script>