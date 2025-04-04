<!-- views/vet/VetClientPets.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
  <!-- Header Section -->
  <div class="mb-8">
  <h1 class="text-2xl font-semibold text-gray-900">Client Pets Management</h1>
  <p class="text-gray-500 mt-1">Manage pet owner profiles and their pets.</p>
  </div>
  
  <!-- Pet View Details -->
  <div v-if="selectedPet && !showForm">
  <div class="pet-view-details">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <button @click="goBackToList" class="mr-4 text-gray-600 hover:text-gray-900">
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
            <p class="font-medium">{{ selectedPet.owner.name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Phone</p>
            <p class="font-medium">{{ selectedPet.owner.phone }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium">{{ selectedPet.owner.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Address</p>
            <p class="font-medium">{{ selectedPet.owner.address }}</p>
          </div>
        </div>
      </div>
  
      <!-- Pet Information Card -->
      <div class="md:col-span-2 bg-white rounded-lg shadow p-6">
        <div class="flex items-start">
          <img 
            :src="selectedPet.photoUrl || '/placeholder-pet.jpg'" 
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
                <p class="font-medium">{{ selectedPet.age }} years</p>
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
                  {{ new Date(record.date).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ record.type }}</td>
                <td class="px-6 py-4">{{ record.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ record.vet }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex gap-2">
                    <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <Edit class="w-4 h-4 text-gray-500" />
                    </button>
                    <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <TrashIcon class="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="selectedPet.medicalHistory.length === 0">
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
                  {{ new Date(vaccination.date).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ new Date(vaccination.expiryDate).toLocaleDateString() }}
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
                    <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <Edit class="w-4 h-4 text-gray-500" />
                    </button>
                    <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <TrashIcon class="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="selectedPet.vaccinations.length === 0">
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
                  {{ new Date(document.date).toLocaleDateString() }}
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
                    <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <Edit class="w-4 h-4 text-gray-500" />
                    </button>
                    <button class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200">
                      <TrashIcon class="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="selectedPet.documents.length === 0">
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
      <h2 class="text-xl font-semibold">{{ isNewPet ? 'Add New Pet' : 'Edit Info' }}</h2>
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
              <input 
                type="text" 
                v-model="formData.owner.name" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
              <input 
                type="text" 
                v-model="formData.owner.phone" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
              <input 
                type="email" 
                v-model="formData.owner.email" 
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Owner Address</label>
              <input 
                type="text" 
                v-model="formData.owner.address" 
                class="w-full px-3 py-2 border rounded-md"
              />
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
          <select 
            v-model="formData.species" 
            class="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="other">Other</option>
          </select>
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input 
            type="text" 
            v-model="formData.breed" 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
          <input 
            type="number" 
            v-model="formData.age" 
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select 
            v-model="formData.gender" 
            class="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
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
  
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Photo</label>
          <div class="flex items-center">
            <img 
              :src="formData.photoUrl || '/placeholder-pet.jpg'" 
              alt="Pet Photo" 
              class="w-16 h-16 object-cover rounded-full mr-4"
            />
            <button class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">
              Upload Photo
            </button>
          </div>
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
            <tr v-if="formData.medicalHistory.length === 0">
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
            <tr v-if="formData.vaccinations.length === 0">
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
            <tr v-if="formData.documents.length === 0">
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
      class="px-3 py-1.5 sm:px-4 sm:py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2 text-xs sm:text-sm"
    >
      {{ isNewPet ? 'Add Pet' : 'Save Changes' }}
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
          placeholder="Search pets..."
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
              class="text-left py-4 px-6 text-xs font-medium text-gray-500 cursor-pointer"
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
              class="text-left py-4 px-6 text-xs font-medium text-gray-500 cursor-pointer"
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
            <th 
              class="text-left py-4 px-6 text-xs font-medium text-gray-500 cursor-pointer"
              @click="sortBy('lastVisit')"
            >
              <div class="flex items-center">
                Last Visit
                <div class="flex flex-col ml-1">
                  <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'lastVisit' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'lastVisit' && sortOrder === 'asc') }">▲</span>
                  <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'lastVisit' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'lastVisit' && sortOrder === 'desc') }">▼</span>
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
            v-for="(ownerData, ownerIndex) in groupedPetsByOwner" 
            :key="ownerIndex" 
            class="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
          >
            <td class="py-4 px-6">
              <div class="flex items-center gap-3">
                <img 
                  :src="ownerData.owner.photoUrl || '/placeholder-user.jpg'" 
                  alt="Owner" 
                  class="w-10 h-10 rounded-full object-cover cursor-pointer"
                >
                <div>
                  <div class="font-medium text-gray-900">{{ ownerData.owner.name }}</div>
                </div>
              </div>
            </td>
            <td class="py-4 px-6">
              <div>
                <div class="text-sm text-gray-500">{{ ownerData.owner.phone }}</div>
                <div class="text-sm text-gray-500">{{ ownerData.owner.email }}</div>
              </div>
            </td>
            <td class="py-4 px-6">
              <div class="flex items-center">
                <div class="flex -space-x-2 mr-2">
                  <img 
                    v-for="(pet, petIndex) in ownerData.pets.slice(0, 3)" 
                    :key="petIndex"
                    :src="pet.photoUrl || '/placeholder-pet.jpg'" 
                    alt="Pet" 
                    class="w-8 h-8 rounded-full object-cover border-2 border-white"
                  >
                </div>
                <span class="text-blue-500 font-medium">
                  {{ formatPetNames(ownerData.pets) }}
                </span>
              </div>
            </td>
            <td class="py-4 px-6">
              {{ formatDate(getEarliestCreatedDate(ownerData.pets)) }}
            </td>
            <td class="py-4 px-6">
              {{ formatDate(getLatestUpdatedDate(ownerData.pets)) }}
            </td>
            <td class="py-4 px-6">
              {{ getLatestVisitDate(ownerData.pets) }}
            </td>
            <td class="py-4 px-6">
              <div class="flex gap-2">
                <button 
                  @click="viewPet(ownerData.pets[0])"
                  class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <EyeIcon class="w-4 h-4 text-gray-500" />
                </button>
                <button 
                  @click="editPet(ownerData.pets[0])"
                  class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Edit class="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </td>
          </tr>
          
          <!-- Empty state with icon placeholder -->
          <tr v-if="groupedPetsByOwner.length === 0">
            <td colspan="7" class="py-8 text-center">
              <div class="flex flex-col items-center justify-center">
                <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <PawPrintIcon class="w-8 h-8 text-gray-300" />
                </div>
                <p class="text-gray-500 font-medium">No pets found</p>
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
        v-for="(ownerData, ownerIndex) in groupedPetsByOwner" 
        :key="ownerIndex" 
        class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
        <div class="p-6 flex-grow flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <img 
                :src="ownerData.owner.photoUrl || '/placeholder-user.jpg'" 
                alt="Owner" 
                class="w-10 h-10 rounded-full object-cover cursor-pointer"
              >
              <div>
                <div class="font-medium text-gray-900">{{ ownerData.owner.name }}</div>
                <div class="text-sm text-gray-500">{{ ownerData.owner.phone }}</div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Pets:</h4>
            <div class="flex items-center">
              <div class="flex -space-x-2 mr-2">
                <img 
                  v-for="(pet, petIndex) in ownerData.pets.slice(0, 3)" 
                  :key="petIndex"
                  :src="pet.photoUrl || '/placeholder-pet.jpg'" 
                  alt="Pet" 
                  class="w-8 h-8 rounded-full object-cover border-2 border-white"
                >
              </div>
              <span class="text-blue-500 font-medium">
                {{ formatPetNames(ownerData.pets) }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 text-sm text-gray-500 mb-4">
            <div>
              <span class="font-medium">Created:</span> {{ formatDate(getEarliestCreatedDate(ownerData.pets)) }}
            </div>
            <div>
              <span class="font-medium">Updated:</span> {{ formatDate(getLatestUpdatedDate(ownerData.pets)) }}
            </div>
          </div>
          
          <!-- Push the time and action buttons to the bottom -->
          <div class="mt-auto">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">
                {{ getLatestVisitDate(ownerData.pets) }}
              </span>
              <div class="flex gap-2">
                <button 
                  @click="viewPet(ownerData.pets[0])"
                  class="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <EyeIcon class="w-4 h-4 text-gray-500" />
                </button>
                <button 
                  @click="editPet(ownerData.pets[0])"
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
  <div v-if="groupedPetsByOwner.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
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
  </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
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
  ChevronDown
  } from 'lucide-vue-next'
  
  // View mode
  const viewMode = ref('list')
  
  // Search and filter
  const searchQuery = ref('')
  
  // Sorting state for table headers
  const sortKey = ref('name')
  const sortOrder = ref('asc')
  
  // Sorting state for medical history
  const medicalSortKey = ref('date')
  const medicalSortOrder = ref('desc')
  
  // Sorting state for vaccinations
  const vaccineSortKey = ref('date')
  const vaccineSortOrder = ref('desc')
  
  // Sorting state for documents
  const documentSortKey = ref('date')
  const documentSortOrder = ref('desc')
  
  // Pagination
  const currentPage = ref(1)
  const itemsPerPage = 10
  
  // UI state
  const selectedPet = ref(null)
  const editMode = ref(false)
  const activeTab = ref('basics')
  const formData = ref({})
  const showFilterMenu = ref(false)
  const filters = ref({
  petCount: []
  })
  const showForm = ref(false)
  const showTabDropdown = ref(false)
  
  // Sample data - in a real app this would come from API
  const pets = ref([
  {
  id: '001',
  name: 'Max',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 5,
  gender: 'Male',
  weight: 30,
  photoUrl: '/placeholder-pet.jpg',
  lastVisit: '2023-11-15',
  createdAt: '2022-05-10T08:30:00Z',
  updatedAt: '2023-11-15T14:45:00Z',
  owner: {
    id: 'C001',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, CA 12345',
    photoUrl: '/placeholder-user.jpg'
  },
  medicalHistory: [
    { 
      date: '2023-11-15', 
      type: 'Checkup', 
      description: 'Annual wellness check. All vitals normal.',
      vet: 'Dr. Emily Johnson'
    },
    { 
      date: '2023-08-02', 
      type: 'Illness', 
      description: 'Presented with mild digestive issues. Prescribed special diet.',
      vet: 'Dr. Mark Wilson'
    }
  ],
  vaccinations: [
    { name: 'Rabies', date: '2023-05-18', expiryDate: '2024-05-18' },
    { name: 'DHPP', date: '2023-05-18', expiryDate: '2024-05-18' },
    { name: 'Bordetella', date: '2023-01-10', expiryDate: '2024-01-10' }
  ],
  documents: [
    { name: 'Vaccination Certificate', date: '2023-05-18', type: 'pdf', url: '#' },
    { name: 'Insurance Policy', date: '2023-04-20', type: 'pdf', url: '#' }
  ]
  },
  {
  id: '002',
  name: 'Luna',
  species: 'cat',
  breed: 'Siamese',
  age: 3,
  gender: 'Female',
  weight: 4.5,
  photoUrl: '/placeholder-pet.jpg',
  lastVisit: '2023-10-28',
  createdAt: '2022-08-15T10:20:00Z',
  updatedAt: '2023-10-28T11:30:00Z',
  owner: {
    id: 'C002',
    name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'sarah.johnson@example.com',
    address: '456 Oak Ave, Anytown, CA 12345',
    photoUrl: '/placeholder-user.jpg'
  },
  medicalHistory: [
    { 
      date: '2023-10-28', 
      type: 'Dental', 
      description: 'Dental cleaning and examination.',
      vet: 'Dr. Emily Johnson'
    }
  ],
  vaccinations: [
    { name: 'Rabies', date: '2023-04-12', expiryDate: '2024-04-12' },
    { name: 'FVRCP', date: '2023-04-12', expiryDate: '2024-04-12' }
  ],
  documents: [
    { name: 'Adoption Certificate', date: '2020-06-15', type: 'pdf', url: '#' }
  ]
  },
  {
  id: '003',
  name: 'Charlie',
  species: 'bird',
  breed: 'Budgerigar',
  age: 2,
  gender: 'Male',
  weight: 0.1,
  photoUrl: '/placeholder-pet.jpg',
  lastVisit: null,
  createdAt: '2023-01-20T09:15:00Z',
  updatedAt: '2023-01-20T09:15:00Z',
  owner: {
    id: 'C001',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, CA 12345',
    photoUrl: '/placeholder-user.jpg'
  },
  medicalHistory: [],
  vaccinations: [],
  documents: []
  },
  {
  id: '004',
  name: 'Whiskers',
  species: 'cat',
  breed: 'Maine Coon',
  age: 4,
  gender: 'Male',
  weight: 6.2,
  photoUrl: '/placeholder-pet.jpg',
  lastVisit: '2023-09-15',
  createdAt: '2022-03-05T14:30:00Z',
  updatedAt: '2023-09-15T16:45:00Z',
  owner: {
    id: 'C001',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, CA 12345',
    photoUrl: '/placeholder-user.jpg'
  },
  medicalHistory: [],
  vaccinations: [],
  documents: []
  },
  {
  id: '005',
  name: 'Buddy',
  species: 'dog',
  breed: 'Beagle',
  age: 3,
  gender: 'Male',
  weight: 12.5,
  photoUrl: '/placeholder-pet.jpg',
  lastVisit: '2023-10-05',
  createdAt: '2022-07-12T11:20:00Z',
  updatedAt: '2023-10-05T13:10:00Z',
  owner: {
    id: 'C001',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@example.com',
    address: '123 Main St, Anytown, CA 12345',
    photoUrl: '/placeholder-user.jpg'
  },
  medicalHistory: [],
  vaccinations: [],
  documents: []
  }
  ])
  
  // Group pets by owner
  const groupedPetsByOwner = computed(() => {
  const filtered = [...filteredPets.value];
  const groupedByOwner = {};
  
  filtered.forEach(pet => {
  const ownerId = pet.owner.id;
  if (!groupedByOwner[ownerId]) {
    groupedByOwner[ownerId] = {
      owner: pet.owner,
      pets: []
    };
  }
  groupedByOwner[ownerId].pets.push(pet);
  });
  
  // Filter by pet count
  let result = Object.values(groupedByOwner);
  
  if (filters.value.petCount.length > 0) {
  result = result.filter(ownerData => {
    const petCount = ownerData.pets.length;
    
    return filters.value.petCount.some(filter => {
      if (filter === 'one') return petCount === 1;
      if (filter === 'two') return petCount === 2;
      if (filter === 'moreThanTwo') return petCount > 2;
      return false;
    });
  });
  }
  
  return result;
  });
  
  // Format pet names for display
  function formatPetNames(pets) {
  if (pets.length === 1) {
  return pets[0].name;
  } else if (pets.length === 2) {
  return `${pets[0].name}, ${pets[1].name}`;
  } else {
  return `${pets[0].name}, ${pets[1].name}, +${pets.length - 2}`;
  }
  }
  
  // Format date for display
  function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
  }
  
  // Get the latest visit date from a list of pets
  function getLatestVisitDate(pets) {
  const validDates = pets
  .filter(pet => pet.lastVisit)
  .map(pet => new Date(pet.lastVisit));
  
  if (validDates.length === 0) {
  return 'No visits';
  }
  
  const latestDate = new Date(Math.max(...validDates));
  return latestDate.toLocaleDateString();
  }
  
  // Get the earliest created date from a list of pets
  function getEarliestCreatedDate(pets) {
  const validDates = pets
  .filter(pet => pet.createdAt)
  .map(pet => new Date(pet.createdAt));
  
  if (validDates.length === 0) {
  return null;
  }
  
  return new Date(Math.min(...validDates));
  }
  
  // Get the latest updated date from a list of pets
  function getLatestUpdatedDate(pets) {
  const validDates = pets
  .filter(pet => pet.updatedAt)
  .map(pet => new Date(pet.updatedAt));
  
  if (validDates.length === 0) {
  return null;
  }
  
  return new Date(Math.max(...validDates));
  }
  
  // Export to CSV function
  function exportToCSV() {
  // Get all the data we want to export
  const data = groupedPetsByOwner.value.map(ownerData => {
  const petCount = ownerData.pets.length;
  const petNames = ownerData.pets.map(pet => pet.name).join(', ');
  const petSpecies = ownerData.pets.map(pet => pet.species).join(', ');
  
  return {
    'Owner Name': ownerData.owner.name,
    'Owner Email': ownerData.owner.email,
    'Owner Phone': ownerData.owner.phone,
    'Owner Address': ownerData.owner.address,
    'Number of Pets': petCount,
    'Pet Names': petNames,
    'Pet Species': petSpecies,
    'Last Visit': getLatestVisitDate(ownerData.pets),
    'Created Date': formatDate(getEarliestCreatedDate(ownerData.pets)),
    'Updated Date': formatDate(getLatestUpdatedDate(ownerData.pets))
  };
  });
  
  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
  headers.join(','),
  ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'pet_owners_data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  }
  
  // Computed properties
  const filteredPets = computed(() => {
  let result = [...pets.value]
  
  // Apply search query
  if (searchQuery.value) {
  const query = searchQuery.value.toLowerCase()
  result = result.filter(pet => 
    pet.name.toLowerCase().includes(query) ||
    pet.breed.toLowerCase().includes(query) ||
    pet.owner.name.toLowerCase().includes(query) ||
    pet.species.toLowerCase().includes(query)
  )
  }
  
  // Sort pets based on table header sorting
  result.sort((a, b) => {
  let aValue, bValue;
  
  if (sortKey.value === 'owner.name') {
    aValue = a.owner.name;
    bValue = b.owner.name;
  } else if (sortKey.value === 'owner.phone') {
    aValue = a.owner.phone;
    bValue = b.owner.phone;
  } else if (sortKey.value === 'createdAt' || sortKey.value === 'updatedAt' || sortKey.value === 'lastVisit') {
    aValue = a[sortKey.value] ? new Date(a[sortKey.value]) : new Date(0);
    bValue = b[sortKey.value] ? new Date(b[sortKey.value]) : new Date(0);
  } else {
    aValue = a[sortKey.value];
    bValue = b[sortKey.value];
  }
  
  if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
  if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
  return 0
  })
  
  return result
  })
  
  // Sorted medical history records
  const sortedMedicalHistory = computed(() => {
  if (!selectedPet.value) return [];
  
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
  if (!selectedPet.value) return [];
  
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
  if (!selectedPet.value) return [];
  
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
  
  // Pagination computed properties
  const totalItems = computed(() => groupedPetsByOwner.value.length)
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
  const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value))
  
  // Check if this is a new pet entry
  const isNewPet = computed(() => {
  return selectedPet.value && selectedPet.value.id.startsWith('new-')
  })
  
  // Check if vaccine is expired
  function isVaccineExpired(expiryDate) {
  return new Date(expiryDate) < new Date()
  }
  
  // Methods
  function viewPet(pet) {
  selectedPet.value = pet
  editMode.value = false
  showForm.value = false
  }
  
  function editPet(pet) {
  selectedPet.value = pet
  formData.value = JSON.parse(JSON.stringify(pet))
  showForm.value = true
  activeTab.value = 'basics'
  }
  
  function cancelForm() {
  // Always go back to the table view when canceling the form
  selectedPet.value = null
  showForm.value = false
  }
  
  function goBackToList() {
  selectedPet.value = null
  editMode.value = false
  showForm.value = false
  }
  
  function handleAddNewPet() {
  // In a real app, you'd create a new pet object with API-generated values
  const newPet = {
  id: `new-${Date.now()}`,
  name: '',
  species: '',
  breed: '',
  age: null,
  gender: '',
  weight: null,
  photoUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  owner: {
    id: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  },
  medicalHistory: [],
  vaccinations: [],
  documents: []
  }
  
  selectedPet.value = newPet
  formData.value = JSON.parse(JSON.stringify(newPet))
  showForm.value = true
  activeTab.value = 'basics'
  }
  
  function savePet() {
  // In a real app, you'd call an API to save the pet
  const index = pets.value.findIndex(p => p.id === formData.value.id)
  
  // Update the updatedAt timestamp
  formData.value.updatedAt = new Date().toISOString()
  
  if (index !== -1) {
  // Update existing pet
  pets.value[index] = formData.value
  selectedPet.value = formData.value
  } else {
  // Add new pet with a proper ID (would normally come from the backend)
  const newPet = {
    ...formData.value,
    id: formData.value.id.startsWith('new-') ? `00${pets.value.length + 1}` : formData.value.id
  }
  pets.value.push(newPet)
  selectedPet.value = newPet
  }
  
  // After saving, go back to list view
  showForm.value = false
  selectedPet.value = null
  }
  
  // Functions for managing medical history records
  function addMedicalRecord() {
  formData.value.medicalHistory.push({
  date: new Date().toISOString().split('T')[0],
  type: 'Checkup',
  description: '',
  vet: ''
  })
  }
  
  function removeMedicalRecord(index) {
  formData.value.medicalHistory.splice(index, 1)
  }
  
  // Functions for managing vaccinations
  function addVaccination() {
  formData.value.vaccinations.push({
  name: '',
  date: new Date().toISOString().split('T')[0],
  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  })
  }
  
  function removeVaccination(index) {
  formData.value.vaccinations.splice(index, 1)
  }
  
  // Functions for managing documents
  function addDocument() {
  formData.value.documents.push({
  name: '',
  date: new Date().toISOString().split('T')[0],
  type: 'pdf',
  url: '#'
  })
  }
  
  function removeDocument(index) {
  formData.value.documents.splice(index, 1)
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
  }
  
  function applyFilters() {
  showFilterMenu.value = false
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
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
  transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
  opacity: 0;
  }
  </style>