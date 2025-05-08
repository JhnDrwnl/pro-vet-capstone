// services/xirsys-service.js
/**
* Service for interacting with Xirsys TURN/STUN server API
* This service helps with NAT traversal for WebRTC connections
*/

class XirsysService {
  constructor() {
    // Use environment variables with fallback mechanism that doesn't expose actual credentials
    this.xirsysUrl = import.meta.env.VITE_XIRSYS_URL || 'https://global.xirsys.net';
    this.xirsysPath = import.meta.env.VITE_XIRSYS_PATH || '/_turn/';
    this.xirsysIdent = import.meta.env.VITE_XIRSYS_IDENT || '';
    this.xirsysSecret = import.meta.env.VITE_XIRSYS_SECRET || '';
    this.iceServers = null;
    this.lastFetchTime = 0;
    this.cacheValidityPeriod = 3600000; // 1 hour in milliseconds
  }

  /**
   * Get ICE servers from Xirsys
   * @returns {Promise<Object>} - ICE server configuration
   */
  async getIceServers() {
    // Return cached ICE servers if they're still valid
    const now = Date.now();
    if (this.iceServers && (now - this.lastFetchTime < this.cacheValidityPeriod)) {
      console.log('Using cached ICE servers');
      return this.iceServers;
    }

    try {
      // Check if credentials are available
      if (!this.xirsysIdent || !this.xirsysSecret) {
        console.warn('Missing Xirsys credentials in environment variables');
        return this.getFallbackIceConfiguration();
      }

      // Construct the authorization header
      const authHeader = 'Basic ' + btoa(`${this.xirsysIdent}:${this.xirsysSecret}`);
      
      console.log('Fetching ICE servers from Xirsys...');
      
      // Make the request to Xirsys API
      const response = await fetch(`${this.xirsysUrl}${this.xirsysPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format: 'urls' })
      });

      if (!response.ok) {
        throw new Error(`Xirsys API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.s !== 'ok') {
        throw new Error(`Xirsys API returned error: ${data.e}`);
      }

      // Ensure iceServers is properly formatted as an array of objects
      let iceServers = [];
      
      // Check if data.v.iceServers exists and is an array
      if (data.v && Array.isArray(data.v.iceServers)) {
        iceServers = data.v.iceServers;
      } 
      // If it's an object with urls property, wrap it in an array
      else if (data.v && data.v.iceServers && data.v.iceServers.urls) {
        iceServers = [data.v.iceServers];
      }
      // If it's just a plain object, try to extract urls
      else if (data.v && typeof data.v.iceServers === 'object') {
        // Convert object to array of objects with urls property
        iceServers = Object.keys(data.v.iceServers).map(key => {
          return { urls: data.v.iceServers[key] };
        });
      }
      
      // Validate that we have at least one server with urls
      if (iceServers.length === 0 || !iceServers.some(server => server.urls)) {
        console.warn('Invalid ICE servers format from Xirsys, using fallback');
        return this.getFallbackIceConfiguration();
      }

      // Store the ICE servers and update the last fetch time
      this.iceServers = {
        iceServers: iceServers,
        iceCandidatePoolSize: 10
      };
      this.lastFetchTime = now;
      
      console.log('Successfully fetched ICE servers from Xirsys');
      return this.iceServers;
    } catch (error) {
      console.error('Error fetching ICE servers from Xirsys:', error);
      
      // Return fallback configuration if Xirsys fails
      return this.getFallbackIceConfiguration();
    }
  }

  /**
   * Get fallback ICE configuration in case Xirsys fails
   * @returns {Object} - Fallback ICE server configuration
   */
  getFallbackIceConfiguration() {
    console.warn('Using fallback ICE servers');
    return {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302'
          ]
        }
      ],
      iceCandidatePoolSize: 10
    };
  }
}

export default new XirsysService();