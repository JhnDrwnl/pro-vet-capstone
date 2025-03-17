<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Services Management</h1>
      <p class="text-gray-500 mt-1">Manage services offered by the office.</p>
    </div>
    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'categories'"
          :class="[
             'whitespace-nowrap py-1 px-3 rounded-full font-medium mb-2 text-sm transition-colors duration-200',
            activeTab === 'categories'
             ? 'bg-[#EBF5FF] text-[#0066FF]'
                : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          Categories
        </button>
        <button
          @click="activeTab = 'services'"
          :class="[
             'whitespace-nowrap py-1 px-3 rounded-full font-medium mb-2 text-sm transition-colors duration-200',
            activeTab === 'services'
              ? 'bg-[#EBF5FF] text-[#0066FF]'
                : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          Services
        </button>
      </nav>
    </div>

    <!-- Content Section -->
    <div class="p-6">
      <!-- Search and Actions -->
      <div v-if="!showForm" class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div class="w-full sm:w-auto">
          <div class="relative">
            <input 
              v-model="search" 
              class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="activeTab === 'categories' ? 'Search categories...' : 'Search services...'"
            />
            <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="exportToCSV"
            class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-200"
          >
            <Download class="w-4 h-4" />
            Export CSV
          </button>
          <button 
            @click="addNew" 
            class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
          >
          <PlusCircle class="w-4 h-4" />
            {{ activeTab === 'categories' ? 'Add Category' : 'Add Service' }}
          </button>
        </div>
      </div>

      <!-- Table or Form -->
      <div v-if="!showForm">
        <!-- Table -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in activeTab === 'categories' ? categoryHeaders : serviceHeaders" 
                    :key="header.key" 
                    @click="sortBy(header.key)"
                    class="px-6 py-3 text-left text-sm font-medium text-gray-500 tracking-wider cursor-pointer">
                  {{ header.label }}
                  <span v-if="sortKey === header.key" class="ml-1 text-gray-400">
                    {{ sortOrder === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-if="activeTab === 'categories'">
                <tr v-for="category in paginatedItems" :key="category.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ category.description }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <button 
                      @click="editItem(category)" 
                      class="text-gray-500 hover:text-gray-700 p-1 inline-flex items-center"
                    >
                      <LucideEdit class="w-5 h-5" />
                    </button>
                    <button 
                      @click="archiveItem(category.id)" 
                      class="text-gray-500 hover:text-gray-700 p-1 ml-2 inline-flex items-center"
                    >
                      <ArchiveIcon class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr v-for="service in paginatedItems" :key="service.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ service.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ service.classification }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ service.transactionType }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ service.processingTime }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ service.fees || 'None' }}</div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <button 
                      @click="editItem(service)" 
                      class="text-gray-500 hover:text-gray-700 p-1 inline-flex items-center"
                    >
                      <LucideEdit class="w-5 h-5" />
                    </button>
                    <button 
                      @click="archiveItem(service.id)" 
                      class="text-gray-500 hover:text-gray-700 p-1 ml-2 inline-flex items-center"
                    >
                      <ArchiveIcon class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
          </div>
          <div class="flex gap-2">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-full text-sm"
              :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              Previous
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded-full text-sm"
              :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Inline Form -->
      <div v-else class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-xl font-semibold mb-4">{{ formTitle }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Category Form -->
          <template v-if="activeTab === 'categories'">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Category Name</label>
              <input type="text" id="name" v-model="categoryForm.name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" v-model="categoryForm.description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>
          </template>

          <!-- Service Form -->
          <template v-else>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Service Name</label>
                <input type="text" id="name" v-model="serviceForm.name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label for="categoryId" class="block text-sm font-medium text-gray-700">Category</label>
                <select id="categoryId" v-model="serviceForm.categoryId" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="classification" class="block text-sm font-medium text-gray-700">Classification</label>
                <select id="classification" v-model="serviceForm.classification" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="Simple">Simple</option>
                  <option value="Complex">Complex</option>
                </select>
              </div>
              <div>
                <label for="transactionType" class="block text-sm font-medium text-gray-700">Transaction Type</label>
                <input type="text" id="transactionType" v-model="serviceForm.transactionType" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label for="processingTime" class="block text-sm font-medium text-gray-700">Processing Time</label>
                <input type="text" id="processingTime" v-model="serviceForm.processingTime" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label for="fees" class="block text-sm font-medium text-gray-700">Fees</label>
                <input type="text" id="fees" v-model="serviceForm.fees" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div class="col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" v-model="serviceForm.description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Requirements</label>
                <div v-for="(req, index) in serviceForm.requirements" :key="index" class="flex mt-2">
                  <input type="text" v-model="serviceForm.requirements[index]" class="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  <button @click="removeRequirement(index)" type="button" class="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200">
                    Remove
                  </button>
                </div>
                <button @click="addRequirement" type="button" class="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                  Add Requirement
                </button>
              </div>
            </div>
          </template>

          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeForm" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
              {{ editingItem ? 'Save Changes' : 'Add' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Download, PlusCircle, LucideEdit, ArchiveIcon} from 'lucide-vue-next';

const activeTab = ref('categories');
const search = ref('');
const showForm = ref(false);
const currentPage = ref(1);
const itemsPerPage = 10;
const sortKey = ref('name');
const sortOrder = ref('asc');
const editingItem = ref(null);

// Categories data
const categories = ref([
  {
    id: 1,
    name: 'Walk-in Veterinary Services',
    description: 'Services available for walk-in clients'
  },
  {
    id: 2,
    name: 'Elective Veterinary Services',
    description: 'Pre-scheduled veterinary services'
  }
]);

// Services data
const services = ref([
  {
    id: 1,
    categoryId: 1,
    name: 'General Consultation',
    classification: 'Simple',
    transactionType: 'G2C',
    processingTime: '15 minutes',
    fees: 'None',
    description: 'Basic veterinary consultation',
    requirements: ['Valid ID', 'Pet vaccination record']
  }
]);

const categoryForm = ref({
  name: '',
  description: ''
});

const serviceForm = ref({
  name: '',
  categoryId: null,
  classification: 'Simple',
  transactionType: 'G2C',
  processingTime: '',
  fees: '',
  description: '',
  requirements: ['']
});

const categoryHeaders = [
  { key: 'name', label: 'Category Name' },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: 'Actions' }
];

const serviceHeaders = [
  { key: 'name', label: 'Service Name' },
  { key: 'classification', label: 'Classification' },
  { key: 'transactionType', label: 'Transaction Type' },
  { key: 'processingTime', label: 'Processing Time' },
  { key: 'fees', label: 'Fees' },
  { key: 'actions', label: 'Actions' }
];

const formTitle = computed(() => {
  if (editingItem.value) {
    return activeTab.value === 'categories' ? 'Edit Category' : 'Edit Service';
  }
  return activeTab.value === 'categories' ? 'Add New Category' : 'Add New Service';
});

const items = computed(() => activeTab.value === 'categories' ? categories.value : services.value);

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(search.value.toLowerCase()))
  );
});

const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
    let aValue = a[sortKey.value];
    let bValue = b[sortKey.value];

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const totalItems = computed(() => filteredItems.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedItems.value.slice(start, end);
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value));

// Methods
const addNew = () => {
  editingItem.value = null;
  if (activeTab.value === 'categories') {
    categoryForm.value = { name: '', description: '' };
  } else {
    serviceForm.value = {
      name: '',
      categoryId: categories.value[0]?.id,
      classification: 'Simple',
      transactionType: 'G2C',
      processingTime: '',
      fees: '',
      description: '',
      requirements: ['']
    };
  }
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingItem.value = null;
};

const handleSubmit = () => {
  if (activeTab.value === 'categories') {
    if (editingItem.value) {
      const index = categories.value.findIndex(c => c.id === editingItem.value.id);
      if (index !== -1) {
        categories.value[index] = { ...editingItem.value, ...categoryForm.value };
      }
    } else {
      categories.value.push({
        id: Date.now(),
        ...categoryForm.value
      });
    }
  } else {
    if (editingItem.value) {
      const index = services.value.findIndex(s => s.id === editingItem.value.id);
      if (index !== -1) {
        services.value[index] = { 
          ...services.value[index], 
          ...serviceForm.value,
          requirements: serviceForm.value.requirements.filter(req => req.trim() !== '')
        };
      }
    } else {
      services.value.push({
        id: Date.now(),
        ...serviceForm.value,
        requirements: serviceForm.value.requirements.filter(req => req.trim() !== '')
      });
    }
  }
  closeForm();
};

const editItem = (item) => {
  editingItem.value = item;
  if (activeTab.value === 'categories') {
    categoryForm.value = { ...item };
  } else {
    serviceForm.value = { ...item };
  }
  showForm.value = true;
};

const archiveItem = (id) => {
  if (activeTab.value === 'categories') {
    const index = categories.value.findIndex(category => category.id === id);
    if (index !== -1) {
      categories.value[index].archived = true;
    }
  } else {
    const index = services.value.findIndex(service => service.id === id);
    if (index !== -1) {
      services.value[index].archived = true;
    }
  }
};

const addRequirement = () => {
  serviceForm.value.requirements.push('');
};

const removeRequirement = (index) => {
  serviceForm.value.requirements.splice(index, 1);
};

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

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const exportToCSV = () => {
  const items = activeTab.value === 'categories' ? categories.value : services.value;
  const headers = activeTab.value === 'categories' 
    ? ['Category Name', 'Description']
    : ['Service Name', 'Classification', 'Transaction Type', 'Processing Time', 'Fees', 'Description', 'Requirements'];
  
  const csvContent = [
    headers.join(','),
    ...items.map(item => {
      if (activeTab.value === 'categories') {
        return [item.name, item.description].map(field => `"${field}"`).join(',');
      } else {
        return [
          item.name,
          item.classification,
          item.transactionType,
          item.processingTime,
          item.fees,
          item.description,
          item.requirements.join('; ')
        ].map(field => `"${field}"`).join(',');
      }
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${activeTab.value}.csv`;
  link.click();
};
</script>

