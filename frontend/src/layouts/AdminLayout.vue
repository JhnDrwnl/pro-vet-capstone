<!-- layouts/AdminLayout.vue -->
<template>
    <div class="min-h-screen bg-gray-100 relative">
      <!-- Sidebar with dynamic z-index -->
      <AdminSidebar 
        :isOpen="isSidebarOpen" 
        @toggle="toggleSidebar"
        :class="[
          'transition-all duration-300 ease-in-out fixed inset-y-0 left-0',
          isSidebarActive ? 'z-[80]' : 'z-[60]'
        ]"
      />
    
      <!-- Main Content -->
      <div 
        class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        :class="{ 'ml-64': isSidebarOpen, 'ml-16': !isSidebarOpen }"
      >
        <!-- Header with dynamic z-index -->
        <Header 
          :isSidebarOpen="isSidebarOpen"
          @toggle-sidebar="toggleSidebar"
          :class="[
            'sticky top-0 transition-all duration-300 ease-in-out',
            isSidebarActive ? 'z-[60]' : 'z-[70]'
          ]"
        />
        
        <Breadcrumb class="px-6 py-4" :currentRoute="currentRoute" :navItems="navItems" />
        
        <main class="flex-1 px-6 py-4">
          <div class="w-full">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <router-view></router-view>
            </div>
          </div>
        </main>
  
        <!-- Modal container -->
        <div class="fixed inset-0 z-50 pointer-events-none">
          <slot name="modal"></slot>
        </div>
      </div>
    
      <!-- Overlay for mobile -->
      <div 
        v-if="isSidebarOpen" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity md:hidden z-50"
        @click="closeSidebarOnMobile"
      ></div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import AdminSidebar from '@/components/admin/Sidebar.vue';
  import Header from '@/components/admin/Header.vue';
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
  const isSidebarActive = ref(false);
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
    // When toggling via button, make sidebar active
    isSidebarActive.value = isSidebarOpen.value;
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
  
  // Handle click outside for mobile
  const handleClickOutside = (event) => {
    if (window.innerWidth < 768 && isSidebarOpen.value) {
      // Check if click is outside sidebar
      const sidebar = document.querySelector('[data-sidebar]');
      const header = document.querySelector('[data-header]');
      if (sidebar && !sidebar.contains(event.target) && 
          header && !header.contains(event.target)) {
        isSidebarOpen.value = false;
        isSidebarActive.value = false;
      }
    }
  };
  
  // Handle sidebar interaction
  const handleSidebarInteraction = (event) => {
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar && sidebar.contains(event.target)) {
      isSidebarActive.value = true;
    } else {
      isSidebarActive.value = false;
    }
  };
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('mousedown', handleSidebarInteraction);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('mousedown', handleSidebarInteraction);
  });
  
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      isSidebarOpen.value = false;
      isSidebarActive.value = false;
    }
  };
  </script>