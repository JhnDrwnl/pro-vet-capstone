<!-- views/landing/Home.vue -->
<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
  
      <!-- Header -->
      <Header />
      
      <!-- Main Content with gradient background -->
      <main class="flex-grow relative">
      
        <!-- Content -->
        <div class="relative">
          <router-view v-if="!isDefaultRoute" v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
  
      <!-- Footer -->
      <Footer />
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import Header from '@/components/common/Header.vue'
  import Footer from '@/components/common/Footer.vue'

  
  const route = useRoute()

// Define `isDefaultRoute` based on route path or name
const isDefaultRoute = route.path === '/home'  // or any default route condition you want


  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  
  