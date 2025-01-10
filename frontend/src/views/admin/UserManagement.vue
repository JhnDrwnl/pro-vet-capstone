<template>
  <div class="p-6 bg-white">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
      <p class="text-gray-500 mt-1">Create, update, or deactivate user accounts for veterinarians and pet owners.</p>
    </div>

    <!-- Search, Filter, and Add User -->
    <div v-if="!showForm" class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <div class="relative">
          <input
            type="text"
            placeholder="Search users..."
            v-model="searchQuery"
            class="w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
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
      <button 
        @click="openAddUserForm"
        class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-800"
      >
        <PlusIcon class="w-4 h-4" />
        Add New User
      </button>
    </div>

    <!-- Table -->
    <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr class="border-b border-gray-200">
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">Name</th>
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">Email</th>
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">Role</th>
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-gray-200 last:border-b-0">
            <td class="py-4 px-6">{{ user.firstName }} {{ user.lastName }}</td>
            <td class="py-4 px-6">{{ user.email }}</td>
            <td class="py-4 px-6">{{ user.role }}</td>
            <td class="py-4 px-6">
              <span :class="user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ user.status }}
              </span>
            </td>
            <td class="py-4 px-6">
              <div class="flex gap-2">
                <button 
                  @click="editUser(user)"
                  class="p-1 text-gray-500 hover:text-gray-700"
                >
                  <LucideEdit class="w-5 h-5" />
                </button>
                <button 
                  @click="toggleUserStatus(user.id)"
                  class="p-1 text-gray-500 hover:text-gray-700"
                >
                  <PowerIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Inline Add/Edit User Form -->
    <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              v-model="userForm.firstName"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              v-model="userForm.lastName"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            v-model="userForm.email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div v-if="!editingUser">
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            v-model="userForm.password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="userForm.role"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="Veterinarian">Veterinarian</option>
            <option value="Pet Owner">Pet Owner</option>
          </select>
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
            class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-800"
          >
            {{ editingUser ? 'Save Changes' : 'Add User' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Filter as FilterIcon,
  Plus as PlusIcon,
  Edit as LucideEdit,
  Power as PowerIcon,
  Search as SearchIcon
} from 'lucide-vue-next'

const users = ref([
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'Veterinarian',
    status: 'Active'
  },
  {
    id: 2,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'Pet Owner',
    status: 'Active'
  }
])

const searchQuery = ref('')
const showForm = ref(false)
const showFilters = ref(false)
const editingUser = ref(null)
const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'Pet Owner'
})

const filters = ['Veterinarians', 'Pet Owners', 'Active', 'Inactive']
const activeFilters = ref([])

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    
    const matchesFilters = 
      activeFilters.value.length === 0 ||
      (activeFilters.value.includes('Veterinarians') && user.role === 'Veterinarian') ||
      (activeFilters.value.includes('Pet Owners') && user.role === 'Pet Owner') ||
      (activeFilters.value.includes('Active') && user.status === 'Active') ||
      (activeFilters.value.includes('Inactive') && user.status === 'Inactive')

    return matchesSearch && matchesFilters
  })
})

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const toggleFilter = (filter) => {
  const index = activeFilters.value.indexOf(filter)
  if (index === -1) {
    activeFilters.value.push(filter)
  } else {
    activeFilters.value.splice(index, 1)
  }
}

const openAddUserForm = () => {
  editingUser.value = null
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Pet Owner'
  }
  showForm.value = true
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = { ...user }
  delete userForm.value.password // Don't edit password
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingUser.value = null
}

const handleSubmit = () => {
  if (editingUser.value) {
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...userForm.value
      }
    }
  } else {
    users.value.push({
      id: users.value.length + 1,
      ...userForm.value,
      status: 'Active'
    })
  }
  closeForm()
}

const toggleUserStatus = (userId) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.status = user.status === 'Active' ? 'Inactive' : 'Active'
  }
}
</script>

