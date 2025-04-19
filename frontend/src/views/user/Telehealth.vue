<template>
  <div class="telehealth-container">
    <!-- Session List View -->
    <div v-if="!activeSession" class="sessions-list">
      <div class="flex items-center mb-4">
        <h1 class="text-2xl font-bold">
          {{ showingApprovedOnly ? 'Approved Telehealth Appointments' : 'My Telehealth Appointments' }}
        </h1>
      </div>
      
      <div class="filter-controls mb-4">
        <select v-model="statusFilter" class="form-select mr-2">
          <option value="all">All Appointments</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button @click="refreshSessions" class="btn btn-primary mr-2">
          <RefreshCwIcon class="w-4 h-4 mr-2" />
          Refresh
        </button>
        <button @click="loadApprovedSessions" class="btn btn-success">
          <CheckIcon class="w-4 h-4 mr-2" />
          Show Approved Only
        </button>
      </div>
      
      <div v-if="loading" class="text-center py-4">
        <div class="spinner"></div>
        <p>Loading appointments...</p>
      </div>
      
      <div v-else-if="filteredSessions.length === 0" class="empty-state">
        <p>No telehealth appointments found.</p>
        <button @click="refreshSessions" class="btn btn-primary mt-4">
          <RefreshCwIcon class="w-4 h-4 mr-2" />
          Refresh Appointments
        </button>
      </div>
      
      <div v-else class="sessions-grid">
        <div 
          v-for="appointment in filteredSessions" 
          :key="appointment.id" 
          class="session-card"
          @click="selectSession(appointment)"
        >
          <div class="card-header">
            <span :class="['status-badge', `status-${appointment.status}`]">
              {{ appointment.status }}
            </span>
            <h3 class="session-title">{{ appointment.title || 'Telehealth Appointment' }}</h3>
          </div>
          
          <div class="card-body">
            <p><strong>Doctor:</strong> {{ appointment.doctorName || 'Veterinarian' }}</p>
            <p><strong>Pet:</strong> {{ appointment.petName || 'Your Pet' }} ({{ appointment.petType || 'Pet' }})</p>
            <p><strong>Scheduled:</strong> {{ formatDate(appointment.scheduledTime || appointment.date) }}</p>
          </div>
          
          <div class="card-footer">
            <button 
              v-if="(appointment.status === 'scheduled' || appointment.status === 'approved') && isSessionJoinable(appointment)" 
              class="btn btn-success"
              @click.stop="joinSession(appointment)"
            >
              <PhoneIcon class="w-4 h-4 mr-2" />
              Join Call
            </button>
            <button 
              v-else-if="appointment.status === 'scheduled' || appointment.status === 'approved'" 
              class="btn btn-secondary" 
              disabled
            >
              Not Yet Available
            </button>
            <button 
              v-if="appointment.status === 'scheduled' || appointment.status === 'approved'" 
              class="btn btn-danger ml-2"
              @click.stop="cancelSession(appointment)"
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
        <h2>{{ activeSession.title || 'Telehealth Appointment' }}</h2>
        <div class="patient-info">
          <span><strong>Doctor:</strong> {{ activeSession.doctorName || 'Veterinarian' }}</span>
          <span><strong>Pet:</strong> {{ activeSession.petName || 'Your Pet' }} ({{ activeSession.petType || 'Pet' }})</span>
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
        <div class="notes-section">
          <h3>Appointment Notes</h3>
          <div class="notes-content">
            {{ activeSession.notes || 'No notes available for this appointment.' }}
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
    
    <!-- Network Status Banner -->
    <div v-if="!isOnline" class="network-status-banner">
      <AlertTriangleIcon class="w-5 h-5 mr-2" />
      You are currently offline. Some features may not work properly.
    </div>
    
    <!-- Incoming Call Modal -->
    <div v-if="incomingCall" class="incoming-call-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Incoming Call</h3>
        </div>
        <div class="modal-body">
          <div class="incoming-call-info">
            <PhoneIcon class="w-16 h-16 text-green-500 mb-4 animate-pulse" />
            <h4 class="text-lg font-semibold mb-2">{{ incomingCall.callerName }} is calling</h4>
            <p>{{ incomingCall.sessionTitle }}</p>
            
            <div class="modal-buttons mt-6">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue"
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"
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
  AlertTriangleIcon,
  CheckIcon,
} from "lucide-vue-next"
import TelehealthService from "@/services/TelehealthService"
import WebRTCService from "@/services/WebRTCService"
import { db } from "@/firebase-config" // Import db directly

// Firebase setup
const auth = getAuth()

// State variables
const loading = ref(true)
const sessions = ref([])
const statusFilter = ref("all")
const activeSession = ref(null)
const chatMessages = ref([])
const newMessage = ref("")
const chatMessagesRef = ref(null)
const incomingCall = ref(null)
const showingApprovedOnly = ref(false)

// WebRTC state
const localVideoRef = ref(null)
const remoteVideoRef = ref(null)
const isMuted = ref(false)
const isVideoOff = ref(false)
const isScreenSharing = ref(false)
const remoteStreamActive = ref(false)
const callStatus = ref("")

// Network status monitoring
const isOnline = ref(navigator.onLine)
let networkStatusInterval = null

// WebRTC service instance
let webRTCService = null
let unsubscribeMessages = null
let unsubscribeSession = null
let localStream = null

// Remote stream check interval
let remoteStreamCheckInterval = null

// Computed properties
const filteredSessions = computed(() => {
  if (statusFilter.value === "all") {
    return sessions.value
  }
  return sessions.value.filter((session) => session.status === statusFilter.value)
})

// Network status monitoring
const setupNetworkMonitoring = () => {
  // Listen for online/offline events
  window.addEventListener("online", handleOnline)
  window.addEventListener("offline", handleOffline)

  // Also check periodically
  networkStatusInterval = setInterval(() => {
    const currentStatus = navigator.onLine
    if (isOnline.value !== currentStatus) {
      isOnline.value = currentStatus
      if (currentStatus) {
        handleOnline()
      } else {
        handleOffline()
      }
    }
  }, 5000)
}

const handleOnline = () => {
  console.log("Network connection restored")
  isOnline.value = true

  // Refresh data if we're in a session
  if (activeSession.value) {
    refreshSessionData(activeSession.value.id)
  }
}

const handleOffline = () => {
  console.log("Network connection lost")
  isOnline.value = false
}

const refreshSessionData = async (sessionId) => {
  try {
    // Re-subscribe to session updates
    if (unsubscribeSession) {
      unsubscribeSession()
    }

    // Verify db is available
    if (!db) {
      console.error("Firestore db is not initialized")
      return
    }

    unsubscribeSession = onSnapshot(
      doc(db, "appointments", sessionId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          activeSession.value = {
            id: docSnapshot.id,
            ...data,
            title: data.serviceNames ? data.serviceNames[0] : "Telehealth Appointment",
            doctorName: data.doctorName || "Veterinarian",
            petName: data.petName || "Your Pet",
            petType: data.petType || "Pet",
            scheduledTime: data.date ? new Date(data.date) : new Date(),
            status: data.status || "pending",
            notes: data.notes || "",
          }

          // Check if vet has joined
          if (data.vetJoinedAt && !remoteStreamActive.value) {
            // Vet has joined, display their stream
            if (webRTCService && webRTCService.remoteStream) {
              webRTCService.displayRemoteStream()
            } else {
              // Still connecting
              callStatus.value = "connecting"
            }
          }
        }
      },
      (error) => {
        console.error("Error in session snapshot:", error)
        // Handle error gracefully
        if (!isOnline.value) {
          console.log("Network appears to be offline, will retry when connection is restored")
        }
      },
    )

    // Re-subscribe to chat messages
    if (unsubscribeMessages) {
      unsubscribeMessages()
    }

    // Verify db is available
    if (!db) {
      console.error("Firestore db is not initialized")
      return
    }

    unsubscribeMessages = onSnapshot(
      query(collection(db, "appointments", sessionId, "messages"), orderBy("timestamp", "asc")),
      (querySnapshot) => {
        chatMessages.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Scroll to bottom of chat
        setTimeout(() => {
          if (chatMessagesRef.value) {
            chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
          }
        }, 100)
      },
      (error) => {
        console.error("Error in messages snapshot:", error)
        // Handle error gracefully
        if (!isOnline.value) {
          console.log("Network appears to be offline, will retry when connection is restored")
        }
      },
    )
  } catch (error) {
    console.error("Error refreshing session data:", error)
  }
}

// Update the refreshSessions method
const refreshSessions = async () => {
  loading.value = true
  showingApprovedOnly.value = false
  try {
    if (!isOnline.value) {
      // Don't attempt to fetch if offline
      loading.value = false
      return
    }

    const patientId = auth.currentUser?.uid || "test-patient-id" // Fallback for testing

    console.log("Fetching all appointments for patient:", patientId)
    // Use TelehealthService to get appointments
    sessions.value = await TelehealthService.getUserAppointments(patientId, "patient")
    console.log("Fetched appointments:", sessions.value)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    alert("Failed to load appointments. Please try again later.")
  } finally {
    loading.value = false
  }
}

// Load only approved sessions
const loadApprovedSessions = async () => {
  loading.value = true
  showingApprovedOnly.value = true
  try {
    if (!isOnline.value) {
      // Don't attempt to fetch if offline
      loading.value = false
      return
    }

    const patientId = auth.currentUser?.uid || "test-patient-id" // Fallback for testing

    console.log("Fetching approved appointments for patient:", patientId)
    // Use TelehealthService to get approved appointments
    sessions.value = await TelehealthService.getApprovedAppointments(patientId, "patient")
    console.log("Fetched approved appointments:", sessions.value)

    // Set filter to show approved sessions
    statusFilter.value = "approved"
  } catch (error) {
    console.error("Error fetching approved appointments:", error)
    alert("Failed to load approved appointments. Please try again later.")
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A"

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ""

  const date = timestamp instanceof Date ? timestamp : timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const isSessionJoinable = (session) => {
  if (!session.scheduledTime && !session.date) return false

  const scheduledTime = session.scheduledTime ? 
    (session.scheduledTime instanceof Date ? session.scheduledTime : new Date(session.scheduledTime)) : 
    new Date(session.date)

  const now = new Date()
  const timeDiff = Math.abs(now - scheduledTime)
  const minutesDiff = Math.floor(timeDiff / (1000 * 60))

  // Allow joining 15 minutes before and up to 30 minutes after scheduled time
  return minutesDiff <= 30
}

const selectSession = (session) => {
  // Just view session details, don't join call yet
  activeSession.value = session
}

const joinSession = async (session) => {
  try {
    if (!isOnline.value) {
      alert("You appear to be offline. Please check your internet connection and try again.")
      return
    }

    // Request camera and microphone access
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert(`Camera access error: ${error.message || "Unknown error"}`)
      return
    }

    // Verify db is available
    if (!db) {
      console.error("Firestore db is not initialized")
      alert("Database connection error. Please refresh the page and try again.")
      return
    }

    // Update session status to 'in-progress' if it's not already
    if (session.status === "scheduled" || session.status === "approved") {
      await updateDoc(doc(db, "appointments", session.id), {
        status: "in-progress",
        patientJoinedAt: serverTimestamp(),
      })
    }

    activeSession.value = session
    callStatus.value = "connecting"

    // Subscribe to session updates
    refreshSessionData(session.id)

    // Initialize WebRTC
    await initializeWebRTC(session.id, localStream)

    // Start checking for remote stream
    startRemoteStreamCheck()
  } catch (error) {
    console.error("Error joining session:", error)
    alert(`Failed to join session: ${error.message || "Unknown error"}`)
  }
}

const startRemoteStreamCheck = () => {
  // Clear any existing interval
  if (remoteStreamCheckInterval) {
    clearInterval(remoteStreamCheckInterval)
    remoteStreamCheckInterval = null
  }

  // Check immediately
  checkRemoteVideoStatus()

  // Then check every second
  remoteStreamCheckInterval = setInterval(() => {
    const isActive = checkRemoteVideoStatus()

    // If we've detected the stream is active, we can stop checking
    if (isActive) {
      clearInterval(remoteStreamCheckInterval)
      remoteStreamCheckInterval = null
    }
  }, 1000)
}

// Check if remote video has tracks and is playing
const checkRemoteVideoStatus = () => {
  const remoteVideo = remoteVideoRef.value

  if (remoteVideo && remoteVideo.srcObject) {
    const videoTracks = remoteVideo.srcObject.getVideoTracks()
    const audioTracks = remoteVideo.srcObject.getAudioTracks()

    // Check if we have video or audio tracks and they're active
    if ((videoTracks.length > 0 && videoTracks[0].enabled) || (audioTracks.length > 0 && audioTracks[0].enabled)) {
      remoteStreamActive.value = true
      callStatus.value = "connected"
      return true
    }

    // If we have tracks but they're not active yet
    if (videoTracks.length > 0 || audioTracks.length > 0) {
      callStatus.value = "connecting"
    }
  }

  return false
}

const cancelSession = async (session) => {
  if (!confirm("Are you sure you want to cancel this appointment?")) return

  try {
    if (!isOnline.value) {
      alert("You appear to be offline. Please check your internet connection and try again.")
      return
    }

    // Verify db is available
    if (!db) {
      console.error("Firestore db is not initialized")
      alert("Database connection error. Please refresh the page and try again.")
      return
    }

    await updateDoc(doc(db, "appointments", session.id), {
      status: "cancelled",
      cancelledBy: "patient",
      cancelledAt: serverTimestamp(),
    })

    if (showingApprovedOnly.value) {
      await loadApprovedSessions()
    } else {
      await refreshSessions()
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    alert("Failed to cancel appointment. Please try again.")
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeSession.value) return

  try {
    if (!isOnline.value) {
      alert("You appear to be offline. Please check your internet connection and try again.")
      return
    }

    // Verify db is available
    if (!db) {
      console.error("Firestore db is not initialized")
      alert("Database connection error. Please refresh the page and try again.")
      return
    }

    await addDoc(collection(db, "appointments", activeSession.value.id, "messages"), {
      text: newMessage.value.trim(),
      sender: "patient",
      senderName: auth.currentUser?.displayName || "Patient",
      timestamp: serverTimestamp(),
    })

    newMessage.value = ""
  } catch (error) {
    console.error("Error sending message:", error)
    alert("Failed to send message. Please try again.")
  }
}

const initializeWebRTC = async (sessionId, existingStream = null) => {
  try {
    // Make sure we have video elements before initializing
    if (!localVideoRef.value || !remoteVideoRef.value) {
      console.error("Video elements not found")
      await nextTick()

      // Check again after nextTick
      if (!localVideoRef.value || !remoteVideoRef.value) {
        throw new Error("Video elements not available after DOM update")
      }
    }

    // Initialize WebRTC service
    webRTCService = new WebRTCService({
      localVideoRef: localVideoRef.value,
      remoteVideoRef: remoteVideoRef.value,
      sessionId,
      userId: auth.currentUser?.uid || "test-patient-id",
      userType: "patient",
      onRemoteStreamActive: () => {
        remoteStreamActive.value = true
        callStatus.value = "connected"
      },
      onRemoteStreamInactive: () => {
        remoteStreamActive.value = false
        callStatus.value = "connecting"
      },
      onIncomingCall: (callData) => {
        incomingCall.value = {
          sessionId: callData.sessionId,
          callerName: callData.callerName || "Veterinarian",
          sessionTitle: callData.sessionTitle || "Telehealth Appointment",
        }
      },
      existingStream, // Pass the existing stream if available
    })

    await webRTCService.initialize()

    // Manually attach local stream to video element if WebRTCService doesn't do it
    if (existingStream && localVideoRef.value) {
      localVideoRef.value.srcObject = existingStream
      try {
        await localVideoRef.value.play()
      } catch (e) {
        console.warn("Auto-play prevented for local video:", e)
      }
    }

    // Manually check remote video status after initialization
    setTimeout(() => {
      checkRemoteVideoStatus()
    }, 1000)
  } catch (error) {
    console.error("Error initializing WebRTC:", error)
    alert("Failed to initialize video call. Please try again.")
  }
}

const acceptIncomingCall = async () => {
  if (!incomingCall.value) return

  try {
    if (!isOnline.value) {
      alert("You appear to be offline. Please check your internet connection and try again.")
      return
    }

    // Find the session
    const sessionId = incomingCall.value.sessionId
    const docSnap = await getDoc(doc(db, "appointments", sessionId))

    if (docSnap.exists()) {
      const data = docSnap.data()
      const session = {
        id: docSnap.id,
        ...data,
        title: data.serviceNames ? data.serviceNames[0] : "Telehealth Appointment",
        doctorName: data.doctorName || "Veterinarian",
        petName: data.petName || "Your Pet",
        petType: data.petType || "Pet",
        scheduledTime: data.date ? new Date(data.date) : new Date(),
        status: data.status || "pending",
        notes: data.notes || "",
      }

      // Join the session
      await joinSession(session)

      // Clear the incoming call
      incomingCall.value = null
    }
  } catch (error) {
    console.error("Error accepting call:", error)
    alert(`Error accepting call: ${error.message || "Unknown error"}`)
  }
}

const declineIncomingCall = async () => {
  if (!incomingCall.value) return

  try {
    // Notify the caller that the call was declined
    if (webRTCService) {
      await webRTCService.declineCall(incomingCall.value.sessionId)
    }

    // Clear the incoming call
    incomingCall.value = null
  } catch (error) {
    console.error("Error declining call:", error)
    alert(`Error declining call: ${error.message || "Unknown error"}`)
  }
}

const toggleMute = () => {
  if (!webRTCService) return

  isMuted.value = !isMuted.value
  webRTCService.toggleAudio(isMuted.value)
}

const toggleVideo = () => {
  if (!webRTCService) return

  isVideoOff.value = !isVideoOff.value
  webRTCService.toggleVideo(isVideoOff.value)
}

const toggleScreenShare = async () => {
  if (!webRTCService) return

  try {
    if (isScreenSharing.value) {
      await webRTCService.stopScreenSharing()
    } else {
      await webRTCService.startScreenSharing()
    }

    isScreenSharing.value = !isScreenSharing.value
  } catch (error) {
    console.error("Error toggling screen share:", error)

    if (error.name === "NotAllowedError") {
      alert("Screen sharing permission was denied.")
    } else {
      alert("Failed to share screen. Please try again.")
    }
  }
}

const endCall = async () => {
  try {
    // Clear remote stream check interval if it exists
    if (remoteStreamCheckInterval) {
      clearInterval(remoteStreamCheckInterval)
      remoteStreamCheckInterval = null
    }

    if (webRTCService) {
      await webRTCService.disconnect()
    }

    // Clean up local stream if it exists
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      localStream = null
    }

    // Verify db is available
    if (!db) {
      console.error("Firestore db is not initialized")
      alert("Database connection error. Please refresh the page and try again.")
      return
    }

    if (activeSession.value && isOnline.value) {
      await updateDoc(doc(db, "appointments", activeSession.value.id), {
        status: "completed",
        endedAt: serverTimestamp(),
      })
    }

    // Clean up subscriptions
    if (unsubscribeMessages) {
      unsubscribeMessages()
    }

    if (unsubscribeSession) {
      unsubscribeSession()
    }

    activeSession.value = null
    remoteStreamActive.value = false
    callStatus.value = ""

    // Refresh sessions
    if (showingApprovedOnly.value) {
      await loadApprovedSessions()
    } else {
      await refreshSessions()
    }
  } catch (error) {
    console.error("Error ending call:", error)
    alert("Failed to end call properly. Please refresh the page.")
  }
}

// Lifecycle hooks
onMounted(() => {
  // Set up network monitoring
  setupNetworkMonitoring()

  // Load sessions
  refreshSessions()

  // Set up chat messages ref
  watch(chatMessages, () => {
    setTimeout(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    }, 100)
  })
})

onUnmounted(() => {
  // Clean up WebRTC
  if (webRTCService) {
    webRTCService.disconnect()
  }

  // Clean up local stream if it exists
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop())
    localStream = null
  }

  // Clear any intervals
  if (remoteStreamCheckInterval) {
    clearInterval(remoteStreamCheckInterval)
    remoteStreamCheckInterval = null
  }

  if (networkStatusInterval) {
    clearInterval(networkStatusInterval)
    networkStatusInterval = null
  }

  // Remove network event listeners
  window.removeEventListener("online", handleOnline)
  window.removeEventListener("offline", handleOffline)

  // Clean up subscriptions
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }

  if (unsubscribeSession) {
    unsubscribeSession()
  }
})
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

.notes-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
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

/* Network Status Banner */
.network-status-banner {
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

/* Incoming Call Modal */
.incoming-call-modal {
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

.incoming-call-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
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