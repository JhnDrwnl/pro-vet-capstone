<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- <AdminHeader/> -->
    <Sidebar/>
      <main class="flex-grow">
        <router-view></router-view>
      </main>
    </div>
  </template>
  
  <script setup>
  import Sidebar from '@/components/common/VetSidebar.vue'
//   import AdminHeader from '@/components/common/AdminHeader.vue'
  </script>