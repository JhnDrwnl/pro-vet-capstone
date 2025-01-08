<!-- src/layouts/AdminLayout.vue -->
<template>
    <div class="min-h-screen flex bg-gray-50">
      <Sidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />
      <div class="flex flex-col flex-grow transition-all duration-300" :class="{ 'ml-64': isSidebarOpen, 'ml-16': !isSidebarOpen }">
        <Header />
        <main class="flex-grow p-6">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Sidebar from '@/components/admin/AdminSidebar.vue';
  import Header from '@/components/admin/AdminHeader.vue';
  
  const isSidebarOpen = ref(true);
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };
  </script>