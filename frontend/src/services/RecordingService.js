class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
  }
  
  async startRecording(localStream, remoteStream) {
    if (this.isRecording) {
      throw new Error('Already recording');
    }
    
    try {
      // Create a combined stream with both local and remote video
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 1280;
      canvas.height = 720;
      
      // Create video elements for streams
      const localVideo = document.createElement('video');
      localVideo.srcObject = localStream;
      localVideo.autoplay = true;
      localVideo.muted = true;
      
      const remoteVideo = document.createElement('video');
      remoteVideo.srcObject = remoteStream;
      remoteVideo.autoplay = true;
      
      // Wait for videos to load
      await Promise.all([
        new Promise(resolve => localVideo.onloadedmetadata = resolve),
        new Promise(resolve => remoteVideo.onloadedmetadata = resolve)
      ]);
      
      // Start playing videos
      await Promise.all([
        localVideo.play(),
        remoteVideo.play()
      ]);
      
      // Create a combined stream from the canvas
      this.stream = canvas.captureStream(30); // 30 FPS
      
      // Add audio tracks from both streams
      const audioTracks = [
        ...localStream.getAudioTracks(),
        ...remoteStream.getAudioTracks()
      ];
      
      audioTracks.forEach(track => {
        this.stream.addTrack(track);
      });
      
      // Set up media recorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      this.recordedChunks = [];
      
      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Capture in 1-second chunks
      this.isRecording = true;
      
      // Set up canvas drawing loop
      const drawVideoFrame = () => {
        if (!this.isRecording) return;
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw remote video (large)
        ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);
        
        // Draw local video (small, in corner)
        const localWidth = canvas.width / 4;
        const localHeight = (localWidth / localVideo.videoWidth) * localVideo.videoHeight;
        ctx.drawImage(
          localVideo, 
          canvas.width - localWidth - 20, 
          canvas.height - localHeight - 20, 
          localWidth, 
          localHeight
        );
        
        // Add timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 150, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText(timeString, 20, 30);
        
        // Continue drawing
        if (this.isRecording) {
          requestAnimationFrame(drawVideoFrame);
        }
      };
      
      // Start drawing
      drawVideoFrame();
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      this.isRecording = false;
      throw error;
    }
  }
  
  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Not recording');
    }
    
    try {
      // Return a promise that resolves when recording is stopped
      return new Promise((resolve, reject) => {
        this.mediaRecorder.onstop = () => {
          try {
            // Create a blob from recorded chunks
            const blob = new Blob(this.recordedChunks, {
              type: 'video/webm'
            });
            
            // Clean up
            this.recordedChunks = [];
            this.isRecording = false;
            
            // Stop all tracks in the stream
            if (this.stream) {
              this.stream.getTracks().forEach(track => track.stop());
              this.stream = null;
            }
            
            resolve(blob);
          } catch (error) {
            reject(error);
          }
        };
        
        // Stop recording
        this.mediaRecorder.stop();
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isRecording = false;
      throw error;
    }
  }
  
  isCurrentlyRecording() {
    return this.isRecording;
  }
}

export default new RecordingService();