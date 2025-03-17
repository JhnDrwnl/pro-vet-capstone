<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section - Kept exactly as in the original code -->
    <div class="relative bg-gradient-to-br from-blue-900 to-blue-500 overflow-hidden pb-56">
      <!-- Pulsing Concentric Circles -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-[500px] h-[500px] relative">
          <div class="absolute inset-0 border-2 border-blue-400/60 rounded-full animate-pulse-slow"></div>
          <div class="absolute inset-[50px] border-2 border-blue-400/60 rounded-full animate-pulse-slower"></div>
          <div class="absolute inset-[100px] border-2 border-blue-400/60 rounded-full animate-pulse-slowest"></div>
          <div class="absolute inset-[150px] border-2 border-blue-400/60 rounded-full animate-pulse-slow"></div>
          <div class="absolute inset-[200px] border-2 border-blue-400/80 rounded-full animate-pulse-slower"></div>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="relative px-4 py-24 sm:px-6 lg:px-8 text-center">
        <!-- Header Section -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">About Us</h2>
          <p class="text-xl text-white max-w-3xl mx-auto">
            Compassionate care for your pet's health and happiness.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Mission Vision Mandate Section that overlaps the hero -->
    <div class="max-w-6xl mx-auto px-8 -mt-80 relative z-10">
      <div class="bg-white rounded-3xl p-8 shadow-lg">
        <div class="text-center mb-8">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1">Our Core Values</p>
          <h2 class="text-2xl font-bold">
            <span class="text-blue-800">Guiding Principles</span>
            <span class="text-blue-500"> of Our Practice</span>
          </h2>
        </div>

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
    </div>

    <!-- Spacer for overlap -->
    <div class="h-32"></div>

    <!-- Stats Section with Counter Animation, Icons and Wavy Bottom -->
    <div class="relative py-20 bg-gradient-to-br from-blue-900 to-blue-500">
      <div class="container mx-auto px-4 pb-12">
        <!-- Updated heading style -->
        <div class="text-center mb-12">
          <p class="text-sm uppercase tracking-wider text-blue-300 mb-1">Our Impact</p>
          <h2 class="text-2xl font-bold">
            <span class="text-white">Key Metrics</span>
            <span class="text-blue-300"> at a Glance</span>
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="(stat, index) in stats" 
               :key="index"
               class="text-center"
               ref="statElements"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :visibleOnce="{ 
                 opacity: 1, 
                 y: 0, 
                 transition: { duration: 600, delay: 100 * index }
               }">
            <div class="flex flex-col items-center">
              <!-- Icon Circle -->
              <div class="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <component :is="stat.icon" class="w-10 h-10 text-white" />
              </div>
              
              <!-- Counter -->
              <h3 class="text-5xl font-bold mb-2 text-white flex items-center">
                <span class="counter-value" :id="`counter-${index}`">0</span>
                <span v-if="stat.value.includes('+')">+</span>
              </h3>
              
              <!-- Label -->
              <p class="text-white uppercase tracking-wider text-sm font-medium">
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Wavy Bottom Shape -->
      <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" class="relative block w-full h-[60px]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#f9fafb" class="fill-gray-50"></path>
        </svg>
      </div>
    </div>

    <!-- Team Section -->
    <div class="py-8 bg-gray-50">
      <div class="py-20 container mx-auto px-4">
        <!-- Updated heading style -->
        <div class="text-center mb-12">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1">Our Professionals</p>
          <h2 class="text-2xl font-bold">
            <span class="text-blue-800">Meet Our Dedicated</span>
            <span class="text-blue-500"> Team</span>
          </h2>
          <p class="text-gray-500 mt-4 max-w-2xl mx-auto">
            Passionate professionals committed to providing the best care for your pets.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div v-for="(member, index) in team" 
              :key="index"
              class="relative pb-16"
              v-motion
              :initial="{ opacity: 0, y: 40 }"
              :visibleOnce="{ 
                opacity: 1, 
                y: 0, 
                transition: { duration: 600, delay: 150 * index } 
              }">
            <!-- Image Container -->
            <div class="bg-gray-100 rounded-2xl overflow-hidden">
              <img :src="member.image" 
                  :alt="member.name" 
                  class="w-full h-[350px] object-cover transition-transform duration-700 hover:scale-110"/>
            </div>
            
            <!-- Overlapping Card -->
            <div class="absolute -bottom-4 left-4 right-4 bg-white rounded-2xl shadow-md p-6 text-center transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
              <h3 class="text-lg font-semibold text-gray-900">{{ member.name }}</h3>
              <p class="text-gray-600 text-sm">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agencies Section -->
    <div class="py-16 relative overflow-hidden transition-all duration-700" 
         :style="{ 
           backgroundImage: activeAgencyBg ? `url(${activeAgencyBg})` : 'none',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }">
      <!-- Overlay for better text readability when background image is active -->
      <div class="absolute inset-0 bg-white" 
           :class="{ 'bg-opacity-90': activeAgencyBg, 'bg-opacity-100': !activeAgencyBg }"></div>
      
      <div class="container mx-auto px-4 relative z-10">
        <!-- Updated heading style -->
        <div class="text-center mb-12">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1">Our Partners</p>
          <h2 class="text-2xl font-bold">
            <span class="text-blue-800">Institutions behind</span>
            <span class="text-blue-500"> the Project</span>
          </h2>
          <p class="text-gray-600 mt-4 max-w-2xl mx-auto">
            We collaborate with leading organization to ensure the best veterinary services.
          </p>
        </div>
        
        <div class="flex flex-wrap justify-center items-center gap-12 max-w-6xl mx-auto p-8">
          <div v-for="(agency, index) in agencies" 
              :key="index"
              class="flex items-center justify-center w-48 h-48 rounded-lg p-4 transition-all duration-500 hover:scale-110"
              @mouseenter="setActiveAgency(agency)"
              @mouseleave="clearActiveAgency"
              v-motion
              :initial="{ opacity: 0, rotateY: 90 }"
              :visibleOnce="{ 
                opacity: 1, 
                rotateY: 0, 
                transition: { duration: 800, delay: 200 * index } 
              }">
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
        <!-- Updated heading style -->
        <div class="text-center mb-12">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1">Our Creators</p>
          <h2 class="text-2xl font-bold">
            <span class="text-blue-800">Meet the</span>
            <span class="text-blue-500"> Developers</span>
          </h2>
          <p class="text-gray-500 mt-4 max-w-2xl mx-auto">
            The brilliant minds behind the system, dedicated to innovation and excellence.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div v-for="(dev, index) in developers" 
              :key="index"
              class="relative group"
              v-motion
              :initial="{ opacity: 0, y: 60 }"
              :visibleOnce="{ 
                opacity: 1, 
                y: 0, 
                transition: { 
                  duration: 800, 
                  delay: 200 * index,
                  type: 'spring',
                  stiffness: 50
                } 
              }">
            <!-- Card Container -->
            <div class="bg-white rounded-2xl shadow-lg p-6 pt-16 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
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
import { ref, onMounted } from 'vue'
import { 
  LinkedinIcon, 
  TwitterIcon, 
  GithubIcon, 
  MailIcon, 
  Target, 
  Eye, 
  Compass,
  Calendar,
  Users,
  Activity,
  PawPrint
} from 'lucide-vue-next'

// Stats data with icons
const stats = ref([
  { 
    value: '152+',
    label: 'Appointments Today',
    icon: Calendar
  },
  { 
    value: '2,845',
    label: 'Active Users',
    icon: Users
  },
  { 
    value: '15,832',
    label: 'Total Visits',
    icon: Activity
  },
  { 
    value: '8,423',
    label: 'Registered Pets',
    icon: PawPrint
  }
]);

const statElements = ref([]);
let observer;

// Parse numeric value from stat string (removing any '+' or other characters)
const parseStatValue = (value) => {
  return parseInt(value.replace(/\D/g, ''));
};

// Function to animate counter (similar to ProjectMoses style)
const animateCounter = (element, targetValue) => {
  let startTime;
  const duration = 2500; // 2.5 seconds for the animation
  const startValue = 0;
  
  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    
    // Use easeOutExpo for a more dramatic effect like ProjectMoses
    const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutExpo);
    element.textContent = formatNumber(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = formatNumber(targetValue);
    }
  };
  
  requestAnimationFrame(step);
};

// Setup Intersection Observer to trigger animations when stats are visible
onMounted(() => {
  // Wait for DOM to be fully rendered
  setTimeout(() => {
    // Get all counter elements
    const counterElements = document.querySelectorAll('.counter-value');
    
    // Create intersection observer
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Get the index from the element ID
          const index = parseInt(entry.target.id.split('-')[1]);
          // Get the target value
          const targetValue = parseStatValue(stats.value[index].value);
          // Start animation
          animateCounter(entry.target, targetValue);
          // Unobserve after animation starts
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    // Observe each counter element
    counterElements.forEach(element => {
      observer.observe(element);
    });
  }, 500);
});

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

const team = ref([
  {
    name: 'Grimaldo C. Catapang, DVM',
    role: 'Chief Veterinarian',
    image: new URL('@/assets/media/images/landing/doc1.jpg', import.meta.url).href,
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
]);

// Updated agencies with background images
const agencies = ref([
  {
    name: 'Mindoro State University',
    logo: new URL('@/assets/media/images/landing/minsu.png', import.meta.url).href,
    background: new URL('@/assets/media/images/landing/minsu-bg.jpg', import.meta.url).href,
  },
  {
    name: 'Provincial Veterinarians Office',
    logo: new URL('@/assets/media/images/landing/logovet.jpg', import.meta.url).href,
    background: new URL('@/assets/media/images/landing/vet-bg.jpg', import.meta.url).href,
  },
  {
    name: 'Province of Oriental Mindoro',
    logo: new URL('@/assets/media/images/landing/ormin.png', import.meta.url).href,
    background: new URL('@/assets/media/images/landing/ormin-bg.jpg', import.meta.url).href,
  }
]);

const developers = ref([
  {
    name: 'Sharon Caballero',
    role: 'Machine Learning Engineer',
    image: new URL('@/assets/media/images/landing/doc1.jpg', import.meta.url).href,
  },
  {
    name: 'John Darwin Lambon',
    role: 'Main Programmer',
    image: new URL('@/assets/media/images/landing/doc2.jpg', import.meta.url).href,
  },
  {
    name: 'Lhen Dimailig',
    role: 'UI/UX Designer',
    image: new URL('@/assets/media/images/landing/doc2.jpg', import.meta.url).href,
  }
]);

// Active agency background state
const activeAgencyBg = ref(null);

// Set active agency background
const setActiveAgency = (agency) => {
  activeAgencyBg.value = agency.background;
};

// Clear active agency background
const clearActiveAgency = () => {
  activeAgencyBg.value = null;
};
</script>

<style scoped>
/* Custom pulse animations with different speeds */
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

/* Counter styles similar to ProjectMoses */
.counter-value {
  display: inline-block;
  min-width: 2ch;
  font-variant-numeric: tabular-nums;
  transition: all 0.2s ease;
}

/* Add any additional custom animations here */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rotateIn {
  from {
    opacity: 0;
    transform: rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: rotateY(0);
  }
}
</style>