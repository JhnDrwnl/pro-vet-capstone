<!-- components/user/Sidebar.vue -->
<template>
  <div class="flex flex-col">
    <!-- Mobile Header -->
    <header v-if="isMobileView" class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center z-40">
      <h1 class="text-lg font-semibold">Provincial Veterinary</h1>
      <div class="flex items-center space-x-2">
        <button @click="toggleNotifications" class="p-2 rounded-full hover:bg-gray-100 relative">
          <BellIcon class="w-6 h-6" />
          <span v-if="unreadNotifications" class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {{ unreadNotifications }}
          </span>
        </button>
        <button @click="toggleChatbot" class="p-2 rounded-full hover:bg-gray-100">
          <MessageCircleIcon class="w-6 h-6" />
        </button>
      </div>
    </header>
    <!-- Sidebar that transforms to mobile navigation on small screens -->
    <nav 
      class="fixed transition-all duration-300 ease-in-out z-40"
      :class="[
        isMobileView 
          ? 'bottom-1 left-0 right-0 mobile-nav'
          : 'left-4 top-4 h-[calc(100vh-2rem)] w-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex-col justify-between',
        { 'md:w-64': !isSearchOpen && !isNotificationsOpen && isOpen && !isMobileView }
      ]"
    >
      <!-- Desktop Navigation -->
      <div v-if="!isMobileView" class="flex flex-col h-full">
        <div class="flex flex-col pt-6 px-2 flex-grow overflow-y-auto">
          <a 
            v-for="item in mainNavItems" 
            :key="item.name"
            @click.prevent="handleNavClick(item)"
            class="flex items-center px-4 py-3 transition-colors relative group cursor-pointer"
            :class="[
              { 'justify-center': !isOpen || isSearchOpen || isNotificationsOpen },
              item.active ? 'text-blue-600 bg-blue-50 rounded-lg' : 'text-gray-600 hover:bg-gray-50 rounded-lg'
            ]"
          >
            <div class="w-6 h-6 flex items-center justify-center">
              <component 
                :is="item.icon" 
                class="w-6 h-6 transition-all duration-300" 
                :class="item.active ? 'text-blue-600' : 'text-gray-700'"
              />
            </div>
            <span 
              v-if="isOpen && !isSearchOpen && !isNotificationsOpen" 
              class="text-sm transition-opacity duration-300 ml-4"
              :class="item.active ? 'text-blue-600' : 'text-gray-700'"
            >
              {{ item.name }}
            </span>
            
            <span 
              v-if="item.badge && item.badge > 0" 
              class="absolute bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300"
              :class="!isOpen || isSearchOpen || isNotificationsOpen ? 'right-1 -top-1' : 'right-4'"
            >
              {{ item.badge }}
            </span>
          </a>
        </div>

        <!-- More Menu at Bottom -->
        <div class="mt-auto mb-6 px-2 relative">
          <button 
            @click="toggleMoreMenu"
            class="w-full flex items-center px-4 py-3 transition-colors"
            :class="[
              { 'justify-center': !isOpen || isSearchOpen || isNotificationsOpen },
              isMoreMenuOpen ? 'text-blue-600 bg-blue-50 rounded-lg' : 'text-gray-600 hover:bg-gray-50 rounded-lg'
            ]"
          >
            <div class="w-6 h-6 flex items-center justify-center">
              <MenuIcon 
                class="w-6 h-6 transition-all duration-300" 
                :class="isMoreMenuOpen ? 'text-blue-600' : 'text-gray-700'"
              />
            </div>
            <span 
              v-if="isOpen && !isSearchOpen && !isNotificationsOpen" 
              class="text-sm transition-opacity duration-300 ml-4"
              :class="isMoreMenuOpen ? 'text-blue-600' : 'text-gray-700'"
            >
              More
            </span>
          </button>

          <!-- More Menu Modal - Increased z-index to 999 to ensure it's always on top -->
          <div 
            v-if="isMoreMenuOpen" 
            class="absolute bottom-full left-0 mb-2 w-[240px] bg-white rounded-xl shadow-xl z-[999]"
          >
            <!-- Main options -->
            <div class="p-1">
              <router-link 
                :to="{ name: 'UserSettings' }"
                class="flex items-center px-4 py-2 text-sm rounded-lg"
                :class="isSettingsActive ? 'text-blue-600 bg-blue-50 rounded-lg' : 'text-gray-600 hover:bg-gray-50 rounded-lg'"
                @click="handleSettingsClick"
              >
                <SettingsIcon class="w-5 h-5 mr-3" />
                Settings
              </router-link>
            </div>
            
            <!-- Divider -->
            <div class="h-[1px] bg-gray-200"></div>
            
            <!-- Account options -->
            <div class="p-1">
              <button 
                @click="handleSwitchAccounts"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <UserPlusIcon class="w-5 h-5 mr-3" />
                Switch accounts
              </button>
              <button 
                @click="handleLogout"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                data-testid="logout-button"
              >
                <LogOutIcon class="w-5 h-5 mr-3" />
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-else class="flex items-center justify-between py-2 relative px-4">
        <template v-for="(item, index) in mobileNavItems" :key="item.name">
          <div 
            v-if="index === 2" 
            class="relative flex flex-col items-center"
          >
            <div class="absolute -top-4 flex items-center justify-center">
              <button
                @click="handleNavClick(item)"
                class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg text-white hover:from-blue-500 hover:to-blue-700 transition-all duration-300 ease-in-out flex items-center justify-center"
              >
                <component :is="item.icon" class="w-7 h-7" />
              </button>
            </div>
            <span class="text-xs mt-10 text-gray-400">{{ item.name }}</span>
          </div>
          <a 
            v-else
            @click.prevent="handleNavClick(item)"
            class="flex flex-col items-center p-2"
            :class="item.active ? 'text-blue-500' : 'text-gray-400'"
          >
            <component :is="item.icon" class="w-6 h-6" />
            <span class="text-xs mt-1">{{ item.name }}</span>
          </a>
        </template>
      </div>
    </nav>
    
    <!-- Search Panel -->
    <SearchPanel 
      :isMobileView="isMobileView"
      :isVisible="isSearchOpen"
      @close="closeSearch"
    />

    <!-- Notification Panel -->
    <NotificationPanel
      :isMobileView="isMobileView"
      :isVisible="isNotificationsOpen"
      @close="closeNotifications"
    />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted, watch, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import { useNotificationsStore } from '@/stores/modules/notifications';
import { 
  HomeIcon,
  SearchIcon,
  Video as VideoCallIcon,
  PlusCircle,
  BellIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  X as XIcon,
  LogOut as LogOutIcon,
  UserPlus as UserPlusIcon,
  MessageCircle as MessageCircleIcon
} from 'lucide-vue-next';
import SearchPanel from '../common/SearchPanel.vue';
import NotificationPanel from '../common/NotificationPanel.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle', 'toggleSearch', 'toggleNotifications']);

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const notificationsStore = useNotificationsStore();

const isMoreMenuOpen = ref(false);
const isSearchOpen = ref(false);
const isNotificationsOpen = ref(false);
const searchQuery = ref('');
const isSettingsActive = ref(false); 
const searchResults = ref([]);
const isSearching = ref(false);
const searchStatus = ref('');
const isMobileView = ref(window.innerWidth < 768);
const unreadNotifications = computed(() => notificationsStore.getUnreadCount || 0);
let searchTimeout = null;
let resizeTimeout = null;

// Update the userPhotoURL computed property to use the provided SVG as fallback
const userPhotoURL = computed(() => {
  return profileStore.profile?.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E';
});

// Add a new function to update active states based on current route
const updateActiveStateFromRoute = () => {
  const currentPath = router.currentRoute.value.path;
  
  // Reset all active states first
  resetActiveStates();
  
  // Find and activate the matching nav item
  const matchingItem = mainNavItems.value.find(item => 
    currentPath === item.path || currentPath.startsWith(item.path + '/')
  );
  
  if (matchingItem) {
    matchingItem.active = true;
  }
  
  // Special case for settings
  if (currentPath.includes('/settings')) {
    isSettingsActive.value = true;
  }
  
  // Handle panels based on route
  if (currentPath === '/user/notifications') {
    if (!isMobileView.value) {
      isNotificationsOpen.value = true;
      emit('toggleNotifications', true);
    }
  }
};

onMounted(async () => {
  console.log('Sidebar mounted, authStore:', authStore);
  if (authStore.user?.userId) {
    console.log('Fetching user profile for userId:', authStore.user.userId);
    await profileStore.fetchUserProfile(authStore.user.userId);
    
    // Initialize notifications
    await notificationsStore.fetchNotifications(authStore.user.userId);
  }
  
  // Set up resize listener with debounce
  window.addEventListener('resize', debouncedResize);
  
  // Initialize active states based on current route
  updateActiveStateFromRoute();
});

onUnmounted(() => {
  // Clean up resize listener
  window.removeEventListener('resize', debouncedResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
});

// Debounced resize handler to prevent too many updates
const debouncedResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(handleResize, 100);
};

// Update the handleResize function to properly handle transitions between mobile and desktop views
const handleResize = () => {
  const wasMobile = isMobileView.value;
  isMobileView.value = window.innerWidth < 768;
  
  // If transitioning from mobile to desktop
  if (wasMobile && !isMobileView.value) {
    console.log('Transitioning from mobile to desktop view');
    // Restore sidebar state for desktop view
    emit('toggle', true); // Ensure sidebar is open in desktop view
    
    // Update active states based on current route
    updateActiveStateFromRoute();
  } 
  // If transitioning from desktop to mobile
  else if (!wasMobile && isMobileView.value) {
    console.log('Transitioning from desktop to mobile view');
    // Close panels in mobile view
    isSearchOpen.value = false;
    isNotificationsOpen.value = false;
    emit('toggleSearch', false);
    emit('toggleNotifications', false);
  }
};

watch(() => authStore.user, async (newUser) => {
  console.log('AuthStore user changed:', newUser);
  if (newUser?.userId) {
    console.log('Fetching user profile for new userId:', newUser.userId);
    await profileStore.fetchUserProfile(newUser.userId);
    
    // Initialize notifications for new user
    await notificationsStore.fetchNotifications(newUser.userId);
  }
}, { immediate: true });

watch(() => props.isOpen, (newIsOpen) => {
  if (!newIsOpen) {
    isSearchOpen.value = false;
    isNotificationsOpen.value = false;
    emit('toggleSearch', false);
    emit('toggleNotifications', false);
  }
});

// Watch for route changes to update notification panel state
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/user/notifications') {
    isNotificationsOpen.value = true;
    emit('toggleNotifications', true);
    isSearchOpen.value = false;
    emit('toggleSearch', false);
  } else if (isNotificationsOpen.value && !newPath.includes('/user/notifications')) {
    isNotificationsOpen.value = false;
    emit('toggleNotifications', false);
  }
  
  // Update active states when route changes
  updateActiveStateFromRoute();
});

const resetActiveStates = () => {
  mainNavItems.value.forEach(item => item.active = false);
  isMoreMenuOpen.value = false;
  isSettingsActive.value = false; 
};

// Update the toggleNotifications method to ensure smooth transitions
const toggleNotifications = () => {
  console.log('Toggling notifications');
  
  // If opening notifications, close search first
  if (!isNotificationsOpen.value && isSearchOpen.value) {
    isSearchOpen.value = false;
    emit('toggleSearch', false);
    
    // Small delay before opening notifications to allow search to close
    setTimeout(() => {
      isNotificationsOpen.value = true;
      emit('toggleNotifications', true);
    }, 50);
  } else {
    isNotificationsOpen.value = !isNotificationsOpen.value;
    emit('toggleNotifications', isNotificationsOpen.value);
    
    if (isNotificationsOpen.value) {
      isSearchOpen.value = false;
      emit('toggleSearch', false);
    }
  }
};

// Similarly update the handleNavClick method for consistent behavior
const handleNavClick = (item) => {
  console.log('Nav item clicked:', item.name);
  resetActiveStates();
  
  if (item.name === 'Search') {
    // If opening search, close notifications first
    if (!isSearchOpen.value && isNotificationsOpen.value) {
      isNotificationsOpen.value = false;
      emit('toggleNotifications', false);
      
      // Small delay before opening search to allow notifications to close
      setTimeout(() => {
        isSearchOpen.value = true;
        emit('toggleSearch', true);
      }, 50);
    } else {
      isSearchOpen.value = !isSearchOpen.value;
      emit('toggleSearch', isSearchOpen.value);
      
      if (isSearchOpen.value) {
        isNotificationsOpen.value = false;
        emit('toggleNotifications', false);
      }
    }
  } else if (item.name === 'Notifications') {
    // If opening notifications, close search first
    if (!isNotificationsOpen.value && isSearchOpen.value) {
      isSearchOpen.value = false;
      emit('toggleSearch', false);
      
      // Small delay before opening notifications to allow search to close
      setTimeout(() => {
        isNotificationsOpen.value = true;
        emit('toggleNotifications', true);
      }, 50);
    } else {
      isNotificationsOpen.value = !isNotificationsOpen.value;
      emit('toggleNotifications', isNotificationsOpen.value);
      
      if (isNotificationsOpen.value) {
        isSearchOpen.value = false;
        emit('toggleSearch', false);
      }
    }
  } else {
    const navItem = mainNavItems.value.find(navItem => navItem.name === item.name);
    if (navItem) {
      navItem.active = true;
    }
    router.push(item.path);
    if (!isMobileView.value) {
      isSearchOpen.value = false;
      emit('toggleSearch', false);
      isNotificationsOpen.value = false;
      emit('toggleNotifications', false);
    }
  }
  
  if (isMobileView.value && isOpen.value) {
    emit('toggle');
  }
};

const toggleMoreMenu = () => {
  console.log('Toggling more menu');
  isMoreMenuOpen.value = !isMoreMenuOpen.value;
};

const closeMoreMenu = () => {
  console.log('Closing more menu');
  resetActiveStates();
};

const closeSearch = () => {
  isSearchOpen.value = false;
  emit('toggleSearch', false);
};

const closeNotifications = () => {
  isNotificationsOpen.value = false;
  emit('toggleNotifications', false);
};

const handleLogout = async () => {
  console.log('Logout button clicked');
  try {
    console.log('Calling authStore.logoutUser()');
    await authStore.logoutUser();
    console.log('Logout successful');
    resetActiveStates();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please try again.');
  }
};

const handleSwitchAccounts = () => {
  console.log('Switch accounts clicked');
  resetActiveStates();
  // Implement account switching logic here
};

const handleSettingsClick = () => { 
  resetActiveStates();
  isSettingsActive.value = true;
  closeMoreMenu();
};

const toggleChatbot = () => {
  // Implement chatbot toggle logic here
  console.log('Toggling chatbot');
};

// Use markRaw to prevent Vue from making components reactive
const createNavItems = () => [
  { name: 'Home', icon: markRaw(HomeIcon), path: '/user/dashboard', active: false },
  { name: 'Search', icon: markRaw(SearchIcon), path: '/user/search', active: false },
  { name: 'Telehealth', icon: markRaw(VideoCallIcon), path: '/user/usertelehealth', active: false }, 
  { name: 'Create', icon: markRaw(PlusCircle), path: '/user/userappointments', active: false },
  { name: 'Notifications', icon: markRaw(BellIcon), path: '/user/notifications', badge: 0, active: false },
  {
    name: 'Profile',
    icon: markRaw({
      render: () => h('div', { class: 'w-6 h-6 flex items-center justify-center' }, [
        h('img', {
          src: userPhotoURL.value,
          alt: 'User profile',
          class: 'w-6 h-6 rounded-full object-cover'
        })
      ])
    }),
    path: '/user/profile',
    active: false
  },
];

const mainNavItems = ref(createNavItems());

const mobileNavItems = computed(() => [
  mainNavItems.value[0], // Home
  mainNavItems.value[1], // Search
  mainNavItems.value[3], // Create (center button)
  mainNavItems.value[2], // Telehealth
  mainNavItems.value[5], // Profile
]);

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  console.log('Authentication state changed:', isAuthenticated);
  if (!isAuthenticated) {
    console.log('User is no longer authenticated, redirecting to login page');
    router.push('/auth/login');
  }
});

watch(() => router.currentRoute.value.name, (newRouteName) => { 
  if (newRouteName !== 'UserSettings') {
    isSettingsActive.value = false;
  }
});

// Add this computed property to directly access the unread count
const unreadCount = computed(() => notificationsStore.getUnreadCount);

// Update badge count when unread notifications change
watch(unreadCount, (newCount) => {
  console.log('Unread notifications count changed:', newCount);
  const notificationItem = mainNavItems.value.find(item => item.name === 'Notifications');
  if (notificationItem) {
    notificationItem.badge = newCount || 0;
  }
});
</script>

<style scoped>
.mobile-nav {
  background-color: white;
  border-radius: 20px;
  margin: 0 0.75rem 0.5rem 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 767px) {
  .mobile-nav {
    border-top: none;
  }
}

@keyframes subtle-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.mobile-nav button {
  animation: subtle-pulse 2s infinite;
}
</style>

