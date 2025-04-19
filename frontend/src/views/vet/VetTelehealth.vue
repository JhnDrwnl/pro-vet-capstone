<template>
  <div class="telehealth-container">
    <!-- Carousel View (New) -->
    <div v-if="currentView === 'carousel'" class="min-h-screen bg-white rounded-2xl">
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Column -->
          <div class="space-y-8 flex flex-col justify-center h-full">
            <div class="space-y-4 mt-auto">
              <h1 class="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
                {{ slides[currentSlide].title }}
              </h1>
              <p class="text-xl text-gray-600">
                {{ slides[currentSlide].subtitle }}
              </p>
            </div>
  
            <!-- Meeting Controls -->
            <div class="space-y-4 mb-auto">
              <div class="flex flex-col sm:flex-row gap-4">
                <button 
                  @click="currentView = 'sessions'"
                  class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <VideoIcon class="w-5 h-5 mr-2" />
                  Sessions
                </button>
                <button 
                  @click="scheduleMeeting"
                  class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CalendarIcon class="w-5 h-5 mr-2" />
                  Add new meeting
                </button>
              </div>
              <a href="#" class="inline-flex text-blue-600 hover:underline">
                Learn more about Telehealth
              </a>
            </div>
          </div>
  
          <!-- Right Column -->
          <div class="relative">
            <!-- Navigation Arrows -->
            <button 
              @click="previousSlide" 
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-20"
            >
              <ChevronLeftIcon class="w-6 h-6 text-gray-600" />
            </button>
            <button 
              @click="nextSlide"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-20"
            >
              <ChevronRightIcon class="w-6 h-6 text-gray-600" />
            </button>
  
            <!-- Main Illustration -->
            <div class="relative aspect-square max-w-md mx-auto">
              <div class="absolute inset-0 bg-blue-70 rounded-full overflow-hidden">
                <TransitionGroup name="slide">
                  <div 
                    v-for="(slide, index) in slides" 
                    :key="slide.id"
                    v-show="currentSlide === index"
                    class="absolute inset-0 transition-all duration-300"
                  >
                    <div :id="`lottie-container-${index}`" class="w-full h-full"></div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
  
            <!-- Carousel Dots -->
            <div class="flex justify-center gap-2 mt-8">
              <button 
                v-for="(slide, index) in slides" 
                :key="slide.id"
                @click="goToSlide(index)"
                :class="[
                  'w-2 h-2 rounded-full transition-all',
                  currentSlide === index 
                    ? 'bg-blue-600 w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                ]"
                :aria-label="`Go to slide ${index + 1}`"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  
    <!-- Session List View -->
    <div v-else-if="currentView === 'sessions' && !activeSession" class="sessions-list">
      <div class="flex items-center mb-4">
        <button 
          @click="currentView = 'carousel'" 
          class="p-2 mr-4 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-2xl font-bold">
          {{ showingApprovedOnly ? 'Approved Telehealth Sessions' : 'My Telehealth Sessions' }}
        </h1>
      </div>
      
      <div class="filter-controls mb-4">
        <select v-model="statusFilter" class="form-select mr-2">
          <option value="all">All Sessions</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button @click="refreshSessions" class="btn btn-primary mr-2">
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
        <button @click="refreshSessions" class="btn btn-primary mt-4">
          <RefreshCwIcon class="w-4 h-4 mr-2" />
          Refresh Sessions
        </button>
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
            <h3 class="session-title">{{ session.title || (session.serviceNames && session.serviceNames[0]) || 'Telehealth Session' }}</h3>
          </div>
          
          <div class="card-body">
            <p><strong>Date:</strong> {{ formatDateOnly(session.date || session.scheduledTime) }}</p>
            <p><strong>Time:</strong> {{ session.time || formatTime(session.date || session.scheduledTime) }}</p>
            <p><strong>Doctor:</strong> {{ session.doctorName || 'Not assigned' }}</p>
            <p><strong>Pet:</strong> {{ session.petName || 'Not specified' }}</p>
            <p v-if="session.serviceNames && session.serviceNames.length > 0">
              <strong>Services:</strong> {{ session.serviceNames.join(', ') }}
            </p>
            <p><strong>Status:</strong> {{ session.status }}</p>
            <p><strong>User ID:</strong> {{ session.userId }}</p>
            <p><strong>Patient Name:</strong> {{ userFirstNames[session.userId] || 'Loading...' }}</p>
          </div>
          
          <div class="card-footer">
            <button 
              v-if="(session.status === 'scheduled' || session.status === 'approved') && isSessionJoinable(session)" 
              class="btn btn-success"
              @click.stop="joinSession(session)"
            >
              <PhoneIcon class="w-4 h-4 mr-2" />
              Join Call
            </button>
            <button 
              v-else-if="session.status === 'scheduled' || session.status === 'approved'" 
              class="btn btn-secondary" 
              disabled
            >
              Not Yet Available
            </button>
            <button 
              v-if="session.status === 'pending'" 
              class="btn btn-primary"
              @click.stop="approveSession(session)"
            >
              <CheckIcon class="w-4 h-4 mr-2" />
              Approve
            </button>
            <button 
              v-if="session.status === 'scheduled' || session.status === 'approved'" 
              class="btn btn-danger ml-2"
              @click.stop="cancelSession(session)"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Camera Permission Modal -->
    <div v-if="showCameraPermissionModal" class="camera-permission-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Camera Access Required</h3>
          <button @click="denyCameraAccess" class="close-button">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div v-if="cameraPermissionState === 'prompt'" class="modal-body">
          <div class="permission-prompt">
            <CameraIcon class="w-16 h-16 text-blue-500 mb-4" />
            <p>To join this call, we need permission to access your camera and microphone.</p>
            <p class="text-sm text-gray-500 mt-2">You'll see a browser notification asking for permission.</p>
            
            <div class="browser-permission-illustration">
              <div class="browser-permission-mockup">
                <div class="mockup-header">
                  <div class="mockup-url">example.com</div>
                </div>
                <div class="mockup-body">
                  <p>"Telehealth" would like to use your camera and microphone</p>
                  <div class="mockup-buttons">
                    <span>Block</span>
                    <span class="allow">Allow</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-buttons mt-6">
              <button @click="requestCameraPermission" class="btn btn-primary">
                <CameraIcon class="w-4 h-4 mr-2" />
                Continue to Call
              </button>
              <button @click="denyCameraAccess" class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
        
        <div v-else-if="cameraPermissionState === 'preview'" class="modal-body">
          <p class="mb-4">Your camera is ready! You can now join the call.</p>
          <div class="preview-container">
            <video ref="cameraPreviewRef" autoplay playsinline muted class="camera-preview"></video>
          </div>
          <div class="modal-buttons">
            <button @click="allowCameraAccess" class="btn btn-primary">
              <PhoneIcon class="w-4 h-4 mr-2" />
              Join Call
            </button>
            <button @click="denyCameraAccess" class="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
        
        <div v-else-if="cameraPermissionState === 'denied'" class="modal-body">
          <div class="permission-denied">
            <AlertCircleIcon class="w-16 h-16 text-red-500 mb-4" />
            <h4 class="text-lg font-semibold mb-2">Camera Access Denied</h4>
            <p>You need to allow camera access to join the call.</p>
            <p class="text-sm text-gray-500 mt-2">Please check your browser settings and enable camera permissions for this site.</p>
            
            <div class="browser-settings-help mt-4">
              <h5 class="font-medium mb-2">How to enable camera access:</h5>
              <ol class="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Always allow" for this site</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
            
            <div class="modal-buttons mt-6">
              <button @click="requestCameraPermission" class="btn btn-primary">
                Try Again
              </button>
              <button @click="denyCameraAccess" class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
        
        <div v-else-if="cameraPermissionState === 'error'" class="modal-body">
          <div class="permission-error">
            <AlertTriangleIcon class="w-16 h-16 text-yellow-500 mb-4" />
            <h4 class="text-lg font-semibold mb-2">Camera Error</h4>
            <p>We couldn't access your camera.</p>
            <p class="text-sm text-gray-500 mt-2">{{ cameraErrorMessage }}</p>
            
            <div class="troubleshooting-tips mt-4">
              <h5 class="font-medium mb-2">Troubleshooting tips:</h5>
              <ul class="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Make sure your camera is connected and not being used by another application</li>
                <li>Check that you have a working camera on your device</li>
                <li>Try using a different browser</li>
                <li>Restart your device if the problem persists</li>
              </ul>
            </div>
            
            <div class="modal-buttons mt-6">
              <button @click="requestCameraPermission" class="btn btn-primary">
                Try Again
              </button>
              <button @click="denyCameraAccess" class="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Active Session View -->
    <div v-else-if="activeSession" class="active-session">
      <div class="session-header">
        <h2>{{ activeSession.title }}</h2>
        <div class="patient-info">
          <span><strong>Patient:</strong> {{ activeSession.patientName }}</span>
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
            <p>{{ userType === 'patient' ? 'Waiting for veterinarian to join...' : 'Waiting for patient to join...' }}</p>
            <p class="text-sm text-gray-400 mt-2">
              {{ userType === 'patient' ? 'Your veterinarian' : activeSession.patientName }} will appear here when they join
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
        <div class="notes-section">
          <h3>Session Notes</h3>
          <textarea 
            v-model="sessionNotes" 
            placeholder="Enter session notes here..."
            rows="6"
            class="form-control"
          ></textarea>
          <button @click="saveNotes" class="btn btn-primary mt-2">
            <SaveIcon class="w-4 h-4 mr-2" />
            Save Notes
          </button>
        </div>
        
        <div class="chat-section">
          <h3>Chat</h3>
          <div class="chat-messages" ref="chatMessagesRef">
            <div 
              v-for="(message, index) in chatMessages" 
              :key="index"
              :class="['message', message.sender === 'vet' ? 'sent' : 'received']"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc, serverTimestamp, orderBy, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import lottie from 'lottie-web';
import TelehealthService from '@/services/TelehealthService';
import { 
  VideoIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  UserIcon, 
  ClockIcon, 
  PlayIcon, 
  PlusIcon,
  ActivityIcon,
  ArrowLeftIcon,
  MicIcon,
  MicOffIcon,
  VideoOffIcon,
  PhoneOffIcon,
  PhoneIcon,
  SendIcon,
  FileTextIcon,
  DownloadIcon,
  SaveIcon,
  UploadIcon,
  CameraIcon,
  XIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  MonitorIcon,
  CheckIcon
} from 'lucide-vue-next';

// Create a simple WebRTC service class
class WebRTCService {
  constructor(options) {
    // Initialize all required properties to avoid TypeError
    this.localVideoRef = options.localVideoRef || null;
    this.remoteVideoRef = options.remoteVideoRef || null;
    this.sessionId = options.sessionId || null;
    this.userId = options.userId || null;
    this.userType = options.userType || 'vet';
    this.onRemoteStreamActive = options.onRemoteStreamActive || (() => {});
    this.onRemoteStreamInactive = options.onRemoteStreamInactive || (() => {});
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
    console.log('Initializing WebRTC service');
    
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
      console.log('Remote stream is ready but waiting for other party to join');
      
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
}

// Try to get Firebase instances
let db;
let auth;

try {
  db = getFirestore();
  auth = getAuth();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // We'll handle this gracefully with mock data
}

// Helper function to format user ID with prefix and first 5 chars
const formatUserId = (fullUid) => {
  if (!fullUid) return null;
  
  // If already in the correct format (starts with user_ prefix), return as is
  if (fullUid.startsWith('user_')) {
    return fullUid;
  }
  
  // Extract first 5 characters of the UID and add prefix
  return `user_${fullUid.substring(0, 8)}`;
};

// User type - determine if user is patient or vet
// For testing, allow overriding via URL parameter
const userType = ref('vet'); // Default to 'vet'

// View state
const currentView = ref('carousel'); // Start with carousel view
const activeSession = ref(null);

// State variables
const loading = ref(true);
const sessions = ref([]);
const statusFilter = ref('all');
const sessionNotes = ref('');
const chatMessages = ref([]);
const newMessage = ref('');
const chatMessagesRef = ref(null);
const showingApprovedOnly = ref(false);

// Add a new ref to store user first names
const userFirstNames = ref({});

// Camera permission modal
const showCameraPermissionModal = ref(false);
const cameraPreviewActive = ref(false);
const cameraPreviewRef = ref(null);
const pendingSession = ref(null);
const cameraPermissionState = ref('prompt'); // 'prompt', 'preview', 'denied', 'error'
const cameraErrorMessage = ref('');

// WebRTC state
const localVideoRef = ref(null);
const remoteVideoRef = ref(null);
const isMuted = ref(false);
const isVideoOff = ref(false);
const isScreenSharing = ref(false);
const remoteStreamActive = ref(false);
const callStatus = ref('');

// WebRTC service instance
let webRTCService = null;
let unsubscribeMessages = null;
let unsubscribeSession = null;
let localStream = null;

// Remote stream check interval
let remoteStreamCheckInterval = null;

// Network status monitoring
let networkStatusInterval = null;
const isOnline = ref(navigator.onLine);

// Carousel state
const currentSlide = ref(0);
const slides = [
  {
    id: 1,
    title: "Video calls and meetings for everyone",
    subtitle: "Connect, collaborate, and celebrate from anywhere",
    lottieUrl: "https://lottie.host/eef5246b-5eb6-4e59-aa95-4f876e907fbe/w8vlGAQY2p.json"
  },
  {
    id: 2,
    title: "Connect with healthcare professionals",
    subtitle: "Get expert medical advice from the comfort of your home",
    lottieUrl: "https://lottie.host/8e319c9a-aa16-4c67-9762-5e8a6f1fb661/c6cXxUKVrd.json"
  },
  {
    id: 3,
    title: "Therapy sessions",
    subtitle: "Join supportive communities and share experiences",
    lottieUrl: "https://lottie.host/1e246ac2-6990-4be8-aae7-ce4c1ca7a244/OQ88rj0UOx.json"
  },
  {
    id: 4,
    title: "Follow up consultation",
    subtitle: "Access counseling whenever you need it",
    lottieUrl: "https://lottie.host/61024576-6d81-4689-a26b-377afb392172/gNHIvH2Tin.json"
  }
];

// Lottie animations
let lottieInstances = [];

// Computed properties
const filteredSessions = computed(() => {
  if (statusFilter.value === 'all') {
    return sessions.value;
  }
  return sessions.value.filter(session => session.status === statusFilter.value);
});

// Format functions for displaying appointment data correctly
const formatDateOnly = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // Ensure timestamp is a valid Date object
  let date;
  try {
    date = timestamp instanceof Date ? timestamp : 
           timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
  
  // Format date only (without time)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  // Ensure timestamp is a valid Date object
  let date;
  try {
    date = timestamp instanceof Date ? timestamp : 
           timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDuration = (duration) => {
  if (!duration) return '30 minutes'; // Default duration
  
  // If duration is already a string with "minutes", return as is
  if (typeof duration === 'string' && duration.includes('minute')) {
    return duration;
  }
  
  // If duration is a number, assume it's in minutes
  if (typeof duration === 'number') {
    return `${duration} minutes`;
  }
  
  // Otherwise, return the duration as is with "minutes" appended
  return `${duration} minutes`;
};

// Function to fetch user firstName from Firestore
const fetchUserFirstName = async (userId) => {
  if (!userId || !db) return;
  
  try {
    // Check if we already have this user's firstName
    if (userFirstNames.value[userId]) return;
    
    console.log(`Fetching user data for ID: ${userId}`);
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userFirstNames.value[userId] = userData.firstName || 'Unknown';
      console.log(`Found firstName for ${userId}: ${userFirstNames.value[userId]}`);
    } else {
      console.warn(`User document not found for ID: ${userId}`);
      userFirstNames.value[userId] = 'Unknown';
    }
  } catch (error) {
    console.error(`Error fetching user data for ${userId}:`, error);
    userFirstNames.value[userId] = 'Error';
  }
};

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
  showNotification('warning', 'Network Issue', 'Your internet connection appears to be offline. Some features may not work properly.');
};

const refreshSessionData = async (sessionId) => {
  try {
    // Skip if Firebase is not initialized
    if (!db) {
      console.warn("Cannot refresh session data: Firebase not initialized");
      return;
    }
    
    // Re-subscribe to session updates
    if (unsubscribeSession) {
      unsubscribeSession();
    }
    
    unsubscribeSession = onSnapshot(
      doc(db, 'appointments', sessionId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          activeSession.value = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
            scheduledTime: docSnapshot.data().scheduledTime?.toDate() || new Date(),
          };
          
          // Check if other party has joined
          const data = docSnapshot.data();
          const otherPartyJoined = userType.value === 'vet' 
            ? data.patientJoinedAt 
            : data.vetJoinedAt;
          
          if (otherPartyJoined && !remoteStreamActive.value) {
            // Other party has joined, display their stream
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
        collection(db, 'appointments', sessionId, 'messages'),
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

// Carousel methods
const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const goToSlide = (index) => {
  currentSlide.value = index;
};

// Initialize Lottie animations
const initializeLottieAnimations = () => {
  // Destroy previous instances if they exist
  lottieInstances.forEach(instance => {
    if (instance) {
      instance.destroy();
    }
  });
  
  lottieInstances = [];
  
  // Initialize new instances
  slides.forEach((slide, index) => {
    const container = document.getElementById(`lottie-container-${index}`);
    if (container) {
      const animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: index === currentSlide.value,
        path: slide.lottieUrl
      });
      
      lottieInstances.push(animation);
    }
  });
};

// Auto-advance slides
let autoplayInterval;
const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoplay = () => {
  clearInterval(autoplayInterval);
};

// Session methods
const refreshSessions = async () => {
  loading.value = true;
  showingApprovedOnly.value = false;
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      loading.value = false;
      return;
    }
    
    // Get current user ID and format it
    const currentUid = auth?.currentUser?.uid || 'test-doctor-id'; // Fallback for testing
    const formattedUserId = formatUserId(currentUid);
    
    // Use TelehealthService to get all sessions
    sessions.value = await TelehealthService.getUserAppointments(
      userType.value === 'vet' ? formattedUserId : 'user_test-',
      userType.value === 'vet' ? 'doctor' : 'patient'
    );
    
    console.log(`Fetched ${sessions.value.length} sessions`);
    
    // Fetch firstName for each user
    for (const session of sessions.value) {
      if (session.userId) {
        fetchUserFirstName(session.userId);
      }
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    showNotification('error', 'Error', 'Failed to load sessions. Please try again later.');
    // Use mock data as fallback
    sessions.value = [];
  } finally {
    loading.value = false;
  }
};

// Load only approved sessions
const loadApprovedSessions = async () => {
  loading.value = true;
  showingApprovedOnly.value = true;
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      loading.value = false;
      return;
    }
    
    // Get current user ID and format it
    const currentUid = auth?.currentUser?.uid || 'test-doctor-id'; // Fallback for testing
    const formattedUserId = formatUserId(currentUid);
    
    // Use TelehealthService to get approved sessions
    sessions.value = await TelehealthService.getApprovedAppointments(
      userType.value === 'vet' ? formattedUserId : 'user_test-',
      userType.value === 'vet' ? 'doctor' : 'patient'
    );
    
    console.log(`Fetched ${sessions.value.length} approved sessions`);
    
    // Fetch firstName for each user
    for (const session of sessions.value) {
      if (session.userId) {
        fetchUserFirstName(session.userId);
      }
    }
    
    // Set view to sessions
    currentView.value = 'sessions';
    
    // Set filter to show approved sessions
    statusFilter.value = 'approved';
  } catch (error) {
    console.error('Error fetching approved sessions:', error);
    showNotification('error', 'Error', 'Failed to load approved sessions. Please try again later.');
    // Use mock data as fallback
    sessions.value = [];
  } finally {
    loading.value = false;
  }
};

const isSessionJoinable = (session) => {
  if (!session.scheduledTime) return false;
  
  // Ensure scheduledTime is a valid Date object
  let scheduledTime;
  try {
    scheduledTime = session.scheduledTime instanceof Date ? 
      session.scheduledTime : session.scheduledTime.toDate ? 
      session.scheduledTime.toDate() : new Date(session.scheduledTime);
    
    // Check if date is valid
    if (isNaN(scheduledTime.getTime())) {
      return false;
    }
  } catch (error) {
    console.error('Error checking if session is joinable:', error);
    return false;
  }
  
  const now = new Date();
  const timeDiff = Math.abs(now - scheduledTime);
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  
  // Allow joining 15 minutes before and up to 30 minutes after scheduled time
  return minutesDiff <= 30;
};

const selectSession = (session) => {
  // Just view session details, don't join call yet
  activeSession.value = session;
  sessionNotes.value = session.notes || '';
};

// Approve a session
const approveSession = async (session) => {
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    if (!db) {
      showNotification('warning', 'Database Issue', 'Cannot approve session: Database not initialized');
      return;
    }
    
    // Get current user ID and format it
    const currentUid = auth?.currentUser?.uid || 'test-doctor-id'; // Fallback for testing
    const formattedUserId = formatUserId(currentUid);
    
    await updateDoc(doc(db, 'appointments', session.id), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: formattedUserId
    });
    
    showNotification('success', 'Session Approved', 'The session has been approved successfully.');
    
    // Refresh sessions
    if (showingApprovedOnly.value) {
      await loadApprovedSessions();
    } else {
      await refreshSessions();
    }
  } catch (error) {
    console.error('Error approving session:', error);
    showNotification('error', 'Error', 'Failed to approve session. Please try again.');
  }
};

// Camera permission handling
const joinSession = async (session) => {
  // Store the session for later use after camera permission
  pendingSession.value = session;
  
  // Reset camera permission state
  cameraPermissionState.value = 'prompt';
  cameraErrorMessage.value = '';
  
  // Show camera permission modal
  showCameraPermissionModal.value = true;
};

const requestCameraPermission = async () => {
  try {
    // Check if we already have permissions
    let permissionStatus;
    try {
      permissionStatus = await navigator.permissions.query({ name: 'camera' });
    } catch (error) {
      console.warn('Permissions API not supported, proceeding with getUserMedia directly');
    }
    
    if (permissionStatus && permissionStatus.state === 'denied') {
      // Camera permission is denied at the browser level
      cameraPermissionState.value = 'denied';
      return;
    }
    
    // Request camera and microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    // Store the stream for later use
    localStream = stream;
    
    // Show preview
    cameraPreviewActive.value = true;
    cameraPermissionState.value = 'preview';
    
    // Wait for DOM update
    await nextTick();
    
    // Attach stream to preview
    if (cameraPreviewRef.value) {
      cameraPreviewRef.value.srcObject = stream;
      
      // Ensure the video plays
      try {
        await cameraPreviewRef.value.play();
      } catch (e) {
        console.warn('Auto-play prevented:', e);
        // Add a play button or other UI to handle this case
      }
    }
  } catch (error) {
    console.error('Error accessing camera:', error);
    
    // Handle different error types
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      cameraPermissionState.value = 'denied';
    } else {
      cameraPermissionState.value = 'error';
      
      // Set appropriate error message based on the error
      if (error.name === 'NotFoundError') {
        cameraErrorMessage.value = 'No camera was found on your device.';
      } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
        cameraErrorMessage.value = 'Your camera is being used by another application.';
      } else if (error.name === 'OverconstrainedError') {
        cameraErrorMessage.value = 'The requested camera settings are not supported.';
      } else if (error.name === 'SecurityError') {
        cameraErrorMessage.value = 'Camera access is restricted due to security policy.';
      } else if (error.name === 'TypeError') {
        cameraErrorMessage.value = 'No camera constraints were specified.';
      } else {
        cameraErrorMessage.value = `Unexpected error: ${error.message || 'Unknown error'}`;
      }
    }
  }
};

const allowCameraAccess = async () => {
  showCameraPermissionModal.value = false;
  
  if (!pendingSession.value) return;
  
  try {
    // If we don't have a stream yet, try to get one
    if (!localStream) {
      localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
    }
    
    // Continue with session join
    await completeJoinSession(pendingSession.value);
  } catch (error) {
    console.error('Error accessing camera:', error);
    
    // Show error notification
    const errorMessage = getErrorMessage(error);
    showNotification('error', 'Camera Error', errorMessage);
    
    // Reset state
    cameraPreviewActive.value = false;
    pendingSession.value = null;
  }
};

const denyCameraAccess = () => {
  showCameraPermissionModal.value = false;
  
  // Clean up any existing stream
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  cameraPreviewActive.value = false;
  pendingSession.value = null;
};

const getErrorMessage = (error) => {
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return 'Camera access was denied. Please allow camera access to join the call.';
  } else if (error.name === 'NotFoundError') {
    return 'No camera was found on your device.';
  } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
    return 'Your camera is being used by another application.';
  } else {
    return `Error accessing camera: ${error.message || 'Unknown error'}`;
  }
};

const showNotification = (type, title, message) => {
  // This would be implemented with a toast notification system
  // For now, we'll just use alert
  alert(`${title}: ${message}`);
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

const completeJoinSession = async (session) => {
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    // Update session status to 'in-progress' if it's not already
    if (session.status === 'scheduled' || session.status === 'approved') {
      // Get current user ID and format it
      const currentUid = auth?.currentUser?.uid || (userType.value === 'vet' ? 'test-doctor-id' : 'test-patient-id');
      const formattedUserId = formatUserId(currentUid);
      
      // Update based on user type
      const updateData = userType.value === 'vet' 
        ? { status: 'in-progress', vetJoinedAt: serverTimestamp() }
        : { status: 'in-progress', patientJoinedAt: serverTimestamp() };
      
      if (db) {
        await updateDoc(doc(db, 'appointments', session.id), updateData);
      } else {
        console.warn("Cannot update session status: Database not initialized");
      }
    }
    
    activeSession.value = session;
    sessionNotes.value = session.notes || '';
    callStatus.value = 'connecting';
    
    // Subscribe to session updates if Firebase is available
    if (db) {
      refreshSessionData(session.id);
    }
    
    // Initialize WebRTC with the existing stream
    await initializeWebRTC(session.id, localStream);
    
    // Start checking for remote stream
    startRemoteStreamCheck();
    
    // Reset pending session
    pendingSession.value = null;
  } catch (error) {
    console.error('Error joining session:', error);
    showNotification('error', 'Join Error', `Failed to join session: ${error.message || 'Unknown error'}`);
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

const cancelSession = async (session) => {
  if (!confirm('Are you sure you want to cancel this session?')) return;
  
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    if (!db) {
      showNotification('warning', 'Database Issue', 'Cannot cancel session: Database not initialized');
      return;
    }
    
    await updateDoc(doc(db, 'appointments', session.id), {
      status: 'cancelled',
      cancelledBy: userType.value,
      cancelledAt: serverTimestamp()
    });
    
    // Refresh sessions
    if (showingApprovedOnly.value) {
      await loadApprovedSessions();
    } else {
      await refreshSessions();
    }
  } catch (error) {
    console.error('Error cancelling session:', error);
    showNotification('error', 'Error', 'Failed to cancel session. Please try again.');
  }
};

const saveNotes = async () => {
  if (!activeSession.value) return;
  
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    if (!db) {
      showNotification('warning', 'Database Issue', 'Cannot save notes: Database not initialized');
      return;
    }
    
    await updateDoc(doc(db, 'appointments', activeSession.value.id), {
      notes: sessionNotes.value,
      lastUpdated: serverTimestamp()
    });
    
    showNotification('success', 'Notes Saved', 'Session notes have been saved successfully.');
  } catch (error) {
    console.error('Error saving notes:', error);
    showNotification('error', 'Save Error', 'Failed to save notes. Please try again.');
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeSession.value) return;
  
  try {
    if (!isOnline.value) {
      showNotification('warning', 'Network Issue', 'You appear to be offline. Please check your internet connection and try again.');
      return;
    }
    
    if (!db) {
      showNotification('warning', 'Database Issue', 'Cannot send message: Database not initialized');
      // Add message locally for demo purposes
      chatMessages.value.push({
        id: `local-${Date.now()}`,
        text: newMessage.value.trim(),
        sender: userType.value,
        senderName: userType.value === 'vet' 
          ? 'Dr. ' + (auth?.currentUser?.displayName || 'Veterinarian')
          : auth?.currentUser?.displayName || 'Patient',
        timestamp: new Date()
      });
      newMessage.value = '';
      return;
    }
    
    // Get current user ID and format it
    const currentUid = auth?.currentUser?.uid || (userType.value === 'vet' ? 'test-doctor-id' : 'test-patient-id');
    const formattedUserId = formatUserId(currentUid);
    
    await addDoc(
      collection(db, 'appointments', activeSession.value.id, 'messages'),
      {
        text: newMessage.value.trim(),
        sender: userType.value,
        senderId: formattedUserId,
        senderName: userType.value === 'vet' 
          ? 'Dr. ' + (auth?.currentUser?.displayName || 'Veterinarian')
          : auth?.currentUser?.displayName || 'Patient',
        timestamp: serverTimestamp()
      }
    );
    
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    showNotification('error', 'Message Error', 'Failed to send message. Please try again.');
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
    
    // Get current user ID and format it
    const currentUid = auth?.currentUser?.uid || (userType.value === 'vet' ? 'test-doctor-id' : 'test-patient-id');
    const formattedUserId = formatUserId(currentUid);
    
    // Initialize WebRTC service
    webRTCService = new WebRTCService({
      localVideoRef: localVideoRef.value,
      remoteVideoRef: remoteVideoRef.value,
      sessionId,
      userId: formattedUserId,
      userType: userType.value,
      onRemoteStreamActive: () => {
        remoteStreamActive.value = true;
        callStatus.value = 'connected';
      },
      onRemoteStreamInactive: () => {
        remoteStreamActive.value = false;
        callStatus.value = 'connecting';
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
    showNotification('error', 'Connection Error', 'Failed to initialize video call. Please try again.');
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
      showNotification('error', 'Screen Share', 'Screen sharing permission was denied.');
    } else {
      showNotification('error', 'Screen Share', 'Failed to share screen. Please try again.');
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
    
    if (activeSession.value && isOnline.value && db) {
      await updateDoc(doc(db, 'appointments', activeSession.value.id), {
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
    currentView.value = 'sessions';
    
    // Refresh sessions
    if (showingApprovedOnly.value) {
      await loadApprovedSessions();
    } else {
      await refreshSessions();
    }
  } catch (error) {
    console.error('Error ending call:', error);
    showNotification('error', 'Error', 'Failed to end call properly. Please refresh the page.');
  }
};

// Schedule a meeting
const scheduleMeeting = () => {
  // This would navigate to the meetings view in a real implementation
  alert('Navigate to schedule meeting view');
};

// Check URL for user type parameter
const checkUserTypeFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userTypeParam = urlParams.get('userType');
  
  if (userTypeParam === 'patient' || userTypeParam === 'vet') {
    userType.value = userTypeParam;
    console.log(`User type set from URL: ${userType.value}`);
  } else {
    // Try to determine from path
    if (window.location.pathname.includes('/patient')) {
      userType.value = 'patient';
    } else if (window.location.pathname.includes('/vet')) {
      userType.value = 'vet';
    }
    console.log(`User type determined: ${userType.value}`);
  }
};

// Lifecycle hooks
onMounted(() => {
  // Determine user type from URL or auth state
  checkUserTypeFromUrl();
  
  // Set up network monitoring
  setupNetworkMonitoring();
  
  // Initialize Lottie animations when component is mounted
  initializeLottieAnimations();
  
  // Start autoplay for slides
  startAutoplay();
  
  // Load sessions - default to approved sessions for vet view
  if (userType.value === 'vet') {
    loadApprovedSessions();
  } else {
    refreshSessions();
  }
  
  // Set up chat messages ref
  watch(chatMessages, () => {
    setTimeout(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
      }
    }, 100);
  });
});

// Watch for slide changes to update active Lottie animation
watch(currentSlide, (newValue, oldValue) => {
  if (lottieInstances[oldValue]) {
    lottieInstances[oldValue].pause();
  }
  if (lottieInstances[newValue]) {
    lottieInstances[newValue].play();
  }
});

// Watch for view changes to reinitialize animations when returning to carousel
watch(currentView, (newValue) => {
  if (newValue === 'carousel') {
    // Need to wait for DOM to update
    setTimeout(() => {
      initializeLottieAnimations();
    }, 0);
  }
});

// Cleanup function
onUnmounted(() => {
  // Stop autoplay
  stopAutoplay();
  
  // Destroy Lottie instances
  lottieInstances.forEach(instance => {
    if (instance) {
      instance.destroy();
    }
  });
  
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
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
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

.status-approved {
  background-color: #e8f5e9;
  color: #1b5e20;
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

/* Camera Permission Modal */
.camera-permission-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
}

.close-button:hover {
  background-color: #f0f0f0;
}

.modal-body {
  padding: 24px;
}

.permission-prompt, .permission-denied, .permission-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.browser-permission-illustration {
  margin: 20px 0;
  width: 100%;
}

.browser-permission-mockup {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  margin: 0 auto;
}

.mockup-header {
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
}

.mockup-url {
  background-color: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #333;
}

.mockup-body {
  padding: 12px;
  background-color: white;
}

.mockup-body p {
  font-size: 14px;
  margin-bottom: 12px;
}

.mockup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mockup-buttons span {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #333;
}

.mockup-buttons span.allow {
  background-color: #4a6cf7;
  color: white;
}

.preview-container {
  width: 100%;
  height: 240px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.browser-settings-help ol, .troubleshooting-tips ul {
  text-align: left;
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

.patient-info {
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

.notes-section, .chat-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.notes-section h3, .chat-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: inherit;
}

textarea.form-control {
  resize: none;
  flex-grow: 1;
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

/* Carousel Styles */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
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
  
  .patient-info {
    margin: 10px 0;
    flex-direction: column;
    gap: 5px;
  }
}
</style>