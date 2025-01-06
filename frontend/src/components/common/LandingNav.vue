<template>
    <header class="bg-blue-600 sticky top-0 shadow-md z-50">
      <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center">
          <img
            src="/PROVET__1_-removebg-preview.png" 
            alt="ProVet Logo"
            class="h-10 w-auto mr-2"
          />
          <span class="text-sm font-extrabold text-white hover:text-blue-200 transition duration-200">
            ProVet
          </span>
        </router-link>
  
        <!-- Navigation Links -->
        <ul class="flex space-x-6">
          <li>
            <router-link 
              to="/auth/Login" 
              class="text-white text-base font-medium hover:text-blue-300 transition duration-200"
            >
              Login
            </router-link>
          </li>
          <li>
            <router-link 
              to="/auth/Register" 
              class="bg-white text-blue-600 hover:bg-blue-100 px-6 py-2 rounded-full text-base font-semibold transition duration-300 ease-in-out transform hover:scale-105 shadow-sm"
            >
              Register
            </router-link>
          </li>
        </ul>
      </nav>
    </header>
  </template>
  
  <style scoped>
  /* Shadow styles for elevated look */
  header {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  /* Logo image styling */
  header img {
    height: 40px; /* Adjust size of the logo */
    width: auto;
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    nav ul {
      space-x: 4; /* Adjust spacing between links for smaller screens */
    }
    nav {
      flex-wrap: wrap; /* Allow items to wrap for better fit */
    }
  }
  </style>
  