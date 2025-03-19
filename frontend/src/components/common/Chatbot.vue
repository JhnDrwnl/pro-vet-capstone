<template>
  <div>
    <!-- Only show the Lottie player when it's loaded -->
    <div 
      v-if="lottieLoaded"
      id="custom-chat-bubble" 
      ref="lottieContainer"
      style="position: fixed; bottom: 60px; right: 20px; width: 56px; height: 56px; z-index: 1000; cursor: pointer;"
      @click="openChat"
    ></div>
    
    <div class="fixed bottom-24 right-6 z-30" v-if="isVisible">
      <button 
        @click="toggleChatbot"
        class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
      >
        <MessageSquareIcon v-if="!isChatbotOpen" class="w-6 h-6" />
        <XIcon v-else class="w-6 h-6" />
      </button>
      
      <div 
        v-if="isChatbotOpen"
        class="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl w-80 sm:w-96 overflow-hidden transition-all duration-300"
        style="height: 500px;"
      >
        <div class="flex flex-col h-full">
          <div class="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h3 class="font-medium">Provincial Vet Assistant</h3>
            <button @click="toggleChatbot" class="text-white hover:text-gray-200">
              <XIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div class="flex-grow p-4 overflow-y-auto" ref="chatContainer">
            <div v-for="(message, index) in messages" :key="index" class="mb-4">
              <div 
                v-if="message.sender === 'bot'"
                class="flex items-start"
              >
                <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p class="text-gray-800">{{ message.text }}</p>
                </div>
              </div>
              <div 
                v-else
                class="flex items-start justify-end"
              >
                <div class="bg-blue-500 text-white rounded-lg p-3 max-w-[80%]">
                  <p>{{ message.text }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="isTyping" class="flex items-start">
              <div class="bg-gray-100 rounded-lg p-3">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-4 border-t">
            <form @submit.prevent="sendMessage" class="flex">
              <input 
                type="text" 
                v-model="newMessage" 
                placeholder="Type your message..." 
                class="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none"
              >
                <SendIcon class="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { MessageSquareIcon, XIcon, SendIcon } from 'lucide-vue-next';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle']);

const isChatbotOpen = ref(false);
const messages = ref([
  { sender: 'bot', text: 'Hello! How can I help you with your pet today?' }
]);
const newMessage = ref('');
const isTyping = ref(false);
const chatContainer = ref(null);

const lottieLoaded = ref(false);
const lottieContainer = ref(null);
const dfMessengerLoaded = ref(false);
let lottiePlayer = null;

const toggleChatbot = () => {
  isChatbotOpen.value = !isChatbotOpen.value;
  emit('toggle');
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  
  // Add user message
  messages.value.push({ sender: 'user', text: newMessage.value });
  const userMessage = newMessage.value;
  newMessage.value = '';
  
  // Scroll to bottom
  await nextTick();
  scrollToBottom();
  
  // Show typing indicator
  isTyping.value = true;
  
  // Simulate bot response after a delay
  setTimeout(() => {
    // Hide typing indicator
    isTyping.value = false;
    
    // Add bot response
    let botResponse = getBotResponse(userMessage);
    messages.value.push({ sender: 'bot', text: botResponse });
    
    // Scroll to bottom again after bot responds
    nextTick(() => {
      scrollToBottom();
    });
  }, 1500);
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const getBotResponse = (message) => {
  // Simple response logic - in a real app, this would connect to a backend
  message = message.toLowerCase();
  
  if (message.includes('appointment') || message.includes('schedule')) {
    return "You can schedule an appointment through the Appointments section. Would you like me to help you with that?";
  } else if (message.includes('vaccine') || message.includes('vaccination')) {
    return "We offer various vaccination services for pets. What type of pet do you have?";
  } else if (message.includes('hours') || message.includes('open')) {
    return "Our clinic is open Monday to Friday from 8am to 5pm, and Saturday from 9am to 2pm.";
  } else if (message.includes('emergency')) {
    return "For emergencies, please call our hotline at (123) 456-7890 immediately.";
  } else if (message.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  } else {
    return "I'm here to help with your pet care needs. You can ask about appointments, vaccinations, our services, or any other questions about your pet's health.";
  }
};

// Watch for changes to isChatbotOpen and scroll to bottom when opened
watch(isChatbotOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

// Load Lottie player
const loadLottiePlayer = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (document.querySelector('script[src*="dotlottie-player"]')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
    script.type = "module";
    script.onload = () => {
      console.log("Lottie player script loaded");
      resolve();
    };
    document.head.appendChild(script);
  });
};

// Initialize Lottie animation
const initializeLottie = () => {
  if (!lottieContainer.value) return;
  
  // Create the player element programmatically
  lottiePlayer = document.createElement('dotlottie-player');
  lottiePlayer.setAttribute('src', 'https://lottie.host/b202c548-8602-4982-a7dc-8f7db1df371f/SOWn3JnOYp.lottie');
  lottiePlayer.setAttribute('background', 'transparent');
  lottiePlayer.setAttribute('speed', '1');
  lottiePlayer.setAttribute('loop', '');
  lottiePlayer.setAttribute('autoplay', '');
  lottiePlayer.style.width = '100%';
  lottiePlayer.style.height = '100%';
  
  // Append to the container
  lottieContainer.value.appendChild(lottiePlayer);
  lottieLoaded.value = true;
};

// Initialize Dialogflow Messenger
const initializeDialogflow = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (document.querySelector('script[src*="df-messenger"]')) {
      resolve();
      return;
    }
    
    // Add Dialogflow Messenger script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';
    script.async = true;
    
    // Add Dialogflow Messenger styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css';
    document.head.appendChild(link);
    
    script.onload = () => {
      console.log("Dialogflow script loaded");
      
      // Create and insert Dialogflow Messenger element if it doesn't exist
      if (!document.querySelector('df-messenger')) {
        const dfMessenger = document.createElement('df-messenger');
        dfMessenger.setAttribute('project-id', 'provetbot-448117');
        dfMessenger.setAttribute('agent-id', 'f6bb4117-de93-4e51-a7e5-873dffd92a6c');
        dfMessenger.setAttribute('language-code', 'en');
        dfMessenger.setAttribute('max-query-length', '-1');
        dfMessenger.setAttribute('chat-title', 'training-data-probot');
        
        // Hide by default
        dfMessenger.style.display = 'none';
        
        document.body.appendChild(dfMessenger);
      }
      
      dfMessengerLoaded.value = true;
      resolve();
    };
    
    document.head.appendChild(script);
  });
};

// Open the chat
const openChat = () => {
  if (!dfMessengerLoaded.value) return;
  
  const chatBubble = document.querySelector('df-messenger');
  if (chatBubble) {
    chatBubble.style.display = 'block';
    chatBubble.setAttribute('opened', 'true');
    
    if (lottieContainer.value) {
      lottieContainer.value.style.display = 'none';
    }
  }
};

// On component mount
onMounted(async () => {
  try {
    // Load scripts in sequence
    await loadLottiePlayer();
    await initializeDialogflow();
    
    // Initialize Lottie after scripts are loaded
    setTimeout(() => {
      initializeLottie();
    }, 500); // Small delay to ensure custom elements are registered
    
    // Add event listener for when the chat is closed
    document.addEventListener('df-messenger-closed', () => {
      const chatBubble = document.querySelector('df-messenger');
      if (chatBubble) {
        chatBubble.style.display = 'none';
      }
      
      if (lottieContainer.value) {
        lottieContainer.value.style.display = 'block';
      }
    });
  } catch (error) {
    console.error('Error initializing chat:', error);
  }
});

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('df-messenger-closed', () => {});
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>

<style>
/* Custom styles for Dialogflow Messenger */
df-messenger {
  --df-messenger-bot-message: #f0f8ff;
  --df-messenger-button-border-color: #1976d2;
  --df-messenger-chat-background-color: #fafafa;
  --df-messenger-font-color: #212121;
  --df-messenger-send-icon: #1976d2;
  --df-messenger-user-message: #e3f2fd;
}
</style>