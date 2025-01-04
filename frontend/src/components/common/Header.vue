<template>
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold text-blue-600">Pawscription</router-link>
        <ul class="flex space-x-4">
          <li><router-link to="/" class="text-gray-600 hover:text-blue-600">Home</router-link></li>
          <li><router-link to="/about" class="text-gray-600 hover:text-blue-600">About</router-link></li>
          <li><router-link to="/services" class="text-gray-600 hover:text-blue-600">Services</router-link></li>
          <li><router-link to="/contact" class="text-gray-600 hover:text-blue-600">Contact</router-link></li>
        </ul>
      </nav>
    </header>
  </template>
  
  <script setup>
  // No additional logic needed for this simple header
  </script>