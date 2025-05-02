<!-- views/admin/datamanagement/PetProfiles.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Pet Profiles</h1>
      <p class="text-gray-500 mt-1">Manage pet profiles and information.</p>
    </div>

    <!-- Show loading spinner during initial data load -->
    <LoadingSpinner v-if="initialLoading" isOverlay text="Loading pet profiles..." />

    <!-- Only show content when data is loaded -->
    <div v-if="!initialLoading">
      <!-- Search, Filter, Add, and Export -->
      <div v-if="!showForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="flex gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search pets..."
              class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              v-model="searchQuery"
            >
            <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div class="relative">
            <button 
              class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              @click="toggleFilters"
            >
              <FilterIcon class="w-5 h-5 text-gray-500" />
            </button>
            <!-- Filter Dropdown -->
            <div v-if="showFilters" class="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <div class="px-4 py-2 text-sm font-medium text-gray-700">Filter by:</div>
              <button 
                v-for="filter in filters" 
                :key="filter"
                @click="toggleFilter(filter)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                :class="{
                  'text-blue-600': filter === 'All Pets' ? activeFilters.length === 0 : activeFilters.includes(filter)
                }"
              >
                {{ filter }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="exportToCSV"
            class="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs sm:text-sm w-full sm:w-auto justify-center"
          >
            <DownloadIcon class="w-3 h-3 sm:w-4 sm:h-4" />
            Export CSV
          </button>
          <button 
            @click="openAddPetForm"
            class="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs sm:text-sm w-full sm:w-auto justify-center"
          >
            <PlusCircle class="w-3 h-3 sm:w-4 sm:h-4" />
            Add Pet
          </button>
        </div>
      </div>

      <!-- Table -->
      <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b border-gray-200">
              <!-- Non-sortable Photo column -->
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Photo
              </th>
              <!-- Sortable columns -->
              <th 
                v-for="header in petHeaders" 
                :key="header.key" 
                @click="sortBy(header.key)"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  {{ header.label }}
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'asc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'desc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <!-- Actions column without sorting -->
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="pet in paginatedPets" :key="pet.id" class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
              <td class="py-4 px-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 mr-3">
                    <img :src="pet.photoURL || defaultPetPhotoURL" 
                         :alt="pet.name"
                         class="h-10 w-10 rounded-full object-cover" />
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ pet.name }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ pet.species }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ pet.breed }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">
                {{ formatPetAge(pet) }}
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">
                <!-- Owner information with photo and name -->
                <div v-if="pet.ownerInfo" class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 mr-2">
                    <img 
                      :src="pet.ownerInfo.photoURL || defaultOwnerPhotoURL" 
                      :alt="`${pet.ownerInfo.firstName} ${pet.ownerInfo.lastName}`"
                      class="h-8 w-8 rounded-full object-cover border border-gray-200" 
                    />
                  </div>
                  <div>
                    <div class="font-medium">{{ pet.ownerInfo.firstName }} {{ pet.ownerInfo.lastName }}</div>
                    <div class="text-xs text-gray-500">{{ pet.ownerInfo.email }}</div>
                  </div>
                </div>
                <div v-else class="text-gray-500">No owner assigned</div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ formatLastUpdated(pet.createdAt) }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ formatLastUpdated(pet.updatedAt) }}</td>
              <td class="py-4 px-6">
                <div class="flex gap-2">
                  <button 
                    @click="editPet(pet)" 
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <LucideEdit class="w-5 h-5" />
                  </button>
                  <button 
                    @click="showDeleteConfirm(pet.id)" 
                    class="p-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Empty state with icon placeholder -->
            <tr v-if="filteredPets.length === 0">
              <td colspan="9" class="py-8 text-center">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <PawPrintIcon class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-gray-500 font-medium">No pets found</p>
                  <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination - Responsive -->
      <div v-if="!showForm && filteredPets.length > itemsPerPage" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredPets.length }} entries
        </div>
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            Previous
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
            :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Inline Add/Edit Pet Form -->
      <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">{{ editingPet ? 'Edit Pet' : 'Add New Pet' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Basic Pet Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                v-model="petForm.name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <input
                type="text"
                v-model="petForm.species"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Enter species"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input
                v-model="petForm.breed"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Enter breed"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <!-- Custom Gender Dropdown -->
              <div class="relative">
                <div 
                  @click="toggleGenderDropdown"
                  class="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm cursor-pointer flex justify-between items-center gender-dropdown"
                >
                  <span v-if="petForm.gender">{{ formatGender(petForm.gender) }}</span>
                  <span v-else class="text-gray-500">Select gender</span>
                  <ChevronDownIcon class="w-4 h-4 text-gray-500" :class="{ 'transform rotate-180': genderDropdownOpen }" />
                </div>
                
                <!-- Gender Dropdown Options -->
                <div 
                  v-show="genderDropdownOpen"
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg gender-dropdown"
                >
                  <div 
                    @click="selectGender('male')"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown"
                  >
                    Male
                  </div>
                  <div 
                    @click="selectGender('female')"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown"
                  >
                    Female
                  </div>
                  <div 
                    @click="selectGender('unknown')"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown"
                  >
                    Unknown
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Age Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Age (Years, Months, Weeks)</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="w-full sm:w-1/3">
                <input
                  type="number"
                  v-model="petForm.ageYears"
                  min="0"
                  placeholder="Years"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
              </div>
              <div class="w-full sm:w-1/3">
                <input
                  type="number"
                  v-model="petForm.ageMonths"
                  min="0"
                  max="11"
                  placeholder="Months"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
              </div>
              <div class="w-full sm:w-1/3">
                <input
                  type="number"
                  v-model="petForm.ageWeeks"
                  min="0"
                  max="3"
                  placeholder="Weeks"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
              </div>
            </div>
          </div>
          
          <!-- Weight Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              v-model="petForm.weight"
              step="0.1"
              min="0"
              placeholder="Enter weight in kg"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          
          <!-- Owner Selection - Search Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <div class="relative">
              <input
                type="text"
                v-model="ownerSearchQuery"
                placeholder="Search for an owner..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                @focus="showOwnerSearch = true"
              />
              <div v-if="showOwnerSearch && filteredOwners.length > 0" class="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm max-h-60 overflow-y-auto">
                <div v-for="owner in filteredOwners" :key="owner.userId" 
                     @click="selectOwner(owner)"
                     class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <div class="flex-shrink-0 h-8 w-8 mr-2">
                    <img 
                      :src="owner.photoURL || defaultOwnerPhotoURL" 
                      :alt="`${owner.firstName} ${owner.lastName}`"
                      class="h-8 w-8 rounded-full object-cover border border-gray-200" 
                    />
                  </div>
                  <div>
                    <div class="font-medium">{{ owner.firstName }} {{ owner.lastName }}</div>
                    <div class="text-xs text-gray-500">{{ owner.email }}</div>
                  </div>
                </div>
              </div>
              <div v-if="showOwnerSearch && filteredOwners.length === 0 && ownerSearchQuery" class="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-3 text-sm text-center text-gray-500">
                No owners found matching "{{ ownerSearchQuery }}"
              </div>
            </div>
            
            <!-- Selected Owner Display -->
            <div v-if="selectedOwner" class="mt-2 p-2 bg-gray-50 rounded-lg flex items-center">
              <div class="flex-shrink-0 h-8 w-8 mr-2">
                <img 
                  :src="selectedOwner.photoURL || defaultOwnerPhotoURL" 
                  :alt="`${selectedOwner.firstName} ${selectedOwner.lastName}`"
                  class="h-8 w-8 rounded-full object-cover border border-gray-200" 
                />
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</div>
                <div class="text-xs text-gray-500">{{ selectedOwner.email }}</div>
              </div>
              <button 
                type="button" 
                @click="clearSelectedOwner" 
                class="text-gray-400 hover:text-gray-600"
              >
                <XIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <!-- Additional Information -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
            <textarea
              v-model="petForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Enter any additional information about the pet..."
            ></textarea>
          </div>
          
          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              @click="closeForm"
              class="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-3 py-1.5 sm:px-4 sm:py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2 text-xs sm:text-sm"
            >
              {{ editingPet ? 'Save Changes' : 'Add Pet' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Confirmation Dialog - Responsive -->
    <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFEEEE] mx-auto mb-4">
          <AlertTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Confirm Action</h3>
        <p class="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete this pet? It will be moved to archives.
        </p>
        <div class="flex justify-center gap-3">
          <button 
            @click="cancelDelete" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-full shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            :disabled="isLoading"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircleIcon class="h-6 w-6 text-green-600" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Success</h3>
        <p class="text-sm text-gray-500 text-center mb-6">
          {{ statusMessage }}
        </p>
        <div class="flex justify-center">
          <button 
            @click="showSuccessModal = false" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <XCircleIcon class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Error</h3>
        <p class="text-sm text-gray-500 text-center mb-6">
          {{ statusMessage }}
        </p>
        <div class="flex justify-center">
          <button 
            @click="showErrorModal = false" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner Overlay - Show for operations -->
    <LoadingSpinner v-if="isLoading" isOverlay text="Processing..." />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  PlusCircle,
  Edit as LucideEdit,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Trash2,
  PawPrint as PawPrintIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  X as XIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc, Timestamp, setDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { useProfileStore } from '@/stores/modules/profileStore'
import { usePetsStore } from '@/stores/modules/petsStore'
import { useArchivesStore } from '@/stores/modules/archivesStore'

// Stores
const profileStore = useProfileStore()
const petsStore = usePetsStore()
const archivesStore = useArchivesStore()

// Default values and state
const pets = ref([])
const petOwners = ref([])
const initialLoading = ref(true)
const isLoading = ref(false)
const showForm = ref(false)
const showFilters = ref(false)
const editingPet = ref(null)
const searchQuery = ref('')
const activeFilters = ref([])
const sortKey = ref('name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10
const showConfirmDialog = ref(false)
const itemToDelete = ref(null)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const statusMessage = ref('')
const genderDropdownOpen = ref(false)

// Owner search state
const ownerSearchQuery = ref('')
const showOwnerSearch = ref(false)
const selectedOwner = ref(null)

const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E'
const defaultOwnerPhotoURL = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' strokeWidth=\'2\' fill=\'none\'/%3E%3C/svg%3E'

// Form data
const petForm = ref({
  name: '',
  species: '',
  breed: '',
  gender: '',
  ageYears: 0,
  ageMonths: 0,
  ageWeeks: 0,
  weight: 0, // Added weight field with default value of 0
  ownerId: '',
  notes: ''
})

// Species and breeds lists
const speciesList = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other']
const breedsList = {
  Dog: ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle', 'Aspin/Mongrel', 'Shih Tzu', 'Chihuahua', 'Other'],
  Cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Puspin/Domestic Shorthair', 'Ragdoll', 'Bengal', 'Other'],
  Bird: ['Parakeet', 'Canary', 'Cockatiel', 'Lovebird', 'Finch', 'Parrot', 'Other'],
  Rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Lionhead', 'Other'],
  Fish: ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Other'],
  Other: ['Other']
}

// Table headers for sorting
const petHeaders = [
  { key: 'name', label: 'Name' },
  { key: 'species', label: 'Species' },
  { key: 'breed', label: 'Breed' },
  { key: 'age', label: 'Age' },
  { key: 'ownerInfo', label: 'Owner' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' }
]

// Filter options
const filters = ['All Pets', 'Dogs', 'Cats', 'Other Species', 'No Owner']

// Fetch all pets from Firestore
const fetchPets = async () => {
  try {
    initialLoading.value = true
    
    // Fetch all pets
    const petsRef = collection(db, 'pets')
    const petsSnapshot = await getDocs(petsRef)
    
    const petsData = []
    petsSnapshot.forEach(doc => {
      const data = doc.data()
      petsData.push({
        id: doc.id,
        ...data
      })
    })
    
    // Fetch all pet owners for reference
    await fetchPetOwners()
    
    // Add owner information to each pet
    for (const pet of petsData) {
      if (pet.ownerId) {
        const ownerInfo = petOwners.value.find(owner => owner.userId === pet.ownerId)
        if (ownerInfo) {
          pet.ownerInfo = ownerInfo
        }
      }
    }
    
    pets.value = petsData
    console.log(`Fetched ${petsData.length} pets`)
  } catch (error) {
    console.error('Error fetching pets:', error)
    statusMessage.value = 'Failed to load pets. Please try again.'
    showErrorModal.value = true
  } finally {
    initialLoading.value = false
  }
}

// Fetch all pet owners
const fetchPetOwners = async () => {
  try {
    // Query users collection for pet owners (role is 'user')
    const usersRef = collection(db, 'users')
    const petOwnersQuery = query(usersRef, where('role', '==', 'user'))
    const querySnapshot = await getDocs(petOwnersQuery)
    
    const owners = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      owners.push({
        userId: doc.id,
        ...data,
        // Add name field for display convenience
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim()
      })
    })
    
    petOwners.value = owners
  } catch (error) {
    console.error('Error fetching pet owners:', error)
  }
}

// Gender dropdown methods
const toggleGenderDropdown = () => {
  genderDropdownOpen.value = !genderDropdownOpen.value
}

const selectGender = (value) => {
  petForm.value.gender = value
  genderDropdownOpen.value = false
}

const formatGender = (gender) => {
  if (gender === 'male') return 'Male'
  if (gender === 'female') return 'Female'
  if (gender === 'unknown') return 'Unknown'
  return gender
}

// Filter owners based on search query
const filteredOwners = computed(() => {
  if (!ownerSearchQuery.value) return petOwners.value

  const query = ownerSearchQuery.value.toLowerCase()
  return petOwners.value.filter(owner => 
    owner.name.toLowerCase().includes(query) || 
    owner.email.toLowerCase().includes(query) ||
    (owner.phone && owner.phone.includes(query))
  )
})

// Select an owner from the search results
const selectOwner = (owner) => {
  selectedOwner.value = owner
  petForm.value.ownerId = owner.userId
  ownerSearchQuery.value = ''
  showOwnerSearch.value = false
}

// Clear selected owner
const clearSelectedOwner = () => {
  selectedOwner.value = null
  petForm.value.ownerId = ''
}

// Filter pets based on search and active filters
const filteredPets = computed(() => {
  return pets.value.filter(pet => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      (pet.name || '').toLowerCase().includes(searchLower) ||
      (pet.species || '').toLowerCase().includes(searchLower) ||
      (pet.breed || '').toLowerCase().includes(searchLower) ||
      (pet.ownerInfo?.firstName || '').toLowerCase().includes(searchLower) ||
      (pet.ownerInfo?.lastName || '').toLowerCase().includes(searchLower) ||
      (pet.ownerInfo?.email || '').toLowerCase().includes(searchLower)
    
    if (!matchesSearch) return false
    
    // If no filters are active, only apply search
    if (activeFilters.value.length === 0) {
      return true
    }
    
    // Check if pet matches all active filters
    return activeFilters.value.every(filter => {
      switch(filter) {
        case 'Dogs':
          return pet.species?.toLowerCase() === 'dog'
        case 'Cats':
          return pet.species?.toLowerCase() === 'cat'
        case 'Other Species':
          return pet.species && !['dog', 'cat'].includes(pet.species.toLowerCase())
        case 'No Owner':
          return !pet.ownerId
        default:
          return true
      }
    })
  })
})

// Format pet age using the petsStore utility
const formatPetAge = (pet) => {
  if (!pet) return 'Unknown'

  // Check if we have the new age structure
  if (pet.ageYears !== undefined || pet.ageMonths !== undefined || pet.ageWeeks !== undefined) {
    const years = pet.ageYears || 0
    const months = pet.ageMonths || 0
    const weeks = pet.ageWeeks || 0
    
    const parts = []
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`)
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`)
    if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`)
    
    return parts.join(', ') || 'Newborn'
  }

  // Check if we have the old age object structure
  if (pet.age && typeof pet.age === 'object') {
    const years = pet.age.years || 0
    const months = pet.age.months || 0
    const weeks = pet.age.weeks || 0
    
    const parts = []
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`)
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`)
    if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`)
    
    return parts.join(', ') || 'Newborn'
  }

  return 'Unknown'
}

// Sort pets based on current sort settings
const sortedPets = computed(() => {
  return [...filteredPets.value].sort((a, b) => {
    let aValue, bValue
    
    // Special handling for different columns
    if (sortKey.value === 'age') {
      // Convert age to total weeks for comparison
      const aYears = a.ageYears || (a.age?.years) || 0
      const aMonths = a.ageMonths || (a.age?.months) || 0
      const aWeeks = a.ageWeeks || (a.age?.weeks) || 0
      
      const bYears = b.ageYears || (b.age?.years) || 0
      const bMonths = b.ageMonths || (b.age?.months) || 0
      const bWeeks = b.ageWeeks || (b.age?.weeks) || 0
      
      aValue = aYears * 52 + aMonths * 4 + aWeeks
      bValue = bYears * 52 + bMonths * 4 + bWeeks
    } else if (sortKey.value === 'ownerInfo') {
      // Sort by owner name
      aValue = a.ownerInfo ? `${a.ownerInfo.firstName || ''} ${a.ownerInfo.lastName || ''}`.trim().toLowerCase() : ''
      bValue = b.ownerInfo ? `${b.ownerInfo.firstName || ''} ${b.ownerInfo.lastName || ''}`.trim().toLowerCase() : ''
    } else if (sortKey.value === 'updatedAt') {
      // Sort by timestamp
      aValue = a.updatedAt ? (a.updatedAt.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt).getTime()) : 0
      bValue = b.updatedAt ? (b.updatedAt.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt).getTime()) : 0
    } else if (sortKey.value === 'createdAt') {
      // Sort by timestamp
      aValue = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0
      bValue = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0
    } else {
      // Default sorting for other columns
      aValue = a[sortKey.value] || ''
      bValue = b[sortKey.value] || ''
      
      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    }
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

// Pagination computed properties
const paginatedPets = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedPets.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredPets.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredPets.value.length))

// Pagination methods
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  try {
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Format last updated timestamp
const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Never'
  try {
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Toggle filters dropdown
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Toggle filter selection
const toggleFilter = (filter) => {
  if (filter === 'All Pets') {
    activeFilters.value = []
  } else {
    // Make filters mutually exclusive by replacing the array instead of adding to it
    activeFilters.value = [filter]
  }

  showFilters.value = false
  currentPage.value = 1 // Reset to first page when filtering
}

// Sort by column
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Open add pet form
const openAddPetForm = () => {
  editingPet.value = null
  petForm.value = {
    name: '',
    species: '',
    breed: '',
    gender: '',
    ageYears: 0,
    ageMonths: 0,
    ageWeeks: 0,
    weight: 0, // Initialize weight to 0
    ownerId: '',
    notes: ''
  }
  selectedOwner.value = null
  showForm.value = true
}

// Edit pet
const editPet = (pet) => {
  editingPet.value = pet

  // Map the pet data to the form
  petForm.value = { 
    name: pet.name || '',
    species: pet.species || '',
    breed: pet.breed || '',
    gender: pet.gender || '',
    ownerId: pet.ownerId || '',
    notes: pet.notes || '',
    // Handle different age structures
    ageYears: pet.ageYears || (pet.age?.years) || 0,
    ageMonths: pet.ageMonths || (pet.age?.months) || 0,
    ageWeeks: pet.ageWeeks || (pet.age?.weeks) || 0,
    weight: pet.weight || 0 // Set weight from pet data or default to 0
  }

  // Set selected owner if available
  if (pet.ownerId) {
    selectedOwner.value = petOwners.value.find(owner => owner.userId === pet.ownerId) || null
  } else {
    selectedOwner.value = null
  }

  showForm.value = true
}

// Close form
const closeForm = () => {
  showForm.value = false
  editingPet.value = null
  selectedOwner.value = null
  ownerSearchQuery.value = ''
}

// Show delete confirmation dialog
const showDeleteConfirm = (id) => {
  itemToDelete.value = id
  showConfirmDialog.value = true
}

// Cancel delete action
const cancelDelete = () => {
  showConfirmDialog.value = false
  itemToDelete.value = null
}

// Confirm delete action
const confirmDelete = async () => {
  if (!itemToDelete.value) return

  isLoading.value = true
  try {
    const petToDelete = pets.value.find(p => p.id === itemToDelete.value)
    if (!petToDelete) {
      throw new Error('Pet not found');
    }
    
    // Prepare the pet data for archiving
    const petData = {
      ...petToDelete,
      originalId: itemToDelete.value,
      itemType: 'pet',
      name: petToDelete.name || 'unnamed',
      archivedAt: Timestamp.now(),
      archivedBy: profileStore.user?.uid || 'admin'
    }
    
    // Remove the id property before saving to archives
    delete petData.id;
    
    // Use the archivesStore to save to archives collection with a dynamic document ID
    const archiveId = await archivesStore.saveToArchivesCollection(petData);
    console.log('Pet archived with ID:', archiveId);
    
    // Delete from pets collection
    const petRef = doc(db, 'pets', itemToDelete.value);
    await deleteDoc(petRef);
    
    // Remove from local list
    pets.value = pets.value.filter(p => p.id !== itemToDelete.value);
    
    statusMessage.value = `Pet "${petToDelete.name}" has been archived successfully`;
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Error archiving pet:', error);
    statusMessage.value = 'Failed to archive pet. Please try again.';
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
    showConfirmDialog.value = false;
    itemToDelete.value = null;
  }
}

// Generate a dynamic document ID for a pet
const generatePetDocId = (petData, userId) => {
  // Create a shorter dynamic document ID
  const petName = (petData.name || 'pet').toLowerCase().replace(/\s+/g, '-');
  const shortId = Date.now().toString().slice(-6); // Last 6 digits of timestamp

  return `${petName}-${shortId}`;
}

// Handle form submission
const handleSubmit = async () => {
  isLoading.value = true

  try {
    const petData = {
      name: petForm.value.name,
      species: petForm.value.species,
      breed: petForm.value.breed,
      gender: petForm.value.gender,
      ageYears: parseInt(petForm.value.ageYears) || 0,
      ageMonths: parseInt(petForm.value.ageMonths) || 0,
      ageWeeks: parseInt(petForm.value.ageWeeks) || 0,
      weight: parseFloat(petForm.value.weight) || 0, // Parse weight as float
      ownerId: petForm.value.ownerId || null,
      notes: petForm.value.notes || '',
      updatedAt: Timestamp.now()
    }
    
    if (editingPet.value) {
      // Update existing pet
      const petRef = doc(db, 'pets', editingPet.value.id)
      await updateDoc(petRef, petData)
      
      // Update local data
      const index = pets.value.findIndex(p => p.id === editingPet.value.id)
      if (index !== -1) {
        // Update owner info
        if (petData.ownerId) {
          const ownerInfo = petOwners.value.find(owner => owner.userId === petData.ownerId)
          petData.ownerInfo = ownerInfo || null
        } else {
          petData.ownerInfo = null
        }
        
        pets.value[index] = {
          ...pets.value[index],
          ...petData
        }
      }
      
      statusMessage.value = `Pet "${petForm.value.name}" updated successfully`
    } else {
      // Add new pet
      petData.createdAt = Timestamp.now()
      
      // Generate a dynamic document ID
      const userId = selectedOwner.value?.userId || 'admin';
      const docId = generatePetDocId(petData, userId);
      
      // Create a reference to the document with the dynamic ID
      const petRef = doc(db, 'pets', docId);
      
      // Save to Firestore with the specific ID
      await setDoc(petRef, petData);
      
      // Add owner info
      let ownerInfo = null
      if (petData.ownerId) {
        ownerInfo = petOwners.value.find(owner => owner.userId === petData.ownerId)
      }
      
      // Add to local data
      pets.value.push({
        id: docId,
        ...petData,
        ownerInfo
      })
      
      statusMessage.value = `Pet "${petForm.value.name}" added successfully`
    }
    
    showSuccessModal.value = true
    closeForm()
  } catch (error) {
    console.error('Error saving pet:', error)
    statusMessage.value = 'Failed to save pet. Please try again.'
    showErrorModal.value = true
  } finally {
    isLoading.value = false
  }
}

// Export to CSV
const exportToCSV = () => {
  const headers = ['Name', 'Species', 'Breed', 'Gender', 'Age', 'Weight (kg)', 'Owner', 'Owner Email', 'Notes', 'Last Updated']

  const rows = filteredPets.value.map(pet => [
    pet.name || '',
    pet.species || '',
    pet.breed || '',
    pet.gender || '',
    formatPetAge(pet),
    pet.weight || '0', // Include weight in CSV export
    pet.ownerInfo ? `${pet.ownerInfo.firstName || ''} ${pet.ownerInfo.lastName || ''}`.trim() : '',
    pet.ownerInfo?.email || '',
    pet.notes || '',
    formatLastUpdated(pet.updatedAt)
  ])

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'pet_profiles.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Close owner search when clicking outside
const handleClickOutside = (event) => {
  if (showOwnerSearch.value && !event.target.closest('.owner-search')) {
    showOwnerSearch.value = false
  }

  // Close gender dropdown if open and click is outside
  if (genderDropdownOpen.value && !event.target.closest('.gender-dropdown')) {
    genderDropdownOpen.value = false
  }
}

// Initialize component
onMounted(async () => {
  await fetchPets()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for changes in the owner search query
watch(ownerSearchQuery, () => {
  if (ownerSearchQuery.value) {
    showOwnerSearch.value = true
  }
})
</script>

<style scoped>
/* Ensure consistency with mobile displays */
@media (max-width: 640px) {
  input, select, textarea {
    font-size: 16px; /* Prevents zoom on focus in iOS */
  }
}
</style>