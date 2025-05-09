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
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import XirsysService from './xirsys-service';

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
    this.pendingCandidates = []; // Initialize as empty array
    this.connectionTimeout = null; // For connection timeout handling
    this.maxPendingCandidates = 20; // Limit the number of candidates to process
    this.isProcessingCandidates = false; // Flag to prevent concurrent processing
    this.candidateCounter = 0; // Counter to limit candidate processing
    this.candidateProcessingInterval = null; // For throttling candidate processing
    this.remoteTracksDetected = false; // Flag to track if remote tracks are detected
    this.isAudioOnly = false; // Flag to track if we're in audio-only mode
    
    // Default ICE configuration (will be replaced with Xirsys config)
    this.configuration = {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ]
        }
      ],
      iceCandidatePoolSize: 10,
    };
  }

  // Setup local media stream with fallback to audio-only if video fails
  async setupLocalStream(audioOnly = false) {
    try {
      this.isAudioOnly = audioOnly;
      
      // Try to get audio and video (unless audio-only mode is requested)
      if (!audioOnly) {
        try {
          // Use lower resolution and frame rate to reduce bandwidth
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 24 }
            },
            audio: true
          });
        } catch (videoError) {
          console.warn('Failed to get video, falling back to audio only:', videoError);
          this.isAudioOnly = true;
          
          // Fall back to audio only
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
        }
      } else {
        // Audio only was explicitly requested
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }
      
      // Create a remote stream for receiving
      this.remoteStream = new MediaStream();
      
      return this.localStream;
    } catch (error) {
      console.error('Error setting up local stream:', error);
      throw error;
    }
  }

  // Set an existing stream as the local stream
  setLocalStream(stream) {
    if (stream && stream.getTracks().length > 0) {
      this.localStream = stream;
      
      // Check if this is audio-only
      this.isAudioOnly = !stream.getVideoTracks().length;
      
      // Create a remote stream for receiving if it doesn't exist
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      return true;
    }
    return false;
  }

  // Initialize peer connection with Xirsys ICE servers
  async initializePeerConnection() {
    try {
      // Ensure we have a local stream before proceeding
      if (!this.localStream) {
        console.log('Local stream not initialized, setting up now...');
        await this.setupLocalStream();
      }
      
      // Get ICE configuration from Xirsys
      let iceConfig;
      try {
        iceConfig = await XirsysService.getIceServers();
        console.log('Using Xirsys ICE configuration');
      } catch (error) {
        console.warn('Failed to get Xirsys ICE servers, using default configuration:', error);
        iceConfig = this.configuration;
      }
      
      // Create a new RTCPeerConnection with optimized configuration
      this.peerConnection = new RTCPeerConnection({
        ...iceConfig,
        sdpSemantics: 'unified-plan',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });
      
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
      
      // Update Firestore with connection state for better UI feedback
      if (this.callDoc && this.peerConnection.connectionState === 'connected') {
        updateDoc(this.callDoc, {
          connectionState: 'connected',
          status: 'connected',
          hasRemoteTracks: true
        }).catch(error => {
          console.error('Error updating connection state:', error);
        });
        
        // Clear any connection timeout when connected
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
      }
    };
    
    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      
      if (this.peerConnection.iceConnectionState === 'connected') {
        // Connection established successfully
        console.log('Call connected');
        
        // Update call status in Firestore to indicate connection is established
        if (this.callDoc) {
          updateDoc(this.callDoc, {
            status: 'connected',
            hasRemoteTracks: true,
            iceConnectionState: 'connected'
          }).catch(error => {
            console.error('Error updating call status:', error);
          });
        }
        
        // Clear any connection timeout when connected
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        // Clear candidate processing interval
        if (this.candidateProcessingInterval) {
          clearInterval(this.candidateProcessingInterval);
          this.candidateProcessingInterval = null;
        }
      } else if (this.peerConnection.iceConnectionState === 'checking') {
        // Update Firestore to show checking state
        if (this.callDoc) {
          updateDoc(this.callDoc, {
            iceConnectionState: 'checking'
          }).catch(error => {
            console.error('Error updating ICE checking state:', error);
          });
        }
      } else if (this.peerConnection.iceConnectionState === 'failed' || 
                this.peerConnection.iceConnectionState === 'disconnected' ||
                this.peerConnection.iceConnectionState === 'closed') {
        // Connection failed or was disconnected
        console.log('Call disconnected or failed');
        
        // Update Firestore with the failed state
        if (this.callDoc) {
          updateDoc(this.callDoc, {
            iceConnectionState: this.peerConnection.iceConnectionState
          }).catch(error => {
            console.error('Error updating failed state:', error);
          });
        }
      }
    };
    
    // Handle ICE gathering state changes
    this.peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', this.peerConnection.iceGatheringState);
    };
    
    // Handle ICE candidate events
    this.peerConnection.onicecandidate = (event) => {
      if (!event.candidate) return;
      
      // Only add a limited number of candidates to reduce Firestore load
      if (this.candidateCounter < 50) {
        this.candidateCounter++;
        this.addIceCandidate(event.candidate);
      }
    };
    
    // Handle track events
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      
      // Set flag to indicate remote tracks are detected
      this.remoteTracksDetected = true;
      
      // Add the remote tracks to the remote stream
      event.streams[0].getTracks().forEach(track => {
        console.log('Adding remote track to stream:', track.kind);
        this.remoteStream.addTrack(track);
      });
      
      // Update call status in Firestore to indicate remote tracks are available
      if (this.callDoc) {
        updateDoc(this.callDoc, {
          hasRemoteTracks: true
        }).catch(error => {
          console.error('Error updating remote tracks status:', error);
        });
      }
    };
    
    // Handle connection quality stats
    this.startConnectionQualityMonitoring();
  }

  // Start monitoring connection quality
  startConnectionQualityMonitoring() {
    if (!this.peerConnection) return;
    
    const statsInterval = setInterval(async () => {
      if (!this.peerConnection) {
        clearInterval(statsInterval);
        return;
      }
      
      try {
        const stats = await this.peerConnection.getStats();
        let packetLoss = 0;
        let jitter = 0;
        let roundTripTime = 0;
        let statsCount = 0;
        
        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            if (report.packetsLost !== undefined && report.packetsReceived !== undefined) {
              const totalPackets = report.packetsLost + report.packetsReceived;
              if (totalPackets > 0) {
                packetLoss = (report.packetsLost / totalPackets) * 100;
              }
            }
            
            if (report.jitter !== undefined) {
              jitter = report.jitter;
            }
            
            statsCount++;
          }
          
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            if (report.currentRoundTripTime !== undefined) {
              roundTripTime = report.currentRoundTripTime * 1000; // Convert to ms
            }
          }
        });
        
        if (statsCount > 0) {
          // Calculate connection quality (simple algorithm)
          let quality = 'good';
          
          if (packetLoss > 10 || jitter > 50 || roundTripTime > 300) {
            quality = 'poor';
          } else if (packetLoss > 3 || jitter > 30 || roundTripTime > 150) {
            quality = 'fair';
          }
          
          // Update Firestore with connection quality
          if (this.callDoc) {
            updateDoc(this.callDoc, {
              connectionQuality: {
                quality,
                packetLoss,
                jitter,
                roundTripTime
              }
            }).catch(error => {
              console.error('Error updating connection quality:', error);
            });
          }
        }
      } catch (error) {
        console.error('Error getting connection stats:', error);
      }
    }, 5000); // Check every 5 seconds
    
    // Clean up interval after 5 minutes
    setTimeout(() => {
      clearInterval(statsInterval);
    }, 5 * 60 * 1000);
  }

  // Start a call
  async startCall(appointmentId, callerId, calleeId, existingStream = null, onTrackCallback = null) {
    try {
      this.callId = appointmentId;
      this.callerId = callerId;
      this.calleeId = calleeId;
      this.role = 'caller';
      this.pendingCandidates = []; // Reset pending candidates
      this.isProcessingCandidates = false;
      this.candidateCounter = 0;
      this.remoteTracksDetected = false;
      
      // Use the existing stream if provided
      if (existingStream) {
        this.setLocalStream(existingStream);
      }
      
      // Ensure we have a local stream before initializing the peer connection
      if (!this.localStream) {
        console.log('Local stream not initialized, setting up now...');
        try {
          await this.setupLocalStream();
        } catch (streamError) {
          console.error('Failed to set up video stream, trying audio only:', streamError);
          await this.setupLocalStream(true); // Fall back to audio only
        }
      }
      
      // Initialize the peer connection with Xirsys ICE servers
      await this.initializePeerConnection();
      
      // If a track callback was provided, set it up
      if (onTrackCallback && typeof onTrackCallback === 'function') {
        this.peerConnection.ontrack = (event) => {
          console.log('Received remote track with callback:', event.track.kind);
          
          // Set flag to indicate remote tracks are detected
          this.remoteTracksDetected = true;
          
          // Add the remote tracks to the remote stream
          event.streams[0].getTracks().forEach(track => {
            console.log('Adding remote track to stream:', track.kind);
            this.remoteStream.addTrack(track);
          });
          
          // Call the provided callback with the remote stream
          onTrackCallback(this.remoteStream);
          
          // Update call status in Firestore to indicate remote tracks are available
          if (this.callDoc) {
            updateDoc(this.callDoc, {
              hasRemoteTracks: true
            }).catch(error => {
              console.error('Error updating remote tracks status:', error);
            });
          }
        };
      }
      
      // Create the call document in Firestore
      const callsRef = collection(db, 'calls');
      this.callDoc = doc(callsRef, this.callId);
      
      // Create offer with explicit options
      const offerDescription = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: !this.isAudioOnly, // Only request video if we're not in audio-only mode
        iceRestart: true // Force ICE restart for better connectivity
      });
      
      // Set local description
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
        hasRemoteTracks: false,
        iceConnectionState: 'new',
        connectionState: 'new',
        isAudioOnly: this.isAudioOnly,
        createdAt: serverTimestamp()
      };
      
      await setDoc(this.callDoc, callData);
      
      // Set a connection timeout
      this.setConnectionTimeout();
      
      // Listen for remote answer
      this.callDocUnsubscribe = onSnapshot(this.callDoc, async (snapshot) => {
        const data = snapshot.data();
        if (!data) return;
        
        // If we don't have an answer yet and the remote side has answered
        if (!this.peerConnection.currentRemoteDescription && data.answer) {
          console.log('Setting remote description with answer');
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answerDescription);
          
          // Process any pending ICE candidates now that we have the remote description
          this.processPendingCandidates();
        }
        
        // Check call status
        if (data.status === 'rejected') {
          console.log('Call was rejected');
          this.hangUp();
        } else if (data.status === 'ended') {
          console.log('Call was ended by the other party');
          this.hangUp();
        }
      });
      
      // Listen for remote ICE candidates
      const calleeCandidatesRef = collection(this.callDoc, 'calleeCandidates');
      this.iceCandidatesUnsubscribe = onSnapshot(calleeCandidatesRef, (snapshot) => {
        const newCandidates = [];
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('Got new remote ICE candidate');
            newCandidates.push(change.doc.data());
          }
        });
        
        // Only process a limited number of candidates
        if (newCandidates.length > 0) {
          const candidatesToProcess = newCandidates.slice(0, this.maxPendingCandidates);
          
          if (this.peerConnection.remoteDescription) {
            this.processBatchedCandidates(candidatesToProcess);
          } else {
            console.log('Storing ICE candidates for later - no remote description yet');
            // Only store a limited number of candidates
            this.pendingCandidates = [
              ...this.pendingCandidates,
              ...candidatesToProcess
            ].slice(0, this.maxPendingCandidates);
          }
        }
      });
      
      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream,
        isAudioOnly: this.isAudioOnly
      };
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  // Answer a call
  async answerCall(callId, existingStream = null, onTrackCallback = null) {
    try {
      this.callId = callId;
      this.role = 'callee';
      this.pendingCandidates = []; // Reset pending candidates
      this.isProcessingCandidates = false;
      this.candidateCounter = 0;
      this.remoteTracksDetected = false;
      
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
      
      // Check if this is an audio-only call
      this.isAudioOnly = callData.isAudioOnly || false;
      
      // Update call status to show we're connecting
      await updateDoc(this.callDoc, {
        status: 'connecting',
        iceConnectionState: 'new',
        connectionState: 'connecting'
      });
      
      // Use the existing stream if provided
      if (existingStream) {
        this.setLocalStream(existingStream);
      }
      
      // Ensure we have a local stream before initializing the peer connection
      if (!this.localStream) {
        console.log('Local stream not initialized, setting up now...');
        try {
          await this.setupLocalStream(this.isAudioOnly);
        } catch (streamError) {
          console.error('Failed to set up stream, trying audio only:', streamError);
          await this.setupLocalStream(true); // Fall back to audio only
          this.isAudioOnly = true;
        }
      }
      
      // Initialize the peer connection with Xirsys ICE servers
      await this.initializePeerConnection();
      
      // If a track callback was provided, set it up
      if (onTrackCallback && typeof onTrackCallback === 'function') {
        this.peerConnection.ontrack = (event) => {
          console.log('Received remote track with callback:', event.track.kind);
          
          // Set flag to indicate remote tracks are detected
          this.remoteTracksDetected = true;
          
          // Add the remote tracks to the remote stream
          event.streams[0].getTracks().forEach(track => {
            console.log('Adding remote track to stream:', track.kind);
            this.remoteStream.addTrack(track);
          });
          
          // Call the provided callback with the remote stream
          onTrackCallback(this.remoteStream);
          
          // Update call status in Firestore to indicate remote tracks are available
          if (this.callDoc) {
            updateDoc(this.callDoc, {
              hasRemoteTracks: true
            }).catch(error => {
              console.error('Error updating remote tracks status:', error);
            });
          }
        };
      }
      
      // Set the remote description (offer) first before fetching candidates
      const offerDescription = callData.offer;
      console.log('Setting remote description with offer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));
      
      // Create answer with explicit options
      const answerDescription = await this.peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: !this.isAudioOnly // Only request video if we're not in audio-only mode
      });
      await this.peerConnection.setLocalDescription(answerDescription);
      
      // Update the call document with the answer
      await updateDoc(this.callDoc, {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp
        },
        status: 'active',
        isAudioOnly: this.isAudioOnly // Update in case we had to fall back to audio-only
      });
      
      // Now fetch a limited number of ICE candidates from the caller
      const callerCandidatesRef = collection(this.callDoc, 'callerCandidates');
      const callerCandidatesQuery = query(
        callerCandidatesRef,
        orderBy('priority', 'desc'), // Prioritize TURN candidates
        limit(this.maxPendingCandidates)
      );
      
      const callerCandidatesSnapshot = await getDocs(callerCandidatesQuery);
      
      // Get the most recent candidates (limited to maxPendingCandidates)
      const callerCandidates = [];
      callerCandidatesSnapshot.forEach(doc => {
        callerCandidates.push(doc.data());
      });
      
      console.log(`Pre-fetched ${callerCandidates.length} caller ICE candidates`);
      
      // Process the pre-fetched ICE candidates in batches
      this.processBatchedCandidates(callerCandidates);
      
      // Set a connection timeout
      this.setConnectionTimeout();
      
      // Start a periodic check for remote tracks
      this.startRemoteTrackCheck();
      
      // Continue listening for new ICE candidates
      this.iceCandidatesUnsubscribe = onSnapshot(callerCandidatesRef, (snapshot) => {
        const newCandidates = [];
        
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            console.log('Got new remote ICE candidate after answer');
            newCandidates.push(change.doc.data());
          }
        });
        
        // Only process a limited number of candidates
        if (newCandidates.length > 0) {
          const candidatesToProcess = newCandidates.slice(0, this.maxPendingCandidates);
          this.processBatchedCandidates(candidatesToProcess);
        }
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
        remoteStream: this.remoteStream,
        isAudioOnly: this.isAudioOnly
      };
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  // Start periodic check for remote tracks
  startRemoteTrackCheck() {
    // Check every 500ms if remote tracks are available
    const checkInterval = setInterval(() => {
      if (this.remoteStream && this.remoteStream.getTracks().length > 0) {
        console.log('Remote tracks detected in interval check');
        
        // Update call status in Firestore
        if (this.callDoc) {
          updateDoc(this.callDoc, {
            hasRemoteTracks: true
          }).catch(error => {
            console.error('Error updating remote tracks status:', error);
          });
        }
        
        // Clear the interval once tracks are detected
        clearInterval(checkInterval);
      }
    }, 500);
    
    // Clear the interval after 10 seconds regardless
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  // Process ICE candidates in batches to improve performance
  async processBatchedCandidates(candidates) {
    if (!candidates || candidates.length === 0 || !this.peerConnection.remoteDescription) {
      return;
    }
    
    // If already processing candidates, don't start another batch
    if (this.isProcessingCandidates) {
      return;
    }
    
    this.isProcessingCandidates = true;
    
    try {
      const batchSize = 5; // Process 5 candidates at a time
      const totalCandidates = Math.min(candidates.length, this.maxPendingCandidates);
      
      console.log(`Processing ${totalCandidates} ICE candidates in batches of ${batchSize}`);
      
      // Prioritize TURN candidates
      const sortedCandidates = [...candidates].sort((a, b) => {
        // Prioritize TURN candidates
        const aIsTurn = a.candidate && a.candidate.includes('typ relay');
        const bIsTurn = b.candidate && b.candidate.includes('typ relay');
        
        if (aIsTurn && !bIsTurn) return -1;
        if (!aIsTurn && bIsTurn) return 1;
        return 0;
      });
      
      // Only process a limited number of candidates
      const candidatesToProcess = sortedCandidates.slice(0, this.maxPendingCandidates);
      
      for (let i = 0; i < candidatesToProcess.length; i += batchSize) {
        const batch = candidatesToProcess.slice(i, i + batchSize);
        
        // Process this batch
        for (const candidate of batch) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log(`Added ICE candidate ${i + batch.indexOf(candidate) + 1}/${totalCandidates}`);
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
        
        // Small delay between batches to allow UI to remain responsive
        if (i + batchSize < totalCandidates) {
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }
      
      console.log('Finished processing all ICE candidates');
    } catch (error) {
      console.error('Error processing batched candidates:', error);
    } finally {
      this.isProcessingCandidates = false;
    }
  }

  // Set a timeout for connection establishment
  setConnectionTimeout() {
    // Clear any existing timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
    
    // Set a new timeout (10 seconds - reduced from 15)
    this.connectionTimeout = setTimeout(() => {
      console.log('Connection timeout - attempting to restart ICE');
      
      // If we have a peer connection, try to restart ICE
      if (this.peerConnection && this.peerConnection.restartIce) {
        this.peerConnection.restartIce();
        console.log('ICE restart initiated');
        
        // Update Firestore to indicate we're trying to reconnect
        if (this.callDoc) {
          updateDoc(this.callDoc, {
            iceConnectionState: 'restarting',
            connectionState: 'reconnecting'
          }).catch(error => {
            console.error('Error updating reconnection state:', error);
          });
        }
      }
    }, 10000); // 10 seconds
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
      
      // Add priority field to help sort candidates
      const candidateData = candidate.toJSON();
      candidateData.priority = this.getPriority(candidateData);
      
      await setDoc(doc(candidatesRef), candidateData);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Get priority for ICE candidate
  getPriority(candidate) {
    // Prioritize TURN candidates
    if (candidate.candidate && candidate.candidate.includes('typ relay')) {
      return 2;
    }
    // Then host candidates
    if (candidate.candidate && candidate.candidate.includes('typ host')) {
      return 1;
    }
    // Then STUN candidates
    return 0;
  }

  // Process any pending ICE candidates
  async processPendingCandidates() {
    if (this.isProcessingCandidates || !this.pendingCandidates || this.pendingCandidates.length === 0 || !this.peerConnection.remoteDescription) {
      return;
    }
    
    this.isProcessingCandidates = true;
    
    try {
      // Get a copy of the pending candidates and clear the original array
      const candidatesToProcess = [...this.pendingCandidates];
      this.pendingCandidates = [];
      
      // Process candidates in batches
      await this.processBatchedCandidates(candidatesToProcess);
    } catch (error) {
      console.error('Error processing pending ICE candidates:', error);
    } finally {
      this.isProcessingCandidates = false;
    }
  }

  // Reconnect to an existing call
  async reconnectCall(callId, onTrackCallback = null) {
    try {
      this.callId = callId;
      this.pendingCandidates = []; // Reset pending candidates
      this.isProcessingCandidates = false;
      this.candidateCounter = 0;
      this.remoteTracksDetected = false;
      
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
      
      // Determine our role based on the call data
      if (callData.callerId === this.callerId) {
        this.role = 'caller';
      } else {
        this.role = 'callee';
      }
      
      // Check if this is an audio-only call
      this.isAudioOnly = callData.isAudioOnly || false;
      
      // Update call status to show we're reconnecting
      await updateDoc(this.callDoc, {
        connectionState: 'reconnecting',
        iceConnectionState: 'checking'
      });
      
      // Ensure we have a local stream before initializing the peer connection
      if (!this.localStream) {
        console.log('Local stream not initialized, setting up now...');
        try {
          await this.setupLocalStream(this.isAudioOnly);
        } catch (streamError) {
          console.error('Failed to set up stream, trying audio only:', streamError);
          await this.setupLocalStream(true); // Fall back to audio only
          this.isAudioOnly = true;
        }
      }
      
      // Initialize the peer connection with Xirsys ICE servers
      await this.initializePeerConnection();
      
      // If a track callback was provided, set it up
      if (onTrackCallback && typeof onTrackCallback === 'function') {
        this.peerConnection.ontrack = (event) => {
          console.log('Received remote track with callback:', event.track.kind);
          
          // Set flag to indicate remote tracks are detected
          this.remoteTracksDetected = true;
          
          // Add the remote tracks to the remote stream
          event.streams[0].getTracks().forEach(track => {
            console.log('Adding remote track to stream:', track.kind);
            this.remoteStream.addTrack(track);
          });
          
          // Call the provided callback with the remote stream
          onTrackCallback(this.remoteStream);
          
          // Update call status in Firestore to indicate remote tracks are available
          if (this.callDoc) {
            updateDoc(this.callDoc, {
              hasRemoteTracks: true
            }).catch(error => {
              console.error('Error updating remote tracks status:', error);
            });
          }
        };
      }
      
      // Determine if we need to create an offer or answer based on our role
      if (this.role === 'caller') {
        // Create a new offer
        const offerDescription = await this.peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: !this.isAudioOnly,
          iceRestart: true // Force ICE restart for reconnection
        });
        
        await this.peerConnection.setLocalDescription(offerDescription);
        
        // Update the call document with the new offer
        await updateDoc(this.callDoc, {
          offer: {
            type: offerDescription.type,
            sdp: offerDescription.sdp
          },
          answer: null, // Clear any previous answer
          status: 'reconnecting'
        });
        
        // Listen for the answer
        this.callDocUnsubscribe = onSnapshot(this.callDoc, async (snapshot) => {
          const data = snapshot.data();
          if (!data) return;
          
          // If we don't have an answer yet and the remote side has answered
          if (!this.peerConnection.currentRemoteDescription && data.answer) {
            console.log('Setting remote description with answer during reconnect');
            const answerDescription = new RTCSessionDescription(data.answer);
            await this.peerConnection.setRemoteDescription(answerDescription);
            
            // Process any pending ICE candidates now that we have the remote description
            this.processPendingCandidates();
          }
          
          // Check call status
          if (data.status === 'rejected') {
            console.log('Call was rejected during reconnect');
            this.hangUp();
          } else if (data.status === 'ended') {
            console.log('Call was ended by the other party during reconnect');
            this.hangUp();
          }
        });
      } else {
        // We're the callee, check if there's an offer to answer
        if (callData.offer) {
          // Set the remote description (offer)
          console.log('Setting remote description with offer during reconnect');
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
          
          // Create answer
          const answerDescription = await this.peerConnection.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: !this.isAudioOnly
          });
          await this.peerConnection.setLocalDescription(answerDescription);
          
          // Update the call document with the answer
          await updateDoc(this.callDoc, {
            answer: {
              type: answerDescription.type,
              sdp: answerDescription.sdp
            },
            status: 'active'
          });
        } else {
          console.error('No offer found in call document during reconnect');
          throw new Error('No offer found in call document');
        }
      }
      
      // Set up ICE candidate collection and exchange
      this.setupIceCandidateExchange();
      
      // Set a connection timeout
      this.setConnectionTimeout();
      
      // Start a periodic check for remote tracks
      this.startRemoteTrackCheck();
      
      return {
        localStream: this.localStream,
        remoteStream: this.remoteStream,
        isAudioOnly: this.isAudioOnly
      };
    } catch (error) {
      console.error('Error reconnecting to call:', error);
      throw error;
    }
  }

  // Set up ICE candidate exchange
  setupIceCandidateExchange() {
    // Determine which collection to listen to based on our role
    const remoteCandidatesCollection = this.role === 'caller' ? 'calleeCandidates' : 'callerCandidates';
    const remoteCandidatesRef = collection(this.callDoc, remoteCandidatesCollection);
    
    // Listen for remote ICE candidates
    this.iceCandidatesUnsubscribe = onSnapshot(remoteCandidatesRef, (snapshot) => {
      const newCandidates = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('Got new remote ICE candidate during reconnect');
          newCandidates.push(change.doc.data());
        }
      });
      
      // Only process a limited number of candidates
      if (newCandidates.length > 0) {
        const candidatesToProcess = newCandidates.slice(0, this.maxPendingCandidates);
        
        if (this.peerConnection.remoteDescription) {
          this.processBatchedCandidates(candidatesToProcess);
        } else {
          console.log('Storing ICE candidates for later - no remote description yet');
          // Only store a limited number of candidates
          this.pendingCandidates = [
            ...this.pendingCandidates,
            ...candidatesToProcess
          ].slice(0, this.maxPendingCandidates);
        }
      }
    });
  }

  // Get the video sender for track replacement
  getVideoSender() {
    if (!this.peerConnection) {
      console.warn('No peer connection available');
      return null;
    }
    
    const senders = this.peerConnection.getSenders();
    return senders.find(sender => 
      sender.track && sender.track.kind === 'video'
    );
  }

  // Toggle screen sharing with improved error handling and face restoration
  async toggleScreenShare(isCurrentlySharing) {
    try {
      if (isCurrentlySharing) {
        // Switch back to camera
        if (this.originalVideoTrack && this.localStream) {
          // Get the video sender
          const videoSender = this.getVideoSender();
          
          // Replace the track in the peer connection
          if (videoSender) {
            await videoSender.replaceTrack(this.originalVideoTrack);
          }
          
          // Replace the track in the local stream
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
          
          // Notify UI that screen sharing has ended
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('webrtc-screenshare-ended'));
          }
          
          return this.localStream;
        } else {
          // If we don't have the original track, try to get a new camera stream
          console.warn('Original video track not found, getting new camera stream');
          try {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 24 }
              },
              audio: false
            });
            
            const newVideoTrack = newStream.getVideoTracks()[0];
            
            // Replace in peer connection
            const videoSender = this.getVideoSender();
            
            if (videoSender) {
              await videoSender.replaceTrack(newVideoTrack);
            }
            
            // Replace in local stream
            const oldTrack = this.localStream.getVideoTracks()[0];
            if (oldTrack) {
              oldTrack.stop();
              this.localStream.removeTrack(oldTrack);
            }
            this.localStream.addTrack(newVideoTrack);
            
            // Stop screen sharing tracks
            if (this.screenStream) {
              this.screenStream.getTracks().forEach(track => track.stop());
              this.screenStream = null;
            }
            
            // Notify UI that screen sharing has ended
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('webrtc-screenshare-ended'));
            }
            
            return this.localStream;
          } catch (error) {
            console.error('Failed to get new camera stream:', error);
            throw error;
          }
        }
      } else {
        // Switch to screen sharing
        try {
          // Use more specific constraints for better browser compatibility
          this.screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: 'always',
              displaySurface: 'monitor',
              logicalSurface: true,
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
              frameRate: { ideal: 15, max: 30 }
            }
          });
          
          // Save the original video track BEFORE replacing it
          // Use clone() to ensure we have a proper copy
          if (this.localStream.getVideoTracks().length > 0) {
            this.originalVideoTrack = this.localStream.getVideoTracks()[0].clone();
          }
          
          // Replace the video track in the peer connection
          const videoSender = this.getVideoSender();
          
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
            console.log('Screen sharing ended by browser UI');
            
            // Make sure we still have the original track
            if (this.originalVideoTrack) {
              // Replace in peer connection
              const videoSender = this.getVideoSender();
              
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
              
              // Notify UI that screen sharing has ended
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('webrtc-screenshare-ended'));
              }
            } else {
              console.error('Original video track not found when screen sharing ended');
              // Try to recover by getting a new camera stream
              try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 24 }
                  },
                  audio: false
                });
                
                const newVideoTrack = newStream.getVideoTracks()[0];
                
                // Replace in peer connection
                const videoSender = this.getVideoSender();
                
                if (videoSender) {
                  await videoSender.replaceTrack(newVideoTrack);
                }
                
                // Replace in local stream
                const oldTrack = this.localStream.getVideoTracks()[0];
                if (oldTrack) {
                  oldTrack.stop();
                  this.localStream.removeTrack(oldTrack);
                }
                this.localStream.addTrack(newVideoTrack);
                
                // Notify UI that screen sharing has ended
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('webrtc-screenshare-ended'));
                }
              } catch (err) {
                console.error('Failed to recover camera after screen sharing:', err);
              }
            }
          };
          
          return this.localStream;
        } catch (error) {
          // Handle specific permission errors
          if (error.name === 'NotAllowedError') {
            console.error('Screen sharing permission denied by user');
            throw new Error('Screen sharing permission denied. Please allow screen sharing in your browser settings.');
          } else {
            console.error('Error starting screen share:', error);
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      throw error;
    }
  }

  // Hang up the call
  async hangUp() {
    try {
      // Clear connection timeout if it exists
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      // Clear candidate processing interval
      if (this.candidateProcessingInterval) {
        clearInterval(this.candidateProcessingInterval);
        this.candidateProcessingInterval = null;
      }
      
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
        await updateDoc(this.callDoc, { 
          status: 'ended',
          iceConnectionState: 'closed',
          connectionState: 'closed'
        });
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
      this.pendingCandidates = [];
      this.isProcessingCandidates = false;
      this.candidateCounter = 0;
      this.remoteTracksDetected = false;
      this.isAudioOnly = false;
    } catch (error) {
      console.error('Error hanging up call:', error);
    }
  }

  // Reject an incoming call
  async rejectCall(callId) {
    try {
      const callsRef = collection(db, 'calls');
      const callDoc = doc(callsRef, callId);
      
      await updateDoc(callDoc, { 
        status: 'rejected',
        iceConnectionState: 'closed',
        connectionState: 'closed'
      });
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
          callerId: data.callerId,
          isAudioOnly: data.isAudioOnly || false
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
              callerId: data.callerId,
              isAudioOnly: data.isAudioOnly || false
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

  // Check if remote stream has tracks
  checkRemoteStream() {
    if (this.remoteStream) {
      return this.remoteStream.getTracks().length > 0;
    }
    return false;
  }

  // Get connection diagnostics
  async getConnectionDiagnostics() {
    if (!this.peerConnection) {
      return {
        connected: false,
        error: 'No active connection'
      };
    }

    try {
      const stats = await this.peerConnection.getStats();
      const diagnostics = {
        connected: this.peerConnection.connectionState === 'connected',
        connectionState: this.peerConnection.connectionState,
        iceConnectionState: this.peerConnection.iceConnectionState,
        iceGatheringState: this.peerConnection.iceGatheringState,
        signalingState: this.peerConnection.signalingState,
        localCandidates: [],
        remoteCandidates: [],
        selectedCandidate: null,
        audioStats: {},
        videoStats: {},
        dataChannelStats: {}
      };

      stats.forEach(report => {
        if (report.type === 'local-candidate') {
          diagnostics.localCandidates.push({
            id: report.id,
            ip: report.ip,
            port: report.port,
            protocol: report.protocol,
            candidateType: report.candidateType,
            priority: report.priority
          });
        } else if (report.type === 'remote-candidate') {
          diagnostics.remoteCandidates.push({
            id: report.id,
            ip: report.ip,
            port: report.port,
            protocol: report.protocol,
            candidateType: report.candidateType,
            priority: report.priority
          });
        } else if (report.type === 'candidate-pair' && report.selected) {
          diagnostics.selectedCandidate = {
            localId: report.localCandidateId,
            remoteId: report.remoteCandidateId,
            state: report.state,
            nominated: report.nominated,
            bytesSent: report.bytesSent,
            bytesReceived: report.bytesReceived,
            roundTripTime: report.currentRoundTripTime,
            availableOutgoingBitrate: report.availableOutgoingBitrate
          };
        } else if (report.type === 'inbound-rtp' && report.kind === 'audio') {
          diagnostics.audioStats = {
            packetsReceived: report.packetsReceived,
            packetsLost: report.packetsLost,
            jitter: report.jitter,
            bytesReceived: report.bytesReceived
          };
        } else if (report.type === 'inbound-rtp' && report.kind === 'video') {
          diagnostics.videoStats = {
            packetsReceived: report.packetsReceived,
            packetsLost: report.packetsLost,
            jitter: report.jitter,
            bytesReceived: report.bytesReceived,
            framesDecoded: report.framesDecoded,
            framesDropped: report.framesDropped,
            frameWidth: report.frameWidth,
            frameHeight: report.frameHeight
          };
        } else if (report.type === 'data-channel') {
          diagnostics.dataChannelStats = {
            state: report.state,
            messagesSent: report.messagesSent,
            messagesReceived: report.messagesReceived,
            bytesSent: report.bytesSent,
            bytesReceived: report.bytesReceived
          };
        }
      });

      return diagnostics;
    } catch (error) {
      console.error('Error getting connection diagnostics:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

export default new WebRTCService();