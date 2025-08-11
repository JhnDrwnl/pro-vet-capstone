<template>
  <div v-if="!authStore.user?.uid" class="text-center py-20">
    <div class="max-w-md mx-auto">
      <div class="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-8 mx-auto">
        <UserXIcon class="w-16 h-16 text-red-400" />
      </div>
      <h3 class="text-2xl font-semibold text-gray-700 mb-3">Authentication Required</h3>
      <p class="text-gray-500 mb-6 leading-relaxed">
        Please log in as a veterinarian to view your client pets and manage their records.
      </p>
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-red-600 text-sm font-medium">⚠</span>
            </div>
          </div>
          <div class="ml-3 text-left">
            <p class="text-sm text-red-800">
              <strong>Note:</strong> This page is only accessible to authenticated veterinarians.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserXIcon } from 'lucide-vue-next'

defineProps({
  authStore: Object
})
</script> 