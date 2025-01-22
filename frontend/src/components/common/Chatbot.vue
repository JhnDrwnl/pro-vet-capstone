<template>
    <button
      v-if="isVisible"
      @click="toggleChatbot"
      class="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Open chatbot"
    >
      <MessageCircle class="w-6 h-6" />
    </button>
  </template>
  
  <script setup>
  import { MessageCircle } from 'lucide-vue-next';
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      default: true
    }
  });
  
  const emit = defineEmits(['toggle']);
  
  const toggleChatbot = () => {
    emit('toggle');
  };
  </script>
  
  