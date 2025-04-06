import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, db, rtdb, storage } from '../../firebase-config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { 
  ref as dbRef, 
  set, 
  push, 
  update, 
  onValue, 
  off, 
  onDisconnect, 
  remove,
  get
} from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import WebRTCService from '../../services/WebRTCService'
import RecordingService from '../../services/RecordingService'

export const useTelehealthStore = defineStore('telehealth', () => {
  // User state
  const currentUser = ref(null)
  const userProfile = ref(null)
  const isDoctor = computed(() => userProfile.value?.role === 'veterinary')
  
  // Call state
  const localStream = ref(null)
  const remoteStream = ref(null)
  const callStatus = ref('idle') // idle, calling, connected, ended
  const currentMeeting = ref(null)
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  const isRecording = ref(false)
  const callId = ref(null)
  const isCallInProgress = computed(() => callStatus.value === 'calling' || callStatus.value === 'connected')
  
  // Sessions state
  const upcomingSessions = ref([])
  const pastSessions = ref([])
  const incomingCall = ref(null)
  
  // Initialize store
  const initialize = async () => {
    try {
      // Get current user
      if (auth.currentUser) {
        currentUser.value = auth.currentUser
        
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid))
        if (userDoc.exists()) {
          userProfile.value = userDoc.data()
        }
        
        // Set up call listener
        setupCallListener()
        
        // Load user sessions
        await loadUserSessions()
      }
      
      return true
    } catch (error) {
      console.error('Error initializing telehealth store:', error)
      return false
    }
  }
  
  // Set up listener for incoming calls
  const setupCallListener = () => {
    if (!currentUser.value) return
    
    // Listen for incoming calls
    const userCallsRef = dbRef(rtdb, `users/${currentUser.value.uid}/calls`)
    onValue(userCallsRef, (snapshot) => {
      const calls = snapshot.val()
      if (calls) {
        // Check for new incoming calls
        Object.entries(calls).forEach(([id, call]) => {
          if (call.status === 'incoming' && !incomingCall.value) {
            handleIncomingCall(id, call)
          }
        })
      }
    })
  }
  
  // Handle incoming call
  const handleIncomingCall = async (id, call) => {
    try {
      // Get caller info
      const callerDoc = await getDoc(doc(db, 'users', call.callerId))
      if (callerDoc.exists()) {
        const caller = callerDoc.data()
        
        // Set incoming call
        incomingCall.value = {
          id: id,
          callerId: call.callerId,
          name: caller.displayName || caller.email || 'Unknown',
          title: call.title || 'Video Call',
          timestamp: call.timestamp
        }
        
        // Emit event for UI to show incoming call
        window.dispatchEvent(new CustomEvent('incomingCall', { detail: incomingCall.value }))
      }
    } catch (error) {
      console.error('Error handling incoming call:', error)
    }
  }
  
  // Load user sessions
  const loadUserSessions = async () => {
    if (!currentUser.value) return
    
    try {
      const sessionsRef = collection(db, 'sessions')
      let sessionsQuery
      
      if (isDoctor.value) {
        sessionsQuery = query(sessionsRef, where('doctorId', '==', currentUser.value.uid))
      } else {
        sessionsQuery = query(sessionsRef, where('patientId', '==', currentUser.value.uid))
      }
      
      const sessionsSnapshot = await getDocs(sessionsQuery)
      const sessions = []
      
      sessionsSnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
          scheduledTime: doc.data().scheduledTime?.toDate?.() || doc.data().scheduledTime
        })
      })
      
      // Split into upcoming and past sessions
      const now = new Date()
      upcomingSessions.value = sessions.filter(session => 
        new Date(session.scheduledTime) > now && session.status !== 'cancelled'
      ).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
      
      pastSessions.value = sessions.filter(session => 
        new Date(session.scheduledTime) <= now || session.status === 'cancelled'
      ).sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime))
      
      return sessions
    } catch (error) {
      console.error('Error loading sessions:', error)
      return []
    }
  }
  
  // Initiate a call
  const initiateCall = async (meetingId) => {
    try {
      // Get meeting details
      const meetingDoc = await getDoc(doc(db, 'sessions', meetingId))
      if (!meetingDoc.exists()) {
        throw new Error('Meeting not found')
      }
      
      const meeting = {
        id: meetingDoc.id,
        ...meetingDoc.data(),
        scheduledTime: meetingDoc.data().scheduledTime?.toDate?.() || meetingDoc.data().scheduledTime
      }
      
      currentMeeting.value = meeting
      
      // Create a new call in Firebase
      const newCallRef = push(dbRef(rtdb, 'calls'))
      callId.value = newCallRef.key
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      })
      
      localStream.value = stream
      
      // Initialize WebRTC service
      const recipientId = isDoctor.value ? meeting.patientId : meeting.doctorId
      await WebRTCService.initialize(currentUser.value.uid, callId.value, recipientId)
      
      // Add local stream to peer connection
      await WebRTCService.addLocalStream(stream)
      
      // Set up WebRTC event listeners
      setupWebRTCListeners()
      
      // Create and send offer
      await WebRTCService.createOffer()
      
      // Update call status
      callStatus.value = 'calling'
      
      // Notify recipient of call
      const recipientCallRef = dbRef(rtdb, `users/${recipientId}/calls/${callId.value}`)
      await set(recipientCallRef, {
        callerId: currentUser.value.uid,
        callId: callId.value,
        status: 'incoming',
        title: meeting.title,
        timestamp: Date.now()
      })
      
      // Set up cleanup on disconnect
      const callRef = dbRef(rtdb, `calls/${callId.value}`)
      onDisconnect(callRef).remove()
      
      return { success: true, callId: callId.value }
    } catch (error) {
      console.error('Error initiating call:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Answer an incoming call
  const answerCall = async () => {
    if (!incomingCall.value) return { success: false, error: 'No incoming call' }
    
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      })
      
      localStream.value = stream
      
      // Initialize WebRTC service
      await WebRTCService.initialize(currentUser.value.uid, incomingCall.value.id, incomingCall.value.callerId)
      
      // Set up WebRTC event listeners
      setupWebRTCListeners()
      
      // Add local stream to peer connection
      await WebRTCService.addLocalStream(stream)
      
      // Update call status
      callStatus.value = 'connected'
      callId.value = incomingCall.value.id
      
      // Update incoming call status
      const userCallRef = dbRef(rtdb, `users/${currentUser.value.uid}/calls/${incomingCall.value.id}`)
      await update(userCallRef, { status: 'answered' })
      
      // Clear incoming call
      incomingCall.value = null
      
      return { success: true, callId: callId.value }
    } catch (error) {
      console.error('Error answering call:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Reject an incoming call
  const rejectCall = async () => {
    if (!incomingCall.value) return { success: false, error: 'No incoming call' }
    
    try {
      // Update incoming call status
      const userCallRef = dbRef(rtdb, `users/${currentUser.value.uid}/calls/${incomingCall.value.id}`)
      await update(userCallRef, { status: 'rejected' })
      
      // Clear incoming call
      incomingCall.value = null
      
      return { success: true }
    } catch (error) {
      console.error('Error rejecting call:', error)
      return { success: false, error: error.message }
    }
  }
  
  // End the current call
  const endCall = async () => {
    try {
      // Update call status
      callStatus.value = 'ended'
      
      // Stop recording if active
      if (isRecording.value) {
        await stopRecording()
      }
      
      // Clean up WebRTC
      WebRTCService.cleanup()
      
      // Stop local stream
      if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop())
        localStream.value = null
      }
      
      // Clear remote stream
      remoteStream.value = null
      
      // Update call in Firebase if we have a callId
      if (callId.value) {
        const callRef = dbRef(rtdb, `calls/${callId.value}`)
        await update(callRef, { status: 'ended', endTime: Date.now() })
        
        // Update session if this was a scheduled meeting
        if (currentMeeting.value?.id) {
          await updateDoc(doc(db, 'sessions', currentMeeting.value.id), {
            status: 'completed',
            endTime: serverTimestamp()
          })
        }
        
        // Clear call ID
        callId.value = null
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error ending call:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Toggle audio mute
  const toggleAudio = () => {
    isMuted.value = !isMuted.value
    return WebRTCService.toggleMute(isMuted.value)
  }
  
  // Toggle video
  const toggleVideo = () => {
    isVideoOff.value = !isVideoOff.value
    return WebRTCService.toggleVideo(isVideoOff.value)
  }
  
  // Start recording
  const startRecording = async () => {
    if (!localStream.value || !remoteStream.value) {
      return { success: false, error: 'No streams available' }
    }
    
    try {
      await RecordingService.startRecording(localStream.value, remoteStream.value)
      isRecording.value = true
      return { success: true }
    } catch (error) {
      console.error('Error starting recording:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Stop recording
  const stopRecording = async () => {
    if (!isRecording.value) {
      return { success: false, error: 'Not recording' }
    }
    
    try {
      const recordingBlob = await RecordingService.stopRecording()
      isRecording.value = false
      
      // Upload recording if we have a meeting ID
      if (currentMeeting.value?.id && recordingBlob) {
        const fileName = `recordings/${currentMeeting.value.id}_${Date.now()}.webm`
        const recordingRef = storageRef(storage, fileName)
        
        await uploadBytes(recordingRef, recordingBlob)
        const downloadURL = await getDownloadURL(recordingRef)
        
        // Update session with recording URL
        await updateDoc(doc(db, 'sessions', currentMeeting.value.id), {
          recordingUrl: downloadURL,
          updatedAt: serverTimestamp()
        })
        
        return { success: true, recordingUrl: downloadURL }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error stopping recording:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Save session notes
  const saveSessionNotes = async (sessionId, notes) => {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        notes: notes,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error saving session notes:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Set up WebRTC event listeners
  const setupWebRTCListeners = () => {
    // Listen for remote stream
    WebRTCService.on('remoteStreamReceived', (data) => {
      remoteStream.value = data.stream
    })
    
    // Listen for connection state changes
    WebRTCService.on('connectionStateChanged', (data) => {
      if (data.connected) {
        callStatus.value = 'connected'
      } else {
        callStatus.value = 'ended'
      }
    })
  }
  
  // Logout
  const logout = async () => {
    // End any active call
    if (isCallInProgress.value) {
      await endCall()
    }
    
    // Clear state
    currentUser.value = null
    userProfile.value = null
    upcomingSessions.value = []
    pastSessions.value = []
    incomingCall.value = null
    
    return true
  }
  
  return {
    // State
    currentUser,
    userProfile,
    isDoctor,
    localStream,
    remoteStream,
    callStatus,
    currentMeeting,
    isMuted,
    isVideoOff,
    isRecording,
    callId,
    isCallInProgress,
    upcomingSessions,
    pastSessions,
    incomingCall,
    
    // Methods
    initialize,
    loadUserSessions,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startRecording,
    stopRecording,
    saveSessionNotes,
    logout
  }
})