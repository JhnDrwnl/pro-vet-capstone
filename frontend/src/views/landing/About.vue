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
    <div class="py-8 bg-gray-100">
    <div class="py-20 container mx-auto px-4">
  <h2 class="text-4xl font-bold text-center text-[#2B3674] mb-3">Meet Our Dedicated Team</h2>
  <p class="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
    Passionate professionals committed to providing the best care for your pets.
  </p>
  
  <div class="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
    <div v-for="(member, index) in team" 
         :key="index"
         class="relative pb-16"
         v-motion
         :initial="{ opacity: 0, y: 20 }"
         :enter="{ opacity: 1, y: 0, delay: 150 * index }">
      <!-- Image Container -->
      <div class="bg-gray-100 rounded-lg overflow-hidden">
        <img :src="member.image" 
             :alt="member.name" 
             class="w-full h-[350px] object-cover"/>
      </div>
      
      <!-- Overlapping Card -->
      <div class="absolute -bottom-4 left-4 right-4 bg-white rounded-lg shadow-md p-6 text-center transform transition-transform hover:-translate-y-1">
        <h3 class="text-lg font-semibold text-gray-900">{{ member.name }}</h3>
        <p class="text-gray-600 text-sm">{{ member.role }}</p>
      </div>
    </div>
  </div>
</div>
</div>

<!-- Agencies Section -->
<div class="py-16 bg-white"> 
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold text-center text-[#2B3674] mb-8">Institutions behind the Project</h2>
    <p class="text-center text-gray-600 mb-4 max-w-2xl mx-auto">
      We collaborate with leading organization to ensure the best veterinary services.
    </p>
    
    <div class="flex flex-wrap justify-center items-center gap-12 max-w-6xl mx-auto  p-8 ">
      <div v-for="(agency, index) in agencies" 
           :key="index"
           class="flex items-center justify-center w-48 h-48 rounded-lg p-4 transition-transform duration-300 hover:scale-110">
        <img :src="agency.logo" 
             :alt="agency.name" 
             class="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-125"/>
      </div>
    </div>
  </div>
</div>
<!-- System Development Team Section -->
<div class="py-16 bg-gray-50">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center text-[#2B3674] mb-3">Meet the Developers</h2>
    <p class="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
      The brilliant minds behind the system, dedicated to innovation and excellence.
    </p>

    <div class="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
      <div v-for="(dev, index) in developers" 
           :key="index"
           class="relative group">
        <!-- Card Container -->
        <div class="bg-white rounded-2xl shadow-lg p-6 pt-16 transition-transform duration-300 hover:-translate-y-2">
          <!-- Circular Image with Arc -->
          <div class="relative w-32 h-32 mx-auto -mt-24 mb-6">
            <div class="absolute inset-0 rounded-full border-[3px] border-transparent">
              <!-- Teal Arc -->
              <div class="absolute inset-0 rounded-full border-[9px] border-blue-500"
                   style="clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);">
              </div>
            </div>
            <img :src="dev.image" 
                 :alt="dev.name" 
                 class="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"/>
          </div>

          <!-- Content -->
          <div class="text-center space-y-3">
            <div class="space-y-1">
              <h3 class="text-xl font-semibold text-[#2B3674]">
                {{ dev.name }}
              </h3>
              <p class="text-gray-500 text-sm">
                {{ dev.role }}
              </p>
            </div>
            
            <!-- Social Media Icons -->
            <div class="flex justify-center items-center space-x-4 pt-2">
              <a href="#" class="text-gray-400 hover:text-blue-500 transition-colors">
                <LinkedinIcon class="w-5 h-5" />
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-400 transition-colors">
                <TwitterIcon class="w-5 h-5" />
              </a>
              <a href="#" class="text-gray-400 hover:text-gray-600 transition-colors">
                <GithubIcon class="w-5 h-5" />
              </a>
              <a href="#" class="text-gray-400 hover:text-blue-600 transition-colors">
                <MailIcon class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
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
    name: 'Grimaldo C. Catapang, DVM',
    role: 'Chief Veterinarian',
    image:new URL('@/assets/media/images/landing/doc1.jpg', import.meta.url).href,
  },
  {
    name: 'Anna Rochelle A. Boongaling, DVM',
    role: 'Veterinarian',
    image: new URL('@/assets/media/images/landing/doc2.jpg', import.meta.url).href,
  },
  {
    name: 'Alfredo P. Magcalimot, DVM',
    role: 'Veterinary Surgeon',
    image: new URL('@/assets/media/images/landing/doc3.jpg', import.meta.url).href,
  }
])

const agencies = ref([
  {
    name: 'Mindoro State University',
    logo: new URL('@/assets/media/images/landing/minsu.png', import.meta.url).href,
  },
  {
    name: 'Provincial Veterinarians Office',
    logo: new URL('@/assets/media/images/landing/logovet.jpg', import.meta.url).href,
  },
  {
    name: 'Province of Oriental Mindoro',
    logo: new URL('@/assets/media/images/landing/ormin.png', import.meta.url).href,
  }
])
const developers = ref([
  {
    name: 'John Doe',
    role: 'Main Programmer',
    image: new URL('@/assets/media/images/landing/doc1.jpg', import.meta.url).href,
  },
  {
    name: 'Jane Smith',
    role: 'Machine Learning Engineer',
    image: new URL('@/assets/media/images/landing/doc2.jpg', import.meta.url).href,
  },
  {
    name: 'Emily Johnson',
    role: 'UI/UX Designer',
    image: new URL('@/assets/media/images/landing/doc2.jpg', import.meta.url).href,
  }
])


</script>

