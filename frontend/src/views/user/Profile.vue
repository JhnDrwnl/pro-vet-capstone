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
                <div v-show="currentTab === 'pet-info'" class="space-y-6">
                  <!-- Pet Selection -->
                  <div class="flex flex-wrap gap-2 pb-4">
                    <button
                      v-for="(pet, index) in form.pets"
                      :key="index"
                      @click="selectPet(index)"
                      :class="[
                        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        selectedPetIndex === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      {{ pet.name }}
                    </button>
                    <button
                      @click="addPet"
                      class="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <PlusIcon class="w-4 h-4 mr-1" />
                      Add Pet
                    </button>
                  </div>

                  <!-- Selected Pet Details -->
                  <div v-if="selectedPetIndex !== null && form.pets[selectedPetIndex]" class="space-y-6">
                    <div class="flex items-center mb-4">
                      <div class="relative group mr-4">
                        <img
                          :src="form.pets[selectedPetIndex].photoURL || '/placeholder.svg?height=64&width=64'"
                          :alt="form.pets[selectedPetIndex].name"
                          class="w-20 h-20 rounded-full object-cover"
                        />
                        <button
                          @click="triggerPetPhotoUpload(selectedPetIndex)"
                          class="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <CameraIcon class="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ form.pets[selectedPetIndex].name }}</h2>
                        <p class="text-sm text-gray-500">
                          {{ form.pets[selectedPetIndex].breed }}, {{ form.pets[selectedPetIndex].age }} years old
                        </p>
                      </div>
                    </div>
          
                    <!-- Pet Info Tabs -->
                    <div class="border-b border-gray-200">
                      <nav class="flex -mb-px space-x-8">
                        <button
                          v-for="tab in petTabs"
                          :key="tab.id"
                          @click="selectedPetTab = tab.id"
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
                    </div>

                    <!-- Tab Content -->
                    <div v-if="selectedPetTab === 'basic-details'" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          v-model="form.pets[selectedPetIndex].name"
                          type="text"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Species</label>
                        <input
                          v-model="form.pets[selectedPetIndex].species"
                          type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Breed</label>
                        <input
                          v-model="form.pets[selectedPetIndex].breed"
                          type="text"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                        />
                      </div>
                      <div>
                      <label class="block text-sm font-medium text-gray-700">Age (Weeks, Month, Year)</label>
                      <div class="grid grid-cols-3 gap-2">
                        <div>
                          <input
                            v-model="form.pets[selectedPetIndex].ageYears"
                            type="number"
                            min="0"
                            placeholder="Years"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <input
                            v-model="form.pets[selectedPetIndex].ageMonths"
                            type="number"
                            min="0"
                            max="11"
                            placeholder="Months"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <input
                            v-model="form.pets[selectedPetIndex].ageWeeks"
                            type="number"
                            min="0"
                            max="3"
                            placeholder="Weeks"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Weight</label>
                        <input
                          v-model="form.pets[selectedPetIndex].weight"
                          type="number"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          v-model="form.pets[selectedPetIndex].gender"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div v-else-if="selectedPetTab === 'medical-history'" class="space-y-4">
                      <p class="text-gray-500 text-sm">Medical history records will be displayed here.</p>
                    </div>

                    <div v-else-if="selectedPetTab === 'vaccinations'" class="space-y-4">
                      <p class="text-gray-500 text-sm">Vaccination records will be displayed here.</p>
                    </div>

                    <div v-else-if="selectedPetTab === 'documents'" class="space-y-4">
                      <p class="text-gray-500 text-sm">Pet documents will be displayed here.</p>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-else class="text-center py-12">
                    <p class="text-gray-500">No pets added yet. Click the + button to add a pet.</p>
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

  <!-- Hidden file inputs for pet photos -->
  <input
    v-for="(pet, index) in form.pets"
    :key="index"
    type="file"
    :ref="el => { if (el) petPhotoInputs[index] = el }"
    @change="event => handlePetPhotoSelect(event, index)"
    accept="image/*"
    class="hidden"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { CameraIcon, CalendarIcon, UserIcon, PhoneIcon, MapPinIcon, PlusIcon, TrashIcon, FileTextIcon, ActivityIcon, SyringeIcon, FolderIcon, EditIcon, PawPrint } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import Calendar from '@/components/common/Calendar.vue';

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'save', 'update:modelValue']);

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();

const tabs = [
  { id: 'edit-profile', name: 'Edit Profile Info', icon: EditIcon },
  { id: 'pet-info', name: 'Pet Info', icon: PawPrint },
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
const dateInputRef = ref(null);
const fileInput = ref(null);
const showCameraHover = ref(false);
const isCameraClicked = ref(false);
const isSaving = ref(false);
let autocomplete = null;
let googleMapsLoaded = false;

const defaultPhotoURL = ref('/images/default-avatar.png');

const tempForm = ref({});

const isMobile = ref(window.innerWidth < 640);

const selectedPetIndex = ref(null);
const selectedPetTab = ref('basic-details');
const petTabs = [
  { id: 'basic-details', name: 'Basic Details', icon: FileTextIcon },
  { id: 'medical-history', name: 'Medical History', icon: ActivityIcon },
  { id: 'vaccinations', name: 'Vaccinations', icon: SyringeIcon },
  { id: 'documents', name: 'Documents', icon: FolderIcon },
];

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
  }
});

const fetchUserProfile = async () => {
  const profile = await profileStore.fetchUserProfile(authStore.user.userId);
  if (profile) {
    form.value = { ...profile };
    tempForm.value = { ...profile };
    displayedProfile.value = { ...profile };
  }
};

const handleSave = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    if (authStore.user && authStore.user.userId) {
      form.value = { ...form.value, ...tempForm.value };
      const success = await profileStore.updateUserProfile(authStore.user.userId, form.value);
      if (success) {
        displayedProfile.value = { ...form.value };
        console.log('Profile updated successfully!');
      } else {
        console.error('Failed to update profile. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    isSaving.value = false;
  }
};

const closeAttachment = () => {
  tempForm.value = { ...displayedProfile.value };
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

  const filledFields = fields.filter(field => form.value[field] && String(form.value[field]).trim() !== '').length;
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
  form.value.province = addressComponents.administrative_area_level_1 || '';
  form.value.country = addressComponents.country;
  form.value.postalCode = addressComponents.postal_code || '';

  if (!form.value.streetAddress) {
    form.value.streetAddress = place.formatted_address;
  }

  console.log('Selected place details:', place);
  console.log('Address components:', addressComponents);
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
  tempForm.value.age = event.target.value;
};

const petPhotoInputs = ref([]);

const triggerPetPhotoUpload = (index) => {
  petPhotoInputs.value[index].click();
};

const handlePetPhotoSelect = (event, index) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.value.pets[index].photoURL = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const addPet = () => {
  if (!form.value.pets) {
    form.value.pets = [];
  }
  const newPet = {
    name: 'New Pet',
    species: '',
    breed: '',
    ageYears: 0,
    ageMonths: 0,
    ageWeeks: 0,
    gender: 'male',
    photoURL: '/placeholder.svg?height=64&width=64'
  };
  form.value.pets.push(newPet);
  selectedPetIndex.value = form.value.pets.length - 1;
  selectedPetTab.value = 'basic-details';
};

const removePet = (index) => {
  form.value.pets.splice(index, 1);
  if (form.value.pets.length === 0) {
    selectedPetIndex.value = null;
  } else if (index === selectedPetIndex.value) {
    selectedPetIndex.value = Math.min(index, form.value.pets.length - 1);
  } else if (index < selectedPetIndex.value) {
    selectedPetIndex.value--;
  }
};

const selectPet = (index) => {
  selectedPetIndex.value = index;
  selectedPetTab.value = 'basic-details';
};

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