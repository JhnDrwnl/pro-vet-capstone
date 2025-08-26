<!-- views/vet/VetVideoCall.vue -->
<template>
  <div class="h-screen bg-gray-100 flex flex-col overflow-hidden">
    <!-- Call Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Left side: Title and patient info -->
        <div class="flex items-center gap-4">
          <button 
            @click="goBack"
            class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Go back to appointments"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Telehealth Consultation</h1>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    v-if="appointment?.ownerAvatar" 
                    :src="appointment.ownerAvatar" 
                    class="w-full h-full object-cover"
                    alt=""
                  />
                  <svg v-else class="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                {{ appointment?.ownerName || 'Patient' }}
              </span>
              <span class="text-gray-400">•</span>
              <span>{{ appointment?.petName || 'Pet' }}</span>
              <span class="text-gray-400">•</span>
              <span class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full" :class="{
                  'bg-green-500': connectionStatus === 'connected',
                  'bg-yellow-500': connectionStatus === 'connecting',
                  'bg-red-500': connectionStatus === 'disconnected'
                }"></div>
                {{ connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 
                   'Disconnected' }}
              </span>
              <span class="text-gray-400">•</span>
              <span class="text-blue-600 font-medium">{{ callDuration }}</span>
            </div>
          </div>
        </div>
        
        <!-- Right side: End Call button -->
        <button 
          @click="endCall"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M9 12l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 16l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
          </svg>
          End Call
        </button>
      </div>
    </div>
    
    <!-- Main Video Content -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4">
      <!-- Video Container -->
      <div class="flex-1 flex flex-col gap-4">
        <!-- Main Video Display -->
        <div class="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-2xl border-2 border-gray-700">
          <!-- Remote Video -->
          <video 
            ref="remoteVideoRef" 
            autoplay 
            playsinline 
            class="w-full h-full object-cover"
          ></video>
          
          <!-- Waiting Placeholder -->
          <div v-if="!remoteStreamActive" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-4">
            <div class="relative mb-6">
              <div class="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mx-auto">
                <img 
                  v-if="appointment?.ownerAvatar" 
                  :src="appointment.ownerAvatar" 
                  class="w-full h-full object-cover"
                  alt=""
                />
                <svg v-else class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div class="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-xl font-medium mb-2 text-center">Waiting for {{ appointment?.ownerName || 'patient' }} to join...</p>
            <p class="text-gray-400 text-center">The patient will appear here when they join the call</p>
          </div>
          
          <!-- Local Video (PiP) -->
          <div class="absolute top-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video 
              ref="localVideoRef" 
              autoplay 
              playsinline 
              muted 
              class="w-full h-full object-cover transform scale-x-[-1]"
            ></video>
          </div>
        </div>
        
        <!-- Call Controls -->
        <div class="flex justify-center mt-6 mb-4">
          <div class="flex items-center gap-4 bg-gray-900/95 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl border-2 border-white relative z-50">
            <!-- Status Indicator -->
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium border border-gray-600">
              {{ connectionStatus === 'connected' ? '🟢 Live' : 
                 connectionStatus === 'connecting' ? '🟡 Connecting...' : 
                 '🔴 Disconnected' }}
            </div>
            
            <!-- Mute/Unmute Button -->
            <button 
              @click="toggleMute" 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg',
                isMuted ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300'
              ]"
              title="Toggle Microphone"
            >
              <svg v-if="isMuted" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            </button>
            
            <!-- Video On/Off Button -->
            <button 
              @click="toggleVideo" 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg',
                isVideoOff ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300'
              ]"
              title="Toggle Camera"
            >
              <svg v-if="isVideoOff" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
            
            <!-- Chat Panel Toggle -->
            <button 
              @click="toggleChatPanel" 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg',
                showChatPanel ? 'bg-green-600 text-white ring-2 ring-green-300' : 'bg-gray-700 text-white hover:bg-gray-600 ring-2 ring-gray-500'
              ]"
              title="Toggle Chat Panel"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </button>
            
            <!-- Screen Share Button -->
            <button 
              @click="toggleScreenShare" 
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg',
                isScreenSharing ? 'bg-green-600 text-white ring-2 ring-green-300' : 'bg-gray-700 text-white hover:bg-gray-600 ring-2 ring-gray-500'
              ]"
              title="Toggle Screen Share"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </button>
            
            <!-- Recording Button (Optional) -->
            <button 
              @click="toggleRecording"
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg',
                isRecording ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-gray-700 text-white hover:bg-gray-600 ring-2 ring-gray-500'
              ]"
              title="Toggle Recording"
            >
              <svg v-if="isRecording" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 00-2 2v8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Chat Panel -->
      <div v-if="showChatPanel" class="lg:w-80 bg-white rounded-xl shadow-lg flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Chat</h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatMessagesRef">
          <div 
            v-for="message in chatMessages" 
            :key="message.id"
            :class="[
              'max-w-[85%]',
              message.sender === 'user' ? 'mr-auto' : 'ml-auto'
            ]"
          >
            <div 
              :class="[
                'px-4 py-2 rounded-full',
                message.sender === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
              ]"
            >
              {{ message.text }}
            </div>
            <div 
              :class="[
                'text-xs mt-1 flex items-center',
                message.sender === 'user' ? 'text-left text-gray-500' : 'text-right text-gray-500'
              ]"
            >
              <span>{{ message.sender === 'user' ? message.senderName || 'Patient' : 'You' }}</span>
              <span class="mx-1">•</span>
              <span>{{ formatTime(message.timestamp) }}</span>
            </div>
          </div>
        </div>
        
        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              placeholder="Type a message..."
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              @click="sendMessage" 
              class="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Initializing Video Call</h3>
        <p class="text-sm text-gray-600">Setting up your consultation...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authStore'
import WebRTCService from '@/services/webrtc-service'
import { db } from '@shared/firebase'
import { doc, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State variables
const isLoading = ref(true)
const appointment = ref(null)
const localVideoRef = ref(null)
const remoteVideoRef = ref(null)
const localStream = ref(null)
const remoteStream = ref(null)
const isMuted = ref(false)
const isVideoOff = ref(false)
const isScreenSharing = ref(false)
const remoteStreamActive = ref(false)
const showChatPanel = ref(false)
const chatMessages = ref([])
const newMessage = ref('')
const chatMessagesRef = ref(null)
const connectionStatus = ref('connecting')
const isRecording = ref(false)
const callStartTime = ref(null)
const callDuration = ref('00:00')



// Chat subscription
let chatMessagesUnsubscribe = null

// Initialize the video call
const initializeVideoCall = async () => {
  try {
    isLoading.value = true
    
    // Get appointment data from route or sessionStorage
    if (route.query.appointmentId && route.query.mode === 'consultation') {
      let appointmentData = null
      
      if (route.query.iceConfig) {
        // Decode ICE config from URL
        const iceConfig = JSON.parse(atob(route.query.iceConfig))
        
        // Get appointment data from sessionStorage
        const storedAppointment = sessionStorage.getItem('telehealth_appointment')
        
        if (storedAppointment) {
          appointmentData = JSON.parse(storedAppointment)
          appointmentData.iceConfig = iceConfig
        }
      }
      
      if (appointmentData) {
        appointment.value = appointmentData
        await startVideoCall(appointmentData)
      } else {
        throw new Error('No appointment data found')
      }
    } else {
      throw new Error('Invalid route parameters')
    }
  } catch (error) {
    console.error('Error initializing video call:', error)
    alert('Failed to initialize video call. Please try again.')
    goBack()
  } finally {
    isLoading.value = false
  }
}

// Start the video call
const startVideoCall = async (appointmentData) => {
  try {
    // Start call timer
    callStartTime.value = new Date()
    startCallTimer()
    
    // Initialize local video stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      localStream.value = stream
      
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error)
      // Continue without local stream
    }

    // Start WebRTC call if we have ICE config
    if (appointmentData.iceConfig) {
      try {
        const streams = await WebRTCService.startCall(
          appointmentData.id, 
          authStore.user.userId, 
          appointmentData.userId,
          localStream.value,
          (stream) => {
            if (remoteVideoRef.value) {
              remoteVideoRef.value.srcObject = stream
              remoteStreamActive.value = true
            }
          }
        )
        
        if (remoteVideoRef.value && streams.remoteStream) {
          remoteVideoRef.value.srcObject = streams.remoteStream
          remoteStream.value = streams.remoteStream
          
          if (streams.remoteStream.getTracks().length > 0) {
            remoteStreamActive.value = true
            connectionStatus.value = 'connected'
          }
          
          streams.remoteStream.onaddtrack = () => {
            remoteStreamActive.value = true
            connectionStatus.value = 'connected'
          }
        }
      } catch (error) {
        console.error('Error starting WebRTC call:', error)
      }
    }
    
    // Subscribe to chat messages
    subscribeToChatMessages(appointmentData.id)
    
  } catch (error) {
    console.error('Error starting video call:', error)
  }
}

// Subscribe to chat messages
const subscribeToChatMessages = (callId) => {
  try {
    const messagesRef = collection(db, 'calls', callId, 'messages')
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'))
    
    chatMessagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        const timestamp = data.timestamp ? data.timestamp.toDate() : new Date()
        
        newMessages.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: timestamp,
          read: data.read
        })
      })
      
      chatMessages.value = newMessages
      
      // Scroll to bottom
      nextTick(() => {
        if (chatMessagesRef.value) {
          chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
        }
      })
    })
  } catch (error) {
    console.error('Error subscribing to chat messages:', error)
  }
}

// Send message
const sendMessage = async () => {
  if (newMessage.value.trim() === '' || !appointment.value) return

  try {
    const messagesRef = collection(db, 'calls', appointment.value.id, 'messages')
    
    await addDoc(messagesRef, {
      text: newMessage.value,
      sender: 'vet',
      senderId: authStore.user.userId,
      senderName: authStore.user.displayName || 'Doctor',
      timestamp: serverTimestamp(),
      read: false
    })
    
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

// Video control functions
const toggleMute = () => {
  isMuted.value = !isMuted.value
  WebRTCService.toggleMute(isMuted.value)
}

const toggleVideo = () => {
  isVideoOff.value = !isVideoOff.value
  WebRTCService.toggleVideo(isVideoOff.value)
}

const toggleChatPanel = () => {
  showChatPanel.value = !showChatPanel.value
}

const toggleScreenShare = async () => {
  try {
    if (isScreenSharing.value) {
      localStream.value = await WebRTCService.toggleScreenShare(true)
      if (localVideoRef.value) {
        localVideoRef.value.srcObject = localStream.value
      }
      isScreenSharing.value = false
    } else {
      try {
        localStream.value = await WebRTCService.toggleScreenShare(false)
        if (localVideoRef.value) {
          localVideoRef.value.srcObject = localStream.value
        }
        isScreenSharing.value = true
      } catch (error) {
        console.error('Failed to start screen sharing:', error)
        isScreenSharing.value = false
      }
    }
  } catch (error) {
    console.error('Error toggling screen share:', error)
    isScreenSharing.value = false
  }
}

// Toggle recording (placeholder for future implementation)
const toggleRecording = () => {
  isRecording.value = !isRecording.value
  // TODO: Implement actual recording functionality
  console.log('Recording toggled:', isRecording.value)
}

// Call timer functionality
let callTimerInterval = null

const startCallTimer = () => {
  callTimerInterval = setInterval(() => {
    if (callStartTime.value) {
      const now = new Date()
      const diff = now - callStartTime.value
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      callDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }, 1000)
}

const stopCallTimer = () => {
  if (callTimerInterval) {
    clearInterval(callTimerInterval)
    callTimerInterval = null
  }
}

// End call
const endCall = async () => {
  try {
    console.log('=== ENDING CALL ===')
    
    // Stop call timer
    stopCallTimer()
    
    // Clean up WebRTC
    WebRTCService.hangUp()
    
    // Clean up local stream
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }
    
    // Clean up chat subscription
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe()
      chatMessagesUnsubscribe = null
    }
    
    // Update appointment status to 'completed' or 'paused' instead of clearing completely
    if (appointment.value) {
      try {
        // Store appointment data for potential rejoin (but mark as ended)
        const endedAppointment = {
          ...appointment.value,
          callEnded: true,
          endTime: new Date(),
          canRejoin: true // Allow rejoining within time window
        }
        
        // Store ended appointment data (for potential rejoin)
        sessionStorage.setItem('telehealth_appointment_ended', JSON.stringify(endedAppointment))
        
        // Keep ICE config for potential rejoin
        const iceConfig = sessionStorage.getItem('telehealth_ice_config')
        if (iceConfig) {
          sessionStorage.setItem('telehealth_ice_config_ended', iceConfig)
        }
        
        console.log('Call ended, appointment data preserved for potential rejoin')
      } catch (error) {
        console.error('Error preserving appointment data:', error)
      }
    }
    
    // Clear current session data
    sessionStorage.removeItem('telehealth_appointment')
    sessionStorage.removeItem('telehealth_ice_config')
    
    // Go back to appointments
    goBack()
    
  } catch (error) {
    console.error('Error ending call:', error)
    // Force cleanup and go back
    goBack()
  }
}

// Go back to appointments
const goBack = () => {
  // Go back to the vet queue instead of telehealth appointments
  router.push('/vet/queue')
}

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Error formatting time:', error)
    return ''
  }
}

// Lifecycle
onMounted(() => {
  // Add a small delay to ensure DOM is ready
  nextTick(() => {
    initializeVideoCall()
  })
})

onUnmounted(() => {
  // Clean up
  if (chatMessagesUnsubscribe) {
    chatMessagesUnsubscribe()
  }
  
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop())
  }
  
  // Stop call timer
  stopCallTimer()
  
  WebRTCService.hangUp()
})
</script>

<style scoped>
/* Ensure video controls are visible and properly positioned */
.video-container {
  position: relative;
  z-index: 1;
}

/* Enhanced button hover effects */
button:hover {
  transform: scale(1.05);
  transition: all 0.2s ease-in-out;
}

/* Ensure controls are above video content */
.relative.z-50 {
  position: relative;
  z-index: 50;
}

/* Video element styling */
video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Local video PiP styling */
.local-video-pip {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 25%;
  aspect-ratio: 16/9;
  background: #1f2937;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
}
</style>

