<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Pet Profiles</h1>
      <p class="text-gray-500 mt-1">Manage pet profiles and information.</p>
    </div>

    <!-- Search, Filter, Add, and Export -->
    <div v-if="!showForm" class="flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <div class="relative">
          <input
            type="text"
            placeholder="Search pets..."
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
          @click="openAddPetForm"
          class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <LucidePlus class="w-4 h-4" />
          Add Pet
        </button>
      </div>
    </div>

    <!-- Table -->
    <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr class="border-b border-gray-200">
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Photo</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Name</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Species</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Breed</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Age</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Owner</th>
            <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="pet in filteredPets" :key="pet.id">
            <td class="py-4 px-6">
              <img :src="pet.photo || '/placeholder.svg?height=40&width=40'" 
                   :alt="pet.name"
                   class="w-10 h-10 rounded-full object-cover" />
            </td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ pet.name }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ pet.species }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ pet.breed }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ formatAge(pet.age) }}</td>
            <td class="py-4 px-6 text-sm text-gray-900">{{ pet.owner }}</td>
            <td class="py-4 px-6 text-sm">
              <div class="flex items-center gap-2">
                <button 
                  @click="editPet(pet)"
                  class="p-1 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <LucideEdit class="w-5 h-5" />
                </button>
                <button 
                  @click="archivePet(pet)"
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

    <!-- Inline Add/Edit Pet Form -->
    <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold mb-4">{{ editingPet ? 'Edit Pet' : 'Add New Pet' }}</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            v-model="petForm.name"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Species</label>
          <select
            v-model="petForm.species"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            @change="petForm.breed = ''"
          >
            <option value="" disabled>Select a species</option>
            <option v-for="species in speciesList" :key="species" :value="species">
              {{ species }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <select
            v-model="petForm.breed"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <option value="" disabled>Select a breed</option>
            <option v-for="breed in breedsList[petForm.species] || []" :key="breed" :value="breed">
              {{ breed }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <div class="flex gap-2">
            <input
              type="number"
              v-model="petForm.age.years"
              min="0"
              placeholder="Years"
              class="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
            <input
              type="number"
              v-model="petForm.age.months"
              min="0"
              max="11"
              placeholder="Months"
              class="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
            <input
              type="number"
              v-model="petForm.age.weeks"
              min="0"
              max="3"
              placeholder="Weeks"
              class="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
          <input
            type="text"
            v-model="petForm.owner"
            required
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
            {{ editingPet ? 'Save Changes' : 'Add Pet' }}
          </button>
        </div>
      </form>
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

const speciesList = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other']
const breedsList = {
  Dog: ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle', 'Other'],
  Cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Sphynx', 'Other'],
  Bird: ['Parakeet', 'Canary', 'Cockatiel', 'Lovebird', 'Finch', 'Other'],
  Rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Lionhead', 'Other'],
  Fish: ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Other'],
  Other: ['Other']
}

const pets = ref([
  {
    id: 1,
    photo: '/placeholder.svg?height=40&width=40',
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador Retriever',
    age: { years: 5, months: 2, weeks: 1 },
    owner: 'John Doe'
  },
  {
    id: 2,
    photo: '/placeholder.svg?height=40&width=40',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Siamese',
    age: { years: 3, months: 6, weeks: 0 },
    owner: 'Jane Smith'
  },
  {
    id: 3,
    photo: '/placeholder.svg?height=40&width=40',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: { years: 0, months: 8, weeks: 2 },
    owner: 'Mike Johnson'
  }
])

const searchQuery = ref('')
const showForm = ref(false)
const showFilters = ref(false)
const editingPet = ref(null)
const petForm = ref({
  name: '',
  species: '',
  breed: '',
  age: { years: 0, months: 0, weeks: 0 },
  owner: ''
})

const filters = ['All Pets', 'Dogs', 'Cats', 'Other Species']
const activeFilters = ref([])

const filteredPets = computed(() => {
  return pets.value.filter(pet => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchLower) ||
      pet.species.toLowerCase().includes(searchLower) ||
      pet.breed.toLowerCase().includes(searchLower) ||
      pet.owner.toLowerCase().includes(searchLower)

    const matchesFilters = activeFilters.value.length === 0 || activeFilters.value.some(filter => {
      switch(filter) {
        case 'Dogs':
          return pet.species.toLowerCase() === 'dog'
        case 'Cats':
          return pet.species.toLowerCase() === 'cat'
        case 'Other Species':
          return !['dog', 'cat'].includes(pet.species.toLowerCase())
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
    if (filter === 'All Pets') {
      activeFilters.value = []
    } else {
      activeFilters.value.push(filter)
    }
  } else {
    activeFilters.value.splice(index, 1)
  }
}

const openAddPetForm = () => {
  editingPet.value = null
  petForm.value = {
    name: '',
    species: '',
    breed: '',
    age: { years: 0, months: 0, weeks: 0 },
    owner: ''
  }
  showForm.value = true
}

const editPet = (pet) => {
  editingPet.value = pet
  petForm.value = { ...pet, age: { ...pet.age } }
  showForm.value = true
}

const archivePet = (pet) => {
  const index = pets.value.findIndex(p => p.id === pet.id)
  if (index !== -1) {
    pets.value[index] = {
      ...pets.value[index],
      archived: true
    }
  }
}

const closeForm = () => {
  showForm.value = false
  editingPet.value = null
}

const handleSubmit = () => {
  if (editingPet.value) {
    const index = pets.value.findIndex(p => p.id === editingPet.value.id)
    if (index !== -1) {
      pets.value[index] = {
        ...pets.value[index],
        ...petForm.value
      }
    }
  } else {
    pets.value.push({
      id: pets.value.length + 1,
      photo: '/placeholder.svg?height=40&width=40',
      ...petForm.value
    })
  }
  closeForm()
}

const formatAge = (age) => {
  const parts = []
  if (age.years > 0) parts.push(`${age.years} year${age.years > 1 ? 's' : ''}`)
  if (age.months > 0) parts.push(`${age.months} month${age.months > 1 ? 's' : ''}`)
  if (age.weeks > 0) parts.push(`${age.weeks} week${age.weeks > 1 ? 's' : ''}`)
  return parts.join(', ') || 'Newborn'
}

const exportToCSV = () => {
  const headers = ['Name', 'Species', 'Breed', 'Age (Years)', 'Age (Months)', 'Age (Weeks)', 'Owner']
  const csvContent = [
    headers.join(','),
    ...filteredPets.value.map(pet =>
      [
        pet.name,
        pet.species,
        pet.breed,
        pet.age.years,
        pet.age.months,
        pet.age.weeks,
        pet.owner,
      ].map(field => `"${field}"`).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'pets.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>