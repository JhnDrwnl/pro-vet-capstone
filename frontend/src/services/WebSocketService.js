// src/services/WebSocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.reconnecting = false;
    this.pingInterval = null;
    this.pingTimeout = null;
    
    // Use the correct WebSocket URL based on environment
    this.wsUrl = process.env.VUE_APP_WS_URL || 'ws://localhost:8765';
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        console.log('WebSocket already connected or connecting');
        if (this.isConnected) resolve();
        return;
      }
      
      // Clear any existing ping interval
      this._clearPingInterval();
      
      console.log(`Connecting to WebSocket at ${this.wsUrl}`);
      
      try {
        this.socket = new WebSocket(this.wsUrl);
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        reject(error);
        return;
      }

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          this.socket.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000); // 10 seconds timeout

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Start ping interval to keep connection alive
        this._startPingInterval();
        
        this.connectionCallbacks.forEach(callback => callback(true));
        resolve();
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
        clearTimeout(connectionTimeout);
        this._clearPingInterval();
        
        this.isConnected = false;
        this.connectionCallbacks.forEach(callback => callback(false));
        
        // Attempt to reconnect unless this was a normal closure
        if (!this.reconnecting && event.code !== 1000) {
          this._attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't reject here, let onclose handle reconnection
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check if it's a pong response
          if (data.type === 'pong') {
            console.log('Received pong from server');
            if (this.pingTimeout) {
              clearTimeout(this.pingTimeout);
              this.pingTimeout = null;
            }
            return;
          }
          
          console.log('Received WebSocket message:', data);
          this.messageCallbacks.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    });
  }

  _startPingInterval() {
    // Send a ping every 30 seconds to keep the connection alive
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          // Send a simple ping message
          this.socket.send(JSON.stringify({ type: 'ping' }));
          console.log('Sent ping to server');
          
          // Set a timeout to check for pong response
          this.pingTimeout = setTimeout(() => {
            console.warn('Ping timeout - no response from server');
            // Force reconnection
            if (this.socket) {
              this.socket.close();
            }
          }, 5000); // 5 second timeout for pong
        } catch (error) {
          console.error('Error sending ping:', error);
        }
      }
    }, 30000); // 30 seconds
  }

  _clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  _attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnection attempts reached');
      return;
    }
    
    this.reconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval/1000}s...`);
    
    setTimeout(() => {
      console.log('Reconnecting...');
      this.connect()
        .then(() => {
          console.log('Reconnected successfully');
          this.reconnecting = false;
        })
        .catch(() => {
          this.reconnecting = false;
          // The next reconnection attempt will be triggered by the onclose handler
        });
    }, this.reconnectInterval);
  }

  disconnect() {
    this._clearPingInterval();
    
    if (this.socket) {
      try {
        this.socket.close(1000, 'Normal closure');
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
    }
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        // Try to connect first if not connected
        if (!this.isConnected && !this.reconnecting) {
          console.log('WebSocket not connected, attempting to connect before sending');
          this.connect()
            .then(() => {
              this._sendMessageInternal(message, resolve, reject);
            })
            .catch(err => {
              reject(new Error('Failed to connect to WebSocket server'));
            });
        } else {
          reject(new Error('WebSocket not connected'));
        }
      } else {
        this._sendMessageInternal(message, resolve, reject);
      }
    });
  }
  
  _sendMessageInternal(message, resolve, reject) {
    try {
      const messageStr = JSON.stringify(message);
      console.log('Sending WebSocket message:', messageStr.substring(0, 100) + '...');
      this.socket.send(messageStr);
      resolve();
    } catch (error) {
      console.error('Error sending message:', error);
      reject(error);
    }
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }
}

export default new WebSocketService();