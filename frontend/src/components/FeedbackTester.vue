<template>
  <div class="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Feedback System Tester</h3>
    
    <!-- Test Feedback Form -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
        <div class="flex space-x-2">
          <button
            v-for="star in 5"
            :key="star"
            @click="testRating = star"
            class="text-2xl transition-colors duration-200"
            :class="star <= testRating ? 'text-yellow-400' : 'text-gray-300'"
          >
            ★
          </button>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Comments</label>
        <textarea
          v-model="testComments"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter test comments..."
        ></textarea>
      </div>
      
      <button
        @click="testFeedbackSystem"
        :disabled="testing"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ testing ? 'Testing...' : 'Test Feedback System' }}
      </button>
    </div>
    
    <!-- Test Results -->
    <div v-if="testResult" class="mt-4 p-3 rounded-lg" :class="testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
      <div class="font-medium">{{ testResult.success ? 'Success!' : 'Error!' }}</div>
      <div class="text-sm mt-1">{{ testResult.message }}</div>
      <div v-if="testResult.details" class="text-xs mt-2 font-mono bg-gray-100 p-2 rounded">
        {{ testResult.details }}
      </div>
    </div>
    
    <!-- Check Collection Status -->
    <div class="mt-6 pt-4 border-t border-gray-200">
      <button
        @click="checkFeedbackCollection"
        :disabled="checking"
        class="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ checking ? 'Checking...' : 'Check Feedback Collection Status' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { saveFeedback, getFeedbackByDoctorId, getFeedbackStats } from '@/services/feedbackService'
import { useAuthStore } from '@/stores/modules/authStore'

const authStore = useAuthStore()

const testRating = ref(5)
const testComments = ref('This is a test feedback to verify the system works.')
const testing = ref(false)
const checking = ref(false)
const testResult = ref(null)

const testFeedbackSystem = async () => {
  if (!authStore.user?.userId) {
    testResult.value = {
      success: false,
      message: 'You must be logged in to test the feedback system.',
      details: null
    }
    return
  }

  testing.value = true
  testResult.value = null

  try {
    // Create test feedback data
    const testFeedbackData = {
      appointmentId: 'TEST-APPOINTMENT-001',
      userId: authStore.user.userId,
      doctorId: authStore.user.userId, // Using same ID for testing
      petName: 'Test Pet',
      serviceNames: ['Test Service'],
      overallRating: testRating.value,
      serviceRatings: {
        'Test Service': testRating.value
      },
      positiveAspects: ['test_aspect'],
      areasForImprovement: ['test_improvement'],
      comments: testComments.value,
      followUpPreference: 'none',
      followUpTiming: null,
      submittedAt: new Date(),
      status: 'submitted'
    }

    // Try to save feedback
    const feedbackId = await saveFeedback(testFeedbackData)
    
    testResult.value = {
      success: true,
      message: `Feedback saved successfully! Document ID: ${feedbackId}`,
      details: `Collection: feedback, Document: ${feedbackId}`
    }

    console.log('✅ Feedback system test successful!')
    console.log('Feedback saved with ID:', feedbackId)
    console.log('Test data:', testFeedbackData)

  } catch (error) {
    console.error('❌ Feedback system test failed:', error)
    
    testResult.value = {
      success: false,
      message: 'Failed to save feedback. Check console for details.',
      details: error.message || error.toString()
    }
  } finally {
    testing.value = false
  }
}

const checkFeedbackCollection = async () => {
  if (!authStore.user?.userId) {
    testResult.value = {
      success: false,
      message: 'You must be logged in to check the collection status.',
      details: null
    }
    return
  }

  checking.value = true
  testResult.value = null

  try {
    // Try to get feedback stats (this will tell us if the collection exists)
    const stats = await getFeedbackStats(authStore.user.userId)
    
    testResult.value = {
      success: true,
      message: `Feedback collection is accessible! Found ${stats.totalFeedbacks} feedback entries.`,
      details: `Collection exists and is readable. Stats: ${JSON.stringify(stats, null, 2)}`
    }

    console.log('✅ Feedback collection status check successful!')
    console.log('Collection stats:', stats)

  } catch (error) {
    console.error('❌ Feedback collection status check failed:', error)
    
    testResult.value = {
      success: false,
      message: 'Failed to access feedback collection. Check console for details.',
      details: error.message || error.toString()
    }
  } finally {
    checking.value = false
  }
}
</script>


