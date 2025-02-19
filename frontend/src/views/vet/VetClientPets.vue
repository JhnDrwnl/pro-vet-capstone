<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8">
    <ProfileDetails 
      v-if="showProfileDetails" 
      :profile="selectedProfile"
      @back="showProfileDetails = false"
    />
    <CreateProfile
      v-else-if="showCreateProfile"
      @save="handleSaveNewProfile"
      @cancel="showCreateProfile = false"
    />
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div class="flex items-center gap-2">
          <span class="text-gray-400 text-sm">List /</span>
          <span class="text-blue-600 font-medium">Profile</span>
        </div>
        <button 
          @click="handleCreateNew"
          class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm"
        >
          <PlusIcon class="w-4 h-4" />
          Create New
        </button>
      </div>

      <!-- Search and Actions -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div class="relative flex items-center gap-2 w-full lg:w-96">
          <div class="relative flex-1">
            <SearchIcon class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search profiles"
              class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            >
          </div>
          <button 
            @click="toggleFilter"
            class="p-1.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <FilterIcon class="w-3.5 h-3.5" />
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button 
            @click="handleImport"
            class="flex items-center gap-1.5 text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <UploadIcon class="w-3.5 h-3.5" />
            Export
          </button>
          <button 
            @click="handleEditMultiple"
            class="flex items-center gap-1.5 text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            <Edit class="w-3.5 h-3.5" />
            {{ isEditMode ? 'Unselect' : 'Select' }}
          </button>
          <div class="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              @click="viewMode = 'list'"
              :class="[
                'px-2 py-1.5 transition-colors duration-200',
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              <ListIcon class="w-3.5 h-3.5" />
            </button>
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'px-2 py-1.5 transition-colors duration-200',
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              <LayoutGridIcon class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="relative">
            <button 
              @click="toggleSortMenu"
              class="flex items-center gap-1.5 text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
            >
              <ArrowDownIcon class="w-3.5 h-3.5" />
              Sort by
            </button>
            <div v-if="showSortMenu" class="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button 
                v-for="option in sortOptions" 
                :key="option.value"
                @click="handleSort(option.value)"
                class="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Menu -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showFilterMenu" class="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filter Profiles</h3>
          
          <!-- Status Filter -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Status</h4>
            <div class="space-y-2">
              <label v-for="status in ['Accepted', 'Pending', 'Canceled']" :key="status" class="flex items-center">
                <input
                  type="checkbox"
                  :value="status"
                  v-model="filters.status"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-600">{{ status }}</span>
              </label>
            </div>
          </div>

          <!-- Has Pets Filter -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Has Pets</h4>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="filters.hasPets"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <span class="ml-2 text-sm text-gray-600">Yes</span>
              </label>
            </div>
          </div>

          <!-- Apply Filters Button -->
          <button
            @click="applyFilters"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </transition>

      <!-- Main Content (rounded edges) -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <!-- Table Header -->
          <div class="grid grid-cols-[48px_2fr_2fr_1.5fr_1fr_1fr] border-b border-gray-200 text-sm font-medium text-gray-500 bg-gray-50">
            <div v-if="isEditMode" class="p-4">
              <input 
                type="checkbox" 
                v-model="selectAll"
                @change="handleSelectAll"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
              >
            </div>
            <div v-else class="p-4"></div>
            <div class="p-4">Profile</div>
            <div class="p-4">Contact</div>
            <div class="p-4">Pet</div>
            <div class="p-4">Status</div>
            <div class="p-4">Action</div>
          </div>

          <!-- Table Body -->
          <div 
            v-for="profile in filteredProfiles" 
            :key="profile.id" 
            class="grid grid-cols-[48px_2fr_2fr_1.5fr_1fr_1fr] border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
          >
            <div v-if="isEditMode" class="p-4 flex items-center">
              <input 
                type="checkbox" 
                v-model="profile.selected"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
              >
            </div>
            <div v-else class="p-4"></div>
            <div class="p-4 flex items-center gap-3">
              <img 
                :src="profile.avatar" 
                alt="" 
                @click="openImageModal(profile.avatar)"
                class="w-10 h-10 rounded-full object-cover cursor-pointer"
              >
              <div>
                <div class="font-medium text-gray-900">{{ profile.name }}</div>
                <div class="text-sm text-gray-500">Today at {{ profile.time }}</div>
              </div>
            </div>
            <div class="p-4">
              <div class="text-gray-900">{{ profile.email }}</div>
              <div class="text-sm text-gray-500">{{ profile.phone }} (Indonesia)</div>
            </div>
            <div class="p-4 flex items-center">
              <template v-if="profile.pets">
                <div class="flex items-center">
                  <div class="flex -space-x-4">
                    <img 
                      v-for="pet in profile.pets" 
                      :key="pet.id"
                      :src="pet.image" 
                      alt="" 
                      @click="openImageModal(pet.image)"
                      class="w-8 h-8 rounded-full object-cover cursor-pointer border-2 border-white ring-2 ring-gray-100"
                    >
                  </div>
                  <div class="ml-4 text-sm text-gray-600">
                    {{ profile.pets.map(pet => pet.name).join(', ') }}
                  </div>
                </div>
              </template>
              <template v-else>
                <img 
                  :src="profile.company.logo" 
                  alt="" 
                  @click="openImageModal(profile.company.logo)"
                  class="w-8 h-8 rounded-full object-cover cursor-pointer"
                >
                <span class="text-gray-900 ml-2">{{ profile.company.name }}</span>
              </template>
            </div>
            <div class="p-4">
              <span :class="`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(profile.status)}`">
                {{ profile.status }}
              </span>
            </div>
            <div class="p-4 flex items-center gap-3">
              <button 
                @click="handleView(profile)"
                class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <EyeIcon class="w-4 h-4 text-gray-500" />
              </button>
              <button 
                @click="handleEditSingle(profile)"
                class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <Edit class="w-4 h-4 text-gray-500" />
              </button>
              <button 
                @click="handleHistory(profile)"
                class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <PowerIcon class="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          <div 
            v-for="profile in filteredProfiles" 
            :key="profile.id" 
            class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <img 
                  :src="profile.avatar" 
                  alt="" 
                  @click="openImageModal(profile.avatar)"
                  class="w-16 h-16 rounded-full object-cover cursor-pointer"
                >
                <span :class="`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(profile.status)}`">
                  {{ profile.status }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ profile.name }}</h3>
              <p class="text-sm text-gray-500 mb-4">{{ profile.email }}</p>
              <div v-if="profile.pets" class="mb-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Pets:</h4>
                <div class="flex items-center">
                  <div class="flex -space-x-4">
                    <img 
                      v-for="pet in profile.pets" 
                      :key="pet.id"
                      :src="pet.image" 
                      alt="" 
                      @click="openImageModal(pet.image)"
                      class="w-8 h-8 rounded-full object-cover cursor-pointer border-2 border-white ring-2 ring-gray-100"
                    >
                  </div>
                  <div class="ml-4 text-sm text-gray-600">
                    {{ profile.pets.map(pet => pet.name).join(', ') }}
                  </div>
                </div>
              </div>
              <div v-else class="flex items-center gap-2 mb-4">
                <img 
                  :src="profile.company.logo" 
                  alt="" 
                  @click="openImageModal(profile.company.logo)"
                  class="w-6 h-6 rounded-full object-cover cursor-pointer"
                >
                <span class="text-sm text-gray-700">{{ profile.company.name }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Today at {{ profile.time }}</span>
                <div class="flex gap-2">
                  <button 
                    @click="handleView(profile)"
                    class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <EyeIcon class="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    @click="handleEditSingle(profile)"
                    class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <Edit class="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    @click="handleHistory(profile)"
                    class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <PowerIcon class="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <transition name="fade">
        <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeImageModal">
          <div class="relative max-w-3xl w-full mx-4">
            <img :src="modalImage" alt="" class="w-full h-auto rounded-lg shadow-xl">
            <button @click="closeImageModal" class="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200">
              <XIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </transition>

      <!-- Delete Confirmation Modal -->
      <transition name="fade">
        <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p class="text-gray-700 mb-6">Are you sure you want to delete the selected profiles? This action cannot be undone.</p>
            <div class="flex justify-end gap-4">
              <button 
                @click="showDeleteConfirmation = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button 
                @click="confirmDelete"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>

  <!-- Cancel and Delete Buttons -->
  <div v-if="isEditMode" class="fixed bottom-6 right-6 flex gap-4">
    <button 
      @click="cancelSelection"
      class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg"
    >
      Cancel
    </button>
    <button 
      @click="showDeleteConfirmation = true"
      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg"
    >
      Delete
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  UserIcon,
  PawPrintIcon,
  SearchIcon,
  UploadIcon,
  FilterIcon,
  ListIcon,
  LayoutGridIcon,
  ArrowDownIcon,
  PlusIcon,
  Edit,
  PowerIcon,
  XIcon,
  EyeIcon,
  TrashIcon
} from 'lucide-vue-next'
import ProfileDetails from './VetClientProfile.vue'
import CreateProfile from './CreateProfile.vue'

// Tabs
const tabs = [
  { id: 'petOwner', name: 'Pet Owner', icon: UserIcon },
  { id: 'pet', name: 'Pet', icon: PawPrintIcon },
]
const activeTab = ref('petOwner')

// View mode
const viewMode = ref('list')

// Search and filter
const searchQuery = ref('')
const showSortMenu = ref(false)
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' }
]
const currentSort = ref('date-desc')

// Selection
const selectAll = ref(false)
const isEditMode = ref(false)

// Image modal
const showImageModal = ref(false)
const modalImage = ref('')

// Profile details
const showProfileDetails = ref(false)
const selectedProfile = ref(null)

// Create new profile
const showCreateProfile = ref(false)

// Delete confirmation
const showDeleteConfirmation = ref(false)

// Filter state
const showFilterMenu = ref(false)
const filters = ref({
  status: [],
  hasPets: false
})

// Profiles data
const profiles = ref([
  {
    id: 1,
    name: 'Olivia Anderson',
    time: '14:50PM',
    email: 'oliviaanderson12@gmail.com',
    phone: '+62 85292410264',
    avatar: 'https://thumbs.dreamstime.com/b/woman-cat-owner-pet-bedroom-162326423.jpg',
    pets: [
      {
        id: 1,
        name: 'Whiskers',
        image: 'https://th.bing.com/th/id/R.c3bc8e9a1042b1ee232ca5a899b054f5?rik=D%2b41%2b4OkwKqT5g&riu=http%3a%2f%2fimages4.fanpop.com%2fimage%2fphotos%2f16700000%2fCute-Kitten-babies-pets-and-animals-16731266-1600-1200.jpg&ehk=Q3aTQ6sEZzUSxMRE%2bJapREJyjsdiTNybz%2fWRwYIRG6I%3d&risl=&pid=ImgRaw&r=0'
      },
      {
        id: 2,
        name: 'Buddy',
        image: 'https://th.bing.com/th/id/OIP.aU5HYQit4b4I-9j7HDTduwHaF1?w=1212&h=956&rs=1&pid=ImgDetMain'
      }
    ],
    status: 'Accepted',
    selected: false
  },
  {
    id: 2,
    name: 'Benjamin Ramirez',
    time: '11:43AM',
    email: 'b.ramirez@gmail.com',
    phone: '+62 85292410264',
    avatar: 'https://img.freepik.com/premium-photo/happy-man-hugging-his-dog-white-background-pet-care-male-owner-has-fun-with-dog-positive-emotions_77190-16689.jpg',
    company: {
      name: 'Green Eco',
      logo: 'https://th.bing.com/th/id/R.fbb965fdc665d0bd4f8da283797a01a8?rik=lIO7W69%2flMx8MQ&riu=http%3a%2f%2f3.bp.blogspot.com%2f_fU7LdRkUMVM%2fTJTouRK_dTI%2fAAAAAAAAChM%2fO08EDbQJTwA%2fs1600%2fcute-baby-dog.jpeg&ehk=3ComR3Gf7XCD8wEKZXLMBPSkzlgxYZ7790TXto%2bJj3A%3d&risl=&pid=ImgRaw&r=0'
    },
    status: 'Pending',
    selected: false
  },
  {
    id: 3,
    name: 'Sophia Mitchell',
    time: '09:10AM',
    email: 'sophia2904@gmail.com',
    phone: '+62 85292410264',
    avatar: 'https://www.floppycats.com/wp-content/uploads/2023/05/Cat-owner-holding-cat.webp',
    company: {
      name: 'Blue Wave',
      logo: 'https://th.bing.com/th/id/OIF.fn3pj7x3szDB1enTlmtItA?rs=1&pid=ImgDetMain'
    },
    status: 'Accepted',
    selected: false
  },
  {
    id: 4,
    name: 'Liam Walker',
    time: '08:26AM',
    email: 'liamwalkerr@gmail.com',
    phone: '+62 85292410264',
    avatar: 'https://i.pinimg.com/originals/e3/04/77/e3047744d7fbaa625d5af856094fb4a7.jpg',
    company: {
      name: 'Innova Corp',
      logo: 'https://media-be.chewy.com/wp-content/uploads/2019/05/22094049/best-pet-birds-hero-Lusyaya-1024x548.jpg'
    },
    status: 'Accepted',
    selected: false
  },
  {
    id: 5,
    name: 'Ava Bennett',
    time: '23:50PM',
    email: 'avabennett2@gmail.com',
    phone: '+62 85292410264',
    avatar: 'https://www.j-14.com/wp-content/uploads/2021/01/oliva-rodrigo-facts03.jpg?fit=3200%2C4800',
    company: {
      name: 'NI Studio',
      logo: 'https://media-be.chewy.com/wp-content/uploads/2019/05/22094049/best-pet-birds-hero-Lusyaya-1024x548.jpg'
    },
    status: 'Canceled',
    selected: false
  },
  {
    id: 6,
    name: 'Mason Collins',
    time: '20:11PM',
    email: 'masonco98@gmail.com',
    phone: '+62 85292410264',
    avatar: 'https://as1.ftcdn.net/v2/jpg/05/36/22/00/1000_F_536220017_Wp7iiaFdXi7nFgCG1A1qBPvbI4X4TOWc.jpg',
    company: {
      name: 'Sky High',
      logo: 'https://th.bing.com/th/id/OIP.aU5HYQit4b4I-9j7HDTduwHaF1?w=1212&h=956&rs=1&pid=ImgDetMain'
    },
    status: 'Pending',
    selected: false
  }
])

// Computed properties
const filteredProfiles = computed(() => {
  let result = [...profiles.value]
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(profile => 
      profile.name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query) ||
      profile.company?.name.toLowerCase().includes(query) ||
      (profile.pets && profile.pets.some(pet => pet.name.toLowerCase().includes(query)))
    )
  }
  
  // Apply filters
  if (filters.value.status.length > 0) {
    result = result.filter(profile => filters.value.status.includes(profile.status))
  }
  
  if (filters.value.hasPets) {
    result = result.filter(profile => profile.pets && profile.pets.length > 0)
  }
  
  // Sort profiles
  result.sort((a, b) => {
    switch (currentSort.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'date-asc':
        return a.time.localeCompare(b.time)
      case 'date-desc':
        return b.time.localeCompare(a.time)
      default:
        return 0
    }
  })
  
  return result
})

const hasSelectedProfiles = computed(() => {
  return profiles.value.some(profile => profile.selected)
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status.length > 0) count++
  if (filters.value.hasPets) count++
  return count
})

// Methods
const getStatusClass = (status) => {
  switch (status) {
    case 'Accepted':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Canceled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const handleCreateNew = () => {
  showCreateProfile.value = true
}

const handleSaveNewProfile = (newProfile) => {
  profiles.value.push({
    id: profiles.value.length + 1,
    ...newProfile,
    selected: false
  })
  showCreateProfile.value = false
}

const handleImport = () => {
  console.log('Import profiles')
}

const handleEditMultiple = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    profiles.value.forEach(profile => profile.selected = false)
    selectAll.value = false
  }
}

const confirmDelete = () => {
  profiles.value = profiles.value.filter(profile => !profile.selected)
  selectAll.value = false
  isEditMode.value = false
  showDeleteConfirmation.value = false
}

const toggleFilter = () => {
  showFilterMenu.value = !showFilterMenu.value
}

const applyFilters = () => {
  showFilterMenu.value = false
}

const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value
}

const handleSort = (value) => {
  currentSort.value = value
  showSortMenu.value = false
}

const handleSelectAll = () => {
  profiles.value = profiles.value.map(profile => ({
    ...profile,
    selected: selectAll.value
  }))
}

const handleView = (profile) => {
  console.log('View profile:', profile.name)
}

const handleEditSingle = (profile) => {
  selectedProfile.value = profile
  showProfileDetails.value = true
}

const handleHistory = (profile) => {
  console.log('View history:', profile.name)
}

const openImageModal = (imageUrl) => {
  modalImage.value = imageUrl
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
}

const cancelSelection = () => {
  isEditMode.value = false
  profiles.value.forEach(profile => profile.selected = false)
  selectAll.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>