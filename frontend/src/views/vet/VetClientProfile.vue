<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Gradient Header Background -->
    <div class="h-48 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
    
    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-6 -mt-24">
      <!-- Profile Card -->
      <div class="bg-white rounded-xl shadow-sm mb-6">
        <!-- Profile Header -->
        <div class="p-6">
          <div class="flex items-start justify-between">
            <button 
              @click="$emit('back')" 
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5 text-gray-500" />
            </button>
            <button class="text-gray-500 hover:text-gray-700">
              <PrinterIcon class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Profile Info -->
          <div class="flex flex-col items-center -mt-4">
            <div class="relative">
              <div class="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center text-3xl text-white font-semibold">
                {{ profile.name[0] }}
              </div>
              <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors">
                <CameraIcon class="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <h2 class="text-xl font-semibold mt-4">{{ profile.name }}</h2>
            
            <!-- Centered buttons with justify-center -->
            <div class="flex justify-center gap-4 mt-4 w-full">
              <button 
                @click="activeView = 'profile'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeView === 'profile' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                Edit Profile Info
              </button>
              <button 
                @click="activeView = 'pet'"
                :class="[
                  'px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeView === 'pet' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                Pet Info
              </button>
            </div>
          </div>

          <template v-if="activeView === 'profile'">
            <!-- Tabs -->
            <div class="flex gap-8 mt-8 border-b border-gray-200">
              <button 
                v-for="tab in tabs" 
                :key="tab"
                @click="activeTab = tab"
                :class="[
                  'px-4 py-4 font-medium transition-colors relative',
                  activeTab === tab 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                ]"
              >
                {{ tab }}
                <div 
                  v-if="activeTab === tab"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                ></div>
              </button>
            </div>

            <!-- Form Content -->
            <div class="p-6">
              <div v-if="activeTab === 'Personal'" class="grid grid-cols-2 gap-6">
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

              <div v-if="activeTab === 'Contact'" class="grid grid-cols-2 gap-6">
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
                <div>
                  <label class="block text-sm text-gray-600 mb-2">WhatsApp</label>
                  <input
                    v-model="form.whatsapp"
                    type="tel"
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter WhatsApp number"
                  >
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-2">Alternative Email</label>
                  <input
                    v-model="form.alternativeEmail"
                    type="email"
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    placeholder="Enter alternative email"
                  >
                </div>
              </div>

              <div v-if="activeTab === 'Address'" class="space-y-6">
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

              <!-- Form Actions -->
              <div class="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  @click="$emit('back')"
                  class="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Close
                </button>
                <button
                  @click="handleSubmit"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <!-- Pet Profile View -->
            <div class="mt-8">
              <!-- Navigation Tabs -->
              <div class="flex gap-6 border-b border-gray-200">
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

              <!-- Pet Form -->
              <div class="p-6">
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

      <!-- Medical Records -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <div class="flex gap-6 border-b border-gray-200 w-full">
                <button class="px-4 py-2 text-blue-500 border-b-2 border-blue-500">
                  Upcoming Appointments
                </button>
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700">
                  Past Appointments
                </button>
                <button class="px-4 py-2 text-gray-500 hover:text-gray-700">
                  Medical Records
                </button>
              </div>
            </div>

            <!-- Timeline -->
            <div class="relative">
              <div class="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200"></div>
              
              <div class="space-y-8">
                <!-- Timeline Item -->
                <div class="relative pl-8">
                  <div class="absolute left-0 top-3 w-6 h-6 bg-blue-500 rounded-full border-4 border-white"></div>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h3 class="font-medium text-gray-900">Root Canal Treatment</h3>
                        <p class="text-sm text-gray-500">26 Nov '19</p>
                      </div>
                      <button class="text-blue-500 flex items-center gap-1 text-sm">
                        <FileTextIcon class="w-4 h-4" />
                        Note
                      </button>
                    </div>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="text-gray-500">Treatment</p>
                        <p class="text-gray-900">Open Access</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Dentist</p>
                        <p class="text-gray-900">Drg. Adam H.</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Nurse</p>
                        <p class="text-gray-900">Jessicamila</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Timeline Item -->
                <div class="relative pl-8">
                  <div class="absolute left-0 top-3 w-6 h-6 bg-gray-200 rounded-full border-4 border-white"></div>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h3 class="font-medium text-gray-900">Root Canal prep</h3>
                        <p class="text-sm text-gray-500">12 Dec '19</p>
                      </div>
                      <button class="text-blue-500 flex items-center gap-1 text-sm">
                        <FileTextIcon class="w-4 h-4" />
                        Note
                      </button>
                    </div>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="text-gray-500">Treatment</p>
                        <p class="text-gray-900">Root Canal prep</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Dentist</p>
                        <p class="text-gray-900">Drg. Adam H.</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Nurse</p>
                        <p class="text-gray-900">Jessicamila</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Notes -->
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Notes</h2>
              <button class="text-blue-500 text-sm">See all</button>
            </div>
            <div class="space-y-4">
              <div class="text-sm text-gray-500">
                - This patient is lorem ipsum dolor sit amet
              </div>
              <div class="text-sm text-gray-500">
                - Lorem ipsum dolor sit amet
              </div>
              <div class="text-sm text-gray-500">
                - has allergic history with Codalism
              </div>
            </div>
            <div class="mt-6 pt-6 border-t border-gray-100">
              <p class="text-sm text-gray-500">Lorem ipsum dolor sit amet</p>
              <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" class="w-5 h-5 rounded-full">
                <span>Dr. Maya Minato</span>
                <span>•</span>
                <span>Nov '19</span>
              </div>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
              Save note
            </button>
          </div>
        </div>
      </div>
     </div>
    </div>
    </div>
    </template>
     </div>
 </div>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ArrowLeftIcon,
  PrinterIcon,
  CameraIcon,
  FileTextIcon,
  PlusIcon,
  FileIcon,
  DownloadIcon,
  InfoIcon,
  ClipboardIcon,
  ActivityIcon,
  SyringeIcon,
  FolderIcon
} from 'lucide-vue-next'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back'])

const tabs = ['Personal', 'Contact', 'Address']
const activeTab = ref('Personal')
const activeView = ref('profile')

// Pet view state
const petTabs = [
  { name: 'Basic Details', icon: ClipboardIcon },
  { name: 'Medical History', icon: ActivityIcon },
  { name: 'Vaccinations', icon: SyringeIcon },
  { name: 'Documents', icon: FolderIcon }
]
const activePetTab = ref('Basic Details')

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  email: props.profile.email || '',
  phone: props.profile.phone || '',
  whatsapp: '',
  alternativeEmail: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  country: ''
})

// Pet form
const petForm = ref({
  name: '',
  species: '',
  breed: '',
  weight: '',
  ageWeeks: 0,
  ageMonths: 0,
  ageYears: 0,
  gender: 'male'
})

const files = [
  { name: 'Check Up Result.pdf', size: '123kb' },
  { name: 'Dental X-Ray Result 2.pdf', size: '45kb' },
  { name: 'Medical Prescriptions.pdf', size: '67kb' },
  { name: 'Dental X-Ray Result.pdf', size: '89kb' }
]

const handleSubmit = () => {
  // Handle form submission
  console.log('Form submitted:', form.value)
}
</script>