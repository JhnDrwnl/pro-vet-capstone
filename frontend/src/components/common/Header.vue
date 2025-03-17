<!-- components/common/Header.vue -->
<template>
  <header class="bg-[#3b82f6] sticky top-0 shadow-md z-50">
    <nav class="container mx-auto px-6 py-4 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center">
        <img
          src="@/assets/media/images/logo/LogoProvet-removebg-preview.png" 
          alt="ProVet Logo"
          class="h-12 w-auto mr-3"
        />
      </router-link>

      <!-- Navigation Links (Centered) -->
      <div class="flex-grow flex justify-center">
        <ul class="flex space-x-8">
          <li>
            <router-link 
              to="/" 
              class="text-white text-lg font-medium hover:text-blue-800 transition duration-200 pb-2"
              :class="{ 'border-b-2 border-white': $route.path === '/' }"
            >
              Home
            </router-link>
          </li>
          <li>
            <router-link 
              to="/about" 
              class="text-white text-lg font-medium hover:text-blue-800 transition duration-200 pb-2"
              :class="{ 'border-b-2 border-white': $route.path === '/about' }"
            >
              About Us
            </router-link>
          </li>
          <li>
            <router-link 
              to="/service" 
              class="text-white text-lg font-medium hover:text-blue-800 transition duration-200 pb-2"
              :class="{ 'border-b-2 border-white': $route.path === '/service' }"
            >
              Services
            </router-link>
          </li>
          <li>
            <router-link 
              to="/contact" 
              class="text-white text-lg font-medium hover:text-blue-800 transition duration-200 pb-2"
              :class="{ 'border-b-2 border-white': $route.path === '/contact' }"
            >
              Contact Us
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Login & Register Buttons (Right) -->
      <div class="flex space-x-4">
        <router-link 
          to="/auth/Login" 
          class="bg-white text-[#2563eb] hover:bg-blue-100 px-7 py-2 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          Login
        </router-link>
        <router-link 
          to="/auth/Register" 
          class="bg-[#1e40af] text-white hover:bg-[#1b3a94] px-7 py-2 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          Register
        </router-link>
      </div>
    </nav>
  </header>
</template>