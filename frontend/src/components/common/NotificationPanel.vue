<!-- components/common/NotificationPanel.vue -->
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
      <!-- Notification Detail View -->
      <div v-if="selectedNotification" class="flex flex-col h-full">
        <div class="p-6 flex justify-between items-center border-b">
          <button 
            @click="closeNotificationDetail"
            class="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            <span>Back to notifications</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-grow">
          <div class="mb-6">
            <div 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center mb-4',
                getNotificationColor(selectedNotification.type)
              ]"
            >
              <component :is="getNotificationIcon(selectedNotification.type)" class="w-6 h-6" />
            </div>
            
            <h2 class="text-xl font-semibold mb-2">{{ selectedNotification.title }}</h2>
            <p class="text-sm text-gray-500 mb-4">{{ formatDate(selectedNotification.date) }}</p>
            
            <div class="prose max-w-none">
              <p>{{ selectedNotification.description }}</p>
              
              <!-- Additional content if available -->
              <div v-if="selectedNotification.content" class="mt-4">
                <p>{{ selectedNotification.content }}</p>
              </div>
              
              <!-- Action buttons if needed -->
              <div v-if="selectedNotification.actionUrl" class="mt-6">
                <button 
                  @click="handleActionClick(selectedNotification)"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Notification List View -->
      <div v-else class="flex flex-col h-full">
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
          <button 
            @click="refreshNotifications"
            class="px-3 py-1 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100"
            :disabled="isRefreshing"
          >
            <RefreshCwIcon v-if="!isRefreshing" class="w-4 h-4" />
            <LoaderIcon v-else class="w-4 h-4 animate-spin" />
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
            :disabled="loading || !hasUnreadNotifications"
          >
            <Icon icon="mdi:bell-check-outline" width="24" height="24" :style="{ color: hasUnreadNotifications ? '#3b82f6' : '#94a3b8' }" />
          </button>
        </div>

        <!-- Notification List -->
        <div class="px-6 overflow-y-auto flex-grow">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-semibold">Recent Notifications</h3>
            <span v-if="loading || isRefreshing" class="text-xs text-gray-500">
              {{ isRefreshing ? 'Refreshing...' : 'Loading...' }}
            </span>
          </div>
          
          <div v-if="filteredNotifications.length > 0">
            <div 
              v-for="notification in filteredNotifications" 
              :key="notification.id"
              :class="[
                'mb-3 p-3 rounded-lg hover:bg-gray-50 flex items-start cursor-pointer',
                { 'bg-blue-50': !notification.read }
              ]"
              @click="handleNotificationClick(notification)"
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
              <button 
                @click.stop="deleteNotification(notification.id)"
                class="text-gray-400 hover:text-red-500 p-1"
                title="Delete notification"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-else-if="loading" class="py-10 text-center">
            <div class="animate-pulse flex flex-col items-center">
              <div class="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div v-else class="py-10 text-center text-gray-500 text-sm">
            <Icon icon="mdi:bell-off-outline" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
            {{ filterQuery ? 'No notifications found.' : 'No recent notifications.' }}
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { 
  XIcon, 
  CalendarIcon, 
  BellIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  ArrowLeftIcon,
  RefreshCwIcon,
  LoaderIcon,
  Trash as TrashIcon
} from 'lucide-vue-next';
import { useNotificationsStore } from '../../stores/modules/notifications';
import { useRouter } from 'vue-router';

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

const router = useRouter();
const notificationsStore = useNotificationsStore();
const filterQuery = ref('');
const isFiltering = ref(false);
const filterStatus = ref('');
const filterType = ref('all');
const unsubscribe = ref(null);
const selectedNotification = ref(null);
const isRefreshing = ref(false);

// Computed properties
const loading = computed(() => notificationsStore.loading);
const filteredNotifications = computed(() => {
  return notificationsStore.getFilteredNotifications(filterType.value, filterQuery.value);
});

// Add this computed property to watch for changes in the notifications array
const notificationsCount = computed(() => notificationsStore.notifications.length);
const unreadCount = computed(() => notificationsStore.getUnreadCount);
const hasUnreadNotifications = computed(() => unreadCount.value > 0);

// Methods
const closeNotifications = () => {
  selectedNotification.value = null;
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

const formatDate = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const notificationDate = new Date(date);
  
  // If it's today, show time only
  if (notificationDate.toDateString() === now.toDateString()) {
    return `Today at ${notificationDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
  }
  
  // If it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (notificationDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${notificationDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
  }
  
  // Otherwise show date and time
  return notificationDate.toLocaleString('en-US', { 
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
    case 'test':
      return 'bg-purple-100 text-purple-500';
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

const handleNotificationClick = async (notification) => {
  // Mark as read in Firestore
  if (!notification.read) {
    await notificationsStore.markAsRead(notification.id);
  }
  
  // Show notification detail
  selectedNotification.value = notification;
};

const closeNotificationDetail = () => {
  selectedNotification.value = null;
};

const handleActionClick = (notification) => {
  if (notification.url) {
    closeNotifications();
    router.push(notification.url);
  }
};

const markAllAsRead = async () => {
  if (!hasUnreadNotifications.value) return;
  
  const user = window.currentUser || null;
  if (user && user.userId) {
    await notificationsStore.markAllAsRead(user.userId);
  }
};

const refreshNotifications = async () => {
  if (isRefreshing.value) return;
  
  isRefreshing.value = true;
  const user = window.currentUser || null;
  
  if (user && user.userId) {
    try {
      // Clear existing notifications first
      notificationsStore.clearNotifications();
      
      // Then fetch fresh notifications
      await notificationsStore.fetchNotifications(user.userId);
      
      // Re-subscribe to real-time updates
      if (unsubscribe.value) {
        unsubscribe.value();
      }
      unsubscribe.value = notificationsStore.subscribeToNotifications(user.userId);
      
      console.log('Notifications refreshed successfully');
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      isRefreshing.value = false;
    }
  } else {
    console.warn('No user found or user ID missing. Cannot refresh notifications.');
    isRefreshing.value = false;
  }
};

const deleteNotification = async (notificationId) => {
  try {
    await notificationsStore.deleteNotification(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  const user = window.currentUser || null;
  
  if (user && user.userId) {
    // Set up a small delay to let the animation complete first
    setTimeout(async () => {
      console.log('Attempting to fetch notifications for user:', user.userId);
      
      try {
        await notificationsStore.fetchNotifications(user.userId);
        console.log('Notifications fetched successfully');
      } catch (error) {
        console.error('Error fetching notifications:', error);
        
        if (error.message && error.message.includes('requires an index')) {
          console.warn('Firestore index required. Please create the index using the link in the error message above.');
        }
      }
      
      // Set up real-time listener
      try {
        unsubscribe.value = notificationsStore.subscribeToNotifications(user.userId);
      } catch (error) {
        console.error('Error setting up notifications subscription:', error);
      }
    }, 300); // 300ms matches the transition duration
  } else {
    console.warn('No user found or user ID missing. Cannot fetch notifications.');
  }
});

onUnmounted(() => {
  // Clean up subscription when component is unmounted
  if (unsubscribe.value) {
    unsubscribe.value();
    unsubscribe.value = null;
  }
});

// Watch for visibility changes to refresh notifications
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    // Reset selected notification when panel is opened
    selectedNotification.value = null;
    
    // Fetch notifications immediately when panel becomes visible
    const user = window.currentUser || null;
    if (user && user.userId) {
      // Don't clear notifications here, just fetch new ones
      notificationsStore.fetchNotifications(user.userId);
      
      // Ensure we have an active subscription
      if (!unsubscribe.value) {
        unsubscribe.value = notificationsStore.subscribeToNotifications(user.userId);
      }
    }
  } else {
    selectedNotification.value = null;
  }
});

// Add this watch to refresh the UI when notifications change
watch(notificationsCount, (newCount, oldCount) => {
  console.log(`Notifications count changed from ${oldCount} to ${newCount}`);
  // Force a UI update
  nextTick(() => {
    // This ensures the UI is updated after the reactive state changes
  });
});

// Add this watch to refresh the UI when unread count changes
watch(unreadCount, (newCount, oldCount) => {
  console.log(`Unread count changed from ${oldCount} to ${newCount}`);
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