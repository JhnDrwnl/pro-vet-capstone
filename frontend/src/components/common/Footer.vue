<template>
    <footer class="bg-gray-100 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-wrap justify-between items-center">
          <div class="w-full md:w-1/3 mb-4 md:mb-0">
            <span class="text-sm text-gray-600">&copy; 2023 Pawscription. All rights reserved.</span>
          </div>
          <div class="w-full md:w-1/3 mb-4 md:mb-0 text-center">
            <router-link to="/" class="text-blue-600 hover:text-blue-800">Home</router-link> |
            <router-link to="/privacy" class="text-blue-600 hover:text-blue-800">Privacy Policy</router-link> |
            <router-link to="/terms" class="text-blue-600 hover:text-blue-800">Terms of Service</router-link>
          </div>
          <div class="w-full md:w-1/3 text-right">
            <a href="#" class="text-gray-600 hover:text-blue-600 mr-4">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="text-gray-600 hover:text-blue-600 mr-4">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="text-gray-600 hover:text-blue-600">
              <i class="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  // No additional logic needed for this simple footer
  </script>