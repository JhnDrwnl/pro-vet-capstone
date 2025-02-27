<template>
  <div class="min-h-screen bg-gray-50 p-6 md:p-8 rounded-[8px]">
    <div class="flex gap-6">
      <!-- Main Content -->
      <div class="flex-1">
        <!-- Header Controls -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <!-- Search and Filter -->
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="relative flex-1 lg:w-80">
              <input 
                type="text"
                v-model="searchQuery"
                placeholder="Search updates..."
                class="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-300"
              >
              <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button 
              @click="showFilters = !showFilters"
              class="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
            >
              <FilterIcon class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Sort Control -->
          <div class="flex items-center gap-3 w-full lg:w-auto">
            <div class="relative">
              <button 
                @click="showSortMenu = !showSortMenu"
                class="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
              >
                <ArrowDownIcon class="w-5 h-5 text-gray-600" />
                <span class="text-sm text-gray-600">Sort by</span>
              </button>
              <!-- Sort Menu -->
              <div v-if="showSortMenu" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                <button 
                  v-for="option in sortOptions" 
                  :key="option.value"
                  @click="handleSort(option.value)"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Panel -->
        <div v-if="showFilters" class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Status Filter -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Status</h3>
              <div class="space-y-2">
                <label v-for="status in ['Active', 'Pending', 'Completed']" :key="status" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="status"
                    v-model="filters.status"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-600">{{ status }}</span>
                </label>
              </div>
            </div>

            <!-- Date Filter -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
              <input
                type="date"
                v-model="filters.startDate"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
            </div>

            <!-- Pet Type Filter -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-3">Pet Type</h3>
              <select 
                v-model="filters.petType"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">All Types</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(item, index) in filteredItems" :key="index" 
            @click="selectItem(item)"
            class="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            :class="{ 'ring-2 ring-blue-500': selectedItem?.id === item.id }"
          >
            <div class="p-4 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <img :src="item.ownerAvatar" alt="" class="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100">
                <div>
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-gray-500">Pet Owner</span>
                  </div>
                  <p class="text-sm font-medium text-gray-900">{{ item.ownerName }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ item.petName }}</span>
                <img :src="item.creatorAvatar" alt="" class="w-6 h-6 rounded-full object-cover">
              </div>
            </div>

            <div class="relative mx-4 rounded-2xl overflow-hidden">
              <img 
                :src="item.image" 
                alt="" 
                class="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
              >
            </div>

            <div class="p-4">
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <ClockIcon class="w-4 h-4 mr-1" />
                {{ item.date }}
              </div>
              <div class="flex space-x-2">
                <button 
                  class="flex-1 py-2.5 rounded-full border-2 border-gray-900 text-gray-900 font-medium text-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  Pet Update
                </button>
                <button 
                  class="flex-1 py-2.5 rounded-full bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all duration-300"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pet Details Sidebar -->
      <div v-if="selectedItem" class="hidden lg:block w-[400px] bg-white rounded-2xl shadow-sm h-fit sticky top-6">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <img :src="selectedItem.image" alt="" class="w-8 h-8 rounded-full object-cover">
            <div>
              <h3 class="font-medium text-gray-900">{{ selectedItem.petName }}</h3>
              <p class="text-xs text-gray-500">Pet Name</p>
            </div>
          </div>
          <button @click="closeDetails" class="p-1 hover:bg-gray-100 rounded-full">
            <XIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- Main Image -->
        <img 
          :src="selectedItem.image" 
          alt="" 
          class="w-full aspect-square object-cover"
        >

        <!-- Content Area -->
        <div v-if="showPetUpdate" class="p-4">
          <div class="flex items-center gap-3 mb-4">
            <img :src="selectedItem.ownerAvatar" alt="" class="w-10 h-10 rounded-full">
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ selectedItem.ownerName }}</p>
                  <p class="text-xs text-gray-500">Pet Owner</p>
                </div>
                <span class="text-xs text-gray-500">{{ selectedItem.date }}</span>
              </div>
            </div>
          </div>
          <p class="text-gray-600 mb-4">{{ selectedItem.update }}</p>
        </div>

        <div v-else class="p-4">
          <div class="relative mb-4">
            <textarea
              v-model="noteText"
              placeholder="Start typing here..."
              rows="4"
              class="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
            ></textarea>
            <button class="absolute right-4 bottom-4 text-[#0066FF]">
              <SendIcon class="w-5 h-5 transform rotate-45" />
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 p-4 border-t">
          <button 
            @click="setActiveButton('petUpdate')"
            :class="[
              'w-full py-3 rounded-full font-medium text-sm transition-all duration-300',
              activeButton === 'petUpdate' 
                ? 'bg-[#0066FF] text-white hover:bg-blue-700' 
                : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            ]"
          >
            Pet Update
          </button>
          <button 
            @click="toggleNoteInput()"
            :class="[
              'w-full py-3 rounded-full font-medium text-sm transition-all duration-300',
              activeButton === 'addNote' 
                ? 'bg-[#0066FF] text-white hover:bg-blue-700' 
                : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
            ]"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  SearchIcon, 
  FilterIcon, 
  ArrowDownIcon, 
  ClockIcon,
  XIcon,
  Send as SendIcon
} from 'lucide-vue-next'

const activeButton = ref('petUpdate')
const showPetUpdate = ref(true)

const setActiveButton = (button) => {
  activeButton.value = button
  showPetUpdate.value = button === 'petUpdate'
}

const searchQuery = ref('')
const showFilters = ref(false)
const showSortMenu = ref(false)
const selectedItem = ref(null)
const noteText = ref('')

const sortOptions = [
  { label: 'Newest First', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'Owner Name A-Z', value: 'name-asc' },
  { label: 'Owner Name Z-A', value: 'name-desc' }
]

const filters = ref({
  status: [],
  startDate: '',
  petType: ''
})

const items = ref([
  {
    id: 1,
    ownerName: 'Ava Bennettt',
    petName: 'Max',
    date: 'February 19, 2025',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eC3YPZFRMAa5cCeOecdbwyeRtl3IDQ.png',
    ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    status: 'Active',
    petType: 'dog',
    update: 'Max is slowly recovering.'
  },
  {
    id: 2,
    ownerName: '23WCFV',
    petName: 'Luna',
    date: 'January 19, 2025',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80',
    ownerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    status: 'Pending',
    petType: 'cat',
    update: 'Luna is doing great!'
  },
])

const filteredItems = computed(() => {
  let result = [...items.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.ownerName.toLowerCase().includes(query) ||
      item.petName.toLowerCase().includes(query)
    )
  }

  if (filters.value.status.length) {
    result = result.filter(item => filters.value.status.includes(item.status))
  }

  if (filters.value.startDate) {
    const filterDate = new Date(filters.value.startDate)
    result = result.filter(item => new Date(item.date) >= filterDate)
  }

  if (filters.value.petType) {
    result = result.filter(item => item.petType === filters.value.petType)
  }

  return result
})

const handleSort = (value) => {
  showSortMenu.value = false
  // Implement sorting logic here
}

const selectItem = (item) => {
  selectedItem.value = item
  setActiveButton('petUpdate')
}

const closeDetails = () => {
  selectedItem.value = null
  setActiveButton('petUpdate')
}

const toggleNoteInput = () => {
  setActiveButton(activeButton.value === 'addNote' ? 'petUpdate' : 'addNote')
  if (activeButton.value === 'addNote') {
    noteText.value = ''
  }
}
</script>

<style scoped>
/* Textarea styles */
textarea {
  min-height: 120px;
}

textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

/* Input focus styles */
input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects */
.hover\:scale-105 {
  transition: transform 0.3s ease;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Card hover animations */
.hover\:shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>