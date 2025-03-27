<!-- views/admin/adminsettings/Archive.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <h1 class="text-2xl font-semibold text-gray-900 flex items-center">
        <button v-if="selectedCategory" @click="selectedCategory = null" class="mr-2">
          <ChevronLeftIcon class="w-6 h-6 text-gray-700 hover:text-gray-900 transition" />
        </button>
        {{ selectedCategory ? selectedCategory.name : 'Archive' }}
      </h1>
      
      <!-- Bulk Actions (only show when items are selected) -->
      <div v-if="selectedCategory && selectedItems.length > 0" class="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
        <span class="text-sm text-gray-500">{{ selectedItems.length }} item(s) selected</span>
        <div class="flex items-center space-x-2">
          <button 
            @click="confirmBulkDelete" 
            class="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1"
            :disabled="isProcessing"
          >
            <Trash2Icon class="w-4 h-4" />
            <span>{{ isProcessing ? 'Processing...' : 'Delete' }}</span>
          </button>
          <button 
            @click="bulkRestore" 
            class="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
            :disabled="isProcessing"
          >
            <RefreshCwIcon class="w-4 h-4" />
            <span>{{ isProcessing ? 'Processing...' : 'Restore' }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Debug Info - Remove in production -->
    <div v-if="debug" class="mb-4 p-4 bg-gray-100 rounded-lg text-xs">
      <p>Archived Items: {{ archivedItems.length }}</p>
      <p>Services: {{ archivedItems.filter(item => item.itemType === 'service').length }}</p>
      <p>Categories: {{ archivedItems.filter(item => item.itemType === 'category').length }}</p>
      <p>Office Hours: {{ archivedItems.filter(item => item.itemType === 'officeHours').length }}</p>
      <p>Holidays: {{ archivedItems.filter(item => item.itemType === 'holiday').length }}</p>
      <p>Contacts: {{ archivedItems.filter(item => item.itemType === 'contact').length }}</p>
      <p>Users: {{ archivedItems.filter(item => item.itemType === 'user').length }}</p>
    </div>
    
    <!-- Content Section -->
    <div>
      <!-- Category Folders -->
      <div v-if="!selectedCategory" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
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
                  <p class="text-sm text-center text-gray-600">
                    {{ getCategoryItemCount(category) }} items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Subcategory Tabs and Content -->
      <div v-if="selectedCategory">
        <!-- Tabs for larger screens -->
        <div class="border-b border-gray-200 mb-6 hidden md:block">
          <nav class="flex flex-wrap space-x-4">
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
        
        <!-- Dropdown for mobile screens -->
        <div class="md:hidden mb-6">
          <div class="relative">
            <button 
              @click="showSubcategoryDropdown = !showSubcategoryDropdown"
              class="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              <span>{{ activeSubcategory ? activeSubcategory.name : 'Select category' }} 
                <span class="text-gray-500">({{ activeSubcategory ? activeSubcategory.items.length : 0 }})</span>
              </span>
              <ChevronDownIcon class="w-5 h-5 text-gray-500" :class="{ 'transform rotate-180': showSubcategoryDropdown }" />
            </button>
            
            <div 
              v-if="showSubcategoryDropdown" 
              class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60"
            >
              <button
                v-for="subcategory in selectedCategory.subcategories"
                :key="subcategory.name"
                @click="selectSubcategoryFromDropdown(subcategory)"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                :class="{ 'bg-[#EBF5FF] text-[#0066FF]': activeSubcategory === subcategory }"
              >
                {{ subcategory.name }} ({{ subcategory.items.length }})
              </button>
            </div>
          </div>
        </div>
      
        <!-- Table View for Selected Subcategory -->
        <div v-if="activeSubcategory" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
                <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Description</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-Delete</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ getItemName(item) }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getItemTypeClass(item)">
                    {{ getItemTypeLabel(item) }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(item.archivedAt) }}</td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <div class="text-sm" :class="getDaysLeftClass(item)">
                    {{ getDaysLeft(item) }} days left
                  </div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-2">
                    <button 
                      @click="restoreItem(item)" 
                      class="text-blue-600 hover:text-blue-800"
                      :disabled="isProcessing"
                      title="Restore item"
                    >
                      <RefreshCwIcon class="w-4 h-4" />
                    </button>
                    <button 
                      @click="confirmDelete(item)" 
                      class="text-red-600 hover:text-red-800"
                      :disabled="isProcessing"
                      title="Permanently delete"
                    >
                      <Trash2Icon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Confirmation Modal for Permanent Deletion -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
        <AlertCircleIcon class="h-6 w-6 text-yellow-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Confirm Permanent Deletion</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        Are you sure you want to permanently delete 
        <span class="font-semibold">{{ itemToDelete ? getItemName(itemToDelete) : selectedItems.length + ' items' }}</span>? 
        This action cannot be undone.
      </p>
      <div class="flex justify-center space-x-3">
        <button 
          @click="cancelDelete" 
          class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="confirmDeleteAction" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
        >
          <Trash2Icon class="w-4 h-4 mr-1" />
          Delete Permanently
        </button>
      </div>
    </div>
  </div>
  
  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
        <CheckCircleIcon class="h-6 w-6 text-green-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Success</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ statusMessage }}
      </p>
      <div class="flex justify-center">
        <button 
          @click="showSuccessModal = false" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
  
  <!-- Error Modal -->
  <div v-if="showErrorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
        <XCircleIcon class="h-6 w-6 text-red-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Error</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ statusMessage }}
      </p>
      <div class="flex justify-center">
        <button 
          @click="showErrorModal = false" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
  
  <!-- Loading Spinner for initial loading -->
  <LoadingSpinner v-if="loading" isOverlay text="Loading data..." />
  
  <!-- Loading Spinner for tab switching -->
  <LoadingSpinner v-if="tabLoading" isOverlay text="Loading data..." />
  
  <!-- Loading Spinner for operations -->
  <LoadingSpinner v-if="isProcessing" isOverlay text="Processing..." />
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useArchivesStore } from '@/stores/modules/archivesStore';
import { useOfficeStore } from '@/stores/modules/officeStore';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { 
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  MessageCircle as MessageCircleIcon,
  Database as DatabaseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronDown as ChevronDownIcon,
  Image as ImageIcon,
  Inbox as InboxIcon,
  Trash2 as Trash2Icon,
  RefreshCw as RefreshCwIcon,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-vue-next';

// Debug mode
const debug = ref(false);

// State
const loading = ref(true);
const tabLoading = ref(false);
const error = ref(null);
const archivedItems = ref([]);
const selectedCategory = ref(null);
const activeSubcategory = ref(null);
const selectedItems = ref([]);
const showDeleteConfirmation = ref(false);
const itemToDelete = ref(null);
const autoDeletedCount = ref(0);
const showSubcategoryDropdown = ref(false);
const autoDeleteEnabled = ref(true);
const autoDeleteDays = ref(30); // Default 30 days for auto-deletion

// Status message and modals
const statusMessage = ref('');
const showSuccessModal = ref(false);
const showErrorModal = ref(false);

// Replace individual restoring and deleting refs with a single processing state
const isProcessing = ref(false);

// Get stores
const archivesStore = useArchivesStore();
const officeStore = useOfficeStore();

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

// Get item name or description based on type
const getItemName = (item) => {
  if (!item) return 'Unknown';
  
  // For users, show the name
  if (item.itemType === 'user') {
    return `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'User';
  }
  
  // For office hours, show the day
  if (item.itemType === 'officeHours') {
    return item.day || 'Office Hours';
  }
  
  // For holidays, show the name
  if (item.itemType === 'holiday') {
    return item.name || 'Holiday';
  }
  
  // For contacts, show the label and type
  if (item.itemType === 'contact') {
    return `${item.label || ''} (${item.type || 'Contact'})`;
  }
  
  // Default for other types
  return item.name || item.description || 'Unnamed Item';
};

// Get item type label
const getItemTypeLabel = (item) => {
  if (!item || !item.itemType) return 'Unknown';
  
  switch (item.itemType) {
    case 'user': return 'User';
    case 'service': return 'Service';
    case 'category': return 'Category';
    case 'officeHours': return 'Office Hours';
    case 'holiday': return 'Holiday';
    case 'contact': return 'Contact';
    default: return item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1);
  }
};

// Get item type class for badge
const getItemTypeClass = (item) => {
  if (!item || !item.itemType) return 'bg-gray-100 text-gray-800';
  
  switch (item.itemType) {
    case 'user': return 'bg-indigo-100 text-indigo-800';
    case 'service': return 'bg-green-100 text-green-800';
    case 'category': return 'bg-blue-100 text-blue-800';
    case 'officeHours': return 'bg-purple-100 text-purple-800';
    case 'holiday': return 'bg-red-100 text-red-800';
    case 'contact': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Calculate days left before auto-deletion
const getDaysLeft = (item) => {
  if (!item.archivedAt) return autoDeleteDays.value;
  
  let archiveDate;
  if (typeof item.archivedAt === 'string') {
    archiveDate = new Date(item.archivedAt);
  } else if (item.archivedAt.toDate && typeof item.archivedAt.toDate === 'function') {
    archiveDate = item.archivedAt.toDate();
  } else {
    archiveDate = item.archivedAt;
  }
  
  const deleteDate = new Date(archiveDate);
  deleteDate.setDate(deleteDate.getDate() + autoDeleteDays.value);
  
  const today = new Date();
  const daysLeft = Math.ceil((deleteDate - today) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysLeft);
};

// Check if an item is expired (0 days left)
const isItemExpired = (item) => {
  return getDaysLeft(item) <= 0;
};

// Show status message
const showStatus = (message, type = 'success') => {
  statusMessage.value = message;
  
  if (type === 'success') {
    showSuccessModal.value = true;
    error.value = null; // Clear any previous errors
  } else {
    showErrorModal.value = true;
    error.value = message; // Also set the error for inline display
  }
};

// Check for and delete expired items
const checkAndDeleteExpiredItems = async () => {
  if (!autoDeleteEnabled.value) {
    console.log('Auto-delete is disabled');
    return;
  }
  
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
      console.log(`Auto-deleting expired item: ${getItemName(item)} (ID: ${item.id})`);
      
      // Use the standard delete function for all item types
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
    showStatus(`${autoDeletedCount.value} expired items were automatically deleted`, 'success');
    
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

// Get count of items for a category
const getCategoryItemCount = (category) => {
  if (category.name === 'Users') {
    return archivedItems.value.filter(item => item.itemType === 'user').length;
  }
  
  if (category.name === 'Office') {
    const officeHoursCount = archivedItems.value.filter(item => item.itemType === 'officeHours').length;
    const holidaysCount = archivedItems.value.filter(item => item.itemType === 'holiday').length;
    const contactsCount = archivedItems.value.filter(item => item.itemType === 'contact').length;
    return officeHoursCount + holidaysCount + contactsCount;
  }
  
  if (category.name === 'Services') {
    return archivedItems.value.filter(item => 
      item.itemType === 'service' || item.itemType === 'category'
    ).length;
  }
  
  // For other categories, return 0 for now
  return 0;
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
    showStatus('Failed to load archived items. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

// Define categories (keeping the original structure but adding Office)
const categories = ref([
  { 
    id: 1, 
    name: 'Users', 
    icon: UsersIcon, 
    bgColor: 'bg-indigo-100', 
    hoverBgColor: 'group-hover:bg-indigo-200', 
    tabColor: 'bg-indigo-200', 
    hoverTabColor: 'group-hover:bg-indigo-300', 
    iconColor: 'text-indigo-600', 
    textColor: 'text-indigo-800',
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
    name: 'Office', 
    icon: ClockIcon, 
    bgColor: 'bg-purple-100', 
    hoverBgColor: 'group-hover:bg-purple-200', 
    tabColor: 'bg-purple-200', 
    hoverTabColor: 'group-hover:bg-purple-300', 
    iconColor: 'text-purple-600', 
    textColor: 'text-purple-800',
    subcategories: [
      {
        name: 'All Items',
        items: []
      },
      {
        name: 'Office Hours',
        items: []
      },
      {
        name: 'Holidays',
        items: []
      },
      {
        name: 'Contacts',
        items: []
      }
    ]
  },
  { 
    id: 5, 
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
    id: 6, 
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
    id: 7, 
    name: 'Chatbot Scripts', 
    icon: MessageCircleIcon, 
    bgColor: 'bg-indigo-100', 
    hoverBgColor: 'group-hover:bg-indigo-200', 
    tabColor: 'bg-indigo-200', 
    hoverTabColor: 'group-hover:bg-indigo-300', 
    iconColor: 'text-indigo-600', 
    textColor: 'text-indigo-800',
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
  
  // Find the Users category
  const usersCategory = categories.value.find(cat => cat.name === 'Users');
  if (usersCategory) {
    // Filter archived items for users
    const userItems = archivedItems.value.filter(item => item.itemType === 'user');
    
    // Update the "All Users" subcategory
    const allUsersSubcategory = usersCategory.subcategories.find(sub => sub.name === 'All Users');
    if (allUsersSubcategory) {
      allUsersSubcategory.items = userItems;
    }
  }
  
  // Find the Services category
  const servicesCategory = categories.value.find(cat => cat.name === 'Services');
  if (servicesCategory) {
    // Filter archived items for services and categories
    const serviceItems = archivedItems.value.filter(item => item.itemType === 'service');
    const categoryItems = archivedItems.value.filter(item => item.itemType === 'category');
    const allServiceItems = [...serviceItems, ...categoryItems];
    
    // Update the "All Items" subcategory
    const allItemsSubcategory = servicesCategory.subcategories.find(sub => sub.name === 'All Items');
    if (allItemsSubcategory) {
      allItemsSubcategory.items = allServiceItems;
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
  
  // Find the Office category
  const officeCategory = categories.value.find(cat => cat.name === 'Office');
  if (officeCategory) {
    // Filter archived items for office-related items
    const officeHoursItems = archivedItems.value.filter(item => item.itemType === 'officeHours');
    const holidayItems = archivedItems.value.filter(item => item.itemType === 'holiday');
    const contactItems = archivedItems.value.filter(item => item.itemType === 'contact');
    const allOfficeItems = [...officeHoursItems, ...holidayItems, ...contactItems];
    
    // Update the "All Items" subcategory
    const allItemsSubcategory = officeCategory.subcategories.find(sub => sub.name === 'All Items');
    if (allItemsSubcategory) {
      allItemsSubcategory.items = allOfficeItems;
    }
    
    // Update the "Office Hours" subcategory
    const officeHoursSubcategory = officeCategory.subcategories.find(sub => sub.name === 'Office Hours');
    if (officeHoursSubcategory) {
      officeHoursSubcategory.items = officeHoursItems;
    }
    
    // Update the "Holidays" subcategory
    const holidaysSubcategory = officeCategory.subcategories.find(sub => sub.name === 'Holidays');
    if (holidaysSubcategory) {
      holidaysSubcategory.items = holidayItems;
    }
    
    // Update the "Contacts" subcategory
    const contactsSubcategory = officeCategory.subcategories.find(sub => sub.name === 'Contacts');
    if (contactsSubcategory) {
      contactsSubcategory.items = contactItems;
    }
  }
};

// Select category with loading state
const selectCategory = async (category) => {
  tabLoading.value = true;
  selectedItems.value = []; // Clear selected items when changing category
  
  try {
    selectedCategory.value = category;
    activeSubcategory.value = category.subcategories[0];
    
    // We'll use the data that was already fetched by fetchArchivedItems()
    // No need to fetch by type since we already have all the data
    
    // Just update the categories with the data we already have
    updateCategoriesWithRealData();
  } catch (err) {
    console.error('Error loading category data:', err);
    showStatus('Failed to load category data. Please try again.', 'error');
  } finally {
    tabLoading.value = false;
  }
};

// Select subcategory with loading state
const selectSubcategory = async (subcategory) => {
  tabLoading.value = true;
  selectedItems.value = []; // Clear selected items when changing subcategory
  showSubcategoryDropdown.value = false; // Close dropdown when selecting
  
  try {
    activeSubcategory.value = subcategory;
    
    // We'll use the data that was already fetched by fetchArchivedItems()
    // No need to fetch by type since we already have all the data
  } catch (err) {
    console.error('Error loading subcategory data:', err);
    showStatus('Failed to load subcategory data. Please try again.', 'error');
  } finally {
    tabLoading.value = false;
  }
};

// Select subcategory from dropdown (mobile)
const selectSubcategoryFromDropdown = (subcategory) => {
  selectSubcategory(subcategory);
  showSubcategoryDropdown.value = false;
};

// Restore item
const restoreItem = async (item) => {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
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
    
    let success = false;
    
    // Handle different item types
    switch (item.itemType) {
      case 'user':
        // Use the new method to restore user and re-enable in Firebase Auth
        success = await archivesStore.restoreArchivedUser(item.id);
        break;
      case 'officeHours':
        // Restore office hours using officeStore
        success = await restoreOfficeHours(item);
        break;
      case 'holiday':
        // Restore holiday using officeStore
        success = await restoreHoliday(item);
        break;
      case 'contact':
        // Restore contact using officeStore
        success = await restoreContact(item);
        break;
      default:
        // Use default restore method for other types
        success = await archivesStore.restoreArchivedItem(item.id);
        break;
    }
    
    if (!success) {
      throw new Error('Restore operation failed');
    }
    
    // Show success message
    showStatus(`Successfully restored ${getItemName(item)}`, 'success');
    
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
    showStatus(`Failed to restore ${getItemName(item)}: ${err.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
};

// Restore office hours
const restoreOfficeHours = async (item) => {
  try {
    // Create new office hours with the original data
    const result = await officeStore.createOfficeHours({
      day: item.day,
      isOpen: item.isOpen,
      openTime: item.openTime,
      closeTime: item.closeTime,
      lunchStart: item.lunchStart,
      lunchEnd: item.lunchEnd,
      notes: item.notes || ''
    });
    
    if (result) {
      // Delete from archives
      await archivesStore.permanentlyDeleteArchivedItem(item.id);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error restoring office hours:', err);
    throw err;
  }
};

// Restore holiday
const restoreHoliday = async (item) => {
  try {
    // Create new holiday with the original data
    const result = await officeStore.createHoliday({
      name: item.name,
      date: item.date,
      isRecurringYearly: item.isRecurringYearly || false,
      type: item.type || 'holiday',
      openTime: item.openTime,
      closeTime: item.closeTime,
      description: item.description || ''
    });
    
    if (result) {
      // Delete from archives
      await archivesStore.permanentlyDeleteArchivedItem(item.id);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error restoring holiday:', err);
    throw err;
  }
};

// Restore contact
const restoreContact = async (item) => {
  try {
    // Create new contact with the original data
    const result = await officeStore.createContact({
      type: item.type,
      value: item.value,
      label: item.label,
      isActive: item.isActive,
      notes: item.notes || ''
    });
    
    if (result) {
      // Delete from archives
      await archivesStore.permanentlyDeleteArchivedItem(item.id);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error restoring contact:', err);
    throw err;
  }
};

// Bulk restore selected items
const bulkRestore = async () => {
  if (selectedItems.value.length === 0 || isProcessing.value) return;
  
  isProcessing.value = true;
  error.value = null;
  
  try {
    let successCount = 0;
    let failCount = 0;
    
    // Create a copy of the selected items to avoid modification during iteration
    const itemsToRestore = [...selectedItems.value];
    
    // Process items sequentially to avoid race conditions
    for (const itemId of itemsToRestore) {
      const item = archivedItems.value.find(i => i.id === itemId);
      if (item) {
        try {
          // Get the full item data if needed
          let fullItem = item;
          if (!item.itemType || !item.originalId) {
            fullItem = await archivesStore.getArchivedItemById(item.id);
            if (!fullItem) {
              throw new Error('Could not retrieve full item data');
            }
          }
          
          let success = false;
          
          // Handle different item types
          switch (fullItem.itemType) {
            case 'user':
              // Use the new method to restore user and re-enable in Firebase Auth
              success = await archivesStore.restoreArchivedUser(fullItem.id);
              break;
            case 'officeHours':
              success = await restoreOfficeHours(fullItem);
              break;
            case 'holiday':
              success = await restoreHoliday(fullItem);
              break;
            case 'contact':
              success = await restoreContact(fullItem);
              break;
            default:
              success = await archivesStore.restoreArchivedItem(fullItem.id);
              break;
          }
          
          if (success) {
            successCount++;
            // Remove from selected items
            const index = selectedItems.value.indexOf(itemId);
            if (index !== -1) {
              selectedItems.value.splice(index, 1);
            }
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
          console.error(`Error restoring item ${itemId}:`, err);
        }
      }
    }
    
    // Show status message
    if (successCount > 0 && failCount === 0) {
      showStatus(`Successfully restored ${successCount} items`, 'success');
    } else if (successCount > 0 && failCount > 0) {
      showStatus(`Restored ${successCount} items, but failed to restore ${failCount} items`, 'error');
    } else {
      showStatus(`Failed to restore ${failCount} items`, 'error');
    }
    
    // Refresh the archived items
    await fetchArchivedItems();
    
  } catch (err) {
    console.error('Error bulk restoring items:', err);
    showStatus(`Failed to restore selected items: ${err.message}`, 'error');
  } finally {
    isProcessing.value = false;
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
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  error.value = null;
  
  try {
    console.log('Permanently deleting item:', item);
    
    // Use the standard delete function for all item types
    const success = await archivesStore.permanentlyDeleteArchivedItem(item.id);
    
    if (!success) {
      throw new Error('Delete operation failed');
    }
    
    // Show success message
    showStatus(`Successfully deleted ${getItemName(item)}`, 'success');
    
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
    showStatus(`Failed to delete ${getItemName(item)}: ${err.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
};

// Bulk delete selected items
const bulkDelete = async () => {
  if (selectedItems.value.length === 0 || isProcessing.value) return;
  
  isProcessing.value = true;
  error.value = null;
  
  try {
    let successCount = 0;
    let failCount = 0;
    
    // Create a copy of the selected items to avoid modification during iteration
    const itemsToDelete = [...selectedItems.value];
    
    // Process items sequentially to avoid race conditions
    for (const itemId of itemsToDelete) {
      try {
        const success = await archivesStore.permanentlyDeleteArchivedItem(itemId);
        
        if (success) {
          successCount++;
          // Remove from selected items
          const index = selectedItems.value.indexOf(itemId);
          if (index !== -1) {
            selectedItems.value.splice(index, 1);
          }
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
        console.error(`Error deleting item ${itemId}:`, err);
      }
    }
    
    // Show status message
    if (successCount > 0 && failCount === 0) {
      showStatus(`Successfully deleted ${successCount} items`, 'success');
    } else if (successCount > 0 && failCount > 0) {
      showStatus(`Deleted ${successCount} items, but failed to delete ${failCount} items`, 'error');
    } else {
      showStatus(`Failed to delete ${failCount} items`, 'error');
    }
    
    // Refresh the archived items
    await fetchArchivedItems();
  } catch (err) {
    console.error('Error bulk deleting items:', err);
    showStatus(`Failed to delete selected items: ${err.message}`, 'error');
  } finally {
    isProcessing.value = false;
  }
};

// Set up auto-refresh timer to update countdown timers
let countdownTimer = null;

// Watch for changes in auto-delete settings
watch([autoDeleteEnabled, autoDeleteDays], () => {
  // When settings change, check for expired items
  checkAndDeleteExpiredItems();
});

// Fetch data on mount
onMounted(async () => {
  console.log('Component mounted, fetching archived items...');
  await fetchArchivedItems();
  
  // After fetching items, check for and delete expired items
  await checkAndDeleteExpiredItems();
  
  // Set up auto-refresh every minute to update countdown timers
  countdownTimer = setInterval(() => {
    if (activeSubcategory.value) {
      // Force re-render of countdown timers
      activeSubcategory.value = { ...activeSubcategory.value };
    }
    
    // Check for auto-deletion every hour
    if (Math.random() < 0.016) { // ~1/60 chance each minute = roughly hourly
      checkAndDeleteExpiredItems();
    }
  }, 60000);
});

// Clean up interval on component unmount
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>