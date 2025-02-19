<!-- layouts/LandingLayout.vue -->
<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
      <Navbar/>
    
      <main class="flex-grow">
        <router-view></router-view>
      </main>
      <Footer/>
    </div>
  </template>
  
  <script setup>
  import Navbar from '@/components/common/Header.vue'
  import Footer from '@/components/common/Footer.vue'
  </script>