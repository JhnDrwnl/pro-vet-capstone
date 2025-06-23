<!-- views/vet/appointments/ApprovedAppointments.vue -->
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
      <!-- Filter Dropdown - Status Only (added completed) -->
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
          v-for="status in ['pending', 'approved', 'completed', 'cancelled', 'ended']" 
          :key="status"
          @click="toggleStatusFilter(status)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 capitalize"
          :class="{ 'text-[#0066FF]': filters.status === status }"
        >
          {{ status }}
        </button>
      </div>
    </div>
  </div>
  <div class="flex justify-end gap-2 w-full sm:w-auto">
    <button 
      @click="exportToCSV"
      class="flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs sm:text-sm w-auto"
    >
      <DownloadIcon class="w-3 h-3 sm:w-4 sm:h-4" />
      Export CSV
    </button>
  </div>
</div>

<!-- Active Filters Display - Status Only -->
<div v-if="filters.status" class="mb-4 flex flex-wrap gap-2">
  <div class="text-sm text-gray-500 py-1">Active filters:</div>
  
  <div class="inline-flex items-center gap-1 px-3 py-1 bg-[#EBF5FF] text-[#0066FF] rounded-full text-xs capitalize">
    <span>{{ filters.status }}</span>
    <button @click="clearStatusFilter" class="text-[#0066FF] hover:text-blue-700">
      <XIcon class="w-3 h-3" />
    </button>
  </div>
</div>

<!-- Table -->
<div v-if="!initialLoading && !showApprovalForm" class="border border-gray-200 rounded-lg overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th v-for="header in headers" :key="header.key" 
            @click="sortBy(header.key)"
            class="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer whitespace-nowrap">
          <div class="flex items-center">
            {{ header.label }}
            <div class="flex flex-col ml-1">
              <span :class="['text-[10px] leading-none', { 'text-gray-800': sortKey === header.key && sortOrder === 'asc' }]" >▲</span>
              <span :class="['text-[10px] leading-none', { 'text-gray-800': sortKey === header.key && sortOrder === 'desc' }]">▼</span>
            </div>
          </div>
        </th>
        <th class="px-6 py-4 text-right text-sm font-medium text-gray-500 whitespace-nowrap">
          Actions
        </th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      <tr v-for="appointment in paginatedAppointments" :key="appointment.id" 
          class="hover:bg-gray-50 transition-colors duration-150">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
              <img 
                v-if="appointment.ownerAvatar && appointment.ownerAvatar !== '/placeholder.svg?height=40&width=40'"
                :src="appointment.ownerAvatar" 
                class="w-full h-full object-cover"
                alt=""
                @error="onImageError"
              />
              <img 
                v-else
                :src="defaultPhotoURL" 
                class="w-full h-full object-cover"
                alt=""
              />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900">{{ appointment.ownerName || 'Unknown Owner' }}</span>
                <span class="text-xs text-gray-500">(Owner)</span>
              </div>
              <div v-if="appointment.ownerEmail" class="text-xs text-gray-500 mt-0.5">
                {{ appointment.ownerEmail }}
              </div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm text-gray-900">{{ appointment.contactInformation || 'No contact info' }}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <!-- No pets case - Just text, no icon -->
          <div v-if="!hasPet(appointment)">
            <span class="text-sm text-gray-500">No Pet</span>
          </div>
          
          <!-- Single pet case (for backward compatibility) -->
          <div v-else-if="appointment.petName && !Array.isArray(appointment.petIds)" class="flex items-center">
            <div class="flex-shrink-0 h-10 w-10 mr-3 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                v-if="appointment.petPhotoURL"
                :src="appointment.petPhotoURL" 
                :alt="appointment.petName"
                class="h-10 w-10 rounded-full object-cover" 
                @error="onPetImageError"
              />
              <img 
                v-else
                :src="defaultPetPhotoURL" 
                class="h-7 w-7" 
                alt="Pet placeholder"
              />
            </div>
            <div class="text-sm font-medium text-gray-900">
              {{ appointment.petName }}
              <span v-if="appointment.petSpecies" class="text-gray-600">({{ appointment.petSpecies }})</span>
            </div>
          </div>
          
          <!-- Multiple pets case - Group by species with overlapping photos -->
          <div v-else class="flex flex-col gap-4">
            <!-- Display each species group -->
            <div v-for="(group, groupIndex) in getPetGroups(appointment)" :key="groupIndex" class="flex items-center">
              <!-- Overlapping profile pictures - First pet is at the back -->
              <div class="flex mr-3 relative" style="width: 70px; height: 40px;">
                <!-- Render in reverse order so first pet is at the back -->
                <div 
                  v-for="(petIndex, photoIndex) in [...group.indices].slice(0, 3).reverse()" 
                  :key="photoIndex"
                  class="absolute h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                  :style="{ 
                    left: `${photoIndex * 15}px`, 
                    zIndex: photoIndex + 1
                  }"
                >
                  <img 
                    v-if="appointment.petPhotos && appointment.petPhotos[petIndex]"
                    :src="appointment.petPhotos[petIndex]" 
                    :alt="appointment.petNames[petIndex]"
                    class="h-10 w-10 rounded-full object-cover" 
                    @error="onPetImageError"
                  />
                  <img 
                    v-else
                    :src="defaultPetPhotoURL" 
                    class="h-7 w-7" 
                    alt="Pet placeholder"
                  />
                </div>
                
                <!-- Show +X more if there are more than 3 pets of the same species -->
                <div 
                  v-if="group.indices.length > 3" 
                  class="absolute h-10 w-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                  :style="{ left: '30px', zIndex: 4 }"
                >
                  +{{ group.indices.length - 3 }}
                </div>
              </div>
              
              <!-- Pet names with commas and species at the end -->
              <div class="text-sm font-medium text-gray-900">
                <!-- Show only first 2 names + count if more than 2 -->
                <span v-if="group.indices.length <= 2">
                  {{ group.indices.map(idx => appointment.petNames[idx]).join(', ') }}
                </span>
                <span v-else>
                  {{ group.indices.slice(0, 2).map(idx => appointment.petNames[idx]).join(', ') }} 
                  +{{ group.indices.length - 2 }}
                </span>
                <span class="text-gray-600">({{ group.species }})</span>
              </div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm text-gray-900">{{ formatDate(appointment.date) }}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm text-gray-900">{{ appointment.time }}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="(service, index) in appointment.serviceNames" 
              :key="index"
              class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
            >
              {{ service }}
            </span>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div>
            <span :class="getStatusClass(appointment.status)">
              {{ formatStatus(appointment.status) }}
            </span>
            <!-- Show cancellation reason if status is cancelled -->
            <div v-if="appointment.status === 'cancelled' && appointment.cancellationReason" 
                 class="mt-1 text-xs text-gray-500 max-w-[200px] truncate" 
                 :title="appointment.cancellationReason">
              Reason: {{ appointment.cancellationReason }}
            </div>
            <!-- Show who cancelled it -->
            <div v-if="appointment.status === 'cancelled' && appointment.cancelledBy" 
                 class="mt-1 text-xs text-gray-500">
              By: {{ appointment.cancelledBy === 'user' ? 'Owner' : 'Vet' }}
            </div>
          </div>
        </td>
        <!-- Created Date Column -->
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm text-gray-900">{{ formatDateTime(appointment.createdAt) }}</span>
        </td>
        <!-- Updated Date Column - Now showing date and time -->
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="text-sm text-gray-900">{{ formatDateTime(appointment.updatedAt) }}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right">
          <div class="flex justify-end gap-2">
            <!-- Processing state - show cancel processing button -->
            <div v-if="appointment.status === 'processing'" class="flex gap-2">
              <button 
                @click="cancelProcessing(appointment)"
                class="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors duration-200"
                title="Cancel Processing"
              >
                <XCircleIcon class="w-4 h-4" />
              </button>
              <span class="text-xs text-blue-600 flex items-center">
                Processing...
              </span>
            </div>
            
            <!-- Normal state - show approve/cancel buttons -->
            <template v-else>
              <!-- Approve button - only for pending appointments -->
              <button 
                v-if="appointment.status === 'pending'"
                @click="startApprovalProcess(appointment)"
                class="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors duration-200"
                title="Approve Appointment"
              >
                <CheckIcon class="w-4 h-4" />
              </button>
              <!-- Cancel button - for both pending and approved appointments -->
              <button 
                v-if="appointment.status === 'pending' || appointment.status === 'approved'"
                @click="setProcessingStatus(appointment, 'cancel')"
                class="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors duration-200"
                title="Cancel Appointment"
              >
                <XIcon class="w-4 h-4" />
              </button>
            </template>
          </div>
        </td>
      </tr>
      
      <!-- Empty state -->
      <tr v-if="paginatedAppointments.length === 0">
        <td colspan="11" class="py-8 text-center">
          <div class="flex flex-col items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <CalendarIcon class="w-8 h-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No appointments found</p>
            <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
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
        <div v-if="currentApprovalStep.id === 'owner'" class="space-y-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Owner Information</h3>
            
            <!-- Personal Information Section -->
            <div class="mb-6">
              <div class="flex items-center mb-2">
                <div class="bg-blue-100 rounded-full p-1.5 mr-2">
                  <UserIcon class="w-4 h-4 text-blue-500" />
                </div>
                <h4 class="text-sm font-medium text-gray-700">Personal Information</h4>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <!-- First Name & Last Name -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">First Name</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.firstName || (selectedAppointment.ownerName ? selectedAppointment.ownerName.split(' ')[0] : 'Not provided') }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-1">Last Name</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.lastName || (selectedAppointment.ownerName ? selectedAppointment.ownerName.split(' ').slice(1).join(' ') : 'Not provided') }}</div>
                </div>
                
                <!-- Date of Birth & Age -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Date of Birth</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.dateOfBirth ? formatDate(selectedAppointment.dateOfBirth) : 'Not provided' }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-1">Age</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.age || calculateAge(selectedAppointment.dateOfBirth) || 'Not provided' }}</div>
                </div>
                
                <!-- Gender -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Gender</div>
                  <div class="text-sm font-medium text-gray-900 capitalize">{{ selectedAppointment.gender || 'Not provided' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Contact Information Section -->
            <div class="mb-6">
              <div class="flex items-center mb-2">
                <div class="bg-green-100 rounded-full p-1.5 mr-2">
                  <PhoneIcon class="w-4 h-4 text-green-500" />
                </div>
                <h4 class="text-sm font-medium text-gray-700">Contact Information</h4>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <!-- Email -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Email</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.ownerEmail || 'Not provided' }}</div>
                </div>
                
                <!-- Phone -->
                <div>
                  <div class="text-xs text-gray-500 mb-1">Phone</div>
                  <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.contactInformation || 'Not provided' }}</div>
                </div>
              </div>
            </div>
            
            <!-- Address Section -->
            <div>
              <div class="flex items-center mb-2">
                <div class="bg-red-100 rounded-full p-1.5 mr-2">
                  <MapPinIcon class="w-4 h-4 text-red-500" />
                </div>
                <h4 class="text-sm font-medium text-gray-700">Address</h4>
              </div>
              
              <div class="mt-3">
                <div class="text-xs text-gray-500 mb-1">Street Address</div>
                <div class="text-sm font-medium text-gray-900">{{ selectedAppointment.streetAddress || 'Not provided' }}</div>
              </div>
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
        <div v-if="currentApprovalStep.id === 'schedule'" class="space-y-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Appointment Details</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-500 mb-1">Date</div>
                <div class="text-base text-gray-900">{{ selectedAppointment.date ? formatDate(selectedAppointment.date) : 'N/A' }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-500 mb-1">Time</div>
                <div class="text-base text-gray-900">{{ selectedAppointment.time || 'N/A' }}</div>
              </div>
            </div>
            
            <!-- Services -->
            <div class="mt-4">
              <div class="text-sm text-gray-500 mb-2">Services</div>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="(service, index) in selectedAppointment.serviceNames" 
                  :key="index"
                  class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {{ service }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Confirmation Step - Updated for multiple pets -->
        <div v-if="currentApprovalStep.id === 'confirm'" class="space-y-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-3">Appointment Summary</h3>
            
            <div class="space-y-4">
              <!-- Owner Summary - Enhanced with all details -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-500 mb-2">Owner</div>
                <div class="text-lg font-medium text-gray-900">{{ selectedAppointment.ownerName || 'Unknown Owner' }}</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <div>
                    <div class="text-xs text-gray-500">Email</div>
                    <div class="text-sm text-gray-700">{{ selectedAppointment.ownerEmail || 'No email' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Phone</div>
                    <div class="text-sm text-gray-700">{{ selectedAppointment.contactInformation || 'No contact info' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Gender</div>
                    <div class="text-sm text-gray-700 capitalize">{{ selectedAppointment.gender || 'Not provided' }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Age</div>
                    <div class="text-sm text-gray-700">{{ selectedAppointment.age || calculateAge(selectedAppointment.dateOfBirth) || 'Not provided' }}</div>
                  </div>
                  <div class="col-span-1 md:col-span-2">
                    <div class="text-xs text-gray-500">Address</div>
                    <div class="text-sm text-gray-700">{{ selectedAppointment.streetAddress || 'Not provided' }}</div>
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
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-500 mb-2">Schedule</div>
                <div class="text-lg font-medium text-gray-900">
                  {{ selectedAppointment.date ? formatDate(selectedAppointment.date) : 'N/A' }} at {{ selectedAppointment.time || 'N/A' }}
                </div>
              </div>
              
              <!-- Services Summary -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm font-medium text-gray-500 mb-2">Services</div>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="(service, index) in selectedAppointment.serviceNames" 
                    :key="index"
                    class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {{ service }}
                  </span>
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
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, onActivated, onDeactivated, nextTick } from 'vue';
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
MapPin as MapPinIcon
} from 'lucide-vue-next';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import { usePetsStore } from '@/stores/modules/petsStore';
import { useAuthStore } from '@/stores/modules/authStore';
import { parseISO, format } from 'date-fns';

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
onMounted(() => {
fetchAppointments();
});

// Clean up when component is unmounted
onBeforeUnmount(() => {
// Reset any processing states when leaving the page
resetProcessingStates();
});

// Handle Vue keep-alive activation/deactivation
onActivated(() => {
// When the component is activated (comes back into view)
// Reset any processing states and refresh data
resetProcessingStates();
fetchAppointments(); // Always fetch fresh data when coming back to this view
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

// Status filter functions
const toggleStatusFilter = (status) => {
if (status === 'All') {
  filters.value.status = '';
} else {
  filters.value.status = status;
}
showFilters.value = false;
currentPage.value = 1;
};

const clearStatusFilter = () => {
filters.value.status = '';
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

const options = { year: 'numeric', month: 'long', day: 'numeric' };
return date.toLocaleDateString(undefined, options);
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

// Capitalize first letter
return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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

// Process each appointment
appointments.value.forEach(appointment => {
  // Check if it matches the search and filter criteria
  const matchesSearch =
    (appointment.ownerName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.ownerEmail?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.petName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.petSpecies?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
    (appointment.contactInformation?.toLowerCase() || '').includes(search.value.toLowerCase());

  const matchesStatus = filters.value.status === '' || appointment.status === filters.value.status;

  // Only add to the map if it matches criteria and isn't already there
  if (matchesSearch && matchesStatus) {
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
    return `${baseClasses} bg-purple-100 text-purple-800`; // Purple color for completed status
  case 'cancelled':
  case 'rejected':
    return `${baseClasses} bg-red-100 text-red-800`;
  case 'ended':
    return `${baseClasses} bg-slate-200 text-slate-700`;
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
        appointment.serviceNames?.join('; ') || '',
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
</style>


