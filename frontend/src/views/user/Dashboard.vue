<template>
  <div class="min-h-screen bg-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Left Section -->
    <div class="md:col-span-2 space-y-6">
      <!-- Welcome User Section -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold">Welcome, User!</h2>
        <p class="mt-2">Manage your appointments and stay updated with your pet's health.</p>
      </div>

      <!-- Date Selection -->
      <div>
        <h2 class="text-lg font-medium mb-4">Today, 27 March</h2>
        <div class="grid grid-cols-6 gap-2">
          <button 
            v-for="date in dates" 
            :key="date.day"
            @click="selectDate(date)"
            class="flex flex-col items-center py-2 rounded-lg transition-colors"
            :class="date.active ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'"
          >
            <span class="text-xs mb-1">{{ date.dayName }}</span>
            <span class="text-sm font-medium">{{ date.day }}</span>
          </button>
        </div>
      </div>

      <!-- Appointments Section -->
      <div>
        <h3 class="text-base font-medium mb-4">Doctor's Appointments</h3>
        <div class="relative">
          <div class="absolute left-0 top-0 h-full w-12 flex flex-col text-gray-400 text-sm">
            <div v-for="time in timeSlots" :key="time" class="h-[100px]">{{ time }}</div>
          </div>
          <div class="ml-12 relative">
            <div class="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-100"></div>
            <template v-for="appointment in appointments" :key="appointment.id">
              <div class="relative mb-8">
                <div :class="['absolute left-0 w-3 h-3 rounded-full -translate-x-1', appointment.color]"></div>
                <div class="ml-6 bg-opacity-50 rounded-lg p-4 relative" :class="appointment.bgColor">
                  <div class="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-2 h-2 rotate-45" :class="appointment.bgColor"></div>
                  <p class="text-xs font-medium mb-1" :class="appointment.textColor">{{ appointment.time }}</p>
                  <h4 class="text-sm font-medium mb-1">{{ appointment.title }}</h4>
                  <p class="text-xs text-gray-500">Doctor: {{ appointment.doctor }}</p>
                  <p class="text-xs text-gray-500">{{ appointment.assistant }}</p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Recent & New Appointments -->
      <AppointmentList title="Recent Appointments" :appointments="recentAppointments" />
      <AppointmentList title="New Appointments" :appointments="newAppointments" @reschedule="reschedule" @cancel="cancel" />
    </div>

    <!-- Right Section - Task Calendar -->
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Upcoming Tasks</h3>
      <ul>
        <li v-for="task in tasks" :key="task.id" class="py-3 border-b flex justify-between items-center">
          <div>
            <p class="text-lg font-medium text-gray-700">{{ task.date }} - {{ task.time }}</p>
            <p class="text-sm text-gray-500">{{ task.description }}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-600">{{ task.status }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const dates = ref([...Array(6).keys()].map(i => ({
  day: (18 + i).toString(), 
  dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], 
  active: i === 2 
})));

const selectDate = selectedDate => dates.value.forEach(date => date.active = date.day === selectedDate.day);

const timeSlots = ref(["9 am", "10 am", "11 am", "12 pm", "1 pm", "2 pm"]);

const appointments = ref([
  { id: 1, time: "9:00 am - 11:00 am", title: "Kyungshang Medical College Hospital", doctor: "Jason Duncan (MBBS, MD, Therapist)", assistant: "Assistant", color: "bg-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  { id: 2, time: "1:00 pm - 2 pm", title: "Hand examination", doctor: "Jason Duncan (MBBS, MD, Surgeon)", assistant: "Assistant", color: "bg-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-600" }
]);

const recentAppointments = ref([
  { id: 1, petName: 'Max', service: 'Vaccination', date: 'Feb 21', time: '10:00 AM', status: 'Completed' },
  { id: 2, petName: 'Bella', service: 'Check-up', date: 'Feb 20', time: '3:00 PM', status: 'Completed' }
]);

const newAppointments = ref([
  { id: 3, petName: 'Luna', service: 'Grooming', date: 'Feb 25', time: '2:00 PM' },
  { id: 4, petName: 'Charlie', service: 'Dental Cleaning', date: 'Feb 26', time: '11:00 AM' }
]);

const tasks = ref([
  { id: 1, date: 'Feb 22', time: '9:00 AM', description: 'Dog check-up', status: 'Pending' },
  { id: 2, date: 'Feb 23', time: '1:00 PM', description: 'Vaccination for Bella', status: 'Pending' }
]);

const reschedule = id => alert(`Reschedule appointment ${id}`);
const cancel = id => alert(`Cancel appointment ${id}`);
</script>

<style scoped>
</style>