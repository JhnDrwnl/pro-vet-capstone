<template>
    <div>
      <!-- Hero Section -->
      <section class="bg-blue-600 text-white text-center py-20">
        <div class="container mx-auto px-6">
          <h1 class="text-5xl font-bold mb-4">Welcome to ProVet</h1>
          <p class="text-lg mb-6">Providing the best care for your pets</p>
          <router-link 
            to="/landing/service" 
            class="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold transition duration-300 hover:bg-blue-200"
          >
            Explore Our Services
          </router-link>
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
          to="/landing/contact" 
          class="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold transition duration-300 hover:bg-blue-700"
        >
          Contact Us
        </router-link>
      </section>
    </div>
  </template>
  
  <style scoped>
  /* You can add additional custom styles here */
  </style>
  