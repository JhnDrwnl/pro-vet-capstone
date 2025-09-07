// src/services/MLInferenceService.js
class MLInferenceService {
  constructor() {
    // Use the new ML inference service URL
    this.baseUrl = import.meta.env.VITE_ML_INFERENCE_URL || 'https://ml-inference-ixmsorgbta-uc.a.run.app';
    this.isConnected = true; // Always true for REST API
    this.connectionCallbacks = [];
    this.messageCallbacks = [];
  }

  // Simulate WebSocket-like connection for compatibility
  async connect() {
    try {
      // Test the connection by calling the health endpoint
      const response = await fetch(`${this.baseUrl}/health/predictions/health/`);
      if (response.ok) {
        console.log('ML Inference Service connected successfully');
        this.isConnected = true;
        this.connectionCallbacks.forEach(callback => callback(true));
        return Promise.resolve();
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to connect to ML Inference Service:', error);
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
      return Promise.reject(error);
    }
  }

  // Send prediction request via REST API
  async sendMessage(message) {
    try {
      // Transform the WebSocket message format to REST API format
      const apiPayload = this.transformMessageForAPI(message);
      
      console.log('Sending prediction request to ML service:', apiPayload);
      
      const response = await fetch(`${this.baseUrl}/api/predictions/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Received prediction result:', result);
      
      // Simulate WebSocket message callback
      this.messageCallbacks.forEach(callback => callback(result));
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error sending prediction request:', error);
      return Promise.reject(error);
    }
  }

  // Transform WebSocket message format to REST API format
  transformMessageForAPI(wsMessage) {
    // Extract species and patient data
    const { species, patient_data } = wsMessage;
    
    // Transform symptoms from the WebSocket format to API format
    const symptoms = [];
    
    // Add main symptoms field
    if (patient_data.Symptoms) {
      symptoms.push(patient_data.Symptoms);
    }
    
    // Add individual symptom entries
    for (let i = 1; i <= 10; i++) {
      const symptomKey = `Symptom ${i}`;
      if (patient_data[symptomKey]) {
        symptoms.push(patient_data[symptomKey]);
      }
    }
    
    // Create API payload
    const apiPayload = {
      pet_data: {
        species: species,
        age: patient_data['Age (years)'],
        weight: patient_data['Weight (kg)'],
        breed: patient_data.Breed || '',
        past_diagnosis: patient_data['Past Diagnosis'] || '',
        treatment: patient_data.Treatment || '',
        vaccination_status: patient_data.Vaccination_Status || 'unknown'
      },
      symptoms: symptoms.filter(s => s && s.trim() !== '')
    };
    
    return apiPayload;
  }

  // Simulate WebSocket message listener
  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  // Simulate WebSocket connection change listener
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Disconnect (no-op for REST API)
  disconnect() {
    this.isConnected = false;
    this.connectionCallbacks.forEach(callback => callback(false));
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Test the service health
  async testHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health/predictions/health/`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get service info
  async getServiceInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/health/predictions/health/`);
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          service: 'ML Inference Service',
          url: this.baseUrl,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 'unhealthy',
          service: 'ML Inference Service',
          url: this.baseUrl,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        service: 'ML Inference Service',
        url: this.baseUrl,
        error: error.message
      };
    }
  }
}

export default new MLInferenceService();
