<!-- views/auth/VerifyEmail.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-white-900 px-2 md:px-4 py-8">
    <button 
      @click="goToHome" 
      class="absolute top-4 left-4 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
      aria-label="Go back to home page"
    >
      <ArrowLeftIcon class="w-4 h-4 text-blue-600" />
    </button>

    <!-- Dog image - hidden on mobile -->
    <div class="absolute top-1 left-1/2 transform -translate-x-1/2 w-64 pointer-events-none z-10 hidden md:block">
      <img 
        src="@/assets/media/images/auth/doggy.png"
        alt="Friendly dog"
        class="w-full h-full object-contain"
      />
    </div>

    <div class="relative min-h-screen flex items-center justify-center w-full">
      <div class="bg-white rounded-3xl shadow-2xl w-full md:w-auto md:max-w-4xl grid md:grid-cols-2 overflow-hidden">
        <!-- Left Side - OTP Form -->
        <div class="p-4 md:p-8 flex flex-col items-center justify-center">
          <h1 class="text-2xl font-bold mb-6 text-gray-800">Verify Your Email</h1>
          
          <div class="w-full md:w-80 space-y-6">
            <p class="text-center text-gray-600 text-sm">
              Please enter the verification code sent to 
              <span class="font-semibold">{{ email }}</span>
            </p>

            <!-- OTP Input Fields -->
            <div class="flex justify-between gap-2">
              <input
                v-for="(_, index) in 6"
                :key="index"
                type="text"
                maxlength="1"
                v-model="otpDigits[index]"
                @input="handleOtpInput($event, index)"
                @keydown="handleKeydown($event, index)"
                @paste="handlePaste"
                class="w-12 h-12 text-center text-xl font-semibold rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                :class="{ 'border-red-500': error }"
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
                {{ resendTimer > 0 ? formatTime(resendTimer) : 'Resend code' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side - Lottie Animation - hidden on mobile -->
        <div class="hidden md:flex bg-blue-900 p-6 lg:p-8 flex-col items-center justify-center text-center relative">
          <div class="w-64 h-64 mb-8">
            <DotLottieVue
              :src="currentAnimation"
              autoplay
              loop
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authStore'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const otpDigits = ref(Array(6).fill(''))
const verifying = ref(false)
const error = ref('')
const resendTimer = ref(0)
const currentAnimation = ref("https://lottie.host/c8b6eda0-6211-4124-8483-f57f7cf9d0bc/k5Va8KyWd5.lottie")
let timerInterval = null
const email = ref(route.query.email || '')

const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '')
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `Resend code in ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
    const nextInput = input.parentElement.children[index + 1]
    nextInput.focus()
  }

  error.value = '' // Clear error when user types
}

const handleKeydown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    const prevInput = event.target.parentElement.children[index - 1]
    prevInput.focus()
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
}

const startResendTimer = () => {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  resendTimer.value = 120 // 2 minutes
  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

const verifyOTP = async () => {
  try {
    verifying.value = true
    error.value = ''
    
    const otp = otpDigits.value.join('')
    const result = await authStore.completeRegistration(otp)
    
    if (result) {
      // Pass the email as a query parameter when redirecting to login
      router.push({
        path: '/auth/login',
        query: { email: email.value }
      })
    } else {
      error.value = 'Invalid verification code. Please try again.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to verify email. Please try again.'
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

    await authStore.resendVerificationEmail(email.value)
    startResendTimer()
  } catch (err) {
    error.value = 'Failed to resend verification code. Please try again.'
  }
}

const goToHome = () => {
  router.push('/home')
}

onMounted(() => {
  // Start with first input focused
  const firstInput = document.querySelector('input')
  if (firstInput) firstInput.focus()
  
  // Initialize resend timer
  startResendTimer()
})

onUnmounted(() => {
  // Clean up timer
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
/* Hide number input spinners */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

/* Prevent text selection in OTP inputs */
input {
  user-select: none;
}
</style>

