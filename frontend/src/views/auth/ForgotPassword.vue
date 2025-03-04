<!-- views/auth/ForgotPassword.vue.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-900 px-4 py-8">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
      <!-- Left Side - Progress Steps -->
      <div class="w-full md:w-2/5 p-8">
        <!-- Mobile Steps - Horizontal with equal spacing -->
        <div class="md:hidden w-full mb-8 relative">
          <div class="grid grid-cols-4 gap-4 px-4">
            <!-- Progress Line -->
            <div class="absolute top-[17px] left-[calc(8%+18px)] right-[calc(8%+18px)] h-[2px] bg-gray-200">
              <!-- Completed line segments -->
              <div 
                class="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"
              ></div>
            </div>
            <!-- Step 1 -->
            <div class="flex flex-col items-center">
              <div class="relative mb-2">
                <div v-if="currentStep > 1" 
                     class="w-9 h-9 rounded-full bg-green-900 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 1"
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <p class="text-xs text-gray-500 font-medium text-center">STEP 1</p>
              <p class="text-sm font-medium text-center" :class="currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'">
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
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <p class="text-xs text-gray-500 font-medium text-center">STEP 2</p>
              <p class="text-sm font-medium text-center" :class="currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'">
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
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <p class="text-xs text-gray-500 font-medium text-center">STEP 3</p>
              <p class="text-sm font-medium text-center" :class="currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'">
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
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <p class="text-xs text-gray-500 font-medium text-center">STEP 4</p>
              <p class="text-sm font-medium text-center" :class="currentStep >= 4 ? 'text-gray-900' : 'text-gray-500'">
                Done
              </p>
            </div>
          </div>
        </div>

        <!-- Desktop Steps - Vertical -->
        <div class="hidden md:block relative">
          <!-- Vertical line -->
          <div class="absolute left-[17px] top-[30px] bottom-4 w-[2px] bg-gray-200">
            <!-- Completed line segments -->
            <div 
              class="absolute top-0 w-full bg-blue-500 transition-all duration-300"
              :style="{ height: `${(currentStep - 1) * 33.33}%` }"
            ></div>
          </div>

          <!-- Steps -->
          <div class="space-y-8 relative">
            <!-- Step 1 -->
            <div class="flex items-start">
              <div class="relative">
                <div v-if="currentStep > 1" 
                     class="w-9 h-9 rounded-full bg-green-900 flex items-center justify-center">
                  <CheckIcon class="w-5 h-5 text-white" />
                </div>
                <div v-else-if="currentStep === 1"
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-gray-500 font-medium">STEP 1</p>
                <p class="font-medium" :class="currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'">
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
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-gray-500 font-medium">STEP 2</p>
                <p class="font-medium" :class="currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'">
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
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-gray-500 font-medium">STEP 3</p>
                <p class="font-medium" :class="currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'">
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
                     class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-white"></div>
                </div>
                <div v-else
                     class="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <div class="w-3 h-3 rounded-full bg-gray-200"></div>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-xs text-gray-500 font-medium">STEP 4</p>
                <p class="font-medium" :class="currentStep >= 4 ? 'text-gray-900' : 'text-gray-500'">
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
        <!-- Dog Image -->
        <div class="absolute -top-5 md:top-14 left-1/2 transform -translate-x-1/2 w-64 pointer-events-none z-20">
          <img 
            src="@/assets/media/images/auth/doggy.png"
            alt="Friendly dog"
            class="w-full h-full object-contain"
          />
        </div>

        <!-- Content with white background -->
        <div class="relative w-full max-w-md mt-20 md:mt-16">
          <!-- Forms - Each step gets a white background -->

          <!-- Step 1: Email Input -->
          <div v-if="currentStep === 1" class="space-y-6 bg-white p-8 rounded-xl shadow-lg">
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
              @click="$router.push('/auth/login')"
              class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <span class="text-sm">← Back to log in</span>
            </button>
          </div>

          <!-- Step 2: Verification Code -->
          <div v-if="currentStep === 2" class="space-y-6 bg-white p-8 rounded-xl shadow-sm">
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-gray-900">Password reset</h1>
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
                @paste="handlePaste($event)"
                :aria-label="`Verification code digit ${index + 1}`"
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
              <button 
                class="text-blue-600 hover:text-blue-700 ml-1" 
                @click="resendCode"
                :disabled="resendTimer > 0"
              >
                {{ resendTimer > 0 ? `Wait ${resendTimer}s` : 'Click to resend' }}
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
          <div v-if="currentStep === 3" class="space-y-6 bg-white p-8 rounded-xl shadow-sm">
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
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
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reset password
              </button>
            </form>

            <button 
              @click="currentStep = 2"
              class="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              <span class="text-sm">← Back to previous step</span>
            </button>
          </div>

          <!-- Step 4: Success -->
          <div v-if="currentStep === 4" class="space-y-6 bg-white p-8 rounded-xl shadow-sm">
            <div class="text-center">
              <div class="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckIcon class="w-6 h-6 text-green-600" />
              </div>
              <h1 class="text-2xl font-semibold text-gray-900">All done!</h1>
              <p class="mt-2 text-sm text-gray-600">Your password has been reset.</p>
            </div>

            <button 
              @click="$router.push('/auth/login')"
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
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { useAuthStore } from '@/stores/modules/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const currentStep = ref(1)
const email = ref('')
const verificationCode = ref(['', '', '', '', '', ''])
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const resendTimer = ref(0)
let resendInterval = null

// Set email from route query on mount
onMounted(() => {
  const emailFromQuery = route.query.email
  if (emailFromQuery) {
    email.value = emailFromQuery
  }
})

// Computed
const isCodeComplete = computed(() => {
  return verificationCode.value.every(digit => digit !== '')
})

// Methods
const handleEmailSubmit = async () => {
  if (!validateEmail(email.value)) {
    alert('Please enter a valid email address')
    return
  }

  try {
    await authStore.sendPasswordResetEmail(email.value)
    currentStep.value = 2
    startResendTimer()
  } catch (error) {
    alert('Failed to send reset email. Please try again.')
  }
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleCodeInput = (event, index) => {
  const input = event.target
  input.value = input.value.replace(/[^0-9]/g, '')
  
  if (input.value && index < 5) {
    const nextInput = input.nextElementSibling
    if (nextInput) nextInput.focus()
  }
}

const handleBackspace = (event, index) => {
  if (!event.target.value && index > 0) {
    const prevInput = event.target.previousElementSibling
    if (prevInput) prevInput.focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text')
  const numbers = pastedData.replace(/[^0-9]/g, '').split('')
  
  numbers.forEach((number, index) => {
    if (index < 6) verificationCode.value[index] = number
  })
}

const handleVerificationSubmit = async () => {
  try {
    const code = verificationCode.value.join('')
    await authStore.verifyPasswordResetCode(email.value, code)
    currentStep.value = 3
  } catch (error) {
    alert('Invalid verification code. Please try again.')
  }
}

const startResendTimer = () => {
  resendTimer.value = 120 // 2 minutes
  resendInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--
    } else {
      clearInterval(resendInterval)
    }
  }, 1000)
}

const resendCode = async () => {
  try {
    await authStore.sendPasswordResetEmail(email.value)
    startResendTimer()
  } catch (error) {
    alert('Failed to resend code. Please try again.')
  }
}

const handlePasswordSubmit = async () => {
  if (password.value.length < 8) {
    alert('Password must be at least 8 characters long')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!')
    return
  }

  try {
    const code = verificationCode.value.join('')
    await authStore.confirmPasswordReset(email.value, code, password.value)
    currentStep.value = 4
  } catch (error) {
    alert('Failed to reset password. Please try again.')
  }
}

// Cleanup
onUnmounted(() => {
  if (resendInterval) clearInterval(resendInterval)
})
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>