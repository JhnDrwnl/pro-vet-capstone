<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Show loading spinner during initial data load -->
    <div v-if="initialLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
        <p class="text-gray-700">Loading data...</p>
      </div>
    </div>
  
    <!-- Only show content when data is loaded -->
    <div v-if="!initialLoading">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Resources Management</h1>
        <p class="text-gray-500 mt-1">Manage categories and educational resources in your system.</p>
      </div>
      <!-- Navigation Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-4 sm:space-x-8 mb-4 overflow-x-auto">
          <button
            @click="switchTab('categories')"
            :class="[
               'whitespace-nowrap py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full transition-colors',
              activeTab === 'categories'
               ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-800 hover:text-gray-700'
            ]"
          >
            <div class="flex items-center space-x-1 sm:space-x-2">
              <ListIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Categories</span>
            </div>
          </button>
          <button
            @click="switchTab('resources')"
            :class="[
               'whitespace-nowrap py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full transition-colors',
              activeTab === 'resources'
                ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-800 hover:text-gray-700'
            ]"
          >
            <div class="flex items-center space-x-1 sm:space-x-2">
              <FileVideoIcon class="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Resources</span>
            </div>
          </button>
        </nav>
        <div class="border-b border-gray-200"></div>
      </div>
  
      <!-- Content Section -->
      <div>
        <!-- Search and Actions -->
        <div v-if="!showForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div class="flex gap-2">
            <div class="relative">
              <input 
                v-model="search" 
                class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                :placeholder="activeTab === 'categories' ? 'Search categories...' : 'Search resources...'"
              />
              <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <!-- Category Filter Dropdown (only for resources tab) -->
            <div v-if="activeTab === 'resources'" class="relative">
              <button 
                class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                @click="toggleCategoryFilter"
              >
                <FilterIcon class="w-5 h-5 text-gray-500" />
              </button>
              <!-- Filter Dropdown -->
              <div v-if="showCategoryFilter" class="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 filter-dropdown">
                <div class="px-4 py-2 text-sm font-medium text-gray-700">Filter by Category:</div>
                <button 
                  @click="toggleCategoryFilterOption('All Categories')"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  :class="{ 'text-blue-600': activeCategoryFilters.length === 0 }"
                >
                  All Categories
                </button>
                <button 
                  v-for="category in categories" 
                  :key="category.id"
                  @click="toggleCategoryFilterOption(category.id)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  :class="{ 'text-blue-600': activeCategoryFilters.includes(category.id) }"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div class="flex gap-2">
              <button 
                @click="exportToCSV"
                class="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-xs sm:text-sm w-full sm:w-auto justify-center"
                :disabled="isLoading"
              >
                <Download class="w-3 h-3 sm:w-4 sm:h-4" />
                Export CSV
              </button>
              <button 
                @click="addNew" 
                class="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto justify-center"
              >
                <PlusCircle class="w-3 h-3 sm:w-4 sm:h-4" />
                {{ activeTab === 'categories' ? 'Add Category' : 'Add Resource' }}
              </button>
            </div>
          </div>
        </div>
  
        <!-- Active Filters Display (for resources tab) -->
        <div v-if="activeTab === 'resources' && activeCategoryFilters.length > 0" class="mb-4 flex flex-wrap gap-2">
          <div class="text-sm text-gray-500 py-1">Active filters:</div>
          <div 
            v-for="categoryId in activeCategoryFilters" 
            :key="categoryId"
            class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
          >
            <span>{{ getCategoryName(categoryId) }}</span>
            <button @click="toggleCategoryFilterOption(categoryId)" class="text-blue-500 hover:text-blue-700">
              <XIcon class="w-3 h-3" />
            </button>
          </div>
          <button 
            @click="clearCategoryFilters" 
            class="text-xs text-gray-500 hover:text-gray-700 py-1 px-2"
          >
            Clear all
          </button>
        </div>
  
        <!-- Table or Form -->
        <div v-if="!showForm">
          <!-- Table with horizontal scroll for mobile -->
          <div class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-blue-50">
                <tr class="border-b border-gray-200">
                  <th v-for="header in activeTab === 'categories' ? categoryHeaders : resourceHeaders" 
                      :key="header.key" 
                      @click="sortBy(header.key)"
                      class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
                  >
                    <div class="flex items-center">
                      {{ header.label }}
                      <div class="flex flex-col ml-1">
                        <span class="text-[10px] leading-none" :class="{ 'text-blue-600': sortKey === header.key && sortOrder === 'asc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'asc') }">▲</span>
                        <span class="text-[10px] leading-none" :class="{ 'text-blue-600': sortKey === header.key && sortOrder === 'desc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'desc') }">▼</span>
                      </div>
                    </div>
                  </th>
                  <!-- Actions column without sorting -->
                  <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-if="activeTab === 'categories'">
                  <tr v-for="category in paginatedItems" :key="category.id" class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td class="py-4 px-6">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 mr-3">
                          <div v-if="category.coverPhoto" class="h-10 w-10 rounded-md overflow-hidden">
                            <img v-if="isImageFile(category.coverPhoto)" :src="category.coverPhoto" class="h-10 w-10 object-cover" alt="Category cover" />
                            <div v-else-if="isVideoFile(category.coverPhoto)" class="relative h-10 w-10 cursor-pointer group" @click="openFullscreenVideo(category.coverPhoto, category.name)">
                              <video :src="category.coverPhoto" class="h-10 w-10 object-cover" muted></video>
                              <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayIcon class="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div v-else class="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
                              <FileVideoIcon class="w-5 h-5" />
                            </div>
                          </div>
                          <div v-else class="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
                            <ImageIcon class="w-5 h-5" />
                          </div>
                        </div>
                        <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="text-sm text-gray-900">{{ category.description }}</div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="text-sm text-gray-900">{{ getResourceCountForCategory(category.id) }}</div>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                      {{ formatTimestamp(category.createdAt) }}
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                      {{ formatTimestamp(category.updatedAt) }}
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex gap-2">
                        <button 
                          @click="editItem(category)" 
                          class="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <LucideEdit class="w-5 h-5" />
                        </button>
                        <button 
                          @click="showDeleteConfirm(category.id, 'category')" 
                          class="p-1 text-red-500 hover:text-red-600"
                        >
                          <Trash2 class="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Empty state for categories -->
                  <tr v-if="paginatedItems.length === 0">
                    <td colspan="6" class="py-8 text-center text-gray-500">
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                          <ListIcon class="w-8 h-8 text-blue-300" />
                        </div>
                        <p class="text-gray-500 font-medium">No categories available.</p>
                        <p class="text-gray-400 text-sm mt-1">Add your first category to get started.</p>
                      </div>
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="resource in paginatedItems" :key="resource.id" class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td class="py-4 px-6">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 mr-3">
                          <div v-if="resource.coverPhoto" class="h-10 w-10 rounded-md overflow-hidden">
                            <img v-if="isImageFile(resource.coverPhoto)" :src="resource.coverPhoto" class="h-10 w-10 object-cover" alt="Resource cover" />
                            <div v-else-if="isVideoFile(resource.coverPhoto)" class="relative h-10 w-10 cursor-pointer group" @click="openFullscreenVideo(resource.coverPhoto, resource.name)">
                              <video :src="resource.coverPhoto" class="h-10 w-10 object-cover" muted></video>
                              <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayIcon class="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div v-else class="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
                              <FileVideoIcon class="w-5 h-5" />
                            </div>
                          </div>
                          <div v-else class="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-500">
                            <ImageIcon class="w-5 h-5" />
                          </div>
                        </div>
                        <div class="text-sm font-medium text-gray-900">{{ resource.name }}</div>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="text-sm text-gray-900">{{ getCategoryName(resource.categoryId) }}</div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="text-sm text-gray-900">{{ resource.type }}</div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="text-sm text-gray-900">{{ resource.status }}</div>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                      {{ formatTimestamp(resource.createdAt) }}
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                      {{ formatTimestamp(resource.updatedAt) }}
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex gap-2">
                        <button 
                          @click="editItem(resource)" 
                          class="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <LucideEdit class="w-5 h-5" />
                        </button>
                        <button 
                          @click="showDeleteConfirm(resource.id, 'resource')" 
                          class="p-1 text-red-500 hover:text-red-600"
                        >
                          <Trash2 class="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <!-- Empty state for resources -->
                  <tr v-if="paginatedItems.length === 0">
                    <td colspan="7" class="py-8 text-center text-gray-500">
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                          <FileVideoIcon class="w-8 h-8 text-blue-300" />
                        </div>
                        <p class="text-gray-500 font-medium">No resources available.</p>
                        <p class="text-gray-400 text-sm mt-1">Add your first resource to get started.</p>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
  
          <!-- Pagination - Responsive -->
          <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
            </div>
            <div class="flex gap-2">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
                :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Previous
              </button>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
                :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Next
              </button>
            </div>
          </div>
        </div>
  
        <!-- Inline Form - Responsive -->
        <div v-else class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-semibold mb-4">{{ formTitle }}</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Category Form -->
            <template v-if="activeTab === 'categories'">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input type="text" id="name" v-model="categoryForm.name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" v-model="categoryForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Media (Image or Video)</label>
                <div class="mt-1 flex items-center">
                  <div v-if="categoryForm.coverPhoto || previewImage || previewVideo" class="relative h-32 w-32 rounded-md overflow-hidden bg-gray-100 mr-4">
                    <img v-if="previewImage || (categoryForm.coverPhoto && isImageFile(categoryForm.coverPhoto))" 
                         :src="previewImage || categoryForm.coverPhoto" 
                         class="h-full w-full object-cover" 
                         alt="Media preview" />
                    <div v-else-if="previewVideo || (categoryForm.coverPhoto && isVideoFile(categoryForm.coverPhoto))" class="relative h-full w-full">
                      <video :src="previewVideo || categoryForm.coverPhoto" 
                             class="h-full w-full object-cover" 
                             controls 
                             muted></video>
                      <button 
                        v-if="categoryForm.coverPhoto && isVideoFile(categoryForm.coverPhoto)"
                        @click="openFullscreenVideo(categoryForm.coverPhoto, 'Preview Video')"
                        type="button"
                        class="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                      >
                        <MaximizeIcon class="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      @click="removeCoverPhoto" 
                      type="button" 
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <div v-else class="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 mr-4">
                    <div class="text-center">
                      <ImageIcon class="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <FileVideoIcon class="w-8 h-8 text-gray-400 mx-auto" />
                    </div>
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref="fileInput" 
                      @change="handleFileChange" 
                      accept="image/*,video/*" 
                      class="hidden" 
                    />
                    <button 
                      type="button" 
                      @click="triggerFileInput" 
                      class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <UploadIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Upload Media
                    </button>
                    <p class="mt-1 text-xs text-gray-500">Images: PNG, JPG, GIF up to 5MB</p>
                    <p class="text-xs text-gray-500">Videos: MP4, MOV, AVI up to 50MB</p>
                  </div>
                </div>
              </div>
            </template>
  
            <!-- Resource Form -->
            <template v-else>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                  <input type="text" id="name" v-model="resourceForm.name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label for="categoryId" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select id="categoryId" v-model="resourceForm.categoryId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select id="type" v-model="resourceForm.type" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="Document">Document</option>
                    <option value="Video">Video</option>
                    <option value="Audio">Audio</option>
                    <option value="Image">Image</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select id="status" v-model="resourceForm.status" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea id="description" v-model="resourceForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cover Media (Image or Video)</label>
                  <div class="mt-1 flex items-center">
                    <div v-if="resourceForm.coverPhoto || resourcePreviewImage || resourcePreviewVideo" class="relative h-32 w-32 rounded-md overflow-hidden bg-gray-100 mr-4">
                      <img v-if="resourcePreviewImage || (resourceForm.coverPhoto && isImageFile(resourceForm.coverPhoto))" 
                           :src="resourcePreviewImage || resourceForm.coverPhoto" 
                           class="h-full w-full object-cover" 
                           alt="Cover preview" />
                      <div v-else-if="resourcePreviewVideo || (resourceForm.coverPhoto && isVideoFile(resourceForm.coverPhoto))" class="relative h-full w-full">
                        <video :src="resourcePreviewVideo || resourceForm.coverPhoto" 
                               class="h-full w-full object-cover" 
                               controls 
                               muted></video>
                        <button 
                          v-if="resourceForm.coverPhoto && isVideoFile(resourceForm.coverPhoto)"
                          @click="openFullscreenVideo(resourceForm.coverPhoto, 'Preview Video')"
                          type="button"
                          class="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                        >
                          <MaximizeIcon class="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        @click="removeResourceCoverPhoto" 
                        type="button" 
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XIcon class="w-4 h-4" />
                      </button>
                    </div>
                    <div v-else class="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 mr-4">
                      <div class="text-center">
                        <ImageIcon class="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <FileVideoIcon class="w-8 h-8 text-gray-400 mx-auto" />
                      </div>
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref="resourceFileInput" 
                        @change="handleResourceFileChange" 
                        accept="image/*,video/*" 
                        class="hidden" 
                      />
                      <button 
                        type="button" 
                        @click="triggerResourceFileInput" 
                        class="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <UploadIcon class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Upload Media
                      </button>
                      <p class="mt-1 text-xs text-gray-500">Images: PNG, JPG, GIF up to 5MB</p>
                      <p class="text-xs text-gray-500">Videos: MP4, MOV, AVI up to 50MB</p>
                    </div>
                  </div>
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div v-for="(tag, index) in resourceForm.tags" :key="index" class="flex mt-2">
                    <input type="text" v-model="resourceForm.tags[index]" class="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <button @click="removeTag(index)" type="button" class="ml-2 inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200">
                      Remove
                    </button>
                  </div>
                  <button @click="addTag" type="button" class="mt-2 inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                    Add Tag
                  </button>
                </div>
              </div>
            </template>
  
            <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button type="button" @click="closeForm" class="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1 text-xs sm:text-sm">
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-3 py-1.5 sm:px-4 sm:py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 order-1 sm:order-2 text-xs sm:text-sm"
                :disabled="isLoading"
              >
                {{ editingItem ? 'Save Changes' : 'Add' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Fullscreen Video Modal -->
  <div v-if="showFullscreenVideo" class="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
    <!-- Video Container -->
    <div class="relative w-full h-full flex items-center justify-center">
      <!-- Video Element -->
      <video 
        ref="fullscreenVideoElement"
        :src="fullscreenVideoUrl" 
        class="max-w-full max-h-full object-contain"
        controls
        autoplay
        @loadstart="onVideoLoadStart"
        @loadeddata="onVideoLoaded"
        @error="onVideoError"
      ></video>
      
      <!-- Loading Spinner -->
      <div v-if="videoLoading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-black bg-opacity-75 p-4 rounded-lg flex flex-col items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <p class="text-white text-sm">Loading video...</p>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="videoError" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
        <div class="bg-red-600 p-4 rounded-lg text-center max-w-md">
          <XCircleIcon class="w-8 h-8 text-white mx-auto mb-2" />
          <p class="text-white font-medium mb-2">Error Loading Video</p>
          <p class="text-white text-sm mb-4">{{ videoError }}</p>
          <button 
            @click="closeFullscreenVideo" 
            class="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
      
      <!-- Video Title -->
      <div class="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-md">
        <h3 class="font-medium">{{ fullscreenVideoTitle }}</h3>
      </div>
      
      <!-- Close Button -->
      <button 
        @click="closeFullscreenVideo" 
        class="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
      >
        <XIcon class="w-6 h-6" />
      </button>
      
      <!-- Fullscreen Toggle Button -->
      <button 
        @click="toggleVideoFullscreen" 
        class="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
      >
        <MaximizeIcon v-if="!isVideoFullscreen" class="w-5 h-5" />
        <MinimizeIcon v-else class="w-5 h-5" />
      </button>
      
      <!-- Video Controls Info -->
      <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">
        Press ESC to close
      </div>
    </div>
  </div>
  
  <!-- Loading Spinner for operations -->
  <div v-if="isLoading && !initialLoading && !showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
      <p class="text-gray-700">Processing...</p>
    </div>
  </div>
  
  <!-- Custom Confirmation Dialog - Responsive -->
  <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-[#FFEEEE] mx-auto mb-4">
        <AlertTriangleIcon class="h-6 w-6 text-red-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Confirm Action</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        Are you sure you want to delete this item? It will be moved to archives.
      </p>
      <div class="flex justify-center gap-3">
        <button 
          @click="cancelDelete" 
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-full shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="confirmDelete" 
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          :disabled="isLoading"
        >
          Confirm
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
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700"
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
          class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
  
  <!-- Loading Spinner Overlay - Show for all operations -->
  <div v-if="isLoading || initialLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
      <p class="text-gray-700">{{ initialLoading ? 'Loading data...' : 'Processing...' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { 
  ListIcon, 
  Search, 
  FilterIcon, 
  Download, 
  PlusCircle, 
  ImageIcon, 
  LucideEdit, 
  Trash2, 
  XIcon, 
  UploadIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  FileVideoIcon,
  PackageIcon,
  PlayIcon,
  MaximizeIcon,
  MinimizeIcon
} from 'lucide-vue-next';
import { useResourceCategoryStore } from '@/stores/modules/ResourceCategoryStore';
import { storeToRefs } from 'pinia';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@shared/firebase';

// Initialize the store
const resourceCategoryStore = useResourceCategoryStore();

// Use storeToRefs to maintain reactivity when destructuring store state
const {
  resourceCategories, 
  resources, 
  loading: storeLoading, 
  error: storeError 
} = storeToRefs(resourceCategoryStore);

// UI state
const activeTab = ref('categories');
const showForm = ref(false);
const initialLoading = ref(true);
const isLoading = computed(() => storeLoading.value);
const search = ref('');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showCategoryFilter = ref(false);
const activeCategoryFilters = ref([]);
const showConfirmDialog = ref(false);
const itemToDelete = ref(null);
const itemTypeToDelete = ref(null);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const statusMessage = ref('');
const editingItem = ref(null);
const selectedFile = ref(null);
const selectedResourceFile = ref(null);

// Fullscreen video state
const showFullscreenVideo = ref(false);
const fullscreenVideoUrl = ref('');
const fullscreenVideoTitle = ref('');
const videoLoading = ref(false);
const videoError = ref('');
const isVideoFullscreen = ref(false);
const fullscreenVideoElement = ref(null);

// File input refs
const fileInput = ref(null);
const resourceFileInput = ref(null);

// Form data
const categoryForm = ref({
  name: '',
  description: '',
  coverPhoto: null,
  file: null
});

const resourceForm = ref({
  name: '',
  categoryId: '',
  type: 'Document',
  status: 'Active',
  description: '',
  coverPhoto: null,
  tags: [],
  file: null
});

// File upload preview - Enhanced for video support
const previewImage = ref(null);
const previewVideo = ref(null);
const resourcePreviewImage = ref(null);
const resourcePreviewVideo = ref(null);

// Table headers
const categoryHeaders = [
  { key: 'name', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'resourceCount', label: 'Resources' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' }
];

const resourceHeaders = [
  { key: 'name', label: 'Resource' },
  { key: 'categoryId', label: 'Category' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' }
];

// Computed properties
const formTitle = computed(() => {
  if (editingItem.value) {
    return activeTab.value === 'categories' ? 'Edit Category' : 'Edit Resource';
  }
  return activeTab.value === 'categories' ? 'Add Category' : 'Add Resource';
});

// Fix: Create a local categories ref that maps to resourceCategories from the store
const categories = computed(() => {
  return resourceCategories.value || [];
});

const filteredItems = computed(() => {
  let items = activeTab.value === 'categories' ? categories.value : resources.value || [];
  
  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    items = items.filter(item => 
      item.name.toLowerCase().includes(searchLower) || 
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply category filter for resources
  if (activeTab.value === 'resources' && activeCategoryFilters.value.length > 0) {
    items = items.filter(item => activeCategoryFilters.value.includes(item.categoryId));
  }
  
  // Apply sorting
  items = [...items].sort((a, b) => {
    let valueA, valueB;
    
    if (sortKey.value === 'resourceCount' && activeTab.value === 'categories') {
      valueA = getResourceCountForCategory(a.id);
      valueB = getResourceCountForCategory(b.id);
    } else if (sortKey.value === 'categoryId' && activeTab.value === 'resources') {
      // Fix: Safely get category name with null checks
      const categoryNameA = getCategoryName(a.categoryId) || '';
      const categoryNameB = getCategoryName(b.categoryId) || '';
      valueA = categoryNameA.toLowerCase();
      valueB = categoryNameB.toLowerCase();
    } else {
      valueA = a[sortKey.value];
      valueB = b[sortKey.value];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
    }
    
    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  return items;
});

const totalItems = computed(() => filteredItems.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value) || 1);

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedItems = computed(() => {
  return filteredItems.value.slice(startIndex.value, endIndex.value);
});

// Helper functions for file type detection
function isImageFile(url) {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
}

function isVideoFile(url) {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(ext));
}

function validateFileSize(file) {
  const maxImageSize = 5 * 1024 * 1024; // 5MB for images
  const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos
  
  if (file.type.startsWith('image/')) {
    return file.size <= maxImageSize;
  } else if (file.type.startsWith('video/')) {
    return file.size <= maxVideoSize;
  }
  
  return false;
}

// Fullscreen video functions
function openFullscreenVideo(videoUrl, title) {
  if (!videoUrl || !isVideoFile(videoUrl)) {
    statusMessage.value = 'Invalid video file';
    showErrorModal.value = true;
    return;
  }
  
  fullscreenVideoUrl.value = videoUrl;
  fullscreenVideoTitle.value = title || 'Video';
  showFullscreenVideo.value = true;
  videoLoading.value = true;
  videoError.value = '';
  isVideoFullscreen.value = false;
  
  // Prevent body scroll when fullscreen video is open
  document.body.style.overflow = 'hidden';
}

function closeFullscreenVideo() {
  showFullscreenVideo.value = false;
  fullscreenVideoUrl.value = '';
  fullscreenVideoTitle.value = '';
  videoLoading.value = false;
  videoError.value = '';
  isVideoFullscreen.value = false;
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Pause video if it's playing
  if (fullscreenVideoElement.value) {
    fullscreenVideoElement.value.pause();
  }
}

function toggleVideoFullscreen() {
  if (!fullscreenVideoElement.value) return;
  
  if (!isVideoFullscreen.value) {
    // Enter fullscreen
    if (fullscreenVideoElement.value.requestFullscreen) {
      fullscreenVideoElement.value.requestFullscreen();
    } else if (fullscreenVideoElement.value.webkitRequestFullscreen) {
      fullscreenVideoElement.value.webkitRequestFullscreen();
    } else if (fullscreenVideoElement.value.msRequestFullscreen) {
      fullscreenVideoElement.value.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

// Video event handlers
function onVideoLoadStart() {
  videoLoading.value = true;
  videoError.value = '';
}

function onVideoLoaded() {
  videoLoading.value = false;
  videoError.value = '';
}

function onVideoError(event) {
  videoLoading.value = false;
  videoError.value = 'Failed to load video. Please check the video file or try again.';
  console.error('Video loading error:', event);
}

// Keyboard event handler for ESC key
function handleKeydown(event) {
  if (event.key === 'Escape' && showFullscreenVideo.value) {
    closeFullscreenVideo();
  }
}

// Fullscreen change event handler
function handleFullscreenChange() {
  isVideoFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

// Methods
async function switchTab(tab) {
  activeTab.value = tab;
  showForm.value = false;
  currentPage.value = 1;
  search.value = '';
  showCategoryFilter.value = false;
  
  // Fetch data based on active tab
  if (tab === 'categories') {
    await fetchCategories();
  } else {
    await fetchResources();
  }
}

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function toggleCategoryFilter() {
  showCategoryFilter.value = !showCategoryFilter.value;
}

function toggleCategoryFilterOption(categoryId) {
  if (categoryId === 'All Categories') {
    activeCategoryFilters.value = [];
    return;
  }
  
  const index = activeCategoryFilters.value.indexOf(categoryId);
  if (index === -1) {
    activeCategoryFilters.value.push(categoryId);
  } else {
    activeCategoryFilters.value.splice(index, 1);
  }
}

function clearCategoryFilters() {
  activeCategoryFilters.value = [];
}

// Fix: Add null check to getCategoryName
function getCategoryName(categoryId) {
  if (!categoryId) return 'Unknown';
  
  // Check if resourceCategoryStore has the method
  if (resourceCategoryStore && typeof resourceCategoryStore.getCategoryName === 'function') {
    return resourceCategoryStore.getCategoryName(categoryId) || 'Unknown';
  }
  
  // Fallback: search in categories
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : 'Unknown';
}

// Fix: Add null check to getResourceCountForCategory
function getResourceCountForCategory(categoryId) {
  if (!categoryId) return 0;
  
  // Check if resourceCategoryStore has the method
  if (resourceCategoryStore && typeof resourceCategoryStore.getResourceCountForCategory === 'function') {
    return resourceCategoryStore.getResourceCountForCategory(categoryId) || 0;
  }
  
  // Fallback: count resources with this categoryId
  if (!resources.value) return 0;
  return resources.value.filter(r => r.categoryId === categoryId).length;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }
  
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
}

function addNew() {
  editingItem.value = null;
  
  if (activeTab.value === 'categories') {
    categoryForm.value = {
      name: '',
      description: '',
      coverPhoto: null,
      file: null
    };
    previewImage.value = null;
    previewVideo.value = null;
    selectedFile.value = null;
  } else {
    // Fix: Check if categories exist before setting default categoryId
    const defaultCategoryId = categories.value && categories.value.length > 0 ? categories.value[0].id : '';
    
    resourceForm.value = {
      name: '',
      categoryId: defaultCategoryId,
      type: 'Document',
      status: 'Active',
      description: '',
      coverPhoto: null,
      tags: [],
      file: null
    };
    resourcePreviewImage.value = null;
    resourcePreviewVideo.value = null;
    selectedResourceFile.value = null;
  }
  
  showForm.value = true;
}

function editItem(item) {
  editingItem.value = item;
  
  if (activeTab.value === 'categories') {
    categoryForm.value = {
      name: item.name,
      description: item.description || '',
      coverPhoto: item.coverPhoto,
      file: null
    };
    previewImage.value = null;
    previewVideo.value = null;
    selectedFile.value = null;
  } else {
    resourceForm.value = {
      name: item.name,
      categoryId: item.categoryId,
      type: item.type,
      status: item.status,
      description: item.description || '',
      coverPhoto: item.coverPhoto,
      tags: [...(item.tags || [])],
      file: null
    };
    resourcePreviewImage.value = null;
    resourcePreviewVideo.value = null;
    selectedResourceFile.value = null;
  }
  
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingItem.value = null;
  previewImage.value = null;
  previewVideo.value = null;
  resourcePreviewImage.value = null;
  resourcePreviewVideo.value = null;
  selectedFile.value = null;
  selectedResourceFile.value = null;
}

// Fix: Add methods to trigger file inputs safely
function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

function triggerResourceFileInput() {
  if (resourceFileInput.value) {
    resourceFileInput.value.click();
  }
}

// Enhanced file change handlers with video support
function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size
  if (!validateFileSize(file)) {
    const maxSize = file.type.startsWith('image/') ? '5MB' : '50MB';
    statusMessage.value = `File size exceeds the maximum limit of ${maxSize}`;
    showErrorModal.value = true;
    return;
  }
  
  selectedFile.value = file;
  categoryForm.value.file = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (file.type.startsWith('image/')) {
      previewImage.value = e.target.result;
      previewVideo.value = null;
    } else if (file.type.startsWith('video/')) {
      previewVideo.value = e.target.result;
      previewImage.value = null;
    }
  };
  reader.readAsDataURL(file);
}

function handleResourceFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file size
  if (!validateFileSize(file)) {
    const maxSize = file.type.startsWith('image/') ? '5MB' : '50MB';
    statusMessage.value = `File size exceeds the maximum limit of ${maxSize}`;
    showErrorModal.value = true;
    return;
  }
  
  selectedResourceFile.value = file;
  resourceForm.value.file = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    if (file.type.startsWith('image/')) {
      resourcePreviewImage.value = e.target.result;
      resourcePreviewVideo.value = null;
    } else if (file.type.startsWith('video/')) {
      resourcePreviewVideo.value = e.target.result;
      resourcePreviewImage.value = null;
    }
  };
  reader.readAsDataURL(file);
}

// Enhanced remove functions for video support
function removeCoverPhoto() {
  categoryForm.value.coverPhoto = null;
  previewImage.value = null;
  previewVideo.value = null;
  selectedFile.value = null;
  categoryForm.value.file = null;
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function removeResourceCoverPhoto() {
  resourceForm.value.coverPhoto = null;
  resourcePreviewImage.value = null;
  resourcePreviewVideo.value = null;
  selectedResourceFile.value = null;
  resourceForm.value.file = null;
  
  if (resourceFileInput.value) {
    resourceFileInput.value.value = '';
  }
}

function addTag() {
  resourceForm.value.tags.push('');
}

function removeTag(index) {
  resourceForm.value.tags.splice(index, 1);
}

function showDeleteConfirm(id, type) {
  itemToDelete.value = id;
  itemTypeToDelete.value = type;
  showConfirmDialog.value = true;
}

function cancelDelete() {
  showConfirmDialog.value = false;
  itemToDelete.value = null;
  itemTypeToDelete.value = null;
}

async function confirmDelete() {
  showConfirmDialog.value = false;
  
  try {
    if (itemTypeToDelete.value === 'category') {
      const result = await deleteCategory(itemToDelete.value);
      if (result) {
        statusMessage.value = 'Category deleted successfully.';
        showSuccessModal.value = true;
      } else {
        throw new Error(storeError.value || 'Failed to delete category');
      }
    } else {
      // Fix: Implement direct resource deletion if store method is not available
      try {
        let result;
        if (resourceCategoryStore && typeof resourceCategoryStore.deleteResource === 'function') {
          result = await resourceCategoryStore.deleteResource(itemToDelete.value);
        } else {
          // Direct implementation if store method is not available
          result = await deleteResource(itemToDelete.value);
        }
        
        if (result) {
          statusMessage.value = 'Resource deleted successfully.';
          showSuccessModal.value = true;
        } else {
          throw new Error('Failed to delete resource');
        }
      } catch (error) {
        throw new Error(error.message || 'Resource deletion failed');
      }
    }
  } catch (error) {
    statusMessage.value = error.message || 'An error occurred during deletion.';
    showErrorModal.value = true;
  } finally {
    itemToDelete.value = null;
    itemTypeToDelete.value = null;
  }
}

async function handleSubmit() {
  try {
    if (activeTab.value === 'categories') {
      if (editingItem.value) {
        // Update existing category
        const result = await updateCategory(editingItem.value.id, categoryForm.value);
        if (result) {
          statusMessage.value = 'Category updated successfully.';
          showSuccessModal.value = true;
          showForm.value = false;
          editingItem.value = null;
        } else {
          throw new Error(storeError.value || 'Failed to update category');
        }
      } else {
        // Add new category
        const newCategory = await createCategory(categoryForm.value);
        if (newCategory) {
          statusMessage.value = 'Category added successfully.';
          showSuccessModal.value = true;
          showForm.value = false;
        } else {
          throw new Error(storeError.value || 'Failed to add category');
        }
      }
    } else {
      // Handle resource form submission
      try {
        let result;
        if (editingItem.value) {
          // Update existing resource
          if (resourceCategoryStore && typeof resourceCategoryStore.updateResource === 'function') {
            result = await resourceCategoryStore.updateResource(editingItem.value.id, resourceForm.value);
          } else {
            // Direct implementation if store method is not available
            result = await updateResource(editingItem.value.id, resourceForm.value);
          }
          
          if (result) {
            statusMessage.value = 'Resource updated successfully.';
            showSuccessModal.value = true;
            showForm.value = false;
            editingItem.value = null;
          } else {
            throw new Error('Failed to update resource');
          }
        } else {
          // Add new resource
          if (resourceCategoryStore && typeof resourceCategoryStore.createResource === 'function') {
            result = await resourceCategoryStore.createResource(resourceForm.value);
          } else {
            // Direct implementation if store method is not available
            result = await createResource(resourceForm.value);
          }
          
          if (result) {
            statusMessage.value = 'Resource added successfully.';
            showSuccessModal.value = true;
            showForm.value = false;
          } else {
            throw new Error('Failed to add resource');
          }
        }
      } catch (error) {
        throw new Error(error.message || 'Resource operation failed');
      }
    }
  } catch (error) {
    statusMessage.value = error.message || 'An error occurred. Please try again.';
    showErrorModal.value = true;
  }
}

async function exportToCSV() {
  try {
    let csvContent;
    
    // Fix: Implement direct CSV export if store method is not available
    if (activeTab.value === 'categories') {
      if (resourceCategoryStore && typeof resourceCategoryStore.exportCategoriesToCSV === 'function') {
        csvContent = resourceCategoryStore.exportCategoriesToCSV();
      } else {
        // Direct implementation
        csvContent = generateCategoriesCSV();
      }
    } else {
      if (resourceCategoryStore && typeof resourceCategoryStore.exportResourcesToCSV === 'function') {
        csvContent = resourceCategoryStore.exportResourcesToCSV();
      } else {
        // Direct implementation
        csvContent = generateResourcesCSV();
      }
    }
    
    if (csvContent) {
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeTab.value}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      statusMessage.value = 'Data exported successfully.';
      showSuccessModal.value = true;
    } else {
      throw new Error('No data to export');
    }
  } catch (error) {
    statusMessage.value = error.message || 'Failed to export data. Please try again.';
    showErrorModal.value = true;
  }
}

// Helper function to generate categories CSV
function generateCategoriesCSV() {
  if (!categories.value || categories.value.length === 0) {
    return null;
  }
  
  const headers = ['ID', 'Name', 'Description', 'Resources', 'Created At', 'Updated At'];
  const rows = categories.value.map(category => [
    category.id,
    category.name,
    category.description || '',
    getResourceCountForCategory(category.id),
    formatTimestamp(category.createdAt),
    formatTimestamp(category.updatedAt)
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Helper function to generate resources CSV
function generateResourcesCSV() {
  if (!resources.value || resources.value.length === 0) {
    return null;
  }
  
  const headers = ['ID', 'Name', 'Category', 'Type', 'Status', 'Description', 'Created At', 'Updated At'];
  const rows = resources.value.map(resource => [
    resource.id,
    resource.name,
    getCategoryName(resource.categoryId),
    resource.type || '',
    resource.status || '',
    resource.description || '',
    formatTimestamp(resource.createdAt),
    formatTimestamp(resource.updatedAt)
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Fixed fetchCategories function to properly update the store's state
async function fetchCategories() {
  initialLoading.value = true;
  storeLoading.value = true;
  
  try {
    console.log('Fetching categories from resourceCategories collection');
    // Query resourceCategories collection
    const categoriesRef = collection(db, 'resourceCategories');
    
    // Build query with sorting by name
    const queryRef = query(categoriesRef, orderBy('name'));
    
    const categoriesSnapshot = await getDocs(queryRef);
    
    if (!categoriesSnapshot.empty) {
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for easier handling
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      }));
      
      console.log('Fetched categories data:', categoriesData);
      // Fix: Update the store's resourceCategories
      resourceCategories.value = categoriesData;
    } else {
      console.log('No categories found');
      resourceCategories.value = [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    storeError.value = error.message;
    statusMessage.value = 'Failed to fetch categories: ' + error.message;
    showErrorModal.value = true;
  } finally {
    initialLoading.value = false;
    storeLoading.value = false;
  }
}

// Add fetchResources function
async function fetchResources() {
  initialLoading.value = true;
  storeLoading.value = true;
  
  try {
    // Check if resourceCategoryStore has a fetchResources method
    if (resourceCategoryStore && typeof resourceCategoryStore.fetchResources === 'function') {
      await resourceCategoryStore.fetchResources();
    } else {
      // Fallback implementation
      console.log('Fetching resources from resources collection');
      const resourcesRef = collection(db, 'resources');
      
      // Build query with sorting by name
      const queryRef = query(resourcesRef, orderBy('name'));
      
      const resourcesSnapshot = await getDocs(queryRef);
      
      if (!resourcesSnapshot.empty) {
        const resourcesData = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to ISO strings for easier handling
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
        }));
        
        console.log('Fetched resources data:', resourcesData);
        resources.value = resourcesData;
      } else {
        console.log('No resources found');
        resources.value = [];
      }
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    storeError.value = error.message;
    statusMessage.value = 'Failed to fetch resources: ' + error.message;
    showErrorModal.value = true;
  } finally {
    initialLoading.value = false;
    storeLoading.value = false;
  }
}

async function createCategory(categoryData) {
  storeLoading.value = true;
  
  try {
    // Generate a document ID using the full first word of the name + random 4-digit number
    const words = categoryData.name.toLowerCase().split(/\s+/);
    let namePrefix = words[0]; // Get the first word (full word)
    
    // If the first word is too short, pad it
    if (namePrefix.length < 3) {
      namePrefix = namePrefix.padEnd(3, 'x');
    }
    
    const randomId = Math.floor(1000 + Math.random() * 9000); // Always 4 digits
    const docId = `${namePrefix}${randomId}`;
    
    console.log('Generated category ID:', docId);
    
    // Create a reference to the document with the dynamic ID
    const categoryRef = doc(db, 'resourceCategories', docId);
    
    // Extract file from form data if it exists
    const file = categoryData.file;
    let coverPhotoURL = null;
    
    // Add timestamps and ID to the category data
    const categoryWithMetadata = {
      name: categoryData.name,
      description: categoryData.description,
      id: docId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      archived: false
    };
    
    // Save to Firestore
    await setDoc(categoryRef, categoryWithMetadata);
    
    // Handle cover photo/video upload if provided
    if (file) {
      coverPhotoURL = await uploadCategoryMedia(docId, file);
      if (coverPhotoURL) {
        await updateDoc(categoryRef, { coverPhoto: coverPhotoURL });
        categoryWithMetadata.coverPhoto = coverPhotoURL;
      }
    }
    
    console.log('Category added successfully:', categoryWithMetadata);
    
    // Update local state
    const newCategory = {
      id: docId,
      ...categoryWithMetadata,
      // Convert Firestore timestamps to dates for the UI
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Fix: Ensure resourceCategories.value is an array before pushing
    if (!resourceCategories.value) {
      resourceCategories.value = [];
    }
    resourceCategories.value.push(newCategory);
    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    storeError.value = error.message;
    return null;
  } finally {
    storeLoading.value = false;
  }
}

async function updateCategory(categoryId, categoryData) {
  storeLoading.value = true;
  
  try {
    const categoryRef = doc(db, 'resourceCategories', categoryId);
    
    // Check if category exists
    const categoryDoc = await getDoc(categoryRef);
    if (!categoryDoc.exists()) {
      throw new Error('Category not found');
    }
    
    // Extract file from form data if it exists
    const file = categoryData.file;
    let updatedData = {
      name: categoryData.name,
      description: categoryData.description,
      updatedAt: serverTimestamp()
    };
    
    // Handle cover photo/video upload if provided
    if (file) {
      // Delete existing media if there is one
      const existingData = categoryDoc.data();
      if (existingData.coverPhoto) {
        await deleteCategoryMedia(existingData.coverPhoto);
      }
      
      // Upload new media
      const coverPhotoURL = await uploadCategoryMedia(categoryId, file);
      if (coverPhotoURL) {
        updatedData.coverPhoto = coverPhotoURL;
      }
    } else if (categoryData.coverPhoto === null) {
      // If coverPhoto is explicitly set to null, remove the existing media
      const existingData = categoryDoc.data();
      if (existingData.coverPhoto) {
        await deleteCategoryMedia(existingData.coverPhoto);
        updatedData.coverPhoto = null;
      }
    }
    
    // Update in Firestore
    await updateDoc(categoryRef, updatedData);
    
    // Update local state
    // Fix: Ensure resourceCategories.value is an array before updating
    if (resourceCategories.value) {
      const categoryIndex = resourceCategories.value.findIndex(c => c.id === categoryId);
      if (categoryIndex !== -1) {
        resourceCategories.value[categoryIndex] = {
          ...resourceCategories.value[categoryIndex],
          ...updatedData,
          updatedAt: new Date() // Use current date for UI
        };
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    storeError.value = error.message;
    return false;
  } finally {
    storeLoading.value = false;
  }
}

async function deleteCategory(categoryId) {
  storeLoading.value = true;
  
  try {
    const categoryRef = doc(db, 'resourceCategories', categoryId);
    
    // Check if category exists
    const categoryDoc = await getDoc(categoryRef);
    if (!categoryDoc.exists()) {
      throw new Error('Category not found');
    }
    
    // Delete the category's cover media if it exists
    const categoryData = categoryDoc.data();
    if (categoryData.coverPhoto) {
      await deleteCategoryMedia(categoryData.coverPhoto);
    }
    
    // Delete the category document
    await deleteDoc(categoryRef);
    
    // Update local state
    // Fix: Ensure resourceCategories.value is an array before filtering
    if (resourceCategories.value) {
      resourceCategories.value = resourceCategories.value.filter(c => c.id !== categoryId);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    storeError.value = error.message;
    return false;
  } finally {
    storeLoading.value = false;
  }
}

// Add direct resource CRUD methods as fallbacks
async function createResource(resourceData) {
  storeLoading.value = true;
  
  try {
    // Generate a document ID
    const words = resourceData.name.toLowerCase().split(/\s+/);
    let namePrefix = words[0]; // Get the first word
    
    if (namePrefix.length < 3) {
      namePrefix = namePrefix.padEnd(3, 'x');
    }
    
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const docId = `res_${namePrefix}${randomId}`;
    
    // Create a reference to the document
    const resourceRef = doc(db, 'resources', docId);
    
    // Extract file from form data if it exists
    const file = resourceData.file;
    let coverPhotoURL = null;
    
    // Add timestamps and ID to the resource data
    const resourceWithMetadata = {
      name: resourceData.name,
      description: resourceData.description,
      categoryId: resourceData.categoryId,
      type: resourceData.type,
      status: resourceData.status,
      tags: resourceData.tags.filter(tag => tag.trim() !== ''),
      id: docId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      archived: false
    };
    
    // Save to Firestore
    await setDoc(resourceRef, resourceWithMetadata);
    
    // Handle cover media upload if provided
    if (file) {
      coverPhotoURL = await uploadResourceMedia(docId, file);
      if (coverPhotoURL) {
        await updateDoc(resourceRef, { coverPhoto: coverPhotoURL });
        resourceWithMetadata.coverPhoto = coverPhotoURL;
      }
    }
    
    // Update local state
    const newResource = {
      id: docId,
      ...resourceWithMetadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Ensure resources.value is an array before pushing
    if (!resources.value) {
      resources.value = [];
    }
    resources.value.push(newResource);
    return newResource;
  } catch (error) {
    console.error('Error adding resource:', error);
    storeError.value = error.message;
    return null;
  } finally {
    storeLoading.value = false;
  }
}

async function updateResource(resourceId, resourceData) {
  storeLoading.value = true;
  
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    
    // Check if resource exists
    const resourceDoc = await getDoc(resourceRef);
    if (!resourceDoc.exists()) {
      throw new Error('Resource not found');
    }
    
    // Extract file from form data if it exists
    const file = resourceData.file;
    let updatedData = {
      name: resourceData.name,
      description: resourceData.description,
      categoryId: resourceData.categoryId,
      type: resourceData.type,
      status: resourceData.status,
      tags: resourceData.tags.filter(tag => tag.trim() !== ''),
      updatedAt: serverTimestamp()
    };
    
    // Handle cover media upload if provided
    if (file) {
      // Delete existing media if there is one
      const existingData = resourceDoc.data();
      if (existingData.coverPhoto) {
        await deleteResourceMedia(existingData.coverPhoto);
      }
      
      // Upload new media
      const coverPhotoURL = await uploadResourceMedia(resourceId, file);
      if (coverPhotoURL) {
        updatedData.coverPhoto = coverPhotoURL;
      }
    } else if (resourceData.coverPhoto === null) {
      // If coverPhoto is explicitly set to null, remove the existing media
      const existingData = resourceDoc.data();
      if (existingData.coverPhoto) {
        await deleteResourceMedia(existingData.coverPhoto);
        updatedData.coverPhoto = null;
      }
    }
    
    // Update in Firestore
    await updateDoc(resourceRef, updatedData);
    
    // Update local state
    if (resources.value) {
      const resourceIndex = resources.value.findIndex(r => r.id === resourceId);
      if (resourceIndex !== -1) {
        resources.value[resourceIndex] = {
          ...resources.value[resourceIndex],
          ...updatedData,
          updatedAt: new Date() // Use current date for UI
        };
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating resource:', error);
    storeError.value = error.message;
    return false;
  } finally {
    storeLoading.value = false;
  }
}

async function deleteResource(resourceId) {
  storeLoading.value = true;
  
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    
    // Check if resource exists
    const resourceDoc = await getDoc(resourceRef);
    if (!resourceDoc.exists()) {
      throw new Error('Resource not found');
    }
    
    // Delete the resource's cover media if it exists
    const resourceData = resourceDoc.data();
    if (resourceData.coverPhoto) {
      await deleteResourceMedia(resourceData.coverPhoto);
    }
    
    // Delete the resource document
    await deleteDoc(resourceRef);
    
    // Update local state
    if (resources.value) {
      resources.value = resources.value.filter(r => r.id !== resourceId);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting resource:', error);
    storeError.value = error.message;
    return false;
  } finally {
    storeLoading.value = false;
  }
}

// Enhanced helper functions to upload category media (images and videos)
async function uploadCategoryMedia(categoryId, file) {
  try {
    const fileRef = storageRef(storage, `categories/${categoryId}/${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading category media:', error);
    return null;
  }
}

// Enhanced helper function to upload resource media (images and videos)
async function uploadResourceMedia(resourceId, file) {
  try {
    const fileRef = storageRef(storage, `resources/${resourceId}/${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading resource media:', error);
    return null;
  }
}

// Enhanced helper function to delete category media
async function deleteCategoryMedia(mediaURL) {
  try {
    // Extract the path from the URL
    const urlObj = new URL(mediaURL);
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1]);
    
    if (path) {
      const fileRef = storageRef(storage, path);
      await deleteObject(fileRef);
      console.log('Category media deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting category media:', error);
  }
}

// Enhanced helper function to delete resource media
async function deleteResourceMedia(mediaURL) {
  try {
    // Extract the path from the URL
    const urlObj = new URL(mediaURL);
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1]);
    
    if (path) {
      const fileRef = storageRef(storage, path);
      await deleteObject(fileRef);
      console.log('Resource media deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting resource media:', error);
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Fetch initial data
  await fetchCategories();
  
  // If resources tab is active, fetch resources
  if (activeTab.value === 'resources') {
    await fetchResources();
  }
  
  initialLoading.value = false;
  
  // Add event listeners for fullscreen video functionality
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
});

// Watch for changes in search input to reset pagination
watch(search, () => {
  currentPage.value = 1;
});

// Watch for changes in category filters to reset pagination
watch(activeCategoryFilters, () => {
  currentPage.value = 1;
});


// Close category filter dropdown when clicking outside
const handleClickOutside = (event) => {
  if (showCategoryFilter.value && !event.target.closest('.filter-dropdown')) {
    showCategoryFilter.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
  
  // Restore body scroll if component is unmounted while video is open
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>