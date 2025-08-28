<template>
<div class="bg-white p-6 rounded-2xl">
<!-- Header Section -->
<div class="mb-6">
  <h2 class="text-2xl font-medium text-gray-900">Appointment Approval</h2>
  <p class="text-gray-500 mt-1">Manage and approve veterinary appointments.</p>
</div>

<!-- Search and Actions -->
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
  <div class="flex items-center gap-2 w-full sm:w-auto">
    <div class="relative flex-1 sm:flex-none">
      <input 
        v-model="search" 
        class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
        placeholder="Search appointments..."
      />
      <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
    </div>
    <div class="relative">
      <button 
        @click="toggleFilters"
        class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <FilterIcon class="w-5 h-5 text-gray-500" />
      </button>
      <!-- Filter Dropdown - Status Only (works together with category filter) -->
      <div v-if="showFilters" class="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
        <div class="px-4 py-2 text-sm font-medium text-gray-700">Filter by Status:</div>
        <button 
          @click="toggleStatusFilter('All')"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          :class="{ 'text-[#0066FF]': filters.status === '' }"
        >
          All Statuses
        </button>
        <button 
          v-for="status in ['pending', 'approved', 'completed', 'cancelled', 'ended', 'expired', 'consider_rescheduling']" 
          :key="status"
          @click="toggleStatusFilter(status)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 capitalize"
          :class="{ 'text-[#0066FF]': filters.status === status }"
        >
          {{ status === 'consider_rescheduling' ? 'Consider Rescheduling' : status }}
        </button>
      </div>
    </div>
  </div>
  <div class="flex justify-end gap-2 w-full sm:w-auto">
    <!-- Bulk Actions -->
    <div v-if="selectedAppointments.size > 0" class="flex items-center gap-2">
      <span class="text-sm text-gray-600">{{ selectedAppointments.size }} selected</span>
      <button 
        @click="showBulkActionModal = true; bulkActionType = 'approve'"
        class="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs"
      >
        <CheckIcon class="w-3 h-3" />
        Approve All
      </button>
      <button 
        @click="showBulkActionModal = true; bulkActionType = 'reject'"
        class="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
      >
        <XIcon class="w-3 h-3" />
        Reject All
      </button>
      <button 
        @click="clearSelection"
        class="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-full hover:bg-gray-600 text-xs"
      >
        <XIcon class="w-3 h-3" />
        Clear
      </button>
    </div>
    
    <button 
      @click="exportToCSV"
      class="flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs sm:text-sm w-auto"
    >
      <DownloadIcon class="w-3 h-3 sm:w-4 sm:h-4" />
      Export CSV
    </button>

    <!-- Refresh Button -->
    <button
      @click="handleRefresh"
      :disabled="isLoading || initialLoading"
      class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCwIcon class="w-4 h-4 text-gray-500" />
    </button>
    

  </div>
</div>

<!-- Status Category Bar -->
<div class="mb-4">
  <div class="flex flex-wrap gap-2">
    <button
      v-for="cat in statusCategories"
      :key="cat.key === '' ? 'all' : cat.key"
      @click="toggleStatusFilter(cat.key === '' ? 'All' : cat.key)"
      class="px-3 py-1.5 rounded-full border text-xs sm:text-sm transition-colors"
      :class="[
        (filters.status === cat.key || (cat.key === '' && filters.status === ''))
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      ]"
      :title="`Show ${cat.label} appointments`"
    >
      <span>{{ cat.label }}</span>
      <span class="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px]"
            :class="(filters.status === cat.key || (cat.key === '' && filters.status === '')) ? 'bg-white/20' : 'bg-gray-100 text-gray-700'">
        {{ cat.count }}
      </span>
    </button>
  </div>
</div>

<!-- Active Filters Display -->
<div v-if="filters.status || categoryFilter !== 'all'" class="mb-4 flex flex-wrap gap-2">
  <div class="text-sm text-gray-500 py-1">Active filters (combined):</div>
  
  <!-- Status Filter -->
  <div v-if="filters.status" class="inline-flex items-center gap-1 px-3 py-1 bg-[#EBF5FF] text-[#0066FF] rounded-full text-xs capitalize">
    <span>{{ filters.status }}</span>
    <button @click="clearStatusFilterOnly" class="text-[#0066FF] hover:text-blue-700">
      <XIcon class="w-3 h-3" />
    </button>
  </div>
  
  <!-- Category Filter -->
  <div v-if="categoryFilter !== 'all'" class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
    <span>{{ getCategoryName(categoryFilter) }}</span>
    <button @click="clearCategoryFilterOnly" class="text-green-700 hover:text-blue-800">
      <XIcon class="w-3 h-3" />
    </button>
  </div>
  
  <!-- Clear All Filters Button -->
  <div v-if="filters.status && categoryFilter !== 'all'" class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200">
    <button @click="clearAllFilters" class="flex items-center gap-1">
      <span>Clear All</span>
      <XIcon class="w-3 h-3" />
    </button>
  </div>
</div>

<!-- Category Filter - Works together with status filter -->
<div class="mb-4 flex items-center gap-3">
  <label class="text-sm font-medium text-gray-700">Filter by Category:</label>
      <select 
      v-model="categoryFilter" 
      @change="setCategoryFilter"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option value="all">All Categories</option>
      <option 
        v-for="category in availableCategories" 
        :key="category.id" 
        :value="category.id"
      >
        {{ category.name }}
      </option>
    </select>
  <button
    v-if="categoryFilter !== 'all'"
    @click="clearCategoryFilterOnly"
    class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
  >
    Clear
  </button>
</div>



<!-- Appointment Cards -->
<div v-if="!initialLoading && !showApprovalForm" class="space-y-4">
  <!-- Bulk Selection Header -->
  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div class="flex items-center gap-3">
      <input 
        type="checkbox" 
        :checked="isAllSelected"
        @change="toggleAllSelection"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
      <span class="text-sm font-medium text-gray-700">Select All Appointments</span>
    </div>
    
    <!-- Sort Dropdown -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">Sort by:</span>
      <select 
        v-model="sortKey" 
        @change="sortOrder = 'asc'"
        class="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
      >
        <option value="date">Date</option>
        <option value="ownerName">Owner</option>
        <option value="status">Status</option>
        <option value="createdAt">Created</option>
      </select>
      <button 
        @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
        class="p-1 hover:bg-gray-200 rounded"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Appointment Cards -->
  <div class="grid gap-4">
          <div v-for="appointment in paginatedAppointments" :key="appointment.id" 
           :id="`appt-${appointment.id}`"
           :data-appointment-id="appointment.id"
           class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      
      <!-- Card Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <input 
            type="checkbox" 
            :checked="selectedAppointments.has(appointment.id)"
            @change="toggleAppointmentSelection(appointment.id)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <img 
                v-if="appointment.ownerPhotoURL"
                :src="appointment.ownerPhotoURL" 
                :alt="appointment.ownerName"
                class="w-full h-full object-cover" 
                @error="onImageError"
              />
              <UserIcon v-else class="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ appointment.ownerName || 'Unknown Owner' }}</div>
              <div class="text-sm text-gray-500">{{ appointment.ownerEmail || 'No email' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Status Badge -->
        <div class="flex items-center gap-2">
          <span 
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="{
              'bg-yellow-100 text-yellow-800': appointment.status === 'pending',
              'bg-green-100 text-green-800': appointment.status === 'approved',
              'bg-red-100 text-red-800': appointment.status === 'rejected',
              'bg-blue-100 text-blue-800': appointment.status === 'completed',
              'bg-gray-100 text-gray-800': appointment.status === 'cancelled',
              'bg-slate-100 text-slate-800': appointment.status === 'ended',
              'bg-orange-100 text-orange-800': appointment.status === 'consider_rescheduling',
              'bg-red-50 text-red-700 border border-red-200': isExpired(appointment)
            }"
          >
            {{ isExpired(appointment) ? 'Expired' : formatStatus(appointment.status) }}
          </span>
          <span v-if="isExpired(appointment)" class="text-xs text-red-500">Past scheduled time</span>
          <span v-if="appointment.rescheduleRequest" class="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200">
            Reschedule Requested
          </span>
        </div>
      </div>
      
      <!-- Card Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Appointment Details -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <CalendarIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600">{{ formatDate(appointment.date) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <ClockIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600">{{ appointment.time || 'No time set' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <PawPrintIcon class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600">
              {{ getPetDisplayName(appointment) }}
              <span v-if="appointment.petSpecies" class="text-gray-400">({{ appointment.petSpecies }})</span>
            </span>
          </div>
        </div>
        
        <!-- Services -->
        <div>
          <div class="text-sm font-medium text-gray-700 mb-2">Services</div>
          <div class="flex flex-wrap gap-1">
            <div 
              v-for="(serviceId, index) in appointment.services" 
              :key="index"
              class="flex flex-col items-start"
            >
              <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md mb-1">
                {{ getServiceDisplayName(serviceId) }}
            </span>
              <span 
                v-if="getServiceCategory(serviceId)"
                class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded text-center"
                :title="getServiceCategory(serviceId)?.description"
              >
                {{ getServiceCategory(serviceId)?.name }}
              </span>

            </div>
          </div>
        </div>
      </div>
      
      <!-- Card Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="text-xs text-gray-500">
          Created: {{ formatDateTime(appointment.createdAt) }}
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <!-- Request Reschedule button - for pending, approved, expired, or consider_rescheduling appointments -->
          <button 
            v-if="appointment.status === 'pending' || appointment.status === 'approved' || appointment.status === 'consider_rescheduling' || isExpired(appointment)"
            @click="openRescheduleRequestPanel(appointment)"
            class="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full transition-colors duration-200"
            :title="isExpired(appointment) ? 'Request Reschedule for Expired Appointment' : 'Request Reschedule'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 0 002 2z"></path>
            </svg>
          </button>
          
          <!-- Toggle Details Button -->
          <button 
            @click="toggleAppointmentDetails(appointment.id)"
            class="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors duration-200"
            :title="expandedAppointment === appointment.id ? 'Hide Details' : 'View Details'"
          >
            <svg class="w-4 h-4 transition-transform duration-200" 
                 :class="{ 'rotate-180': expandedAppointment === appointment.id }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          

          
          <!-- Status Action Buttons -->
          <div class="flex items-center gap-1">
            <button 
              v-if="appointment.status === 'pending'"
              @click="openActionConfirm('approve', appointment.id)"
              class="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors duration-200"
              title="Approve"
            >
              <CheckIcon class="w-4 h-4" />
            </button>
            <button 
              v-if="appointment.status === 'pending'"
              @click="openActionConfirm('reject', appointment.id)"
              class="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors duration-200"
              title="Reject"
            >
              <XIcon class="w-4 h-4" />
            </button>
            <!-- Mark as Completed Button for approved appointments -->
            <button 
              v-if="appointment.status === 'approved'"
              @click="openActionConfirm('complete', appointment.id)"
              class="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full transition-colors duration-200"
              title="Mark as Completed"
            >
              <CheckCircleIcon class="w-4 h-4" />
            </button>
            <button 
              v-if="appointment.status === 'approved'"
              @click="openCancelModal(appointment)"
              class="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full transition-colors duration-200"
              title="Cancel Appointment"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Expanded Details Section -->
      <div v-if="expandedAppointment === appointment.id" class="mt-4 pt-4 border-t border-gray-200">
        <!-- First Row - Appointment Details -->
        <div class="mb-6">
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 class="text-base font-medium text-gray-900">Appointment Details</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column - Owner Information -->
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Owner Name</span>
                  <span class="text-sm font-medium text-gray-900">{{ appointment.ownerName || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Email</span>
                  <span class="text-sm font-medium text-gray-900">{{ appointment.ownerEmail || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Phone</span>
                  <span class="text-sm font-medium text-gray-900">{{ appointment.contactInformation || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-500">Gender</span>
                  <span class="text-sm font-medium text-gray-900 capitalize">{{ appointment.gender || 'Not provided' }}</span>
                </div>
              </div>
              
              <!-- Right Column - Appointment Information -->
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Date</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(appointment.date) }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Time</span>
                  <span class="text-sm font-medium text-gray-900">{{ appointment.time || 'Not set' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Status</span>
                  <span class="text-sm font-medium text-gray-900">
                    <span 
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-800': appointment.status === 'pending',
                        'bg-green-100 text-green-800': appointment.status === 'approved',
                        'bg-red-100 text-red-800': appointment.status === 'rejected',
                        'bg-blue-100 text-blue-800': appointment.status === 'completed',
                        'bg-gray-100 text-gray-800': appointment.status === 'cancelled',
                        'bg-slate-100 text-slate-800': appointment.status === 'ended',
                        'bg-orange-100 text-orange-800': isExpired(appointment)
                      }"
                    >
                      {{ isExpired(appointment) ? 'Expired' : formatStatus(appointment.status) }}
                    </span>
                  </span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-500">Created</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDateTime(appointment.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Services -->
            <div class="mt-4 pt-3 border-t border-gray-100">
              <div class="text-sm text-gray-500 mb-2">Services</div>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="(serviceId, index) in appointment.services" 
                  :key="index"
                  class="flex flex-col items-start"
                >
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium mb-1">
                    {{ getServiceDisplayName(serviceId) }}
                  </span>
                  <span 
                    v-if="getServiceCategory(serviceId)"
                    class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded text-center"
                    :title="getServiceCategory(serviceId)?.description"
                  >
                    {{ getServiceCategory(serviceId)?.name }}
                </span>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            <div v-if="appointment.notes" class="mt-3 pt-3 border-t border-gray-100">
              <div class="text-sm text-gray-500 mb-2">Notes</div>
              <div class="text-sm text-gray-700 bg-gray-50 p-2 rounded text-xs">
                {{ appointment.notes }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Second Row - Pets Card -->
        <div class="mb-6" v-if="hasPet(appointment)">
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 class="text-base font-medium text-gray-900">Pet</h4>
            </div>
            
            <!-- Pet Card -->
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <img 
                  v-if="appointment.petPhotoURL"
                  :src="appointment.petPhotoURL" 
                  :alt="getPetDisplayName(appointment)"
                  class="w-full h-full object-cover" 
                  @error="onPetImageError"
                />
                <img 
                  v-else
                  :src="defaultPetPhotoURL" 
                  :alt="getPetDisplayName(appointment)"
                  class="w-full h-full object-cover" 
                />
              </div>
              <div class="flex-1">
                <div class="text-lg font-medium text-gray-900">{{ getPetDisplayName(appointment) }}</div>
                <div class="text-sm text-gray-500">{{ appointment.petSpecies || 'Unknown Species' }}</div>
                <div class="text-sm text-gray-500">{{ appointment.petBreed || 'Unknown Breed' }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">Age</div>
                <div class="text-sm font-medium text-gray-900">{{ formatPetAge(appointment) || 'Unknown' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Third Row - Pet Information with Timeline -->
        <div class="mb-6" v-if="hasPet(appointment)">
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <h4 class="text-base font-medium text-gray-900">Pet Information & History</h4>
            </div>
            
            <!-- Pet Information -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left Column - Pet Details -->
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Breed</span>
                  <span class="text-sm font-medium text-gray-900">{{ appointment.petBreed || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Gender</span>
                  <span class="text-sm font-medium text-gray-900 capitalize">{{ formatGender(appointment.petGender) || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-sm text-gray-500">Age</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatPetAge(appointment) || 'Not provided' }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-gray-500">Weight</span>
                  <span class="text-sm font-medium text-gray-900">{{ appointment.petWeight ? `${appointment.petWeight} kg` : 'Not provided' }}</span>
                </div>
              </div>
              
              <!-- Right Column - Timeline -->
              <div class="relative">
                <!-- Timeline Header -->
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Pet Medical History (Completed Appointments)</h4>
                  <p class="text-xs text-gray-500">Showing only completed appointments for this pet</p>
                </div>
                
                <!-- Timeline Items -->
                <div class="space-y-4">
                  <div 
                    v-for="(historyItem, index) in getPetHistory(appointment.petId || appointment.petNames?.[0] || appointment.petName)" 
                    :key="index"
                    class="relative pl-8"
                  >
                    <!-- Timeline Dot with Connector -->
                    <div class="absolute left-0 flex flex-col items-center">
                      <!-- Main Dot -->
                      <div class="w-3 h-3 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10"
                         :class="{
                           'bg-green-500': historyItem.status === 'completed',
                           'bg-yellow-500': historyItem.status === 'pending',
                           'bg-blue-500': historyItem.status === 'approved',
                           'bg-red-500': historyItem.status === 'rejected'
                         }">
                      <div class="w-1 h-1 rounded-full bg-white"></div>
                      </div>
                      
                      <!-- Connector Line (only if not the last item) -->
                      <div v-if="index < getPetHistory(appointment.petId || appointment.petNames?.[0] || appointment.petName).length - 1" 
                           class="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    </div>
                    
                    <!-- Timeline Content -->
                    <div class="bg-gray-50 rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <h5 class="font-medium text-gray-900 text-sm">
                            <div class="flex flex-wrap gap-1">
                              <div 
                                v-for="(service, index) in historyItem.serviceNames" 
                                :key="index"
                                class="flex flex-col items-start"
                              >
                                <span class="text-sm">{{ getServiceDisplayName(service) }}</span>
                                <span 
                                  v-if="getServiceCategory(service)"
                                  class="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded text-center"
                                  :title="getServiceCategory(service)?.description"
                                >
                                  {{ getServiceCategory(service)?.name }}
                                </span>
                              </div>
                            </div>
                          </h5>
                          <p class="text-xs text-gray-500">{{ formatDate(historyItem.date) }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-1 text-xs font-medium rounded-full" 
                                :class="{
                                  'bg-green-100 text-green-700': historyItem.status === 'completed',
                                  'bg-yellow-100 text-yellow-700': historyItem.status === 'pending',
                                  'bg-blue-100 text-blue-700': historyItem.status === 'approved',
                                  'bg-red-100 text-red-700': historyItem.status === 'rejected'
                                }">
                            {{ historyItem.status }}
                          </span>
                          
                          <!-- View Summary Button for Completed Appointments -->
                          <button 
                            v-if="historyItem.status === 'completed' && historyItem.completionData"
                            @click="viewAppointmentSummary(historyItem)"
                            class="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
                            title="View Completion Summary"
                          >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <!-- Completion Summary Preview -->
                      <div v-if="historyItem.status === 'completed' && historyItem.completionData" class="mt-2 pt-2 border-t border-gray-100">
                        <div class="text-xs text-gray-500 mb-1">Completion Summary Available</div>
                        <div class="bg-blue-50 rounded p-2 text-xs">
                          <div class="font-medium text-blue-800 mb-1">Services:</div>
                          <div class="text-blue-700">
                            {{ historyItem.completionData.services?.length || 0 }} service(s) completed
                          </div>
                          <div class="font-medium text-blue-800 mt-1 mb-1">Health Assessment:</div>
                          <div class="text-blue-700">
                            {{ historyItem.completionData.pets?.length || 0 }} pet(s) assessed
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Empty State -->
                  <div v-if="!getPetHistory(appointment.petId || appointment.petNames?.[0] || appointment.petName)?.length" 
                       class="text-center py-6 text-gray-500">
                    <PawPrintIcon class="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p class="text-sm">No completed appointments found for this pet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="paginatedAppointments.length === 0" class="text-center py-12">
      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <CalendarIcon class="w-8 h-8 text-gray-300" />
      </div>
      <p class="text-gray-500 font-medium">No appointments found</p>
      <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
    </div>
  </div>
</div>

<!-- Multi-step Approval Form -->
<div v-else-if="showApprovalForm">
  <!-- Fixed header with stepper -->
  <div class="border border-gray-200 rounded-lg mb-4">
    <div class="bg-gray-50 p-4 rounded-t-lg">
      <div class="flex w-full justify-between items-start">
        <!-- Steps -->
        <div class="flex-1 flex justify-between relative">
          <!-- Steps container with exact width -->
          <div class="w-full flex justify-between relative">
            <!-- Steps with proper spacing -->
            <div 
              v-for="(step, index) in approvalSteps" 
              :key="step.id" 
              class="flex flex-col items-center relative z-10"
              :style="{ width: `${100 / approvalSteps.length}%` }"
            >
              <!-- Icon -->
              <div
                class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-200"
                :class="[ 
                  approvalStep > index ? 'bg-[#2d80eb] text-white' : 
                  approvalStep === index ? 'bg-[#2d80eb] text-white' : 
                  'bg-blue-100 text-blue-500' 
                ]"
              >
                <component 
                  :is="approvalStep > index ? CheckIcon : step.icon" 
                  class="w-3 h-3 md:w-4 md:h-4"
                />
              </div>
              
              <!-- Label -->
              <span 
                class="mt-1 text-[10px] md:text-xs font-medium text-center w-full"
                :class="[
                  approvalStep >= index ? 'text-gray-900' : 'text-gray-400'
                ]"
              >
                {{ step.label }}
              </span>
            </div>

            <!-- Connector Line - Positioned precisely between the first and last icons -->
            <div 
              class="absolute top-4 h-[2px] bg-gray-200" 
              :style="{
                left: `calc(${100 / (approvalSteps.length * 2)}% + 4px)`, 
                right: `calc(${100 / (approvalSteps.length * 2)}% + 4px)`,
                width: `calc(100% - ${100 / (approvalSteps.length)}% - 8px)`
              }"
            >
              <div 
                class="h-full bg-[#2d80eb] transition-all duration-300"
                :style="{ 
                  width: approvalStep === approvalSteps.length - 1 ? '100%' : `${(approvalStep / (approvalSteps.length - 1)) * 100}%` 
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Content area -->
    <div class="p-6 border-t border-gray-200">
      <!-- Step content -->
      <div class="mb-6">
        <h2 class="text-xl md:text-2xl font-semibold text-gray-800 mb-2">{{ currentApprovalStep.label }}</h2>
        <p class="text-sm text-gray-600 mb-4">{{ currentApprovalStep.description }}</p>
    
        <!-- Owner Information Step -->
        <div v-if="currentApprovalStep.id === 'owner'" class="space-y-6">
            <!-- Personal Information Section -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-blue-100 rounded-full p-2">
                <UserIcon class="w-5 h-5 text-blue-600" />
                </div>
              <h4 class="text-lg font-medium text-gray-900">Personal Information</h4>
              </div>
              
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- First Name & Last Name -->
                <div>
                <div class="text-sm text-gray-500 mb-2">First Name</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.firstName || (selectedAppointment.ownerName ? selectedAppointment.ownerName.split(' ')[0] : 'Not provided') }}</div>
                </div>
                <div>
                <div class="text-sm text-gray-500 mb-2">Last Name</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.lastName || (selectedAppointment.ownerName ? selectedAppointment.ownerName.split(' ').slice(1).join(' ') : 'Not provided') }}</div>
                </div>
                
                <!-- Date of Birth & Age -->
                <div>
                <div class="text-sm text-gray-500 mb-2">Date of Birth</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.dateOfBirth ? formatDate(selectedAppointment.dateOfBirth) : 'Not provided' }}</div>
                </div>
                <div>
                <div class="text-sm text-gray-500 mb-2">Age</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.age || calculateAge(selectedAppointment.dateOfBirth) || 'Not provided' }}</div>
                </div>
                
                <!-- Gender -->
                <div>
                <div class="text-sm text-gray-500 mb-2">Gender</div>
                <div class="text-base font-medium text-gray-900 capitalize">{{ selectedAppointment.gender || 'Not provided' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Contact Information Section -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-green-100 rounded-full p-2">
                <PhoneIcon class="w-5 h-5 text-green-600" />
                </div>
              <h4 class="text-lg font-medium text-gray-900">Contact Information</h4>
              </div>
              
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Email -->
                <div>
                <div class="text-sm text-gray-500 mb-2">Email</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.ownerEmail || 'Not provided' }}</div>
                </div>
                
                <!-- Phone -->
                <div>
                <div class="text-sm text-gray-500 mb-2">Phone</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.contactInformation || 'Not provided' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Address Section -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="bg-red-100 rounded-full p-2">
                <MapPinIcon class="w-5 h-5 text-red-600" />
                </div>
              <h4 class="text-lg font-medium text-gray-900">Address</h4>
              </div>
              
            <div>
              <div class="text-sm text-gray-500 mb-2">Street Address</div>
              <div class="text-base font-medium text-gray-900">{{ selectedAppointment.streetAddress || 'Not provided' }}</div>
            </div>
          </div>
        </div>
        
        <!-- Pet Information Step - Updated for multiple pets -->
        <div v-if="currentApprovalStep.id === 'pet'" class="space-y-4">
          <!-- No pets case -->
          <div v-if="!hasPet(selectedAppointment)" class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex flex-col items-center justify-center py-6">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <PawPrintIcon class="w-8 h-8 text-gray-300" />
              </div>
              <h3 class="text-lg font-medium text-gray-800 mb-1">No Pet Information</h3>
              <p class="text-gray-500 text-center">This appointment doesn't have any pet information.</p>
            </div>
          </div>
          
          <!-- Single pet case -->
          <div v-else-if="selectedAppointment.petName && !hasMultiplePets(selectedAppointment)" class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Pet Information</h3>
            
            <!-- Pet Information Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="w-16 h-16 rounded-full overflow-hidden mr-4 bg-gray-100 flex items-center justify-center">
                  <img 
                    v-if="selectedAppointment.petPhotoURL"
                    :src="selectedAppointment.petPhotoURL" 
                    :alt="selectedAppointment.petName"
                    class="w-full h-full object-cover" 
                    @error="onPetImageError"
                  />
                  <img 
                    v-else
                    :src="defaultPetPhotoURL" 
                    :alt="selectedAppointment.petName"
                    class="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div class="text-xl font-medium text-gray-900">{{ selectedAppointment.petName || 'Unnamed Pet' }}</div>
                  <div class="text-sm text-gray-500 mt-1">
                    {{ selectedAppointment.petSpecies || 'Unknown Species' }} • {{ formatPetDetails(selectedAppointment) }}
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <!-- Name -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Name</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.petName || 'Not provided' }}</div>
                </div>
                
                <!-- Species -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Species</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.petSpecies || 'Not provided' }}</div>
                </div>
                
                <!-- Breed -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Breed</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.petBreed || 'Not provided' }}</div>
                </div>
                
                <!-- Gender -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Gender</div>
                  <div class="text-sm font-medium text-gray-900 capitalize">{{ formatGender(selectedAppointment.petGender) || 'Not provided' }}</div>
                </div>
                
                <!-- Age -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Age</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatPetAge(selectedAppointment) || 'Not provided' }}
                  </div>
                </div>
                
                <!-- Weight -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Weight (kg)</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.petWeight ? `${selectedAppointment.petWeight} kg` : 'Not provided' }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Multiple pets case -->
          <div v-else-if="hasMultiplePets(selectedAppointment)" class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Pets Information</h3>
            
            <!-- Pet count summary -->
            <div class="mb-4 bg-blue-50 p-3 rounded-lg">
              <p class="text-sm text-blue-700">
                <span class="font-medium">{{ getPetCount(selectedAppointment) }} pets</span> are associated with this appointment
              </p>
            </div>
            
            <!-- List of pets -->
            <div v-for="(pet, index) in getPetsArray(selectedAppointment)" :key="index" class="mb-6 border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div class="flex items-center mb-4">
                <div class="w-16 h-16 rounded-full overflow-hidden mr-4 bg-gray-100 flex items-center justify-center">
                  <img 
                    v-if="pet.photo"
                    :src="pet.photo" 
                    :alt="pet.name"
                    class="w-full h-full object-cover" 
                    @error="onPetImageError"
                  />
                  <img 
                    v-else
                    :src="defaultPetPhotoURL" 
                    :alt="pet.name"
                    class="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div class="text-xl font-medium text-gray-900">{{ pet.name || 'Unnamed Pet' }}</div>
                  <div class="text-sm text-gray-500 mt-1">
                    {{ pet.species || 'Unknown Species' }} • {{ formatPetDetailsFromObject(pet) }}
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <!-- Name -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Name</div>
                  <div class="text-sm font-medium text-gray-900">{{ pet.name || 'Not provided' }}</div>
                </div>
                
                <!-- Species -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Species</div>
                  <div class="text-sm font-medium text-gray-900">{{ pet.species || 'Not provided' }}</div>
                </div>
                
                <!-- Breed -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Breed</div>
                  <div class="text-sm font-medium text-gray-900">{{ pet.breed || 'Not provided' }}</div>
                </div>
                
                <!-- Gender -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Gender</div>
                  <div class="text-sm font-medium text-gray-900 capitalize">{{ formatGender(pet.gender) || 'Not provided' }}</div>
                </div>
                
                <!-- Age -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Age</div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatPetAgeFromObject(pet) || 'Not provided' }}
                  </div>
                </div>
                
                <!-- Weight -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Weight (kg)</div>
                  <div class="text-sm font-medium text-gray-900">{{ pet.weight ? `${pet.weight} kg` : 'Not provided' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Schedule Information Step -->
        <div v-if="currentApprovalStep.id === 'schedule'" class="space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="bg-purple-100 rounded-full p-2">
                <CalendarIcon class="w-5 h-5 text-purple-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Appointment Details</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div class="text-sm text-gray-500 mb-2">Date</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.date ? formatDate(selectedAppointment.date) : 'N/A' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-2">Time</div>
                <div class="text-base font-medium text-gray-900">{{ selectedAppointment.time || 'N/A' }}</div>
              </div>
            </div>
            
            <!-- Services -->
            <div>
              <div class="text-sm text-gray-500 mb-3">Services</div>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="(serviceId, index) in selectedAppointment.services" 
                  :key="index"
                  class="flex flex-col items-start"
                >
                  <span class="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium mb-1">
                    {{ getServiceDisplayName(serviceId) }}
                  </span>
                  <span 
                    v-if="getServiceCategory(serviceId)"
                    class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded text-center"
                    :title="getServiceCategory(serviceId)?.description"
                  >
                    {{ getServiceCategory(serviceId)?.name }}
                </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Confirmation Step - Updated for multiple pets -->
        <div v-if="currentApprovalStep.id === 'confirm'" class="space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="bg-indigo-100 rounded-full p-2">
                <CheckCircleIcon class="w-5 h-5 text-indigo-600" />
              </div>
              <h3 class="text-lg font-medium text-gray-900">Appointment Summary</h3>
            </div>
            
            <div class="space-y-6">
              <!-- Owner Summary - Enhanced with all details -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-blue-100 rounded-full p-2">
                    <UserIcon class="w-4 h-4 text-blue-600" />
                  </div>
                  <div class="text-base font-medium text-gray-700">Owner Information</div>
                </div>
                <div class="text-lg font-medium text-gray-900 mb-4">{{ selectedAppointment.ownerName || 'Unknown Owner' }}</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div class="text-sm text-gray-500 mb-2">Email</div>
                    <div class="text-base font-medium text-gray-700">{{ selectedAppointment.ownerEmail || 'No email' }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 mb-2">Phone</div>
                    <div class="text-base font-medium text-gray-700">{{ selectedAppointment.contactInformation || 'No contact info' }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 mb-2">Gender</div>
                    <div class="text-base font-medium text-gray-700 capitalize">{{ selectedAppointment.gender || 'Not provided' }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 mb-2">Age</div>
                    <div class="text-base font-medium text-gray-700">{{ selectedAppointment.age || calculateAge(selectedAppointment.dateOfBirth) || 'Not provided' }}</div>
                  </div>
                  <div class="md:col-span-2">
                    <div class="text-sm text-gray-500 mb-2">Address</div>
                    <div class="text-base font-medium text-gray-700">{{ selectedAppointment.streetAddress || 'Not provided' }}</div>
                  </div>
                </div>
              </div>
              
              <!-- No pets case -->
              <div v-if="!hasPet(selectedAppointment)" class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-500 mb-2">Pet</div>
                <div class="text-gray-700 italic">No pet information provided</div>
              </div>
              
              <!-- Single pet case -->
              <div v-else-if="selectedAppointment.petName && !hasMultiplePets(selectedAppointment)" class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-500 mb-2">Pet</div>
                <div class="flex items-start">
                  <div class="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                    <img 
                      v-if="selectedAppointment.petPhotoURL"
                      :src="selectedAppointment.petPhotoURL" 
                      :alt="selectedAppointment.petName"
                      class="w-full h-full object-cover" 
                      @error="onPetImageError"
                    />
                    <img 
                      v-else
                      :src="defaultPetPhotoURL" 
                      :alt="selectedAppointment.petName"
                      class="w-full h-full object-cover" 
                    />
                  </div>
                  <div class="flex-1">
                    <div class="text-lg font-medium text-gray-900">
                      {{ selectedAppointment.petName }}
                      <span v-if="selectedAppointment.petSpecies" class="text-gray-600">({{ selectedAppointment.petSpecies }})</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                      <div>
                        <div class="text-xs text-gray-500">Breed</div>
                        <div class="text-sm font-medium text-gray-700">{{ selectedAppointment.petBreed || 'Not provided' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500">Gender</div>
                        <div class="text-sm font-medium text-gray-700 capitalize">{{ formatGender(selectedAppointment.petGender) || 'Not provided' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500">Age</div>
                        <div class="text-sm text-gray-700">{{ formatPetAge(selectedAppointment) || 'Not provided' }}</div>
                      </div>
                      <div>
                        <div class="text-xs text-gray-500">Weight</div>
                        <div class="text-sm text-gray-700">{{ selectedAppointment.petWeight ? `${selectedAppointment.petWeight} kg` : 'Not provided' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Multiple pets case -->
              <div v-else-if="hasMultiplePets(selectedAppointment)" class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-500 mb-2">Pets ({{ getPetCount(selectedAppointment) }})</div>
                
                <!-- List of pets in summary view -->
                <div v-for="(pet, index) in getPetsArray(selectedAppointment)" :key="index" 
                     class="flex items-start mt-3 first:mt-0 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                  <div class="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                    <img 
                      v-if="pet.photo"
                      :src="pet.photo" 
                      :alt="pet.name"
                      class="w-full h-full object-cover" 
                      @error="onPetImageError"
                    />
                    <img 
                      v-else
                      :src="defaultPetPhotoURL" 
                      :alt="pet.name"
                      class="w-full h-full object-cover" 
                    />
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-gray-900">
                      {{ pet.name }}
                      <span v-if="pet.species" class="text-gray-600">({{ pet.species }})</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ pet.breed || 'Unknown breed' }} • 
                      {{ formatGender(pet.gender) || 'Unknown gender' }} • 
                      {{ formatPetAgeFromObject(pet) || 'Age unknown' }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Schedule Summary -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-purple-100 rounded-full p-2">
                    <CalendarIcon class="w-4 h-4 text-purple-600" />
                  </div>
                  <div class="text-base font-medium text-gray-700">Schedule</div>
                </div>
                <div class="text-lg font-medium text-gray-900">
                  {{ selectedAppointment.date ? formatDate(selectedAppointment.date) : 'N/A' }} at {{ selectedAppointment.time || 'N/A' }}
                </div>
              </div>
              
              <!-- Services Summary -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-blue-100 rounded-full p-2">
                    <StethoscopeIcon class="w-4 h-4 text-blue-600" />
                  </div>
                  <div class="text-base font-medium text-gray-700">Services</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <div 
                    v-for="(serviceId, index) in selectedAppointment.services" 
                    :key="index"
                    class="flex flex-col items-start"
                  >
                    <span class="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium mb-1">
                      {{ getServiceDisplayName(serviceId) }}
                    </span>
                    <span 
                      v-if="getServiceCategory(serviceId)"
                      class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded text-center"
                      :title="getServiceCategory(serviceId)?.description"
                    >
                      {{ getServiceCategory(serviceId)?.name }}
                  </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Navigation Buttons -->
      <div class="border-t border-gray-200 pt-4 flex justify-between">
        <div>
          <button
            v-if="approvalStep > 0"
            @click="previousApprovalStep"
            class="px-4 py-2 bg-gray-100 font-medium rounded-full text-gray-700 hover:bg-gray-200"
          >
            Back
          </button>
          <button
            v-if="approvalStep === 0"
            @click="cancelApprovalProcessHandler"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        
        <div>
          <button
            v-if="approvalStep < approvalSteps.length - 1"
            @click="nextApprovalStep"
            class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Continue
          </button>
          
          <button
            v-if="approvalStep === approvalSteps.length - 1"
            @click="finalizeApproval"
            class="px-6 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Pagination -->
<div v-if="!initialLoading && !showApprovalForm && filteredAndSortedAppointments.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
  <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
    Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAndSortedAppointments.length }} entries
  </div>
  <div class="flex gap-2">
    <button 
      @click="prevPage" 
      :disabled="currentPage === 1"
      class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
      :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'"
    >
      Previous
    </button>
    <button 
      @click="nextPage" 
      :disabled="currentPage === totalPages"
      class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
      :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'"
    >
      Next
    </button>
  </div>
</div>
</div>

<!-- Loading Spinner Overlay - Show for operations -->
<LoadingSpinner v-if="isLoading || initialLoading" isOverlay :text="initialLoading ? 'Loading appointments...' : 'Processing...'" />

<!-- Action Confirmation Modal -->
<div v-if="showActionConfirmModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
  <div class="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
    <div class="flex items-center gap-3 mb-3">
      <div :class="[
        'w-10 h-10 rounded-full flex items-center justify-center',
        actionTypeToConfirm==='approve' ? 'bg-green-100' : actionTypeToConfirm==='complete' ? 'bg-emerald-100' : 'bg-red-100'
      ]">
        <component 
          :is="actionTypeToConfirm==='approve' ? CheckIcon : actionTypeToConfirm==='complete' ? CheckCircleIcon : XIcon" 
          :class="['w-5 h-5', actionTypeToConfirm==='approve' ? 'text-green-600' : actionTypeToConfirm==='complete' ? 'text-emerald-600' : 'bg-red-600']" 
        />
      </div>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ actionTypeToConfirm==='approve' ? 'Approve Appointment' : actionTypeToConfirm==='complete' ? 'Mark as Completed' : 'Reject Appointment' }}
      </h3>
    </div>
    <p class="text-sm text-gray-600 mb-5">
      {{ actionTypeToConfirm==='approve' 
        ? 'Are you sure you want to approve this appointment?' 
        : actionTypeToConfirm==='complete' 
          ? 'Mark this appointment as completed?' 
          : 'Are you sure you want to reject this appointment?' }}
    </p>
    <div class="flex gap-2">
      <button @click="closeActionConfirm" class="flex-1 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50" :disabled="actionLoading">Cancel</button>
      <button @click="confirmAction" :disabled="actionLoading" class="flex-1 py-2 rounded-full text-white" :class="actionTypeToConfirm==='approve' ? 'bg-green-600 hover:bg-green-700' : actionTypeToConfirm==='complete' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'">
        <span v-if="actionLoading">Processing...</span>
        <span v-else>{{ actionTypeToConfirm==='approve' ? 'Approve' : actionTypeToConfirm==='complete' ? 'Complete' : 'Reject' }}</span>
      </button>
    </div>
  </div>
  </div>

<!-- Completion Form Modal -->
<div v-if="showCompletionFormModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Complete Appointment</h2>
      <button @click="closeCompletionFormModal" class="text-gray-400 hover:text-gray-600">
        <XIcon class="w-5 h-5" />
      </button>
    </div>
    
    <div class="p-6">
      <!-- Appointment Summary -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Appointment Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500 mb-1">Owner</div>
            <div class="font-medium text-gray-900">{{ selectedAppointment?.ownerName || 'Unknown' }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Pet(s)</div>
            <div class="font-medium text-gray-900">
              {{ selectedAppointment?.petNames?.join(', ') || selectedAppointment?.petName || 'No pet info' }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Date & Time</div>
            <div class="font-medium text-gray-900">
              {{ formatDate(selectedAppointment?.date) }} at {{ selectedAppointment?.time }}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500 mb-1">Services</div>
            <div class="font-medium text-gray-900">
              <div class="flex flex-wrap gap-1">
                <div 
                  v-for="(serviceId, index) in selectedAppointment?.services" 
                  :key="index"
                  class="flex flex-col items-start"
                >
                  <span class="text-sm">{{ getServiceDisplayName(serviceId) }}</span>
                  <span 
                    v-if="getServiceCategory(serviceId)"
                    class="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded text-center"
                    :title="getServiceCategory(serviceId)?.description"
                  >
                    {{ getServiceCategory(serviceId)?.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Completion Form -->
      <form @submit.prevent="submitCompletionForm" class="space-y-6">
        <!-- Service Summary Section -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <StethoscopeIcon class="w-5 h-5 text-blue-500" />
            Service Summary
          </h3>
          
          <!-- Services with individual notes -->
          <div class="space-y-4">
            <div v-for="(serviceId, index) in selectedAppointment?.services" :key="index" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-gray-900">{{ getServiceDisplayName(serviceId) }}</h4>
                <span class="text-sm text-gray-500">Service {{ index + 1 }}</span>
              </div>
              
              <!-- Category Information -->
              <div v-if="getServiceCategory(serviceId)" class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span class="text-sm font-medium text-blue-800">Category</span>
                </div>
                <div class="text-sm text-blue-700">
                  <div class="font-medium">{{ getServiceCategory(service)?.name }}</div>
                  <div class="text-blue-600">{{ getServiceCategory(service)?.description }}</div>
                </div>
              </div>
              

              
              <!-- Service Details (if available) -->
              <div v-if="getServiceById(serviceId)" class="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm font-medium text-green-800">Service Details</span>
                </div>
                <div class="text-sm text-green-700">
                  <div v-if="getServiceById(serviceId)?.fees" class="mb-1">
                    <span class="font-medium">Fees:</span> {{ getServiceById(serviceId)?.fees }}
                  </div>
                  <div v-if="getServiceById(serviceId)?.processingTime" class="mb-1">
                    <span class="font-medium">Processing Time:</span> {{ getServiceById(serviceId)?.processingTime }}
                  </div>
                  <div v-if="getServiceById(serviceId)?.classification" class="mb-1">
                    <span class="font-medium">Classification:</span> {{ getServiceById(serviceId)?.classification }}
                  </div>
                </div>
              </div>
              
              <!-- Service-specific fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select v-model="completionForm.services[index].status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="completed">Completed</option>
                    <option value="partially_completed">Partially Completed</option>
                    <option value="requires_followup">Requires Follow-up</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input 
                    v-model.number="completionForm.services[index].duration" 
                    type="number" 
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Service Notes</label>
                  <textarea 
                    v-model="completionForm.services[index].notes" 
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what was done, findings, recommendations..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pet Health Assessment -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <PawPrintIcon class="w-5 h-5 text-green-500" />
            Pet Health Assessment
          </h3>
          
          <div class="space-y-4">
            <div v-for="(pet, petIndex) in getPetsArray(selectedAppointment)" :key="petIndex" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    v-if="pet.photo"
                    :src="pet.photo" 
                    :alt="pet.name"
                    class="w-full h-full object-cover" 
                  />
                  <img 
                    v-else
                    :src="defaultPetPhotoURL" 
                    :alt="pet.name"
                    class="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ pet.name }}</h4>
                  <p class="text-sm text-gray-500">{{ pet.species }} • {{ pet.breed || 'Unknown breed' }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Overall Health</label>
                  <select v-model="completionForm.pets[petIndex].overallHealth" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input 
                    v-model.number="completionForm.pets[petIndex].weight" 
                    type="number" 
                    step="0.1"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.2"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Health Notes</label>
                  <textarea 
                    v-model="completionForm.pets[petIndex].healthNotes" 
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe pet's condition, any issues found, recommendations..."
                  ></textarea>
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Follow-up Required</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input 
                        v-model="completionForm.pets[petIndex].followUpRequired" 
                        type="checkbox" 
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Schedule follow-up appointment</span>
                    </label>
                    
                    <div v-if="completionForm.pets[petIndex].followUpRequired" class="ml-6">
                      <input 
                        v-model="completionForm.pets[petIndex].followUpNotes" 
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Reason for follow-up, recommended timeline..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- General Notes -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            General Notes & Recommendations
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Treatment Summary</label>
              <textarea 
                v-model="completionForm.generalNotes.treatmentSummary" 
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Overall summary of treatments provided, procedures performed..."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Owner Instructions</label>
              <textarea 
                v-model="completionForm.generalNotes.ownerInstructions" 
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Instructions for pet owner, home care, medications, diet changes..."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
              <textarea 
                v-model="completionForm.generalNotes.nextSteps" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Recommended next steps, when to return, preventive care..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button"
            @click="closeCompletionFormModal" 
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="completionFormLoading"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            <span v-if="completionFormLoading">Completing...</span>
            <span v-else>Complete Appointment</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  </div>

<!-- Confirmation Modal -->
<div 
v-if="showCancelModal" 
class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
<div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
  <div class="flex flex-col items-center text-center">
    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertTriangleIcon class="w-6 h-6 text-red-600" />
    </div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h2>
    <p class="text-gray-600 mb-4">
      Are you sure you want to cancel this appointment on 
      <span class="font-medium">{{ selectedAppointment ? formatDate(selectedAppointment.date) : '' }}</span> 
      at <span class="font-medium">{{ selectedAppointment ? selectedAppointment.time : '' }}</span>?
    </p>
    
    <!-- Cancellation Reason Input -->
    <div class="w-full mb-4">
      <label for="cancellation-reason" class="block text-left text-sm font-medium text-gray-700 mb-1">
        Please provide a reason for cancellation:
      </label>
      <textarea
        id="cancellation-reason"
        v-model="cancellationReason"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        placeholder="Enter your reason for cancelling this appointment..."
        required
      ></textarea>
      <p v-if="reasonError" class="mt-1 text-left text-xs text-red-600">
        {{ reasonError }}
      </p>
    </div>
    
    <div class="flex space-x-3 w-full">
      <button 
        @click="closeCancelModalHandler" 
        class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
      >
        No, Keep It
      </button>
      <button 
        @click="cancelAppointment" 
        :disabled="cancelLoading || !cancellationReason.trim()"
        class="flex-1 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="cancelLoading">Cancelling...</span>
        <span v-else>Yes, Cancel</span>
      </button>
    </div>
  </div>
</div>
</div>

<!-- Success Modal -->
<div 
v-if="showSuccessModal" 
class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
<div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
  <div class="flex flex-col items-center text-center">
    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
      <CheckIcon class="w-6 h-6 text-green-600" />
    </div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">{{ successTitle }}</h2>
    <p class="text-gray-600 mb-6">{{ successMessage }}</p>
    
    <button 
      @click="closeSuccessModal" 
      class="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
    >
      Done
    </button>
  </div>
</div>
</div>



<!-- Bulk Action Modal -->
<div 
v-if="showBulkActionModal" 
class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
<div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
  <div class="flex flex-col items-center text-center">
    <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4"
         :class="bulkActionType === 'approve' ? 'bg-green-100' : 'bg-red-100'">
      <component 
        :is="bulkActionType === 'approve' ? CheckIcon : XIcon" 
        class="w-6 h-6"
        :class="bulkActionType === 'approve' ? 'text-green-600' : 'text-red-600'"
      />
    </div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">
      {{ bulkActionType === 'approve' ? 'Approve' : 'Reject' }} {{ selectedAppointments.size }} Appointment{{ selectedAppointments.size > 1 ? 's' : '' }}?
    </h2>
    <p class="text-gray-600 mb-4">
      Are you sure you want to {{ bulkActionType === 'approve' ? 'approve' : 'reject' }} 
      {{ selectedAppointments.size }} appointment{{ selectedAppointments.size > 1 ? 's' : '' }}?
    </p>
    
    <!-- Reason for rejection -->
    <div v-if="bulkActionType === 'reject'" class="w-full mb-4">
      <label class="block text-left text-sm font-medium text-gray-700 mb-1">
        Reason for rejection:
      </label>
      <textarea
        v-model="bulkActionReason"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        placeholder="Enter reason for rejection..."
        required
      ></textarea>
      <p v-if="bulkActionError" class="mt-1 text-left text-xs text-red-600">
        {{ bulkActionError }}
      </p>
    </div>
    
    <div class="flex space-x-3 w-full">
      <button 
        @click="closeBulkActionModal" 
        class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
      >
        Cancel
      </button>
      <button 
        @click="executeBulkAction" 
        :disabled="bulkActionLoading || (bulkActionType === 'reject' && !bulkActionReason.trim())"
        class="flex-1 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        :class="bulkActionType === 'approve' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'"
      >
        <span v-if="bulkActionLoading">Processing...</span>
        <span v-else>{{ bulkActionType === 'approve' ? 'Approve' : 'Reject' }} All</span>
      </button>
    </div>
  </div>
</div>
</div>

<!-- Reschedule Panel -->
<div 
v-if="showAutoReschedulePanel" 
class="fixed inset-0 bg-black bg-opacity-20 z-50"
@click="closeAutoReschedulePanel"
>
<div 
  class="absolute right-0 top-0 h-full w-[500px] bg-white shadow-2xl transform transition-transform duration-300"
  @click.stop
>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-100">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">Request Reschedule</h2>
        <p class="text-sm text-gray-500 mt-1">Suggest a new time to the client</p>
      </div>
      <button @click="closeAutoReschedulePanel" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
        <XIcon class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="reschedulingAppointment" class="space-y-6">
        <!-- Current Appointment Summary -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarIcon class="w-5 h-5 text-blue-600" />
          </div>
            <div>
              <h3 class="font-medium text-gray-900">Current Appointment</h3>
              <p class="text-sm text-gray-600">{{ reschedulingAppointment.ownerName }}</p>
        </div>
              </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Date:</span>
              <span class="ml-2 font-medium">{{ formatDate(reschedulingAppointment.date) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Time:</span>
              <span class="ml-2 font-medium">{{ reschedulingAppointment.time }}</span>
          </div>
        </div>
          <div class="mt-3 pt-3 border-t border-gray-200">
            <span class="text-gray-500 text-sm">Status:</span>
            <span :class="getStatusClass(reschedulingAppointment.status)" class="ml-2 text-xs">
              {{ formatStatus(reschedulingAppointment.status) }}
            </span>
          </div>
        </div>
        
        <!-- Reschedule Reason -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Reason for Reschedule *</label>
          <textarea 
            v-model="rescheduleReason"
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
            placeholder="Explain why you need to reschedule this appointment..."
          ></textarea>
          <div v-if="!rescheduleReason.trim()" class="text-xs text-orange-600 mt-2 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            A reason is required
            </div>
          </div>
        
        <!-- Date Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Preferred Date</label>
          <button 
            @click="showDatePicker = true"
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <CalendarIcon class="w-5 h-5 text-gray-500" />
              <span class="text-gray-700">
                {{ selectedDate ? formatDate(selectedDate) : 'Select a date' }}
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        <!-- Time Selection -->
        <div v-if="selectedDate">
          <label class="block text-sm font-medium text-gray-700 mb-3">Preferred Time</label>
          
          <!-- AM/PM Toggle -->
          <div class="flex gap-2 mb-4">
            <button 
              @click="selectedTimePeriod = 'AM'"
              class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              :class="selectedTimePeriod === 'AM' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Morning
            </button>
            <button 
              @click="selectedTimePeriod = 'PM'"
              class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              :class="selectedTimePeriod === 'PM' ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Afternoon
            </button>
          </div>
          
          <!-- Time Slots -->
          <div class="grid grid-cols-3 gap-3">
            <button 
              v-for="option in filteredTimeOptions" 
              :key="option.value"
              @click="selectAutoRescheduleOption(option)"
              class="p-3 text-center border rounded-xl transition-all duration-200 hover:shadow-sm"
              :class="{ 
                'border-blue-500 bg-blue-50 shadow-sm': selectedAutoOption === option.value,
                'border-gray-200 hover:border-gray-300': selectedAutoOption !== option.value
              }"
            >
              <div class="font-medium text-gray-900">{{ option.displayTime }}</div>
              <div class="text-xs text-gray-500 mt-1">Available</div>
            </button>
          </div>
          
          <div v-if="filteredTimeOptions.length === 0" class="text-center py-6 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm font-medium">No available times</p>
            <p class="text-xs">All slots are booked or conflict with existing appointments</p>
          </div>
        </div>
        
        <!-- Selected Time Preview -->
        <div v-if="selectedAutoOption" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
          </div>
                  <div>
              <h4 class="font-medium text-blue-900">Suggested Time</h4>
              <p class="text-sm text-blue-700">{{ selectedAutoRescheduleDate }} at {{ selectedAutoRescheduleTime }}</p>
                  </div>
                  </div>
                </div>
        
        <!-- Info Note -->
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-sm text-amber-800">
              <p class="font-medium">Client will be notified</p>
              <p class="text-amber-700 mt-1">They can accept, decline, or suggest an alternative time. The appointment won't be automatically changed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="p-6 border-t border-gray-100 bg-gray-50">
      <button 
        @click="executeRescheduleRequest"
        :disabled="autoRescheduleLoading || !selectedAutoOption || !selectedDate || !rescheduleReason.trim()"
        class="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <span v-if="autoRescheduleLoading" class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending Request...
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          Send Reschedule Request
        </span>
      </button>
    </div>
  </div>
</div>
</div>

<!-- Date Picker Modal -->
<div 
  v-if="showDatePicker" 
  class="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center"
  @click="showDatePicker = false"
>
  <div 
    class="bg-white rounded-lg shadow-xl p-6 w-80 max-w-sm"
    @click.stop
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Select Date</h3>
      <button @click="showDatePicker = false" class="text-gray-400 hover:text-gray-600">
        <XIcon class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Calendar -->
    <div class="space-y-4">
      <!-- Month Navigation -->
      <div class="flex items-center justify-between">
        <button 
          @click="previousMonth"
          class="p-1 hover:bg-gray-100 rounded"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h4 class="text-sm font-medium text-gray-900">{{ currentMonthYear }}</h4>
        <button 
          @click="nextMonth"
          class="p-1 hover:bg-gray-100 rounded"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in weekDays" :key="day" class="text-center text-xs font-medium text-gray-500 py-1">
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1">
        <div 
          v-for="day in calendarDays" 
          :key="day.date"
          @click="selectCalendarDate(day)"
          class="text-center py-2 text-sm cursor-pointer rounded hover:bg-gray-100 transition-colors"
          :class="{
            'text-gray-400': !day.isCurrentMonth,
            'text-gray-900': day.isCurrentMonth && !day.isSelected && !day.isToday,
            'bg-blue-100 text-blue-700 font-medium': day.isSelected,
            'bg-gray-200 text-gray-700 font-medium': day.isToday && !day.isSelected,
            'text-red-500': day.isPast,
            'cursor-not-allowed opacity-50': day.isPast || !day.isWorkingDay
          }"
        >
          {{ day.dayNumber }}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
      <button 
        @click="showDatePicker = false"
        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
      >
        Cancel
      </button>
      <button 
        @click="confirmDateSelection"
        :disabled="!tempSelectedDate"
        class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm
      </button>
    </div>
  </div>
</div>

<!-- Appointment Details Modal -->
<div 
  v-if="showAppointmentDetailsModal" 
  class="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
  @click="closeAppointmentDetailsModal"
>
  <div 
    class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
    @click.stop
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Appointment Details</h2>
      <button @click="closeAppointmentDetailsModal" class="text-gray-400 hover:text-gray-600">
        <XIcon class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Content -->
    <div class="p-6" v-if="selectedAppointment">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column - Appointment Information -->
        <div class="space-y-6">
          <!-- Owner Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
              <UserIcon class="w-5 h-5 text-blue-500" />
              Owner Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500 mb-1">Name</div>
                <div class="font-medium text-gray-900">{{ selectedAppointment.ownerName || 'Not provided' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Email</div>
                <div class="font-medium text-gray-900">{{ selectedAppointment.ownerEmail || 'Not provided' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Phone</div>
                <div class="font-medium text-gray-900">{{ selectedAppointment.contactInformation || 'Not provided' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Gender</div>
                <div class="font-medium text-gray-900 capitalize">{{ selectedAppointment.gender || 'Not provided' }}</div>
              </div>
            </div>
          </div>
          
          <!-- Pet Information -->
          <div class="bg-gray-50 rounded-lg p-4" v-if="hasPet(selectedAppointment)">
            <h3 class="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
              <PawPrintIcon class="w-5 h-5 text-green-500" />
              Pet Information
            </h3>
            
            <!-- Single Pet -->
            <div v-if="selectedAppointment.petName && !hasMultiplePets(selectedAppointment)" class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    v-if="selectedAppointment.petPhotoURL"
                    :src="selectedAppointment.petPhotoURL" 
                    :alt="selectedAppointment.petName"
                    class="w-full h-full object-cover" 
                    @error="onPetImageError"
                  />
                  <img 
                    v-else
                    :src="defaultPetPhotoURL" 
                    :alt="selectedAppointment.petName"
                    class="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div class="text-xl font-medium text-gray-900">{{ selectedAppointment.petName }}</div>
                  <div class="text-sm text-gray-500">{{ selectedAppointment.petSpecies || 'Unknown Species' }}</div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-500 mb-1">Breed</div>
                  <div class="font-medium text-gray-900">{{ selectedAppointment.petBreed || 'Not provided' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">Gender</div>
                  <div class="font-medium text-gray-900 capitalize">{{ formatGender(selectedAppointment.petGender) || 'Not provided' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">Age</div>
                  <div class="font-medium text-gray-900">{{ formatPetAge(selectedAppointment) || 'Not provided' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">Weight</div>
                  <div class="font-medium text-gray-900">{{ selectedAppointment.petWeight ? `${selectedAppointment.petWeight} kg` : 'Not provided' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Multiple Pets -->
            <div v-else-if="hasMultiplePets(selectedAppointment)" class="space-y-4">
              <div class="text-sm text-gray-600 mb-3">
                {{ getPetCount(selectedAppointment) }} pets associated with this appointment
              </div>
              
              <div v-for="(pet, index) in getPetsArray(selectedAppointment)" :key="index" class="border border-gray-200 rounded-lg p-3">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      v-if="pet.photo"
                      :src="pet.photo" 
                      :alt="pet.name"
                      class="w-full h-full object-cover" 
                      @error="onPetImageError"
                    />
                    <img 
                      v-else
                      :src="defaultPetPhotoURL" 
                      :alt="pet.name"
                      class="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ pet.name }}</div>
                    <div class="text-sm text-gray-500">{{ pet.species || 'Unknown Species' }}</div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-gray-500">Breed:</span>
                    <span class="font-medium text-gray-900 ml-1">{{ pet.breed || 'Not provided' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Gender:</span>
                    <span class="font-medium text-gray-900 ml-1 capitalize">{{ formatGender(pet.gender) || 'Not provided' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Appointment Details -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
              <CalendarIcon class="w-5 h-5 text-purple-500" />
              Appointment Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500 mb-1">Date</div>
                <div class="font-medium text-gray-900">{{ formatDate(selectedAppointment.date) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Time</div>
                <div class="font-medium text-gray-900">{{ selectedAppointment.time || 'Not set' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Status</div>
                <div class="font-medium text-gray-900">
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="{
                      'bg-yellow-100 text-yellow-800': selectedAppointment.status === 'pending',
                      'bg-green-100 text-green-800': selectedAppointment.status === 'approved',
                      'bg-red-100 text-red-800': selectedAppointment.status === 'rejected',
                      'bg-blue-100 text-blue-800': selectedAppointment.status === 'completed',
                      'bg-gray-100 text-gray-800': selectedAppointment.status === 'cancelled',
                      'bg-slate-100 text-slate-800': selectedAppointment.status === 'ended',
                      'bg-orange-100 text-orange-800': isExpired(selectedAppointment)
                    }"
                  >
                    {{ isExpired(selectedAppointment) ? 'Expired' : formatStatus(selectedAppointment.status) }}
                  </span>
                </div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Created</div>
                <div class="font-medium text-gray-900">{{ formatDateTime(selectedAppointment.createdAt) }}</div>
              </div>
            </div>
            
            <!-- Services -->
            <div class="mt-4">
              <div class="text-sm text-gray-500 mb-2">Services</div>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="(service, index) in selectedAppointment.serviceNames" 
                  :key="index"
                  class="flex flex-col items-start"
                >
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-1">
                    {{ getServiceDisplayName(service) }}
                  </span>
                  <span 
                    v-if="getServiceCategory(service)"
                    class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded text-center"
                    :title="getServiceCategory(service)?.description"
                  >
                    {{ getServiceCategory(service)?.name }}
                </span>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            <div v-if="selectedAppointment.notes" class="mt-4">
              <div class="text-sm text-gray-500 mb-2">Notes</div>
              <div class="text-gray-900 bg-white p-3 rounded border">{{ selectedAppointment.notes }}</div>
            </div>
          </div>
        </div>
        
        <!-- Right Column - Pet History -->
        <div class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Pet Medical History
            </h3>
            
            <!-- Single Pet History -->
            <div v-if="selectedAppointment.petName && !hasMultiplePets(selectedAppointment) && selectedAppointment.petId" class="space-y-4">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    v-if="selectedAppointment.petPhotoURL"
                    :src="selectedAppointment.petPhotoURL" 
                    :alt="selectedAppointment.petName"
                    class="w-full h-full object-cover" 
                    @error="onPetImageError"
                  />
                  <img 
                    v-else
                    :src="defaultPetPhotoURL" 
                    :alt="selectedAppointment.petName"
                    class="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ selectedAppointment.petName }}</div>
                  <div class="text-sm text-gray-500">Medical History</div>
                </div>
              </div>
              
              <!-- Pet History Content -->
              <div class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="text-center py-8">
                  <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-medium mb-2">View Complete Medical History</p>
                  <p class="text-gray-500 text-sm mb-4">Access vaccination records, treatments, and medical notes</p>
                  <button 
                    @click="viewPetHistory(selectedAppointment)"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Open Pet History
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Multiple Pets History -->
            <div v-else-if="hasMultiplePets(selectedAppointment)" class="space-y-4">
              <div class="text-sm text-gray-600 mb-3">
                Medical history for {{ getPetCount(selectedAppointment) }} pets
              </div>
              
              <div v-for="(pet, index) in getPetsArray(selectedAppointment)" :key="index" class="bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      v-if="pet.photo"
                      :src="pet.photo" 
                      :alt="pet.name"
                      class="w-full h-full object-cover" 
                      @error="onPetImageError"
                    />
                    <img 
                      v-else
                      :src="defaultPetPhotoURL" 
                      :alt="pet.name"
                      class="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ pet.name }}</div>
                    <div class="text-sm text-gray-500">{{ pet.species || 'Unknown Species' }}</div>
                  </div>
                </div>
                
                <div class="text-center py-4">
                  <button 
                    v-if="pet.id"
                    @click="viewPetHistoryById(pet.id)"
                    class="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    View {{ pet.name }}'s History
                  </button>
                  <p v-else class="text-gray-500 text-sm">No history available</p>
                </div>
              </div>
            </div>
            
            <!-- No Pet History -->
            <div v-else class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <PawPrintIcon class="w-8 h-8 text-gray-400" />
                </div>
                <p class="text-gray-600 font-medium mb-2">No Pet Information</p>
                <p class="text-gray-500 text-sm">This appointment doesn't have associated pet data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, onUnmounted, onActivated, onDeactivated, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
Search as SearchIcon,
Filter as FilterIcon,
Download as DownloadIcon,
Check as CheckIcon,
X as XIcon,
XCircle as XCircleIcon,
Calendar as CalendarIcon,
AlertTriangle as AlertTriangleIcon,
RefreshCw as RefreshCwIcon,
User as UserIcon,
PawPrint as PawPrintIcon,
Stethoscope as StethoscopeIcon,
CalendarDays as CalendarDaysIcon,
Phone as PhoneIcon,
MapPin as MapPinIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-vue-next';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import { usePetsStore } from '@/stores/modules/petsStore';
import { useAuthStore } from '@/stores/modules/authStore';
import { useNotificationsStore } from '@/stores/modules/notifications';
import { parseISO, format } from 'date-fns';
import notificationService from '@/services/notificationService';
import { useServiceCategoryStore } from '@/stores/modules/ServiceCategoryStore'
import { generateVaccinationRecordWithAutoScheduling, addVaccinationToPet } from '@/services/vaccinationService'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'

// Router and route
const router = useRouter();
const route = useRoute();

// Default photo URL for profile placeholder
const defaultPhotoURL = ref('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2236%22 height%3D%2236%22 viewBox%3D%220 0 36 36%22%3E%3Ccircle cx%3D%2218%22 cy%3D%2218%22 r%3D%2218%22 fill%3D%22%23f0f0f0%22%2F%3E%3Cpath d%3D%22M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5%22 stroke%3D%22%23bec3c9%22 stroke-width%3D%222%22 fill%3D%22none%22%2F%3E%3C%2Fsvg%3E');

// Default pet photo URL
const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E';

const appointmentStore = useAppointmentStore();
const profileStore = useProfileStore();
const petsStore = usePetsStore();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

// Modified headers array - changed clientName to ownerName
const headers = [
{ key: 'ownerName', label: 'Owner' },
{ key: 'contactInformation', label: 'Contact' },
{ key: 'petName', label: 'Pet' },
{ key: 'date', label: 'Date' },
{ key: 'time', label: 'Time' },
{ key: 'services', label: 'Services' },
{ key: 'status', label: 'Status' },
{ key: 'createdAt', label: 'Created' },
{ key: 'updatedAt', label: 'Updated' }
];

// State variables
const search = ref('');
const sortKey = ref('date');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = 10;
const showFilters = ref(false);
const filters = ref({
status: '',
dateRange: '',
serviceType: ''
});

// Category filter state
const categoryFilter = ref('all');

// Service categories state
const serviceCategories = ref({});
const servicesData = ref({});
const categoriesData = ref({});

// Status category definitions (dedup by ID to avoid over-counting)
const statusCategories = computed(() => {
  // Build a unique set of appointments by ID from filtered appointments
  const uniqueMap = new Map();
  for (const appt of filteredAppointments.value) {
    if (!appt || !appt.id) continue;
    uniqueMap.set(appt.id, appt);
  }
  const unique = Array.from(uniqueMap.values());

  // Count by effective status (expired is computed)
  const counters = unique.reduce((acc, a) => {
    const eff = isExpired(a) ? 'expired' : (a.status || '').toLowerCase();
    const key = eff || 'pending';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const total = unique.length;
  return [
    { key: '', label: 'All', count: total },
    { key: 'pending', label: 'Pending', count: counters['pending'] || 0 },
    { key: 'approved', label: 'Approved', count: counters['approved'] || 0 },
    { key: 'completed', label: 'Completed', count: counters['completed'] || 0 },
    { key: 'rejected', label: 'Rejected', count: counters['rejected'] || 0 },
    { key: 'cancelled', label: 'Cancelled', count: counters['cancelled'] || 0 },
    { key: 'expired', label: 'Expired', count: counters['expired'] || 0 },
    { key: 'consider_rescheduling', label: 'Consider Rescheduling', count: counters['consider_rescheduling'] || 0 },
  ];
});

// Available categories for filtering
const availableCategories = computed(() => {
  return Object.values(categoriesData.value).filter(category => !category.archived);
});

// Filtered appointments based on status AND category (both filters work together)
const filteredAppointments = computed(() => {
  let filtered = appointments.value;
  
  // Apply status filter
  if (filters.value.status) {
    filtered = filtered.filter(appointment => {
      const effectiveStatus = isExpired(appointment) ? 'expired' : appointment.status;
      return effectiveStatus === filters.value.status;
    });
  }
  
  // Apply category filter (this will further filter the already status-filtered results)
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(appointment => {
      if (!appointment.services || appointment.services.length === 0) return false;
      
      // Check if any service in this appointment belongs to the selected category
      return appointment.services.some(serviceId => {
        const service = servicesData.value[serviceId];
        return service && service.categoryId === categoryFilter.value;
      });
    });
  }
  
  return filtered;
});

// Loading states
const isLoading = ref(false);
const initialLoading = ref(true);

// Cancel modal state
const showCancelModal = ref(false);
const selectedAppointment = ref(null);
const cancellationReason = ref('');
const reasonError = ref('');
const cancelLoading = ref(false);

// Success modal state
const showSuccessModal = ref(false);
const successTitle = ref('');
const successMessage = ref('');

// Single action confirmation modal
const showActionConfirmModal = ref(false);
const actionTypeToConfirm = ref(''); // 'approve' | 'reject' | 'complete'
const actionTargetId = ref(null);
const actionLoading = ref(false);

// Completion form modal state
const showCompletionFormModal = ref(false);
const completionFormLoading = ref(false);

// Expanded appointment state
const expandedAppointment = ref(null);

// Pet selection for history state
const selectedPetForHistory = ref({});

// Timeline visibility state
const showTimeline = ref({});
const completionForm = ref({
  services: [],
  pets: [],
  generalNotes: {
    treatmentSummary: '',
    ownerInstructions: '',
    nextSteps: ''
  }
});

const openActionConfirm = (type, appointmentId) => {
  actionTypeToConfirm.value = type;
  actionTargetId.value = appointmentId;
  showActionConfirmModal.value = true;
};

const closeActionConfirm = () => {
  if (actionLoading.value) return;
  showActionConfirmModal.value = false;
  actionTypeToConfirm.value = '';
  actionTargetId.value = null;
};

const confirmAction = async () => {
  if (!actionTypeToConfirm.value || !actionTargetId.value) return;
  actionLoading.value = true;
  try {
    if (actionTypeToConfirm.value === 'approve') {
      await approveAppointment(actionTargetId.value);
    } else if (actionTypeToConfirm.value === 'reject') {
      await rejectAppointment(actionTargetId.value);
    } else if (actionTypeToConfirm.value === 'complete') {
      // Open completion form instead of directly completing
      await openCompletionForm(actionTargetId.value);
    }
    showActionConfirmModal.value = false;
  } finally {
    actionLoading.value = false;
    actionTypeToConfirm.value = '';
    actionTargetId.value = null;
  }
};

// Open completion form for an appointment
const openCompletionForm = async (appointmentId) => {
  const appointment = appointments.value.find(a => a.id === appointmentId);
  if (!appointment) return;
  
  console.log('Opening completion form for appointment:', appointment);
  console.log('Appointment serviceNames:', appointment.serviceNames);
  console.log('Available service data:', servicesData.value);
  console.log('Available category data:', categoriesData.value);
  console.log('Service categories mapping:', serviceCategories.value);
  
  selectedAppointment.value = appointment;
  
  // Initialize completion form with appointment data
  completionForm.value = {
    services: appointment.serviceNames?.map(service => ({
      name: service,
      status: 'completed',
      duration: 30,
      notes: '',
      category: getServiceCategory(service) // Add category information
    })) || [],
    pets: getPetsArray(appointment).map(pet => ({
      name: pet.name,
      overallHealth: 'good',
      weight: pet.weight || '',
      healthNotes: '',
      followUpRequired: false,
      followUpNotes: ''
    })),
    generalNotes: {
      treatmentSummary: '',
      ownerInstructions: '',
      nextSteps: ''
    }
  };
  
  showCompletionFormModal.value = true;
};

// Close completion form modal
const closeCompletionFormModal = () => {
  showCompletionFormModal.value = false;
  selectedAppointment.value = null;
  completionForm.value = {
    services: [],
    pets: [],
    generalNotes: {
      treatmentSummary: '',
      ownerInstructions: '',
      nextSteps: ''
    }
  };
};

// Submit completion form
const submitCompletionForm = async () => {
  if (!selectedAppointment.value) return;
  
  completionFormLoading.value = true;
  try {
    // Create completion data object
    const completionData = {
      appointmentId: selectedAppointment.value.id,
      completedAt: new Date(),
      completedBy: authStore.user?.uid,
      services: completionForm.value.services,
      pets: completionForm.value.pets,
      generalNotes: completionForm.value.generalNotes,
      status: 'completed'
    };
    
    // Update appointment status and add completion data
    await appointmentStore.updateAppointmentStatus(selectedAppointment.value.id, 'completed');
    
    // Store completion data in a separate collection or as part of the appointment
    await storeCompletionData(completionData);
    
    // 🔧 NEW: Check if this appointment has vaccination services and generate vaccination records
    try {
      await processVaccinationAppointment(selectedAppointment.value, completionData);
    } catch (vaccinationError) {
      console.error('Error processing vaccination appointment:', vaccinationError);
      // Don't fail the completion if vaccination processing fails
    }
    
    // Send notification to the user about appointment completion
    try {
      await sendAppointmentNotification(selectedAppointment.value.id, 'complete', 'completed');
      
      // Send notification to the vet about their action
      await sendVetNotification(selectedAppointment.value.id, 'complete', 'completed');
      
      // Send additional detailed completion notification with summary
      await sendDetailedCompletionNotification(selectedAppointment.value.id, completionData);
      

    } catch (notificationError) {
      console.error('Error sending completion notification:', notificationError);
      // Don't fail the completion if notification fails
    }
    
    // Show success message
    successTitle.value = 'Appointment Completed';
    successMessage.value = 'The appointment has been marked as completed with detailed notes.';
    showSuccessModal.value = true;
    
    // Close modal and refresh data
    closeCompletionFormModal();
    await fetchAppointments();
    
  } catch (error) {
    console.error('Error completing appointment:', error);
    // Show error message
    successTitle.value = 'Error';
    successMessage.value = 'Failed to complete appointment. Please try again.';
    showSuccessModal.value = true;
  } finally {
    completionFormLoading.value = false;
  }
};

// Store completion data (you can modify this to store in your preferred location)
const storeCompletionData = async (completionData) => {
  try {
    // For now, we'll store this in the appointment document itself
    // You might want to create a separate 'appointment_completions' collection
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    const appointmentRef = doc(db, 'appointments', completionData.appointmentId);
    await updateDoc(appointmentRef, {
      status: 'completed',
      completedAt: completionData.completedAt,
      completedBy: completionData.completedBy,
      completionData: {
        services: completionData.services,
        pets: completionData.pets,
        generalNotes: completionData.generalNotes
      }
    });
  } catch (error) {
    console.error('Error storing completion data:', error);
    throw error;
  }
};

// 🔧 NEW: Process vaccination appointments and generate autoscheduling suggestions
const processVaccinationAppointment = async (appointment, completionData) => {
  try {
    console.log('🔍 Checking if appointment has vaccination services...');
    
    // Get the appointment's services
    const appointmentServices = appointment.services || [];
    if (appointmentServices.length === 0) {
      console.log('❌ No services found in appointment');
      return;
    }
    
    // Get service details to check if any are vaccination services
    const serviceDetails = await fetchVaccinationServiceDetails(appointmentServices);
    const hasVaccinationServices = serviceDetails.some(service => 
      service.isVaccination === true ||
      service.name?.toLowerCase().includes('vaccination') ||
      service.name?.toLowerCase().includes('vaccine') ||
      service.name?.toLowerCase().includes('shot')
    );
    
    if (!hasVaccinationServices) {
      console.log('❌ No vaccination services found in appointment');
      return;
    }
    
    console.log('🩺 Vaccination services detected, processing...');
    
    // Get pet details
    const petIds = appointment.petIds || [appointment.petId];
    if (petIds.length === 0) {
      console.log('❌ No pets found in appointment');
      return;
    }
    
    // Get user details
    const userId = appointment.userId;
    if (!userId) {
      console.log('❌ No user ID found in appointment');
      return;
    }
    
    // Process each pet
    for (const petId of petIds) {
      try {
        // Get pet details
        const petDoc = await getDoc(doc(db, 'pets', petId));
        if (!petDoc.exists()) {
          console.log(`❌ Pet ${petId} not found`);
          continue;
        }
        
        const pet = { id: petId, ...petDoc.data() };
        
        // Generate vaccination record with autoscheduling
        const result = await generateVaccinationRecordWithAutoScheduling(
          appointment, 
          pet, 
          serviceDetails, 
          { id: userId }
        );
        
        if (result.vaccinationRecord) {
          // Add vaccination record to pet
          await addVaccinationToPet(petId, result.vaccinationRecord);
          console.log(`✅ Vaccination record added for pet ${pet.name || petId}`);
          
          if (result.autoScheduled) {
            console.log(`✅ Auto-scheduled ${result.newSuggestions.length} vaccination appointments`);
            console.log('🎯 Created appointments:', result.newSuggestions);
          }
        }
        
      } catch (petError) {
        console.error(`Error processing pet ${petId}:`, petError);
      }
    }
    
  } catch (error) {
    console.error('Error processing vaccination appointment:', error);
    throw error;
  }
};

// Helper function to fetch service details for vaccination processing
const fetchVaccinationServiceDetails = async (serviceIds) => {
  try {
    const serviceDetails = [];
    for (const serviceId of serviceIds) {
      if (servicesData.value[serviceId]) {
        serviceDetails.push(servicesData.value[serviceId]);
      }
    }
    return serviceDetails;
  } catch (error) {
    console.error('Error fetching service details:', error);
    return [];
  }
};

// 🔧 NEW: Handle appointment ID from query parameter when redirected from queue
const handleAppointmentFromQuery = async () => {
  try {
    // Check if there's an appointment ID in the query parameter
    const appointmentId = route.query.id;
    
    if (!appointmentId) {
      console.log('No appointment ID in query parameters');
      return;
    }
    
    console.log('🔍 Found appointment ID in query:', appointmentId);
    console.log('🔍 Current route query:', route.query);
    console.log('🔍 Current route path:', route.path);
    
    // Wait for appointments to be loaded with retry logic
    let retryCount = 0;
    const maxRetries = 10;
    
    while (appointments.value.length === 0 && retryCount < maxRetries) {
      console.log(`Appointments not loaded yet, waiting... (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      retryCount++;
    }
    
    if (appointments.value.length === 0) {
      console.log('❌ Appointments still not loaded after retries');
      return;
    }
    
    console.log('🔍 Appointments loaded, count:', appointments.value.length);
    console.log('🔍 Available appointment IDs:', appointments.value.map(a => a.id));
    
    // Find the specific appointment
    const targetAppointment = appointments.value.find(appt => appt.id === appointmentId);
    
    if (!targetAppointment) {
      console.log('❌ Appointment not found:', appointmentId);
      console.log('🔍 First few appointments:', appointments.value.slice(0, 3).map(a => ({ id: a.id, ownerName: a.ownerName, petName: a.petName })));
      return;
    }
    
    console.log('✅ Found target appointment:', targetAppointment.ownerName, targetAppointment.petName);
    
    // Auto-filter to show only this appointment's status
    if (targetAppointment.status) {
      filters.value.status = targetAppointment.status;
      console.log('🔧 Auto-filtered to status:', targetAppointment.status);
    }
    
    // Auto-filter to show only this appointment's service category
    if (targetAppointment.serviceCategoryId) {
      categoryFilter.value = targetAppointment.serviceCategoryId;
      console.log('🔧 Auto-filtered to category:', targetAppointment.serviceCategoryId);
    }
    
    // Wait for DOM to be updated and then scroll to the appointment
    await nextTick();
    // Add a small delay to ensure DOM is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('🔍 About to scroll to appointment:', appointmentId);
    scrollToAppointment(appointmentId);
    
    // Show a notification that the appointment was found
    showAppointmentFoundNotification(targetAppointment);
    
  } catch (error) {
    console.error('Error handling appointment from query:', error);
  }
};

// 🔧 NEW: Scroll to specific appointment in the table
const scrollToAppointment = (appointmentId) => {
  try {
    console.log('🔍 Looking for appointment element with data-appointment-id:', appointmentId);
    
    // Find the appointment row element
    const appointmentRow = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
    
    if (appointmentRow) {
      console.log('✅ Found appointment row element:', appointmentRow);
      
      // Scroll to the appointment row
      appointmentRow.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight effect
      appointmentRow.classList.add('highlight-appointment');
      console.log('🎨 Added highlight class to appointment row');
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        appointmentRow.classList.remove('highlight-appointment');
        console.log('🎨 Removed highlight class from appointment row');
      }, 3000);
      
      console.log('✅ Scrolled to appointment:', appointmentId);
    } else {
      console.log('❌ Appointment row element not found in DOM');
      console.log('🔍 Available data-appointment-id elements:', 
        Array.from(document.querySelectorAll('[data-appointment-id]')).map(el => el.getAttribute('data-appointment-id'))
      );
    }
  } catch (error) {
    console.error('Error scrolling to appointment:', error);
  }
};

// 🔧 NEW: Show notification that appointment was found
const showAppointmentFoundNotification = (appointment) => {
  try {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <div class="font-medium">Appointment Found!</div>
          <div class="text-sm opacity-90">${appointment.ownerName} - ${appointment.petName}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
    
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Legacy completeAppointment function (for backward compatibility)
// const completeAppointment = async (appointmentId) => {
//   try {
//     await appointmentStore.updateAppointmentStatus(appointmentId, 'completed');
    
//     // Show success message
//     successTitle.value = 'Appointment Completed';
//     successMessage.value = 'The appointment has been marked as completed.';
//     showSuccessModal.value = true;
    
//     // Refresh appointments
//     await fetchAppointments();
//   } catch (error) {
//     console.error('Error completing appointment:', error);
//     successTitle.value = 'Error';
//     successMessage.value = 'Failed to complete appointment. Please try again.';
//     showSuccessModal.value = true;
//   }
// };

// Action type tracking
const pendingAction = ref(null);

// Store original status for each appointment in processing
const originalStatuses = ref({});

// Appointments data - Initialize with an empty array
const appointments = ref([]);

// Multi-step approval form state
const showApprovalForm = ref(false);
const approvalStep = ref(0);
const approvalSteps = [
{
  id: 'owner', // Changed from 'client' to 'owner'
  label: 'Owner', // Changed from 'Client' to 'Owner'
  icon: UserIcon,
  description: 'Review owner information' // Changed from 'client' to 'owner'
},
{
  id: 'pet',
  label: 'Pet',
  icon: PawPrintIcon,
  description: 'Review pet information'
},
{
  id: 'schedule',
  label: 'Schedule',
  icon: CalendarDaysIcon,
  description: 'Review appointment schedule'
},
{
  id: 'confirm',
  label: 'Confirm',
  icon: CheckIcon,
  description: 'Review and confirm approval'
}
];



// Bulk actions state
const selectedAppointments = ref(new Set());
const showBulkActions = ref(false);
const bulkActionLoading = ref(false);
const showBulkActionModal = ref(false);
const bulkActionType = ref(''); // 'approve' or 'reject'
const bulkActionReason = ref('');
const bulkActionError = ref('');

// Auto-Reschedule state
const showAutoReschedulePanel = ref(false);
const reschedulingAppointment = ref(null);
const autoRescheduleLoading = ref(false);
const vetSchedule = ref(null);
const serviceDetails = ref([]);
const futureAppointments = ref([]);
const autoRescheduleOptions = ref([]);
const selectedAutoOption = ref('');
const selectedAutoRescheduleDate = ref('');
const selectedAutoRescheduleTime = ref('');
const selectedTimePeriod = ref('AM');
const selectedDate = ref('');
const showDatePicker = ref(false);
const rescheduleReason = ref('');
const currentMonth = ref(new Date());
const tempSelectedDate = ref('');
const showAppointmentDetailsModal = ref(false);

// Pet medical history
const petMedicalHistory = ref([]);

// Current approval step
const currentApprovalStep = computed(() => approvalSteps[approvalStep.value]);

// Search input class
const searchInputClass = "w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200";

// Helper function to check if an appointment has a pet
const hasPet = (appointment) => {
// Check for petIds array
if (appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 0) {
  return true;
}

// Check for single petId
if (appointment.petId && typeof appointment.petId === 'string' && appointment.petId.trim() !== '') {
  return true;
}

// Check for petName (as a fallback)
if (appointment.petName && typeof appointment.petName === 'string' && appointment.petName.trim() !== '') {
  return true;
}

return false;
};

// Helper function to check if an appointment has multiple pets
const hasMultiplePets = (appointment) => {
return appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 1;
};

// Helper function to get the number of pets
const getPetCount = (appointment) => {
if (appointment.petIds && Array.isArray(appointment.petIds)) {
  return appointment.petIds.length;
} else if (appointment.petId || appointment.petName) {
  return 1;
}
return 0;
};

// Helper function to get an array of pet objects for display
const getPetsArray = (appointment) => {
const pets = [];

// If we have petNames and petSpeciesArray, use those
if (appointment.petNames && Array.isArray(appointment.petNames)) {
  appointment.petNames.forEach((name, index) => {
    pets.push({
      name: name,
      species: appointment.petSpeciesArray && appointment.petSpeciesArray[index] ? appointment.petSpeciesArray[index] : 'Unknown',
      breed: appointment.petBreeds && appointment.petBreeds[index] ? appointment.petBreeds[index] : '',
      gender: appointment.petGenders && appointment.petGenders[index] ? appointment.petGenders[index] : '',
      weight: appointment.petWeights && appointment.petWeights[index] ? appointment.petWeights[index] : '',
      age: appointment.petAges && appointment.petAges[index] ? appointment.petAges[index] : null,
      photo: appointment.petPhotos && appointment.petPhotos[index] ? appointment.petPhotos[index] : null
    });
  });
} 
// If we have a single pet, add it
else if (appointment.petName) {
  pets.push({
    name: appointment.petName,
    species: appointment.petSpecies || 'Unknown',
    breed: appointment.petBreed || '',
    gender: appointment.petGender || '',
    weight: appointment.petWeight || '',
    age: {
      years: appointment.petAgeYears || 0,
      months: appointment.petAgeMonths || 0,
      weeks: appointment.petAgeWeeks || 0
    },
    photo: appointment.petPhotoURL || null
  });
}

return pets;
};

// Helper function to group pets by species
const getPetGroups = (appointment) => {
// If there are no pet arrays, return empty array
if (!appointment.petNames || !appointment.petSpeciesArray) {
  return [];
}

// Create a map to group pets by species
const speciesGroups = new Map();

// Process each pet
appointment.petNames.forEach((name, index) => {
  const species = appointment.petSpeciesArray[index] || 'Unknown';
  
  // If this species doesn't exist in the map yet, create it
  if (!speciesGroups.has(species)) {
    speciesGroups.set(species, {
      species: species,
      indices: [] // Store the indices of pets in this group
    });
  }
  
  // Add this pet's index to the group
  speciesGroups.get(species).indices.push(index);
});

// Convert the map to an array
return Array.from(speciesGroups.values());
};

// Format pet details from a pet object
const formatPetDetailsFromObject = (pet) => {
let details = [];

// Only include breed and age years in the display
if (pet.breed) details.push(pet.breed);

// Format age - only include years
const years = pet.age?.years || 0;
if (years > 0) details.push(`${years} year${years > 1 ? 's' : ''}`);

return details.length > 0 ? details.join(' • ') : 'No details available';
};

// Format pet age from a pet object
const formatPetAgeFromObject = (pet) => {
if (!pet.age) return 'Not provided';

const years = pet.age.years || 0;
const months = pet.age.months || 0;
const weeks = pet.age.weeks || 0;

const ageParts = [];
if (years > 0) ageParts.push(`${years} year${years > 1 ? 's' : ''}`);
if (months > 0) ageParts.push(`${months} month${months > 1 ? 's' : ''}`);
if (weeks > 0) ageParts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);

return ageParts.length > 0 ? ageParts.join(', ') : 'Not provided';
};

// Improved fetchAppointments function to ensure pet data is fully loaded and filter by current vet
const fetchAppointments = async () => {
initialLoading.value = true;

try {
  // First, fetch all appointments
  await appointmentStore.fetchAppointments();
  
  // Get the current user (veterinarian) ID
  const currentVetId = authStore.user?.userId;
  
  if (!currentVetId) {
    console.error('No veterinarian ID found in auth store');
    return;
  }
  
  // Get the appointments from the store and filter by the current veterinarian
  const fetchedAppointments = [...appointmentStore.appointments].filter(appointment => {
    // Only include appointments assigned to this veterinarian
    return appointment.doctorId === currentVetId;
  });
  
  console.log(`Filtered ${fetchedAppointments.length} appointments for veterinarian ID: ${currentVetId}`);
  
  // Create an array to hold all the promises for data fetching
  const dataFetchPromises = [];
  
  // Process each appointment to prepare data fetching
  fetchedAppointments.forEach(appointment => {
    // Reset any processing states that might have been left over
    if (appointment.status === 'processing') {
      const originalStatus = originalStatuses.value[appointment.id] || 'pending';
      const resetPromise = appointmentStore.updateAppointmentStatus(appointment.id, originalStatus)
        .then(() => {
          appointment.status = originalStatus;
        })
        .catch(error => {
          console.error(`Error resetting processing state for appointment ${appointment.id}:`, error);
          // Fallback: update local state only
          appointment.status = originalStatus;
        });
      dataFetchPromises.push(resetPromise);
    }
    
    // Prepare to fetch owner information
    if (appointment.userId && appointment.userId !== 'guest-user') {
      const ownerPromise = profileStore.fetchUserProfile(appointment.userId)
        .then(userProfile => {
          if (userProfile) {
            // Update the appointment with owner information
            appointment.ownerName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
            appointment.ownerAvatar = userProfile.photoURL || null;
            appointment.contactInformation = userProfile.phone || userProfile.email || '';
            appointment.ownerEmail = userProfile.email || '';
            
            // Add additional owner information
            appointment.firstName = userProfile.firstName || '';
            appointment.lastName = userProfile.lastName || '';
            appointment.dateOfBirth = userProfile.dateOfBirth || '';
            appointment.age = userProfile.age || '';
            appointment.gender = userProfile.gender || '';
            appointment.streetAddress = userProfile.streetAddress || '';
          }
        })
        .catch(error => {
          console.error(`Error fetching user profile for appointment ${appointment.id}:`, error);
        });
      
      dataFetchPromises.push(ownerPromise);
    }
    
    // Handle multiple pets or no pets
    if (appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 0) {
      // Initialize arrays to store pet data
      appointment.petNames = [];
      appointment.petPhotos = [];
      appointment.petSpeciesArray = []; // Changed from petSpecies to petSpeciesArray to avoid conflicts
      appointment.petBreeds = [];
      appointment.petGenders = [];
      appointment.petWeights = [];
      appointment.petAges = [];
      
      // Fetch data for each pet
      appointment.petIds.forEach((petId, index) => {
        if (petId && typeof petId === 'string' && petId.trim() !== '') {
          const petPromise = petsStore.getPetById(appointment.userId, petId)
            .then(petData => {
              if (petData) {
                // Add pet data to arrays
                appointment.petNames[index] = petData.name || 'Unnamed Pet';
                appointment.petPhotos[index] = petData.photoURL || null;
                appointment.petSpeciesArray[index] = petData.species || ''; // Use petSpeciesArray instead
                appointment.petBreeds[index] = petData.breed || '';
                appointment.petGenders[index] = petData.gender || '';
                appointment.petWeights[index] = petData.weight || '';
                
                // Handle different age structures
                if (petData.ageYears !== undefined || petData.ageMonths !== undefined || petData.ageWeeks !== undefined) {
                  appointment.petAges[index] = {
                    years: petData.ageYears,
                    months: petData.ageMonths,
                    weeks: petData.ageWeeks
                  };
                } else if (petData.age && typeof petData.age === 'object') {
                  appointment.petAges[index] = {
                    years: petData.age.years,
                    months: petData.age.months,
                    weeks: petData.age.weeks
                  };
                }
                
                // Set the first pet's data as the main pet data for backward compatibility
                if (index === 0) {
                  appointment.petName = petData.name || 'Unnamed Pet';
                  appointment.petPhotoURL = petData.photoURL || null;
                  appointment.petSpecies = petData.species || ''; // Keep this for backward compatibility
                  appointment.petBreed = petData.breed || '';
                  appointment.petGender = petData.gender || '';
                  appointment.petWeight = petData.weight || '';
                  
                  // Handle different age structures
                  if (petData.ageYears !== undefined || petData.ageMonths !== undefined || petData.ageWeeks !== undefined) {
                    appointment.petAgeYears = petData.ageYears;
                    appointment.petAgeMonths = petData.ageMonths;
                    appointment.petAgeWeeks = petData.ageWeeks;
                  } else if (petData.age && typeof petData.age === 'object') {
                    appointment.petAgeYears = petData.age.years;
                    appointment.petAgeMonths = petData.age.months;
                    appointment.petAgeWeeks = petData.age.weeks;
                  }
                }
              }
            })
            .catch(error => {
              console.error(`Error fetching pet data for appointment ${appointment.id}, pet ${petId}:`, error);
            });
          
          dataFetchPromises.push(petPromise);
        }
      });
    } else if (appointment.petId) {
      // Handle single pet case for backward compatibility
      const isValidPetId = typeof appointment.petId === 'string' && appointment.petId.trim() !== '';
      
      if (isValidPetId) {
        const petPromise = petsStore.getPetById(appointment.userId, appointment.petId)
          .then(petData => {
            if (petData) {
              appointment.petName = petData.name || 'Unnamed Pet';
              appointment.petPhotoURL = petData.photoURL || null;
              appointment.petSpecies = petData.species || '';
              appointment.petBreed = petData.breed || '';
              appointment.petGender = petData.gender || '';
              appointment.petWeight = petData.weight || '';
              
              // Initialize arrays for backward compatibility
              appointment.petNames = [petData.name || 'Unnamed Pet'];
              appointment.petPhotos = [petData.photoURL || null];
              appointment.petSpeciesArray = [petData.species || '']; // Use petSpeciesArray instead
              
              // Handle different age structures
              if (petData.ageYears !== undefined || petData.ageMonths !== undefined || petData.ageWeeks !== undefined) {
                appointment.petAgeYears = petData.ageYears;
                appointment.petAgeMonths = petData.ageMonths;
                appointment.petAgeWeeks = petData.ageWeeks;
              } else if (petData.age && typeof petData.age === 'object') {
                appointment.petAgeYears = petData.age.years;
                appointment.petAgeMonths = petData.age.months;
                appointment.petAgeWeeks = petData.age.weeks;
              }
            }
          })
          .catch(error => {
            console.error(`Error fetching pet data for appointment ${appointment.id}:`, error);
            // Set default pet data to prevent UI issues
            appointment.petPhotoURL = null;
            appointment.petSpecies = 'Unknown';
            appointment.petBreed = '';
            appointment.petGender = '';
            appointment.petWeight = '';
            appointment.petAgeYears = 0;
            appointment.petAgeMonths = 0;
            appointment.petAgeWeeks = 0;
          });
        
        dataFetchPromises.push(petPromise);
      } else {
        console.warn(`Invalid petId for appointment ${appointment.id}: ${appointment.petId}`);
        // Set default pet data
        appointment.petPhotoURL = null;
        appointment.petSpecies = 'Unknown';
        appointment.petBreed = '';
        appointment.petGender = '';
        appointment.petWeight = '';
        appointment.petAgeYears = 0;
        appointment.petAgeMonths = 0;
        appointment.petAgeWeeks = 0;
      }
    } else {
      // No pet case
      appointment.petName = null;
      appointment.petPhotoURL = null;
      appointment.petSpecies = null;
      appointment.petNames = [];
    }
  });

  // Wait for ALL data fetching to complete before updating the UI
  await Promise.allSettled(dataFetchPromises);

  // Now that all data is fetched, update the appointments ref
  appointments.value = fetchedAppointments;

} catch (error) {
  console.error('Error fetching appointments:', error);
} finally {
  // Only set loading to false after ALL data is fetched
  initialLoading.value = false;
}
};

// Initialize component
onMounted(async () => {
  try {
  await fetchServiceData(); // Fetch service categories and services
  await fetchAppointments();
  } catch (error) {
    console.error('Error during initialization:', error);
    // Still try to fetch appointments even if service data fails
    try {
      await fetchAppointments();
    } catch (appointmentError) {
      console.error('Failed to fetch appointments:', appointmentError);
    }
  }
  
  // 🔧 NEW: Also handle query parameters on mount as fallback
  await handleAppointmentFromQuery();
  
  // Action menu functionality removed - no action menus implemented in this component
});

// Clean up when component is unmounted
onBeforeUnmount(() => {
// Reset any processing states when leaving the page
resetProcessingStates();
});

// Clean up when component is unmounted
onUnmounted(() => {
// Clean up any event listeners or resources
});

// Handle Vue keep-alive activation/deactivation
onActivated(() => {
console.log('🔄 Component activated - onActivated hook called');
// When the component is activated (comes back into view)
// Reset any processing states and refresh data
resetProcessingStates();
fetchAppointments(); // Always fetch fresh data when coming back to this view
// Also handle query parameters when coming back to the page
console.log('🔄 Calling handleAppointmentFromQuery from onActivated');
handleAppointmentFromQuery();
});

onDeactivated(() => {
// When the component is deactivated (hidden but kept alive)
// Reset any processing states
resetProcessingStates();
});

// Reset all processing states
const resetProcessingStates = async () => {
// Find all appointments with processing status
const processingAppointments = appointments.value.filter(a => a.status === 'processing');

for (const appointment of processingAppointments) {
  // Get the original status (default to 'pending' if not found)
  const originalStatus = originalStatuses.value[appointment.id] || 'pending';
  
  try {
    // Update in Firestore
    await appointmentStore.updateAppointmentStatus(appointment.id, originalStatus);
    
    // Update local state
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index].status = originalStatus;
    }
  } catch (error) {
    console.error(`Error resetting processing state for appointment ${appointment.id}:`, error);
  }
}

// Clear the original statuses tracking
originalStatuses.value = {};
};

// Toggle filters visibility
const toggleFilters = () => {
showFilters.value = !showFilters.value;
};

// Manual refresh handler
const handleRefresh = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await fetchAppointments();
  } finally {
    isLoading.value = false;
  }
};



// Status filter functions
const toggleStatusFilter = (status) => {
if (status === 'All') {
  filters.value.status = '';
} else {
  filters.value.status = status;
}
showFilters.value = false;
currentPage.value = 1;
// Don't reset category filter - let them work together
};



// Category filter functions
const setCategoryFilter = () => {
  currentPage.value = 1;
  // Don't reset status filter - let them work together
};

// Helper function to get category name by ID
const getCategoryName = (categoryId) => {
  if (categoryId === 'all') return 'All Categories';
  const category = categoriesData.value[categoryId];
  return category ? category.name : 'Unknown Category';
};

// Clear all filters function - clears both status and category filters
const clearAllFilters = () => {
  filters.value.status = '';
  categoryFilter.value = 'all';
  currentPage.value = 1;
};

// Clear only status filter - keeps category filter active
const clearStatusFilterOnly = () => {
  filters.value.status = '';
  currentPage.value = 1;
};

// Clear only category filter - keeps status filter active
const clearCategoryFilterOnly = () => {
  categoryFilter.value = 'all';
  currentPage.value = 1;
};



// Modified formatPetDetails function to only show breed and year
const formatPetDetails = (appointment) => {
let details = [];

// Only include breed and age years in the sidebar display
if (appointment.petBreed) details.push(appointment.petBreed);

// Format age - only include years
const years = appointment.petAgeYears || 0;
if (years > 0) details.push(`${years} year${years > 1 ? 's' : ''}`);

return details.length > 0 ? details.join(' • ') : 'No details available';
};

// Format pet age for display
const formatPetAge = (appointment) => {
const years = appointment.petAgeYears || 0;
const months = appointment.petAgeMonths || 0;
const weeks = appointment.petAgeWeeks || 0;

const ageParts = [];
if (years > 0) ageParts.push(`${years} year${years > 1 ? 's' : ''}`);
if (months > 0) ageParts.push(`${months} month${months > 1 ? 's' : ''}`);
if (weeks > 0) ageParts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);

return ageParts.length > 0 ? ageParts.join(', ') : 'Not provided';
};

const formatGender = (gender) => {
if (gender === 'male') return 'Male';
if (gender === 'female') return 'Female';
if (gender === 'unknown') return 'Unknown';
return gender;
};

const formatDate = (dateString) => {
if (!dateString) return 'N/A';

console.log('formatDate input:', dateString, typeof dateString);

let date;
if (typeof dateString === 'string') {
  // Handle ISO string
  date = parseISO(dateString);
} else if (dateString instanceof Date) {
  // Handle Date object
  date = dateString;
} else {
  return 'Invalid date';
}

console.log('formatDate parsed date:', date);
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const result = date.toLocaleDateString(undefined, options);
console.log('formatDate result:', result);
return result;
};

const formatDateTime = (dateString) => {
if (!dateString) return 'N/A';

let date;
if (typeof dateString === 'string') {
  // Handle ISO string
  date = parseISO(dateString);
} else if (dateString instanceof Date) {
  // Handle Date object
  date = dateString;
} else {
  return 'Unknown';
}

return format(date, 'MMM d, yyyy h:mm a');
};

const formatStatus = (status) => {
if (!status) return 'Unknown';

// Handle special status formatting
if (status === 'consider_rescheduling') {
  return 'Consider Rescheduling';
}

// Capitalize first letter
return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Check if appointment is expired (past scheduled time and not approved)
const isExpired = (appointment) => {
  if (appointment.status === 'approved' || appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'consider_rescheduling') {
    return false;
  }
  
  const appointmentDate = new Date(appointment.date);
  const appointmentTime = appointment.time;
  
  // Parse appointment time range (e.g., "10:10 AM - 11:20 AM")
  const timeRangeMatch = appointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  
  if (timeRangeMatch) {
    // Parse start time
    let startHour = parseInt(timeRangeMatch[1]);
    const startMinute = parseInt(timeRangeMatch[2]);
    const startPeriod = timeRangeMatch[3].toUpperCase();
    
    // Parse end time
    let endHour = parseInt(timeRangeMatch[4]);
    const endMinute = parseInt(timeRangeMatch[5]);
    const endPeriod = timeRangeMatch[6].toUpperCase();
    
    // Convert start time to 24-hour format
    if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
    if (startPeriod === 'AM' && startHour === 12) startHour = 0;
    
    // Convert end time to 24-hour format
    if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour = 0;
    
    // Set appointment end time (use end time to determine if expired)
    const appointmentEndDate = new Date(appointmentDate);
    appointmentEndDate.setHours(endHour, endMinute, 0, 0);
    
    // Check if appointment end time has passed
    const now = new Date();
    return appointmentEndDate < now;
  }
  
  // Fallback for single time format (e.g., "10:10 AM")
  const singleTimeMatch = appointmentTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (singleTimeMatch) {
    let hour = parseInt(singleTimeMatch[1]);
    const minute = parseInt(singleTimeMatch[2]);
    const period = singleTimeMatch[3].toUpperCase();
  
  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  // Set appointment time
  appointmentDate.setHours(hour, minute, 0, 0);
  
  // Check if appointment time has passed
  const now = new Date();
  return appointmentDate < now;
  }
  
  return false;
};

const sortBy = (key) => {
if (sortKey.value === key) {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
} else {
  sortKey.value = key;
  sortOrder.value = 'asc';
}
};

const onImageError = (event) => {
event.target.src = defaultPhotoURL.value;
};

const onPetImageError = (event) => {
event.target.src = defaultPetPhotoURL;
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
if (!dateOfBirth) return null;

const birthDate = new Date(dateOfBirth);
const today = new Date();

let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();

if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

return age;
};

// Fix for duplicate data - use a Set to track unique appointment IDs
const filteredAndSortedAppointments = computed(() => {
// Create a Map to store unique appointments by ID
const uniqueAppointments = new Map();

// Process each appointment from the filtered appointments
filteredAppointments.value.forEach(appointment => {
  // Check if it matches the search criteria
  const matchesSearch =
    (appointment.ownerName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.ownerEmail?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.petName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.petSpecies?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.contactInformation?.toLowerCase() || '').includes(search.value.toLowerCase());

  // Only add to the map if it matches search criteria and isn't already there
  if (matchesSearch) {
    uniqueAppointments.set(appointment.id, appointment);
  }
});

// Convert the Map values to an array
let filtered = Array.from(uniqueAppointments.values());

// Sort the filtered appointments
return filtered.sort((a, b) => {
  let aValue = a[sortKey.value];
  let bValue = b[sortKey.value];

  if (sortKey.value === 'date') {
    aValue = new Date(a.date);
    bValue = new Date(b.date);
  } else if (sortKey.value === 'createdAt') {
    aValue = new Date(a.createdAt);
    bValue = new Date(b.createdAt);
  } else if (sortKey.value === 'updatedAt') {
    aValue = new Date(a.updatedAt);
    bValue = new Date(b.updatedAt);
  }

  if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
  if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
  return 0;
});
});

const totalPagesComputed = computed(() => {
if (!filteredAndSortedAppointments.value) {
  return 1;
}

if (itemsPerPage <= 0) {
  console.warn('itemsPerPage is set to a non-positive value. Returning 1 to avoid division by zero.');
  return 1;
}

if (filteredAndSortedAppointments.value.length === 0) {
  return 1;
}

const result = Math.ceil(filteredAndSortedAppointments.value.length / itemsPerPage);

if (isNaN(result) || !isFinite(result)) {
  console.error('Computed value of totalPages is not a valid number. Check itemsPerPage and the length of filteredAndSortedAppointments.');
  return 1;
}

return result;
});

const totalPages = computed(() => {
return totalPagesComputed.value > 0 ? totalPagesComputed.value : 1;
});

const paginatedAppointments = computed(() => {
const start = (currentPage.value - 1) * itemsPerPage;
const end = start + itemsPerPage;
return filteredAndSortedAppointments.value.slice(start, end);
});

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredAndSortedAppointments.value.length));

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

const getStatusClass = (status) => {
const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
switch (status?.toLowerCase()) {
  case 'pending':
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  case 'processing':
    return `${baseClasses} bg-blue-100 text-blue-800`;
  case 'approved':
    return `${baseClasses} bg-green-100 text-green-800`;
  case 'completed':
    return `${baseClasses} bg-purple-100 text-purple-800`;
  case 'cancelled':
  case 'rejected':
    return `${baseClasses} bg-red-100 text-red-800`;
  case 'expired':
    return `${baseClasses} bg-red-50 text-red-700 border border-red-200`;
  case 'ended':
    return `${baseClasses} bg-slate-200 text-slate-700`;
    case 'consider_rescheduling':
      return `${baseClasses} bg-orange-100 text-orange-800`;
  default:
    return `${baseClasses} bg-gray-100 text-gray-800`;
}
};

// Improved approval process to ensure complete data loading
const startApprovalProcess = async (appointment) => {
isLoading.value = true;

try {
  // Store the original status before changing to processing
  originalStatuses.value[appointment.id] = appointment.status;
  
  // Update the appointment status to processing
  const updatedAppointment = await appointmentStore.updateAppointmentStatus(appointment.id, 'processing');
  
  // Create an array to hold all the promises for data fetching
  const dataFetchPromises = [];
  
  // Fetch complete owner data if needed
  let ownerData = {};
  if (appointment.userId && appointment.userId !== 'guest-user') {
    const ownerPromise = profileStore.fetchUserProfile(appointment.userId)
      .then(userProfile => {
        if (userProfile) {
          ownerData = {
            ownerName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
            ownerAvatar: userProfile.photoURL || null,
            contactInformation: userProfile.phone || userProfile.email || '',
            ownerEmail: userProfile.email || '',
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            dateOfBirth: userProfile.dateOfBirth || '',
            age: userProfile.age || '',
            gender: userProfile.gender || '',
            streetAddress: userProfile.streetAddress || ''
          };
        }
      })
      .catch(error => {
        console.error(`Error fetching user profile:`, error);
      });
    
    dataFetchPromises.push(ownerPromise);
  }
  
  // Fetch complete pet data
  let petData = {};
  
  // Handle multiple pets
  if (appointment.petIds && Array.isArray(appointment.petIds) && appointment.petIds.length > 0) {
    // Initialize arrays to store pet data
    petData.petNames = [];
    petData.petPhotos = [];
    petData.petSpeciesArray = [];
    petData.petBreeds = [];
    petData.petGenders = [];
    petData.petWeights = [];
    petData.petAges = [];
    
    // Fetch data for each pet
    const petPromises = appointment.petIds.map((petId, index) => {
      if (petId && typeof petId === 'string' && petId.trim() !== '') {
        return petsStore.getPetById(appointment.userId, petId)
          .then(pet => {
            if (pet) {
              petData.petNames[index] = pet.name || 'Unnamed Pet';
              petData.petPhotos[index] = pet.photoURL || null;
              petData.petSpeciesArray[index] = pet.species || '';
              petData.petBreeds[index] = pet.breed || '';
              petData.petGenders[index] = pet.gender || '';
              petData.petWeights[index] = pet.weight || '';
              
              // Handle different age structures
              if (pet.ageYears !== undefined || pet.ageMonths !== undefined || pet.ageWeeks !== undefined) {
                petData.petAges[index] = {
                  years: pet.ageYears,
                  months: pet.ageMonths,
                  weeks: pet.ageWeeks
                };
              } else if (pet.age && typeof pet.age === 'object') {
                petData.petAges[index] = {
                  years: pet.age.years,
                  months: pet.age.months,
                  weeks: pet.age.weeks
                };
              }
              
              // Set the first pet's data as the main pet data for backward compatibility
              if (index === 0) {
                petData.petName = pet.name || 'Unnamed Pet';
                petData.petPhotoURL = pet.photoURL || null;
                petData.petSpecies = pet.species || '';
                petData.petBreed = pet.breed || '';
                petData.petGender = pet.gender || '';
                petData.petWeight = pet.weight || '';
                
                // Handle different age structures
                if (pet.ageYears !== undefined || pet.ageMonths !== undefined || pet.ageWeeks !== undefined) {
                  petData.petAgeYears = pet.ageYears;
                  petData.petAgeMonths = pet.ageMonths;
                  petData.petAgeWeeks = pet.ageWeeks;
                } else if (pet.age && typeof pet.age === 'object') {
                  petData.petAgeYears = pet.age.years;
                  petData.petAgeMonths = pet.age.months;
                  petData.petAgeWeeks = pet.age.weeks;
                }
              }
            }
          })
          .catch(error => {
            console.error(`Error fetching pet data for pet ${petId}:`, error);
          });
      }
      return Promise.resolve();
    });
    
    dataFetchPromises.push(...petPromises);
  } 
  // Handle single pet
  else if (appointment.petId) {
    const petPromise = petsStore.getPetById(appointment.userId, appointment.petId)
      .then(pet => {
        if (pet) {
          petData = {
            petName: pet.name || 'Unnamed Pet',
            petPhotoURL: pet.photoURL || null,
            petSpecies: pet.species || '',
            petBreed: pet.breed || '',
            petGender: pet.gender || '',
            petWeight: pet.weight || '',
            petAgeYears: pet.ageYears !== undefined ? pet.ageYears : (pet.age?.years || 0),
            petAgeMonths: pet.ageMonths !== undefined ? pet.ageMonths : (pet.age?.months || 0),
            petAgeWeeks: pet.ageWeeks !== undefined ? pet.ageWeeks : (pet.age?.weeks || 0),
            // Initialize arrays for consistency
            petNames: [pet.name || 'Unnamed Pet'],
            petPhotos: [pet.photoURL || null],
            petSpeciesArray: [pet.species || '']
          };
        }
      })
      .catch(error => {
        console.error(`Error fetching pet data:`, error);
      });
    
    dataFetchPromises.push(petPromise);
  }
  
  // Wait for ALL data fetching to complete
  await Promise.all(dataFetchPromises);
  
  // Update local state with the returned data from Firestore and additional fetched data
  if (updatedAppointment) {
    // Set the selected appointment with all data combined
    selectedAppointment.value = {
      ...updatedAppointment,
      ...ownerData,
      ...petData,
      pendingAction: 'approve'
    };
    
    // Find and update the appointment in the local array
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index] = { ...selectedAppointment.value };
    }
  }
  
  // Reset approval step to first step
  approvalStep.value = 0;
  
  // Show the approval form
  showApprovalForm.value = true;
  
} catch (error) {
  console.error(`Error starting approval process:`, error);
} finally {
  isLoading.value = false;
}
};

// Set appointment to processing status
const setProcessingStatus = async (appointment, actionType) => {
isLoading.value = true;
pendingAction.value = actionType;

try {
  // Store the original status before changing to processing
  originalStatuses.value[appointment.id] = appointment.status;
  
  // Update the appointment status to processing
  const updatedAppointment = await appointmentStore.updateAppointmentStatus(appointment.id, 'processing');
  
  // Update local state with the returned data from Firestore
  if (updatedAppointment) {
    // Find and update the appointment in the local array
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      // Replace the entire appointment object with the updated one
      appointments.value[index] = {
        ...updatedAppointment,
        // Preserve any local-only properties that might not be in Firestore
        ownerName: appointments.value[index].ownerName,
        ownerAvatar: appointments.value[index].ownerAvatar,
        ownerEmail: appointments.value[index].ownerEmail,
        contactInformation: appointments.value[index].contactInformation,
        petPhotoURL: appointments.value[index].petPhotoURL,
        petSpecies: appointments.value[index].petSpecies,
        petBreed: appointments.value[index].petBreed,
        petGender: appointments.value[index].petGender,
        petWeight: appointments.value[index].petWeight,
        petAgeYears: appointments.value[index].petAgeYears,
        petAgeMonths: appointments.value[index].petAgeMonths,
        petAgeWeeks: appointments.value[index].petAgeWeeks,
        pendingAction: actionType,
        // Preserve additional owner information
        firstName: appointments.value[index].firstName,
        lastName: appointments.value[index].lastName,
        dateOfBirth: appointments.value[index].dateOfBirth,
        age: appointments.value[index].age,
        gender: appointments.value[index].gender,
        streetAddress: appointments.value[index].streetAddress,
        // Preserve pet arrays for multiple pets
        petNames: appointments.value[index].petNames || [],
        petPhotos: appointments.value[index].petPhotos || [],
        petSpeciesArray: appointments.value[index].petSpeciesArray || [],
        petBreeds: appointments.value[index].petBreeds || [],
        petGenders: appointments.value[index].petGenders || [],
        petWeights: appointments.value[index].petWeights || [],
        petAges: appointments.value[index].petAges || []
      };
    }
  }
  
  // If this was a cancel action, open the cancel modal
  if (actionType === 'cancel') {
    selectedAppointment.value = appointment;
    showCancelModal.value = true;
  }
  
} catch (error) {
  console.error(`Error setting appointment to processing status:`, error);
} finally {
  isLoading.value = false;
}
};

// Modified cancelProcessing function to immediately update the UI
const cancelProcessing = async (appointment) => {
  isLoading.value = true;

  try {
    // Get the original status (default to 'pending' if not found)
    const originalStatus = originalStatuses.value[appointment.id] || 'pending';
    
    // Immediately update the local state first for instant UI feedback
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      // Update the status immediately in the UI
      appointments.value[index].status = originalStatus;
      appointments.value[index].pendingAction = null;
    }
    
    // Then update in Firestore (this happens in the background)
    await appointmentStore.updateAppointmentStatus(appointment.id, originalStatus);
    
    // Remove from original statuses tracking
    delete originalStatuses.value[appointment.id];
    
  } catch (error) {
    console.error('Error cancelling processing:', error);
    // If there was an error, revert the local change and show the processing status again
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index].status = 'processing';
    }
  } finally {
    isLoading.value = false;
  }
};

// Modified closeCancelModal function to immediately update the UI
const closeCancelModalHandler = async () => {
  // If we're closing the modal without completing the cancellation,
  // revert the appointment back to its original status
  if (selectedAppointment.value) {
    isLoading.value = true;
    
    try {
      // Get the original status (default to 'pending' if not found)
      const originalStatus = originalStatuses.value[selectedAppointment.value.id] || 'pending';
      
      // Immediately update the local state first for instant UI feedback
      const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
      if (index !== -1) {
        // Update the status immediately in the UI
        appointments.value[index].status = originalStatus;
        appointments.value[index].pendingAction = null;
      }
      
      // Then update in Firestore (this happens in the background)
      await appointmentStore.updateAppointmentStatus(selectedAppointment.value.id, originalStatus);
      
      // Remove from original statuses tracking
      delete originalStatuses.value[selectedAppointment.value.id];
      
    } catch (error) {
      console.error('Error reverting appointment status:', error);
      // If there was an error, revert the local change and show the processing status again
      const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
      if (index !== -1) {
        appointments.value[index].status = 'processing';
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Reset modal state
  showCancelModal.value = false;
  selectedAppointment.value = null;
  cancellationReason.value = '';
  reasonError.value = '';
};

// Modified cancelApprovalProcess function to immediately update the UI
const cancelApprovalProcessHandler = () => {
  // Revert the appointment status to its original state
  if (selectedAppointment.value) {
    // Get the original status
    const originalStatus = originalStatuses.value[selectedAppointment.value.id] || 'pending';
    
    // Immediately update the local state first for instant UI feedback
    const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
    if (index !== -1) {
      // Update the status immediately in the UI
      appointments.value[index].status = originalStatus;
      appointments.value[index].pendingAction = null;
    }
    
    // Then update in Firestore (this happens in the background)
    appointmentStore.updateAppointmentStatus(selectedAppointment.value.id, originalStatus)
      .catch(error => {
        console.error('Error reverting appointment status:', error);
      });
    
    // Remove from original statuses tracking
    delete originalStatuses.value[selectedAppointment.value.id];
  }

  // Close the approval form
  showApprovalForm.value = false;
  selectedAppointment.value = null;
};

// Modified: Cancel appointment functions

const cancelAppointment = async () => {
if (!selectedAppointment.value) return;

// Validate reason
if (!cancellationReason.value.trim()) {
  reasonError.value = 'Please provide a reason for cancellation';
  return;
}

cancelLoading.value = true;

try {
  // Update the appointment status to cancelled with reason
  await appointmentStore.updateAppointment(
    selectedAppointment.value.id, 
    {
      status: 'cancelled',
      cancellationReason: cancellationReason.value.trim(),
      cancelledBy: 'vet',
      cancelledAt: new Date()
    }
  );
  
  // Update the local state
  const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
  if (index !== -1) {
    appointments.value[index].status = 'cancelled';
    appointments.value[index].cancellationReason = cancellationReason.value.trim();
    appointments.value[index].cancelledBy = 'vet';
    appointments.value[index].cancelledAt = new Date();
    appointments.value[index].pendingAction = null;
  }
  
  // Remove from original statuses tracking
  delete originalStatuses.value[selectedAppointment.value.id];
  
  // Send notification to the user
  await sendAppointmentNotification(selectedAppointment.value.id, 'cancel', 'cancelled');
    
    // Send notification to the vet about their action
    await sendVetNotification(selectedAppointment.value.id, 'cancel', 'cancelled');
  
  // Close the modal
  showCancelModal.value = false;
  selectedAppointment.value = null;
  cancellationReason.value = '';
  reasonError.value = '';
  
  // Show success message
  successTitle.value = 'Appointment Cancelled';
  successMessage.value = 'The appointment has been cancelled successfully.';
  showSuccessModal.value = true;
} catch (err) {
  console.error('Error cancelling appointment:', err);
} finally {
  cancelLoading.value = false;
}
};

// Multi-step approval form navigation
const goToApprovalStep = (index) => {
// Only allow going to steps that have been completed or the current step
if (index <= approvalStep.value) {
  approvalStep.value = index;
}
};

const nextApprovalStep = () => {
if (approvalStep.value < approvalSteps.length - 1) {
  approvalStep.value++;
}
};

const previousApprovalStep = () => {
if (approvalStep.value > 0) {
  approvalStep.value--;
}
};

const finalizeApproval = async () => {
if (!selectedAppointment.value) return;

isLoading.value = true;

try {
  // Update the appointment status to approved with approvedAt timestamp
  await appointmentStore.updateAppointment(
    selectedAppointment.value.id, 
    {
      status: 'approved',
      approvedBy: 'vet',
      approvedAt: new Date() // Always set approvedAt when approving
    }
  );
  
  // Update the local state
  const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
  if (index !== -1) {
    appointments.value[index].status = 'approved';
    appointments.value[index].approvedBy = 'vet';
    appointments.value[index].approvedAt = new Date();
    appointments.value[index].pendingAction = null;
  }
  
  // Remove from original statuses tracking
  delete originalStatuses.value[selectedAppointment.value.id];
  
  // Send notification to the user
  await sendAppointmentNotification(selectedAppointment.value.id, 'approve', 'approved');
  
  // Send notification to the vet about their action
  await sendVetNotification(selectedAppointment.value.id, 'approve', 'approved');
  
  // Close the approval form
  showApprovalForm.value = false;
  
  // Show success message - removed mention of confirmation email
  successTitle.value = 'Appointment Approved';
  successMessage.value = 'The appointment has been approved successfully.';
  showSuccessModal.value = true;
} catch (error) {
  console.error('Error approving appointment:', error);
} finally {
  isLoading.value = false;
}
};

const closeSuccessModal = () => {
showSuccessModal.value = false;
successTitle.value = '';
successMessage.value = '';
};

// Bulk selection functions
const isAllSelected = computed(() => {
return paginatedAppointments.value.length > 0 && 
       paginatedAppointments.value.every(appt => selectedAppointments.value.has(appt.id));
});

const toggleAllSelection = () => {
if (isAllSelected.value) {
  selectedAppointments.value.clear();
} else {
  paginatedAppointments.value.forEach(appt => {
    selectedAppointments.value.add(appt.id);
  });
}
};

const toggleAppointmentSelection = (appointmentId) => {
if (selectedAppointments.value.has(appointmentId)) {
  selectedAppointments.value.delete(appointmentId);
} else {
  selectedAppointments.value.add(appointmentId);
}
};

const clearSelection = () => {
selectedAppointments.value.clear();
};



// Bulk action functions
const closeBulkActionModal = () => {
showBulkActionModal.value = false;
bulkActionType.value = '';
bulkActionReason.value = '';
bulkActionError.value = '';
};

const executeBulkAction = async () => {
if (bulkActionType.value === 'reject' && !bulkActionReason.value.trim()) {
  bulkActionError.value = 'Please provide a reason for rejection';
  return;
}

bulkActionLoading.value = true;

try {
  const selectedIds = Array.from(selectedAppointments.value);
  const promises = [];
  
  for (const appointmentId of selectedIds) {
    if (bulkActionType.value === 'approve') {
      promises.push(
        appointmentStore.updateAppointment(appointmentId, {
          status: 'approved',
          approvedBy: 'vet',
          approvedAt: new Date(),
          updatedAt: new Date()
        })
      );
    } else if (bulkActionType.value === 'reject') {
      promises.push(
        appointmentStore.updateAppointment(appointmentId, {
          status: 'cancelled',
          cancellationReason: bulkActionReason.value.trim(),
          cancelledBy: 'vet',
          cancelledAt: new Date(),
          updatedAt: new Date()
        })
      );
    }
  }
  
  await Promise.all(promises);
  
  // Update local state
  selectedIds.forEach(appointmentId => {
    const index = appointments.value.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      if (bulkActionType.value === 'approve') {
        appointments.value[index].status = 'approved';
        appointments.value[index].approvedBy = 'vet';
        appointments.value[index].approvedAt = new Date();
        appointments.value[index].updatedAt = new Date();
      } else if (bulkActionType.value === 'reject') {
        appointments.value[index].status = 'cancelled';
        appointments.value[index].cancellationReason = bulkActionReason.value.trim();
        appointments.value[index].cancelledBy = 'vet';
        appointments.value[index].cancelledAt = new Date();
        appointments.value[index].updatedAt = new Date();
      }
    }
  });
  
  // Send notifications for each appointment
  const notificationPromises = selectedIds.map(appointmentId => {
    const action = bulkActionType.value === 'approve' ? 'approve' : 'reject';
    const status = bulkActionType.value === 'approve' ? 'approved' : 'rejected';
    return Promise.all([
      sendAppointmentNotification(appointmentId, action, status),
      sendVetNotification(appointmentId, action, status)
    ]);
  });
  
  // Wait for all notifications to be sent
  await Promise.all(notificationPromises);
  
  // Clear selection and close modal
  selectedAppointments.value.clear();
  closeBulkActionModal();
  
  // Show success message
  successTitle.value = bulkActionType.value === 'approve' ? 'Appointments Approved' : 'Appointments Rejected';
  successMessage.value = `${selectedIds.length} appointment${selectedIds.length > 1 ? 's' : ''} have been ${bulkActionType.value === 'approve' ? 'approved' : 'rejected'} successfully.`;
  showSuccessModal.value = true;
  
} catch (error) {
  console.error('Error executing bulk action:', error);
  bulkActionError.value = 'An error occurred while processing the appointments.';
} finally {
  bulkActionLoading.value = false;
}
};

const exportToCSV = () => {
isLoading.value = true;

setTimeout(() => {
  const csvHeaders = [
    'Owner Name',
    'Owner Email',
    'Contact',
    'Pet Name(s)',
    'Pet Species',
    'Pet Details',
    'Date',
    'Time',
    'Services',
    'Status',
    'Cancellation Reason',
    'Cancelled By',
    'Created',
    'Updated',
  ];
  
  // Helper function to format pet names and species for CSV
  const formatPetsForCSV = (appointment) => {
    // For appointments with grouped pets
    if (appointment.petNames && appointment.petSpeciesArray) {
      // Group pets by species
      const speciesGroups = new Map();
      
      appointment.petNames.forEach((name, index) => {
        const species = appointment.petSpeciesArray[index] || 'Unknown';
        
        if (!speciesGroups.has(species)) {
          speciesGroups.set(species, []);
        }
        
        speciesGroups.get(species).push(name);
      });
      
      // Format each group as "name1, name2 (Species)"
      const formattedGroups = [];
      speciesGroups.forEach((names, species) => {
        formattedGroups.push(`${names.join(', ')} (${species})`);
      });
      
      return {
        names: formattedGroups.join('; '),
        species: Array.from(speciesGroups.keys()).join('; ')
      };
    } 
    // For single pet appointments
    else if (appointment.petName) {
      return {
        names: appointment.petName,
        species: appointment.petSpecies || ''
      };
    }
    // No pets
    else {
      return {
        names: 'No Pet',
        species: ''
      };
    }
  };
  
  const csvContent = [
    csvHeaders.join(','),
    ...filteredAndSortedAppointments.value.map(appointment => {
      const petInfo = formatPetsForCSV(appointment);
      
      return [
        appointment.ownerName || 'Unknown Owner',
        appointment.ownerEmail || '',
        appointment.contactInformation || '',
        petInfo.names,
        petInfo.species,
        formatPetDetails(appointment),
        formatDate(appointment.date),
        appointment.time,
        appointment.services?.map(serviceId => getServiceDisplayName(serviceId)).join('; ') || '',
        appointment.status,
        appointment.cancellationReason || '',
        appointment.cancelledBy || '',
        formatDateTime(appointment.createdAt),
        formatDateTime(appointment.updatedAt), // Updated to show date and time
      ].map(field => `"${field}"`).join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'veterinary-appointments.csv';
  link.click();

  isLoading.value = false;
}, 1000);
};

// Ensure useRoute and useRouter are called unconditionally
const currentRoute = useRoute();
const vueRouter = useRouter();

// Reschedule request functions
const openRescheduleRequestPanel = async (appointment) => {
  reschedulingAppointment.value = { ...appointment };
  showAutoReschedulePanel.value = true;
  
  // Reset form
  selectedAutoOption.value = '';
  selectedAutoRescheduleDate.value = '';
  selectedAutoRescheduleTime.value = '';
  selectedTimePeriod.value = 'AM';
  selectedDate.value = '';
  tempSelectedDate.value = '';
  currentMonth.value = new Date();
  rescheduleReason.value = '';
  
  // Fetch required data
  await Promise.all([
    fetchVetSchedule(),
    fetchServiceDetails(appointment.services || []),
    fetchFutureAppointments()
  ]);
};

// Open cancel modal for an approved appointment directly from card
const openCancelModal = (appointment) => {
  selectedAppointment.value = { ...appointment };
  cancellationReason.value = '';
  reasonError.value = '';
  showCancelModal.value = true;
};

const closeAutoReschedulePanel = () => {
  showAutoReschedulePanel.value = false;
  reschedulingAppointment.value = null;
  vetSchedule.value = null;
  serviceDetails.value = [];
  futureAppointments.value = [];
  autoRescheduleOptions.value = [];
  selectedAutoOption.value = '';
  selectedAutoRescheduleDate.value = '';
  selectedAutoRescheduleTime.value = '';
  selectedDate.value = '';
  showDatePicker.value = false;
  tempSelectedDate.value = '';
  currentMonth.value = new Date();
  rescheduleReason.value = '';
};





// ========================================
// CALENDAR HELPER FUNCTIONS
// ========================================

const isWorkingDay = (date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const schedule = vetSchedule.value?.schedule || '';
  
  if (schedule.includes('Mon-Fri')) {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  } else if (schedule.includes('Mon-Sat')) {
    return dayOfWeek >= 1 && dayOfWeek <= 6;
  }
  
  return true; // Default to working day if no schedule specified
};

const previousMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
};

const selectCalendarDate = (day) => {
  if (day.isPast || !day.isWorkingDay) return;
  
  console.log('Selected calendar day:', day);
  console.log('Day date:', day.date);
  tempSelectedDate.value = day.date;
};

const confirmDateSelection = () => {
  if (tempSelectedDate.value) {
    console.log('Confirming date selection:', tempSelectedDate.value);
    selectedDate.value = tempSelectedDate.value;
    selectedAutoOption.value = '';
    selectedAutoRescheduleTime.value = '';
    
    // Generate time options for selected date
    generateTimeOptionsForDate(tempSelectedDate.value);
    
    // Close the date picker
    showDatePicker.value = false;
    tempSelectedDate.value = '';
  }
};

// ========================================
// EXPANDABLE APPOINTMENT DETAILS FUNCTIONS
// ========================================

const toggleAppointmentDetails = (appointmentId) => {
  if (expandedAppointment.value === appointmentId) {
    expandedAppointment.value = null;
  } else {
    expandedAppointment.value = appointmentId;
  }
};

const selectPetForHistory = (appointmentId, petIdOrName) => {
  selectedPetForHistory.value[appointmentId] = petIdOrName;
};

const toggleTimeline = (appointmentId) => {
  showTimeline.value[appointmentId] = !showTimeline.value[appointmentId];
};

// ========================================
// PET NAME HELPER FUNCTIONS
// ========================================

const getPetDisplayName = (appointment) => {
  // Check if we have petNames array (multiple pets)
  if (appointment.petNames && Array.isArray(appointment.petNames) && appointment.petNames.length > 0) {
    return appointment.petNames.join(', ');
  }
  
  // Check if we have petName (single pet)
  if (appointment.petName && appointment.petName.trim()) {
    return appointment.petName.trim();
  }
  
  // Fallback
  return 'No pet info';
};

// ========================================
// PET HISTORY FUNCTIONS
// ========================================

const getPetHistory = (petIdOrName) => {
  // This function should fetch pet history from appointments
  // For now, we'll return a filtered list of appointments for this pet
  if (!petIdOrName) return [];
  
  // Use a Set to track unique appointment IDs to prevent duplicates
  const uniqueAppointmentIds = new Set();
  
  const filteredAppointments = appointments.value.filter(appointment => {
    // Skip if we've already included this appointment
    if (uniqueAppointmentIds.has(appointment.id)) return false;
    
    // Only include completed appointments for history
    if (appointment.status !== 'completed') return false;
    
    // Check if this appointment involves the pet
    let isPetInvolved = false;
    
    // Check by petId
    if (appointment.petId === petIdOrName) {
      isPetInvolved = true;
    }
    // Check by petName
    else if (appointment.petName === petIdOrName) {
      isPetInvolved = true;
    }
    // Check by petIds array
    else if (appointment.petIds && appointment.petIds.includes(petIdOrName)) {
      isPetInvolved = true;
    }
    // Check by petNames array (for multiple pets)
    else if (appointment.petNames && Array.isArray(appointment.petNames)) {
      if (appointment.petNames.some(name => name === petIdOrName)) {
        isPetInvolved = true;
      }
    }
    
    // If pet is involved, add to unique set and include in results
    if (isPetInvolved) {
      uniqueAppointmentIds.add(appointment.id);
      return true;
    }
    
    return false;
  });
  
  // Sort by date, newest first
  return filteredAppointments.sort((a, b) => {
    const dateA = a.date?.toDate?.() || new Date(a.date);
    const dateB = b.date?.toDate?.() || new Date(b.date);
    return dateB - dateA;
  });
};

const viewAppointmentSummary = (appointment) => {
  // This function can be used to view appointment completion details
  // For now, we'll just log it - you can expand this later
  console.log('Viewing appointment summary:', appointment);
  // You could open a modal or navigate to a details page here
};

// ========================================
// PET HISTORY FUNCTIONS
// ========================================

const viewPetHistory = (appointment) => {
  // For single pet appointments
  if (appointment.petId) {
    router.push(`/vet/pets/${appointment.petId}/history`);
  } else if (appointment.petIds && appointment.petIds.length > 0) {
    // For multiple pets, navigate to the first pet's history
    router.push(`/vet/pets/${appointment.petIds[0]}/history`);
  }
};

const viewPetHistoryById = (petId) => {
  router.push(`/vet/pets/${petId}/history`);
};

// ========================================
// DATA FETCHING FUNCTIONS
// ========================================

const fetchVetSchedule = async () => {
  try {
    const currentVetId = authStore.user?.userId;
    if (!currentVetId) return;
    
    // Import Firestore functions
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    const userDocRef = doc(db, 'users', currentVetId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      vetSchedule.value = userDoc.data();
    }
  } catch (error) {
    console.error('Error fetching vet schedule:', error);
  }
};

const fetchServiceDetails = async (serviceIds) => {
  try {
    // Import Firestore functions
    const { collection, doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    const servicesRef = collection(db, 'services');
    const servicePromises = serviceIds.map(async (serviceId) => {
      console.log('Looking for service ID:', serviceId);
      
      const serviceDocRef = doc(servicesRef, serviceId);
      const serviceDoc = await getDoc(serviceDocRef);
      
      if (serviceDoc.exists()) {
        const serviceData = serviceDoc.data();
        console.log('Found service:', serviceData);
        return {
          id: serviceDoc.id,
          name: serviceData.name,
          processingTime: serviceData.processingTime || 'Time not specified'
        };
      }
      
      console.log('Service not found:', serviceId);
      return {
        id: serviceId,
        name: serviceId,
        processingTime: 'Time not specified'
      };
    });
    
    serviceDetails.value = await Promise.all(servicePromises);
    console.log('Service details:', serviceDetails.value);
  } catch (error) {
    console.error('Error fetching service details:', error);
    // Fallback to basic service info
    serviceDetails.value = serviceIds.map(id => ({
      id: id,
      name: id,
      processingTime: 'Time not specified'
    }));
  }
};

const fetchFutureAppointments = async () => {
  try {
    const currentVetId = authStore.user?.userId;
    if (!currentVetId) return;
    
    // Get future appointments for this vet, excluding the current appointment being rescheduled
    const futureAppts = appointments.value.filter(appt => {
      if (appt.doctorId !== currentVetId) return false;
      if (appt.status === 'cancelled' || appt.status === 'ended') return false;
      
      // Exclude the current appointment being rescheduled
      if (reschedulingAppointment.value && appt.id === reschedulingAppointment.value.id) return false;
      
      const apptDate = new Date(appt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return apptDate >= today;
    });
    
    // Remove duplicates based on appointment ID
    const uniqueAppts = futureAppts.filter((appt, index, self) => 
      index === self.findIndex(a => a.id === appt.id)
    );
    
    // Sort by date and time
    futureAppointments.value = uniqueAppts.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
  } catch (error) {
    console.error('Error fetching future appointments:', error);
  }
};

// ========================================
// TIME GENERATION FUNCTIONS
// ========================================

const generateTimeOptionsForDate = (targetDate) => {
  const date = new Date(targetDate);
  const dayOfWeek = date.getDay();
  const schedule = vetSchedule.value?.schedule || '';
  
  console.log('Generating time options for:', targetDate, 'Day:', dayOfWeek, 'Schedule:', schedule);
  
  // Calculate processing time for the appointment
  let totalProcessingMinutes = 0;
  if (serviceDetails.value.length > 0) {
    totalProcessingMinutes = serviceDetails.value.reduce((total, service) => {
      const processingTime = service.processingTime;
      if (processingTime) {
        // Parse processing time like "1 hour 10 minutes" or "30 minutes"
        const hourMatch = processingTime.match(/(\d+)\s*hour/);
        const minuteMatch = processingTime.match(/(\d+)\s*minute/);
        
        let hours = 0;
        let minutes = 0;
        
        if (hourMatch) hours = parseInt(hourMatch[1]);
        if (minuteMatch) minutes = parseInt(minuteMatch[1]);
        
        return total + (hours * 60) + minutes;
      }
      return total + 30; // Default 30 minutes if no processing time
    }, 0);
  }
  
  console.log('Total processing minutes:', totalProcessingMinutes);
  
  // Parse vet schedule
  let availableHours = [];
  if (vetSchedule.value?.schedule) {
    const schedule = vetSchedule.value.schedule;
    
    // Check if selected date is within the vet's working days
    if (schedule.includes('Mon-Fri')) {
      // Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Extract time range from schedule (e.g., "9:00 AM to 8:00 PM")
        const timeMatch = schedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*to\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        console.log('Time match:', timeMatch);
        if (timeMatch) {
          let startHour = parseInt(timeMatch[1]);
          let startMinute = parseInt(timeMatch[2]);
          let startPeriod = timeMatch[3].toUpperCase();
          let endHour = parseInt(timeMatch[4]);
          let endMinute = parseInt(timeMatch[5]);
          let endPeriod = timeMatch[6].toUpperCase();
          
          console.log('Before conversion - Start:', startHour, startMinute, startPeriod, 'End:', endHour, endMinute, endPeriod);
          
          // Convert to 24-hour format
          if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
          if (startPeriod === 'AM' && startHour === 12) startHour = 0;
          if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod === 'AM' && endHour === 12) endHour = 0;
          
          console.log('After conversion - Start:', startHour, startMinute, 'End:', endHour, endMinute);
          
          // Calculate the latest possible start time considering processing time
          const endTimeInMinutes = (endHour * 60) + endMinute;
          const latestStartTimeInMinutes = endTimeInMinutes - totalProcessingMinutes;
          const latestStartHour = Math.floor(latestStartTimeInMinutes / 60);
          const latestStartMinute = latestStartTimeInMinutes % 60;
          
          console.log('End time in minutes:', endTimeInMinutes);
          console.log('Latest start time in minutes:', latestStartTimeInMinutes);
          console.log('Latest start hour:', latestStartHour, 'minute:', latestStartMinute);
          
          // Generate time slots based on processing time intervals
          let currentTimeInMinutes = (startHour * 60) + startMinute;
          
          while (currentTimeInMinutes <= latestStartTimeInMinutes) {
            const hour = Math.floor(currentTimeInMinutes / 60);
            const minute = currentTimeInMinutes % 60;
            
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            availableHours.push(time);
            
            // Move to next slot based on processing time
            currentTimeInMinutes += totalProcessingMinutes;
          }
          
          console.log('Generated hours:', availableHours);
        }
      } else {
        console.log('Tomorrow is not a working day');
      }
    } else if (schedule.includes('Mon-Sat')) {
      // Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        // Similar time parsing logic
        const timeMatch = schedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*to\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          let startHour = parseInt(timeMatch[1]);
          let startMinute = parseInt(timeMatch[2]);
          let startPeriod = timeMatch[3].toUpperCase();
          let endHour = parseInt(timeMatch[4]);
          let endMinute = parseInt(timeMatch[5]);
          let endPeriod = timeMatch[6].toUpperCase();
          
          // Convert to 24-hour format
          if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
          if (startPeriod === 'AM' && startHour === 12) startHour = 0;
          if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
          if (endPeriod === 'AM' && endHour === 12) endHour = 0;
          
          // Calculate the latest possible start time considering processing time
          const endTimeInMinutes = (endHour * 60) + endMinute;
          const latestStartTimeInMinutes = endTimeInMinutes - totalProcessingMinutes;
          const latestStartHour = Math.floor(latestStartTimeInMinutes / 60);
          const latestStartMinute = latestStartTimeInMinutes % 60;
          
          // Generate time slots based on processing time intervals
          let currentTimeInMinutes = (startHour * 60) + startMinute;
          
          while (currentTimeInMinutes <= latestStartTimeInMinutes) {
            const hour = Math.floor(currentTimeInMinutes / 60);
            const minute = currentTimeInMinutes % 60;
            
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            availableHours.push(time);
            
            // Move to next slot based on processing time
            currentTimeInMinutes += totalProcessingMinutes;
          }
        }
      }
    }
  }
  
  console.log('Available hours before default:', availableHours);
  
  // If no schedule found or not a working day, use default hours (9 AM to 6 PM)
  if (availableHours.length === 0) {
    console.log('Using default hours');
    const defaultEndHour = 18; // 6 PM
    const latestStartTimeInMinutes = (defaultEndHour * 60) - totalProcessingMinutes;
    
    // Generate time slots based on processing time intervals
    let currentTimeInMinutes = 9 * 60; // 9 AM
    
    while (currentTimeInMinutes <= latestStartTimeInMinutes) {
      const hour = Math.floor(currentTimeInMinutes / 60);
      const minute = currentTimeInMinutes % 60;
      
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      availableHours.push(time);
      
      // Move to next slot based on processing time
      currentTimeInMinutes += totalProcessingMinutes;
    }
  }
  
  // Get appointments for the selected date
  const selectedDateAppointments = futureAppointments.value.filter(appt => {
    return appt.date === targetDate;
  });
  
  console.log('Appointments on selected date:', selectedDateAppointments.length);
  
  // Find available time slots considering appointment duration and processing time
  const availableSlots = availableHours.filter(timeSlot => {
    // Calculate the end time of the new appointment considering processing time
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
    const slotTimeInMinutes = (slotHour * 60) + slotMinute;
    const newAppointmentEndTimeInMinutes = slotTimeInMinutes + totalProcessingMinutes;
    
    // Convert back to time format for comparison
    const newAppointmentEndHour = Math.floor(newAppointmentEndTimeInMinutes / 60);
    const newAppointmentEndMinute = newAppointmentEndTimeInMinutes % 60;
    const newAppointmentEndTime = `${newAppointmentEndHour.toString().padStart(2, '0')}:${newAppointmentEndMinute.toString().padStart(2, '0')}`;
    
    return !selectedDateAppointments.some(appt => {
      // Parse appointment time (e.g., "10:10 AM - 11:20 AM")
      const timeRange = appt.time;
      const timeMatch = timeRange.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      
      if (timeMatch) {
        let startHour = parseInt(timeMatch[1]);
        let startMinute = parseInt(timeMatch[2]);
        let startPeriod = timeMatch[3].toUpperCase();
        let endHour = parseInt(timeMatch[4]);
        let endMinute = parseInt(timeMatch[5]);
        let endPeriod = timeMatch[6].toUpperCase();
        
        // Convert to 24-hour format
        if (startPeriod === 'PM' && startHour !== 12) startHour += 12;
        if (startPeriod === 'AM' && startHour === 12) startHour = 0;
        if (endPeriod === 'PM' && endHour !== 12) endHour += 12;
        if (endPeriod === 'AM' && endHour === 12) endHour = 0;
        
        const appointmentStart = new Date(`2000-01-01 ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`);
        const appointmentEnd = new Date(`2000-01-01 ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`);
        const slotTime = new Date(`2000-01-01 ${timeSlot}`);
        const newAppointmentEnd = new Date(`2000-01-01 ${newAppointmentEndTime}`);
        
        // Check if the new appointment (with processing time) conflicts with existing appointment
        // Conflict occurs if:
        // 1. New appointment starts during existing appointment
        // 2. New appointment ends during existing appointment  
        // 3. New appointment completely contains existing appointment
        // 4. New appointment overlaps with existing appointment
        
        // Convert times to minutes for easier comparison
        const slotTimeInMinutes = slotTime.getHours() * 60 + slotTime.getMinutes();
        const newAppointmentEndInMinutes = newAppointmentEnd.getHours() * 60 + newAppointmentEnd.getMinutes();
        const appointmentStartInMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
        const appointmentEndInMinutes = appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();
        
        // Check for overlap: if the new appointment overlaps with the existing one
        const hasOverlap = !(newAppointmentEndInMinutes <= appointmentStartInMinutes || slotTimeInMinutes >= appointmentEndInMinutes);
        
        return hasOverlap;
      }
      
      return false;
    });
  });
  
  console.log('Available slots after filtering:', availableSlots);
  console.log('Available time slots:', availableSlots.length);
  
  // Create options for available slots with time intervals
  autoRescheduleOptions.value = availableSlots.map((time, index) => {
    // Calculate end time based on processing time
    const [startHour, startMinute] = time.split(':').map(Number);
    const startTimeInMinutes = (startHour * 60) + startMinute;
    const endTimeInMinutes = startTimeInMinutes + totalProcessingMinutes;
    
    const endHour = Math.floor(endTimeInMinutes / 60);
    const endMinute = endTimeInMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Convert start time to 12-hour format
    const startHour12 = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;
    const startPeriod = startHour >= 12 ? 'PM' : 'AM';
    const startDisplayTime = `${startHour12}:${startMinute.toString().padStart(2, '0')} ${startPeriod}`;
    
    // Convert end time to 12-hour format
    const endHour12 = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endDisplayTime = `${endHour12}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;
    
    // Create time interval display
    const timeInterval = `${startDisplayTime} - ${endDisplayTime}`;
    
    return {
      label: time,
      value: `slot_${index}`,
      description: `Available: ${timeInterval}`,
      date: targetDate,
      time: time,
      displayTime: timeInterval,
      period: startPeriod,
      endTime: endTime,
      endDisplayTime: endDisplayTime
    };
  });
  
  console.log('Generated time options:', autoRescheduleOptions.value.length);
};

const filteredTimeOptions = computed(() => {
  return autoRescheduleOptions.value.filter(option => {
    // Filter based on the start time period
    return option.period === selectedTimePeriod.value;
  });
});

// Calendar computed properties
const currentMonthYear = computed(() => {
  return format(currentMonth.value, 'MMMM yyyy');
});

const weekDays = computed(() => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
});

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  
  const days = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
  
  // Helper function to create day object
  const createDayObject = (date, isCurrentMonth = false) => ({
    date: date.toISOString().split('T')[0],
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday: date.toDateString() === today.toDateString(),
    isSelected: tempSelectedDate.value === date.toISOString().split('T')[0],
    isPast: date < today,
    isWorkingDay: isWorkingDay(date)
  });
  
  // Add days from previous month
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, lastDayOfPrevMonth - i, 12, 0, 0, 0);
    days.push(createDayObject(date, false));
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i, 12, 0, 0, 0); // Set to noon to avoid timezone issues
    days.push(createDayObject(date, true));
  }
  
  // Add days from next month to fill the grid (6 rows * 7 days = 42)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i, 12, 0, 0, 0);
    days.push(createDayObject(date, false));
  }
  
  return days;
});

// Watch for service details changes and regenerate options
watch(serviceDetails, (newServiceDetails) => {
  if (newServiceDetails.length > 0 && reschedulingAppointment.value && selectedDate.value) {
    console.log('Service details changed, regenerating options');
    generateTimeOptionsForDate(selectedDate.value);
  }
}, { deep: true });

// ========================================
// APPOINTMENT MANAGEMENT FUNCTIONS
// ========================================

// Function to update expired appointments
const updateExpiredAppointments = async () => {
  const now = new Date();
  
  for (const appointment of appointments.value) {
    if (isExpired(appointment) && appointment.status === 'pending') {
      try {
        // Update appointment status to expired
        await appointmentStore.updateAppointmentStatus(appointment.id, 'expired');
        
        // Update local state
        const index = appointments.value.findIndex(a => a.id === appointment.id);
        if (index !== -1) {
          appointments.value[index] = {
            ...appointments.value[index],
            status: 'expired',
            updatedAt: new Date()
          };
        }
        
        console.log(`Updated appointment ${appointment.id} to expired status`);
      } catch (error) {
        console.error(`Error updating appointment ${appointment.id} to expired:`, error);
      }
    }
  }
};

// Check for expired appointments when component mounts and set up interval
let expiredCheckInterval;
onMounted(() => {
  updateExpiredAppointments();
  expiredCheckInterval = setInterval(updateExpiredAppointments, 60000); // Check every minute
});

onBeforeUnmount(() => {
  if (expiredCheckInterval) {
    clearInterval(expiredCheckInterval);
  }
});

// ========================================
// RESCHEDULE FUNCTIONS
// ========================================

const selectAutoRescheduleOption = (option) => {
  // Validate the selected time before allowing selection
  const validation = validateRescheduleTime(
    option.date, 
    option.displayTime, 
    reschedulingAppointment.value?.id
  );
  
  if (!validation.isValid) {
    errorMessage.value = validation.conflict;
    showErrorModal.value = true;
    return;
  }
  
  selectedAutoOption.value = option.value;
  selectedAutoRescheduleDate.value = option.date;
  selectedAutoRescheduleTime.value = option.displayTime; // Use the full time interval
};

// Validation function to check for appointment conflicts
const validateRescheduleTime = (targetDate, targetTime, appointmentId) => {
  // Get appointments for the target date (excluding the current appointment being rescheduled)
  const dateAppointments = futureAppointments.value.filter(appt => 
    appt.date === targetDate && appt.id !== appointmentId
  );
  
  if (dateAppointments.length === 0) {
    return { isValid: true, conflict: null };
  }
  
  // Parse the target time (e.g., "10:10 AM - 11:20 AM")
  const timeMatch = targetTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeMatch) {
    return { isValid: false, conflict: 'Invalid time format' };
  }
  
  // Parse target appointment times
  let targetStartHour = parseInt(timeMatch[1]);
  let targetStartMinute = parseInt(timeMatch[2]);
  let targetStartPeriod = timeMatch[3].toUpperCase();
  let targetEndHour = parseInt(timeMatch[4]);
  let targetEndMinute = parseInt(timeMatch[5]);
  let targetEndPeriod = timeMatch[6].toUpperCase();
  
  // Convert to 24-hour format
  if (targetStartPeriod === 'PM' && targetStartHour !== 12) targetStartHour += 12;
  if (targetStartPeriod === 'AM' && targetStartHour === 12) targetStartHour = 0;
  if (targetEndPeriod === 'PM' && targetEndHour !== 12) targetEndHour += 12;
  if (targetEndPeriod === 'AM' && targetEndHour === 12) targetEndHour = 0;
  
  const targetStartInMinutes = targetStartHour * 60 + targetStartMinute;
  const targetEndInMinutes = targetEndHour * 60 + targetEndMinute;
  
  // Check for conflicts with existing appointments
  for (const appt of dateAppointments) {
    const apptTimeMatch = appt.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (apptTimeMatch) {
      let apptStartHour = parseInt(apptTimeMatch[1]);
      let apptStartMinute = parseInt(apptTimeMatch[2]);
      let apptStartPeriod = apptTimeMatch[3].toUpperCase();
      let apptEndHour = parseInt(apptTimeMatch[4]);
      let apptEndMinute = parseInt(apptTimeMatch[5]);
      let apptEndPeriod = apptTimeMatch[6].toUpperCase();
      
      // Convert to 24-hour format
      if (apptStartPeriod === 'PM' && apptStartHour !== 12) apptStartHour += 12;
      if (apptStartPeriod === 'AM' && apptStartHour === 12) apptStartHour = 0;
      if (apptEndPeriod === 'PM' && apptEndHour !== 12) apptEndHour += 12;
      if (apptEndPeriod === 'AM' && apptEndHour === 12) apptEndHour = 0;
      
      const apptStartInMinutes = apptStartHour * 60 + apptStartMinute;
      const apptEndInMinutes = apptEndHour * 60 + apptEndMinute;
      
      // Check for overlap
      const hasOverlap = !(targetEndInMinutes <= apptStartInMinutes || targetStartInMinutes >= apptEndInMinutes);
      
      if (hasOverlap) {
        return { 
          isValid: false, 
          conflict: `Conflicts with existing appointment: ${appt.time} (${appt.petName})` 
        };
      }
    }
  }
  
  return { isValid: true, conflict: null };
};

const executeRescheduleRequest = async () => {
  if (!selectedAutoOption.value || !reschedulingAppointment.value || !rescheduleReason.value.trim()) {
    errorMessage.value = 'Please provide a reason for the reschedule request and select a preferred time.';
    showErrorModal.value = true;
    return;
  }
  
  autoRescheduleLoading.value = true;
  
  try {
    // Create reschedule request data
    const rescheduleRequestData = {
      suggestedDate: selectedAutoRescheduleDate.value,
      suggestedTime: selectedAutoRescheduleTime.value,
      reason: rescheduleReason.value.trim(),
      requestedBy: authStore.user?.userId || 'vet',
      requestedAt: new Date(),
      status: 'reschedule_requested'
    };
    
    // Update appointment with reschedule request and status change
    await appointmentStore.updateAppointment(reschedulingAppointment.value.id, {
      rescheduleRequest: rescheduleRequestData,
      status: 'consider_rescheduling',
      updatedAt: new Date()
    });
    
    // Update local state
    const index = appointments.value.findIndex(a => a.id === reschedulingAppointment.value.id);
    if (index !== -1) {
      appointments.value[index] = {
        ...appointments.value[index],
        rescheduleRequest: rescheduleRequestData,
        status: 'consider_rescheduling',
        updatedAt: new Date()
      };
    }

    // Notify the appointment owner about the reschedule request
    try {
      const readableDate = format(new Date(selectedAutoRescheduleDate.value), 'MMM dd, yyyy');
      const title = 'Reschedule Request';
      const description = `Your vet has requested to reschedule your appointment to ${readableDate} at ${selectedAutoRescheduleTime.value}. Reason: ${rescheduleReason.value.trim()}. Please review and respond.`;
      
      // Ensure notification service has the store
      notificationService.setNotificationsStore(notificationsStore);
      // Set current user context for service (for fallback flows)
      // Removed - no longer needed after removing notificationSyncService
      
      await notificationService.storeNotificationInFirestore(title, description, {
        type: 'appointment',
        url: '/user/notifications',
        userId: reschedulingAppointment.value.userId,
        appointmentId: reschedulingAppointment.value.id,
        status: 'reschedule_requested',
        fromClient: true,
        deleted: false,
        forceFallback: true
      });
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr);
    }
    
    // Notify the vet about the reschedule request sent
    try {
      const vetTitle = 'Reschedule Request Sent';
      const vetDescription = `You have sent a reschedule request for appointment with ${reschedulingAppointment.value.ownerName} (${reschedulingAppointment.value.petNames?.join(', ') || 'pet'}). Suggested time: ${selectedAutoRescheduleDate.value} at ${selectedAutoRescheduleTime.value}. The client will be notified to review your request.`;
      
      // Send notification to the current vet
      if (authStore.user?.userId) {
        await notificationService.storeNotificationInFirestore(vetTitle, vetDescription, {
          type: 'appointment',
          url: '/vet/appointments',
          userId: authStore.user.userId,
          appointmentId: reschedulingAppointment.value.id,
          status: 'reschedule_request_sent',
          fromClient: false,
          deleted: false,
          forceFallback: true
        });
      }
    } catch (vetNotifyErr) {
      console.error('Failed to send vet notification:', vetNotifyErr);
    }
    

    
    // Close panel and show success
    closeAutoReschedulePanel();
    successTitle.value = 'Reschedule Request Sent';
    successMessage.value = `Your reschedule request has been sent to the client. They will be notified to review your suggested time (${selectedAutoRescheduleDate.value} at ${selectedAutoRescheduleTime.value}) and can choose to accept, decline, or suggest an alternative.`;
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('Error sending reschedule request:', error);
    errorMessage.value = 'Failed to send reschedule request. Please try again.';
    showErrorModal.value = true;
  } finally {
    autoRescheduleLoading.value = false;
  }
};

// ========================================
// NOTIFICATION FUNCTIONS
// ========================================

const sendAppointmentNotification = async (appointmentId, action, status) => {
  try {
    // Get the appointment details
    const appointmentData = appointments.value.find(a => a.id === appointmentId);
    if (!appointmentData) {
      console.error('Appointment not found for notification');
      return;
    }

    // Build a robust subject (pet names or category) to avoid "null"
    const petNamesJoined = Array.isArray(appointmentData.petNames) && appointmentData.petNames.length > 0
      ? appointmentData.petNames.map((n) => (n || '').trim()).filter(Boolean).join(', ')
      : (appointmentData.petName || '').trim();
    const subject = appointmentData.isHealthCertificate
      ? 'your Veterinary Health Certificate appointment'
      : (petNamesJoined ? `your appointment for ${petNamesJoined}` : 'your appointment');

    // Create notification message based on action
    let title, description;
    const dateStr = format(new Date(appointmentData.date), 'MMM dd, yyyy');
    switch (action) {
      case 'approve':
        title = 'Appointment Approved!';
        description = `${subject} on ${dateStr} at ${appointmentData.time} has been approved.`;
        break;
      case 'reject':
        title = 'Appointment Rejected';
        description = `${subject} on ${dateStr} at ${appointmentData.time} has been rejected.`;
        break;
      case 'cancel':
        title = 'Appointment Cancelled';
        description = `${subject} on ${dateStr} at ${appointmentData.time} has been cancelled.`;
        break;
      case 'complete':
        title = 'Appointment Completed';
        description = `${subject} on ${dateStr} at ${appointmentData.time} has been completed.`;
        break;
    default:
        title = 'Appointment Status Updated';
        description = `Your appointment status has been updated to ${status}.`;
    }

    // Ensure notification service is wired and has a user context (for fallback flows)
    notificationService.setNotificationsStore(notificationsStore);

    // Send notification to the USER (not the vet)
    await notificationService.showNotification(title, description, {
      type: 'appointment',
      url: '/user/notifications',
      userId: appointmentData.userId, // This is the USER's ID
      appointmentId: String(appointmentId),
      status: status,
      fromClient: false, // This is from the vet, not the client
      storeInFirestore: true
    });

    console.log(`User notification sent for appointment ${appointmentId}: ${action}`);
  } catch (error) {
    console.error('Error sending user notification:', error);
  }
};

// Send notification TO the vet about their action
const sendVetNotification = async (appointmentId, action, status) => {
  try {
    // Get the appointment details
    const appointmentData = appointments.value.find(a => a.id === appointmentId);
    if (!appointmentData) {
      console.error('Appointment not found for vet notification');
      return;
    }

    // Get current vet's user ID
    const currentVetId = authStore.user?.userId;
    if (!currentVetId) {
      console.error('No vet user ID available for notification');
      return;
    }

    // Build pet names for the notification
    const petNamesJoined = Array.isArray(appointmentData.petNames) && appointmentData.petNames.length > 0
      ? appointmentData.petNames.map((n) => (n || '').trim()).filter(Boolean).join(', ')
      : (appointmentData.petName || '').trim();

    // Create vet-specific notification message
    let title, description;
    const dateStr = format(new Date(appointmentData.date), 'MMM dd, yyyy');
    switch (action) {
      case 'approve':
        title = 'Appointment Approved';
        description = `You approved an appointment for ${petNamesJoined || 'pet'} on ${dateStr} at ${appointmentData.time}`;
        break;
      case 'reject':
        title = 'Appointment Rejected';
        description = `You rejected an appointment for ${petNamesJoined || 'pet'} on ${dateStr} at ${appointmentData.time}`;
        break;
      case 'cancel':
        title = 'Appointment Cancelled';
        description = `You cancelled an appointment for ${petNamesJoined || 'pet'} on ${dateStr} at ${appointmentData.time}`;
        break;
      case 'complete':
        title = 'Appointment Completed';
        description = `You completed an appointment for ${petNamesJoined || 'pet'} on ${dateStr} at ${appointmentData.time}`;
        break;
      default:
        title = 'Appointment Action Completed';
        description = `You updated appointment status to ${status}`;
    }

    // Ensure notification service is wired
    notificationService.setNotificationsStore(notificationsStore);
    
    // Send notification TO the VET
    await notificationService.showNotification(title, description, {
      type: 'vet_action',
      url: '/vet/appointments/vetappointmentapproval',
      userId: currentVetId, // This is the VET's ID
      appointmentId: String(appointmentId),
      status: status,
      fromClient: false,
      storeInFirestore: true
    });

    console.log(`Vet notification sent for appointment ${appointmentId}: ${action}`);
  } catch (error) {
    console.error('Error sending vet notification:', error);
  }
};

// Send detailed completion notification with service summary and recommendations
const sendDetailedCompletionNotification = async (appointmentId, completionData) => {
  try {
    // Get the appointment details
    const appointmentData = appointments.value.find(a => a.id === appointmentId);
    if (!appointmentData) {
      console.error('Appointment not found for detailed notification');
      return;
    }

    // Build pet names for the notification
    const petNamesJoined = Array.isArray(appointmentData.petNames) && appointmentData.petNames.length > 0
      ? appointmentData.petNames.map((n) => (n || '').trim()).filter(Boolean).join(', ')
      : (appointmentData.petName || '').trim();

    // Create detailed completion notification
    const title = 'Appointment Completed - Summary Available';
    const description = `Your appointment for ${petNamesJoined || 'your pet'} has been completed. View the detailed service summary, health assessment, and care instructions in your notifications.`;

    // Ensure notification service is wired
    notificationService.setNotificationsStore(notificationsStore);
    // Removed - no longer needed after removing notificationSyncService

    // Store detailed completion notification
      await notificationService.storeNotificationInFirestore(title, description, {
      type: 'appointment_completion',
        url: '/user/notifications',
        userId: appointmentData.userId,
        appointmentId: String(appointmentId),
      status: 'completed',
        fromClient: true,
        deleted: false,
        forceFallback: true,
      skipDuplicateCheck: true,
      // Include completion data for reference
      completionData: {
        services: completionData.services,
        pets: completionData.pets,
        generalNotes: completionData.generalNotes
      }
    });

    console.log(`Detailed completion notification sent for appointment ${appointmentId}`);
  } catch (error) {
    console.error('Error sending detailed completion notification:', error);
  }
};



// ========================================
// APPOINTMENT ACTION FUNCTIONS
// ========================================

const approveAppointment = async (appointmentId) => {
  try {
    // Update the appointment status to approved
    await appointmentStore.updateAppointment(
      appointmentId, 
      {
        status: 'approved',
        approvedBy: 'vet',
        approvedAt: new Date()
      }
    );
    
    // Update the local state
    const index = appointments.value.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      appointments.value[index].status = 'approved';
      appointments.value[index].approvedBy = 'vet';
      appointments.value[index].approvedAt = new Date();
      appointments.value[index].updatedAt = new Date();
    }
    
    // Send notification to the user
    await sendAppointmentNotification(appointmentId, 'approve', 'approved');
    

    
    // Send notification to the vet about their action
    await sendVetNotification(appointmentId, 'approve', 'approved');
    
    // Show success message
    successTitle.value = 'Appointment Approved';
    successMessage.value = 'The appointment has been approved successfully.';
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('Error approving appointment:', error);
    errorMessage.value = 'Failed to approve appointment. Please try again.';
    showErrorModal.value = true;
  }
};

const rejectAppointment = async (appointmentId) => {
  try {
    // Update the appointment status to rejected
    await appointmentStore.updateAppointment(
      appointmentId, 
      {
        status: 'rejected',
        rejectedBy: 'vet',
        rejectedAt: new Date()
      }
    );
    
    // Update the local state
    const index = appointments.value.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      appointments.value[index].status = 'rejected';
      appointments.value[index].rejectedBy = 'vet';
      appointments.value[index].rejectedAt = new Date();
      appointments.value[index].updatedAt = new Date();
    }
    
    // Send notification to the user
    await sendAppointmentNotification(appointmentId, 'reject', 'rejected');
    

    
    // Send notification to the vet about their action
    await sendVetNotification(appointmentId, 'reject', 'rejected');
    
    // Show success message
    successTitle.value = 'Appointment Rejected';
    successMessage.value = 'The appointment has been rejected successfully.';
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    errorMessage.value = 'Failed to reject appointment. Please try again.';
    showErrorModal.value = true;
  }
};

const cancelApprovedAppointment = async (appointmentId) => {
  try {
    // Update the appointment status to cancelled
    await appointmentStore.updateAppointment(
      appointmentId, 
      {
        status: 'cancelled',
        cancelledBy: 'vet',
        cancelledAt: new Date()
      }
    );
    
    // Update the local state
    const index = appointments.value.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      appointments.value[index].status = 'cancelled';
      appointments.value[index].cancelledBy = 'vet';
      appointments.value[index].cancelledAt = new Date();
      appointments.value[index].updatedAt = new Date();
    }
    
    // Send notification to the user
    await sendAppointmentNotification(appointmentId, 'cancel', 'cancelled');
    

    
    // Send notification to the vet about their action
    await sendVetNotification(appointmentId, 'cancel', 'cancelled');
    
    // Show success message
    successTitle.value = 'Appointment Cancelled';
    successMessage.value = 'The appointment has been cancelled successfully.';
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    errorMessage.value = 'Failed to cancel appointment. Please try again.';
    showErrorModal.value = true;
  }
};

const completeAppointment = async (appointmentId) => {
  try {
    // Update status to completed
    await appointmentStore.updateAppointment(
      appointmentId,
      {
        status: 'completed',
        completedBy: 'vet',
        completedAt: new Date(),
      }
    );

    // Update local state
    const index = appointments.value.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      appointments.value[index].status = 'completed';
      appointments.value[index].completedBy = 'vet';
      appointments.value[index].completedAt = new Date();
      appointments.value[index].updatedAt = new Date();
    }

    // 🔧 NEW: Check if this appointment has vaccination services and generate vaccination records
    try {
      const appointment = appointments.value[index];
      if (appointment) {
        await processVaccinationAppointment(appointment, {
          appointmentId: appointmentId,
          completedAt: new Date(),
          completedBy: 'vet'
        });
      }
    } catch (vaccinationError) {
      console.error('Error processing vaccination appointment:', vaccinationError);
      // Don't fail the completion if vaccination processing fails
    }

    // Notify user
    await sendAppointmentNotification(appointmentId, 'complete', 'completed');
    

    
    // Notify vet about their action
    await sendVetNotification(appointmentId, 'complete', 'completed');

    // Success modal
    successTitle.value = 'Appointment Completed';
    successMessage.value = 'The appointment has been marked as completed.';
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Error completing appointment:', error);
    errorMessage.value = 'Failed to mark appointment as completed. Please try again.';
    showErrorModal.value = true;
  }
};



// Fetch service categories and services data
const fetchServiceData = async () => {
  try {
    // Import Firebase functions
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    // Fetch categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    categoriesData.value = {};
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categoriesData.value[doc.id] = {
        id: doc.id,
        name: data.name,
        description: data.description,
        coverPhoto: data.coverPhoto,
        archived: data.archived
      };
    });
    
    // Fetch services
    const servicesRef = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesRef);
    servicesData.value = {};
    
    servicesSnapshot.forEach(doc => {
      const data = doc.data();
      servicesData.value[doc.id] = {
        id: doc.id,
        name: data.name,
        categoryId: data.categoryId,
        classification: data.classification,
        fees: data.fees,
        processingTime: data.processingTime,
        transactionType: data.transactionType
      };
    });
    
    // Build service-category mapping by service ID for better accuracy
    serviceCategories.value = {};
    
    Object.values(servicesData.value).forEach(service => {
      if (service.categoryId && categoriesData.value[service.categoryId]) {
        serviceCategories.value[service.id] = categoriesData.value[service.categoryId];
        // Also keep the name mapping for backward compatibility
        serviceCategories.value[service.name] = categoriesData.value[service.categoryId];
      }
    });
    
  } catch (error) {
    console.error('Error fetching service data:', error);
    // Re-throw the error so the calling function knows it failed
    throw error;
  }
};

// Updated getServiceCategory function - works with both service ID and name
const getServiceCategory = (serviceIdentifier) => {
  if (!serviceIdentifier) {
    return null;
  }
  
  // First try to find by service ID in servicesData (this is the main case for appointments)
  if (servicesData.value && servicesData.value[serviceIdentifier]) {
    const service = servicesData.value[serviceIdentifier];
    if (service && service.categoryId && categoriesData.value[service.categoryId]) {
      return categoriesData.value[service.categoryId];
    }
  }
  
  // Then try the pre-built mapping
  const result = serviceCategories.value[serviceIdentifier] || null;
  
  // If still not found, try to find by service name in servicesData
  if (!result && servicesData.value) {
    const service = Object.values(servicesData.value).find(s => s.name === serviceIdentifier);
    if (service && service.categoryId && categoriesData.value[service.categoryId]) {
      return categoriesData.value[service.categoryId];
    }
  }
  
  return result;
};

// Helper function to get service details by ID
const getServiceById = (serviceId) => {
  return servicesData.value[serviceId] || null;
};

// Helper function to get service details by name
const getServiceByName = (serviceName) => {
  return Object.values(servicesData.value).find(service => service.name === serviceName) || null;
};

// Helper function to get service name by ID
const getServiceNameById = (serviceId) => {
  if (servicesData.value && servicesData.value[serviceId]) {
    return servicesData.value[serviceId].name;
  }
  return serviceId; // Return the ID if no name found
};

// Helper function to get display name for service (handles both ID and name)
const getServiceDisplayName = (serviceIdentifier) => {
  if (!serviceIdentifier) return 'Unknown Service';
  
  // If it's an ID, convert to name (this is the main case for appointments)
  if (servicesData.value && servicesData.value[serviceIdentifier]) {
    return servicesData.value[serviceIdentifier].name;
  }
  
  // If it's already a name, return it (fallback case)
  if (servicesData.value) {
    const serviceByName = Object.values(servicesData.value).find(s => s.name === serviceIdentifier);
    if (serviceByName) return serviceIdentifier; // It's already a name
  }
  
  // Fallback - return the identifier as is
  return serviceIdentifier;
};



</script>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
--tw-divide-opacity: 1;
border-color: rgb(229 231 235 / var(--tw-divide-opacity));
}

@media (max-width: 640px) {
table {
  font-size: 0.875rem;
}
}

/* Add responsive stepper styles */
@media (max-width: 640px) {
.stepper-container {
  padding: 0 8px;
}
}

/* 🔧 NEW: Highlight effect for appointments found from queue */
.highlight-appointment {
  background-color: #dbeafe !important;
  border-left: 4px solid #3b82f6 !important;
  animation: pulse-highlight 2s ease-in-out;
}

@keyframes pulse-highlight {
  0%, 100% {
    background-color: #dbeafe;
  }
  50% {
    background-color: #bfdbfe;
  }
}
</style>