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
            
            <!-- Loading state -->
            <div v-if="isLoading" class="flex justify-center items-center h-[90px]">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p class="mt-2 text-xs text-gray-600">Loading resources...</p>
              </div>
            </div>
            
            <!-- Resources grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div v-for="resource in displayedResources" :key="resource.id" 
                  class="flex border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-[90px]"
                  @click="openResourceModal(resource)">
                <div class="w-16 md:w-20 h-full bg-blue-100 flex-shrink-0">
                  <img 
                    v-if="resource.coverPhoto" 
                    :src="resource.coverPhoto" 
                    :alt="resource.name" 
                    class="w-full h-full object-cover" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-blue-100">
                    <FileIcon class="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div class="p-2 flex flex-col justify-between flex-1">
                  <div>
                    <div class="flex items-center mb-1">
                      <span :class="`text-[10px] px-1.5 py-0.5 rounded-full ${getTagColor(resource.type)}`">
                        {{ resource.type }}
                      </span>
                    </div>
                    <h3 class="text-xs font-medium text-gray-800 line-clamp-2">{{ resource.name }}</h3>
                  </div>
                  <div class="flex items-center text-[10px] text-gray-500">
                    <ClockIcon class="w-2.5 h-2.5 mr-1" />
                    <span>{{ getReadTime(resource.description) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Empty state if no resources -->
              <div v-if="displayedResources.length === 0" class="col-span-2 flex flex-col items-center justify-center py-4">
                <BookOpenIcon class="w-8 h-8 text-gray-300 mb-2" />
                <p class="text-xs text-gray-500">No resources available</p>
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
            
            <!-- Loading state for pets -->
            <div v-if="petsLoading" class="flex justify-center items-center h-[90px]">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p class="mt-2 text-xs text-gray-600">Loading pets...</p>
              </div>
            </div>
            <div v-else-if="petsError" class="text-center text-red-500">{{ petsError }}</div>
            <div v-else-if="pets.length === 0" class="col-span-2 flex flex-col items-center justify-center py-4">
              <BookOpenIcon class="w-8 h-8 text-gray-300 mb-2" />
              <p class="text-xs text-gray-500">No pets added yet. Add a pet to get started!</p>
            </div>
            <div v-else class="space-y-3">
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
                  
                  <!-- Expand/Collapse Button for Pet History -->
                  <div class="mt-3 pt-3 border-t border-gray-100">
                    <button 
                      @click="togglePetExpansion(pet.id)"
                      class="w-full px-3 py-2 rounded-lg transition-all duration-300 text-xs font-medium flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                      :class="{
                        'bg-blue-600 text-white hover:bg-blue-700 shadow-lg ring-2 ring-blue-300': expandedPet === pet.id,
                        'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 hover:border-blue-300': expandedPet !== pet.id
                      }"
                    >
                      <svg 
                        class="w-3 h-3 transition-all duration-300" 
                        :class="{ 'rotate-180 scale-110': expandedPet === pet.id }"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      <span class="transition-all duration-300">
                        {{ expandedPet === pet.id ? 'Hide History' : 'View History' }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Pet History Timeline - Show only when expanded -->
                <div v-if="expandedPet === pet.id" class="px-2 pb-2">
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3">
                    <div class="flex items-center gap-2 mb-3">
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <h4 class="text-xs font-semibold text-blue-900">
                        {{ pet.name }}'s Appointment History
                      </h4>
                      <span class="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                        Expanded
                      </span>
                    </div>
                    
                    <div class="relative">
                      <!-- Timeline Line -->
                      <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                      
                      <!-- Timeline Items -->
                      <div class="space-y-3">
                        <div 
                          v-for="(appointment, aptIndex) in getPetAppointments(pet.id)" 
                          :key="appointment.id"
                          class="relative pl-8"
                        >
                          <!-- Timeline Dot -->
                          <div class="absolute left-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                               :class="{
                                 'bg-green-500': appointment.status === 'completed',
                                 'bg-yellow-500': appointment.status === 'pending',
                                 'bg-blue-500': appointment.status === 'approved',
                                 'bg-red-500': appointment.status === 'cancelled'
                               }">
                            <div class="w-1 h-1 rounded-full bg-white"></div>
                          </div>
                          
                          <!-- Timeline Content -->
                          <div class="bg-white rounded-lg border border-gray-200 p-2 hover:shadow-sm transition-shadow">
                            <div class="flex items-start justify-between mb-2">
                              <div class="flex-1">
                                <h5 class="text-[10px] font-medium text-gray-900 line-clamp-2">
                                  {{ appointment.serviceNames ? appointment.serviceNames.join(', ') : 'Appointment' }}
                                </h5>
                                <p class="text-[8px] text-gray-500">{{ formatAppointmentDate(appointment.date) }}</p>
                                <p class="text-[8px] text-gray-500">{{ appointment.time || '' }}</p>
                              </div>
                              <div class="ml-2">
                                <span class="px-1.5 py-0.5 text-[8px] font-medium rounded-full" 
                                      :class="{
                                        'bg-green-100 text-green-700': appointment.status === 'completed',
                                        'bg-yellow-100 text-yellow-700': appointment.status === 'pending',
                                        'bg-blue-100 text-blue-700': appointment.status === 'approved',
                                        'bg-red-100 text-red-700': appointment.status === 'cancelled'
                                      }">
                                  {{ appointment.status }}
                                </span>
                              </div>
                            </div>
                            
                            <!-- Doctor Info -->
                            <div v-if="appointment.doctorName" class="text-[8px] text-gray-600 border-t border-gray-100 pt-1 mt-1">
                              Dr. {{ appointment.doctorName }}
                            </div>
                          </div>
                        </div>
                        
                        <!-- Empty State -->
                        <div v-if="!getPetAppointments(pet.id).length" 
                             class="text-center py-4 text-gray-500">
                          <div class="w-8 h-8 mx-auto mb-2 text-gray-300">
                            <CalendarIcon class="w-full h-full" />
                          </div>
                          <p class="text-[10px]">No appointment history found for this pet.</p>
                        </div>
                      </div>
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
    <div v-if="isResourceModalOpen && selectedResource" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <div class="flex items-center">
            <span :class="`px-2 py-0.5 rounded-full text-xs ${getTagColor(selectedResource.type)}`">
              {{ selectedResource.type }}
            </span>
            <span class="text-xs text-gray-500 ml-2 flex items-center">
              <ClockIcon class="w-3 h-3 mr-1" />
              {{ getReadTime(selectedResource.description) }}
            </span>
          </div>
          <button @click="closeResourceModal" class="p-1 rounded-full hover:bg-gray-100">
            <XIcon class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div class="p-6">
          <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
            <img 
              v-if="selectedResource.coverPhoto" 
              :src="selectedResource.coverPhoto" 
              :alt="selectedResource.name" 
              class="w-full h-full object-cover" 
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-blue-100">
              <FileIcon class="w-16 h-16 text-blue-500" />
            </div>
          </div>
          
          <h1 class="text-2xl font-bold mb-4">{{ selectedResource.name }}</h1>
          
          <div class="prose max-w-none">
            <p v-if="selectedResource.description" v-html="formatDescription(selectedResource.description)"></p>
            <p v-else class="text-gray-500 italic">No description available</p>
          </div>
          
          <div class="mt-8 flex justify-between items-center pt-4 border-t">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-blue-600" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">{{ getCategoryName(selectedResource.categoryId) }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(selectedResource.createdAt) }}</p>
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
          
          <div class="mt-8" v-if="relatedResources.length > 0">
            <h3 class="text-lg font-medium mb-4">Related Resources</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                v-for="resource in relatedResources" 
                :key="resource.id" 
                class="flex border rounded-lg overflow-hidden hover:shadow-sm transition-shadow cursor-pointer"
                @click="openResourceModal(resource)"
              >
                <div class="w-16 h-16 bg-blue-50 flex-shrink-0">
                  <img 
                    v-if="resource.coverPhoto" 
                    :src="resource.coverPhoto" 
                    :alt="resource.name" 
                    class="w-full h-full object-cover" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-blue-100">
                    <FileIcon class="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div class="p-2 flex-1">
                  <h4 class="text-sm font-medium line-clamp-2">{{ resource.name }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ getReadTime(resource.description) }}</p>
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
import { useRouter } from 'vue-router';
import { useResourceCategoryStore } from '@/stores/modules/ResourceCategoryStore';
import { storeToRefs } from 'pinia';
import { 
  Clock as ClockIcon, 
  Calendar as CalendarIcon, 
  Phone as PhoneIcon,
  Plus as PlusIcon,
  User as UserIcon,
  X as XIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  BookOpen as BookOpenIcon,
  File as FileIcon
} from 'lucide-vue-next';
import CalendarComponent from './dashboard/Calendar.vue';
import { useAuthStore } from '@/stores/modules/authStore';
import { usePetsStore } from '@/stores/modules/petsStore';

const router = useRouter();

// Initialize the store
const resourceCategoryStore = useResourceCategoryStore();
const authStore = useAuthStore();

// Use storeToRefs to maintain reactivity when destructuring store state
const { 
  resourceCategories, // Using resourceCategories instead of categories
  resources, 
  loading: storeLoading, 
  error: storeError 
} = storeToRefs(resourceCategoryStore);

const isResourceModalOpen = ref(false);
const selectedResource = ref(null);
const relatedResources = ref([]);
const isLoading = computed(() => storeLoading.value);

// Fetch resources on component mount
onMounted(async () => {
  try {
    await resourceCategoryStore.fetchResourceCategories(); // Using fetchResourceCategories instead of fetchCategories
    await resourceCategoryStore.fetchResources();
  } catch (error) {
    console.error('Error fetching resources:', error);
  }
});

// Get only the first 4 resources for display
const displayedResources = computed(() => {
  if (!resources.value) return [];
  return resources.value.slice(0, 4);
});

// Pets
const pets = ref([])
const petsLoading = ref(false)
const petsError = ref(null)
const expandedPet = ref(null) // Track which pet is expanded
const appointments = ref([]) // Store user appointments

// Fetch real pets data
const fetchPets = async () => {
  if (!authStore.user?.userId) return
  
  petsLoading.value = true
  petsError.value = null
  
  try {
    // Use the pets store to fetch real data
    const petsStore = usePetsStore()
    await petsStore.fetchUserPets(authStore.user.userId)
    
    // Get the fetched pets and format them for display
    const userPets = petsStore.getPets
    pets.value = userPets.map(pet => ({
      id: pet.id,
      name: pet.name || 'Unnamed Pet',
      image: pet.photoURL || '/placeholder.svg?height=128&width=128',
      breed: pet.breed || 'Unknown Breed',
      age: formatPetAge(pet),
      status: getPetStatus(pet),
      statusColor: getPetStatusColor(pet),
      nextAppointment: getNextAppointment(pet)
    }))
    
    // Also fetch appointments for the timeline
    await fetchUserAppointments()
  } catch (error) {
    console.error('Error fetching pets:', error)
    petsError.value = 'Failed to load pets'
    pets.value = []
  } finally {
    petsLoading.value = false
  }
}

// Fetch user appointments for timeline
const fetchUserAppointments = async () => {
  if (!authStore.user?.userId) return
  
  try {
    // Import Firebase functions
    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore')
    const { db } = await import('@shared/firebase')
    
    // Query appointments collection by userId
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef, 
      where('userId', '==', authStore.user.userId),
      orderBy('date', 'desc') // Most recent first
    )
    const querySnapshot = await getDocs(q)
    
    const appointmentsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    appointments.value = appointmentsData
    console.log('Fetched user appointments for timeline:', appointmentsData)
  } catch (error) {
    console.error('Error fetching appointments for timeline:', error)
    appointments.value = []
  }
}

// Helper functions for pet data formatting
const formatPetAge = (pet) => {
  if (pet.ageYears && pet.ageYears > 0) {
    return `${pet.ageYears} ${pet.ageYears === 1 ? 'year' : 'years'}`
  } else if (pet.ageMonths && pet.ageMonths > 0) {
    return `${pet.ageMonths} ${pet.ageMonths === 1 ? 'month' : 'months'}`
  } else if (pet.ageWeeks && pet.ageWeeks > 0) {
    return `${pet.ageWeeks} ${pet.ageWeeks === 1 ? 'week' : 'weeks'}`
  }
  return 'Age not specified'
}

const getPetStatus = (pet) => {
  // You can implement more sophisticated status logic here
  // For now, return a basic status
  if (pet.healthStatus) {
    return pet.healthStatus
  }
  return 'Healthy'
}

const getPetStatusColor = (pet) => {
  const status = getPetStatus(pet)
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'text-green-600'
    case 'vaccination due':
      return 'text-yellow-600'
    case 'medication':
      return 'text-blue-600'
    case 'treatment':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

const getNextAppointment = (pet) => {
  // Find the next appointment for this pet
  if (!appointments.value || appointments.value.length === 0) return 'No upcoming'
  
  const now = new Date()
  const futureAppointments = appointments.value.filter(apt => {
    const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date)
    return apt.petIds && apt.petIds.includes(pet.id) && aptDate > now && apt.status === 'approved'
  })
  
  if (futureAppointments.length === 0) return 'No upcoming'
  
  // Sort by date and get the next one
  const nextAppointment = futureAppointments.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date)
    const dateB = b.date instanceof Date ? b.date : new Date(b.date)
    return dateA - dateB
  })[0]
  
  const aptDate = nextAppointment.date instanceof Date ? nextAppointment.date : new Date(nextAppointment.date)
  return aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Pet expansion functionality
const togglePetExpansion = (petId) => {
  if (expandedPet.value === petId) {
    expandedPet.value = null
  } else {
    expandedPet.value = petId
  }
}

// Get appointments for a specific pet
const getPetAppointments = (petId) => {
  if (!appointments.value || appointments.value.length === 0) return []
  
  // Filter appointments for this specific pet
  return appointments.value.filter(apt => 
    apt.petIds && apt.petIds.includes(petId)
  ).sort((a, b) => {
    // Sort by date, most recent first
    const dateA = a.date instanceof Date ? a.date : new Date(a.date)
    const dateB = b.date instanceof Date ? b.date : new Date(b.date)
    return dateB - dateA
  })
}

// Format appointment date for display
const formatAppointmentDate = (date) => {
  if (!date) return 'No date'
  
  try {
    const appointmentDate = date instanceof Date ? date : new Date(date)
    return appointmentDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Fetch pets when component mounts
onMounted(() => {
  fetchPets()
})

// Helper functions
const typeColors = {
    'Document': 'bg-blue-100 text-blue-600',
    'Video': 'bg-red-100 text-red-600',
    'Audio': 'bg-purple-100 text-purple-600',
    'Image': 'bg-green-100 text-green-600',
    'Other': 'bg-gray-100 text-gray-600'
  };

function getTagColor(type) {
  return typeColors[type] || 'bg-gray-100 text-gray-600';
}

function getReadTime(text) {
  if (!text) return '1 min read';
  
  // Average reading speed: 200 words per minute
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  
  return `${minutes} min read`;
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatDescription(description) {
  if (!description) return '';
  
  // Convert line breaks to paragraphs
  return description
    .split('\n')
    .filter(paragraph => paragraph.trim() !== '')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
}

function getCategoryName(categoryId) {
  if (!resourceCategories.value) return 'Unknown Category'; // Using resourceCategories instead of categories
  
  const category = resourceCategories.value.find(c => c.id === categoryId); // Using resourceCategories instead of categories
  return category ? category.name : 'Unknown Category';
}

// Open resource modal
function openResourceModal(resource) {
  selectedResource.value = resource;
  isResourceModalOpen.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  
  // Find related resources (same category, excluding current resource)
  if (resources.value) {
    relatedResources.value = resources.value
      .filter(r => r.categoryId === resource.categoryId && r.id !== resource.id)
      .slice(0, 2); // Limit to 2 related resources
  }
}

// Close resource modal
function closeResourceModal() {
  selectedResource.value = null;
  isResourceModalOpen.value = false;
  document.body.style.overflow = ''; // Restore scrolling
}
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

