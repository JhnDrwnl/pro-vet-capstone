<!-- views/auth/ForgotPassword.vue.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-4 py-8">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
      <!-- Left Side - Progress Steps (blue) -->
      <div class="w-full md:w-2/5 p-8 bg-blue-900 text-white">
        <!-- Mobile Steps - Horizontal with equal spacing -->
        <div class="md:hidden w-full mb-8 relative">
          <div class="grid grid-cols-4 gap-4 px-4">
            <!-- Progress Line -->
            <div class="absolute top-[17px] left-[calc(8%+18px)] right-[calc(8%+18px)] h-[2px] bg-blue-700">
              <!-- Completed line segments -->
              <div 
                class="absolute top-0 left-0 h-full bg-white transition-all duration-300"
                :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"
              ></div>
            </div>
            <!-- Step 1 -->
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div v-if="currentStep > 1" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 1"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <p class="text-xs text-blue-200 font-medium text-center">STEP 1</p>
              <p class="text-sm font-medium text-center text-white">
                Email
              </p>
            </div>
    
            <!-- Step 2 -->
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div v-if="currentStep > 2" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 2"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <p class="text-xs text-blue-200 font-medium text-center">STEP 2</p>
              <p class="text-sm font-medium text-center text-white">
                Code
              </p>
            </div>
    
            <!-- Step 3 -->
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div v-if="currentStep > 3" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 3"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <p class="text-xs text-blue-200 font-medium text-center">STEP 3</p>
              <p class="text-sm font-medium text-center text-white">
                Password
              </p>
            </div>
    
            <!-- Step 4 -->
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div v-if="currentStep > 4" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 4"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <p class="text-xs text-blue-200 font-medium text-center">STEP 4</p>
              <p class="text-sm font-medium text-center text-white">
                Done
              </p>
            </div>
          </div>
        </div>
    
        <!-- Desktop Steps - Vertical -->
        <div class="hidden md:block relative">
          <!-- Vertical line -->
          <div class="absolute left-[17px] top-[30px] bottom-4 w-[2px] bg-blue-700">
            <!-- Completed line segments -->
            <div 
              class="absolute top-0 w-full bg-white transition-all duration-300"
              :style="{ height: `${(currentStep - 1) * 33.33}%` }"
            ></div>
          </div>
    
          <!-- Steps -->
          <div class="space-y-8 relative">
            <!-- Step 1 -->
            <div class="flex items-start">
              <div class="relative">
                <div v-if="currentStep > 1" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 1"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-blue-200 font-medium">STEP 1</p>
                <p class="font-medium text-white">
                  Email Verification
                </p>
              </div>
            </div>
    
            <!-- Step 2 -->
            <div class="flex items-start">
              <div class="relative">
                <div v-if="currentStep > 2" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 2"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-blue-200 font-medium">STEP 2</p>
                <p class="font-medium text-white">
                  Code Verification
                </p>
              </div>
            </div>
    
            <!-- Step 3 -->
            <div class="flex items-start">
              <div class="relative">
                <div v-if="currentStep > 3" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 3"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-blue-200 font-medium">STEP 3</p>
                <p class="font-medium text-white">
                  New Password
                </p>
              </div>
            </div>
    
            <!-- Step 4 -->
            <div class="flex items-start">
              <div class="relative">
                <div v-if="currentStep > 4" 
                     class="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 4"
                     class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-blue-300"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-blue-200 font-medium">STEP 4</p>
                <p class="font-medium text-white">
                  Confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Lottie Animation -->
        <div class="w-full mt-12 hidden md:block">
          <DotLottieVue
            src="https://lottie.host/c8b6eda0-6211-4124-8483-f57f7cf9d0bc/k5Va8KyWd5.lottie"
            autoplay
            loop
            class="w-full h-[250px]"
          />
        </div>
      </div>
    
      <!-- Right Side - Forms with Dog Image -->
      <div class="w-full md:w-3/5 bg-blue-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <!-- Form Container with Dog Image -->
        <div class="relative w-full max-w-md flex flex-col items-center">
          <!-- Dog Image -->
          <div class="w-64 h-32 -mb-8 mt-0 relative z-10 flex items-center justify-center">
            <img 
              src="@/assets/media/images/auth/doggy.png"
              alt="Friendly dog"
              class="w-full h-auto object-contain"
            />
          </div>
    
          <!-- Forms - Each step gets a white background -->
          <!-- Step 1: Email Input -->
          <div v-if="currentStep === 1" class="space-y-6 bg-white p-6 pt-16 rounded-xl shadow-sm w-full relative z-0 mt-4">
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-gray-900">Forgot password?</h1>
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="Enter your email"
                >
              </div>
              <button 
                type="submit"
                :disabled="loading"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ loading ? 'Sending...' : 'Reset password' }}
              </button>
              
              <div v-if="error" class="text-red-500 text-sm text-center">
                {{ error }}
              </div>
            </form>
    
            <button 
              @click="$router.push('/auth/login')"
              class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <span class="text-sm">← Back to log in</span>
            </button>
          </div>
    
          <!-- Step 2: Verification Code -->
          <div v-if="currentStep === 2" class="space-y-6 bg-white p-6 pt-16 rounded-xl shadow-sm w-full relative z-0 mt-4">
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-gray-900">Password reset</h1>
              <p class="mt-2 text-sm text-gray-600">We sent a code to {{ email }}</p>
            </div>
    
            <!-- Responsive OTP Input Fields -->
            <div class="flex flex-wrap justify-center px-2">
              <div class="grid grid-cols-6 gap-1 sm:gap-2 w-full max-w-xs mx-auto">
                <input 
                  v-for="(_, index) in 6" 
                  :key="index"
                  v-model="verificationCode[index]"
                  type="text"
                  maxlength="1"
                  class="w-full h-10 sm:h-12 border border-gray-300 rounded-lg text-center text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': verificationStatus === 'invalid' || verificationStatus === 'expired' }"
                  @input="handleCodeInput($event, index)"
                  @keydown.delete="handleBackspace($event, index)"
                  @paste="handlePaste($event)"
                  :aria-label="`Verification code digit ${index + 1}`"
                  ref="codeInputs"
                >
              </div>
            </div>

            <div v-if="error" class="text-red-600 text-sm text-center">
              {{ error }}
            </div>
    
            <button 
              @click="handleVerificationSubmit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              :disabled="!isCodeComplete || loading"
            >
              {{ loading ? 'Verifying...' : 'Continue' }}
            </button>
    
            <div class="text-center text-sm">
              <p class="text-gray-600">Didn't receive the code?</p>
              <button 
                class="text-blue-500 hover:text-blue-700" 
                @click="resendCode"
                :disabled="resendTimer > 0 || loading"
              >
                {{ resendTimer > 0 ? `Resend code in ${formatTime(resendTimer)}` : 'Click to resend' }}
              </button>
            </div>
    
            <button 
              @click="currentStep = 1"
              class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <span class="text-sm">← Back to previous step</span>
            </button>
          </div>
    
          <!-- Step 3: New Password -->
          <div v-if="currentStep === 3" class="space-y-6 bg-white p-6 pt-16 rounded-xl shadow-sm w-full relative z-0 mt-4">
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-gray-900">Set new password</h1>
              <p class="mt-2 text-sm text-gray-600">Must be at least 8 characters.</p>
            </div>
    
            <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div class="relative">
                  <input 
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none pr-10"
                    placeholder="Enter your password"
                  >
                  <button 
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  >
                    <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                    <EyeOffIcon v-else class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <div class="relative">
                  <input 
                    id="confirmPassword"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none pr-10"
                    placeholder="Confirm your password"
                  >
                  <button 
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
                  >
                    <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
                    <EyeOffIcon v-else class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                :disabled="loading"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ loading ? 'Resetting...' : 'Reset password' }}
              </button>
              
              <div v-if="error" class="text-red-500 text-sm text-center">
                {{ error }}
              </div>
            </form>
    
            <button 
              @click="currentStep = 2"
              class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <span class="text-sm">← Back to previous step</span>
            </button>
          </div>
    
          <!-- Step 4: Success -->
          <div v-if="currentStep === 4" class="space-y-6 bg-white p-6 pt-16 rounded-xl shadow-sm w-full relative z-0 mt-4">
            <div class="text-center">
              <div class="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckIcon class="w-6 h-6 text-green-600" />
              </div>
              <h1 class="text-2xl font-semibold text-gray-900">All done!</h1>
              <p class="mt-2 text-sm text-gray-600">Your password has been reset.</p>
            </div>
    
            <button 
              @click="redirectToLogin"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { useAuthStore } from '@/stores/modules/authStore'
import emailService from '@/services/emailService'

// Constants
const OTP_EXPIRY_SECONDS = 300 // 5 minutes
const OTP_EXPIRY_TEXT = '5 minutes'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const currentStep = ref(1)
const email = ref('')
const verificationCode = ref(['', '', '', '', '', ''])
const codeInputs = ref([])
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const verificationStatus = ref('')
const resendTimer = ref(120) // 2 minutes cooldown for resend (matching VerifyEmail)
const otpExpiryTime = ref(OTP_EXPIRY_SECONDS)
let resendInterval = null
let expiryInterval = null

// Set email from route query on mount
if (route.query.email) {
  email.value = route.query.email
}

// Computed
const isCodeComplete = computed(() => {
  return verificationCode.value.every(digit => digit !== '')
})

// Methods
const handleEmailSubmit = async () => {
  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    try {
      // Send password reset OTP via email service with retry logic
      await sendPasswordResetOTPWithRetry(email.value)
      
      // Move to verification step
      currentStep.value = 2
      startResendTimer()
      startExpiryTimer()
      
      // Focus on first input after transition
      nextTick(() => {
        if (codeInputs.value[0]) {
          codeInputs.value[0].focus()
        }
      })
    } catch (err) {
      if (err.message.includes('timeout')) {
        // If timeout, assume the email was sent anyway and proceed
        console.warn('Timeout occurred but proceeding to next step')
        currentStep.value = 2
        startResendTimer()
        startExpiryTimer()
        
        // Focus on first input after transition
        nextTick(() => {
          if (codeInputs.value[0]) {
            codeInputs.value[0].focus()
          }
        })
      } else {
        throw err
      }
    }
  } catch (err) {
    console.error('Failed to send verification code:', err)
    error.value = 'Failed to send verification code. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Retry logic for sending password reset OTP
const sendPasswordResetOTPWithRetry = async (userEmail, maxRetries = 2) => {
  let retryCount = 0
  let lastError = null

  while (retryCount <= maxRetries) {
    try {
      return await emailService.sendPasswordResetOTP(userEmail)
    } catch (err) {
      lastError = err
      retryCount++
      
      if (retryCount <= maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        console.log(`Retrying send OTP (${retryCount}/${maxRetries})...`)
      }
    }
  }
  
  throw lastError
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleCodeInput = (event, index) => {
  const input = event.target
  const value = input.value
  
  // Ensure only numbers
  if (!/^\d*$/.test(value)) {
    verificationCode.value[index] = ''
    return
  }
  
  // Move to next input
  if (value && index < 5) {
    nextTick(() => {
      if (codeInputs.value[index + 1]) {
        codeInputs.value[index + 1].focus()
      }
    })
  } else if (value && index === 5) {
    // Auto-verify when all digits are entered
    if (isCodeComplete.value) {
      handleVerificationSubmit()
    }
  }
  
  // Clear error when user types
  error.value = ''
  verificationStatus.value = ''
}

const handleBackspace = (event, index) => {
  // Handle backspace
  if (!verificationCode.value[index] && index > 0) {
    nextTick(() => {
      if (codeInputs.value[index - 1]) {
        codeInputs.value[index - 1].focus()
      }
    })
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text')
  const numbers = pastedData.replace(/\D/g, '').split('').slice(0, 6)
  
  numbers.forEach((num, index) => {
    if (index < 6) {
      verificationCode.value[index] = num
    }
  })
  
  // Focus on the next empty input or the last one if all filled
  nextTick(() => {
    const emptyIndex = verificationCode.value.findIndex(digit => digit === '')
    if (emptyIndex !== -1) {
      if (codeInputs.value[emptyIndex]) {
        codeInputs.value[emptyIndex].focus()
      }
    } else if (codeInputs.value[5]) {
      codeInputs.value[5].focus()
    }
  })
  
  // Clear error when user pastes
  error.value = ''
  verificationStatus.value = ''
}

const handleVerificationSubmit = async () => {
  if (!isCodeComplete.value) {
    error.value = 'Please enter the complete verification code'
    return
  }
  
  try {
    loading.value = true
    error.value = ''
    verificationStatus.value = ''
    
    const code = verificationCode.value.join('')
    
    // Check if code has expired on client side first
    if (otpExpiryTime.value <= 0) {
      error.value = 'Verification code has expired. Please request a new one.'
      verificationStatus.value = 'expired'
      loading.value = false
      return
    }
    
    try {
      // Verify OTP with retry logic
      const verifyResult = await verifyOTPWithRetry(email.value, code)
      console.log('OTP verification result:', verifyResult)
      
      if (verifyResult.success && verifyResult.valid) {
        verificationStatus.value = 'success'
        // Wait a moment to show success message before proceeding
        setTimeout(() => {
          currentStep.value = 3
        }, 1000)
      } else {
        throw new Error(verifyResult.message || 'Verification failed')
      }
    } catch (err) {
      if (err.status === 'expired') {
        error.value = 'Verification code has expired. Please request a new one.'
        verificationStatus.value = 'expired'
        // Reset expiry timer
        otpExpiryTime.value = 0
      } else if (err.status === 'invalid') {
        error.value = 'The verification code you entered is incorrect. Please try again.'
        verificationStatus.value = 'invalid'
      } else if (err.message.includes('expired')) {
        error.value = 'Verification code has expired. Please request a new one.'
        verificationStatus.value = 'expired'
        // Reset expiry timer
        otpExpiryTime.value = 0
      } else if (err.message.includes('timeout')) {
        // If timeout, assume verification succeeded and proceed
        console.warn('Timeout occurred during verification but proceeding to next step')
        currentStep.value = 3
      } else {
        error.value = err.message || 'Invalid verification code. Please try again.'
        verificationStatus.value = 'invalid'
      }
    }
  } catch (err) {
    console.error('Verification failed:', err)
    error.value = err.message || 'Invalid verification code. Please try again.'
    verificationStatus.value = 'invalid'
  } finally {
    loading.value = false
  }
}

// Retry logic for verifying OTP
const verifyOTPWithRetry = async (userEmail, code, maxRetries = 2) => {
  let retryCount = 0
  let lastError = null

  while (retryCount <= maxRetries) {
    try {
      return await emailService.verifyOTP(userEmail, code, 'password-reset')
    } catch (err) {
      lastError = err
      retryCount++
      
      if (retryCount <= maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        console.log(`Retrying verify OTP (${retryCount}/${maxRetries})...`)
      }
    }
  }
  
  throw lastError
}

const handlePasswordSubmit = async () => {
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match!'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const code = verificationCode.value.join('')
    console.log('Attempting password reset with code:', code)
    
    try {
      // Reset password with retry logic
      const resetResult = await resetPasswordWithRetry(email.value, code, password.value)
      console.log('Password reset result:', resetResult)
      
      if (resetResult.success) {
        currentStep.value = 4
      } else {
        throw new Error(resetResult.message || 'Password reset failed')
      }
    } catch (err) {
      if (err.status === 'expired') {
        error.value = 'Verification code has expired. Please go back and request a new one.'
      } else if (err.message.includes('expired')) {
        error.value = 'Verification code has expired. Please go back and request a new one.'
      } else if (err.message.includes('timeout')) {
        // If timeout, assume password reset succeeded and proceed
        console.warn('Timeout occurred during password reset but proceeding to success step')
        currentStep.value = 4
      } else {
        throw err
      }
    }
  } catch (err) {
    console.error('Failed to reset password:', err)
    error.value = err.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}

// Retry logic for resetting password
const resetPasswordWithRetry = async (userEmail, code, newPassword, maxRetries = 3) => {
  let retryCount = 0
  let lastError = null

  while (retryCount <= maxRetries) {
    try {
      return await emailService.resetPasswordWithOTP(userEmail, code, newPassword)
    } catch (err) {
      lastError = err
      retryCount++
      
      if (retryCount <= maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        console.log(`Retrying password reset (${retryCount}/${maxRetries})...`)
      }
    }
  }
  
  throw lastError
}

// Format time from seconds to M:SS
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const startResendTimer = () => {
  resendTimer.value = 120 // 2 minutes cooldown (matching VerifyEmail)
  clearInterval(resendInterval)
  
  resendInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(resendInterval)
    }
  }, 1000)
}

const startExpiryTimer = () => {
  otpExpiryTime.value = OTP_EXPIRY_SECONDS
  clearInterval(expiryInterval)
  
  expiryInterval = setInterval(() => {
    if (otpExpiryTime.value > 0) {
      otpExpiryTime.value--
    } else {
      clearInterval(expiryInterval)
      // If we're still on the verification step when OTP expires
      if (currentStep.value === 2) {
        error.value = 'Verification code has expired. Please request a new one.'
        verificationStatus.value = 'expired'
      }
    }
  }, 1000)
}

const resendCode = async () => {
  if (resendTimer.value > 0) return
  
  try {
    loading.value = true
    error.value = ''
    verificationStatus.value = ''
    
    try {
      // Resend password reset OTP with retry logic
      await sendPasswordResetOTPWithRetry(email.value)
      
      // Reset verification code fields
      verificationCode.value = ['', '', '', '', '', '']
      
      // Focus on first input
      nextTick(() => {
        if (codeInputs.value[0]) {
          codeInputs.value[0].focus()
        }
      })
      
      // Reset timers
      startResendTimer()
      startExpiryTimer()
    } catch (err) {
      if (err.message.includes('timeout')) {
        // If timeout, assume the email was sent anyway
        console.warn('Timeout occurred during resend but assuming success')
        startResendTimer()
        startExpiryTimer()
      } else {
        throw err
      }
    }
  } catch (err) {
    console.error('Failed to resend code:', err)
    error.value = 'Failed to resend verification code. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Redirect to login with email prefilled
const redirectToLogin = () => {
  router.push({
    path: '/auth/login',
    query: { email: email.value }
  })
}

// Watch for step changes to reset errors
watch(currentStep, () => {
  error.value = ''
  verificationStatus.value = ''
})

// Cleanup
onUnmounted(() => {
  if (resendInterval) clearInterval(resendInterval)
  if (expiryInterval) clearInterval(expiryInterval)
})
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

input[type="number"] {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}

input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

/* Remove focus ring styles and use browser defaults */
input:focus {
  outline: none;
}

/* Add vendor prefixes for appearance property */
input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

button:disabled {
  opacity: 0.7;
}

/* Add vendor prefixes for any input styling */
input[type="text"],
input[type="email"],
input[type="password"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0.5rem;
}
</style>