<template>
  <div class="bg-white p-6 rounded-2xl">
    <!-- Header Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-medium text-gray-900">Online Sessions</h2>
      <p class="text-gray-500 mt-1">Manage online consultation sessions.</p>
    </div>

    <!-- Search and Actions -->
    <div v-if="!showForm" class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <div class="relative">
          <input 
            v-model="search" 
            class="w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Search sessions..."
          />
          <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button 
          class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          @click="toggleFilters"
        >
          <FilterIcon class="w-5 h-5 text-gray-500" />
        </button>
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
          @click="addNewSession" 
          class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <PlusCircle class="w-4 h-4" />
          Add Session
        </button>
      </div>
    </div>

    <!-- Table -->
    <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr class="border-b border-gray-200">
          
            <th v-for="header in headers" :key="header.key" 
                @click="sortBy(header.key)"
                class="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer">
              {{ header.label }}
              <span v-if="sortKey === header.key" class="ml-1 text-gray-400">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="session in paginatedSessions" :key="session.id" 
              class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img 
                  :src="session.clientAvatar || '/placeholder.svg?height=40&width=40'" 
                  class="w-8 h-8 rounded-full mr-3"
                  alt=""
                />
                <span class="text-sm font-medium text-gray-900">{{ session.clientName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ session.contactInformation }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900">{{ formatPetDetails(session.petDetails) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ formatDateTime(session.sessionDateTime) }}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 truncate block max-w-xs">{{ session.reasonForVisit }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ session.preferredVeterinarian }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <a :href="session.videoCallLink" 
                 target="_blank" 
                 class="text-sm text-blue-600 hover:text-blue-900">Join Call</a>
            </td>
            <td class="px-6 py-4 text-sm">
              <button 
                @click="editSession(session)" 
                class="text-gray-500 hover:text-gray-700 inline-flex gap-4 items-center"
              >
                <LucideEdit class="w-5 h-5" />
              </button>
              <button 
                @click="archiveSession(session.id)" 
                class="text-gray-500 hover:text-gray-700 inline-flex gap-4 items-center"
              >
                <ArchiveIcon class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Inline Add/Edit Form -->
    <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-xl font-semibold mb-4">{{ editingSession ? 'Edit Session' : 'Add New Session' }}</h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              v-model="sessionForm.clientName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
            <input
              v-model="sessionForm.contactInformation"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
            <input
              v-model="sessionForm.petDetails.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pet Species</label>
            <select
              v-model="sessionForm.petDetails.species"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="" disabled>Select a species</option>
              <option v-for="species in speciesList" :key="species" :value="species">
                {{ species }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pet Breed</label>
            <select
              v-model="sessionForm.petDetails.breed"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="" disabled>Select a breed</option>
              <option v-for="breed in breedOptions" :key="breed" :value="breed">
                {{ breed }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pet Age</label>
            <input
              v-model="sessionForm.petDetails.age"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Session Date & Time</label>
            <input
              v-model="sessionForm.sessionDateTime"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
            <input
              v-model="sessionForm.reasonForVisit"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Veterinarian</label>
            <input
              v-model="sessionForm.preferredVeterinarian"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Video Call Link</label>
            <input
              v-model="sessionForm.videoCallLink"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
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
            {{ editingSession ? 'Save Changes' : 'Add Session' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Pagination -->
    <div v-if="!showForm" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAndSortedSessions.length }} entries
      </div>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-2 py-1 border rounded-full text-sm"
          :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-2 py-1 border rounded-full text-sm"
          :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  PlusCircle,
  Edit as LucideEdit,
  Archive as ArchiveIcon
} from 'lucide-vue-next';

const headers = [
  { key: 'clientName', label: 'Client' },
  { key: 'contactInformation', label: 'Contact' },
  { key: 'petDetails', label: 'Pet Details' },
  { key: 'sessionDateTime', label: 'Date & Time' },
  { key: 'reasonForVisit', label: 'Reason' },
  { key: 'preferredVeterinarian', label: 'Veterinarian' },
  { key: 'videoCallLink', label: 'Video Call' },
  { key: 'actions', label: 'Actions' }
];

const sessions = ref([
  {
    id: 1,
    clientName: 'John Doe',
    clientAvatar: '/placeholder.svg?height=40&width=40',
    contactInformation: 'john@example.com | 123-456-7890',
    petDetails: {
      name: 'Max',
      species: 'Dog',
      breed: 'Labrador',
      age: '5 years',
      gender: 'Male'
    },
    sessionDateTime: '2023-05-15T14:30:00',
    reasonForVisit: 'Annual checkup',
    preferredVeterinarian: 'Dr. Smith',
    videoCallLink: 'https://example.com/video-call/1'
  },
  {
    id: 2,
    clientName: 'Jane Smith',
    clientAvatar: '/placeholder.svg?height=40&width=40',
    contactInformation: 'jane@example.com | 987-654-3210',
    petDetails: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Siamese',
      age: '3 years',
      gender: 'Female'
    },
    sessionDateTime: '2023-05-16T10:00:00',
    reasonForVisit: 'Vomiting and loss of appetite',
    preferredVeterinarian: 'Dr. Johnson',
    videoCallLink: 'https://example.com/video-call/2'
  }
]);

const showForm = ref(false);
const editingSession = ref(null);
const sessionForm = ref({
  clientName: '',
  contactInformation: '',
  petDetails: {
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: ''
  },
  sessionDateTime: '',
  reasonForVisit: '',
  preferredVeterinarian: '',
  videoCallLink: ''
});

const speciesList = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
const breedsList = {
  Dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle', 'Other'],
  Cat: ['Siamese', 'Persian', 'Maine Coon', 'British Shorthair', 'Sphynx', 'Other'],
  Bird: ['Parakeet', 'Cockatiel', 'Canary', 'Lovebird', 'Other'],
  Rabbit: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Lionhead', 'Other'],
  Other: ['Other']
};

const search = ref('');
const sortKey = ref('sessionDateTime');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = 10;
const showFilters = ref(false);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const formatPetDetails = (petDetails) => {
  return `${petDetails.name} (${petDetails.species}, ${petDetails.age})`;
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const filteredAndSortedSessions = computed(() => {
  let filtered = sessions.value.filter(session => 
    session.clientName.toLowerCase().includes(search.value.toLowerCase()) ||
    session.petDetails.name.toLowerCase().includes(search.value.toLowerCase())
  );

  return filtered.sort((a, b) => {
    let aValue = a[sortKey.value];
    let bValue = b[sortKey.value];

    if (sortKey.value === 'petDetails') {
      aValue = a.petDetails.name;
      bValue = b.petDetails.name;
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const totalPages = computed(() => Math.ceil(filteredAndSortedSessions.value.length / itemsPerPage));

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedSessions.value.slice(start, end);
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredAndSortedSessions.value.length));

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const formatDateTime = (dateTimeString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleString(undefined, options);
};

const breedOptions = computed(() => {
  return breedsList[sessionForm.value.petDetails.species] || [];
});

const addNewSession = () => {
  editingSession.value = null;
  sessionForm.value = {
    clientName: '',
    contactInformation: '',
    petDetails: {
      name: '',
      species: '',
      breed: '',
      age: '',
      gender: ''
    },
    sessionDateTime: '',
    reasonForVisit: '',
    preferredVeterinarian: '',
    videoCallLink: ''
  };
  showForm.value = true;
};

const editSession = (session) => {
  editingSession.value = session;
  sessionForm.value = { ...session };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingSession.value = null;
};

const handleSubmit = () => {
  if (editingSession.value) {
    const index = sessions.value.findIndex(s => s.id === editingSession.value.id);
    if (index !== -1) {
      sessions.value[index] = { ...sessions.value[index], ...sessionForm.value };
    }
  } else {
    sessions.value.push({
      id: sessions.value.length + 1,
      clientAvatar: '/placeholder.svg?height=40&width=40',
      ...sessionForm.value
    });
  }
  closeForm();
};

const archiveSession = (id) => {
  const index = sessions.value.findIndex(session => session.id === id);
  if (index !== -1) {
    sessions.value[index] = {
      ...sessions.value[index],
      archived: true
    };
  }
};

const exportToCSV = () => {
  const headers = ['Client Name', 'Contact', 'Pet Details', 'Date & Time', 'Reason', 'Veterinarian', 'Video Call Link'];
  const csvContent = [
    headers.join(','),
    ...filteredAndSortedSessions.value.map(session => [
      session.clientName,
      session.contactInformation,
      formatPetDetails(session.petDetails),
      formatDateTime(session.sessionDateTime),
      session.reasonForVisit,
      session.preferredVeterinarian,
      session.videoCallLink
    ].map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'online-sessions.csv';
  link.click();
};
</script>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
  --tw-divide-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-divide-opacity));
}

@media (max-width: 640px) {
  .overflow-x-auto {
    margin: 0 -1.5rem;
  }
  
  table {
    font-size: 0.875rem;
  }
}
</style>