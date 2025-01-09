<!-- components/user/Doctorss.vue -->
<template>
    <div class="space-y-4">
      <div
        v-for="doctor in doctors"
        :key="doctor.id"
        @click="$emit('select', doctor)"
        :class="[
          'flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200',
          selectedDoctor?.id === doctor.id
            ? 'border-[#E3FF75] bg-[#E3FF75]/10 ring-2 ring-[#E3FF75] ring-opacity-50'
            : 'border-gray-200 hover:border-[#E3FF75] hover:shadow-md'
        ]"
      >
        <img :src="doctor.image" :alt="doctor.name" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
        <div class="ml-4 flex-1">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-gray-900">Dr. {{ doctor.name }}</h4>
            <div class="flex items-center">
              <Star class="w-4 h-4 text-yellow-400 fill-current" />
              <span class="ml-1 text-sm text-gray-600">{{ doctor.rating }}</span>
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ doctor.specialty }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span 
              v-for="day in doctor.availability" 
              :key="day"
              class="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
            >
              {{ day }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { Star } from 'lucide-vue-next'
  
  defineProps({
    selectedDoctor: {
      type: Object,
      default: null
    }
  })
  
  defineEmits(['select'])
  
  const doctors = [
    { 
      id: 1, 
      name: 'Liza Martin', 
      specialty: 'General Veterinarian',
      rating: 4.8,
      image: '/placeholder.svg?height=200&width=200',
      availability: ['Mon', 'Tue', 'Wed', 'Thu'],
      bio: 'Dr. Liza Martin is a renowned veterinarian with over 10 years of experience in small animal medicine. She specializes in preventive care and internal medicine.',
      location: '123 Pet Care Street, Suite 101',
      contact: {
        phone: '+1 234 567 890',
        email: 'liza.martin@provet.com'
      }
    },
    { 
      id: 2, 
      name: 'Robert Wilson', 
      specialty: 'Surgery Specialist',
      rating: 4.5,
      image: '/placeholder.svg?height=200&width=200',
      availability: ['Mon', 'Wed', 'Fri'],
      bio: 'Dr. Robert Wilson is a skilled veterinary surgeon with expertise in orthopedic and soft tissue surgeries. He has performed over 1,000 successful operations.',
      location: '123 Pet Care Street, Suite 102',
      contact: {
        phone: '+1 234 567 891',
        email: 'robert.wilson@provet.com'
      }
    },
    { 
      id: 3, 
      name: 'Sarah Johnson', 
      specialty: 'Pet Dermatologist',
      rating: 4.9,
      image: '/placeholder.svg?height=200&width=200',
      availability: ['Tue', 'Thu', 'Fri'],
      bio: 'Dr. Sarah Johnson is a certified veterinary dermatologist specializing in skin conditions and allergies in pets. She is known for her gentle approach with anxious animals.',
      location: '123 Pet Care Street, Suite 103',
      contact: {
        phone: '+1 234 567 892',
        email: 'sarah.johnson@provet.com'
      }
    }
  ]
  </script>
  