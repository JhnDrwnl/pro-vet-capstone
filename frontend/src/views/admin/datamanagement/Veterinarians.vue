<template>
    <div class="p-6 bg-white rounded-2xl">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Data Management</h1>
        <p class="text-gray-500 mt-1">Manage information about veterinarians.</p>
      </div>
  
      <!-- Navigation Tabs -->
      <div class="px-6 mb-6">
        <div class="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            @click="activeTab = 'overview'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Overview
          </button>
          <button
            @click="activeTab = 'profile'"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Profile
          </button>
        </div>
      </div>
  
      <!-- Overview Tab Content -->
      <div v-if="activeTab === 'overview'">
        <!-- Search, Filter, Add, and Export -->
        <div v-if="!showForm" class="flex justify-between items-center mb-6">
          <div class="flex gap-2">
            <div class="relative">
              <input
                type="text"
                placeholder="Search veterinarians..."
                class="w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                  :class="{'text-blue-600': activeFilters.includes(filter)}"
                >
                  {{ filter }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="exportToCSV"
              class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
            >
              <DownloadIcon class="w-4 h-4" />
              Export CSV
            </button>
            <button 
              @click="openAddVeterinarianForm"
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <LucidePlus class="w-4 h-4" />
              Add Veterinarian
            </button>
          </div>
        </div>
  
        <!-- Table -->
        <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr class="border-b border-gray-200">
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Profile</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Name</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Email</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Phone</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Specialty</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Experience (Years)</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="veterinarian in filteredVeterinarians" :key="veterinarian.id">
                <td class="py-4 px-6">
                  <img :src="veterinarian.profile || '/placeholder.svg?height=40&width=40'" 
                       :alt="veterinarian.name"
                       class="w-10 h-10 rounded-full object-cover" />
                </td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.name }}</td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.email }}</td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.phone }}</td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.specialty }}</td>
                <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.experience }}</td>
                <td class="py-4 px-6 text-sm">
                  <div class="flex items-center gap-2">
                    <button 
                      @click="editVeterinarian(veterinarian)"
                      class="p-1 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <LucideEdit class="w-5 h-5" />
                    </button>
                    <button 
                      @click="archiveVeterinarian(veterinarian)"
                      class="p-1 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <ArchiveIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Inline Add/Edit Veterinarian Form -->
        <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-semibold mb-4">{{ editingVeterinarian ? 'Edit Veterinarian' : 'Add New Veterinarian' }}</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                v-model="veterinarianForm.name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                v-model="veterinarianForm.email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                v-model="veterinarianForm.phone"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                type="text"
                v-model="veterinarianForm.specialty"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                v-model="veterinarianForm.experience"
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <button
                type="button"
                @click="closeForm"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
              >
                {{ editingVeterinarian ? 'Save Changes' : 'Add Veterinarian' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Profile Tab Content -->
      <div v-if="activeTab === 'profile'" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">Veterinarian Profile</h2>
        <p class="text-gray-600 mb-4">Select a veterinarian from the overview to view and edit their detailed profile.</p>
        <!-- Add more profile-specific content here -->
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { 
    Plus as LucidePlus,
    Edit as LucideEdit,
    Search as SearchIcon,
    Filter as FilterIcon,
    Download as DownloadIcon,
    Archive as ArchiveIcon
  } from 'lucide-vue-next'
  
  const activeTab = ref('overview')
  const veterinarians = ref([
    {
      id: 1,
      profile: '/placeholder.svg?height=40&width=40',
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      phone: '(123) 456-7890',
      specialty: 'Cardiology',
      experience: 10
    },
    {
      id: 2,
      profile: '/placeholder.svg?height=40&width=40',
      name: 'Dr. Jane Doe',
      email: 'jane.doe@example.com',
      phone: '(987) 654-3210',
      specialty: 'Oncology',
      experience: 5
    },
    {
      id: 3,
      profile: '/placeholder.svg?height=40&width=40',
      name: 'Dr. David Lee',
      email: 'david.lee@example.com',
      phone: '(555) 123-4567',
      specialty: 'Dermatology',
      experience: 2
    }
  ])
  
  const searchQuery = ref('')
  const showForm = ref(false)
  const showFilters = ref(false)
  const editingVeterinarian = ref(null)
  const veterinarianForm = ref({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: 0
  })
  
  const filters = ['All Veterinarians', 'Experienced (5+ years)', 'Newly Joined']
  const activeFilters = ref([])
  
  const filteredVeterinarians = computed(() => {
    return veterinarians.value.filter(veterinarian => {
      const searchLower = searchQuery.value.toLowerCase()
      const matchesSearch = 
        veterinarian.name.toLowerCase().includes(searchLower) ||
        veterinarian.email.toLowerCase().includes(searchLower) ||
        veterinarian.phone.toLowerCase().includes(searchLower) ||
        veterinarian.specialty.toLowerCase().includes(searchLower)
  
      const matchesFilters = activeFilters.value.length === 0 || activeFilters.value.some(filter => {
        switch(filter) {
          case 'Experienced (5+ years)':
            return veterinarian.experience >= 5
          case 'Newly Joined':
            return veterinarian.experience < 1
          default:
            return true
        }
      })
  
      return matchesSearch && matchesFilters
    })
  })
  
  const toggleFilters = () => {
    showFilters.value = !showFilters.value
  }
  
  const toggleFilter = (filter) => {
    const index = activeFilters.value.indexOf(filter)
    if (index === -1) {
      if (filter === 'All Veterinarians') {
        activeFilters.value = []
      } else {
        activeFilters.value.push(filter)
      }
    } else {
      activeFilters.value.splice(index, 1)
    }
  }
  
  const openAddVeterinarianForm = () => {
    editingVeterinarian.value = null
    veterinarianForm.value = {
      name: '',
      email: '',
      phone: '',
      specialty: '',
      experience: 0
    }
    showForm.value = true
  }
  
  const editVeterinarian = (veterinarian) => {
    editingVeterinarian.value = veterinarian
    veterinarianForm.value = { ...veterinarian }
    showForm.value = true
  }
  
  const archiveVeterinarian = (veterinarian) => {
    const index = veterinarians.value.findIndex(v => v.id === veterinarian.id)
    if (index !== -1) {
      veterinarians.value[index] = {
        ...veterinarians.value[index],
        archived: true
      }
    }
  }
  
  const closeForm = () => {
    showForm.value = false
    editingVeterinarian.value = null
  }
  
  const handleSubmit = () => {
    if (editingVeterinarian.value) {
      const index = veterinarians.value.findIndex(v => v.id === editingVeterinarian.value.id)
      if (index !== -1) {
        veterinarians.value[index] = {
          ...veterinarians.value[index],
          ...veterinarianForm.value
        }
      }
    } else {
      veterinarians.value.push({
        id: veterinarians.value.length + 1,
        profile: '/placeholder.svg?height=40&width=40', // Default profile picture
        ...veterinarianForm.value
      })
    }
    closeForm()
  }
  
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Specialty', 'Experience (Years)']
    const csvContent = [
      headers.join(','),
      ...filteredVeterinarians.value.map(veterinarian =>
        [
          veterinarian.name,
          veterinarian.email,
          veterinarian.phone,
          veterinarian.specialty,
          veterinarian.experience,
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n')
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'veterinarians.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>