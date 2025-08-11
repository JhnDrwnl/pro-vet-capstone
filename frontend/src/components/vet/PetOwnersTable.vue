<template>
  <div v-if="authStore.user?.uid && !showPetSelector && !selectedPet && !showForm" class="space-y-6">
    <!-- Search and Filter Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <!-- Search Bar -->
      <div class="relative flex-1 max-w-md">
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by owner name, pet name, or species..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <!-- Filter and View Controls -->
      <div class="flex items-center gap-3">
        <!-- Filter Menu -->
        <div class="relative">
          <button
            @click="showFilterMenu = !showFilterMenu"
            class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FilterIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Filters</span>
          </button>
          
          <!-- Filter Dropdown -->
          <div v-if="showFilterMenu" class="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div class="p-4 space-y-4">
              <!-- Pet Count Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pet Count</label>
                <div class="space-y-2">
                  <label v-for="option in petCountOptions" :key="option.value" class="flex items-center">
                    <input
                      v-model="filters.petCount"
                      :value="option.value"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-2 text-sm text-gray-700">{{ option.label }}</span>
                  </label>
                </div>
              </div>
              
              <!-- Sort Options -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  v-model="sortKey"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="owner.name">Owner Name</option>
                  <option value="petCount">Pet Count</option>
                  <option value="lastActivity">Last Activity</option>
                </select>
              </div>
              
              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                <div class="flex gap-2">
                  <button
                    @click="sortOrder = 'asc'"
                    :class="[
                      'px-3 py-1 rounded text-sm font-medium transition-colors',
                      sortOrder === 'asc' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    ]"
                  >
                    A-Z
                  </button>
                  <button
                    @click="sortOrder = 'desc'"
                    :class="[
                      'px-3 py-1 rounded text-sm font-medium transition-colors',
                      sortOrder === 'desc' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    ]"
                  >
                    Z-A
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-2 transition-colors',
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            ]"
          >
            <ListIcon class="w-4 h-4" />
          </button>
          <button
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-2 transition-colors',
              viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            ]"
          >
            <LayoutGridIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Results Count -->
    <div class="text-sm text-gray-600">
      Showing {{ filteredPetOwners.length }} of {{ petOwners.length }} pet owners
    </div>
    
    <!-- List View -->
    <div v-if="viewMode === 'list'" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pets</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="owner in paginatedPetOwners" :key="owner.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      :src="owner.photoURL || defaultPhotoURL" 
                      :alt="owner.firstName"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ owner.firstName }} {{ owner.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ owner.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ owner.pets?.length || 0 }} pets</div>
                <div class="text-sm text-gray-500">
                  {{ getPetSpeciesList(owner.pets) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatLastActivity(owner) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="$emit('viewOwner', owner)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View Pets
                </button>
                <button
                  @click="$emit('editOwner', owner)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="owner in paginatedPetOwners" 
        :key="owner.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-center mb-4">
            <img 
              :src="owner.photoURL || defaultPhotoURL" 
              :alt="owner.firstName"
              class="h-12 w-12 rounded-full object-cover mr-4"
            />
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                {{ owner.firstName }} {{ owner.lastName }}
              </h3>
              <p class="text-sm text-gray-500">{{ owner.email }}</p>
            </div>
          </div>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Pets:</span>
              <span class="text-sm font-medium text-gray-900">{{ owner.pets?.length || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Species:</span>
              <span class="text-sm text-gray-900">{{ getPetSpeciesList(owner.pets) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Last Activity:</span>
              <span class="text-sm text-gray-900">{{ formatLastActivity(owner) }}</span>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button
              @click="$emit('viewOwner', owner)"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              View Pets
            </button>
            <button
              @click="$emit('editOwner', owner)"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredPetOwners.length) }} of {{ filteredPetOwners.length }} results
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
        <span class="px-3 py-2 text-sm text-gray-700">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  SearchIcon, 
  FilterIcon, 
  ListIcon, 
  LayoutGridIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'

const props = defineProps({
  authStore: Object,
  showPetSelector: Boolean,
  selectedPet: Object,
  showForm: Boolean,
  petOwners: Array,
  searchQuery: String,
  showFilterMenu: Boolean,
  filters: Object,
  sortKey: String,
  sortOrder: String,
  viewMode: String,
  currentPage: Number,
  itemsPerPage: Number,
  defaultPhotoURL: String
})

const emit = defineEmits(['viewOwner', 'editOwner'])

// Computed properties
const filteredPetOwners = computed(() => {
  let filtered = [...props.petOwners]
  
  // Apply search filter
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    filtered = filtered.filter(owner => {
      const ownerName = `${owner.firstName} ${owner.lastName}`.toLowerCase()
      const hasMatchingPet = owner.pets?.some(pet => 
        pet.name?.toLowerCase().includes(query) || 
        pet.species?.toLowerCase().includes(query)
      )
      return ownerName.includes(query) || hasMatchingPet
    })
  }
  
  // Apply pet count filter
  if (props.filters.petCount.length > 0) {
    filtered = filtered.filter(owner => {
      const petCount = owner.pets?.length || 0
      return props.filters.petCount.some(filter => {
        if (filter === '0') return petCount === 0
        if (filter === '1-2') return petCount >= 1 && petCount <= 2
        if (filter === '3-5') return petCount >= 3 && petCount <= 5
        if (filter === '5+') return petCount > 5
        return true
      })
    })
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aValue, bValue
    
    switch (props.sortKey) {
      case 'owner.name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
        break
      case 'petCount':
        aValue = a.pets?.length || 0
        bValue = b.pets?.length || 0
        break
      case 'lastActivity':
        aValue = getLastActivityDate(a)
        bValue = getLastActivityDate(b)
        break
      default:
        aValue = a[props.sortKey]
        bValue = b[props.sortKey]
    }
    
    if (props.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredPetOwners.value.length / props.itemsPerPage))

const paginatedPetOwners = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredPetOwners.value.slice(start, end)
})

// Helper functions
function getPetSpeciesList(pets) {
  if (!pets || pets.length === 0) return 'None'
  const species = [...new Set(pets.map(pet => pet.species).filter(Boolean))]
  return species.length > 0 ? species.join(', ') : 'Unknown'
}

function formatLastActivity(owner) {
  const lastActivity = getLastActivityDate(owner)
  if (!lastActivity) return 'No activity'
  
  const now = new Date()
  const diffTime = Math.abs(now - lastActivity)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

function getLastActivityDate(owner) {
  if (!owner.pets || owner.pets.length === 0) return null
  
  const dates = []
  owner.pets.forEach(pet => {
    if (pet.medicalHistory?.length > 0) {
      dates.push(...pet.medicalHistory.map(record => new Date(record.date)))
    }
    if (pet.vaccinations?.length > 0) {
      dates.push(...pet.vaccinations.map(record => new Date(record.date)))
    }
    if (pet.telehealthRecords?.length > 0) {
      dates.push(...pet.telehealthRecords.map(record => new Date(record.date)))
    }
  })
  
  if (dates.length === 0) return null
  return new Date(Math.max(...dates))
}

// Pet count filter options
const petCountOptions = [
  { value: '0', label: 'No pets' },
  { value: '1-2', label: '1-2 pets' },
  { value: '3-5', label: '3-5 pets' },
  { value: '5+', label: '5+ pets' }
]
</script> 