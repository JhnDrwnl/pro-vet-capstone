<!-- src/views/auth/VerfyEmail.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-4 text-center">Email Verification</h1>
      <div v-if="verifying" class="text-center">
        <p class="text-gray-600">Verifying your email...</p>
      </div>
      <div v-else-if="verified" class="text-center">
        <p class="text-green-600 mb-4">Your email has been successfully verified!</p>
        <router-link 
          to="/auth/login" 
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Proceed to Login
        </router-link>
      </div>
      <div v-else class="text-center">
        <p class="text-red-600 mb-4">{{ error || 'Failed to verify your email. Please try again.' }}</p>
        <router-link 
          to="/auth/register" 
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Back to Registration
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const verifying = ref(true);
const verified = ref(false);
const error = ref('');

onMounted(async () => {
  const oobCode = route.query.oobCode;
  if (!oobCode) {
    error.value = 'Invalid verification link.';
    verifying.value = false;
    return;
  }

  try {
    const result = await authStore.verifyEmail(oobCode);
    if (result) {
      verified.value = true;
    } else {
      error.value = authStore.error || 'Failed to verify email.';
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    verifying.value = false;
  }
});
</script>

