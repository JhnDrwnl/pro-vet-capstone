<!-- views/admin/appointments/Services.vue -->
<template>
  <div class="min-h-screen p-6 bg-white rounded-2xl">
    <!-- Show loading spinner during initial data load -->
    <LoadingSpinner v-if="initialLoading" isOverlay text="Loading data..." />
  
    <!-- Only show content when data is loaded -->
    <div v-else>
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Services Management</h1>
        <p class="text-gray-500 mt-1">Manage services offered by the office.</p>
      </div>
      <!-- Navigation Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-8 mb-4">
          <button
            @click="switchTab('categories')"
            :class="[
               'whitespace-nowrap py-2 px-4 text-sm font-medium rounded-full transition-colors',
              activeTab === 'categories'
               ? 'bg-[#EBF5FF] text-[#0066FF]'
                  : 'text-gray-800 hover:text-gray-700'
            ]"
          >
            <div class="flex items-center space-x-2">
              <ListIcon class="w-5 h-5" />
              <span>Categories</span>
            </div>
          </button>
          <button
            @click="switchTab('services')"
            :class="[
               'whitespace-nowrap py-2 px-4 text-sm font-medium rounded-full transition-colors',
              activeTab === 'services'
                ? 'bg-[#EBF5FF] text-[#0066FF]'
                  : 'text-gray-800 hover:text-gray-700'
            ]"
          >
            <div class="flex items-center space-x-2">
              <PackageIcon class="w-5 h-5" />
              <span>Services</span>
            </div>
          </button>
        </nav>
        <div class="border-b border-gray-200"></div>
      </div>
  
      <!-- Content Section -->
      <div>
        <!-- Search and Actions -->
        <div v-if="!showForm" class="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0">
          <div class="w-full sm:w-auto">
            <div class="relative">
              <input 
                v-model="search" 
                class="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="activeTab === 'categories' ? 'Search categories...' : 'Search services...'"
              />
              <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <div class="flex gap-2 w-full sm:w-auto justify-end">
            <button 
              @click="exportToCSV"
              class="flex items-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-200 sm:px-4 sm:py-2 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
            >
              <Download class="w-4 h-4 max-sm:w-3 max-sm:h-3" />
              Export CSV
            </button>
            <button 
              @click="addNew" 
              class="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200 sm:px-4 sm:py-2 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
            >
            <PlusCircle class="w-4 h-4 max-sm:w-3 max-sm:h-3" />
              {{ activeTab === 'categories' ? 'Add Category' : 'Add Service' }}
            </button>
          </div>
        </div>
  
        <!-- Table or Form -->
        <div v-if="!showForm">
          <!-- Table with horizontal scroll for mobile -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th v-for="header in activeTab === 'categories' ? categoryHeaders : serviceHeaders" 
                        :key="header.key" 
                        @click="sortBy(header.key)"
                        class="px-6 py-3 text-left text-sm font-medium text-gray-500 tracking-wider cursor-pointer whitespace-nowrap">
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
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10 mr-3">
                            <img v-if="category.coverPhoto" :src="category.coverPhoto" class="h-10 w-10 rounded-md object-cover" alt="Category cover" />
                            <div v-else class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                              <ImageIcon class="w-5 h-5" />
                            </div>
                          </div>
                          <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ category.description }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ getServiceCountForCategory(category.id) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ formatTimestamp(category.createdAt) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ formatTimestamp(category.updatedAt) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2 min-w-[80px]">
                          <button 
                            @click="editItem(category)" 
                            class="text-gray-500 hover:text-gray-700 p-1 inline-flex items-center"
                          >
                            <LucideEdit class="w-5 h-5" />
                          </button>
                          <button 
                            @click="showDeleteConfirm(category.id, 'category')" 
                            class="text-red-500 hover:text-red-700 p-1 inline-flex items-center"
                            title="Delete (will be archived)"
                          >
                            <Trash2 class="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <!-- Empty state for categories -->
                    <tr v-if="paginatedItems.length === 0">
                      <td colspan="6" class="py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <ListIcon class="w-8 h-8 text-gray-300" />
                          </div>
                          <p class="text-gray-500 font-medium">No categories available.</p>
                          <p class="text-gray-400 text-sm mt-1">Add your first category to get started.</p>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr v-for="service in paginatedItems" :key="service.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10 mr-3">
                            <img v-if="service.coverPhoto" :src="service.coverPhoto" class="h-10 w-10 rounded-md object-cover" alt="Service cover" />
                            <div v-else class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                              <ImageIcon class="w-5 h-5" />
                            </div>
                          </div>
                          <div class="text-sm font-medium text-gray-900">{{ service.name }}</div>
                        </div>
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
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ formatTimestamp(service.createdAt) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ formatTimestamp(service.updatedAt) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2 min-w-[80px]">
                          <button 
                            @click="editItem(service)" 
                            class="text-gray-500 hover:text-gray-700 p-1 inline-flex items-center"
                          >
                            <LucideEdit class="w-5 h-5" />
                          </button>
                          <button 
                            @click="showDeleteConfirm(service.id, 'service')" 
                            class="text-red-500 hover:text-red-700 p-1 inline-flex items-center"
                            title="Delete (will be archived)"
                          >
                            <Trash2 class="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <!-- Empty state for services -->
                    <tr v-if="paginatedItems.length === 0">
                      <td colspan="8" class="py-12 text-center">
                        <div class="flex flex-col items-center justify-center">
                          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <PackageIcon class="w-8 h-8 text-gray-300" />
                          </div>
                          <p class="text-gray-500 font-medium">No services available.</p>
                          <p class="text-gray-400 text-sm mt-1">Add your first service to get started.</p>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- Pagination - Responsive -->
          <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div class="text-sm text-gray-700 text-center sm:text-left">
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
  
        <!-- Inline Form - Responsive -->
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
              <div>
                <label class="block text-sm font-medium text-gray-700">Cover Photo</label>
                <div class="mt-1 flex items-center">
                  <div v-if="categoryForm.coverPhoto || previewImage" class="relative h-32 w-32 rounded-md overflow-hidden bg-gray-100 mr-4">
                    <img :src="previewImage || categoryForm.coverPhoto" class="h-full w-full object-cover" alt="Cover preview" />
                    <button 
                      @click="removeCoverPhoto" 
                      type="button" 
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <div v-else class="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 mr-4">
                    <ImageIcon class="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <input 
                      type="file" 
                      ref="fileInput" 
                      @change="handleFileChange" 
                      accept="image/*" 
                      class="hidden" 
                    />
                    <button 
                      type="button" 
                      @click="$refs.fileInput.click()" 
                      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      <UploadIcon class="w-4 h-4 mr-2" />
                      Upload Photo
                    </button>
                    <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </div>
              </div>
            </template>
  
            <!-- Service Form -->
            <template v-else>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                
                <!-- Updated Service Duration Field with more precise time selector -->
                <div>
                  <label for="processingTime" class="block text-sm font-medium text-gray-700">Service Duration</label>
                  <div class="mt-1 grid grid-cols-3 gap-2">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Hours</label>
                      <input 
                        type="number" 
                        v-model="durationHours" 
                        min="0" 
                        max="23" 
                        @input="updateProcessingTime"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Minutes</label>
                      <input 
                        type="number" 
                        v-model="durationMinutes" 
                        min="0" 
                        max="59" 
                        @input="updateProcessingTime"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Seconds</label>
                      <input 
                        type="number" 
                        v-model="durationSeconds" 
                        min="0" 
                        max="59" 
                        @input="updateProcessingTime"
                        class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div class="mt-2 flex items-center">
                    <div class="text-sm font-medium text-gray-700">Duration: </div>
                    <div class="ml-2 text-sm text-blue-600">{{ serviceForm.processingTime }}</div>
                  </div>
                </div>
                
                <div>
                  <label for="fees" class="block text-sm font-medium text-gray-700">Fees</label>
                  <input type="text" id="fees" v-model="serviceForm.fees" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" v-model="serviceForm.description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                <div class="col-span-1 sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Cover Photo</label>
                  <div class="mt-1 flex items-center">
                    <div v-if="serviceForm.coverPhoto || servicePreviewImage" class="relative h-32 w-32 rounded-md overflow-hidden bg-gray-100 mr-4">
                      <img :src="servicePreviewImage || serviceForm.coverPhoto" class="h-full w-full object-cover" alt="Cover preview" />
                      <button 
                        @click="removeServiceCoverPhoto" 
                        type="button" 
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <XIcon class="w-4 h-4" />
                      </button>
                    </div>
                    <div v-else class="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50 mr-4">
                      <ImageIcon class="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref="serviceFileInput" 
                        @change="handleServiceFileChange" 
                        accept="image/*" 
                        class="hidden" 
                      />
                      <button 
                        type="button" 
                        @click="$refs.serviceFileInput.click()" 
                        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <UploadIcon class="w-4 h-4 mr-2" />
                        Upload Photo
                      </button>
                      <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    </div>
                  </div>
                </div>
                <div class="col-span-1 sm:col-span-2">
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
              <button 
                type="submit" 
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
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
  
  <!-- Loading Spinner for operations -->
  <LoadingSpinner v-if="isLoading && !initialLoading && !showForm" isOverlay text="Processing..." />
  
  <!-- Custom Confirmation Dialog - Responsive -->
  <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
      <AlertCircleIcon class="h-6 w-6 text-yellow-600" />
    </div>
    <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Confirm Action</h3>
    <p class="text-sm text-gray-500 text-center mb-6">
      Are you sure you want to delete this item? It will be moved to archives.
    </p>
    <div class="flex justify-center space-x-3">
      <button 
        @click="cancelDelete" 
        class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Cancel
      </button>
      <button 
        @click="confirmDelete" 
        class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
  
  <!-- Loading Spinner Overlay - Show for all operations -->
  <LoadingSpinner v-if="isLoading || initialLoading" isOverlay :text="initialLoading ? 'Loading data...' : 'Processing...'" />
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { 
  Search, 
  Download, 
  PlusCircle, 
  LucideEdit, 
  Trash2, 
  ImageIcon, 
  XIcon, 
  UploadIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
  List as ListIcon,
  Package as PackageIcon
  } from 'lucide-vue-next';
  import { useServiceCategoryStore } from '@/stores/modules/ServiceCategoryStore';
  import { useArchivesStore } from '@/stores/modules/archivesStore';
  import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
  
  const activeTab = ref('categories');
  const search = ref('');
  const showForm = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const sortKey = ref('name');
  const sortOrder = ref('asc');
  const editingItem = ref(null);
  const previewImage = ref(null);
  const servicePreviewImage = ref(null);
  const fileInput = ref(null);
  const serviceFileInput = ref(null);
  const isLoading = ref(false);
  const initialLoading = ref(true); // New ref for initial loading state
  
  // Duration selectors for service time with more precision
  const durationHours = ref(0);
  const durationMinutes = ref(0);
  const durationSeconds = ref(0);
  
  // Confirmation dialog state
  const showConfirmDialog = ref(false);
  const itemToDelete = ref(null);
  const itemTypeToDelete = ref(null);
  
  // Status message and modals
  const statusMessage = ref('');
  const showSuccessModal = ref(false);
  const showErrorModal = ref(false);
  
  // Use the stores
  const categoryStore = useServiceCategoryStore();
  const archivesStore = useArchivesStore();
  
  const categoryForm = ref({
  name: '',
  description: '',
  coverPhoto: null,
  file: null
  });
  
  const serviceForm = ref({
  name: '',
  categoryId: null,
  classification: 'Simple',
  transactionType: 'G2C',
  processingTime: '',
  fees: '',
  description: '',
  requirements: [''],
  coverPhoto: null,
  file: null
  });
  
  // Updated headers to include time added and time updated columns
  const categoryHeaders = [
  { key: 'name', label: 'Category Name' },
  { key: 'description', label: 'Description' },
  { key: 'serviceCount', label: 'Services Count' },
  { key: 'createdAt', label: 'Time Added' },
  { key: 'updatedAt', label: 'Time Updated' },
  { key: 'actions', label: 'Actions' }
  ];
  
  const serviceHeaders = [
  { key: 'name', label: 'Service Name' },
  { key: 'classification', label: 'Classification' },
  { key: 'transactionType', label: 'Transaction Type' },
  { key: 'processingTime', label: 'Service Duration' },
  { key: 'fees', label: 'Fees' },
  { key: 'createdAt', label: 'Time Added' },
  { key: 'updatedAt', label: 'Time Updated' },
  { key: 'actions', label: 'Actions' }
  ];
  
  const formTitle = computed(() => {
  if (editingItem.value) {
  return activeTab.value === 'categories' ? 'Edit Category' : 'Edit Service';
  }
  return activeTab.value === 'categories' ? 'Add New Category' : 'Add New Service';
  });
  
  // Get categories from store
  const categories = computed(() => categoryStore.categories);
  // Get services from store
  const services = computed(() => categoryStore.services);
  
  // Function to count services for each category
  const getServiceCountForCategory = (categoryId) => {
  return services.value.filter(service => service.categoryId === categoryId).length;
  };
  
  const items = computed(() => activeTab.value === 'categories' ? categories.value : services.value);
  
  const filteredItems = computed(() => {
  return items.value.filter(item =>
  item.name.toLowerCase().includes(search.value.toLowerCase()) ||
  (item.description && item.description.toLowerCase().includes(search.value.toLowerCase()))
  );
  });
  
  const sortedItems = computed(() => {
  return [...filteredItems.value].sort((a, b) => {
  // Special handling for serviceCount when sorting categories
  if (activeTab.value === 'categories' && sortKey.value === 'serviceCount') {
    const countA = getServiceCountForCategory(a.id);
    const countB = getServiceCountForCategory(b.id);
    return sortOrder.value === 'asc' ? countA - countB : countB - countA;
  }
  
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
  
  // Format timestamp function
  const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  // If timestamp is a Firestore Timestamp object
  if (timestamp && typeof timestamp.toDate === 'function') {
    timestamp = timestamp.toDate();
  }
  
  // If timestamp is a number (Unix timestamp in milliseconds)
  if (typeof timestamp === 'number') {
    timestamp = new Date(timestamp);
  }
  
  // Format the date
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return 'N/A';
  };
  
  // Switch tab with loading state
  const switchTab = async (tab) => {
    if (activeTab.value === tab) return;
    
    initialLoading.value = true;
    activeTab.value = tab;
    
    try {
      if (tab === 'categories') {
        await categoryStore.fetchCategories();
      } else {
        await categoryStore.fetchServices();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      showStatus('Failed to load data. Please try again.', 'error');
    } finally {
      initialLoading.value = false;
    }
  };
  
  // Load categories and services on component mount
  onMounted(async () => {
  initialLoading.value = true; // Set initial loading to true
  try {
    await Promise.all([
      categoryStore.fetchCategories(),
      categoryStore.fetchServices()
    ]);
  
    // Set default category ID for service form if categories exist
    if (categories.value.length > 0) {
      serviceForm.value.categoryId = categories.value[0].id;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showStatus('Failed to load data. Please try again.', 'error');
  } finally {
    initialLoading.value = false; // Set initial loading to false when done
  }
  });
  
  // Watch for tab changes to reset pagination and refresh data
  watch(activeTab, async () => {
  currentPage.value = 1;
  initialLoading.value = true;
  try {
    if (activeTab.value === 'categories') {
      await categoryStore.fetchCategories();
    } else {
      await categoryStore.fetchServices();
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    initialLoading.value = false;
  }
  });
  
  // Show status message
  const showStatus = (message, type = 'success') => {
  statusMessage.value = message;
  
  if (type === 'success') {
  showSuccessModal.value = true;
  } else {
  showErrorModal.value = true;
  }
  };
  
  // Update processing time from hours, minutes and seconds inputs
  const updateProcessingTime = () => {
  // Ensure values are valid numbers
  durationHours.value = Math.max(0, Math.min(23, parseInt(durationHours.value) || 0));
  durationMinutes.value = Math.max(0, Math.min(59, parseInt(durationMinutes.value) || 0));
  durationSeconds.value = Math.max(0, Math.min(59, parseInt(durationSeconds.value) || 0));
  
  let timeString = '';
  
  if (durationHours.value > 0) {
  timeString += `${durationHours.value} ${durationHours.value === 1 ? 'hour' : 'hours'}`;
  }
  
  if (durationMinutes.value > 0) {
  if (timeString) timeString += ' ';
  timeString += `${durationMinutes.value} ${durationMinutes.value === 1 ? 'minute' : 'minutes'}`;
  }
  
  if (durationSeconds.value > 0) {
  if (timeString) timeString += ' ';
  timeString += `${durationSeconds.value} ${durationSeconds.value === 1 ? 'second' : 'seconds'}`;
  }
  
  if (!timeString) timeString = '0 minutes';
  
  serviceForm.value.processingTime = timeString;
  };
  
  // Parse existing processing time when editing
  const parseProcessingTime = (timeString) => {
  if (!timeString) {
  durationHours.value = 0;
  durationMinutes.value = 0;
  durationSeconds.value = 0;
  return;
  }
  
  const hourMatch = timeString.match(/(\d+)\s*hour/i);
  const minuteMatch = timeString.match(/(\d+)\s*minute/i);
  const secondMatch = timeString.match(/(\d+)\s*second/i);
  
  durationHours.value = hourMatch ? parseInt(hourMatch[1]) : 0;
  durationMinutes.value = minuteMatch ? parseInt(minuteMatch[1]) : 0;
  durationSeconds.value = secondMatch ? parseInt(secondMatch[1]) : 0;
  };
  
  // Methods
  const addNew = () => {
  editingItem.value = null;
  previewImage.value = null;
  servicePreviewImage.value = null;
  
  if (activeTab.value === 'categories') {
  categoryForm.value = { 
    name: '', 
    description: '',
    coverPhoto: null,
    file: null
  };
  } else {
  serviceForm.value = {
    name: '',
    categoryId: categories.value[0]?.id,
    classification: 'Simple',
    transactionType: 'G2C',
    processingTime: '',
    fees: '',
    description: '',
    requirements: [''],
    coverPhoto: null,
    file: null
  };
  
  // Reset duration inputs
  durationHours.value = 0;
  durationMinutes.value = 0;
  durationSeconds.value = 0;
  updateProcessingTime();
  }
  showForm.value = true;
  };
  
  const closeForm = () => {
  showForm.value = false;
  editingItem.value = null;
  previewImage.value = null;
  servicePreviewImage.value = null;
  };
  
  const handleSubmit = async () => {
    isLoading.value = true;
    try {
      if (activeTab.value === 'categories') {
        if (editingItem.value) {
          await categoryStore.updateCategory(editingItem.value.id, categoryForm.value);
          showStatus(`Category "${categoryForm.value.name}" updated successfully`);
        } else {
          await categoryStore.createCategory(categoryForm.value);
          showStatus(`Category "${categoryForm.value.name}" created successfully`);
        }
        // Refresh categories data
        await categoryStore.fetchCategories();
      } else {
        if (editingItem.value) {
          await categoryStore.updateService(editingItem.value.id, serviceForm.value);
          showStatus(`Service "${serviceForm.value.name}" updated successfully`);
        } else {
          await categoryStore.createService(serviceForm.value);
          showStatus(`Service "${serviceForm.value.name}" created successfully`);
        }
        // Refresh services data
        await categoryStore.fetchServices();
      }
      closeForm();
    } catch (err) {
      console.error('Error saving item:', err);
      showStatus(`Failed to save: ${err.message}`, 'error');
    } finally {
      isLoading.value = false;
    }
  };
  
  const editItem = (item) => {
  editingItem.value = item;
  previewImage.value = null;
  servicePreviewImage.value = null;
  
  if (activeTab.value === 'categories') {
  categoryForm.value = { 
    name: item.name,
    description: item.description,
    coverPhoto: item.coverPhoto,
    file: null
  };
  } else {
  serviceForm.value = { 
    ...item,
    file: null
  };
  
  // Parse the processing time to set the duration selectors
  parseProcessingTime(item.processingTime);
  }
  showForm.value = true;
  };
  
  // Show delete confirmation dialog
  const showDeleteConfirm = (id, type) => {
  itemToDelete.value = id;
  itemTypeToDelete.value = type;
  showConfirmDialog.value = true;
  };
  
  // Cancel delete action
  const cancelDelete = () => {
  showConfirmDialog.value = false;
  itemToDelete.value = null;
  itemTypeToDelete.value = null;
  };
  
  // Confirm delete action
  const confirmDelete = async () => {
    isLoading.value = true;
    try {
      const itemName = itemTypeToDelete.value === 'category' 
        ? categories.value.find(c => c.id === itemToDelete.value)?.name
        : services.value.find(s => s.id === itemToDelete.value)?.name;
        
      if (itemTypeToDelete.value === 'category') {
        await categoryStore.archiveCategory(itemToDelete.value);
        // Refresh categories after archiving
        await categoryStore.fetchCategories();
      } else {
        await categoryStore.archiveService(itemToDelete.value);
        // Refresh services after archiving
        await categoryStore.fetchServices();
      }
  
      showStatus(`${itemTypeToDelete.value === 'category' ? 'Category' : 'Service'} "${itemName}" moved to archives successfully`, 'success');
  
      showConfirmDialog.value = false;
      itemToDelete.value = null;
      itemTypeToDelete.value = null;
    } catch (error) {
      console.error('Error archiving item:', error);
      showStatus(`Failed to archive item: ${error.message}`, 'error');
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
  showStatus('File size should not exceed 2MB', 'error');
  return;
  }
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
  previewImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  // Store file for upload
  categoryForm.value.file = file;
  };
  
  const handleServiceFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
  showStatus('File size should not exceed 2MB', 'error');
  return;
  }
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
  servicePreviewImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  // Store file for upload
  serviceForm.value.file = file;
  };
  
  const removeCoverPhoto = () => {
  previewImage.value = null;
  categoryForm.value.coverPhoto = null;
  categoryForm.value.file = null;
  if (fileInput.value) {
  fileInput.value.value = '';
  }
  };
  
  const removeServiceCoverPhoto = () => {
  servicePreviewImage.value = null;
  serviceForm.value.coverPhoto = null;
  serviceForm.value.file = null;
  if (serviceFileInput.value) {
  serviceFileInput.value.value = '';
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
  ? ['Category Name', 'Description', 'Services Count', 'Time Added', 'Time Updated']
  : ['Service Name', 'Classification', 'Transaction Type', 'Service Duration', 'Fees', 'Description', 'Requirements', 'Time Added', 'Time Updated'];
  
  const csvContent = [
  headers.join(','),
  ...items.map(item => {
    if (activeTab.value === 'categories') {
      return [
        item.name, 
        item.description,
        getServiceCountForCategory(item.id),
        formatTimestamp(item.createdAt),
        formatTimestamp(item.updatedAt)
      ].map(field => `"${field || ''}"`).join(',');
    } else {
      return [
        item.name,
        item.classification,
        item.transactionType,
        item.processingTime,
        item.fees,
        item.description,
        item.requirements.join('; '),
        formatTimestamp(item.createdAt),
        formatTimestamp(item.updatedAt)
      ].map(field => `"${field || ''}"`).join(',');
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