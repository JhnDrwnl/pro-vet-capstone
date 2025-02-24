<template>
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <div class="relative w-full h-[300px] flex items-center justify-center text-center">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img src="@/assets/media/images/landing/contactpic.jpg" alt="Contact Us Background" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
  
        <!-- Text Content -->
        <div class="relative z-10 px-6 -mt-32">
          <h1 class="text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
          <p class="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mt-2">
            We're here to help! Reach out to us for any inquiries.
          </p>
        </div>
  
         <!-- Contact Info Cards -->
  <div class="absolute -bottom-32 left-0 right-0 container mx-auto px-4 z-20">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Email Card -->
      <div class="bg-white rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-blue-800 group">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-white">
          <Mail class="w-8 h-8 text-blue-500 transition-colors group-hover:text-blue-500" />
        </div>
        <h3 class="font-semibold text-gray-800 mb-2 transition-colors group-hover:text-white">Email Address</h3>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">ProvincialVeterinary@gmail.com</p>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">ProVetCalapan@gmail.com</p>
      </div>

      <!-- Phone Card -->
      <div class="bg-white rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-blue-800 group">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-white">
          <Phone class="w-8 h-8 text-blue-500 transition-colors group-hover:text-blue-500" />
        </div>
        <h3 class="font-semibold text-gray-800 mb-2 transition-colors group-hover:text-white">Phone Number</h3>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">(123) 456-7890</p>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">(123) 456-7891</p>
      </div>

      <!-- Location Card -->
      <div class="bg-white rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-blue-800 group">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-white">
          <MapPin class="w-8 h-8 text-blue-500 transition-colors group-hover:text-blue-500" />
        </div>
        <h3 class="font-semibold text-gray-800 mb-2 transition-colors group-hover:text-white">Office Location</h3>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">Provincial Capitol</p>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">Calapan, 5200</p>
      </div>

      <!-- Work Hours Card -->
      <div class="bg-white rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:bg-blue-800 group">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-white">
          <Clock10Icon class="w-8 h-8 text-blue-500 transition-colors group-hover:text-blue-500" />
        </div>
        <h3 class="font-semibold text-gray-800 mb-2 transition-colors group-hover:text-white">Work Hours</h3>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">Mon - Fri: 8:00 am - 5:00 pm</p>
        <p class="text-gray-600 text-sm transition-colors group-hover:text-white/90">Sat - Sun: Closed</p>
      </div>
    </div>
  </div>

      </div>
  
      <!-- Spacer for cards overlap -->
      <div class="h-32"></div>
  
      <!-- Contact Form and Map Section -->
      <div class="container mx-auto px-4 pb-16 mt-8">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Contact Form -->
            <div class="p-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">Get In Touch With Us</h2>
              <form @submit.prevent="submitForm" class="space-y-4">
                <!-- Form content remains the same -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Name"
                    class="w-full px-4 py-2 rounded-md bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Email"
                    class="w-full px-4 py-2 rounded-md bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="Phone Number"
                    class="w-full px-4 py-2 rounded-md bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    v-model="form.subject"
                    type="text"
                    placeholder="Subject"
                    class="w-full px-4 py-2 rounded-md bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <textarea
                  v-model="form.message"
                  rows="4"
                  placeholder="Message"
                  class="w-full px-4 py-2 rounded-md bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                  required
                ></textarea>
                <button
                  type="submit"
                  class="w-full bg-blue-800 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition-colors"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>
  
            <!-- Map -->
            <div class="h-full min-h-[400px] lg:h-auto">
              <iframe
                class="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.1133764799847!2d121.17501407419223!3d13.405305986951412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bce8c944c00001%3A0xc1737c53b71c753c!2sOriental%20Mindoro%20Provincial%20Capitol!5e0!3m2!1sen!2sph!4v1739966044972!5m2!1sen!2sph" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">"
                frameborder="0"
                style="border:0"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Script remains the same
  import { ref } from 'vue';
  import { Mail, Phone, MapPin, Clock10Icon } from 'lucide-vue-next';
  
  const form = ref({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const submitForm = () => {
    console.log('Form submitted:', form.value);
    form.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
  };
  </script>