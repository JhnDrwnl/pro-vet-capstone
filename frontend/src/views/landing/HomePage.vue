<template>
    <div>
      <!-- Hero Section -->
      <section class="bg-blue-600 text-white text-center py-20">
        <div class="container mx-auto px-6">
          <h1 class="text-5xl font-bold mb-4">Welcome to ProVet</h1>
          <p class="text-lg mb-6">Providing the best care for your pets</p>
          <router-link 
            to="/service" 
            class="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold transition duration-300 hover:bg-blue-200"
          >
            Explore Our Services
          </router-link>
        </div>
      </section>

  <section class="bg-white py-20">
    <div class="container mx-auto px-6">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
        Our Commitment to Sustainable Veterinary Care
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
        <div
          v-for="sdg in sdgs"
          :key="sdg.id"
          class="relative rounded-2xl shadow-md text-center h-64 overflow-hidden transition-all duration-300 ease-in-out"
          @mouseenter="sdg.isHovered = true"
          @mouseleave="sdg.isHovered = false"
        >
          <div
            class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ease-in-out"
            :class="{ 'opacity-0': sdg.isHovered }"
          >
            <img :src="sdg.image" :alt="sdg.title" class="w-full h-full object-cover" />
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center p-4 transition-all duration-300 ease-in-out"
            :class="[
              sdg.bgColor,
              { 'opacity-0 invisible': !sdg.isHovered, 'opacity-100 visible': sdg.isHovered }
            ]"
          >
            <div>
              <h3 class="text-xl font-semibold mb-2" :class="sdg.titleColor">
                {{ sdg.title }}
              </h3>
              <p class="text-gray-600 text-sm">{{ sdg.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>



      
      <!-- About Section -->
      <section class="py-16 text-center container mx-auto px-6">
        <h2 class="text-3xl font-semibold mb-4">About Us</h2>
        <p class="text-lg max-w-2xl mx-auto">
          At ProVet, we are dedicated to providing the highest quality veterinary services. 
          Our experienced team ensures your pet's health and happiness.
        </p>
      </section>
  
      <!-- Services Section -->
      <section class="bg-gray-100 py-16 text-center">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-semibold mb-6">Our Services</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-2">General Checkups</h3>
              <p>Comprehensive health exams for your pets.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-2">Vaccinations</h3>
              <p>Keep your pet safe with our vaccination programs.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-2">Emergency Care</h3>
              <p>24/7 emergency support for urgent pet needs.</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Contact Section -->
      <section class="py-16 text-center">
        <h2 class="text-3xl font-semibold mb-6">Get in Touch</h2>
        <router-link 
          to="/contact" 
          class="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition duration-300 hover:bg-blue-700"
        >
          Contact Us
        </router-link>
      </section>
    </div>
  </template>
  <script setup>
  import { ref } from 'vue';
  
  const sdgs = ref([
    {
      id: 3,
      title: 'Good Health & Well-being',
      image: new URL('@/assets/media/images/landing/sdg3.png', import.meta.url).href,
      description: 'Ensuring the health of animals contributes to public health by preventing zoonotic diseases and promoting overall well-being.',
      bgColor: 'bg-blue-100',
      titleColor: 'text-blue-900',
      isHovered: false,
    },
    {
      id: 9,
      title: 'Industry & Innovation',
      image: new URL('@/assets/media/images/landing/sdg9.png', import.meta.url).href,
      description: 'Strengthening veterinary infrastructure and innovation through modern technology and research to improve animal healthcare.',
      bgColor: 'bg-gray-100',
      titleColor: 'text-gray-900',
      isHovered: false,
    },
    {
      id: 11,
      title: 'Sustainable Communities',
      image: new URL('@/assets/media/images/landing/sdg11.png', import.meta.url).href,
      description: 'Promoting responsible pet ownership, urban pet health programs, and waste management to create sustainable cities.',
      bgColor: 'bg-orange-100',
      titleColor: 'text-orange-900',
      isHovered: false,
    },
    {
      id: 12,
      title: 'Responsible Consumption',
      image: new URL('@/assets/media/images/landing/sdg12.png', import.meta.url).href,
      description: 'Promoting sustainable livestock practices and responsible pet ownership to reduce environmental impact.',
      bgColor: 'bg-green-100',
      titleColor: 'text-green-900',
      isHovered: false,
    },
    {
      id: 15,
      title: 'Life on Land',
      image: new URL('@/assets/media/images/landing/sdg15.png', import.meta.url).href,
      description: 'Protecting terrestrial ecosystems through wildlife conservation and promoting biodiversity.',
      bgColor: 'bg-yellow-100',
      titleColor: 'text-yellow-900',
      isHovered: false,
    },
  ]);
  </script>
  
  <style scoped>
  /* You can add additional custom styles here */
  </style>
  