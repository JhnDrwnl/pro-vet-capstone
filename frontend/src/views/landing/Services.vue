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
          <h2 class="text-4xl font-bold text-white mb-4">Our Services</h2>
          <p class="text-xl text-white max-w-3xl mx-auto">
            Professional veterinary care for all your pet health needs
          </p>
        </div>
      </div>
    </div>

    <!-- Services Container that overlaps hero -->
    <div class="max-w-6xl mx-auto px-8 -mt-80 relative z-10">
      <div class="bg-white rounded-3xl p-8 shadow-lg">
        <div class="text-center mb-8">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1">Our Services</p>
          <h2 class="text-2xl font-bold">
            <span class="text-blue-800">Veterinary</span>
            <span class="text-blue-500"> Services</span>
          </h2>
        
        </div>
        <!-- Services Grid - Original services preserved -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Walk-in Services -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <StethoscopeIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Walk-in Services</h3>
              <p class="text-gray-600 text-sm mb-3">
                Basic veterinary services including consultation, treatment, and preventive care.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Elective Services -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <CalendarIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Elective Services</h3>
              <p class="text-gray-600 text-sm mb-3">
                Scheduled services for livestock and community animal health programs.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Health Certificate -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <FileTextIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Health Certificate</h3>
              <p class="text-gray-600 text-sm mb-3">
                Official documentation for animal transport and health verification.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Vaccination Services -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <SyringeIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Vaccination</h3>
              <p class="text-gray-600 text-sm mb-3">
                Comprehensive vaccination programs for pets and livestock.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Surgical Services -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <Scissors class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Surgery</h3>
              <p class="text-gray-600 text-sm mb-3">
                Professional surgical procedures for all types of animals.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Technical Assistance -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <HeartPulseIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Technical Support</h3>
              <p class="text-gray-600 text-sm mb-3">
                Expert guidance and support for animal health management.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Laboratory Services -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <FlaskConicalIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Laboratory</h3>
              <p class="text-gray-600 text-sm mb-3">
                Diagnostic testing and laboratory analysis services.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Emergency Care -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <Clock class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Emergency Care</h3>
              <p class="text-gray-600 text-sm mb-3">
                24/7 emergency veterinary services for urgent cases.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>

          <!-- Telehealth -->
          <div class="w-full max-w-[280px] mx-auto rounded-2xl border border-transparent hover:border-blue-200 transition-all duration-300 group overflow-hidden shadow-sm">
            <div class="bg-blue-50 p-6 flex items-center justify-center h-44">
              <MonitorIcon class="h-12 w-12 text-blue-600" />
            </div>
            <div class="p-5 bg-white">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Telehealth</h3>
              <p class="text-gray-600 text-sm mb-3">
                Online consultations and virtual veterinary assistance.
              </p>
              <a href="#" class="text-blue-600 text-sm font-medium inline-block relative">
                Learn More
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-8 mt-16 mb-16">
      <div 
        class="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl overflow-hidden shadow-lg"
        ref="ctaSection"
      >
        <div class="flex flex-col md:flex-row items-center">
          <!-- Left side with text and button -->
          <div class="w-full md:w-3/5 p-6 md:p-15 flex flex-col justify-center relative overflow-hidden">
            <!-- Animated background circles for decoration -->
            <div class="absolute inset-0">
             <!-- Bottom left small circle -->
              <div class="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full transform transition-all duration-700 animate-float-medium"></div>
              <!-- Middle right circle -->
               <div class="absolute top-1/2 -right-10 w-24 h-24 bg-white/10 rounded-full transform -translate-y-1/2 transition-all duration-700 animate-float-fast"></div>
              <div class="absolute top-1/2 -right-10 w-24 h-24 bg-white/10 rounded-full transform -translate-y-1/2 transition-all duration-700 animate-float-fast"></div>
              <div class="absolute top-1/2 w-32 h-32 bg-white/10 rounded-full transform -translate-y-1/2 transition-all duration-700 animate-float-fast"></div>
            </div>
            
            <div class="relative z-10">
              <h2 class="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                Schedule a virtual or presential appointment today
              </h2>
              <button class="bg-white text-blue-600 font-medium py-2 px-5 rounded-full hover:bg-blue-50 transition duration-300 inline-block text-sm">
                Book an Appointment
              </button>
            </div>
          </div>    
          <!-- Right side with image - Added zoom effect on hover and scroll -->
          <div 
            class="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden group"
            ref="imageContainer"
          >
            <img 
              ref="zoomImage"
              src="/src/assets/media/images/landing/contactpic.jpg" 
              alt="Veterinarian examining a pet" 
              class="w-full h-full object-cover transition-transform duration-700 ease-out"
              :class="{ 'scale-110': isImageVisible }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  StethoscopeIcon, 
  CalendarIcon, 
  FileTextIcon, 
  SyringeIcon,
  HeartPulseIcon,
  FlaskConicalIcon,
  MonitorIcon,
  Clock,
  Scissors
} from 'lucide-vue-next'

// Refs for zoom effect
const ctaSection = ref(null)
const imageContainer = ref(null)
const zoomImage = ref(null)
const isImageVisible = ref(false)

// Set up intersection observer for scroll-based animation
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isImageVisible.value = true
      } else {
        isImageVisible.value = false
      }
    })
  }, { 
    threshold: 0.3, // Trigger when 30% of the element is visible
    rootMargin: '0px' 
  })
  
  if (ctaSection.value) {
    observer.observe(ctaSection.value)
  }
  
  // Clean up observer on component unmount
  onUnmounted(() => {
    if (ctaSection.value) {
      observer.unobserve(ctaSection.value)
    }
  })
  
  // Add hover effect for the image container
  if (imageContainer.value) {
    imageContainer.value.addEventListener('mouseenter', () => {
      isImageVisible.value = true
    })
    
    imageContainer.value.addEventListener('mouseleave', () => {
      // Only reset if not in view (controlled by intersection observer)
      if (!ctaSection.value.classList.contains('in-view')) {
        isImageVisible.value = false
      }
    })
  }
})
</script>

<style>
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

/* Floating animations for circles */
@keyframes float-slow {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.03);
  }
}

@keyframes float-fast {
  0%, 100% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) translateY(-12px) scale(1.08);
  }
}

@keyframes float-slower {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.1);
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

.animate-float-slow {
  animation: float-slow 7s infinite ease-in-out;
}

.animate-float-medium {
  animation: float-medium 5s infinite ease-in-out;
}

.animate-float-fast {
  animation: float-fast 4s infinite ease-in-out;
}

.animate-float-slower {
  animation: float-slower 9s infinite ease-in-out;
}

/* Add hover effect for image container */
.group:hover img {
  transform: scale(1.1);
}

/* Add class for when element is in view */
.in-view img {
  transform: scale(1.1);
}
</style>