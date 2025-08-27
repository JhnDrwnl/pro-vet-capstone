<template>
  <div class="min-h-screen flex flex-col bg-gray-50 -mt-4 md:mt-0">
    <!-- Enhanced Page Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Pets</h1>
            <p class="text-lg text-gray-600 mt-2">Manage your pets and view their health records</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click.prevent="addNewPet"
              :disabled="hasUnsavedNewPet"
              :class="[
                'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm',
                hasUnsavedNewPet 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:scale-105'
              ]"
              type="button"
              :title="hasUnsavedNewPet ? 'Please save the current pet before adding a new one' : 'Add a new pet'"
            >
              <PlusIcon class="w-5 h-5" />
              Add Pet
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 px-4 md:px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <LoadingSpinner v-if="isLoading" isOverlay text="Loading pets data..." />

        <div v-if="!isLoading" class="space-y-6">
          <!-- List view -->
          <div v-if="!selectedPetId">
            <!-- Empty State -->
            <div v-if="localPets.length === 0" class="text-center py-16">
              <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon class="w-12 h-12 text-blue-400" />
              </div>
              <h3 class="text-2xl font-semibold text-gray-900 mb-3">No pets added yet</h3>
              <p class="text-gray-600 mb-8 max-w-md mx-auto">Start your journey with ProVET by adding your first pet. We'll help you track their health, vaccinations, and medical history.</p>
              <button
                @click.prevent="addNewPet"
                class="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon class="w-5 h-5 mr-2 inline" />
                Add Your First Pet
              </button>
            </div>
            
            <!-- Pets Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="(pet, index) in localPets"
                :key="pet.id || pet.tempId"
                class="group relative overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <!-- Accent stripe -->
                <div class="absolute inset-x-0 top-0 h-1" :class="getCardStripe(index)"></div>

                <!-- Header with avatar -->
                <div class="p-6 pt-8">
                  <div class="flex items-start gap-4">
                    <div class="relative -mt-8 w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                      <img v-if="pet.photoURL && !pet.isNew" :src="pet.photoURL" :alt="pet.name" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-gray-400">
                        <HeartIcon class="w-10 h-10 text-blue-400" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-xl font-bold text-gray-900 truncate">{{ pet.isNew ? 'New Pet' : pet.name }}</h3>
                        <span v-if="pet.isNew" class="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">New</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-1">{{ pet.breed || 'No breed' }} • {{ formatPetAge(pet) }}</p>
                      <p class="text-xs text-gray-500">{{ pet.species || 'Species not specified' }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button v-if="!pet.isNew" @click.stop="viewPet(pet)" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="View">
                        <EyeIcon class="w-4 h-4" />
                      </button>
                      <button @click.stop="editPet(pet)" class="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors" title="Edit">
                        <EditIcon class="w-4 h-4" />
                      </button>
                      <button v-if="!pet.isNew" @click.stop="confirmDeletePet(pet)" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Info grid -->
                  <div class="mt-6 grid grid-cols-2 gap-3">
                    <div class="rounded-xl border bg-gray-50 p-3">
                      <div class="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Species</div>
                      <div class="font-semibold text-gray-800">{{ pet.species || '—' }}</div>
                    </div>
                    <div class="rounded-xl border bg-gray-50 p-3">
                      <div class="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Gender</div>
                      <div class="font-semibold text-gray-800">{{ pet.gender ? formatGender(pet.gender) : '—' }}</div>
                    </div>
                    <div class="rounded-xl border bg-gray-50 p-3">
                      <div class="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Weight</div>
                      <div class="font-semibold text-gray-800">{{ pet.weight ? pet.weight + ' kg' : '—' }}</div>
                    </div>
                    <div class="rounded-xl border bg-gray-50 p-3">
                      <div class="text-xs uppercase tracking-wide text-gray-500 font-medium mb-1">Records</div>
                      <div class="font-semibold text-blue-600">{{ (pet.medicalHistory?.length || 0) + (pet.vaccinations?.length || 0) }}</div>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="mt-6 flex items-center justify-between">
                    <div class="flex flex-wrap gap-2">
                      <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{{ pet.species || 'Species' }}</span>
                      <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">{{ pet.breed || 'Breed' }}</span>
                    </div>
                    <router-link to="/user/userappointments" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md">
                      Book Appointment
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Details view -->
      <div v-if="selectedPetId" class="space-y-6">
        <!-- Enhanced Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center gap-6">
            <button @click="backToList" type="button" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeftIcon class="w-6 h-6" />
            </button>
            <div class="relative group">
              <div v-if="selectedLocalPet?.photoURL && !selectedLocalPet.isNew" class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                <img :src="selectedLocalPet.photoURL" :alt="selectedLocalPet.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-gray-400 ring-4 ring-white shadow-lg">
                <HeartIcon class="w-16 h-16 text-blue-400" />
              </div>
              <button v-if="viewMode === 'edit'" @click.prevent="triggerPetPhotoUpload" type="button" class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
                <CameraIcon class="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div class="flex-1">
              <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedLocalPet?.isNew ? 'New Pet' : getDisplayName() }}</h2>
              <p class="text-lg text-gray-600">{{ selectedLocalPet?.isNew ? 'Complete the form and save to view details' : getDisplayDetails() }}</p>
            </div>
            <div class="flex space-x-3">
              <button v-if="viewMode === 'view' && selectedPetTab === 'basic-details'" @click="editPet(selectedLocalPet)" type="button" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                <EditIcon class="w-4 h-4" />
                Edit Pet
              </button>
              <button v-if="viewMode === 'edit'" @click="saveAllChanges" :disabled="isSavingChanges || !pendingChanges" :class="['px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2', isSavingChanges || !pendingChanges ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700']">
                <div v-if="isSavingChanges" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ isSavingChanges ? 'Saving...' : 'Save Pet' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div v-if="!selectedLocalPet?.isNew && viewMode === 'view'" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <nav class="hidden md:flex border-b border-gray-200">
            <button v-for="tab in petTabs" :key="tab.id" @click.prevent="selectedPetTab = tab.id" type="button" :class="['py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors', selectedPetTab === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50']">
              <component :is="tab.icon" class="w-5 h-5" />
              {{ tab.name }}
            </button>
          </nav>
          <div class="md:hidden relative">
            <button @click.stop="toggleTabsDropdown" type="button" class="w-full flex items-center justify-between py-4 px-6 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <component :is="getCurrentTabIcon()" class="w-5 h-5" />
                <span>{{ getCurrentTabName() }}</span>
              </div>
              <ChevronDownIcon class="w-5 h-5" :class="{ 'transform rotate-180': tabsDropdownOpen }" />
            </button>
            <div v-show="tabsDropdownOpen" class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg tabs-dropdown">
              <button v-for="tab in petTabs" :key="tab.id" @click.stop="selectTabAndCloseDropdown(tab.id)" type="button" :class="['w-full text-left py-3 px-6 flex items-center gap-2', selectedPetTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50']">
                <component :is="tab.icon" class="w-5 h-5" />
                {{ tab.name }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tab Content -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <!-- Basic Details -->
          <div v-if="viewMode === 'edit' || (viewMode === 'view' && selectedPetTab === 'basic-details')" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name <span class="text-red-500">*</span></label>
                <input v-model="editablePet.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Species <span class="text-red-500">*</span></label>
                <input v-model="editablePet.species" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Breed <span class="text-red-500">*</span></label>
                <input v-model="editablePet.breed" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Age (Years, Months, Weeks)</label>
                <div class="grid grid-cols-3 gap-3">
                  <input v-model.number="editablePet.ageYears" type="number" min="0" placeholder="Years" class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
                  <input v-model.number="editablePet.ageMonths" type="number" min="0" max="11" placeholder="Months" class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
                  <input v-model.number="editablePet.ageWeeks" type="number" min="0" max="3" placeholder="Weeks" class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input v-model.number="editablePet.weight" type="number" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" @input="updateLocalPet" :disabled="viewMode === 'view'" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gender <span class="text-red-500">*</span></label>
                <div v-if="viewMode !== 'view'" class="relative">
                  <div @click="toggleGenderDropdown" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer flex justify-between items-center gender-dropdown transition-colors">
                    <span v-if="editablePet.gender">{{ formatGender(editablePet.gender) }}</span>
                    <span v-else class="text-gray-500">Select gender</span>
                    <ChevronDownIcon class="w-4 h-4 text-gray-500" :class="{ 'transform rotate-180': genderDropdownOpen }" />
                  </div>
                  <div v-show="genderDropdownOpen" class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg gender-dropdown">
                    <div v-for="option in genderOptions" :key="option.value" @click="selectGender(option.value)" class="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown transition-colors">{{ option.label }}</div>
                  </div>
                </div>
                <div v-else class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm">{{ editablePet.gender ? formatGender(editablePet.gender) : 'Not specified' }}</div>
              </div>
            </div>
            
            <!-- Action Buttons for Edit Mode -->
            <div v-if="viewMode === 'edit'" class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                @click="backToList"
                type="button"
                class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                @click="saveAllChanges"
                :disabled="isSavingChanges || !pendingChanges"
                :class="[
                  'px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2',
                  isSavingChanges || !pendingChanges
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                ]"
              >
                <div v-if="isSavingChanges" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ isSavingChanges ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
          
          <!-- Medical History Tab Content -->
          <div v-if="selectedPetTab === 'medical-history' && !selectedLocalPet?.isNew" class="space-y-6">
            <!-- Header with Actions -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">Medical History</h3>
                <p class="text-sm text-gray-600 mt-1">Complete medical records, vaccinations, and appointment history</p>
              </div>
              <div class="flex items-center gap-2">
                <!-- View Vaccination Card Button -->
                <button 
                  @click="openVaccinationCardModal"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <ShieldIcon class="w-4 h-4" />
                  View Vaccination Card
                </button>
                <button 
                  @click="addNewRecord"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
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
              <!-- Service Category Filters -->
              <div class="w-full border-t border-gray-200 pt-3 mt-2">
                <div class="text-xs font-medium text-gray-600 mb-2">Service Categories:</div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="category in categories"
                    :key="category.id"
                    @click="setHistoryFilter(category.id)"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                      historyFilter === category.id
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                    ]"
                    :title="category.description"
                  >
                    <div class="w-3 h-3 rounded-full" :class="{
                      'bg-blue-500': category.id === 'telehealth5192',
                      'bg-green-500': category.id === 'elective3401',
                      'bg-orange-500': category.id === 'veterinary8515',
                      'bg-red-500': category.id === 'walk-in8438',
                      'bg-purple-500': !['telehealth5192', 'elective3401', 'veterinary8515', 'walk-in8438'].includes(category.id)
                    }"></div>
                    {{ category.name }}
                  </button>
                </div>
              </div>
              
              <button
                @click="setHistoryFilter('completed')"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  historyFilter === 'completed'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Completed Appointments
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
                    <div class="text-lg font-semibold text-blue-600">{{ petAppointments.length }}</div>
                    <div class="text-xs text-gray-500">Total Appointments</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-semibold text-green-600">{{ petAppointments.filter(a => a.status === 'completed').length }}</div>
                    <div class="text-xs text-gray-500">Completed Appointments</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-semibold text-purple-600">{{ categories.length }}</div>
                    <div class="text-xs text-gray-500">Service Categories</div>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  <span v-if="historyFilter !== 'all'">Filtered by: {{ 
                    historyFilter === 'completed' ? 'Completed Appointments' :
                    categories.find(cat => cat.id === historyFilter)?.name || 'Unknown Category'
                  }}</span>
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
                    :is="historyFilter === 'vaccinations' ? ShieldIcon :
                         historyFilter === 'telehealth' ? ActivityIcon :
                         historyFilter === 'treatments' ? ActivityIcon : ActivityIcon"
                    class="w-8 h-8 text-gray-400"
                  />
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ historyFilter === 'all' ? 'No appointments yet' :
                     historyFilter === 'completed' ? 'No completed appointments found' :
                     categories.find(cat => cat.id === historyFilter) ? `No ${categories.find(cat => cat.id === historyFilter).name} appointments found` :
                     'No appointments found' }}
                </h3>
                <p class="text-gray-500 max-w-md mx-auto">
                  {{ historyFilter === 'all' ? 'Appointments will appear here once they are scheduled and completed.' :
                     historyFilter === 'completed' ? 'Completed appointments with detailed notes will appear here once your veterinarian completes them.' :
                     categories.find(cat => cat.id === historyFilter) ? `${categories.find(cat => cat.id === historyFilter).name} appointments will appear here once they are scheduled and completed.` :
                     'Appointments will appear here once they are scheduled.' }}
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
                          <!-- Completion Notes Indicator -->
                          <span v-if="e.status === 'completed' && e.completionData" class="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            📝 Notes
                          </span>
                        </div>
                        <div class="text-xs text-gray-400">{{ formatDate(e.date, 'PPpp') }}</div>
                      </div>
                      
                      <h4 class="font-medium text-gray-900 mb-1">{{ e.title }}</h4>
                      <div v-if="e.subtitle" class="text-sm text-gray-600 mb-2">{{ e.subtitle }}</div>
                      <div v-if="e.details" class="text-sm text-gray-500 bg-gray-50 rounded p-2">{{ e.details }}</div>
                      
                      <!-- Completion Summary for Completed Appointments -->
                      <div v-if="e.status === 'completed' && e.completionData" class="mt-3 pt-3 border-t border-gray-100">
                        <div class="flex items-center gap-2 mb-3">
                          <div class="w-2 h-2 rounded-full bg-green-500"></div>
                          <span class="text-sm font-medium text-gray-700">Completion Summary</span>
                        </div>
                        
                        <!-- Services Summary -->
                        <div v-if="e.completionData.services && e.completionData.services.length > 0" class="mb-3">
                          <div class="text-xs font-medium text-gray-600 mb-2">Services Completed:</div>
                          <div class="space-y-2">
                            <div v-for="(service, index) in e.completionData.services" :key="index" class="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-blue-800">{{ service.name || `Service ${index + 1}` }}</span>
                                <span class="text-xs text-blue-600 capitalize">{{ service.status?.replace('_', ' ') || 'completed' }}</span>
                              </div>
                              <div v-if="service.duration" class="text-xs text-blue-600 mb-1">Duration: {{ service.duration }} minutes</div>
                              <div v-if="service.notes" class="text-sm text-blue-700 bg-white rounded p-2 border border-blue-200">
                                {{ service.notes }}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Pet Health Assessment -->
                        <div v-if="e.completionData.pets && e.completionData.pets.length > 0" class="mb-3">
                          <div class="text-xs font-medium text-gray-600 mb-2">Health Assessment:</div>
                          <div class="space-y-2">
                            <div v-for="(pet, index) in e.completionData.pets" :key="index" class="bg-green-50 rounded-lg p-3 border border-green-100">
                              <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-green-800">{{ pet.name || `Pet ${index + 1}` }}</span>
                                <span class="text-xs text-green-600 capitalize">{{ pet.overallHealth || 'assessed' }}</span>
                              </div>
                              <div v-if="pet.weight" class="text-xs text-green-600 mb-1">Weight: {{ pet.weight }} kg</div>
                              <div v-if="pet.healthNotes" class="text-sm text-green-700 bg-white rounded p-2 border border-green-200">
                                {{ pet.healthNotes }}
                              </div>
                              <div v-if="pet.followUpRequired" class="mt-2">
                                <div class="flex items-center gap-2">
                                  <span class="text-xs font-medium text-orange-600">Follow-up Required:</span>
                                  <span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Yes</span>
                                </div>
                                <div v-if="pet.followUpNotes" class="text-sm text-orange-700 bg-orange-50 rounded p-2 mt-1 border border-orange-200">
                                  {{ pet.followUpNotes }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- General Notes -->
                        <div v-if="e.completionData.generalNotes" class="space-y-3">
                          <div v-if="e.completionData.generalNotes.treatmentSummary" class="bg-purple-50 rounded-lg p-3 border border-purple-100">
                            <div class="text-xs font-medium text-purple-800 mb-1">Treatment Summary:</div>
                            <div class="text-sm text-purple-700">{{ e.completionData.generalNotes.treatmentSummary }}</div>
                          </div>
                          
                          <div v-if="e.completionData.generalNotes.ownerInstructions" class="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                            <div class="text-xs font-medium text-indigo-800 mb-1">Owner Instructions:</div>
                            <div class="text-sm text-indigo-700">{{ e.completionData.generalNotes.ownerInstructions }}</div>
                          </div>
                          
                          <div v-if="e.completionData.generalNotes.nextSteps" class="bg-amber-50 rounded-lg p-3 border border-amber-100">
                            <div class="text-xs font-medium text-amber-800 mb-1">Next Steps:</div>
                            <div class="text-sm text-amber-700">{{ e.completionData.generalNotes.nextSteps }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input for pet photo -->
    <input type="file" ref="photoInput" @change="handlePetPhotoSelect" accept="image/*" class="hidden" />

    <!-- Vaccination Card Modal -->
    <div v-if="showVaccinationCardModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="print-header bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 class="text-2xl font-bold">Vaccination Card</h2>
            </div>
            <button 
              @click="showVaccinationCardModal = false"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p class="text-blue-100 mt-2">Official Pet Health Record</p>
        </div>

        <!-- Modal Content -->
        <div id="vaccination-card-content" class="p-6">
          <!-- Pet Information Section -->
          <div class="pet-info bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-center gap-4">
                <img 
                  :src="selectedLocalPet?.photoURL || '/placeholder.svg?height=80&width=80'" 
                  :alt="selectedLocalPet?.name"
                  class="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                >
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">{{ selectedLocalPet?.name }}</h3>
                  <p class="text-gray-600">{{ selectedLocalPet?.species }} • {{ selectedLocalPet?.breed }}</p>
                  <p class="text-sm text-gray-500">{{ selectedLocalPet?.ageYears }}y {{ selectedLocalPet?.ageMonths }}m • {{ selectedLocalPet?.gender }}</p>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-500">Owner:</span>
                  <span class="font-medium">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Contact:</span>
                  <span class="font-medium">{{ authStore.user?.phone || authStore.user?.email || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Generated on:</span>
                  <span class="font-medium">{{ formatDate(new Date(), 'MMM dd, yyyy') }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Vaccination Records Section -->
          <div v-if="vaccinationRecords.length > 0" class="space-y-4">
            <h4 class="text-xl font-semibold text-gray-900 mb-4">Vaccination History</h4>
            
            <div class="space-y-4">
              <div 
                v-for="(record, index) in sortedVaccinationRecords" 
                :key="record.id || index"
                class="vaccination-record border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h5 class="font-medium text-gray-900">{{ record.vaccineName || 'Vaccination' }}</h5>
                    <p class="text-sm text-gray-500">{{ record.vaccineType || 'Standard vaccine' }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Date Administered</div>
                    <div class="font-medium text-gray-900">{{ formatDate(record.date, 'MMM dd, yyyy') }}</div>
                  </div>
                </div>
                
                <div class="text-sm">
                  <div>
                    <span class="text-gray-500">Processing Time:</span>
                    <span class="ml-2 font-medium">{{ record.processingTime || 'N/A' }}</span>
                  </div>
                </div>
                
                <div v-if="record.notes" class="mt-3 pt-3 border-t border-gray-100">
                  <span class="text-gray-500">Notes:</span>
                  <span class="ml-2 text-gray-900">{{ record.notes }}</span>
                </div>
                
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-500">Administered by:</span>
                    <span class="font-medium">{{ record.administeredBy || 'Veterinarian' }}</span>
                  </div>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-gray-500">Location:</span>
                    <span class="font-medium">{{ record.location || 'ProVet Clinic' }}</span>
                  </div>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-gray-500">Appointment ID:</span>
                    <span class="font-medium text-sm text-gray-600">{{ record.appointmentId || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Vaccination Records -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">No Vaccination Records</h4>
            <p class="text-gray-500 mb-6">{{ selectedLocalPet?.name }} doesn't have any vaccination records yet.</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <button 
              @click="printVaccinationCard"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print Card
            </button>
            <button 
              @click="downloadVaccinationCard"
              :disabled="isGeneratingPDF"
              :class="[
                'px-6 py-3 rounded-lg transition-colors flex items-center gap-2',
                isGeneratingPDF 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              ]"
            >
              <svg v-if="isGeneratingPDF" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ isGeneratingPDF ? 'Generating PDF...' : 'Download PDF' }}
            </button>
            <button 
              @click="showVaccinationCardModal = false"
              class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay loader -->
    <LoadingSpinner v-if="isSavingChanges || isDeleting" isOverlay :text="loadingText" />
  </div>
</template>
  
<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  import { 
  Camera as CameraIcon,
  Plus as PlusIcon,
  FileText as FileTextIcon,
  Activity as ActivityIcon,

  Folder as FolderIcon,
  Trash2,
  Eye as EyeIcon,
  Edit as EditIcon,
  ArrowLeft as ArrowLeftIcon,
  ChevronDown as ChevronDownIcon,
  X as XIcon,
  Shield as ShieldIcon,
  Heart as HeartIcon,
  Syringe as SyringeIcon,
} from 'lucide-vue-next';
import { usePetsStore } from '@/stores/modules/petsStore';
import { useAuthStore } from '@/stores/modules/authStore';
import { useArchivesStore } from '@/stores/modules/archivesStore';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';



// Stores
const petsStore = usePetsStore();
const authStore = useAuthStore();
const archivesStore = useArchivesStore();
const appointmentStore = useAppointmentStore();

// Emit events
const emit = defineEmits(['pet-added', 'pet-updated', 'pet-deleted', 'pets-changed']);

// State
const selectedPetId = ref(null);
const selectedPetTab = ref('basic-details');
const photoInput = ref(null);
const editablePet = ref({});
const showDeleteModal = ref(false);
const isLoading = ref(false);
const initialLoading = ref(true);
const isSavingChanges = ref(false);
const isDeleting = ref(false);
const localPets = ref([]);
const pendingChanges = ref(false);
const deletedPetIds = ref([]);
const petToDelete = ref(null);
const viewMode = ref('view');
const originalPets = ref([]);
const tabsDropdownOpen = ref(false);
const genderDropdownOpen = ref(false);
const showVaccinationCardModal = ref(false);
const vaccinationRecords = ref([]);
const isGeneratingPDF = ref(false);

// History state
const historyLoading = ref(false);
const historyError = ref('');
const petAppointments = ref([]);
const historyFilter = ref('all');
const servicesCache = ref(new Map()); // Cache for service details
const categories = ref([]); // Available categories from categories collection
const categoryServiceIds = ref(new Map()); // Map of categoryId to service IDs

// Loading text
const loadingText = computed(() => {
  if (isDeleting.value) return 'Deleting pet...';
  if (isSavingChanges.value) return 'Saving changes...';
  return 'Loading pets data...';
});

// Gender options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

// Tabs
const petTabs = [
  { id: 'basic-details', name: 'Basic Details', icon: FileTextIcon },
  { id: 'medical-history', name: 'Medical History', icon: ActivityIcon },
];

const getCurrentTabIcon = () => {
  const currentTab = petTabs.find(tab => tab.id === selectedPetTab.value);
  return currentTab ? currentTab.icon : FileTextIcon;
};

const getCurrentTabName = () => {
  const currentTab = petTabs.find(tab => tab.id === selectedPetTab.value);
  return currentTab ? currentTab.name : 'Basic Details';
};

const toggleTabsDropdown = () => {
  tabsDropdownOpen.value = !tabsDropdownOpen.value;
};

const selectTabAndCloseDropdown = (tabId) => {
  selectedPetTab.value = tabId;
  tabsDropdownOpen.value = false;
};

const toggleGenderDropdown = () => {
  genderDropdownOpen.value = !genderDropdownOpen.value;
};

const selectGender = (gender) => {
  editablePet.value.gender = gender;
  genderDropdownOpen.value = false;
  updateLocalPet();
};

const formatGender = (gender) => {
  return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender;
};

// Computed
const storedPets = computed(() => petsStore.getPets);
const selectedLocalPet = computed(() => {
  if (!selectedPetId.value) return null;
  return localPets.value.find(p => (p.id || p.tempId) === selectedPetId.value) || null;
});
const hasUnsavedNewPet = computed(() => localPets.value.some(p => p.isNew === true));

// Fetch pets
const fetchPets = async () => {
  if (authStore.user && authStore.user.userId) {
    isLoading.value = true;
    initialLoading.value = true;
    await petsStore.fetchUserPets(authStore.user.userId);
    const userPets = storedPets.value;
    
    const petsChanged = JSON.stringify(userPets) !== JSON.stringify(localPets.value);
    localPets.value = userPets.map(p => ({ ...p }));
    originalPets.value = JSON.parse(JSON.stringify(localPets.value));
    isLoading.value = false;
    initialLoading.value = false;
    pendingChanges.value = false;
    deletedPetIds.value = [];
    if (petsChanged) emit('pets-changed', localPets.value);
  }
};

// Helpers
const formatPetAge = (pet) => {
  if (pet.ageYears && pet.ageYears > 0) {
    return `${pet.ageYears} year${pet.ageYears > 1 ? 's' : ''}`;
  } else if (pet.ageMonths && pet.ageMonths > 0) {
    return `${pet.ageMonths} month${pet.ageMonths > 1 ? 's' : ''}`;
  } else if (pet.ageWeeks && pet.ageWeeks > 0) {
    return `${pet.ageWeeks} week${pet.ageWeeks > 1 ? 's' : ''}`;
  }
  return 'Age not specified';
};

const getDisplayName = () => {
  return selectedLocalPet.value?.name || 'Unnamed Pet';
};

const getDisplayDetails = () => {
  const pet = selectedLocalPet.value;
  if (!pet) return '';
  
  const details = [];
  if (pet.species) details.push(pet.species);
  if (pet.breed) details.push(pet.breed);
  if (pet.ageYears || pet.ageMonths || pet.ageWeeks) details.push(formatPetAge(pet));
  
  return details.length > 0 ? details.join(' • ') : 'No details available';
};

const formatPetDetails = (pet) => {
  if (!pet) return '';
  const breed = pet.breed ? pet.breed : 'Breed not specified';
  const age = formatPetAge(pet);
  return [breed, age].filter(Boolean).join(' • ');
};

// Bento helpers
const getBentoCardClasses = (index) => '';
const getBentoAccent = (index) => {
  const accents = [
    'bg-gradient-to-br from-blue-50 to-cyan-50',
    'bg-gradient-to-br from-purple-50 to-pink-50',
    'bg-gradient-to-br from-emerald-50 to-teal-50',
    'bg-gradient-to-br from-amber-50 to-orange-50',
    'bg-gradient-to-br from-slate-50 to-gray-50'
  ];
  return accents[index % accents.length];
};

const getCardStripe = (index) => {
  const colors = [
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-green-500 to-green-600',
    'bg-gradient-to-r from-purple-500 to-purple-600',
    'bg-gradient-to-r from-orange-500 to-orange-600',
    'bg-gradient-to-r from-red-500 to-red-600',
    'bg-gradient-to-r from-indigo-500 to-indigo-600'
  ];
  return colors[index % colors.length];
};

// Local updates
const updateLocalPet = () => {
  if (!selectedPetId.value) return;
  const idx = localPets.value.findIndex(p => (p.id || p.tempId) === selectedPetId.value);
  if (idx !== -1) {
    localPets.value[idx] = { ...localPets.value[idx], ...editablePet.value, changed: true };
    pendingChanges.value = true;
  }
};

// Actions
const viewPet = (pet) => {
  selectedPetId.value = pet.id || pet.tempId;
  selectedPetTab.value = 'basic-details';
  viewMode.value = 'view';
  tabsDropdownOpen.value = false;
  genderDropdownOpen.value = false;
  if (selectedLocalPet.value) editablePet.value = { ...selectedLocalPet.value };
};

const editPet = (pet) => {
  selectedPetId.value = pet.id || pet.tempId;
  viewMode.value = 'edit';
  tabsDropdownOpen.value = false;
  genderDropdownOpen.value = false;
  if (selectedLocalPet.value) editablePet.value = { ...selectedLocalPet.value };
};

const addNewPet = () => {
  if (hasUnsavedNewPet.value) return;
  const tempId = `temp-${Date.now()}`;
  const newPet = { tempId, name: 'New Pet', species: '', breed: '', ageYears: 0, ageMonths: 0, ageWeeks: 0, weight: 0, gender: '', photoURL: '', isNew: true };
  localPets.value.push(newPet);
  pendingChanges.value = true;
  selectedPetId.value = tempId;
  editablePet.value = { ...newPet };
  viewMode.value = 'edit';
};

const backToList = () => {
  if (selectedLocalPet.value && selectedLocalPet.value.isNew) {
    localPets.value = localPets.value.filter(p => (p.id || p.tempId) !== selectedLocalPet.value.tempId);
    pendingChanges.value = true;
  } else if (selectedLocalPet.value && selectedLocalPet.value.changed) {
    const original = originalPets.value.find(p => p.id === selectedLocalPet.value.id);
    if (original) {
      const index = localPets.value.findIndex(p => p.id === selectedLocalPet.value.id);
      if (index !== -1) {
        localPets.value[index] = { ...original };
        delete localPets.value[index].changed;
      }
    }
  }
  selectedPetId.value = null;
  viewMode.value = 'edit';
  tabsDropdownOpen.value = false;
  genderDropdownOpen.value = false;
};

const confirmDeletePet = (pet) => { petToDelete.value = pet; showDeleteModal.value = true; };
const deletePet = async () => {
  if (!petToDelete.value) return;
  try {
    isDeleting.value = true;
    if (petToDelete.value.id) await petsStore.deletePet(authStore.user.userId, petToDelete.value.id);
    localPets.value = localPets.value.filter(p => (p.id || p.tempId) !== (petToDelete.value.id || petToDelete.value.tempId));
    pendingChanges.value = true;
    showDeleteModal.value = false;
    if (selectedPetId.value === (petToDelete.value.id || petToDelete.value.tempId)) selectedPetId.value = null;
    petToDelete.value = null;
    await fetchPets();
  } catch (e) {
    console.error('Error deleting pet:', e);
  } finally {
    isDeleting.value = false;
  }
};

const triggerPetPhotoUpload = () => { photoInput.value?.click(); };
const handlePetPhotoSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => { if (selectedLocalPet.value) { editablePet.value.photoFile = file; editablePet.value.photoURL = e.target.result; updateLocalPet(); } };
  reader.readAsDataURL(file);
};

// History filter method
const setHistoryFilter = (filter) => {
  historyFilter.value = filter;
};

// Function to populate categories and their services from the collections
const populateCategoriesAndServices = async () => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    // First, fetch all categories
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('archived', '==', false) // Only non-archived categories
    );
    
    const categoriesSnapshot = await getDocs(categoriesQuery);
    const categoriesData = [];
    
    // For each category, fetch its services
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryData = categoryDoc.data();
      const categoryId = categoryDoc.id;
      
      // Fetch services for this category
      const servicesQuery = query(
        collection(db, 'services'),
        where('categoryId', '==', categoryId)
      );
      
      const servicesSnapshot = await getDocs(servicesQuery);
      const serviceIds = [];
      
      servicesSnapshot.forEach((serviceDoc) => {
        const serviceData = serviceDoc.data();
        serviceIds.push(serviceDoc.id);
        // Cache the service data
        servicesCache.value.set(serviceDoc.id, serviceData);
      });
      
      // Store category and its services
      categoriesData.push({
        id: categoryId,
        name: categoryData.name,
        description: categoryData.description,
        coverPhoto: categoryData.coverPhoto,
        serviceIds: serviceIds
      });
      
      // Map category to service IDs
      categoryServiceIds.value.set(categoryId, serviceIds);
    }
    
    // Update the reactive categories
    categories.value = categoriesData;
    
    console.log('Populated categories and services:', categoriesData);
    console.log('Category service mapping:', Object.fromEntries(categoryServiceIds.value));
    
  } catch (error) {
    console.error('Error fetching categories and services:', error);
    // Fallback to basic categories
    categories.value = [
      { id: 'telehealth5192', name: 'Telehealth', description: 'Remote consultations and services', serviceIds: ['video9437'] },
      { id: 'elective3401', name: 'Elective Veterinary Services', description: 'Preventive Care Planned procedures and care', serviceIds: [] },
      { id: 'veterinary8515', name: 'Veterinary Services', description: 'General veterinary care', serviceIds: [] },
      { id: 'walk-in8438', name: 'Walk-in Services', description: 'Immediate care services', serviceIds: [] }
    ];
  }
};

// Helper function to check if a service is telehealth based on categoryId
const isServiceTelehealth = async (serviceId) => {
  if (!serviceId) return false;
  
  // Check cache first
  if (servicesCache.value.has(serviceId)) {
    const service = servicesCache.value.get(serviceId);
    return service.categoryId === 'telehealth5192';
  }
  
  try {
    // Fetch service details from Firestore
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');
    
    const serviceDoc = await getDoc(doc(db, 'services', serviceId));
    if (serviceDoc.exists()) {
      const serviceData = serviceDoc.data();
      // Cache the service data
      servicesCache.value.set(serviceId, serviceData);
      return serviceData.categoryId === 'telehealth5192';
    }
  } catch (error) {
    console.error('Error fetching service details:', error);
  }
  
  return false;
};

// Unified history: fetch pet appointments
const fetchPetAppointments = async () => {
  if (!selectedLocalPet.value || !authStore.user?.userId) return;
  try {
    historyLoading.value = true;
    historyError.value = '';
    const userAppointments = await appointmentStore.fetchAppointmentsByUserId(authStore.user.userId);
    const petId = selectedLocalPet.value.id;
    petAppointments.value = (userAppointments || []).filter(a => a && ((a.petId && a.petId === petId) || (Array.isArray(a.petIds) && a.petIds.includes(petId))));
  } catch (e) {
    console.error('Failed fetching pet appointments:', e);
    historyError.value = 'Failed to load pet appointment history.';
  } finally {
    historyLoading.value = false;
  }
};

// Build timeline
const timelineEntries = computed(() => {
  if (!selectedLocalPet.value) return [];
  const entries = [];
  const toDateFromDateAndTime = (dateVal, timeRange) => {
    try {
      const base = new Date(dateVal);
      if (!timeRange) return base;
      const m = String(timeRange).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!m) return base;
      let hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      const ap = m[3].toUpperCase();
      if (ap === 'PM' && hh !== 12) hh += 12;
      if (ap === 'AM' && hh === 12) hh = 0;
      const d = new Date(base);
      d.setHours(hh, mm, 0, 0);
      return d;
    } catch {
      return new Date(dateVal);
    }
  };

  // Add appointments (including telehealth)
  for (const a of petAppointments.value) {
    const when = toDateFromDateAndTime(a.date, a.time);
    
    // Check if this appointment belongs to a specific category based on its services
    // We'll determine the category by checking which services the appointment uses
    let appointmentCategory = null;
    
    if (a.services && Array.isArray(a.services) && a.services.length > 0) {
      // Find which category this appointment's services belong to
      for (const [categoryId, serviceIds] of categoryServiceIds.value.entries()) {
        if (a.services.some(serviceId => serviceIds.includes(serviceId))) {
          appointmentCategory = categoryId;
          break;
        }
      }
    }
    
    // For backward compatibility, also check traditional telehealth indicators
    const isTele = (
      String(a.type || '').toLowerCase() === 'online' || 
      a.isTelehealth === true ||
      appointmentCategory === 'telehealth5192' ||
      // Check service names for telehealth indicators
      (a.serviceNames && Array.isArray(a.serviceNames) && 
       a.serviceNames.some(name => name.toLowerCase().includes('video') || name.toLowerCase().includes('telehealth')))
    );
    
    // Apply filter based on category
    if (historyFilter.value !== 'all' && historyFilter.value !== 'vaccinations' && historyFilter.value !== 'completed') {
      // Category-based filtering
      if (historyFilter.value !== appointmentCategory) continue;
    }
    
    // Special filters
    if (historyFilter.value === 'vaccinations') continue; // Vaccinations are handled separately
    if (historyFilter.value === 'completed' && a.status !== 'completed') continue;
    
    // Get category name for display
    const categoryName = appointmentCategory ? 
      categories.value.find(cat => cat.id === appointmentCategory)?.name || 'Appointment' : 
      (isTele ? 'Telehealth' : 'Appointment');
    
    entries.push({
      kind: categoryName,
      date: when,
      title: (Array.isArray(a.serviceNames) && a.serviceNames.length ? a.serviceNames.join(', ') : 'Veterinary appointment'),
      subtitle: a.doctorName || a.vetName || '',
      status: (a.status || '').toLowerCase(),
      details: a.notes || '',
      icon: isTele ? ActivityIcon : FileTextIcon,
      color: isTele ? 'text-indigo-600' : 'text-blue-600',
      completionData: a.completionData || null, // Include completion data
      serviceIds: a.services || [], // Include service IDs for better categorization
      categoryId: appointmentCategory, // Store the category ID
      isTelehealth: isTele // Store the telehealth flag
    });
  }

  // Add medical history treatments if viewing all records
  if (historyFilter.value === 'all') {
    const mh = selectedLocalPet.value.medicalHistory || [];
    console.log('Medical history data:', mh); // Debug log
    for (const r of mh) {
      const when = r.date ? new Date(r.date) : new Date();
      entries.push({ 
        kind: 'Treatment', 
        date: when, 
        title: r.type || 'Treatment/Check-up', 
        subtitle: r.vet || '', 
        status: '', 
        details: r.description || '', 
        icon: ActivityIcon, 
        color: 'text-emerald-600' 
      });
    }
    
    // Add vaccinations if viewing all records
    const vacs = selectedLocalPet.value.vaccinations || [];
    console.log('Vaccinations data:', vacs); // Debug log
    for (const v of vacs) {
      const when = v.date ? new Date(v.date) : new Date();
      entries.push({ 
        kind: 'Vaccination', 
        date: when, 
        title: v.name || 'Vaccination', 
        subtitle: v.completed ? 'Completed' : 'Scheduled', 
        status: v.completed ? 'completed' : 'pending', 
        details: '', 
        icon: SyringeIcon, 
        color: 'text-teal-600' 
      });
    }
  }

  // Debug log
  console.log('Total timeline entries:', entries.length);
  console.log('Selected pet data:', selectedLocalPet.value);

  entries.sort((a, b) => a.date - b.date);
  return entries;
});

// Watchers
watch([selectedLocalPet, selectedPetTab, viewMode], ([pet, tab, mode]) => {
  if (pet && tab === 'medical-history' && mode === 'view') {
    historyFilter.value = 'all'; // Reset filter when switching pets or entering medical history tab
    fetchPetAppointments();
  }
});

// Save operations (kept as original logic)
const saveAllChanges = async () => {
  if (!authStore.user || !authStore.user.userId) return false;
  if (!pendingChanges.value && deletedPetIds.value.length === 0) return true;
  isLoading.value = true;
  isSavingChanges.value = true;
  const userId = authStore.user.userId;
  let success = true;
  try {
    for (const petId of deletedPetIds.value) {
      const ok = await petsStore.deletePet(userId, petId);
      if (!ok) success = false;
    }
    for (const pet of localPets.value) {
      if (pet.id && !pet.changed && !pet.isNew) continue;
      const petData = { ...pet };
      delete petData.tempId; delete petData.isNew; delete petData.changed; if (petData.photoFile) delete petData.photoFile;
      if (!petData.name || petData.name.trim() === '') petData.name = 'Unnamed Pet';
      if (!petData.species || petData.species.trim() === '') petData.species = 'Unspecified';
      if (!petData.breed || petData.breed.trim() === '') petData.breed = 'Unspecified';
      if (!petData.gender || petData.gender.trim() === '') petData.gender = 'Unspecified';
      if (!pet.id) {
        const added = await petsStore.addPet(userId, petData); if (!added) success = false;
      } else if (pet.changed) {
        const ok = await petsStore.updatePet(userId, pet.id, petData); if (!ok) success = false;
      }
    }
    if (success) { await fetchPets(); pendingChanges.value = false; deletedPetIds.value = []; }
    return success;
  } catch (e) {
    console.error('Error saving pet changes:', e);
    return false;
  } finally {
    isLoading.value = false; isSavingChanges.value = false;
  }
};

const hasPendingChanges = () => pendingChanges.value || deletedPetIds.value.length > 0;

// Lifecycle
onMounted(() => { 
  fetchPets(); 
  populateCategoriesAndServices(); // Populate categories and services
  document.addEventListener('click', handleClickOutside); 
});
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside); });
const handleClickOutside = (event) => {
  if (tabsDropdownOpen.value && !event.target.closest('.tabs-dropdown')) tabsDropdownOpen.value = false;
  if (genderDropdownOpen.value && !event.target.closest('.gender-dropdown')) genderDropdownOpen.value = false;
};





// Keep editablePet in sync
watch(selectedLocalPet, (newPet) => { if (newPet) editablePet.value = { ...newPet }; });

// Expose
defineExpose({ saveAllChanges, hasPendingChanges, fetchPets });

// Make format function available to template
const formatDate = (date, formatString) => format(date, formatString);

// Add new record function
const addNewRecord = () => {
  // This function can be implemented to add new medical records
  console.log('Add new record clicked');
};

// Vaccination card modal functions
const openVaccinationCardModal = () => {
  if (!selectedLocalPet.value?.id) {
    console.error('No pet selected for vaccination card');
    return;
  }
  
  // Load vaccination records for the selected pet
  loadVaccinationRecords();
  showVaccinationCardModal.value = true;
};

const loadVaccinationRecords = async () => {
  try {
    if (!selectedLocalPet.value?.id || !authStore.user?.userId) {
      console.error('No pet selected or user not authenticated');
      vaccinationRecords.value = [];
      return;
    }

    // Import Firebase functions
    const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('@shared/firebase');

    const records = [];
    
    // Fetch appointments for this pet that are completed
    const appointmentsRef = collection(db, 'appointments');
    const appointmentsQuery = query(
      appointmentsRef,
      where('petIds', 'array-contains', selectedLocalPet.value.id),
      where('status', '==', 'completed')
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const appointmentData = appointmentDoc.data();
      
      // Check if this appointment has vaccination services
      if (appointmentData.services && appointmentData.services.length > 0) {
        // Fetch service details to check if they are vaccinations
        for (const serviceId of appointmentData.services) {
          try {
            const serviceDoc = await getDoc(doc(db, 'services', serviceId));
            if (serviceDoc.exists()) {
              const serviceData = serviceDoc.data();
              
              // Check if this service is a vaccination
              if (serviceData.isVaccination === true) {
                // Create vaccination record from appointment data
                const vaccinationRecord = {
                  id: `${appointmentDoc.id}-${serviceId}`,
                  vaccineName: serviceData.name || 'Vaccination',
                  vaccineType: serviceData.classification || 'Standard Vaccine',
                  date: appointmentData.date?.toDate?.() || new Date(appointmentData.date),
                  notes: appointmentData.completionData?.services?.find(s => s.name === serviceData.name)?.notes || 
                         appointmentData.completionData?.generalNotes?.treatmentSummary || 
                         'Vaccination completed successfully',
                  administeredBy: appointmentData.doctorName || 'Veterinarian',
                  location: appointmentData.location || 'ProVet Clinic',
                  appointmentId: appointmentDoc.id,
                  serviceId: serviceId,
                  processingTime: serviceData.processingTime || 'N/A'
                };
                
                records.push(vaccinationRecord);
              }
            }
          } catch (serviceError) {
            console.error(`Error fetching service ${serviceId}:`, serviceError);
          }
        }
      }
    }
    
    // Sort vaccinations by date (newest first)
    vaccinationRecords.value = records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('Loaded vaccination records from appointments:', vaccinationRecords.value);
    
  } catch (error) {
    console.error('Error loading vaccination records:', error);
    vaccinationRecords.value = [];
  }
};

const sortedVaccinationRecords = computed(() => {
  return [...vaccinationRecords.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const getVaccinationStatusClass = (record) => {
  if (record.completed) return 'bg-green-100 text-green-800';
  return 'bg-blue-100 text-blue-800';
};

const getVaccinationStatusText = (record) => {
  if (record.completed) return 'Completed';
  return 'Scheduled';
};

const printVaccinationCard = () => {
  // Create a print-friendly version
  const printWindow = window.open('', '_blank');
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create clean, print-optimized HTML
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vaccination Card - ${selectedLocalPet.value?.name || 'Pet'}</title>
        <style>
          @page {
            size: A4;
            margin: 0.75in;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #1f2937;
            line-height: 1.6;
          }
          
          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
          }
          
          .pet-section {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          
          .pet-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 25px;
            align-items: center;
          }
          
          .pet-photo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #e2e8f0;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          .pet-details h3 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .pet-details p {
            margin: 5px 0;
            font-size: 16px;
            color: #475569;
          }
          
          .owner-info {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .owner-info h4 {
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 15px;
          }
          
          .info-label {
            font-weight: 600;
            color: #6b7280;
            min-width: 120px;
          }
          
          .info-value {
            font-weight: 500;
            color: #1f2937;
          }
          
          .vaccinations-section {
            margin-top: 30px;
          }
          
          .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3b82f6;
          }
          
          .vaccination-record {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            page-break-inside: avoid;
          }
          
          .record-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .vaccine-info h5 {
            margin: 0 0 5px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .vaccine-info p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
          }
          
          .vaccine-date {
            text-align: right;
          }
          
          .date-label {
            font-size: 12px;
            color: #94a3b8;
            margin-bottom: 5px;
            display: block;
          }
          
          .date-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .record-details {
            font-size: 14px;
            color: #475569;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-weight: 600;
            color: #6b7280;
            min-width: 140px;
          }
          
          .detail-value {
            font-weight: 500;
            color: #1f2937;
          }
          
          .notes {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #f1f5f9;
          }
          
          .notes .detail-label {
            display: block;
            margin-bottom: 5px;
          }
          
          .notes .detail-value {
            display: block;
            font-style: italic;
            color: #374151;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          
          @media print {
            body { margin: 0; }
            .header { background: #1e40af !important; }
            .pet-section { background: #f8fafc !important; }
            .vaccination-record { background: white !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🐾 Vaccination Card</h1>
          <p>Official Pet Health Record</p>
        </div>
        
        <div class="pet-section">
          <div class="pet-grid">
            <img 
              src="${selectedLocalPet.value?.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50\' y=\'50\' font-family=\'Arial\' font-size=\'40\' fill=\'%239ca3af\' text-anchor=\'middle\' dy=\'.3em\'%3E🐾%3C/text%3E%3C/svg%3E'}" 
              alt="${selectedLocalPet.value?.name || 'Pet'}"
              class="pet-photo"
            >
            <div class="pet-details">
              <h3>${selectedLocalPet.value?.name || 'Pet Name'}</h3>
              <p><strong>Species:</strong> ${selectedLocalPet.value?.species || 'Not specified'}</p>
              <p><strong>Breed:</strong> ${selectedLocalPet.value?.breed || 'Not specified'}</p>
              <p><strong>Age:</strong> ${selectedLocalPet.value?.ageYears || 0}y ${selectedLocalPet.value?.ageMonths || 0}m</p>
              <p><strong>Gender:</strong> ${selectedLocalPet.value?.gender || 'Not specified'}</p>
            </div>
          </div>
          
          <div class="owner-info">
            <h4>Owner Information</h4>
            <div class="info-row">
              <span class="info-label">Owner Name:</span>
              <span class="info-value">${authStore.user?.firstName || ''} ${authStore.user?.lastName || ''}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contact:</span>
              <span class="info-value">${authStore.user?.phone || authStore.user?.email || 'Not provided'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Generated On:</span>
              <span class="info-value">${currentDate}</span>
            </div>
          </div>
        </div>
        
        <div class="vaccinations-section">
          <h2 class="section-title">📋 Vaccination History</h2>
          
          ${vaccinationRecords.value.length > 0 ? 
            vaccinationRecords.value.map(record => `
              <div class="vaccination-record">
                <div class="record-header">
                  <div class="vaccine-info">
                    <h5>${record.vaccineName || 'Vaccination'}</h5>
                    <p>${record.vaccineType || 'Standard Vaccine'}</p>
                  </div>
                  <div class="vaccine-date">
                    <span class="date-label">Date Administered</span>
                    <span class="date-value">${formatDate(record.date, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                
                <div class="record-details">
                  <div class="detail-row">
                    <span class="detail-label">Processing Time:</span>
                    <span class="detail-value">${record.processingTime || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Administered By:</span>
                    <span class="detail-value">${record.administeredBy || 'Veterinarian'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${record.location || 'ProVet Clinic'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Appointment ID:</span>
                    <span class="detail-value">${record.appointmentId || 'N/A'}</span>
                  </div>
                  ${record.notes ? `
                    <div class="notes">
                      <span class="detail-label">Notes:</span>
                      <span class="detail-value">${record.notes}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('') : 
            `<div class="vaccination-record">
              <div class="record-header">
                <div class="vaccine-info">
                  <h5>No Vaccination Records</h5>
                  <p>${selectedLocalPet.value?.name || 'This pet'} doesn't have any vaccination records yet.</p>
                </div>
              </div>
            </div>`
          }
        </div>
        
        <div class="footer">
          <p>Generated by ProVet Veterinary Clinic • ${currentDate}</p>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(printHTML);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);
};

const downloadVaccinationCard = async () => {
  try {
    isGeneratingPDF.value = true;
    
    // Import html2pdf library dynamically
    const html2pdf = await import('html2pdf.js');
    
    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create clean, PDF-optimized HTML (same as print version)
    const pdfHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🐾 Vaccination Card</h1>
          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Official Pet Health Record</p>
        </div>
        
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 25px; align-items: center;">
            <img 
              src="${selectedLocalPet.value?.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50\' y=\'50\' font-family=\'Arial\' font-size=\'40\' fill=\'%239ca3af\' text-anchor=\'middle\' dy=\'.3em\'%3E🐾%3C/text%3E%3C/svg%3E'}" 
              alt="${selectedLocalPet.value?.name || 'Pet'}"
              style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #e2e8f0;"
            >
            <div>
              <h3 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #1e293b;">${selectedLocalPet.value?.name || 'Pet Name'}</h3>
              <p style="margin: 5px 0; font-size: 16px; color: #475569;"><strong>Species:</strong> ${selectedLocalPet.value?.species || 'Not specified'}</p>
              <p style="margin: 5px 0; font-size: 16px; color: #475569;"><strong>Breed:</strong> ${selectedLocalPet.value?.breed || 'Not specified'}</p>
              <p style="margin: 5px 0; font-size: 16px; color: #475569;"><strong>Age:</strong> ${selectedLocalPet.value?.ageYears || 0}y ${selectedLocalPet.value?.ageMonths || 0}m</p>
              <p style="margin: 5px 0; font-size: 16px; color: #475569;"><strong>Gender:</strong> ${selectedLocalPet.value?.gender || 'Not specified'}</p>
            </div>
          </div>
          
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px;">
            <h4 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #374151; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Owner Information</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px;">
              <span style="font-weight: 600; color: #6b7280; min-width: 120px;">Owner Name:</span>
              <span style="font-weight: 500; color: #1f2937;">${authStore.user?.firstName || ''} ${authStore.user?.lastName || ''}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px;">
              <span style="font-weight: 600; color: #6b7280; min-width: 120px;">Contact:</span>
              <span style="font-weight: 500; color: #1f2937;">${authStore.user?.phone || authStore.user?.email || 'Not provided'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px;">
              <span style="font-weight: 600; color: #6b7280; min-width: 120px;">Generated On:</span>
              <span style="font-weight: 500; color: #1f2937;">${currentDate}</span>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 30px;">
          <h2 style="font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #3b82f6;">📋 Vaccination History</h2>
          
          ${vaccinationRecords.value.length > 0 ? 
            vaccinationRecords.value.map(record => `
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
                  <div>
                    <h5 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 600; color: #1e293b;">${record.vaccineName || 'Vaccination'}</h5>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">${record.vaccineType || 'Standard Vaccine'}</p>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 12px; color: #94a3b8; margin-bottom: 5px; display: block;">Date Administered</span>
                    <span style="font-size: 16px; font-weight: 600; color: #1e293b;">${formatDate(record.date, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                
                <div style="font-size: 14px; color: #475569;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #6b7280; min-width: 140px;">Processing Time:</span>
                    <span style="font-weight: 500; color: #1f2937;">${record.processingTime || 'N/A'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #6b7280; min-width: 140px;">Administered By:</span>
                    <span style="font-weight: 500; color: #1f2937;">${record.administeredBy || 'Veterinarian'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #6b7280; min-width: 140px;">Location:</span>
                    <span style="font-weight: 500; color: #1f2937;">${record.location || 'ProVet Clinic'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: #6b7280; min-width: 140px;">Appointment ID:</span>
                    <span style="font-weight: 500; color: #1f2937;">${record.appointmentId || 'N/A'}</span>
                  </div>
                  ${record.notes ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                      <span style="font-weight: 600; color: #6b7280; display: block; margin-bottom: 5px;">Notes:</span>
                      <span style="font-style: italic; color: #374151; display: block;">${record.notes}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('') : 
            `<div style="background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;">
                <div>
                  <h5 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 600; color: #1e293b;">No Vaccination Records</h5>
                  <p style="margin: 0; font-size: 14px; color: #64748b;">${selectedLocalPet.value?.name || 'This pet'} doesn't have any vaccination records yet.</p>
                </div>
              </div>
            </div>`
          }
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
          <p>Generated by ProVet Veterinary Clinic • ${currentDate}</p>
        </div>
      </div>
    `;
    
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = pdfHTML;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);
    
    // Configure PDF options
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `vaccination-card-${selectedLocalPet.value?.name || 'pet'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // Generate and download PDF
    await html2pdf.default().set(opt).from(tempContainer).save();
    
    // Clean up
    document.body.removeChild(tempContainer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF generation failed. Please try the print option instead.');
  } finally {
    isGeneratingPDF.value = false;
  }
};
</script>

<style scoped>
.overflow-x-auto { scrollbar-width: none; -ms-overflow-style: none; }
.overflow-x-auto::-webkit-scrollbar { display: none; }

/* Print styles for vaccination card */
@media print {
  /* Hide everything except the vaccination card modal */
  body * {
    visibility: hidden;
  }
  
  #vaccination-card-content,
  #vaccination-card-content * {
    visibility: visible !important;
  }
  
  /* Position the vaccination card at the top of the page */
  #vaccination-card-content {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  
  /* Ensure proper page breaks */
  .vaccination-record {
    page-break-inside: avoid;
  }
  
  /* Optimize spacing for print */
  .p-6 {
    padding: 0.5in !important;
  }
  
  /* Ensure colors print properly */
  .bg-gradient-to-r {
    background: #2563eb !important;
  }
  
  .bg-gray-50 {
    background: #f9fafb !important;
  }
  
  .text-white {
    color: black !important;
  }
  
  .text-blue-100 {
    color: #1e40af !important;
  }
  
  /* Hide action buttons in print */
  .flex.justify-center.gap-4.mt-8.pt-6.border-t.border-gray-200 {
    display: none !important;
  }
  
  /* Ensure text is readable */
  body {
    font-size: 12pt;
    line-height: 1.4;
  }
  
  /* Page setup */
  @page {
    size: A4;
    margin: 0.5in;
  }
}
</style>

