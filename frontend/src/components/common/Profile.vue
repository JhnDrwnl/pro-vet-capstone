<!-- components/common/Profile.vue -->
<template>
  <div class="min-h-screen bg-gray-50 rounded-2xl overflow-hidden">
    <!-- Banner with gradient background -->
    <div 
      class="h-32 sm:h-40 md:h-60 w-full bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl"
      style="background-image: linear-gradient(to right, rgb(110, 231, 183), rgb(59, 130, 246));"
    ></div>
  
    <!-- Profile Section -->
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative -mt-16 sm:-mt-20 md:-mt-24">
        <div class="bg-white rounded-2xl shadow px-2 sm:px-6 py-2 sm:py-6">
          <!-- Show loading spinner during initial data load -->
          <LoadingSpinner v-if="initialLoading" isOverlay text="Loading profile..." />
          
          <!-- Profile Section - Only show when data is loaded -->
          <div v-if="!initialLoading" class="py-4 sm:py-6">
            <!-- Profile Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div class="flex flex-row items-center space-x-4 sm:space-x-5">
                <!-- Profile Image with Progress Circle -->
                <div class="relative group">
                  <!-- Progress Circle -->
                  <svg class="absolute -inset-1 w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rotate-[-90deg]">
                    <circle
                      cx="44"
                      cy="44"
                      r="40"
                      stroke="#E5E7EB"
                      stroke-width="3"
                      fill="none"
                      class="sm:hidden"
                    />
                    <circle
                      cx="52"
                      cy="52"
                      r="48"
                      stroke="#E5E7EB"
                      stroke-width="3"
                      fill="none"
                      class="hidden sm:block"
                    />
                    <circle
                      :cx="isMobile ? 44 : 52"
                      :cy="isMobile ? 44 : 52"
                      :r="isMobile ? 40 : 48"
                      :stroke="progressColor"
                      stroke-width="3"
                      fill="none"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="dashOffset"
                      class="transition-all duration-700 ease-out"
                    />
                  </svg>
                  
                  <!-- Profile Image Container -->
                  <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 p-1 relative z-10">
                    <img
                      :src="previewPhotoURL || displayedProfile.photoURL || defaultPhotoURL"
                      alt="Profile"
                      class="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  
                  <!-- Camera Button -->
                  <button
                    @click="handleCameraClick"
                    @mouseenter="showCameraHover = true"
                    @mouseleave="showCameraHover = false"
                    class="absolute bottom-1 right-1 sm:bottom-2 sm:right-0 bg-[#2d80eb] text-white p-1 sm:p-1.5 rounded-full shadow-lg hover:bg-[#0453b9] transition-transform transform hover:scale-110 z-20"
                  >
                    <CameraIcon class="w-3 h-3 text-white" />
                  </button>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileSelect"
                    accept="image/*"
                    class="hidden"
                  />
                  
                  <!-- Progress Percentage (visible on hover) -->
                  <div 
                    class="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-medium shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    :class="{ 'pointer-events-none opacity-0': showCameraHover || isCameraClicked }"
                  >
                    {{ progressPercentage }}%
                  </div>
                </div>
  
                <!-- Profile Info -->
                <div class="text-left">
                  <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
                    {{ displayedProfile.firstName }} {{ displayedProfile.lastName }}
                  </h1>
                  <p class="text-sm sm:text-base text-gray-500">{{ displayedProfile.role || 'Role not set' }}</p>
                </div>
              </div>
            </div>
  
            <!-- Tabs -->
            <div class="border-b pb-1 sm:pb-2 border-gray-200 mb-2 sm:mb-6 overflow-x-auto">
              <nav class="flex space-x-2 sm:space-x-4 whitespace-nowrap">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="currentTab = tab.id"
                  :class="[
                    'px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm font-medium rounded-full transition-colors min-w-[70px] sm:min-w-[80px] whitespace-nowrap',
                    currentTab === tab.id
                      ? 'bg-[#EBF5FF] text-[#0066FF]'
                      : 'text-gray-900 hover:text-gray-700'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>
  
            <!-- Form Content -->
            <form @submit.prevent="handleSave" class="mt-4 sm:mt-6 w-full">
              <div class="space-y-1 sm:space-y-0 sm:gap-4" style="min-height: 300px;">
                <!-- Personal Information -->
                <div v-show="currentTab === 'personal'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">First Name</label>
                    <input
                      v-model="form.firstName"
                      type="text"
                      placeholder="Enter first name"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Last Name</label>
                    <input
                      v-model="form.lastName"
                      type="text"
                      placeholder="Enter last name"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Username</label>
                    <input
                      v-model="form.username"
                      type="text"
                      placeholder="Enter username"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">
                      Date of Birth
                    </label>
                    <div class="relative">
                      <input
                        v-model="tempForm.dateOfBirth"
                        type="text"
                        class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 date-of-birth-input h-8 sm:h-12 text-sm sm:text-base"
                        @input="handleDateInput"
                        @blur="validateDate"
                        ref="dateInputRef"
                      />
                      <span 
                        class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      >
                        <template v-for="(char, index) in dateOfBirthPlaceholder" :key="index">
                          <span 
                            :class="getCharClass(index)"
                            :style="{ visibility: char.visible ? 'visible' : 'hidden' }"
                          >
                            {{ char.value }}
                          </span>
                        </template>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">
                      Age
                    </label>
                    <input
                      v-model="tempForm.age"
                      type="number"
                      placeholder="Enter age"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                      @input="handleAgeInput"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Gender</label>
                    <!-- Custom Gender Dropdown -->
                    <div class="relative">
                      <div 
                        @click="toggleGenderDropdown"
                        class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base cursor-pointer flex justify-between items-center gender-dropdown"
                      >
                        <span v-if="form.gender">{{ formatGender(form.gender) }}</span>
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
                  </div>
                </div>
  
                <!-- Contact Information -->
                <div v-show="currentTab === 'contact'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Email</label>
                    <input
                      v-model="form.email"
                      type="email"
                      placeholder="Enter email"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Phone</label>
                    <input
                      v-model="form.phone"
                      type="tel"
                      placeholder="Enter phone number"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">WhatsApp</label>
                    <input
                      v-model="form.whatsapp"
                      type="tel"
                      placeholder="Enter WhatsApp number"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Alternative Email</label>
                    <input
                      v-model="form.alternativeEmail"
                      type="email"
                      placeholder="Enter alternative email"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>
  
                <!-- Address -->
                <div v-show="currentTab === 'address'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Street Address</label>
                    <input
                      id="addressInput"
                      v-model="form.streetAddress"
                      type="text"
                      placeholder="Enter street address"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                      @focus="initializeAutocomplete"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">City</label>
                    <input
                      v-model="form.city"
                      type="text"
                      placeholder="Enter city"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Province</label>
                    <input
                      v-model="form.province"
                      type="text"
                      placeholder="Enter province"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Postal Code</label>
                    <input
                      v-model="form.postalCode"
                      type="text"
                      placeholder="Enter postal code"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-0 sm:mb-1">Country</label>
                    <input
                      v-model="form.country"
                      type="text"
                      placeholder="Enter country"
                      class="w-full px-2 sm:px-3 py-0.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 h-8 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
  
              <!-- Submit and Cancel Buttons -->
              <div class="mt-6 flex flex-col sm:flex-row justify-start sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  @click="closeAttachment"
                  class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-200 text-red-800 hover:bg-red-300 transition-colors text-xs sm:text-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                  :disabled="isSaving"
                >
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
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
        {{ errorMessage }}
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
  
  <!-- Loading Spinner for operations (not initial loading) -->
  <LoadingSpinner v-if="loading && !initialLoading" isOverlay text="Processing..." />
</template>
  
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { 
  PhoneIcon, 
  MailIcon, 
  MapPinIcon, 
  CameraIcon, 
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
// Import Firebase Storage functions
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@shared/firebase';

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true, // Make it optional with a default value of true
  },
});

const emit = defineEmits(['close', 'save', 'update:modelValue']);

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const tabs = [
  { id: 'personal', name: 'Personal' },
  { id: 'contact', name: 'Contact' },
  { id: 'address', name: 'Address' },
];

const currentTab = ref('personal');
const form = ref({});
const displayedProfile = ref({});
const dateInput = ref('');
const datePlaceholder = ref('YYYY-MM-DD');
const dateInputRef = ref(null);
const fileInput = ref(null);
const addressInput = ref(null);
const showCameraHover = ref(false);
const isCameraClicked = ref(false);
const isSaving = ref(false);
const genderDropdownOpen = ref(false);
let autocomplete = null;
let googleMapsLoaded = false;

// Add state variables for loading and modals
const initialLoading = ref(true);
const loading = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const statusMessage = ref('');
const errorMessage = ref('');

// Declare google variable
let google;

// Add refs for profile picture handling
const selectedProfilePicture = ref(null);
const previewPhotoURL = ref(null);
const photoChanged = ref(false);

const orientalMindoroPostalCodes = {
  'Baco': '5201',
  'Bansud': '5210',
  'Bongabong': '5211',
  'Bulalacao': '5214',
  'Calapan City': '5200',
  'Gloria': '5209',
  'Mansalay': '5212',
  'Naujan': '5204',
  'Pinamalayan': '5208',
  'Pola': '5206',
  'Puerto Galera': '5203',
  'Roxas': '5213',
  'San Teodoro': '5202',
  'Socorro': '5207',
  'Victoria': '5205'
};

// Gender options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const defaultPhotoURL = ref('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E');

const tempForm = ref({});

const isMobile = ref(window.innerWidth < 640);

watch(form, (newForm) => {
  profileStore.calculateCompletionPercentage(newForm);
}, { deep: true });

const loadGoogleMapsAPI = () => {
  if (typeof google === 'undefined') {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      google = window.google;
      googleMapsLoaded = true;
      console.log('Google Maps API loaded');
    };
    document.head.appendChild(script);
  } else {
    googleMapsLoaded = true;
  }
};

const fetchUserProfile = async () => {
  try {
    const profile = await profileStore.fetchUserProfile(authStore.user.userId);
    if (profile) {
      form.value = { ...profile };
      tempForm.value = { ...profile };
      displayedProfile.value = { ...profile };
      dateInput.value = profile.dateOfBirth || '';
      
      // Reset photo change tracking
      selectedProfilePicture.value = null;
      previewPhotoURL.value = null;
      photoChanged.value = false;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

onMounted(async () => {
  initialLoading.value = true;
  try {
    if (authStore.user && authStore.user.userId) {
      await fetchUserProfile();
    }
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    loadGoogleMapsAPI();
  } catch (error) {
    console.error('Error loading profile:', error);
    errorMessage.value = 'Failed to load profile data. Please try again.';
    showErrorModal.value = true;
  } finally {
    initialLoading.value = false;
  }
});

watch(() => props.isSidebarOpen, async (newValue) => {
  if (newValue && authStore.user && authStore.user.userId) {
    loading.value = true;
    try {
      await fetchUserProfile();
      dateInput.value = form.value.dateOfBirth || '';
    } catch (error) {
      console.error('Error refreshing profile:', error);
      errorMessage.value = 'Failed to refresh profile data. Please try again.';
      showErrorModal.value = true;
    } finally {
      loading.value = false;
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('keydown', handleKeyDown);
  if (autocomplete) {
    if (google && google.maps) {
      google.maps.event.clearInstanceListeners(autocomplete);
    }
  }
});

const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

// Gender dropdown methods
const toggleGenderDropdown = () => {
  genderDropdownOpen.value = !genderDropdownOpen.value;
};

const selectGender = (value) => {
  form.value.gender = value;
  genderDropdownOpen.value = false;
};

const formatGender = (gender) => {
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  if (gender === 'other') return 'Other';
  return gender;
};

// Modified handleSave to use loading spinner and show modals
const handleSave = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  loading.value = true;

  try {
    if (authStore.user && authStore.user.userId) {
      const userId = authStore.user.userId;
      
      // Create a complete form data object with all fields
      const updatedFormData = {
        // Start with the original profile data
        ...displayedProfile.value,
        // Add all regular form fields
        ...form.value,
        // Add fields from tempForm (like dateOfBirth and age)
        dateOfBirth: tempForm.value.dateOfBirth,
        age: tempForm.value.age,
        // Add updated timestamp
        updatedAt: new Date()
      };
      
      // Handle profile picture upload if changed
      if (photoChanged.value && selectedProfilePicture.value) {
        const file = selectedProfilePicture.value;
        
        // Create a reference to the storage location
        const fileRef = storageRef(storage, `profile-pictures/${userId}/${Date.now()}_${file.name}`);
        
        // Upload the file
        console.log('Uploading file to Firebase Storage...');
        const snapshot = await uploadBytes(fileRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File uploaded successfully. Download URL:', downloadURL);
        
        // Update the photoURL in the form data
        updatedFormData.photoURL = downloadURL;
      }
      
      console.log('Saving profile data to Firestore:', updatedFormData);
      
      // Save all profile data to Firestore
      const success = await profileStore.updateUserProfile(userId, updatedFormData);
      
      if (success) {
        // Update displayed profile with the new data
        displayedProfile.value = { ...updatedFormData };
        
        // Important: Update form.value with the new data including the photoURL
        form.value = { ...updatedFormData };
        
        // Reset photo change tracking but keep the new photoURL visible
        if (photoChanged.value) {
          selectedProfilePicture.value = null;
          previewPhotoURL.value = null;
          photoChanged.value = false;
        }
        
        // Show success message
        statusMessage.value = 'Profile updated successfully!';
        showSuccessModal.value = true;
        
        console.log('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    errorMessage.value = error.message || 'An error occurred while saving changes.';
    showErrorModal.value = true;
  } finally {
    isSaving.value = false;
    loading.value = false;
  }
};

const closeAttachment = () => {
  // Reset form to displayed profile
  form.value = { ...displayedProfile.value };
  tempForm.value = { ...displayedProfile.value };
  
  // Clear any selected file that wasn't saved
  selectedProfilePicture.value = null;
  previewPhotoURL.value = null;
  photoChanged.value = false;
  
  router.push('/admin/dashboard');
};

// Updated calculateProgress computed property for more accurate percentage
const calculateProgress = computed(() => {
  // Define required fields for each tab
  const personalFields = ['firstName', 'lastName', 'username', 'dateOfBirth', 'age', 'gender'];
  const contactFields = ['email', 'phone'];
  const addressFields = ['streetAddress', 'city', 'province', 'country'];
  
  // Optional fields that contribute to progress but aren't required for 100%
  const optionalFields = ['whatsapp', 'alternativeEmail', 'postalCode'];
  
  // Photo is considered a separate field
  const hasPhoto = photoChanged.value ? !!previewPhotoURL.value : !!form.value.photoURL;
  
  // Count filled required fields
  const countFilledFields = (fields) => {
    return fields.filter(field => {
      const value = field === 'dateOfBirth' || field === 'age' 
        ? tempForm.value[field] 
        : form.value[field];
      return value && String(value).trim() !== '';
    }).length;
  };
  
  // Count filled fields in each category
  const filledPersonal = countFilledFields(personalFields);
  const filledContact = countFilledFields(contactFields);
  const filledAddress = countFilledFields(addressFields);
  const filledOptional = countFilledFields(optionalFields);
  
  // Calculate total required fields and filled required fields
  const totalRequiredFields = personalFields.length + contactFields.length + addressFields.length + 1; // +1 for photo
  const filledRequiredFields = filledPersonal + filledContact + filledAddress + (hasPhoto ? 1 : 0);
  
  // Calculate bonus from optional fields (max 10% of total)
  const optionalBonus = Math.min(filledOptional / optionalFields.length * 10, 10);
  
  // Calculate base percentage from required fields
  const basePercentage = (filledRequiredFields / totalRequiredFields) * 90;
  
  // Total percentage is base + bonus, capped at 100%
  return Math.min(Math.round(basePercentage + optionalBonus), 100);
});

const circumference = computed(() => 2 * Math.PI * (isMobile.value ? 40 : 48));
const dashOffset = computed(() => 
  circumference.value - (calculateProgress.value / 100) * circumference.value
);
const progressPercentage = computed(() => 
  Math.round(calculateProgress.value)
);
const progressColor = computed(() => {
  if (calculateProgress.value < 30) return '#EF4444';
  if (calculateProgress.value < 70) return '#F59E0B';
  return '#10B981';
});

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

const calculatedAge = computed(() => {
  if (!form.value.dateOfBirth) return null;
  return calculateAge(form.value.dateOfBirth);
});

const handleClickOutside = (event) => {
  // Close gender dropdown if open and click is outside
  if (genderDropdownOpen.value && !event.target.closest('.gender-dropdown')) {
    genderDropdownOpen.value = false;
  }
  
  // Close modals if open and click is outside
  if (showSuccessModal.value && !event.target.closest('.success-modal')) {
    showSuccessModal.value = false;
  }
  
  if (showErrorModal.value && !event.target.closest('.error-modal')) {
    showErrorModal.value = false;
  }
};

const handleDateInput = (event) => {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  let value = input.value.replace(/[^0-9-]/g, '');

  const parts = value.split('-');
  while (parts.length < 3) {
    parts.push('');
  }
  value = parts.join('-');

  const maxLengths = [4, 2, 2];
  const newParts = value.split('-').map((part, index) => part.slice(0, maxLengths[index]));
  value = newParts.join('-');

  tempForm.value.dateOfBirth = value;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    tempForm.value.age = calculateAge(value);
  }

  nextTick(() => {
    input.selectionStart = input.selectionEnd = Math.min(cursorPosition, value.length);
  });
};

const validateDate = () => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (datePattern.test(tempForm.value.dateOfBirth)) {
    tempForm.value.age = calculateAge(tempForm.value.dateOfBirth);
  } else {
    tempForm.value.dateOfBirth = '';
  }
};

// Modified handleFileSelect to only store the file and show a preview
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    // Store the file for later upload
    selectedProfilePicture.value = file;
    photoChanged.value = true;
    
    // Show a temporary preview immediately for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      previewPhotoURL.value = e.target.result; // Temporary local preview
    };
    reader.readAsDataURL(file);
    
    console.log('Profile picture selected and preview shown. Will upload on save.');
  } catch (error) {
    console.error('Error handling profile picture selection:', error);
    errorMessage.value = 'Failed to preview profile picture. Please try again.';
    showErrorModal.value = true;
  }
};

const handlePlaceSelect = () => {
  const place = autocomplete.getPlace();
  if (!place.geometry) return;

  let addressComponents = {
    street_number: '',
    route: '',
    sublocality_level_1: '',
    locality: '',
    administrative_area_level_2: '',
    administrative_area_level_1: '',
    country: '',
    postal_code: ''
  };

  for (const component of place.address_components) {
    const componentType = component.types[0];
    if (addressComponents.hasOwnProperty(componentType)) {
      addressComponents[componentType] = component.long_name;
    }
  }

  form.value.streetAddress = `${addressComponents.street_number} ${addressComponents.route}`.trim();
  form.value.city = addressComponents.locality || addressComponents.sublocality_level_1 || addressComponents.administrative_area_level_2;
  
  if (addressComponents.administrative_area_level_1 === 'MIMAROPA') {
    const orientalMindoroCities = Object.keys(orientalMindoroPostalCodes);
    if (orientalMindoroCities.includes(form.value.city)) {
      form.value.province = 'Oriental Mindoro';
    } else {
      form.value.province = 'MIMAROPA';
    }
  } else if (addressComponents.administrative_area_level_1 === 'Oriental Mindoro') {
    form.value.province = 'Oriental Mindoro';
  } else {
    form.value.province = addressComponents.administrative_area_level_1 || '';
  }

  form.value.country = addressComponents.country;

  if (addressComponents.postal_code) {
    form.value.postalCode = addressComponents.postal_code;
  } else {
    const city = form.value.city.trim();
    form.value.postalCode = orientalMindoroPostalCodes[city] || '';
  }

  if (!form.value.streetAddress) {
    form.value.streetAddress = place.formatted_address;
  }

  console.log('Selected place details:', place);
  console.log('Address components:', addressComponents);
  console.log('Set province:', form.value.province);
  console.log('Set city:', form.value.city);
  console.log('Set postal code:', form.value.postalCode);
};

const initializeAutocomplete = () => {
  if (!googleMapsLoaded) {
    console.warn('Google Maps API not loaded yet. Retrying in 1 second.');
    setTimeout(initializeAutocomplete, 1000);
    return;
  }

  if (autocomplete) {
    return;
  }

  const addressInput = document.getElementById('addressInput');
  if (addressInput) {
    autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['geocode'],
      componentRestrictions: { country: 'ph' }
    });

    autocomplete.addListener('place_changed', handlePlaceSelect);
    console.log('Autocomplete initialized');
  } else {
    console.warn('Address input not found');
  }
};

const handleCameraClick = () => {
  isCameraClicked.value = true;
  fileInput.value.click();
  setTimeout(() => {
    isCameraClicked.value = false;
  }, 300);
};

const getCharClass = (index) => {
  if (!tempForm.value.dateOfBirth) return 'text-gray-300';
  const parts = tempForm.value.dateOfBirth.split('-');
  
  let currentIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    if (index < currentIndex + parts[i].length) {
      return 'text-transparent';
    } else if (index === currentIndex + parts[i].length && i < 2) {
      return 'text-gray-400';
    }
    currentIndex += parts[i].length + 1;
  }
  
  return 'text-gray-300';
};

const isPlaceholderVisible = (index) => {
  if (!tempForm.value.dateOfBirth) return true;
  const parts = tempForm.value.dateOfBirth.split('-');
  let currentIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    if (index < currentIndex + parts[i].length) {
      return false;
    }
    currentIndex += parts[i].length + 1;
  }
  return true;
};

const dateOfBirthPlaceholder = computed(() => {
  const placeholder = 'YYYY-MM-DD';
  return placeholder.split('').map((char, index) => ({
    value: char,
    visible: isPlaceholderVisible(index)
  }));
});

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    if (genderDropdownOpen.value) {
      genderDropdownOpen.value = false;
    }
    if (showSuccessModal.value) {
      showSuccessModal.value = false;
    }
    if (showErrorModal.value) {
      showErrorModal.value = false;
    }
  }
};

const handleAgeInput = (event) => {
  // Allow manual editing of age without recalculating from date of birth
  tempForm.value.age = event.target.value;
};

// Add a watch effect to update age when date of birth changes
watch(() => tempForm.value.dateOfBirth, (newDateOfBirth) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(newDateOfBirth)) {
    tempForm.value.age = calculateAge(newDateOfBirth);
  }
});

if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not set. Please check your environment variables.');
}
</script>
  
<style scoped>
.date-of-birth-input {
  font-family: monospace;
}
.h-32 {
  background-image: linear-gradient(to right, rgb(110, 231, 183), rgb(59, 130, 246));
}
@media (max-width: 640px) {
  input, select {
    font-size: 16px; /* Prevents zoom on focus in iOS */
  }
}
</style>