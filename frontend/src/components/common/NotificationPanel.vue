<!-- components/common/NotificationPanel.vue -->
<template>
  <Transition :name="isRightPanel ? 'slide-right' : 'slide-left'">
    <div 
      v-if="isVisible"
      class="bg-white overflow-hidden z-30 transition-all duration-300 ease-in-out flex flex-col fixed"
      :class="[
        isMobileView 
          ? 'inset-0 pt-14 pb-20' 
          : desktopPositionClass
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
              
              <!-- Action button (vet side only) -->
              <div v-if="showActionButton" class="mt-6">
                <button 
                  @click="handleActionClick(selectedNotification)"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  View Details
                </button>
              </div>

              <!-- Feedback and Follow-up options for completed appointments (user side only) -->
              <div v-if="showFeedbackOptions" class="mt-6 space-y-3">
                <h4 class="text-sm font-medium text-gray-700">What would you like to do next?</h4>
                
                <!-- Feedback button -->
                <button 
                  @click="openFeedback(selectedNotification)"
                  class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <MessageCircleIcon class="w-4 h-4 mr-2" />
                  Leave Feedback
                </button>
                
                <!-- Follow-up button -->
                <button 
                  @click="scheduleFollowUp(selectedNotification)"
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <CalendarIcon class="w-4 h-4 mr-2" />
                  Schedule Follow-up
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
          <div class="flex items-center gap-2">
            <button 
              @click="markAllAsRead"
              :disabled="loading || !hasUnreadNotifications"
              class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mark all as read"
            >
              <CheckCircleIcon class="w-4 h-4 text-blue-600" />
              <span class="hidden sm:inline">Mark all as read</span>
            </button>
            <button 
              v-if="isMobileView"
              @click="closeNotifications"
              class="text-gray-400 hover:text-gray-600"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>
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
            <div class="flex items-center gap-2">
              <button 
                @click="refreshNotifications"
                class="text-xs text-blue-600 hover:text-blue-800 p-1"
                title="Refresh notifications"
              >
                <RefreshCwIcon class="w-3 h-3" />
              </button>
              <span v-if="loading || isRefreshing" class="text-xs text-gray-500">
                {{ isRefreshing ? 'Refreshing...' : 'Loading...' }}
              </span>
            </div>
          </div>
          
          <div v-if="filteredNotifications && filteredNotifications.length > 0">
            <div 
              v-for="notification in filteredNotifications" 
              :key="notification.id"
              :class="[
                'mb-3 p-3 rounded-lg hover:bg-gray-50 flex items-start cursor-pointer',
                { 'bg-blue-50': !notification.read }
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="mr-5 relative">
                <div 
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    'aspect-square',
                    getNotificationColor(notification.type)
                  ]"
                >
                  <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>
                <!-- Status badge overlay for appointment notifications -->
                <div v-if="notification.type==='appointment'" class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                     :class="getAppointmentStatusColor(notification)">
                  <component :is="getAppointmentStatusIcon(notification)" class="w-3 h-3" />
                </div>
              </div>
              <div class="flex-grow">
                <div class="font-medium">{{ notification.title }}</div>
                <div class="text-sm text-gray-500">{{ notification.description }}</div>
                
                <!-- Additional details for appointment reminders -->
                <div v-if="notification.type === 'appointment_reminder'" class="text-xs text-blue-600 mt-1">
                  <span v-if="notification.appointmentTime || notification.time">
                    🕒 {{ notification.appointmentTime || notification.time }}
                  </span>
                  <span v-if="notification.petNames || notification.petName" class="ml-2">
                    🐾 {{ notification.petNames?.join(', ') || notification.petName }}
                  </span>
                </div>
                
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
  Trash as TrashIcon,
  Clock as ClockIcon,
  XCircle as XCircleIcon,
  Ban as BanIcon,
  ArrowLeftRight as ArrowLeftRightIcon,
  MessageCircle as MessageCircleIcon
} from 'lucide-vue-next';
import { useNotificationsStore } from '../../stores/modules/notifications';
import { useAuthStore } from '../../stores/modules/authStore';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  isMobileView: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: false },
  // New: control side/offset for desktop
  isRightPanel: { type: Boolean, default: false },
  topOffset: { type: String, default: 'top-4' },
  widthClass: { type: String, default: 'w-[400px]' },
  leftOffset: { type: String, default: 'left-20' },
  rightOffset: { type: String, default: 'right-4' },
  heightClass: { type: String, default: 'h-[calc(100vh-2rem)]' },
  // whether to show the "View Details" action button (vet side)
  showActionButton: { type: Boolean, default: false },
  // explicit vet context (overrides role check)
  isVetContext: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);
// Desktop positioning class
const desktopPositionClass = computed(() => {
  const side = props.isRightPanel ? props.rightOffset : props.leftOffset;
  return `${side} ${props.topOffset} ${props.heightClass} ${props.widthClass} border border-gray-100 rounded-2xl shadow-sm`;
});

const router = useRouter();
const route = useRoute();
const notificationsStore = useNotificationsStore();
const authStore = useAuthStore();
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
  const filtered = notificationsStore.getFilteredNotifications(filterType.value, filterQuery.value);
  // console.log('Filtered notifications computed:', {
  //   filterType: filterType.value,
  //   filterQuery: filterQuery.value,
  //   totalNotifications: notificationsStore.notifications.length,
  //   filteredCount: filtered.length,
  //   filteredNotifications: filtered
  // });
  return filtered;
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
    case 'appointment_reminder':
      return 'bg-orange-100 text-orange-500';
    case 'telehealth':
      return 'bg-green-100 text-green-500';
    case 'reminder':
      return 'bg-yellow-100 text-yellow-500';
    case 'alert':
      return 'bg-red-100 text-red-500';
    case 'test':
      return 'bg-purple-100 text-purple-500';
    case 'welcome':
      return 'bg-blue-100 text-blue-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'appointment':
      return CalendarIcon;
    case 'appointment_reminder':
      return ClockIcon;
    case 'telehealth':
      return CheckCircleIcon;
    case 'reminder':
      return BellIcon;
    case 'alert':
      return AlertCircleIcon;
    case 'welcome':
      return BellIcon;
    default:
      return BellIcon;
  }
};

// Derive appointment status color/icon
const extractAppointmentStatus = (n) => {
  return (n?.status || n?.data?.status || '').toString().toLowerCase();
};

const getAppointmentStatusColor = (n) => {
  const s = extractAppointmentStatus(n);
  switch (s) {
    case 'approved':
      return 'bg-green-500 text-white';
    case 'pending':
      return 'bg-yellow-500 text-white';
    case 'rejected':
      return 'bg-red-500 text-white';
    case 'completed':
      return 'bg-blue-500 text-white';
    case 'cancelled':
      return 'bg-gray-500 text-white';
    case 'expired':
      return 'bg-orange-500 text-white';
    default:
      return 'bg-slate-400 text-white';
  }
};

const getAppointmentStatusIcon = (n) => {
  const s = extractAppointmentStatus(n);
  switch (s) {
    case 'approved':
    case 'completed':
      return CheckCircleIcon;
    case 'pending':
      return ClockIcon;
    case 'rejected':
      return XCircleIcon;
    case 'cancelled':
      return BanIcon;
    case 'expired':
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
  // If explicit URL provided, use it
  if (notification.url) {
    const targetUrl = notification.url;
    closeNotifications();
    setTimeout(() => router.push(targetUrl), 0);
    return;
  }

  // Smart routing by type/status (appointment → user or vet side)
  const type = (notification.type || notification.data?.type || '').toLowerCase();
  const status = (notification.status || notification.data?.status || '').toLowerCase();
  const appointmentId = notification.appointmentId || notification.data?.appointmentId || notification.data?.id;

  if (type === 'appointment' || appointmentId) {
    // If current user is a vet, go to vet approval; otherwise, user notifications page
    const isVet = props.isVetContext || (authStore.user?.role || authStore.user?.userType || '').toLowerCase().includes('vet');
    if (isVet) {
      const targetByName = { name: 'vetappointmentapproval', query: appointmentId ? { focus: String(appointmentId) } : {} };
      const targetByPath = { path: '/vet/appointments/vetappointmentapproval', query: appointmentId ? { focus: String(appointmentId) } : {} };
      closeNotifications();
      setTimeout(() => {
        router.push(targetByName).catch(() => router.push(targetByPath)).catch(() => {});
      }, 30);
      // Attempt to scroll/focus after small delay
      setTimeout(() => {
        try {
          const el = document.getElementById(`appt-${appointmentId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {}
      }, 800);
    } else {
      closeNotifications();
      setTimeout(() => {
        router.push({ name: 'Notifications' }).catch(() => router.push('/user/notifications')).catch(() => {});
      }, 30);
    }
    return;
  }
};

const markAllAsRead = async () => {
  if (!hasUnreadNotifications.value) return;
  
  const user = authStore.user || null;
  if (user && user.userId) {
    await notificationsStore.markAllAsRead(user.userId);
  }
};

const refreshNotifications = async () => {
  if (isRefreshing.value) return;
  
  isRefreshing.value = true;
  const user = authStore.user || null;
  
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
  const user = authStore.user || null;
  
  if (user && user.userId) {
    // Set up a small delay to let the animation complete first
    setTimeout(async () => {
      // console.log('Attempting to fetch notifications for user:', user.userId);
      
      try {
        await notificationsStore.fetchNotifications(user.userId);
        // console.log('Notifications fetched successfully');
        // console.log('Current notifications in store:', notificationsStore.notifications);
        // console.log('Filtered notifications:', filteredNotifications.value);
      } catch (error) {
        // console.error('Error fetching notifications:', error);
        
        if (error.message && error.message.includes('requires an index')) {
          // console.warn('Firestore index required. Please create the index using the link in the error message above.');
        }
      }
      
      // Set up real-time listener
      try {
        unsubscribe.value = notificationsStore.subscribeToNotifications(user.userId);
      } catch (error) {
        // console.error('Error setting up notifications subscription:', error);
      }
    }, 300); // 300ms matches the transition duration
  } else {
    // console.warn('No user found or user ID missing. Cannot fetch notifications.');
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
    // console.log('Notification panel became visible, refreshing notifications...');
    // Reset selected notification when panel is opened
    selectedNotification.value = null;
    
    // Fetch notifications immediately when panel becomes visible
    const user = authStore.user || null;
    if (user && user.userId) {
      // console.log('Fetching notifications for user:', user.userId);
      // Don't clear notifications here, just fetch new ones
      notificationsStore.fetchNotifications(user.userId).then(() => {
        // console.log('Notifications refreshed when panel became visible');
        // console.log('Current notifications:', notificationsStore.notifications);
      });
      
      // Ensure we have an active subscription
      if (!unsubscribe.value) {
        unsubscribe.value = notificationsStore.subscribeToNotifications(user.userId);
      }
    } else {
      // console.warn('No user found when panel became visible');
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
  // console.log(`Unread count changed from ${oldCount} to ${newCount}`);
});

// Watch for auth store user changes
watch(() => authStore.user, (newUser, oldUser) => {
  if (newUser && newUser.userId && (!oldUser || oldUser.userId !== newUser.userId)) {
    // console.log('User changed, fetching notifications for new user:', newUser.userId);
    
    // Clean up existing subscription
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }
    
    // Fetch notifications for new user
    notificationsStore.fetchNotifications(newUser.userId).then(() => {
      // console.log('Notifications fetched for new user');
    });
    
    // Set up new subscription
    unsubscribe.value = notificationsStore.subscribeToNotifications(newUser.userId);
  }
}, { immediate: true });
</script>

<style scoped>
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(24px); opacity: 0; }

.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-24px); opacity: 0; }
</style>