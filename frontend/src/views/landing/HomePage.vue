<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-blue-600 text-white text-center py-20">
      <div class="container mx-auto px-6">
        <h1 class="text-5xl font-bold mb-4">Welcome to ProVet</h1>
        <p class="text-lg mb-6">Providing the best care for your pets</p>
        <router-link 
          to="/service" 
          class="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold transition duration-300 hover:bg-blue-200"
        >
          Explore Our Services
        </router-link>
      </div>
    </section>
    
    
  
    <!-- About Section -->
    <section class="py-16 text-center container mx-auto px-6">
      <h2 class="text-4xl font-semibold mb-4">About Us</h2>
      <div class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-12">
          <div v-for="(item, index) in mvmItems" 
               :key="index"
               class="bg-white p-8 rounded-xl shadow-lg"
               v-motion
               :initial="{ opacity: 0, x: -20 }"
               :enter="{ opacity: 1, x: 0, delay: 200 * index }">
            <h2 class="text-2xl font-bold text-primary mb-4">{{ item.title }}</h2>
            <p class="text-gray-600 text-base leading-relaxed">
              {{ item.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
    </section>
    <section class="relative py-20 bg-cover bg-center bg-no-repeat" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <!-- Content (Ensures it's above the overlay) -->
    <div class="relative container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="sdg in sdgs"
          :key="sdg.id"
          class="relative shadow-md text-center h-64 overflow-hidden transition-all duration-300 ease-in-out"
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



    <!-- Services Section -->
    <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <!-- Title -->
      <h2 class="text-4xl font-bold text-gray-800 text-center mb-4">Our services</h2>
      <p class="text-gray-500 text-base text-center mb-16">Providing comprehensive veterinary care for your pets</p>
      
      <!-- Services Circle Layout -->
      <div class="relative w-full">
        <!-- Mobile View (< 1280px) -->
        <div class="xl:hidden space-y-8">
          <div v-for="(service, index) in services" :key="index" class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-start gap-4">
              <div :class="`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${service.bgColor}`">
  <component :is="service.icon" class="w-6 h-6 text-white" />
</div>


              <div>
                <h3 class="text-2xl font-semibold mb-2">{{ service.title }}</h3>
                <p class="text-gray-500 text-base mb-4">{{ service.description }}</p>
                <button :class="`${index === 0 ? 'bg-[#9DC45F]' : 'bg-gray-700'} text-white px-6 py-2 text-xs  tracking-wider hover:bg-opacity-90`">
                  READ MORE
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop View (≥ 1280px) -->
        <div class="hidden xl:block">
          <div class="relative max-w-[900px] mx-auto">
            <div class="relative w-[500px] h-[500px] mx-auto">
              <!-- Center Circle -->
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-white rounded-full z-10"></div>
              
              <!-- Quadrants -->
              <div class="grid grid-cols-2 gap-3">
                <div v-for="(service, index) in services" :key="index"
                     :class="`relative h-[247px] overflow-hidden group ${getQuadrantClasses(index)}`">
                  <div :class="`absolute inset-0 ${getQuadrantPositioning(index)}`">
                    <img 
                      :src="service.image"
                      :alt="service.title" 
                      :class="`w-full h-full object-cover ${getQuadrantRadius(index)}`"
                    />
                  </div>
                  <div 
                    :class="`absolute inset-0 ${getQuadrantPositioning(index)} ${getQuadrantRadius(index)} ${getQuadrantBorder(index)} transition-colors duration-300 border-white group-hover:${getHoverBorder(index)} opacity-50`">
                  </div>
                </div>
              </div>

              <!-- Service Descriptions -->
              <div v-for="(service, index) in services" :key="`desc-${index}`"
                   :class="getDescriptionPosition(index)">
                <div class="flex items-start gap-4">
             
                  <div>
                    <h3 class="text-xl font-semibold mb-2">{{ service.title }}</h3>
                    <p class="text-gray-500 text-sm mb-4">{{ service.description }}</p>
                    <button class="bg-blue-500 text-white px-6 py-2 text-xs tracking-wider rounded-full transition duration-300 hover:bg-blue-900">
  READ MORE
</button>


                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


    <!-- Contact Section -->
   <!-- Contact Section -->
  <div class="container mx-auto px-4 pb-16 mt-8">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
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
                class="w-full px-4 py-2 rounded-md text-base  bg-blue-10 border border-black-100 focus:outline-none focus:border-blue-500"
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
</div>
</template>
<script setup>
import { ref } from 'vue';
import bgImage from '@/assets/media/images/landing/contactpic.jpg'; 

const sectionStyle = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
};

const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const submitForm = () => {
  alert(`Message Sent by ${form.value.name}`);
};
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
])

const services = [
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
]

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




const getDescriptionPosition = (index) => {
  return ['absolute top-0 -left-56 w-52', 'absolute top-0 -right-56 w-52', 'absolute bottom-0 -left-56 w-52', 'absolute bottom-0 -right-56 w-52'][index];
};

const getQuadrantClasses = (index) => ['rounded-tl-full', 'rounded-tr-full', 'rounded-bl-full', 'rounded-br-full'][index];

const getQuadrantPositioning = (index) => ['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'][index];

const getQuadrantRadius = (index) => ['rounded-tl-full', 'rounded-tr-full', 'rounded-bl-full', 'rounded-br-full'][index];

const getQuadrantBorder = (index) => ['border-t-8 border-l-8', 'border-t-8 border-r-8', 'border-b-8 border-l-8', 'border-b-8 border-r-8'][index];

const getHoverBorder = (index) => ['border-[#9DC45F] border-t-8 border-l-8', 'border-[#9DC45F] border-t-8 border-r-8', 'border-[#9DC45F] border-b-8 border-l-8', 'border-[#9DC45F] border-b-8 border-r-8'][index];

</script>

<style scoped>
.rounded-tl-full { border-top-left-radius: 100%; }
.rounded-tr-full { border-top-right-radius: 100%; }
.rounded-bl-full { border-bottom-left-radius: 100%; }
.rounded-br-full { border-bottom-right-radius: 100%; }

@media (max-width: 1280px) {
  .container {
    max-width: 100%;
  }
}
</style>