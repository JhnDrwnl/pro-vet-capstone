<!-- src/views/landing/Home.vue -->
<template>
    <div class="relative">
      <!-- Gradient Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-200"></div>
      
      <!-- Content -->
      <div class="relative container mx-auto px-4 py-12">
        <h1 class="text-4xl md:text-5xl font-bold text-blue-800 mb-6">Welcome to Pawscription</h1>
        <p class="text-xl text-gray-700 mb-8">Your one-stop solution for pet health and happiness.</p>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-blue-600 mb-4">Our Services</h2>
            <ul class="list-disc list-inside text-gray-700">
              <li>Online Vet Consultations</li>
              <li>Pet Health Records</li>
              <li>Medication Reminders</li>
              <li>Nutrition Plans</li>
            </ul>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-blue-600 mb-4">Why Choose Us?</h2>
            <ul class="list-disc list-inside text-gray-700">
              <li>24/7 Veterinary Support</li>
              <li>Easy-to-use Platform</li>
              <li>Personalized Pet Care</li>
              <li>Affordable Plans</li>
            </ul>
          </div>
        </div>
        
        <div class="mt-12 text-center">
          <router-link 
            to="/signup" 
            class="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Get Started
          </router-link>
        </div>
      </div>
    </div>
  </template>