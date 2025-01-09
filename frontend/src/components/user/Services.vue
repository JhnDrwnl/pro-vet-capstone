<!-- components/user/Services.vue -->
<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="service in services"
        :key="service.id"
        @click="$emit('select', service)"
        :class="[
          'flex flex-col items-center p-6 rounded-xl border transition-all duration-200',
          selectedService?.id === service.id
            ? 'border-[#E3FF75] bg-[#E3FF75]/10 ring-2 ring-[#E3FF75] ring-opacity-50'
            : 'border-gray-200 hover:border-[#E3FF75] hover:shadow-md'
        ]"
      >
        <component :is="service.icon" class="w-8 h-8 mb-3" />
        <span class="text-sm font-medium text-center">{{ service.name }}</span>
      </button>
    </div>
  </template>
  
  <script setup>
  import { Stethoscope, Syringe, PawPrint, HeartPulse } from 'lucide-vue-next'
  
  defineProps({
    selectedService: {
      type: Object,
      default: null
    }
  })
  
  defineEmits(['select'])
  
  const services = [
    { id: 1, name: 'General Check-up', icon: Stethoscope },
    { id: 2, name: 'Vaccination', icon: Syringe },
    { id: 3, name: 'Pet Grooming', icon: PawPrint },
    { id: 4, name: 'Emergency Care', icon: HeartPulse }
  ]
  </script>
  
  