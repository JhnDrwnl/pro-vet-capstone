<template>
  <div class="min-h-screen flex flex-col">
    <!-- Hero Section -->
    <div class="relative flex-grow overflow-hidden" style="height: 80vh;">
      <!-- Background with gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700"></div>

      <!-- Dog and Cat Image -->
      <div class="absolute bottom-0 right-4 z-10 max-w-xs sm:max-w-sm md:max-w-md">
        <img
          src="@/assets/media/images/landing/view-cats-dogs-being-friends-removebg-preview.png"
          alt="Happy pets"
          class="dog-cat-image"
        />
      </div>

      <!-- Animated Waves -->
      <div class="absolute bottom-0 left-0 w-full">
        <svg
          class="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shape-rendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
            <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
          </g>
        </svg>
      </div>

      <!-- Content -->
      <div class="relative container mx-auto px-4 h-full flex items-center">
        <div class="grid lg:grid-cols-2 gap-12 items-center w-full">
          <div class="text-white text-center lg:text-left">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              ProVet
            </h1>
            <p class="text-sm sm:text-lg md:text-xl mb-6 text-blue-100">
              Your Professional Partner in Veterinary Healthxare in the Province of Oriental Mindoro.
            </p>
            <button
              @click="navigateToLogin"
              class="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full text-base font-medium transition duration-300 ease-in-out transform hover:scale-105"
            >
              Book An Appointment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Services Section
    <div class="bg-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid gap-8 md:grid-cols-2">
          <div
            class="bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition duration-300 p-6 transform hover:-translate-y-1"
          >
            <h2 class="text-xl font-semibold text-blue-600 mb-4">Our Services</h2>
            <ul class="space-y-2 text-gray-600 text-sm">
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Online Vet Consultations
              </li>
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Pet Health Records
              </li>
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Medication Reminders
              </li>
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Nutrition Plans
              </li>
            </ul>
          </div>
          <div
            class="bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition duration-300 p-6 transform hover:-translate-y-1"
          >
            <h2 class="text-xl font-semibold text-blue-600 mb-4">Why Choose Us?</h2>
            <ul class="space-y-2 text-gray-600 text-sm">
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                24/7 Veterinary Support
              </li>
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Easy-to-use Platform
              </li>
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Personalized Pet Care
              </li>
              <li class="flex items-center gap-2">
                <PawPrint class="h-5 w-5 text-blue-500" />
                Affordable Plans
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToLogin = () => {
  router.push('/auth/Login');
};
</script>

  
  <style scoped>
  .waves {
    position: absolute;
    width: 100%;
    height: 100px;
    min-height: 100px;
    max-height: 150px;
    bottom: 0;
  }
  
  
  .parallax > use {
    animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
  }
  .parallax > use:nth-child(1) {
    animation-delay: -2s;
    animation-duration: 7s;
  }
  .parallax > use:nth-child(2) {
    animation-delay: -3s;
    animation-duration: 10s;
  }
  .parallax > use:nth-child(3) {
    animation-delay: -4s;
    animation-duration: 13s;
  }
  .parallax > use:nth-child(4) {
    animation-delay: -5s;
    animation-duration: 20s;
  }
  
  @keyframes move-forever {
    0% {
      transform: translate3d(-90px, 0, 0);
    }
    100% {
      transform: translate3d(85px, 0, 0);
    }
  }
  
  @media (max-width: 768px) {
    .waves {
      height: 40px;
      min-height: 40px;
    }
    .hero-container {
    height: 100vh; /* Ensure hero section takes full viewport height */
  }
  
  .dog-cat-image {
    width: auto; /* Maintain aspect ratio */
    height: 50vh; /* Set height to 50% of the viewport height */
    max-width: none; /* Remove max-width constraint */
    position: absolute; /* Position the image freely */
    bottom: 0; /* Align it to the bottom */
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Correct centering */
  }
  
  }
  </style>
  