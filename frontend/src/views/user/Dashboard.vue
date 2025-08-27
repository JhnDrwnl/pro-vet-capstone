<!-- views/user/Dashboard.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50 -mt-4 md:mt-0">
    <!-- Main content area with adjusted padding for mobile -->
    <div class="flex flex-col flex-1 px-0 md:px-4 pb-20 pt-14 md:pt-0 md:pb-4">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
        <!-- Left Column (3/4 width on large screens) -->
        <div class="lg:col-span-3 flex flex-col gap-3 md:gap-4">
          <!-- Welcome Banner - Enhanced with stats -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-4 md:p-6 flex items-center justify-between overflow-hidden relative h-[140px] md:h-[180px] flex-shrink-0">
            <div class="text-white z-10 max-w-[60%]">
              <h1 class="text-xl md:text-2xl font-bold mb-2 md:mb-3">Welcome to ProVET!</h1>
              <p class="text-sm md:text-base text-blue-100 mb-3 md:mb-4">Track your pet's health, manage appointments, and get reminders for vaccinations.</p>
              <div class="flex gap-3">
                <router-link 
                  to="/user/userappointments" 
                  class="bg-white text-blue-600 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors inline-flex items-center"
                >
                  Book Appointment
                </router-link>
                <router-link 
                  to="/user/pets" 
                  class="bg-blue-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-medium hover:bg-blue-400 transition-colors inline-flex items-center"
                >
                  Manage Pets
                </router-link>
              </div>
            </div>
            <div class="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end">
              <img src="/src/assets/media/images/common/banner.png" 
                  alt="Veterinarian with dog illustration" 
                  class="h-full object-contain" />
            </div>
          </div>

          <!-- Quick Stats Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <CalendarIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Today's Appointments</p>
                  <p class="text-2xl font-bold text-gray-900">{{ todayAppointmentsCount }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-green-50">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <HeartIcon class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Active Pets</p>
                  <p class="text-2xl font-bold text-gray-900">{{ pets.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-purple-50">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <BookOpenIcon class="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p class="text-sm text-gray-600">Resources Available</p>
                  <p class="text-2xl font-bold text-gray-900">{{ displayedResources.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- My Pets - Enhanced with better layout -->
          <div class="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-blue-50">
            <div class="flex justify-between items-center mb-4 md:mb-6">
              <div>
                <h2 class="text-lg md:text-xl font-semibold text-gray-800">My Pets</h2>
                <p class="text-sm text-gray-600 mt-1">Manage your pets and view their health status</p>
              </div>
              <router-link 
                to="/user/pets" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Pet 
              </router-link>
            </div>
            
            <!-- Loading state for pets -->
            <div v-if="petsLoading" class="flex justify-center items-center h-[120px]">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p class="mt-2 text-sm text-gray-600">Loading pets...</p>
              </div>
            </div>
            <div v-else-if="petsError" class="text-center text-red-500">{{ petsError }}</div>
            <div v-else-if="pets.length === 0" class="text-center py-12">
              <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon class="w-10 h-10 text-blue-400" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No pets added yet</h3>
              <p class="text-gray-500 mb-6">Add your first pet to get started with ProVET services.</p>
              <router-link 
                to="/user/pets" 
                class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Your First Pet
              </router-link>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(pet, index) in pets" :key="index" 
                  class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div class="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 relative overflow-hidden">
                  <img v-if="pet.image" :src="pet.image" :alt="pet.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <HeartIcon class="w-16 h-16 text-blue-300" />
                  </div>
                  <div class="absolute bottom-3 left-3">
                    <span class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
                      {{ pet.age }}
                    </span>
                  </div>
                </div>
                <div class="p-4">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ pet.name }}</h3>
                      <p class="text-sm text-gray-600">{{ pet.breed }} • {{ pet.species }}</p>
                      <p class="text-xs text-gray-500">{{ pet.age }} • {{ pet.weight }}kg</p>
                    </div>
                    <div class="text-right">
                      <!-- Next Visit section removed -->
                    </div>
                  </div>
                  
                  <div class="flex gap-2 mb-4">
                    <router-link 
                      :to="`/user/pets?id=${pet.id}`"
                      class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </router-link>
                    <router-link 
                      to="/user/userappointments" 
                      class="flex-1 bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors border border-blue-200 text-center"
                    >
                      Book Visit
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Educational Resources - Enhanced -->
          <div class="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-blue-50">
            <div class="flex justify-between items-center mb-4 md:mb-6">
              <div>
                <h2 class="text-lg md:text-xl font-semibold text-gray-800">Educational Resources</h2>
                <p class="text-sm text-gray-600 mt-1">Learn more about pet care and health</p>
              </div>
              <router-link to="/user/educational-resources" class="text-blue-600 text-sm font-medium hover:text-blue-700">View All</router-link>
            </div>
            
            <!-- Loading state -->
            <div v-if="isLoading" class="flex justify-center items-center h-[120px]">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p class="mt-2 text-sm text-gray-600">Loading resources...</p>
              </div>
            </div>
            
            <!-- Resources grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="resource in displayedResources" :key="resource.id" 
                  class="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-[140px]"
                  @click="openResourceModal(resource)">
                <div class="h-20 bg-gradient-to-r from-blue-100 to-indigo-100 flex-shrink-0 relative">
                  <img 
                    v-if="resource.coverPhoto" 
                    :src="resource.coverPhoto" 
                    :alt="resource.name" 
                    class="w-full h-full object-cover" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <FileIcon class="w-8 h-8 text-blue-400" />
                  </div>
                  <div class="absolute top-2 left-2">
                    <span :class="`px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm ${getTagColor(resource.type)}`">
                      {{ resource.type }}
                    </span>
                  </div>
                </div>
                <div class="p-3">
                  <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{{ resource.name }}</h3>
                  <div class="flex items-center text-xs text-gray-500">
                    <ClockIcon class="w-3 h-3 mr-1" />
                    <span>{{ getReadTime(resource.description) }} min read</span>
                  </div>
                </div>
              </div>
              
              <!-- Empty state if no resources -->
              <div v-if="displayedResources.length === 0" class="col-span-full text-center py-8">
                <BookOpenIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">No resources available at the moment.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (1/4 width on large screens) -->
        <div class="flex flex-col gap-3 md:gap-4">
          <!-- Calendar Component -->
          <div class="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
            <CalendarComponent />
          </div>

          <!-- Queue Position Component -->
          <QueuePosition />

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <router-link 
                to="/user/userappointments" 
                class="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                  <CalendarIcon class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div class="font-medium text-gray-800">Book Appointment</div>
                  <div class="text-xs text-gray-600">Schedule a visit</div>
                </div>
              </router-link>
              
              <router-link 
                to="/user/pets" 
                class="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                  <HeartIcon class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div class="font-medium text-gray-800">Manage Pets</div>
                  <div class="text-xs text-gray-600">Update pet info</div>
                </div>
              </router-link>
              
              <router-link 
                to="/user/educational-resources" 
                class="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                  <BookOpenIcon class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div class="font-medium text-gray-800">Learn More</div>
                  <div class="text-xs text-gray-600">Educational content</div>
                </div>
              </router-link>
            </div>
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
              {{ getReadTime(selectedResource.description) }} min read
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
                  <div v-else class="w-16 h-16 flex items-center justify-center bg-blue-100">
                    <FileIcon class="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div class="p-2 flex-1">
                  <h4 class="text-sm font-medium line-clamp-2">{{ resource.name }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ getReadTime(resource.description) }} min read</p>
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
  File as FileIcon,
  Heart as HeartIcon
} from 'lucide-vue-next';
import CalendarComponent from './dashboard/Calendar.vue';
import { useAuthStore } from '@/stores/modules/authStore';
import { usePetsStore } from '@/stores/modules/petsStore';
import QueuePosition from '@/components/user/QueuePosition.vue';

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
const isLoading = computed(() => storeLoading.value);

// Computed properties
const displayedResources = computed(() => {
  return resources.value.slice(0, 6); // Show only 6 resources
});

const relatedResources = computed(() => {
  if (!selectedResource.value) return [];
  return resources.value
    .filter(r => r.id !== selectedResource.value.id && r.categoryId === selectedResource.value.categoryId)
    .slice(0, 3);
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
      // nextAppointment removed
      lastVisit: getLastVisitDate(pet.id),
      vaccinationCount: getVaccinationCount(pet),
      species: pet.species,
      weight: pet.weight,
      medicalHistory: pet.medicalHistory || [],
      vaccinations: pet.vaccinations || []
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
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('userId', '==', authStore.user.userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    appointments.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log('Fetched appointments:', appointments.value)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    appointments.value = []
  }
}

// Helper functions for pet data
const formatPetAge = (pet) => {
  const parts = []
  if (pet.ageYears > 0) parts.push(`${pet.ageYears}y`)
  if (pet.ageMonths > 0) parts.push(`${pet.ageMonths}m`)
  if (pet.ageWeeks > 0) parts.push(`${pet.ageWeeks}w`)
  
  if (parts.length === 0) return 'Age not specified'
  return parts.join(' ')
}

const getPetStatus = (pet) => {
  // Check if pet has recent medical activity (appointments, medical history, or vaccinations)
  const hasRecentAppointments = appointments.value.some(apt => 
    apt.petIds && apt.petIds.includes(pet.id) && 
    apt.status === 'completed' &&
    new Date(apt.completedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  )
  
  const hasMedicalHistory = pet.medicalHistory && pet.medicalHistory.length > 0
  const hasVaccinations = pet.vaccinations && pet.vaccinations.length > 0
  
  if (hasRecentAppointments || hasMedicalHistory || hasVaccinations) {
    return 'active'
  }
  return 'inactive'
}

const getPetStatusColor = (pet) => {
  const status = getPetStatus(pet)
  const colors = {
    'active': 'text-green-700 bg-green-100',
    'inactive': 'text-gray-700 bg-gray-100'
  }
  return colors[status] || 'text-gray-700 bg-gray-100'
}

// getNextAppointment function removed

const getVaccinationCount = (pet) => {
  // Use the actual vaccinations array from the pet object
  if (pet.vaccinations && Array.isArray(pet.vaccinations)) {
    return pet.vaccinations.length.toString()
  }
  return '0'
}

const getLastVisitDate = (petId) => {
  const completedAppointments = appointments.value.filter(apt => 
    apt.petIds && apt.petIds.includes(petId) && 
    apt.status === 'completed'
  )
  
  if (completedAppointments.length === 0) return 'No visits yet'
  
  // Sort by completion date and get the most recent
  const lastVisit = completedAppointments.sort((a, b) => 
    new Date(b.completedAt) - new Date(a.completedAt)
  )[0]
  
  return formatDate(lastVisit.completedAt)
}

// Update todayAppointmentsCount to use real data
const todayAppointmentsCount = computed(() => {
  if (!appointments.value.length) return 0
  
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  
  return appointments.value.filter(apt => {
    const aptDate = new Date(apt.date)
    return aptDate >= startOfDay && aptDate <= endOfDay && apt.status === 'approved'
  }).length
})

// Fetch resources on component mount
onMounted(async () => {
  try {
    await resourceCategoryStore.fetchResourceCategories();
    await resourceCategoryStore.fetchResources();
    await fetchPets(); // Fetch pets and appointments
  } catch (error) {
    console.error('Error fetching resources:', error);
  }
});

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

// Helper functions
const typeColors = {
    'Document': 'bg-blue-100 text-blue-600',
    'Video': 'bg-red-100 text-red-600',
    'Audio': 'bg-purple-100 text-purple-600',
    'Image': 'bg-green-100 text-green-600',
    'Other': 'bg-gray-100 text-gray-600'
  };

// Open resource modal
function openResourceModal(resource) {
  selectedResource.value = resource;
  isResourceModalOpen.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Close resource modal
function closeResourceModal() {
  selectedResource.value = null;
  isResourceModalOpen.value = false;
  document.body.style.overflow = ''; // Restore scrolling
}

const getTagColor = (type) => {
  const colors = {
    'Article': 'bg-blue-100 text-blue-700',
    'Video': 'bg-green-100 text-green-700',
    'Guide': 'bg-purple-100 text-purple-700',
    'Infographic': 'bg-orange-100 text-orange-700'
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

const getReadTime = (description) => {
  if (!description) return 2;
  const wordCount = description.split(' ').length;
  return Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed
};

const getCategoryName = (categoryId) => {
  const category = resourceCategories.value.find(cat => cat.id === categoryId);
  return category ? category.name : 'General';
};

const formatDate = (date) => {
  if (!date) return 'Unknown date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDescription = (description) => {
  if (!description) return '';
  return description.replace(/\n/g, '<br>');
};

const getStatusColor = (status) => {
  const colors = {
    'active': 'text-green-700 bg-green-100',
    'inactive': 'text-gray-700 bg-gray-100',
    'pending': 'text-yellow-700 bg-yellow-100',
    'suspended': 'text-red-700 bg-red-100'
  };
  return colors[status] || 'text-gray-700 bg-gray-100';
};
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

