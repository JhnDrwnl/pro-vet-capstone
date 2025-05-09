/**
 * WebRTC Debugging Utility
 *
 * This utility provides comprehensive debugging and diagnostics for WebRTC connections.
 * It helps identify and troubleshoot common WebRTC issues by providing detailed logs,
 * connection analysis, and testing capabilities.
 */

class WebRTCDebugger {
  /**
   * Log connection state changes with detailed information
   * @param {RTCPeerConnection} peerConnection - The RTCPeerConnection to monitor
   * @param {string} context - Context information for the log
   */
  static logConnectionState(peerConnection, context) {
    if (!peerConnection) return

    const states = {
      iceConnectionState: peerConnection.iceConnectionState,
      iceGatheringState: peerConnection.iceGatheringState,
      connectionState: peerConnection.connectionState,
      signalingState: peerConnection.signalingState,
    }

    console.log(`[WebRTC ${context}] Connection states:`, states)
  }

  /**
   * Generate a comprehensive debug report for a WebRTC connection
   * @param {RTCPeerConnection} peerConnection - The RTCPeerConnection to analyze
   * @returns {Promise<Object>} A detailed report object
   */
  static async generateReport(peerConnection) {
    if (!peerConnection) return { error: "No peer connection provided" }

    try {
      const stats = await peerConnection.getStats()
      const report = {
        timestamp: new Date().toISOString(),
        connectionStates: {
          iceConnectionState: peerConnection.iceConnectionState,
          iceGatheringState: peerConnection.iceGatheringState,
          connectionState: peerConnection.connectionState,
          signalingState: peerConnection.signalingState,
        },
        sdp: {
          local: peerConnection.localDescription
            ? {
                type: peerConnection.localDescription.type,
                sdp: peerConnection.localDescription.sdp,
              }
            : null,
          remote: peerConnection.remoteDescription
            ? {
                type: peerConnection.remoteDescription.type,
                sdp: peerConnection.remoteDescription.sdp,
              }
            : null,
        },
        iceCandidates: this.extractIceCandidates(peerConnection),
        stats: this.processStats(stats),
        browser: this.getBrowserInfo(),
      }

      return report
    } catch (error) {
      console.error("Error generating WebRTC debug report:", error)
      return { error: error.message }
    }
  }

  /**
   * Extract ICE candidates from the peer connection
   * @param {RTCPeerConnection} peerConnection - The RTCPeerConnection to analyze
   * @returns {Object} Object containing local and remote candidates
   */
  static extractIceCandidates(peerConnection) {
    const result = {
      local: { count: 0, types: { host: 0, srflx: 0, relay: 0, other: 0 } },
      remote: { count: 0, types: { host: 0, srflx: 0, relay: 0, other: 0 } },
    }

    try {
      // Extract local candidates from SDP
      if (peerConnection.localDescription && peerConnection.localDescription.sdp) {
        const localCandidates = peerConnection.localDescription.sdp
          .split("\r\n")
          .filter((line) => line.indexOf("a=candidate:") === 0)

        result.local.count = localCandidates.length

        localCandidates.forEach((candidate) => {
          if (candidate.includes("typ host")) result.local.types.host++
          else if (candidate.includes("typ srflx")) result.local.types.srflx++
          else if (candidate.includes("typ relay")) result.local.types.relay++
          else result.local.types.other++
        })
      }

      // Extract remote candidates from SDP
      if (peerConnection.remoteDescription && peerConnection.remoteDescription.sdp) {
        const remoteCandidates = peerConnection.remoteDescription.sdp
          .split("\r\n")
          .filter((line) => line.indexOf("a=candidate:") === 0)

        result.remote.count = remoteCandidates.length

        remoteCandidates.forEach((candidate) => {
          if (candidate.includes("typ host")) result.remote.types.host++
          else if (candidate.includes("typ srflx")) result.remote.types.srflx++
          else if (candidate.includes("typ relay")) result.remote.types.relay++
          else result.remote.types.other++
        })
      }
    } catch (error) {
      console.error("Error extracting ICE candidates:", error)
    }

    return result
  }

  /**
   * Process WebRTC stats into a more readable format
   * @param {RTCStatsReport} stats - The stats report from getStats()
   * @returns {Object} Processed stats in a more readable format
   */
  static processStats(stats) {
    const result = {
      audio: { inbound: {}, outbound: {} },
      video: { inbound: {}, outbound: {} },
      connection: {},
      candidates: { local: [], remote: [] },
    }

    try {
      stats.forEach((stat) => {
        // Process inbound RTP stats
        if (stat.type === "inbound-rtp") {
          const mediaType = stat.kind || "unknown"
          if (mediaType === "audio" || mediaType === "video") {
            result[mediaType].inbound = {
              bytesReceived: stat.bytesReceived,
              packetsReceived: stat.packetsReceived,
              packetsLost: stat.packetsLost,
              jitter: stat.jitter,
              frameRate: stat.framesPerSecond,
              framesDecoded: stat.framesDecoded,
              framesDropped: stat.framesDropped,
            }
          }
        }

        // Process outbound RTP stats
        else if (stat.type === "outbound-rtp") {
          const mediaType = stat.kind || "unknown"
          if (mediaType === "audio" || mediaType === "video") {
            result[mediaType].outbound = {
              bytesSent: stat.bytesSent,
              packetsSent: stat.packetsSent,
              frameRate: stat.framesPerSecond,
              framesEncoded: stat.framesEncoded,
            }
          }
        }

        // Process candidate pair stats
        else if (stat.type === "candidate-pair" && stat.state === "succeeded") {
          result.connection = {
            currentRoundTripTime: stat.currentRoundTripTime,
            availableOutgoingBitrate: stat.availableOutgoingBitrate,
            bytesReceived: stat.bytesReceived,
            bytesSent: stat.bytesSent,
            localCandidateId: stat.localCandidateId,
            remoteCandidateId: stat.remoteCandidateId,
          }
        }

        // Process local candidate stats
        else if (stat.type === "local-candidate") {
          result.candidates.local.push({
            protocol: stat.protocol,
            candidateType: stat.candidateType,
            ip: stat.ip,
            port: stat.port,
            networkType: stat.networkType,
          })
        }

        // Process remote candidate stats
        else if (stat.type === "remote-candidate") {
          result.candidates.remote.push({
            protocol: stat.protocol,
            candidateType: stat.candidateType,
            ip: stat.ip,
            port: stat.port,
          })
        }
      })
    } catch (error) {
      console.error("Error processing WebRTC stats:", error)
    }

    return result
  }

  /**
   * Get browser information
   * @returns {Object} Browser name and version
   */
  static getBrowserInfo() {
    const userAgent = navigator.userAgent
    let browserName = "Unknown"
    let browserVersion = "Unknown"

    try {
      // Check for adapter.js
      if (typeof window !== "undefined" && window.adapter) {
        return {
          name: window.adapter.browserDetails.browser,
          version: window.adapter.browserDetails.version,
        }
      }

      // Fallback detection
      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "Chrome"
        const match = userAgent.match(/(?:chrome|chromium|crios)\/(\d+)/i)
        if (match) browserVersion = match[1]
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "Firefox"
        const match = userAgent.match(/(?:firefox|fxios)\/(\d+)/i)
        if (match) browserVersion = match[1]
      } else if (userAgent.match(/safari/i)) {
        browserName = "Safari"
        const match = userAgent.match(/version\/(\d+)/i)
        if (match) browserVersion = match[1]
      } else if (userAgent.match(/opr\//i)) {
        browserName = "Opera"
        const match = userAgent.match(/opr\/(\d+)/i)
        if (match) browserVersion = match[1]
      } else if (userAgent.match(/edg/i)) {
        browserName = "Edge"
        const match = userAgent.match(/edg\/(\d+)/i)
        if (match) browserVersion = match[1]
      }
    } catch (error) {
      console.error("Error detecting browser info:", error)
    }

    return { name: browserName, version: browserVersion }
  }

  /**
   * Analyze SDP for common issues and configuration details
   * @param {string} sdp - The SDP string to analyze
   * @returns {Object} Analysis results
   */
  static analyzeSdp(sdp) {
    if (!sdp) return { error: "No SDP provided" }

    try {
      const lines = sdp.split("\r\n")
      const result = {
        mediaTypes: { audio: false, video: false },
        codecs: { audio: [], video: [] },
        iceCandidates: { count: 0 },
        dtls: { role: "unknown" },
        bandwidth: { audio: "unknown", video: "unknown" },
        issues: [],
      }

      // Check for media types and codecs
      let currentMedia = null

      lines.forEach((line) => {
        // Check media types
        if (line.startsWith("m=audio")) {
          currentMedia = "audio"
          result.mediaTypes.audio = true
        } else if (line.startsWith("m=video")) {
          currentMedia = "video"
          result.mediaTypes.video = true
        }

        // Extract codecs
        if (currentMedia && line.startsWith("a=rtpmap:")) {
          const codec = line.split(" ")[1]?.split("/")[0]
          if (codec && !result.codecs[currentMedia].includes(codec)) {
            result.codecs[currentMedia].push(codec)
          }
        }

        // Count ICE candidates
        if (line.startsWith("a=candidate:")) {
          result.iceCandidates.count++
        }

        // Check DTLS role
        if (line.startsWith("a=setup:")) {
          result.dtls.role = line.split(":")[1]
        }

        // Check bandwidth
        if (line.startsWith("b=AS:")) {
          if (currentMedia) {
            result.bandwidth[currentMedia] = line.split(":")[1] + " kbps"
          }
        }
      })

      // Check for potential issues
      if (!result.mediaTypes.audio && !result.mediaTypes.video) {
        result.issues.push("No media types found in SDP")
      }

      if (result.mediaTypes.video && result.codecs.video.length === 0) {
        result.issues.push("Video enabled but no video codecs found")
      }

      if (result.mediaTypes.audio && result.codecs.audio.length === 0) {
        result.issues.push("Audio enabled but no audio codecs found")
      }

      if (result.iceCandidates.count === 0) {
        result.issues.push("No ICE candidates found in SDP")
      }

      return result
    } catch (error) {
      console.error("Error analyzing SDP:", error)
      return { error: error.message }
    }
  }

  /**
   * Test connectivity to an ICE server
   * @param {Object} iceServer - ICE server configuration object
   * @returns {Promise<Object>} Test results
   */
  static async testIceServer(iceServer) {
    if (!iceServer || !iceServer.urls) {
      return { success: false, error: "Invalid ICE server configuration" }
    }

    try {
      console.log(`Testing ICE server: ${JSON.stringify(iceServer.urls)}`)

      // Create a test peer connection
      const pc = new RTCPeerConnection({ iceServers: [iceServer] })

      // Create a data channel to trigger ICE gathering
      pc.createDataChannel("test")

      // Track gathered candidates
      const candidates = {
        host: 0,
        srflx: 0,
        relay: 0,
        total: 0,
      }

      // Set up ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          candidates.total++

          const candidateStr = event.candidate.candidate
          if (candidateStr.includes("typ host")) candidates.host++
          else if (candidateStr.includes("typ srflx")) candidates.srflx++
          else if (candidateStr.includes("typ relay")) candidates.relay++

          console.log(`ICE candidate gathered: ${candidateStr}`)
        }
      }

      // Create an offer to start ICE gathering
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering to complete or timeout
      const result = await new Promise((resolve) => {
        // Set a timeout for ICE gathering
        const timeout = setTimeout(() => {
          resolve({
            success: candidates.total > 0,
            timedOut: true,
            candidates,
          })
        }, 5000)

        // Check for ICE gathering complete
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === "complete") {
            clearTimeout(timeout)

            // For STUN servers, we expect srflx candidates
            // For TURN servers, we expect relay candidates
            const isStunServer = iceServer.urls.toString().includes("stun:")
            const isTurnServer = iceServer.urls.toString().includes("turn:")

            let success = false
            if (isStunServer) {
              success = candidates.srflx > 0
            } else if (isTurnServer) {
              success = candidates.relay > 0
            } else {
              success = candidates.total > 0
            }

            resolve({
              success,
              candidates,
              serverType: isStunServer ? "STUN" : isTurnServer ? "TURN" : "Unknown",
            })
          }
        }
      })

      // Clean up
      pc.close()

      return result
    } catch (error) {
      console.error(`Error testing ICE server: ${error.message}`)
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

export default WebRTCDebugger
