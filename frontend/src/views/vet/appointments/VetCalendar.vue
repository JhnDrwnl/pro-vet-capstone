<template>
    <div class="min-h-screen bg-white p-6 rounded-lg">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Veterinary Appointments</h1>
          <p class="text-sm text-gray-500">Manage and track your patient appointments.</p>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="relative">
            <button 
              @click="toggleExportMenu"
              class="inline-flex items-center gap-2 px-3 py-2  bg-green-500 text-white rounded-full hover:bg-green-600 text-sm border"
            >
              <DownloadIcon class="w-4 h-4" />
              Export
              <ChevronDownIcon class="w-4 h-4" />
            </button>
            <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div class="py-1">
                <button @click="exportAsCSV" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Export as CSV
                </button>
                <button @click="exportAsPDF" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Export as PDF
                </button>
                <button @click="exportAsImage" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                  Export as Image
                </button>
              </div>
            </div>
          </div>
          <button 
            @click="toggleNewAppointmentForm"
            class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <component :is="isNewAppointmentOpen ? XIcon : PlusIcon" class="w-4 h-4" />
            {{ isNewAppointmentOpen ? 'Close Form' : 'Add Appointment' }}
          </button>
        </div>
      </div>
  
      <!-- New Appointment Form (Inline) -->
      <div v-if="isNewAppointmentOpen" class="bg-white w-full">
        <div class="p-6">
          <h2 class="text-lg font-medium mb-6">New Appointment</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
              <input
                v-model="newAppointment.petName"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter pet name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
              <input
                v-model="newAppointment.petType"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter pet type (e.g., Dog, Cat)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
              <input
                v-model="newAppointment.ownerName"
                type="text"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter owner name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <div class="flex gap-2">
                <button
                  v-for="type in appointmentTypes"
                  :key="type.value"
                  @click="newAppointment.type = type.value"
                  :class="[
                    'px-4 py-2 rounded-full text-sm border flex items-center',
                    newAppointment.type === type.value 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <component :is="type.icon" class="w-4 h-4 mr-2" />
                  {{ type.label }}
                </button>
              </div>
            </div>
            <div v-if="newAppointment.type === 'Online'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Video Call Link</label>
              <input
                v-model="newAppointment.videoLink"
                type="url"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video call link"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                v-model="newAppointment.date"
                type="date"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <select
                v-model="newAppointment.time"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="slot in timeSlots" :key="slot.value" :value="slot.value">
                  {{ slot.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                v-model="newAppointment.duration"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1 hour 30 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="newAppointment.notes"
                rows="3"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes"
              ></textarea>
            </div>
          </div>
        </div>
  
        <div class="flex justify-end gap-3 p-6 border-t">
          <button 
            @click="toggleNewAppointmentForm"
            class="px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-full"
          >
            Cancel
          </button>
          <button 
            @click="saveNewAppointment"
            class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-full"
          >
            Create Appointment
          </button>
        </div>
      </div>
  
      <!-- Calendar View (shown when not adding a new appointment) -->
      <div v-if="!isNewAppointmentOpen" ref="calendarRef">
        <!-- Calendar Controls -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-4">
            <div class="relative">
              <button class="inline-flex items-center gap-2 px-3 py-1 text-sm border rounded-lg">
                {{ currentMonth }}
                <ChevronDownIcon class="w-4 h-4" />
              </button>
            </div>
            
            <div class="flex border rounded-full">
              <button 
                v-for="view in ['Day', 'Week', 'Month']" 
                :key="view"
                :class="[
                  'px-3 py-1 text-sm',
                  selectedView === view ? 'bg-blue-100 text-blue-900 rounded-full' : 'text-gray-400'
                ]"
                @click="selectedView = view"
              >
                {{ view }}
              </button>
            </div>
          </div>


          <div class="flex items-center gap-2">
            <div class="relative">
              <input 
                v-model="search" 
                class="w-[300px] pl-10 pr-4 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Search appointment..."
              />
              <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button 
              class="p-2 border border-gray-200 rounded-lg hover:bg-blue-100"
              @click="toggleFilters"
            >
              <FilterIcon class="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <!-- Add this new filter dropdown -->
          <div v-if="showFilters" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <div class="py-1">
              <button 
                v-for="type in appointmentTypes" 
                :key="type.value"
                @click="setFilter(type.value)"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {{ type.label }}
              </button>
              <button 
                @click="setFilter('')"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                All Types
              </button>
            </div>
          </div>
        </div>
  
        <!-- Calendar Grid -->
        <div class="border rounded-lg shadow-sm bg-white">
          <!-- Time Column -->
          <div class="grid grid-cols-8 h-full">
            <div class="border-r">
              <div class="h-14 border-b"></div> <!-- Header spacer -->
              <div v-for="slot in timeSlots" :key="slot.value" class="h-20 border-b">
                <span class="text-xs text-gray-500 p-2">{{ slot.label }}</span>
              </div>
            </div>
  
            <!-- Days Columns -->
            <div class="col-span-7 grid grid-cols-7">
              <!-- Days Header -->
              <div 
                v-for="day in weekDays" 
                :key="day.date" 
                class="h-14 border-b border-r p-2 text-center"
              >
                <div class="text-sm text-gray-500">{{ day.dayName }}</div>
                <div class="text-sm font-medium" :class="{'text-blue-600': day.isToday}">
                  {{ day.date }}
                </div>
              </div>
  
              <!-- Appointment Slots -->
              <template v-for="day in 7" :key="day">
                <div class="relative border-r">
                  <div 
                    v-for="slot in timeSlots" 
                    :key="slot.value" 
                    :class="[
                      'h-20 border-b relative',
                      slot.value === '12:00' ? 'bg-[repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6_10px,#ffffff_10px,#ffffff_20px)]' : ''
                    ]"
                  >
                    <!-- Lunch Break -->
                    <div v-if="slot.value === '12:00' && day === 4" class="absolute inset-x-0 h-full flex items-center justify-center">
                      <div class="inline-flex items-center gap-1.5 text-gray-500">
                        <UtensilsIcon class="w-4 h-4" />
                        <span class="text-sm">Lunch Break</span>
                      </div>
                    </div>

                    <!-- Appointments -->
                    <div 
                    v-for="appt in getAppointmentsForSlot(day, slot.value)"
                    :key="appt.id"
                    class="absolute inset-x-0 mx-2 my-2 rounded-lg p-4 cursor-pointer hover:opacity-90 transition-opacity"
                    :class="getAppointmentClass(appt.type)"
                    :style="`top: ${getAppointmentPosition(appt)}px; height: ${getAppointmentHeight(appt)}px;`"
                    @click="openAppointmentDetails(appt)"
                >
                    <div class="h-full flex flex-col">
                    <div class="text-xs font-medium mb-1">{{ formatTime(appt.time) }}</div>
                    <div class="text-sm font-medium leading-snug">{{ appt.petName }}</div>
                    <div class="text-xs mt-auto opacity-75">{{ appt.type }}</div>
                    </div>
                </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      
    </div>
  
      <!-- Appointment Details Modal -->
      <div v-if="selectedAppointment" 
           class="fixed inset-0 bg-black/25 flex items-start justify-center pt-20 z-50">
        <div class="bg-white rounded-xl w-full max-w-md shadow-xl">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Appointment ID</span>
                  <span class="font-mono">{{ selectedAppointment.id }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-2 h-2 rounded-full',
                    getAppointmentStatusClass(selectedAppointment.status)
                  ]"></div>
                  <h3 class="text-lg font-medium">{{ selectedAppointment.petName }}</h3>
                </div>
              </div>
              <button @click="selectedAppointment = null" class="text-gray-400 hover:text-gray-600">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
  
            <div class="space-y-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <PawPrintIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-sm text-gray-500">Pet Information</div>
                  <div class="text-sm font-medium">{{ selectedAppointment.petName }} ({{ selectedAppointment.petType }})</div>
                </div>
              </div>
  
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <UserIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-sm text-gray-500">Owner</div>
                  <div class="text-sm font-medium">{{ selectedAppointment.ownerName }}</div>
                </div>
              </div>
  
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <ClockIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-sm text-gray-500">Appointment</div>
                  <div class="text-sm font-medium">{{ selectedAppointment.date }}, {{ formatTime(selectedAppointment.time) }}</div>
                  <div class="text-sm text-gray-500">Duration: {{ selectedAppointment.duration }} minutes</div>
                </div>
              </div>
  
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <component :is="selectedAppointment.type === 'Online' ? VideoIcon : WalkIcon" class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="text-sm text-gray-500">Type</div>
                  <div class="text-sm font-medium">{{ selectedAppointment.type }}</div>
                  <div v-if="selectedAppointment.type === 'Online'" class="text-sm text-blue-600 hover:underline">
                    <a :href="selectedAppointment.videoLink" target="_blank" rel="noopener noreferrer">Join Video Call</a>
                  </div>
                </div>
              </div>
  
              <div class="border-t pt-6">
                <div class="text-sm text-gray-500 mb-2">Notes</div>
                <p class="text-sm">{{ selectedAppointment.notes }}</p>
              </div>
  
              <div class="border-t pt-6">
                <button class="text-sm text-blue-600 hover:text-blue-700">
                  See Patient History →
                </button>
              </div>
            </div>
          </div>
  
          <div class="flex border-t">
            <button class="flex-1 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
              Edit
            </button>
            <button class="flex-1 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-l font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import {
    SearchIcon,
    ChevronDownIcon,
    PlusIcon,
    XIcon,
    UserIcon,
    ClockIcon,
    FileTextIcon,
    DownloadIcon,
    FilterIcon,
    ListIcon,
    PawPrintIcon,
    VideoIcon,
    Footprints,
    UtensilsIcon
  } from 'lucide-vue-next';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { saveAs } from 'file-saver';
  
  const selectedView = ref('Week');
  const selectedAppointment = ref(null);
  const isNewAppointmentOpen = ref(false);
  const currentDate = ref(new Date());
  const currentFilter = ref('All');
  const showExportMenu = ref(false);
  const calendarRef = ref(null);
  const showFilters = ref(false);
  const filters = ref({ type: '' });
  const search = ref('');

  const timeSlots = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];
  
  const appointmentTypes = [
    { label: 'Online', value: 'Online', icon: VideoIcon },
    { label: 'Walk-in', value: 'Walk-in', icon: Footprints }
  ];
  
  const appointments = ref([
    { 
      id: '#V456991',
      petName: 'Luna',
      petType: 'Cat',
      ownerName: 'Leslie Alexander',
      type: 'Online',
      date: '2024-01-23',
      time: '11:00',
      duration: 30,
      status: 'pending',
      notes: 'Follow-up consultation for recent vaccination',
      videoLink: 'https://example.com/video-call',
      avatar: '/placeholder.svg?height=32&width=32',
      participants: [
        { avatar: '/placeholder.svg?height=16&width=16' },
      ]
    }
  ]);
  
  const newAppointment = ref({
    petName: '',
    petType: '',
    ownerName: '',
    type: 'Walk-in',
    date: '',
    time: '',
    duration: '30',
    videoLink: '',
    notes: ''
  });
  
  const currentMonth = computed(() => {
    return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
  });
  
  const weekDays = computed(() => {
    const days = [];
    const current = new Date(currentDate.value);
    current.setDate(current.getDate() - current.getDay() + 1);
  
    for (let i = 0; i < 7; i++) {
      days.push({
        date: current.getDate(),
        dayName: current.toLocaleDateString('default', { weekday: 'short' }),
        isToday: current.toDateString() === new Date().toDateString(),
        fullDate: new Date(current)
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  });
  
  const filteredAppointments = computed(() => {
    let filtered = appointments.value;
    if (filters.value.type) {
      filtered = filtered.filter(appt => appt.type === filters.value.type);
    }
    if (search.value) {
      const searchTerm = search.value.toLowerCase();
      filtered = filtered.filter(appt => 
        appt.petName.toLowerCase().includes(searchTerm) ||
        appt.ownerName.toLowerCase().includes(searchTerm) ||
        appt.notes.toLowerCase().includes(searchTerm)
      );
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
      'cancelled': 'bg-red-400'
    }[status] || 'bg-gray-400';
  };
  
  const getAppointmentsForSlot = (day, time) => {
    return filteredAppointments.value.filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.getDay() === day - 1 && appt.time === time;
    });
  };
  
  const getAppointmentPosition = (appointment) => {
    const [hours, minutes] = appointment.time.split(':');
    return (parseInt(hours) - 8) * 160 + (parseInt(minutes) / 30) * 80;
  };
  
  const getAppointmentHeight = (appointment) => {
    return (appointment.duration / 30) * 80;
  };
  
  const openAppointmentDetails = (appointment) => {
    selectedAppointment.value = appointment;
  };
  
  const toggleNewAppointmentForm = () => {
    isNewAppointmentOpen.value = !isNewAppointmentOpen.value;
    if (isNewAppointmentOpen.value) {
      newAppointment.value.date = currentDate.value.toISOString().split('T')[0];
    } else {
      resetNewAppointmentForm();
    }
  };
  
  const resetNewAppointmentForm = () => {
    newAppointment.value = {
      petName: '',
      petType: '',
      ownerName: '',
      type: 'Walk-in',
      date: '',
      time: '',
      duration: '30',
      videoLink: '',
      notes: ''
    };
  };
  
  const saveNewAppointment = () => {
    appointments.value.push({
      id: `#V${Date.now().toString().slice(-6)}`,
      ...newAppointment.value,
      status: 'pending',
      avatar: '/placeholder.svg?height=32&width=32'
    });
    toggleNewAppointmentForm();
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
  
  const exportAsCSV = () => {
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
    showExportMenu.value = false;
  };
  
  const exportAsPDF = async () => {
    if (!calendarRef.value) return;
  
    const canvas = await html2canvas(calendarRef.value);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('veterinary_appointments.pdf');
    showExportMenu.value = false;
  };
  
  const exportAsImage = async () => {
    if (!calendarRef.value) return;
  
    const canvas = await html2canvas(calendarRef.value);
    canvas.toBlob((blob) => {
      saveAs(blob, 'veterinary_appointments.png');
    });
    showExportMenu.value = false;
  };

  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };

  const setFilter = (type) => {
    filters.value.type = type;
    showFilters.value = false;
  };
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