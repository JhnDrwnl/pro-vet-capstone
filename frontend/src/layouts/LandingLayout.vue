<!-- src/layouts/LandingLayout.vue -->
<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Header -->
      <Header />
      
      <!-- Main Content -->
      <main class="flex-grow">
        <router-view></router-view>
      </main>
  
      <!-- Footer -->
      <Footer />
    </div>
  </template>
  
  <script setup>
  import Header from '@/components/common/Header.vue'
  import Footer from '@/components/common/Footer.vue'
  </script>