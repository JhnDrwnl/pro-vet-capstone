<!-- views/user/Dashboard.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 -mt-4 md:mt-0">
    <!-- Main content area with adjusted padding for mobile -->
    <div class="flex flex-col flex-1 px-0 md:px-4 pb-20 pt-14 md:pt-0 md:pb-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <!-- Left Column (2/3 width on large screens) -->
        <div class="lg:col-span-2 flex flex-col gap-3 md:gap-4">
          <!-- Welcome Banner - Fixed height -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-3 md:p-4 flex items-center justify-between overflow-hidden relative h-[120px] md:h-[160px] flex-shrink-0">
            <div class="text-white z-10 max-w-[60%]">
              <h1 class="text-lg md:text-xl font-bold mb-1 md:mb-2">Welcome to ProVET!</h1>
              <p class="text-xs text-blue-100 mb-2 md:mb-3">Track your pet's health, manage appointments, and get reminders for vaccinations.</p>
              <router-link 
                to="/user/userappointments" 
                class="bg-white text-blue-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors inline-flex items-center"
              >
                Connect to Doctor
              </router-link>
            </div>
            <div class="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end">
              <img src="/src/assets/media/images/common/banner.png" 
                  alt="Veterinarian with dog illustration" 
                  class="h-full object-contain" />
            </div>
          </div>

          <!-- Educational Resources - Fixed height without scrolling -->
          <div class="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-blue-50">
            <div class="flex justify-between items-center mb-2 md:mb-3">
              <h2 class="text-base md:text-lg font-semibold text-gray-800">Educational Resources</h2>
              <router-link to="/user/educational-resources" class="text-blue-600 text-xs font-medium">View All</router-link>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div v-for="(resource, index) in educationalResources.slice(0, 4)" :key="index" 
                  class="flex border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-[90px]"
                  @click="openResourceModal(index)">
                <div class="w-16 md:w-20 h-full bg-blue-100 flex-shrink-0">
                  <img :src="resource.image" :alt="resource.title" class="w-full h-full object-cover" />
                </div>
                <div class="p-2 flex flex-col justify-between flex-1">
                  <div>
                    <div class="flex items-center mb-1">
                      <span :class="`text-[10px] px-1.5 py-0.5 rounded-full ${resource.tagColor} ${resource.tagTextColor}`">
                        {{ resource.tag }}
                      </span>
                    </div>
                    <h3 class="text-xs font-medium text-gray-800 line-clamp-2">{{ resource.title }}</h3>
                  </div>
                  <div class="flex items-center text-[10px] text-gray-500">
                    <ClockIcon class="w-2.5 h-2.5 mr-1" />
                    <span>{{ resource.duration }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- My Pets - Fixed height without scrolling -->
          <div class="bg-white rounded-2xl p-3 md:p-4 shadow-sm border border-blue-50">
            <div class="flex justify-between items-center mb-2 md:mb-3">
              <h2 class="text-base md:text-lg font-semibold text-gray-800">My Pets</h2>
              <router-link 
                to="/user/profile" 
                class="text-blue-600 text-xs font-medium flex items-center"
              >
                <PlusIcon class="w-3.5 h-3.5 mr-1" />
                Add Pet 
              </router-link>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              <div v-for="(pet, index) in pets" :key="index" 
                  class="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div class="h-24 bg-blue-50 relative">
                  <img :src="pet.image" :alt="pet.name" class="w-full h-full object-cover" />
                  <div class="absolute bottom-0 right-0 m-2">
                    <span :class="`text-[10px] px-1.5 py-0.5 rounded-full bg-white ${pet.statusColor}`">
                      {{ pet.status }}
                    </span>
                  </div>
                </div>
                <div class="p-2">
                  <div class="flex justify-between items-center">
                    <h3 class="text-xs font-medium text-gray-800">{{ pet.name }}</h3>
                    <span class="text-[10px] text-gray-500">{{ pet.age }}</span>
                  </div>
                  <p class="text-[10px] text-gray-500 mt-0.5">{{ pet.breed }}</p>
                  <div class="flex justify-between items-center mt-1.5">
                    <button class="text-blue-600 text-[10px] font-medium">View Details</button>
                    <div class="flex items-center text-[10px] text-gray-500">
                      <CalendarIcon class="w-2.5 h-2.5 mr-1" />
                      <span>{{ pet.nextAppointment }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (1/3 width on large screens) -->
        <div class="flex flex-col gap-3 md:gap-4">
          <!-- Calendar Component -->
          <div class="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
            <CalendarComponent />
          </div>

          <!-- Emergency Contact - Separate component with its own container -->
          <div class="bg-red-50 rounded-2xl p-3 md:p-4 shadow-sm border border-red-100 mb-16 md:mb-0">
            <div class="flex items-center mb-2 md:mb-3">
              <div class="bg-red-100 p-1.5 rounded-full mr-2">
                <PhoneIcon class="w-4 h-4 text-red-600" />
              </div>
              <h2 class="text-base md:text-lg font-semibold text-gray-800">Emergency Contact</h2>
            </div>
            
            <p class="text-xs text-gray-600 mb-3">
              If your pet is experiencing a medical emergency, please call our emergency line immediately:
            </p>
            
            <a href="tel:+1234567890" class="bg-red-600 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-full text-center font-medium hover:bg-red-700 transition-colors flex items-center justify-center mb-1.5 md:mb-2">
              <PhoneIcon class="w-3.5 h-3.5 mr-1.5" />
              (123) 456-7890
            </a>
            
            <p class="text-[10px] text-gray-500 text-center">
              Available 24/7 for urgent care
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Resource Modal -->
    <div v-if="isResourceModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <div class="flex items-center">
            <span :class="`px-2 py-0.5 rounded-full text-xs ${selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].tagColor : ''} ${selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].tagTextColor : ''}`">
              {{ selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].tag : '' }}
            </span>
            <span class="text-xs text-gray-500 ml-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              {{ selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].duration : '' }}
            </span>
          </div>
          <button @click="closeResourceModal" class="p-1 rounded-full hover:bg-gray-100">
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div class="p-6">
          <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            <img :src="selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].image : ''" :alt="selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].title : ''" class="w-full h-full object-cover" />
          </div>
          
          <h1 class="text-2xl font-bold mb-4">{{ selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].title : '' }}</h1>
          
          <div class="prose max-w-none">
            <p v-html="selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].content : ''"></p>
          </div>
          
          <div class="mt-8 flex justify-between items-center pt-4 border-t">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].author : '' }}</p>
                <p class="text-xs text-gray-500">{{ selectedResourceIndex !== null ? educationalResources[selectedResourceIndex].authorTitle : '' }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button class="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <BookmarkIcon class="w-4 h-4 text-gray-600" />
              </button>
              <button class="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <ShareIcon class="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-lg font-medium mb-4">Related Resources</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="flex border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div class="w-16 h-16 bg-blue-50 flex-shrink-0">
                  <img :src="`/placeholder.svg?height=64&width=64`" alt="Related resource" class="w-full h-full object-cover" />
                </div>
                <div class="p-2 flex-1">
                  <h4 class="text-sm font-medium line-clamp-2">{{ i === 1 ? 'Common Health Issues in Pets' : 'Nutrition Guide for Pets' }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ i === 1 ? '4 min read' : '6 min read' }}</p>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  Phone as PhoneIcon,
  Plus as PlusIcon,
  User as UserIcon,
  X as XIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon
} from 'lucide-vue-next';
import CalendarComponent from './dashboard/Calendar.vue';

const router = useRouter();
const isResourceModalOpen = ref(false);
const selectedResourceIndex = ref(null);

// Educational Resources
const educationalResources = ref([
  {
    title: "How to Brush Your Dog's Teeth: A Step-by-Step Guide",
    image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nJTIwdGVldGh8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    tag: "Article",
    tagColor: "bg-blue-100",
    tagTextColor: "text-blue-600",
    duration: "5 min read",
    author: "Dr. Sarah Johnson",
    authorTitle: "Veterinary Dentist",
    content: `
      <h2>Introduction</h2>
      <p>Maintaining your dog's dental health is crucial for their overall well-being. Just like humans, dogs can suffer from plaque buildup, gum disease, and tooth decay. Regular brushing is one of the most effective ways to keep your dog's teeth clean and prevent dental issues.</p>
      
      <h2>Why Brush Your Dog's Teeth?</h2>
      <p>Dental disease affects up to 80% of dogs over the age of three. Poor dental hygiene can lead to:</p>
      <ul>
        <li>Bad breath</li>
        <li>Painful gums and teeth</li>
        <li>Tooth loss</li>
        <li>Bacterial infections that can spread to vital organs</li>
      </ul>
      
      <h2>What You'll Need</h2>
      <ul>
        <li>Dog-specific toothpaste (never use human toothpaste as it contains ingredients toxic to dogs)</li>
        <li>A dog toothbrush, finger brush, or soft children's toothbrush</li>
        <li>Treats for positive reinforcement</li>
        <li>Patience and a calm environment</li>
      </ul>
      
      <h2>Step 1: Get Your Dog Comfortable</h2>
      <p>Before you start brushing, spend a few days getting your dog used to having their mouth and teeth touched. Gently lift their lips and touch their teeth and gums with your finger. Reward them with praise and treats for staying calm.</p>
      
      <h2>Step 2: Introduce the Toothpaste</h2>
      <p>Let your dog taste a small amount of the toothpaste from your finger. Most dog toothpastes come in flavors like chicken or beef that dogs find appealing. This helps create a positive association with the toothpaste.</p>
    `
  },
  {
    title: "Common Cat Behaviors Explained",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    tag: "Video",
    tagColor: "bg-red-100",
    tagTextColor: "text-red-600",
    duration: "8 min watch",
    author: "Dr. Emily Chen",
    authorTitle: "Feline Behavior Specialist",
    content: `
      <h2>Understanding Your Cat's Behavior</h2>
      <p>Cats communicate primarily through body language and vocalizations. Learning to interpret these signals can help strengthen your bond with your feline friend and address any behavioral issues that may arise.</p>
      
      <div class="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
        <div class="text-center p-4">
          <p class="text-sm text-gray-500 mt-2">Video player placeholder</p>
        </div>
      </div>
      
      <h2>Common Cat Behaviors Decoded</h2>
      
      <h3>Purring</h3>
      <p>While purring often indicates contentment, cats may also purr when they're anxious, ill, or in pain. It's a self-soothing mechanism. Context is key to understanding what your cat's purr means.</p>
      
      <h3>Kneading</h3>
      <p>That rhythmic pushing of paws against soft surfaces is a behavior cats retain from kittenhood. Kittens knead their mother's belly to stimulate milk flow. When adult cats do this, it typically indicates comfort and contentment.</p>
    `
  },
  {
    title: "Puppy Vaccination Schedule: What You Need to Know",
    image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHVwcHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    tag: "Guide",
    tagColor: "bg-green-100",
    tagTextColor: "text-green-600",
    duration: "7 min read",
    author: "Dr. Michael Rodriguez",
    authorTitle: "Veterinary Immunologist",
    content: `
      <h2>Why Vaccinations Are Important</h2>
      <p>Vaccinations protect your puppy from several potentially fatal diseases. They work by stimulating the immune system to recognize and fight specific infections. Proper vaccination is one of the most important things you can do to give your puppy a healthy start in life.</p>
      
      <h2>Core Vaccines for All Puppies</h2>
      <p>The following vaccines are considered essential for all dogs, regardless of lifestyle or location:</p>
      
      <h3>Distemper</h3>
      <p>Canine distemper is a highly contagious viral disease that affects the respiratory, gastrointestinal, and nervous systems. It can be fatal, and those who survive often have permanent neurological damage.</p>
    `
  },
  {
    title: "Recognizing Signs of Pain in Your Pet",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2ljayUyMHBldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    tag: "FAQ",
    tagColor: "bg-purple-100",
    tagTextColor: "text-purple-600",
    duration: "4 min read",
    author: "Dr. Lisa Taylor",
    authorTitle: "Veterinary Pain Specialist",
    content: `
      <h2>Why Pain Recognition Matters</h2>
      <p>Our pets can't tell us when they're in pain, but they do communicate through behavioral and physical changes. Recognizing these signs early can lead to faster treatment and relief for your pet. Many pet owners are surprised to learn that animals instinctively hide their pain as a survival mechanism, making detection even more challenging.</p>
      
      <h2>Common Signs of Pain in Dogs</h2>
      
      <h3>Behavioral Changes</h3>
      <ul>
        <li><strong>Decreased activity:</strong> Reluctance to walk, climb stairs, jump, or play</li>
        <li><strong>Aggression:</strong> Growling, pinned ears, or biting when approached or touched</li>
        <li><strong>Vocalization:</strong> Whining, groaning, or crying, especially when moving</li>
      </ul>
    `
  }
]);

// Open resource modal
const isModalOpen = ref(false);

const openResourceModal = (index) => {
  selectedResourceIndex.value = index;
  isResourceModalOpen.value = true;
  isModalOpen.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

// Close resource modal
const closeResourceModal = () => {
  selectedResourceIndex.value = null;
  isResourceModalOpen.value = false;
  isModalOpen.value = false;
  document.body.style.overflow = ''; // Restore scrolling
};

// Navigate to educational resources page
const navigateToResources = () => {
  router.push('/user/educational-resources');
};

// Pets
const pets = ref([
  {
    name: "Max",
    image: "/placeholder.svg?height=128&width=128",
    breed: "Golden Retriever",
    age: "3 years",
    status: "Healthy",
    statusColor: "text-green-600",
    nextAppointment: "Oct 15"
  },
  {
    name: "Luna",
    image: "/placeholder.svg?height=128&width=128",
    breed: "Siamese Cat",
    age: "2 years",
    status: "Vaccination Due",
    statusColor: "text-yellow-600",
    nextAppointment: "Oct 8"
  },
  {
    name: "Charlie",
    image: "/placeholder.svg?height=128&width=128",
    breed: "Beagle",
    age: "5 years",
    status: "Medication",
    statusColor: "text-blue-600",
    nextAppointment: "Oct 22"
  }
]);
</script>

<style scoped>
/* Add any additional custom styles here */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* Add this standard property */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  color: #374151;
  max-width: 65ch;
  font-size: 1rem;
  line-height: 1.75;
}

.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.prose h2 {
  color: #111827;
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}

.prose h3 {
  color: #111827;
  font-weight: 600;
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
}

.prose ul {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
  list-style-type: disc;
}

.prose li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose strong {
  font-weight: 600;
  color: #111827;
}
</style>