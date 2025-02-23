<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <!-- Logo -->
      <div class="mb-8 flex items-center">
        <div class="mt-2 items-center justify-center">
          <img src="@/assets/media/images/landing/provetblue.png" alt="Logo" class="w-12 h-12">
        </div>
       
      </div>
  
      <!-- Step 1: Email Input -->
      <div v-if="currentStep === 1" class="w-full max-w-[360px] space-y-6">
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-900">Forgot password?</h1>
          <p class="mt-2 text-sm text-gray-600">No worries, we'll send you reset instructions.</p>
        </div>
  
        <form @submit.prevent="handleEmailSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            >
          </div>
          <button 
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset password
          </button>
        </form>
  
        <button 
          @click="$router.push('/login')"
          class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
        >
          <span class="text-sm">← Back to log in</span>
        </button>
      </div>
  
      <!-- Step 2: Verification Code -->
      <div v-if="currentStep === 2" class="w-full max-w-[360px] space-y-6">
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-900">Password reset</h1>
          <p class="mt-2 text-sm text-gray-600">We sent a code to {{ email }}</p>
        </div>
  
        <div class="flex gap-2 justify-center">
          <input 
            v-for="(digit, index) in 6" 
            :key="index"
            v-model="verificationCode[index]"
            type="text"
            maxlength="1"
            class="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="handleCodeInput($event, index)"
            @keydown.delete="handleBackspace($event, index)"
          >
        </div>
  
        <button 
          @click="handleVerificationSubmit"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="!isCodeComplete"
        >
          Continue
        </button>
  
        <div class="text-center text-sm">
          <span class="text-gray-600">Didn't receive the email?</span>
          <button class="text-blue-600 hover:text-blue-700 ml-1" @click="resendCode">
            Click to resend
          </button>
        </div>
  
        <button 
          @click="currentStep = 1"
          class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
        >
          <span class="text-sm">← Back to log in</span>
        </button>
      </div>
  
      <!-- Step 3: New Password -->
      <div v-if="currentStep === 3" class="w-full max-w-[360px] space-y-6">
        <div class="text-center">
          <h1 class="text-xl font-semibold text-gray-900">Set new password</h1>
          <p class="mt-2 text-sm text-gray-600">Must be at least 8 characters.</p>
        </div>
  
        <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            >
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input 
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            >
          </div>
          <button 
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset password
          </button>
        </form>
  
        <button 
          @click="currentStep = 2"
          class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
        >
          <span class="text-sm">← Back to verification</span>
        </button>
      </div>
  
      <!-- Step 4: Success -->
      <div v-if="currentStep === 4" class="w-full max-w-[360px] space-y-6">
        <div class="text-center">
          <div class="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckIcon class="w-6 h-6 text-green-600" />
          </div>
          <h1 class="text-xl font-semibold text-gray-900">All done!</h1>
          <p class="mt-2 text-sm text-gray-600">Your password has been reset. Would you like to set up Face ID as well?</p>
        </div>
  
        <div class="space-y-3">
          <button 
            @click="setupFaceId"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaceIdIcon class="w-5 h-5" />
            Set up Face ID
          </button>
          <button 
            @click="$router.push('/login')"
            class="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            I'll do this later
          </button>
        </div>
      </div>
  
      <!-- Progress Dots -->
      <div class="mt-8 flex gap-2">
        <div v-for="step in 4" :key="step" 
             class="w-16 h-1 rounded-full transition-colors"
             :class="step === currentStep ? 'bg-blue-600' : 'bg-gray-200'"
        ></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { CheckIcon } from 'lucide-vue-next'
  
  // State
  const currentStep = ref(1)
  const email = ref('')
  const verificationCode = ref(['', '', '', '', '', ''])
  const password = ref('')
  const confirmPassword = ref('')
  
  // Computed
  const isCodeComplete = computed(() => {
    return verificationCode.value.every(digit => digit !== '')
  })
  
  // Methods
  const handleEmailSubmit = () => {
    // Add email validation logic here
    currentStep.value = 2
  }
  
  const handleCodeInput = (event, index) => {
    const input = event.target
    if (input.value && index < 5) {
      // Move to next input
      input.nextElementSibling?.focus()
    }
  }
  
  const handleBackspace = (event, index) => {
    if (!event.target.value && index > 0) {
      // Move to previous input
      event.target.previousElementSibling?.focus()
    }
  }
  
  const handleVerificationSubmit = () => {
    // Add verification logic here
    currentStep.value = 3
  }
  
  const resendCode = () => {
    // Add resend logic here
    alert('Verification code resent!')
  }
  
  const handlePasswordSubmit = () => {
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match!')
      return
    }
    // Add password reset logic here
    currentStep.value = 4
  }
  
  const setupFaceId = () => {
    // Add Face ID setup logic here
    alert('Face ID setup would start here')
    // Redirect to login or dashboard
  }
  
  // Icon component for Face ID
  const FaceIdIcon = {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 8V6a2 2 0 0 1 2-2h2"></path>
        <path d="M4 16v2a2 2 0 0 0 2 2h2"></path>
        <path d="M16 4h2a2 2 0 0 1 2 2v2"></path>
        <path d="M16 20h2a2 2 0 0 0 2-2v-2"></path>
        <path d="M9 10h.01"></path>
        <path d="M15 10h.01"></path>
        <path d="M9.5 15a3.5 3.5 0 0 0 5 0"></path>
      </svg>
    `
  }
  </script>
  
  <style scoped>
  /* Add any additional styling here */
  </style>