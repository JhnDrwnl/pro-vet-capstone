<template>
  <div class="min-h-screen flex items-center justify-center bg-white-900 px-4 py-8">
    <button 
      @click="goBack" 
      class="absolute top-4 left-4 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
      aria-label="Go back to registration page"
    >
      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
    </button>

    <!-- Phone input form container with relative positioning -->
    <div class="w-full max-w-4xl relative mt-20 sm:mt-24 flex flex-col items-center">
      <!-- Dog image container with absolute positioning - responsive sizing -->
      <div class="absolute -top-24 sm:-top-32 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 pointer-events-none z-20">
        <img 
          src="@/assets/media/images/auth/doggy.png"
          alt="Friendly dog"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- Main form card -->
      <div class="w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <!-- Form container -->
        <div class="p-6 lg:p-8 flex flex-col items-center">
          <h1 class="text-2xl font-semibold text-gray-800 mb-6 text-center mt-4">Complete Your Profile</h1>
          
          <form @submit.prevent="submitPhoneNumber" class="space-y-4 w-full max-w-md">
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 text-sm font-medium">+63</span>
                </div>
                <input
                  id="phone"
                  v-model="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="912 345 6789"
                  class="w-full pl-12 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  :disabled="loading"
                  maxlength="10"
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number (e.g., 9123456789)"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500">
                We'll send a verification code to this number
              </p>
            </div>

            <button 
              type="submit"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              :disabled="loading || !phone || phone.length < 10"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending verification code...
              </span>
              <span v-else>Send Verification Code</span>
            </button>

            <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {{ error }}
            </div>
          </form>
        </div>

        <!-- Right Side - Promotional Content -->
        <div class="hidden md:flex bg-blue-900 p-6 lg:p-8 flex-col items-center justify-center text-center relative">
          <!-- Decorative Elements -->
          <div class="absolute top-4 right-4 flex space-x-2 z-10">
            <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
            <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
            <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
          </div>

          <!-- Main Content -->
          <div class="relative z-20 flex flex-col items-center justify-center text-center">
            <!-- Illustration Placeholder -->
            <div class="mb-6 relative">
              <div class="w-24 h-24 bg-blue-700 rounded-full flex items-center justify-center mb-4">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
            </div>

            <!-- Main Heading -->
            <h2 class="text-xl font-semibold text-white mb-3">
              Complete Your Registration
            </h2>

            <!-- Sub-text -->
            <p class="text-blue-100 text-sm leading-relaxed max-w-xs">
              Just one more step to access all the pet care services. Your phone number helps us keep you updated about your pet's health and appointments.
            </p>

            <!-- Additional Features -->
            <div class="mt-6 grid grid-cols-1 gap-3 text-left">
              <div class="flex items-center text-blue-100 text-sm">
                <svg class="w-4 h-4 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Secure verification process</span>
              </div>
              <div class="flex items-center text-blue-100 text-sm">
                <svg class="w-4 h-4 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Quick SMS verification</span>
              </div>
              <div class="flex items-center text-blue-100 text-sm">
                <svg class="w-4 h-4 mr-2 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Access to all features</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/authStore'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const loading = ref(false)
const error = ref('')

// Format phone number for display (add spaces for readability)
const formattedPhone = computed(() => {
  if (!phone.value) return ''
  const cleaned = phone.value.replace(/\D/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
})

const submitPhoneNumber = async () => {
  if (!phone.value || phone.value.length < 10) {
    error.value = 'Please enter a valid 10-digit phone number'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // Format the full phone number with +63 prefix
    const fullPhoneNumber = `+63${phone.value}`
    console.log('📱 Sending SMS OTP for Google user phone:', fullPhoneNumber)
    
    // Send SMS OTP
    const result = await authStore.sendGooglePhoneOTP(fullPhoneNumber)
    
    if (result.success) {
      console.log('✅ SMS OTP sent successfully')
      
      // Redirect to phone verification page
      router.push({
        name: 'verify-phone',
        query: { 
          phone: fullPhoneNumber,
          registrationMethod: 'google'
        }
      })
    } else {
      error.value = result.message || 'Failed to send verification code'
    }
  } catch (err) {
    console.error('❌ Error sending SMS OTP:', err)
    error.value = err.message || 'Failed to send verification code. Please try again.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/auth/register')
}
</script>

<style scoped>
@media (max-width: 640px) {
  .bg-white {
    border-radius: 1.5rem !important;
    margin: 0 0.5rem;
  }
  
  .min-h-screen {
    padding-top: 1rem;
  }

  input {
    height: 42px;
  }
}
</style>
