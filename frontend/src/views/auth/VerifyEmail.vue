<!-- views/auth/VerifyEmail.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-white-900 px-4 py-8">
    <button 
      @click="goToHome" 
      class="absolute top-4 left-4 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
      aria-label="Go back to home page"
    >
      <ArrowLeftIcon class="w-4 h-4 text-blue-600" />
    </button>

    <!-- Login form container with relative positioning -->
    <div class="w-full max-w-4xl relative mt-20 sm:mt-24 flex flex-col items-center">
      <!-- Dog image container with absolute positioning - responsive sizing -->
      <div class="absolute -top-24 sm:-top-32 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 pointer-events-none z-20">
        <img 
          src="@/assets/media/images/auth/doggy.png"
          alt="Friendly dog"
          class="w-full h-full object-contain"
        />
      </div>

      <div class="w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <!-- Left Side - OTP Form -->
        <div class="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <h1 class="text-2xl font-bold mb-6 text-gray-800 mt-4">Verify Your Email</h1>
          
          <div class="w-full max-w-md space-y-6">
            <p class="text-center text-gray-600 text-sm">
              Please enter the verification code sent to 
              <span class="font-semibold">{{ email }}</span>
            </p>

            <!-- OTP Input Fields -->
            <div class="flex justify-center gap-2">
              <input
                v-for="(_, index) in 6"
                :key="index"
                type="text"
                maxlength="1"
                v-model="otpDigits[index]"
                @input="handleOtpInput($event, index)"
                @keydown="handleKeydown($event, index)"
                @paste="handlePaste"
                class="w-10 h-12 sm:w-12 text-center text-xl font-semibold rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                :class="{ 'border-red-500': error }"
                ref="otpInputs"
              />
            </div>

            <div v-if="error" class="text-red-600 text-sm text-center">
              {{ error }}
            </div>

            <button 
              @click="verifyOTP"
              :disabled="verifying || !isOtpComplete"
              class="w-full py-3 bg-blue-600 text-white rounded-lg transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {{ verifying ? 'Verifying...' : 'Verify Email' }}
            </button>

            <div class="text-center">
              <p class="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <button 
                @click="resendCode"
                :disabled="resendTimer > 0"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none disabled:opacity-50"
              >
                {{ resendTimer > 0 ? `Resend code in ${formatTime(resendTimer)}` : 'Resend code' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side - Lottie Animation -->
        <div class="hidden md:flex bg-blue-900 p-6 lg:p-8 flex-col items-center justify-center text-center relative">
          <div class="w-64 h-64 mb-8">
            <DotLottieVue
              :src="currentAnimation"
              autoplay
              loop
              :options="lottieOptions"
              class="w-full h-full"
            />
          </div>
          <h2 class="text-lg font-semibold text-white mb-2">
            Secure Verification Process
          </h2>
          <p class="text-blue-100 max-w-xs text-sm">
            We're committed to keeping your account safe. Please verify your email to continue.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authStore'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const otpDigits = ref(Array(6).fill(''))
const otpInputs = ref([])
const verifying = ref(false)
const error = ref('')
const resendTimer = ref(0)
const otpExpiryTime = ref(300) // 5 minutes in seconds (changed from 120)
const currentAnimation = ref("https://lottie.host/c8b6eda0-6211-4124-8483-f57f7cf9d0bc/k5Va8KyWd5.lottie")
let timerInterval = null
let expiryInterval = null
const email = ref(route.query.email || '')

const lottieOptions = {
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid meet',
    clearCanvas: true,
    progressiveLoad: false,
    hideOnTransparent: true,
  }
}

const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '')
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleOtpInput = (event, index) => {
  const input = event.target
  const value = input.value

  // Ensure only numbers
  if (!/^\d*$/.test(value)) {
    otpDigits.value[index] = ''
    return
  }

  // Move to next input
  if (value && index < 5) {
    nextTick(() => {
      otpInputs.value[index + 1].focus()
    })
  } else if (value && index === 5) {
    // Auto-verify when all digits are entered
    if (isOtpComplete.value) {
      verifyOTP()
    }
  }

  error.value = '' // Clear error when user types
}

const handleKeydown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    nextTick(() => {
      otpInputs.value[index - 1].focus()
    })
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text')
  const numbers = pastedData.replace(/\D/g, '').split('').slice(0, 6)
  
  numbers.forEach((num, index) => {
    if (index < 6) {
      otpDigits.value[index] = num
    }
  })
  
  // Focus on the next empty input or the last one if all filled
  nextTick(() => {
    const emptyIndex = otpDigits.value.findIndex(digit => digit === '')
    if (emptyIndex !== -1) {
      otpInputs.value[emptyIndex].focus()
    } else if (otpInputs.value[5]) {
      otpInputs.value[5].focus()
    }
  })
  
  // Clear error when user pastes
  error.value = ''
}

const startResendTimer = () => {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  resendTimer.value = 120 // 2 minutes cooldown for resend button
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

const startExpiryTimer = () => {
  // Clear any existing timer
  if (expiryInterval) {
    clearInterval(expiryInterval)
  }

  otpExpiryTime.value = 300 // 5 minutes (changed from 120)
  expiryInterval = setInterval(() => {
    if (otpExpiryTime.value > 0) {
      otpExpiryTime.value--
    } else {
      clearInterval(expiryInterval)
      // Show expired message if user hasn't verified yet
      if (!verifying.value) {
        error.value = 'Verification code has expired. Please request a new one.'
      }
    }
  }, 1000)
}

const verifyOTP = async () => {
  try {
    verifying.value = true
    error.value = ''
    
    const otp = otpDigits.value.join('')
    
    // Check if code has expired on client side first
    if (otpExpiryTime.value <= 0) {
      error.value = 'Verification code has expired. Please request a new one.'
      verifying.value = false
      return
    }
    
    const result = await authStore.completeRegistration(otp)
    
    if (result) {
      // Pass the email as a query parameter when redirecting to login
      router.push({
        path: '/auth/login',
        query: { email: email.value, verified: 'true' }
      })
    } else {
      error.value = 'Invalid verification code. Please try again.'
    }
  } catch (err) {
    console.error('Verification error:', err)
    
    // Use the error status from the emailService interceptor
    if (err.status === 'expired') {
      error.value = 'Verification code has expired. Please request a new one.'
      // Reset expiry timer
      otpExpiryTime.value = 0
    } else if (err.status === 'invalid') {
      error.value = 'The verification code you entered is incorrect. Please try again.'
    } else if (err.message.includes('expired')) {
      error.value = 'Verification code has expired. Please request a new one.'
      // Reset expiry timer
      otpExpiryTime.value = 0
    } else {
      error.value = err.message || 'Failed to verify email. Please try again.'
    }
  } finally {
    verifying.value = false
  }
}

const resendCode = async () => {
  try {
    if (!email.value) {
      error.value = 'Email address not found. Please try registering again.'
      return
    }

    const result = await authStore.resendVerificationEmail(email.value)
    if (result) {
      // Reset OTP inputs
      otpDigits.value = Array(6).fill('')
      // Focus on first input
      nextTick(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus()
        }
      })
      
      // Reset timers
      startResendTimer()
      startExpiryTimer()
      
      // Clear any previous errors
      error.value = ''
    }
  } catch (err) {
    console.error('Resend error:', err)
    error.value = 'Failed to resend verification code. Please try again.'
  }
}

const goToHome = () => {
  router.push('/home')
}

onMounted(() => {
  // Start with first input focused
  nextTick(() => {
    if (otpInputs.value[0]) {
      otpInputs.value[0].focus()
    }
  })
  
  // Initialize timers
  startResendTimer()
  startExpiryTimer()
})

onUnmounted(() => {
  // Clean up timers
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (expiryInterval) {
    clearInterval(expiryInterval)
  }
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