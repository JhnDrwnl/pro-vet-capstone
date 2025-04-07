<!-- views/admin/datamanagement/Veterinarians.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Data Management</h1>
      <p class="text-gray-500 mt-1">Manage information about veterinarians.</p>
    </div>
  
    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="flex space-x-4 sm:space-x-8 mb-4 overflow-x-auto">
        <button
          @click="switchToOverview"
          :class="[
           'whitespace-nowrap py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full transition-colors',
            activeTab === 'overview'
              ? 'bg-[#EBF5FF] text-[#0066FF]'
              : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center space-x-1 sm:space-x-2">
            <ListIcon class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Overview</span>
          </div>
        </button>
        <button
          @click="activeTab = 'profile'"
          :class="[
            'whitespace-nowrap py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full transition-colors',
            activeTab === 'profile'
              ? 'bg-[#EBF5FF] text-[#0066FF]'
              : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center space-x-1 sm:space-x-2">
            <UserIcon class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Profile</span>
          </div>
        </button>
      </nav>
    </div>
  
    <!-- Overview Tab Content -->
    <div v-if="activeTab === 'overview'">
      <!-- Search, Filter, Add, and Export -->
      <div v-if="!showForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="flex gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search veterinarians..."
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
                :key="filter"
                @click="toggleFilter(filter)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                :class="{
                  'text-blue-600': filter === 'All Veterinarians' ? activeFilters.length === 0 : activeFilters.includes(filter)
                }"
              >
                {{ filter }}
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
  
      <!-- Loading State -->
      <div v-if="initialLoading" class="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p class="mt-4 text-gray-500">Loading veterinarians...</p>
      </div>
  
      <!-- Table -->
      <div v-else-if="!showForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b border-gray-200">
              <!-- Non-sortable Profile Picture column -->
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Profile
              </th>
              <!-- Sortable columns -->
              <th 
                v-for="header in veterinarianHeaders" 
                :key="header.key" 
                @click="sortBy(header.key)"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  {{ header.label }}
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'asc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'desc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <!-- Actions column without sorting -->
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="veterinarian in paginatedVeterinarians" 
              :key="veterinarian.id || veterinarian.userId"
              class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
            >
              <td class="py-4 px-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 mr-3">
                    <img :src="veterinarian.photoURL || '/placeholder.svg?height=40&width=40'" 
                         :alt="`${veterinarian.firstName} ${veterinarian.lastName}`"
                         class="h-10 w-10 rounded-full object-cover" />
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ `${veterinarian.firstName} ${veterinarian.lastName}` }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.email }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.phone || 'Not set' }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.specialty || 'General' }}</td>
              <td class="py-4 px-6 text-sm text-gray-900">{{ veterinarian.experience || '0' }}</td>
              <td class="py-4 px-6">
                <div class="flex gap-2">
                  <button 
                    @click="viewVeterinarianProfile(veterinarian)"
                    class="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button 
                    @click="editVeterinarian(veterinarian)" 
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <LucideEdit class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            
            <!-- Empty state with icon placeholder -->
            <tr v-if="paginatedVeterinarians.length === 0">
              <td colspan="7" class="py-8 text-center">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Stethoscope class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-gray-500 font-medium">No veterinarians found</p>
                  <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination - Responsive -->
      <div v-if="!showForm && !initialLoading && sortedVeterinarians.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
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
  
      <!-- Inline Add/Edit Veterinarian Form -->
      <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">{{ editingVeterinarian ? 'Edit Veterinarian' : 'Add New Veterinarian' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                v-model="veterinarianForm.firstName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                v-model="veterinarianForm.lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
          </div>
  
          <!-- Contact Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                v-model="veterinarianForm.email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                v-model="veterinarianForm.phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
          </div>
  
          <!-- Professional Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                type="text"
                v-model="veterinarianForm.specialty"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                v-model="veterinarianForm.experience"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
          </div>
  
          <!-- Professional Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
            <input
              type="text"
              v-model="veterinarianForm.title"
              placeholder="DVM, PhD, etc."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
  
          <!-- Address & Bio -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                v-model="veterinarianForm.address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                v-model="veterinarianForm.city"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
          </div>
  
          <!-- Additional Details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Mode</label>
              <input
                type="text"
                v-model="veterinarianForm.consultationMode"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <!-- Replace the text input with a schedule selector component -->
              <div class="space-y-2">
                <div class="grid grid-cols-7 gap-1">
                  <div 
                    v-for="(day, index) in weekDays" 
                    :key="day"
                    @click="toggleWorkDay(index)"
                    class="text-center text-xs cursor-pointer rounded-md py-1"
                    :class="workDays[index] ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ day.charAt(0) }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 mb-1">Start Time</label>
                    <select 
                      v-model="scheduleStartTime" 
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                    >
                      <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
                    </select>
                  </div>
                  <div class="flex-none pt-4">to</div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 mb-1">End Time</label>
                    <select 
                      v-model="scheduleEndTime" 
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                    >
                      <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
                    </select>
                  </div>
                </div>
                <p class="text-xs text-gray-500">Current schedule: {{ formattedSchedule }}</p>
              </div>
            </div>
          </div>
  
          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              v-model="veterinarianForm.bio"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            ></textarea>
          </div>
  
          <!-- Education -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <textarea
              v-model="veterinarianForm.education"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="List education, qualifications, etc."
            ></textarea>
          </div>
  
          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              @click="closeForm"
              class="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-3 py-1.5 sm:px-4 sm:py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2 text-xs sm:text-sm"
            >
              {{ editingVeterinarian ? 'Save Changes' : 'Add Veterinarian' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  
    <!-- Profile Tab Content -->
    <div v-if="activeTab === 'profile'" class="bg-white rounded-lg border border-gray-200">
      <div v-if="selectedVeterinarian" class="bg-white rounded-2xl overflow-hidden">
        <!-- Header with gradient background -->
        <div class="bg-blue-300 h-32 relative">
          <div class="absolute -bottom-16 left-8">
            <div class="relative">
              <img 
                :src="selectedVeterinarian.photoURL || '/placeholder.svg?height=200&width=200'" 
                :alt="`${selectedVeterinarian.firstName} ${selectedVeterinarian.lastName}`"
                class="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg" 
              />
            </div>
          </div>
        </div>
        
        <!-- Main content -->
        <div class="pt-20 px-6 pb-6">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ `${selectedVeterinarian.firstName} ${selectedVeterinarian.lastName}` }}</h2>
              <p class="text-lg text-blue-600 font-medium flex items-center gap-2">
                <Award class="w-5 h-5" />
                {{ selectedVeterinarian.title || 'DVM' }}
              </p>
            </div>
          </div>
          
          <!-- Bio Section -->
          <div v-if="selectedVeterinarian.bio" class="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 class="text-gray-700 font-medium mb-3">About</h3>
            <p class="text-gray-600 leading-relaxed">{{ selectedVeterinarian.bio }}</p>
          </div>
          
          <!-- Info cards grid -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                <Stethoscope class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium">Specialization</h3>
                <p class="text-gray-900 font-medium">{{ selectedVeterinarian.specialty || 'General Practice' }}</p>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                <Clock class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium">Years of Experience</h3>
                <p class="text-gray-900 font-medium">{{ selectedVeterinarian.experience || '0' }}+ years</p>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                <Video class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium">Consultation Mode</h3>
                <p class="text-gray-900 font-medium">{{ selectedVeterinarian.consultationMode || 'In-Clinic / Telehealth' }}</p>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-4 flex items-start gap-3 transition-all hover:shadow-md">
              <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                <CalendarDays class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-gray-500 text-sm font-medium">Schedule</h3>
                <p class="text-gray-900 font-medium">{{ selectedVeterinarian.schedule || 'Mon-Fri, 9AM-5PM' }}</p>
              </div>
            </div>
          </div>
  
          <!-- Education Section -->
          <div v-if="selectedVeterinarian.education" class="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 class="text-gray-700 font-medium mb-4 flex items-center gap-2">
              <GraduationCap class="w-5 h-5 text-blue-600" />
              Education & Qualifications
            </h3>
            <div class="whitespace-pre-line text-gray-600">{{ selectedVeterinarian.education }}</div>
          </div>
          
          <!-- Address Information -->
          <div v-if="selectedVeterinarian.address || selectedVeterinarian.city" class="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 class="text-gray-700 font-medium mb-4 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-blue-600" />
              Location
            </h3>
            <div class="space-y-1">
              <p v-if="selectedVeterinarian.address" class="text-gray-900">{{ selectedVeterinarian.address }}</p>
              <p v-if="selectedVeterinarian.city" class="text-gray-900">{{ selectedVeterinarian.city }}</p>
            </div>
          </div>
          
          <!-- Contact information -->
          <div class="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 class="text-gray-700 font-medium mb-4 flex items-center gap-2">
              <ContactIcon class="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                  <Mail class="w-5 h-5" />
                </div>
                <p class="text-gray-900">{{ selectedVeterinarian.email }}</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                  <Phone class="w-5 h-5" />
                </div>
                <p class="text-gray-900">{{ selectedVeterinarian.phone || 'Not provided' }}</p>
              </div>
            </div>
          </div>
  
          <!-- Account Information -->
          <div class="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 class="text-gray-700 font-medium mb-4 flex items-center gap-2">
              <UserCog class="w-5 h-5 text-blue-600" />
              Account Information
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">User ID</span>
                <span class="text-gray-900 font-mono text-sm">{{ selectedVeterinarian.userId }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Role</span>
                <span class="text-gray-900">{{ selectedVeterinarian.role || 'veterinary' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Account Created</span>
                <span class="text-gray-900">{{ formatDate(selectedVeterinarian.createdAt) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Last Updated</span>
                <span class="text-gray-900">{{ formatDate(selectedVeterinarian.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Empty state -->
      <div v-else class="p-6 text-center">
        <div class="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <UserIcon class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="mt-6 text-xl font-medium text-gray-900">No Veterinarian Selected</h3>
        <p class="mt-2 text-gray-500 max-w-md mx-auto">Select a veterinarian from the overview to view their detailed profile.</p>
        <button 
          @click="switchToOverview"
          class="mt-6 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 inline-flex items-center gap-2"
        >
          <ArrowLeft class="w-4 h-4" />
          Go to Overview
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
  
  <!-- Loading Spinner Overlay - Show for operations -->
  <LoadingSpinner v-if="isLoading" isOverlay text="Processing..." />
</template>
  
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Edit as LucideEdit,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  User as UserIcon,
  Award,
  Stethoscope,
  Clock,
  Video,
  CalendarDays,
  Contact as ContactIcon,
  Mail,
  Phone,
  CircleUser,
  ArrowLeft,
  Eye as EyeIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  GraduationCap,
  MapPin,
  UserCog
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { doc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { useProfileStore } from '@/stores/modules/profileStore'
  
// State management
const activeTab = ref('overview')
const selectedVeterinarian = ref(null)
const veterinarians = ref([])
const isLoading = ref(false)
const initialLoading = ref(true)
const profileStore = useProfileStore()
  
// Table headers for sorting
const veterinarianHeaders = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'experience', label: 'Experience (Years)' }
]
  
// Sorting state
const sortKey = ref('name')
const sortOrder = ref('asc')
  
// Pagination
const currentPage = ref(1)
const itemsPerPage = 10
  
// Status message and modals
const statusMessage = ref('')
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
  
// Form state
const searchQuery = ref('')
const showForm = ref(false)
const showFilters = ref(false)
const editingVeterinarian = ref(null)
const veterinarianForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialty: '',
  experience: 0,
  title: 'DVM',
  status: 'Offline',
  consultationMode: 'In-Clinic / Telehealth',
  schedule: 'Mon-Fri, 9AM-5PM',
  bio: '',
  education: '',
  address: '',
  city: ''
})

// Schedule selector state
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const workDays = ref([true, true, true, true, true, false, false]) // Mon-Fri by default
const scheduleStartTime = ref('9:00 AM')
const scheduleEndTime = ref('5:00 PM')
const timeOptions = [
  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', 
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
]

// Computed property for formatted schedule
const formattedSchedule = computed(() => {
  const days = workDays.value.map((isWorking, index) => isWorking ? weekDays[index].substring(0, 3) : null)
    .filter(day => day !== null)
  
  if (days.length === 0) return 'No working days selected'
  
  let schedule = ''
  let startDay = days[0]
  let currentGroup = [startDay]
  
  for (let i = 1; i < days.length; i++) {
    const prevDayIndex = weekDays.findIndex(d => d.substring(0, 3) === days[i-1])
    const currDayIndex = weekDays.findIndex(d => d.substring(0, 3) === days[i])
    
    if (currDayIndex - prevDayIndex === 1) {
      currentGroup.push(days[i])
    } else {
      if (currentGroup.length > 2) {
        schedule += `${currentGroup[0]}-${currentGroup[currentGroup.length-1]}, `
      } else {
        schedule += currentGroup.join(', ') + ', '
      }
      currentGroup = [days[i]]
    }
  }
  
  if (currentGroup.length > 2) {
    schedule += `${currentGroup[0]}-${currentGroup[currentGroup.length-1]}`
  } else {
    schedule += currentGroup.join(', ')
  }
  
  return `${schedule}, ${scheduleStartTime.value} to ${scheduleEndTime.value}`
})

// Toggle work day
const toggleWorkDay = (index) => {
  workDays.value[index] = !workDays.value[index]
  veterinarianForm.value.schedule = formattedSchedule.value
}

// Watch for schedule changes
watch([scheduleStartTime, scheduleEndTime, workDays], () => {
  veterinarianForm.value.schedule = formattedSchedule.value
}, { deep: true })
  
const filters = ['All Veterinarians', 'Experienced (5+ years)', 'Newly Joined']
const activeFilters = ref([])
  
// Fetch veterinarians from Firestore
const fetchVeterinarians = async () => {
  try {
    isLoading.value = true
    initialLoading.value = true
    
    // Query users collection for veterinarians (using role 'veterinary' based on your UserManagement component)
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'veterinary'))
    const querySnapshot = await getDocs(q)
    
    const vets = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      vets.push({
        ...userData,
        userId: doc.id,
        // Add name field for sorting convenience
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      })
    })
    
    // If no veterinarians found, add some sample data for testing
    if (vets.length === 0) {
      // Use the current profile data as a base if available
      if (profileStore.profile) {
        const profile = profileStore.profile
        vets.push({
          userId: 'sample1',
          firstName: profile.firstName || 'John',
          lastName: profile.lastName || 'Doe',
          email: profile.email || 'john.doe@example.com',
          phone: profile.phone || '555-123-4567',
          photoURL: profile.photoURL || null,
          specialty: 'Small Animal Medicine',
          experience: 5,
          status: 'Available',
          title: 'DVM',
          role: 'veterinary',
          consultationMode: 'In-Clinic / Telehealth',
          schedule: 'Mon-Fri, 9AM-5PM',
          bio: 'Experienced veterinarian specializing in small animal medicine with a passion for preventative care.',
          education: 'University of Veterinary Sciences, DVM (2015)\nCertified in Veterinary Acupuncture (2018)',
          address: '123 Animal Care Lane',
          city: 'San Francisco, CA',
          createdAt: new Date('2022-01-15'),
          updatedAt: new Date('2023-06-10')
        })
      } else {
        // Add sample data if no profile exists
        vets.push({
          userId: 'sample1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          photoURL: null,
          specialty: 'Small Animal Medicine',
          experience: 5,
          status: 'Available',
          title: 'DVM',
          role: 'veterinary',
          consultationMode: 'In-Clinic / Telehealth',
          schedule: 'Mon-Fri, 9AM-5PM',
          bio: 'Experienced veterinarian specializing in small animal medicine with a passion for preventative care.',
          education: 'University of Veterinary Sciences, DVM (2015)\nCertified in Veterinary Acupuncture (2018)',
          address: '123 Animal Care Lane',
          city: 'San Francisco, CA',
          createdAt: new Date('2022-01-15'),
          updatedAt: new Date('2023-06-10')
        })
      }
    }
    
    veterinarians.value = vets
    console.log(`Fetched ${vets.length} veterinarians`)
    
  } catch (error) {
    console.error('Error fetching veterinarians:', error)
    statusMessage.value = 'Failed to load veterinarians. Please try again.'
    showErrorModal.value = true
  } finally {
    isLoading.value = false
    initialLoading.value = false
  }
}
  
// Filtered veterinarians based on search and filters
const filteredVeterinarians = computed(() => {
  return veterinarians.value.filter(veterinarian => {
    const searchLower = searchQuery.value.toLowerCase()
    const fullName = `${veterinarian.firstName} ${veterinarian.lastName}`.toLowerCase()
    
    const matchesSearch = 
      fullName.includes(searchLower) ||
      (veterinarian.email || '').toLowerCase().includes(searchLower) ||
      (veterinarian.phone || '').toLowerCase().includes(searchLower) ||
      (veterinarian.specialty || '').toLowerCase().includes(searchLower) ||
      (veterinarian.bio || '').toLowerCase().includes(searchLower) ||
      (veterinarian.address || '').toLowerCase().includes(searchLower) ||
      (veterinarian.city || '').toLowerCase().includes(searchLower)
  
    // If no filters are active, only apply search
    if (activeFilters.value.length === 0) {
      return matchesSearch
    }
  
    // Check if veterinarian matches all active filters
    const matchesFilters = activeFilters.value.every(filter => {
      switch(filter) {
        case 'Experienced (5+ years)':
          return parseInt(veterinarian.experience || 0) >= 5
        case 'Newly Joined':
          return parseInt(veterinarian.experience || 0) < 1
        default:
          return true
      }
    })
  
    return matchesSearch && matchesFilters
  })
})
  
// Sorted veterinarians
const sortedVeterinarians = computed(() => {
  return [...filteredVeterinarians.value].sort((a, b) => {
    let aValue, bValue
    
    if (sortKey.value === 'name') {
      aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim()
      bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim()
    } else {
      aValue = a[sortKey.value]
      bValue = b[sortKey.value]
    }
    
    // Handle null/undefined values
    if (aValue === undefined || aValue === null) aValue = ''
    if (bValue === undefined || bValue === null) bValue = ''
    
    // Convert to lowercase for string comparison
    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})
  
// Pagination computed properties
const totalItems = computed(() => filteredVeterinarians.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value))
  
// Paginated veterinarians
const paginatedVeterinarians = computed(() => {
  return sortedVeterinarians.value.slice(startIndex.value, endIndex.value)
})
  
// Pagination methods
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
  
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
  
// Format date for display
const formatDate = (date) => {
  if (!date) return 'Not available'
  
  try {
    // Handle Firebase Timestamp or JS Date
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}
  
// Add a function to switch to overview tab and clear selected veterinarian
const switchToOverview = () => {
  activeTab.value = 'overview'
  selectedVeterinarian.value = null
}
  
// Toggle filters dropdown
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}
  
const toggleFilter = (filter) => {
  // If "All Veterinarians" is selected, clear all filters
  if (filter === 'All Veterinarians') {
    activeFilters.value = []
    showFilters.value = false
    return
  }
  
  const index = activeFilters.value.indexOf(filter)
  
  // If filter is not already active, add it
  if (index === -1) {
    // Handle conflicting filters
    if (filter === 'Experienced (5+ years)') {
      // Remove "Newly Joined" if it exists
      const newlyJoinedIndex = activeFilters.value.indexOf('Newly Joined')
      if (newlyJoinedIndex !== -1) {
        activeFilters.value.splice(newlyJoinedIndex, 1)
      }
    } else if (filter === 'Newly Joined') {
      // Remove "Experienced (5+ years)" if it exists
      const experiencedIndex = activeFilters.value.indexOf('Experienced (5+ years)')
      if (experiencedIndex !== -1) {
        activeFilters.value.splice(experiencedIndex, 1)
      }
    }
    
    // Add the new filter
    activeFilters.value.push(filter)
  } else {
    // Remove the filter if it's already active
    activeFilters.value.splice(index, 1)
  }
  
  // Hide the filter dropdown after selection
  showFilters.value = false
}
  
// Sort by column
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}
  
// View veterinarian profile
const viewVeterinarianProfile = (veterinarian) => {
  selectedVeterinarian.value = veterinarian
  activeTab.value = 'profile'
}
  
// Edit veterinarian
const editVeterinarian = (veterinarian) => {
  editingVeterinarian.value = veterinarian
  veterinarianForm.value = { 
    firstName: veterinarian.firstName || '',
    lastName: veterinarian.lastName || '',
    email: veterinarian.email || '',
    phone: veterinarian.phone || '',
    specialty: veterinarian.specialty || '',
    experience: veterinarian.experience || 0,
    title: veterinarian.title || 'DVM',
    status: veterinarian.status || 'Offline',
    consultationMode: veterinarian.consultationMode || 'In-Clinic / Telehealth',
    schedule: veterinarian.schedule || 'Mon-Fri, 9AM-5PM',
    bio: veterinarian.bio || '',
    education: veterinarian.education || '',
    address: veterinarian.address || '',
    city: veterinarian.city || ''
  }
  
  // Parse the schedule to set the workDays, scheduleStartTime and scheduleEndTime
  try {
    const schedule = veterinarian.schedule || 'Mon-Fri, 9AM-5PM'
    
    // Reset workdays
    workDays.value = [false, false, false, false, false, false, false]
    
    // Parse days
    const parts = schedule.split(',')
    const timePart = parts[parts.length - 1].trim()
    
    // Parse time
    const timeParts = timePart.split('to').map(t => t.trim())
    if (timeParts.length === 2) {
      const startTime = timeParts[0]
      const endTime = timeParts[1]
      
      if (timeOptions.includes(startTime)) {
        scheduleStartTime.value = startTime
      }
      
      if (timeOptions.includes(endTime)) {
        scheduleEndTime.value = endTime
      }
    }
    
    // Parse days
    const dayParts = parts.slice(0, -1)
    dayParts.forEach(dayPart => {
      dayPart = dayPart.trim()
      
      if (dayPart.includes('-')) {
        // Range of days
        const [start, end] = dayPart.split('-').map(d => d.trim())
        const startIndex = weekDays.findIndex(d => d.substring(0, 3) === start)
        const endIndex = weekDays.findIndex(d => d.substring(0, 3) === end)
        
        if (startIndex !== -1 && endIndex !== -1) {
          for (let i = startIndex; i <= endIndex; i++) {
            workDays.value[i] = true
          }
        }
      } else {
        // Single day
        const dayIndex = weekDays.findIndex(d => d.substring(0, 3) === dayPart)
        if (dayIndex !== -1) {
          workDays.value[dayIndex] = true
        }
      }
    })
  } catch (error) {
    console.error('Error parsing schedule:', error)
    // Default to Mon-Fri if parsing fails
    workDays.value = [true, true, true, true, true, false, false]
    scheduleStartTime.value = '9:00 AM'
    scheduleEndTime.value = '5:00 PM'
  }
  
  showForm.value = true
}
  
// Close form
const closeForm = () => {
  showForm.value = false
  editingVeterinarian.value = null
  veterinarianForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    experience: 0,
    title: 'DVM',
    status: 'Offline',
    consultationMode: 'In-Clinic / Telehealth',
    schedule: 'Mon-Fri, 9AM-5PM',
    bio: '',
    education: '',
    address: '',
    city: ''
  }
  
  // Reset schedule selector
  workDays.value = [true, true, true, true, true, false, false]
  scheduleStartTime.value = '9:00 AM'
  scheduleEndTime.value = '5:00 PM'
}
  
// Handle form submission
const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    if (editingVeterinarian.value) {
      // Create update data
      const updateData = {
        firstName: veterinarianForm.value.firstName,
        lastName: veterinarianForm.value.lastName,
        email: veterinarianForm.value.email,
        phone: veterinarianForm.value.phone,
        specialty: veterinarianForm.value.specialty,
        experience: veterinarianForm.value.experience,
        title: veterinarianForm.value.title,
        status: veterinarianForm.value.status,
        consultationMode: veterinarianForm.value.consultationMode,
        schedule: veterinarianForm.value.schedule,
        bio: veterinarianForm.value.bio,
        education: veterinarianForm.value.education,
        address: veterinarianForm.value.address,
        city: veterinarianForm.value.city,
        updatedAt: new Date()
      }
      
      // Update in Firestore if it's a real user
      if (editingVeterinarian.value.userId) {
        const userRef = doc(db, 'users', editingVeterinarian.value.userId)
        await updateDoc(userRef, updateData)
        
        // If this is the current user's profile, update the profile store
        if (profileStore.profile && profileStore.profile.uid === editingVeterinarian.value.userId) {
          await profileStore.updateUserProfile(editingVeterinarian.value.userId, updateData)
        }
      }
      
      // Update in local state
      const index = veterinarians.value.findIndex(v => 
        v.userId === editingVeterinarian.value.userId
      )
      
      if (index !== -1) {
        veterinarians.value[index] = {
          ...veterinarians.value[index],
          ...updateData,
          name: `${updateData.firstName} ${updateData.lastName}`.trim()
        }
      }
      
      statusMessage.value = `Veterinarian "${updateData.firstName} ${updateData.lastName}" updated successfully`
      showSuccessModal.value = true
      
      // If this is the selected veterinarian, update that too
      if (selectedVeterinarian.value && selectedVeterinarian.value.userId === editingVeterinarian.value.userId) {
        selectedVeterinarian.value = {
          ...selectedVeterinarian.value,
          ...updateData
        }
      }
    }
    
    closeForm()
  } catch (error) {
    console.error('Error saving veterinarian:', error)
    statusMessage.value = `Failed to save: ${error.message}`
    showErrorModal.value = true
  } finally {
    isLoading.value = false
  }
}
  
// Export to CSV
const exportToCSV = () => {
  const headers = ['Name', 'Email', 'Phone', 'Specialty', 'Experience (Years)', 'Title', 'Status', 'Address', 'City']
  const csvContent = [
    headers.join(','),
    ...filteredVeterinarians.value.map(veterinarian =>
      [
        `${veterinarian.firstName || ''} ${veterinarian.lastName || ''}`.trim(),
        veterinarian.email || '',
        veterinarian.phone || '',
        veterinarian.specialty || '',
        veterinarian.experience || 0,
        veterinarian.title || '',
        veterinarian.status || '',
        veterinarian.address || '',
        veterinarian.city || ''
      ].map(field => `"${field}"`).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'veterinarians.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
  
// Watch for tab changes to clear selected veterinarian when switching to overview
watch(activeTab, (newTab) => {
  if (newTab === 'overview') {
    selectedVeterinarian.value = null
  }
})
  
// Initialize component
onMounted(async () => {
  await fetchVeterinarians()
})
</script>