<template>
  <div class="prediction-form">
    <h2>Veterinary Disease Prediction</h2>
    
    <div v-if="connectionStatus === false" class="connection-error">
      <div class="error-message">
        <strong>Connection Error:</strong> Cannot connect to the prediction server.
        <button @click="reconnectWebSocket" class="reconnect-button">
          Reconnect
        </button>
      </div>
    </div>
    
    <div v-if="!predictionResult">
      <div class="form-group">
        <label for="pet-name">Pet Name</label>
        <input id="pet-name" v-model="patientData.petName" type="text" />
      </div>
      
      <div class="form-group">
        <label for="species">Species</label>
        <select id="species" v-model="species">
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="chicken">Chicken</option>
          <option value="fish">Fish</option>
          <option value="hamster">Hamster</option>
          <option value="rabbit">Rabbit</option>
          <option value="snake">Snake</option>
          <option value="turtle">Turtle</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="age">Age (years)</label>
        <input id="age" v-model.number="patientData.age" type="number" step="0.1" />
      </div>
      
      <div class="form-group">
        <label for="weight">Weight (kg)</label>
        <input id="weight" v-model.number="patientData.weight" type="number" step="0.1" />
      </div>
      
      <div class="form-group">
        <label for="breed">Breed</label>
        <input id="breed" v-model="patientData.breed" type="text" />
      </div>
      
      <div class="form-group">
        <label for="symptoms">Symptoms</label>
        <textarea id="symptoms" v-model="patientData.symptoms" rows="4"></textarea>
      </div>
      
      <button 
        @click="submitPrediction" 
        :disabled="isLoading || connectionStatus === false"
        class="submit-button"
      >
        {{ isLoading ? 'Processing...' : 'Predict Disease' }}
      </button>
      
      <div v-if="error" class="error-message mt-3">
        {{ error }}
      </div>
    </div>
    
    <div v-else class="prediction-results">
      <h3>Prediction Results for {{ patientData.petName }}</h3>
      
      <div class="results-section">
        <h4>Predicted Diseases</h4>
        <div class="prediction-list">
          <div 
            v-for="(prediction, index) in predictionResult.predictions" 
            :key="index"
            class="prediction-item"
          >
            <div class="disease-name">{{ prediction.disease }}</div>
            <div class="probability">
              {{ (prediction.probability * 100).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
      
      <div class="results-section" v-if="predictionResult.report">
        <h4>Recommended Diagnostics</h4>
        <ul class="diagnostics-list">
          <li v-for="(diagnostic, index) in predictionResult.report.diagnostics" :key="index">
            {{ diagnostic }}
          </li>
        </ul>
      </div>
      
      <button @click="resetForm" class="reset-button">
        New Prediction
      </button>
    </div>
  </div>
</template>

<script>
import WebSocketService from '@/services/WebSocketService';

export default {
  name: 'VetHealthRisk',
  
  data() {
    return {
      patientData: {
        petName: '',
        age: null,
        weight: null,
        breed: '',
        symptoms: ''
      },
      species: 'dog',
      isLoading: false,
      connectionStatus: null,
      error: null,
      predictionResult: null,
      messageListener: null
    };
  },
  
  created() {
    // Connect to WebSocket when component is created
    this.connectWebSocket();
    
    // Listen for connection changes
    this.unsubscribeConnection = WebSocketService.onConnectionChange((status) => {
      console.log('WebSocket connection status changed:', status);
      this.connectionStatus = status;
    });
  },
  
  beforeUnmount() {
    // Clean up WebSocket connection
    if (this.unsubscribeConnection) {
      this.unsubscribeConnection();
    }
    
    // Remove message listener if exists
    if (this.messageListener) {
      this.messageListener();
    }
  },
  
  methods: {
    async connectWebSocket() {
      try {
        await WebSocketService.connect();
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        this.error = 'Failed to connect to the prediction server. Please try again later.';
      }
    },
    
    async reconnectWebSocket() {
      this.error = null;
      try {
        await WebSocketService.connect();
      } catch (error) {
        this.error = 'Failed to reconnect. Please try again later.';
      }
    },
    
    async submitPrediction() {
      if (!this.validateForm()) {
        return;
      }
      
      this.isLoading = true;
      this.error = null;
      
      // Format patient data for the backend
      const formattedData = {
        patient_data: {
          'Pet Name': this.patientData.petName,
          'Age (years)': this.patientData.age,
          'Weight (kg)': this.patientData.weight,
          'Breed': this.patientData.breed,
          'Symptoms': this.patientData.symptoms
        },
        species: this.species
      };
      
      // Set up message listener
      if (this.messageListener) {
        this.messageListener(); // Remove previous listener
      }
      
      this.messageListener = WebSocketService.onMessage((data) => {
        this.isLoading = false;
        
        if (data.error) {
          this.error = data.error;
        } else {
          this.predictionResult = data;
        }
      });
      
      try {
        // Send the message
        await WebSocketService.sendMessage(formattedData);
      } catch (error) {
        this.isLoading = false;
        this.error = `Error: ${error.message}`;
        console.error('Error sending prediction request:', error);
      }
    },
    
    validateForm() {
      // Reset previous errors
      this.error = null;
      
      // Basic validation
      if (!this.patientData.petName) {
        this.error = 'Please enter a pet name';
        return false;
      }
      
      if (this.patientData.age === null || this.patientData.age < 0) {
        this.error = 'Please enter a valid age';
        return false;
      }
      
      if (this.patientData.weight === null || this.patientData.weight < 0) {
        this.error = 'Please enter a valid weight';
        return false;
      }
      
      if (!this.patientData.symptoms) {
        this.error = 'Please enter symptoms';
        return false;
      }
      
      return true;
    },
    
    resetForm() {
      this.predictionResult = null;
      this.error = null;
      
      // Reset form fields but keep the species selection
      this.patientData = {
        petName: '',
        age: null,
        weight: null,
        breed: '',
        symptoms: ''
      };
    }
  }
};
</script>

<style scoped>
.prediction-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2, h3, h4 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.submit-button, .reset-button {
  display: block;
  width: 100%;
  padding: 10px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button {
  background-color: #4CAF50;
}

.submit-button:hover {
  background-color: #45a049;
}

.reset-button {
  background-color: #2196F3;
  margin-top: 20px;
}

.reset-button:hover {
  background-color: #0b7dda;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  padding: 10px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  text-align: center;
}

.connection-error {
  margin-bottom: 15px;
}

.reconnect-button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reconnect-button:hover {
  background-color: #0b7dda;
}

.prediction-results {
  margin-top: 20px;
}

.results-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f8ff;
  border-radius: 4px;
}

.prediction-list {
  margin-top: 10px;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #ddd;
}

.prediction-item:last-child {
  border-bottom: none;
}

.disease-name {
  font-weight: bold;
}

.probability {
  font-weight: bold;
  color: #4CAF50;
}

.diagnostics-list {
  margin: 0;
  padding-left: 20px;
}

.mt-3 {
  margin-top: 15px;
}
</style>