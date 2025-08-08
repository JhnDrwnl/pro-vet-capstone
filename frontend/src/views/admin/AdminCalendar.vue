<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Appointment Calendar
        </h1>
        <p class="text-slate-600">Manage and track patient appointments with ease</p>
      </div>
      
      
        </div>
        
    <!-- Calendar View -->
    <div ref="calendarRef" class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
      <!-- Calendar Controls -->
      <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div class="flex justify-between items-center mb-4">
          <!-- Month Navigation -->
          <div class="flex items-center gap-4">
            <button 
              @click="prevMonth"
              :disabled="loading"
              class="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="text-lg font-semibold text-slate-800">
              {{ currentMonth }}
    </div>

            <button 
              @click="nextMonth"
              :disabled="loading"
              class="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <button 
              @click="goToToday"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go to Today
            </button>
          </div>

          <!-- Show Filter -->
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-slate-700">Show:</span>
            <button
              @click="showExpired = false"
              :disabled="loading"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                !showExpired ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              ]"
            >
              Upcoming Only
            </button>
              <button
              @click="showExpired = true"
              :disabled="loading"
                :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                showExpired ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              ]"
            >
              All Appointments
              </button>
            </div>
          </div>
        



        

          </div>
          
      <!-- Calendar Grid -->
      <div class="overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="p-8">
          <!-- Loading Header -->
          <div class="text-center mb-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p class="text-slate-600 font-medium">Loading calendar...</p>
            <p class="text-sm text-slate-500 mt-1">Fetching appointments and preparing calendar view</p>
          </div>
          
          <!-- Skeleton Calendar -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden">
            <!-- Skeleton Calendar Header -->
            <div class="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200/50">
              <div class="flex items-center justify-between mb-4">
                <div class="animate-pulse">
                  <div class="h-6 bg-slate-200 rounded w-32 mb-2"></div>
                  <div class="h-4 bg-slate-200 rounded w-48"></div>
          </div>
                <div class="flex items-center gap-2">
                  <div class="animate-pulse w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div class="animate-pulse w-16 h-8 bg-slate-200 rounded-lg"></div>
                  <div class="animate-pulse w-8 h-8 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>

            <!-- Skeleton Days of Week -->
            <div class="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <div v-for="i in 7" :key="i" class="p-3 text-center border-r border-slate-200 last:border-r-0">
                <div class="animate-pulse h-4 bg-slate-200 rounded w-8 mx-auto"></div>
      </div>
    </div>

            <!-- Skeleton Calendar Days -->
            <div class="grid grid-cols-7">
              <div v-for="i in 42" :key="i" class="min-h-[120px] border-r border-b border-slate-200 last:border-r-0 relative">
                <div class="p-2">
                  <div class="animate-pulse h-4 bg-slate-200 rounded w-6 mb-2"></div>
                </div>
                <div class="px-1 pb-1 space-y-1">
                  <div v-for="j in 2" :key="j" class="animate-pulse">
                    <div class="h-12 bg-slate-200 rounded-lg mb-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          
        <!-- Empty State -->
        <div v-else-if="appointments.length === 0" class="p-8 text-center">
          <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon class="w-10 h-10 text-slate-400" />
          </div>
          <h3 class="text-lg font-semibold text-slate-700 mb-2">No Upcoming Appointments</h3>
          <p class="text-slate-500 mb-4">There are no appointments scheduled for today or the future.</p>
        </div>

        <!-- Calendar Content -->
        <div v-else>

          <!-- Calendar Grid -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden">
            <!-- Calendar Header -->
            <div class="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200/50">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-slate-800">{{ currentMonth }}</h3>
                  <p class="text-sm text-slate-600">Appointment Calendar</p>
          </div>
                <div class="flex items-center gap-2">
          <button 
                    @click="prevMonth"
                    class="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
                    <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
          </button>
            <button 
                    @click="goToToday"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Today
            </button>
            <button 
                    @click="nextMonth"
                    class="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
                    <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
            </button>
          </div>
        </div>
      </div>

            <!-- Days of Week Header -->
            <div class="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <div 
                v-for="dayName in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
                :key="dayName"
                class="p-3 text-center border-r border-slate-200 last:border-r-0"
              >
                <span class="text-sm font-semibold text-slate-700">{{ dayName }}</span>
              </div>
            </div>

            <!-- Calendar Days Grid -->
            <div class="grid grid-cols-7">
                <div 
                v-for="day in calendarDays" 
                :key="day.date"
                class="min-h-[120px] border-r border-b border-slate-200 last:border-r-0 relative"
                  :class="[
                  day.isToday ? 'bg-indigo-50' : 'bg-white',
                  day.isCurrentMonth ? '' : 'bg-slate-50/50'
                ]"
              >
                <!-- Date Number -->
                <div class="p-2">
                  <div class="flex items-center gap-1">
                    <span 
                      class="text-sm font-medium"
                      :class="[
                        day.isToday ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : '',
                        day.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                      ]"
                    >
                      {{ day.dayNumber }}
                    </span>
                    <span v-if="day.isToday" class="text-xs text-indigo-600 font-medium">Today</span>
                  </div>
                  </div>

                <!-- Appointments for this day -->
                <div class="px-1 pb-1 space-y-1">
                  <div 
                    v-for="appt in getAppointmentsForDay(day.date)"
                  :key="appt.id"
                    class="group p-2 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 text-xs"
                    :class="[
                      appt.isExpired ? 'bg-slate-100/80 border border-slate-200/50 opacity-70' : 
                      appt.isCurrent ? 'bg-emerald-100/80 border border-emerald-200/50 shadow-sm' :
                      'bg-indigo-100/80 border border-indigo-200/50 hover:bg-indigo-200/80'
                    ]"
                  @click="openAppointmentDetails(appt)"
              >
                    <div class="flex items-center gap-1 mb-1">
                      <div class="w-2 h-2 rounded-full" 
                           :class="appt.isExpired ? 'bg-slate-400' : 
                                  appt.isCurrent ? 'bg-emerald-500' : 
                                  'bg-indigo-500'">
                  </div>
                      <span class="font-semibold text-slate-800 truncate">{{ appt.originalTime.split('-')[0].trim() }}</span>
              </div>
                    <div class="text-slate-700 font-medium truncate">{{ appt.petName }}</div>
                    <div class="text-slate-600 truncate">{{ appt.doctorName }}</div>
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-xs px-1 py-0.5 rounded" 
                            :class="appt.isExpired ? 'bg-slate-200 text-slate-600' :
                                   appt.isCurrent ? 'bg-emerald-200 text-emerald-700' :
                                   'bg-indigo-200 text-indigo-700'">
                        {{ appt.status }}
                      </span>
                      <span class="text-xs text-slate-500">{{ appt.type }}</span>
                </div>
              </div>
          </div>

                <!-- More appointments indicator -->
                <div v-if="getAppointmentsForDay(day.date).length > 3" class="absolute bottom-1 right-1">
                  <span class="text-xs text-indigo-600 font-medium bg-indigo-100 px-1 py-0.5 rounded">
                    +{{ getAppointmentsForDay(day.date).length - 3 }}
                  </span>
        </div>
      </div>
            </div>
          </div>
        </div>
      </div>
  </div>

    <!-- Appointment Details Modal -->
    <div v-if="selectedAppointment" 
         class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
         @click="selectedAppointment = null">
      <div class="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/50" @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <span>Appointment ID</span>
                <span class="font-mono bg-slate-100 px-2 py-1 rounded">{{ selectedAppointment.id }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  getAppointmentStatusClass(selectedAppointment.status)
                ]"></div>
                <h3 class="text-xl font-bold text-slate-800">{{ selectedAppointment.petName }}</h3>
              </div>
            </div>
            <button @click="selectedAppointment = null" class="text-slate-400 hover:text-slate-600 hover:scale-110 transition-all duration-200">
              <XIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <PawPrintIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-500 mb-1">Pet Information</div>
                <div class="text-sm font-bold text-slate-800">{{ selectedAppointment.petName }} ({{ selectedAppointment.petType }})</div>
              </div>
            </div>

            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <UserIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-500 mb-1">Owner</div>
                <div class="text-sm font-bold text-slate-800">{{ selectedAppointment.ownerName }}</div>
              </div>
            </div>

            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ClockIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-500 mb-1">Appointment</div>
                <div class="text-sm font-bold text-slate-800">{{ selectedAppointment.date }}, {{ formatTime(selectedAppointment.time) }}</div>
                <div class="text-sm text-slate-500">Duration: {{ selectedAppointment.duration }} minutes</div>
              </div>
            </div>

            <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <component :is="selectedAppointment.type === 'Online' ? VideoIcon : Footprints" class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-500 mb-1">Type</div>
                <div class="text-sm font-bold text-slate-800">{{ selectedAppointment.type }}</div>
                <div v-if="selectedAppointment.type === 'Online'" class="text-sm text-indigo-600 hover:underline">
                  <a :href="selectedAppointment.videoLink" target="_blank" rel="noopener noreferrer">Join Video Call</a>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-6">
              <div class="text-sm font-medium text-slate-500 mb-2">Notes</div>
              <p class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{{ selectedAppointment.notes }}</p>
            </div>

            <div class="border-t border-slate-200 pt-6">
              <button class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
                See Patient History →
              </button>
            </div>
          </div>
        </div>

        <div class="flex border-t border-slate-200">
          <button class="flex-1 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200">
            Edit
          </button>
          <button class="flex-1 px-4 py-4 text-sm font-medium text-rose-600 hover:bg-rose-50 border-l border-slate-200 transition-colors duration-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  ClockIcon,
  VideoIcon,
  Footprints,
  CalendarIcon
} from 'lucide-vue-next';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { format, isToday, isThisWeek, isThisMonth, parseISO, isBefore, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const router = useRouter();
const appointmentStore = useAppointmentStore();

const selectedAppointment = ref(null);
const currentDate = ref(new Date());
const calendarRef = ref(null);
const loading = ref(false);
const showExpired = ref(false);







// Real appointments data
const appointments = ref([]);

const currentMonth = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

// Calendar navigation functions
const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const goToToday = () => {
  currentDate.value = new Date();
};

// Calendar days computation
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  // Get first day of the month
  const firstDay = new Date(year, month, 1);
  // Get last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  
  // Get the total number of days in the month
  const daysInMonth = lastDay.getDate();
  
  const days = [];
  
  // Add days from previous month to fill the first week
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({
      date: date.toDateString(),
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: date.toDateString() === new Date().toDateString()
    });
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date: date.toDateString(),
      dayNumber: day,
      isCurrentMonth: true,
      isToday: date.toDateString() === new Date().toDateString()
    });
  }
  
  // Add days from next month to fill the last week
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date: date.toDateString(),
      dayNumber: day,
      isCurrentMonth: false,
      isToday: date.toDateString() === new Date().toDateString()
    });
  }
  
  return days;
});

// Function to get appointments for a specific day
const getAppointmentsForDay = (dateString) => {
  return filteredAppointments.value.filter(appt => {
    const apptDate = appt.date instanceof Date ? appt.date : new Date(appt.date);
    return apptDate.toDateString() === dateString;
  }).slice(0, 3); // Show only first 3 appointments per day
};



// Fetch appointments from Firebase
const fetchAppointments = async () => {
  loading.value = true;
  try {
    await appointmentStore.fetchAppointments(100); // Fetch more appointments for calendar view
    
    // Show all appointments (like the user calendar does)
    const filteredAppointments = appointmentStore.appointments.filter(appointment => {
      if (!appointment.date) {
        return false;
      }
      
      // Handle Firebase Timestamp objects
      let appointmentDate;
      if (appointment.date && typeof appointment.date.toDate === 'function') {
        // Firebase Timestamp object
        appointmentDate = appointment.date.toDate();
      } else if (appointment.date instanceof Date) {
        appointmentDate = appointment.date;
      } else {
        appointmentDate = new Date(appointment.date);
      }
      
      // Show all appointments for admin view
      return true;
    });

    // Transform appointments to calendar format
    // Use a Set to prevent duplicate appointments
    const uniqueAppointments = new Map();
    
    filteredAppointments.forEach(appointment => {
      if (uniqueAppointments.has(appointment.id)) {
        return; // Skip duplicates
      }
      
      uniqueAppointments.set(appointment.id, appointment);
    });
    
    const transformedAppointments = Array.from(uniqueAppointments.values()).map(appointment => {
      // Handle Firebase Timestamp objects for date
      let appointmentDate;
      if (appointment.date && typeof appointment.date.toDate === 'function') {
        // Convert Firebase Timestamp to local date (not UTC)
        const utcDate = appointment.date.toDate();
        // Create a new date using local timezone components
        appointmentDate = new Date(
          utcDate.getFullYear(),
          utcDate.getMonth(),
          utcDate.getDate(),
          utcDate.getHours(),
          utcDate.getMinutes(),
          utcDate.getSeconds()
        );
        
        // Alternative: Use the original timestamp without timezone conversion
        // appointmentDate = appointment.date.toDate();
      } else if (appointment.date instanceof Date) {
        appointmentDate = appointment.date;
      } else {
        appointmentDate = new Date(appointment.date);
      }
      
      // Extract time from the time string (e.g., "10:10 AM - 11:20 AM" -> "10:10")
      let timeSlot = '09:00';
      if (appointment.time) {
        // Parse the time range to get start time
        const timeParts = appointment.time.split('-');
        if (timeParts.length > 0) {
          const startTimeStr = timeParts[0].trim(); // "10:10 AM"
          
          const timeMatch = startTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const period = timeMatch[3].toUpperCase();
            
            // Convert to 24-hour format
            if (period === 'PM' && hours !== 12) {
              hours += 12;
            } else if (period === 'AM' && hours === 12) {
              hours = 0;
            }
            
            timeSlot = `${hours.toString().padStart(2, '0')}:${minutes}`;
          }
        }
      }
      
      // Determine appointment type based on serviceNames
      const isOnline = appointment.serviceNames && 
        appointment.serviceNames.some(service => 
          service.toLowerCase().includes('video') || 
          service.toLowerCase().includes('telehealth')
        );
      
              // Determine if appointment is expired, current, or future
        const now = new Date();
        let isExpired = false;
        let isCurrent = false;
        
        if (appointment.time) {
          // Parse the appointment time to get end time
          const timeParts = appointment.time.split('-');
          if (timeParts.length > 1) {
            const endTimeStr = timeParts[1].trim(); // "11:20 AM"
            const timeMatch = endTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (timeMatch) {
              let endHours = parseInt(timeMatch[1]);
              const endMinutes = timeMatch[2];
              const period = timeMatch[3].toUpperCase();
              
              // Convert to 24-hour format
              if (period === 'PM' && endHours !== 12) {
                endHours += 12;
              } else if (period === 'AM' && endHours === 12) {
                endHours = 0;
              }
              
              // Create appointment end time
              const appointmentEndTime = new Date(appointmentDate);
              appointmentEndTime.setHours(endHours, endMinutes, 0, 0);
              
              // Check if appointment is expired, current, or future
              if (now > appointmentEndTime) {
                isExpired = true;
              } else if (now >= appointmentDate && now <= appointmentEndTime) {
                isCurrent = true;
              }
            }
          }
        }
        
        const transformedAppointment = {
          id: appointment.id,
          petName: appointment.petNames && appointment.petNames.length > 0 ? appointment.petNames[0].trim() : 'Unknown Pet',
          petType: appointment.petSpeciesArray && appointment.petSpeciesArray.length > 0 ? appointment.petSpeciesArray[0] : 'Unknown',
          ownerName: appointment.ownerName || 'Unknown Owner',
          type: isOnline ? 'Online' : 'Walk-in',
          date: appointmentDate,
          time: timeSlot,
          originalTime: appointment.time, // Keep original time format for display
          duration: appointment.duration || 30,
          status: appointment.status || 'pending',
          notes: appointment.notes || '',
          videoLink: appointment.videoLink || '',
          doctorName: appointment.doctorName || 'Unassigned',
          doctorId: appointment.doctorId || '',
          userId: appointment.userId || '',
          serviceNames: appointment.serviceNames || [],
          isExpired,
          isCurrent
        };
      
      return transformedAppointment;
    });
    
        // Set the appointments
    appointments.value = transformedAppointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
  } finally {
    loading.value = false;
  }
};

const filteredAppointments = computed(() => {
  let filtered = appointments.value;
  
  // Filter by expired status
  if (!showExpired.value) {
    filtered = filtered.filter(appt => !appt.isExpired);
  }
  
  return filtered;
});



const getAppointmentClass = (type) => {
const classes = {
  'Online': 'bg-blue-100/80 text-blue-900 border border-blue-200',
  'Walk-in': 'bg-purple-100/80 text-purple-900 border border-purple-200',
  'Emergency': 'bg-green-100/80 text-green-900 border border-green-200'
};
return classes[type] || 'bg-gray-100/80 text-gray-900 border border-gray-200';
};

const getAppointmentStatusClass = (status) => {
  return {
    'confirmed': 'bg-green-400',
    'pending': 'bg-yellow-400',
    'approved': 'bg-green-400',
    'cancelled': 'bg-red-400',
    'completed': 'bg-purple-400',
    'ended': 'bg-gray-400'
  }[status] || 'bg-gray-400';
};



// Navigate to approved appointments page when appointment is clicked
const openAppointmentDetails = (appointment) => {
  // Navigate to the approved appointments page
  router.push('/admin/appointments/approvedappointments');
};









// Fetch appointments on component mount
onMounted(async () => {
  await fetchAppointments();
});

// Remove the watch to prevent multiple fetches
// The appointments will be fetched once on mount and can be refreshed manually
</script>

<style scoped>
/* Custom scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}
</style>