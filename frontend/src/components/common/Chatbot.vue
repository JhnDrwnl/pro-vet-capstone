<template>
  <div>
    <!-- Chat bubble with animation -->
    <div 
      v-if="lottieLoaded"
      id="custom-chat-bubble" 
      ref="lottieContainer"
      class="fixed bottom-16 right-5 w-14 h-14 z-50 cursor-pointer"
      @click="openChat"
      aria-label="Open chat assistant"
      role="button"
      tabindex="0"
      @keydown.enter="openChat"
      @keydown.space="openChat"
    ></div>
    
    <!-- Chat toggle button -->
    <div class="fixed bottom-24 right-6 z-30" v-if="isVisible">
      <button 
        @click="toggleChatbot"
        class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
        aria-label="Toggle chat"
      >
        <MessageSquare v-if="!isChatbotOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
      
      <!-- Chat window -->
      <div 
        v-if="isChatbotOpen"
        class="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl w-80 sm:w-96 overflow-hidden transition-all duration-300 flex flex-col"
        style="height: 500px; max-height: calc(100vh - 120px);"
        role="dialog"
        aria-labelledby="chat-title"
      >
        <!-- Chat header -->
        <div class="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h3 id="chat-title" class="font-medium">Provincial Vet Assistant</h3>
          <button 
            @click="toggleChatbot" 
            class="text-white hover:text-gray-200"
            aria-label="Close chat"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Chat messages -->
        <div 
          class="flex-grow p-4 overflow-y-auto" 
          ref="chatContainer"
          aria-live="polite"
        >
          <!-- Initial message with suggested queries -->
          <div v-if="messages.length > 0 && messages[0].type === 'bot'" class="mb-4">
            <div class="flex items-start gap-2">
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGdVf3D-F2UIJ_Lp3GiaZTNcueXQjdy59G2g&s" 
                  alt="Bot" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex flex-col gap-2">
                <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p class="text-gray-800" v-html="formatMessage(messages[0].text)"></p>
                </div>
                
                <!-- Suggested Queries directly below initial message -->
                <div v-if="suggestedQueries.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <div 
                    v-for="(query, index) in suggestedQueries" 
                    :key="index"
                    class="bg-gray-100 rounded-lg p-2 pr-8 text-sm relative cursor-pointer hover:bg-gray-200 transition-colors"
                    @click="sendSuggestedQuery(query)"
                  >
                    {{ query }}
                    <button 
                      @click.stop="removeSuggestedQuery(index)" 
                      class="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      aria-label="Remove suggestion"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Other messages (after the first one) -->
          <div v-for="(message, index) in messages.slice(1)" :key="index" class="mb-4">
            <div 
              v-if="message.type === 'bot'"
              class="flex items-start gap-2"
            >
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGdVf3D-F2UIJ_Lp3GiaZTNcueXQjdy59G2g&s" 
                  alt="Bot" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <p class="text-gray-800" v-html="formatMessage(message.text)"></p>
              </div>
            </div>
            <div 
              v-else
              class="flex items-start justify-end gap-2"
            >
              <div class="bg-blue-500 text-white rounded-lg p-3 max-w-[80%]">
                <p>{{ message.text }}</p>
              </div>
              <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  :src="userProfilePicture" 
                  alt="User" 
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-start gap-2">
            <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGdVf3D-F2UIJ_Lp3GiaZTNcueXQjdy59G2g&s" 
                alt="Bot" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="bg-gray-100 rounded-lg p-3">
              <div class="flex space-x-1" aria-label="Bot is typing">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Chat input -->
        <div class="p-4 border-t">
          <form @submit.prevent="sendMessage" class="flex">
            <label for="chat-input" class="sr-only">Type your message</label>
            <input 
              id="chat-input"
              type="text" 
              v-model="userInput" 
              placeholder="Type your message..." 
              class="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="isTyping"
            />
            <button 
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isTyping || !userInput.trim()"
              aria-label="Send message"
            >
              <Send class="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { nanoid } from "nanoid";
import { MessageSquare, X, Send } from 'lucide-vue-next';
import { useProfileStore } from '@/stores/modules/profileStore';
import { useAuthStore } from '@/stores/modules/authStore';
import { storeToRefs } from 'pinia';

export default {
  name: "Chatbot",
  components: {
    MessageSquare,
    X,
    Send
  },
  props: {
    initialMessage: {
      type: String,
      default: "Hello! I'm ProBot, your virtual assistant. How can I help you today? Please use the navigation below or ask me anything."
    },
    apiBaseUrl: {
      type: String,
      default: "http://localhost:3001"
    }
  },
  data() {
    return {
      userInput: "",
      messages: [],
      isTyping: false,
      isChatbotOpen: false,
      isVisible: true,
      lottieLoaded: false,
      sessionId: "",
      lottiePlayer: null,
      apiUrl: "",
      retryCount: 0,
      maxRetries: 2,  // Reduced from 3 to 2 for faster fallback
      requestTimeoutMs: 35000,  // 35 seconds timeout
      suggestedQueries: [
        "How do I schedule an appointment?",
        "What services do you offer?",
        "What are your operating hours?",
        "Where is your office?"
      ]
    }
  },
  computed: {
    chatEndpoint() {
      return `${this.apiBaseUrl}/chat`;
    },
    healthEndpoint() {
      return `${this.apiBaseUrl}/health`;
    },
    userProfilePicture() {
      const profileStore = useProfileStore();
      const authStore = useAuthStore();
      
      // Try to get profile picture from profile store first
      if (profileStore.profile && profileStore.profile.photoURL) {
        return profileStore.profile.photoURL;
      }
      
      // Fall back to auth store if available
      if (authStore.user && authStore.user.photoURL) {
        return authStore.user.photoURL;
      }
      
      // Default placeholder if no profile picture is available
      return 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff';
    }
  },
  created() {
    // Generate a unique session ID for this chat
    this.sessionId = nanoid();
    
    // Set API URL from props
    this.apiUrl = this.chatEndpoint;
  },
  mounted() {
    // Add welcome message
    this.addBotMessage(this.initialMessage);
    
    // Test connection to server
    this.testServerConnection();
    
    // Initialize Lottie animation
    this.loadLottiePlayer().then(() => {
      this.initializeLottie();
    }).catch(error => {
      console.error("Failed to load Lottie player:", error);
      // Still show the chat button even if Lottie fails
      this.lottieLoaded = true;
    });

    // Add event listener for keyboard accessibility
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Clean up Lottie player if needed
    if (this.lottiePlayer) {
      this.lottiePlayer = null;
    }
  },
  methods: {
    async testServerConnection() {
      try {
        // Test if the server is reachable
        await axios.get(this.healthEndpoint);
        console.log("Server connection successful");
      } catch (error) {
        console.error("Server connection failed:", error);
        this.addBotMessage("Warning: I'm having trouble connecting to the server. Some features may not work properly.");
      }
    },
    async loadLottiePlayer() {
      return new Promise((resolve, reject) => {
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
        script.onerror = (error) => {
          console.error("Failed to load Lottie player script:", error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    },
    initializeLottie() {
      if (!this.$refs.lottieContainer) return;
      
      try {
        // Create the player element programmatically
        const player = document.createElement('dotlottie-player');
        player.setAttribute('src', 'https://lottie.host/b202c548-8602-4982-a7dc-8f7db1df371f/SOWn3JnOYp.lottie');
        player.setAttribute('background', 'transparent');
        player.setAttribute('speed', '1');
        player.setAttribute('loop', '');
        player.setAttribute('autoplay', '');
        player.style.width = '100%';
        player.style.height = '100%';
        
        // Append to the container
        this.$refs.lottieContainer.appendChild(player);
        this.lottiePlayer = player;
        this.lottieLoaded = true;
      } catch (error) {
        console.error("Error initializing Lottie:", error);
        this.lottieLoaded = true; // Still show the chat button
      }
    },
    openChat() {
      this.isChatbotOpen = true;
      this.$nextTick(() => {
        this.scrollToBottom();
        // Focus on input field when chat opens
        const inputField = document.getElementById('chat-input');
        if (inputField) {
          inputField.focus();
        }
      });
    },
    toggleChatbot() {
      this.isChatbotOpen = !this.isChatbotOpen;
      if (this.isChatbotOpen) {
        this.$nextTick(() => {
          this.scrollToBottom();
          // Focus on input field when chat opens
          const inputField = document.getElementById('chat-input');
          if (inputField) {
            inputField.focus();
          }
        });
      }
    },
    handleKeyDown(event) {
      // Close chat on Escape key
      if (event.key === 'Escape' && this.isChatbotOpen) {
        this.toggleChatbot();
      }
    },
    // New method to handle suggested query clicks
    sendSuggestedQuery(query) {
      this.userInput = query;
      this.sendMessage();
    },
    // New method to remove a suggested query
    removeSuggestedQuery(index) {
      this.suggestedQueries.splice(index, 1);
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isTyping) return;

      // Add user message to chat
      this.addUserMessage(this.userInput);
      const userMessage = this.userInput;
      this.userInput = "";

      // Show typing indicator
      this.isTyping = true;

      try {
        console.log("Sending message to:", this.apiUrl);
        
        // Create a timeout promise to handle request timeouts
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), this.requestTimeoutMs);
        });
        
        // Send message to backend with a race against the timeout
        const response = await Promise.race([
          axios.post(this.apiUrl, {
            message: userMessage,
            sender_id: this.sessionId,
          }, {
            timeout: this.requestTimeoutMs // Use the timeout from data
          }),
          timeoutPromise
        ]);

        // Process response
        if (response.data && response.data.messages && response.data.messages.length > 0) {
          // Add a small delay to simulate typing
          setTimeout(() => {
            response.data.messages.forEach((msg) => {
              this.addBotMessage(msg.text);
            });
            this.isTyping = false;
            this.retryCount = 0; // Reset retry count on success
          }, 500);
        } else {
          this.handleError("Received empty response from server");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        
        // Implement retry logic
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`Retrying (${this.retryCount}/${this.maxRetries})...`);
          
          setTimeout(() => {
            this.retryMessage(userMessage);
          }, 1000 * this.retryCount); // Exponential backoff
        } else {
          // Use direct fallback after all retries fail
          this.directFallback(userMessage);
        }
      }
    },
    
    async retryMessage(userMessage) {
      try {
        const response = await axios.post(this.apiUrl, {
          message: userMessage,
          sender_id: this.sessionId,
        }, {
          timeout: this.requestTimeoutMs
        });

        if (response.data && response.data.messages && response.data.messages.length > 0) {
          setTimeout(() => {
            response.data.messages.forEach((msg) => {
              this.addBotMessage(msg.text);
            });
            this.isTyping = false;
            this.retryCount = 0; // Reset retry count on success
          }, 500);
        } else {
          this.directFallback(userMessage);
        }
      } catch (error) {
        this.directFallback(userMessage);
      }
    },
    
    async directFallback(userMessage) {
      // This is a client-side fallback when the server times out
      const fallbackMessages = [
        "I'm sorry, I couldn't get a response from the server in time. Please try again later.",
        "It seems our server is taking too long to respond. Your question might be complex or our system might be busy.",
        "I apologize for the delay. Our server is taking longer than expected to process your request."
      ];
      
      // Pick a random fallback message
      const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
      this.addBotMessage(fallbackMessages[randomIndex]);
      this.isTyping = false;
    },
    
    addUserMessage(text) {
      this.messages.push({
        text,
        type: "user",
      });
      this.scrollToBottom();
    },
    
    addBotMessage(text) {
      this.messages.push({
        text,
        type: "bot",
      });
      this.scrollToBottom();
    },
    
    handleError(errorMessage) {
      this.isTyping = false;
      this.addBotMessage(`I'm sorry, I'm having trouble connecting right now. ${errorMessage ? `Error: ${errorMessage}` : 'Please try again later.'}`);
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatContainer) {
          this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
        }
      });
    },
    
    formatMessage(text) {
      if (!text) return '';
      
      // Convert URLs to clickable links with proper security attributes
      return text.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      );
    }
  }
}
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Improve focus styles for accessibility */
button:focus, 
input:focus, 
[role="button"]:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Ensure text has sufficient contrast */
.text-gray-800 {
  color: #1f2937;
}
</style>








<!-- 
<template>
  <div>
    
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
        <MessageSquare v-if="!isChatbotOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
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
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="flex-grow p-4 overflow-y-auto" ref="chatContainer">
            <div v-for="(message, index) in messages" :key="index" class="mb-4">
              <div 
                v-if="message.type === 'bot'"
                class="flex items-start"
              >
                <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p class="text-gray-800" v-html="formatMessage(message.text)"></p>
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
                v-model="userInput" 
                placeholder="Type your message..." 
                class="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none"
                :disabled="isTyping || !userInput.trim()"
              >
                <Send class="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { nanoid } from "nanoid";
import { MessageSquare, X, Send } from 'lucide-vue-next';

export default {
  name: "Chatbot",
  components: {
    MessageSquare,
    X,
    Send
  },
  data() {
    return {
      userInput: "",
      messages: [],
      isTyping: false,
      isChatbotOpen: false,
      isVisible: true,
      lottieLoaded: false,
      sessionId: "",
      apiUrl: "http://localhost:3001/chat",
    }
  },
  mounted() {
    // Generate a unique session ID for this chat
    this.sessionId = nanoid();
    
    // Add welcome message
    this.addBotMessage(
      "Hello! I'm ProBot, your virtual assistant for the Provincial Veterinary Office. How can I help you today?"
    );
    
    // Test connection to server
    this.testServerConnection();
    
    // Set lottieLoaded to true after initialization
    this.initializeLottie();
  },
  methods: {
    async testServerConnection() {
      try {
        // Test if the server is reachable
        await axios.get("http://localhost:3001/health");
        console.log("Server connection successful");
      } catch (error) {
        console.error("Server connection failed:", error);
        this.addBotMessage("Warning: I'm having trouble connecting to the server. Some features may not work properly.");
      }
    },
    initializeLottie() {
      // Implement your Lottie initialization here
      // For now, we'll just set it to true
      this.lottieLoaded = true;
    },
    openChat() {
      this.isChatbotOpen = true;
    },
    toggleChatbot() {
      this.isChatbotOpen = !this.isChatbotOpen;
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isTyping) return;

      // Add user message to chat
      this.addUserMessage(this.userInput);
      const userMessage = this.userInput;
      this.userInput = "";

      // Show typing indicator
      this.isTyping = true;

      try {
        console.log("Sending message to:", this.apiUrl);
        console.log("Message data:", { message: userMessage, sender_id: this.sessionId });
        
        // Send message to backend
        const response = await axios.post(this.apiUrl, {
          message: userMessage,
          sender_id: this.sessionId,
        });

        console.log("Server response:", response.data);

        // Process response
        if (response.data && response.data.messages) {
          // Add a small delay to simulate typing
          setTimeout(() => {
            response.data.messages.forEach((msg) => {
              this.addBotMessage(msg.text);
            });
            this.isTyping = false;
          }, 500);
        } else {
          this.handleError("Received invalid response format from server");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        this.handleError(error.message || "Failed to connect to server");
      }
    },
    addUserMessage(text) {
      this.messages.push({
        text,
        type: "user",
      });
      this.scrollToBottom();
    },
    addBotMessage(text) {
      this.messages.push({
        text,
        type: "bot",
      });
      this.scrollToBottom();
    },
    handleError(errorMessage) {
      this.isTyping = false;
      this.addBotMessage(`I'm sorry, I'm having trouble connecting right now. ${errorMessage ? `Error: ${errorMessage}` : 'Please try again later.'}`);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatContainer) {
          this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
        }
      });
    },
    formatMessage(text) {
      // Convert URLs to clickable links
      return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    },
  },
}
</script>

<style scoped>
/* Add any component-specific styles here */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>




  //CHATBOT.VUE

<template>
  <div>
    Only show the Lottie player when it's loaded 
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


import axios from "axios"
import { v4 as uuidv4 } from "uuid"

export default {
  name: "Chatbot",
  data() {
    return {
      userInput: "",
      messages: [],
      isTyping: false,
      isMinimized: true,
      sessionId: "",
      apiUrl: "http://localhost:5005/chat",
    }
  },
  mounted() {
    // Generate a unique session ID for this chat
    this.sessionId = uuidv4()

    // Add welcome message
    this.addBotMessage(
      "Hello! I'm ProBot, your virtual assistant for the Provincial Veterinary Office. How can I help you today?",
    )
  },
  methods: {
    toggleChatbot() {
      this.isMinimized = !this.isMinimized
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isTyping) return

      // Add user message to chat
      this.addUserMessage(this.userInput)
      const userMessage = this.userInput
      this.userInput = ""

      // Show typing indicator
      this.isTyping = true

      try {
        // Send message to backend
        const response = await axios.post(this.apiUrl, {
          message: userMessage,
          sender_id: this.sessionId,
        })

        // Process response
        if (response.data && response.data.messages) {
          // Add a small delay to simulate typing
          setTimeout(() => {
            response.data.messages.forEach((msg) => {
              this.addBotMessage(msg.text)
            })
            this.isTyping = false
          }, 500)
        } else {
          this.handleError()
        }
      } catch (error) {
        console.error("Error sending message:", error)
        this.handleError()
      }
    },
    addUserMessage(text) {
      this.messages.push({
        text,
        type: "user",
      })
      this.scrollToBottom()
    },
    addBotMessage(text) {
      this.messages.push({
        text,
        type: "bot",
      })
      this.scrollToBottom()
    },
    handleError() {
      this.isTyping = false
      this.addBotMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.")
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight
        }
      })
    },
    formatMessage(text) {
      // Convert URLs to clickable links
      return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    },
  },
} -->
