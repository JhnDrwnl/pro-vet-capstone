<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="mb-8 space-x-2">
      <h1 class="text-2xl font-semibold text-gray-900 flex items-center">
        <button v-if="selectedCategory" @click="selectedCategory = null" class="mr-2">
          <ChevronLeftIcon class="w-6 h-6 text-gray-700 hover:text-gray-900 transition" />
        </button>
        {{ selectedCategory ? selectedCategory.name : 'Archive' }}
      </h1>
    </div>

    <!-- Category Folders -->
    <div v-if="!selectedCategory" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
      <div 
        v-for="category in categories" 
        :key="category.id"
        @click="selectCategory(category)"
        class="cursor-pointer group relative"
      >
        <!-- Folder shape -->
        <div 
          class="w-full h-24 rounded-t-lg pt-8 px-2 shadow-md transition-colors duration-200"
          :class="[category.bgColor, category.hoverBgColor]"
        >
          <div 
            class="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-2 rounded-t-lg transition-colors duration-200"
            :class="[category.tabColor, category.hoverTabColor]"
          ></div>
          <component :is="category.icon" class="w-10 h-10 mx-auto" :class="category.iconColor" />
        </div>
        <div class="w-full bg-white p-2 rounded-b-lg shadow-md">
          <h3 class="text-sm font-medium text-center" :class="category.textColor">{{ category.name }}</h3>
        </div>
      </div>
    </div>

    <!-- Subcategory Tabs and Content -->
    <div v-if="selectedCategory">
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex space-x-4">
          <button
            v-for="subcategory in selectedCategory.subcategories"
            :key="subcategory.name"
            @click="selectSubcategory(subcategory)"
            class="whitespace-nowrap py-1 px-3 rounded-full font-medium mb-2 text-sm transition-colors duration-200"
            :class="[
              activeSubcategory === subcategory
                ? 'bg-[#EBF5FF] text-[#0066FF]'
                : 'text-gray-500 hover:bg-gray-100'
            ]"
          >
            {{ subcategory.name }}
          </button>
        </nav>
      </div>

      <!-- Table View for Selected Subcategory -->
      <div v-if="activeSubcategory" class="bg-white rounded-lg border border-gray-200">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr class="border-b border-gray-200">
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in activeSubcategory.items" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="restoreItem(item)" class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200">Restore</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MessageCircle as MessageCircleIcon,
  Database as DatabaseIcon,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-vue-next';

const categories = [
  { 
    id: 1, 
    name: 'Users', 
    icon: UsersIcon, 
    bgColor: 'bg-blue-100', 
    hoverBgColor: 'group-hover:bg-blue-200', 
    tabColor: 'bg-blue-200', 
    hoverTabColor: 'group-hover:bg-blue-300', 
    iconColor: 'text-blue-600', 
    textColor: 'text-blue-800',
    subcategories: [
      {
        name: 'All Users',
        items: [
          { id: 'U001', name: 'John Doe', status: 'Inactive', date: '2024-02-10' },
          { id: 'U002', name: 'Jane Smith', status: 'Inactive', date: '2024-01-15' }
        ]
      }
    ]
  },
  { 
    id: 2, 
    name: 'Appointments', 
    icon: CalendarIcon, 
    bgColor: 'bg-green-100', 
    hoverBgColor: 'group-hover:bg-green-200', 
    tabColor: 'bg-green-200', 
    hoverTabColor: 'group-hover:bg-green-300', 
    iconColor: 'text-green-600', 
    textColor: 'text-green-800',
    subcategories: [
      {
        name: 'All Appointments',
        items: [
          { id: 'A001', name: 'Checkup Appointment', status: 'Inactive', date: '2024-03-01' },
          { id: 'A002', name: 'Vaccination Appointment', status: 'Inactive', date: '2024-02-20' }
        ]
      }
    ]
  },
  { 
    id: 3, 
    name: 'Services', 
    icon: SettingsIcon, 
    bgColor: 'bg-yellow-100', 
    hoverBgColor: 'group-hover:bg-yellow-200', 
    tabColor: 'bg-yellow-200', 
    hoverTabColor: 'group-hover:bg-yellow-300', 
    iconColor: 'text-yellow-600', 
    textColor: 'text-yellow-800',
    subcategories: [
      {
        name: 'All Services',
        items: [
          { id: 'S001', name: 'General Checkup', status: 'Inactive', date: '2024-01-05' },
          { id: 'S002', name: 'Grooming', status: 'Inactive', date: '2024-02-15' }
        ]
      }
    ]
  },
  { 
    id: 4, 
    name: 'Session', 
    icon: CalendarIcon, 
    bgColor: 'bg-orange-100', 
    hoverBgColor: 'group-hover:bg-orange-200', 
    tabColor: 'bg-orange-200', 
    hoverTabColor: 'group-hover:bg-orange-300', 
    iconColor: 'text-orange-600', 
    textColor: 'text-orange-800',
    subcategories: [
      {
        name: 'Online',
        items: [
          { id: 'SO001', name: 'Online Consultation', status: 'Inactive', date: '2024-02-10' }
        ]
      },
      {
        name: 'Walk-in',
        items: [
          { id: 'SW001', name: 'In-person Checkup', status: 'Inactive', date: '2024-01-15' }
        ]
      }
    ]
  },
  { 
    id: 5, 
    name: 'Data Management', 
    icon: DatabaseIcon, 
    bgColor: 'bg-red-100', 
    hoverBgColor: 'group-hover:bg-red-200', 
    tabColor: 'bg-red-200', 
    hoverTabColor: 'group-hover:bg-red-300', 
    iconColor: 'text-red-600', 
    textColor: 'text-red-800',
    subcategories: [
      {
        name: 'Pet Owners',
        items: [
          { id: 'DO001', name: 'Owner Records', status: 'Inactive', date: '2024-03-01' }
        ]
      },
      {
        name: 'Pet Profiles',
        items: [
          { id: 'DP001', name: 'Pet Records', status: 'Inactive', date: '2024-02-20' }
        ]
      },
      {
        name: 'Veterinarians',
        items: [
          { id: 'DV001', name: 'Vet Records', status: 'Inactive', date: '2024-02-20' }
        ]
      }
    ]
  },
  { 
    id: 6, 
    name: 'Chatbot Scripts', 
    icon: MessageCircleIcon, 
    bgColor: 'bg-purple-100', 
    hoverBgColor: 'group-hover:bg-purple-200', 
    tabColor: 'bg-purple-200', 
    hoverTabColor: 'group-hover:bg-purple-300', 
    iconColor: 'text-purple-600', 
    textColor: 'text-purple-800',
    subcategories: [
      {
        name: 'All Scripts',
        items: [
          { id: 'C001', name: 'Appointment Booking', status: 'Inactive', date: '2024-01-05' },
          { id: 'C002', name: 'Pet Care Tips', status: 'Inactive', date: '2024-02-15' }
        ]
      }
    ]
  }
];

const selectedCategory = ref(null);
const activeSubcategory = ref(null);

const selectCategory = (category) => {
  selectedCategory.value = category;
  activeSubcategory.value = category.subcategories[0];
};

const selectSubcategory = (subcategory) => {
  activeSubcategory.value = subcategory;
};

const restoreItem = (item) => {
  item.status = 'Active';
  // Add any additional restore logic here
};
</script>

