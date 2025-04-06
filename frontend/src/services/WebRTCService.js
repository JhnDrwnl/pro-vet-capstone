import { rtdb } from "../firebase-config"
import { ref as dbRef, set, push, onValue, off, remove } from "firebase/database"

class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.callId = null
    this.userId = null
    this.remoteUserId = null
    this.iceCandidatesQueue = []
    this.isConnected = false
    this.listeners = {}
    this.firebaseListeners = []
  }

  async initialize(userId, callId, remoteUserId) {
    this.userId = userId
    this.callId = callId
    this.remoteUserId = remoteUserId

    // Create peer connection with STUN servers
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    }

    this.peerConnection = new RTCPeerConnection(configuration)

    // Set up event listeners
    this.setupPeerConnectionListeners()

    // Set up Firebase listeners
    this.setupFirebaseListeners()

    // Create a new remote stream
    this.remoteStream = new MediaStream()

    return this.peerConnection
  }

  setupPeerConnectionListeners() {
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(event.candidate)
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", this.peerConnection.connectionState)
      if (this.peerConnection.connectionState === "connected") {
        this.isConnected = true
        this.emit("connectionStateChanged", { connected: true })
      } else if (
        this.peerConnection.connectionState === "disconnected" ||
        this.peerConnection.connectionState === "failed"
      ) {
        this.isConnected = false
        this.emit("connectionStateChanged", { connected: false })
      }
    }

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", this.peerConnection.iceConnectionState)
    }

    // Handle signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      console.log("Signaling state:", this.peerConnection.signalingState)
    }

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      console.log("Track received:", event)
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track)
      })
      this.emit("remoteStreamReceived", { stream: this.remoteStream })
    }
  }

  setupFirebaseListeners() {
    // Clear any existing listeners
    this.clearFirebaseListeners()

    // Listen for remote ICE candidates
    const remoteCandidatesRef = dbRef(rtdb, `calls/${this.callId}/candidates/${this.remoteUserId}`)
    const candidatesListener = onValue(remoteCandidatesRef, (snapshot) => {
      const candidates = snapshot.val()
      if (candidates) {
        Object.values(candidates).forEach((candidate) => {
          this.addIceCandidate(candidate)
        })
      }
    })
    this.firebaseListeners.push({ ref: remoteCandidatesRef, listener: candidatesListener })

    // Listen for offer if we're the callee
    const offerRef = dbRef(rtdb, `calls/${this.callId}/offer`)
    const offerListener = onValue(offerRef, (snapshot) => {
      const offer = snapshot.val()
      if (offer && this.userId !== offer.creatorId) {
        this.handleRemoteOffer(offer)
      }
    })
    this.firebaseListeners.push({ ref: offerRef, listener: offerListener })

    // Listen for answer if we're the caller
    const answerRef = dbRef(rtdb, `calls/${this.callId}/answer`)
    const answerListener = onValue(answerRef, (snapshot) => {
      const answer = snapshot.val()
      if (answer && this.userId === answer.receiverId) {
        this.handleRemoteAnswer(answer)
      }
    })
    this.firebaseListeners.push({ ref: answerRef, listener: answerListener })
  }

  clearFirebaseListeners() {
    this.firebaseListeners.forEach(({ ref, listener }) => {
      off(ref, listener)
    })
    this.firebaseListeners = []
  }

  async addLocalStream(stream) {
    this.localStream = stream

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream)
    })
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      await this.peerConnection.setLocalDescription(offer)

      // Send offer to remote peer via Firebase
      const offerData = {
        type: offer.type,
        sdp: offer.sdp,
        creatorId: this.userId,
        receiverId: this.remoteUserId,
        created: new Date().toISOString(),
      }

      await this.sendOffer(offerData)

      return offer
    } catch (error) {
      console.error("Error creating offer:", error)
      throw error
    }
  }

  async handleRemoteOffer(offer) {
    try {
      const rtcOffer = new RTCSessionDescription({
        type: offer.type,
        sdp: offer.sdp,
      })

      await this.peerConnection.setRemoteDescription(rtcOffer)

      // Create answer
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)

      // Send answer to remote peer via Firebase
      const answerData = {
        type: answer.type,
        sdp: answer.sdp,
        creatorId: this.userId,
        receiverId: offer.creatorId,
        created: new Date().toISOString(),
      }

      await this.sendAnswer(answerData)

      return answer
    } catch (error) {
      console.error("Error handling offer:", error)
      throw error
    }
  }

  async handleRemoteAnswer(answer) {
    try {
      const rtcAnswer = new RTCSessionDescription({
        type: answer.type,
        sdp: answer.sdp,
      })

      await this.peerConnection.setRemoteDescription(rtcAnswer)

      // Process any queued ICE candidates
      this.processIceCandidatesQueue()

      return true
    } catch (error) {
      console.error("Error handling answer:", error)
      throw error
    }
  }

  async sendIceCandidate(candidate) {
    try {
      const candidateData = {
        ...candidate.toJSON(),
        created: new Date().toISOString(),
      }

      // Send the candidate to Firebase
      const candidateRef = push(dbRef(rtdb, `calls/${this.callId}/candidates/${this.userId}`))
      await set(candidateRef, candidateData)

      return true
    } catch (error) {
      console.error("Error sending ICE candidate:", error)
      return false
    }
  }

  async addIceCandidate(candidateData) {
    try {
      const candidate = new RTCIceCandidate(candidateData)

      if (this.peerConnection.remoteDescription) {
        await this.peerConnection.addIceCandidate(candidate)
      } else {
        // Queue the candidate for later
        this.iceCandidatesQueue.push(candidate)
      }

      return true
    } catch (error) {
      console.error("Error adding ICE candidate:", error)
      return false
    }
  }

  processIceCandidatesQueue() {
    if (this.iceCandidatesQueue.length > 0 && this.peerConnection.remoteDescription) {
      this.iceCandidatesQueue.forEach(async (candidate) => {
        try {
          await this.peerConnection.addIceCandidate(candidate)
        } catch (error) {
          console.error("Error adding queued ICE candidate:", error)
        }
      })

      this.iceCandidatesQueue = []
    }
  }

  async sendOffer(offer) {
    try {
      await set(dbRef(rtdb, `calls/${this.callId}/offer`), offer)
      return true
    } catch (error) {
      console.error("Error sending offer:", error)
      return false
    }
  }

  async sendAnswer(answer) {
    try {
      await set(dbRef(rtdb, `calls/${this.callId}/answer`), answer)
      return true
    } catch (error) {
      console.error("Error sending answer:", error)
      return false
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data))
    }
  }

  async toggleMute(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted
      })
      return !muted
    }
    return false
  }

  async toggleVideo(videoOff) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoOff
      })
      return !videoOff
    }
    return false
  }

  async toggleScreenShare(isScreenSharing) {
    try {
      if (isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        })

        if (screenStream && this.peerConnection) {
          const videoTrack = screenStream.getVideoTracks()[0]

          // Replace camera with screen
          const senders = this.peerConnection.getSenders()
          const sender = senders.find((s) => s.track && s.track.kind === "video")
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack)
          }

          // Handle when user stops sharing screen
          videoTrack.onended = () => {
            this.toggleScreenShare(false)
          }

          return { success: true, stream: screenStream }
        }
      } else {
        // Stop screen sharing and revert to camera
        if (this.localStream && this.peerConnection) {
          const videoTrack = this.localStream.getVideoTracks()[0]
          const senders = this.peerConnection.getSenders()
          const sender = senders.find((s) => s.track && s.track.kind === "video")
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack)
          }

          return { success: true, stream: this.localStream }
        }
      }

      return { success: false, error: "No local stream or peer connection" }
    } catch (error) {
      console.error("Error toggling screen share:", error)
      return { success: false, error: error.message }
    }
  }

  cleanup() {
    // Clear all Firebase listeners
    this.clearFirebaseListeners()

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Reset state
    this.isConnected = false
    this.iceCandidatesQueue = []
    this.listeners = {}

    // Clean up call data in Firebase
    if (this.callId) {
      remove(dbRef(rtdb, `calls/${this.callId}`))
    }
  }
}

export default new WebRTCService()

