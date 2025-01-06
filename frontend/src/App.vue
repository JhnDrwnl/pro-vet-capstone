<!-- App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.initializeAuth()
    console.log('Authentication initialized successfully')
  } catch (error) {
    console.error('Failed to initialize authentication:', error)
  }
})
</script>