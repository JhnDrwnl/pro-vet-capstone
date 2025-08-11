<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Veterinary Appointments
        </h1>
        <p class="text-slate-600">Manage and track your patient appointments with ease</p>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="relative">
            <button 
              @click="toggleExportMenu"
              :disabled="exportLoading"
              class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 text-sm font-medium shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="exportLoading" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <DownloadIcon v-else class="w-4 h-4" />
              {{ exportLoading ? 'Exporting...' : 'Export' }}
              <ChevronDownIcon v-if="!exportLoading" class="w-4 h-4" />
            </button>
           <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/50 z-10">
              <div class="py-1">
               <button @click="exportAsCSV" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200">
                  Export as CSV
                </button>
               <button @click="exportAsPDF" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200">
                  Export as PDF
                </button>
               <button @click="exportAsImage" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200">
                  Export as Image
                </button>
              </div>
            </div>
          </div>
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
              class="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
              class="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
          >
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
          </button>
            
          <button 
               @click="goToToday"
               class="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-300"
             >
               Go to Today
              </button>
            </div>
            
           <!-- View Filter -->
           <div class="flex items-center gap-3">
             <div class="relative">
               <button 
                 class="px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm font-medium"
                 @click="toggleViewFilter"
               >
                 {{ viewFilter === 'upcoming' ? 'Upcoming Only' : 'All Appointments' }}
                 <ChevronDownIcon class="w-4 h-4 inline ml-2" />
               </button>
               <div v-if="showViewFilter" class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/50 z-10">
                 <div class="py-1">
                   <button 
                     @click="setViewFilter('upcoming')"
                     class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200"
                   >
                     Upcoming Only
                   </button>
              <button 
                     @click="setViewFilter('all')"
                     class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200"
                   >
                     All Appointments
              </button>
            </div>
          </div>
             </div>

            <div class="relative">
            <button 
                 class="p-3 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              @click="toggleFilters"
            >
                 <FilterIcon class="w-4 h-4 text-slate-500" />
            </button>
               <div v-if="showFilters" class="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/50 z-10">
                 <div class="py-1">
                   <div class="px-4 py-2 text-xs font-semibold text-slate-500">Type</div>
                   <button 
                     v-for="type in appointmentTypes" 
                     :key="type.value"
                     @click="setFilter(type.value)"
                     class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200"
                   >
                     {{ type.label }}
                   </button>
                   <button 
                     @click="setFilter('')"
                     class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200"
                   >
                     All Types
                   </button>
                   <div class="my-1 border-t border-slate-200"></div>
                   <div class="px-4 py-2 text-xs font-semibold text-slate-500">Status</div>
                   <button 
                     v-for="s in ['pending','approved','rejected','completed','cancelled']" 
                     :key="s"
                     @click="setStatusFilter(s)"
                     class="block capitalize px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200"
                   >
                     {{ s }}
                   </button>
                   <button 
                     @click="setStatusFilter('')"
                     class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left transition-colors duration-200"
                   >
                     All Statuses
                   </button>
                 </div>
               </div>
             </div>
            </div>
          </div>
        </div>
  
        <!-- Calendar Grid -->
      <div class="overflow-hidden">
                 <!-- Loading State -->
         <div v-if="loading" class="p-6">
           <!-- Skeleton Header -->
           <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 overflow-hidden">
             <div class="bg-gradient-to-r from-slate-50 to-white p-4 border-b border-slate-200/50">
               <div class="flex items-center justify-between mb-4">
                 <div class="space-y-2">
                   <div class="h-6 bg-slate-200 rounded-lg animate-pulse w-32"></div>
                   <div class="h-4 bg-slate-200 rounded animate-pulse w-48"></div>
                 </div>
                 <div class="flex items-center gap-2">
                   <div class="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
                   <div class="h-8 w-16 bg-slate-200 rounded-lg animate-pulse"></div>
                   <div class="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
                 </div>
               </div>
             </div>

             <!-- Skeleton Days Header -->
             <div class="grid grid-cols-7 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
               <div v-for="i in 7" :key="i" class="p-3 text-center border-r border-slate-200 last:border-r-0">
                 <div class="h-4 bg-slate-200 rounded animate-pulse mx-auto w-8"></div>
               </div>
             </div>

             <!-- Skeleton Calendar Grid -->
             <div class="grid grid-cols-7">
               <div v-for="i in 42" :key="i" class="min-h-[120px] border-r border-b border-slate-200 last:border-r-0 relative bg-white">
                 <div class="p-2">
                   <div class="flex items-center gap-1">
                     <div class="h-6 w-6 bg-slate-200 rounded-full animate-pulse"></div>
                   </div>
                 </div>
                 
                 <!-- Skeleton Appointments -->
                 <div class="px-1 pb-1 space-y-1">
                   <div v-for="j in Math.floor(Math.random() * 3) + 1" :key="j" class="p-2 rounded-lg bg-slate-100">
                     <div class="flex items-center gap-1 mb-1">
                       <div class="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                       <div class="h-3 bg-slate-300 rounded animate-pulse w-12"></div>
                     </div>
                     <div class="h-3 bg-slate-300 rounded animate-pulse w-16 mb-1"></div>
                     <div class="h-3 bg-slate-300 rounded animate-pulse w-20 mb-1"></div>
                     <div class="flex items-center justify-between">
                       <div class="h-3 bg-slate-300 rounded animate-pulse w-8"></div>
                       <div class="h-3 bg-slate-300 rounded animate-pulse w-10"></div>
                     </div>
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
                       isPastAppointment(appt) 
                         ? 'bg-slate-100/60 border border-slate-200/40 hover:bg-slate-200/60 opacity-75' 
                         : 'bg-indigo-100/80 border border-indigo-200/50 hover:bg-indigo-200/80'
                     ]"
                    @click="openAppointmentDetails(appt)"
                >
                     <div class="flex items-center gap-1 mb-1">
                       <div 
                         class="w-2 h-2 rounded-full"
                         :class="[
                           isPastAppointment(appt) ? 'bg-slate-400' : 'bg-indigo-500'
                         ]"
                       ></div>
                       <span 
                         class="font-semibold truncate"
                         :class="[
                           isPastAppointment(appt) ? 'text-slate-500' : 'text-slate-800'
                         ]"
                       >
                         {{ formatTime(appt.time) }}
                       </span>
                     </div>
                     <div 
                       class="font-medium truncate"
                       :class="[
                         isPastAppointment(appt) ? 'text-slate-500' : 'text-slate-700'
                       ]"
                     >
                       {{ appt.petName }}
                     </div>
                     <div 
                       class="truncate"
                       :class="[
                         isPastAppointment(appt) ? 'text-slate-400' : 'text-slate-600'
                       ]"
                     >
                       {{ appt.ownerName }}
                     </div>
                     <div class="flex items-center justify-between mt-1">
                       <span 
                         class="text-xs px-1 py-0.5 rounded"
                         :class="[
                           isPastAppointment(appt) 
                             ? 'bg-slate-200 text-slate-500' 
                             : appt.status === 'approved' ? 'bg-green-200 text-green-700' :
                               appt.status === 'pending' ? 'bg-yellow-200 text-yellow-700' :
                               appt.status === 'rejected' ? 'bg-red-200 text-red-700' :
                               appt.status === 'completed' ? 'bg-blue-200 text-blue-700' :
                               appt.status === 'cancelled' ? 'bg-gray-200 text-gray-700' :
                               'bg-indigo-200 text-indigo-700'
                         ]"
                       >
                         {{ appt.status }}
                       </span>
                       <span 
                         class="text-xs"
                         :class="[
                           isPastAppointment(appt) ? 'text-slate-400' : 'text-slate-500'
                         ]"
                       >
                         {{ appt.type }}
                       </span>
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
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            @click="selectedAppointment = null">
         <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl" @click.stop>
           <!-- Header -->
           <div class="flex items-center justify-between p-6 border-b border-slate-200">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                 <PawPrintIcon class="w-5 h-5 text-indigo-600" />
               </div>
              <div>
                 <h3 class="text-lg font-semibold text-slate-800">{{ selectedAppointment.petName }}</h3>
                 <p class="text-sm text-slate-600">{{ selectedAppointment.ownerName }}</p>
                </div>
              </div>
             <button @click="selectedAppointment = null" class="text-slate-400 hover:text-slate-600">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
  
           <!-- Content -->
           <div class="p-6 space-y-6">
             <!-- Basic Info -->
             <div class="grid grid-cols-2 gap-4">
               <div class="space-y-2">
                 <div class="flex items-center gap-2">
                   <ClockIcon class="w-4 h-4 text-slate-400" />
                   <span class="text-sm text-slate-600">Date & Time</span>
                </div>
                 <p class="font-medium text-slate-800">{{ selectedAppointment.date }}</p>
                 <p class="text-sm text-slate-600">{{ formatTime(selectedAppointment.time) }} ({{ selectedAppointment.duration }}min)</p>
              </div>
  
               <div class="space-y-2">
                 <div class="flex items-center gap-2">
                   <component :is="selectedAppointment.type === 'Online' ? VideoIcon : Footprints" class="w-4 h-4 text-slate-400" />
                   <span class="text-sm text-slate-600">Type</span>
                </div>
                 <span :class="[
                   'px-2 py-1 rounded-full text-xs font-medium',
                   selectedAppointment.type === 'Online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                 ]">
                   {{ selectedAppointment.type }}
                 </span>
                </div>
              </div>
  
             <!-- Status -->
              <div class="flex items-center gap-3">
               <div :class="[
                 'w-3 h-3 rounded-full',
                 getAppointmentStatusClass(selectedAppointment.status)
               ]"></div>
               <span :class="[
                 'px-2 py-1 rounded-full text-xs font-medium capitalize',
                 selectedAppointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                 selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                 selectedAppointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                 selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                 selectedAppointment.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                 'bg-slate-100 text-slate-700'
               ]">
                 {{ selectedAppointment.status }}
               </span>
               <span :class="[
                 'px-2 py-1 rounded-full text-xs font-medium',
                 isPastAppointment(selectedAppointment) ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'
               ]">
                 {{ isPastAppointment(selectedAppointment) ? 'Past' : 'Future' }}
               </span>
              </div>
  
             <!-- Services -->
             <div v-if="selectedAppointment.serviceNames && selectedAppointment.serviceNames.length > 0">
               <div class="flex items-center gap-2 mb-3">
                 <FileTextIcon class="w-4 h-4 text-slate-400" />
                 <span class="text-sm font-medium text-slate-700">Services</span>
                </div>
               <div class="flex flex-wrap gap-2">
                 <span 
                   v-for="service in selectedAppointment.serviceNames" 
                   :key="service"
                   class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                 >
                   {{ service }}
                 </span>
                </div>
              </div>
  
             <!-- Notes -->
             <div v-if="selectedAppointment.notes">
               <div class="flex items-center gap-2 mb-3">
                 <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                 </svg>
                 <span class="text-sm font-medium text-slate-700">Notes</span>
               </div>
               <p class="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{{ selectedAppointment.notes }}</p>
              </div>
  
             <!-- Video Link -->
             <div v-if="selectedAppointment.type === 'Online' && selectedAppointment.videoLink">
               <a 
                 :href="selectedAppointment.videoLink" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
               >
                 <VideoIcon class="w-4 h-4" />
                 Join Video Call
               </a>
            </div>
          </div>
  
           <!-- Actions -->
           <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
             <button 
               @click="showAppointmentApproval(selectedAppointment)"
               class="px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg transition-colors duration-200 text-sm font-medium"
             >
              Show Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
  import {
    ChevronDownIcon,
    XIcon,
    UserIcon,
    ClockIcon,
    FileTextIcon,
    DownloadIcon,
    FilterIcon,
    PawPrintIcon,
    VideoIcon,
    Footprints,
  CalendarIcon
  } from 'lucide-vue-next';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { saveAs } from 'file-saver';
import { useAuthStore } from '@/stores/modules/authStore';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
  
  const props = defineProps({
    vetId: {
      type: String,
      required: false
    }
  })

const authStore = useAuthStore();
const appointmentStore = useAppointmentStore();
const router = useRouter();

  const selectedAppointment = ref(null);
  const currentDate = ref(new Date());
  const showExportMenu = ref(false);
  const calendarRef = ref(null);
  const showFilters = ref(false);
  const filters = ref({ type: '', status: '' });
const loading = ref(false);
const showViewFilter = ref(false);
const viewFilter = ref('upcoming'); // 'upcoming' or 'all'
const exportLoading = ref(false);



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
  const dayAppointments = filteredAppointments.value.filter(appt => {
    const apptDate = appt.date instanceof Date ? appt.date : new Date(appt.date);
    return apptDate.toDateString() === dateString;
  });
  
  // Sort appointments by time (chronologically)
  const sortedAppointments = dayAppointments.sort((a, b) => {
    // Parse time strings to get hours and minutes for comparison
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes; // Convert to minutes for easier comparison
    };
    
    const timeA = parseTime(a.time);
    const timeB = parseTime(b.time);
    
    return timeA - timeB; // Sort in ascending order (earliest first)
  });
  
  return sortedAppointments.slice(0, 3); // Show only first 3 appointments per day
};

// Fetch appointments for the current veterinarian
const fetchVetAppointments = async () => {
  loading.value = true;
  
  try {
    // Get the current veterinarian ID
    const currentVetId = authStore.user?.userId;
    
    if (!currentVetId) {
      console.error('No veterinarian ID found in auth store');
      appointments.value = [];
      return;
    }
    
    console.log('Fetching appointments for veterinarian ID:', currentVetId);
    
    // Fetch appointments specific to this veterinarian
    const vetAppointments = await appointmentStore.fetchAppointmentsByDoctorId(currentVetId);
    
    // Import Firestore functions for fetching user and pet data
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    // Transform appointments to match the calendar format
    const transformedAppointments = await Promise.all(vetAppointments.map(async (appointment) => {
      // Handle Firebase Timestamp objects for date
      let appointmentDate;
      if (appointment.date && typeof appointment.date.toDate === 'function') {
        // Convert Firebase Timestamp to local date
        const utcDate = appointment.date.toDate();
        appointmentDate = new Date(
          utcDate.getFullYear(),
          utcDate.getMonth(),
          utcDate.getDate(),
          utcDate.getHours(),
          utcDate.getMinutes(),
          utcDate.getSeconds()
        );
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
      
      // Fetch owner name from users collection
      let ownerName = 'Unknown Owner';
      if (appointment.userId) {
        try {
          const userDocRef = doc(db, 'users', appointment.userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Combine firstName and lastName if available
            if (userData.firstName || userData.lastName) {
              ownerName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            } else if (userData.displayName) {
              ownerName = userData.displayName;
            } else if (userData.email) {
              ownerName = userData.email;
            }
          }
        } catch (error) {
          console.error('Error fetching user data for appointment:', appointment.id, error);
        }
      }
      
      // Fetch pet data from pets collection to get species
      let petSpecies = 'Unknown';
      if (appointment.petIds && appointment.petIds.length > 0) {
        try {
          const petDocRef = doc(db, 'pets', appointment.petIds[0]);
          const petDoc = await getDoc(petDocRef);
          
          if (petDoc.exists()) {
            const petData = petDoc.data();
            petSpecies = petData.species || 'Unknown';
          }
        } catch (error) {
          console.error('Error fetching pet data for appointment:', appointment.id, error);
        }
      }
      
      return {
        id: appointment.id,
        petName: appointment.petNames && appointment.petNames.length > 0 ? appointment.petNames[0].trim() : 'Unknown Pet',
        petType: petSpecies,
        ownerName: ownerName,
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
        serviceNames: appointment.serviceNames || []
      };
    }));
    
    appointments.value = transformedAppointments;
    console.log(`Fetched ${transformedAppointments.length} appointments for veterinarian`);
    
  } catch (error) {
    console.error('Error fetching veterinarian appointments:', error);
    appointments.value = [];
  } finally {
    loading.value = false;
  }
};
  
  const filteredAppointments = computed(() => {
    let filtered = appointments.value;
  
  // Apply view filter (upcoming vs all appointments)
  if (viewFilter.value === 'upcoming') {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    filtered = filtered.filter(appt => {
      const apptDate = appt.date instanceof Date ? appt.date : new Date(appt.date);
      return apptDate >= today;
    });
  }
  
    if (filters.value.type) {
      filtered = filtered.filter(appt => appt.type === filters.value.type);
    }
    if (filters.value.status) {
      filtered = filtered.filter(appt => (appt.status || '').toLowerCase() === filters.value.status.toLowerCase());
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
      'approved': 'bg-green-400',
      'pending': 'bg-yellow-400',
      'rejected': 'bg-red-400',
      'completed': 'bg-blue-400',
      'cancelled': 'bg-gray-400'
    }[status] || 'bg-gray-400';
  };
  
  const openAppointmentDetails = (appointment) => {
    selectedAppointment.value = appointment;
  };
  
const showAppointmentApproval = (appointment) => {
  // Close the modal first
  selectedAppointment.value = null;
  
  // Navigate to the appointment approval page
  router.push('/vet/appointments/vetappointmentapproval');
};
  
const isPastAppointment = (appointment) => {
  const now = new Date();
  const apptDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
  
  // Set the appointment time to the appointment date
  const [hours, minutes] = appointment.time.split(':');
  apptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return apptDate < now;
  };
  
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const toggleExportMenu = () => {
    showExportMenu.value = !showExportMenu.value;
  };
  
const exportAsCSV = async () => {
  exportLoading.value = true;
  showExportMenu.value = false;
  
  try {
    const csvContent = [
      ['ID', 'Pet Name', 'Pet Type', 'Owner Name', 'Type', 'Date', 'Time', 'Duration', 'Status', 'Notes'].join(','),
      ...appointments.value.map(appt => [
        appt.id,
        appt.petName,
        appt.petType,
        appt.ownerName,
        appt.type,
        appt.date,
        appt.time,
        appt.duration,
        appt.status,
        appt.notes
      ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'veterinary_appointments.csv');
  } catch (error) {
    console.error('Error exporting CSV:', error);
  } finally {
    exportLoading.value = false;
  }
  };
  
  const exportAsPDF = async () => {
  exportLoading.value = true;
  showExportMenu.value = false;
  
  try {
    if (!calendarRef.value) return;
  
    const canvas = await html2canvas(calendarRef.value);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('veterinary_appointments.pdf');
  } catch (error) {
    console.error('Error exporting PDF:', error);
  } finally {
    exportLoading.value = false;
  }
  };
  
  const exportAsImage = async () => {
  exportLoading.value = true;
  showExportMenu.value = false;
  
  try {
    if (!calendarRef.value) return;
  
    const canvas = await html2canvas(calendarRef.value);
    canvas.toBlob((blob) => {
      saveAs(blob, 'veterinary_appointments.png');
    });
  } catch (error) {
    console.error('Error exporting image:', error);
  } finally {
    exportLoading.value = false;
  }
  };

  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };

  const setFilter = (type) => {
    filters.value.type = type;
    showFilters.value = false;
  };

  const setStatusFilter = (status) => {
    filters.value.status = status;
    showFilters.value = false;
  };

const toggleViewFilter = () => {
  showViewFilter.value = !showViewFilter.value;
};

const setViewFilter = (filter) => {
  viewFilter.value = filter;
  showViewFilter.value = false;
};

// Fetch appointments when component mounts
onMounted(async () => {
  await fetchVetAppointments();
});
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