<!-- views/vet/VetClientPets.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Client Pets Management</h1>
      <p class="text-gray-500 mt-1">View and manage your clients and their pets</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-500">Loading clients and pets...</p>
    </div>
    
    <!-- No Authentication Message -->
    <div v-else-if="!authStore.user?.uid" class="text-center py-20">
      <div class="max-w-md mx-auto">
        <div class="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-8 mx-auto">
          <UserXIcon class="w-16 h-16 text-red-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-3">Authentication Required</h3>
        <p class="text-gray-500 mb-6">Please log in as a veterinarian to view your client pets.</p>
              </div>
    </div>
    
    <!-- Main Content -->
    <div v-else>
      <!-- Search and Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="relative flex-grow max-w-md">
            <input 
              v-model="searchQuery" 
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search clients or pets..."
            />
            
            <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
    </div>
    

      </div>
            
      <!-- Client Count -->
      <div class="mb-6">
        <p class="text-sm text-gray-600">
          Showing {{ filteredClients.length }} {{ filteredClients.length === 1 ? 'client' : 'clients' }}
          with {{ totalPets }} {{ totalPets === 1 ? 'pet' : 'pets' }}
        </p>
      </div>
      
        <!-- List View -->
      <div v-if="viewMode === 'list'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
                    </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                    </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pets
                    </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Visit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
                  </tr>
                </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
              <template v-for="client in filteredClients" :key="client.userId">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img 
                        :src="client.photoURL || defaultPhotoURL" 
                        :alt="`${client.firstName} ${client.lastName}`"
                        class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      >
            <div>
                        <div class="font-medium text-gray-900">{{ client.firstName }} {{ client.lastName }}</div>
                        <div class="text-sm text-gray-500">{{ client.email }}</div>
            </div>
              </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">{{ client.phone || 'No phone' }}</div>
                    <div class="text-sm text-gray-500">{{ client.address || 'No address' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <!-- Circular Pet Images -->
                      <div class="flex -space-x-3">
                        <div 
                          v-for="pet in client.pets.slice(0, 5)" 
            :key="pet.id"
                          class="relative"
          >
              <img 
                :src="pet.photoURL || defaultPetPhotoURL" 
                :alt="pet.name" 
                            class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          >
                          <!-- Pet name tooltip -->
                          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {{ pet.name }}
              </div>
            </div>
                        <!-- Show more indicator if there are more than 5 pets -->
                        <div v-if="client.pets.length > 5" class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                          +{{ client.pets.length - 5 }}
                        </div>
                      </div>
                      <span class="text-sm text-gray-600 ml-2">
                        {{ client.pets.length }} {{ client.pets.length === 1 ? 'pet' : 'pets' }}
                      </span>
                    </div>
                    <div class="mt-2 text-sm text-gray-500">
                      {{ formatPetNames(client.pets) }}
                    </div>
                    <div class="mt-1 text-xs text-gray-400">
                      {{ client.pets.length }} {{ client.pets.length === 1 ? 'pet' : 'pets' }} with transactions
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm">
                      <div class="text-gray-900 font-medium">
                        {{ client.totalVisits }} {{ client.totalVisits === 1 ? 'visit' : 'visits' }}
                      </div>
                      <div class="text-gray-500">
                        {{ client.lastVisit ? formatDate(client.lastVisit) : 'No visits' }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button 
                      @click="viewClientDetails(client)"
                      class="p-2 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95"
                      :class="{
                        'text-blue-600 bg-blue-100 shadow-md ring-2 ring-blue-200': expandedClient === client.userId,
                        'text-gray-400 hover:text-blue-600 hover:bg-blue-50': expandedClient !== client.userId
                      }"
                      :title="expandedClient === client.userId ? 'Hide Details' : 'View Details'"
                    >
                      <EyeIcon class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                
                <!-- Expanded Client Row -->
                <tr v-if="expandedClient === client.userId" class="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <td colspan="6" class="px-6 py-6">
                    <div class="space-y-6">
                      <!-- Header -->
                      <div class="mb-4 flex items-center gap-3">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <h3 class="text-lg font-semibold text-blue-900">Client Details</h3>
                        <span class="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          Currently Viewing
                        </span>
                      </div>
                                            <!-- Client Information -->
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-white rounded-lg border border-blue-200 p-4 shadow-sm ring-1 ring-blue-100">
                          <h4 class="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            Personal Information
                          </h4>
                          <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                              <span class="text-gray-500">Full Name:</span>
                              <span class="font-medium">{{ client.firstName }} {{ client.lastName }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-500">Email:</span>
                              <span class="font-medium">{{ client.email }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-500">Phone:</span>
                              <span class="font-medium">{{ client.phone || 'No phone' }}</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-500">Address:</span>
                              <span class="font-medium">{{ client.address || 'No address' }}</span>
                            </div>
                          </div>
                        </div>
    
                        <div class="bg-white rounded-lg border border-blue-200 p-4 shadow-sm ring-1 ring-blue-100">
                          <h4 class="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            Summary
                          </h4>
                          <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                              <span class="text-gray-500">Total Pets:</span>
                              <span class="font-medium">{{ client.pets.length }} pets</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-500">Total Visits:</span>
                              <span class="font-medium">{{ client.totalVisits }} visits</span>
                            </div>
                            <div class="flex justify-between">
                              <span class="text-gray-500">Last Visit:</span>
                              <span class="font-medium">{{ client.lastVisit ? formatDate(client.lastVisit) : 'No visits' }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
      
                                              <!-- Pets Section -->
                        <div>
                          <h4 class="font-medium text-blue-900 mb-4 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            Pets with Transactions
                          </h4>
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div 
                              v-for="pet in client.pets" 
                              :key="pet.id"
                              class="border rounded-lg p-4 transition-all duration-200 cursor-pointer"
                              :class="{
                                'bg-blue-50 border-blue-300 shadow-lg ring-2 ring-blue-100': expandedPet === pet.id,
                                'bg-white border-gray-200 hover:shadow-md': expandedPet !== pet.id
                              }"
                              @click="togglePetExpansion(pet.id)"
                            >
                              <div class="flex items-center gap-3 mb-3">
                                <div class="relative">
                                  <img 
                                    :src="pet.photoURL || defaultPetPhotoURL" 
                                    :alt="pet.name"
                                    class="w-12 h-12 rounded-full object-cover border-2 transition-all duration-200"
                                    :class="{
                                      'border-blue-400 ring-2 ring-blue-200': expandedPet === pet.id,
                                      'border-gray-200': expandedPet !== pet.id
                                    }"
                                  />
                                  <!-- Expansion indicator dot -->
                                  <div v-if="expandedPet === pet.id" 
                                       class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse">
                                  </div>
                                </div>
                                <div>
                                  <h5 class="font-medium text-gray-900">{{ pet.name }}</h5>
                                  <p class="text-sm text-gray-500">{{ pet.species }} • {{ pet.breed }}</p>
                                  <div v-if="expandedPet === pet.id" class="flex items-center gap-1 mt-1">
                                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span class="text-xs text-blue-600 font-medium">Currently Expanded</span>
                                  </div>
                                </div>
                              </div>
                              <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                  <span class="text-gray-500">Age:</span>
                                  <span class="font-medium">{{ pet.ageYears }}y {{ pet.ageMonths }}m</span>
                                </div>
                                <div class="flex justify-between">
                                  <span class="text-gray-500">Gender:</span>
                                  <span class="font-medium capitalize">{{ pet.gender }}</span>
                                </div>
                                <div class="flex justify-between">
                                  <span class="text-gray-500">Weight:</span>
                                  <span class="font-medium">{{ pet.weight }} kg</span>
                                </div>
                                <div class="flex justify-between">
                                  <span class="text-gray-500">Visits:</span>
                                  <span class="font-medium text-blue-600">{{ pet.transactionCount }}</span>
                                </div>
                              </div>
                                                            <div class="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                <button 
                                  @click="togglePetExpansion(pet.id)"
                                  class="w-full px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                                  :class="{
                                    'bg-blue-600 text-white hover:bg-blue-700 shadow-lg ring-2 ring-blue-300': expandedPet === pet.id,
                                    'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 hover:border-blue-300': expandedPet !== pet.id
                                  }"
                                >
                                  <svg 
                                    class="w-4 h-4 transition-all duration-300" 
                                    :class="{ 'rotate-180 scale-110': expandedPet === pet.id }"
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                  <span class="transition-all duration-300">
                                    {{ expandedPet === pet.id ? 'Hide History' : 'View History' }}
                                  </span>
                                </button>
                                
                                <!-- View Vaccination Card Button - Only show if pet has vaccination records -->
                                <button 
                                  v-if="petVaccinations[pet.id] && petVaccinations[pet.id].length > 0"
                                  @click.stop="navigateToVaccinationCard(pet.id)"
                                  class="w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                  <ShieldIcon class="w-4 h-4" />
                                  View Vaccination Card
                                </button>
                                
                                <!-- Loading state for vaccination button -->
                                <div 
                                  v-else-if="!petVaccinations[pet.id]"
                                  class="w-full px-3 py-2 bg-gray-50 text-gray-400 rounded-lg text-sm flex items-center justify-center gap-2"
                                >
                                  <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                  Loading...
                                </div>
                              </div>
                              
                              <!-- Pet History Timeline - Show only for this specific pet when expanded -->
                              <div v-if="expandedPet === pet.id" class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                          <div class="flex items-center gap-3 mb-4">
                            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <h4 class="font-semibold text-blue-900">
                              {{ pet.name }}'s Transaction History
                            </h4>
                            <span class="ml-auto px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Expanded
                            </span>
                          </div>
              
                          <div class="relative">
                            <!-- Timeline Line -->
                            <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                            
                            <!-- Timeline Items -->
                            <div class="space-y-4">
                              <div 
                                v-for="(appointment, index) in client.appointmentHistory?.filter(apt => apt.petIds?.includes(pet.id))" 
                                :key="appointment.id"
                                class="relative pl-12"
                              >
                                <!-- Timeline Dot -->
                                <div class="absolute left-0 w-3 h-3 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                                     :class="{
                                       'bg-green-500': appointment.status === 'completed',
                                       'bg-yellow-500': appointment.status === 'pending',
                                       'bg-blue-500': appointment.status === 'approved'
                                     }">
                                  <div class="w-1 h-1 rounded-full bg-white"></div>
                                </div>
                                
                                <!-- Timeline Content -->
                                <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div class="flex items-start justify-between mb-3">
                                    <div>
                                      <h5 class="font-medium text-gray-900">{{ appointment.serviceNames.join(', ') }}</h5>
                                      <p class="text-sm text-gray-500">{{ formatDate(appointment.date) }}</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                      <span class="px-2 py-1 text-xs font-medium rounded-full" 
                                            :class="{
                                              'bg-green-100 text-green-700': appointment.status === 'completed',
                                              'bg-yellow-100 text-yellow-700': appointment.status === 'pending',
                                              'bg-blue-100 text-blue-700': appointment.status === 'approved'
                                            }">
                                        {{ appointment.status }}
                                      </span>
                                      
                                      <!-- View Summary Button for Completed Appointments -->
                                      <button 
                                        v-if="appointment.status === 'completed' && appointment.completionData"
                                        @click="viewAppointmentSummary(appointment)"
                                        class="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
                                        title="View Completion Summary"
                                      >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                      </button>
                                      
                                      <!-- View Vaccination Card Button for Vaccination Appointments -->
                                      <button 
                                        v-if="appointment.status === 'completed' && hasVaccinationServices(appointment)"
                                        @click="navigateToVaccinationCard(pet.id)"
                                        class="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors"
                                        title="View Vaccination Card"
                                      >
                                        <ShieldIcon class="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <!-- Completion Summary Preview -->
                                  <div v-if="appointment.status === 'completed' && appointment.completionData" class="mt-3 pt-3 border-t border-gray-100">
                                    <div class="text-xs text-gray-500 mb-2">Completion Summary Available</div>
                                    <div class="bg-blue-50 rounded p-2 text-xs">
                                      <div class="font-medium text-blue-800 mb-1">Services:</div>
                                      <div class="text-blue-700">
                                        {{ appointment.completionData.services?.length || 0 }} service(s) completed
                                      </div>
                                      <div class="font-medium text-blue-800 mt-2 mb-1">Health Assessment:</div>
                                      <div class="text-blue-700">
                                        {{ appointment.completionData.pets?.length || 0 }} pet(s) assessed
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Empty State -->
                              <div v-if="!client.appointmentHistory?.filter(apt => apt.petIds?.includes(pet.id))?.length" 
                                   class="text-center py-8 text-gray-500">
                                <PawPrintIcon class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No transaction history found for this pet.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
              
              <!-- Empty State -->
              <tr v-if="filteredClients.length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center justify-center">
                        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <PawPrintIcon class="w-8 h-8 text-gray-300" />
                        </div>
                    <p class="text-gray-500 font-medium">No clients found</p>
                    <p class="text-gray-400 text-sm mt-1">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
      </div>
    
        <!-- Pagination -->
      <div v-if="filteredClients.length > 0" class="mt-6 flex justify-center">
          <div class="flex gap-2">
          <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              Previous
          </button>
            <span class="px-3 py-2 text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
          <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              Next
          </button>
      </div>
      </div>
      </div>

      <!-- Appointment Summary Modal -->
      <div v-if="showSummaryModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Appointment Completion Summary</h2>
            <button @click="closeSummaryModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
      </div>
      
          <div class="p-6" v-if="selectedAppointmentSummary">
            <!-- Appointment Header -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-medium text-gray-800 mb-3">Appointment Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-500 mb-1">Date & Time</div>
                  <div class="font-medium text-gray-900">
                    {{ formatDate(selectedAppointmentSummary.date) }} at {{ selectedAppointmentSummary.time || 'N/A' }}
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">Services</div>
                  <div class="font-medium text-gray-900">
                    {{ selectedAppointmentSummary.serviceNames?.join(', ') }}
                  </div>
                </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Status</div>
              <div class="font-medium text-gray-900">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  {{ selectedAppointmentSummary.status }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Completed At</div>
              <div class="font-medium text-gray-900">
                {{ selectedAppointmentSummary.completedAt ? formatDate(selectedAppointmentSummary.completedAt) : 'N/A' }}
              </div>
            </div>
              </div>
            </div>    

            <!-- Service Summary Section -->
            <div v-if="selectedAppointmentSummary.completionData?.services" class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                Service Summary
              </h3>
              
              <div class="space-y-4">
                <div v-for="(service, index) in selectedAppointmentSummary.completionData.services" :key="index" class="border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-900">{{ service.name }}</h4>
                    <span class="text-sm text-gray-500">Service {{ index + 1 }}</span>
                  </div>
    
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div class="text-sm text-gray-500 mb-1">Status</div>
                      <div class="font-medium text-gray-900 capitalize">{{ service.status?.replace('_', ' ') }}</div>
                    </div>
    
                    <div>
                      <div class="text-sm text-gray-500 mb-1">Duration</div>
                      <div class="font-medium text-gray-900">{{ service.duration || 'N/A' }} minutes</div>
                    </div>
    
                    <div class="md:col-span-2">
                      <div class="text-sm text-gray-500 mb-1">Notes</div>
                      <div class="font-medium text-gray-900 bg-gray-50 p-3 rounded border">
                        {{ service.notes || 'No notes provided' }}
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        </div>
    
            <!-- Pet Health Assessment Section -->
            <div v-if="selectedAppointmentSummary.completionData?.pets" class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <PawPrintIcon class="w-5 h-5 text-green-500" />
                Pet Health Assessment
              </h3>
              
            <div class="space-y-4">
              <div v-for="(pet, index) in selectedAppointmentSummary.completionData.pets" :key="index" class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <PawPrintIcon class="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ pet.name }}</h4>
                    <p class="text-sm text-gray-500">Pet {{ index + 1 }}</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500 mb-1">Overall Health</div>
                    <div class="font-medium text-gray-900 capitalize">{{ pet.overallHealth || 'N/A' }}</div>
                  </div>
                  
                  <div>
                    <div class="text-sm text-gray-500 mb-1">Weight</div>
                    <div class="font-medium text-gray-900">{{ pet.weight ? `${pet.weight} kg` : 'N/A' }}</div>
                  </div>
                  
                  <div class="md:col-span-2">
                    <div class="text-sm text-gray-500 mb-1">Health Notes</div>
                    <div class="font-medium text-gray-900 bg-gray-50 p-3 rounded border">
                      {{ pet.healthNotes || 'No health notes provided' }}
                    </div>
                  </div>
                  
                  <div class="md:col-span-2">
                    <div class="text-sm text-gray-500 mb-1">Follow-up Required</div>
                    <div class="font-medium text-gray-900">
                      <span v-if="pet.followUpRequired" class="text-orange-600">Yes</span>
                      <span v-else class="text-gray-600">No</span>
                    </div>
                    <div v-if="pet.followUpRequired && pet.followUpNotes" class="mt-2 text-sm text-gray-700 bg-orange-50 p-3 rounded border">
                      <strong>Follow-up Notes:</strong> {{ pet.followUpNotes }}
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
    
            <!-- General Notes Section -->
            <div v-if="selectedAppointmentSummary.completionData?.generalNotes" class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                General Notes & Recommendations
              </h3>
              
              <div class="space-y-4">
                <div>
                  <div class="text-sm text-gray-500 mb-1">Treatment Summary</div>
                  <div class="font-medium text-gray-900 bg-gray-50 p-3 rounded border">
                    {{ selectedAppointmentSummary.completionData.generalNotes.treatmentSummary || 'No treatment summary provided' }}
                  </div>
                </div>
                
                <div>
                  <div class="text-sm text-gray-500 mb-1">Owner Instructions</div>
                  <div class="font-medium text-gray-900 bg-gray-50 p-3 rounded border">
                    {{ selectedAppointmentSummary.completionData.generalNotes.ownerInstructions || 'No owner instructions provided' }}
                  </div>
                </div>
                
                <div>
                  <div class="text-sm text-gray-500 mb-1">Next Steps</div>
                  <div class="font-medium text-gray-900 bg-gray-50 p-3 rounded border">
                    {{ selectedAppointmentSummary.completionData.generalNotes.nextSteps || 'No next steps provided' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vaccination Form Modal -->
    <VaccinationForm
      v-if="showVaccinationForm && selectedPetForVaccination"
      :pet="selectedPetForVaccination"
      :vaccination="editingVaccination"
      :is-editing="!!editingVaccination"
      @close="closeVaccinationForm"
      @save="saveVaccination"
    />



</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search as SearchIcon,
  Eye as EyeIcon,
  PawPrint as PawPrintIcon,
  UserX as UserXIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  User as UserIcon,
  Plus as PlusIcon,
  Shield as ShieldIcon
} from 'lucide-vue-next'
import VaccinationForm from '@/components/common/VaccinationForm.vue'
import { 
  generateVaccinationRecord, 
  shouldGenerateVaccinationRecord,
  mergeVaccinationRecords,
  fetchServiceDetails
} from '@/services/vaccinationService'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { useAuthStore } from '@/stores/modules/authStore'

// Initialize store and router
const authStore = useAuthStore()
const router = useRouter()

// Default photo URLs
const defaultPhotoURL = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E'
const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E'

// State variables
const clients = ref([])
const loading = ref(true)
const viewMode = ref('list')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Expandable row state
const expandedClient = ref(null)
const expandedPet = ref(null)

// Watch for pet expansion to load vaccinations
watch(expandedPet, async (newPetId) => {
  if (newPetId) {
    await loadPetVaccinations(newPetId)
  }
})

// Summary modal state
const showSummaryModal = ref(false)
const selectedAppointmentSummary = ref(null)

// Vaccination form state
const showVaccinationForm = ref(false)
const editingVaccination = ref(null)
const selectedPetForVaccination = ref(null)
const petVaccinations = ref({})

// Computed properties
const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  
  const query = searchQuery.value.toLowerCase()
  return clients.value.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    const email = client.email.toLowerCase()
    const phone = (client.phone || '').toLowerCase()
    const address = (client.address || '').toLowerCase()
    
    // Search in client info
    if (fullName.includes(query) || email.includes(query) || phone.includes(query) || address.includes(query)) {
      return true
    }
    
    // Search in pet names
    return client.pets.some(pet => 
      pet.name.toLowerCase().includes(query) || 
      pet.species.toLowerCase().includes(query) || 
      pet.breed.toLowerCase().includes(query)
    )
  })
})

const totalPets = computed(() => {
  return clients.value.reduce((total, client) => total + client.pets.length, 0)
})

const totalPages = computed(() => {
  return Math.ceil(filteredClients.value.length / itemsPerPage)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedClients = computed(() => {
  return filteredClients.value.slice(startIndex.value, endIndex.value)
})

// Methods
async function fetchClients() {
  try {
    loading.value = true
    
    // First, get the current user's document ID from the users collection
    // We need to find the user document where uid field matches authStore.user.uid
    const usersRef = collection(db, 'users')
    const currentUserQuery = query(usersRef, where('uid', '==', authStore.user.uid))
    const currentUserSnapshot = await getDocs(currentUserQuery)
    
    if (currentUserSnapshot.empty) {
      console.error('Current user not found in users collection')
      clients.value = []
      return
    }
    
                // Get the current user's document ID
            const currentUserDocId = currentUserSnapshot.docs[0].id
            
            // Get appointments where the current vet is the doctor and have past transactions
            // Note: doctorId in appointments is the document ID from users collection, not the uid field
    const appointmentsRef = collection(db, 'appointments')
            const appointmentsQuery = query(
      appointmentsRef, 
              where('doctorId', '==', currentUserDocId) // Use document ID, not uid field
            )
            const appointmentsSnapshot = await getDocs(appointmentsQuery)
    
    let clientsData = []
    
    if (appointmentsSnapshot.docs.length > 0) {
      // Filter appointments to only include past/completed transactions
      const pastAppointments = appointmentsSnapshot.docs.filter(doc => {
        const appointmentData = doc.data()
        const appointmentDate = appointmentData.date?.toDate?.() || new Date(appointmentData.date)
        const currentDate = new Date()
        
        // Include appointments that are:
        // 1. Completed (status === 'completed')
        // 2. Past date (appointment date < current date)
        // 3. Or have a completedAt timestamp
        return appointmentData.status === 'completed' || 
               appointmentDate < currentDate || 
               appointmentData.completedAt
      })
      
      // Get unique user IDs from past appointments
      const userIds = [...new Set(pastAppointments.map(doc => doc.data().userId))]
      
      // Fetch user data and their pets for each client
      for (const userId of userIds) {
        try {
          // Get user data by document ID (not by uid field)
          const userDocRef = doc(db, 'users', userId)
          const userSnapshot = await getDoc(userDocRef)
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data()
            
            // Get pets for this user from the pets collection
      const petsRef = collection(db, 'pets')
            const petsQuery = query(petsRef, where('ownerId', '==', userId))
      const petsSnapshot = await getDocs(petsQuery)
      
            // Get all pets for this user
            const allPets = petsSnapshot.docs.map(petDoc => ({
          id: petDoc.id,
              name: petDoc.data().name || '',
              species: petDoc.data().species || '',
              breed: petDoc.data().breed || '',
              ageYears: petDoc.data().ageYears || 0,
              ageMonths: petDoc.data().ageMonths || 0,
              ageWeeks: petDoc.data().ageWeeks || 0,
              gender: petDoc.data().gender || '',
              weight: petDoc.data().weight || '',
              photoURL: petDoc.data().photoURL || '',
              createdAt: petDoc.data().createdAt || null,
              updatedAt: petDoc.data().updatedAt || null
            }))
            
            // Get appointment history for this client with current vet
            const clientAppointments = pastAppointments
              .filter(doc => doc.data().userId === userId)
              .map(doc => {
                const data = doc.data()
                return {
                  id: doc.id,
                  date: data.date?.toDate?.() || new Date(data.date),
                  time: data.time || '',
                  status: data.status,
                  serviceNames: data.serviceNames || [],
                  services: data.services || [], // Include services array for vaccination detection
                  completedAt: data.completedAt?.toDate?.() || null,
                  petNames: data.petNames || [],
                  petIds: data.petIds || [],
                  doctorName: data.doctorName || '', // Include doctor name
                  location: data.location || 'Veterinary Clinic', // Include location
                  // Include completion data if available
                  completionData: data.completionData || null
                }
              })
              .sort((a, b) => b.date - a.date) // Sort by most recent first
            
            // Get unique pet IDs that have had transactions with this vet
            const transactionPetIds = [...new Set(
              clientAppointments.flatMap(appointment => appointment.petIds || [])
            )]
            
            // Filter pets to only include those with transactions
            const transactionPets = allPets.filter(pet => 
              transactionPetIds.includes(pet.id)
            )
            
            // Add transaction info to each pet
            const petsWithTransactions = transactionPets.map(pet => {
              const petAppointments = clientAppointments.filter(appointment => 
                appointment.petIds && appointment.petIds.includes(pet.id)
              )
              
              return {
                ...pet,
                transactionCount: petAppointments.length,
                lastTransaction: petAppointments.length > 0 ? petAppointments[0].date : null,
                services: [...new Set(petAppointments.flatMap(apt => apt.serviceNames || []))]
              }
            })
            
            // Sort pets by most recent transaction
            petsWithTransactions.sort((a, b) => {
              if (!a.lastTransaction && !b.lastTransaction) return 0
              if (!a.lastTransaction) return 1
              if (!b.lastTransaction) return -1
              return b.lastTransaction - a.lastTransaction
            })
            
            const clientData = {
              userId: userId,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || userData.phoneNumber || userData.mobile || userData.contact || '',
              address: userData.address || userData.streetAddress || userData.location || userData.city || '',
              photoURL: userData.photoURL || '',
              pets: petsWithTransactions,
              appointmentHistory: clientAppointments,
              lastVisit: clientAppointments.length > 0 ? clientAppointments[0].date : null,
              totalVisits: clientAppointments.length
            }
            
            clientsData.push(clientData)
                  }
                } catch (error) {
          console.error(`Error fetching data for user ${userId}:`, error)
        }
      }
    }
    
    // Sort clients by most recent visit
    clientsData.sort((a, b) => {
      if (!a.lastVisit && !b.lastVisit) return 0
      if (!a.lastVisit) return 1
      if (!b.lastVisit) return -1
      return b.lastVisit - a.lastVisit
    })
    
    clients.value = clientsData
    
    // Pre-load vaccinations for all pets to show vaccination card buttons
    await preloadAllPetVaccinations()
  } catch (error) {
    console.error('Error fetching clients:', error)
  } finally {
    loading.value = false
  }
}

function formatPetNames(pets) {
  if (!pets || pets.length === 0) return 'No pets'
  
  const names = pets.map(pet => pet.name.trim())
  if (names.length === 1) return names[0]
  if (names.length === 2) return names.join(' and ')
  
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function formatDate(date) {
  if (!date) return 'N/A'
  
  const dateObj = date instanceof Date ? date : new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  const now = new Date()
  const diffTime = Math.abs(now - dateObj)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
}

function toggleClientExpansion(client) {
  if (expandedClient.value === client.userId) {
    expandedClient.value = null
    expandedPet.value = null
    } else {
    expandedClient.value = client.userId
    expandedPet.value = null
  }
}

function togglePetExpansion(petId) {
  if (expandedPet.value === petId) {
    expandedPet.value = null
    } else {
    expandedPet.value = petId
  }
}

function viewClientDetails(client) {
  toggleClientExpansion(client)
}

function viewAppointmentSummary(appointment) {
  selectedAppointmentSummary.value = appointment
  showSummaryModal.value = true
}

function closeSummaryModal() {
  showSummaryModal.value = false
  selectedAppointmentSummary.value = null
}

// Vaccination handlers
function navigateToVaccinationCard(petId) {
  router.push(`/vet/vaccination-card/${petId}`)
}

function showVaccinationCardForPet(petId) {
  selectedPetForVaccinationCard.value = clients.value
    .flatMap(client => client.pets)
    .find(p => p.id === petId)
  showVaccinationCard.value = true
}

// Check if an appointment has vaccination services
async function hasVaccinationServices(appointment) {
  if (!appointment.services || appointment.services.length === 0) {
    return false
  }
  
  try {
    const serviceDetails = await fetchServiceDetails(appointment.services)
    return serviceDetails.some(service => 
      service.isVaccination === true ||
      service.name?.toLowerCase().includes('vaccination') ||
      service.name?.toLowerCase().includes('vaccine') ||
      service.name?.toLowerCase().includes('shot')
    )
  } catch (error) {
    console.error('Error checking vaccination services:', error)
    return false
  }
}

// Pre-load vaccinations for all pets to show vaccination card buttons
async function preloadAllPetVaccinations() {
  try {
    for (const client of clients.value) {
      for (const pet of client.pets) {
        await loadPetVaccinations(pet.id)
      }
    }
  } catch (error) {
    console.error('Error pre-loading pet vaccinations:', error)
  }
}

async function getPetVaccinations(petId) {
  const pet = clients.value
    .flatMap(client => client.pets)
    .find(p => p.id === petId)
  
  if (!pet) return []
  
  // Initialize vaccinations array if it doesn't exist
  if (!pet.vaccinations) {
    pet.vaccinations = []
  }
  
  // Get pet's appointment history from the current client data
  const client = clients.value.find(c => c.pets.some(p => p.id === petId))
  
  if (client && client.appointmentHistory) {
    // Process each completed appointment for this pet
    for (const appointment of client.appointmentHistory) {
      if (appointment.petIds?.includes(petId)) {
        // Fetch service details for this appointment
        const serviceDetails = await fetchServiceDetails(appointment.services || [])
        
        if (shouldGenerateVaccinationRecord(appointment, serviceDetails)) {
          // Check if vaccination record already exists for this appointment
          const existingRecord = pet.vaccinations.find(v => 
            v.appointmentId === appointment.id
          )
          
          if (!existingRecord) {
            // Generate new vaccination record
            const vaccinationRecord = generateVaccinationRecord(appointment, pet, serviceDetails)
            
            if (vaccinationRecord) {
              pet.vaccinations.push(vaccinationRecord)
            }
          }
        }
      }
    }
    
    // Sort vaccinations by date (newest first)
    pet.vaccinations.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  
  return pet.vaccinations || []
}

function handleVaccinationCompleted(record) {
  console.log('Mark vaccination completed:', record)
  // This would mark a vaccination as completed
}

function handleEditVaccination(record) {
  selectedPetForVaccination.value = clients.value
    .flatMap(client => client.pets)
    .find(p => p.vaccinations?.some(v => v.id === record.id))
  editingVaccination.value = record
  showVaccinationForm.value = true
}

function closeVaccinationForm() {
  showVaccinationForm.value = false
  editingVaccination.value = null
  selectedPetForVaccination.value = null
}



function saveVaccination(vaccinationData) {
  console.log('Save vaccination:', vaccinationData)
  // This would save the vaccination to the database
  closeVaccinationForm()
}

// Load vaccinations for a specific pet
async function loadPetVaccinations(petId) {
  try {
    const vaccinations = await getPetVaccinations(petId)
    petVaccinations.value[petId] = vaccinations
  } catch (error) {
    console.error('Error loading pet vaccinations:', error)
    petVaccinations.value[petId] = []
  }
}



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

// Lifecycle
onMounted(() => {
  if (authStore.user?.uid) {
    fetchClients()
  }
})
</script>

<style scoped>
/* Add any custom styles here */
</style>