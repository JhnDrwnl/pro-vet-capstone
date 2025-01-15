<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Banner with gradient background -->
    <div 
      class="h-60 w-full rounded-lg bg-gradient-to-r from-green-400 via-blue-400 to-purple-500"
      style="background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);"
    ></div>

    <!-- Profile Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative -mt-12 sm:-mt-16">
        <div class="bg-white rounded-lg shadow px-6 py-6">
          <!-- Profile Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-5">
              <!-- Profile Image with Progress Circle -->
              <div class="relative group">
                <!-- Progress Circle -->
                <svg class="absolute -inset-1 w-[104px] h-[104px] rotate-[-90deg]">
                  <circle
                    cx="52"
                    cy="52"
                    r="48"
                    stroke="#E5E7EB"
                    stroke-width="3"
                    fill="none"
                  />
                  <circle
                    cx="52"
                    cy="52"
                    r="48"
                    :stroke="progressColor"
                    stroke-width="3"
                    fill="none"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset"
                    class="transition-all duration-700 ease-out"
                  />
                </svg>
                
                <!-- Profile Image Container -->
                <div class="w-24 h-24 rounded-full bg-gray-300 p-1 relative z-10">
                  <img
                    :src="form.photoURL || defaultPhotoURL"
                    alt="Profile"
                    class="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                
                <!-- Camera Button -->
                <button
                  @click="handleCameraClick"
                  @mouseenter="showCameraHover = true"
                  @mouseleave="showCameraHover = false"
                  class="absolute bottom-2 right-0 bg-[#2d80eb] text-white p-1.5 rounded-full shadow-lg hover:bg-[#0453b9] transition-transform transform hover:scale-110 z-20"
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
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ form.firstName }} {{ form.lastName }}</h1>
                <p class="text-gray-500">{{ form.role || 'Role not set' }}</p>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b pb-2 border-gray-200 mb-8">
            <nav class="flex space-x-4">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="currentTab = tab.id"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-full transition-colors',
                  currentTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSave" class="mt-6">
            <div class="p-4 space-y-4" style="min-height: 400px;">
              <!-- Personal Information -->
              <div v-show="currentTab === 'personal'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    v-model="form.firstName"
                    type="text"
                    placeholder="Enter first name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    v-model="form.lastName"
                    type="text"
                    placeholder="Enter last name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    v-model="form.username"
                    type="text"
                    placeholder="Enter username"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div class="relative">
                    <input
                      v-model="dateInput"
                      type="text"
                      class="w-full px-3 py-1.5 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all bg-gray-50 text-sm cursor-text date-of-birth-input"
                      @input="handleDateInput"
                      @blur="validateDate"
                      ref="dateInputRef"
                    />
                    <span 
                      class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    >
                      <template v-for="(char, index) in 'YYYY-MM-DD'" :key="index">
                        <span 
                          :class="getCharClass(index, $refs.dateInputRef)"
                          :style="{ visibility: isPlaceholderVisible(index) ? 'visible' : 'hidden' }"
                        >
                          {{ char }}
                        </span>
                      </template>
                    </span>
                    <CalendarIcon 
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
                      @click.stop="toggleCalendar"
                    />
                    <div 
                      v-if="showCalendar" 
                      class="absolute z-[9999]"
                      style="top: calc(100% + 5px); left: 0;"
                    >
                      <div class="relative">
                        <Calendar 
                          v-model="dateInput"
                          @update:modelValue="handleCalendarChange"
                          @cancel="handleCalendarCancel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    v-model="form.age"
                    type="number"
                    placeholder="Calculated from Date of Birth"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    v-model="form.gender"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Contact Information -->
              <div v-show="currentTab === 'contact'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Enter email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="Enter phone number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    v-model="form.whatsapp"
                    type="tel"
                    placeholder="Enter WhatsApp number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Alternative Email</label>
                  <input
                    v-model="form.alternativeEmail"
                    type="email"
                    placeholder="Enter alternative email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
              </div>

              <!-- Address -->
              <div v-show="currentTab === 'address'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    id="addressInput"
                    v-model="form.streetAddress"
                    type="text"
                    placeholder="Enter street address"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                    @focus="initializeAutocomplete"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    placeholder="Enter city"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    v-model="form.province"
                    type="text"
                    placeholder="Enter province"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    placeholder="Enter postal code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    v-model="form.country"
                    type="text"
                    placeholder="Enter country"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                  />
                </div>
              </div>
            </div>

            <!-- Submit and Cancel Buttons -->
            <div class="mt-6 flex justify-end space-x-4">
    <button
      type="button"
      @click="closeAttachment"
      class="px-6 py-2 rounded-full bg-red-200 text-red-800 hover:bg-red-300 transition-colors"
    >
      Close
    </button>
    <button
      type="submit"
      class="px-6 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition-colors"
      :disabled="isSaving"
    >
      {{ isSaving ? 'Saving...' : 'Save Changes' }}
    </button>
  </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Popup -->
    <div v-if="showPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
        <div class="flex items-center justify-center mb-4">
          <div v-if="isSuccess" class="bg-green-100 rounded-full p-2">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div v-else class="bg-red-100 rounded-full p-2">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-semibold text-center mb-2">{{ isSuccess ? 'Success!' : 'Error' }}</h3>
        <p class="text-center">{{ popupMessage }}</p>
        <div class="flex justify-center mt-4">
          <button @click="closePopup" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { PhoneIcon, MailIcon, MapPinIcon, CameraIcon, CalendarIcon } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import Calendar from './Calendar.vue';

const props = defineProps({
  isOpen: Boolean,
  isSidebarOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'save', 'update:modelValue', 'update:isOpen']);

const authStore = useAuthStore();
const profileStore = useProfileStore();

const tabs = [
  { id: 'personal', name: 'Personal Information' },
  { id: 'contact', name: 'Contact Information' },
  { id: 'address', name: 'Address' },
];

const currentTab = ref('personal');
const form = ref({});
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
const showPopup = ref(false);
const isSuccess = ref(false);
const popupMessage = ref('');
let autocomplete = null;
let googleMapsLoaded = false;

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

const defaultPhotoURL = ref('/images/default-avatar.png');

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
  
  loadGoogleMapsAPI();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (autocomplete) {
    google.maps.event.clearInstanceListeners(autocomplete);
  }
});

watch(() => props.isOpen, async (newValue) => {
  if (newValue && authStore.user && authStore.user.userId) {
    await fetchUserProfile();
    dateInput.value = form.value.dateOfBirth || '';
  }
});

const fetchUserProfile = async () => {
  const profile = await profileStore.fetchUserProfile(authStore.user.userId);
  if (profile) {
    form.value = { ...profile };
    displayedProfile.value = { ...profile };
    dateInput.value = profile.dateOfBirth || '';
  }
};

const handleSave = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    if (authStore.user && authStore.user.userId) {
      const success = await profileStore.updateUserProfile(authStore.user.userId, form.value);
      if (success) {
        displayedProfile.value = { ...form.value };
        isSuccess.value = true;
        popupMessage.value = 'Profile updated successfully!';
      } else {
        isSuccess.value = false;
        popupMessage.value = 'Failed to update profile. Please try again.';
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    isSuccess.value = false;
    popupMessage.value = 'An error occurred while updating your profile. Please try again.';
  } finally {
    isSaving.value = false;
    showPopup.value = true;
  }
};

// const handleCancel = () => {
//   form.value = { ...displayedProfile.value };
//   dateInput.value = displayedProfile.value.dateOfBirth || '';
//   emit('update:isOpen', false);
// };


const closeAttachment = () => {
  form.value = { ...displayedProfile.value };
  dateInput.value = displayedProfile.value.dateOfBirth || '';
  emit('update:isOpen', false);
};

const closePopup = () => {
  showPopup.value = false;
  if (isSuccess.value) {
    emit('update:isOpen', false);
  }
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

  const filledFields = fields.filter(field => form.value[field] && String(form.value[field]).trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
});

const circumference = computed(() => 2 * Math.PI * 48);
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
};

const calculatedAge = computed(() => {
  if (!form.value.dateOfBirth) return null;
  const birthDate = new Date(form.value.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const handleCalendarChange = (newValue) => {
  dateInput.value = newValue;
  form.value.dateOfBirth = newValue;
  form.value.age = calculatedAge.value;
  showCalendar.value = false;
  validateDate();
};

const handleCalendarCancel = () => {
  showCalendar.value = false;
  form.value.dateOfBirth = displayedProfile.value.dateOfBirth || '';
  dateInput.value = displayedProfile.value.dateOfBirth || '';
};

const handleClickOutside = (event) => {
  if (showCalendar.value && !event.target.closest('.calendar-dropdown') && !event.target.closest('.date-of-birth-input')) {
    showCalendar.value = false;
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

  dateInput.value = value;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    form.value.dateOfBirth = value;
    form.value.age = calculatedAge.value;
  } else {
    form.value.dateOfBirth = '';
    form.value.age = null;
  }

  nextTick(() => {
    input.selectionStart = input.selectionEnd = Math.min(cursorPosition, value.length);
  });
};

const validateDate = () => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (datePattern.test(dateInput.value)) {
    form.value.dateOfBirth = dateInput.value;
    form.value.age = calculatedAge.value;
  } else {
    form.value.dateOfBirth = '';
    form.value.age = null;
  }
};

const getCharClass = (index, inputElement) => {
  if (!inputElement) return 'text-gray-300';
  const value = inputElement.value;
  const parts = value.split('-');
  
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
  if (!dateInputRef.value) return true;
  const value = dateInputRef.value.value;
  const parts = value.split('-');
  let currentIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    if (index < currentIndex + parts[i].length) {
      return false;
    }
    currentIndex += parts[i].length + 1;
  }
  return true;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.photoURL = e.target.result;
      displayedProfile.value.photoURL = e.target.result;
    };
    reader.readAsDataURL(file);
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

if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not set. Please check your environment variables.');
}
</script>

<style scoped>
.date-of-birth-input {
  font-family: monospace;
}
</style>

