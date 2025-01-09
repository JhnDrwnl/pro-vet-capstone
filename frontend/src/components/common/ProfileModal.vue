<!-- components/common/ProfileModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-all duration-300"
    :class="{ 'ml-64': isSidebarOpen, 'ml-16': !isSidebarOpen }">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl flex overflow-hidden">
      <!-- Left Sidebar -->
      <div class="w-64 bg-gray-100 p-6 border-r">
        <div class="flex flex-col items-center">
          <!-- Profile Photo with Progress Circle -->
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
                :src="user.photoURL || 'https://via.placeholder.com/100'"
                alt="Profile"
                class="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            
            <!-- Camera Button -->
            <button
              class="absolute bottom-2 right-0 bg-[#2d80eb] text-white p-1.5 rounded-full shadow-lg hover:bg-[#0453b9] transition-transform transform hover:scale-110 z-20">
              <CameraIcon class="w-3 h-3 text-white" />
            </button>
            
            <!-- Progress Percentage (visible on hover) -->
            <div 
              class="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-medium shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {{ progressPercentage }}%
            </div>
          </div>
          <h3 class="mt-3 text-lg font-semibold text-gray-800">
            {{ user.firstName }} {{ user.lastName }}
          </h3>

          <!-- Contact Info -->
          <div class="w-full mt-6 space-y-3 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <PhoneIcon class="w-4 h-4 text-[#2d80eb]" />
              <span>{{ user.phone || 'Add phone number' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MailIcon class="w-4 h-4 text-[#2d80eb]" />
              <span>{{ user.email || 'Add email' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPinIcon class="w-4 h-4 text-[#2d80eb]" />
              <span>{{ user.streetAddress || 'Add address' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content -->
      <div class="flex-1 relative">
        <!-- Header -->
        <div class="flex justify-between items-center px-4 py-3 border-b">
          <h2 class="text-xl font-semibold text-gray-800">Edit Profile</h2>
        </div>

        <!-- Tabs -->
        <nav class="border-b px-4 py-2 flex gap-3">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            class="py-1 px-3 text-xs font-medium rounded-full transition-all"
            :class="currentTab === tab.id
              ? 'text-white bg-[#2d80eb]'
              : 'text-gray-600 hover:text-white hover:bg-[#7fb5fa]'"
          >
            {{ tab.name }}
          </button>
        </nav>

        <!-- Content -->
        <div class="p-4 space-y-4 h-[350px] overflow-y-auto">
          <!-- Personal Information -->
          <div v-show="currentTab === 'personal'" class="h-full">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="field in ['First Name', 'Last Name', 'Username', 'Date of Birth', 'Age', 'Gender']"
                :key="field"
              >
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  {{ field }}
                </label>
                <input
                  v-model="form[field.toLowerCase().replace(' ', '')]"
                  type="text"
                  :placeholder="'Enter ' + field.toLowerCase()"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div v-show="currentTab === 'contact'" class="h-full">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="field in ['Email', 'Phone', 'WhatsApp', 'Alternative Email']"
                :key="field"
              >
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  {{ field }}
                </label>
                <input
                  v-model="form[field.toLowerCase().replace(' ', '')]"
                  :type="field === 'Email' || field === 'Alternative Email' ? 'email' : 'text'"
                  :placeholder="'Enter ' + field.toLowerCase()"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Address -->
          <div v-show="currentTab === 'address'" class="h-full">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  v-model="form.streetAddress"
                  type="text"
                  placeholder="Enter street address"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  v-model="form.city"
                  type="text"
                  placeholder="Enter city"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Province
                </label>
                <input
                  v-model="form.province"
                  type="text"
                  placeholder="Enter province"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  v-model="form.postalCode"
                  type="text"
                  placeholder="Enter postal code"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  v-model="form.country"
                  type="text"
                  placeholder="Enter country"
                  class="w-full px-3 py-2 rounded-md shadow-sm border border-gray-300 focus:border-[#2d80eb] focus:ring-2 focus:ring-[#2d80eb] focus:outline-none transition-all placeholder-gray-400 bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Save and Cancel Buttons (Positioned at the bottom) -->
        <div class="absolute bottom-4 right-4 flex gap-2">
          <button
            @click="handleSave"
            class="flex items-center px-3 py-1 bg-[#2d80eb] text-white text-xs font-medium rounded-full hover:bg-[#0453b9] transition-transform transform hover:scale-105"
          >
            Save Changes
          </button>
          <button
            @click="$emit('close')"
            class="flex items-center px-3 py-1 bg-red-400 text-white text-xs font-medium rounded-full hover:bg-red-800 transition-transform transform hover:scale-105"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PhoneIcon, MailIcon, MapPinIcon, CameraIcon } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  user: {
    type: Object,
    required: true,
  },
  isSidebarOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'save']);

const tabs = [
  { id: 'personal', name: 'Personal Information' },
  { id: 'contact', name: 'Contact Information' },
  { id: 'address', name: 'Address' },
];

const currentTab = ref('personal');

const form = ref({
  firstName: props.user.firstName || '',
  lastName: props.user.lastName || '',
  username: props.user.username || '',
  dateOfBirth: props.user.dateOfBirth || '',
  age: props.user.age || '',
  gender: props.user.gender || '',
  email: props.user.email || '',
  phone: props.user.phone || '',
  whatsapp: props.user.whatsapp || '',
  alternativeEmail: props.user.alternativeEmail || '',
  streetAddress: props.user.streetAddress || '',
  city: props.user.city || '',
  province: props.user.province || '',
  postalCode: props.user.postalCode || '',
  country: props.user.country || '',
});

const calculateProgress = computed(() => {
  const fields = [
    form.value.firstName,
    form.value.lastName,
    form.value.username,
    form.value.dateOfBirth,
    form.value.age,
    form.value.gender,
    form.value.email,
    form.value.phone,
    form.value.streetAddress,
    form.value.city,
    form.value.country
  ];
  
  const filledFields = fields.filter(field => field && field.trim() !== '').length;
  return (filledFields / fields.length) * 100;
});

const circumference = computed(() => 2 * Math.PI * 48);
const dashOffset = computed(() => 
  circumference.value - (calculateProgress.value / 100) * circumference.value
);
const progressPercentage = computed(() => 
  Math.round(calculateProgress.value)
);
const progressColor = computed(() => {
  if (calculateProgress.value < 30) return '#EF4444'; // red
  if (calculateProgress.value < 70) return '#F59E0B'; // yellow
  return '#10B981'; // green
});

const handleSave = () => {
  emit('save', form.value);
  emit('close');
};
</script>


