<!-- views/admin/datamanagement/PetOwners.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Pet Owner Management</h1>
      <p class="text-gray-500 mt-1">Manage pet owner profiles and information.</p>
    </div>
    
    <!-- Show loading spinner during initial data load -->
    <LoadingSpinner v-if="initialLoading" isOverlay text="Loading pet owners..." />
    
    <!-- Only show content when data is loaded -->
    <div v-if="!initialLoading">
      <!-- Search, Filter, and Export -->
      <div v-if="!showEditForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="flex gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search pet owners..."
              class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                :key="filter.value"
                @click="toggleFilter(filter)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                :class="{'text-blue-600': filter.value === 'all' ? activeFilters.length === 0 : activeFilters.includes(filter.value)}"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="exportToCSV"
            class="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs sm:text-sm w-full sm:w-auto justify-center"
          >
            <DownloadIcon class="w-3 h-3 sm:w-4 sm:h-4" />
            Export CSV
          </button>
        </div>
      </div>
    
      <!-- Table -->
      <div v-if="!showEditForm && filteredPetOwners.length > 0" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b border-gray-200">
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[60px]">
                Profile
              </th>
              <template v-for="header in tableHeaders" :key="header.key">
                <th 
                  v-if="header.key !== 'pets'"
                  @click="sortBy(header.key)"
                  class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
                  :class="getColumnClass(header.key)"
                >
                  <div class="flex items-center">
                    {{ header.label }}
                    <div class="flex flex-col ml-1">
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'asc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'asc') }">▲</span>
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'desc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'desc') }">▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  v-else
                  class="text-left py-4 px-6 text-sm font-medium text-gray-500"
                  :class="getColumnClass(header.key)"
                >
                  {{ header.label }}
                </th>
              </template>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500 w-[80px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="owner in paginatedPetOwners" :key="owner.userId" class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
              <td class="py-4 px-6">
                <div class="flex-shrink-0 h-10 w-10">
                  <img 
                    :src="owner.photoURL || defaultPhotoURL" 
                    :alt="`${owner.firstName} ${owner.lastName}`"
                    class="h-10 w-10 rounded-full object-cover" 
                  />
                </div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">
                {{ owner.firstName }} {{ owner.lastName }}
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">
                <div class="flex items-center">
                  <!-- Provider Icons -->
                  <div v-if="owner.providerData && owner.providerData.length > 0" class="mr-2 flex">
                    <div v-for="provider in owner.providerData" :key="provider.providerId" class="mr-1">
                      <!-- Google Provider -->
                      <div v-if="provider.providerId === 'google.com'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <!-- Facebook Provider -->
                      <div v-else-if="provider.providerId === 'facebook.com'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <!-- Email/Password Provider -->
                      <div v-else-if="provider.providerId === 'password'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#757575" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <!-- Phone Provider -->
                      <div v-else-if="provider.providerId === 'phone'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#4CAF50" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                      </div>
                      <!-- Other Providers -->
                      <div v-else 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#9E9E9E" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span>{{ owner.email }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ owner.phone || 'Not set' }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ formatDate(owner.dateOfBirth) }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">
                {{ formatAddress(owner) }}
              </td>
              <td class="py-4 px-6 text-sm text-gray-900 min-w-[200px]">
                <div v-if="owner.pets && owner.pets.length > 0">
                  <div class="flex items-center">
                    <!-- Pet avatars in a row with overlap -->
                    <div class="flex -space-x-2 mr-3">
                      <div v-for="(pet, index) in formatPetsArray(owner.pets)" :key="index" 
                           class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
                        <img :src="pet.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik04LjM1IDNjMS4xOC0uMTcgMi44MyAxLjEyIDIuNzkgMi45Yy4zNiAxLjc3LS4yOSAzLjM1LTEuNDcgMy41M2MtMS4xNy4xOC0yLjQzLTEuMTEtMi44LTIuODljLS4zNy0xLjc3LjMtMy4zNSAxLjQ4LTMuNTRtNy4xNSAwYzEuMTkuMTkgMS44NSAxLjc3IDEuNSAzLjU0Yy0uMzggMS43OC0xLjYzIDMuMDctMi44MSAyLjg5Yy0xLjE5LS4xOC0xLjg0LTEuNzYtMS40Ny0zLjUzYy4zNi0xLjc4IDEuNjEtMy4wNyAyLjc4LTIuOU0zIDcuNmMxLjE0LS40OSAyLjY5LjQgMy41IDEuOTVjLjc2IDEuNTguNSAzLjI0LS42MyAzLjczcy0yLjY3LS4zOS0zLjQ2LTEuOTZTMS45IDguMDggMyA3LjZtMTggMGMxLjEuNDggMS4zOCAyLjE1LjU5IDMuNzJzLTIuMzMgMi44NS0zLjQ2IDEuOTZzLTEuMzktMi4xNS0uNjMtMy43M0MxOC4zMSA4IDE5Ljg2IDcuMTEgMjEgNy42bS0xLjY3IDEwLjc4Yy4wNC45NC0uNjggMS45OC0xLjU0IDIuMzdjLTEuNzkuODItMy45MS0uODgtNS45LS44OHMtNC4xMyAxLjc3LTUuODkuODhjLTEtLjQ5LTEuNjktMS43OS0xLjU2LTIuODdjLjE4LTEuNDkgMS45Ny0yLjI5IDMuMDMtMy4zOGMxLjQxLTEuNDEgMi40MS00LjA2IDQuNDItNC4wNmMyIDAgMy4wNiAyLjYxIDQuNDEgNC4wNmMxLjExIDEuMjIgMi45NiAyLjI1IDMuMDMgMy44OCIvPjwvc3ZnPg=='" 
                             :alt="pet.name || 'Pet'" 
                             class="w-8 h-8 rounded-full object-cover" />
                      </div>
                    </div>
                    <!-- Pet names with commas -->
                    <div class="break-words flex-1">
                      {{ formatPetsArray(owner.pets).map(pet => pet.name).join(', ') }}
                    </div>
                  </div>
                </div>
                <div v-else class="text-gray-500">No pets</div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">
                {{ formatLastUpdated(owner.updatedAt) }}
              </td>
              <td class="py-4 px-6">
                <div class="flex gap-2">
                  <button 
                    @click="editPetOwner(owner)"
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <LucideEdit class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <!-- Empty state - Updated with the new column -->
      <div v-else-if="!showEditForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b border-gray-200">
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Profile
              </th>
              <template v-for="header in tableHeaders" :key="header.key">
                <th 
                  class="text-left py-4 px-6 text-sm font-medium text-gray-500"
                  :class="getColumnClass(header.key)"
                >
                  {{ header.label }}
                </th>
              </template>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="9" class="py-8 text-center">
                <div class="flex flex-col items-center justify-center">
                  <!-- Direct SVG implementation for the Users icon -->
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <p class="text-gray-500 font-medium">No pet owners found</p>
                  <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                  <!-- Removed the Clear all filters button -->
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    
      <!-- Pagination -->
      <div v-if="!showEditForm && filteredPetOwners.length > itemsPerPage" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredPetOwners.length }} entries
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
    
      <!-- Edit Form - Styled like Profile.vue -->
      <div v-if="showEditForm" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">Edit Pet Owner Information</h2>
        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- Personal Information Section -->
          <div>
            <div class="flex items-center mb-4">
              <div class="bg-blue-100 rounded-full p-2 mr-3">
                <UserIcon class="w-5 h-5 text-blue-500" />
              </div>
              <h3 class="text-md font-semibold text-gray-700">Personal Information</h3>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    v-model="editForm.firstName"
                    placeholder="Enter first name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    v-model="editForm.lastName"
                    placeholder="Enter last name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    v-model="editForm.username"
                    placeholder="Enter username"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div class="relative">
                    <input
                      v-model="tempForm.dateOfBirth"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 date-of-birth-input text-sm"
                      @input="handleDateInput"
                      @blur="validateDate"
                      ref="dateInputRef"
                      placeholder="YYYY-MM-DD"
                    />
                    <CalendarIcon 
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
                      @click.stop="toggleCalendar"
                    />
                    <div v-if="showCalendar" :class="{'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]': isMobile}">
                      <div class="bg-white rounded-lg shadow-lg overflow-hidden" :style="getCalendarPosition()">
                        <Calendar 
                          v-model="tempForm.dateOfBirth"
                          @update:modelValue="handleCalendarChange"
                          @cancel="handleCalendarCancel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    v-model="tempForm.age"
                    type="number"
                    placeholder="Enter age"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    @input="handleAgeInput"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div class="relative gender-dropdown">
                    <button
                      type="button"
                      @click="isGenderOpen = !isGenderOpen"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm flex justify-between items-center bg-white"
                    >
                      <span class="text-left">{{ editForm.gender ? (editForm.gender.charAt(0).toUpperCase() + editForm.gender.slice(1)) : 'Select gender' }}</span>
                      <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    
                    <div 
                      v-if="isGenderOpen" 
                      class="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm"
                    >
                      <button
                        type="button"
                        @click="selectGender('male')"
                        class="w-full px-3 py-2 text-left hover:bg-gray-100"
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        @click="selectGender('female')"
                        class="w-full px-3 py-2 text-left hover:bg-gray-100"
                      >
                        Female
                      </button>
                      <button
                        type="button"
                        @click="selectGender('other')"
                        class="w-full px-3 py-2 text-left hover:bg-gray-100"
                      >
                        Other
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Contact Information Section -->
          <div>
            <div class="flex items-center mb-4">
              <div class="bg-green-100 rounded-full p-2 mr-3">
                <PhoneIcon class="w-5 h-5 text-green-500" />
              </div>
              <h3 class="text-md font-semibold text-gray-700">Contact Information</h3>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    v-model="editForm.email"
                    placeholder="Enter email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    v-model="editForm.phone"
                    placeholder="Enter phone number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    v-model="editForm.whatsapp"
                    placeholder="Enter WhatsApp number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Alternative Email</label>
                  <input
                    type="email"
                    v-model="editForm.alternativeEmail"
                    placeholder="Enter alternative email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
              </div>
            </div>
          </div>
    
          <!-- Address Section -->
          <div>
            <div class="flex items-center mb-4">
              <div class="bg-red-100 rounded-full p-2 mr-3">
                <MapPinIcon class="w-5 h-5 text-red-500" />
              </div>
              <h3 class="text-md font-semibold text-gray-700">Address</h3>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    id="addressInput"
                    v-model="editForm.streetAddress"
                    type="text"
                    placeholder="Enter street address"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                    @focus="initializeAutocomplete"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    v-model="editForm.city"
                    placeholder="Enter city"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <input
                    type="text"
                    v-model="editForm.province"
                    placeholder="Enter province"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    v-model="editForm.postalCode"
                    placeholder="Enter postal code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    v-model="editForm.country"
                    placeholder="Enter country"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                  >
                </div>
              </div>
            </div>
          </div>
    
          <!-- Pets Information - Read Only -->
          <div v-if="ownerPets.length > 0">
            <div class="flex items-center mb-4">
              <div class="bg-purple-100 rounded-full p-2 mr-3">
                <PawPrintIcon class="w-5 h-5 text-purple-500" />
              </div>
              <h3 class="text-md font-semibold text-gray-700">Pets Information</h3>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div v-for="pet in ownerPets" :key="pet.id" class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-gray-400">
                      <img :src="pet.photoURL || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik04LjM1IDNjMS4xOC0uMTcgMi44MyAxLjEyIDIuNzkgMi45Yy4zNiAxLjc3LS4yOSAzLjM1LTEuNDcgMy41M2MtMS4xNy4xOC0yLjQzLTEuMTEtMi44LTIuODljLS4zNy0xLjc3LjMtMy4zNSAxLjQ4LTMuNTRtNy4xNSAwYzEuMTkuMTkgMS44NSAxLjc3IDEuNSAzLjU0Yy0uMzggMS43OC0xLjYzIDMuMDctMi44MSAyLjg5Yy0xLjE5LS4xOC0xLjg0LTEuNzYtMS40Ny0zLjUzYy4zNi0xLjc4IDEuNjEtMy4wNyAyLjc4LTIuOU0zIDcuNmMxLjE0LS40OSAyLjY5LjQgMy41IDEuOTVjLjc2IDEuNTguNSAzLjI0LS42MyAzLjczcy0yLjY3LS4zOS0zLjQ2LTEuOTZTMS45IDguMDggMyA3LjZtMTggMGMxLjEuNDggMS4zOCAyLjE1LjU5IDMuNzJzLTIuMzMgMi44NS0zLjQ2IDEuOTZzLTEuMzktMi4xNS0uNjMtMy43M0MxOC4zMSA4IDE5Ljg2IDcuMTEgMjEgNy42bS0xLjY3IDEwLjc4Yy4wNC45NC0uNjggMS45OC0xLjU0IDIuMzdjLTEuNzkuODItMy45MS0uODgtNS45LS44OHMtNC4xMyAxLjc3LTUuODkuODhjLTEtLjQ5LTEuNjktMS43OS0xLjU2LTIuODdjLjE4LTEuNDkgMS45Ny0yLjI5IDMuMDMtMy4zOGMxLjQxLTEuNDEgMi40MS00LjA2IDQuNDItNC4wNmMyIDAgMy4wNiAyLjYxIDQuNDEgNC4wNmMxLjExIDEuMjIgMi45NiAyLjI1IDMuMDMgMy44OCIvPjwvc3ZnPg=='" 
                           :alt="pet.name || 'Pet'" 
                           class="w-10 h-10 rounded-full object-cover" />
                    </div>
                    <div class="flex-1">
                      <div class="font-medium">{{ pet.name }}</div>
                      <div class="text-sm text-gray-500">{{ pet.species || 'Pet' }}</div>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-3">
                  To add or manage pets, please use the Pet Management section.
                </p>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="flex items-center mb-4">
              <div class="bg-purple-100 rounded-full p-2 mr-3">
                <PawPrintIcon class="w-5 h-5 text-purple-500" />
              </div>
              <h3 class="text-md font-semibold text-gray-700">Pets Information</h3>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p class="text-gray-500">No pets registered for this owner.</p>
                <p class="text-xs text-gray-500 mt-2">
                  Pets can be added through the Pet Management section.
                </p>
              </div>
            </div>
          </div>
    
          <!-- Actions Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              @click="cancelEdit"
              class="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-3 py-1.5 sm:px-4 sm:py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2 text-xs sm:text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
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
          {{ errorMessage }}
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
    
    <!-- Loading Spinner for operations (not initial loading) -->
    <LoadingSpinner v-if="loading && !initialLoading" isOverlay text="Processing..." />
    
    <!-- Loading Spinner Overlay - Show for all operations -->
    <LoadingSpinner v-if="loading || initialLoading" isOverlay :text="initialLoading ? 'Loading pet owners...' : 'Processing...'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  Edit as LucideEdit, 
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Users as UsersIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  PawPrint as PawPrintIcon
} from 'lucide-vue-next'
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useProfileStore } from '@/stores/modules/profileStore'
import { usePetsStore } from '@/stores/modules/petsStore'
import Calendar from '@/components/common/Calendar.vue'
import axios from 'axios'

// Default values and state
const petOwners = ref([])
const loading = ref(false)
const initialLoading = ref(true) // New state for initial loading
const showEditForm = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const searchQuery = ref('')
const showFilters = ref(false)
const activeFilters = ref([])
const sortKey = ref('firstName')
const sortOrder = ref('asc')
const editForm = ref({})
const tempForm = ref({})
const selectedOwnerId = ref(null)
const isSaving = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')
const profileStore = useProfileStore()
const petsStore = usePetsStore()
const ownerPets = ref([])
const showCalendar = ref(false)
const dateInputRef = ref(null)
const isGenderOpen = ref(false)
const isMobile = ref(window.innerWidth < 640)
let autocomplete = null
let googleMapsLoaded = false

const defaultPhotoURL = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' strokeWidth=\'2\' fill=\'none\'/%3E%3C/svg%3E'

const tableHeaders = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'address', label: 'Address' },
  { key: 'pets', label: 'Pets' },
  { key: 'updatedAt', label: 'Updated' }
]

// Function to get column class based on column key
const getColumnClass = (key) => {
  if (key === 'pets') {
    return 'min-w-[200px]'
  }
  if (key === 'name') {
    return 'w-[150px]'
  }
  return ''
}

// Updated filter options with more accurate descriptions
const filters = [
  { value: 'all', label: 'All Pet Owners' },
  { value: 'recent', label: 'Added in Last 30 Days' },
  { value: 'hasPets', label: 'Has Registered Pets' },
  { value: 'noPets', label: 'No Registered Pets' }
]

// Add this new function to clear all filters and search
const clearFilters = () => {
  searchQuery.value = ''
  activeFilters.value = []
  currentPage.value = 1
}

// Fetch user sign-in data from Firebase Auth via API
const fetchUserSignInData = async () => {
  try {
    console.log('Fetching user sign-in data from API');
    const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';
    const response = await axios.get(`${API_URL}/api/auth/users-sign-in-data`);
    
    if (response.data && response.data.success) {
      console.log('User sign-in data received:', response.data.users);
      return response.data.users || [];
    } else {
      console.error('API returned unsuccessful response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching user sign-in data:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
}

// Fetch pet owners from Firestore
const fetchPetOwners = async () => {
  try {
    initialLoading.value = true // Use initialLoading instead of loading
    
    // Query users collection for pet owners (role is 'user')
    const usersRef = collection(db, 'users')
    const petOwnersQuery = query(usersRef, where('role', '==', 'user'))
    const querySnapshot = await getDocs(petOwnersQuery)
    
    // Get user sign-in data from Firebase Auth
    const userSignInData = await fetchUserSignInData();
    console.log('User sign-in data:', userSignInData);
    
    // Process query results
    const owners = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      const userId = doc.id
      const uid = data.uid // This is the Firebase UID stored in Firestore
      
      // Find sign-in data for this user if available
      const signInInfo = userSignInData.find(u => u.uid === uid);
      
      owners.push({
        userId: userId,
        ...data,
        // Add name field for sorting convenience
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        // Add last sign-in time if available
        lastSignInTime: signInInfo?.lastSignInTime || null,
        // Add provider data if
        providerData: signInInfo?.providerData || [],
        // Add created and updated timestamps
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null
      })
    })
    
    // Fetch pets for each owner
    for (const owner of owners) {
      const pets = await petsStore.fetchUserPets(owner.userId)
      if (pets && pets.length > 0) {
        owner.pets = pets
      }
    }
    
    petOwners.value = owners
    console.log(`Fetched ${owners.length} pet owners`)
  } catch (error) {
    console.error('Error fetching pet owners:', error)
    errorMessage.value = 'Failed to load pet owners. Please try again.'
    showErrorModal.value = true
  } finally {
    initialLoading.value = false // Set initialLoading to false when done
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Format last updated timestamp
const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Never'
  try {
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Update the formatAddress function to only return the street address
const formatAddress = (owner) => {
  return owner.streetAddress || 'Not set'
}

// Format pets for display - updated function
const formatPets = (pets) => {
  if (!pets) return 'No pets'
  
  // If pets is an array or object (JSON data)
  if (typeof pets === 'object') {
    try {
      // If it's an array of pet objects
      if (Array.isArray(pets)) {
        return pets.map(pet => {
          if (pet.name) {
            return `${pet.name}${pet.species ? ` (${pet.species})` : ''}`
          }
          return 'Unnamed pet'
        }).join(', ') || 'No pets'
      } 
      // If it's a single pet object
      else if (pets.name) {
        return `${pets.name}${pets.species ? ` (${pets.species})` : ''}`
      }
      // Fallback for other object structures
      return JSON.stringify(pets)
    } catch (error) {
      console.error('Error formatting pet data:', error)
      return 'Invalid pet data'
    }
  }
  
  // If pets is already a string
  return pets
}

// Format pets into an array for display
const formatPetsArray = (pets) => {
  if (!pets) return []
  
  // If pets is already an array
  if (Array.isArray(pets)) {
    return pets
  }
  
  // If pets is a string, try to parse it
  if (typeof pets === 'string') {
    try {
      // Try to parse as JSON
      return JSON.parse(pets)
    } catch (e) {
      // If not JSON, split by comma
      return pets.split(',').map(pet => {
        const match = pet.trim().match(/^(.*?)(?:\s*$$(.*?)$$)?$/)
        if (match) {
          return { name: match[1], species: match[2] || 'Pet' }
        }
        return { name: pet.trim(), species: 'Pet' }
      })
    }
  }
  
  // If pets is an object but not an array
  if (typeof pets === 'object') {
    return [pets]
  }
  
  return []
}

// Calculate completion percentage for filtering
const calculateCompletionPercentage = (owner) => {
  if (!owner) return 0
  
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 
    'gender', 'streetAddress', 'city', 'province', 'postalCode', 'country'
  ]
  
  let filledFields = 0
  requiredFields.forEach(field => {
    if (owner[field] && String(owner[field]).trim() !== '') {
      filledFields++
    }
  })
  
  return Math.round((filledFields / requiredFields.length) * 100)
}

// Updated toggle filter selection to handle the new filter values
const toggleFilter = (filter) => {
  if (filter.value === 'all') {
    activeFilters.value = []
  } else {
    const index = activeFilters.value.indexOf(filter.value)
    
    // If filter is not already active, add it
    if (index === -1) {
      // Handle mutually exclusive filters
      if (filter.value === 'hasPets') {
        // Remove "noPets" if it exists
        const noIndex = activeFilters.value.indexOf('noPets')
        if (noIndex !== -1) {
          activeFilters.value.splice(noIndex, 1)
        }
      } else if (filter.value === 'noPets') {
        // Remove "hasPets" if it exists
        const hasIndex = activeFilters.value.indexOf('hasPets')
        if (hasIndex !== -1) {
          activeFilters.value.splice(hasIndex, 1)
        }
      }
      
      activeFilters.value.push(filter.value)
    } else {
      activeFilters.value.splice(index, 1)
    }
  }
  
  showFilters.value = false
  currentPage.value = 1 // Reset to first page when filtering
}

// Toggle filters dropdown
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Updated filtered pet owners based on search and new filters
const filteredPetOwners = computed(() => {
  return petOwners.value.filter(owner => {
    // Search filtering
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      (owner.firstName || '').toLowerCase().includes(searchLower) ||
      (owner.lastName || '').toLowerCase().includes(searchLower) ||
      (owner.email || '').toLowerCase().includes(searchLower) ||
      (owner.phone || '').toLowerCase().includes(searchLower) ||
      (owner.city || '').toLowerCase().includes(searchLower) ||
      (owner.province || '').toLowerCase().includes(searchLower) ||
      (owner.pets || '').toString().toLowerCase().includes(searchLower)
    
    if (!matchesSearch) return false
    
    // No active filters
    if (activeFilters.value.length === 0) return true
    
    // Apply each filter - must match ALL selected filters
    return activeFilters.value.every(filter => {
      if (filter === 'recent') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // Check creation date if available, otherwise fall back to updated date
        const createdAt = owner.createdAt?.toDate?.() || new Date(owner.createdAt)
        return createdAt > thirtyDaysAgo
      } else if (filter === 'hasPets') {
        return owner.pets && (Array.isArray(owner.pets) ? owner.pets.length > 0 : String(owner.pets).trim() !== '')
      } else if (filter === 'noPets') {
        return !owner.pets || (Array.isArray(owner.pets) ? owner.pets.length === 0 : String(owner.pets).trim() === '')
      }
      return true
    })
  })
})

// Sorted pet owners based on current sort settings
const sortedPetOwners = computed(() => {
  return [...filteredPetOwners.value].sort((a, b) => {
    let aValue, bValue
    
    // Special handling for name column
    if (sortKey.value === 'name') {
      aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase()
      bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase()
    } else {
      aValue = a[sortKey.value]
      bValue = b[sortKey.value]
      
      // Handle null/undefined values
      if (aValue === undefined || aValue === null) aValue = ''
      if (bValue === undefined || bValue === null) bValue = ''
      
      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()
      
      // Handle date fields
      if (sortKey.value === 'dateOfBirth' || sortKey.value === 'updatedAt' || sortKey.value === 'createdAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }
    }
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

// Paginated pet owners for current page
const paginatedPetOwners = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedPetOwners.value.slice(start, end)
})

// Pagination information
const totalPages = computed(() => Math.ceil(filteredPetOwners.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredPetOwners.value.length))

// Sort by column
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Move to previous page
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Move to next page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Edit pet owner
const editPetOwner = async (owner) => {
  selectedOwnerId.value = owner.userId
  editForm.value = { ...owner }
  tempForm.value = { 
    dateOfBirth: owner.dateOfBirth || '',
    age: calculateAge(owner.dateOfBirth) || ''
  }
  showEditForm.value = true
  
  // Fetch pets for this owner
  ownerPets.value = await petsStore.fetchUserPets(owner.userId)
}

// Cancel editing
const cancelEdit = () => {
  showEditForm.value = false
  selectedOwnerId.value = null
  editForm.value = {}
  tempForm.value = {}
  ownerPets.value = []
  showCalendar.value = false
  isGenderOpen.value = false
}

// Save profile changes
const saveProfile = async () => {
  if (!selectedOwnerId.value) return;

  try {
    isSaving.value = true;
    
    // Create a data object with only the profile fields that should be updated
    let profileData = {
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      email: editForm.value.email,
      phone: editForm.value.phone,
      whatsapp: editForm.value.whatsapp,
      alternativeEmail: editForm.value.alternativeEmail,
      gender: editForm.value.gender,
      streetAddress: editForm.value.streetAddress,
      city: editForm.value.city,
      province: editForm.value.province,
      postalCode: editForm.value.postalCode,
      country: editForm.value.country,
      updatedAt: new Date()
    };
    
    // Only include username if it exists
    if (editForm.value.username) {
      profileData.username = editForm.value.username;
    }
    
    // Add date of birth from tempForm
    if (tempForm.value.dateOfBirth) {
      profileData.dateOfBirth = tempForm.value.dateOfBirth;
    }
    
    // Add age from tempForm
    if (tempForm.value.age) {
      profileData.age = tempForm.value.age;
    }
    
    // Filter out any undefined values
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === undefined) {
        delete profileData[key];
      }
    });
    
    console.log('Updating profile with data:', profileData);
    
    // Use the profileStore's updateUserProfile method instead of direct updateDoc
    const success = await profileStore.updateUserProfile(selectedOwnerId.value, profileData);
    
    if (success) {
      // Refresh the user data
      await fetchPetOwners();
      
      // Show success message
      const nameDisplay = `${editForm.value.firstName} ${editForm.value.lastName || ''}`.trim();
      statusMessage.value = `Pet owner ${nameDisplay} updated successfully`;
      showSuccessModal.value = true;
      
      // Close the form
      showEditForm.value = false;
      selectedOwnerId.value = null;
      editForm.value = {};
      tempForm.value = {};
      ownerPets.value = [];
    } else {
      throw new Error('Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating pet owner:', error);
    errorMessage.value = error.message || 'Failed to update pet owner information';
    showErrorModal.value = true;
  } finally {
    isSaving.value = false;
  }
};

// Export pet owners data to CSV
const exportToCSV = () => {
  const headers = ['Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Address', 'City', 'Province', 'Postal Code', 'Country', 'Pets', 'Last Updated']
  const rows = filteredPetOwners.value.map(owner => [
    `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
    owner.email || '',
    owner.phone || '',
    owner.dateOfBirth || '',
    owner.gender || '',
    owner.streetAddress || '',
    owner.city || '',
    owner.province || '',
    owner.postalCode || '',
    owner.country || '',
    formatPets(owner.pets) || '',
    formatLastUpdated(owner.updatedAt)
  ])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', 'pet_owners.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Calendar and Date functions
const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value && !isMobile.value) {
    nextTick(() => {
      const calendarElement = document.querySelector('.calendar-dropdown')
      if (calendarElement) {
        const { top, left, bottom, right } = getCalendarPosition()
        Object.assign(calendarElement.style, { top, left, bottom, right })
      }
    })
  }
}

const calculateAge = (birthDate) => {
  if (!birthDate) return null
  const today = new Date()
  const birthDateObj = new Date(birthDate)
  let age = today.getFullYear() - birthDateObj.getFullYear()
  const monthDiff = today.getMonth() - birthDateObj.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }
  return age
}

const handleCalendarChange = (newValue) => {
  tempForm.value.dateOfBirth = newValue
  tempForm.value.age = calculateAge(newValue)
  showCalendar.value = false
}

const handleCalendarCancel = () => {
  showCalendar.value = false
}

const handleDateInput = (event) => {
  const input = event.target
  const cursorPosition = input.selectionStart
  let value = input.value.replace(/[^0-9-]/g, '')
  
  const parts = value.split('-')
  while (parts.length < 3) {
    parts.push('')
  }
  value = parts.join('-')
  
  const maxLengths = [4, 2, 2]
  const newParts = value.split('-').map((part, index) => part.slice(0, maxLengths[index]))
  value = newParts.join('-')
  
  tempForm.value.dateOfBirth = value
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    tempForm.value.age = calculateAge(value)
  }
  
  nextTick(() => {
    input.selectionStart = input.selectionEnd = Math.min(cursorPosition, value.length)
  })
}

const validateDate = () => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (datePattern.test(tempForm.value.dateOfBirth)) {
    tempForm.value.age = calculateAge(tempForm.value.dateOfBirth)
  } else {
    tempForm.value.dateOfBirth = ''
  }
}

const handleAgeInput = (event) => {
  // Allow manual editing of age without recalculating from date of birth
  tempForm.value.age = event.target.value
}

const getCalendarPosition = () => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto',
      zIndex: 1000,
    }
  } else {
    const inputRect = dateInputRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const spaceBelow = windowHeight - inputRect.bottom
    const spaceAbove = inputRect.top
    
    if (spaceBelow >= 300 || spaceBelow > spaceAbove) {
      return {
        position: 'absolute',
        top: `${inputRect.height + 5}px`,
        left: '0',
        zIndex: 1000,
      }
    } else {
      return {
        position: 'absolute',
        bottom: `${inputRect.height + 5}px`,
        left: '0',
        zIndex: 1000,
      }
    }
  }
}

// Google Maps Address Autocomplete
const loadGoogleMapsAPI = () => {
  if (typeof google === 'undefined') {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      googleMapsLoaded = true
      console.log('Google Maps API loaded')
    }
    document.head.appendChild(script)
  } else {
    googleMapsLoaded = true
  }
}

const initializeAutocomplete = () => {
  if (!googleMapsLoaded) {
    console.warn('Google Maps API not loaded yet. Retrying in 1 second.')
    setTimeout(initializeAutocomplete, 1000)
    return
  }
  
  if (autocomplete) {
    return
  }
  
  const addressInput = document.getElementById('addressInput')
  if (addressInput) {
    autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['geocode'],
      componentRestrictions: { country: 'ph' }
    })
    
    autocomplete.addListener('place_changed', handlePlaceSelect)
    console.log('Autocomplete initialized')
  } else {
    console.warn('Address input not found')
  }
}

// Add this object for Oriental Mindoro postal codes lookup
const orientalMindoroPostalCodes = {
  'Baco': '5201',
  'Bansud': '5210',
  'Bongabong': '5211',
  'Bulalacao': '5214',
  'Calapan City': '5200',
  'Gloria': '5209',
  'Mansalay': '5212',
  'Naujan': '5204',
  'Pinamalayan': '5208',
  'Pola': '5206',
  'Puerto Galera': '5203',
  'Roxas': '5213',
  'San Teodoro': '5202',
  'Socorro': '5207',
  'Victoria': '5205'
};

// Modify the handlePlaceSelect function to include postal code lookup
const handlePlaceSelect = () => {
  const place = autocomplete.getPlace()
  if (!place.geometry) return
  
  let addressComponents = {
    street_number: '',
    route: '',
    sublocality_level_1: '',
    locality: '',
    administrative_area_level_2: '',
    administrative_area_level_1: '',
    country: '',
    postal_code: ''
  }
  
  for (const component of place.address_components) {
    const componentType = component.types[0]
    if (addressComponents.hasOwnProperty(componentType)) {
      addressComponents[componentType] = component.long_name
    }
  }
  
  editForm.value.streetAddress = `${addressComponents.street_number} ${addressComponents.route}`.trim()
  editForm.value.city = addressComponents.locality || addressComponents.sublocality_level_1 || addressComponents.administrative_area_level_2
  
  // Handle province with special case for MIMAROPA and Oriental Mindoro
  if (addressComponents.administrative_area_level_1 === 'MIMAROPA') {
    const orientalMindoroCities = Object.keys(orientalMindoroPostalCodes)
    if (orientalMindoroCities.includes(editForm.value.city)) {
      editForm.value.province = 'Oriental Mindoro'
    } else {
      editForm.value.province = 'MIMAROPA'
    }
  } else if (addressComponents.administrative_area_level_1 === 'Oriental Mindoro') {
    editForm.value.province = 'Oriental Mindoro'
  } else {
    editForm.value.province = addressComponents.administrative_area_level_1 || ''
  }
  
  editForm.value.country = addressComponents.country
  
  // Set postal code - first try from Google Maps data, then from our lookup table
  if (addressComponents.postal_code) {
    editForm.value.postalCode = addressComponents.postal_code
  } else {
    const city = editForm.value.city.trim()
    editForm.value.postalCode = orientalMindoroPostalCodes[city] || ''
  }
  
  if (!editForm.value.streetAddress) {
    editForm.value.streetAddress = place.formatted_address
  }
}

// Gender dropdown
const selectGender = (gender) => {
  editForm.value.gender = gender
  isGenderOpen.value = false
}

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 640
}

// Handle click outside
const handleClickOutside = (event) => {
  if (showCalendar.value && 
      !event.target.closest('.calendar-dropdown') && 
      !event.target.closest('.date-of-birth-input') &&
      (isMobile.value || !dateInputRef.value.contains(event.target))) {
    handleCalendarCancel()
  }
  
  // Gender dropdown logic
  if (isGenderOpen.value && !event.target.closest('.gender-dropdown')) {
    isGenderOpen.value = false
  }
}

// Handle escape key
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    if (showCalendar.value) {
      handleCalendarCancel()
    }
    if (isGenderOpen.value) {
      isGenderOpen.value = false
    }
  }
}

// Initialize component
onMounted(async () => {
  await fetchPetOwners()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeyDown)
  loadGoogleMapsAPI()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeyDown)
  if (autocomplete) {
    google.maps.event.clearInstanceListeners(autocomplete)
  }
})
</script>

<style scoped>
/* Ensure consistency with mobile displays */
@media (max-width: 640px) {
  input, select {
    font-size: 16px; /* Prevents zoom on focus in iOS */
  }
}

.date-of-birth-input {
  font-family: monospace;
}

/* Add this to ensure the dropdown appears above other elements */
.gender-dropdown {
  position: relative;
  z-index: 30;
}
</style>