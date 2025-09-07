<template>
  <div class="ml-service-tester p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">🧪 ML Service Tester</h2>
    
    <!-- Connection Status -->
    <div class="mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Connection Status:</span>
        <span 
          :class="connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'"
          class="font-semibold"
        >
          {{ connectionStatus === 'connected' ? '✅ Connected' : '❌ Disconnected' }}
        </span>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        Service: {{ serviceUrl }}
      </div>
    </div>

    <!-- Test Controls -->
    <div class="space-y-4">
      <!-- Health Check -->
      <div class="border rounded-lg p-4">
        <h3 class="font-medium mb-2">🏥 Health Check</h3>
        <button 
          @click="testHealth"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Testing...' : 'Test Health' }}
        </button>
        <div v-if="healthResult" class="mt-2 text-sm">
          <pre class="bg-gray-100 p-2 rounded text-xs">{{ JSON.stringify(healthResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Test Prediction -->
      <div class="border rounded-lg p-4">
        <h3 class="font-medium mb-2">🔮 Test Prediction</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Species</label>
            <select v-model="testData.species" class="w-full border rounded px-3 py-2">
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="hamster">Hamster</option>
              <option value="rabbit">Rabbit</option>
              <option value="bird">Bird</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Age</label>
            <input v-model.number="testData.age" type="number" class="w-full border rounded px-3 py-2" min="0" max="20">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Weight (kg)</label>
            <input v-model.number="testData.weight" type="number" class="w-full border rounded px-3 py-2" min="0" step="0.1">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Symptoms</label>
            <input v-model="testData.symptoms" placeholder="fever, lethargy" class="w-full border rounded px-3 py-2">
          </div>
        </div>
        <button 
          @click="testPrediction"
          :disabled="isLoading"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Predicting...' : 'Test Prediction' }}
        </button>
        <div v-if="predictionResult" class="mt-2 text-sm">
          <pre class="bg-gray-100 p-2 rounded text-xs">{{ JSON.stringify(predictionResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Service Info -->
      <div class="border rounded-lg p-4">
        <h3 class="font-medium mb-2">ℹ️ Service Information</h3>
        <button 
          @click="getServiceInfo"
          :disabled="isLoading"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Loading...' : 'Get Service Info' }}
        </button>
        <div v-if="serviceInfo" class="mt-2 text-sm">
          <pre class="bg-gray-100 p-2 rounded text-xs">{{ JSON.stringify(serviceInfo, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
      <strong>Error:</strong> {{ error }}
    </div>
  </div>
</template>

<script>
import MLInferenceService from '@/services/MLInferenceService';

export default {
  name: 'MLServiceTester',
  data() {
    return {
      connectionStatus: 'disconnected',
      serviceUrl: MLInferenceService.baseUrl,
      isLoading: false,
      healthResult: null,
      predictionResult: null,
      serviceInfo: null,
      error: null,
      testData: {
        species: 'dog',
        age: 3,
        weight: 15,
        symptoms: 'fever, lethargy'
      }
    };
  },
  async mounted() {
    await this.connect();
  },
  methods: {
    async connect() {
      try {
        await MLInferenceService.connect();
        this.connectionStatus = 'connected';
        this.error = null;
      } catch (error) {
        this.connectionStatus = 'disconnected';
        this.error = error.message;
      }
    },
    
    async testHealth() {
      this.isLoading = true;
      this.error = null;
      try {
        const isHealthy = await MLInferenceService.testHealth();
        this.healthResult = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async testPrediction() {
      this.isLoading = true;
      this.error = null;
      try {
        // Format test data
        const symptoms = this.testData.symptoms
          .split(',')
          .map(s => s.trim())
          .filter(s => s);
        
        const testPayload = {
          pet_data: {
            species: this.testData.species,
            age: this.testData.age,
            weight: this.testData.weight,
            breed: 'Test Breed',
            past_diagnosis: '',
            treatment: '',
            vaccination_status: 'unknown'
          },
          symptoms: symptoms
        };
        
        // Send test prediction
        await MLInferenceService.sendMessage(testPayload);
        
        // Get result from message callback
        this.predictionResult = {
          message: 'Prediction request sent successfully',
          payload: testPayload,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getServiceInfo() {
      this.isLoading = true;
      this.error = null;
      try {
        this.serviceInfo = await MLInferenceService.getServiceInfo();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.ml-service-tester {
  max-width: 800px;
  margin: 0 auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
