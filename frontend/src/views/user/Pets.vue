<!-- views/user/Pets.vue -->
<template>
  <div class="space-y-6">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <!-- Pet List View -->
      <div v-if="!selectedPetId">
        <div class="flex flex-wrap gap-2 pb-4">
          <!-- Only Add Pet button -->
          <button
            @click.prevent="addNewPet"
            :disabled="hasUnsavedNewPet"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
              hasUnsavedNewPet 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            type="button"
            :title="hasUnsavedNewPet ? 'Please save the current pet before adding a new one' : 'Add a new pet'"
          >
            <PlusIcon class="w-4 h-4 mr-1" />
            Add Pet
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="localPets.length === 0" class="text-center py-12">
          <p class="text-gray-500">No pets added yet. Click the + button to add a pet.</p>
        </div>
        
        <!-- Pet List -->
        <div v-else class="space-y-3">
          <div v-for="pet in localPets" :key="pet.id || pet.tempId" class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 rounded-full overflow-hidden mr-3">
                <img
                  v-if="pet.photoURL && !pet.isNew"
                  :src="pet.photoURL"
                  :alt="pet.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik04LjM1IDNjMS4xOC0uMTcgMi40MyAxLjEyIDIuNzkgMi45Yy4zNiAxLjc3LS4yOSAzLjM1LTEuNDcgMy41M2MtMS4xNy4xOC0yLjQzLTEuMTEtMi44LTIuODljLS4zNy0xLjc3LjMtMy4zNSAxLjQ4LTMuNTRtNy4xNSAwYzEuMTkuMTkgMS44NSAxLjc3IDEuNSAzLjU0Yy0uMzggMS43OC0xLjYzIDMuMDctMi44MSAyLjg5Yy0xLjE5LS4xOC0xLjg0LTEuNzYtMS40Ny0zLjUzYy4zNi0xLjc4IDEuNjEtMy4wNyAyLjc4LTIuOU0zIDcuNmMxLjE0LS40OSAyLjY5LjQgMy41IDEuOTVjLjc2IDEuNTguNSAzLjI0LS42MyAzLjczcy0yLjY3LS4zOS0zLjQ2LTEuOTZTMS45IDguMDggMyA3LjZtMTggMGMxLjEuNDggMS4zOCAyLjE1LjU5IDMuNzJzLTIuMzMgMi40NS0zLjQ2IDEuOTZzLTEuMzktMi4xNS0uNjMtMy43M0MxOC4zMSA4IDE5Ljg2IDcuMTEgMjEgNy42bS0xLjY3IDEwLjc4Yy4wNC45NC0uNjggMS45OC0xLjU0IDIuMzdjLTEuNzkuODItMy45MS0uODgtNS45LS44OHMtNC4xMyAxLjc3LTUuODkuODhjLTEtLjQ5LTEuNjktMS43OS0xLjU2LTIuODdjLjE4LTEuNDkgMS45Ny0yLjI5IDMuMDMtMy4zOGMxLjQxLTEuNDEgMi40MS00LjA2IDQuNDItNC4wNmMyIDAgMy4wNiAyLjYxIDQuNDEgNC4wNmMxLjExIDEuMjIgMi45NiAyLjI1IDMuMDMgMy44OCIvPjwvc3ZnPg==" alt="Pet icon" class="w-8 h-8" />
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ pet.isNew ? 'New Pet' : pet.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ !pet.isNew && pet.breed ? pet.breed : 'Breed not specified' }}
                  {{ !pet.isNew && pet.breed && formatPetAge(pet) ? ' • ' : '' }}
                  {{ !pet.isNew ? formatPetAge(pet) : '' }}
                </p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="viewPet(pet)"
                type="button"
                class="p-2 text-blue-500 hover:text-blue-700"
                title="View pet details"
                v-if="!pet.isNew"
              >
                <EyeIcon class="w-5 h-5" />
              </button>
              <button 
                @click="editPet(pet)"
                type="button"
                class="p-2 text-gray-500 hover:text-gray-700"
                title="Edit pet"
              >
                <EditIcon class="w-5 h-5" />
              </button>
              <!-- Only show delete button for existing pets (not new ones) in the list view -->
              <button 
                v-if="!pet.isNew"
                @click="confirmDeletePet(pet)"
                type="button"
                class="p-2 text-red-500 hover:text-red-700"
                title="Delete pet"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Selected Pet Details -->
      <div v-else-if="selectedLocalPet" class="space-y-6">
        <div class="flex items-center mb-4">
          <button 
            @click="backToList"
            type="button"
            class="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div class="relative group mr-4">
            <div v-if="selectedLocalPet.photoURL && !selectedLocalPet.isNew" class="w-20 h-20 rounded-full overflow-hidden">
              <img
                :src="selectedLocalPet.photoURL"
                :alt="selectedLocalPet.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-else class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik04LjM1IDNjMS4xOC0uMTcgMi40MyAxLjEyIDIuNzkgMi45Yy4zNiAxLjc3LS4yOSAzLjM1LTEuNDcgMy41M2MtMS4xNy4xOC0yLjQzLTEuMTEtMi44LTIuODljLS4zNy0xLjc3LjMtMy4zNSAxLjQ4LTMuNTRtNy4xNSAwYzEuMTkuMTkgMS44NSAxLjc3IDEuNSAzLjU0Yy0uMzggMS43OC0xLjYzIDMuMDctMi44MSAyLjg5Yy0xLjE5LS4xOC0xLjg0LTEuNzYtMS40Ny0zLjUzYy4zNi0xLjc4IDEuNjEtMy4wNyAyLjc4LTIuOU0zIDcuNmMxLjE0LS40OSAyLjY5LjQgMy41IDEuOTVjLjc2IDEuNTguNSAzLjI0LS42MyAzLjczcy0yLjY3LS4zOS0zLjQ2LTEuOTZTMS45IDguMDggMyA3LjZtMTggMGMxLjEuNDggMS4zOCAyLjE1LjU5IDMuNzJzLTIuMzMgMi40NS0zLjQ2IDEuOTZzLTEuMzktMi4xNS0uNjMtMy43M0MxOC4zMSA4IDE5Ljg2IDcuMTEgMjEgNy42bS0xLjY3IDEwLjc4Yy4wNC45NC0uNjggMS45OC0xLjU0IDIuMzdjLTEuNzkuODItMy45MS0uODgtNS45LS44OHMtNC4xMyAxLjc3LTUuODkuODhjLTEtLjQ5LTEuNjktMS43OS0xLjU2LTIuODdjLjE4LTEuNDkgMS45Ny0yLjI5IDMuMDMtMy4zOGMxLjQxLTEuNDEgMi40MS00LjA2IDQuNDItNC4wNmMyIDAgMy4wNiAyLjYxIDQuNDEgNC4wNmMxLjExIDEuMjIgMi45NiAyLjI1IDMuMDMgMy44OCIvPjwvc3ZnPg==" alt="Pet icon" class="w-16 h-16" />
            </div>
            <button
              v-if="viewMode === 'edit'"
              @click.prevent="triggerPetPhotoUpload"
              type="button"
              class="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <CameraIcon class="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ selectedLocalPet.isNew ? 'New Pet' : getDisplayName() }}
            </h2>
            <p class="text-sm text-gray-500">
              {{ selectedLocalPet.isNew ? 'Complete the form and save to view details' : getDisplayDetails() }}
            </p>
          </div>
          <div class="flex space-x-2">
            <button 
              v-if="viewMode === 'view'"
              @click="editPet(selectedLocalPet)"
              type="button"
              class="p-2 text-gray-500 hover:text-gray-700"
              title="Edit pet"
            >
              <EditIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Pet Info Tabs - Only show when viewing an existing pet -->
        <div v-if="!selectedLocalPet.isNew && viewMode === 'view'" class="border-b border-gray-200">
          <!-- Desktop tabs (hidden on small screens) -->
          <nav class="hidden md:flex -mb-px space-x-8">
            <button
              v-for="tab in petTabs"
              :key="tab.id"
              @click.prevent="selectedPetTab = tab.id"
              type="button"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center',
                selectedPetTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <component :is="tab.icon" class="w-5 h-5 mr-2" />
              {{ tab.name }}
            </button>
          </nav>
          
          <!-- Mobile tabs (visible only on small screens) -->
          <div class="md:hidden relative">
            <button 
              @click.stop="toggleTabsDropdown"
              type="button"
              class="w-full flex items-center justify-between py-3 px-4 border rounded-md"
            >
              <div class="flex items-center">
                <component :is="getCurrentTabIcon()" class="w-5 h-5 mr-2" />
                <span>{{ getCurrentTabName() }}</span>
              </div>
              <ChevronDownIcon class="w-5 h-5" :class="{ 'transform rotate-180': tabsDropdownOpen }" />
            </button>
            
            <!-- Dropdown menu -->
            <div 
              v-show="tabsDropdownOpen" 
              class="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg tabs-dropdown"
            >
              <button
                v-for="tab in petTabs"
                :key="tab.id"
                @click.stop="selectTabAndCloseDropdown(tab.id)"
                type="button"
                :class="[
                  'w-full text-left py-3 px-4 flex items-center',
                  selectedPetTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                ]"
              >
                <component :is="tab.icon" class="w-5 h-5 mr-2" />
                {{ tab.name }}
              </button>
            </div>
          </div>
        </div>
  
        <!-- Tab Content -->
        <div>
          <!-- Basic Details Form (Only shown when editing or when basic-details tab is selected) -->
          <div v-if="viewMode === 'edit' || (viewMode === 'view' && selectedPetTab === 'basic-details')" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
              <input
                v-model="editablePet.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                @input="updateLocalPet"
                :disabled="viewMode === 'view'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Species <span class="text-red-500">*</span></label>
              <input
                v-model="editablePet.species"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                @input="updateLocalPet"
                :disabled="viewMode === 'view'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Breed <span class="text-red-500">*</span></label>
              <input
                v-model="editablePet.breed"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                @input="updateLocalPet"
                :disabled="viewMode === 'view'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Age (Years, Months, Weeks)</label>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <input
                    v-model.number="editablePet.ageYears"
                    type="number"
                    min="0"
                    placeholder="Years"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    @input="updateLocalPet"
                    :disabled="viewMode === 'view'"
                  />
                </div>
                <div>
                  <input
                    v-model.number="editablePet.ageMonths"
                    type="number"
                    min="0"
                    max="11"
                    placeholder="Months"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    @input="updateLocalPet"
                    :disabled="viewMode === 'view'"
                  />
                </div>
                <div>
                  <input
                    v-model.number="editablePet.ageWeeks"
                    type="number"
                    min="0"
                    max="3"
                    placeholder="Weeks"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    @input="updateLocalPet"
                    :disabled="viewMode === 'view'"
                  />
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                v-model.number="editablePet.weight"
                type="number"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                @input="updateLocalPet"
                :disabled="viewMode === 'view'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Gender <span class="text-red-500">*</span></label>
              <!-- Custom Gender Dropdown -->
              <div v-if="viewMode !== 'view'" class="relative">
                <div 
                  @click="toggleGenderDropdown"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm cursor-pointer flex justify-between items-center gender-dropdown"
                >
                  <span v-if="editablePet.gender">{{ formatGender(editablePet.gender) }}</span>
                  <span v-else class="text-gray-500">Select gender</span>
                  <ChevronDownIcon class="w-4 h-4 text-gray-500" :class="{ 'transform rotate-180': genderDropdownOpen }" />
                </div>
                
                <!-- Gender Dropdown Options -->
                <div 
                  v-show="genderDropdownOpen"
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg gender-dropdown"
                >
                  <div 
                    v-for="option in genderOptions" 
                    :key="option.value"
                    @click="selectGender(option.value)"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </div>
              
              <!-- View Mode Display -->
              <div v-else class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
                {{ editablePet.gender ? formatGender(editablePet.gender) : 'Not specified' }}
              </div>
            </div>
          </div>
    
          <!-- Medical History Tab Content -->
          <div v-if="selectedPetTab === 'medical-history' && viewMode === 'view' && !selectedLocalPet.isNew" class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Medical History</h3>
              <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center">
                <PlusIcon class="w-4 h-4 mr-1" />
                Add Record
              </button>
            </div>
            <div class="text-center py-8">
              <ActivityIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500">No medical history records yet.</p>
              <p class="text-sm text-gray-400 mt-1">Medical records will appear here once added.</p>
            </div>
          </div>
    
          <!-- Vaccinations Tab Content -->
          <div v-if="selectedPetTab === 'vaccinations' && viewMode === 'view' && !selectedLocalPet.isNew" class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Vaccinations</h3>
              <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center">
                <PlusIcon class="w-4 h-4 mr-1" />
                Add Vaccination
              </button>
            </div>
            <div class="text-center py-8">
              <SyringeIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500">No vaccination records yet.</p>
              <p class="text-sm text-gray-400 mt-1">Vaccination records will appear here once added.</p>
            </div>
          </div>
    
          <!-- Documents Tab Content -->
          <div v-if="selectedPetTab === 'documents' && viewMode === 'view' && !selectedLocalPet.isNew" class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Documents</h3>
              <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center">
                <PlusIcon class="w-4 h-4 mr-1" />
                Upload Document
              </button>
            </div>
            <div class="text-center py-8">
              <FolderIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500">No documents uploaded yet.</p>
              <p class="text-sm text-gray-400 mt-1">Documents will appear here once uploaded.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">Delete Pet</h3>
        <p class="mb-6">Are you sure you want to delete {{ petToDelete?.name }}? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button 
            @click.prevent="showDeleteModal = false"
            type="button"
            class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            @click.prevent="deletePet"
            type="button"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Hidden file input for pet photo -->
    <input
      type="file"
      ref="photoInput"
      @change="handlePetPhotoSelect"
      accept="image/*"
      class="hidden"
    />
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineExpose, nextTick } from 'vue';
import { 
  CameraIcon, 
  PlusIcon, 
  FileTextIcon, 
  ActivityIcon, 
  SyringeIcon, 
  FolderIcon, 
  TrashIcon,
  EyeIcon,
  EditIcon,
  ArrowLeftIcon,
  ChevronDownIcon
} from 'lucide-vue-next';
import { usePetsStore } from '@/stores/modules/petsStore';
import { useAuthStore } from '@/stores/modules/authStore';

// Stores
const petsStore = usePetsStore();
const authStore = useAuthStore();

// Emit events
const emit = defineEmits(['pet-added', 'pet-updated', 'pet-deleted', 'pets-changed']);

// State variables
const selectedPetId = ref(null);
const selectedPetTab = ref('basic-details');
const photoInput = ref(null);
const editablePet = ref({});
const showDeleteModal = ref(false);
const isLoading = ref(false);
const localPets = ref([]);
const pendingChanges = ref(false);
const deletedPetIds = ref([]);
const petToDelete = ref(null);
const viewMode = ref('edit'); // 'edit' or 'view'
const originalPets = ref([]); // Store original pet data to revert changes
const tabsDropdownOpen = ref(false); // For mobile tabs dropdown
const dropdownRef = ref(null); // Reference to the dropdown element
const genderDropdownOpen = ref(false); // For gender dropdown

// Gender options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

// Pet tabs
const petTabs = [
  { id: 'basic-details', name: 'Basic Details', icon: FileTextIcon },
  { id: 'medical-history', name: 'Medical History', icon: ActivityIcon },
  { id: 'vaccinations', name: 'Vaccinations', icon: SyringeIcon },
  { id: 'documents', name: 'Documents', icon: FolderIcon },
];

// Helper methods for tabs
const getCurrentTabName = () => {
  const tab = petTabs.find(tab => tab.id === selectedPetTab.value);
  return tab ? tab.name : 'Basic Details';
};

const getCurrentTabIcon = () => {
  const tab = petTabs.find(tab => tab.id === selectedPetTab.value);
  return tab ? tab.icon : FileTextIcon;
};

const toggleTabsDropdown = () => {
  tabsDropdownOpen.value = !tabsDropdownOpen.value;
};

const selectTabAndCloseDropdown = (tabId) => {
  selectedPetTab.value = tabId;
  tabsDropdownOpen.value = false;
};

// Gender dropdown methods
const toggleGenderDropdown = () => {
  genderDropdownOpen.value = !genderDropdownOpen.value;
};

const selectGender = (value) => {
  editablePet.value.gender = value;
  genderDropdownOpen.value = false;
  updateLocalPet();
};

const formatGender = (gender) => {
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  return gender;
};

// Computed properties
const storedPets = computed(() => petsStore.getPets);

const selectedLocalPet = computed(() => {
  if (!selectedPetId.value) return null;
  return localPets.value.find(pet => (pet.id || pet.tempId) === selectedPetId.value);
});

// Check if there's an unsaved new pet
const hasUnsavedNewPet = computed(() => {
  return localPets.value.some(pet => pet.isNew === true);
});

// Methods
// FIXED: Modified fetchPets to only emit when there's an actual change
const fetchPets = async () => {
  if (authStore.user && authStore.user.userId) {
    isLoading.value = true;
    await petsStore.fetchUserPets(authStore.user.userId);
    
    // Get the current pets from the store
    const userPets = storedPets.value;
    
    // Only emit if there's an actual change in the pets array
    const petsChanged = JSON.stringify(userPets) !== JSON.stringify(localPets.value);
    
    // Initialize local pets from store
    localPets.value = userPets.map(pet => ({ ...pet }));
    
    // Store original pets for reverting changes
    originalPets.value = JSON.parse(JSON.stringify(localPets.value));
    
    isLoading.value = false;
    pendingChanges.value = false;
    deletedPetIds.value = [];
    
    // Only emit the event if there was an actual change
    if (petsChanged) {
      emit('pets-changed', localPets.value);
    }
  }
};

// Helper methods for displaying pet information
const getDisplayName = () => {
  if (!selectedLocalPet.value) return '';
  
  if (viewMode.value === 'edit' && selectedLocalPet.value.id) {
    // For existing pets in edit mode, show the original name
    const originalPet = originalPets.value.find(p => p.id === selectedLocalPet.value.id);
    return originalPet ? originalPet.name : selectedLocalPet.value.name;
  } else {
    // For new pets or view mode, show the current name
    return selectedLocalPet.value.name;
  }
};

const getDisplayDetails = () => {
  if (!selectedLocalPet.value) return '';
  
  if (viewMode.value === 'edit' && selectedLocalPet.value.id) {
    // For existing pets in edit mode, show the original details
    const originalPet = originalPets.value.find(p => p.id === selectedLocalPet.value.id);
    return formatPetDetails(originalPet || selectedLocalPet.value);
  } else {
    // For new pets or view mode, show the current details
    return formatPetDetails(selectedLocalPet.value);
  }
};

const backToList = () => {
  // If the current pet is new and unsaved, remove it from the list
  if (selectedLocalPet.value && selectedLocalPet.value.isNew) {
    localPets.value = localPets.value.filter(pet => 
      (pet.id || pet.tempId) !== selectedLocalPet.value.tempId
    );
    pendingChanges.value = true;
  } else if (selectedLocalPet.value && selectedLocalPet.value.changed) {
    // If this is an existing pet with unsaved changes, revert to original
    const originalPet = originalPets.value.find(pet => 
      pet.id === selectedLocalPet.value.id
    );
    
    if (originalPet) {
      // Find the index of the pet in localPets
      const index = localPets.value.findIndex(pet => 
        pet.id === selectedLocalPet.value.id
      );
      
      if (index !== -1) {
        // Replace with original data
        localPets.value[index] = { ...originalPet };
        delete localPets.value[index].changed;
      }
    }
  }

  selectedPetId.value = null;
  viewMode.value = 'edit';
  tabsDropdownOpen.value = false; // Close dropdown when going back to list
  genderDropdownOpen.value = false; // Close gender dropdown when going back to list
};

const viewPet = (pet) => {
  selectedPetId.value = pet.id || pet.tempId;
  selectedPetTab.value = 'basic-details';
  viewMode.value = 'view';
  tabsDropdownOpen.value = false; // Close dropdown when opening pet view
  genderDropdownOpen.value = false; // Close gender dropdown when viewing pet

  // Create a copy of the pet for editing
  if (selectedLocalPet.value) {
    editablePet.value = { ...selectedLocalPet.value };
  }
};

const editPet = (pet) => {
  selectedPetId.value = pet.id || pet.tempId;
  viewMode.value = 'edit';
  tabsDropdownOpen.value = false; // Close dropdown when editing pet
  genderDropdownOpen.value = false; // Close gender dropdown when editing pet

  // Create a copy of the pet for editing
  if (selectedLocalPet.value) {
    editablePet.value = { ...selectedLocalPet.value };
  }
};

// This function adds a pet to local state, NOT to Firestore
const addNewPet = () => {
  // Don't allow adding a new pet if there's already an unsaved one
  if (hasUnsavedNewPet.value) {
    return;
  }

  // Create a temporary ID for the new pet
  const tempId = `temp-${Date.now()}`;

  // Create a new pet object with default values
  const newPet = {
    tempId,
    name: 'New Pet',
    species: '',
    breed: '',
    ageYears: 0,
    ageMonths: 0,
    ageWeeks: 0,
    weight: 0,
    gender: '',
    photoURL: '',
    isNew: true
  };

  // Add to local array only (not Firestore)
  localPets.value.push(newPet);
  pendingChanges.value = true;
  selectedPetId.value = tempId;
  editablePet.value = { ...newPet };
  viewMode.value = 'edit';
};

const updateLocalPet = () => {
  if (!selectedPetId.value) return;

  const index = localPets.value.findIndex(pet => 
    (pet.id || pet.tempId) === selectedPetId.value
  );

  if (index !== -1) {
    // Update the pet in the local array
    localPets.value[index] = { 
      ...localPets.value[index], 
      ...editablePet.value,
      changed: true 
    };
    pendingChanges.value = true;
  }
};

const confirmDeletePet = (pet) => {
  petToDelete.value = pet;
  showDeleteModal.value = true;
};

const deletePet = () => {
  if (!petToDelete.value) return;

  // If the pet has an ID (exists in Firestore), add to deletedPetIds
  if (petToDelete.value.id) {
    deletedPetIds.value.push(petToDelete.value.id);
  }

  // Remove from local array
  localPets.value = localPets.value.filter(pet => 
    (pet.id || pet.tempId) !== (petToDelete.value.id || petToDelete.value.tempId)
  );

  pendingChanges.value = true;
  showDeleteModal.value = false;

  // If we're deleting the currently selected pet, go back to list
  if (selectedPetId.value === (petToDelete.value.id || petToDelete.value.tempId)) {
    selectedPetId.value = null;
  }

  petToDelete.value = null;
};

const triggerPetPhotoUpload = () => {
  photoInput.value.click();
};

const handlePetPhotoSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Create a local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (selectedLocalPet.value) {
        // Store the file for later upload
        editablePet.value.photoFile = file;
        editablePet.value.photoURL = e.target.result; // Local preview
        updateLocalPet();
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error handling pet photo selection:', error);
  }
};

const formatPetAge = (pet) => {
  const parts = [];

  if (!pet.ageYears && !pet.ageMonths && !pet.ageWeeks) {
    return 'Age not specified';
  }

  if (pet.ageYears > 0) {
    parts.push(`${pet.ageYears} ${pet.ageYears === 1 ? 'year' : 'years'}`);
  }

  if (pet.ageMonths > 0) {
    parts.push(`${pet.ageMonths} ${pet.ageMonths === 1 ? 'month' : 'months'}`);
  }

  if (pet.ageWeeks > 0) {
    parts.push(`${pet.ageWeeks} ${pet.ageWeeks === 1 ? 'week' : 'weeks'}`);
  }

  return parts.join(' ');
};

// Format pet details for display
const formatPetDetails = (pet) => {
  if (!pet) return '';
  const breed = pet.breed ? pet.breed : 'Breed not specified';
  const age = formatPetAge(pet);
  return [breed, age].filter(Boolean).join(' • ');
};

// Check if a pet has the required fields filled - REMOVED VALIDATION
const isPetValid = (pet) => {
  // Always return true to bypass validation
  return true;
};

// Modified saveAllChanges to validate pets before saving
const saveAllChanges = async () => {
  if (!authStore.user || !authStore.user.userId) return false;

  // If there are no pending changes, return success immediately
  if (!pendingChanges.value && deletedPetIds.value.length === 0) {
    console.log('No pet changes to save');
    return true;
  }

  // Validation removed - we'll save regardless of field values
  
  isLoading.value = true;
  const userId = authStore.user.userId;
  let success = true;

  try {
    // Process deleted pets
    for (const petId of deletedPetIds.value) {
      const deleteSuccess = await petsStore.deletePet(userId, petId);
      if (!deleteSuccess) {
        console.error(`Failed to delete pet with ID: ${petId}`);
        success = false;
      }
    }
    
    // Process new and updated pets
    for (const pet of localPets.value) {
      // Skip pets that haven't changed
      if (pet.id && !pet.changed && !pet.isNew) continue;
      
      // Prepare pet data (remove tempId and isNew flags)
      const petData = { ...pet };
      delete petData.tempId;
      delete petData.isNew;
      delete petData.changed;
      
      // Remove photoFile property to avoid Firebase error
      if (petData.photoFile) {
        delete petData.photoFile;
      }
      
      // Set default values for required fields if they're empty
      if (!petData.name || petData.name.trim() === '') {
        petData.name = 'Unnamed Pet';
      }
      if (!petData.species || petData.species.trim() === '') {
        petData.species = 'Unspecified';
      }
      if (!petData.breed || petData.breed.trim() === '') {
        petData.breed = 'Unspecified';
      }
      if (!petData.gender || petData.gender.trim() === '') {
        petData.gender = 'Unspecified';
      }
      
      if (!pet.id) {
        // Add new pet
        const addedPet = await petsStore.addPet(userId, petData);
        if (!addedPet) {
          console.error('Failed to add new pet');
          success = false;
        }
      } else if (pet.changed) {
        // Update existing pet
        const updateSuccess = await petsStore.updatePet(userId, pet.id, petData);
        if (!updateSuccess) {
          console.error(`Failed to update pet with ID: ${pet.id}`);
          success = false;
        }
      }
    }
    
    // Refresh pets from Firestore
    if (success) {
      await fetchPets();
      pendingChanges.value = false;
      deletedPetIds.value = [];
    }
    
    return success;
  } catch (error) {
    console.error('Error saving pet changes:', error);
    return false;
  } finally {
    isLoading.value = false;
  }
};

// Improved hasPendingChanges to check both local changes and deleted pets
const hasPendingChanges = () => {
  return pendingChanges.value || deletedPetIds.value.length > 0;
};

// Handle clicks outside the dropdown to close it
const handleClickOutside = (event) => {
  // Close tabs dropdown if open and click is outside
  if (tabsDropdownOpen.value && !event.target.closest('.tabs-dropdown')) {
    tabsDropdownOpen.value = false;
  }
  
  // Close gender dropdown if open and click is outside
  if (genderDropdownOpen.value && !event.target.closest('.gender-dropdown')) {
    genderDropdownOpen.value = false;
  }
};

// Expose methods to parent component
defineExpose({
  saveAllChanges,
  hasPendingChanges,
  fetchPets
});

// Fetch pets on component mount and set up event listeners
onMounted(() => {
  fetchPets();
  document.addEventListener('click', handleClickOutside);
});

// Clean up event listeners when component is unmounted
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for changes in the selected pet
watch(selectedLocalPet, (newPet) => {
  if (newPet) {
    editablePet.value = { ...newPet };
  }
});
</script>

<style scoped>
.pet-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
}

.pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Hide scrollbar for pet selection */
.overflow-x-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>