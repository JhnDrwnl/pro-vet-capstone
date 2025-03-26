<!-- layouts/UserLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-50">
    <UserSidebar 
      :isOpen="isSidebarOpen" 
      @toggle="toggleSidebar" 
      @toggleSearch="toggleSearch"
      @toggleNotifications="toggleNotifications"
      class="z-40" 
    />
    <SearchPanel 
      v-if="isSearchOpen"
      :isMobileView="isMobileView"
      @close="toggleSearch(false)"
      class="z-20"
    />
    <NotificationPanel
      v-if="isNotificationsOpen"
      :isMobileView="isMobileView"
      :isVisible="isNotificationsOpen"
      @close="toggleNotifications(false)"
      class="z-20"
    />
    <div class="flex-1 flex flex-col transition-all duration-300"
         :class="[
           isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
         ]">
      <main 
        class="flex-grow px-4 md:px-6 overflow-y-auto"
        :class="{'pt-safe pb-safe': !isMobileView}"
        :style="mainContentStyle"
      >
        <!-- Pass the isSidebarOpen prop to the router-view -->
        <router-view :isSidebarOpen="isSidebarOpen"></router-view>
      </main>
      <div class="fixed inset-0 z-10 pointer-events-none">
        <slot name="modal"></slot>
      </div>
    </div>
    
    <!-- Chatbot Button - Now visible on all devices with custom positioning -->
    <div class="chatbot-wrapper">
      <ChatbotButton @toggle="toggleChatbot" :isVisible="true" />
    </div>
    
    <!-- Push Notification Modal -->
    <PushNotificationModal 
      :show="showNotificationModal" 
      @close="closeNotificationModal"
      @enabled="handleNotificationsEnabled"
      @skipped="handleNotificationsSkipped"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import UserSidebar from '@/components/user/Sidebar.vue';
import ChatbotButton from '@/components/common/Chatbot.vue';
import SearchPanel from '@/components/common/SearchPanel.vue';
import NotificationPanel from '@/components/common/NotificationPanel.vue';
import PushNotificationModal from '@/components/common/PushNotificationModal.vue';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';
import { useAuthStore } from '@/stores/modules/authStore';
import notificationService from '@/services/notificationService';

const route = useRoute();
const authStore = useAuthStore();
const isSidebarOpen = ref(true);
const isMobileView = ref(false);
const isSearchOpen = ref(false);
const isNotificationsOpen = ref(false);
const showNotificationModal = ref(false);

// Watch for route changes to detect if we need to open the notifications panel
watch(() => route.path, (newPath) => {
  if (newPath === '/user/notifications') {
    // Open the notifications panel
    toggleNotifications(true);
  }
});

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

// Notification modal methods
const closeNotificationModal = () => {
  showNotificationModal.value = false;
  localStorage.removeItem('showNotificationModal');
};

const handleNotificationsEnabled = async (success) => {
  console.log('Notifications enabled:', success);
  try {
    // Update user document to indicate notifications are configured
    if (authStore.currentUser) {
      const userId = authStore.currentUser.userId;
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        notificationsConfigured: true,
        notificationsEnabled: success,
        updatedAt: new Date()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
};

const handleNotificationsSkipped = async () => {
  console.log('Notifications skipped');
  try {
    // Update user document to indicate notifications were skipped
    if (authStore.currentUser) {
      const userId = authStore.currentUser.userId;
      const userRef = doc(db, 'users', userId);
      
      await setDoc(userRef, {
        notificationsConfigured: true,
        notificationsEnabled: false,
        updatedAt: new Date()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
};

const checkMobile = () => {
  isMobileView.value = window.innerWidth < 768;
  if (isMobileView.value) {
    isSidebarOpen.value = false;
  }
};

const mainContentStyle = computed(() => ({
  height: isMobileView.value ? 'calc(100vh - 8rem)' : 'auto',
  paddingTop: isMobileView.value ? '2.5rem' : '1rem', // Increased from 1rem to 2.5rem for mobile
  paddingBottom: isMobileView.value ? '5rem' : '1rem'
}));

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // Initialize notification service
  try {
    notificationService.initialize().catch(err => {
      console.error('Error initializing notification service:', err);
    });
    
    // Store current user in window object for access by notification service
    if (authStore.currentUser) {
      window.currentUser = authStore.currentUser;
    }
    
    // Check if we're on the notifications route
    if (route.path === '/user/notifications') {
      toggleNotifications(true);
    }
  } catch (error) {
    console.error('Failed to initialize notification service:', error);
  }
  
  // Check if we should show the notification modal
  const shouldShowModal = localStorage.getItem('showNotificationModal') === 'true';
  if (shouldShowModal) {
    // Small delay to ensure the layout is loaded first
    setTimeout(() => {
      showNotificationModal.value = true;
    }, 1000);
  }
});

// Watch for auth store changes
watch(() => authStore.currentUser, (newUser) => {
  if (newUser) {
    window.currentUser = newUser;
  }
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

/* Custom positioning for the chatbot button */
.chatbot-wrapper {
  position: fixed;
  right: 20px;
  bottom: 100px; /* Higher position from the bottom */
  z-index: 50; /* Make sure it's above other elements */
}

/* Adjust position for mobile devices */
@media (max-width: 767px) {
  .chatbot-wrapper {
    bottom: 300px; /* Much higher on mobile to avoid the bottom navigation */
    right: 16px;
  }
}

/* Additional mobile optimizations */
@media (max-width: 767px) {
  /* Add top margin for mobile view to lower the content */
  main {
    margin-top: 1.5rem !important; /* Add margin to push content down */
    padding-top: 0 !important; /* Override inline style with !important */
  }
  
  /* Adjust router view to have some space at the top */
  main > * {
    margin-top: 1rem;
  }
}
</style>