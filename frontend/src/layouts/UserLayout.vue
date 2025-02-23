<!-- layouts/UserLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-50">
    <UserSidebar 
      :isOpen="isSidebarOpen" 
      @toggle="toggleSidebar" 
      @toggleSearch="toggleSearch"
      @toggleNotifications="toggleNotifications"
      class="z-30" 
    />
    <SearchPanel 
      v-if="isSearchOpen"
      :isMobileView="isMobileView"
      @close="toggleSearch(false)"
      class="z-40"
    />
    <NotificationPanel
      v-if="isNotificationsOpen"
      :isMobileView="isMobileView"
      :isVisible="isNotificationsOpen"
      @close="toggleNotifications(false)"
      class="z-40"
    />
    <div class="flex-1 flex flex-col transition-all duration-300"
         :class="[
           isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
         ]">
      <main 
        class="flex-grow px-4 md:px-6 overflow-y-auto pt-safe pb-safe"
        :style="mainContentStyle"
      >
        <router-view></router-view>
      </main>
      <div class="fixed inset-0 z-50 pointer-events-none">
        <slot name="modal"></slot>
      </div>
    </div>
    
    <!-- Chatbot Button -->
    <ChatbotButton @toggle="toggleChatbot" :isVisible="!isMobileView" />
  </div>
</template>

  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import UserSidebar from '@/components/user/Sidebar.vue';
  import ChatbotButton from '@/components/common/Chatbot.vue';
  import SearchPanel from '@/components/common/SearchPanel.vue';
  import NotificationPanel from '@/components/common/NotificationPanel.vue';
  
  const isSidebarOpen = ref(true);
  const isMobileView = ref(false);
  const isSearchOpen = ref(false);
  const isNotificationsOpen = ref(false);
  
  const toggleSidebar = (value) => {
    isSidebarOpen.value = typeof value === 'boolean' ? value : !isSidebarOpen.value;
  };
  
  const toggleChatbot = () => {
    // Add your chatbot toggle logic here
    console.log('Chatbot toggled');
  };
  
  const toggleSearch = (value) => {
  isSearchOpen.value = value;
  if (value) {
    isNotificationsOpen.value = false;
  }
};
  const toggleNotifications = (value) => {
  isNotificationsOpen.value = value;
  if (value) {
    isSearchOpen.value = false;
  }
};
  
  const checkMobile = () => {
    isMobileView.value = window.innerWidth < 768;
    if (isMobileView.value) {
      isSidebarOpen.value = false;
    }
  };
  
  const mainContentStyle = computed(() => ({
    height: isMobileView.value ? 'calc(100vh - 12rem)' : 'auto',
    paddingTop: isMobileView.value ? '5rem' : '1rem',
    paddingBottom: isMobileView.value ? '6rem' : '1rem'
  }));
  
  onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
  });
  </script>
  
  <style scoped>
  @supports(padding-top: env(safe-area-inset-top)) {
    .pt-safe {
      padding-top: env(safe-area-inset-top);
    }
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
  </style>
  
  
  
  