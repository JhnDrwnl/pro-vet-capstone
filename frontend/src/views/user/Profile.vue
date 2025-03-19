<!-- views/user/Profile.vue -->
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
          <!-- Profile Section -->
          <div class="py-4 sm:py-6">
            <!-- Profile Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div class="flex flex-col items-center space-y-2">
                <!-- Profile Image with Progress Circle -->
                <div class="relative group">
                  <!-- Progress Circle -->
                  <svg class="absolute -inset-1 w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rotate-[-90deg]">
                    <circle
                      :cx="isMobile ? 44 : 52"
                      :cy="isMobile ? 44 : 52"
                      :r="isMobile ? 40 : 48"
                      stroke="#E5E7EB"
                      stroke-width="3"
                      fill="none"
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
                      :src="previewPhotoURL || form.photoURL || defaultPhotoURL"
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
                <div class="text-center">
                  <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ form.firstName }} {{ form.lastName }}</h1>
                  <p class="text-sm sm:text-base text-gray-500">{{ form.role || 'Role not set' }}</p>
                </div>
              </div>
            </div>
  
            <!-- Tabs -->
            <div class="border-b pb-1 sm:pb-2 border-gray-200 mb-2 sm:mb-6 overflow-x-auto">
              <nav class="flex space-x-2 justify-center sm:space-x-4 whitespace-nowrap">
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
              <div class="space-y-6 sm:space-y-8" style="min-height: 300px;">
                <!-- Edit Profile Info Tab -->
                <div v-show="currentTab === 'edit-profile'" class="space-y-6 sm:space-y-8">
                  <!-- Personal Information Section -->
                  <div>
                    <div class="flex items-center mb-4">
                      <div class="bg-blue-100 rounded-full p-2 mr-3">
                        <UserIcon class="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 class="text-md font-semibold text-gray-700">Personal Information</h3>
                    </div>
                    <div class="border-t border-gray-200 pt-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            v-model="form.firstName"
                            type="text"
                            placeholder="Enter first name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            v-model="form.lastName"
                            type="text"
                            placeholder="Enter last name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            v-model="form.username"
                            type="text"
                            placeholder="Enter username"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          <div class="relative">
                            <input
                              v-model="tempForm.dateOfBirth"
                              type="text"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 date-of-birth-input text-sm"
                              @input="handleDateInput"
                              @blur="validateDate"
                              ref="dateInputRef"
                            />
                            <!-- Add the placeholder overlay -->
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
                            <CalendarIcon 
                              class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
                              @click.stop="toggleCalendar"
                            />
                            <div v-if="showCalendar" :class="{'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]': isMobile}">
                              <div class="bg-white rounded-lg shadow-lg overflow-hidden" :style="getCalendarPosition()">
                                <Calendar 
                                  v-model="tempForm.dateOfBirth"
                                  @update:modelValue="handleCalendarChange"
                                  @cancel="handleCalendarCancel"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">
                            Age
                          </label>
                          <input
                            v-model="tempForm.age"
                            type="number"
                            placeholder="Enter age"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                            @input="handleAgeInput"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                          <select
                            v-model="form.gender"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Contact Information Section -->
                  <div>
                    <div class="flex items-center mb-4">
                      <div class="bg-green-100 rounded-full p-2 mr-3">
                        <PhoneIcon class="w-5 h-5 text-green-500" />
                      </div>
                      <h3 class="text-md font-semibold text-gray-700">Contact Information</h3>
                    </div>
                    <div class="border-t border-gray-200 pt-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            v-model="form.email"
                            type="email"
                            placeholder="Enter email"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            v-model="form.phone"
                            type="tel"
                            placeholder="Enter phone number"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                          <input
                            v-model="form.whatsapp"
                            type="tel"
                            placeholder="Enter WhatsApp number"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Alternative Email</label>
                          <input
                            v-model="form.alternativeEmail"
                            type="email"
                            placeholder="Enter alternative email"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Address Section -->
                  <div>
                    <div class="flex items-center mb-4">
                      <div class="bg-red-100 rounded-full p-2 mr-3">
                        <MapPinIcon class="w-5 h-5 text-red-500" />
                      </div>
                      <h3 class="text-md font-semibold text-gray-700">Address</h3>
                    </div>
                    <div class="border-t border-gray-200 pt-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="sm:col-span-2">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                          <input
                            id="addressInput"
                            v-model="form.streetAddress"
                            type="text"
                            placeholder="Enter street address"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                            @focus="initializeAutocomplete"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            v-model="form.city"
                            type="text"
                            placeholder="Enter city"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                          <input
                            v-model="form.province"
                            type="text"
                            placeholder="Enter province"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            v-model="form.postalCode"
                            type="text"
                            placeholder="Enter postal code"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            v-model="form.country"
                            type="text"
                            placeholder="Enter country"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
  
                <!-- Pet Info Tab -->
                <div v-show="currentTab === 'pet-info'">
                  <Pets ref="petsComponent" />
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { CameraIcon, CalendarIcon, UserIcon, PhoneIcon, MapPinIcon } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import Calendar from '@/components/common/Calendar.vue';
import Pets from '@/views/user/Pets.vue'; // Import the new Pets component
import { usePetsStore } from '@/stores/modules/petsStore';
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
const petsStore = usePetsStore();

const tabs = [
  { id: 'edit-profile', name: 'Edit Profile Info' },
  { id: 'pet-info', name: 'My Pets' },
];

const currentTab = ref('edit-profile');
const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  age: null,
  gender: '',
  email: '',
  phone: '',
  whatsapp: '',
  alternativeEmail: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  country: '',
  photoURL: '',
  pets: [],
});
const displayedProfile = ref({});
const showCalendar = ref(false);
const dateInput = ref('');
const datePlaceholder = ref('YYYY-MM-DD');
const dateInputRef = ref(null);
const fileInput = ref(null);
const addressInput = ref(null);
const showCameraHover = ref(false);
const isCameraClicked = ref(false);
const isSaving = ref(false);
const petsComponent = ref(null);
let autocomplete = null;
let googleMapsLoaded = false;

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

// Fixed SVG placeholder
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
      googleMapsLoaded = true;
      console.log('Google Maps API loaded');
    };
    document.head.appendChild(script);
  } else {
    googleMapsLoaded = true;
  }
};

onMounted(async () => {
  if (authStore.user && authStore.user.userId) {
    await fetchUserProfile();
  }
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  document.addEventListener('keydown', handleKeyDown);
  loadGoogleMapsAPI();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('keydown', handleKeyDown);
  if (autocomplete) {
    google.maps.event.clearInstanceListeners(autocomplete);
  }
});

const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

watch(() => props.isSidebarOpen, async (newValue) => {
  if (newValue && authStore.user && authStore.user.userId) {
    await fetchUserProfile();
    dateInput.value = form.value.dateOfBirth || '';
  }
});

const fetchUserProfile = async () => {
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
};

// Modified handleSave to separate profile and pet saving
const handleSave = async () => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    if (authStore.user && authStore.user.userId) {
      const userId = authStore.user.userId;
      
      // Check which tab is active to determine what to save
      if (currentTab.value === 'edit-profile') {
        // Only save profile data when on the profile tab
        console.log('Saving only profile data...');
        
        // Create a complete form data object with all profile fields
        const updatedFormData = {
          // Start with the original profile data
          ...displayedProfile.value,
          // Add all regular form fields
          ...form.value,
          // Add fields from tempForm (like dateOfBirth and age)
          dateOfBirth: tempForm.value.dateOfBirth,
          age: tempForm.value.age
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
        
        // Save only profile data to Firestore
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
          
          console.log('Profile updated successfully!');
        } else {
          console.error('Failed to update profile. Please try again.');
        }
      } 
      else if (currentTab.value === 'pet-info' && petsComponent.value) {
        // Only save pet data when on the pet tab
        console.log('Saving only pet data...');
        
        // Check if the component has pending changes
        if (petsComponent.value.hasPendingChanges && petsComponent.value.hasPendingChanges()) {
          const petSaveSuccess = await petsComponent.value.saveAllChanges();
          
          if (!petSaveSuccess) {
            console.error('Failed to save pet changes. Please try again.');
          } else {
            console.log('Pet changes saved successfully!');
          }
        } else {
          console.log('No pet changes to save.');
        }
      }
    }
  } catch (error) {
    console.error('Error updating data:', error);
  } finally {
    isSaving.value = false;
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

const calculateProgress = computed(() => {
  const fields = [
    'firstName',
    'lastName',
    'username',
    'dateOfBirth',
    'age',
    'gender',
    'email',
    'phone',
    'whatsapp',
    'alternativeEmail',
    'streetAddress',
    'city',
    'province',
    'postalCode',
    'country',
    'photoURL'
  ];

  const filledFields = fields.filter(field => {
    const value = photoChanged.value && field === 'photoURL' 
      ? previewPhotoURL.value || form.value[field]
      : form.value[field];
    return value && value !== null && value !== undefined && String(value).trim() !== '';
  }).length;
  
  return Math.round((filledFields / fields.length) * 100);
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

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value;
  if (showCalendar.value && !isMobile.value) {
    nextTick(() => {
      const calendarElement = document.querySelector('.calendar-dropdown');
      if (calendarElement) {
        const { top, left, bottom, right } = getCalendarPosition();
        Object.assign(calendarElement.style, { top, left, bottom, right });
      }
    });
  }
};

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

const handleCalendarChange = (newValue) => {
  tempForm.value.dateOfBirth = newValue;
  tempForm.value.age = calculateAge(newValue);
  showCalendar.value = false;
};

const handleCalendarCancel = () => {
  showCalendar.value = false;
  tempForm.value.dateOfBirth = displayedProfile.value.dateOfBirth || '';
  tempForm.value.age = calculateAge(tempForm.value.dateOfBirth);
};

const handleClickOutside = (event) => {
  if (showCalendar.value && 
      !event.target.closest('.calendar-dropdown') && 
      !event.target.closest('.date-of-birth-input') &&
      (isMobile.value || !dateInputRef.value.contains(event.target))) {
    handleCalendarCancel();
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
    alert('Failed to preview profile picture. Please try again.');
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

const getCalendarPosition = () => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto',
      zIndex: 1000,
    };
  } else {
    const inputRect = dateInputRef.value.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    if (spaceBelow >= 300 || spaceBelow > spaceAbove) {
      return {
        position: 'absolute',
        top: `${inputRect.height + 5}px`,
        left: '0',
        zIndex: 1000,
      };
    } else {
      return {
        position: 'absolute',
        bottom: `${inputRect.height + 5}px`,
        left: '0',
        zIndex: 1000,
      };
    }
  }
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && showCalendar.value) {
    handleCalendarCancel();
  }
};

const handleAgeInput = (event) => {
  // Allow manual editing of age without recalculating from date of birth
  tempForm.value.age = event.target.value;
};
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