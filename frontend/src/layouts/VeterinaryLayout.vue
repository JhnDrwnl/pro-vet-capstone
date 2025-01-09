<template>
  <div class="min-h-screen flex bg-gray-50">
    <Sidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />
    <div class="flex flex-col flex-grow transition-all duration-300 relative z-20" 
         :class="{ 'ml-64': isSidebarOpen, 'ml-16': !isSidebarOpen }">
      <Header class="z-30" />
      <Breadcrumb class="px-6 py-4" />
      <main class="flex-grow p-6 overflow-y-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from '@/components/veterinary/VetSidebar.vue';
import Header from '@/components/veterinary/VetHeader.vue';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>