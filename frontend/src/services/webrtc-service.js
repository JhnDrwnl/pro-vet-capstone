//services/webrtc-service.js
import { db } from '@shared/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callDoc = null;
    this.callId = null;
    this.callerId = null;
    this.calleeId = null;
    this.role = null; // 'caller' or 'callee'
    this.iceCandidatesUnsubscribe = null;
    this.callDocUnsubscribe = null;
    this.screenStream = null;
    this.originalVideoTrack = null;
    
    // ICE servers configuration
    this.configuration = {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };
  }

  // Setup local media stream
  async setupLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Create a remote stream for receiving
      this.remoteStream = new MediaStream();
      
      return this.localStream;
    } catch (error) {
      console.error('Error setting up local stream:', error);
      throw error;
    }
  }

  // Initialize peer connection
  async initializePeerConnection() {
    try {
      // Create a new RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Add local tracks to the peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      // Set up event handlers for the peer connection
      this.setupPeerConnectionEventHandlers();
      
      return this.peerConnection;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      throw error;
    }
  }

  // Set up event handlers for the peer connection
  setupPeerConnectionEventHandlers() {
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState);
    };
    
    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      
      if (this.peerConnection.iceConnectionState === 'connected') {
        // Connection established successfully
        console.log('Call connected');
      } else if (this.peerConnection.iceConnectionState === 'failed' || 
                this.peerConnection.iceConnectionState === 'disconnected' ||
                this.peerConnection.iceConnectionState === 'closed') {
        // Connection failed or was disconnected
        console.log('Call disconnected or failed');
      }
    };
    
    // Handle ICE candidate events
    this.peerConnection.onicecandidate = (event) => {
      if (!event.candidate) return;
      
      // Add the ICE candidate to Firestore
      this.addIceCandidate(event.candidate);
    };
    
    // Handle track events
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      
      // Add the remote tracks to the remote stream
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
    };
  }

  // Start a call
  async startCall(appointmentId, callerId, calleeId) {
    try {
      this.callId = appointmentId;
      this.callerId = callerId;
      this.calleeId = calleeId;
      this.role = 'caller';
      
      // Initialize the peer connection
      await this.initializePeerConnection();
      
      // Create the call document in Firestore
      const callsRef = collection(db, 'calls');
      this.callDoc = doc(callsRef, this.callId);
      
      // Create offer
      const offerDescription = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offerDescription);
      
      // Store the call data in Firestore
      const callData = {
        callerId: this.callerId,
        calleeId: this.calleeId,
        offer: {
          type: offerDescription.type,
          sdp: offerDescription.sdp
        },
        answer: null,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      await setDoc(this.callDoc, callData);
      
      // Create subcollections for ICE candidates
      const callerCandidatesRef = collection(this.callDoc, 'callerCandidates');
      const calleeCandidatesRef = collection(this.callDoc, 'calleeCandidates');
      
      // Listen for remote answer
      this.callDocUnsubscribe = onSnapshot(this.callDoc, async (snapshot) => {
        const data = snapshot.data();
        
        // If we don't have an answer yet and the remote side has answered
        if (!this.peerConnection.currentRemoteDescription && data?.answer) {
          console.log('Setting remote description with answer');
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answerDescription);
        }
        
        // Check call status
        if (data?.status === 'rejected') {
          console.log('Call was rejected');
          this.hangUp();
        } else if (data?.status === 'ended') {
          console.log('Call was ended by the other party');
          this.hangUp();
        }
      });
      
      // Listen for remote ICE candidates
      this.iceCandidatesUnsubscribe = onSnapshot(calleeCandidatesRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            console.log('Got new remote ICE candidate');
            
            try {
              // Make sure we have a remote description before adding ICE candidates
              if (this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
              } else {
                console.log('Skipping ICE candidate - no remote description yet');
              }
            } catch (error) {
              console.error('Error adding received ICE candidate:', error);
            }
          }
        });
      });
      
      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream
      };
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  // Answer a call
  async answerCall(callId) {
    try {
      this.callId = callId;
      this.role = 'callee';
      
      // Get the call document
      const callsRef = collection(db, 'calls');
      this.callDoc = doc(callsRef, this.callId);
      
      const callSnapshot = await getDoc(this.callDoc);
      if (!callSnapshot.exists()) {
        throw new Error('Call does not exist');
      }
      
      const callData = callSnapshot.data();
      this.callerId = callData.callerId;
      this.calleeId = callData.calleeId;
      
      // Initialize the peer connection
      await this.initializePeerConnection();
      
      // Set the remote description (offer)
      const offerDescription = callData.offer;
      console.log('Setting remote description with offer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));
      
      // Create answer
      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);
      
      // Update the call document with the answer
      await updateDoc(this.callDoc, {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp
        },
        status: 'active'
      });
      
      // Listen for remote ICE candidates
      const callerCandidatesRef = collection(this.callDoc, 'callerCandidates');
      this.iceCandidatesUnsubscribe = onSnapshot(callerCandidatesRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            console.log('Got new remote ICE candidate');
            
            try {
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
            } catch (error) {
              console.error('Error adding received ICE candidate:', error);
            }
          }
        });
      });
      
      // Listen for call status changes
      this.callDocUnsubscribe = onSnapshot(this.callDoc, (snapshot) => {
        const data = snapshot.data();
        if (data?.status === 'ended') {
          console.log('Call was ended by the other party');
          this.hangUp();
        }
      });
      
      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream
      };
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  // Add ICE candidate to Firestore
  async addIceCandidate(candidate) {
    try {
      if (!this.callDoc) {
        console.error('Call document not initialized');
        return;
      }
      
      const candidateCollection = this.role === 'caller' ? 'callerCandidates' : 'calleeCandidates';
      const candidatesRef = collection(this.callDoc, candidateCollection);
      
      await setDoc(doc(candidatesRef), candidate.toJSON());
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Hang up the call
  async hangUp() {
    try {
      // Stop listening for updates
      if (this.callDocUnsubscribe) {
        this.callDocUnsubscribe();
        this.callDocUnsubscribe = null;
      }
      
      if (this.iceCandidatesUnsubscribe) {
        this.iceCandidatesUnsubscribe();
        this.iceCandidatesUnsubscribe = null;
      }
      
      // Update call status in Firestore
      if (this.callDoc) {
        await updateDoc(this.callDoc, { status: 'ended' });
      }
      
      // Close the peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Stop all tracks in the local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Clear the remote stream
      this.remoteStream = null;
      
      // Clear screen sharing if active
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      
      // Reset state
      this.callId = null;
      this.callerId = null;
      this.calleeId = null;
      this.role = null;
      this.originalVideoTrack = null;
    } catch (error) {
      console.error('Error hanging up call:', error);
    }
  }

  // Reject an incoming call
  async rejectCall(callId) {
    try {
      const callsRef = collection(db, 'calls');
      const callDoc = doc(callsRef, callId);
      
      await updateDoc(callDoc, { status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }

  // Check for incoming calls
  async checkForIncomingCalls(userId) {
    try {
      const callsRef = collection(db, 'calls');
      const q = query(
        callsRef,
        where('calleeId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const incomingCalls = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incomingCalls.push({
          id: doc.id,
          callerId: data.callerId
        });
      });
      
      return incomingCalls;
    } catch (error) {
      console.error('Error checking for incoming calls:', error);
      return [];
    }
  }

  // Listen for incoming calls
  listenForIncomingCalls(userId, callback) {
    try {
      const callsRef = collection(db, 'calls');
      const q = query(
        callsRef,
        where('calleeId', '==', userId),
        where('status', '==', 'pending')
      );
      
      return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            callback({
              id: change.doc.id,
              callerId: data.callerId
            });
          }
        });
      });
    } catch (error) {
      console.error('Error listening for incoming calls:', error);
      return () => {}; // Return empty function as unsubscribe
    }
  }

  // Toggle mute
  toggleMute(muted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  // Toggle video
  toggleVideo(videoOff) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoOff;
      });
    }
  }

  // Toggle screen sharing
  async toggleScreenShare(isCurrentlySharing) {
    try {
      if (isCurrentlySharing) {
        // Switch back to camera
        if (this.originalVideoTrack && this.localStream) {
          const videoSender = this.peerConnection.getSenders().find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender) {
            await videoSender.replaceTrack(this.originalVideoTrack);
          }
          
          // Add the track back to the local stream
          const oldTrack = this.localStream.getVideoTracks()[0];
          if (oldTrack) {
            oldTrack.stop();
            this.localStream.removeTrack(oldTrack);
          }
          this.localStream.addTrack(this.originalVideoTrack);
          
          // Stop screen sharing tracks
          if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
          }
          
          this.originalVideoTrack = null;
          return this.localStream;
        }
      } else {
        // Switch to screen sharing
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Save the original video track
        this.originalVideoTrack = this.localStream.getVideoTracks()[0];
        
        // Replace the video track in the peer connection
        const videoSender = this.peerConnection.getSenders().find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        const screenTrack = this.screenStream.getVideoTracks()[0];
        
        if (videoSender && screenTrack) {
          await videoSender.replaceTrack(screenTrack);
        }
        
        // Replace the track in the local stream for local display
        const oldTrack = this.localStream.getVideoTracks()[0];
        if (oldTrack) {
          oldTrack.stop();
          this.localStream.removeTrack(oldTrack);
        }
        this.localStream.addTrack(screenTrack);
        
        // Handle the screen sharing ending
        screenTrack.onended = async () => {
          if (this.originalVideoTrack) {
            const videoSender = this.peerConnection.getSenders().find(sender => 
              sender.track && sender.track.kind === 'video'
            );
            
            if (videoSender) {
              await videoSender.replaceTrack(this.originalVideoTrack);
            }
            
            // Replace in local stream
            const oldTrack = this.localStream.getVideoTracks()[0];
            if (oldTrack) {
              oldTrack.stop();
              this.localStream.removeTrack(oldTrack);
            }
            this.localStream.addTrack(this.originalVideoTrack);
            
            this.originalVideoTrack = null;
          }
        };
        
        return this.localStream;
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      throw error;
    }
  }

  // Check if remote stream has tracks
  checkRemoteStream() {
    if (this.remoteStream) {
      return this.remoteStream.getTracks().length > 0;
    }
    return false;
  }
}

export default new WebRTCService();