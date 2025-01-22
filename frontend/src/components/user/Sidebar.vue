<!-- components/user/Sidebar.vue -->
<template>
  <div class="flex flex-col">
    <!-- Mobile Header -->
    <header v-if="isMobileView" class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center z-30">
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
      class="fixed transition-all duration-300 ease-in-out z-20"
      :class="[
        isMobileView 
          ? 'bottom-1 left-0 right-0 mobile-nav'
          : 'left-4 top-4 h-[calc(100vh-2rem)] w-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex-col justify-between',
        { 'md:w-64': !isSearchOpen && isOpen && !isMobileView }
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
              { 'justify-center': !isOpen || isSearchOpen },
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
              v-if="isOpen && !isSearchOpen" 
              class="text-sm transition-opacity duration-300 ml-4"
              :class="item.active ? 'text-blue-600' : 'text-gray-700'"
            >
              {{ item.name }}
            </span>
            
            <span 
              v-if="item.badge" 
              class="absolute bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300"
              :class="!isOpen || isSearchOpen ? 'right-1 -top-1' : 'right-4'"
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
              { 'justify-center': !isOpen || isSearchOpen },
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
              v-if="isOpen && !isSearchOpen" 
              class="text-sm transition-opacity duration-300 ml-4"
              :class="isMoreMenuOpen ? 'text-blue-600' : 'text-gray-700'"
            >
              More
            </span>
          </button>

          <!-- More Menu Modal -->
          <div 
            v-if="isMoreMenuOpen" 
            class="absolute bottom-full left-0 mb-2 w-[240px] bg-white rounded-xl shadow-xl z-50"
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
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
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

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle', 'toggleSearch']);

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const isMoreMenuOpen = ref(false);
const isSearchOpen = ref(false);
const searchQuery = ref('');
const isSettingsActive = ref(false); 
const searchResults = ref([]);
const isSearching = ref(false);
const searchStatus = ref('');
const isMobileView = ref(window.innerWidth < 768);
const unreadNotifications = ref(2); // You can update this dynamically
let searchTimeout = null;

const userPhotoURL = computed(() => {
  return profileStore.profile?.photoURL || 'https://via.placeholder.com/40';
});

onMounted(async () => {
  console.log('Sidebar mounted, authStore:', authStore);
  if (authStore.user?.userId) {
    console.log('Fetching user profile for userId:', authStore.user.userId);
    await profileStore.fetchUserProfile(authStore.user.userId);
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => authStore.user, async (newUser) => {
  console.log('AuthStore user changed:', newUser);
  if (newUser?.userId) {
    console.log('Fetching user profile for new userId:', newUser.userId);
    await profileStore.fetchUserProfile(newUser.userId);
  }
}, { immediate: true });

watch(() => props.isOpen, (newIsOpen) => {
  if (!newIsOpen) {
    isSearchOpen.value = false;
  }
});

const resetActiveStates = () => {
  mainNavItems.value.forEach(item => item.active = false);
  isMoreMenuOpen.value = false;
  isSettingsActive.value = false; 
};

const handleNavClick = (item) => {
  console.log('Nav item clicked:', item.name);
  resetActiveStates();
  if (item.name === 'Search') {
    isSearchOpen.value = !isSearchOpen.value;
    emit('toggleSearch', isSearchOpen.value);
  } else {
    mainNavItems.value.find(navItem => navItem.name === item.name).active = true;
    router.push(item.path);
    if (!isMobileView.value) {
      isSearchOpen.value = false;
      emit('toggleSearch', false);
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

const handleResize = () => {
  isMobileView.value = window.innerWidth < 768;
  if (isMobileView.value) {
    isSearchOpen.value = false;
    emit('toggle', false);
  }
};

const toggleNotifications = () => {
  console.log('Toggling notifications');
  handleNavClick(mainNavItems.value.find(item => item.name === 'Notifications'));
};

const toggleChatbot = () => {
  // Implement chatbot toggle logic here
  console.log('Toggling chatbot');
};

const mainNavItems = ref([
  { name: 'Home', icon: HomeIcon, path: '/user/dashboard', active: false },
  { name: 'Search', icon: SearchIcon, path: '/user/search', active: false },
  { name: 'Telehealth', icon: VideoCallIcon, path: '/user/usertelehealth', active: false }, 
  { name: 'Create', icon: PlusCircle, path: '/user/userappointments', active: false },
  { name: 'Notifications', icon: BellIcon, path: '/user/notifications', badge: '2', active: false },
  {
    name: 'Profile',
    icon: {
      render: () => h('div', { class: 'w-6 h-6 flex items-center justify-center' }, [
        h('img', {
          src: userPhotoURL.value,
          alt: 'User profile',
          class: 'w-6 h-6 rounded-full object-cover'
        })
      ])
    },
    path: '/user/profile',
    active: false
  },
]);

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


