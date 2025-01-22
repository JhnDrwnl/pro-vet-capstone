<!-- layouts/VeterinaryLayout.vue -->
<template>
    <div class="min-h-screen bg-gray-100 relative">
      <!-- Sidebar with dynamic z-index -->
      <VeterinarySidebar 
        :isOpen="isSidebarOpen" 
        @toggle="toggleSidebar"
        :isSmallScreen="isSmallScreen"
        @item-click="handleSidebarItemClick"
        :class="[
          'transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-[70]',
          { 'translate-x-0': isSidebarOpen || !isSmallScreen, '-translate-x-full': !isSidebarOpen && isSmallScreen }
        ]"
      />
    
      <!-- Main Content -->
      <div 
        class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out px-6"
        :style="{ marginLeft: isSmallScreen ? '0' : (isSidebarOpen ? '280px' : '96px') }"
      >
        <!-- Header with scroll behavior -->
        <div 
          ref="headerContainer"
          class="fixed right-6 z-50 transition-all duration-300 ease-in-out"
          :style="{ 
            left: isSmallScreen ? '1.5rem' : (isSidebarOpen ? 'calc(280px + 1.5rem)' : 'calc(96px + 1.5rem)'),
            top: `${headerTopPosition}px`,
            width: isSmallScreen ? 'calc(100% - 3rem)' : 'calc(100% - 3rem - ' + (isSidebarOpen ? '280px' : '96px') + ')'
          }"
        >
          <Header 
            :isSidebarOpen="isSidebarOpen"
            @toggle-sidebar="toggleSidebar"
            :isSmallScreen="isSmallScreen"
          />
        </div>
        
        <!-- Main content area -->
        <div class="flex-1 flex flex-col">
          <!-- Spacer to push content below fixed header -->
          <div class="h-[89px]"></div>
          
          <Breadcrumb class="py-4" :currentRoute="currentRoute" :navItems="navItems" />
          
          <main class="flex-1 py-4 overflow-y-auto">
            <div class="w-full">
              <router-view></router-view>
            </div>
          </main>
        </div>
  
        <!-- Modal container -->
        <div class="fixed inset-0 z-50 pointer-events-none">
          <slot name="modal"></slot>
        </div>
      </div>
    
      <!-- Overlay for mobile -->
      <div 
        v-if="isSidebarOpen && isSmallScreen" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-50"
        @click="closeSidebarOnMobile"
      ></div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import VeterinarySidebar from '@/components/veterinary/Sidebar.vue';
  import Header from '@/components/veterinary/Header.vue';
  import Breadcrumb from '@/components/common/Breadcrumb.vue';
  import {
    LayoutDashboard,
    Calendar,
    Users,
    Stethoscope,
    FileText,
    MessageSquare,
    Settings,
    UserCircle
  } from 'lucide-vue-next';
  
  const isSidebarOpen = ref(window.innerWidth >= 768);
  const headerTopPosition = ref(16);
  const headerContainer = ref(null);
  const isSmallScreen = ref(false);
  
  const toggleBodyScroll = (disable) => {
    if (disable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
    if (isSmallScreen.value) {
      toggleBodyScroll(isSidebarOpen.value);
    }
  };
  
  const route = useRoute();
  const currentRoute = computed(() => route.path);
  
  const navItems = [
    { href: '/veterinary/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/veterinary/appointments', icon: Calendar, label: 'Appointments' },
    { href: '/veterinary/patients', icon: Users, label: 'Patients' },
    { href: '/veterinary/consultations', icon: Stethoscope, label: 'Consultations' },
    { href: '/veterinary/medical-records', icon: FileText, label: 'Medical Records' },
    { href: '/veterinary/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/veterinary/settings', icon: Settings, label: 'Settings' },
    { href: '/veterinary/profile', icon: UserCircle, label: 'Profile' },
  ];
  
  const handleScroll = () => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    headerTopPosition.value = Math.max(0, 16 - scrollPosition);
  };
  
  const handleResize = () => {
    isSmallScreen.value = window.innerWidth < 768;
    if (!isSmallScreen.value) {
      isSidebarOpen.value = true;
    } else {
      isSidebarOpen.value = false;
    }
  };
  
  const closeSidebarOnMobile = () => {
    if (isSmallScreen.value) {
      isSidebarOpen.value = false;
      toggleBodyScroll(false);
    }
  };
  
  const handleSidebarItemClick = () => {
    if (isSmallScreen.value) {
      isSidebarOpen.value = false;
      toggleBodyScroll(false);
    }
  };
  
  watch(isSmallScreen, (newValue) => {
    if (!newValue) {
      toggleBodyScroll(false);
    }
  });
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    toggleBodyScroll(false); // Ensure scroll is enabled when component is unmounted
  });
  </script>
  
  