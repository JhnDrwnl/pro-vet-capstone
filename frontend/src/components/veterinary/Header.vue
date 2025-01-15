<!-- components/veterinary/Header.vue -->
<template>
  <header class="bg-white shadow z-20 relative">
    <div class="px-4 sm:px-6 lg:px-8 py-4 flex justify-end items-center">
      <div class="flex items-center space-x-4" v-if="authStore.isAuthenticated">
        <!-- Notifications -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BellIcon class="h-6 w-6" />
          </button>
          <!-- Notifications dropdown -->
          <div
            v-if="isNotificationsOpen"
            class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
          >
            <div class="px-4 py-2 text-sm text-gray-700">No new notifications</div>
          </div>
        </div>
        
        <!-- User profile -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="relative flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <div class="relative">
              <img
                :src="authStore.currentUser?.photoURL || 'https://via.placeholder.com/40'"
                alt="User avatar"
                class="h-8 w-8 rounded-full object-cover"
              />
              <ChevronDownIcon class="h-3 w-3 absolute bottom-0 right-0 text-gray-600 bg-white rounded-full" />
            </div>
          </button>
          <!-- User dropdown -->
          <div
            v-if="isDropdownOpen"
            class="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
          >
            <div class="py-1 border-b border-gray-200">
              <!-- Current Profile -->
              <button 
                @click="openProfileModal"
                class="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 transition-colors"
              >
                <img
                  :src="authStore.currentUser?.photoURL || 'https://via.placeholder.com/40'"
                  alt="Current profile"
                  class="h-8 w-8 rounded-full"
                />
                <div class="flex-1 text-left">
                  <div class="text-sm font-medium text-gray-900">
                    {{ authStore.currentUser?.role || 'Veterinary' }}
                  </div>
                  <div class="text-xs text-gray-500">{{ authStore.currentUser?.email }}</div>
                </div>
              </button>
            </div>

            <!-- Main Menu Items -->
            <div class="p-1">
              <router-link
                to="/vet/settings"
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

    <!-- Profile Modal -->
    <ProfileModal
      :is-open="isProfileModalOpen"
      :user="authStore.currentUser"
      @close="closeProfileModal"
      @save="handleProfileUpdate"
    />
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import ProfileModal from '@/components/common/ProfileModal.vue';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  SettingsIcon,
  LogOutIcon,
  BellIcon
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const isDropdownOpen = ref(false);
const isNotificationsOpen = ref(false);
const isProfileModalOpen = ref(false);

onMounted(() => {
  console.log('Current user:', authStore.currentUser);
});

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

const openProfileModal = () => {
  isProfileModalOpen.value = true;
  closeDropdown();
};

const closeProfileModal = () => {
  isProfileModalOpen.value = false;
};

const handleProfileUpdate = async (updatedProfile) => {
  try {
    await authStore.updateProfile(updatedProfile);
    closeProfileModal();
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
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
</script>

