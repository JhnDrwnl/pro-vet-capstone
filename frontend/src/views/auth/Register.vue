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
              src="/1-removebg-preview (1).png" 
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
          <form @submit.prevent="handleRegister" class="space-y-4 w-80">
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
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                <EyeOffIcon v-else class="w-4 h-4" />
              </button>
            </div>
            <div>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="form.confirmPassword"
                placeholder="Confirm Password"
                class="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            <button 
              type="submit"
              class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
            >
              Register
            </button>

            <div class="relative my-4 flex items-center">
              <div class="flex-grow h-px bg-gray-300"></div>
              <span class="px-3 text-xs text-gray-500">OR</span>
              <div class="flex-grow h-px bg-gray-300"></div>
            </div>

            <div class="flex justify-center space-x-4">
              <button 
                @click.prevent="registerWithGoogle" 
                class="w-10 h-10 flex items-center justify-center hover:bg-blue-100 border border-blue-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                <img src="/ant-design--google-circle-filled.png" alt="Google Icon" class="w-8 h-8" />
              </button>
              <button 
                @click.prevent="registerWithFacebook" 
                class="w-10 h-10 flex items-center justify-center hover:bg-blue-100 border border-blue-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <img src="/ic--twotone-facebook.png" alt="Facebook Icon" class="w-8 h-8" />
              </button>
            </div>

            <p class="text-center text-xs text-gray-600 mt-4">
              Already have an account? 
              <a href="/auth/Login" class="text-blue-600 hover:text-blue-700">Login</a>
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
import { useRouter } from 'vue-router'; // Import the useRouter hook

const router = useRouter(); // Get the router instance

const showPassword = ref(false);
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const handleRegister = () => {
  console.log('Register form submitted:', form);
};

const registerWithGoogle = () => {
  console.log('Google registration initiated');
};

const registerWithFacebook = () => {
  console.log('Facebook registration initiated');
};

const goToHome = () => {
  router.push('/'); // Navigate to the home route
};

</script>

<style scoped>
/* Add any additional custom styles here */
</style>

