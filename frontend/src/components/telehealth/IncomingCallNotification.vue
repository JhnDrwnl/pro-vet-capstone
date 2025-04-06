<template>
  <div 
    v-if="show"
    class="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md w-full z-50 animate-slide-in"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0 bg-blue-100 rounded-full p-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-gray-900">Incoming Call</h3>
        <p class="mt-1 text-sm text-gray-500">{{ call.name }} is calling you</p>
        <p class="mt-1 text-xs text-gray-500">{{ call.title }}</p>
        <div class="mt-4 flex space-x-3">
          <button 
            @click="reject" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Decline
          </button>
          <button 
            @click="answer" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Answer
          </button>
        </div>
      </div>
      <button 
        @click="close" 
        class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTelehealthStore } from '@/stores/modules/teleHealthStore';

const props = defineProps({
  call: {
    type: Object,
    required: true
  }
});

const show = ref(true);
const router = useRouter();
const telehealthStore = useTelehealthStore();

// Methods
const answer = async () => {
  try {
    // Navigate to telehealth page
    router.push({ name: 'Telehealth' });
    
    // Close notification
    close();
  } catch (error) {
    console.error('Error answering call:', error);
  }
};

const reject = async () => {
  try {
    await telehealthStore.rejectCall();
    close();
  } catch (error) {
    console.error('Error rejecting call:', error);
    close();
  }
};

const close = () => {
  show.value = false;
};

// Auto-close after 30 seconds
let autoCloseTimeout;
onMounted(() => {
  autoCloseTimeout = setTimeout(() => {
    close();
  }, 30000);
});

onUnmounted(() => {
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout);
  }
});
</script>

<style scoped>
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

