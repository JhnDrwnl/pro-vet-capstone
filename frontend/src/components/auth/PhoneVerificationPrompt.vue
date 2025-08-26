<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PhoneIcon class="w-8 h-8 text-blue-600" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          Phone Verification Required
        </h2>
        <p class="text-gray-600 text-sm">
          Please verify your phone number to complete your account setup
        </p>
      </div>

      <!-- Phone Input -->
      <div v-if="!otpSent" class="space-y-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              +63
            </span>
                         <input
               id="phone"
               v-model="phoneNumber"
               type="tel"
               placeholder="912 345 6789"
               class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               :disabled="loading"
               @input="formatPhoneNumber"
               maxlength="12"
             />
          </div>
                     <p class="text-xs text-gray-500 mt-1">
             Enter your 10-digit mobile number (e.g., 912 345 6789) - +63 will be added automatically
           </p>
        </div>

        <!-- Verification Method Selection -->
        <div v-if="phoneNumber && !methodChosen" class="space-y-3">
          <p class="text-sm text-gray-600">Choose verification method:</p>
          
          <button
            @click="selectMethod('sms')"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MessageSquareIcon class="w-4 h-4 mr-2" />
            Send via SMS
          </button>
          

        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>
      </div>

      <!-- OTP Input -->
      <div v-else class="space-y-4">
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-4">
            We've sent a verification code to your SMS
          </p>
          
          <!-- OTP Input Fields -->
          <div class="flex justify-center space-x-2 mb-4">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              :ref="el => otpRefs[index] = el"
              v-model="otpDigits[index]"
              type="text"
              maxlength="1"
              class="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
              @input="handleOtpInput(index)"
              @keydown="handleOtpKeydown($event, index)"
            />
          </div>

          <!-- Timer and Resend -->
          <div class="text-sm text-gray-600 mb-4">
            <span v-if="resendTime > 0">
              Resend code in {{ Math.floor(resendTime / 60) }}:{{ (resendTime % 60).toString().padStart(2, '0') }}
            </span>
            <button
              v-else
              @click="resendCode"
              :disabled="loading"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Resend code
            </button>
          </div>

          <!-- Change Method -->
          <button
            @click="changeMethod"
            :disabled="loading"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Use different method
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center mt-6">
        <button
          v-if="!otpSent"
          @click="sendOTP"
          :disabled="!phone || loading || !methodChosen"
          class="w-full max-w-xs bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Sending...</span>
          <span v-else>Send Code</span>
        </button>
        
        <button
          v-else
          @click="verifyOTP"
          :disabled="!isOtpComplete || loading"
          class="w-full max-w-xs bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Verifying...</span>
          <span v-else>Verify Code</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { PhoneIcon, MessageSquareIcon, MessageCircleIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/modules/authStore'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'verified'])

const authStore = useAuthStore()

// Reactive data
const phoneNumber = ref('')
const phone = computed(() => `+63${phoneNumber.value}`)
const otpDigits = ref(Array(6).fill(''))
const otpRefs = ref([])
const selectedMethod = ref('')
const methodChosen = ref(false)
const otpSent = ref(false)
const loading = ref(false)
const error = ref('')
const resendTime = ref(0)
const resendTimer = ref(null)
const expiryTimer = ref(null)

// Computed
const isOtpComplete = computed(() => {
  return otpDigits.value.every(digit => digit !== '')
})

// Phone number formatting
const formatPhoneNumber = () => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.value.replace(/\D/g, '')
  
  // Limit to 10 digits
  cleaned = cleaned.substring(0, 10)
  
  // Format with spaces for better readability
  if (cleaned.length >= 3) {
    cleaned = cleaned.substring(0, 3) + ' ' + cleaned.substring(3)
  }
  if (cleaned.length >= 7) {
    cleaned = cleaned.substring(0, 7) + ' ' + cleaned.substring(7)
  }
  
  phoneNumber.value = cleaned
}

// Methods
const selectMethod = async (method) => {
  try {
    selectedMethod.value = method
    methodChosen.value = true
    error.value = ''
    
    // Send OTP using the appropriate method based on user type
    if (authStore.registrationMethod === 'google') {
      await authStore.sendGooglePhoneOTP(phone.value, method)
    } else {
      await authStore.sendPhoneOTP(phone.value, method)
    }
    
    // Show OTP input
    otpSent.value = true
    startResendTimer()
    
    // Focus on first OTP input
    nextTick(() => {
      if (otpRefs.value[0]) {
        otpRefs.value[0].focus()
      }
    })
    
  } catch (err) {
    error.value = `Failed to send ${method.toUpperCase()} verification code. Please try again.`
    methodChosen.value = false
  }
}

const sendOTP = async () => {
  if (!phoneNumber.value || !selectedMethod.value) return
  
  try {
    loading.value = true
    error.value = ''
    
    // Send OTP using the appropriate method based on user type
    if (authStore.registrationMethod === 'google') {
      await authStore.sendGooglePhoneOTP(phone.value, selectedMethod.value)
    } else {
      await authStore.sendPhoneOTP(phone.value, selectedMethod.value)
    }
    
    otpSent.value = true
    startResendTimer()
    
    // Focus on first OTP input
    nextTick(() => {
      if (otpRefs.value[0]) {
        otpRefs.value[0].focus()
      }
    })
    
  } catch (err) {
    error.value = 'Failed to send verification code. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleOtpInput = (index) => {
  const digit = otpDigits.value[index]
  
  // Ensure only one digit
  if (digit.length > 1) {
    otpDigits.value[index] = digit.slice(0, 1)
  }
  
  // Move to next input if current is filled
  if (digit && index < 5) {
    nextTick(() => {
      if (otpRefs.value[index + 1]) {
        otpRefs.value[index + 1].focus()
      }
    })
  }
}

const handleOtpKeydown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    nextTick(() => {
      if (otpRefs.value[index - 1]) {
        otpRefs.value[index - 1].focus()
      }
    })
  }
}

const verifyOTP = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const otp = otpDigits.value.join('')
    
    // Verify the OTP using the appropriate method based on user type
    let result
    if (authStore.registrationMethod === 'google') {
      result = await authStore.completeGooglePhoneVerification(otp, phone.value)
    } else {
      result = await authStore.completePhoneVerification(otp)
    }
    
    if (result) {
      // Update user document with phone number and verification status
      await authStore.updateUserPhone(phone.value)
      
      emit('verified', { phone: phone.value, method: selectedMethod.value })
      emit('close')
    }
    
  } catch (err) {
    error.value = 'Invalid verification code. Please try again.'
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  try {
    error.value = ''
    
    // Send OTP using the appropriate method based on user type
    if (authStore.registrationMethod === 'google') {
      await authStore.sendGooglePhoneOTP(phone.value, selectedMethod.value)
    } else {
      await authStore.sendPhoneOTP(phone.value, selectedMethod.value)
    }
    
    startResendTimer()
    
    // Reset OTP inputs
    otpDigits.value = Array(6).fill('')
    
    // Focus on first input
    nextTick(() => {
      if (otpRefs.value[0]) {
        otpRefs.value[0].focus()
      }
    })
    
  } catch (err) {
    error.value = 'Failed to resend verification code. Please try again.'
  }
}

const changeMethod = () => {
  otpSent.value = false
  methodChosen.value = false
  selectedMethod.value = ''
  phoneNumber.value = ''
  otpDigits.value = Array(6).fill('')
  error.value = ''
  clearTimers()
}



const startResendTimer = () => {
  resendTime.value = 60 // 1 minute
  resendTimer.value = setInterval(() => {
    resendTime.value--
    if (resendTime.value <= 0) {
      clearInterval(resendTimer.value)
    }
  }, 1000)
}

const clearTimers = () => {
  if (resendTimer.value) {
    clearInterval(resendTimer.value)
    resendTimer.value = null
  }
  if (expiryTimer.value) {
    clearInterval(expiryTimer.value)
    expiryTimer.value = null
  }
}

// Lifecycle
onMounted(() => {
  // Focus on phone input when component mounts
  nextTick(() => {
    const phoneInput = document.getElementById('phone')
    if (phoneInput) {
      phoneInput.focus()
    }
  })
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>
