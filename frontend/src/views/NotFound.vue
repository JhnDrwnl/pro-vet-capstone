<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#4e8dd9] px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <div class="text-center bg-[#4e8dd9]">
        <img 
          src="@/assets/media/gif/system/Husky love_.gif" 
          alt="Sleeping cat with wagging tail" 
          class="mx-auto h-64 w-64 rounded-full object-cover"
        />
        <h2 class="mt-4 text-4xl font-extrabold text-white">Aww!</h2>
        <p class="mt-2 text-lg text-gray-200">
          We can't seem to find the page you requested. You may have mistyped the address or the page may have moved.
        </p>
      </div>
      <div class="mt-6 flex justify-center">
        <router-link
          to="/landing/home"
          class="w-64 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-[#4e8dd9] bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
        >
          Go Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Aww! Page Not Found';
});
</script>
