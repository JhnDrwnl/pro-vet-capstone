<template>
    <footer class="bg-[#1E40AF] text-white rounded-t-2xl py-10">
      <div class="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- Logo, Brand Name & Mission -->
        <div>
          <div class="flex items-center mb-3">
            <img src="@/assets/media/images/logo/LogoProvet-removebg-preview.png" alt="ProVet Logo" class="h-16 w-auto mr-3">
            <h2 class="text-2xl font-semibold">ProVet</h2>
          </div>
          <p class="text-sm leading-relaxed">
            "Promoting responsible pet ownership, animal welfare, and sustainable livestock farming in Oriental Mindoro."
          </p>
        </div>
  
        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Quick Links</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/home" class="hover:underline">Home</router-link></li>
            <li><router-link to="/about" class="hover:underline">About Us</router-link></li>
            <li><router-link to="/service" class="hover:underline">Services</router-link></li>
            <li><router-link to="/contact" class="hover:underline">Contact Us</router-link></li>
          </ul>
        </div>
  
        <!-- Contact Info -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Contact Us</h3>
          <ul class="space-y-2 text-sm">
            <li>Provincial Veterinary Office, Oriental Mindoro</li>
            <li>(043) 123-4567</li>
            <li>ProvinciailVeterinaryOffice@gmail.com</li>
            <li>Mon-Fri: 8:00 AM - 5:00 PM</li>
          </ul>
        </div>
  
        <!-- Social Media -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Follow Us</h3>
          <div class="flex space-x-4">
            <a href="#" class="social-icon">
              <Facebook class="icon-size" viewBox="0 0 24 24" />
            </a>
            <a href="#" class="social-icon">
              <Twitter class="icon-size" viewBox="0 0 24 24" />
            </a>
            <a href="#" class="social-icon">
              <Instagram class="icon-size" viewBox="0 0 24 24" />
            </a>
          </div>
        </div>
  
      </div>
  
      <!-- Copyright -->
      <div class="border-t border-gray-500 mt-6 pt-6 text-center">
        <p class="text-sm">&copy; 2025 ProVet. All Rights Reserved.</p>
      </div>
    </footer>
  </template>
  
  <script setup>
  import { Facebook, Twitter, Instagram } from 'lucide-vue-next';
  </script>
  
  <style scoped>
  footer {
    box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .social-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    transition: background-color 0.3s;
  }
  
  .social-icon:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
  
  .icon-size {
    width: 20px;
    height: 20px;
    color: white;
  }
  </style>
  