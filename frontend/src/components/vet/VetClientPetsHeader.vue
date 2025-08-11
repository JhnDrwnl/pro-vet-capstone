<template>
  <div class="mb-8">
    <h1 class="text-2xl font-semibold text-gray-900">Client Pets Management</h1>
    <p class="text-gray-500 mt-1">Manage pet owner profiles and their pets who have transactions with you.</p>
    <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 text-sm font-medium">ℹ</span>
          </div>
        </div>
        <div class="ml-3 text-left">
          <p class="text-sm text-blue-800">
            <strong>Note:</strong> Only showing clients and pets that have appointments or services with you.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or logic needed for this simple header component
</script> 