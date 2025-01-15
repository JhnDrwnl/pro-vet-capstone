<template>
  <aside class="fixed inset-y-4 z-10 flex flex-col transition-all duration-300 bg-white border border-gray-100 rounded-2xl shadow-sm"
         :class="{ 'w-64': isOpen, 'w-16': !isOpen, 'left-4': true, 'md:translate-x-0': true }">
    <!-- Logo and Toggle Button (Shows at top when expanded) -->
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
    <nav class="flex-grow p-4 space-y-2 overflow-y-auto" :class="{ 'overflow-hidden': !isOpen }">
      <template v-for="(item, index) in navItems" :key="index">
        <div v-if="item.subItems" class="relative group">
          <button 
            @click="toggleSubmenu(item.label)"
            class="w-full flex items-center rounded-lg transition-colors duration-200"
            :class="[
              isActiveParent(item) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50',
              isOpen ? 'px-4 py-2' : 'p-2 justify-center'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5" :class="{ 'mr-3': isOpen }" />
            <span v-if="isOpen">{{ item.label }}</span>
            <ChevronDown 
              v-if="isOpen" 
              class="w-4 h-4 ml-auto transition-transform duration-200"
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
              <component :is="subItem.icon" class="w-4 h-4 mr-3" />
              <span>{{ subItem.label }}</span>
            </router-link>
          </div>
          <!-- Tooltip when collapsed -->
          <div v-if="!isOpen" 
               class="fixed left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
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
          <component :is="item.icon" class="w-5 h-5" :class="{ 'mr-3': isOpen }" />
          <span v-if="isOpen">{{ item.label }}</span>
          <!-- Tooltip when collapsed -->
          <div v-if="!isOpen" 
               class="fixed left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
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
  BarChart,
  Calendar,
  Users,
  Clock,
  Database,
  Video,
  MessageSquare,
  PawPrint,
  PanelLeftClose,
  PanelRightClose,
  Settings,
  ChevronDown,
  UserCircle,
  Stethoscope,
  Settings2,
  ArchiveIcon
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
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/admin/usermanagement', icon: Users, label: 'User Management' },
  { 
    icon: Calendar, 
    label: 'Appointments',
    subItems: [
      { href: '/admin/appointments/approvedappointments', icon: Video, label: 'Appointment Management' },
      { href: '/admin/appointments/services', icon: Users, label: 'Services Management' }
    ]
  },
  { 
    icon: Clock, 
    label: 'Session',
    subItems: [
      { href: '/admin/session/online', icon: Video, label: 'Online' },
      { href: '/admin/session/walkin', icon: Users, label: 'Walk-in' }
    ]
  },
  { 
    icon: Database,
    label: 'Data Management',
    subItems: [
      {href: '/admin/datamanagement/petowners', icon: UserCircle, label: 'Pet Owners'},
      { href: '/admin/datamanagement/petprofiles', icon: PawPrint, label: 'Pet Profiles' },
      { href: '/admin/datamanagement/veterinarians', icon: Stethoscope, label: 'Veterinarians' }
    ]
  },
  { href: '/admin/telehealth', icon: Video, label: 'Telehealth' },
  { href: '/admin/chatbot', icon: MessageSquare, label: 'Chatbot' },
  { 
    icon: Settings,
    label: 'Settings',
    subItems: [
      {href: '/admin/adminsettings/adminarchive', icon: ArchiveIcon, label: 'Archive'},
      { href: '/admin/adminsettings/adminaccount', icon: Settings2, label: 'Account Settings' },
     
    ]
  },
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