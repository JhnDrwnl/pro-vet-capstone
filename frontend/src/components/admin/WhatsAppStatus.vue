<template>
  <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">WhatsApp Integration Status</h3>
      <button 
        @click="checkStatus"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        :class="{ 'animate-spin': isChecking }"
        title="Refresh Status"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </button>
    </div>
    
    <!-- Status Indicator -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-3 h-3 rounded-full" 
           :class="whatsappStatus.isReady ? 'bg-green-500' : 'bg-red-500'">
      </div>
      <span class="text-sm font-medium" 
            :class="whatsappStatus.isReady ? 'text-green-700' : 'text-red-700'">
        {{ whatsappStatus.isReady ? 'Connected' : 'Disconnected' }}
      </span>
      <span class="text-xs text-gray-500">
        {{ whatsappStatus.isReady ? 'Ready to send messages' : 'Please scan QR code' }}
      </span>
    </div>
    
    <!-- Connection Details -->
    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <div class="text-sm text-gray-600 mb-2">Connection Details:</div>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span>Status:</span>
          <span :class="whatsappStatus.isReady ? 'text-green-600' : 'text-red-600'">
            {{ whatsappStatus.isReady ? 'Ready' : 'Not Ready' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Connection:</span>
          <span :class="whatsappStatus.isConnected ? 'text-green-600' : 'text-red-600'">
            {{ whatsappStatus.isConnected ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Test Section -->
    <div class="border-t border-gray-200 pt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Test WhatsApp</h4>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Phone Number</label>
          <input 
            v-model="testPhoneNumber"
            type="tel"
            placeholder="+639123456789"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label class="block text-sm text-gray-600 mb-1">Test Message</label>
          <textarea 
            v-model="testMessage"
            rows="3"
            placeholder="Enter a test message..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          ></textarea>
        </div>
        
        <button 
          @click="sendTestMessage"
          :disabled="!whatsappStatus.isReady || !testPhoneNumber || !testMessage || isSending"
          class="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <svg v-if="isSending" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isSending">Sending...</span>
          <span v-else>Send Test Message</span>
        </button>
      </div>
      
      <!-- Test Result -->
      <div v-if="testResult" class="mt-3 p-3 rounded-md" 
           :class="testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
        <div class="flex items-center gap-2">
          <svg v-if="testResult.success" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="text-sm font-medium">
            {{ testResult.success ? 'Test message sent successfully!' : 'Test failed' }}
          </span>
        </div>
        <div v-if="!testResult.success" class="text-xs mt-1">
          {{ testResult.error }}
        </div>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="mt-4 p-3 bg-blue-50 rounded-md">
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-sm text-blue-800">
          <div class="font-medium mb-1">Setup Instructions:</div>
          <div class="text-blue-700 space-y-1">
            <p>1. Start your backend server</p>
            <p>2. Look for QR code in the console</p>
            <p>3. Scan with WhatsApp on your phone</p>
            <p>4. Wait for "Connected" status</p>
            <p>5. Test with your own number first</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const whatsappStatus = ref({ isReady: false, isConnected: false });
const testPhoneNumber = ref('');
const testMessage = ref('');
const testResult = ref(null);
const isChecking = ref(false);
const isSending = ref(false);

const checkStatus = async () => {
  isChecking.value = true;
  try {
    const response = await fetch('/api/whatsapp/status');
    const status = await response.json();
    whatsappStatus.value = status;
  } catch (error) {
    console.error('Failed to check WhatsApp status:', error);
    whatsappStatus.value = { isReady: false, isConnected: false };
  } finally {
    isChecking.value = false;
  }
};

const sendTestMessage = async () => {
  if (!testPhoneNumber.value || !testMessage.value) return;
  
  isSending.value = true;
  testResult.value = null;
  
  try {
    const response = await fetch('/api/whatsapp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: testPhoneNumber.value,
        message: testMessage.value
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      testResult.value = { success: true, messageId: result.messageId };
      // Clear form on success
      testPhoneNumber.value = '';
      testMessage.value = '';
    } else {
      testResult.value = { success: false, error: result.error };
    }
    
  } catch (error) {
    testResult.value = { 
      success: false, 
      error: 'Failed to send test message: ' + error.message 
    };
  } finally {
    isSending.value = false;
  }
};

onMounted(() => {
  checkStatus();
  // Check status every 30 seconds
  setInterval(checkStatus, 30000);
});
</script>
