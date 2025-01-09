<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-50">
    <Sidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />
    <div class="flex flex-col flex-grow transition-all duration-300 relative z-20" 
         :class="{ 'ml-64': isSidebarOpen, 'ml-16': !isSidebarOpen }">
      <Header class="z-30" />
      <Breadcrumb class="px-6 py-4" :currentRoute="currentRoute" :navItems="navItems" />
      <main class="flex-grow p-6 overflow-y-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/admin/AdminSidebar.vue';
import Header from '@/components/admin/AdminHeader.vue';
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import {
  LayoutDashboard,
  BarChart,
  Calendar,
  Users,
  Database,
  Video,
  MessageSquare,
  Settings
} from 'lucide-vue-next';

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const route = useRoute();
const currentRoute = computed(() => route.path);

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/admin/usermanagement', icon: Users, label: 'User Management' },
  { href: '/admin/datamanagement', icon: Database, label: 'Data Management' },
  { href: '/admin/telehealth', icon: Video, label: 'Telehealth' },
  { href: '/admin/chatbot', icon: MessageSquare, label: 'Chatbot' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];
</script>

