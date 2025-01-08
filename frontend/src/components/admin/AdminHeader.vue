<!-- components/common/Header.vue -->
<template>
  <header class="bg-white shadow">
    <div class="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Provincial Veterinary</h1>
      <div class="flex items-center space-x-4" v-if="authStore.isAuthenticated">
        <!-- Notifications -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <!-- Notifications dropdown -->
          <div
            v-if="isNotificationsOpen"
            class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <!-- Add notifications here -->
            <div class="px-4 py-2 text-sm text-gray-700">No new notifications</div>
          </div>
        </div>
        
        <!-- User profile -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <img
              :src="authStore.currentUser?.photoURL || 'https://via.placeholder.com/40'"
              alt="User avatar"
              class="h-8 w-8 rounded-full object-cover"
            />
          </button>
          <!-- User dropdown -->
          <div
            v-if="isDropdownOpen"
            class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="px-4 py-2 text-sm text-gray-700">
              <div class="font-medium">{{ authStore.currentUser?.role || 'User' }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ authStore.currentUser?.email || 'No email' }}</div>
            </div>
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="closeDropdown"
            >
              Profile
            </router-link>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="closeDropdown"
            >
              Settings
            </router-link>
            <button
              @click="handleLogout"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';

const router = useRouter();
const authStore = useAuthStore();

const isDropdownOpen = ref(false);
const isNotificationsOpen = ref(false);

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

