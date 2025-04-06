<template>
  <div class="telehealth-container">
    <!-- Session List View -->
    <div v-if="!activeSession" class="sessions-list">
      <h1 class="text-2xl font-bold mb-4">My Telehealth Sessions</h1>
      
      <div class="filter-controls mb-4">
        <select v-model="statusFilter" class="form-select mr-2">
          <option value="all">All Sessions</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button @click="refreshSessions" class="btn btn-primary">
          <RefreshCwIcon class="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
      
      <div v-if="loading" class="text-center py-4">
        <div class="spinner"></div>
        <p>Loading sessions...</p>
      </div>
      
      <div v-else-if="filteredSessions.length === 0" class="empty-state">
        <p>No telehealth sessions found.</p>
      </div>
      
      <div v-else class="sessions-grid">
        <div 
          v-for="session in filteredSessions" 
          :key="session.id" 
          class="session-card"
          @click="selectSession(session)"
        >
          <div class="card-header">
            <span :class="['status-badge', `status-${session.status}`]">
              {{ session.status }}
            </span>
            <h3 class="session-title">{{ session.title }}</h3>
          </div>
          
          <div class="card-body">
            <p><strong>Veterinarian:</strong> {{ session.doctorName }}</p>
            <p><strong>Pet:</strong> {{ session.petName }} ({{ session.petType }})</p>
            <p><strong>Scheduled:</strong> {{ formatDate(session.scheduledTime) }}</p>
          </div>
          
          <div class="card-footer">
            <button 
              v-if="session.status === 'scheduled' && isSessionJoinable(session)" 
              class="btn btn-success"
              @click.stop="joinSession(session)"
            >
              <PhoneIcon class="w-4 h-4 mr-2" />
              Join Call
            </button>
            <button 
              v-else-if="session.status === 'scheduled'" 
              class="btn btn-secondary" 
              disabled
            >
              Not Yet Available
            </button>
            <button 
              v-if="session.status === 'scheduled'" 
              class="btn btn-danger ml-2"
              @click.stop="cancelSession(session)"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Session View -->
    <div v-else class="active-session">
      <div class="session-header">
        <h2>{{ activeSession.title }}</h2>
        <div class="vet-info">
          <span><strong>Veterinarian:</strong> {{ activeSession.doctorName }}</span>
          <span><strong>Pet:</strong> {{ activeSession.petName }} ({{ activeSession.petType }})</span>
        </div>
        <div class="call-status" v-if="callStatus">
          <span :class="['status-indicator', callStatus === 'connected' ? 'connected' : 'connecting']"></span>
          {{ callStatus === 'connected' ? 'Connected' : 'Connecting...' }}
        </div>
        <button @click="endCall" class="btn btn-danger">
          <PhoneOffIcon class="w-5 h-5 mr-2" />
          End Call
        </button>
      </div>
      
      <div class="video-container" :class="{ 'remote-active': remoteStreamActive }">
        <div class="remote-video">
          <video ref="remoteVideoRef" autoplay playsinline></video>
          <div v-if="!remoteStreamActive" class="video-placeholder">
            <div class="waiting-animation">
              <div class="pulse-ring"></div>
              <UserIcon class="w-12 h-12 text-white" />
            </div>
            <p>Waiting for veterinarian to join...</p>
            <p class="text-sm text-gray-400 mt-2">
              Your veterinarian will appear here when they join
            </p>
          </div>
        </div>
        
        <div class="local-video" :class="{ 'pip-mode': remoteStreamActive }">
          <video ref="localVideoRef" autoplay playsinline muted></video>
          <div class="call-controls">
            <button @click="toggleMute" :class="['btn', isMuted ? 'btn-secondary' : 'btn-primary']">
              <MicOffIcon v-if="isMuted" class="w-5 h-5" />
              <MicIcon v-else class="w-5 h-5" />
            </button>
            <button @click="toggleVideo" :class="['btn', isVideoOff ? 'btn-secondary' : 'btn-primary']">
              <VideoOffIcon v-if="isVideoOff" class="w-5 h-5" />
              <VideoIcon v-else class="w-5 h-5" />
            </button>
            <button @click="toggleScreenShare" :class="['btn', isScreenSharing ? 'btn-success' : 'btn-primary']">
              <MonitorIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div class="session-tools">
        <div class="pet-info-section">
          <h3>Pet Information</h3>
          <div class="pet-details">
            <p><strong>Name:</strong> {{ activeSession.petName }}</p>
            <p><strong>Type:</strong> {{ activeSession.petType }}</p>
            <p><strong>Reason for Visit:</strong> {{ activeSession.title }}</p>
          </div>
        </div>
        
        <div class="chat-section">
          <h3>Chat</h3>
          <div class="chat-messages" ref="chatMessagesRef">
            <div 
              v-for="(message, index) in chatMessages" 
              :key="index"
              :class="['message', message.sender === 'patient' ? 'sent' : 'received']"
            >
              <div class="message-content">
                {{ message.text }}
              </div>
              <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>
          
          <div class="chat-input">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              placeholder="Type a message..."
              class="form-control"
            />
            <button @click="sendMessage" class="btn btn-primary">
              <SendIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Incoming Call Notification -->
    <div v-if="incomingCall" class="incoming-call-notification">
      <div class="notification-content">
        <h3>Incoming Call</h3>
        <p>{{ incomingCall.callerName }} is calling you</p>
        <p class="session-title">{{ incomingCall.sessionTitle }}</p>
        <div class="notification-buttons">
          <button @click="acceptIncomingCall" class="btn btn-success">
            <PhoneIcon class="w-4 h-4 mr-2" />
            Accept
          </button>
          <button @click="declineIncomingCall" class="btn btn-danger">
            <PhoneOffIcon class="w-4 h-4 mr-2" />
            Decline
          </button>
        </div>
      </div>
    </div>

    <!-- Network Status Alert -->
    <div v-if="!isOnline" class="network-status-alert">
      <AlertTriangleIcon class="w-5 h-5 mr-2" />
      You are currently offline. Some features may not work properly.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { 
  RefreshCwIcon,
  PhoneIcon,
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  SendIcon,
  UserIcon,
  MonitorIcon,
  AlertTriangleIcon
} from 'lucide-vue-next';

// Create a WebRTC service class
class WebRTCService {
  constructor(options) {
    // Initialize all required properties to avoid TypeError
    this.localVideoRef = options.localVideoRef || null;
    this.remoteVideoRef = options.remoteVideoRef || null;
    this.sessionId = options.sessionId || null;
    this.userId = options.userId || null;
    this.userType = options.userType || 'patient';
    this.onRemoteStreamActive = options.onRemoteStreamActive || (() => {});
    this.onRemoteStreamInactive = options.onRemoteStreamInactive || (() => {});
    this.onIncomingCall = options.onIncomingCall || (() => {});
    this.existingStream = options.existingStream || null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.screenSharingStream = null;
    this.isInitialized = false;
    this.connectionTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize() {
    console.log('Initializing WebRTC service for patient');
    
    try {
      // Set up local stream
      if (this.existingStream) {
        this.localStream = this.existingStream;
      } else {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
        } catch (error) {
          console.error('Error getting user media:', error);
          throw error;
        }
      }

      // Attach local stream to video element
      if (this.localVideoRef && this.localStream) {
        this.localVideoRef.srcObject = this.localStream;
        try {
          await this.localVideoRef.play();
        } catch (e) {
          console.warn('Auto-play prevented for local video:', e);
          // Add a play button or other UI to handle this case
        }
      }

      // In a real implementation, we would set up WebRTC peer connections here
      // For now, we'll simulate a remote stream after a delay
      setTimeout(() => {
        this.simulateRemoteStream();
      }, 2000);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error in WebRTC initialization:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async simulateRemoteStream() {
    try {
      // Create a simulated remote stream (in a real app, this would come from the peer)
      const simulatedStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      this.remoteStream = simulatedStream;
      
      // Store the remote stream but don't automatically display it
      // The stream will only be attached to the video element when the other party joins
      console.log('Remote stream is ready but waiting for vet to join');
      
      // Set a timeout to check connection status
      this.connectionTimeout = setTimeout(() => {
        this.checkConnectionStatus();
      }, 10000);
      
    } catch (error) {
      console.error('Error simulating remote stream:', error);
      this.onRemoteStreamInactive();
      this.handleReconnect();
    }
  }

  checkConnectionStatus() {
    // In a real implementation, this would check the WebRTC connection state
    // For now, we'll just check if we have a remote stream
    if (!this.remoteStream) {
      console.warn('No remote stream after timeout, attempting to reconnect');
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        this.simulateRemoteStream();
      }, 2000 * this.reconnectAttempts); // Increasing backoff
    } else {
      console.error('Max reconnect attempts reached');
      // Notify the application that we couldn't establish a connection
      this.onRemoteStreamInactive();
    }
  }

  async displayRemoteStream() {
    if (this.remoteVideoRef && this.remoteStream) {
      try {
        this.remoteVideoRef.srcObject = this.remoteStream;
        await this.remoteVideoRef.play();
        // Notify that remote stream is active
        this.onRemoteStreamActive();
        
        // Clear any pending connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        return true;
      } catch (e) {
        console.warn('Auto-play prevented for remote video:', e);
        return false;
      }
    }
    return false;
  }

  toggleAudio(mute) {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !mute;
      });
      return true;
    }
    return false;
  }

  toggleVideo(turnOff) {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !turnOff;
      });
      return true;
    }
    return false;
  }

  async startScreenSharing() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true 
      });
      
      // Replace video track with screen sharing track
      if (this.localStream && this.localVideoRef) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peerConnection?.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        // Update local video display
        const newStream = new MediaStream([
          videoTrack,
          ...this.localStream.getAudioTracks()
        ]);
        
        this.localVideoRef.srcObject = newStream;
        this.screenSharingStream = screenStream;
        
        // Add event listener for when screen sharing stops
        videoTrack.addEventListener('ended', () => {
          this.stopScreenSharing();
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting screen sharing:', error);
      return false;
    }
  }

  async stopScreenSharing() {
    if (this.screenSharingStream) {
      this.screenSharingStream.getTracks().forEach(track => track.stop());
      
      // Restore camera video
      if (this.localStream && this.localVideoRef) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        const sender = this.peerConnection?.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
        
        this.localVideoRef.srcObject = this.localStream;
      }
      
      this.screenSharingStream = null;
      return true;
    }
    return false;
  }

  async disconnect() {
    // Clear any pending timeouts
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
    }
    
    if (this.screenSharingStream) {
      this.screenSharingStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    // Clear video elements
    if (this.localVideoRef) {
      this.localVideoRef.srcObject = null;
    }
    
    if (this.remoteVideoRef) {
      this.remoteVideoRef.srcObject = null;
    }
    
    this.onRemoteStreamInactive();
    this.isInitialized = false;
    this.reconnectAttempts = 0;
  }

  declineCall(sessionId) {
    // In a real implementation, this would notify the caller that the call was declined
    console.log(`Declining call for session ${sessionId}`);
    return Promise.resolve();
  }
}

// Firebase setup
const db = getFirestore();
const auth = getAuth();
const router = useRouter();

// State variables
const loading = ref(true);
const sessions = ref([]);
const statusFilter = ref('all');
const activeSession = ref(null);
const chatMessages = ref([]);
const newMessage = ref('');
const chatMessagesRef = ref(null);
const incomingCall = ref(null);

// WebRTC state
const localVideoRef = ref(null);
const remoteVideoRef = ref(null);
const isMuted = ref(false);
const isVideoOff = ref(false);
const isScreenSharing = ref(false);
const remoteStreamActive = ref(false);
const callStatus = ref('');

// Network status monitoring
const isOnline = ref(navigator.onLine);
let networkStatusInterval = null;

// WebRTC service instance
let webRTCService = null;
let unsubscribeMessages = null;
let unsubscribeSession = null;
let localStream = null;

// Remote stream check interval
let remoteStreamCheckInterval = null;

// Computed properties
const filteredSessions = computed(() => {
  if (statusFilter.value === 'all') {
    return sessions.value;
  }
  return sessions.value.filter(session => session.status === statusFilter.value);
});

// Network status monitoring
const setupNetworkMonitoring = () => {
  // Listen for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Also check periodically
  networkStatusInterval = setInterval(() => {
    const currentStatus = navigator.onLine;
    if (isOnline.value !== currentStatus) {
      isOnline.value = currentStatus;
      if (currentStatus) {
        handleOnline();
      } else {
        handleOffline();
      }
    }
  }, 5000);
};

const handleOnline = () => {
  console.log('Network connection restored');
  isOnline.value = true;
  
  // Refresh data if we're in a session
  if (activeSession.value) {
    refreshSessionData(activeSession.value.id);
  }
};

const handleOffline = () => {
  console.log('Network connection lost');
  isOnline.value = false;
  // No need to show notification as we have a persistent banner
};

const refreshSessionData = async (sessionId) => {
  try {
    // Re-subscribe to session updates
    if (unsubscribeSession) {
      unsubscribeSession();
    }
    
    unsubscribeSession = onSnapshot(
      doc(db, 'telehealth_sessions', sessionId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          activeSession.value = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          };
          
          // Check if vet has joined
          const data = docSnapshot.data();
          if (data.vetJoinedAt && !remoteStreamActive.value) {
            // Vet has joined, display their stream
            if (webRTCService && webRTCService.remoteStream) {
              webRTCService.displayRemoteStream();
            } else {
              // Still connecting
              callStatus.value = 'connecting';
            }
          }
        }
      },
      (error) => {
        console.error('Error in session snapshot:', error);
        // Handle error gracefully
        if (!isOnline.value) {
          console.log('Network appears to be offline, will retry when connection is restored');
        }
      }
    );
    
    // Re-subscribe to chat messages
    if (unsubscribeMessages) {
      unsubscribeMessages();
    }
    
    unsubscribeMessages = onSnapshot(
      query(
        collection(db, 'telehealth_sessions', sessionId, 'messages'),
        orderBy('timestamp', 'asc')
      ),
      (querySnapshot) => {
        chatMessages.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Scroll to bottom of chat
        setTimeout(() => {
          if (chatMessagesRef.value) {
            chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
          }
        }, 100);
      },
      (error) => {
        console.error('Error in messages snapshot:', error);
        // Handle error gracefully
        if (!isOnline.value) {
          console.log('Network appears to be offline, will retry when connection is restored');
        }
      }
    );
  } catch (error) {
    console.error('Error refreshing session data:', error);
  }
};

// Methods
const refreshSessions = async () => {
  loading.value = true;
  try {
    if (!isOnline.value) {
      // Don't attempt to fetch if offline
      loading.value = false;
      return;
    }
    
    const patientId = auth.currentUser?.uid || 'test-patient-id'; // Fallback for testing
    
    const q = query(
      collection(db, 'telehealth_sessions'),
      where('patientId', '==', patientId)
    );
    
    const querySnapshot = await getDocs(q);
    sessions.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const isSessionJoinable = (session) => {
  if (!session.scheduledTime) return false;
  
  const scheduledTime = session.scheduledTime.toDate ? 
    session.scheduledTime.toDate() : new Date(session.scheduledTime);
  
  const now = new Date();
  const timeDiff = Math.abs(now - scheduledTime);
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  
  // Allow joining 15 minutes before and up to 30 minutes after scheduled time
  return minutesDiff <= 30;
};

const selectSession = (session) => {
  // Just view session details, don't join call yet
  activeSession.value = session;
};

const joinSession = async (session) => {
  try {
    if (!isOnline.value) {
      alert('You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    // Request camera and microphone access
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert(`Camera access error: ${error.message || 'Unknown error'}`);
      return;
    }
    
    // Update session status to 'in-progress' if it's not already
    if (session.status === 'scheduled') {
      await updateDoc(doc(db, 'telehealth_sessions', session.id), {
        status: 'in-progress',
        patientJoinedAt: serverTimestamp()
      });
    }
    
    activeSession.value = session;
    callStatus.value = 'connecting';
    
    // Subscribe to session updates
    refreshSessionData(session.id);
    
    // Initialize WebRTC
    await initializeWebRTC(session.id, localStream);
    
    // Start checking for remote stream
    startRemoteStreamCheck();
  } catch (error) {
    console.error('Error joining session:', error);
    alert(`Failed to join session: ${error.message || 'Unknown error'}`);
  }
};

const startRemoteStreamCheck = () => {
  // Clear any existing interval
  if (remoteStreamCheckInterval) {
    clearInterval(remoteStreamCheckInterval);
    remoteStreamCheckInterval = null;
  }
  
  // Check immediately
  checkRemoteVideoStatus();
  
  // Then check every second
  remoteStreamCheckInterval = setInterval(() => {
    const isActive = checkRemoteVideoStatus();
    
    // If we've detected the stream is active, we can stop checking
    if (isActive) {
      clearInterval(remoteStreamCheckInterval);
      remoteStreamCheckInterval = null;
    }
  }, 1000);
};

// Check if remote video has tracks and is playing
const checkRemoteVideoStatus = () => {
  const remoteVideo = remoteVideoRef.value;
  
  if (remoteVideo && remoteVideo.srcObject) {
    const videoTracks = remoteVideo.srcObject.getVideoTracks();
    const audioTracks = remoteVideo.srcObject.getAudioTracks();
    
    // Check if we have video or audio tracks and they're active
    if ((videoTracks.length > 0 && videoTracks[0].enabled) || 
        (audioTracks.length > 0 && audioTracks[0].enabled)) {
      remoteStreamActive.value = true;
      callStatus.value = 'connected';
      return true;
    }
    
    // If we have tracks but they're not active yet
    if (videoTracks.length > 0 || audioTracks.length > 0) {
      callStatus.value = 'connecting';
    }
  }
  
  return false;
};

const cancelSession = async (session) => {
  if (!confirm('Are you sure you want to cancel this session?')) return;
  
  try {
    if (!isOnline.value) {
      alert('You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    await updateDoc(doc(db, 'telehealth_sessions', session.id), {
      status: 'cancelled',
      cancelledBy: 'patient',
      cancelledAt: serverTimestamp()
    });
    
    refreshSessions();
  } catch (error) {
    console.error('Error cancelling session:', error);
    alert('Failed to cancel session. Please try again.');
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeSession.value) return;
  
  try {
    if (!isOnline.value) {
      alert('You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    await addDoc(
      collection(db, 'telehealth_sessions', activeSession.value.id, 'messages'),
      {
        text: newMessage.value.trim(),
        sender: 'patient',
        senderName: auth.currentUser?.displayName || 'Patient',
        timestamp: serverTimestamp()
      }
    );
    
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
};

const initializeWebRTC = async (sessionId, existingStream = null) => {
  try {
    // Make sure we have video elements before initializing
    if (!localVideoRef.value || !remoteVideoRef.value) {
      console.error('Video elements not found');
      await nextTick();
      
      // Check again after nextTick
      if (!localVideoRef.value || !remoteVideoRef.value) {
        throw new Error('Video elements not available after DOM update');
      }
    }
    
    // Initialize WebRTC service
    webRTCService = new WebRTCService({
      localVideoRef: localVideoRef.value,
      remoteVideoRef: remoteVideoRef.value,
      sessionId,
      userId: auth.currentUser?.uid || 'test-patient-id',
      userType: 'patient',
      onRemoteStreamActive: () => {
        remoteStreamActive.value = true;
        callStatus.value = 'connected';
      },
      onRemoteStreamInactive: () => {
        remoteStreamActive.value = false;
        callStatus.value = 'connecting';
      },
      onIncomingCall: (callData) => {
        incomingCall.value = {
          sessionId: callData.sessionId,
          callerName: callData.callerName || 'Veterinarian',
          sessionTitle: callData.sessionTitle || 'Telehealth Session'
        };
      },
      existingStream // Pass the existing stream if available
    });
    
    await webRTCService.initialize();
    
    // Manually attach local stream to video element if WebRTCService doesn't do it
    if (existingStream && localVideoRef.value) {
      localVideoRef.value.srcObject = existingStream;
      try {
        await localVideoRef.value.play();
      } catch (e) {
        console.warn('Auto-play prevented for local video:', e);
      }
    }
    
    // Manually check remote video status after initialization
    setTimeout(() => {
      checkRemoteVideoStatus();
    }, 1000);
  } catch (error) {
    console.error('Error initializing WebRTC:', error);
    alert('Failed to initialize video call. Please try again.');
  }
};

const acceptIncomingCall = async () => {
  if (!incomingCall.value) return;
  
  try {
    if (!isOnline.value) {
      alert('You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    // Find the session
    const sessionId = incomingCall.value.sessionId;
    const docSnap = await getDoc(doc(db, 'telehealth_sessions', sessionId));
    
    if (docSnap.exists()) {
      const session = {
        id: docSnap.id,
        ...docSnap.data()
      };
      
      // Join the session
      await joinSession(session);
      
      // Clear the incoming call
      incomingCall.value = null;
    }
  } catch (error) {
    console.error('Error accepting call:', error);
    alert(`Error accepting call: ${error.message || 'Unknown error'}`);
  }
};

const declineIncomingCall = async () => {
  if (!incomingCall.value) return;
  
  try {
    // Notify the caller that the call was declined
    if (webRTCService) {
      await webRTCService.declineCall(incomingCall.value.sessionId);
    }
    
    // Clear the incoming call
    incomingCall.value = null;
  } catch (error) {
    console.error('Error declining call:', error);
    alert(`Error declining call: ${error.message || 'Unknown error'}`);
  }
};

const toggleMute = () => {
  if (!webRTCService) return;
  
  isMuted.value = !isMuted.value;
  webRTCService.toggleAudio(isMuted.value);
};

const toggleVideo = () => {
  if (!webRTCService) return;
  
  isVideoOff.value = !isVideoOff.value;
  webRTCService.toggleVideo(isVideoOff.value);
};

const toggleScreenShare = async () => {
  if (!webRTCService) return;
  
  try {
    if (isScreenSharing.value) {
      await webRTCService.stopScreenSharing();
    } else {
      await webRTCService.startScreenSharing();
    }
    
    isScreenSharing.value = !isScreenSharing.value;
  } catch (error) {
    console.error('Error toggling screen share:', error);
    
    if (error.name === 'NotAllowedError') {
      alert('Screen sharing permission was denied.');
    } else {
      alert('Failed to share screen. Please try again.');
    }
  }
};

const endCall = async () => {
  try {
    // Clear remote stream check interval if it exists
    if (remoteStreamCheckInterval) {
      clearInterval(remoteStreamCheckInterval);
      remoteStreamCheckInterval = null;
    }
    
    if (webRTCService) {
      await webRTCService.disconnect();
    }
    
    // Clean up local stream if it exists
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    
    if (activeSession.value && isOnline.value) {
      await updateDoc(doc(db, 'telehealth_sessions', activeSession.value.id), {
        status: 'completed',
        endedAt: serverTimestamp()
      });
    }
    
    // Clean up subscriptions
    if (unsubscribeMessages) {
      unsubscribeMessages();
    }
    
    if (unsubscribeSession) {
      unsubscribeSession();
    }
    
    activeSession.value = null;
    remoteStreamActive.value = false;
    callStatus.value = '';
    refreshSessions();
  } catch (error) {
    console.error('Error ending call:', error);
    alert('Failed to end call properly. Please refresh the page.');
  }
};

// Lifecycle hooks
onMounted(() => {
  // Set up network monitoring
  setupNetworkMonitoring();
  
  // Load sessions
  refreshSessions();
  
  // Set up chat messages ref
  watch(chatMessages, () => {
    setTimeout(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
      }
    }, 100);
  });
});

onUnmounted(() => {
  // Clean up WebRTC
  if (webRTCService) {
    webRTCService.disconnect();
  }
  
  // Clean up local stream if it exists
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  // Clear any intervals
  if (remoteStreamCheckInterval) {
    clearInterval(remoteStreamCheckInterval);
    remoteStreamCheckInterval = null;
  }
  
  if (networkStatusInterval) {
    clearInterval(networkStatusInterval);
    networkStatusInterval = null;
  }
  
  // Remove network event listeners
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  
  // Clean up subscriptions
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
  
  if (unsubscribeSession) {
    unsubscribeSession();
  }
});
</script>

<style scoped>
.telehealth-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.sessions-list h1 {
  margin-bottom: 20px;
}

.filter-controls {
  display: flex;
  margin-bottom: 20px;
}

.form-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #4a6cf7;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4a6cf7;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.session-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  background-color: white;
}

.session-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-scheduled {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.status-in-progress {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.status-completed {
  background-color: #eeeeee;
  color: #424242;
}

.status-cancelled {
  background-color: #ffebee;
  color: #b71c1c;
}

.session-title {
  font-size: 18px;
  font-weight: 600;
  margin-right: 80px;
}

.card-body {
  padding: 15px;
}

.card-body p {
  margin-bottom: 8px;
}

.card-footer {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
}

/* Active Session Styles */
.active-session {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.session-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.vet-info {
  display: flex;
  gap: 20px;
}

.call-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-indicator.connecting {
  background-color: #ffc107;
  animation: pulse 1.5s infinite;
}

.status-indicator.connected {
  background-color: #28a745;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.video-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 20px;
  background-color: #1a1a1a;
  transition: all 0.3s ease;
  position: relative;
}

/* When remote stream is active, adjust the layout */
.video-container.remote-active {
  grid-template-columns: 3fr 1fr;
}

.remote-video {
  position: relative;
  width: 100%;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.remote-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.7);
}

.waiting-animation {
  position: relative;
  margin-bottom: 20px;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

.local-video {
  position: relative;
  width: 100%;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  transition: all 0.3s ease;
}

/* Picture-in-picture mode when remote stream is active */
.local-video.pip-mode {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 25%;
  max-width: 200px;
  aspect-ratio: 3 / 4;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.local-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.call-controls {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.session-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.pet-info-section, .chat-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.pet-info-section h3, .chat-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.pet-details {
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  flex-grow: 1;
}

.pet-details p {
  margin-bottom: 10px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: inherit;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 5px;
}

.message {
  margin-bottom: 10px;
  max-width: 80%;
}

.message.sent {
  margin-left: auto;
}

.message-content {
  padding: 10px;
  border-radius: 8px;
  word-break: break-word;
}

.sent .message-content {
  background-color: #e3f2fd;
}

.received .message-content {
  background-color: #f1f1f1;
}

.message-time {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  text-align: right;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex-grow: 1;
}

/* Incoming Call Notification */
.incoming-call-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.notification-content {
  padding: 16px;
}

.notification-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.notification-content p {
  margin-bottom: 8px;
}

.notification-content .session-title {
  font-weight: 500;
  color: #4a6cf7;
  margin-bottom: 16px;
}

.notification-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

/* Network Status Alert */
.network-status-alert {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .video-container {
    grid-template-columns: 1fr;
  }
  
  .video-container.remote-active {
    grid-template-columns: 1fr;
  }
  
  .local-video.pip-mode {
    width: 35%;
  }
  
  .session-tools {
    grid-template-columns: 1fr;
  }
  
  .session-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .vet-info {
    margin: 10px 0;
    flex-direction: column;
    gap: 5px;
  }
}
</style>


