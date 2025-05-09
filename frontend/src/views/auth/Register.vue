<!-- views/auth/Register.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-white-900 px-4 py-8 overflow-hidden">
    <button 
      @click="goToHome" 
      class="absolute top-4 left-4 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
      aria-label="Go back to home page"
    >
      <ArrowLeftIcon class="w-4 h-4 text-blue-600" />
    </button>

    <!-- Login form container with relative positioning -->
    <div class="w-full max-w-4xl relative mt-20 sm:mt-24 flex flex-col items-center">
      <!-- Dog image container with absolute positioning -->
      <div class="absolute -top-24 sm:-top-32 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 pointer-events-none z-20">
        <img 
          src="@/assets/media/images/auth/doggy.png"
          alt="Friendly dog"
          class="w-full h-full object-contain"
        />
      </div>

      <div class="w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <!-- Left Side - Registration Form -->
        <div class="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <h1 class="text-xl font-semibold text-gray-800 mb-4 sm:mb-6 mt-4">Register</h1>

          <form @submit.prevent="handleRegister" class="space-y-4 w-full max-w-md">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  id="firstName"
                  type="text" 
                  v-model="form.firstName"
                  placeholder="First Name"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input 
                  id="lastName"
                  type="text" 
                  v-model="form.lastName"
                  placeholder="Last Name"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                id="email"
                type="email" 
                v-model="form.email"
                placeholder="Email"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                required
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
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                  required
                />
                <button 
                  type="button"
                  @click="togglePassword('password')"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                  <EyeOffIcon v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div class="relative">
                <input 
                  id="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="form.confirmPassword"
                  placeholder="Confirm Password"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
                  required
                />
                <button 
                  type="button"
                  @click="togglePassword('confirm')"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="!showConfirmPassword" class="w-4 h-4" />
                  <EyeOffIcon v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                v-model="form.acceptTerms"
                class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none"
                required
              />
              <label for="terms" class="text-sm text-gray-600">
                By creating an account you agree to the 
                <button 
                  type="button"
                  @click="showPolicyModal = true"
                  class="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Terms and Conditions
                </button>
                and our
                <router-link to="/privacy" class="text-blue-600 hover:text-blue-700 hover:underline">
                  Privacy Policy
                </router-link>
              </label>
            </div>

            <button 
              type="submit"
              :disabled="emailLoading || !form.acceptTerms"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50"
            >
              {{ emailLoading ? 'Sending verification code...' : 'Register' }}
            </button>

            <div v-if="error" class="text-red-500 text-sm text-center">
              {{ error }}
            </div>

            <div class="relative my-4 flex items-center">
              <div class="flex-grow h-px bg-gray-300"></div>
              <span class="px-3 text-xs text-gray-500">OR</span>
              <div class="flex-grow h-px bg-gray-300"></div>
            </div>

            <button 
              @click.prevent="registerWithGoogle" 
              :disabled="googleLoading"
              class="w-full py-2.5 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50"
            >
              <img src="@/assets/media/images/common/ant-design--google-circle-filled.png" alt="Google Icon" class="w-7 h-7 mr-3" />
              Continue with Google
            </button>

            <p class="text-center text-sm text-gray-600 mt-4">
              Already have an account? 
              <router-link to="/auth/login" class="text-blue-600 hover:text-blue-700">Login</router-link>
            </p>
          </form>
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

    <!-- Policy Modal -->
    <div v-if="showPolicyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900">Terms and Conditions</h2>
          <button 
            @click="showPolicyModal = false"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="p-6">
          <Policies />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { EyeIcon, EyeOffIcon, ArrowLeftIcon, XIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import Policies from '@/components/common/Policies.vue';
import { useAuthStore } from '@/stores/modules/authStore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';

const router = useRouter();
const authStore = useAuthStore();

// State
const emailLoading = ref(false);
const googleLoading = ref(false);
const error = ref(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPolicyModal = ref(false);
const currentSlide = ref(0);

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
});

// Lottie options
const lottieOptions = {
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid meet',
    clearCanvas: true,
    progressiveLoad: false,
    hideOnTransparent: true,
  }
};

// Slider content
const slides = [
  {
    id: 1,
    animation: "https://lottie.host/c8b6eda0-6211-4124-8483-f57f7cf9d0bc/k5Va8KyWd5.lottie",
    title: "Join Our Pet Care Community",
    description: "Create an account to access personalized pet care services and connect with veterinary professionals."
  },
  {
    id: 2,
    animation: "https://lottie.host/c8b6eda0-6211-4124-8483-f57f7cf9d0bc/k5Va8KyWd5.lottie",
    title: "Track Your Pet's Health Journey",
    description: "Keep all your pet's health records in one place and receive timely reminders for important care milestones."
  },
  {
    id: 3,
    animation: "https://lottie.host/c8b6eda0-6211-4124-8483-f57f7cf9d0bc/k5Va8KyWd5.lottie",
    title: "Expert Care at Your Fingertips",
    description: "Get instant access to qualified veterinarians and schedule appointments with just a few clicks."
  }
];

// Methods
const togglePassword = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else if (field === 'confirm') {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};

const handleRegister = async () => {
  if (!form.acceptTerms) {
    error.value = "Please accept the Terms and Conditions";
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }
  
  try {
    emailLoading.value = true;
    error.value = null;
    
    await authStore.initiateRegistration({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName
    });
    
    router.push({ 
      name: 'verify-email',
      query: { email: form.email }
    });

  } catch (err) {
    console.error('Registration failed:', err);
    error.value = err.message || "Failed to send verification code. Please try again.";
  } finally {
    emailLoading.value = false;
  }
};

const registerWithGoogle = async () => {
  try {
    googleLoading.value = true;
    error.value = null;
    
    // Call the signInWithGoogle method with isRegistration flag
    await authStore.signInWithGoogle({
      isRegistration: true,
      onNewUser: () => {
        console.log('New user registered with Google');
        // Set flag to show notification modal for new Google users
        localStorage.setItem('showNotificationModal', 'true');
        
        // If you have access to the user document, update it to track that we've prompted for notifications
        if (authStore.currentUser && authStore.currentUser.userId) {
          const userId = authStore.currentUser.userId;
          const userRef = doc(db, "users", userId);
          
          setDoc(userRef, {
            notificationsPrompted: true,
            updatedAt: new Date()
          }, { merge: true }).catch(err => {
            console.error('Error updating user document:', err);
          });
        }
      }
    });
    
    router.push('/user/dashboard');
  } catch (err) {
    console.error('Google sign-in failed:', err);
    error.value = "Google sign-in failed. Please try again.";
  } finally {
    googleLoading.value = false;
  }
};

const goToHome = () => {
  router.push('/');
};

// Lifecycle hooks
let autoplayInterval;

onMounted(() => {
  autoplayInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 8000);
});

onUnmounted(() => {
  if (autoplayInterval) clearInterval(autoplayInterval);
});
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