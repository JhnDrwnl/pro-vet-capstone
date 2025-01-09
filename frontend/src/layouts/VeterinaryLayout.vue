<template>
  <div class="min-h-screen flex bg-gray-50">
    <VeterinarySidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" class="z-30" />
    <div class="flex-1 flex flex-col transition-all duration-300"
         :class="{ 'ml-64': isSidebarOpen, 'ml-16': !isSidebarOpen }">
      <Header class="z-20" />
      <Breadcrumb class="px-6 py-4" />
      <main class="flex-grow p-6 overflow-y-auto">
        <router-view></router-view>
      </main>
      <!-- Modal container -->
      <div class="fixed inset-0 z-50 pointer-events-none">
        <slot name="modal"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VeterinarySidebar from '@/components/veterinary/Sidebar.vue';
import Header from '@/components/veterinary/Header.vue';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

