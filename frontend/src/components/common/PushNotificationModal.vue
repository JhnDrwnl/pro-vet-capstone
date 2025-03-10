<!-- components/common/PushNotificationModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Semi-transparent backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>
      
      <!-- Modal content -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl border border-gray-100 relative">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">Enable Notifications</h2>
              <button @click="emit('close')" class="text-white/80 hover:text-white transition-colors">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <p class="text-blue-100 mt-1 text-sm">Stay updated with your pet's health information</p>
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <div class="flex items-center mb-6">
              <div class="bg-blue-100 p-3 rounded-full mr-4">
                <BellIcon class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-800">Get Important Updates</h3>
                <p class="text-sm text-gray-600">Receive notifications about appointments, medication reminders, and more.</p>
              </div>
            </div>
            
            <!-- Toggle Switch -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
              <div>
                <h3 class="font-medium text-gray-800">Push Notifications</h3>
                <p class="text-sm text-gray-600">Allow notifications from Provincial Veterinary</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="notificationsEnabled" 
                  class="sr-only peer" 
                  :disabled="loading"
                  @change="toggleNotifications"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <CheckCircleIcon class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-gray-700">Appointment reminders and confirmations</p>
              </div>
              <div class="flex items-start space-x-3">
                <CheckCircleIcon class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-gray-700">Medication and vaccination schedules</p>
              </div>
              <div class="flex items-start space-x-3">
                <CheckCircleIcon class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-gray-700">Important health alerts for your pets</p>
              </div>
            </div>
            
            <div class="mt-8 space-y-3">
              <button 
                @click="skipNotifications" 
                class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
              >
                Maybe Later
              </button>
            </div>
            
            <!-- Status message -->
            <div v-if="statusMessage" class="mt-4 p-3 rounded-lg text-sm" :class="statusSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              <div class="flex items-center">
                <component 
                  :is="statusSuccess ? CheckCircleIcon : AlertCircleIcon" 
                  class="w-4 h-4 mr-2 flex-shrink-0" 
                />
                {{ statusMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { BellIcon, CheckCircleIcon, XIcon, AlertCircleIcon } from 'lucide-vue-next';
import notificationService from '@/services/notificationService';
import welcomeNotificationService from '@/services/welcomeNotificationService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';
import { useAuthStore } from '@/stores/modules/authStore';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'enabled', 'skipped']);

const showModal = ref(props.show);
const loading = ref(false);
const statusMessage = ref('');
const statusSuccess = ref(false);
const notificationsEnabled = ref(false);
const authStore = useAuthStore();

// Initialize notification service when component is mounted
onMounted(async () => {
  try {
    await notificationService.initialize();
    
    // Check if notifications are already enabled
    const permission = await notificationService.checkPermission();
    notificationsEnabled.value = permission === 'granted';
  } catch (error) {
    console.error('Error initializing notification service:', error);
  }
  
  // Store current user in window object for access by notification service
  if (authStore.currentUser) {
    window.currentUser = authStore.currentUser;
  }
  
  // Prevent body scrolling when modal is open
  if (props.show) {
    document.body.style.overflow = 'hidden';
  }
});

// Clean up when component is unmounted
onUnmounted(() => {
  // Restore body scrolling
  document.body.style.overflow = '';
});

// Watch for prop changes
watch(() => props.show, (newValue) => {
  showModal.value = newValue;
  
  // Toggle body scrolling based on modal visibility
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Watch for auth store changes
watch(() => authStore.currentUser, (newUser) => {
  if (newUser) {
    window.currentUser = newUser;
  }
});

const toggleNotifications = async () => {
  if (notificationsEnabled.value) {
    await enableNotifications();
  } else {
    // Handle disabling notifications if needed
    // Note: Browsers don't provide a way to programmatically revoke permissions
    // So we can only update our database to reflect user preference
    statusMessage.value = 'Please disable notifications in your browser settings.';
    statusSuccess.value = false;
  }
};

const enableNotifications = async () => {
  try {
    loading.value = true;
    statusMessage.value = '';
    
    // Request permission and get token
    const token = await notificationService.requestPermission();
    
    if (token) {
      // Save token to database
      const success = await notificationService.saveTokenToDatabase(token);
      
      if (success) {
        console.log('Notifications enabled successfully');
        statusMessage.value = 'Notifications enabled successfully!';
        statusSuccess.value = true;
        
        // Send welcome notification - Option 1: Direct HTTP call
        const user = authStore.currentUser;
        if (user) {
          welcomeNotificationService.sendWelcomeNotification(user.userId, token)
            .then(sent => {
              if (sent) {
                console.log('Welcome notification sent via HTTP function');
              } else {
                console.warn('Failed to send welcome notification');
                // Try client-side fallback
                notificationService.showNotification(
                  'Welcome to Provincial Veterinary!',
                  `Hi ${user.firstName || 'there'}, thanks for enabling notifications.`,
                  { type: 'welcome', url: '/dashboard' }
                );
              }
            })
            .catch(err => console.error('Error sending welcome notification via HTTP:', err));
        }
        
        emit('enabled', true);
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          emit('close');
        }, 2000);
      } else {
        console.log('Failed to save notification token');
        statusMessage.value = 'Failed to save notification settings. Please try again.';
        statusSuccess.value = false;
        notificationsEnabled.value = false;
        emit('enabled', false);
      }
    } else {
      console.log('Failed to get notification token');
      statusMessage.value = 'Failed to enable notifications. Please check your browser settings.';
      statusSuccess.value = false;
      notificationsEnabled.value = false;
      emit('enabled', false);
    }
  } catch (error) {
    console.error('Error enabling notifications:', error);
    statusMessage.value = 'An error occurred. Please try again.';
    statusSuccess.value = false;
    notificationsEnabled.value = false;
  } finally {
    loading.value = false;
  }
};

const skipNotifications = async () => {
  try {
    // Update user document to indicate notifications were skipped
    const user = authStore.currentUser;
    if (user) {
      const userId = user.userId;
      const userRef = doc(db, "users", userId);
      
      await setDoc(userRef, {
        notificationsConfigured: true,
        notificationsEnabled: false,
        updatedAt: new Date()
      }, { merge: true });
    }
    
    emit('skipped');
    emit('close');
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    emit('close');
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>