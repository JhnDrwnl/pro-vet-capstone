<!-- components/common/SearchPanel.vue -->
<template>
    <Transition name="slide-fade">
      <div 
        v-if="isVisible"
        class="bg-white overflow-hidden z-30 transition-all duration-300 ease-in-out flex flex-col fixed"
        :class="[
          isMobileView 
            ? 'inset-0 pt-14 pb-20' 
            : 'left-20 top-4 h-[calc(100vh-2rem)] w-[400px] border border-gray-100 rounded-2xl shadow-sm'
        ]"
      >
        <!-- Search Header -->
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Search</h2>
            <button 
              v-if="isMobileView"
              @click="closeSearch" 
              class="text-gray-500 hover:text-gray-700"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>
          
          <!-- Search Input -->
          <div class="relative">
            <input 
              type="text"
              placeholder="Search"
              v-model="searchQuery"
              class="w-full bg-gray-100 rounded-lg py-2 px-4 pr-10 focus:outline-none"
              @input="handleSearchInput"
            />
            <div 
              v-if="isSearching"
              class="absolute right-10 top-1/2 -translate-y-1/2"
            >
              <div class="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
            <button 
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XIcon class="w-5 h-5" />
            </button>
          </div>
    
          <!-- Search Status -->
          <div class="mt-2 text-sm text-gray-500" v-if="searchStatus">
            {{ searchStatus }}
          </div>
        </div>
    
        <!-- Search Results -->
        <div class="px-6 overflow-y-auto flex-grow">
          <h3 class="text-sm font-semibold mb-3">Results</h3>
          <div v-if="searchResults.length > 0">
            <div 
              v-for="result in searchResults" 
              :key="result.id"
              class="mb-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <div class="font-medium">{{ result.title }}</div>
              <div class="text-sm text-gray-500">{{ result.description }}</div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm">
            {{ searchQuery ? 'No results found.' : 'Start typing to search...' }}
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { XIcon } from 'lucide-vue-next';
  
  const props = defineProps({
    isMobileView: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close']);
  
  const searchQuery = ref('');
  const searchResults = ref([]);
  const isSearching = ref(false);
  const searchStatus = ref('');
  let searchTimeout = null;
  
  const closeSearch = () => {
    emit('close');
  };
  
  const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = [];
    searchStatus.value = '';
    isSearching.value = false;
  };
  
  const handleSearchInput = () => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      searchStatus.value = 'Waiting for you to stop typing...';
    }
  
    // If search query is empty, clear results
    if (!searchQuery.value) {
      clearSearch();
      return;
    }
  
    isSearching.value = true;
  
    // Set new timeout (debounce)
    searchTimeout = setTimeout(async () => {
      try {
        searchStatus.value = 'Searching...';
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock search results
        searchResults.value = [
          { 
            id: 1, 
            title: `Result for "${searchQuery.value}"`, 
            description: 'This is a sample search result description.' 
          },
          // Add more mock results as needed
        ];
        searchStatus.value = '';
      } catch (error) {
        console.error('Search error:', error);
        searchStatus.value = 'Error performing search';
      } finally {
        isSearching.value = false;
      }
    }, 500);
  };
  
  onMounted(() => {
    // Add any necessary setup
  });
  
  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  });
  </script>
  
  <style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }
  
  /* Add slide-out animation */
  .v-leave-active {
    transition: all 0.3s ease-in-out;
  }
  
  .v-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
  
  /* Add slide-in animation */
  .v-enter-active {
    transition: all 0.3s ease-in-out;
  }
  
  .v-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }
  </style>