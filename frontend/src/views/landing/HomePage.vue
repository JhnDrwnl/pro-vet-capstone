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

    <!-- About Section - Updated to match About.vue design -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-8">
        <!-- Updated heading style -->
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1"
             v-motion
             :initial="{ opacity: 0 }"
             :visibleOnce="{ opacity: 1 }">
            Our Core Values
          </p>
          <h2 class="text-2xl font-bold"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :visibleOnce="{ opacity: 1, y: 0 }">
            <span class="text-blue-800">Guiding Principles</span>
            <span class="text-blue-500"> of Our Practice</span>
          </h2>
        </div>
        
        <!-- Updated MVM items with new design from About.vue -->
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(item, index) in mvmItems" 
               :key="index"
               class="bg-blue-50/50 border border-blue-100 rounded-lg p-6 hover:shadow-md transition-all duration-300"
               v-motion
               :initial="{ opacity: 0, scale: 0.9 }"
               :visibleOnce="{ 
                 opacity: 1, 
                 scale: 1, 
                 transition: { duration: 600, delay: 200 * index } 
               }">
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <component :is="item.icon" class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-xl font-bold text-blue-800 mb-3">{{ item.title }}</h3>
              <p class="text-gray-600">
                {{ item.content }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

   
    <!-- Services Section -->
    <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-8">
      <!-- Heading with consistent style -->
      <div class="text-center mb-16">
        <p class="text-sm uppercase tracking-wider text-blue-500 mb-1"
           v-motion
           :initial="{ opacity: 0 }"
           :visibleOnce="{ opacity: 1 }">
          What We Offer
        </p>
        <h2 class="text-2xl font-bold"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visibleOnce="{ opacity: 1, y: 0 }">
          <span class="text-blue-800">Our</span>
          <span class="text-blue-500"> Services</span>
        </h2>
      </div>
      
      <!-- Services Grid - Fixed to ensure equal height white sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Walk-in Veterinary -->
        <div 
          class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 150 } }"
        >
          <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
            <StethoscopeIcon class="h-12 w-12 text-blue-600" />
          </div>
          <div class="p-5 bg-white flex-1 flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Walk-in Veterinary</h3>
            <p class="text-gray-600 text-sm mb-3 flex-grow">
              Immediate care for your pets with no appointment needed. Our experienced veterinarians are ready to help.
            </p>
            <div class="mt-auto">
              <a href="#" class="text-blue-600 text-sm font-medium inline-block learn-more-link">
                Learn More
              </a>
            </div>
          </div>
        </div>

        <!-- Elective Services -->
        <div 
          class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 300 } }"
        >
          <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
            <CalendarIcon class="h-12 w-12 text-blue-600" />
          </div>
          <div class="p-5 bg-white flex-1 flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Elective Services</h3>
            <p class="text-gray-600 text-sm mb-3 flex-grow">
              Scheduled procedures including spaying, neutering, dental care, and other planned treatments.
            </p>
            <div class="mt-auto">
              <a href="#" class="text-blue-600 text-sm font-medium inline-block learn-more-link">
                Learn More
              </a>
            </div>
          </div>
        </div>

        <!-- Health Certificate -->
        <div 
          class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 450 } }"
        >
          <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
            <FileTextIcon class="h-12 w-12 text-blue-600" />
          </div>
          <div class="p-5 bg-white flex-1 flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Health Certificate</h3>
            <p class="text-gray-600 text-sm mb-3 flex-grow">
              Official documentation for travel, breeding, or other purposes requiring proof of pet health status.
            </p>
            <div class="mt-auto">
              <a href="#" class="text-blue-600 text-sm font-medium inline-block learn-more-link">
                Learn More
              </a>
            </div>
          </div>
        </div>

        <!-- Telehealth Services -->
        <div 
          class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 600 } }"
        >
          <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
            <MonitorIcon class="h-12 w-12 text-blue-600" />
          </div>
          <div class="p-5 bg-white flex-1 flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Telehealth Services</h3>
            <p class="text-gray-600 text-sm mb-3 flex-grow">
              Virtual consultations and follow-ups for convenient pet care from the comfort of your home.
            </p>
            <div class="mt-auto">
              <a href="#" class="text-blue-600 text-sm font-medium inline-block learn-more-link">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

    <!-- SDG Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-8">
        <!-- Updated heading style -->
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1"
             v-motion
             :initial="{ opacity: 0 }"
             :visibleOnce="{ opacity: 1 }">
            Our Commitment
          </p>
          <h2 class="text-2xl font-bold"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :visibleOnce="{ opacity: 1, y: 0 }">
            <span class="text-blue-800">Sustainable Development</span>
            <span class="text-blue-500"> Goals</span>
          </h2>
        </div>
        
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
      <div class="container mx-auto px-8">
        <!-- Updated heading style -->
        <div class="text-center mb-16">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1"
             v-motion
             :initial="{ opacity: 0 }"
             :visibleOnce="{ opacity: 1 }">
            Reach Out
          </p>
          <h2 class="text-2xl font-bold"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :visibleOnce="{ opacity: 1, y: 0 }">
            <span class="text-blue-800">Contact</span>
            <span class="text-blue-500"> Us Today</span>
          </h2>
        </div>
        
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
import { 
  StethoscopeIcon, 
  CalendarIcon, 
  FileTextIcon, 
  MonitorIcon,
  Target,
  Eye,
  Compass
} from 'lucide-vue-next';

// Background image for hero only
const heroImage = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=2000&auto=format&fit=crop';

// Zoom effect state
const zoomScale = ref(1);
const heroBackground = ref(null);

// Scroll handler for zoom effect (simplified to only handle hero)
const handleScroll = () => {
  const scrollPosition = window.scrollY;
  // Hero section zoom (increases as you scroll down)
  zoomScale.value = 1 + (scrollPosition * 0.0005);
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

// Updated Mission, Vision, Mandate items with icons
const mvmItems = ref([
  {
    title: 'Mandate',
    content: 'To provide animal health care services and contribute to food security through improved livestock and poultry production.',
    icon: Target
  },
  {
    title: 'Vision',
    content: 'A progressive and service-oriented office creating an environment conducive for sustainable livestock production and robust animal health.',
    icon: Eye
  },
  {
    title: 'Mission',
    content: 'The Provincial Veterinary Office is committed to provide effective animal health and production service based on sustainable technological practices and in accordance with existing laws and regulations.',
    icon: Compass
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

/* Custom pulse animations for potential use */
@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.6;
  }
}

@keyframes pulse-slower {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.7;
  }
}

@keyframes pulse-slowest {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}

.animate-pulse-slower {
  animation: pulse-slower 4s infinite ease-in-out;
}

.animate-pulse-slowest {
  animation: pulse-slowest 5s infinite ease-in-out;
}

.learn-more-link {
  position: relative;
  display: inline-block;
}

.learn-more-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: currentColor;
  transition: width 0.3s ease;
}

.learn-more-link:hover::after {
  width: 100%;
}
</style>