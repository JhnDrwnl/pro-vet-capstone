<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- <AdminHeader/> -->
    <Header/>
    <!-- <Sidebar/> -->
    <Sidebar/>
      <main class="flex-grow">
        <router-view></router-view>
      </main>
    </div>
  </template>
  
  <script setup>
  import Sidebar from '@/components/common/AdminSidebar.vue'
  import Header from '@/components/common/Header.vue'
  </script>