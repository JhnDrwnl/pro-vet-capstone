<!-- components/user/Pets.vue -->
<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="pet in pets"
        :key="pet.id"
        @click="$emit('select', pet)"
        :class="[
          'flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200',
          selectedPet?.id === pet.id
            ? 'border-[#E3FF75] bg-[#E3FF75]/10 ring-2 ring-[#E3FF75] ring-opacity-50'
            : 'border-gray-200 hover:border-[#E3FF75] hover:shadow-md'
        ]"
      >
        <img :src="pet.image" :alt="pet.name" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
        <div class="ml-4">
          <h4 class="font-medium text-gray-900">{{ pet.name }}</h4>
          <p class="text-sm text-gray-500">{{ pet.breed }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    selectedPet: {
      type: Object,
      default: null
    }
  })
  
  defineEmits(['select'])
  
  const pets = [
    { id: 1, name: 'Max', breed: 'Golden Retriever', image: '/placeholder.svg' },
    { id: 2, name: 'Luna', breed: 'Persian Cat', image: '/placeholder.svg' }
  ]
  </script>
  
  