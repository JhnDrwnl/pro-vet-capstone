<template>
  <div class="min-h-screen bg-gray-50 rounded-2xl overflow-hidden">
    <!-- Banner with gradient background -->
    <div 
      class="h-32 sm:h-40 md:h-60 w-full bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl relative"
      style="background-image: linear-gradient(to right, rgb(110, 231, 183), rgb(59, 130, 246));"
    >
      <!-- Mobile 3-dot menu icon - Only visible on mobile -->
      <button 
        v-if="isMobile"
        @click="toggleMobileMenu"
        class="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 z-50"
        data-mobile-menu-trigger
      >
        <MoreVerticalIcon class="w-5 h-5 text-white" />
      </button>
      
      <!-- Mobile menu modal - Positioned absolutely relative to the button -->
      <div 
        v-if="showMobileMenu && isMobile"
        class="absolute top-14 right-4 z-[9999] mobile-menu"
      >
        <div class="bg-white rounded-xl shadow-xl w-48 overflow-hidden border border-gray-200">
          <div class="p-1">
            <button 
              @click="handleSettingsClick"
              class="w-full flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              <SettingsIcon class="w-5 h-5 mr-3" />
              Settings
            </button>
            <button 
              @click="handleAccountSettingsClick"
              class="w-full flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              <UserIcon class="w-5 h-5 mr-3" />
              Account Settings
            </button>
          </div>
          
          <div class="h-[1px] bg-gray-200"></div>
          
          <div class="p-1">
            <button 
              @click="handleSwitchAccounts"
              class="w-full flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              <UserPlusIcon class="w-5 h-5 mr-3" />
              Switch accounts
            </button>
            <button 
              @click="handleLogout"
              class="w-full flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              <LogOutIcon class="w-5 h-5 mr-3" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Section -->
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative -mt-16 sm:-mt-20 md:-mt-24">
        <div class="bg-white rounded-2xl shadow px-2 sm:px-6 py-2 sm:py-6">
          <!-- Show loading spinner during initial data load -->
          <LoadingSpinner v-if="initialLoading" isOverlay text="Loading profile..." />
          
          <!-- Profile Section - Only show when data is loaded -->
          <div v-if="!initialLoading" class="py-4 sm:py-6">
            <!-- Profile Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div class="flex flex-col items-center space-y-2">
                <!-- Profile Image with Progress Circle -->
                <div class="relative group">
                  <!-- Progress Circle -->
                  <svg class="absolute -inset-1 w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] rotate-[-90deg]">
                    <circle
                      :cx="isMobile ? 44 : 52"
                      :cy="isMobile ? 44 : 52"
                      :r="isMobile ? 40 : 48"
                      stroke="#E5E7EB"
                      stroke-width="3"
                      fill="none"
                    />
                    <circle
                      :cx="isMobile ? 44 : 52"
                      :cy="isMobile ? 44 : 52"
                      :r="isMobile ? 40 : 48"
                      :stroke="progressColor"
                      stroke-width="3"
                      fill="none"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="dashOffset"
                      class="transition-all duration-700 ease-out"
                    />
                  </svg>
                  
                  <!-- Profile Image Container -->
                  <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 p-1 relative z-10">
                    <img
                      :src="previewPhotoURL || form.photoURL || defaultPhotoURL"
                      alt="Profile"
                      class="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  
                  <!-- Camera Button -->
                  <button
                    @click="handleCameraClick"
                    @mouseenter="showCameraHover = true"
                    @mouseleave="showCameraHover = false"
                    class="absolute bottom-1 right-1 sm:bottom-2 sm:right-0 bg-[#2d80eb] text-white p-1 sm:p-1.5 rounded-full shadow-lg hover:bg-[#0453b9] transition-transform transform hover:scale-110 z-20"
                  >
                    <CameraIcon class="w-3 h-3 text-white" />
                  </button>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileSelect"
                    accept="image/*"
                    class="hidden"
                  />
                  
                  <!-- Progress Percentage (visible on hover) -->
                  <div 
                    class="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-medium shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    :class="{ 'pointer-events-none opacity-0': showCameraHover || isCameraClicked }"
                  >
                    {{ progressPercentage }}%
                  </div>
                </div>

                <!-- Profile Info -->
                <div class="text-center">
                  <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
                    {{ displayedProfile.firstName }} {{ displayedProfile.lastName }}
                  </h1>
                  <p class="text-sm sm:text-base text-gray-500">{{ form.role || 'Role not set' }}</p>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="border-b pb-1 sm:pb-2 border-gray-200 mb-2 sm:mb-6 overflow-x-auto">
              <nav class="flex space-x-2 justify-center sm:space-x-4 whitespace-nowrap">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="switchTab(tab.id)"
                  :class="[
                    'px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm font-medium rounded-full transition-colors min-w-[70px] sm:min-w-[80px] whitespace-nowrap',
                    currentTab === tab.id
                      ? 'bg-[#EBF5FF] text-[#0066FF]'
                      : 'text-gray-900 hover:text-gray-700'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>

            <!-- Tab Content with Loading States -->
            <div class="mt-4 sm:mt-6 w-full">
              <!-- Edit Profile Tab Content -->
              <div v-if="currentTab === 'edit-profile'" class="relative">
                <!-- Tab-specific loading spinner -->
                <LoadingSpinner v-if="tabLoading" isOverlay text="Loading profile data..." />

                <form @submit.prevent="handleSave" class="space-y-6 sm:space-y-8" style="min-height: 300px;">
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
                            v-model="form.firstName"
                            type="text"
                            placeholder="Enter first name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            v-model="form.lastName"
                            type="text"
                            placeholder="Enter last name"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            v-model="form.username"
                            type="text"
                            placeholder="Enter username"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          <div class="relative">
                            <input
                              v-model="tempForm.dateOfBirth"
                              type="text"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 date-of-birth-input text-sm"
                              @input="handleDateInput"
                              @blur="validateDate"
                              ref="dateInputRef"
                            />
                            <!-- Add the placeholder overlay -->
                            <span 
                              class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                              aria-hidden="true"
                            >
                              <template v-for="(char, index) in dateOfBirthPlaceholder" :key="index">
                                <span 
                                  :class="getCharClass(index)"
                                  :style="{ visibility: char.visible ? 'visible' : 'hidden' }"
                                >
                                  {{ char.value }}
                                </span>
                              </template>
                            </span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">
                            Age
                          </label>
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
                              <span class="text-left">{{ form.gender ? (form.gender.charAt(0).toUpperCase() + form.gender.slice(1)) : 'Select gender' }}</span>
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
                            v-model="form.email"
                            type="email"
                            placeholder="Enter email"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            v-model="form.phone"
                            type="tel"
                            placeholder="Enter phone number"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Alternative Email</label>
                          <input
                            v-model="form.alternativeEmail"
                            type="email"
                            placeholder="Enter alternative email"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
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
                            v-model="form.streetAddress"
                            type="text"
                            placeholder="Enter street address"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                            @focus="initializeAutocomplete"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            v-model="form.city"
                            type="text"
                            placeholder="Enter city"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                          <input
                            v-model="form.province"
                            type="text"
                            placeholder="Enter province"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            v-model="form.postalCode"
                            type="text"
                            placeholder="Enter postal code"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            v-model="form.country"
                            type="text"
                            placeholder="Enter country"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Submit and Cancel Buttons -->
                  <div class="mt-6 flex flex-col sm:flex-row justify-start sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      @click="closeAttachment"
                      class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-200 text-red-800 hover:bg-red-300 transition-colors text-xs sm:text-sm"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      :disabled="isSaving"
                    >
                      {{ isSaving ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Pet Info Tab Content -->
              <div v-else-if="currentTab === 'pet-info'" class="relative">
                <!-- Tab-specific loading spinner for pets tab -->
                <LoadingSpinner v-if="petsLoading" isOverlay text="Loading pets data..." />
                
                <Pets 
                  ref="petsComponent"
                  :key="petsRefreshKey"
                  @pet-added="handlePetAdded"
                  @pet-updated="handlePetUpdated"
                  @pet-deleted="handlePetDeleted"
                  @pets-changed="handlePetsChanged"
                  @close="closeAttachment"
                />
                
                <!-- Submit and Cancel Buttons for Pets Tab -->
                <div v-if="petsComponent && petsComponent.hasPendingChanges && petsComponent.hasPendingChanges()" class="mt-6 flex flex-col sm:flex-row justify-start sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    @click="closeAttachment"
                    class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-200 text-red-800 hover:bg-red-300 transition-colors text-xs sm:text-sm"
                  >
                    Close
                  </button>
                  <button
                    @click="handleSave"
                    class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                    :disabled="isSaving"
                  >
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </div>

              <!-- Security Tab Content -->
              <div v-else-if="currentTab === 'security'" class="relative">
                <!-- Tab-specific loading spinner for security tab -->
                <LoadingSpinner v-if="securityLoading" isOverlay text="Loading security settings..." />
                
                <div class="space-y-6 sm:space-y-8" style="min-height: 300px;">
                  <!-- Quick Actions Section -->
                  <div>
                    <div class="flex items-center mb-4">
                      <div class="bg-purple-100 rounded-full p-2 mr-3">
                        <LockIcon class="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 class="text-md font-semibold text-gray-700">Security Settings</h3>
                    </div>
                    <div class="border-t border-gray-200 pt-4">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Change Password Card -->
                        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div class="flex items-center mb-3">
                            <div class="bg-blue-100 rounded-full p-2 mr-3">
                              <LockIcon class="w-5 h-5 text-blue-500" />
                            </div>
                            <h4 class="text-sm font-medium text-gray-900">Change Password</h4>
                          </div>
                          <p class="text-xs text-gray-500 mb-4">Update your password with advanced security requirements</p>
                          <button
                            @click="router.push('/user/usersettings')"
                            class="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            Change Password
                          </button>
                        </div>
                        
                        <!-- Account Settings Card -->
                        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div class="flex items-center mb-3">
                            <div class="bg-green-100 rounded-full p-2 mr-3">
                              <SettingsIcon class="w-5 h-5 text-green-500" />
                            </div>
                            <h4 class="text-sm font-medium text-gray-900">Account Settings</h4>
                          </div>
                          <p class="text-xs text-gray-500 mb-4">Manage your profile picture and account preferences</p>
                          <button
                            @click="router.push('/user/usersettings')"
                            class="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            Manage Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Email Verification Status -->
                  <div v-if="!isEmailVerified" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <AlertTriangleIcon class="h-5 w-5 text-yellow-400 mr-2" />
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-yellow-800">Email Not Verified</h4>
                        <p class="text-sm text-yellow-700 mt-1">
                          Your email address is not verified. Please verify your email for enhanced security.
                        </p>
                      </div>
                      <button
                        type="button"
                        @click="sendVerificationEmail"
                        :disabled="verificationEmailSent || sendingVerification"
                        class="ml-4 px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ sendingVerification ? 'Sending...' : verificationEmailSent ? 'Sent!' : 'Send Verification' }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Submit and Cancel Buttons for Security Tab -->
                <div class="mt-6 flex flex-col sm:flex-row justify-start sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    @click="closeAttachment"
                    class="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-200 text-red-800 hover:bg-red-300 transition-colors text-xs sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Overlay to close mobile menu when clicking outside -->
    <div 
      v-if="showMobileMenu && isMobile"
      class="fixed inset-0 z-[9998]"
      @click="showMobileMenu = false"
    ></div>
    
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

    <!-- Email Verification Modal -->
    <div v-if="showEmailVerificationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
          <MailIcon class="h-6 w-6 text-blue-600" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Email Verification Required</h3>
        <p class="text-sm text-gray-500 text-center mb-6">
          We've sent a verification email to your email address. Please verify your email and then try changing your password again.
        </p>
        <div class="flex justify-center space-x-3">
          <button 
            @click="showEmailVerificationModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="sendVerificationEmail"
            :disabled="sendingVerification"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {{ sendingVerification ? 'Sending...' : 'Resend Email' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading Spinner for operations (not initial loading) -->
    <LoadingSpinner v-if="loading && !initialLoading" isOverlay text="Processing..." />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Camera as CameraIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  MoreVertical as MoreVerticalIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  UserPlus as UserPlusIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Check as CheckIcon,
  X as XIcon,
  AlertTriangle as AlertTriangleIcon,
  Mail as MailIcon
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/modules/authStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import Pets from '@/views/user/Pets.vue';
import { usePetsStore } from '@/stores/modules/petsStore';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// Import Firebase Auth functions
import { 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { auth } from '@shared/firebase';

// Import Firebase Storage functions
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@shared/firebase';

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['close', 'save', 'update:modelValue', 'pet-added', 'pet-updated', 'pet-deleted', 'pets-changed']);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const petsStore = usePetsStore();

const tabs = [
  { id: 'edit-profile', name: 'Profile Info' },
  { id: 'pet-info', name: 'My Pets' },
  { id: 'security', name: 'Security' },
];

const currentTab = ref('edit-profile');

const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  dateOfBirth: '',
  age: null,
  gender: '',
  email: '',
  phone: '',

  alternativeEmail: '',
  streetAddress: '',
  city: '',
  province: '',
  postalCode: '',
  country: '',
  photoURL: '',
  pets: [],
  emailVerified: false, // Add this to track Firestore email verification status
});

const displayedProfile = ref({});
const dateInput = ref('');
const datePlaceholder = ref('YYYY-MM-DD');
const dateInputRef = ref(null);
const fileInput = ref(null);
const addressInput = ref(null);
const showCameraHover = ref(false);
const isCameraClicked = ref(false);
const isSaving = ref(false);
const petsComponent = ref(null);
const petsRefreshKey = ref(0);

let autocomplete = null;
let googleMapsLoaded = false;

// Add refs for profile picture handling
const selectedProfilePicture = ref(null);
const previewPhotoURL = ref(null);
const photoChanged = ref(false);

// Add this new ref for gender dropdown
const isGenderOpen = ref(false);

// Add new state variables for loading and modals
const initialLoading = ref(true);
const loading = ref(false);
const tabLoading = ref(false);
const petsLoading = ref(false);
const securityLoading = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const statusMessage = ref('');
const errorMessage = ref('');

// Add new state variables for mobile menu
const isMobile = ref(window.innerWidth < 640);
const showMobileMenu = ref(false);

// Password change form and states
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isChangingPassword = ref(false);
const verificationEmailSent = ref(false);
const sendingVerification = ref(false);
const showEmailVerificationModal = ref(false);

// Password strength validation
const passwordRequirements = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
});

// Fixed the object syntax error
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

// Fixed SVG placeholder
const defaultPhotoURL = ref('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E');

const tempForm = ref({});

// Computed property to check email verification from both sources
const isEmailVerified = computed(() => {
  // Check both Firebase Auth and Firestore document
  const firebaseAuthVerified = authStore.user?.emailVerified || false;
  const firestoreVerified = form.value?.emailVerified || displayedProfile.value?.emailVerified || false;
  
  // Return true if either source shows verification
  return firebaseAuthVerified || firestoreVerified;
});

// Computed properties for password validation
const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const passwordStrength = computed(() => {
  const password = passwordForm.value.newPassword;
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  return score;
});

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength === 0) return 'Very Weak';
  if (strength === 1) return 'Weak';
  if (strength === 2) return 'Fair';
  if (strength === 3) return 'Good';
  if (strength === 4) return 'Strong';
  return 'Very Strong';
});

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'bg-red-500';
  if (strength === 2) return 'bg-yellow-500';
  if (strength === 3) return 'bg-blue-500';
  if (strength >= 4) return 'bg-green-500';
  return 'bg-gray-300';
});

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'text-red-600';
  if (strength === 2) return 'text-yellow-600';
  if (strength === 3) return 'text-blue-600';
  if (strength >= 4) return 'text-green-600';
  return 'text-gray-600';
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`;
});

const canChangePassword = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordsMatch.value &&
         passwordStrength.value >= 3 &&
         isEmailVerified.value; // Use the computed property instead
});

// Watch for window resize to update mobile state
const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
  if (!isMobile.value) {
    showMobileMenu.value = false;
  }
};

// New methods for mobile menu
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const handleSettingsClick = () => {
  showMobileMenu.value = false;
  router.push('/user/usersettings');
};

const handleAccountSettingsClick = () => {
  showMobileMenu.value = false;
  router.push('/user/usersettings');
};

const handleSwitchAccounts = () => {
  showMobileMenu.value = false;
  console.log('Switch accounts clicked');
};

const handleLogout = async () => {
  showMobileMenu.value = false;
  try {
    await authStore.logoutUser();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
    errorMessage.value = 'Failed to log out. Please try again.';
    showErrorModal.value = true;
  }
};

// Password validation method
const validatePasswordStrength = () => {
  const password = passwordForm.value.newPassword;
  
  passwordRequirements.value = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

// Send email verification
const sendVerificationEmail = async () => {
  if (!auth.currentUser) return;
  
  sendingVerification.value = true;
  try {
    await sendEmailVerification(auth.currentUser);
    verificationEmailSent.value = true;
    statusMessage.value = 'Verification email sent! Please check your inbox.';
    showSuccessModal.value = true;
    showEmailVerificationModal.value = false;
  } catch (error) {
    console.error('Error sending verification email:', error);
    errorMessage.value = 'Failed to send verification email. Please try again.';
    showErrorModal.value = true;
  } finally {
    sendingVerification.value = false;
  }
};

// Handle password change
const handlePasswordChange = async () => {
  if (!canChangePassword.value || isChangingPassword.value) return;
  
  isChangingPassword.value = true;
  
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check if email is verified (from either source)
    await reload(user);
    if (!isEmailVerified.value) {
      showEmailVerificationModal.value = true;
      return;
    }
    
    // Reauthenticate user with current password
    const credential = EmailAuthProvider.credential(
      user.email,
      passwordForm.value.currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, passwordForm.value.newPassword);
    
    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // Show success message
    statusMessage.value = 'Password changed successfully!';
    showSuccessModal.value = true;
    
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error.code === 'auth/wrong-password') {
      errorMessage.value = 'Current password is incorrect.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage.value = 'New password is too weak.';
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage.value = 'Please log out and log back in before changing your password.';
    } else {
      errorMessage.value = error.message || 'Failed to change password. Please try again.';
    }
    
    showErrorModal.value = true;
  } finally {
    isChangingPassword.value = false;
  }
};

// Modified tab switching method to include security tab
const switchTab = async (tabId) => {
  if (currentTab.value === tabId) return;
  
  if (tabId === 'edit-profile') {
    tabLoading.value = true;
    try {
      if (authStore.user && authStore.user.userId) {
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      errorMessage.value = 'Failed to load profile data. Please try again.';
      showErrorModal.value = true;
    } finally {
      tabLoading.value = false;
    }
  } else if (tabId === 'pet-info') {
    petsLoading.value = true;
    try {
      currentTab.value = tabId;
      await nextTick();
      
      if (petsComponent.value && petsComponent.value.fetchPets) {
        await petsComponent.value.fetchPets();
      }
    } catch (error) {
      console.error('Error loading pets data:', error);
      errorMessage.value = 'Failed to load pets data. Please try again.';
      showErrorModal.value = true;
    } finally {
      petsLoading.value = false;
    }
    return;
  } else if (tabId === 'security') {
    securityLoading.value = true;
    try {
      // Reset password form when switching to security tab
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      showCurrentPassword.value = false;
      showNewPassword.value = false;
      showConfirmPassword.value = false;
      verificationEmailSent.value = false;
    } catch (error) {
      console.error('Error loading security settings:', error);
      errorMessage.value = 'Failed to load security settings. Please try again.';
      showErrorModal.value = true;
    } finally {
      securityLoading.value = false;
    }
  }
  
  currentTab.value = tabId;
};

watch(form, (newForm) => {
  profileStore.calculateCompletionPercentage(newForm);
}, { deep: true });

watch(() => route.query.tab, (newTab) => {
  if (newTab && tabs.some(tab => tab.id === newTab)) {
    switchTab(newTab);
  }
}, { immediate: true });

const loadGoogleMapsAPI = () => {
  if (typeof window.google === 'undefined') {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      console.log('Google Maps API loaded');
    };
    document.head.appendChild(script);
  } else {
    googleMapsLoaded = true;
  }
};

onMounted(async () => {
  // Initialize all refs
  selectedProfilePicture.value = null;
  previewPhotoURL.value = null;
  photoChanged.value = false;
  isGenderOpen.value = false;
  initialLoading.value = true;
  loading.value = false;
  tabLoading.value = false;
  petsLoading.value = false;
  securityLoading.value = false;
  showSuccessModal.value = false;
  showErrorModal.value = false;
  statusMessage.value = '';
  errorMessage.value = '';
  showMobileMenu.value = false;
  
  try {
    if (authStore.user && authStore.user.userId) {
      await fetchUserProfile();
    }
    
    if (route.query.tab && tabs.some(tab => tab.id === route.query.tab)) {
      switchTab(route.query.tab);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    errorMessage.value = 'Failed to load profile data. Please try again.';
    showErrorModal.value = true;
  } finally {
    initialLoading.value = false;
  }
  
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  document.addEventListener('keydown', handleKeyDown);
  loadGoogleMapsAPI();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('keydown', handleKeyDown);
  if (autocomplete) {
    if (window.google && window.google.maps) {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    }
  }
});

watch(() => props.isSidebarOpen, async (newValue) => {
  if (newValue && authStore.user && authStore.user.userId) {
    tabLoading.value = true;
    try {
      await fetchUserProfile();
      dateInput.value = form.value.dateOfBirth || '';
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      tabLoading.value = false;
    }
  }
});

const fetchUserProfile = async () => {
  try {
    const profile = await profileStore.fetchUserProfile(authStore.user.userId);
    if (profile) {
      form.value = { ...profile };
      tempForm.value = { ...profile };
      displayedProfile.value = { ...profile };
      dateInput.value = profile.dateOfBirth || '';
      
      selectedProfilePicture.value = null;
      previewPhotoURL.value = null;
      photoChanged.value = false;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

const selectGender = (gender) => {
  form.value.gender = gender;
  isGenderOpen.value = false;
};

const handleSave = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  loading.value = true;
  
  try {
    if (authStore.user && authStore.user.userId) {
      const userId = authStore.user.userId;
      
      if (currentTab.value === 'edit-profile') {
        console.log('Saving only profile data...');
        
        const updatedFormData = {
          ...displayedProfile.value,
          ...form.value,
          dateOfBirth: tempForm.value.dateOfBirth,
          age: tempForm.value.age,
          updatedAt: new Date()
        };
        
        if (photoChanged.value && selectedProfilePicture.value) {
          const file = selectedProfilePicture.value;
          const fileRef = storageRef(storage, `profile-pictures/${userId}/${Date.now()}_${file.name}`);
          
          console.log('Uploading file to Firebase Storage...');
          const snapshot = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log('File uploaded successfully. Download URL:', downloadURL);
          
          updatedFormData.photoURL = downloadURL;
        }
        
        console.log('Saving profile data to Firestore:', updatedFormData);
        
        const success = await profileStore.updateUserProfile(userId, updatedFormData);
        
        if (success) {
          displayedProfile.value = { ...updatedFormData };
          form.value = { ...updatedFormData };
          
          if (photoChanged.value) {
            selectedProfilePicture.value = null;
            previewPhotoURL.value = null;
            photoChanged.value = false;
          }
          
          statusMessage.value = 'Profile updated successfully!';
          showSuccessModal.value = true;
          
          console.log('Profile updated successfully!');
        } else {
          throw new Error('Failed to update profile. Please try again.');
        }
      } else if (currentTab.value === 'pet-info' && petsComponent.value) {
        console.log('Saving only pet data...');
        
        if (petsComponent.value.hasPendingChanges && petsComponent.value.hasPendingChanges()) {
          const petSaveSuccess = await petsComponent.value.saveAllChanges();
          
          if (!petSaveSuccess) {
            throw new Error('Failed to save pet changes. Please try again.');
          } else {
            console.log('Pet changes saved successfully!');
            
            petsRefreshKey.value++;
            
            if (petsComponent.value && petsComponent.value.fetchPets) {
              await petsComponent.value.fetchPets();
            }
            
            await petsStore.fetchUserPets(userId);
            
            statusMessage.value = 'Pet information updated successfully!';
            showSuccessModal.value = true;
          }
        } else {
          console.log('No pet changes to save.');
          statusMessage.value = 'No changes to save.';
          showSuccessModal.value = true;
        }
      }
    }
  } catch (error) {
    console.error('Error updating data:', error);
    errorMessage.value = error.message || 'An error occurred while saving changes.';
    showErrorModal.value = true;
  } finally {
    isSaving.value = false;
    loading.value = false;
  }
};

const handlePetAdded = (pet) => {
  console.log('Pet added locally:', pet);
  petsRefreshKey.value++;
  emit('pet-added', pet);
};

const handlePetUpdated = (pet) => {
  console.log('Pet updated locally:', pet);
  petsRefreshKey.value++;
  emit('pet-updated', pet);
};

const handlePetDeleted = (pet) => {
  console.log('Pet deleted locally:', pet);
  petsRefreshKey.value++;
  emit('pet-deleted', pet);
};

const handlePetsChanged = (pets) => {
  console.log('Pets list changed:', pets);
  emit('pets-changed', pets);
};

const closeAttachment = () => {
  form.value = { ...displayedProfile.value };
  tempForm.value = { ...displayedProfile.value };
  selectedProfilePicture.value = null;
  previewPhotoURL.value = null;
  photoChanged.value = false;
  router.push('/admin/dashboard');
  emit('close');
};

const calculateProgress = computed(() => {
  const fields = [
    'firstName',
    'lastName',
    'username',
    'dateOfBirth',
    'age',
    'gender',
    'email',
    'phone',

    'alternativeEmail',
    'streetAddress',
    'city',
    'province',
    'postalCode',
    'country',
    'photoURL'
  ];

  const filledFields = fields.filter(field => {
    const value = photoChanged.value && field === 'photoURL' 
      ? previewPhotoURL.value || form.value[field]
      : form.value[field];
    return value && value !== null && value !== undefined && String(value).trim() !== '';
  }).length;

  return Math.round((filledFields / fields.length) * 100);
});

const circumference = computed(() => 2 * Math.PI * (isMobile.value ? 40 : 48));

const dashOffset = computed(() => 
  circumference.value - (calculateProgress.value / 100) * circumference.value
);

const progressPercentage = computed(() => 
  Math.round(calculateProgress.value)
);

const progressColor = computed(() => {
  if (calculateProgress.value < 30) return '#EF4444';
  if (calculateProgress.value < 70) return '#F59E0B';
  return '#10B981';
});

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

const calculatedAge = computed(() => {
  if (!form.value.dateOfBirth) return null;
  return calculateAge(form.value.dateOfBirth);
});

const handleClickOutside = (event) => {
  if (isGenderOpen.value && !event.target.closest('.gender-dropdown')) {
    isGenderOpen.value = false;
  }
  
  if (showMobileMenu.value && !event.target.closest('.mobile-menu') && !event.target.closest('button[data-mobile-menu-trigger]')) {
    showMobileMenu.value = false;
  }
};

const handleDateInput = (event) => {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  let value = input.value.replace(/[^0-9-]/g, '');
  const parts = value.split('-');
  while (parts.length < 3) {
    parts.push('');
  }
  value = parts.join('-');
  const maxLengths = [4, 2, 2];
  const newParts = value.split('-').map((part, index) => part.slice(0, maxLengths[index]));
  value = newParts.join('-');
  tempForm.value.dateOfBirth = value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    tempForm.value.age = calculateAge(value);
  }
  nextTick(() => {
    input.selectionStart = input.selectionEnd = Math.min(cursorPosition, value.length);
  });
};

const validateDate = () => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (datePattern.test(tempForm.value.dateOfBirth)) {
    tempForm.value.age = calculateAge(tempForm.value.dateOfBirth);
  } else {
    tempForm.value.dateOfBirth = '';
  }
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    selectedProfilePicture.value = file;
    photoChanged.value = true;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewPhotoURL.value = e.target.result;
    };
    reader.readAsDataURL(file);
    
    console.log('Profile picture selected and preview shown. Will upload on save.');
  } catch (error) {
    console.error('Error handling profile picture selection:', error);
    errorMessage.value = 'Failed to preview profile picture. Please try again.';
    showErrorModal.value = true;
  }
};

const handlePlaceSelect = () => {
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded.');
    return;
  }

  const place = autocomplete.getPlace();
  if (!place.geometry) return;
  
  let addressComponents = {
    street_number: '',
    route: '',
    sublocality_level_1: '',
    locality: '',
    administrative_area_level_2: '',
    administrative_area_level_1: '',
    country: '',
    postal_code: ''
  };
  
  for (const component of place.address_components) {
    const componentType = component.types[0];
    if (addressComponents.hasOwnProperty(componentType)) {
      addressComponents[componentType] = component.long_name;
    }
  }
  
  form.value.streetAddress = `${addressComponents.street_number} ${addressComponents.route}`.trim();
  form.value.city = addressComponents.locality || addressComponents.sublocality_level_1 || addressComponents.administrative_area_level_2;
  
  if (addressComponents.administrative_area_level_1 === 'MIMAROPA') {
    const orientalMindoroCities = Object.keys(orientalMindoroPostalCodes);
    if (orientalMindoroCities.includes(form.value.city)) {
      form.value.province = 'Oriental Mindoro';
    } else {
      form.value.province = 'MIMAROPA';
    }
  } else if (addressComponents.administrative_area_level_1 === 'Oriental Mindoro') {
    form.value.province = 'Oriental Mindoro';
  } else {
    form.value.province = addressComponents.administrative_area_level_1 || '';
  }
  
  form.value.country = addressComponents.country;
  
  if (addressComponents.postal_code) {
    form.value.postalCode = addressComponents.postal_code;
  } else {
    const city = form.value.city.trim();
    form.value.postalCode = orientalMindoroPostalCodes[city] || '';
  }
  
  if (!form.value.streetAddress) {
    form.value.streetAddress = place.formatted_address;
  }
};

const initializeAutocomplete = () => {
  if (!googleMapsLoaded) {
    console.warn('Google Maps API not loaded yet. Retrying in 1 second.');
    setTimeout(initializeAutocomplete, 1000);
    return;
  }

  if (autocomplete) {
    return;
  }

  const addressInput = document.getElementById('addressInput');
  if (addressInput) {
    autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
      types: ['geocode'],
      componentRestrictions: { country: 'ph' }
    });
    autocomplete.addListener('place_changed', handlePlaceSelect);
    console.log('Autocomplete initialized');
  } else {
    console.warn('Address input not found');
  }
};

const handleCameraClick = () => {
  isCameraClicked.value = true;
  fileInput.value.click();
  setTimeout(() => {
    isCameraClicked.value = false;
  }, 300);
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    if (isGenderOpen.value) {
      isGenderOpen.value = false;
    }
    if (showSuccessModal.value) {
      showSuccessModal.value = false;
    }
    if (showErrorModal.value) {
      showErrorModal.value = false;
    }
    if (showMobileMenu.value) {
      showMobileMenu.value = false;
    }
    if (showEmailVerificationModal.value) {
      showEmailVerificationModal.value = false;
    }
  }
};

const handleAgeInput = (event) => {
  tempForm.value.age = event.target.value;
};

const dateOfBirthPlaceholder = ref([
  { value: 'Y', visible: false },
  { value: 'Y', visible: false },
  { value: 'Y', visible: false },
  { value: 'Y', visible: false },
  { value: '-', visible: false },
  { value: 'M', visible: false },
  { value: 'M', visible: false },
  { value: '-', visible: false },
  { value: 'D', visible: false },
  { value: 'D', visible: false }
]);

const getCharClass = (index) => {
  const visible = tempForm.value.dateOfBirth && index < tempForm.value.dateOfBirth.length;
  dateOfBirthPlaceholder.value[index].visible = !visible;
  return {
    'text-gray-400': !visible,
    'font-bold': visible
  };
};
</script>

<style scoped>
.date-of-birth-input {
  font-family: monospace;
}

.h-32 {
  background-image: linear-gradient(to right, rgb(110, 231, 183), rgb(59, 130, 246));
}

@media (max-width: 640px) {
  input, select {
    font-size: 16px; /* Prevents zoom on focus in iOS */
  }
}

.gender-dropdown {
  position: relative;
  z-index: 30;
}

.mobile-menu {
  position: absolute;
  z-index: 9999;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}
</style>