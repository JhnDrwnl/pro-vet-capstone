<!-- views/auth/Login.vue -->
<template>
    <div class="min-h-screen relative">
      <!-- Arrow button -->
      <button 
        @click="goToHome" 
        class="absolute top-4 left-4 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-10"
        aria-label="Go back to home page"
      >
        <ArrowLeftIcon class="w-4 h-4 text-blue-600" />
      </button>
  
      <!-- Background layers -->
      <div class="absolute inset-x-0 top-0 h-1/2 bg-blue-600"></div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-blue-100"></div>
      
      <!-- Content -->
      <div class="relative min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl grid md:grid-cols-2 overflow-hidden">
          <!-- Login Form Panel -->
          <div class="p-6 lg:p-8 flex flex-col items-center">
            <h1 class="text-xl font-semibold text-gray-800 mb-6">Login</h1>
            <form @submit.prevent="handleSubmit" class="space-y-4 w-80">
              <div>
                <input 
                  type="text" 
                  v-model="form.email"
                  placeholder="Username or email"
                  class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div class="relative">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="form.password"
                  placeholder="Password"
                  class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
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
  
              <div class="flex items-center justify-between text-xs">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="form.remember"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" class="text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
  
              <button 
                type="submit"
                class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                :disabled="loading"
              >
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>
  
              <div class="relative my-4 flex items-center">
                <div class="flex-grow h-px bg-gray-300"></div>
                <span class="px-3 text-xs text-gray-500">OR</span>
                <div class="flex-grow h-px bg-gray-300"></div>
              </div>
  
              <button 
                @click.prevent="loginWithGoogle" 
                class="w-full py-2 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                :disabled="loading"
              >
                <img src="/ant-design--google-circle-filled.png" alt="Google Icon" class="w-7 h-7 mr-3" />
                {{ loading ? 'Signing in...' : 'Login with Google' }}
              </button>
  
              <p class="text-center text-xs text-gray-600">
                Don't have an account? 
                <router-link to="/auth/register" class="text-blue-600 hover:text-blue-700">Sign up</router-link>
              </p>
            </form>
            <div v-if="error" class="mt-4 text-red-600 text-sm">
              {{ error }}
            </div>
          </div>
  
          <!-- Pet Health Management System Panel -->
          <div class="bg-gray-50 p-6 lg:p-8 flex flex-col items-center justify-center text-center relative">
            <div class="mb-4">
              <img 
                src="/2-removebg-preview (1).png" 
                alt="Pet Health Management Illustration"
                class="w-48 h-48 object-contain"
              />
            </div>
            <h2 class="text-lg font-semibold text-gray-800 mb-2">
              Manage Your Pet's Health with Ease
            </h2>
            <p class="text-gray-600 max-w-xs text-sm">
              Keep track of your pet's health and book appointments effortlessly with our system. Stay updated on check-ups, vaccinations, and treatment plans, ensuring your furry friends receive the care they deserve.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, reactive, watch } from 'vue'
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const authStore = useAuthStore();
const { user, loading, error } = storeToRefs(authStore);

const showPassword = ref(false)
const form = reactive({
  email: '',
  password: '',
  remember: false
})

// Add a watcher for the user state
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    console.log('User state updated:', newUser);
    console.log('User role:', newUser.role);
    redirectToDashboard();
  }
}, { deep: true });

const handleSubmit = async () => {
  try {
    await authStore.loginUser({
      email: form.email,
      password: form.password
    });
    console.log('Login successful, user:', authStore.user);
    if (authStore.isAuthenticated) {
      redirectToDashboard();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

const loginWithGoogle = async () => {
  try {
    await authStore.signInWithGoogle();
    console.log('Google sign-in successful, user:', authStore.user);
    if (authStore.isAuthenticated) {
      redirectToDashboard();
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
  }
}

const redirectToDashboard = () => {
  const userRole = authStore.userRole;
  console.log('Redirecting to dashboard. User role:', userRole);
  switch (userRole) {
    case 'admin':
      console.log('Redirecting to AdminDashboard');
      router.push({ name: 'AdminDashboard' });
      break;
    case 'veterinary':
      console.log('Redirecting to VetDashboard');
      router.push({ name: 'VetDashboard' });
      break;
    case 'user':
    default:
      console.log('Redirecting to UserDashboard');
      router.push({ name: 'UserDashboard' });
      break;
  }
}

const goToHome = () => {
  router.push('/');
}
</script>

<style scoped>
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}
</style>