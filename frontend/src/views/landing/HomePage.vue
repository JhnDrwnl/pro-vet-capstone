<template>
  <div class="relative">
    <!-- Hero Section with Zoom Effect (Project Moses Inspired) -->
    <section class="relative h-screen overflow-hidden">
      <!-- Background Image with Zoom Effect -->
      <div 
        ref="heroBackground" 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] ease-out"
        :style="{ 
          backgroundImage: `url(${heroImage})`,
          transform: `scale(${zoomScale})` 
        }"
      ></div>
      
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 
          class="text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        >
          ProVET
        </h1>
        <p 
          class="text-xl md:text-2xl mb-8 max-w-3xl"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 600 } }"
        >
          Monitoring and Providing the Best Veterinary Care for Your Pets
        </p>
        <router-link 
          to="/service" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition duration-300 transform hover:scale-105"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 1000 } }"
        >
          Explore Our Services
        </router-link>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>

    <!-- About Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <h2 
          class="text-4xl font-bold text-center mb-16"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0 }"
        >
          About Us
        </h2>
        
        <div class="grid md:grid-cols-3 gap-12">
          <div 
            v-for="(item, index) in mvmItems" 
            :key="index"
            class="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visibleOnce="{ 
              opacity: 1, 
              scale: 1, 
              transition: { duration: 600, delay: 200 * index } 
            }"
          >
            <h2 class="text-2xl font-bold text-blue-600 mb-4">{{ item.title }}</h2>
            <p class="text-gray-600 leading-relaxed">
              {{ item.content }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section with Parallax -->
    <section class="relative py-24 overflow-hidden">
      <!-- Parallax Background with Zoom -->
      <div 
        ref="servicesBackground" 
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[15000ms] ease-out"
        :style="{ 
          backgroundImage: `url(${servicesImage})`,
          transform: `scale(${servicesZoomScale})` 
        }"
      ></div>
      
      <!-- Dark Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-70"></div>
      
      <!-- Content -->
      <div class="relative z-10 container mx-auto px-4">
        <h2 
          class="text-4xl font-bold text-white text-center mb-16"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0 }"
        >
          Our Services
        </h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            v-for="(service, index) in services" 
            :key="index"
            class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-white border border-white border-opacity-20 transform transition-all duration-500 hover:-translate-y-2 hover:bg-opacity-20"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :visibleOnce="{ 
              opacity: 1, 
              y: 0, 
              transition: { duration: 600, delay: 150 * index } 
            }"
          >
            <h3 class="text-xl font-semibold mb-3">{{ service.title }}</h3>
            <p class="text-gray-200 mb-4">{{ service.description }}</p>
            <button class="text-blue-300 hover:text-blue-100 text-sm font-medium transition duration-300">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- SDG Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <h2 
          class="text-4xl font-bold text-center mb-4"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0 }"
        >
          Sustainable Development Goals
        </h2>
        <p 
          class="text-center text-gray-600 mb-16 max-w-3xl mx-auto"
          v-motion
          :initial="{ opacity: 0 }"
          :visibleOnce="{ opacity: 1, transition: { delay: 200 } }"
        >
          We are committed to supporting the UN Sustainable Development Goals
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="(sdg, index) in sdgs"
            :key="sdg.id"
            class="relative shadow-md text-center h-64 overflow-hidden transition-all duration-300 ease-in-out"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visibleOnce="{ 
              opacity: 1, 
              scale: 1, 
              transition: { duration: 600, delay: 100 * index } 
            }"
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

    <!-- Contact Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div 
          class="bg-white rounded-2xl shadow-xl overflow-hidden"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0 }"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Contact Form -->
            <div class="p-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-6">Get In Touch With Us</h2>
              <form @submit.prevent="submitForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Name"
                    class="w-full px-4 py-2 rounded-md text-base bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Email"
                    class="w-full px-4 py-2 rounded-md text-base bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="Phone Number"
                    class="w-full px-4 py-2 rounded-md text-base bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    v-model="form.subject"
                    type="text"
                    placeholder="Subject"
                    class="w-full px-4 py-2 rounded-md text-base bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
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
                  class="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>

            <!-- Map -->
            <div class="h-full min-h-[400px] lg:h-auto">
              <iframe
                class="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.1133764799847!2d121.17501407419223!3d13.405305986951412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bce8c944c00001%3A0xc1737c53b71c753c!2sOriental%20Mindoro%20Provincial%20Capitol!5e0!3m2!1sen!2sph!4v1739966044972!5m2!1sen!2sph"
                frameborder="0"
                style="border:0;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Background images
const heroImage = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop';
const servicesImage = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=2000&auto=format&fit=crop';

// Zoom effect state
const zoomScale = ref(1);
const servicesZoomScale = ref(1);
const heroBackground = ref(null);
const servicesBackground = ref(null);

// Scroll handler for zoom effect
const handleScroll = () => {
  const scrollPosition = window.scrollY;
  
  // Hero section zoom (increases as you scroll down)
  zoomScale.value = 1 + (scrollPosition * 0.0005);
  
  // Services section (check if in viewport)
  const servicesSection = document.querySelector('section:nth-child(3)');
  if (servicesSection) {
    const servicesSectionTop = servicesSection.offsetTop;
    const servicesSectionHeight = servicesSection.offsetHeight;
    
    if (scrollPosition > servicesSectionTop - window.innerHeight && 
        scrollPosition < servicesSectionTop + servicesSectionHeight) {
      // Calculate how far into the section we've scrolled (0 to 1)
      const scrollProgress = (scrollPosition - (servicesSectionTop - window.innerHeight)) / 
                            (servicesSectionHeight + window.innerHeight);
      
      // Apply zoom based on scroll progress
      servicesZoomScale.value = 1 + (scrollProgress * 0.15);
    }
  }
};

// Form data
const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const submitForm = () => {
  alert(`Message Sent by ${form.value.name}`);
  // Reset form
  form.value = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
};

// Mission, Vision, Mandate items
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
]);

// Services
const services = ref([
  {
    title: 'Walk-in Veterinary',
    description: 'Immediate care for your pets with no appointment needed. Our experienced veterinarians are ready to help.',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def'
  },
  {
    title: 'Elective Services',
    description: 'Scheduled procedures including spaying, neutering, dental care, and other planned treatments.',
    image: 'https://images.unsplash.com/photo-1576073719676-aa95576db207'
  },
  {
    title: 'Health Certificate',
    description: 'Official documentation for travel, breeding, or other purposes requiring proof of pet health status.',
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2'
  },
  {
    title: 'Telehealth Services',
    description: 'Virtual consultations and follow-ups for convenient pet care from the comfort of your home.',
    image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981'
  }
]);

// SDGs
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

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // Initial zoom effect
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Smooth scrolling for the page */
html {
  scroll-behavior: smooth;
}

/* Animation for the bounce arrow */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  50% {
    transform: translateY(-20px) translateX(-50%);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

/* Transition for hover effects */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>