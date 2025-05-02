//services/webrtc-service.js
import { db } from '@shared/firebase'
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, query, where, getDocs, getDoc } from 'firebase/firestore'

class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.roomId = null
    this.callerId = null
    this.calleeId = null
    this.unsubscribeCallDoc = null
    this.unsubscribeAnswerCandidates = null
    this.unsubscribeOfferCandidates = null
    this.pendingIceCandidates = [] // Store pending ICE candidates
    
    // STUN servers for NAT traversal
    this.servers = {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    }
  }

  async setupLocalStream() {
    try {
      console.log("WebRTCService: Requesting camera and microphone access...")
      
      // First try with both video and audio
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: true
        })
        console.log("WebRTCService: Successfully got camera and microphone access")
      } catch (err) {
        console.warn("WebRTCService: Failed to get both camera and microphone, trying camera only", err)
        
        // If that fails, try with just video
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            },
            audio: false
          })
          console.log("WebRTCService: Successfully got camera access (no microphone)")
        } catch (videoErr) {
          console.warn("WebRTCService: Failed to get camera, trying audio only", videoErr)
          
          // If that fails too, try with just audio
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          })
          console.log("WebRTCService: Successfully got audio access (no camera)")
        }
      }
      
      // Verify we have tracks
      if (this.localStream) {
        const videoTracks = this.localStream.getVideoTracks();
        const audioTracks = this.localStream.getAudioTracks();
        console.log(`WebRTCService: Got ${videoTracks.length} video tracks and ${audioTracks.length} audio tracks`);
        
        if (videoTracks.length > 0) {
          console.log(`WebRTCService: Using video device: ${videoTracks[0].label}`);
        }
        if (audioTracks.length > 0) {
          console.log(`WebRTCService: Using audio device: ${audioTracks[0].label}`);
        }
      }
      
      return this.localStream
    } catch (error) {
      console.error('WebRTCService: Error accessing media devices:', error)
      throw new Error(`Camera/microphone access failed: ${error.message}`)
    }
  }

  // Helper method to add ICE candidates safely - FIXED
  async addIceCandidateSafely(candidate) {
    try {
      if (!this.peerConnection) {
        console.warn("WebRTCService: Cannot add ICE candidate - no peer connection exists");
        this.pendingIceCandidates.push(candidate);
        return false;
      }
      
      if (this.peerConnection.remoteDescription) {
        // Check if candidate has a valid sdpMid or sdpMLineIndex before adding
        if (candidate.sdpMid !== null || candidate.sdpMLineIndex !== null) {
          await this.peerConnection.addIceCandidate(candidate);
          return true;
        } else {
          console.warn("WebRTCService: Skipping invalid ICE candidate (missing sdpMid/sdpMLineIndex)");
          return false;
        }
      } else {
        // Store the candidate for later if remote description isn't set yet
        console.log("WebRTCService: Storing ICE candidate for later - remote description not set");
        this.pendingIceCandidates.push(candidate);
        return false;
      }
    } catch (error) {
      console.error('WebRTCService: Error adding ICE candidate:', error);
      // Don't throw from here, just log the error and return false
      return false;
    }
  }

  // Helper method to process pending ICE candidates - FIXED
  async processPendingIceCandidates() {
    if (this.pendingIceCandidates.length > 0 && 
        this.peerConnection && 
        this.peerConnection.remoteDescription) {
      
      console.log(`WebRTCService: Processing ${this.pendingIceCandidates.length} pending ICE candidates`);
      
      // Make a copy and clear the original array
      const candidates = [...this.pendingIceCandidates];
      this.pendingIceCandidates = [];
      
      // Process candidates with delay to avoid race conditions
      for (const candidate of candidates) {
        try {
          // Validate candidate has required properties before adding
          if (candidate.sdpMid !== null || candidate.sdpMLineIndex !== null) {
            await this.peerConnection.addIceCandidate(candidate);
            // Small delay between adding candidates
            await new Promise(resolve => setTimeout(resolve, 50));
          } else {
            console.warn("WebRTCService: Skipping invalid stored ICE candidate");
          }
        } catch (error) {
          console.error('WebRTCService: Error adding pending ICE candidate:', error);
          // Continue processing other candidates even if one fails
        }
      }
    }
  }

  async startCall(appointmentId, callerId, calleeId) {
    try {
      // Create a new room with the appointment ID
      this.roomId = appointmentId
      this.callerId = callerId
      this.calleeId = calleeId
      this.pendingIceCandidates = [] // Reset pending candidates
      
      // Initialize the peer connection
      this.peerConnection = new RTCPeerConnection(this.servers)
      
      // Add local tracks to the peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          console.log(`WebRTCService: Adding ${track.kind} track to peer connection`)
          this.peerConnection.addTrack(track, this.localStream)
        })
      } else {
        console.warn("WebRTCService: No local stream available when starting call")
      }
      
      // Create a remote stream to receive remote tracks
      this.remoteStream = new MediaStream()
      
      // Set up listeners for remote tracks
      this.peerConnection.ontrack = (event) => {
        console.log("WebRTCService: Received remote track", event.track.kind)
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track)
        })
      }
      
      // Add ICE connection state monitoring
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log(`WebRTCService: ICE connection state changed to: ${this.peerConnection.iceConnectionState}`);
        
        // If we're in a failed state, try to restart ICE
        if (this.peerConnection.iceConnectionState === 'failed') {
          console.warn('WebRTCService: ICE connection failed, attempting to restart');
          this.peerConnection.restartIce();
        }
      };
      
      try {
        // Create room in Firestore
        const callDoc = doc(db, 'calls', this.roomId)
        const offerCandidates = collection(callDoc, 'offerCandidates')
        const answerCandidates = collection(callDoc, 'answerCandidates')
        
        // Listen for ICE candidates and add them to Firestore
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            try {
              console.log(`WebRTCService: Generated ICE candidate for ${event.candidate.sdpMid || 'unknown'} mline ${event.candidate.sdpMLineIndex}`);
              setDoc(doc(offerCandidates), { ...event.candidate.toJSON() })
            } catch (error) {
              console.error('WebRTCService: Error saving ICE candidate:', error)
            }
          }
        }
        
        // Create offer
        const offerDescription = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offerDescription)
        
        // Save the offer to Firestore with error handling
        try {
          await setDoc(callDoc, {
            offer: {
              type: offerDescription.type,
              sdp: offerDescription.sdp
            },
            callerId: this.callerId,
            calleeId: this.calleeId,
            status: 'pending',
            createdAt: new Date().toISOString()
          }, { merge: true }) // Use merge option to avoid overwriting existing data
        } catch (error) {
          console.error('WebRTCService: Error saving offer to Firestore:', error)
          throw new Error('Failed to save call information. Please try again.')
        }
        
        // Listen for remote answer with error handling
        this.unsubscribeCallDoc = onSnapshot(callDoc, {
          next: async (snapshot) => {
            try {
              const data = snapshot.data()
              
              // If call was rejected
              if (data?.status === 'rejected') {
                this.hangUp()
                return
              }
              
              // If we don't have an answer yet, and the remote user provided one
              if (!this.peerConnection.currentRemoteDescription && data?.answer) {
                console.log('WebRTCService: Received answer from remote peer');
                const answerDescription = new RTCSessionDescription(data.answer)
                await this.peerConnection.setRemoteDescription(answerDescription)
                
                // Process any pending ICE candidates now that we have the remote description
                // Add a small delay to ensure signaling state is stable
                setTimeout(() => this.processPendingIceCandidates(), 200);
              }
            } catch (error) {
              console.error('WebRTCService: Error processing call document update:', error)
            }
          },
          error: (error) => {
            console.error('WebRTCService: Error listening to call document:', error)
          }
        })
        
        // Listen for remote ICE candidates with error handling
        this.unsubscribeAnswerCandidates = onSnapshot(answerCandidates, {
          next: (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === 'added') {
                try {
                  const data = change.doc.data();
                  console.log(`WebRTCService: Received ICE candidate for ${data.sdpMid || 'unknown'} mline ${data.sdpMLineIndex}`);
                  const candidate = new RTCIceCandidate(data)
                  // Use the safe method to add ICE candidates
                  await this.addIceCandidateSafely(candidate)
                } catch (error) {
                  console.error('WebRTCService: Error processing ICE candidate:', error)
                }
              }
            })
          },
          error: (error) => {
            console.error('WebRTCService: Error listening to answer candidates:', error)
          }
        })
      } catch (firestoreError) {
        console.error('WebRTCService: Firestore operation failed:', firestoreError)
        // Fallback to direct WebRTC connection without Firestore
        console.log('WebRTCService: Attempting direct WebRTC connection without Firestore signaling')
        // The connection will rely solely on ICE candidates and STUN servers
      }
      
      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream
      }
    } catch (error) {
      console.error('WebRTCService: Error starting call:', error)
      throw error
    }
  }

  async answerCall(appointmentId) {
    try {
      this.roomId = appointmentId
      this.pendingIceCandidates = [] // Reset pending candidates
      
      // Initialize the peer connection
      this.peerConnection = new RTCPeerConnection(this.servers)
      
      // Add local tracks to the peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream)
        })
      } else {
        console.warn("WebRTCService: No local stream available when answering call")
      }
      
      // Create a remote stream to receive remote tracks
      this.remoteStream = new MediaStream()
      
      // Set up listeners for remote tracks
      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track)
        })
      }
      
      // Add ICE connection state monitoring
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log(`WebRTCService: ICE connection state changed to: ${this.peerConnection.iceConnectionState}`);
        
        // If we're in a failed state, try to restart ICE
        if (this.peerConnection.iceConnectionState === 'failed') {
          console.warn('WebRTCService: ICE connection failed, attempting to restart');
          this.peerConnection.restartIce();
        }
      };
      
      try {
        // Get the call document from Firestore
        const callDoc = doc(db, 'calls', this.roomId)
        const answerCandidates = collection(callDoc, 'answerCandidates')
        const offerCandidates = collection(callDoc, 'offerCandidates')
        
        // Listen for ICE candidates and add them to Firestore
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            try {
              console.log(`WebRTCService: Generated ICE candidate for ${event.candidate.sdpMid || 'unknown'} mline ${event.candidate.sdpMLineIndex}`);
              setDoc(doc(answerCandidates), { ...event.candidate.toJSON() })
            } catch (error) {
              console.error('WebRTCService: Error saving ICE candidate:', error)
            }
          }
        }
        
        // Get the offer from Firestore
        const callSnapshot = await getDoc(callDoc)
        if (!callSnapshot.exists()) {
          throw new Error('Call not found')
        }
        
        const callData = callSnapshot.data()
        
        // Set the offer as remote description - FIXED
        const offerDescription = callData.offer
        console.log("WebRTCService: Setting remote description from offer");
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription))
          console.log("WebRTCService: Remote description set successfully");
          
          // Process any pending ICE candidates with a slight delay to ensure signaling state is stable
          setTimeout(() => this.processPendingIceCandidates(), 200);
        } catch(error) {
          console.error("WebRTCService: Error setting remote description:", error);
          throw error; // This is critical, so we do want to throw
        }
        
        // Create answer
        const answerDescription = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answerDescription)
        
        // Save the answer to Firestore with error handling
        try {
          await updateDoc(callDoc, {
            answer: {
              type: answerDescription.type,
              sdp: answerDescription.sdp
            },
            status: 'connected'
          })
        } catch (error) {
          console.error('WebRTCService: Error saving answer to Firestore:', error)
          // Continue with the call even if Firestore update fails
          console.log('WebRTCService: Continuing with call despite Firestore error')
        }
        
        // Listen for remote ICE candidates with error handling
        this.unsubscribeOfferCandidates = onSnapshot(offerCandidates, {
          next: (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === 'added') {
                try {
                  const data = change.doc.data();
                  console.log(`WebRTCService: Received ICE candidate for ${data.sdpMid || 'unknown'} mline ${data.sdpMLineIndex}`);
                  const candidate = new RTCIceCandidate(data)
                  // Use the safe method to add ICE candidates
                  await this.addIceCandidateSafely(candidate)
                } catch (error) {
                  console.error('WebRTCService: Error processing ICE candidate:', error)
                }
              }
            })
          },
          error: (error) => {
            console.error('WebRTCService: Error listening to offer candidates:', error)
          }
        })
      } catch (firestoreError) {
        console.error('WebRTCService: Firestore operation failed:', firestoreError)
        // Continue with the WebRTC connection even if Firestore fails
        console.log('WebRTCService: Attempting to continue with WebRTC connection despite Firestore error')
      }
      
      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream
      }
    } catch (error) {
      console.error('WebRTCService: Error answering call:', error)
      throw error
    }
  }

  async rejectCall(appointmentId) {
    try {
      const callDoc = doc(db, 'calls', appointmentId)
      try {
        await updateDoc(callDoc, {
          status: 'rejected'
        })
      } catch (error) {
        console.error('WebRTCService: Error updating call status in Firestore:', error)
      }
    } catch (error) {
      console.error('WebRTCService: Error rejecting call:', error)
      throw error
    }
  }

  async hangUp() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }
    
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    // Clean up Firestore
    if (this.roomId) {
      try {
        const callDoc = doc(db, 'calls', this.roomId)
        await updateDoc(callDoc, { status: 'ended' })
      } catch (error) {
        console.error('WebRTCService: Error cleaning up call in Firestore:', error)
      }
      
      // Unsubscribe from snapshots
      if (this.unsubscribeCallDoc) this.unsubscribeCallDoc()
      if (this.unsubscribeAnswerCandidates) this.unsubscribeAnswerCandidates()
      if (this.unsubscribeOfferCandidates) this.unsubscribeOfferCandidates()
    }
    
    this.roomId = null
    this.callerId = null
    this.calleeId = null
    this.remoteStream = null
    this.pendingIceCandidates = []
  }

  async checkForIncomingCalls(userId) {
    try {
      const callsRef = collection(db, 'calls')
      const q = query(callsRef, where('calleeId', '==', userId), where('status', '==', 'pending'))
      
      try {
        const querySnapshot = await getDocs(q)
        const incomingCalls = []
        
        querySnapshot.forEach((doc) => {
          incomingCalls.push({
            id: doc.id,
            ...doc.data()
          })
        })
        
        return incomingCalls
      } catch (error) {
        console.error('WebRTCService: Error querying Firestore for incoming calls:', error)
        return []
      }
    } catch (error) {
      console.error('WebRTCService: Error checking for incoming calls:', error)
      return []
    }
  }

  listenForIncomingCalls(userId, callback) {
    if (!userId || !callback) {
      console.error('WebRTCService: Invalid parameters for listenForIncomingCalls')
      return () => {}
    }

    try {
      const callsRef = collection(db, 'calls')
      const q = query(callsRef, where('calleeId', '==', userId), where('status', '==', 'pending'))
      
      // Set up the listener
      const unsubscribe = onSnapshot(q, {
        next: (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const callData = {
                id: change.doc.id,
                ...change.doc.data()
              }
              callback(callData)
            }
          })
        },
        error: (error) => {
          console.error('WebRTCService: Error listening for incoming calls:', error)
        }
      })
      
      return unsubscribe
    } catch (error) {
      console.error('WebRTCService: Error setting up incoming calls listener:', error)
      return () => {}
    }
  }

  toggleMute(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted
      })
    }
  }

  toggleVideo(videoOff) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoOff
      })
    }
  }

  async toggleScreenShare(isScreenSharing) {
    if (!this.peerConnection) return
    
    try {
      if (isScreenSharing) {
        // Stop screen sharing and go back to camera
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            if (track.kind === 'video') {
              track.stop()
              
              // Remove the track from the peer connection
              const senders = this.peerConnection.getSenders()
              const sender = senders.find(s => s.track && s.track.kind === 'video')
              if (sender) {
                this.peerConnection.removeTrack(sender)
              }
            }
          })
          
          // Get new camera stream
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            }
          })
          
          // Add the new video track to the peer connection
          const videoTrack = cameraStream.getVideoTracks()[0]
          this.peerConnection.addTrack(videoTrack, this.localStream)
          
          // Replace the video track in the local stream
          const audioTracks = this.localStream.getAudioTracks()
          this.localStream = new MediaStream([...audioTracks, videoTrack])
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        })
        
        // Replace video track
        if (this.localStream) {
          const videoTrack = screenStream.getVideoTracks()[0]
          
          // Remove the old video track from the peer connection
          const senders = this.peerConnection.getSenders()
          const sender = senders.find(s => s.track && s.track.kind === 'video')
          if (sender) {
            this.peerConnection.removeTrack(sender)
          }
          
          // Add the new screen sharing track to the peer connection
          this.peerConnection.addTrack(videoTrack, screenStream)
          
          // Replace the video track in the local stream
          const audioTracks = this.localStream.getAudioTracks()
          this.localStream = new MediaStream([...audioTracks, videoTrack])
          
          // Handle the case when user stops sharing via the browser UI
          videoTrack.onended = async () => {
            // Automatically switch back to camera when screen sharing stops
            const cameraStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user"
              }
            })
            
            const newVideoTrack = cameraStream.getVideoTracks()[0]
            
            // Replace the track in the peer connection
            const senders = this.peerConnection.getSenders()
            const sender = senders.find(s => s.track && s.track.kind === 'video')
            if (sender) {
              sender.replaceTrack(newVideoTrack)
            }
            
            // Update the local stream
            const audioTracks = this.localStream.getAudioTracks()
            this.localStream = new MediaStream([...audioTracks, newVideoTrack])
            
            return this.localStream
          }
        }
      }
      
      return this.localStream
    } catch (error) {
      console.error('WebRTCService: Error toggling screen share:', error)
      throw error
    }
  }
}

export default new WebRTCService()