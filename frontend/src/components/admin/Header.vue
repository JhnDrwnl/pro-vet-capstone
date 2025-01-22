<!-- components/admin/Header.vue -->
<template>
  <header data-header class="w-full bg-white rounded-2xl shadow-sm border border-gray-200">
    <div class="flex items-center justify-between h-16 px-6">
      <!-- Sidebar toggle button for small screens -->
      <button
        v-if="isSmallScreen"
        @click="$emit('toggle-sidebar')"
        class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Spacer for larger screens -->
      <div v-else class="w-6"></div>

      <div class="flex items-center gap-4 md:gap-6">
        <!-- Notifications Dropdown -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative"
          >
            <BellIcon class="h-5 w-5" />
            <span v-if="totalNotificationsCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {{ totalNotificationsCount }}
            </span>
          </button>

          <div
            v-if="isNotificationsOpen"
            class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
          >
            <div v-if="totalNotificationsCount === 0" class="px-4 py-2 text-sm text-gray-700">No new notifications</div>
            <div v-else>
              <!-- Notification content -->
            </div>
          </div>
        </div>

        <!-- Calendar button -->
        <button
          @click="openCalendarSchedules"
          class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative"
        >
          <CalendarIcon class="h-5 w-5" />
        </button>

        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="focus:outline-none focus:ring-2 focus:ring-[#FF9934]/10 rounded-xl transition-all duration-200"
            aria-haspopup="true"
            :aria-expanded="isDropdownOpen"
          >
            <div class="relative">
              <img
                :src="userPhotoURL"
                :alt="profileStore.profile?.role || 'Admin'"
                class="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-100"
              />
              <ChevronDownIcon class="h-3 w-3 absolute bottom-0 right-0 text-gray-600 bg-white rounded-full" />
            </div>
          </button>

          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
            style="right: -24px;"
          >
            <div class="py-1 border-b border-gray-200">
              <!-- Current Profile -->
              <router-link 
                to="/admin/adminprofile"
                class="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                @click="closeDropdown"
              >
                <img
                  :src="userPhotoURL"
                  alt="Current profile"
                  class="h-8 w-8 rounded-full"
                />
                <div class="flex-1 text-left">
                  <div class="text-sm font-medium text-gray-900">
                    {{ profileStore.profile?.role || 'Admin' }}
                  </div>
                  <div class="text-xs text-gray-500">{{ profileStore.profile?.email }}</div>
                </div>
              </router-link>
            </div>

            <!-- Main Menu Items -->
            <div class="p-1">
              <router-link
                to="/admin/adminsettings/adminaccount"
                class="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                @click="closeDropdown"
              >
                <div class="flex items-center">
                  <SettingsIcon class="h-5 w-5 mr-2 text-gray-600" />
                  <span>Settings</span>
                </div>
                <ChevronRightIcon class="h-5 w-5 text-gray-600" />
              </router-link>

              <button
                @click="handleLogout"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOutIcon class="h-5 w-5 mr-2 text-gray-600" />
                <span>Log Out</span>
              </button>
            </div>

            <!-- Footer Links -->
            <div class="px-4 py-2 border-t border-gray-200 text-xs text-gray-500 space-x-2">
              <a href="#" class="hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" class="hover:underline">Terms</a>
              <span>·</span>
              <a href="#" class="hover:underline">Cookies</a>
              <span>·</span>
              <a href="#" class="hover:underline">More</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';

import { 
  ChevronDownIcon,
  ChevronRightIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon,
  CalendarIcon,
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    required: true
  },
  isSmallScreen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['toggle-sidebar']);

const isDropdownOpen = ref(false);
const isNotificationsOpen = ref(false);

const userPhotoURL = computed(() => {
  return profileStore.profile?.photoURL || 'https://via.placeholder.com/40';
});

const totalNotificationsCount = ref(0);

onMounted(async () => {
  if (authStore.user?.userId) {
    await profileStore.fetchUserProfile(authStore.user.userId);
  }
});

watch(() => authStore.user, async (newUser) => {
  if (newUser?.userId) {
    await profileStore.fetchUserProfile(newUser.userId);
  }
}, { immediate: true });

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    isNotificationsOpen.value = false;
  }
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  if (isNotificationsOpen.value) {
    isDropdownOpen.value = false;
  }
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logoutUser();
    closeDropdown();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

const openCalendarSchedules = () => {
  router.push('/admin/admincalendar');
};
</script>



