<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Change Phone Number</h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Step 1: Current Phone Verification -->
        <div v-if="currentStep === 'current-phone'" class="space-y-4">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <PhoneIcon class="w-6 h-6 text-blue-600" />
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">Verify Current Phone</h4>
            <p class="text-sm text-gray-600">
              We'll send a verification code to your current phone number:
              <span class="font-medium text-gray-900">{{ currentPhone }}</span>
            </p>
          </div>

          <button
            @click="sendCurrentPhoneOTP"
            :disabled="loading || currentPhoneOTPSent"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Sending...</span>
            <span v-else-if="currentPhoneOTPSent">Code Sent</span>
            <span v-else>Send Verification Code</span>
          </button>

          <!-- Current Phone OTP Input -->
          <div v-if="currentPhoneOTPSent" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Enter verification code sent to {{ currentPhone }}
              </label>
              <div class="flex gap-2 justify-center">
                <input
                  v-for="(digit, index) in 6"
                  :key="index"
                  v-model="currentPhoneOTP[index]"
                  @input="handleCurrentOTPInput(index)"
                  @keydown="handleCurrentOTPKeydown($event, index)"
                  type="text"
                  maxlength="1"
                  class="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                  :ref="el => currentOTPRefs[index] = el"
                />
              </div>
            </div>

            <button
              @click="verifyCurrentPhone"
              :disabled="loading || !isCurrentOTPComplete"
              class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Verifying...</span>
              <span v-else>Verify Current Phone</span>
            </button>

            <div class="text-center">
              <button
                @click="resendCurrentPhoneOTP"
                :disabled="resendTimer > 0"
                class="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <span v-if="resendTimer > 0">Resend in {{ resendTimer }}s</span>
                <span v-else>Resend Code</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: New Phone Input -->
        <div v-if="currentStep === 'new-phone'" class="space-y-4">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <PhoneIcon class="w-6 h-6 text-green-600" />
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">Enter New Phone Number</h4>
            <p class="text-sm text-gray-600">
              Enter the new phone number you want to use for your account
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
            <div class="flex">
              <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +63
              </span>
              <input
                v-model="newPhone"
                type="tel"
                placeholder="9XXXXXXXXX"
                maxlength="10"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @input="formatNewPhone"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Enter 10 digits starting with 9</p>
          </div>

          <button
            @click="sendNewPhoneOTP"
            :disabled="loading || !isValidNewPhone"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Sending...</span>
            <span v-else>Send Verification Code</span>
          </button>
        </div>

        <!-- Step 3: New Phone Verification -->
        <div v-if="currentStep === 'new-phone-verification'" class="space-y-4">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <PhoneIcon class="w-6 h-6 text-green-600" />
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">Verify New Phone</h4>
            <p class="text-sm text-gray-600">
              We've sent a verification code to:
              <span class="font-medium text-gray-900">+63{{ newPhone }}</span>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code
            </label>
            <div class="flex gap-2 justify-center">
              <input
                v-for="(digit, index) in 6"
                :key="index"
                v-model="newPhoneOTP[index]"
                @input="handleNewOTPInput(index)"
                @keydown="handleNewOTPKeydown($event, index)"
                type="text"
                maxlength="1"
                class="w-12 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                :ref="el => newOTPRefs[index] = el"
              />
            </div>
          </div>

          <button
            @click="verifyNewPhone"
            :disabled="loading || !isNewOTPComplete"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Verifying...</span>
            <span v-else>Verify New Phone</span>
          </button>

          <div class="text-center">
            <button
              @click="resendNewPhoneOTP"
              :disabled="resendTimer > 0"
              class="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="resendTimer > 0">Resend in {{ resendTimer }}s</span>
              <span v-else>Resend Code</span>
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ success }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          v-if="currentStep === 'new-phone' && currentPhoneVerified"
          @click="goBackToCurrentPhone"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { PhoneIcon, XIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/modules/authStore'
import { useProfileStore } from '@/stores/modules/profileStore'

const props = defineProps({
  currentPhone: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'phone-changed'])

const authStore = useAuthStore()
const profileStore = useProfileStore()

// State
const currentStep = ref('current-phone')
const loading = ref(false)
const error = ref('')
const success = ref('')

// Current phone verification
const currentPhoneOTPSent = ref(false)
const currentPhoneOTP = ref(Array(6).fill(''))
const currentPhoneVerified = ref(false)
const currentOTPRefs = ref([])

// New phone verification
const newPhone = ref('')
const newPhoneOTPSent = ref(false)
const newPhoneOTP = ref(Array(6).fill(''))
const newPhoneVerified = ref(false)
const newOTPRefs = ref([])

// Timer
const resendTimer = ref(0)
let timerInterval = null

// Computed
const isValidNewPhone = computed(() => {
  return newPhone.value.length === 10 && newPhone.value.startsWith('9')
})

const isCurrentOTPComplete = computed(() => {
  return currentPhoneOTP.value.every(digit => digit.length === 1)
})

const isNewOTPComplete = computed(() => {
  return newPhoneOTP.value.every(digit => digit.length === 1)
})

// Methods
const closeModal = () => {
  resetModal()
  emit('close')
}

const resetModal = () => {
  currentStep.value = 'current-phone'
  loading.value = false
  error.value = ''
  success.value = ''
  currentPhoneOTPSent.value = false
  currentPhoneOTP.value = Array(6).fill('')
  currentPhoneVerified.value = false
  newPhone.value = ''
  newPhoneOTPSent.value = false
  newPhoneOTP.value = Array(6).fill('')
  newPhoneVerified.value = false
  clearTimer()
}

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  resendTimer.value = 0
}

const startResendTimer = () => {
  resendTimer.value = 60
  clearTimer()
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearTimer()
    }
  }, 1000)
}

// Current phone verification
const sendCurrentPhoneOTP = async () => {
  try {
    loading.value = true
    error.value = ''
    
    await authStore.sendPhoneOTP(props.currentPhone, 'sms')
    currentPhoneOTPSent.value = true
    startResendTimer()
    
    // Focus on first OTP input
    nextTick(() => {
      if (currentOTPRefs.value[0]) {
        currentOTPRefs.value[0].focus()
      }
    })
  } catch (err) {
    error.value = err.message || 'Failed to send verification code'
  } finally {
    loading.value = false
  }
}

const handleCurrentOTPInput = (index) => {
  const digit = currentPhoneOTP.value[index]
  
  // Ensure only one digit
  if (digit.length > 1) {
    currentPhoneOTP.value[index] = digit.slice(0, 1)
  }
  
  // Move to next input if current is filled
  if (digit && index < 5) {
    nextTick(() => {
      if (currentOTPRefs.value[index + 1]) {
        currentOTPRefs.value[index + 1].focus()
      }
    })
  }
}

const handleCurrentOTPKeydown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace' && !currentPhoneOTP.value[index] && index > 0) {
    currentPhoneOTP.value[index - 1] = ''
    nextTick(() => {
      if (currentOTPRefs.value[index - 1]) {
        currentOTPRefs.value[index - 1].focus()
      }
    })
  }
}

const verifyCurrentPhone = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const otp = currentPhoneOTP.value.join('')
    const result = await authStore.verifyPhoneOTP(props.currentPhone, otp)
    
    if (result) {
      currentPhoneVerified.value = true
      currentStep.value = 'new-phone'
    } else {
      error.value = 'Invalid verification code. Please try again.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to verify current phone'
  } finally {
    loading.value = false
  }
}

const resendCurrentPhoneOTP = async () => {
  try {
    error.value = ''
    await sendCurrentPhoneOTP()
  } catch (err) {
    error.value = err.message || 'Failed to resend verification code'
  }
}

// New phone verification
const formatNewPhone = () => {
  // Remove all non-digits
  newPhone.value = newPhone.value.replace(/\D/g, '')
  
  // Limit to 10 digits
  if (newPhone.value.length > 10) {
    newPhone.value = newPhone.value.slice(0, 10)
  }
}

const sendNewPhoneOTP = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const fullPhoneNumber = `+63${newPhone.value}`
    await authStore.sendPhoneOTP(fullPhoneNumber, 'sms')
    newPhoneOTPSent.value = true
    currentStep.value = 'new-phone-verification'
    startResendTimer()
    
    // Focus on first OTP input
    nextTick(() => {
      if (newOTPRefs.value[0]) {
        newOTPRefs.value[0].focus()
      }
    })
  } catch (err) {
    error.value = err.message || 'Failed to send verification code'
  } finally {
    loading.value = false
  }
}

const handleNewOTPInput = (index) => {
  const digit = newPhoneOTP.value[index]
  
  // Ensure only one digit
  if (digit.length > 1) {
    newPhoneOTP.value[index] = digit.slice(0, 1)
  }
  
  // Move to next input if current is filled
  if (digit && index < 5) {
    nextTick(() => {
      if (newOTPRefs.value[index + 1]) {
        newOTPRefs.value[index + 1].focus()
      }
    })
  }
}

const handleNewOTPKeydown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace' && !newPhoneOTP.value[index] && index > 0) {
    newPhoneOTP.value[index - 1] = ''
    nextTick(() => {
      if (newOTPRefs.value[index - 1]) {
        newOTPRefs.value[index - 1].focus()
      }
    })
  }
}

const verifyNewPhone = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const otp = newPhoneOTP.value.join('')
    const fullPhoneNumber = `+63${newPhone.value}`
    const result = await authStore.verifyPhoneOTP(fullPhoneNumber, otp)
    
    if (result) {
      newPhoneVerified.value = true
      
      // Update user profile with new phone number
      const userId = authStore.user?.userId
      if (userId) {
        const updateSuccess = await profileStore.updateUserProfile(userId, {
          phone: fullPhoneNumber,
          phoneVerified: true,
          updatedAt: new Date()
        })
        
        if (updateSuccess) {
          // Update local auth store
          if (authStore.user) {
            authStore.user.phone = fullPhoneNumber
            authStore.user.phoneVerified = true
          }
          
          success.value = 'Phone number updated successfully!'
          
          // Close modal after a short delay
          setTimeout(() => {
            emit('phone-changed', fullPhoneNumber)
            closeModal()
          }, 1500)
        } else {
          throw new Error('Failed to update profile')
        }
      } else {
        throw new Error('User not found')
      }
    } else {
      error.value = 'Invalid verification code. Please try again.'
    }
  } catch (err) {
    error.value = err.message || 'Failed to verify new phone'
  } finally {
    loading.value = false
  }
}

const resendNewPhoneOTP = async () => {
  try {
    error.value = ''
    await sendNewPhoneOTP()
  } catch (err) {
    error.value = err.message || 'Failed to resend verification code'
  }
}

const goBackToCurrentPhone = () => {
  currentStep.value = 'current-phone'
  newPhone.value = ''
  newPhoneOTPSent.value = false
  newPhoneOTP.value = Array(6).fill('')
  newPhoneVerified.value = false
}

// Lifecycle
onMounted(() => {
  // Initialize OTP refs
  currentOTPRefs.value = Array(6).fill(null)
  newOTPRefs.value = Array(6).fill(null)
})

onUnmounted(() => {
  clearTimer()
})
</script>
