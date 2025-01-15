<template>
  <aside class="fixed inset-y-0 z-10 flex flex-col transition-all duration-300 bg-white border-r border-gray-200"
         :class="{ 'w-64': isOpen, 'w-16': !isOpen }">
    <!-- Logo and Toggle Button -->
    <div v-if="isOpen" class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
      <h1 class="text-xl font-semibold text-blue-600">ProVet</h1>
      <button @click="$emit('toggle')" 
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
        <PanelLeftClose class="w-5 h-5" />
      </button>
    </div>
    <div v-else class="px-4 py-4 border-b border-gray-200">
      <PawPrint class="w-6 h-6 text-blue-600 mx-auto" />
    </div>

    <!-- Navigation -->
    <nav class="flex-grow p-4 space-y-2" :class="{ 'overflow-y-auto': isOpen, 'overflow-hidden': !isOpen }">
      <template v-for="(item, index) in navItems" :key="index">
        <div v-if="item.subItems" class="relative group">
          <button 
            @click="toggleSubmenu(item.label)"
            class="w-full flex items-center justify-between rounded-lg transition-colors duration-200"
            :class="[
              isActiveParent(item) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50',
              isOpen ? 'px-4 py-2' : 'p-2'
            ]"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" :class="{ 'mr-3': isOpen }" />
              <span v-if="isOpen" class="flex-grow text-left">{{ item.label }}</span>
            </div>
            <ChevronDown 
              v-if="isOpen" 
              class="w-4 h-4 flex-shrink-0 transition-transform duration-200"
              :class="{ 'rotate-180': openSubmenu === item.label }"
            />
          </button>
          <!-- Submenu -->
          <div v-if="isOpen && openSubmenu === item.label" 
               class="pl-4 mt-2 space-y-2 transition-all duration-200">
            <router-link v-for="subItem in item.subItems" 
                         :key="subItem.href" 
                         :to="subItem.href"
                         class="flex items-center px-4 py-2 rounded-lg transition-colors duration-200"
                         :class="subItem.href === currentRoute ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'">
              <component :is="subItem.icon" class="w-4 h-4 mr-3 flex-shrink-0" />
              <span class="flex-grow">{{ subItem.label }}</span>
            </router-link>
          </div>
          <!-- Tooltip when collapsed -->
          <div v-if="!isOpen" 
               class="fixed left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
            {{ item.label }}
          </div>
        </div>
        <router-link v-else
           :to="item.href" 
           class="flex items-center rounded-lg transition-colors duration-200 relative group"
           :class="[
             item.href === currentRoute ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50',
             isOpen ? 'px-4 py-2' : 'p-2 justify-center'
           ]"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" :class="{ 'mr-3': isOpen }" />
          <span v-if="isOpen" class="flex-grow">{{ item.label }}</span>
          <!-- Tooltip when collapsed -->
          <div v-if="!isOpen" 
               class="fixed left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
            {{ item.label }}
          </div>
        </router-link>
      </template>
    </nav>

    <!-- Toggle Button (Shows at bottom when collapsed) -->
    <div v-if="!isOpen" class="mt-auto border-t border-gray-200 p-4">
      <button @click="$emit('toggle')" 
              class="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
        <PanelRightClose class="w-5 h-5" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageCircle,
  Video,
  ClipboardList,
  ActivitySquare,
  PawPrint,
  PanelLeftClose,
  PanelRightClose,
  Settings,
  Check,
  ChevronDown
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

defineEmits(['toggle']);

const route = useRoute();
const currentRoute = computed(() => route.path);

const openSubmenu = ref(null);

const toggleSubmenu = (label) => {
  openSubmenu.value = openSubmenu.value === label ? null : label;
};

const navItems = [
  { href: '/vet/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vet/vetclientpets', icon: Users, label: 'Clients & Pets' },
  { 
    icon: Calendar,
    label: 'Appointments',
    subItems: [
      { href: '/vet/appointments/vetappointmentapproval', icon: Check, label: 'Appointment Approval' },
      { href: '/vet/appointments/vetcalendar', icon: Calendar, label: 'Calendar' },
    ]
  },
  { href: '/vet/vetfeedback', icon: MessageCircle, label: 'Feedback' },
  { href: '/vet/vettelehealth', icon: Video, label: 'Telehealth' },
  { href: '/vet/medicalrecords', icon: ClipboardList, label: 'Medical Records' },
  { href: '/vet/vethealthriskassessment', icon: ActivitySquare, label: 'Health Risk Assessment' },
  { href: '/vet/settings', icon: Settings, label: 'Settings' },
];

const isActiveParent = (item) => {
  if (item.subItems) {
    return item.subItems.some(subItem => subItem.href === currentRoute.value);
  }
  return false;
};
</script>

<style scoped>
.group:hover .group-hover\:visible {
  visibility: visible;
}
</style>

