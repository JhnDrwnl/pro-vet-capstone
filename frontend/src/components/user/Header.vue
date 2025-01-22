<!-- components/user/Header.vue -->
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
                :src="userPhotoURL"
                alt="User avatar"
                class="h-8 w-8 rounded-full object-cover"
              />
              <ChevronDownIcon class="h-3 w-3 absolute bottom-0 right-0 text-gray-600 bg-white rounded-full" />
            </div>
          </button>
          <!-- User dropdown -->
          <div
            v-if="isDropdownOpen || isProfileSelectorOpen"
            class="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
          >
            <div v-if="isDropdownOpen">
              <!-- Select Profile Section -->
              <div class="py-1 border-b border-gray-200">
                
                <!-- Current Profile -->
                <button 
                  @click="openProfileModal"
                  class="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                >
                  <img
                    :src="userPhotoURL"
                    alt="Current profile"
                    class="h-8 w-8 rounded-full"
                  />
                  <div class="flex-1 text-left">
                    <div class="text-sm font-medium text-gray-900">
                      {{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}
                    </div>
                    <div class="text-xs text-gray-500">{{ authStore.currentUser?.email }}</div>
                    <div class="text-xs text-gray-500">{{ authStore.currentUser?.role || 'User' }}</div>
                  </div>
                  <CheckIcon class="h-5 w-5 text-blue-500" />
                </button>

                <!-- Switch Accounts -->
                <button @click="showProfileSelector" class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <UsersIcon class="h-5 w-5 mr-2 text-gray-600" />
                  <span>See all profiles</span>
                </button>
              </div>

              <!-- Main Menu Items -->
              <div class="p-1">
                <router-link
                  to="/user/settings"
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
            </div>

            <!-- Profile Selector Modal -->
            <div v-if="isProfileSelectorOpen">
              <!-- Header -->
              <div class="flex items-center p-4 border-b border-gray-200">
                <button @click="closeProfileSelector" class="text-gray-600 hover:text-gray-900">
                  <ArrowLeftIcon class="h-5 w-5" />
                </button>
                <h2 class="ml-4 text-lg font-semibold text-gray-900">Select profile</h2>
              </div>

              <!-- Profile List -->
              <div class="p-2">
                <!-- Current Profile -->
                <div 
                  class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  @click="selectProfile(authStore.currentUser)"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      :src="userPhotoURL"
                      alt="Profile picture"
                      class="h-10 w-10 rounded-full"
                    />
                    <span class="text-gray-900">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</span>
                  </div>
                  <CheckIcon class="h-5 w-5 text-blue-500" />
                </div>

                <!-- Static Account -->
                <div 
                  class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  @click="selectProfile(staticAccount)"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="Profile picture"
                      class="h-10 w-10 rounded-full"
                    />
                    <span class="text-gray-900">Kalimbeginner</span>
                  </div>
                </div>

                <!-- See all profiles button -->
                <button 
                  class="w-full mt-4 p-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  @click="handleSwitchAccounts"
                >
                  <UsersIcon class="h-5 w-5 mr-2" />
                  <span class="text-gray-900">See all profiles</span>
                </button>
              </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import ProfileModal from '@/components/common/Profile.vue';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  CheckIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
  ArrowLeftIcon,
  BellIcon
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const isDropdownOpen = ref(false);
const isNotificationsOpen = ref(false);
const isProfileModalOpen = ref(false);
const isProfileSelectorOpen = ref(false);

// Static account data
const staticAccount = {
  id: 'static1',
  firstName: 'Kalim',
  lastName: 'beginner',
  photoURL: 'https://via.placeholder.com/40',
  selected: false
};

const userPhotoURL = computed(() => {
  return profileStore.profile?.photoURL || 'https://via.placeholder.com/40';
});

onMounted(async () => {
  console.log('Current user:', authStore.currentUser);
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
    isProfileSelectorOpen.value = false;
  }
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  if (isNotificationsOpen.value) {
    isDropdownOpen.value = false;
    isProfileSelectorOpen.value = false;
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

const showProfileSelector = () => {
  isProfileSelectorOpen.value = true;
  isDropdownOpen.value = false;
};

const closeProfileSelector = () => {
  isProfileSelectorOpen.value = false;
  isDropdownOpen.value = true;
};

const selectProfile = (profile) => {
  // Handle profile selection logic here
  console.log('Selected profile:', profile);
  closeProfileSelector();
};

const handleSwitchAccounts = () => {
  // Handle switch accounts logic here
  console.log('Switch accounts clicked');
  closeProfileSelector();
};
</script>

