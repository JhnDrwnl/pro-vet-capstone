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
          <i class="fas fa-sync-alt"></i> Refresh
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
            <p><strong>Patient:</strong> {{ session.patientName }}</p>
            <p><strong>Pet:</strong> {{ session.petName }} ({{ session.petType }})</p>
            <p><strong>Scheduled:</strong> {{ formatDate(session.scheduledTime) }}</p>
          </div>
          
          <div class="card-footer">
            <button 
              v-if="session.status === 'scheduled' && isSessionJoinable(session)" 
              class="btn btn-success"
              @click.stop="joinSession(session)"
            >
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
        <div class="patient-info">
          <span><strong>Patient:</strong> {{ activeSession.patientName }}</span>
          <span><strong>Pet:</strong> {{ activeSession.petName }} ({{ activeSession.petType }})</span>
        </div>
        <button @click="endCall" class="btn btn-danger">
          <i class="fas fa-phone-slash"></i> End Call
        </button>
      </div>
      
      <div class="video-container">
        <div class="remote-video">
          <video ref="remoteVideoRef" autoplay playsinline></video>
          <div v-if="!remoteStreamActive" class="video-placeholder">
            <p>Waiting for patient to join...</p>
          </div>
        </div>
        
        <div class="local-video">
          <video ref="localVideoRef" autoplay playsinline muted></video>
          <div class="call-controls">
            <button @click="toggleMute" :class="['btn', isMuted ? 'btn-secondary' : 'btn-primary']">
              <i :class="['fas', isMuted ? 'fa-microphone-slash' : 'fa-microphone']"></i>
            </button>
            <button @click="toggleVideo" :class="['btn', isVideoOff ? 'btn-secondary' : 'btn-primary']">
              <i :class="['fas', isVideoOff ? 'fa-video-slash' : 'fa-video']"></i>
            </button>
            <button @click="toggleScreenShare" :class="['btn', isScreenSharing ? 'btn-success' : 'btn-primary']">
              <i class="fas fa-desktop"></i>
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
            Save Notes
          </button>
        </div>
        
        <div class="chat-section">
          <h3>Chat</h3>
          <div class="chat-messages" ref="chatMessages">
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
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import WebRTCService from '@/services/WebRTCService';

export default {
  name: 'VetTelehealth',
  setup() {
    const db = getFirestore();
    const auth = getAuth();
    const router = useRouter();
    
    // State variables
    const loading = ref(true);
    const sessions = ref([]);
    const statusFilter = ref('all');
    const activeSession = ref(null);
    const sessionNotes = ref('');
    const chatMessages = ref([]);
    const newMessage = ref('');
    const chatMessagesRef = ref(null);
    
    // WebRTC state
    const localVideoRef = ref(null);
    const remoteVideoRef = ref(null);
    const isMuted = ref(false);
    const isVideoOff = ref(false);
    const isScreenSharing = ref(false);
    const remoteStreamActive = ref(false);
    
    // WebRTC service instance
    let webRTCService = null;
    let unsubscribeMessages = null;
    let unsubscribeSession = null;
    
    // Computed properties
    const filteredSessions = computed(() => {
      if (statusFilter.value === 'all') {
        return sessions.value;
      }
      return sessions.value.filter(session => session.status === statusFilter.value);
    });
    
    // Methods
    const refreshSessions = async () => {
      loading.value = true;
      try {
        const vetId = auth.currentUser?.uid;
        if (!vetId) {
          console.error('User not authenticated');
          router.push('/login');
          return;
        }
        
        const q = query(
          collection(db, 'telehealth_sessions'),
          where('doctorId', '==', vetId)
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
      sessionNotes.value = session.notes || '';
    };
    
    const joinSession = async (session) => {
      try {
        // Update session status to 'in-progress' if it's not already
        if (session.status === 'scheduled') {
          await updateDoc(doc(db, 'telehealth_sessions', session.id), {
            status: 'in-progress',
            vetJoinedAt: serverTimestamp()
          });
        }
        
        activeSession.value = session;
        sessionNotes.value = session.notes || '';
        
        // Subscribe to session updates
        unsubscribeSession = onSnapshot(
          doc(db, 'telehealth_sessions', session.id),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              activeSession.value = {
                id: docSnapshot.id,
                ...docSnapshot.data()
              };
            }
          }
        );
        
        // Subscribe to chat messages
        unsubscribeMessages = onSnapshot(
          query(
            collection(db, 'telehealth_sessions', session.id, 'messages'),
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
          }
        );
        
        // Initialize WebRTC
        initializeWebRTC(session.id);
      } catch (error) {
        console.error('Error joining session:', error);
      }
    };
    
    const cancelSession = async (session) => {
      if (!confirm('Are you sure you want to cancel this session?')) return;
      
      try {
        await updateDoc(doc(db, 'telehealth_sessions', session.id), {
          status: 'cancelled',
          cancelledBy: 'vet',
          cancelledAt: serverTimestamp()
        });
        
        refreshSessions();
      } catch (error) {
        console.error('Error cancelling session:', error);
      }
    };
    
    const saveNotes = async () => {
      if (!activeSession.value) return;
      
      try {
        await updateDoc(doc(db, 'telehealth_sessions', activeSession.value.id), {
          notes: sessionNotes.value,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    };
    
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !activeSession.value) return;
      
      try {
        await addDoc(
          collection(db, 'telehealth_sessions', activeSession.value.id, 'messages'),
          {
            text: newMessage.value.trim(),
            sender: 'vet',
            senderName: 'Dr. ' + (auth.currentUser?.displayName || 'Veterinarian'),
            timestamp: serverTimestamp()
          }
        );
        
        newMessage.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };
    
    const initializeWebRTC = async (sessionId) => {
      try {
        // Initialize WebRTC service
        webRTCService = new WebRTCService({
          localVideoRef: localVideoRef.value,
          remoteVideoRef: remoteVideoRef.value,
          sessionId,
          userId: auth.currentUser?.uid,
          userType: 'vet',
          onRemoteStreamActive: () => {
            remoteStreamActive.value = true;
          },
          onRemoteStreamInactive: () => {
            remoteStreamActive.value = false;
          }
        });
        
        await webRTCService.initialize();
      } catch (error) {
        console.error('Error initializing WebRTC:', error);
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
      }
    };
    
    const endCall = async () => {
      try {
        if (webRTCService) {
          await webRTCService.disconnect();
        }
        
        if (activeSession.value) {
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
        refreshSessions();
      } catch (error) {
        console.error('Error ending call:', error);
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
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
    
    onBeforeUnmount(() => {
      // Clean up WebRTC
      if (webRTCService) {
        webRTCService.disconnect();
      }
      
      // Clean up subscriptions
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
      
      if (unsubscribeSession) {
        unsubscribeSession();
      }
    });
    
    return {
      loading,
      sessions,
      statusFilter,
      filteredSessions,
      activeSession,
      sessionNotes,
      chatMessages,
      newMessage,
      chatMessagesRef,
      localVideoRef,
      remoteVideoRef,
      isMuted,
      isVideoOff,
      isScreenSharing,
      remoteStreamActive,
      refreshSessions,
      formatDate,
      formatTime,
      isSessionJoinable,
      selectSession,
      joinSession,
      cancelSession,
      saveNotes,
      sendMessage,
      toggleMute,
      toggleVideo,
      toggleScreenShare,
      endCall
    };
  }
};
</script>

<style scoped>
.telehealth-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

.patient-info {
  display: flex;
  gap: 20px;
}

.video-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 20px;
  background-color: #1a1a1a;
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
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.7);
}

.local-video {
  position: relative;
  width: 100%;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
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
</style>