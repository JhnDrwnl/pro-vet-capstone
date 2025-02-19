<!-- src/views/auth/Register.vue -->
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
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl grid md:grid-cols-2 overflow-hidden">
          <!-- Image Panel -->
          <div class="bg-gray-50 p-6 lg:p-8 flex flex-col items-center justify-center text-center relative">
            <div class="mb-4">
              <img 
                src="@/assets/media/images/auth/1-removebg-preview (1).png" 
                alt="Pet Health Management Illustration"
                class="w-64 h-64 object-contain"
              />
            </div>
            <h2 class="text-lg font-semibold text-gray-800 mb-2">
              Welcome to Our Pet Management System
            </h2>
            <p class="text-gray-600 max-w-xs text-sm">
              Register now to keep track of your pet's health, book appointments, and get reminders for check-ups and vaccinations.
            </p>
          </div>
  
          <!-- Register Form Panel -->
          <div class="p-6 lg:p-8 flex flex-col items-center">
            <h1 class="text-xl font-semibold text-gray-800 mb-6">Register</h1>
            <form v-if="!registrationComplete" @submit.prevent="handleRegister" class="space-y-4 w-80">
              <div class="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  v-model="form.firstName"
                  placeholder="First Name"
                  class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
                <input 
                  type="text" 
                  v-model="form.lastName"
                  placeholder="Last Name"
                  class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  v-model="form.email"
                  placeholder="Email"
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
                  @click="togglePassword('password')"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                  <EyeOffIcon v-else class="w-4 h-4" />
                </button>
              </div>
              <div class="relative">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="form.confirmPassword"
                  placeholder="Confirm Password"
                  class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
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
  
              <button 
                type="submit"
                :disabled="authStore.loading"
                class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50"
              >
                {{ authStore.loading ? 'Registering...' : 'Register' }}
              </button>
  
              <div v-if="authStore.error" class="text-red-500 text-sm text-center">
                {{ authStore.error }}
              </div>
  
              <div class="relative my-4 flex items-center">
                <div class="flex-grow h-px bg-gray-300"></div>
                <span class="px-3 text-xs text-gray-500">OR</span>
                <div class="flex-grow h-px bg-gray-300"></div>
              </div>
  
              <button 
                @click.prevent="registerWithGoogle" 
                class="w-full py-2 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                <img src="@/assets/media/images/common/ant-design--google-circle-filled.png" alt="Google Icon" class="w-7 h-7 mr-3" />
                Continue with Google
              </button>
  
              <p class="text-center text-xs text-gray-600 mt-4">
                Already have an account? 
                <router-link to="/auth/login" class="text-blue-600 hover:text-blue-700">Login</router-link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-vue-next';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/modules/authStore';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  const registrationComplete = ref(false);
  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const togglePassword = (field) => {
    if (field === 'password') {
      showPassword.value = !showPassword.value;
    } else if (field === 'confirm') {
      showConfirmPassword.value = !showConfirmPassword.value;
    }
  };
  
  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      authStore.error = "Passwords do not match";
      return;
    }
    
    try {
      const registeredEmail = await authStore.registerUser({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName
      });
      registrationComplete.value = true;
      // Redirect to login page with email as query parameter
      router.push({ path: '/auth/login', query: { email: registeredEmail } });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  const registerWithGoogle = async () => {
    try {
      await authStore.signInWithGoogle();
      if (authStore.user) {
        console.log('Google sign-in successful:', authStore.user);
        console.log('User email:', authStore.user.email || 'Email not available');
        console.log('User display name:', authStore.user.displayName);
        console.log('User photo URL:', authStore.user.photoURL);
        console.log('User UID:', authStore.user.uid);
        router.push('/user/dashboard');
      } else {
        console.error('Google sign-in successful but user is null');
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };
  
  const goToHome = () => {
    router.push('/landing/home');
  };
  </script>
  
  <style scoped>
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none;
  }
  </style>
  
  