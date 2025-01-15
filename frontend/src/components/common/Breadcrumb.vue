<!-- components/common/Breadcrumbs -->
<template>
  <div class="px-6 py-4">
    <div class="flex items-center text-sm text-gray-600">
      <router-link 
        :to="dashboardRoute"
        class="hover:text-blue-600"
      >
        Dashboard
      </router-link>
      <template v-if="currentPage !== 'Dashboard'">
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ currentPage }}</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Map routes to sidebar navigation names
const routeNameMap = {
  'dashboard': 'Dashboard',
  'analytics': 'Analytics',
  'appointments': 'Appointments',
  'petowners': 'Pet Owners',
  'veterinarians': 'Veterinarians',
  'online': 'Online',
  'approvedappointments': 'Appointment Management',
  'services': 'Services',
  'walkin': 'Walk-in',
  'datamanagement': 'Data Management',
  'usermanagement': 'User Management',
  'admincalendar':'Calendar',
  'telehealth': 'Telehealth',
  'chatbot': 'Chatbot',
  'settings': 'Settings',
  'petprofiles': 'Pet Profiles',
  'userappointments': 'Appointments',
  'feedback':'Feedback',
  'usertelehealth':'Telehealth',
  'vetclientpets':'Clients & Pets',
  'vetappointmentapproval':'Appointment Approval',
  'vetcalendar':'Calendar',
  'vetfeedback':'Feedback',
  'vettelehealth':'Telehealth',
  'medicalrecords':'Medical Records',
  'vethealthriskassessment':'Health Risk Assessment',
};

const currentPage = computed(() => {
  const path = route.path.split('/').pop();
  return routeNameMap[path] || 'Dashboard';
});

const dashboardRoute = computed(() => {
  const baseRoute = route.path.split('/')[1]; // This will be 'admin', 'user', or 'vet'
  return `/${baseRoute}/dashboard`;
});
</script>

