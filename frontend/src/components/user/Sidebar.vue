<template>
  <aside class="fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 bg-white border-r border-gray-200"
         :class="{ 'w-64': isOpen, 'w-16': !isOpen }">
    <!-- Logo and Toggle Button (Shows at top when expanded) -->
    <div v-if="isOpen" class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
      <h1 class="text-xl font-semibold text-blue-600">ProVet</h1>
      <button @click="$emit('toggle')" 
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
        <PanelLeftClose class="w-5 h-5" />
      </button>
    </div>
    <div v-else class="px-4 py-4 border-b border-gray-200">
      <PawPrintIcon class="w-6 h-6 text-blue-600 mx-auto" />
    </div>

    <!-- Navigation -->
    <nav class="flex-grow p-4 space-y-2" :class="{ 'overflow-y-auto': isOpen, 'overflow-hidden': !isOpen }">
      <a v-for="(item, index) in navItems" 
         :key="index" 
         :href="item.href" 
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
             class="fixed left-16 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
          {{ item.label }}
        </div>
      </a>
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  Calendar,
  PawPrintIcon,
  Settings,
  Video,
  MessageCircle,
  PanelLeftClose,
  PanelRightClose
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

const navItems = [
  { href: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/user/petprofiles', icon: PawPrintIcon, label: 'Pet Profiles' },
  { href: '/user/userappointments', icon: Calendar, label: 'Appointments' },
  { href: '/user/usertelehealth', icon: Video, label: 'Telehealth' },
  { href: '/user/feedback', icon: MessageCircle, label: 'Feedback' },
  { href: '/user/settings', icon: Settings, label: 'Settings' },
];
</script>

<style scoped>
.group:hover .group-hover\:visible {
  visibility: visible;
}
</style>

