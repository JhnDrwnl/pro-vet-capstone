<!-- views/admin/datamanagement/PetOwners.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Pet Owner Management</h1>
      <p class="text-gray-500 mt-1">Manage pet owner profiles.</p>
    </div>

    <!-- Search, Filter, and Export -->
    <div v-if="!showForm" class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <div class="relative">
          <input
            type="text"
            placeholder="Search pet owners..."
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
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Birthday</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Address</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Pets</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="client in filteredClients" :key="client.id">
            <td class="py-4 px-6">
              <img :src="client.profile || '/placeholder.svg?height=40&width=40'" 
                   :alt="client.name"
                   class="w-10 h-10 rounded-full object-cover" />
            </td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ client.name }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ client.email }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ client.phone }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ formatDate(client.birthday) }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ client.address }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">
              <div class="flex items-center">
                <div class="flex -space-x-2 mr-2">
                  <img 
                    v-for="(pet, index) in parsePets(client.pets)" 
                    :key="index"
                    :src="`/placeholder.svg?height=24&width=24`" 
                    :alt="pet"
                    class="w-6 h-6 rounded-full border-2 border-white object-cover"
                    v-show="index < 2"
                  />
                </div>
                <span class="text-blue-600 font-medium">{{ formatPetNames(client.pets) }}</span>
              </div>
            </td>
            <td class="py-4 px-6 text-sm">
              <div class="flex items-center gap-2">
                <button 
                  @click="editClient(client)"
                  class="p-1 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <LucideEdit class="w-5 h-5" />
                </button>
                <button 
                  @click="archiveClient(client)"
                  class="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Inline Add/Edit Client Form -->
    <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingClient ? 'Edit Pet Owner' : 'Add New Pet Owner' }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            v-model="clientForm.name"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            v-model="clientForm.email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            v-model="clientForm.phone"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
          <input
            type="date"
            v-model="clientForm.birthday"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            v-model="clientForm.address"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pets</label>
          <input
            type="text"
            v-model="clientForm.pets"
            required
            placeholder="e.g., Max (Dog), Whiskers (Cat)"
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
            {{ editingClient ? 'Save Changes' : 'Add Pet Owner' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Edit as LucideEdit,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Trash2
} from 'lucide-vue-next'

const clients = ref([
  {
    id: 1,
    profile: '/placeholder.svg?height=40&width=40',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    birthday: '1990-01-01',
    address: '123 Main St, Anytown, USA',
    pets: 'Max (Dog), Whiskers (Cat)'
  }
])

const searchQuery = ref('')
const showForm = ref(false)
const showFilters = ref(false)
const editingClient = ref(null)
const clientForm = ref({
  name: '',
  email: '',
  phone: '',
  birthday: '',
  address: '',
  pets: ''
})

const filters = ['All Clients', 'Recent', 'Has Pets', 'No Pets']
const activeFilters = ref([])

const filteredClients = computed(() => {
  return clients.value.filter(client => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower) ||
      client.address.toLowerCase().includes(searchLower) ||
      client.pets.toLowerCase().includes(searchLower)

    const matchesFilters = activeFilters.value.length === 0 || activeFilters.value.some(filter => {
      switch(filter) {
        case 'Has Pets':
          return client.pets && client.pets.length > 0
        case 'No Pets':
          return !client.pets || client.pets.length === 0
        case 'Recent':
          return new Date(client.birthday) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        default:
          return true
      }
    })

    return matchesSearch && matchesFilters
  })
})

// Parse pets string into array of pet names
const parsePets = (petsString) => {
  if (!petsString) return []
  
  // Split by comma and extract pet names (without type in parentheses)
  return petsString.split(',').map(pet => {
    const petName = pet.trim().split('(')[0].trim()
    return petName
  })
}

// Format pet names for display
const formatPetNames = (petsString) => {
  const petNames = parsePets(petsString)
  return petNames.join(', ')
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const toggleFilter = (filter) => {
  const index = activeFilters.value.indexOf(filter)
  if (index === -1) {
    if (filter === 'All Clients') {
      activeFilters.value = []
    } else {
      activeFilters.value.push(filter)
    }
  } else {
    activeFilters.value.splice(index, 1)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const openAddClientForm = () => {
  editingClient.value = null
  clientForm.value = {
    name: '',
    email: '',
    phone: '',
    birthday: '',
    address: '',
    pets: ''
  }
  showForm.value = true
}

const editClient = (client) => {
  editingClient.value = client
  clientForm.value = { ...client }
  showForm.value = true
}

const archiveClient = (client) => {
  const index = clients.value.findIndex(c => c.id === client.id)
  if (index !== -1) {
    clients.value[index] = {
      ...clients.value[index],
      archived: true
    }
  }
}

const closeForm = () => {
  showForm.value = false
  editingClient.value = null
}

const handleSubmit = () => {
  if (editingClient.value) {
    const index = clients.value.findIndex(c => c.id === editingClient.value.id)
    if (index !== -1) {
      clients.value[index] = {
        ...clients.value[index],
        ...clientForm.value
      }
    }
  } else {
    clients.value.push({
      id: clients.value.length + 1,
      profile: '/placeholder.svg?height=40&width=40',
      ...clientForm.value
    })
  }
  closeForm()
}

const exportToCSV = () => {
  const headers = ['Name', 'Email', 'Phone', 'Birthday', 'Address', 'Pets']
  const csvContent = [
    headers.join(','),
    ...filteredClients.value.map(client => 
      [
        client.name,
        client.email,
        client.phone,
        client.birthday,
        client.address,
        client.pets
      ].map(field => `"${field}"`).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'pet_owners.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>