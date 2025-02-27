<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Profile Header -->
    <div class="relative h-48 bg-gray-700 rounded-t-xl">
      <!-- Cover Photo Upload Button -->
      <button 
        @click="handleCoverUpload"
        class="absolute top-4 right-4 px-3 py-1.5 bg-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <CameraIcon class="w-4 h-4" />
        Add cover photo
      </button>
      <input
        type="file"
        ref="coverInput"
        @change="onCoverSelected"
        accept="image/*"
        class="hidden"
      >
    </div>

    <div class="max-w-3xl mx-auto px-6">
      <!-- Profile Photo Section -->
      <div class="relative -mt-16 mb-8 flex justify-center">
        <div class="relative">
          <div class="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center text-4xl text-white font-semibold border-4 border-white">
            {{ form.firstName ? form.firstName[0].toUpperCase() : 'A' }}
          </div>
          <!-- Camera Button -->
          <button 
            @click.prevent="handleImageUpload"
            class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors border-2 border-white"
          >
            <CameraIcon class="w-4 h-4 text-white" />
          </button>
          <!-- Hidden File Input -->
          <input
            type="file"
            ref="fileInput"
            @change="onFileSelected"
            accept="image/*"
            class="hidden"
          >
        </div>
      </div>

      <!-- Centered Tabs -->
      <div class="flex justify-center gap-4 mb-8">
        <button 
          @click="activeView = 'profile'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeView === 'profile' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          Edit Profile Info
        </button>
        <button 
          @click="activeView = 'pet'"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeView === 'pet' 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          Pet Info
        </button>
      </div>

      <!-- Profile Form -->
      <div v-if="activeView === 'profile'">
        <form @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm p-6 space-y-8">
          <!-- Personal Information -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 text-gray-600 font-medium">
              <UserIcon class="w-5 h-5" />
              <h2>Personal Information</h2>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm text-gray-600 mb-2">First Name</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter first name"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-2">Last Name</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter last name"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-2">Username</label>
                <input
                  v-model="form.username"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter username"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-2">Date of Birth</label>
                <input
                  v-model="form.dateOfBirth"
                  type="date"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-2">Age</label>
                <input
                  v-model="form.age"
                  type="number"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter age"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-2">Gender</label>
                <select
                  v-model="form.gender"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 text-gray-600 font-medium">
              <PhoneIcon class="w-5 h-5" />
              <h2>Contact Information</h2>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm text-gray-600 mb-2">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter email"
                >
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-2">Phone</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter phone number"
                >
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="space-y-6">
            <div class="flex items-center gap-2 text-gray-600 font-medium">
              <MapPinIcon class="w-5 h-5" />
              <h2>Address</h2>
            </div>
            <div class="space-y-6">
              <div>
                <label class="block text-sm text-gray-600 mb-2">Street Address</label>
                <input
                  v-model="form.streetAddress"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="Enter street address"
                >
              </div>
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm text-gray-600 mb-2">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter city"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-2">Province</label>
                  <input
                    v-model="form.province"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter province"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-2">Postal Code</label>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter postal code"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-2">Country</label>
                  <input
                    v-model="form.country"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter country"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-4 pt-4">
            <button
              type="button"
              @click="$emit('cancel')"
              class="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <!-- Pet Form -->
      <div v-else class="bg-white rounded-xl shadow-sm p-6">
        <!-- Pet Navigation Tabs -->
        <div class="flex gap-6 border-b border-gray-200 mb-6">
          <button 
            v-for="tab in petTabs" 
            :key="tab.name"
            @click="activePetTab = tab.name"
            :class="[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
              activePetTab === tab.name 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.name }}
          </button>
        </div>

        <!-- Pet Profile Content -->
        <div v-if="activePetTab === 'Basic Details'" class="grid grid-cols-[200px_1fr] gap-8">
          <!-- Pet Image Section -->
          <div class="flex flex-col items-center gap-4">
            <div class="relative">
              <img 
                :src="petImage || '/placeholder.svg?height=160&width=160'" 
                alt="Pet" 
                class="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button 
                @click="handlePetImageUpload"
                class="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
              >
                <CameraIcon class="w-4 h-4 text-white" />
              </button>
              <input
                type="file"
                ref="petImageInput"
                @change="onPetImageSelected"
                accept="image/*"
                class="hidden"
              >
            </div>
            <span class="text-lg font-medium text-gray-900">{{ petForm.name || 'Pet Name' }}</span>
          </div>

          <!-- Pet Form Fields -->
          <div class="grid grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-sm text-gray-600 mb-2">Name</label>
              <input
                v-model="petForm.name"
                type="text"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="Pet Name"
              >
            </div>

            <!-- Species -->
            <div>
              <label class="block text-sm text-gray-600 mb-2">Species</label>
              <input
                v-model="petForm.species"
                type="text"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="Species"
              >
            </div>

            <!-- Breed -->
            <div>
              <label class="block text-sm text-gray-600 mb-2">Breed</label>
              <input
                v-model="petForm.breed"
                type="text"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="Breed"
              >
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm text-gray-600 mb-2">Gender</label>
              <select
                v-model="petForm.gender"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <!-- Weight -->
            <div>
              <label class="block text-sm text-gray-600 mb-2">Weight</label>
              <input
                v-model="petForm.weight"
                type="text"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="Weight"
              >
            </div>

            <!-- Age -->
            <div>
              <label class="block text-sm text-gray-600 mb-2">Age (Weeks, Month, Year)</label>
              <div class="flex gap-2">
                <input
                  v-model="petForm.ageWeeks"
                  type="number"
                  placeholder="0"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                >
                <input
                  v-model="petForm.ageMonths"
                  type="number"
                  placeholder="0"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                >
                <input
                  v-model="petForm.ageYears"
                  type="number"
                  placeholder="0"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Medical History -->
        <div v-else-if="activePetTab === 'Medical History'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Medical History</h3>
          <div v-for="(condition, index) in petForm.medicalHistory" :key="index" class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-gray-700">{{ condition.name }}</span>
              <span class="text-sm text-gray-500">{{ condition.date }}</span>
            </div>
            <p class="text-gray-600">{{ condition.description }}</p>
          </div>

        <MedicalRecordUpload
          @save="handleMedicalRecordSave"
        @cancel="handleMedicalRecordCancel"
        />
        </div>

        <!-- Vaccinations -->
        <div v-else-if="activePetTab === 'Vaccinations'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Vaccinations</h3>
          <div v-for="(vaccine, index) in petForm.vaccinations" :key="index" class="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <div>
              <span class="font-medium text-gray-700">{{ vaccine.name }}</span>
              <p class="text-sm text-gray-500">Date: {{ vaccine.date }}</p>
            </div>
            <CheckIcon v-if="vaccine.completed" class="w-6 h-6 text-green-500" />
          </div>
          <VaccinationUpload
          @save="handleMedicalRecordSave"
        @cancel="handleMedicalRecordCancel"
        />
        </div>

        <!-- Documents -->
        <div v-else-if="activePetTab === 'Documents'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">Documents</h3>
          <div v-for="(document, index) in petForm.documents" :key="index" class="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <div>
              <span class="font-medium text-gray-700">{{ document.name }}</span>
              <p class="text-sm text-gray-500">Uploaded: {{ document.uploadDate }}</p>
            </div>
            <a :href="document.url" target="_blank" class="text-blue-600 hover:underline">View</a>
          </div>
          <DocumentUpload
          @save="handleMedicalRecordSave"
        @cancel="handleMedicalRecordCancel"
        />
        </div>

      
      </div>
    </div>
  </div>
</template>

<script setup>
import MedicalRecordUpload from './AddMedicalRecord.vue'
import VaccinationUpload from './AddVaccination.vue'
import DocumentUpload from './AddDocument.vue'
import { ref } from 'vue'
import { 
  ArrowLeftIcon, 
  UserIcon, 
  PhoneIcon, 
  MapPinIcon,
  CameraIcon,
  ClipboardIcon,
  ActivityIcon,
  SyringeIcon,
  FolderIcon,
  CheckIcon
} from 'lucide-vue-next'

// View state
const activeView = ref('profile')
const activePetTab = ref('Basic Details')

// Pet tabs configuration
const petTabs = [
  { name: 'Basic Details', icon: ClipboardIcon },
  { name: 'Medical History', icon: ActivityIcon },
  { name: 'Vaccinations', icon: SyringeIcon },
  { name: 'Documents', icon: FolderIcon }
]

// Add new refs for cover photo
const coverInput = ref(null)

// Add cover photo upload handlers
const handleCoverUpload = () => {
  coverInput.value.click()
}

const onCoverSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Handle cover photo upload
    console.log('Cover photo selected:', file)
  }
}

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  email: '',
  phone: '',
  whatsapp: '',
  alternativeEmail: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  country: ''
})

// Pet form state
const petForm = ref({
  name: '',
  species: '',
  breed: '',
  weight: '',
  ageWeeks: 0,
  ageMonths: 0,
  ageYears: 0,
  gender: 'male',
  medicalHistory: [],
  vaccinations: [],
  documents: []
})

// New refs for file handling
const fileInput = ref(null)
const uploadProgress = ref(25) // This controls the progress circle (0-100)

// Handle image upload button click
const handleImageUpload = () => {
  fileInput.value.click()
}

// Handle file selection
const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Here you would typically handle the file upload
    // For demo purposes, we'll just simulate progress
    uploadProgress.value = 0
    const interval = setInterval(() => {
      uploadProgress.value += 5
      if (uploadProgress.value >= 75) {
        clearInterval(interval)
      }
    }, 100)
  }
}

const handleSubmit = () => {
  const newProfile = {
    name: `${form.value.firstName} ${form.value.lastName}`,
    email: form.value.email,
    phone: form.value.phone,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: '',
    company: {
      name: form.value.company || 'Not Specified',
      logo: ''
    },
    status: 'Pending'
  }
  
  emit('save', newProfile)
}

// Function to add a new medical condition
const addMedicalCondition = () => {
  petForm.value.medicalHistory.push({
    name: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
}

// Function to add a new vaccination
const addVaccination = () => {
  petForm.value.vaccinations.push({
    name: '',
    date: new Date().toISOString().split('T')[0],
    completed: false
  })
}

// Function to handle document upload
const onDocumentSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    petForm.value.documents.push({
      name: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      url: URL.createObjectURL(file)
    })
  }
}

// Function to cancel pet changes
const cancelPetChanges = () => {
  // Reset the pet form or navigate away
  console.log('Changes cancelled')
}

// Function to save pet changes
const savePetChanges = () => {
  // Save the pet form data
  console.log('Saving pet changes:', petForm.value)
}

const emit = defineEmits(['save', 'cancel'])
</script>