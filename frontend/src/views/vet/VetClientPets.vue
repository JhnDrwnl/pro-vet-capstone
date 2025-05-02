<!-- views/vet/VetClientPets.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Client Pets Management</h1>
      <p class="text-gray-500 mt-1">Manage pet owner profiles and their pets.</p>
    </div>
    
    <!-- Loading spinner during initial data load -->
    <LoadingSpinner v-if="initialLoading" isOverlay text="Loading pet owners and pets..." />
    
    <!-- Loading spinner during save operation -->
    <LoadingSpinner v-if="isSaving" isOverlay text="Saving pet information..." />
    
    <!-- Loading spinner during delete operation -->
    <LoadingSpinner v-if="isDeleting" isOverlay text="Deleting pet..." />
    
    <!-- Pet Selector View (New) -->
    <div v-if="showPetSelector && selectedOwner && !selectedPet && !showForm">
      <div class="pet-selector">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
            <button @click="goBackToList" class="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h2 class="text-2xl font-bold">Select Pet</h2>
          </div>
          <button 
            @click="addNewPetForOwner(selectedOwner)" 
            class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            <PlusCircleIcon class="w-4 h-4" />
            Add New Pet
          </button>
        </div>

        <div class="mb-4">
          <p class="text-gray-500">Owner: <span class="font-medium text-gray-700">{{ selectedOwner.firstName }} {{ selectedOwner.lastName }}</span></p>
        </div>
        
        <!-- Pets Grid -->
        <div v-if="selectedOwner.pets && selectedOwner.pets.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="pet in selectedOwner.pets" 
            :key="pet.id" 
            class="border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            @click="viewPet(pet)"
          >
            <div class="p-4 flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                <img 
                  :src="pet.photoURL || defaultPetPhotoURL" 
                  :alt="pet.name" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-grow">
                <h3 class="font-medium text-lg">{{ pet.name }}</h3>
                <p class="text-gray-500 text-sm">{{ pet.species }} - {{ pet.breed }}</p>
                <p class="text-gray-500 text-sm">{{ formatPetAge(pet) }}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button 
                  @click.stop="editPet(pet)"
                  class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Edit class="w-4 h-4 text-gray-500" />
                </button>
                <button 
                  @click.stop="confirmDeletePet(pet)"
                  class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <TrashIcon class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else class="py-8 text-center">
          <div class="flex flex-col items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <PawPrintIcon class="w-8 h-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No pets found for this owner</p>
            <button 
              @click="addNewPetForOwner(selectedOwner)"
              class="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <PlusCircleIcon class="w-4 h-4" />
              Add First Pet
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pet View Details -->
    <div v-else-if="selectedPet && !showForm">
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
                <p class="font-medium">{{ selectedPet.owner.firstName }} {{ selectedPet.owner.lastName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Phone</p>
                <p class="font-medium">{{ selectedPet.owner.phone || 'No phone' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">{{ selectedPet.owner.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Address</p>
                <p class="font-medium">{{ selectedPet.owner.streetAddress || 'No address' }}</p>
              </div>
            </div>
          </div>
      
          <!-- Pet Information Card -->
          <div class="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div class="flex items-start">
              <img 
                :src="selectedPet.photoURL || defaultPetPhotoURL" 
                alt="Pet Photo" 
                class="w-24 h-24 object-cover rounded-lg mr-6"
              />
              <div class="flex-grow">
                <h3 class="text-xl font-bold mb-2">{{ selectedPet.name }}</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Species</p>
                    <p class="font-medium capitalize">{{ selectedPet.species }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Breed</p>
                    <p class="font-medium">{{ selectedPet.breed }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Age</p>
                    <p class="font-medium">{{ formatPetAge(selectedPet) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Gender</p>
                    <p class="font-medium">{{ selectedPet.gender }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Weight</p>
                    <p class="font-medium">{{ selectedPet.weight }} kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      
          <!-- Medical History Card -->
          <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Medical History</h3>
              <button 
                @click="addMedicalRecord" 
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <PlusCircleIcon class="w-4 h-4" />
                Add Record
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortMedicalHistory('date')">
                      <div class="flex items-center">
                        Date
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': medicalSortKey === 'date' && medicalSortOrder === 'asc', 'text-gray-400': !(medicalSortKey === 'date' && medicalSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': medicalSortKey === 'date' && medicalSortOrder === 'desc', 'text-gray-400': !(medicalSortKey === 'date' && medicalSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortMedicalHistory('type')">
                      <div class="flex items-center">
                        Type
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': medicalSortKey === 'type' && medicalSortOrder === 'asc', 'text-gray-400': !(medicalSortKey === 'type' && medicalSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': medicalSortKey === 'type' && medicalSortOrder === 'desc', 'text-gray-400': !(medicalSortKey === 'type' && medicalSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortMedicalHistory('vet')">
                      <div class="flex items-center">
                        Vet
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': medicalSortKey === 'vet' && medicalSortOrder === 'asc', 'text-gray-400': !(medicalSortKey === 'vet' && medicalSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': medicalSortKey === 'vet' && medicalSortOrder === 'desc', 'text-gray-400': !(medicalSortKey === 'vet' && medicalSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(record, index) in sortedMedicalHistory" :key="index">
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(record.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ record.type }}</td>
                    <td class="px-6 py-4">{{ record.description }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ record.vet }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex gap-2">
                        <button @click="editMedicalRecord(index)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <Edit class="w-4 h-4 text-gray-500" />
                        </button>
                        <button @click="deleteMedicalRecord(index)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <TrashIcon class="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!selectedPet.medicalHistory || selectedPet.medicalHistory.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center">
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
      
          <!-- Vaccinations Card -->
          <div class="md:col-span-3 bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Vaccinations</h3>
              <button 
                @click="addVaccination" 
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                <PlusCircleIcon class="w-4 h-4" />
                Add Vaccination
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortVaccinations('name')">
                      <div class="flex items-center">
                        Vaccine Name
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': vaccineSortKey === 'name' && vaccineSortOrder === 'asc', 'text-gray-400': !(vaccineSortKey === 'name' && vaccineSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': vaccineSortKey === 'name' && vaccineSortOrder === 'desc', 'text-gray-400': !(vaccineSortKey === 'name' && vaccineSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortVaccinations('date')">
                      <div class="flex items-center">
                        Date Given
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': vaccineSortKey === 'date' && vaccineSortOrder === 'asc', 'text-gray-400': !(vaccineSortKey === 'date' && vaccineSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': vaccineSortKey === 'date' && vaccineSortOrder === 'desc', 'text-gray-400': !(vaccineSortKey === 'date' && vaccineSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortVaccinations('expiryDate')">
                      <div class="flex items-center">
                        Expiry Date
                        <div class="flex flex-col ml-1">
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': vaccineSortKey === 'expiryDate' && vaccineSortOrder === 'asc', 'text-gray-400': !(vaccineSortKey === 'expiryDate' && vaccineSortOrder === 'asc') }">▲</span>
                          <span class="text-[10px] leading-none" :class="{ 'text-gray-800': vaccineSortKey === 'expiryDate' && vaccineSortOrder === 'desc', 'text-gray-400': !(vaccineSortKey === 'expiryDate' && vaccineSortOrder === 'desc') }">▼</span>
                        </div>
                      </div>
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(vaccination, index) in sortedVaccinations" :key="index">
                    <td class="px-6 py-4 whitespace-nowrap">{{ vaccination.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(vaccination.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ formatDate(vaccination.expiryDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="isVaccineExpired(vaccination.expiryDate) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                      >
                        {{ isVaccineExpired(vaccination.expiryDate) ? 'Expired' : 'Valid' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex gap-2">
                        <button @click="editVaccination(index)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <Edit class="w-4 h-4 text-gray-500" />
                        </button>
                        <button @click="deleteVaccination(index)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <TrashIcon class="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!selectedPet.vaccinations || selectedPet.vaccinations.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center">
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
                        <button @click="deleteDocument(index)" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                          <TrashIcon class="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!selectedPet.documents || selectedPet.documents.length === 0">
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
      <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
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
    
    <!-- Delete Pet Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <AlertTriangleIcon class="h-6 w-6 text-red-600" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Confirm Deletion</h3>
        <p class="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete {{ petToDelete ? petToDelete.name : 'this pet' }}? This action cannot be undone.
        </p>
        <div class="flex justify-center gap-4">
          <button 
            @click="cancelDeletePet" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 border rounded-full shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="deletePet" 
            class="px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent rounded-full shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  User as UserIcon,
  Search as SearchIcon,
  PlusCircle as PlusCircleIcon,
  Filter as FilterIcon,
  List as ListIcon,
  LayoutGrid as LayoutGridIcon,
  Edit,
  Eye as EyeIcon,
  Download as DownloadIcon,
  ArrowLeft as ArrowLeftIcon,
  Trash as TrashIcon,
  PawPrint as PawPrintIcon,
  Clipboard as ClipboardIcon,
  Syringe as SyringeIcon,
  File as FileIcon,
  FileText,
  Activity,
  ChevronDown,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@shared/firebase'
import { usePetsStore } from '@/stores/modules/petsStore'
import { useProfileStore } from '@/stores/modules/profileStore'

// Initialize stores
const petsStore = usePetsStore()
const profileStore = useProfileStore()

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
const isDeleting = ref(false)
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
const showDeleteConfirmation = ref(false)
const petToDelete = ref(null)

// Fetch pet owners and their pets
const fetchPetOwnersWithPets = async () => {
  try {
    initialLoading.value = true
  
    // Fetch pet owners (users with role 'user') directly from Firestore
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', 'user'))
    const querySnapshot = await getDocs(q)
  
    // Process each owner to add their pets
    const ownersWithPets = []
  
    querySnapshot.forEach(doc => {
      ownersWithPets.push({
        userId: doc.id,
        ...doc.data(),
        pets: [] // Initialize empty pets array
      })
    })
  
    // Fetch pets for each owner
    for (const owner of ownersWithPets) {
      // Fetch pets for this owner
      const ownerPets = await petsStore.fetchUserPets(owner.userId)
      
      // Add pets to owner object
      owner.pets = ownerPets || []
      
      // Fetch complete profile data using profileStore to ensure we have the correct photoURL
      const profileData = await profileStore.fetchUserProfile(owner.userId)
      if (profileData && profileData.photoURL) {
        // Update the photoURL from the profile store
        owner.photoURL = profileData.photoURL
      }
    }
  
    petOwners.value = ownersWithPets
    console.log('Fetched pet owners with pets:', petOwners.value)
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

// Sorted medical history records
const sortedMedicalHistory = computed(() => {
  if (!selectedPet.value || !selectedPet.value.medicalHistory) return [];
  
  return [...selectedPet.value.medicalHistory].sort((a, b) => {
    let aValue, bValue;
  
    if (medicalSortKey.value === 'date') {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    } else {
      aValue = a[medicalSortKey.value];
      bValue = b[medicalSortKey.value];
    }
  
    if (aValue < bValue) return medicalSortOrder.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return medicalSortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

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
    // Create a new pet if the owner doesn't have any pets
    addNewPetForOwner(owner)
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
    // Create a new pet if the owner doesn't have any pets
    addNewPetForOwner(owner)
  }
}

function addNewPetForOwner(owner) {
  const newPet = {
    id: `new-${Date.now()}`,
    name: '',
    species: '',
    breed: '',
    gender: '',
    ageYears: 0,
    ageMonths: 0,
    ageWeeks: 0,
    weight: 0,
    ownerId: owner.userId,
    owner: {
      firstName: owner.firstName || '',
      lastName: owner.lastName || '',
      email: owner.email || '',
      phone: owner.phone || '',
      streetAddress: owner.streetAddress || '',
      photoURL: owner.photoURL || defaultPhotoURL.value
    }
  }
  
  editPet(newPet)
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
}

async function editPet(pet) {
  selectedPet.value = pet
  // Create a deep copy of the pet object
  formData.value = JSON.parse(JSON.stringify(pet))
  
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

// Delete pet confirmation and execution
function confirmDeletePet(pet) {
  petToDelete.value = pet
  showDeleteConfirmation.value = true
}

function cancelDeletePet() {
  petToDelete.value = null
  showDeleteConfirmation.value = false
}

async function deletePet() {
  if (petToDelete.value) {
    try {
      // Set isDeleting to true when starting the delete operation
      isDeleting.value = true
      
      await petsStore.deletePet(petToDelete.value.ownerId, petToDelete.value.id)
      
      // Update the local state by removing the pet from the owner's pet list
      const ownerIndex = petOwners.value.findIndex(owner => owner.userId === petToDelete.value.ownerId)
      if (ownerIndex !== -1) {
        const petIndex = petOwners.value[ownerIndex].pets.findIndex(p => p.id === petToDelete.value.id)
        if (petIndex !== -1) {
          petOwners.value[ownerIndex].pets.splice(petIndex, 1)
        }
      }
      
      // If we're in the pet selector and this was the last pet, go back to the main list
      if (showPetSelector.value && selectedOwner.value && 
          (!selectedOwner.value.pets || selectedOwner.value.pets.length === 0)) {
        goBackToList()
      }
      
      statusMessage.value = `Pet "${petToDelete.value.name}" deleted successfully`
      showSuccessModal.value = true
      petToDelete.value = null
      showDeleteConfirmation.value = false
    } catch (error) {
      console.error('Error deleting pet:', error)
      statusMessage.value = 'Failed to delete pet. Please try again.'
      showErrorModal.value = true
    } finally {
      // Set isDeleting back to false when the operation is complete
      isDeleting.value = false
    }
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

function deleteDocument(index) {
  if (selectedPet.value && selectedPet.value.documents) {
    // Create a copy of the pet to edit
    const updatedPet = { ...selectedPet.value }
    updatedPet.documents = [...updatedPet.documents]
    updatedPet.documents.splice(index, 1)
    
    // Update in petsStore
    petsStore.updatePet(updatedPet.ownerId, updatedPet.id, updatedPet)
    
    // Update local state
    selectedPet.value = updatedPet
  }
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
    default: return FileText
  }
}

function getTabLabel(tab) {
  switch(tab) {
    case 'basics': return 'Basic Details'
    case 'medical': return 'Medical History'
    case 'vaccinations': return 'Vaccinations'
    case 'documents': return 'Documents'
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