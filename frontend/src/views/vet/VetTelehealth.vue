<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Column -->
        <div class="space-y-8">
          <div class="space-y-4">
            <h1 class="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
              {{ slides[currentSlide].title }}
            </h1>
            <p class="text-xl text-gray-600">
              {{ slides[currentSlide].subtitle }}
            </p>
          </div>

          <!-- Meeting Controls -->
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row gap-4">
              <button 
                @click="startNewMeeting"
                class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <VideoIcon class="w-5 h-5 mr-2" />
                New meeting
              </button>
              <div class="flex-1 relative">
                <input 
                  type="text"
                  placeholder="Enter a code or link"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <button 
                  class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 text-blue-600 font-medium hover:bg-blue-50 rounded-md transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
            <a href="#" class="inline-flex text-blue-600 hover:underline">
              Learn more about Telehealth
            </a>
          </div>
        </div>

        <!-- Right Column -->
        <div class="relative">
          <!-- Navigation Arrows -->
          <button 
            @click="previousSlide" 
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-20"
          >
            <ChevronLeftIcon class="w-6 h-6 text-gray-600" />
          </button>
          <button 
            @click="nextSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-20"
          >
            <ChevronRightIcon class="w-6 h-6 text-gray-600" />
          </button>

          <!-- Main Illustration -->
          <div class="relative aspect-square max-w-md mx-auto">
            <div class="absolute inset-0 bg-blue-50 rounded-full overflow-hidden">
              <TransitionGroup name="slide">
                <div 
                  v-for="(slide, index) in slides" 
                  :key="slide.id"
                  v-show="currentSlide === index"
                  class="absolute inset-0 transition-all duration-300"
                >
                  <div :id="`lottie-container-${index}`" class="w-full h-full"></div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- Security Message -->
          <div class="text-center mt-8 space-y-2">
            <h2 class="text-xl font-semibold text-gray-900">
              {{ slides[currentSlide].securityTitle }}
            </h2>
            <p class="text-gray-600">
              {{ slides[currentSlide].securityMessage }}
            </p>
          </div>

          <!-- Carousel Dots -->
          <div class="flex justify-center gap-2 mt-8">
            <button 
              v-for="(slide, index) in slides" 
              :key="slide.id"
              @click="goToSlide(index)"
              :class="[
                'w-2 h-2 rounded-full transition-all',
                currentSlide === index 
                  ? 'bg-blue-600 w-4' 
                  : 'bg-gray-300 hover:bg-gray-400'
              ]"
              :aria-label="`Go to slide ${index + 1}`"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { VideoIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import lottie from 'lottie-web'

const slides = [
  {
    id: 1,
    title: "Video calls and meetings for everyone",
    subtitle: "Connect, collaborate, and celebrate from anywhere",
    lottieUrl: "https://lottie.host/eef5246b-5eb6-4e59-aa95-4f876e907fbe/w8vlGAQY2p.json",
    securityTitle: "Your meeting is safe",
    securityMessage: "No one can join a meeting unless invited or admitted by the host"
  },
  {
    id: 2,
    title: "Connect with healthcare professionals",
    subtitle: "Get expert medical advice from the comfort of your home",
    lottieUrl: "https://lottie.host/8e319c9a-aa16-4c67-9762-5e8a6f1fb661/c6cXxUKVrd.json",
    securityTitle: "Private and secure",
    securityMessage: "All medical consultations are encrypted and HIPAA compliant"
  },
  {
    id: 3,
    title: "Group therapy sessions",
    subtitle: "Join supportive communities and share experiences",
    lottieUrl: "https://lottie.host/1e246ac2-6990-4be8-aae7-ce4c1ca7a244/OQ88rj0UOx.json",
    securityTitle: "Safe space for everyone",
    securityMessage: "Moderated sessions ensure respectful and helpful discussions"
  },
  {
    id: 4,
    title: "Follow up consultation",
    subtitle: "Access counseling whenever you need it",
    lottieUrl: "https://lottie.host/61024576-6d81-4689-a26b-377afb392172/gNHIvH2Tin.json",
    securityTitle: "Confidential conversations",
    securityMessage: "Your privacy is our top priority in every session"
  }
]

const currentSlide = ref(0)
let lottieInstances = []

const startNewMeeting = () => {
  console.log('Starting new meeting...')
}

const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}

const initializeLottieAnimations = () => {
  slides.forEach((slide, index) => {
    const container = document.querySelector(`#lottie-container-${index}`)
    if (container) {
      const animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: slide.lottieUrl
      })
      lottieInstances.push(animation)
    }
  })
}

// Auto-advance slides
let autoplayInterval
const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  clearInterval(autoplayInterval)
}

onMounted(() => {
  initializeLottieAnimations()
  startAutoplay()
  if (lottieInstances[currentSlide.value]) {
    lottieInstances[currentSlide.value].play()
  }
})

onUnmounted(() => {
  stopAutoplay()
  lottieInstances.forEach(instance => instance.destroy())
})

watch(currentSlide, (newValue, oldValue) => {
  if (lottieInstances[oldValue]) {
    lottieInstances[oldValue].stop()
  }
  if (lottieInstances[newValue]) {
    lottieInstances[newValue].play()
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>