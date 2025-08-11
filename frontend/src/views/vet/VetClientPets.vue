<!-- views/vet/VetClientPets.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Client Pets Management</h1>
      <p class="text-gray-500 mt-1">Manage pet owner profiles and their pets who have transactions with you.</p>
      <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 text-sm font-medium">ℹ</span>
            </div>
          </div>
          <div class="ml-3 text-left">
            <p class="text-sm text-blue-800">
              <strong>Note:</strong> Only showing clients and pets that have appointments or services with you.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading spinner during initial data load -->
    <LoadingSpinner v-if="initialLoading" isOverlay text="Loading pet owners and pets..." />
    
    <!-- Loading spinner during save operation -->
    <LoadingSpinner v-if="isSaving" isOverlay text="Saving pet information..." />
    
    <!-- No vet authenticated message -->
    <div v-if="!authStore.user?.uid" class="text-center py-20">
      <div class="max-w-md mx-auto">
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-8 mx-auto">
          <UserXIcon class="w-16 h-16 text-red-400" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-700 mb-3">Authentication Required</h3>
        <p class="text-gray-500 mb-6 leading-relaxed">
          Please log in as a veterinarian to view your client pets and manage their records.
        </p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span class="text-red-600 text-sm font-medium">⚠</span>
              </div>
            </div>
            <div class="ml-3 text-left">
              <p class="text-sm text-red-800">
                <strong>Note:</strong> This page is only accessible to authenticated veterinarians.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    

    
    <!-- Enhanced Pet Selection View -->
    <div v-if="authStore.user?.uid && showPetSelector && selectedOwner && !selectedPet && !showForm" class="min-h-screen">
      <div class="flex items-center mb-8">
        <button @click="goBackToList" class="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Select Pet</h2>
          <p class="text-gray-600 mt-1">Owner: <span class="font-semibold text-gray-800">{{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</span></p>
        </div>
      </div>
      
      <!-- Enhanced Pet Grid Layout -->
      <div v-if="selectedOwner.pets && selectedOwner.pets.length > 0" class="space-y-6">
        <!-- Pet Count and Quick Stats -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Pet Overview</h3>
              <p class="text-gray-600">{{ selectedOwner.pets.length }} {{ selectedOwner.pets.length === 1 ? 'pet' : 'pets' }} registered</p>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ getTotalMedicalRecords() }}</div>
                <div class="text-gray-500">Total Records</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ getActiveVaccinations() }}</div>
                <div class="text-gray-500">Active Vaccines</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pet Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(pet, index) in selectedOwner.pets" 
            :key="pet.id"
            class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <!-- Pet Header with Photo -->
            <div class="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
              <img 
                :src="pet.photoURL || defaultPetPhotoURL" 
                :alt="pet.name" 
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              <!-- Pet Name Badge -->
              <div class="absolute bottom-4 left-4 right-4">
                <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <h3 class="font-bold text-lg text-gray-900">{{ pet.name }}</h3>
                  <p class="text-sm text-gray-600">{{ pet.species }} • {{ pet.breed }}</p>
                </div>
              </div>
              
              <!-- Quick Action Buttons -->
              <div class="absolute top-4 right-4 flex gap-2">
                <button 
                  @click="editPet(pet)"
                  class="w-8 h-8 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-white transition-colors shadow-lg flex items-center justify-center"
                  title="Edit Pet"
                >
                  <Edit class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <!-- Pet Details -->
            <div class="p-6">
              <!-- Key Stats Grid -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-900">{{ formatPetAge(pet) }}</div>
                  <div class="text-xs text-gray-500">Age</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-900">{{ pet.weight || '—' }} kg</div>
                  <div class="text-xs text-gray-500">Weight</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-900 capitalize">{{ pet.gender || '—' }}</div>
                  <div class="text-xs text-gray-500">Gender</div>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-lg font-bold text-gray-900">{{ getPetRecordCount(pet) }}</div>
                  <div class="text-xs text-gray-500">Records</div>
                </div>
              </div>
              
              <!-- Recent Activity Indicator -->
              <div v-if="getPetRecordCount(pet) > 0" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center text-sm text-green-700">
                  <CheckCircleIcon class="w-4 h-4 mr-2" />
                  Last updated: {{ formatDate(getLastUpdateDate(pet)) }}
                </div>
              </div>
              
              <!-- Primary Action Button -->
              <button 
                @click="viewPet(pet)"
                class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                View Complete History
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Enhanced Empty State -->
      <div v-else class="py-20 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-8 mx-auto">
            <PawPrintIcon class="w-16 h-16 text-blue-400" />
          </div>
          <h3 class="text-2xl font-semibold text-gray-700 mb-3">No pets registered yet</h3>
          <p class="text-gray-500 mb-6 leading-relaxed">
            This owner hasn't added any pets to their profile. Pets will appear here once they are registered through the user portal.
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 text-sm font-medium">ℹ</span>
                </div>
              </div>
              <div class="ml-3 text-left">
                <p class="text-sm text-blue-800">
                  <strong>Note:</strong> Pet owners add their pets through their user dashboard. 
                  You can view and manage pet information once they're registered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pet View Details -->
    <div v-else-if="authStore.user?.uid && selectedPet && !showForm">
      <div class="pet-view-details">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
            <button @click="goBackFromPetView" class="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h2 class="text-2xl font-bold">Pet Details</h2>
          </div>
        </div>
      
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Owner Information Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <UserIcon class="w-5 h-5 mr-2 text-gray-500" />
              Owner Information
            </h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-500">Name</p>
                <p class="font-medium">{{ selectedPet?.owner?.firstName || '' }} {{ selectedPet?.owner?.lastName || '' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Phone</p>
                <p class="font-medium">{{ selectedPet?.owner?.phone || 'No phone' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">{{ selectedPet?.owner?.email || '' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Address</p>
                <p class="font-medium">{{ selectedPet?.owner?.streetAddress || 'No address' }}</p>
              </div>
            </div>
          </div>
      
          <!-- Pet Information Card -->
          <div class="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div class="flex items-start">
              <img 
                :src="selectedPet?.photoURL || defaultPetPhotoURL" 
                alt="Pet Photo" 
                class="w-24 h-24 object-cover rounded-lg mr-6"
              />
              <div class="flex-grow">
                <h3 class="text-xl font-bold mb-2">{{ selectedPet?.name || '' }}</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Species</p>
                    <p class="font-medium capitalize">{{ selectedPet?.species || '' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Breed</p>
                    <p class="font-medium">{{ selectedPet?.breed || '' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Age</p>
                    <p class="font-medium">{{ selectedPet ? formatPetAge(selectedPet) : '' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Gender</p>
                    <p class="font-medium">{{ selectedPet?.gender || '' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Weight</p>
                    <p class="font-medium">{{ selectedPet?.weight || '' }} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          <!-- Medical History Card -->
          <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
            <!-- Header with Actions -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Medical History</h3>
                <p class="text-sm text-gray-600 mt-1">Complete medical records, vaccinations, and appointment history</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-2">
                  <PlusIcon class="w-4 h-4" />
                  Add Record
                </button>
              </div>
            </div>

            <!-- Enhanced Filter Buttons -->
            <div class="flex flex-wrap gap-3">
              <button
                @click="setHistoryFilter('all')"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  historyFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                ]"
              >
                <ActivityIcon class="w-4 h-4" />
                All Records
              </button>
              <button
                @click="setHistoryFilter('vaccinations')"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  historyFilter === 'vaccinations'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                ]"
              >
                <SyringeIcon class="w-4 h-4" />
                Vaccinations
              </button>
              <button
                @click="setHistoryFilter('telehealth')"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  historyFilter === 'telehealth'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                ]"
              >
                <ActivityIcon class="w-4 h-4" />
                Telehealth
              </button>
              <button
                @click="setHistoryFilter('treatments')"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  historyFilter === 'treatments'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                ]"
              >
                <ActivityIcon class="w-4 h-4" />
                Medical Treatments
              </button>

              <!-- Clear Filter Button -->
              <button
                v-if="historyFilter !== 'all'"
                @click="setHistoryFilter('all')"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm flex items-center gap-2"
              >
                <XIcon class="w-4 h-4" />
                Clear Filter
              </button>
            </div>

            <!-- Record Counter and Stats -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">{{ timelineEntries.length }}</div>
                    <div class="text-xs text-gray-500">Total Records</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-semibold text-green-600">{{ (selectedPet?.vaccinations || []).filter(v => v.completed).length }}</div>
                    <div class="text-xs text-gray-500">Completed Vaccinations</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-semibold text-blue-600">{{ (selectedPet?.medicalHistory || []).length }}</div>
                    <div class="text-xs text-gray-500">Medical Treatments</div>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  <span v-if="historyFilter !== 'all'">Filtered by: {{ historyFilter === 'vaccinations' ? 'Vaccinations' : historyFilter === 'telehealth' ? 'Telehealth' : 'Medical Treatments' }}</span>
                </div>
              </div>
            </div>

            <!-- Loading and Error States -->
            <div v-if="historyLoading" class="py-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p class="text-gray-500">Loading medical records...</p>
            </div>
            
            <div v-else-if="historyError" class="bg-red-50 border border-red-200 text-red-600 p-6 rounded-lg text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XIcon class="w-6 h-6 text-red-500" />
              </div>
              <p class="font-medium">{{ historyError }}</p>
              <button @click="fetchPetAppointments" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Try Again
              </button>
            </div>

            <!-- Records Timeline -->
            <div v-else>
              <div v-if="timelineEntries.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <component
                    :is="historyFilter === 'vaccinations' ? SyringeIcon :
                         historyFilter === 'telehealth' ? ActivityIcon :
                         historyFilter === 'treatments' ? ActivityIcon : ActivityIcon"
                    class="w-8 h-8 text-gray-400"
                  />
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ historyFilter === 'all' ? 'No medical records yet' :
                     historyFilter === 'vaccinations' ? 'No vaccination records found' :
                     historyFilter === 'telehealth' ? 'No telehealth appointments found' :
                     'No medical treatment records found' }}
                </h3>
                <p class="text-gray-500 max-w-md mx-auto">
                  {{ historyFilter === 'all' ? 'Medical records and past appointments will appear here once they are added to your pet\'s profile.' :
                     historyFilter === 'vaccinations' ? 'Vaccination records will appear here once they are added by your veterinarian.' :
                     historyFilter === 'telehealth' ? 'Telehealth appointments will appear here once they are scheduled and completed.' :
                     'Medical treatment records will appear here once they are added by your veterinarian.' }}
                </p>
              </div>
              
              <!-- Enhanced Timeline -->
              <div v-else class="relative">
                <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div class="space-y-6">
                  <div v-for="(e, idx) in timelineEntries" :key="idx" class="relative pl-8">
                    <!-- Timeline Dot -->
                    <div class="absolute left-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center" :class="{
                      'bg-green-500': e.kind === 'Vaccination' && e.status === 'completed',
                      'bg-yellow-500': e.kind === 'Vaccination' && e.status === 'pending',
                      'bg-blue-500': e.kind === 'Telehealth',
                      'bg-emerald-500': e.kind === 'Treatment',
                      'bg-indigo-500': e.kind === 'Appointment'
                    }">
                      <component :is="e.icon" class="w-2.5 h-2.5 text-white" />
                    </div>
                    
                    <!-- Timeline Content -->
                    <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                      <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-medium px-2 py-1 rounded-full" :class="{
                            'bg-green-100 text-green-700': e.kind === 'Vaccination' && e.status === 'completed',
                            'bg-yellow-100 text-yellow-700': e.kind === 'Vaccination' && e.status === 'pending',
                            'bg-blue-100 text-blue-700': e.kind === 'Telehealth',
                            'bg-emerald-100 text-emerald-700': e.kind === 'Treatment',
                            'bg-indigo-100 text-indigo-700': e.kind === 'Appointment'
                          }">
                            {{ e.kind }}
                          </span>
                          <span v-if="e.status" class="text-xs px-2 py-1 rounded-full" :class="{
                            'bg-yellow-100 text-yellow-700': e.status === 'pending',
                            'bg-green-100 text-green-700': e.status === 'completed',
                            'bg-blue-100 text-blue-700': e.status === 'approved',
                            'bg-red-100 text-red-700': e.status === 'rejected' || e.status === 'cancelled'
                          }">
                            {{ e.status.charAt(0).toUpperCase() + e.status.slice(1) }}
                          </span>
                        </div>
                        <div class="text-xs text-gray-400">{{ formatDate(e.date, 'PPpp') }}</div>
                      </div>
                      
                      <h4 class="font-medium text-gray-900 mb-1">{{ e.title }}</h4>
                      <div v-if="e.subtitle" class="text-sm text-gray-600 mb-2">{{ e.subtitle }}</div>
                      <div v-if="e.details" class="text-sm text-gray-500 bg-gray-50 rounded p-2">{{ e.details }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          <!-- Unified Timeline View -->
          <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
                       <div class="flex justify-between items-center mb-6">
             <h3 class="text-lg font-semibold">Complete Timeline View</h3>
             <div class="flex gap-2">
               <button 
                 @click="refreshPetData(selectedPet.id)"
                 class="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                 title="Refresh Timeline Data"
               >
                 <RefreshCwIcon class="w-4 h-4 inline mr-1" />
                 Refresh
               </button>
                <button 
                  @click="setTimelineFilter('all')"
                  :class="[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    timelineFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  All
                </button>
                <button 
                  @click="setTimelineFilter('medical')"
                  :class="[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    timelineFilter === 'medical'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  Medical
                </button>
                <button 
                  @click="setTimelineFilter('vaccinations')"
                  :class="[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    timelineFilter === 'vaccinations'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  Vaccinations
                </button>
                <button 
                  @click="setTimelineFilter('documents')"
                  :class="[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    timelineFilter === 'documents'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  Documents
                </button>
              </div>
            </div>
            
            <p class="text-sm text-gray-600 mb-6">Complete chronological timeline of all pet activities, treatments, and records.</p>
            
            <!-- Timeline Records Counter -->
            <div class="mb-4 text-sm text-gray-600">
              Showing {{ filteredTimelineRecords.length }} {{ filteredTimelineRecords.length === 1 ? 'record' : 'records' }}
              <span v-if="timelineFilter !== 'all'">for {{ getTimelineFilterLabel(timelineFilter) }}</span>
            </div>
            
            <!-- Timeline View -->
            <div class="space-y-4">
              <div v-for="(record, index) in filteredTimelineRecords" :key="`${record.type}-${index}`" class="relative">
                <!-- Timeline Line -->
                <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <!-- Timeline Item -->
                <div class="flex items-start space-x-4">
                  <!-- Icon Circle -->
                  <div class="relative z-10 flex-shrink-0">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                         :class="getTimelineIconClass(record.type)">
                      <component :is="getTimelineIcon(record.type)" class="w-5 h-5" />
                    </div>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <h4 class="font-semibold text-gray-900">{{ getTimelineTitle(record) }}</h4>
                          <span class="px-2 py-1 text-xs font-medium rounded-full"
                                :class="getTimelineStatusClass(record)">
                            {{ getTimelineStatus(record) }}
                          </span>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-2">{{ record.description }}</p>
                        
                        <div class="flex items-center gap-4 text-xs text-gray-500">
                          <span class="flex items-center gap-1">
                            <CalendarIcon class="w-3 h-3" />
                            {{ formatDate(record.date) }}
                          </span>
                          <span v-if="record.vet" class="flex items-center gap-1">
                            <UserIcon class="w-3 h-3" />
                            {{ record.vet }}
                          </span>
                          <span v-if="record.expiryDate" class="flex items-center gap-1">
                            <ClockIcon class="w-3 h-3" />
                            Expires: {{ formatDate(record.expiryDate) }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2 ml-4">
                        <button @click="editTimelineRecord(record, index)" 
                                class="p-1.5 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <Edit class="w-4 h-4 text-gray-500" />
                        </button>
                        <button @click="deleteTimelineRecord(record, index)" 
                                class="p-1.5 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <TrashIcon class="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div v-if="filteredTimelineRecords.length === 0" class="text-center py-12">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ActivityIcon class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-gray-500 font-medium">No timeline records found</p>
                  <p class="text-gray-400 text-sm mt-1">
                    {{ timelineFilter === 'all' ? 'Add some medical records, vaccinations, or documents to see them here' : `No ${getTimelineFilterLabel(timelineFilter).toLowerCase()} found` }}
                  </p>
                </div>
              </div>
            </div>
          </div>
      

      
          <!-- Documents Card -->
          <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Documents</h3>
              <button 
                @click="addDocument" 
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <PlusCircleIcon class="w-4 h-4" />
                Add Document
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortDocuments('name')">
                      <div class="flex items-center">
                        Document Name
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': documentSortKey === 'name' && documentSortOrder === 'asc', 'text-gray-400': !(documentSortKey === 'name' && documentSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': documentSortKey === 'name' && documentSortOrder === 'desc', 'text-gray-400': !(documentSortKey === 'name' && documentSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortDocuments('date')">
                      <div class="flex items-center">
                        Date
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': documentSortKey === 'date' && documentSortOrder === 'asc', 'text-gray-400': !(documentSortKey === 'date' && documentSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': documentSortKey === 'date' && documentSortOrder === 'desc', 'text-gray-400': !(documentSortKey === 'date' && documentSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortDocuments('type')">
                      <div class="flex items-center">
                        Type
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': documentSortKey === 'type' && documentSortOrder === 'asc', 'text-gray-400': !(documentSortKey === 'type' && documentSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': documentSortKey === 'type' && documentSortOrder === 'desc', 'text-gray-400': !(documentSortKey === 'type' && documentSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(document, index) in sortedDocuments" :key="index">
                    <td class="px-6 py-4 whitespace-nowrap">{{ document.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(document.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap uppercase">{{ document.type }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex gap-2">
                        <a 
                          :href="document.url" 
                          target="_blank" 
                          class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                          <DownloadIcon class="w-4 h-4 text-blue-500" />
                        </a>
                        <button @click="editDocument(index)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <Edit class="w-4 h-4 text-gray-500" />
                        </button>
                        <button @click="deleteDocument(document, selectedPet)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <TrashIcon class="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!selectedPet?.documents || selectedPet?.documents?.length === 0">
                    <td colspan="4" class="px-6 py-8 text-center">
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <FileIcon class="w-8 h-8 text-gray-300" />
                        </div>
                        <p class="text-gray-500 font-medium">No documents found</p>
                        <p class="text-gray-400 text-sm mt-1">Click 'Add Document' to add a new document</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Inline Add/Edit Pet Form -->
    <div v-else-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <button @click="cancelForm" class="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <h2 class="text-xl font-semibold">{{ isNewPet ? 'Add New Pet' : 'Edit Pet Info' }}</h2>
        </div>
      </div>
      
      <!-- Tabs - Desktop View -->
      <div class="mb-6 border-b hidden md:block">
        <nav class="flex space-x-8">
          <button 
            @click="activeTab = 'basics'" 
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'basics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Basic Details
          </button>
          <button 
            @click="activeTab = 'medical'" 
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'medical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Medical History
          </button>
          <button 
            @click="activeTab = 'vaccinations'" 
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'vaccinations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Vaccinations
          </button>
          <button 
            @click="activeTab = 'documents'" 
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Documents
          </button>
          <button 
            @click="activeTab = 'timeline'" 
            class="py-4 px-1 border-b-2 font-medium text-sm"
            :class="activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            Timeline
          </button>
        </nav>
      </div>
      
      <!-- Dropdown - Mobile View -->
      <div class="mb-6 md:hidden">
        <div class="relative">
          <!-- Dropdown Button -->
          <button 
            @click="toggleTabDropdown" 
            class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-lg text-left"
          >
            <div class="flex items-center">
              <component :is="getTabIcon(activeTab)" class="w-5 h-5 mr-2 text-gray-500" />
              <span class="font-medium">{{ getTabLabel(activeTab) }}</span>
            </div>
            <ChevronDown 
              class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'transform rotate-180': showTabDropdown }"
            />
          </button>
          
          <!-- Dropdown Menu -->
          <div 
            v-if="showTabDropdown" 
            class="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg py-1"
          >
            <button 
              @click="selectTab('basics')" 
              class="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
              :class="activeTab === 'basics' ? 'bg-gray-50' : ''"
            >
              <FileText class="w-5 h-5 mr-2 text-gray-500" />
              Basic Details
            </button>
            <button 
              @click="selectTab('medical')" 
              class="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
              :class="activeTab === 'medical' ? 'bg-gray-50' : ''"
            >
              <Activity class="w-5 h-5 mr-2 text-gray-500" />
              Medical History
            </button>
            <button 
              @click="selectTab('vaccinations')" 
              class="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
              :class="activeTab === 'vaccinations' ? 'bg-gray-50' : ''"
            >
              <SyringeIcon class="w-5 h-5 mr-2 text-gray-500" />
              Vaccinations
            </button>
            <button 
              @click="selectTab('documents')" 
              class="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
              :class="activeTab === 'documents' ? 'bg-gray-50' : ''"
            >
              <FileIcon class="w-5 h-5 mr-2 text-gray-500" />
              Documents
            </button>
            <button 
              @click="selectTab('timeline')" 
              class="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
              :class="activeTab === 'timeline' ? 'bg-gray-50' : ''"
            >
              <ActivityIcon class="w-5 h-5 mr-2 text-gray-500" />
              Timeline
            </button>
          </div>
        </div>
      </div>
      
      <!-- Tab Content -->
      <div>
        <!-- Basic Details Tab -->
        <div v-if="activeTab === 'basics'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <h3 class="text-lg font-semibold mb-4">Owner Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <p class="w-full px-3 py-2 border rounded-md bg-gray-50">{{ formData.owner.firstName }} {{ formData.owner.lastName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
                  <p class="w-full px-3 py-2 border rounded-md bg-gray-50">{{ formData.owner.phone || 'No phone' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                  <p class="w-full px-3 py-2 border rounded-md bg-gray-50">{{ formData.owner.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Owner Address</label>
                  <p class="w-full px-3 py-2 border rounded-md bg-gray-50">{{ formData.owner.streetAddress || 'No address' }}</p>
                </div>
              </div>
            </div>
    
            <div class="md:col-span-2">
              <h3 class="text-lg font-semibold mb-4">Pet Information</h3>
            </div>
    
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
              <input 
                type="text" 
                v-model="formData.name" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
    
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <input 
                type="text" 
                v-model="formData.species" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
    
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input 
                type="text" 
                v-model="formData.breed" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
    
            <!-- Age fields - Updated to match PetProfile structure -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Age <span class="text-gray-500 text-sm">(Years, Months, Weeks)</span></label>
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="w-full sm:w-1/3">
                  <input
                    type="number"
                    v-model="formData.ageYears"
                    min="0"
                    placeholder="Years"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                </div>
                <div class="w-full sm:w-1/3">
                  <input
                    type="number"
                    v-model="formData.ageMonths"
                    min="0"
                    max="11"
                    placeholder="Months"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                </div>
                <div class="w-full sm:w-1/3">
                  <input
                    type="number"
                    v-model="formData.ageWeeks"
                    min="0"
                    max="3"
                    placeholder="Weeks"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                </div>
              </div>
            </div>    

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div class="relative">
                <div 
                  @click="toggleGenderDropdown" 
                  class="w-full px-3 py-2 border rounded-md cursor-pointer flex justify-between items-center gender-dropdown"
                >
                  <span v-if="formData.gender">{{ formData.gender }}</span>
                  <span v-else class="text-gray-500">Select gender</span>
                  <ChevronDown class="w-4 h-4 text-gray-500" :class="{ 'transform rotate-180': genderDropdownOpen }" />
                </div>
                
                <div 
                  v-show="genderDropdownOpen" 
                  class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg gender-dropdown"
                >
                  <div 
                    v-for="option in genderOptions" 
                    :key="option.value"
                    @click="selectGender(option.value)"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </div>
            </div>
    
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input 
                type="number" 
                step="0.01" 
                v-model="formData.weight" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>
    
        <!-- Medical History Tab -->
        <div v-if="activeTab === 'medical'">
          <div class="flex justify-between mb-4">
            <h3 class="text-lg font-semibold">Medical History</h3>
            <button 
              @click="addMedicalRecord" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <PlusCircleIcon class="w-4 h-4" />
              Add Record
            </button>
          </div>
    
          <!-- Table for medical history -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vet</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(record, index) in formData.medicalHistory" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="date" 
                      v-model="record.date" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <select v-model="record.type" class="w-full px-2 py-1 border rounded">
                      <option value="Checkup">Checkup</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Illness">Illness</option>
                      <option value="Injury">Injury</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Dental">Dental</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td class="px-6 py-4">
                    <textarea 
                      v-model="record.description" 
                      rows="2" 
                      class="w-full px-2 py-1 border rounded"
                    ></textarea>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      v-model="record.vet" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      @click="removeMedicalRecord(index)" 
                      class="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!formData.medicalHistory || formData.medicalHistory.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center">
                      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <ClipboardIcon class="w-8 h-8 text-gray-300" />
                      </div>
                      <p class="text-gray-500 font-medium">No medical records found</p>
                      <p class="text-gray-400 text-sm mt-1">Click 'Add Record' to add a new medical record</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    
        <!-- Vaccinations Tab -->
        <div v-if="activeTab === 'vaccinations'">
          <div class="flex justify-between mb-4">
            <h3 class="text-lg font-semibold">Vaccinations</h3>
            <button 
              @click="addVaccination" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <PlusCircleIcon class="w-4 h-4" />
              Add Vaccination
            </button>
          </div>
    
          <!-- Table for vaccinations -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(vaccination, index) in formData.vaccinations" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      v-model="vaccination.name" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="date" 
                      v-model="vaccination.date" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="date" 
                      v-model="vaccination.expiryDate" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      @click="removeVaccination(index)" 
                      class="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!formData.vaccinations || formData.vaccinations.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center">
                      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <SyringeIcon class="w-8 h-8 text-gray-300" />
                      </div>
                      <p class="text-gray-500 font-medium">No vaccinations found</p>
                      <p class="text-gray-400 text-sm mt-1">Click 'Add Vaccination' to add a new vaccination</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    
        <!-- Documents Tab -->
        <div v-if="activeTab === 'documents'">
          <div class="flex justify-between mb-4">
            <h3 class="text-lg font-semibold">Documents</h3>
            <button 
              @click="addDocument" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <PlusCircleIcon class="w-4 h-4" />
              Add Document
            </button>
          </div>
    
          <!-- Table for documents -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(document, index) in formData.documents" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      v-model="document.name" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="date" 
                      v-model="document.date" 
                      class="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <select v-model="document.type" class="w-full px-2 py-1 border rounded">
                      <option value="pdf">PDF</option>
                      <option value="doc">DOC</option>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                      <option value="other">Other</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <div class="flex items-center space-x-2 justify-end">
                      <button class="text-blue-600 hover:text-blue-900">
                        <DownloadIcon class="w-5 h-5" />
                      </button>
                      <button 
                        @click="removeDocument(index)" 
                        class="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!formData.documents || formData.documents.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center">
                      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileIcon class="w-8 h-8 text-gray-300" />
                      </div>
                      <p class="text-gray-500 font-medium">No documents found</p>
                      <p class="text-gray-400 text-sm mt-1">Click 'Add Document' to add a new document</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
                 <!-- Timeline Tab -->
         <div v-if="activeTab === 'timeline'">
           <div class="mb-6">
             <div class="flex justify-between items-center mb-4">
               <h3 class="text-lg font-semibold">Complete Timeline View</h3>
               <button 
                 @click="refreshPetData(selectedPet.id)"
                 class="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                 title="Refresh Timeline Data"
               >
                 <RefreshCwIcon class="w-4 h-4 inline mr-1" />
                 Refresh
               </button>
             </div>
            <p class="text-sm text-gray-600 mb-6">Complete chronological timeline of all pet activities, treatments, and records.</p>
            
            <!-- Timeline Filter Buttons -->
            <div class="flex flex-wrap gap-2 mb-4">
              <button 
                @click="setTimelineFilter('all')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  timelineFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                All Activities
              </button>
              <button 
                @click="setTimelineFilter('medical')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  timelineFilter === 'medical'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Medical Records
              </button>
              <button 
                @click="setTimelineFilter('vaccinations')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  timelineFilter === 'vaccinations'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Vaccinations
              </button>
              <button 
                @click="setTimelineFilter('telehealth')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  timelineFilter === 'telehealth'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Telehealth
              </button>
              <button 
                @click="setTimelineFilter('documents')"
                :class="[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  timelineFilter === 'documents'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                Documents
              </button>
            </div>
            
            <!-- Timeline Records Counter -->
            <div class="mb-4 text-sm text-gray-600">
              Showing {{ filteredTimelineRecords.length }} {{ filteredTimelineRecords.length === 1 ? 'record' : 'records' }}
              <span v-if="timelineFilter !== 'all'">for {{ getTimelineFilterLabel(timelineFilter) }}</span>
            </div>
            
            <!-- Timeline View -->
            <div class="space-y-4">
              <div v-for="(record, index) in filteredTimelineRecords" :key="`${record.type}-${index}`" class="relative">
                <!-- Timeline Line -->
                <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <!-- Timeline Item -->
                <div class="flex items-start space-x-4">
                  <!-- Icon Circle -->
                  <div class="relative z-10 flex-shrink-0">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                         :class="getTimelineIconClass(record.type)">
                      <component :is="getTimelineIcon(record.type)" class="w-5 h-5" />
                    </div>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <h4 class="font-semibold text-gray-900">{{ getTimelineTitle(record) }}</h4>
                          <span class="px-2 py-1 text-xs font-medium rounded-full"
                                :class="getTimelineStatusClass(record)">
                            {{ getTimelineStatus(record) }}
                          </span>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-2">{{ record.description || 'No description available' }}</p>
                        
                        <div class="flex items-center gap-4 text-xs text-gray-500">
                          <span class="flex items-center gap-1">
                            <CalendarIcon class="w-3 h-3" />
                            {{ formatDate(record.date) }}
                          </span>
                          <span v-if="record.vet" class="flex items-center gap-1">
                            <UserIcon class="w-3 h-3" />
                            {{ record.vet }}
                          </span>
                          <span v-if="record.expiryDate" class="flex items-center gap-1">
                            <ClockIcon class="w-3 h-3" />
                            Expires: {{ formatDate(record.expiryDate) }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Actions -->
                      <div class="flex gap-2 ml-4">
                        <button @click="editTimelineRecord(record, index)" 
                                class="p-1.5 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <Edit class="w-4 h-4 text-gray-500" />
                        </button>
                        <button @click="deleteTimelineRecord(record, index)" 
                                class="p-1.5 hover:bg-gray-200 rounded-full transition-colors duration-200">
                          <TrashIcon class="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div v-if="filteredTimelineRecords.length === 0" class="text-center py-12">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ActivityIcon class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-gray-500 font-medium">No timeline records found</p>
                  <p class="text-gray-400 text-sm mt-1">
                    {{ timelineFilter === 'all' ? 'Add some medical records, vaccinations, or documents to see them here' : `No ${getTimelineFilterLabel(timelineFilter).toLowerCase()} found` }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Form Buttons -->
      <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
        <button
          type="button"
          @click="cancelForm"
          class="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1 text-xs sm:text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="savePet"
          :disabled="isSaving"
          class="px-3 py-1.5 sm:px-4 sm:py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Saving...' : (isNewPet ? 'Add Pet' : 'Save Changes') }}
        </button>
      </div>
    </div>
    
    <!-- Main Profiles/Pets Table View -->
    <div v-else>
      <!-- Search and Actions -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="flex gap-2 w-full sm:w-auto">
          <div class="relative flex-grow">
            <input 
              v-model="searchQuery" 
              class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Search pets or owners..."
            />
            <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div class="relative">
            <button 
              class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              @click="toggleFilter"
            >
              <FilterIcon class="w-5 h-5 text-gray-500" />
            </button>
            <!-- Filter Dropdown -->
            <div v-if="showFilterMenu" class="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <div class="px-4 py-2 text-sm font-medium text-gray-700">Filter by:</div>
              
              <!-- Pet Count Filter -->
              <div class="px-4 py-2">
                <div class="text-sm font-medium text-gray-700 mb-2">Number of pets:</div>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      value="one"
                      v-model="filters.petCount"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-600">Has one pet</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      value="two"
                      v-model="filters.petCount"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-600">Owns two pets</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      value="moreThanTwo"
                      v-model="filters.petCount"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-600">More than two pets</span>
                  </label>
                </div>
              </div>
              
              <div class="px-4 py-2">
                <button
                  @click="applyFilters"
                  class="w-full bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            @click="exportToCSV" 
            class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            <DownloadIcon class="w-5 h-5" />
            Export CSV
          </button>
          <div class="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              @click="viewMode = 'list'"
              :class="[
                'px-2 py-1.5 transition-colors duration-200',
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              <ListIcon class="w-3.5 h-3.5" />
            </button>
            <button 
              @click="viewMode = 'grid'"
              :class="[
                'px-2 py-1.5 transition-colors duration-200',
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              <LayoutGridIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div v-if="authStore.user?.uid" class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <!-- List View -->
        <div v-if="viewMode === 'list'">
          <table class="min-w-full">
            <thead class="bg-gray-100">
              <tr class="border-b border-gray-200">
                <th 
                  class="text-left py-4 px-6 text-xs font-medium text-gray-500 cursor-pointer"
                  @click="sortBy('owner.name')"
                >
                  <div class="flex items-center">
                    Pet Owner
                    <div class="flex flex-col ml-1">
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'owner.name' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'owner.name' && sortOrder === 'asc') }">▲</span>
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'owner.name' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'owner.name' && sortOrder === 'desc') }">▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  class="text-left py-4 px-6 text-xs font-medium text-gray-500 cursor-pointer"
                  @click="sortBy('owner.phone')"
                >
                  <div class="flex items-center">
                    Contact
                    <div class="flex flex-col ml-1">
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'owner.phone' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'owner.phone' && sortOrder === 'asc') }">▲</span>
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'owner.phone' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'owner.phone' && sortOrder === 'desc') }">▼</span>
                    </div>
                  </div>
                </th>
                <th class="text-left py-4 px-6 text-xs font-medium text-gray-500">
                  Pets
                </th>
                <th 
                  class="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="sortBy('createdAt')"
                >
                  <div class="flex items-center">
                    Created
                    <div class="flex flex-col ml-1">
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'createdAt' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'createdAt' && sortOrder === 'asc') }">▲</span>
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'createdAt' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'createdAt' && sortOrder === 'desc') }">▼</span>
                    </div>
                  </div>
                </th>
                <th 
                  class="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  @click="sortBy('updatedAt')"
                >
                  <div class="flex items-center">
                    Updated
                    <div class="flex flex-col ml-1">
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'updatedAt' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'updatedAt' && sortOrder === 'asc') }">▲</span>
                      <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'updatedAt' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'updatedAt' && sortOrder === 'desc') }">▼</span>
                    </div>
                  </div>
                </th>
                <th class="text-left py-4 px-6 text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(ownerData, ownerIndex) in paginatedOwners" 
                :key="ownerData.userId" 
                class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <img 
                      :src="ownerData.photoURL || defaultPhotoURL" 
                      :alt="`${ownerData.firstName} ${ownerData.lastName}`"
                      class="w-10 h-10 rounded-full object-cover cursor-pointer"
                    >
                    <div>
                      <div class="font-medium text-gray-900">{{ ownerData.firstName }} {{ ownerData.lastName }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div>
                    <div class="text-sm text-gray-500">{{ ownerData.phone || 'No phone' }}</div>
                    <div class="text-sm text-gray-500">{{ ownerData.email }}</div>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center">
                    <div class="flex -space-x-2 mr-2">
                      <div v-for="(pet, petIndex) in ownerData.pets.slice(0, 3)" :key="petIndex" 
                           class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
                        <img 
                          :src="pet.photoURL || defaultPetPhotoURL" 
                          :alt="pet.name" 
                          class="w-8 h-8 rounded-full object-cover"
                        >
                      </div>
                    </div>
                    <span class="text-blue-500 font-medium">
                      {{ formatPetNames(ownerData.pets) }}
                    </span>
                  </div>
                </td>
                <td class="py-4 px-6">
                  {{ formatDate(ownerData.createdAt) }}
                </td>
                <td class="py-4 px-6">
                  {{ formatDate(ownerData.updatedAt) }}
                </td>
                <td class="py-4 px-6">
                  <div class="flex gap-2">
                    <button 
                      @click="viewOwnerDetails(ownerData)"
                      class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <EyeIcon class="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      @click="editOwner(ownerData)"
                      class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <Edit class="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Empty state with icon placeholder -->
              <tr v-if="paginatedOwners.length === 0">
                <td colspan="6" class="py-8 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <PawPrintIcon class="w-8 h-8 text-gray-300" />
                    </div>
                    <p class="text-gray-500 font-medium">No pet owners found</p>
                    <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      
        <!-- Grid View -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          <div 
            v-for="ownerData in paginatedOwners" 
            :key="ownerData.userId" 
            class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
            <div class="p-6 flex-grow flex flex-col">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <img 
                    :src="ownerData.photoURL || defaultPhotoURL" 
                    :alt="`${ownerData.firstName} ${ownerData.lastName}`"
                    class="w-10 h-10 rounded-full object-cover cursor-pointer"
                  >
                  <div>
                    <div class="font-medium text-gray-900">{{ ownerData.firstName }} {{ ownerData.lastName }}</div>
                    <div class="text-sm text-gray-500">{{ ownerData.phone || 'No phone' }}</div>
                  </div>
                </div>
              </div>
              
              <div class="mb-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Pets:</h4>
                <div class="flex items-center">
                  <div class="flex -space-x-2 mr-2">
                    <div v-for="(pet, petIndex) in ownerData.pets.slice(0, 3)" :key="petIndex" 
                         class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white">
                      <img 
                        :src="pet.photoURL || defaultPetPhotoURL" 
                        :alt="pet.name" 
                        class="w-8 h-8 rounded-full object-cover"
                      >
                    </div>
                  </div>
                  <span class="text-blue-500 font-medium">
                    {{ formatPetNames(ownerData.pets) }}
                  </span>
                </div>
              </div>
              
              <div class="space-y-2 text-sm text-gray-500 mb-4">
                <div>
                  <span class="font-medium">Created:</span> {{ formatDate(ownerData.createdAt) }}
                </div>
                <div>
                  <span class="font-medium">Updated:</span> {{ formatDate(ownerData.updatedAt) }}
                </div>
              </div>
              
              <!-- Push the action buttons to the bottom -->
              <div class="mt-auto">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">
                    {{ ownerData.email }}
                  </span>
                  <div class="flex gap-2">
                    <button 
                      @click="viewOwnerDetails(ownerData)"
                      class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <EyeIcon class="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      @click="editOwner(ownerData)"
                      class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                      <Edit class="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination - Responsive -->
      <div v-if="filteredOwners.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
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
    
    <!-- Timeline Modal -->
    <div v-if="showTimelineModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="flex justify-between items-center p-6 border-b">
          <h3 class="text-xl font-semibold">Complete Medical Timeline</h3>
          <button @click="showTimelineModal = false" class="text-gray-400 hover:text-gray-600">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <!-- Filter Tabs -->
          <div class="flex gap-2 mb-6">
            <button 
              v-for="filter in ['all', 'checkups', 'vaccinations', 'treatments', 'telehealth']" 
              :key="filter"
              @click="setHistoryFilter(filter)"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                historyFilter === filter 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ getFilterLabel(filter) }}
            </button>
          </div>
          
          <!-- Timeline -->
          <div class="space-y-6">
            <div v-if="timelineEntries.length === 0" class="text-center py-12">
              <div class="mx-auto w-12 h-12 text-gray-400 mb-4">
                <component :is="getEmptyStateIcon()" class="w-full h-full" />
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p class="text-gray-500">No {{ getFilterLabel(historyFilter) }} records found for this pet.</p>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="(entry, index) in timelineEntries" :key="index" class="relative pl-8">
                <div class="absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-gray-200 bg-white"></div>
                <div class="absolute left-2 top-4 w-0.5 h-full bg-gray-200"></div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ entry.title }}</h4>
                      <p class="text-sm text-gray-600">{{ entry.subtitle }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button 
                        @click="editTimelineEntry(entry, index)"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <Edit class="w-4 h-4" />
                      </button>
                      <button 
                        @click="deleteTimelineEntry(entry, index)"
                        class="text-gray-400 hover:text-red-600"
                      >
                        <XIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span class="flex items-center gap-1">
                      <CalendarIcon class="w-4 h-4" />
                      {{ entry.date.toLocaleDateString() }}
                    </span>
                    <span class="flex items-center gap-1">
                      <ClockIcon class="w-4 h-4" />
                      {{ entry.date.toLocaleTimeString() }}
                    </span>
                  </div>
                  
                  <p v-if="entry.details" class="text-gray-700">{{ entry.details }}</p>
                  
                  <div class="flex items-center gap-2 mt-3">
                    <component :is="entry.icon" :class="['w-4 h-4', entry.color]" />
                    <span class="text-sm font-medium text-gray-600">{{ entry.kind }}</span>
                  </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  User as UserIcon,
  Search as SearchIcon,
  PlusCircle as PlusCircleIcon,
  Plus as PlusIcon,
  Filter as FilterIcon,
  List as ListIcon,
  LayoutGrid as LayoutGridIcon,
  Edit,
  Eye as EyeIcon,
  Download as DownloadIcon,
  ArrowLeft as ArrowLeftIcon,

  PawPrint as PawPrintIcon,
  Clipboard as ClipboardIcon,
  Syringe as SyringeIcon,
  File as FileIcon,
  FileText,
  Activity as ActivityIcon,
  ChevronDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  X as XIcon,

  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Stethoscope as StethoscopeIcon,
  Video as VideoIcon,
  RefreshCw as RefreshCwIcon,
  UserX as UserXIcon
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { usePetsStore } from '@/stores/modules/petsStore'
import { useProfileStore } from '@/stores/modules/profileStore'
import { useAuthStore } from '@/stores/modules/authStore'

// Initialize stores
const petsStore = usePetsStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

// Default photo URLs
const defaultPhotoURL = ref('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E')
const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E'

// State variables
const petOwners = ref([])
const initialLoading = ref(true)
const viewMode = ref('list')
const searchQuery = ref('')
const showFilterMenu = ref(false)
const filters = ref({
  petCount: []
})
const sortKey = ref('owner.name')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = 10

// UI state
const selectedPet = ref(null)
const selectedOwner = ref(null)
const showPetSelector = ref(false)
const showForm = ref(false)
const activeTab = ref('basics')
const formData = ref({})
const showTabDropdown = ref(false)

// Save state
const isSaving = ref(false)
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const statusMessage = ref('')

// Medical history, vaccinations, and documents sorting
const medicalSortKey = ref('date')
const medicalSortOrder = ref('desc')
const vaccineSortKey = ref('date')
const vaccineSortOrder = ref('desc')
const documentSortKey = ref('date')
const documentSortOrder = ref('desc')

// Gender dropdown state
const genderDropdownOpen = ref(false)
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Unknown', label: 'Unknown' }
]

// Delete confirmation state


// History filter state
const historyFilter = ref('all')

// Timeline modal state
const showTimelineModal = ref(false)

// Pet carousel navigation state


// Bulk operations state
const selectedPets = ref([])

// Enhanced timeline view with better visual representation
const timelineViewMode = ref('list') // 'list' or 'calendar'
const timelineGroupBy = ref('month') // 'day', 'week', 'month', 'year'

// Medical record templates for common procedures
const medicalRecordTemplates = ref([
  {
    id: 'annual-checkup',
    name: 'Annual Checkup',
    type: 'checkup',
    description: 'Routine annual health examination including physical assessment, vaccination review, and wellness recommendations.',
    defaultFields: {
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      weight: '',
      generalCondition: 'Good',
      recommendations: ''
    }
  },
  {
    id: 'vaccination',
    name: 'Vaccination',
    type: 'vaccination',
    description: 'Standard vaccination procedure with pre and post-vaccination health assessment.',
    defaultFields: {
      vaccineType: '',
      batchNumber: '',
      injectionSite: '',
      adverseReactions: 'None',
      nextDueDate: ''
    }
  },
  {
    id: 'dental-cleaning',
    name: 'Dental Cleaning',
    type: 'treatment',
    description: 'Professional dental cleaning and oral health assessment.',
    defaultFields: {
      anesthesiaUsed: '',
      teethCleaned: '',
      extractions: '',
      postCareInstructions: '',
      followUpDate: ''
    }
  },
  {
    id: 'surgery',
    name: 'Surgery',
    type: 'surgery',
    description: 'Surgical procedure with pre-operative and post-operative care details.',
    defaultFields: {
      procedureType: '',
      anesthesiaType: '',
      complications: 'None',
      postOpCare: '',
      followUpSchedule: ''
    }
  },
  {
    id: 'emergency',
    name: 'Emergency Treatment',
    type: 'emergency',
    description: 'Emergency medical intervention for urgent health concerns.',
    defaultFields: {
      presentingSymptoms: '',
      immediateActions: '',
      diagnosis: '',
      treatmentProvided: '',
      criticalCare: ''
    }
  }
])

// Enhanced timeline computed properties
const groupedTimelineRecords = computed(() => {
  if (!filteredTimelineRecords.value.length) return []
  
  const records = [...filteredTimelineRecords.value]
  const groups = {}
  
  records.forEach(record => {
    const date = new Date(record.date)
    let groupKey = ''
    
    switch (timelineGroupBy.value) {
      case 'day':
        groupKey = date.toDateString()
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        groupKey = weekStart.toDateString()
        break
      case 'month':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        groupKey = date.getFullYear().toString()
        break
      default:
        groupKey = date.toDateString()
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(record)
  })
  
  // Convert to array and sort by date
  return Object.entries(groups)
    .map(([key, records]) => ({
      key,
      date: new Date(records[0].date),
      records: records.sort((a, b) => new Date(b.date) - new Date(a.date))
    }))
    .sort((a, b) => b.date - a.date)
})

// Enhanced timeline formatting
function formatTimelineGroupHeader(group) {
  const date = group.date
  
  switch (timelineGroupBy.value) {
    case 'day':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'week':
      const weekEnd = new Date(date)
      weekEnd.setDate(date.getDate() + 6)
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    case 'month':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    case 'year':
      return date.getFullYear().toString()
    default:
      return date.toLocaleDateString()
  }
}

// Enhanced medical record creation with templates
function createMedicalRecordFromTemplate(template) {
  if (!selectedPet.value) return
  
  const newRecord = {
    id: `new-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: template.type,
    title: template.name,
    description: template.description,
    vet: '',
    status: 'completed',
    ...template.defaultFields
  }
  
  // Switch to edit mode and add the record
  editPet(selectedPet.value)
  if (!formData.value.medicalHistory) {
    formData.value.medicalHistory = []
  }
  formData.value.medicalHistory.unshift(newRecord)
  activeTab.value = 'medical'
}

// Enhanced timeline record actions
function quickActionTimelineRecord(record, action) {
  switch (action) {
    case 'edit':
      editTimelineRecord(record)
      break
    case 'duplicate':
      duplicateTimelineRecord(record)
      break
    case 'share':
      shareTimelineRecord(record)
      break
    case 'print':
      printTimelineRecord(record)
      break
    default:
      console.log('Unknown action:', action)
  }
}

function duplicateTimelineRecord(record) {
  if (!selectedPet.value) return
  
  const duplicatedRecord = {
    ...record,
    id: `new-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title: `${record.title} (Copy)`,
    status: 'scheduled'
  }
  
  // Add to appropriate collection based on type
  switch (record.type) {
    case 'medical':
      if (!selectedPet.value.medicalHistory) selectedPet.value.medicalHistory = []
      selectedPet.value.medicalHistory.unshift(duplicatedRecord)
      break
    case 'vaccination':
      if (!selectedPet.value.vaccinations) selectedPet.value.vaccinations = []
      selectedPet.value.vaccinations.unshift(duplicatedRecord)
      break
    case 'telehealth':
      if (!selectedPet.value.telehealthRecords) selectedPet.value.telehealthRecords = []
      selectedPet.value.telehealthRecords.unshift(duplicatedRecord)
      break
    case 'document':
      if (!selectedPet.value.documents) selectedPet.value.documents = []
      selectedPet.value.documents.unshift(duplicatedRecord)
      break
  }
  
  // Update the pet data
  selectedPet.value = { ...selectedPet.value }
}

function shareTimelineRecord(record) {
  // Implementation for sharing records (could be email, PDF, etc.)
  console.log('Sharing record:', record)
  
  // For now, create a shareable summary
  const summary = {
    petName: selectedPet.value?.name || 'Unknown Pet',
    recordType: getTimelineTitle(record),
    date: formatDate(record.date),
    description: record.description || record.notes || 'No description available',
    status: getTimelineStatus(record)
  }
  
  console.log('Shareable summary:', summary)
  // In a real app, this could open a share dialog or generate a PDF
}

function printTimelineRecord(record) {
  // Implementation for printing records
  console.log('Printing record:', record)
  
  // Create a print-friendly version
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${getTimelineTitle(record)}</h2>
      <p><strong>Pet:</strong> ${selectedPet.value?.name || 'Unknown'}</p>
      <p><strong>Date:</strong> ${formatDate(record.date)}</p>
      <p><strong>Type:</strong> ${record.type}</p>
      <p><strong>Status:</strong> ${getTimelineStatus(record)}</p>
      <p><strong>Description:</strong> ${record.description || record.notes || 'No description available'}</p>
      ${record.vet ? `<p><strong>Veterinarian:</strong> ${record.vet}</p>` : ''}
    </div>
  `
  
  const printWindow = window.open('', '_blank')
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.print()
}

// Enhanced health trend analysis
const healthTrends = computed(() => {
  if (!selectedPet.value || !selectedPet.value.medicalHistory) return []
  
  const records = selectedPet.value.medicalHistory
    .filter(record => record.date && record.weight)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  
  return records.map(record => ({
    date: new Date(record.date),
    weight: parseFloat(record.weight) || 0,
    status: record.status || 'unknown',
    type: record.type || 'unknown'
  }))
})

// Enhanced vaccination tracking
const vaccinationSchedule = computed(() => {
  if (!selectedPet.value || !selectedPet.value.vaccinations) return []
  
  const now = new Date()
  const vaccinations = selectedPet.value.vaccinations
    .filter(v => v.expiryDate)
    .map(v => ({
      ...v,
      daysUntilExpiry: Math.ceil((new Date(v.expiryDate) - now) / (1000 * 60 * 60 * 24)),
      isExpired: new Date(v.expiryDate) < now,
      isExpiringSoon: new Date(v.expiryDate) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  
  return vaccinations
})

// Enhanced medical record statistics
const medicalRecordStats = computed(() => {
  if (!selectedPet.value) return null
  
  const pet = selectedPet.value
  const medicalRecords = pet.medicalHistory || []
  const vaccinations = pet.vaccinations || []
  const telehealthRecords = pet.telehealthRecords || []
  const documents = pet.documents || []
  
  // Calculate visit frequency
  const visitDates = [...medicalRecords, ...vaccinations, ...telehealthRecords]
    .map(r => new Date(r.date))
    .sort((a, b) => a - b)
  
  let averageVisitInterval = 0
  if (visitDates.length > 1) {
    const intervals = []
    for (let i = 1; i < visitDates.length; i++) {
      intervals.push(visitDates[i] - visitDates[i - 1])
    }
    averageVisitInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  }
  
  // Calculate health status distribution
  const healthStatuses = medicalRecords
    .filter(r => r.status)
    .reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {})
  
  return {
    totalRecords: medicalRecords.length + vaccinations.length + telehealthRecords.length + documents.length,
    totalVisits: visitDates.length,
    averageVisitInterval: Math.round(averageVisitInterval / (1000 * 60 * 60 * 24)), // in days
    healthStatusDistribution: healthStatuses,
    lastVisit: visitDates.length > 0 ? visitDates[visitDates.length - 1] : null,
    nextVaccinationDue: vaccinationSchedule.value.find(v => !v.isExpired) || null
  }
})

// Fetch pet owners and their pets - ONLY those with transactions with current vet
const fetchPetOwnersWithPets = async () => {
  try {
    initialLoading.value = true
    
    // Get current vet's Firebase Auth UID
    const currentVetAuthUid = authStore.user?.uid
    if (!currentVetAuthUid) {
      console.error('No current vet authenticated')
      return
    }
    
    console.log('Current vet Firebase Auth UID:', currentVetAuthUid)
    
    // First, we need to find the current vet's document ID in the users collection
    // because appointments store doctorId as the document ID, not the Firebase Auth UID
    const usersRef = collection(db, 'users')
    const vetQuery = query(usersRef, where('uid', '==', currentVetAuthUid))
    const vetSnapshot = await getDocs(vetQuery)
    
    if (vetSnapshot.empty) {
      console.error('Current vet not found in users collection')
      return
    }
    
    // Get the vet's document ID (this is what's stored in appointments.doctorId)
    const vetDoc = vetSnapshot.docs[0]
    const currentVetDocId = vetDoc.id
    console.log('Current vet document ID:', currentVetDocId)
    
    // Now fetch all appointments where the current vet is the doctor using the document ID
    const appointmentsRef = collection(db, 'appointments')
    const vetAppointmentsQuery = query(
      appointmentsRef, 
      where('doctorId', '==', currentVetDocId)
    )
    const vetAppointmentsSnapshot = await getDocs(vetAppointmentsQuery)
    
    // Get unique user IDs from these appointments
    const clientUserIds = new Set()
    const petIds = new Set()
    
    vetAppointmentsSnapshot.forEach(apptDoc => {
      const apptData = apptDoc.data()
      if (apptData.userId) {
        clientUserIds.add(apptData.userId)
      }
      if (apptData.petIds && Array.isArray(apptData.petIds)) {
        apptData.petIds.forEach(petId => petIds.add(petId))
      }
    })
    
    console.log('Client user IDs found:', Array.from(clientUserIds))
    console.log('Pet IDs found:', Array.from(petIds))
    
    if (clientUserIds.size === 0) {
      console.log('No clients found for current vet')
      petOwners.value = []
      return
    }
    
        // Fetch only the clients who have appointments with this vet
    const ownersWithPets = []
    
    for (const userId of clientUserIds) {
      try {
        console.log(`Fetching user data for userId: ${userId}`)
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          console.log(`User data found:`, userData)
          
          // Only include users who are not vets
          if (userData.role !== 'veterinary') {
            // Enhance owner data with comprehensive information
            const enhancedOwner = {
              userId: userId,
              ...userData,
              pets: [], // Initialize empty pets array
              completeInfo: {
                contact: {
                  email: userData.email || '',
                  phone: userData.phone || '',
                  alternativeEmail: userData.alternativeEmail || ''
                },
                location: {
                  address: userData.address || '',
                  city: userData.city || '',
                  province: userData.province || '',
                  country: userData.country || '',
                  postalCode: userData.postalCode || ''
                },
                personal: {
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  gender: userData.gender || '',
                  dateOfBirth: userData.dateOfBirth || '',
                  age: userData.age || null,
                  bio: userData.bio || ''
                },
                preferences: {
                  consultationMode: userData.consultationMode || '',
                  notificationsEnabled: userData.notificationsEnabled || false,
                  notificationsConfigured: userData.notificationsConfigured || false
                },
                timestamps: {
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt
                }
              }
            }
            console.log(`Enhanced owner data:`, enhancedOwner)
            ownersWithPets.push(enhancedOwner)
          } else {
            console.log(`User ${userId} is a vet (role: ${userData.role}), skipping`)
          }
        } else {
          console.log(`User document ${userId} does not exist`)
        }
      } catch (error) {
        console.warn(`Could not fetch user ${userId}:`, error)
      }
    }
    
    // Fetch pets for each owner (include all pets, we'll filter appointments later)
    for (const owner of ownersWithPets) {
      // Fetch pets for this owner from pets collection
      console.log(`Fetching pets for owner ${owner.userId} (${owner.firstName} ${owner.lastName})`)
      const petsRef = collection(db, 'pets')
      const petsQuery = query(petsRef, where('ownerId', '==', owner.userId))
      const petsSnapshot = await getDocs(petsQuery)
      
      console.log(`Found ${petsSnapshot.size} pets for owner ${owner.userId}`)
      
      const ownerPets = []
      petsSnapshot.forEach(petDoc => {
        const petData = petDoc.data()
        console.log(`Pet data:`, { id: petDoc.id, ...petData })
        // Include all pets for this owner
        ownerPets.push({
          id: petDoc.id,
          ...petData
        })
      })
      
      // Add pets to owner object
      owner.pets = ownerPets
      console.log(`Added ${ownerPets.length} pets to owner ${owner.firstName}`)
      
              // Fetch appointments for each pet to get service history (only with current vet)
        for (const pet of ownerPets) {
          const appointmentsRef = collection(db, 'appointments')
          const apptQuery = query(
            appointmentsRef, 
            where('userId', '==', owner.userId),
            where('petIds', 'array-contains', pet.id),
            where('doctorId', '==', currentVetDocId) // Only appointments with current vet
          )
          
          console.log(`Fetching appointments for pet ${pet.id} (${pet.name}) with owner ${owner.userId}`)
          console.log(`Query: userId=${owner.userId}, petIds contains ${pet.id}, doctorId=${currentVetDocId}`)
          
          const apptSnapshot = await getDocs(apptQuery)
          console.log(`Found ${apptSnapshot.size} appointments for pet ${pet.id}`)
        
        // Initialize arrays if they don't exist
        if (!pet.medicalHistory) pet.medicalHistory = []
        if (!pet.vaccinations) pet.vaccinations = []
        if (!pet.telehealthRecords) pet.telehealthRecords = []
        if (!pet.documents) pet.documents = []
        
        // Process appointments to create comprehensive timeline records
        apptSnapshot.forEach(apptDoc => {
          const apptData = apptDoc.data()
          
          // Create comprehensive medical record from appointment (all statuses)
          const medicalRecord = {
            id: apptDoc.id,
            date: apptData.date,
            time: apptData.time,
            type: 'appointment',
            title: apptData.serviceNames ? apptData.serviceNames.join(', ') : 'Appointment',
            description: `Appointment with ${apptData.doctorName} on ${apptData.date} at ${apptData.time}`,
            vet: apptData.doctorName,
            status: apptData.status,
            duration: apptData.duration,
            serviceIds: apptData.services || [],
            petIds: apptData.petIds || [],
            petNames: apptData.petNames || [],
            isHealthCertificate: apptData.isHealthCertificate || false,
            approvedAt: apptData.approvedAt,
            approvedBy: apptData.approvedBy,
            createdAt: apptData.createdAt,
            updatedAt: apptData.updatedAt
          }
          
          pet.medicalHistory.push(medicalRecord)
        })
        
        // Fetch comprehensive service details for each service ID
        if (pet.medicalHistory.length > 0) {
          for (const record of pet.medicalHistory) {
            if (record.serviceIds && record.serviceIds.length > 0) {
              record.serviceDetails = []
              for (const serviceId of record.serviceIds) {
                try {
                  const serviceRef = doc(db, 'services', serviceId)
                  const serviceDoc = await getDoc(serviceRef)
                  if (serviceDoc.exists()) {
                    const serviceData = serviceDoc.data()
                    // Enhanced service details with all available information
                    const serviceDetail = {
                      id: serviceId,
                      name: serviceData.name,
                      description: serviceData.description,
                      processingTime: serviceData.processingTime,
                      fees: serviceData.fees,
                      coverPhoto: serviceData.coverPhoto,
                      categoryId: serviceData.categoryId,
                      classification: serviceData.classification,
                      transactionType: serviceData.transactionType,
                      requirements: serviceData.requirements || [],
                      archived: serviceData.archived || false,
                      createdAt: serviceData.createdAt,
                      updatedAt: serviceData.updatedAt
                    }
                    record.serviceDetails.push(serviceDetail)
                  }
                } catch (error) {
                  console.warn(`Could not fetch service details for ${serviceId}:`, error)
                }
              }
            }
          }
        }
        
        // Fetch notifications related to this pet's appointments
        const notificationsRef = collection(db, 'notifications')
        const petNotificationsQuery = query(
          notificationsRef,
          where('userId', '==', owner.userId),
          where('data.appointmentId', 'in', pet.medicalHistory.map(record => record.id))
        )
        
        try {
          const notificationsSnapshot = await getDocs(petNotificationsQuery)
          pet.notifications = []
          notificationsSnapshot.forEach(notifDoc => {
            const notifData = notifDoc.data()
            pet.notifications.push({
              id: notifDoc.id,
              title: notifData.title,
              description: notifData.description,
              type: notifData.type,
              status: notifData.data?.status,
              appointmentId: notifData.data?.appointmentId,
              createdAt: notifData.createdAt,
              read: notifData.read || false,
              url: notifData.url
            })
          })
        } catch (error) {
          console.warn(`Could not fetch notifications for pet ${pet.id}:`, error)
          pet.notifications = []
        }
        
        // Enhance pet data with additional information
        pet.completeInfo = {
          age: {
            years: pet.ageYears || 0,
            months: pet.ageMonths || 0,
            weeks: pet.ageWeeks || 0
          },
          weight: pet.weight || 0,
          breed: pet.breed || 'Unknown',
          species: pet.species || 'Unknown',
          gender: pet.gender || 'Unknown',
          photoURL: pet.photoURL || '',
          createdAt: pet.createdAt,
          updatedAt: pet.updatedAt
        }
      }
      
      // Fetch complete profile data using profileStore to ensure we have the correct photoURL
      const profileData = await profileStore.fetchUserProfile(owner.userId)
      if (profileData && profileData.photoURL) {
        // Update the photoURL from the profile store
        owner.photoURL = profileData.photoURL
      }
    }
    
    petOwners.value = ownersWithPets
    console.log('Fetched pet owners with pets (filtered by current vet):', petOwners.value)
    
    // Debug: Log detailed information about pets and their records
    petOwners.value.forEach(owner => {
      console.log(`Owner: ${owner.firstName} ${owner.lastName} (${owner.userId})`)
      console.log(`  Contact: ${owner.completeInfo?.contact?.email} | ${owner.completeInfo?.contact?.phone}`)
      console.log(`  Location: ${owner.completeInfo?.location?.city}, ${owner.completeInfo?.location?.province}`)
      
      if (owner.pets && owner.pets.length > 0) {
        owner.pets.forEach(pet => {
          console.log(`  Pet: ${pet.name} (${pet.id})`)
          console.log(`    Species: ${pet.completeInfo?.species} | Breed: ${pet.completeInfo?.breed}`)
          console.log(`    Age: ${pet.completeInfo?.age?.years}y ${pet.completeInfo?.age?.months}m ${pet.completeInfo?.age?.weeks}w`)
          console.log(`    Weight: ${pet.completeInfo?.weight}kg`)
          console.log(`    Medical Records: ${pet.medicalHistory?.length || 0}`)
          console.log(`    Vaccinations: ${pet.vaccinations?.length || 0}`)
          console.log(`    Documents: ${pet.documents?.length || 0}`)
          console.log(`    Notifications: ${pet.notifications?.length || 0}`)
          
          if (pet.medicalHistory && pet.medicalHistory.length > 0) {
            console.log(`    Medical History Details:`, pet.medicalHistory)
            pet.medicalHistory.forEach(record => {
              console.log(`      Appointment: ${record.title} (${record.status})`)
              if (record.serviceDetails && record.serviceDetails.length > 0) {
                record.serviceDetails.forEach(service => {
                  console.log(`        Service: ${service.name} - ${service.processingTime} - ${service.fees}`)
                })
              }
            })
          }
        })
      } else {
        console.log(`  No pets found for this owner`)
      }
    })
    
    // Calculate and log summary statistics
    const totalAppointments = petOwners.value.reduce((total, owner) => {
      return total + (owner.pets?.reduce((petTotal, pet) => {
        return petTotal + (pet.medicalHistory?.length || 0)
      }, 0) || 0)
    }, 0)
    
    const totalServices = petOwners.value.reduce((total, owner) => {
      return total + (owner.pets?.reduce((petTotal, pet) => {
        return petTotal + (pet.medicalHistory?.reduce((recordTotal, record) => {
          return recordTotal + (record.serviceDetails?.length || 0)
        }, 0) || 0)
      }, 0) || 0)
    }, 0)
    
    console.log(`📊 Summary Statistics:`)
    console.log(`  Total Pet Owners: ${petOwners.value.length}`)
    console.log(`  Total Pets: ${petOwners.value.reduce((total, owner) => total + (owner.pets?.length || 0), 0)}`)
    console.log(`  Total Appointments: ${totalAppointments}`)
    console.log(`  Total Services: ${totalServices}`)
  } catch (error) {
    console.error('Error fetching pet owners with pets:', error)
  } finally {
    initialLoading.value = false
  }
}

// Format pet names for display
const formatPetNames = (pets) => {
  if (!pets || pets.length === 0) return 'No pets'
  
  if (pets.length === 1) {
    return pets[0].name
  } else if (pets.length === 2) {
    return `${pets[0].name}, ${pets[1].name}`
  } else {
    return `${pets[0].name}, ${pets[1].name}, +${pets.length - 2}`
  }
}

// Format date for display - UPDATED to include time
const formatDate = (date, showTime = true) => {
  if (!date) return 'N/A'
  
  try {
    // Handle Firestore timestamp
    const dateObj = date.toDate ? date.toDate() : new Date(date)
    
    if (showTime) {
      // Format with date and time
      return `${dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })} at ${dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
    
    // Original date-only format
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Get comprehensive pet statistics for display
const getPetStatistics = (pet) => {
  if (!pet) return {}
  
  const stats = {
    totalAppointments: pet.medicalHistory?.length || 0,
    completedAppointments: pet.medicalHistory?.filter(record => record.status === 'completed').length || 0,
    pendingAppointments: pet.medicalHistory?.filter(record => record.status === 'approved').length || 0,
    cancelledAppointments: pet.medicalHistory?.filter(record => record.status === 'cancelled').length || 0,
    totalServices: pet.medicalHistory?.reduce((total, record) => total + (record.serviceDetails?.length || 0), 0) || 0,
    totalNotifications: pet.notifications?.length || 0,
    unreadNotifications: pet.notifications?.filter(notif => !notif.read).length || 0,
    lastAppointment: pet.medicalHistory?.length > 0 ? 
      pet.medicalHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null,
    nextAppointment: pet.medicalHistory?.filter(record => 
      record.status === 'approved' && new Date(record.date) > new Date()
    ).sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null
  }
  
  return stats
}

// Get comprehensive owner statistics
const getOwnerStatistics = (owner) => {
  if (!owner || !owner.pets) return {}
  
  const stats = {
    totalPets: owner.pets.length,
    totalAppointments: owner.pets.reduce((total, pet) => total + (pet.medicalHistory?.length || 0), 0),
    totalServices: owner.pets.reduce((total, pet) => {
      return total + pet.medicalHistory?.reduce((petTotal, record) => {
        return petTotal + (record.serviceDetails?.length || 0)
      }, 0) || 0
    }, 0),
    totalNotifications: owner.pets.reduce((total, pet) => total + (pet.notifications?.length || 0), 0),
    lastVisit: owner.pets.reduce((lastVisit, pet) => {
      const petLastVisit = pet.medicalHistory?.length > 0 ? 
        pet.medicalHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null
      if (!lastVisit || (petLastVisit && new Date(petLastVisit.date) > new Date(lastVisit.date))) {
        return petLastVisit
      }
      return lastVisit
    }, null)
  }
  
  return stats
}

// Format pet age using the petsStore utility
const formatPetAge = (pet) => {
  if (!pet) return 'Unknown'
  
  // Check if we have the new age structure
  if (pet.ageYears !== undefined || pet.ageMonths !== undefined || pet.ageWeeks !== undefined) {
    const years = pet.ageYears || 0
    const months = pet.ageMonths || 0
    const weeks = pet.ageWeeks || 0
    
    const parts = []
    if (years > 0) parts.push(`${years} ${years > 1 ? 'years' : 'year'}`)
    if (months > 0) parts.push(`${months} ${months > 1 ? 'months' : 'month'}`)
    if (weeks > 0) parts.push(`${weeks} ${weeks > 1 ? 'weeks' : 'week'}`)
    
    return parts.join(', ') || 'Newborn'
  }
  
  // Check if we have the old age object structure
  if (pet.age && typeof pet.age === 'object') {
    const years = pet.age.years || 0
    const months = pet.age.months || 0
    const weeks = pet.age.weeks || 0
    
    const parts = []
    if (years > 0) parts.push(`${years} ${years > 1 ? 'years' : 'year'}`)
    if (months > 0) parts.push(`${months} ${months > 1 ? 'months' : 'month'}`)
    if (weeks > 0) parts.push(`${weeks} ${weeks > 1 ? 'weeks' : 'week'}`)
    
    return parts.join(', ') || 'Newborn'
  }
  
  // If it's just a number, assume it's years
  if (typeof pet.age === 'number') {
    return `${pet.age} ${pet.age !== 1 ? 'years' : 'year'}`
  }
  
  return 'Unknown'
}

// Helper function to check if a URL is a Google photo URL
const isGooglePhotoURL = (url) => {
  return url && url.startsWith('https://lh3.googleusercontent.com')
}

// Utility function to get vaccination status
const getVaccinationStatus = (vaccination) => {
  if (!vaccination.date) return 'Not given'
  
  const today = new Date()
  const vaccinationDate = new Date(vaccination.date)
  const expiryDate = new Date(vaccination.expiryDate)
  
  if (today > expiryDate) return 'Expired'
  if (today > vaccinationDate && today < expiryDate) return 'Active'
  return 'Upcoming'
}

// Helper function to get next vaccination due
const getNextVaccinationDue = (pet) => {
  if (!pet.vaccinations || pet.vaccinations.length === 0) return null
  
  const today = new Date()
  const upcomingVaccinations = pet.vaccinations
    .filter(v => v.expiryDate && new Date(v.expiryDate) > today)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
  
  return upcomingVaccinations.length > 0 ? upcomingVaccinations[0] : null
}

// Helper function to get pet health status
const getHealthStatus = (pet) => {
  if (!pet.medicalRecords || pet.medicalRecords.length === 0) return 'Unknown'
  
  const recentRecords = pet.medicalRecords
    .filter(record => {
      const recordDate = new Date(record.date)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return recordDate > threeMonthsAgo
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  
  if (recentRecords.length === 0) return 'No recent visits'
  
  const lastRecord = recentRecords[0]
  if (lastRecord.status === 'healthy' || lastRecord.status === 'recovered') return 'Healthy'
  if (lastRecord.status === 'sick' || lastRecord.status === 'under_treatment') return 'Under Treatment'
  if (lastRecord.status === 'critical') return 'Critical'
  
  return 'Unknown'
}

// Filter owners based on search and filters
const filteredOwners = computed(() => {
  let result = [...petOwners.value]
  
  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(owner => 
      (owner.firstName && owner.firstName.toLowerCase().includes(query)) ||
      (owner.lastName && owner.lastName.toLowerCase().includes(query)) ||
      (owner.email && owner.email.toLowerCase().includes(query)) ||
      (owner.phone && owner.phone.toLowerCase().includes(query)) ||
      // Search in pet names
      (owner.pets && owner.pets.some(pet => 
        pet.name && pet.name.toLowerCase().includes(query) ||
        pet.species && pet.species.toLowerCase().includes(query) ||
        pet.breed && pet.breed.toLowerCase().includes(query)
      ))
    )
  }
  
  // Apply pet count filters
  if (filters.value.petCount.length > 0) {
    result = result.filter(owner => {
      const petCount = owner.pets ? owner.pets.length : 0
      
      return filters.value.petCount.some(filter => {
        if (filter === 'one') return petCount === 1
        if (filter === 'two') return petCount === 2
        if (filter === 'moreThanTwo') return petCount > 2
        return false
      })
    })
  }
  
  // Sort owners
  result.sort((a, b) => {
    let aValue, bValue
  
    if (sortKey.value === 'owner.name') {
      aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase()
      bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase()
    } else if (sortKey.value === 'owner.phone') {
      aValue = a.phone || ''
      bValue = b.phone || ''
    } else if (sortKey.value === 'createdAt' || sortKey.value === 'updatedAt') {
      // Handle Firestore timestamps
      aValue = a[sortKey.value] ? (a[sortKey.value].toDate ? a[sortKey.value].toDate().getTime() : new Date(a[sortKey.value]).getTime()) : 0
      bValue = b[sortKey.value] ? (b[sortKey.value].toDate ? b[sortKey.value].toDate().getTime() : new Date(b[sortKey.value]).getTime()) : 0
    } else {
      aValue = a[sortKey.value] || ''
      bValue = b[sortKey.value] || ''
    }
  
    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  
  return result
})

// Pagination computed properties
const totalItems = computed(() => filteredOwners.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value))
const paginatedOwners = computed(() => {
  return filteredOwners.value.slice(startIndex.value, endIndex.value)
})

// Check if this is a new pet entry
const isNewPet = computed(() => {
  return selectedPet.value && selectedPet.value.id && selectedPet.value.id.startsWith('new-')
})



// Computed properties for vaccination alerts
const vaccinationAlerts = computed(() => {
  if (!selectedOwner.value || !selectedOwner.value.pets) return []
  
  const alerts = []
  selectedOwner.value.pets.forEach(pet => {
    if (pet.vaccinations) {
      pet.vaccinations.forEach(vaccination => {
        if (vaccination.expiryDate) {
          const expiryDate = new Date(vaccination.expiryDate)
          const today = new Date()
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            alerts.push({
              type: 'warning',
              message: `${pet.name}'s ${vaccination.name} vaccination expires in ${daysUntilExpiry} days`,
              pet: pet,
              vaccination: vaccination
            })
          } else if (daysUntilExpiry <= 0) {
            alerts.push({
              type: 'error',
              message: `${pet.name}'s ${vaccination.name} vaccination expired ${Math.abs(daysUntilExpiry)} days ago`,
              pet: pet,
              vaccination: vaccination
            })
          }
        }
      })
    }
  })
  
  return alerts
})

// Computed property for medical record summary
const medicalRecordSummary = computed(() => {
  if (!selectedPet.value) return null
  
  const pet = selectedPet.value
  const totalRecords = (pet.medicalRecords?.length || 0) + (pet.vaccinations?.length || 0) + (pet.documents?.length || 0)
  
  return {
    totalRecords,
    lastVisit: pet.medicalRecords?.length > 0 ? pet.medicalRecords[0]?.date : null,
    nextVaccination: getNextVaccinationDue(pet),
    healthStatus: getHealthStatus(pet)
  }
})

// Computed property for sorted pets
const sortedPets = computed(() => {
  if (!selectedOwner.value || !selectedOwner.value.pets) return []
  
  return [...selectedOwner.value.pets].sort((a, b) => {
    // Sort by last visit date (most recent first)
    const aLastVisit = a.medicalRecords?.length > 0 ? new Date(a.medicalRecords[0].date) : new Date(0)
    const bLastVisit = b.medicalRecords?.length > 0 ? new Date(b.medicalRecords[0].date) : new Date(0)
    
    if (aLastVisit > bLastVisit) return -1
    if (aLastVisit < bLastVisit) return 1
    
    // If same last visit, sort by name
    return a.name.localeCompare(b.name)
  })
})

// Computed property for pets needing attention
const petsNeedingAttention = computed(() => {
  if (!selectedOwner.value || !selectedOwner.value.pets) return []
  
  return selectedOwner.value.pets.filter(pet => {
    // Check for expired vaccinations
    const hasExpiredVaccinations = pet.vaccinations?.some(v => {
      if (!v.expiryDate) return false
      return new Date(v.expiryDate) < new Date()
    })
    
    // Check for overdue checkups (more than 6 months)
    const lastCheckup = pet.medicalRecords?.find(r => r.type === 'checkup')
    const isOverdueCheckup = lastCheckup ? 
      (new Date() - new Date(lastCheckup.date)) > (6 * 30 * 24 * 60 * 60 * 1000) : true
    
    return hasExpiredVaccinations || isOverdueCheckup
  })
})

// Computed property for current active pet
const currentActivePet = computed(() => {
  if (!selectedOwner.value || !selectedOwner.value.pets || selectedOwner.value.pets.length === 0) {
    return null
  }
  
  if (selectedOwner.value.pets.length === 1) {
    return selectedOwner.value.pets[0]
  }
  
  return selectedOwner.value.pets[activePetIndex.value] || selectedOwner.value.pets[0]
})

// Computed property for pet statistics
const petStatistics = computed(() => {
  if (!selectedOwner.value || !selectedOwner.value.pets) {
    return {
      totalPets: 0,
      totalMedicalRecords: 0,
      totalVaccinations: 0,
      totalDocuments: 0,
      averageAge: 0
    }
  }
  
  const pets = selectedOwner.value.pets
  const totalMedicalRecords = pets.reduce((sum, pet) => sum + (pet.medicalRecords?.length || 0), 0)
  const totalVaccinations = pets.reduce((sum, pet) => sum + (pet.vaccinations?.length || 0), 0)
  const totalDocuments = pets.reduce((sum, pet) => sum + (pet.documents?.length || 0), 0)
  
  // Calculate average age (simplified)
  const totalAge = pets.reduce((sum, pet) => {
    if (pet.birthDate) {
      const age = new Date() - new Date(pet.birthDate)
      return sum + (age / (1000 * 60 * 60 * 24 * 365.25))
    }
    return sum
  }, 0)
  
  const averageAge = pets.length > 0 ? totalAge / pets.length : 0
  
  return {
    totalPets: pets.length,
    totalMedicalRecords,
    totalVaccinations,
    totalDocuments,
    averageAge: Math.round(averageAge * 10) / 10
  }
})

// Computed property for search suggestions
const searchSuggestions = computed(() => {
  return getSearchSuggestions(searchQuery.value)
})

// Computed property for showing search suggestions
const showSearchSuggestions = computed(() => {
  return searchQuery.value.length >= 2 && searchSuggestions.value.length > 0
})

// Unified timeline entries combining all medical records, vaccinations, and appointments
const timelineEntries = computed(() => {
  if (!selectedPet.value) return []
  
  const entries = []
  
  // Add medical history treatments
  if (historyFilter.value !== 'vaccinations') {
    const mh = selectedPet.value.medicalHistory || []
    for (const r of mh) {
      // Apply filter
      if (historyFilter.value === 'telehealth') continue
      
      const when = r.date ? new Date(r.date) : new Date()
      entries.push({ 
        kind: 'Treatment', 
        date: when, 
        title: r.type || 'Treatment/Check-up', 
        subtitle: r.vet || '', 
        status: '', 
        details: r.description || '', 
        icon: ActivityIcon, 
        color: 'text-emerald-600' 
      })
    }
  }

  // Add vaccinations
  if (historyFilter.value === 'all' || historyFilter.value === 'vaccinations') {
    const vacs = selectedPet.value.vaccinations || []
    for (const v of vacs) {
      const when = v.date ? new Date(v.date) : new Date()
      entries.push({ 
        kind: 'Vaccination', 
        date: when, 
        title: v.name || 'Vaccination', 
        subtitle: v.completed ? 'Completed' : 'Scheduled', 
        status: v.completed ? 'completed' : 'pending', 
        details: '', 
        icon: SyringeIcon, 
        color: 'text-teal-600' 
      })
    }
  }

  // Add telehealth/appointments if available
  if (historyFilter.value === 'all' || historyFilter.value === 'telehealth') {
    // This would need to be implemented based on your appointment data structure
    // For now, we'll add a placeholder
    if (selectedPet.value.telehealthRecords) {
      for (const t of selectedPet.value.telehealthRecords) {
        const when = t.date ? new Date(t.date) : new Date()
        entries.push({
          kind: 'Telehealth',
          date: when,
          title: t.type || 'Telehealth consultation',
          subtitle: t.vet || '',
          status: t.status || 'completed',
          details: t.notes || '',
          icon: ActivityIcon,
          color: 'text-indigo-600'
        })
      }
    }
  }

  entries.sort((a, b) => a.date - b.date)
  return entries
})

// Sorted medical history
const sortedMedicalHistory = computed(() => {
  if (!selectedPet.value || !selectedPet.value.medicalHistory) return [];
  
  return [...selectedPet.value.medicalHistory].sort((a, b) => {
    let aValue, bValue;
  
    if (medicalSortKey.value === 'date' || medicalSortKey.value === 'createdAt') {
      aValue = new Date(a[medicalSortKey.value] || a.date);
      bValue = new Date(b[medicalSortKey.value] || b.date);
    } else {
      aValue = a[medicalSortKey.value];
      bValue = b[medicalSortKey.value];
    }
  
    if (aValue < bValue) return medicalSortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return medicalSortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Filtered timeline entries combining all medical records
const filteredTimelineEntries = computed(() => {
  if (!selectedPet.value || !selectedPet.value.medicalHistory) return []
  
  let entries = selectedPet.value.medicalHistory.map(record => ({
    ...record,
    type: record.type || 'medical',
    date: record.date || record.createdAt || new Date(),
    description: record.description || record.notes || record.diagnosis || 'No description available',
    vet: record.vet || record.veterinarian || 'Unknown'
  }))
  
  // Apply filter
  if (historyFilter.value === 'all') {
    return entries
  } else if (historyFilter.value === 'checkups') {
    return entries.filter(entry => entry.type === 'checkup' || entry.type === 'examination')
  } else if (historyFilter.value === 'vaccinations') {
    return entries.filter(entry => entry.type === 'vaccination')
  } else if (historyFilter.value === 'treatments') {
    return entries.filter(entry => 
      entry.type === 'treatment' || 
      entry.type === 'surgery' || 
      entry.type === 'medication' ||
      entry.type === 'therapy'
    )
  } else if (historyFilter.value === 'telehealth') {
    return entries.filter(entry => entry.type === 'telehealth')
  }
  
  return entries
})

// Sorted vaccinations
const sortedVaccinations = computed(() => {
  if (!selectedPet.value || !selectedPet.value.vaccinations) return [];
  
  return [...selectedPet.value.vaccinations].sort((a, b) => {
    let aValue, bValue;
  
    if (vaccineSortKey.value === 'date' || vaccineSortKey.value === 'expiryDate') {
      aValue = new Date(a[vaccineSortKey.value]);
      bValue = new Date(b[vaccineSortKey.value]);
    } else {
      aValue = a[vaccineSortKey.value];
      bValue = b[vaccineSortKey.value];
    }
  
    if (aValue < bValue) return vaccineSortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return vaccineSortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Sorted documents
const sortedDocuments = computed(() => {
  if (!selectedPet.value || !selectedPet.value.documents) return [];
  
  return [...selectedPet.value.documents].sort((a, b) => {
    let aValue, bValue;
  
    if (documentSortKey.value === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    } else {
      aValue = a[documentSortKey.value];
      bValue = b[documentSortKey.value];
    }
  
    if (aValue < bValue) return documentSortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return documentSortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

// Check if vaccine is expired
function isVaccineExpired(expiryDate) {
  return new Date(expiryDate) < new Date()
}

// History filter helper methods
function setHistoryFilter(filter) {
  historyFilter.value = filter
}

function getFilterLabel(filter) {
  switch (filter) {
    case 'all': return 'All Records'
    case 'checkups': return 'Check-ups'
    case 'vaccinations': return 'Vaccinations'
    case 'treatments': return 'Medical Treatments'
    case 'telehealth': return 'Telehealth Consultations'
    default: return 'All Records'
  }
}

function getEntryIcon(type) {
  switch (type) {
    case 'vaccination': return SyringeIcon;
    case 'telehealth': return ActivityIcon;
    case 'checkup': return ClipboardIcon;
    case 'examination': return ClipboardIcon;
    case 'treatment': return ActivityIcon;
    case 'surgery': return ActivityIcon;
    case 'medication': return ActivityIcon;
    default: return ActivityIcon;
  }
}

function getEntryIconClass(type) {
  switch (type) {
    case 'vaccination': return 'bg-emerald-500';
    case 'telehealth': return 'bg-indigo-500';
    case 'checkup': return 'bg-green-500';
    case 'examination': return 'bg-green-500';
    case 'treatment': return 'bg-purple-500';
    case 'surgery': return 'bg-purple-500';
    case 'medication': return 'bg-purple-500';
    default: return 'bg-blue-500';
  }
}

function getEmptyStateIcon() {
  switch (historyFilter.value) {
    case 'vaccinations': return SyringeIcon;
    case 'telehealth': return ActivityIcon;
    case 'checkups': return ClipboardIcon;
    case 'treatments': return ActivityIcon;
    default: return ClipboardIcon;
  }
}

// Edit timeline entry - handled by the main editTimelineRecord function below

// Delete timeline entry - handled by the main deleteTimelineRecord function below

// Add new medical record - handled by the main addMedicalRecord function below

// Open timeline modal
function openTimelineModal() {
  showTimelineModal.value = true;
}

// Add new vaccination - handled by the main addVaccination function below

// Add new document - handled by the main addDocument function below

// Edit medical record - handled by the main editMedicalRecord function below

// Delete medical record - handled by the main deleteMedicalRecord function below

// Edit vaccination - handled by the main editVaccination function below

// Delete vaccination - handled by the main deleteVaccination function below

// Edit document - handled by the main editDocument function below

// Delete document - handled by the main deleteDocument function below



// Bulk operations for pets
function selectAllPets() {
  if (selectedOwner.value && selectedOwner.value.pets) {
    selectedPets.value = [...selectedOwner.value.pets]
  }
}

function deselectAllPets() {
  selectedPets.value = []
}

function togglePetSelection(pet) {
  const index = selectedPets.value.findIndex(p => p.id === pet.id)
  if (index > -1) {
    selectedPets.value.splice(index, 1)
  } else {
    selectedPets.value.push(pet)
  }
}

// Quick actions for pets
function quickAddMedicalRecord(pet) {
  selectedPet.value = pet
  showForm.value = true
  activeTab.value = 'medical'
  // Pre-fill with current date and basic info
  if (!pet.medicalRecords) pet.medicalRecords = []
  const newRecord = {
    id: `new-${Date.now()}`,
    date: new Date().toISOString(),
    description: '',
    vet: '',
    status: 'healthy',
    type: 'checkup'
  }
  pet.medicalRecords.unshift(newRecord)
  selectedPet.value = { ...pet }
}

function quickAddVaccination(pet) {
  selectedPet.value = pet
  showForm.value = true
  activeTab.value = 'vaccinations'
  // Pre-fill with current date and basic info
  if (!pet.vaccinations) pet.vaccinations = []
  const newVaccination = {
    id: `new-${Date.now()}`,
    name: '',
    date: new Date().toISOString(),
    expiryDate: '',
    vet: '',
    notes: ''
  }
  pet.vaccinations.unshift(newVaccination)
  selectedPet.value = { ...pet }
}

// Data validation methods
function validatePetData(pet) {
  const errors = []
  
  if (!pet.name || pet.name.trim().length === 0) {
    errors.push('Pet name is required')
  }
  
  if (!pet.species || pet.species.trim().length === 0) {
    errors.push('Pet species is required')
  }
  
  if (pet.birthDate) {
    const birthDate = new Date(pet.birthDate)
    const today = new Date()
    if (birthDate > today) {
      errors.push('Birth date cannot be in the future')
    }
  }
  
  if (pet.weight && pet.weight <= 0) {
    errors.push('Weight must be greater than 0')
  }
  
  return errors
}

function validateMedicalRecord(record) {
  const errors = []
  
  if (!record.description || record.description.trim().length === 0) {
    errors.push('Medical record description is required')
  }
  
  if (!record.date) {
    errors.push('Medical record date is required')
  } else {
    const recordDate = new Date(record.date)
    const today = new Date()
    if (recordDate > today) {
      errors.push('Medical record date cannot be in the future')
    }
  }
  
  return errors
}

function validateVaccination(vaccination) {
  const errors = []
  
  if (!vaccination.name || vaccination.name.trim().length === 0) {
    errors.push('Vaccination name is required')
  }
  
  if (!vaccination.date) {
    errors.push('Vaccination date is required')
  } else {
    const vaccinationDate = new Date(vaccination.date)
    const today = new Date()
    if (vaccinationDate > today) {
      errors.push('Vaccination date cannot be in the future')
    }
  }
  
  if (vaccination.expiryDate) {
    const expiryDate = new Date(vaccination.expiryDate)
    const vaccinationDate = new Date(vaccination.date)
    if (expiryDate <= vaccinationDate) {
      errors.push('Expiry date must be after vaccination date')
    }
  }
  
  return errors
}

// Methods for handling multiple pets per owner
function viewOwnerDetails(owner) {
  // Store the owner data
  selectedOwner.value = owner
  
  // Check if the owner has multiple pets
  if (owner.pets && owner.pets.length > 1) {
    // Show pet selector for owners with multiple pets
    showPetSelector.value = true
    selectedPet.value = null
  } else if (owner.pets && owner.pets.length === 1) {
    // If owner has exactly one pet, view that pet directly
    const pet = { ...owner.pets[0] }
    
    // Ensure the pet has owner information
    pet.owner = {
      firstName: owner.firstName || '',
      lastName: owner.lastName || '',
      email: owner.email || '',
      phone: owner.phone || '',
      streetAddress: owner.streetAddress || '',
      photoURL: owner.photoURL || defaultPhotoURL.value
    }
    
    viewPet(pet)
  } else {
    // Show pet selector with empty state for owners without pets
    showPetSelector.value = true
    selectedPet.value = null
  }
}

function editOwner(owner) {
  // Same behavior as viewOwnerDetails but starts with edit mode
  selectedOwner.value = owner
  
  if (owner.pets && owner.pets.length > 1) {
    // Show pet selector for owners with multiple pets
    showPetSelector.value = true
    selectedPet.value = null
  } else if (owner.pets && owner.pets.length === 1) {
    // If owner has exactly one pet, edit that pet directly
    const pet = { ...owner.pets[0] }
    
    pet.owner = {
      firstName: owner.firstName || '',
      lastName: owner.lastName || '',
      email: owner.email || '',
      phone: owner.phone || '',
      streetAddress: owner.streetAddress || '',
      photoURL: owner.photoURL || defaultPhotoURL.value
    }
    
    editPet(pet)
  } else {
    // Show pet selector with empty state for owners without pets
    showPetSelector.value = true
    selectedPet.value = null
  }
}



async function viewPet(pet) {
  // Create a deep copy to avoid reference issues
  const petWithOwner = JSON.parse(JSON.stringify(pet))
  
  // Ensure owner property exists
  if (!petWithOwner.owner) {
    petWithOwner.owner = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      streetAddress: '',
      photoURL: defaultPhotoURL.value
    }
    
    // If the pet has an ownerId, try to find the owner in petOwners
    if (petWithOwner.ownerId) {
      const owner = petOwners.value.find(o => o.userId === petWithOwner.ownerId)
      if (owner) {
        petWithOwner.owner = {
          firstName: owner.firstName || '',
          lastName: owner.lastName || '',
          email: owner.email || '',
          phone: owner.phone || '',
          streetAddress: owner.streetAddress || '',
          photoURL: owner.photoURL || defaultPhotoURL.value
        }
      } else {
        // If owner not found in local state, try to fetch from profileStore
        try {
          const profileData = await profileStore.fetchUserProfile(petWithOwner.ownerId)
          if (profileData) {
            petWithOwner.owner = {
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: profileData.email || '',
              phone: profileData.phone || '',
              streetAddress: profileData.streetAddress || '',
              photoURL: profileData.photoURL || defaultPhotoURL.value
            }
          }
        } catch (error) {
          console.error('Error fetching owner profile:', error)
        }
      }
    }
  }
  
  selectedPet.value = petWithOwner
  showForm.value = false
  showPetSelector.value = false
  
  // Refresh pet data to ensure we have the latest information
  await refreshPetData(pet.id)
}

async function editPet(pet) {
  selectedPet.value = pet
  // Create a deep copy of the pet object
  formData.value = JSON.parse(JSON.stringify(pet))
  
  // Refresh pet data to ensure we have the latest information
  await refreshPetData(pet.id)
  
  // Ensure owner property exists in formData
  if (!formData.value.owner) {
    formData.value.owner = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      streetAddress: '',
      photoURL: defaultPhotoURL.value
    }
    
    // If the pet has an ownerId, try to find the owner in petOwners
    if (formData.value.ownerId) {
      const owner = petOwners.value.find(o => o.userId === formData.value.ownerId)
      if (owner) {
        formData.value.owner = {
          firstName: owner.firstName || '',
          lastName: owner.lastName || '',
          email: owner.email || '',
          phone: owner.phone || '',
          streetAddress: owner.streetAddress || '',
          photoURL: owner.photoURL || defaultPhotoURL.value
        }
      } else {
        // If owner not found in local state, try to fetch from profileStore
        try {
          const profileData = await profileStore.fetchUserProfile(formData.value.ownerId)
          if (profileData) {
            formData.value.owner = {
              firstName: profileData.firstName || '',
              lastName: profileData.lastName || '',
              email: profileData.email || '',
              phone: profileData.phone || '',
              streetAddress: profileData.streetAddress || '',
              photoURL: profileData.photoURL || defaultPhotoURL.value
            }
          }
        } catch (error) {
          console.error('Error fetching owner profile:', error)
        }
      }
    }
  }
  
  showForm.value = true
  showPetSelector.value = false
  activeTab.value = 'basics'
}

function cancelForm() {
      // If we were editing a pet from the pet selector, go back to the pet selector
    if (selectedOwner.value && selectedOwner.value.pets && selectedOwner.value.pets.length > 1) {
      showPetSelector.value = true
      showForm.value = false
      selectedPet.value = null
  } else {
    // Otherwise go back to the main list
    selectedPet.value = null
    selectedOwner.value = null
    showForm.value = false
    showPetSelector.value = false
  }
}

function closeForm() {
  // Same as cancelForm for now
  cancelForm()
}

function goBackFromPetView() {
  // If we were viewing a pet from the pet selector, go back to the pet selector
  if (selectedOwner.value && selectedOwner.value.pets && selectedOwner.value.pets.length > 1) {
    showPetSelector.value = true
    selectedPet.value = null
  } else {
    // Otherwise go back to the main list
    goBackToList()
  }
}

function goBackToList() {
  selectedPet.value = null
  selectedOwner.value = null
  showForm.value = false
  showPetSelector.value = false
}

// Save pet directly without confirmation
async function savePet() {
  isSaving.value = true
  
  try {
    // Prepare pet data for saving
    const petData = {
      name: formData.value.name,
      species: formData.value.species,
      breed: formData.value.breed,
      gender: formData.value.gender,
      ageYears: parseInt(formData.value.ageYears) || 0,
      ageMonths: parseInt(formData.value.ageMonths) || 0,
      ageWeeks: parseInt(formData.value.ageWeeks) || 0,
      weight: parseFloat(formData.value.weight) || 0,
      ownerId: formData.value.ownerId || null,
      notes: formData.value.notes || '',
      updatedAt: Timestamp.now()
    }
    
    // Add medical history, vaccinations, and documents if they exist
    if (formData.value.medicalHistory) {
      petData.medicalHistory = formData.value.medicalHistory
    }
    
    if (formData.value.vaccinations) {
      petData.vaccinations = formData.value.vaccinations
    }
    
    if (formData.value.documents) {
      petData.documents = formData.value.documents
    }
    
    if (isNewPet.value) {
      // Add new pet
      petData.createdAt = Timestamp.now()
      const newPet = await petsStore.addPet(formData.value.ownerId, petData)
      
      if (newPet) {
        // Update the owner's pets list
        const ownerIndex = petOwners.value.findIndex(owner => owner.userId === formData.value.ownerId)
        if (ownerIndex !== -1) {
          petOwners.value[ownerIndex].pets.push(newPet)
        }
        
        statusMessage.value = `Pet "${formData.value.name}" added successfully`
        showSuccessModal.value = true
      } else {
        throw new Error('Failed to add pet')
      }
    } else {
      // Update existing pet
      const success = await petsStore.updatePet(formData.value.ownerId, formData.value.id, petData)
      
      if (success) {
        // Update the pet in our local state
        const ownerIndex = petOwners.value.findIndex(owner => owner.userId === formData.value.ownerId)
        if (ownerIndex !== -1) {
          const petIndex = petOwners.value[ownerIndex].pets.findIndex(pet => pet.id === formData.value.id)
          if (petIndex !== -1) {
            petOwners.value[ownerIndex].pets[petIndex] = { 
              ...petOwners.value[ownerIndex].pets[petIndex],
              ...petData,
              id: formData.value.id
            }
          }
        }
        
        statusMessage.value = `Pet "${formData.value.name}" updated successfully`
        showSuccessModal.value = true
      } else {
        throw new Error('Failed to update pet')
      }
    }
    
    // If we have multiple pets for this owner, go back to the pet selector
    if (selectedOwner.value && selectedOwner.value.pets && selectedOwner.value.pets.length > 1) {
      showPetSelector.value = true
      showForm.value = false
      selectedPet.value = null
    } else {
      // Otherwise close the form
      showForm.value = false
      selectedPet.value = null
      selectedOwner.value = null
      showPetSelector.value = false
    }
  } catch (error) {
    console.error('Error saving pet:', error)
    statusMessage.value = 'Failed to save pet. Please try again.'
    showErrorModal.value = true
  } finally {
    isSaving.value = false
  }
}



// Gender dropdown methods
function toggleGenderDropdown() {
  genderDropdownOpen.value = !genderDropdownOpen.value
}

function selectGender(value) {
  formData.value.gender = value
  genderDropdownOpen.value = false
}

// Functions for managing medical history records
function addMedicalRecord() {
  if (showForm.value) {
    if (!formData.value.medicalHistory) {
      formData.value.medicalHistory = []
    }
    formData.value.medicalHistory.push({
      date: new Date().toISOString().split('T')[0],
      type: 'Checkup',
      description: '',
      vet: ''
    })
  } else {
    // In view mode, switch to edit mode first
    editPet(selectedPet.value)
    if (!formData.value.medicalHistory) {
      formData.value.medicalHistory = []
    }
    formData.value.medicalHistory.push({
      date: new Date().toISOString().split('T')[0],
      type: 'Checkup',
      description: '',
      vet: ''
    })
    activeTab.value = 'medical'
  }
}

function removeMedicalRecord(index) {
  formData.value.medicalHistory.splice(index, 1)
}

function editMedicalRecord(index) {
  editPet(selectedPet.value)
  activeTab.value = 'medical'
}

function deleteMedicalRecord(index) {
  if (selectedPet.value && selectedPet.value.medicalHistory) {
    // Create a copy of the pet to edit
    const updatedPet = { ...selectedPet.value }
    updatedPet.medicalHistory = [...updatedPet.medicalHistory]
    updatedPet.medicalHistory.splice(index, 1)
    
    // Update in petsStore
    petsStore.updatePet(updatedPet.ownerId, updatedPet.id, updatedPet)
    
    // Update local state
    selectedPet.value = updatedPet
  }
}

// Functions for managing vaccinations
function addVaccination() {
  if (showForm.value) {
    if (!formData.value.vaccinations) {
      formData.value.vaccinations = []
    }
    formData.value.vaccinations.push({
      name: '',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    })
  } else {
    // In view mode, switch to edit mode first
    editPet(selectedPet.value)
    if (!formData.value.vaccinations) {
      formData.value.vaccinations = []
    }
    formData.value.vaccinations.push({
      name: '',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    })
    activeTab.value = 'vaccinations'
  }
}

function removeVaccination(index) {
  formData.value.vaccinations.splice(index, 1)
}

function editVaccination(index) {
  editPet(selectedPet.value)
  activeTab.value = 'vaccinations'
}

function deleteVaccination(index) {
  if (selectedPet.value && selectedPet.value.vaccinations) {
    // Create a copy of the pet to edit
    const updatedPet = { ...selectedPet.value }
    updatedPet.vaccinations = [...updatedPet.vaccinations]
    updatedPet.vaccinations.splice(index, 1)
    
    // Update in petsStore
    petsStore.updatePet(updatedPet.ownerId, updatedPet.id, updatedPet)
    
    // Update local state
    selectedPet.value = updatedPet
  }
}

// Functions for managing documents
function addDocument() {
  if (showForm.value) {
    if (!formData.value.documents) {
      formData.value.documents = []
    }
    formData.value.documents.push({
      name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'pdf',
      url: '#'
    })
  } else {
    // In view mode, switch to edit mode first
    editPet(selectedPet.value)
    if (!formData.value.documents) {
      formData.value.documents = []
    }
    formData.value.documents.push({
      name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'pdf',
      url: '#'
    })
    activeTab.value = 'documents'
  }
}

function removeDocument(index) {
  formData.value.documents.splice(index, 1)
}

function editDocument(index) {
  editPet(selectedPet.value)
  activeTab.value = 'documents'
}

function editTelehealthRecord(record) {
  formData.value = { ...record }
  activeTab.value = 'telehealth'
  showForm.value = true
}

function deleteTelehealthRecord(recordId) {
  if (!selectedPet.value || !selectedPet.value.telehealthRecords) return
  
  const index = selectedPet.value.telehealthRecords.findIndex(r => r.id === recordId)
  if (index > -1) {
    selectedPet.value.telehealthRecords.splice(index, 1)
    // Here you would also update the database
    console.log('Telehealth record deleted:', recordId)
  }
}

// Timeline tab functionality
function switchToTimeline() {
  activeTab.value = 'timeline'
}



// Export to CSV function
function exportToCSV() {
  // Get all the data we want to export
  const data = filteredOwners.value.map(owner => {
    const petCount = owner.pets ? owner.pets.length : 0
    const petNames = owner.pets ? owner.pets.map(pet => pet.name).join(', ') : ''
    const petSpecies = owner.pets ? owner.pets.map(pet => pet.species).join(', ') : ''
  
    return {
      'Owner Name': `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
      'Owner Email': owner.email || '',
      'Owner Phone': owner.phone || '',
      'Owner Address': owner.streetAddress || '',
      'Number of Pets': petCount,
      'Pet Names': petNames,
      'Pet Species': petSpecies,
      'Created Date': formatDate(owner.createdAt),
      'Updated Date': formatDate(owner.updatedAt)
    }
  })
  
  // Convert to CSV
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'pet_owners_data.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Table header sorting
function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Medical history sorting
function sortMedicalHistory(key) {
  if (medicalSortKey.value === key) {
    medicalSortOrder.value = medicalSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    medicalSortKey.value = key
    medicalSortOrder.value = 'asc'
  }
}

// Vaccinations sorting
function sortVaccinations(key) {
  if (vaccineSortKey.value === key) {
    vaccineSortOrder.value = vaccineSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    vaccineSortKey.value = key
    vaccineSortOrder.value = 'asc'
  }
}

// Documents sorting
function sortDocuments(key) {
  if (documentSortKey.value === key) {
    documentSortOrder.value = documentSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    documentSortKey.value = key
    documentSortOrder.value = 'asc'
  }
}

// Filter functions
function toggleFilter() {
  showFilterMenu.value = !showFilterMenu.value
  currentPage.value = 1 // Reset to first page when toggling filter
}

function applyFilters() {
  showFilterMenu.value = false
  currentPage.value = 1 // Reset to first page when applying filters
}

// Pagination functions
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Tab dropdown functions
function toggleTabDropdown() {
  showTabDropdown.value = !showTabDropdown.value
}

function selectTab(tab) {
  activeTab.value = tab
  showTabDropdown.value = false
}

function getTabIcon(tab) {
  switch(tab) {
    case 'basics': return FileText
    case 'medical': return Activity
    case 'vaccinations': return SyringeIcon
    case 'documents': return FileIcon
    case 'timeline': return ActivityIcon
    default: return FileText
  }
}

function getTabLabel(tab) {
  switch(tab) {
    case 'basics': return 'Basic Details'
    case 'medical': return 'Medical History'
    case 'vaccinations': return 'Vaccinations'
    case 'documents': return 'Documents'
    case 'timeline': return 'Timeline'
    default: return 'Basic Details'
  }
}

// Close dropdown when clicking outside
watch(() => showTabDropdown.value, (isOpen) => {
  if (isOpen) {
    const closeDropdown = (e) => {
      showTabDropdown.value = false
      document.removeEventListener('click', closeDropdown)
    }
    // Use nextTick to avoid immediate closing
    setTimeout(() => {
      document.addEventListener('click', closeDropdown)
    }, 0)
  }
})

// Close gender dropdown when clicking outside
watch(() => genderDropdownOpen.value, (isOpen) => {
  if (isOpen) {
    const closeDropdown = (e) => {
      if (!e.target.closest('.gender-dropdown')) {
        genderDropdownOpen.value = false
        document.removeEventListener('click', closeDropdown)
      }
    }
    // Use nextTick to avoid immediate closing
    setTimeout(() => {
      document.addEventListener('click', closeDropdown)
    }, 0)
  }
})

// Initialize component
onMounted(async () => {
  await fetchPetOwnersWithPets()
})

// Watch for changes in search query to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})

// Watch for changes in filters to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Keyboard navigation for pet carousel
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  // Show vaccination alerts on mount if any exist
  if (vaccinationAlerts.value.length > 0) {
    showVaccinationAlerts()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(event) {
  if (!selectedOwner.value || !showForm.value) return
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousPet()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextPet()
      break
    case 'Escape':
      event.preventDefault()
      closeForm()
      break
  }
}

// Method to show vaccination alerts
function showVaccinationAlerts() {
  const alertCount = vaccinationAlerts.value.length
  if (alertCount > 0) {
    // You can implement a toast notification system here
    console.log(`⚠️ ${alertCount} vaccination(s) need attention`)
    
    // For now, we'll just log to console
    // In a real app, you might want to show a modal or toast
    vaccinationAlerts.value.forEach(alert => {
      console.log(`${alert.type.toUpperCase()}: ${alert.message}`)
    })
  }
}

// Search suggestions and auto-completion
function getSearchSuggestions(query) {
  if (!query || query.length < 2) return []
  
  const suggestions = []
  const queryLower = query.toLowerCase()
  
  // Add owner name suggestions
  petOwners.value.forEach(owner => {
    if (owner.firstName?.toLowerCase().includes(queryLower)) {
      suggestions.push({
        type: 'owner',
        text: `${owner.firstName} ${owner.lastName}`,
        value: owner
      })
    }
    if (owner.lastName?.toLowerCase().includes(queryLower)) {
      suggestions.push({
        type: 'owner',
        text: `${owner.firstName} ${owner.lastName}`,
        value: owner
      })
    }
  })
  
  // Add pet name suggestions
  petOwners.value.forEach(owner => {
    if (owner.pets) {
      owner.pets.forEach(pet => {
        if (pet.name?.toLowerCase().includes(queryLower)) {
          suggestions.push({
            type: 'pet',
            text: `${pet.name} (${owner.firstName} ${owner.lastName})`,
            value: { pet, owner }
          })
        }
        if (pet.species?.toLowerCase().includes(queryLower)) {
          suggestions.push({
            type: 'species',
            text: `${pet.species} - ${pet.name}`,
            value: { pet, owner }
          })
        }
      })
    }
  })
  
  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.text === suggestion.text)
  )
  
  return uniqueSuggestions.slice(0, 10)
}

// Method to handle search suggestion selection
function selectSearchSuggestion(suggestion) {
  if (suggestion.type === 'owner') {
    viewOwnerDetails(suggestion.value)
  } else if (suggestion.type === 'pet') {
    viewOwnerDetails(suggestion.value.owner)
    // Find and select the specific pet
    const petIndex = suggestion.value.owner.pets.findIndex(p => p.id === suggestion.value.pet.id)
    if (petIndex > -1) {
      setActivePet(petIndex)
    }
  }
  
  // Clear search
  searchQuery.value = ''
}

// Comprehensive reporting methods
function generateOwnerReport(owner) {
  const report = {
    owner: {
      name: `${owner.firstName} ${owner.lastName}`,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      createdAt: formatDate(owner.createdAt),
      updatedAt: formatDate(owner.updatedAt)
    },
    pets: [],
    summary: {
      totalPets: 0,
      totalMedicalRecords: 0,
      totalVaccinations: 0,
      totalDocuments: 0,
      petsNeedingAttention: 0
    }
  }
  
  if (owner.pets) {
    owner.pets.forEach(pet => {
      const petReport = {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: formatPetAge(pet),
        weight: pet.weight,
        medicalRecords: pet.medicalRecords?.length || 0,
        vaccinations: pet.vaccinations?.length || 0,
        documents: pet.documents?.length || 0,
        lastVisit: pet.medicalRecords?.length > 0 ? formatDate(pet.medicalRecords[0].date) : 'Never',
        nextVaccination: getNextVaccinationDue(pet) ? formatDate(getNextVaccinationDue(pet).expiryDate) : 'None scheduled',
        healthStatus: getHealthStatus(pet)
      }
      
      report.pets.push(petReport)
      report.summary.totalPets++
      report.summary.totalMedicalRecords += petReport.medicalRecords
      report.summary.totalVaccinations += petReport.vaccinations
      report.summary.totalDocuments += petReport.documents
      
      if (getHealthStatus(pet) === 'Under Treatment' || getHealthStatus(pet) === 'Critical') {
        report.summary.petsNeedingAttention++
      }
    })
  }
  
  return report
}

function exportOwnerReport(owner) {
  const report = generateOwnerReport(owner)
  const csvContent = convertReportToCSV(report)
  downloadCSV(csvContent, `owner_report_${owner.firstName}_${owner.lastName}_${new Date().toISOString().split('T')[0]}.csv`)
}

// Data refresh and statistics methods
function refreshData() {
  // Reset to first page
  currentPage.value = 1
  
  // Clear selections
  selectedOwner.value = null
  selectedPet.value = null
  selectedPets.value = []
  activePetIndex.value = 0
  
  // Refresh data
  fetchPetOwnersWithPets()
}

// Enhanced refresh function for specific pet data
async function refreshPetData(petId) {
  if (!selectedOwner.value) return
  
  try {
    // Get current vet's ID
    const currentVetId = authStore.user?.uid
    if (!currentVetId) {
      console.error('No current vet authenticated')
      return
    }
    
    // Refresh appointments for the specific pet (only with current vet)
    const appointmentsRef = collection(db, 'appointments')
    const apptQuery = query(
      appointmentsRef, 
      where('userId', '==', selectedOwner.value.userId),
      where('petIds', 'array-contains', petId),
      where('doctorId', '==', currentVetId) // Only appointments with current vet
    )
    const apptSnapshot = await getDocs(apptQuery)
    
    // Find the pet in the owner's pets array
    const pet = selectedOwner.value.pets.find(p => p.id === petId)
    if (pet) {
      // Clear existing medical history
      pet.medicalHistory = []
      
      // Process appointments to create timeline records
      apptSnapshot.forEach(apptDoc => {
        const apptData = apptDoc.data()
        
        // Create medical record from appointment
        if (apptData.status === 'approved' || apptData.status === 'completed') {
          const medicalRecord = {
            id: apptDoc.id,
            date: apptData.date,
            type: 'appointment',
            title: apptData.serviceNames ? apptData.serviceNames.join(', ') : 'Appointment',
            description: `Appointment with ${apptData.doctorName} on ${apptData.date} at ${apptData.time}`,
            vet: apptData.doctorName,
            status: apptData.status,
            duration: apptData.duration,
            serviceIds: apptData.services || [],
            createdAt: apptData.createdAt
          }
          
          pet.medicalHistory.push(medicalRecord)
        }
      })
      
      // Fetch service details for each service ID
      if (pet.medicalHistory.length > 0) {
        for (const record of pet.medicalHistory) {
          if (record.serviceIds && record.serviceIds.length > 0) {
            for (const serviceId of record.serviceIds) {
              try {
                const serviceRef = doc(db, 'services', serviceId)
                const serviceDoc = await getDoc(serviceRef)
                if (serviceDoc.exists()) {
                  const serviceData = serviceDoc.data()
                  // Enhance the medical record with service details
                  record.serviceDetails = {
                    name: serviceData.name,
                    description: serviceData.description,
                    processingTime: serviceData.processingTime,
                    fees: serviceData.fees,
                    coverPhoto: serviceData.coverPhoto
                  }
                }
              } catch (error) {
                console.warn(`Could not fetch service details for ${serviceId}:`, error)
              }
            }
          }
        }
      }
      
      // Update the selected pet if it's the current one
      if (selectedPet.value && selectedPet.value.id === petId) {
        selectedPet.value = { ...pet }
      }
    }
    
    console.log('Refreshed pet data:', pet)
  } catch (error) {
    console.error('Error refreshing pet data:', error)
  }
}

function showStatistics() {
  const stats = petStatistics.value
  const message = `
📊 Pet Statistics for ${selectedOwner.value ? `${selectedOwner.value.firstName} ${selectedOwner.value.lastName}` : 'All Owners'}:
• Total Pets: ${stats.totalPets}
• Total Medical Records: ${stats.totalMedicalRecords}
• Total Vaccinations: ${stats.totalVaccinations}
• Total Documents: ${stats.totalDocuments}
• Average Age: ${stats.averageAge} years
  `.trim()
  
  console.log(message)
  // In a real app, you might want to show this in a modal or toast
}

function showVaccinationSummary() {
  const alerts = vaccinationAlerts.value
  if (alerts.length === 0) {
    console.log('✅ All vaccinations are up to date!')
    return
  }
  
  const expiredCount = alerts.filter(a => a.type === 'error').length
  const expiringCount = alerts.filter(a => a.type === 'warning').length
  
  const message = `
⚠️ Vaccination Summary:
• Expired: ${expiredCount}
• Expiring Soon: ${expiringCount}
• Total Alerts: ${alerts.length}
  `.trim()
  
  console.log(message)
  // In a real app, you might want to show this in a modal or toast
}

// File and document management methods
function handleFileUpload(event, pet) {
  const files = event.target.files
  if (!files || files.length === 0) return
  
  Array.from(files).forEach(file => {
    const document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      date: new Date().toISOString(),
      uploadedBy: 'Current User', // In a real app, get from auth
      notes: ''
    }
    
    // In a real app, you would upload the file to storage and get a URL
    // For now, we'll just add the document metadata
    if (!pet.documents) pet.documents = []
    pet.documents.unshift(document)
    
    // Update the pet data
    if (selectedPet.value && selectedPet.value.id === pet.id) {
      selectedPet.value = { ...pet }
    }
  })
  
  // Clear the file input
  event.target.value = ''
}

function downloadDocument(document) {
  // In a real app, you would download the actual file
  // For now, we'll just log the action
  console.log(`Downloading document: ${document.name}`)
}

function deleteDocument(document, pet) {
  const index = pet.documents.findIndex(d => d.id === document.id)
  if (index > -1) {
    pet.documents.splice(index, 1)
    
    // Update the pet data
    if (selectedPet.value && selectedPet.value.id === pet.id) {
      selectedPet.value = { ...pet }
    }
  }
}

// Utility method to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Advanced filtering and sorting methods
function applyAdvancedFilters() {
  // Reset to first page when filters change
  currentPage.value = 1
  
  // You can implement more complex filtering logic here
  // For now, the basic filtering is handled by the computed properties
  console.log('Advanced filters applied:', filters.value)
}

function clearAllFilters() {
  filters.value = {
    species: '',
    breed: '',
    ageRange: '',
    healthStatus: '',
    vaccinationStatus: '',
    lastVisitRange: ''
  }
  searchQuery.value = ''
  currentPage.value = 1
}

function sortOwnersBy(criteria) {
  // This would be implemented in the computed properties
  // For now, we'll just log the action
  console.log(`Sorting owners by: ${criteria}`)
}

function exportFilteredData() {
  const filteredData = filteredOwners.value
  if (filteredData.length === 0) {
    console.log('No data to export')
    return
  }
  
  const csvContent = convertOwnersToCSV(filteredData)
  downloadCSV(csvContent, `filtered_pet_owners_${new Date().toISOString().split('T')[0]}.csv`)
}

function convertOwnersToCSV(owners) {
  let csv = 'Owner Name,Email,Phone,Total Pets,Total Medical Records,Total Vaccinations,Last Visit\n'
  
  owners.forEach(owner => {
    const totalPets = owner.pets?.length || 0
    const totalMedicalRecords = owner.pets?.reduce((sum, pet) => sum + (pet.medicalRecords?.length || 0), 0) || 0
    const totalVaccinations = owner.pets?.reduce((sum, pet) => sum + (pet.vaccinations?.length || 0), 0) || 0
    
    let lastVisit = 'Never'
    if (owner.pets && owner.pets.length > 0) {
      const allRecords = owner.pets.flatMap(pet => pet.medicalRecords || [])
      if (allRecords.length > 0) {
        const sortedRecords = allRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
        lastVisit = formatDate(sortedRecords[0].date)
      }
    }
    
    csv += `${owner.firstName} ${owner.lastName},${owner.email},${owner.phone},${totalPets},${totalMedicalRecords},${totalVaccinations},${lastVisit}\n`
  })
  
  return csv
}

function convertReportToCSV(report) {
  let csv = 'Owner Information\n'
  csv += 'Name,Email,Phone,Address,Created,Updated\n'
  csv += `${report.owner.name},${report.owner.email},${report.owner.phone},${report.owner.address},${report.owner.createdAt},${report.owner.updatedAt}\n\n`
  
  csv += 'Summary\n'
  csv += 'Total Pets,Total Medical Records,Total Vaccinations,Total Documents,Pets Needing Attention\n'
  csv += `${report.summary.totalPets},${report.summary.totalMedicalRecords},${report.summary.totalVaccinations},${report.summary.totalDocuments},${report.summary.petsNeedingAttention}\n\n`
  
  csv += 'Pet Details\n'
  csv += 'Name,Species,Breed,Age,Weight,Medical Records,Vaccinations,Documents,Last Visit,Next Vaccination,Health Status\n'
  report.pets.forEach(pet => {
    csv += `${pet.name},${pet.species},${pet.breed},${pet.age},${pet.weight},${pet.medicalRecords},${pet.vaccinations},${pet.documents},${pet.lastVisit},${pet.nextVaccination},${pet.healthStatus}\n`
  })
  
  return csv
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Unified Timeline View
const timelineFilter = ref('all')
const filteredTimelineRecords = computed(() => {
  if (!selectedPet.value) return []
  
  let allRecords = []
  
  // Add medical history records (including appointments)
  if (selectedPet.value.medicalHistory) {
    allRecords.push(...selectedPet.value.medicalHistory.map(record => ({
      ...record,
      type: record.type === 'appointment' ? 'medical' : 'medical',
      date: record.date || record.createdAt || new Date(),
      // Handle appointment-specific data
      title: record.title || (record.serviceDetails ? record.serviceDetails.name : 'Medical Record'),
      description: record.description || (record.serviceDetails ? record.serviceDetails.description : 'Medical treatment'),
      vet: record.vet || record.doctorName || 'Unknown',
      status: record.status || 'completed'
    })))
  }
  
  // Add vaccination records
  if (selectedPet.value.vaccinations) {
    allRecords.push(...selectedPet.value.vaccinations.map(record => ({
      ...record,
      type: 'vaccination',
      date: record.date || record.vaccinationDate || new Date()
    })))
  }
  
  // Add telehealth records
  if (selectedPet.value.telehealthRecords) {
    allRecords.push(...selectedPet.value.telehealthRecords.map(record => ({
      ...record,
      type: 'telehealth',
      date: record.date || record.consultationDate || new Date()
    })))
  }
  
  // Add document records
  if (selectedPet.value.documents) {
    allRecords.push(...selectedPet.value.documents.map(record => ({
      ...record,
      type: 'document',
      date: record.date || record.uploadDate || new Date()
    })))
  }
  
  // Sort by date (newest first)
  allRecords.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // Apply filter
  if (timelineFilter.value === 'all') {
    return allRecords
  } else if (timelineFilter.value === 'medical') {
    return allRecords.filter(record => record.type === 'medical')
  } else if (timelineFilter.value === 'vaccinations') {
    return allRecords.filter(record => record.type === 'vaccination')
  } else if (timelineFilter.value === 'telehealth') {
    return allRecords.filter(record => record.type === 'telehealth')
  } else if (timelineFilter.value === 'documents') {
    return allRecords.filter(record => record.type === 'document')
  }
  
  return allRecords
})

function getTimelineIcon(type) {
  switch (type) {
    case 'medical': return StethoscopeIcon
    case 'vaccination': return SyringeIcon
    case 'telehealth': return VideoIcon
    case 'document': return FileIcon
    default: return CalendarIcon
  }
}

function getTimelineIconClass(type) {
  switch (type) {
    case 'medical': return 'bg-green-500'
    case 'vaccination': return 'bg-emerald-500'
    case 'telehealth': return 'bg-indigo-500'
    case 'document': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

function getTimelineTitle(record) {
  switch (record.type) {
    case 'medical': 
      // Handle appointment-based medical records
      if (record.serviceDetails && record.serviceDetails.name) {
        return record.serviceDetails.name
      }
      return record.title || record.type || 'Medical Record'
    case 'vaccination': 
      return record.vaccineName || record.title || 'Vaccination'
    case 'telehealth': 
      return record.title || 'Telehealth Consultation'
    case 'document': 
      return record.title || record.fileName || 'Document'
    default: 
      return record.title || 'Record'
  }
}

function getTimelineStatus(record) {
  switch (record.type) {
    case 'medical': 
      // Handle appointment-based status
      if (record.status === 'approved') return 'Approved'
      if (record.status === 'completed') return 'Completed'
      if (record.status === 'pending') return 'Pending'
      if (record.status === 'cancelled') return 'Cancelled'
      return record.status || record.condition || 'Completed'
    case 'vaccination': 
      if (record.expiryDate && new Date(record.expiryDate) < new Date()) {
        return 'Expired'
      }
      return record.status || 'Active'
    case 'telehealth': 
      return record.status || 'Completed'
    case 'document': 
      return record.status || 'Active'
    default: 
      return record.status || 'Unknown'
  }
}

function getTimelineStatusClass(record) {
  const status = getTimelineStatus(record)
  
  switch (status.toLowerCase()) {
    case 'expired':
    case 'sick':
    case 'critical':
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
    case 'active':
    case 'healthy':
    case 'approved':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

function setTimelineFilter(filter) {
  timelineFilter.value = filter
}

function getTimelineFilterLabel(filter) {
  switch (filter) {
    case 'all': return 'All Activities'
    case 'medical': return 'Medical Records'
    case 'vaccinations': return 'Vaccinations'
    case 'telehealth': return 'Telehealth Consultations'
    case 'documents': return 'Documents'
    default: return 'All Activities'
  }
}

function fetchPetAppointments() {
  // Fetch pet appointments from the store or API
  console.log('Fetching pet appointments for:', selectedPet.value?.name)
  // You can implement the actual appointment fetching logic here
}

function editTimelineRecord(record, index) {
  // Handle editing timeline records based on type
  switch (record.type) {
    case 'medical':
      editMedicalRecord(record)
      break
    case 'vaccination':
      editVaccination(record)
      break
    case 'telehealth':
      editTelehealthRecord(record)
      break
    case 'document':
      editDocument(record)
      break
    default:
      console.log('Edit timeline record:', record, index)
  }
}

function deleteTimelineRecord(record, index) {
  // Handle deleting timeline records based on type
  switch (record.type) {
    case 'medical':
      deleteMedicalRecord(record.id || index)
      break
    case 'vaccination':
      deleteVaccination(record.id || index)
      break
    case 'telehealth':
      deleteTelehealthRecord(record.id || index)
      break
    case 'document':
      deleteDocument(record.id || index)
      break
    default:
      console.log('Delete timeline record:', record, index)
  }
}

// Helper functions for enhanced pet selection view
function getTotalMedicalRecords() {
  if (!selectedOwner.value || !selectedOwner.value.pets) return 0
  return selectedOwner.value.pets.reduce((total, pet) => {
    return total + getPetRecordCount(pet)
  }, 0)
}

function getActiveVaccinations() {
  if (!selectedOwner.value || !selectedOwner.value.pets) return 0
  return selectedOwner.value.pets.reduce((total, pet) => {
    if (!pet.vaccinations) return total
    const now = new Date()
    return total + pet.vaccinations.filter(vaccine => {
      if (!vaccine.expiryDate) return false
      return new Date(vaccine.expiryDate) > now
    }).length
  }, 0)
}

function getPetRecordCount(pet) {
  if (!pet) return 0
  const medicalCount = pet.medicalHistory?.length || 0
  const vaccinationCount = pet.vaccinations?.length || 0
  const telehealthCount = pet.telehealthRecords?.length || 0
  const documentCount = pet.documents?.length || 0
  return medicalCount + vaccinationCount + telehealthCount + documentCount
}

function getLastUpdateDate(pet) {
  if (!pet) return null
  
  const dates = []
  
  // Check medical history
  if (pet.medicalHistory && pet.medicalHistory.length > 0) {
    dates.push(...pet.medicalHistory.map(record => new Date(record.date)))
  }
  
  // Check vaccinations
  if (pet.vaccinations && pet.vaccinations.length > 0) {
    dates.push(...pet.vaccinations.map(record => new Date(record.date)))
  }
  
  // Check telehealth records
  if (pet.telehealthRecords && pet.telehealthRecords.length > 0) {
    dates.push(...pet.telehealthRecords.map(record => new Date(record.date)))
  }
  
  // Check documents
  if (pet.documents && pet.documents.length > 0) {
    dates.push(...pet.documents.map(record => new Date(record.date)))
  }
  
  if (dates.length === 0) return null
  
  // Return the most recent date
  return new Date(Math.max(...dates))
}

// openTimelineModal function is already defined above
</script>

<style scoped>
/* Ensure consistency with mobile displays */
@media (max-width: 640px) {
  input, select {
    font-size: 16px; /* Prevents zoom on focus in iOS */
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>