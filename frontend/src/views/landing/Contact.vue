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
    <h2 class="text-4xl font-bold text-white mb-4">Contact Us</h2>
    <p class="text-xl text-white max-w-3xl mx-auto">
  Contact us for inquiries, appointments, or assistance.
</p>

  </div>
</div>
    </div>
    
    <!-- FAQ Section that overlaps the hero -->
    <div class="max-w-6xl mx-auto px-8 -mt-80 relative z-10">
      <div class="bg-white rounded-3xl p-8 shadow-lg">
        <div class="text-center mb-8">
          <p class="text-sm uppercase tracking-wider text-blue-500 mb-1">FAQ</p>
          <h2 class="text-2xl font-bold">
            <span class="text-blue-800">Frequently Asked</span>
            <span class="text-blue-500"> Questions</span>
          </h2>
        
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(faq, index) in faqs" :key="index" 
            class="bg-blue-50/50 border border-blue-100 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HelpCircle class="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 class="font-semibold text-blue-800 mb-2">{{ faq.question }}</h3>
                <p class="text-gray-600 text-sm">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-8">
          <div class="inline-block bg-blue-50 px-6 py-3 rounded-full">
            <p class="text-blue-800 text-sm">
              Didn't find the answer you are looking for? 
              <a href="tel:+1234567890" class="font-medium text-blue-500 hover:underline">Give us a call</a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Spacer for overlap -->
    <div class="h-26"></div>

    <!-- Contact Section with same width as FAQ -->
    <div class="max-w-6xl mx-auto px-8 py-16">
      <div class="rounded-3xl shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <!-- Get in Touch Section with blue-50 background -->
          <div class="bg-blue-50 p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>
            
            <!-- Contact Details -->
            <div class="space-y-6">
              <!-- Location -->
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Head Office</h3>
                  <p class="text-gray-600">Provincial Capitol</p>
                  <p class="text-gray-600">Calapan, 5200</p>
                </div>
              </div>

              <!-- Email -->
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Email Us</h3>
                  <p class="text-gray-600">ProvincialVeterinary@gmail.com</p>
                  <p class="text-gray-600">ProVetCalapan@gmail.com</p>
                </div>
              </div>

              <!-- Phone -->
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Call Us</h3>
                  <p class="text-gray-600">(123) 456-7890</p>
                  <p class="text-gray-600">(123) 456-7891</p>
                </div>
              </div>

              <!-- Social Media -->
              <div class="mt-8">
                <h3 class="font-semibold text-gray-800 mb-4">Follow our social media</h3>
                <div class="flex space-x-4">
                  <a href="#" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <i class="text-white fab fa-facebook-f"></i>
                  </a>
                  <a href="#" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <i class="text-white fab fa-twitter"></i>
                  </a>
                  <a href="#" class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <i class="text-white fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form with white background -->
          <div class="bg-white p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
            <form @submit.prevent="submitForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Name"
                  class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  v-model="form.company"
                  type="text"
                  placeholder="Company"
                  class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="Phone"
                  class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="Email"
                  class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <input
                v-model="form.subject"
                type="text"
                placeholder="Subject"
                class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                required
              />
              <textarea
                v-model="form.message"
                rows="4"
                placeholder="Message"
                class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                required
              ></textarea>
              <button
                type="submit"
                class="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Map Section with same width -->
      <div class="mt-8">
        <iframe
          class="w-full h-[400px] rounded-3xl"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3881.1133764799847!2d121.17501407419223!3d13.405305986951412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bce8c944c00001%3A0xc1737c53b71c753c!2sOriental%20Mindoro%20Provincial%20Capitol!5e0!3m2!1sen!2sph!4v1739966044972!5m2!1sen!2sph"
          frameborder="0"
          style="border:0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Mail, Phone, MapPin, Clock10Icon, HelpCircle } from 'lucide-vue-next';

const form = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const submitForm = () => {
  console.log('Form submitted:', form.value);
  form.value = {
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
};

// FAQ data
const faqs = ref([
  {
    question: "What services does your veterinary clinic offer?",
    answer: "Our clinic provides comprehensive veterinary care including wellness exams, vaccinations, spay/neuter surgeries, dental care, emergency services, laboratory diagnostics, and preventive care for all types of pets and livestock."
  },
  {
    question: "Do I need to make an appointment for my pet's visit?",
    answer: "Yes, we recommend scheduling an appointment to ensure prompt service. However, we do accept emergency cases without prior appointments. You can book appointments by phone or through our online scheduling system."
  },
  {
    question: "How often should I bring my pet for check-ups?",
    answer: "We recommend annual wellness exams for adult pets and bi-annual exams for senior pets (over 7 years for dogs, over 10 years for cats). Puppies and kittens require more frequent visits for vaccinations and developmental assessments."
  },
  {
    question: "What should I bring to my pet's first appointment?",
    answer: "Please bring any previous medical records, vaccination history, current medications, and a stool sample if possible. For new pets, bring any adoption or purchase paperwork. Arrive 10-15 minutes early to complete registration forms."
  }
]);
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

.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}

.animate-pulse-slower {
  animation: pulse-slower 4s infinite ease-in-out;
}

.animate-pulse-slowest {
  animation: pulse-slowest 5s infinite ease-in-out;
}
</style>