<!-- views/user/dashboard/EducationalResources.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3 px-4">
      <h1 class="text-lg font-bold text-gray-800">Educational Resources</h1>
      <router-link to="/user/dashboard" class="text-blue-600 text-xs font-medium flex items-center">
        <ArrowLeftIcon class="w-3.5 h-3.5 mr-1" />
        Back
      </router-link>
    </div>

    <!-- Resource Categories -->
    <div class="flex overflow-x-auto pb-2 mb-3 gap-1 hide-scrollbar px-4">
      <button 
        v-for="category in categories" 
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="[
          'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0',
          selectedCategory === category.id 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Search Bar -->
    <div class="relative mb-3 px-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search resources..."
        class="w-full px-3 py-2 pl-8 bg-gray-100 rounded-lg text-xs"
      />
      <SearchIcon class="absolute left-7 top-2.5 text-gray-400 w-3.5 h-3.5" />
    </div>

    <!-- Resources List -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
      <div v-for="(resource, index) in filteredResources" :key="index" 
          class="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
          @click="openResource(index)">
        <div class="w-full aspect-video bg-blue-50 flex-shrink-0">
          <img :src="resource.image" :alt="resource.title" class="w-full h-full object-cover" />
        </div>
        <div class="p-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div class="flex items-center mb-2">
              <span :class="`text-xs px-2 py-0.5 rounded-full ${resource.tagColor} ${resource.tagTextColor}`">
                {{ resource.tag }}
              </span>
              <span class="text-xs text-gray-500 ml-2 flex items-center">
                <ClockIcon class="w-3 h-3 mr-0.5" />
                {{ resource.duration }}
              </span>
            </div>
            <h3 class="text-base font-medium text-gray-800 line-clamp-2 mb-2">{{ resource.title }}</h3>
            <p v-if="resource.excerpt" class="text-xs text-gray-600 line-clamp-2 mb-3">{{ resource.excerpt }}</p>
          </div>
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon class="w-4 h-4 text-blue-600" />
            </div>
            <div class="ml-2">
              <p class="text-xs font-medium">{{ resource.author }}</p>
              <p class="text-[10px] text-gray-500">{{ resource.authorTitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredResources.length === 0" class="text-center py-8 px-4">
      <BookOpenIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <h3 class="text-sm font-medium text-gray-800 mb-1">No resources found</h3>
      <p class="text-xs text-gray-500">Try adjusting your search or filter criteria</p>
    </div>

    <!-- Resource Modal - Updated to match dashboard style -->
    <div v-if="selectedResource !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <div class="flex items-center">
            <span :class="`px-2 py-0.5 rounded-full text-xs ${educationalResources[selectedResource].tagColor} ${educationalResources[selectedResource].tagTextColor}`">
              {{ educationalResources[selectedResource].tag }}
            </span>
            <span class="text-xs text-gray-500 ml-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              {{ educationalResources[selectedResource].duration }}
            </span>
          </div>
          <button @click="closeResource" class="p-1 rounded-full hover:bg-gray-100">
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div class="p-6">
          <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            <img :src="educationalResources[selectedResource].image" :alt="educationalResources[selectedResource].title" class="w-full h-full object-cover" />
          </div>
          
          <h1 class="text-2xl font-bold mb-4">{{ educationalResources[selectedResource].title }}</h1>
          
          <div class="prose max-w-none">
            <p v-html="educationalResources[selectedResource].content"></p>
          </div>
          
          <div class="mt-8 flex justify-between items-center pt-4 border-t">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ educationalResources[selectedResource].author }}</p>
                <p class="text-xs text-gray-500">{{ educationalResources[selectedResource].authorTitle }}</p>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  Clock as ClockIcon,
  User as UserIcon,
  X as XIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  BookOpen as BookOpenIcon
} from 'lucide-vue-next';

const route = useRoute();
const selectedResource = ref(null);
const searchQuery = ref('');
const selectedCategory = ref('all');

// Check if we have a resourceId param from the router
onMounted(() => {
  if (route.params.resourceId) {
    selectedResource.value = parseInt(route.params.resourceId);
  }
});

const categories = [
  { id: 'all', name: 'All Resources' },
  { id: 'article', name: 'Articles' },
  { id: 'video', name: 'Videos' },
  { id: 'guide', name: 'Guides' },
  { id: 'faq', name: 'FAQs' }
];

// Educational Resources
const educationalResources = [
  {
    title: "How to Brush Your Dog's Teeth: A Step-by-Step Guide",
    image: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nJTIwdGVldGh8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    tag: "Article",
    tagColor: "bg-blue-100",
    tagTextColor: "text-blue-600",
    duration: "5 min read",
    author: "Dr. Sarah Johnson",
    authorTitle: "Veterinary Dentist",
    excerpt: "Learn the proper technique for brushing your dog's teeth to maintain their dental health and prevent common issues.",
    content: `
      <h2 class="text-sm font-bold mt-4 mb-2">Introduction</h2>
      <p>Maintaining your dog's dental health is crucial for their overall well-being. Just like humans, dogs can suffer from plaque buildup, gum disease, and tooth decay.</p>
      
      <h2 class="text-sm font-bold mt-4 mb-2">Why Brush Your Dog's Teeth?</h2>
      <p>Dental disease affects up to 80% of dogs over the age of three. Poor dental hygiene can lead to:</p>
      <ul class="list-disc pl-5 my-2">
        <li>Bad breath</li>
        <li>Painful gums and teeth</li>
        <li>Tooth loss</li>
        <li>Bacterial infections</li>
      </ul>
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
    excerpt: "Understand why cats do what they do, from kneading and purring to bringing you 'gifts' and sudden bursts of energy.",
    content: `
      <h2 class="text-sm font-bold mt-4 mb-2">Understanding Your Cat's Behavior</h2>
      <p>Cats communicate primarily through body language and vocalizations. Learning to interpret these signals can help strengthen your bond with your feline friend.</p>
      
      <div class="aspect-video bg-gray-100 rounded-lg my-3 flex items-center justify-center">
        <div class="text-center p-2">
          <p class="text-xs text-gray-500">Video player placeholder</p>
        </div>
      </div>
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
    excerpt: "A comprehensive guide to puppy vaccinations, including which vaccines are essential, when to get them, and what to expect.",
    content: `
      <h2 class="text-sm font-bold mt-4 mb-2">Why Vaccinations Are Important</h2>
      <p>Vaccinations protect your puppy from several potentially fatal diseases. They work by stimulating the immune system to recognize and fight specific infections.</p>
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
    excerpt: "Learn to identify subtle signs that your pet might be in pain, and know when it's time to seek veterinary care.",
    content: `
      <h2 class="text-sm font-bold mt-4 mb-2">Why Pain Recognition Matters</h2>
      <p>Our pets can't tell us when they're in pain, but they do communicate through behavioral and physical changes.</p>
    `
  },
  {
    title: "Nutrition Basics for Senior Pets",
    image: "https://images.unsplash.com/photo-1518155317743-a8ff43ea6a5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2xkJTIwZG9nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    tag: "Article",
    tagColor: "bg-blue-100",
    tagTextColor: "text-blue-600",
    duration: "6 min read",
    author: "Dr. James Wilson",
    authorTitle: "Veterinary Nutritionist",
    excerpt: "As pets age, their nutritional needs change. Learn how to adapt your pet's diet to support their health in their golden years.",
    content: `
      <h2 class="text-sm font-bold mt-4 mb-2">Changing Nutritional Needs</h2>
      <p>As pets enter their senior years, their metabolism slows down, activity levels decrease, and they become more susceptible to certain health conditions.</p>
    `
  },
  {
    title: "How to Safely Introduce a New Pet to Your Home",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nJTIwYW5kJTIwY2F0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    tag: "Guide",
    tagColor: "bg-green-100",
    tagTextColor: "text-green-600",
    duration: "8 min read",
    author: "Dr. Amanda Lopez",
    authorTitle: "Animal Behaviorist",
    excerpt: "Bringing a new pet home requires careful planning, especially if you already have pets. Follow these steps for a smooth transition.",
    content: `
      <h2 class="text-sm font-bold mt-4 mb-2">Preparation is Key</h2>
      <p>Before bringing your new pet home, make sure you have all the necessary supplies and have prepared a safe space for them to adjust to their new environment.</p>
    `
  }
];

const openResource = (index) => {
  selectedResource.value = index;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

const closeResource = () => {
  selectedResource.value = null;
  document.body.style.overflow = ''; // Restore scrolling
};

const filteredResources = computed(() => {
  let resources = [...educationalResources];
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    resources = resources.filter(resource => 
      resource.tag.toLowerCase() === selectedCategory.value
    );
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    resources = resources.filter(resource => 
      resource.title.toLowerCase().includes(query) || 
      (resource.excerpt && resource.excerpt.toLowerCase().includes(query))
    );
  }
  
  return resources;
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2; /* Add this standard property */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
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