<template>
  <Transition name="slide-fade">
    <div 
      v-if="isVisible"
      class="bg-white overflow-hidden z-30 transition-all duration-300 ease-in-out flex flex-col fixed"
      :class="[
        isMobileView 
          ? 'inset-0 pt-14 pb-20' 
          : 'left-20 top-4 h-[calc(100vh-2rem)] w-[400px] border border-gray-100 rounded-2xl shadow-sm'
      ]"
    >
      <!-- Notification Header -->
      <div class="p-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Notifications</h2>
        <button 
          v-if="isMobileView"
          @click="closeNotifications"
          class="text-gray-400 hover:text-gray-600"
        >
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Notification Filters -->
      <div class="px-6 flex space-x-4 mb-2">
        <button 
          @click="setFilter('all')"
          :class="['px-3 py-1 rounded-full text-sm font-medium', filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500']"
        >
          All
        </button>
        <button 
          @click="setFilter('unread')"
          :class="['px-3 py-1 rounded-full text-sm font-medium', filterType === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-500']"
        >
          Unread
        </button>
      </div>

      <!-- Notification Filter & Mark All as Read Button -->
      <div class="p-6 relative flex items-center space-x-2">
        <div class="relative w-full">
          <input 
            type="text"
            placeholder="Search notifications"
            v-model="filterQuery"
            class="w-full bg-gray-100 rounded-lg py-2 px-4 pr-10 focus:outline-none"
            @input="handleFilterInput"
          />
          <button 
            v-if="filterQuery"
            @click="clearFilter"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        <button 
          @click="markAllAsRead"
          class="text-blue-500 hover:underline"
        >
        <Icon icon="mdi:bell-check-outline" width="24" height="24" style="color: #3b82f6" />

        </button>
      </div>

      <!-- Notification List -->
      <div class="px-6 overflow-y-auto flex-grow">
        <h3 class="text-sm font-semibold mb-3">Recent Notifications</h3>
        <div v-if="filteredNotifications.length > 0">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            :class="[
              'mb-3 p-3 rounded-lg hover:bg-gray-50 flex items-start cursor-pointer',
              { 'bg-blue-50': !notification.read }
            ]"
            @click="markAsRead(notification)"
          >
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                'aspect-square',
                getNotificationColor(notification.type)
              ]"
              class="mr-5" 
            >
              <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
            </div>
            <div class="flex-grow">
              <div class="font-medium">{{ notification.title }}</div>
              <div class="text-sm text-gray-500">{{ notification.description }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(notification.date) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 text-sm">
          {{ filterQuery ? 'No notifications found.' : 'No recent notifications.' }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';

import { XIcon, CalendarIcon, BellIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-vue-next';

const props = defineProps({
  isMobileView: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const notifications = ref([]);
const filterQuery = ref('');
const isFiltering = ref(false);
const filterStatus = ref('');
const filterType = ref('all');
const closeNotifications = () => {
  emit('close');
};

const clearFilter = () => {
  filterQuery.value = '';
  filterStatus.value = '';
  isFiltering.value = false;
};

const handleFilterInput = () => {
  if (filterQuery.value) {
    isFiltering.value = true;
    filterStatus.value = 'Filtering notifications...';
    setTimeout(() => {
      isFiltering.value = false;
      filterStatus.value = '';
    }, 300);
  } else {
    clearFilter();
  }
};

const setFilter = (type) => {
  filterType.value = type;
};


const filteredNotifications = computed(() => {
  let result = notifications.value;
  if (filterType.value === 'unread') {
    result = result.filter(notification => !notification.read);
  }
  if (filterQuery.value) {
    const lowercaseQuery = filterQuery.value.toLowerCase();
    result = result.filter(notification => 
      notification.title.toLowerCase().includes(lowercaseQuery) ||
      notification.description.toLowerCase().includes(lowercaseQuery)
    );
  }
  return result;
});
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric' 
  });
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'appointment':
      return 'bg-blue-100 text-blue-500';
    case 'telehealth':
      return 'bg-green-100 text-green-500';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-500';
    case 'alert':
      return 'bg-red-100 text-red-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'appointment':
      return CalendarIcon;
    case 'telehealth':
      return CheckCircleIcon;
    case 'reminder':
      return BellIcon;
    case 'alert':
      return AlertCircleIcon;
    default:
      return BellIcon;
  }
};

const markAsRead = (notification) => {
  notification.read = true;
};

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};

onMounted(() => {
  notifications.value = [
    {
      id: 1,
      type: 'appointment',
      title: 'Upcoming Walk-in Appointment',
      description: 'Rex has a check-up scheduled for tomorrow at 2:00 PM.',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'telehealth',
      title: 'Telehealth Consultation Reminder',
      description: "Your telehealth appointment for Fluffy is in 30 minutes.",
      date: new Date(Date.now() + 30 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Vaccination Due',
      description: "Buddy's annual vaccinations are due next week.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: 4,
      type: 'alert',
      title: 'Medication Refill',
      description: "Max's heartworm medication needs to be refilled.",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Walk-in Slots Available',
      description: "We have open walk-in slots this afternoon from 3 PM to 5 PM.",
      date: new Date(),
      read: true
    }
  ];
});
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Add slide-out animation */
.v-leave-active {
  transition: all 0.3s ease-in-out;
}

.v-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Add slide-in animation */
.v-enter-active {
  transition: all 0.3s ease-in-out;
}

.v-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
</style>