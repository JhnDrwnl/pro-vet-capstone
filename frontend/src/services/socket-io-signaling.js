/**
 * Socket.IO Signaling Service for WebRTC
 *
 * This class provides signaling functionality using Socket.IO for WebRTC connections.
 * It handles room management, peer discovery, and signaling message exchange.
 */

class SocketIOSignaling {
  /**
   * Create a new Socket.IO signaling instance
   * @param {Object} options - Configuration options
   * @param {string} options.serverUrl - Socket.IO server URL
   * @param {string} options.roomId - Room ID to join
   * @param {string} options.userId - User ID for identification
   * @param {Function} options.onConnected - Callback when connected
   * @param {Function} options.onDisconnected - Callback when disconnected
   * @param {Function} options.onError - Callback for errors
   * @param {Function} options.onSignalingMessage - Callback for signaling messages
   * @param {Function} options.onPeerJoined - Callback when a peer joins
   * @param {Function} options.onPeerLeft - Callback when a peer leaves
   */
  constructor(options) {
    this.serverUrl = options.serverUrl
    this.roomId = options.roomId
    this.userId = options.userId || this._generateUserId()
    this.socket = null
    this.isConnected = false
    this.peers = new Map()

    // Callbacks
    this.onConnected = options.onConnected || (() => {})
    this.onDisconnected = options.onDisconnected || (() => {})
    this.onError = options.onError || (() => {})
    this.onSignalingMessage = options.onSignalingMessage || (() => {})
    this.onPeerJoined = options.onPeerJoined || (() => {})
    this.onPeerLeft = options.onPeerLeft || (() => {})
  }

  /**
   * Connect to the signaling server
   * @returns {Promise<boolean>} True if connected successfully
   */
  async connect() {
    if (this.isConnected) {
      console.log("Already connected to signaling server")
      return true
    }

    try {
      // Dynamically import Socket.IO client
      const ioModule = await this._loadSocketIO()
      const io = ioModule.io || ioModule.default || ioModule

      return new Promise((resolve, reject) => {
        console.log(`Connecting to signaling server: ${this.serverUrl}`)

        this.socket = io(this.serverUrl, {
          transports: ["websocket"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        })

        // Set up event handlers
        this.socket.on("connect", () => {
          console.log("Connected to signaling server")
          this.isConnected = true
          this._setupEventHandlers()
          this.onConnected()
          resolve(true)
        })

        this.socket.on("connect_error", (error) => {
          console.error("Error connecting to signaling server:", error)
          this.onError(error)
          reject(error)
        })

        this.socket.on("connect_timeout", () => {
          const error = new Error("Connection to signaling server timed out")
          console.error(error)
          this.onError(error)
          reject(error)
        })
      })
    } catch (error) {
      console.error("Failed to load Socket.IO or connect:", error)
      this.onError(error)
      return false
    }
  }

  /**
   * Disconnect from the signaling server
   * @returns {Promise<boolean>} True if disconnected successfully
   */
  async disconnect() {
    if (!this.isConnected || !this.socket) {
      console.log("Not connected to signaling server")
      return true
    }

    return new Promise((resolve) => {
      this.socket.disconnect()
      this.socket.on("disconnect", () => {
        console.log("Disconnected from signaling server")
        this.isConnected = false
        this.socket = null
        this.onDisconnected("Disconnected by client")
        resolve(true)
      })

      // Ensure we resolve even if the disconnect event doesn't fire
      setTimeout(() => {
        if (this.isConnected) {
          this.isConnected = false
          this.socket = null
          resolve(true)
        }
      }, 1000)
    })
  }

  /**
   * Join a room on the signaling server
   * @param {string} roomId - Room ID to join
   * @returns {Promise<boolean>} True if joined successfully
   */
  async joinRoom(roomId) {
    if (!this.isConnected || !this.socket) {
      throw new Error("Not connected to signaling server")
    }

    this.roomId = roomId || this.roomId

    if (!this.roomId) {
      throw new Error("No room ID specified")
    }

    return new Promise((resolve, reject) => {
      console.log(`Joining room: ${this.roomId}`)

      this.socket.emit(
        "join-room",
        {
          roomId: this.roomId,
          userId: this.userId,
        },
        (response) => {
          if (response.success) {
            console.log(`Joined room ${this.roomId} successfully`)

            // Store information about peers already in the room
            if (response.peers && Array.isArray(response.peers)) {
              response.peers.forEach((peer) => {
                this.peers.set(peer.userId, peer)
              })
              console.log(`Room has ${this.peers.size} other peers`)
            }

            resolve(true)
          } else {
            const error = new Error(response.error || "Failed to join room")
            console.error(error)
            this.onError(error)
            reject(error)
          }
        },
      )
    })
  }

  /**
   * Leave the current room
   * @returns {Promise<boolean>} True if left successfully
   */
  async leaveRoom() {
    if (!this.isConnected || !this.socket || !this.roomId) {
      return true
    }

    return new Promise((resolve) => {
      console.log(`Leaving room: ${this.roomId}`)

      this.socket.emit(
        "leave-room",
        {
          roomId: this.roomId,
          userId: this.userId,
        },
        () => {
          console.log(`Left room ${this.roomId}`)
          this.roomId = null
          this.peers.clear()
          resolve(true)
        },
      )

      // Ensure we resolve even if the server doesn't respond
      setTimeout(() => resolve(true), 1000)
    })
  }

  /**
   * Send an offer to a peer
   * @param {string} peerId - ID of the peer to send the offer to
   * @param {RTCSessionDescription} offer - WebRTC offer
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendOffer(peerId, offer) {
    if (!this.isConnected || !this.socket) {
      throw new Error("Not connected to signaling server")
    }

    return new Promise((resolve, reject) => {
      console.log(`Sending offer to peer: ${peerId}`)

      this.socket.emit(
        "signaling",
        {
          type: "offer",
          roomId: this.roomId,
          to: peerId,
          from: this.userId,
          data: offer,
        },
        (response) => {
          if (response && response.success) {
            console.log(`Offer sent to ${peerId} successfully`)
            resolve(true)
          } else {
            const error = new Error(response?.error || "Failed to send offer")
            console.error(error)
            this.onError(error)
            reject(error)
          }
        },
      )
    })
  }

  /**
   * Send an answer to a peer
   * @param {string} peerId - ID of the peer to send the answer to
   * @param {RTCSessionDescription} answer - WebRTC answer
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendAnswer(peerId, answer) {
    if (!this.isConnected || !this.socket) {
      throw new Error("Not connected to signaling server")
    }

    return new Promise((resolve, reject) => {
      console.log(`Sending answer to peer: ${peerId}`)

      this.socket.emit(
        "signaling",
        {
          type: "answer",
          roomId: this.roomId,
          to: peerId,
          from: this.userId,
          data: answer,
        },
        (response) => {
          if (response && response.success) {
            console.log(`Answer sent to ${peerId} successfully`)
            resolve(true)
          } else {
            const error = new Error(response?.error || "Failed to send answer")
            console.error(error)
            this.onError(error)
            reject(error)
          }
        },
      )
    })
  }

  /**
   * Send an ICE candidate to a peer
   * @param {string} peerId - ID of the peer to send the candidate to
   * @param {RTCIceCandidate} candidate - WebRTC ICE candidate
   * @returns {Promise<boolean>} True if sent successfully
   */
  async sendIceCandidate(peerId, candidate) {
    if (!this.isConnected || !this.socket) {
      throw new Error("Not connected to signaling server")
    }

    return new Promise((resolve, reject) => {
      this.socket.emit(
        "signaling",
        {
          type: "ice-candidate",
          roomId: this.roomId,
          to: peerId,
          from: this.userId,
          data: candidate,
        },
        (response) => {
          if (response && response.success) {
            resolve(true)
          } else {
            const error = new Error(response?.error || "Failed to send ICE candidate")
            console.error(error)
            this.onError(error)
            reject(error)
          }
        },
      )
    })
  }

  /**
   * Get the list of peers in the current room
   * @returns {Array} Array of peer objects
   */
  getPeers() {
    return Array.from(this.peers.values())
  }

  /**
   * Set up Socket.IO event handlers
   * @private
   */
  _setupEventHandlers() {
    if (!this.socket) return

    // Handle disconnection
    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from signaling server: ${reason}`)
      this.isConnected = false
      this.onDisconnected(reason)
    })

    // Handle errors
    this.socket.on("error", (error) => {
      console.error("Signaling server error:", error)
      this.onError(error)
    })

    // Handle signaling messages
    this.socket.on("signaling", (message) => {
      console.log(`Received signaling message of type: ${message.type}`)
      this.onSignalingMessage(message)
    })

    // Handle peer joined event
    this.socket.on("peer-joined", (data) => {
      console.log(`Peer joined: ${data.peerId}`)
      this.peers.set(data.peerId, data)
      this.onPeerJoined(data)
    })

    // Handle peer left event
    this.socket.on("peer-left", (data) => {
      console.log(`Peer left: ${data.peerId}`)
      this.peers.delete(data.peerId)
      this.onPeerLeft(data)
    })
  }

  /**
   * Dynamically load Socket.IO client
   * @private
   * @returns {Promise<Function>} Socket.IO client constructor
   */
  async _loadSocketIO() {
    // Check if Socket.IO is already available
    if (typeof io !== "undefined") {
      return { io }
    }

    // In a browser environment, we need to load the Socket.IO client
    if (typeof window !== "undefined") {
      return new Promise((resolve, reject) => {
        try {
          const script = document.createElement("script")
          script.src = "https://cdn.socket.io/4.5.4/socket.io.min.js"
          script.integrity = "sha384-/KNQL8Nu5gCHLqwqfQjA689Hhoqgi2S84SNUxC3roTe4EhJ9AfLkp8QiQcU8AMzI"
          script.crossOrigin = "anonymous"

          script.onload = () => {
            if (typeof io !== "undefined") {
              resolve({ io })
            } else {
              reject(new Error("Socket.IO loaded but io is undefined"))
            }
          }

          script.onerror = () => {
            reject(new Error("Failed to load Socket.IO client"))
          }

          document.head.appendChild(script)
        } catch (error) {
          reject(error)
        }
      })
    }

    // In a Node.js environment, we can import the module
    try {
      const socketIO = await import("socket.io-client")
      return socketIO
    } catch (error) {
      console.error("Failed to import socket.io-client:", error)
      throw new Error("Socket.IO client not available")
    }
  }

  /**
   * Generate a random user ID if none is provided
   * @private
   * @returns {string} Random user ID
   */
  _generateUserId() {
    return "user_" + Math.random().toString(36).substring(2, 9)
  }
}

export default SocketIOSignaling
