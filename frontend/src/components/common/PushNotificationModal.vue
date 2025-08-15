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
          <div class="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">Notifications Enabled!</h2>
              <button @click="emit('close')" class="text-white/80 hover:text-white transition-colors">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <p class="text-green-100 mt-1 text-sm">Your notifications are now active</p>
          </div>
          
          <!-- Content -->
          <div class="p-6">
            <div class="flex items-center mb-6">
              <div class="bg-green-100 p-3 rounded-full mr-4">
                <BellIcon class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-800">You're All Set!</h3>
                <p class="text-sm text-gray-600">Notifications have been automatically enabled for your account.</p>
              </div>
            </div>
            
            <div class="space-y-4 mb-6">
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
            
            <div class="mt-8">
              <button 
                @click="emit('close')" 
                class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { BellIcon, CheckCircleIcon, XIcon } from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

// Prevent body scrolling when modal is open
onMounted(() => {
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
  // Toggle body scrolling based on modal visibility
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Auto-close after 3 seconds
watch(() => props.show, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      emit('close');
    }, 3000);
  }
});
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

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>