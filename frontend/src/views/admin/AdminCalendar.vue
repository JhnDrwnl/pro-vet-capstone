<template>
    <div class="min-h-screen bg-white p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-6">
          <h1 class="text-xl font-semibold text-teal-800">Veterinary Appointments</h1>
          <div class="flex gap-4">
            <button 
              v-for="tab in ['All appointments', 'Online', 'Walk-in', 'Completed']" 
              :key="tab"
              :class="[
                'text-sm',
                selectedTab === tab ? 'text-teal-900' : 'text-teal-600'
              ]"
              @click="selectedTab = tab"
            >
              {{ tab }}
            </button>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="relative">
            <SearchIcon class="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search appointments" 
              class="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:border-teal-500 focus:ring-teal-500"
            >
          </div>
          <button 
            @click="openNewAppointment"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <PlusIcon class="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>
  
      <!-- Calendar Controls -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-sm text-teal-600">{{ currentMonth }}</span>
            <span class="text-2xl font-semibold text-teal-900">{{ currentDay }}</span>
          </div>
        </div>
  
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <button @click="previousWeek" class="p-2 hover:bg-teal-50 rounded-lg">
              <ChevronLeftIcon class="w-4 h-4 text-teal-600" />
            </button>
            <button @click="goToToday" class="px-3 py-1 text-sm hover:bg-teal-50 rounded-lg text-teal-600">
              Today
            </button>
            <button @click="nextWeek" class="p-2 hover:bg-teal-50 rounded-lg">
              <ChevronRightIcon class="w-4 h-4 text-teal-600" />
            </button>
          </div>
        </div>
      </div>
  
      <!-- Calendar Grid -->
      <div class="border rounded-lg shadow-sm">
        <!-- Time Column -->
        <div class="grid grid-cols-8 h-full">
          <div class="border-r">
            <div class="h-12 border-b"></div> <!-- Header spacer -->
            <div v-for="hour in timeSlots" :key="hour" class="h-20 border-b">
              <span class="text-xs text-gray-500 p-2">{{ hour }}</span>
            </div>
          </div>
  
          <!-- Days Columns -->
          <div class="col-span-7 grid grid-cols-7">
            <!-- Days Header -->
            <div 
              v-for="day in weekDays" 
              :key="day.date" 
              class="h-12 border-b border-r p-2 text-center"
            >
              <div class="text-sm text-gray-500">{{ day.dayName }}</div>
              <div class="text-sm font-semibold" :class="day.isToday ? 'text-teal-600' : ''">
                {{ day.date }}
              </div>
            </div>
  
            <!-- Appointment Slots -->
            <template v-for="day in 7" :key="day">
              <div class="relative border-r">
                <div 
                  v-for="hour in timeSlots" 
                  :key="hour" 
                  class="h-20 border-b"
                >
                  <!-- Sample Appointments -->
                  <div 
                    v-for="appt in getAppointmentsForSlot(day, hour)"
                    :key="appt.id"
                    :class="[
                      'absolute w-[calc(100%-8px)] mx-1 rounded-lg p-2 shadow-sm',
                      appt.type === 'online' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                    ]"
                    :style="`top: ${getAppointmentPosition(appt)}px`"
                  >
                    <div class="text-xs font-medium">{{ appt.petName }}</div>
                    <div class="text-xs opacity-75">{{ appt.type }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
  
      <!-- New Appointment Modal -->
      <div v-if="isNewAppointmentOpen" class="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl">
          <div class="flex justify-between items-center p-4 border-b">
            <h2 class="text-lg font-medium text-teal-900">New Appointment</h2>
            <button @click="closeNewAppointment" class="text-gray-400 hover:text-gray-600">
              <XIcon class="w-5 h-5" />
            </button>
          </div>
  
          <div class="p-4 space-y-4">
            <!-- Owner Name -->
            <div class="flex items-center gap-3">
              <UserIcon class="w-5 h-5 text-teal-400" />
              <input
                v-model="newAppointment.ownerName"
                type="text"
                placeholder="Owner Name"
                class="flex-1 border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 px-0"
              />
            </div>
  
            <!-- Pet Name -->
            <div class="flex items-center gap-3">
              <PawPrintIcon class="w-5 h-5 text-teal-400" />
              <input
                v-model="newAppointment.petName"
                type="text"
                placeholder="Pet Name"
                class="flex-1 border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 px-0"
              />
            </div>
  
            <!-- Appointment Type -->
            <div class="flex items-center gap-3">
              <ActivityIcon class="w-5 h-5 text-teal-400" />
              <div class="flex gap-2">
                <button
                  v-for="type in ['online', 'walk-in']"
                  :key="type"
                  @click="newAppointment.type = type"
                  :class="[
                    'px-4 py-1.5 rounded-lg text-sm capitalize',
                    newAppointment.type === type 
                      ? 'bg-teal-50 text-teal-600' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>
  
            <!-- Date & Time -->
            <div class="flex items-center gap-3">
              <CalendarIcon class="w-5 h-5 text-teal-400" />
              <input
                v-model="newAppointment.date"
                type="date"
                class="flex-1 border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 px-0"
              />
            </div>
  
            <div class="flex items-center gap-3">
              <ClockIcon class="w-5 h-5 text-teal-400" />
              <select
                v-model="newAppointment.time"
                class="flex-1 border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 px-0"
              >
                <option v-for="time in timeSlots" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
  
            <!-- Notes -->
            <div class="flex items-center gap-3">
              <AlignLeftIcon class="w-5 h-5 text-teal-400" />
              <input
                v-model="newAppointment.notes"
                type="text"
                placeholder="Add Notes"
                class="flex-1 border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 px-0"
              />
            </div>
          </div>
  
          <div class="flex justify-end gap-2 p-4 border-t">
            <button 
              @click="closeNewAppointment"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              @click="saveNewAppointment"
              class="px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
            >
              Save Appointment
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
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    XIcon,
    UserIcon,
    CalendarIcon,
    ClockIcon,
    AlignLeftIcon,
    ActivityIcon,
    PawPrintIcon,
  } from 'lucide-vue-next';
  
  const selectedTab = ref('All appointments');
  const isNewAppointmentOpen = ref(false);
  const currentDate = ref(new Date());
  
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];
  
  const appointments = ref([
    { 
      id: 1, 
      petName: 'Max', 
      ownerName: 'John Doe',
      type: 'online',
      date: '2024-01-12',
      time: '09:00 AM',
      notes: 'Regular checkup'
    },
    { 
      id: 2, 
      petName: 'Luna',
      ownerName: 'Jane Smith', 
      type: 'walk-in',
      date: '2024-01-12',
      time: '02:00 PM',
      notes: 'Vaccination'
    }
  ]);
  
  const newAppointment = ref({
    ownerName: '',
    petName: '',
    type: 'online',
    date: '',
    time: '',
    notes: ''
  });
  
  const currentMonth = computed(() => {
    return currentDate.value.toLocaleString('default', { month: 'long' });
  });
  
  const currentDay = computed(() => {
    return currentDate.value.getDate();
  });
  
  const weekDays = computed(() => {
    const days = [];
    const current = new Date(currentDate.value);
    current.setDate(current.getDate() - current.getDay() + 1);
  
    for (let i = 0; i < 7; i++) {
      days.push({
        date: current.getDate(),
        dayName: current.toLocaleDateString('default', { weekday: 'short' }),
        isToday: current.toDateString() === new Date().toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  });
  
  const getAppointmentsForSlot = (day, time) => {
    return appointments.value.filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.getDay() === day && appt.time === time;
    });
  };
  
  const getAppointmentPosition = (appointment) => {
    const hour = parseInt(appointment.time);
    return (hour - 9) * 80;
  };
  
  const openNewAppointment = () => {
    newAppointment.value.date = currentDate.value.toISOString().split('T')[0];
    isNewAppointmentOpen.value = true;
  };
  
  const closeNewAppointment = () => {
    isNewAppointmentOpen.value = false;
    newAppointment.value = {
      ownerName: '',
      petName: '',
      type: 'online',
      date: '',
      time: '',
      notes: ''
    };
  };
  
  const saveNewAppointment = () => {
    appointments.value.push({
      id: Date.now(),
      ...newAppointment.value
    });
    closeNewAppointment();
  };
  
  const previousWeek = () => {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() - 7);
    currentDate.value = newDate;
  };
  
  const nextWeek = () => {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() + 7);
    currentDate.value = newDate;
  };
  
  const goToToday = () => {
    currentDate.value = new Date();
  };
  </script>