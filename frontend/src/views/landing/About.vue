<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <div class="relative w-full bg-[#F0F7FA] overflow-hidden">
      <!-- Paw Print Decorations -->
      <div class="absolute inset-0 z-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="paw-pattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
            <!-- Paw print facing down -->
            <path d="M50 50 q5 -10 10 0 t10 0 t10 0 q5 10 10 0 m-25 10 q-15 15 0 30 t25 0 t25 0 t0 -30" fill="#4A5568" transform="rotate(0, 75, 75)"/>
            <!-- Paw print facing right -->
            <path d="M50 50 q5 -10 10 0 t10 0 t10 0 q5 10 10 0 m-25 10 q-15 15 0 30 t25 0 t25 0 t0 -30" fill="#4A5568" transform="rotate(90, 225, 75)"/>
            <!-- Paw print facing up -->
            <path d="M50 50 q5 -10 10 0 t10 0 t10 0 q5 10 10 0 m-25 10 q-15 15 0 30 t25 0 t25 0 t0 -30" fill="#4A5568" transform="rotate(180, 225, 225)"/>
            <!-- Paw print facing left -->
            <path d="M50 50 q5 -10 10 0 t10 0 t10 0 q5 10 10 0 m-25 10 q-15 15 0 30 t25 0 t25 0 t0 -30" fill="#4A5568" transform="rotate(270, 75, 225)"/>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#paw-pattern)" />
        </svg>
      </div>
      
      <div class="container mx-auto px-4 py-20 relative z-10">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <!-- Text Content -->
          <div class="md:w-3/5 space-y-6 text-center md:text-left mb-12 md:mb-0">
            <h1 class="text-5xl md:text-6xl font-bold text-gray-900">About Us</h1>
            <p class="text-xl text-gray-600 max-w-2xl">
              Your Pet's Health is in Good Hands with Our Vets
            </p>
          </div>
          <!-- Hero Image -->
          <div class="md:w-2/5 relative">
            <div class="relative inline-block md:ml-24 md:-mr-16">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/47dfe018dd9293301b283e047f6ad02c-removebg-qERTD6FNLXv8Z393fpChpm5WBsdWZD.png"
                alt="Veterinarian" 
                class="w-full max-w-md mx-auto relative z-10"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Single Wave Divider -->
      <div class="absolute -bottom-1 left-0 right-0 z-20 translate-y-1">
        <svg 
          class="w-full h-auto" 
          viewBox="0 0 1440 200" 
          fill="none" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,80 C480,20 960,140 1440,80 L1440,200 L0,200 Z" 
            fill="#A7D8FF"
          />
        </svg>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap justify-between items-center divide-x divide-gray-200">
          <div v-for="(stat, index) in stats" 
               :key="index"
               class="flex-1 px-8 text-center group"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, delay: 100 * index }">
            <h3 class="text-6xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              {{ stat.value }}
            </h3>
            <p class="text-gray-600 uppercase tracking-wider text-sm font-medium">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mission Vision Mandate Section -->
    <div class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-12">
          <div v-for="(item, index) in mvmItems" 
               :key="index"
               class="bg-white p-8 rounded-xl shadow-lg"
               v-motion
               :initial="{ opacity: 0, x: -20 }"
               :enter="{ opacity: 1, x: 0, delay: 200 * index }">
            <h2 class="text-2xl font-bold text-primary mb-4">{{ item.title }}</h2>
            <p class="text-gray-600 leading-relaxed">
              {{ item.content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Section -->
    <div class="py-20 container mx-auto px-4">
      <h2 class="text-4xl font-bold text-center mb-16">Our Team</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div v-for="(member, index) in team" 
             :key="index"
             class="group relative overflow-hidden rounded-xl"
             v-motion
             :initial="{ opacity: 0, scale: 0.9 }"
             :enter="{ opacity: 1, scale: 1, delay: 150 * index }">
          <img :src="member.image" :alt="member.name" 
               class="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 class="text-white text-xl font-semibold">{{ member.name }}</h3>
            <p class="text-white/80">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  { 
    value: '152+',
    label: 'Appointments Today'
  },
  { 
    value: '2,845',
    label: 'Active Users'
  },
  { 
    value: '15,832',
    label: 'Total Visits'
  },
  { 
    value: '8,423',
    label: 'Registered Pets'
  }
])

const mvmItems = ref([
  {
    title: 'Mandate',
    content: 'To provide animal health care services and contribute to food security through improved livestock and poultry production.'
  },
  {
    title: 'Vision',
    content: 'A progressive and service-oriented office creating an environment conducive for sustainable livestock production and robust animal health.'
  },
  {
    title: 'Mission',
    content: 'The Provincial Veterinary Office is committed to provide effective animal health and production service based on sustainable technological practices and in accordance with existing laws and regulations.'
  }
])

const team = ref([
  {
    name: 'Dr. Sarah Johnson',
    role: 'Chief Veterinarian',
    image: '/placeholder.svg?height=400&width=300'
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Senior Veterinarian',
    image: '/placeholder.svg?height=400&width=300'
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Veterinary Surgeon',
    image: '/placeholder.svg?height=400&width=300'
  }
])
</script>

