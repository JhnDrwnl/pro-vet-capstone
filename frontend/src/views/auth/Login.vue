<!-- views/auth/Login.vue -->
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

      <!-- Main form card -->
      <div class="w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <!-- Form container -->
        <div class="p-6 lg:p-8 flex flex-col items-center">
          <h1 class="text-2xl font-semibold text-gray-800 mb-6 text-center mt-4">Login</h1>
          
          <form @submit.prevent="handleSubmit" class="space-y-4 w-full max-w-md">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="email"
                type="text" 
                v-model="form.email"
                placeholder="Username or email"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none"
              />
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <input 
                  id="password"
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="form.password"
                  placeholder="Password"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                  <EyeOffIcon v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="form.remember"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:outline-none"
                />
                <span class="ml-2 text-gray-600">Remember me</span>
              </label>
              <router-link 
                :to="{ 
                  path: '/auth/forgot-password',
                  query: { email: form.email }
                }" 
                class="text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </router-link>
            </div>

            <button 
              type="submit"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              :disabled="emailLoginLoading"
            >
              {{ emailLoginLoading ? 'Logging in...' : 'Login' }}
            </button>

            <div class="relative my-4 flex items-center">
              <div class="flex-grow h-px bg-gray-300"></div>
              <span class="px-3 text-xs text-gray-500">OR</span>
              <div class="flex-grow h-px bg-gray-300"></div>
            </div>

            <button 
              @click.prevent="loginWithGoogle" 
              class="w-full py-2.5 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              :disabled="googleLoginLoading"
            >
              <img src="@/assets/media/images/common/ant-design--google-circle-filled.png" alt="Google Icon" class="w-7 h-7 mr-3" />
              {{ googleLoginLoading ? 'Signing in...' : 'Login with Google' }}
            </button>

            <p class="text-center text-sm text-gray-600 mt-4">
              Don't have an account? 
              <router-link to="/auth/register" class="text-blue-600 hover:text-blue-700">Sign up</router-link>
            </p>
          </form>
          
          <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm max-w-md">
            {{ error }}
          </div>
        </div>

        <!-- Right Side - Slider with Lottie Animations -->
        <div class="hidden md:flex bg-blue-900 p-6 lg:p-8 flex-col items-center justify-center text-center relative">
          <!-- Slider Navigation -->
          <div class="absolute top-4 right-4 flex space-x-2 z-10">
            <button 
              v-for="(_, index) in slides" 
              :key="index"
              @click="currentSlide = index"
              class="w-2 h-2 rounded-full transition-all duration-300"
              :class="currentSlide === index ? 'bg-white scale-125' : 'bg-blue-300 hover:bg-blue-200'"
              :aria-label="`Go to slide ${index + 1}`"
            />
          </div>

          <!-- Slides -->
          <TransitionGroup name="fade">
            <div 
              v-for="(slide, index) in slides" 
              :key="slide.id"
              v-show="currentSlide === index"
              class="absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <div class="animation-container">
                <DotLottieVue
                  ref="lottieRef"
                  :src="slide.animation"
                  autoplay
                  loop
                  :options="lottieOptions"
                />
              </div>
              <h2 class="text-lg font-semibold text-white mb-2 mt-4">
                {{ slide.title }}
              </h2>
              <p class="text-blue-100 max-w-xs text-sm">
                {{ slide.description }}
              </p>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { useAuthStore } from '@/stores/modules/authStore'
import emailService from '@/services/emailService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)
const emailLoginLoading = ref(false)
const googleLoginLoading = ref(false)
const error = ref('')
const lottieRef = ref(null)

const lottieOptions = {
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid meet',
    clearCanvas: true,
    progressiveLoad: false,
    hideOnTransparent: true,
  }
}

const form = reactive({
  email: '',
  password: '',
  remember: false
})

// Slider configuration
const currentSlide = ref(0)
const slides = [
  {
    id: 1,
    animation: "https://lottie.host/c6100761-fdc8-43da-bfd3-6438f52b5403/lrCJeykHIc.json",
    title: "Manage Your Pet's Health with Ease",
    description: "Keep track of your pet's health and book appointments effortlessly with our system."
  },
  {
    id: 2,
    animation: "https://lottie.host/c6100761-fdc8-43da-bfd3-6438f52b5403/lrCJeykHIc.json",
    title: "Connect with Expert Veterinarians",
    description: "Get professional veterinary care and advice through secure video consultations."
  },
  {
    id: 3,
    animation: "https://lottie.host/06867807-f728-46e0-9ab2-ff9905934206/pKQbPmgWnw.lottie",
    title: "Digital Pet Records & Reminders",
    description: "Access your pet's complete medical history anytime. Get timely reminders for appointments."
  }
]

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

let autoplayInterval

onMounted(() => {
  autoplayInterval = setInterval(nextSlide, 8000)
  
  const emailFromQuery = route.query.email
  if (emailFromQuery) {
    form.email = emailFromQuery
  }

  const rememberedEmail = authStore.checkRememberMe()
  if (rememberedEmail) {
    form.email = rememberedEmail
    form.remember = true
  }
})

onUnmounted(() => {
  clearInterval(autoplayInterval)
})

const handleSubmit = async () => {
  try {
    emailLoginLoading.value = true
    error.value = ''
    
    if (!form.email || !form.password) {
      error.value = 'Please enter both email and password'
      return
    }

    const result = await authStore.loginUser({
      email: form.email,
      password: form.password,
      rememberMe: form.remember
    })

    if (result.success) {
      const userRole = authStore.userRole
      redirectToDashboard(userRole)
    } else if (result.emailVerificationRequired) {
      // User is not verified, send OTP and redirect to verification page
      try {
        // Get user data from auth store
        const userData = authStore.getVerificationData() || { firstName: '' }
        
        // If no verification data exists, store it
        if (!userData.email) {
          authStore.setVerificationData({
            email: form.email,
            firstName: userData.firstName || '',
            password: form.password
          })
        }
        
        // Send OTP
        await emailService.sendOTP(form.email, userData.firstName || '')
        
        // Redirect to verify email page
        router.push({
          name: 'verify-email',
          query: { email: form.email }
        })
      } catch (otpError) {
        console.error('Error sending OTP:', otpError)
        error.value = 'Failed to send verification code. Please try again.'
      }
    } else if (result.invalidCredentials) {
      error.value = 'Invalid email or password'
    } else if (result.errorCode === 'auth/visibility-check-was-unavailable') {
      error.value = 'Firebase authentication service is temporarily unavailable. Please try again in a moment.'
    } else if (result.errorCode === 'auth/too-many-requests') {
      error.value = 'Too many unsuccessful login attempts. Please try again later or reset your password.'
    } else if (result.errorCode === 'auth/network-request-failed') {
      error.value = 'Network error. Please check your internet connection and try again.'
    } else {
      error.value = authStore.error || 'Failed to login. Please try again.'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Failed to login. Please try again.'
  } finally {
    emailLoginLoading.value = false
  }
}

const loginWithGoogle = async () => {
  try {
    googleLoginLoading.value = true
    error.value = ''
    
    // Call the signInWithGoogle method which now handles both new and existing users
    const success = await authStore.signInWithGoogle({
      isRegistration: false,
      onNewUser: () => {
        console.log('New user detected during Google login')
      }
    })
    
    // Check if user is authenticated after Google sign-in
    if (success && authStore.isAuthenticated) {
      redirectToDashboard(authStore.userRole)
    } else {
      error.value = authStore.error || 'Failed to login with Google. Please try again.'
    }
  } catch (err) {
    console.error('Google sign-in error:', err)
    error.value = err.message || 'Failed to login with Google. Please try again.'
  } finally {
    googleLoginLoading.value = false
  }
}

const redirectToDashboard = (userRole) => {
  console.log('Redirecting to dashboard. User role:', userRole)
  switch (userRole) {
    case 'admin':
      router.push({ name: 'AdminDashboard' })
      break
    case 'veterinary':
      router.push({ name: 'VetDashboard' })
      break
    case 'user':
    default:
      router.push({ name: 'UserDashboard' })
      break
  }
}

const goToHome = () => {
  router.push('/home')
}
</script>

<style scoped>
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.animation-container {
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.animation-container :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 320px !important;
  max-height: 320px !important;
}

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