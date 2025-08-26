<template>
  <div class="min-h-screen flex flex-col bg-gray-50 -mt-4 md:mt-0">
    <div class="flex flex-col flex-1 px-0 md:px-4 pb-20 pt-14 md:pt-0 md:pb-4">
    <LoadingSpinner v-if="isLoading" isOverlay text="Loading pets data..." />

      <div v-if="!isLoading" class="grid grid-cols-1 gap-3 md:gap-4">
        <!-- Left Column -->
        <div class="flex flex-col gap-3 md:gap-4">
          <!-- List view -->
      <div v-if="!selectedPetId">
            <div class="flex items-center justify-between pb-4">
              <h2 class="text-lg font-semibold text-gray-900">My Pets</h2>
          <button
            @click.prevent="addNewPet"
            :disabled="hasUnsavedNewPet"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                  hasUnsavedNewPet ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            ]"
            type="button"
            :title="hasUnsavedNewPet ? 'Please save the current pet before adding a new one' : 'Add a new pet'"
          >
            <PlusIcon class="w-4 h-4 mr-1" />
            Add Pet
          </button>
        </div>
        
            <!-- Empty -->
        <div v-if="localPets.length === 0" class="text-center py-12">
          <p class="text-gray-500">No pets added yet. Click the + button to add a pet.</p>
        </div>
        
            <!-- Bento Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(pet, index) in localPets"
                :key="pet.id || pet.tempId"
                class="group relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur shadow-sm hover:shadow-lg transition-all"
                :class="getBentoCardClasses(index)"
              >
                <!-- Accent stripe -->
                <div class="absolute inset-x-0 top-0 h-1" :class="getCardStripe(index)"></div>

                <!-- Header with avatar -->
                <div class="p-5 pt-7">
                  <div class="flex items-start gap-4">
                    <div class="relative -mt-7 w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow">
                      <img v-if="pet.photoURL && !pet.isNew" :src="pet.photoURL" :alt="pet.name" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Ccircle cx='11' cy='4' r='2'/%3E%3Ccircle cx='18' cy='8' r='2'/%3E%3Ccircle cx='20' cy='16' r='2'/%3E%3Cpath d='M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z'/%3E%3C/g%3E%3C/svg%3E" alt="Pet icon" class="w-7 h-7" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h3 class="text-base font-semibold text-gray-900 truncate">{{ pet.isNew ? 'New Pet' : pet.name }}</h3>
                        <span v-if="pet.isNew" class="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">New</span>
                      </div>
                      <div class="mt-1 text-xs text-gray-500 line-clamp-1">{{ pet.breed || 'No breed' }} • {{ formatPetAge(pet) }}</div>
                    </div>
                    <div class="flex items-center gap-1">
                      <button v-if="!pet.isNew" @click.stop="viewPet(pet)" class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="View">
                        <EyeIcon class="w-4 h-4" />
                      </button>
                      <button @click.stop="editPet(pet)" class="p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100" title="Edit">
                        <EditIcon class="w-4 h-4" />
                      </button>
                      <button v-if="!pet.isNew" @click.stop="confirmDeletePet(pet)" class="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="Delete">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Info grid -->
                  <div class="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div class="rounded-lg border bg-white/70 p-2">
                      <div class="text-[10px] uppercase tracking-wide text-gray-400">Species</div>
                      <div class="font-medium text-gray-800">{{ pet.species || '—' }}</div>
                    </div>
                    <div class="rounded-lg border bg-white/70 p-2">
                      <div class="text-[10px] uppercase tracking-wide text-gray-400">Gender</div>
                      <div class="font-medium text-gray-800">{{ pet.gender ? formatGender(pet.gender) : '—' }}</div>
                    </div>
                    <div class="rounded-lg border bg-white/70 p-2">
                      <div class="text-[10px] uppercase tracking-wide text-gray-400">Weight</div>
                      <div class="font-medium text-gray-800">{{ pet.weight ? pet.weight + ' kg' : '—' }}</div>
                    </div>
                    <div class="rounded-lg border bg-white/70 p-2">
                      <div class="text-[10px] uppercase tracking-wide text-gray-400">Records</div>
                      <div class="font-medium text-gray-800">{{ (pet.medicalHistory?.length || 0) + (pet.vaccinations?.length || 0) }}</div>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="mt-4 flex items-center justify-between">
                    <div class="flex flex-wrap gap-1 text-[10px] text-gray-600">
                      <span class="px-2 py-0.5 rounded-full bg-gray-100">{{ pet.species || 'Species' }}</span>
                      <span class="px-2 py-0.5 rounded-full bg-gray-100">{{ pet.breed || 'Breed' }}</span>
                    </div>
                    <router-link to="/user/userappointments" class="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] hover:bg-indigo-700">Book</router-link>
                  </div>
            </div>
          </div>
        </div>
      </div>
  
          <!-- Details view -->
          <div v-else class="space-y-6">
        <div class="flex items-center mb-4">
              <button @click="backToList" type="button" class="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div class="relative group mr-4">
                <div v-if="selectedLocalPet?.photoURL && !selectedLocalPet.isNew" class="w-20 h-20 rounded-full overflow-hidden">
                  <img :src="selectedLocalPet.photoURL" :alt="selectedLocalPet.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Ccircle cx='11' cy='4' r='2'/%3E%3Ccircle cx='18' cy='8' r='2'/%3E%3Ccircle cx='20' cy='16' r='2'/%3E%3Cpath d='M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z'/%3E%3C/g%3E%3C/svg%3E" alt="Pet icon" class="w-16 h-16" />
            </div>
                <button v-if="viewMode === 'edit'" @click.prevent="triggerPetPhotoUpload" type="button" class="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
              <CameraIcon class="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900">{{ selectedLocalPet?.isNew ? 'New Pet' : getDisplayName() }}</h2>
                <p class="text-sm text-gray-500">{{ selectedLocalPet?.isNew ? 'Complete the form and save to view details' : getDisplayDetails() }}</p>
          </div>
          <div class="flex space-x-2">
            <button v-if="viewMode === 'view' && selectedPetTab === 'basic-details'" @click="editPet(selectedLocalPet)" type="button" class="p-2 text-gray-500 hover:text-gray-700" title="Edit pet">
              <EditIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        
            <!-- Tabs -->
            <div v-if="!selectedLocalPet?.isNew && viewMode === 'view'" class="border-b border-gray-200">
          <nav class="hidden md:flex -mb-px space-x-8">
                <button v-for="tab in petTabs" :key="tab.id" @click.prevent="selectedPetTab = tab.id" type="button" :class="['py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center', selectedPetTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
              <component :is="tab.icon" class="w-5 h-5 mr-2" />
              {{ tab.name }}
            </button>
          </nav>
          <div class="md:hidden relative">
                <button @click.stop="toggleTabsDropdown" type="button" class="w-full flex items-center justify-between py-3 px-4 border rounded-md">
              <div class="flex items-center">
                <component :is="getCurrentTabIcon()" class="w-5 h-5 mr-2" />
                <span>{{ getCurrentTabName() }}</span>
              </div>
              <ChevronDownIcon class="w-5 h-5" :class="{ 'transform rotate-180': tabsDropdownOpen }" />
            </button>
                <div v-show="tabsDropdownOpen" class="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg tabs-dropdown">
                  <button v-for="tab in petTabs" :key="tab.id" @click.stop="selectTabAndCloseDropdown(tab.id)" type="button" :class="['w-full text-left py-3 px-4 flex items-center', selectedPetTab === tab.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50']">
                <component :is="tab.icon" class="w-5 h-5 mr-2" />
                {{ tab.name }}
              </button>
            </div>
          </div>
        </div>
  
        <!-- Tab Content -->
        <div>
              <!-- Basic Details -->
          <div v-if="viewMode === 'edit' || (viewMode === 'view' && selectedPetTab === 'basic-details')" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
                  <input v-model="editablePet.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Species <span class="text-red-500">*</span></label>
                  <input v-model="editablePet.species" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Breed <span class="text-red-500">*</span></label>
                  <input v-model="editablePet.breed" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Age (Years, Months, Weeks)</label>
              <div class="grid grid-cols-3 gap-2">
                    <input v-model.number="editablePet.ageYears" type="number" min="0" placeholder="Years" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
                    <input v-model.number="editablePet.ageMonths" type="number" min="0" max="11" placeholder="Months" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
                    <input v-model.number="editablePet.ageWeeks" type="number" min="0" max="3" placeholder="Weeks" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input v-model.number="editablePet.weight" type="number" step="0.1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm" @input="updateLocalPet" :disabled="viewMode === 'view'" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Gender <span class="text-red-500">*</span></label>
              <div v-if="viewMode !== 'view'" class="relative">
                    <div @click="toggleGenderDropdown" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm cursor-pointer flex justify-between items-center gender-dropdown">
                  <span v-if="editablePet.gender">{{ formatGender(editablePet.gender) }}</span>
                  <span v-else class="text-gray-500">Select gender</span>
                  <ChevronDownIcon class="w-4 h-4 text-gray-500" :class="{ 'transform rotate-180': genderDropdownOpen }" />
                </div>
                    <div v-show="genderDropdownOpen" class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg gender-dropdown">
                      <div v-for="option in genderOptions" :key="option.value" @click="selectGender(option.value)" class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm gender-dropdown">{{ option.label }}</div>
                    </div>
                  </div>
                  <div v-else class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">{{ editablePet.gender ? formatGender(editablePet.gender) : 'Not specified' }}</div>
                </div>
              </div>
              
              <!-- Medical History -->
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
                        :is="historyFilter === 'vaccinations' ? SyringeIcon :
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
    

    
              <!-- Documents -->
              <div v-if="selectedPetTab === 'documents' && !selectedLocalPet?.isNew" class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Documents</h3>
              <button class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center">
                <PlusIcon class="w-4 h-4 mr-1" />
                Upload Document
              </button>
            </div>
            <div class="text-center py-8">
              <FolderIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500">No documents uploaded yet.</p>
              <p class="text-sm text-gray-400 mt-1">Documents will appear here once uploaded.</p>
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
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
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
        <div class="p-6">
          <!-- Pet Information Section -->
          <div class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
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
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
              class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
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
  { id: 'documents', name: 'Documents', icon: FolderIcon },
];

const getCurrentTabName = () => petTabs.find(t => t.id === selectedPetTab.value)?.name || 'Basic Details';
const getCurrentTabIcon = () => petTabs.find(t => t.id === selectedPetTab.value)?.icon || FileTextIcon;
const toggleTabsDropdown = () => { tabsDropdownOpen.value = !tabsDropdownOpen.value; };
const selectTabAndCloseDropdown = (tabId) => { selectedPetTab.value = tabId; tabsDropdownOpen.value = false; };

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
const formatGender = (gender) => (gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : gender);
const formatPetAge = (pet) => {
  if (!pet.ageYears && !pet.ageMonths && !pet.ageWeeks) return 'Age not specified';
  const parts = [];
  if (pet.ageYears > 0) parts.push(`${pet.ageYears} ${pet.ageYears === 1 ? 'year' : 'years'}`);
  if (pet.ageMonths > 0) parts.push(`${pet.ageMonths} ${pet.ageMonths === 1 ? 'month' : 'months'}`);
  if (pet.ageWeeks > 0) parts.push(`${pet.ageWeeks} ${pet.ageWeeks === 1 ? 'week' : 'weeks'}`);
  return parts.join(' ');
};

const getDisplayName = () => {
  if (!selectedLocalPet.value) return '';
  if (viewMode.value === 'edit' && selectedLocalPet.value.id) {
    const original = originalPets.value.find(p => p.id === selectedLocalPet.value.id);
    return original ? original.name : selectedLocalPet.value.name;
  }
  return selectedLocalPet.value.name;
};

const getDisplayDetails = () => {
  if (!selectedLocalPet.value) return '';
  if (viewMode.value === 'edit' && selectedLocalPet.value.id) {
    const original = originalPets.value.find(p => p.id === selectedLocalPet.value.id);
    return formatPetDetails(original || selectedLocalPet.value);
  }
  return formatPetDetails(selectedLocalPet.value);
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
  const stripes = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-slate-500'
  ];
  return stripes[index % stripes.length];
};

// Gender dropdown
const toggleGenderDropdown = () => { genderDropdownOpen.value = !genderDropdownOpen.value; };
const selectGender = (value) => { editablePet.value.gender = value; genderDropdownOpen.value = false; updateLocalPet(); };

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
  // Implement print functionality
  window.print();
};

const downloadVaccinationCard = () => {
  // This would integrate with a PDF generation library like jsPDF or html2pdf
  // For now, we'll just trigger the print dialog
  alert('PDF download functionality coming soon! You can use the Print button for now.');
};
</script>

<style scoped>
.overflow-x-auto { scrollbar-width: none; -ms-overflow-style: none; }
.overflow-x-auto::-webkit-scrollbar { display: none; }
</style>

