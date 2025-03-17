<!-- views/admin/adminsettings/Archive.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="mb-8 flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-900 flex items-center">
        <button v-if="selectedCategory" @click="selectedCategory = null" class="mr-2">
          <ChevronLeftIcon class="w-6 h-6 text-gray-700 hover:text-gray-900 transition" />
        </button>
        {{ selectedCategory ? selectedCategory.name : 'Archive' }}
      </h1>
      
      <!-- Bulk Actions (only show when items are selected) -->
      <div v-if="selectedCategory && selectedItems.length > 0" class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">{{ selectedItems.length }} item(s) selected</span>
        <button 
          @click="confirmBulkDelete" 
          class="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1"
          :disabled="deleting"
        >
          <TrashIcon class="w-4 h-4" />
          <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
        </button>
        <button 
          @click="bulkRestore" 
          class="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
          :disabled="restoring !== null"
        >
          <RefreshCwIcon class="w-4 h-4" />
          <span>{{ restoring !== null ? 'Restoring...' : 'Restore' }}</span>
        </button>
      </div>
    </div>
  
    <!-- Debug Info - Remove in production -->
    <div v-if="debug" class="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
      <p>Archived Items: {{ archivedItems.length }}</p>
      <p>Services: {{ archivedItems.filter(item => item.itemType === 'service').length }}</p>
      <p>Categories: {{ archivedItems.filter(item => item.itemType === 'category').length }}</p>
    </div>
  
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  
    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
  
    <!-- Category Folders -->
    <div v-else-if="!selectedCategory" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
      <div 
        v-for="category in categories" 
        :key="category.id"
        @click="selectCategory(category)"
        class="cursor-pointer group relative"
      >
        <!-- Improved Folder Design with Increased Height but smaller icons -->
        <div class="relative h-[160px] flex flex-col items-center">
          <!-- Folder tab -->
          <div 
            class="absolute top-0 left-1/2 transform -translate-x-1/2 w-[60%] h-7 rounded-t-md z-10 transition-colors duration-200"
            :class="[category.tabColor, category.hoverTabColor]"
          ></div>
        
          <!-- Folder body -->
          <div 
            class="absolute top-4 w-full h-[130px] rounded-md shadow-md transition-colors duration-200 overflow-hidden"
            :class="[category.bgColor, category.hoverBgColor]"
          >
            <!-- White bottom part of the folder -->
            <div class="absolute bottom-0 left-0 right-0 h-[65px] bg-white rounded-b-md"></div>
            
            <!-- Content container with fixed layout -->
            <div class="relative z-10 h-full flex flex-col items-center justify-center">
              <!-- Icon with adjusted size -->
              <div class="h-[60px] flex items-center justify-center mb-2">
                <component :is="category.icon" class="w-9 h-9" :class="category.iconColor" />
              </div>
              
              <!-- Text with increased height -->
              <div class="h-[30px] flex items-center justify-center">
                <h3 class="text-base font-medium text-center w-full px-2" :class="category.textColor">
                  {{ category.name }}
                </h3>
              </div>
              
              <!-- Count with increased height -->
              <div class="h-[20px] flex items-center justify-center">
                <p v-if="category.name === 'Services'" class="text-sm text-center text-gray-600">
                  {{ archivedItems.length }} items
                </p>
              </div>
            </div>
          </div>
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
            {{ subcategory.name }} ({{ subcategory.items.length }})
          </button>
        </nav>
      </div>
  
      <!-- Table View for Selected Subcategory -->
      <div v-if="activeSubcategory" class="bg-white rounded-lg border border-gray-200">
        <!-- Empty State for Items -->
        <div v-if="activeSubcategory.items.length === 0" class="text-center py-10">
          <InboxIcon class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p class="mt-1 text-sm text-gray-500">There are no archived items in this category.</p>
        </div>
        
        <table v-else class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b border-gray-200">
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  class="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-Delete</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in activeSubcategory.items" :key="item.id" :class="{ 'bg-blue-50': isItemSelected(item.id) }">
              <td class="px-3 py-4 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  class="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  :checked="isItemSelected(item.id)"
                  @change="toggleSelectItem(item.id)"
                />
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.originalId || item.id }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
              <td class="px-3 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="item.itemType === 'category' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ item.itemType === 'category' ? 'Category' : 'Service' }}
                </span>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(item.archivedAt) }}</td>
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="text-sm" :class="getDaysLeftClass(item)">
                  {{ getDaysLeft(item) }} days left
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <!-- Confirmation Modal for Permanent Deletion -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Permanent Deletion</h3>
      <p class="text-gray-500 mb-6">
        Are you sure you want to permanently delete 
        <span class="font-semibold">{{ itemToDelete ? itemToDelete.name : selectedItems.length + ' items' }}</span>? 
        This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancelDelete" 
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          Cancel
        </button>
        <button 
          @click="confirmDeleteAction" 
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center"
        >
          <TrashIcon class="w-4 h-4 mr-1" />
          Delete Permanently
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useArchivesStore } from '@/stores/modules/archivesStore';
import { 
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MessageCircle as MessageCircleIcon,
  Database as DatabaseIcon,
  ChevronLeft as ChevronLeftIcon,
  Image as ImageIcon,
  Inbox as InboxIcon,
  Trash as TrashIcon,
  RefreshCw as RefreshCwIcon
} from 'lucide-vue-next';

// Debug mode
const debug = ref(true);

// State
const loading = ref(true);
const error = ref(null);
const archivedItems = ref([]);
const selectedCategory = ref(null);
const activeSubcategory = ref(null);
const restoring = ref(null);
const deleting = ref(null);
const selectedItems = ref([]);
const showDeleteConfirmation = ref(false);
const itemToDelete = ref(null);
const autoDeletedCount = ref(0); // Track how many items were auto-deleted

// Get archives store
const archivesStore = useArchivesStore();

// Computed property to check if all items are selected
const isAllSelected = computed(() => {
  if (!activeSubcategory.value || activeSubcategory.value.items.length === 0) {
    return false;
  }
  return activeSubcategory.value.items.every(item => isItemSelected(item.id));
});

// Format date
const formatDate = (date) => {
  if (!date) return 'Unknown';

  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate days left before auto-deletion (30 days from archive date)
const getDaysLeft = (item) => {
  if (!item.archivedAt) return 30;

  let archiveDate;
  if (typeof item.archivedAt === 'string') {
    archiveDate = new Date(item.archivedAt);
  } else if (item.archivedAt.toDate && typeof item.archivedAt.toDate === 'function') {
    archiveDate = item.archivedAt.toDate();
  } else {
    archiveDate = item.archivedAt;
  }

  const deleteDate = new Date(archiveDate);
  deleteDate.setDate(deleteDate.getDate() + 30);

  const today = new Date();
  const daysLeft = Math.ceil((deleteDate - today) / (1000 * 60 * 60 * 24));

  return Math.max(0, daysLeft);
};

// Check if an item is expired (0 days left)
const isItemExpired = (item) => {
  return getDaysLeft(item) <= 0;
};

// Check for and delete expired items
const checkAndDeleteExpiredItems = async () => {
  console.log('Checking for expired items...');
  const expiredItems = archivedItems.value.filter(item => isItemExpired(item));
  
  if (expiredItems.length === 0) {
    console.log('No expired items found');
    return;
  }
  
  console.log(`Found ${expiredItems.length} expired items to auto-delete`);
  autoDeletedCount.value = 0;
  
  for (const item of expiredItems) {
    try {
      console.log(`Auto-deleting expired item: ${item.name} (ID: ${item.id})`);
      const success = await archivesStore.permanentlyDeleteArchivedItem(item.id);
      
      if (success) {
        autoDeletedCount.value++;
      } else {
        console.error(`Failed to auto-delete item: ${item.id}`);
      }
    } catch (err) {
      console.error(`Error auto-deleting item ${item.id}:`, err);
    }
  }
  
  // If any items were deleted, refresh the data
  if (autoDeletedCount.value > 0) {
    console.log(`Successfully auto-deleted ${autoDeletedCount.value} expired items`);
    // Show notification or update UI to inform user
    error.value = null; // Clear any previous errors
    
    // Refresh the archived items to update the UI
    await fetchArchivedItems();
  }
};

// Get class for days left counter
const getDaysLeftClass = (item) => {
  const days = getDaysLeft(item);
  if (days <= 5) return 'text-red-600 font-bold';
  if (days <= 10) return 'text-orange-600';
  return 'text-gray-600';
};

// Check if an item is selected
const isItemSelected = (itemId) => {
  return selectedItems.value.includes(itemId);
};

// Toggle select all items
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = activeSubcategory.value.items.map(item => item.id);
  }
};

// Toggle select individual item
const toggleSelectItem = (itemId) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index === -1) {
    selectedItems.value.push(itemId);
  } else {
    selectedItems.value.splice(index, 1);
  }
};

// Fetch archived items
const fetchArchivedItems = async () => {
  loading.value = true;
  error.value = null;

  try {
    console.log('Fetching archived items...');
    const items = await archivesStore.fetchArchivedItems();
    console.log('Fetched items:', items);
    archivedItems.value = items;
    
    // Update the categories with real data
    updateCategoriesWithRealData();
  } catch (err) {
    console.error('Error fetching archived items:', err);
    error.value = 'Failed to load archived items. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Define categories (keeping the original structure)
const categories = ref([
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
        items: []
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
        items: []
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
        name: 'All Items',
        items: []
      },
      {
        name: 'Services',
        items: []
      },
      {
        name: 'Categories',
        items: []
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
        items: []
      },
      {
        name: 'Walk-in',
        items: []
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
        items: []
      },
      {
        name: 'Pet Profiles',
        items: []
      },
      {
        name: 'Veterinarians',
        items: []
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
        items: []
      }
    ]
  }
]);

// Update categories with real data
const updateCategoriesWithRealData = () => {
  console.log('Updating categories with real data...');

  // Find the Services category
  const servicesCategory = categories.value.find(cat => cat.name === 'Services');
  if (servicesCategory) {
    // Get all archived items
    const allItems = archivedItems.value;
    
    // Filter archived items for services and categories
    const serviceItems = archivedItems.value.filter(item => item.itemType === 'service');
    const categoryItems = archivedItems.value.filter(item => item.itemType === 'category');
    
    console.log('All items:', allItems.length);
    console.log('Service items:', serviceItems.length);
    console.log('Category items:', categoryItems.length);
    
    // Update the "All Items" subcategory
    const allItemsSubcategory = servicesCategory.subcategories.find(sub => sub.name === 'All Items');
    if (allItemsSubcategory) {
      allItemsSubcategory.items = allItems;
    }
    
    // Update the "Services" subcategory
    const servicesSubcategory = servicesCategory.subcategories.find(sub => sub.name === 'Services');
    if (servicesSubcategory) {
      servicesSubcategory.items = serviceItems;
    }
    
    // Update the "Categories" subcategory
    const categoriesSubcategory = servicesCategory.subcategories.find(sub => sub.name === 'Categories');
    if (categoriesSubcategory) {
      categoriesSubcategory.items = categoryItems;
    }
  }
};

// Select category
const selectCategory = (category) => {
  selectedCategory.value = category;
  activeSubcategory.value = category.subcategories[0];
  selectedItems.value = []; // Clear selected items when changing category
};

// Select subcategory
const selectSubcategory = (subcategory) => {
  activeSubcategory.value = subcategory;
  selectedItems.value = []; // Clear selected items when changing subcategory
};

// Restore item
const restoreItem = async (item) => {
  restoring.value = item.id;
  error.value = null;

  try {
    console.log('Attempting to restore item:', item);
    
    // Make sure we have the full item data
    if (!item.itemType || !item.originalId) {
      console.log('Item missing required fields, fetching full data...');
      const fullItem = await archivesStore.getArchivedItemById(item.id);
      if (!fullItem) {
        throw new Error('Could not retrieve full item data');
      }
      item = fullItem;
    }
    
    const success = await archivesStore.restoreArchivedItem(item.id);
    
    if (!success) {
      throw new Error('Restore operation failed');
    }
    
    // Remove item from the list
    if (activeSubcategory.value) {
      activeSubcategory.value.items = activeSubcategory.value.items.filter(i => i.id !== item.id);
    }
    
    // Remove from selected items if it was selected
    const index = selectedItems.value.indexOf(item.id);
    if (index !== -1) {
      selectedItems.value.splice(index, 1);
    }
    
    // Refresh the archived items
    await fetchArchivedItems();
  } catch (err) {
    console.error('Error restoring item:', err);
    error.value = `Failed to restore ${item.name}: ${err.message}`;
  } finally {
    restoring.value = null;
  }
};

// Bulk restore selected items
const bulkRestore = async () => {
  if (selectedItems.value.length === 0) return;

  restoring.value = 'bulk';
  error.value = null;

  try {
    for (const itemId of selectedItems.value) {
      const item = archivedItems.value.find(i => i.id === itemId);
      if (item) {
        await restoreItem(item);
      }
    }
    
    // Clear selected items
    selectedItems.value = [];
    
  } catch (err) {
    console.error('Error bulk restoring items:', err);
    error.value = `Failed to restore selected items: ${err.message}`;
  } finally {
    restoring.value = null;
  }
};

// Confirm delete for a single item
const confirmDelete = (item) => {
  itemToDelete.value = item;
  showDeleteConfirmation.value = true;
};

// Confirm bulk delete
const confirmBulkDelete = () => {
  itemToDelete.value = null;
  showDeleteConfirmation.value = true;
};

// Cancel delete
const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  itemToDelete.value = null;
};

// Confirm delete action
const confirmDeleteAction = async () => {
  if (itemToDelete.value) {
    // Single item delete
    await permanentlyDeleteItem(itemToDelete.value);
  } else {
    // Bulk delete
    await bulkDelete();
  }

  showDeleteConfirmation.value = false;
  itemToDelete.value = null;
};

// Permanently delete a single item
const permanentlyDeleteItem = async (item) => {
  deleting.value = item.id;
  error.value = null;

  try {
    console.log('Permanently deleting item:', item);
    
    const success = await archivesStore.permanentlyDeleteArchivedItem(item.id);
    
    if (!success) {
      throw new Error('Delete operation failed');
    }
    
    // Remove item from the list
    if (activeSubcategory.value) {
      activeSubcategory.value.items = activeSubcategory.value.items.filter(i => i.id !== item.id);
    }
    
    // Remove from selected items if it was selected
    const index = selectedItems.value.indexOf(item.id);
    if (index !== -1) {
      selectedItems.value.splice(index, 1);
    }
    
    // Refresh the archived items
    await fetchArchivedItems();
  } catch (err) {
    console.error('Error deleting item:', err);
    error.value = `Failed to delete ${item.name}: ${err.message}`;
  } finally {
    deleting.value = null;
  }
};

// Bulk delete selected items
const bulkDelete = async () => {
  if (selectedItems.value.length === 0) return;

  deleting.value = 'bulk';
  error.value = null;

  try {
    for (const itemId of [...selectedItems.value]) {
      const item = archivedItems.value.find(i => i.id === itemId);
      if (item) {
        await archivesStore.permanentlyDeleteArchivedItem(itemId);
        
        // Remove from selected items
        const index = selectedItems.value.indexOf(itemId);
        if (index !== -1) {
          selectedItems.value.splice(index, 1);
        }
      }
    }
    
    // Refresh the archived items
    await fetchArchivedItems();
  } catch (err) {
    console.error('Error bulk deleting items:', err);
    error.value = `Failed to delete selected items: ${err.message}`;
  } finally {
    deleting.value = null;
  }
};

// Fetch data on mount
onMounted(async () => {
  console.log('Component mounted, fetching archived items...');
  await fetchArchivedItems();
  
  // After fetching items, check for and delete expired items
  await checkAndDeleteExpiredItems();

  // Set up auto-refresh every minute to update countdown timers
  const intervalId = setInterval(() => {
    if (activeSubcategory.value) {
      // Force re-render of countdown timers
      activeSubcategory.value = { ...activeSubcategory.value };
    }
  }, 60000);

  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>