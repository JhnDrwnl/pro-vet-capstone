<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <div class="max-w-md w-full space-y-8 z-10">
      <div class="text-center">
        <svg
          class="mx-auto h-48 w-auto text-blue-500"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="50" y="100" width="100" height="80" fill="currentColor" />
          <path
            d="M50 100C50 72.3858 72.3858 50 100 50C127.614 50 150 72.3858 150 100V180H50V100Z"
            fill="currentColor"
          />
          <circle cx="80" cy="90" r="10" fill="white" />
          <circle cx="120" cy="90" r="10" fill="white" />
          <path
            d="M90 130C90 134.418 94.4772 138 100 138C105.523 138 110 134.418 110 130C110 125.582 105.523 122 100 122C94.4772 122 90 125.582 90 130Z"
            fill="#FFA500"
          />
          <path
            d="M100 50C100 50 120 30 140 50"
            stroke="currentColor"
            stroke-width="8"
            stroke-linecap="round"
          />
        </svg>
        <h2 class="mt-6 text-5xl font-extrabold text-gray-900">Oops!!!</h2>
        <p class="mt-2 text-lg text-gray-600">
          This page you are looking for could not be found.
        </p>
      </div>
      <div class="mt-8 flex justify-center">
        <router-link
          to="/"
          class="w-64 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#0095FF] rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Go Back to Home
        </router-link>
      </div>
    </div>
    <div class="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
      <div v-for="n in 12" :key="n" class="absolute text-blue-300">
        <svg
          :style="{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 4V20M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  document.title = '404 - Page Not Found';
});
</script>