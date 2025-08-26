<template>
  <div class="p-6 bg-white rounded-2xl">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Account Settings</h1>
      <p class="text-gray-500 mt-1">Manage your account preferences.</p>
    </div>
    
    <!-- Navigation Tabs -->
    <div class="mb-6">
      <nav class="flex space-x-4 sm:space-x-8 mb-4 overflow-x-auto">
        <button
          v-for="tab in tabs" 
          :key="tab.id"
          @click="currentTab = tab.id"
          :class="[
            'whitespace-nowrap py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-full transition-colors',
            currentTab === tab.id 
              ? 'bg-[#EBF5FF] text-[#0066FF]'
              : 'text-gray-800 hover:text-gray-700'
          ]"
        >
          <div class="flex items-center space-x-1 sm:space-x-2">
            <component :is="tab.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{{ tab.name }}</span>
          </div>
        </button>
      </nav>
      <div class="border-b border-gray-200"></div>
    </div>

    <!-- Main Content -->
    <div>
      <!-- Account Tab Content -->
      <div v-if="currentTab === 'account'" class="flex flex-col gap-6 sm:gap-8">
        <div class="flex flex-col md:flex-row gap-6 sm:gap-8">
          <!-- Change Profile Container -->
          <div class="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-6">
                <UserIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <div>
                  <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Change Profile</h2>
                  <p class="text-xs sm:text-sm text-gray-500">Change your profile picture from here</p>
                </div>
              </div>
              
              <div class="flex flex-col items-center">
                <div class="relative">
                  <img
                    :src="profileImage || profilePlaceholder"
                    alt="Profile"
                    class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 object-cover"
                  />
                </div>
                
                <div class="mt-6 sm:mt-8 flex space-x-4">
                  <button
                    @click="$refs.fileInput.click()"
                    class="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2 text-xs sm:text-sm"
                  >
                    <UploadIcon class="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Upload</span>
                  </button>
                  <button
                    @click="resetImage"
                    class="px-3 sm:px-5 py-1.5 sm:py-2.5 border border-orange-300 text-orange-400 rounded-full hover:bg-gray-50 transition-colors flex items-center space-x-2 text-xs sm:text-sm"
                  >
                    <RefreshCcwIcon class="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Reset</span>
                  </button>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    class="hidden"
                    @change="handleImageUpload"
                  />
                </div>
                
                <div class="mt-4 sm:mt-5 text-center">
                  <p class="text-xs sm:text-sm text-gray-500">
                    Allowed JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Change Password Container -->
          <div class="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="p-4 sm:p-6">
              <div class="flex items-center gap-3 mb-6">
                <KeyIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <div>
                  <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Change Password</h2>
                  <p class="text-xs sm:text-sm text-gray-500">Your password must meet the requirements below</p>
                </div>
              </div>
              
              <form @submit.prevent="changePassword" class="space-y-4 sm:space-y-5">
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.current"
                      :type="showPassword.current ? 'text' : 'password'"
                      class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                      required
                    />
                    <button 
                      type="button"
                      @click="togglePassword('current')"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <component 
                        :is="showPassword.current ? EyeOffIcon : EyeIcon"
                        class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                      />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.new"
                      :type="showPassword.new ? 'text' : 'password'"
                      class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                      required
                      @input="validatePasswordStrength"
                    />
                    <button 
                      type="button"
                      @click="togglePassword('new')"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <component 
                        :is="showPassword.new ? EyeOffIcon : EyeIcon"
                        class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                      />
                    </button>
                  </div>
                  
                  <!-- Password Strength Indicator -->
                  <div v-if="passwordForm.new" class="mt-2">
                    <div class="flex items-center space-x-2">
                      <div class="flex-1 bg-gray-200 rounded-full h-2 sm:h-6">
                        <div 
                          class="h-2 sm:h-6 rounded-full transition-all duration-300"
                          :class="passwordStrengthColor"
                          :style="{ width: passwordStrengthWidth }"
                        ></div>
                      </div>
                      <span class="text-xs font-medium" :class="passwordStrengthTextColor">
                        {{ passwordStrengthText }}
                      </span>
                    </div>
                    
                    <!-- Password Requirements -->
                    <div class="mt-2 space-y-1">
                      <div class="flex items-center space-x-2">
                        <CheckIcon v-if="passwordRequirements.length" class="h-3 w-3 text-green-500" />
                        <XIcon v-else class="h-3 w-3 text-red-500" />
                        <span class="text-xs" :class="passwordRequirements.length ? 'text-green-600' : 'text-red-600'">
                          At least 8 characters
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <CheckIcon v-if="passwordRequirements.uppercase" class="h-3 w-3 text-green-500" />
                        <XIcon v-else class="h-3 w-3 text-red-500" />
                        <span class="text-xs" :class="passwordRequirements.uppercase ? 'text-green-600' : 'text-red-600'">
                          One uppercase letter
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <CheckIcon v-if="passwordRequirements.lowercase" class="h-3 w-3 text-green-500" />
                        <XIcon v-else class="h-3 w-3 text-red-500" />
                        <span class="text-xs" :class="passwordRequirements.lowercase ? 'text-green-600' : 'text-red-600'">
                          One lowercase letter
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <CheckIcon v-if="passwordRequirements.number" class="h-3 w-3 text-green-500" />
                        <XIcon v-else class="h-3 w-3 text-red-500" />
                        <span class="text-xs" :class="passwordRequirements.number ? 'text-green-600' : 'text-red-600'">
                          One number
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <CheckIcon v-if="passwordRequirements.special" class="h-3 w-3 text-green-500" />
                        <XIcon v-else class="h-3 w-3 text-red-500" />
                        <span class="text-xs" :class="passwordRequirements.special ? 'text-green-600' : 'text-red-600'">
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div class="relative">
                    <input
                      v-model="passwordForm.confirm"
                      :type="showPassword.confirm ? 'text' : 'password'"
                      class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                      :class="{ 'border-red-300': passwordForm.confirm && !passwordsMatch }"
                      required
                    />
                    <button 
                      type="button"
                      @click="togglePassword('confirm')"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <component 
                        :is="showPassword.confirm ? EyeOffIcon : EyeIcon"
                        class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                      />
                    </button>
                  </div>
                  <p v-if="passwordForm.confirm && !passwordsMatch" class="mt-1 text-xs text-red-600">
                    Passwords do not match
                  </p>
                </div>

                <!-- Email Verification Status -->
                <div v-if="!isEmailVerified" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <AlertTriangleIcon class="h-5 w-5 text-yellow-400 mr-2" />
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-yellow-800">Email Not Verified</h4>
                      <p class="text-sm text-yellow-700 mt-1">
                        Your email address is not verified. You'll need to verify your email before changing your password.
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

                <button
                  type="submit"
                  class="w-full px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mt-6 sm:mt-8 text-xs sm:text-sm"
                  :disabled="isUpdating || !canChangePassword"
                >
                  <LoaderIcon v-if="isUpdating" class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>{{ isUpdating ? 'Updating...' : 'Update Password' }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Delete Account Section (Danger Zone) -->
        <div class="bg-white rounded-xl border border-red-100 overflow-hidden">
          <div class="p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4 sm:mb-6">
              <AlertTriangleIcon class="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <div>
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Delete Account</h2>
                <p class="text-xs sm:text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
            </div>
            
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="text-xs sm:text-sm text-gray-600 max-w-lg">
                <p>Deleting your account will:</p>
                <ul class="list-disc ml-5 mt-2 space-y-1">
                  <li>Remove all your personal information</li>
                  <li>Delete all your data and content</li>
                </ul>
              </div>
              
              <button
                @click="showDeleteConfirmation = true"
                class="w-full md:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center md:justify-start space-x-2 mt-4 md:mt-0 text-xs sm:text-sm"
              >
                <TrashIcon class="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Tab Content -->
      <div v-if="currentTab === 'notification'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="p-4 sm:p-6">
          <div class="flex items-center gap-3 mb-4 sm:mb-6">
            <BellIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Notification Settings</h2>
              <p class="text-xs sm:text-sm text-gray-500">Manage your notification preferences</p>
            </div>
          </div>
          
          <div class="space-y-4 sm:space-y-5">
            <div class="flex items-center justify-between py-3 sm:py-4 border-b border-gray-200">
              <div>
                <h3 class="text-xs sm:text-sm font-medium text-gray-900">Push Notifications</h3>
                <p class="text-xs sm:text-sm text-gray-500">Receive push notifications</p>
              </div>
              <div class="flex items-center gap-3">
                <span v-if="notificationSaved" class="text-xs text-green-500 animate-fade-out">
                  <CheckIcon class="w-3 h-3 sm:w-4 sm:h-4 inline" /> Saved
                </span>
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input 
                      type="checkbox"
                      v-model="pushNotificationEnabled"
                      class="sr-only"
                      @change="autoSaveNotification"
                    />
                    <div 
                      class="block w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-200"
                      :class="pushNotificationEnabled ? 'bg-blue-500' : 'bg-gray-300'"
                    ></div>
                    <div 
                      class="absolute left-1 top-1 w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full transition-transform duration-200 transform"
                      :class="pushNotificationEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'"
                    ></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="mt-6 sm:mt-8 flex justify-end">
            <button
              @click="saveNotificationSettings"
              class="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2 text-xs sm:text-sm"
              :disabled="isSavingNotifications"
            >
              <LoaderIcon v-if="isSavingNotifications" class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span>{{ isSavingNotifications ? 'Saving...' : 'Save Settings' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Security Tab Content - Enhanced Device Management -->
      <div v-if="currentTab === 'security'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="p-4 sm:p-6">
          <div class="flex items-center gap-3 mb-4 sm:mb-6">
            <MonitorIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Devices</h2>
              <p class="text-xs sm:text-sm text-gray-500">Manage your logged in devices and sessions</p>
            </div>
          </div>
          
          <button 
            @click="showSignOutAllConfirmation = true"
            :disabled="isSigningOutAll || devices.filter(d => !d.isCurrent).length === 0"
            class="w-full px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors mb-4 sm:mb-6 text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <LoaderIcon v-if="isSigningOutAll" class="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span>{{ isSigningOutAll ? 'Signing Out...' : 'Sign Out From All Other Devices' }}</span>
          </button>
          
          <!-- Loading state for devices -->
          <div v-if="isLoadingDevices" class="flex justify-center py-8">
            <LoaderIcon class="w-6 h-6 animate-spin text-gray-400" />
          </div>
          
          <!-- Devices list -->
          <div v-else-if="devices.length > 0" class="space-y-3 sm:space-y-5 mt-4 sm:mt-6">
            <div 
              v-for="device in devices"
              :key="device.id"
              class="flex items-start justify-between p-2 sm:p-3 bg-gray-50 rounded-xl"
              :class="{ 'ring-2 ring-blue-200 bg-blue-50': device.isCurrent }"
            >
              <div class="flex gap-2 sm:gap-3">
                <component 
                  :is="getDeviceIcon(device.deviceType)"
                  class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1" 
                />
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs sm:text-sm font-medium">{{ device.deviceName }}</p>
                    <span v-if="device.isCurrent" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Current
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-500">
                    {{ device.location }} • {{ formatLastActive(device.lastActive) }}
                  </p>
                  <p class="text-xs text-gray-400">{{ device.browser }} • {{ device.os }}</p>
                </div>
              </div>
              <div class="relative">
                <button 
                  @click="toggleDeviceMenu(device.id)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                >
                  <MoreVerticalIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <!-- Device menu dropdown -->
                <div 
                  v-if="activeDeviceMenu === device.id"
                  class="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                >
                  <button
                    v-if="!device.isCurrent"
                    @click="confirmSignOutDevice(device)"
                    :disabled="signingOutDevices.includes(device.id)"
                    class="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    {{ signingOutDevices.includes(device.id) ? 'Signing Out...' : 'Sign Out' }}
                  </button>
                  <button
                    @click="viewDeviceDetails(device)"
                    class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-else class="text-center py-8">
            <MonitorIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p class="text-sm text-gray-500">No devices found</p>
          </div>
          
          <div class="mt-6 sm:mt-8 text-center">
            <a href="#" class="text-xs sm:text-sm text-blue-500 hover:text-blue-600">Need Help?</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sign Out Device Confirmation Modal -->
  <div v-if="showSignOutDeviceConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
      <div class="text-center mb-4 sm:mb-6">
        <AlertCircleIcon class="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
        <h3 class="text-lg sm:text-xl font-bold text-gray-900">Sign Out Device</h3>
        <p class="text-xs sm:text-sm text-gray-600 mt-2">
          Are you sure you want to sign out from "{{ deviceToSignOut?.deviceName }}"? 
          This will end the session on that device.
        </p>
      </div>
      
      <div class="flex space-x-3 sm:space-x-4">
        <button
          @click="showSignOutDeviceConfirmation = false"
          class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        >
          Cancel
        </button>
        <button
          @click="signOutDevice(deviceToSignOut.id)"
          class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-xs sm:text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>

  <!-- Sign Out All Devices Confirmation Modal -->
  <div v-if="showSignOutAllConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
      <div class="text-center mb-4 sm:mb-6">
        <AlertCircleIcon class="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
        <h3 class="text-lg sm:text-xl font-bold text-gray-900">Sign Out All Devices</h3>
        <p class="text-xs sm:text-sm text-gray-600 mt-2">
          This will sign you out from all other devices except this one. You'll need to sign in again on those devices.
        </p>
        <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p class="text-xs text-yellow-800">
            <strong>{{ devices.filter(d => !d.isCurrent).length }}</strong> other device(s) will be signed out.
          </p>
        </div>
      </div>
      
      <div class="flex space-x-3 sm:space-x-4">
        <button
          @click="showSignOutAllConfirmation = false"
          class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        >
          Cancel
        </button>
        <button
          @click="signOutFromAllDevices"
          class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-xs sm:text-sm"
        >
          Sign Out All
        </button>
      </div>
    </div>
  </div>

  <!-- Device Details Modal -->
  <div v-if="showDeviceDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Device Details</h3>
        <button @click="showDeviceDetails = false" class="text-gray-400 hover:text-gray-600">
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="selectedDevice" class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-700">Device Name</label>
          <p class="text-sm text-gray-900">{{ selectedDevice.deviceName }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Browser</label>
          <p class="text-sm text-gray-900">{{ selectedDevice.browser }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Operating System</label>
          <p class="text-sm text-gray-900">{{ selectedDevice.os }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">IP Address</label>
          <p class="text-sm text-gray-900">{{ selectedDevice.ipAddress }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Location</label>
          <p class="text-sm text-gray-900">{{ selectedDevice.location }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">Last Active</label>
          <p class="text-sm text-gray-900">{{ formatLastActive(selectedDevice.lastActive) }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700">First Login</label>
          <p class="text-sm text-gray-900">{{ formatDate(selectedDevice.firstLogin) }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Account Confirmation Modal -->
  <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
      <div class="text-center mb-4 sm:mb-6">
        <AlertCircleIcon class="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
        <h3 class="text-lg sm:text-xl font-bold text-gray-900">Delete Account</h3>
        <p class="text-xs sm:text-sm text-gray-600 mt-2">Are you sure you want to delete your account? This action cannot be undone.</p>
      </div>
      
      <div class="mb-4 sm:mb-6">
        <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Type "delete" to confirm</label>
        <input
          v-model="deleteConfirmText"
          type="text"
          class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
          placeholder="delete"
        />
      </div>
      
      <div class="flex space-x-3 sm:space-x-4">
        <button
          @click="showDeleteConfirmation = false"
          class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm"
        >
          Cancel
        </button>
        <button
          @click="deleteAccount"
          :disabled="deleteConfirmText !== 'delete'"
          class="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>

  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
        <CheckIcon class="h-6 w-6 text-green-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Success</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ statusMessage }}
      </p>
      <div class="flex justify-center">
        <button 
          @click="showSuccessModal = false"
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
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
        <XIcon class="h-6 w-6 text-red-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Error</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ errorMessage }}
      </p>
      <div class="flex justify-center">
        <button 
          @click="showErrorModal = false"
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserIcon,
  BellIcon,
  ShieldIcon,
  UploadIcon,
  RefreshCcwIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  MonitorIcon,
  SmartphoneIcon,
  LaptopIcon,
  TabletIcon,
  MoreVerticalIcon,
  KeyIcon,
  AlertTriangleIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckIcon,
  X as XIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/modules/authStore'

// Import Firebase Auth functions
import { 
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  reload,
  signOut
} from 'firebase/auth'
import { auth } from '@shared/firebase'

// Import Firestore functions
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@shared/firebase'

const router = useRouter()
const authStore = useAuthStore()

const tabs = [
  { id: 'account', name: 'Account', icon: UserIcon },
  { id: 'notification', name: 'Notification', icon: BellIcon },
  { id: 'security', name: 'Security', icon: ShieldIcon }
]

const currentTab = ref('account')
const profileImage = ref(null)
const isUpdating = ref(false)

// Add the SVG placeholder
const profilePlaceholder = ref('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E')

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const showPassword = ref({
  current: false,
  new: false,
  confirm: false
})

// Password strength validation
const passwordRequirements = ref({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

// Delete account related refs
const showDeleteConfirmation = ref(false)
const deleteConfirmText = ref('')

// Notification settings
const pushNotificationEnabled = ref(false)
const notificationSaved = ref(false)
const isSavingNotifications = ref(false)

// Email verification
const verificationEmailSent = ref(false)
const sendingVerification = ref(false)

// Modals
const showSuccessModal = ref(false)
const showErrorModal = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

// User data from Firestore
const userData = ref(null)

// Add loading state
const isLoadingUserData = ref(true)

// Device management states
const devices = ref([])
const isLoadingDevices = ref(true)
const isSigningOutAll = ref(false)
const signingOutDevices = ref([])
const activeDeviceMenu = ref(null)
const showDeviceDetails = ref(false)
const selectedDevice = ref(null)
const currentSessionId = ref(null)

// New confirmation modals
const showSignOutDeviceConfirmation = ref(false)
const showSignOutAllConfirmation = ref(false)
const deviceToSignOut = ref(null)

// Generate a unique session ID for this browser session
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Get device information
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  
  // Detect device type
  let deviceType = 'desktop'
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) {
      deviceType = 'tablet'
    } else {
      deviceType = 'mobile'
    }
  }
  
  // Detect browser
  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  // Detect OS
  let os = 'Unknown'
  if (platform.includes('Win')) os = 'Windows'
  else if (platform.includes('Mac')) os = 'macOS'
  else if (platform.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
  
  // Generate device name
  let deviceName = `${browser} on ${os}`
  if (deviceType === 'mobile') deviceName = `${browser} Mobile`
  else if (deviceType === 'tablet') deviceName = `${browser} Tablet`
  
  return {
    deviceType,
    browser,
    os,
    deviceName,
    userAgent
  }
}

// Get user's location (simplified - you might want to use a proper geolocation service)
const getUserLocation = async () => {
  try {
    // This is a simplified location detection
    // In production, you'd use a service like ipapi.co or similar
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return `${data.city}, ${data.country_name}`
  } catch (error) {
    return 'Unknown Location'
  }
}

// Register current device session
const registerDeviceSession = async () => {
  if (!authStore.user?.uid) return
  
  try {
    const deviceInfo = getDeviceInfo()
    const location = await getUserLocation()
    const sessionId = generateSessionId()
    currentSessionId.value = sessionId
    
    // Get IP address (simplified)
    let ipAddress = 'Unknown'
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      const ipData = await ipResponse.json()
      ipAddress = ipData.ip
    } catch (error) {
              
    }
    
    const deviceSession = {
      userId: authStore.user.uid,
      sessionId,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      userAgent: deviceInfo.userAgent,
      ipAddress,
      location,
      firstLogin: serverTimestamp(),
      lastActive: serverTimestamp(),
      isCurrent: true
    }
    
    // Add to Firestore
    await addDoc(collection(db, 'deviceSessions'), deviceSession)
    
    // Update last active time periodically
    setInterval(updateLastActive, 60000) // Update every minute
    
  } catch (error) {
    console.error('Error registering device session:', error)
  }
}

// Update last active time
const updateLastActive = async () => {
  if (!currentSessionId.value || !authStore.user?.uid) return
  
  try {
    const q = query(
      collection(db, 'deviceSessions'),
      where('userId', '==', authStore.user.uid),
      where('sessionId', '==', currentSessionId.value)
    )
    
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        lastActive: serverTimestamp()
      })
    })
  } catch (error) {
    console.error('Error updating last active:', error)
  }
}

// Fetch user devices
const fetchDevices = async () => {
  if (!authStore.user?.uid) return
  
  isLoadingDevices.value = true
  try {
    const q = query(
      collection(db, 'deviceSessions'),
      where('userId', '==', authStore.user.uid)
    )
    
    const querySnapshot = await getDocs(q)
    const deviceList = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      deviceList.push({
        id: doc.id,
        ...data,
        isCurrent: data.sessionId === currentSessionId.value,
        // Convert Firestore timestamps to JavaScript dates
        firstLogin: data.firstLogin?.toDate() || new Date(),
        lastActive: data.lastActive?.toDate() || new Date()
      })
    })
    
    // Sort by last active (most recent first)
    devices.value = deviceList.sort((a, b) => b.lastActive - a.lastActive)
    
  } catch (error) {
    console.error('Error fetching devices:', error)
    errorMessage.value = 'Failed to load devices'
    showErrorModal.value = true
  } finally {
    isLoadingDevices.value = false
  }
}

// Confirm sign out device
const confirmSignOutDevice = (device) => {
  deviceToSignOut.value = device
  showSignOutDeviceConfirmation.value = true
  activeDeviceMenu.value = null
}

// Sign out from a specific device
const signOutDevice = async (deviceId) => {
  signingOutDevices.value.push(deviceId)
  showSignOutDeviceConfirmation.value = false
  
  try {
    // Delete the device session from Firestore
    await deleteDoc(doc(db, 'deviceSessions', deviceId))
    
    // Remove from local list
    devices.value = devices.value.filter(device => device.id !== deviceId)
    
    statusMessage.value = 'Device signed out successfully. The user will need to sign in again on that device.'
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('Error signing out device:', error)
    errorMessage.value = 'Failed to sign out device'
    showErrorModal.value = true
  } finally {
    signingOutDevices.value = signingOutDevices.value.filter(id => id !== deviceId)
    deviceToSignOut.value = null
  }
}

// Sign out from all devices
const signOutFromAllDevices = async () => {
  isSigningOutAll.value = true
  showSignOutAllConfirmation.value = false
  
  try {
    const q = query(
      collection(db, 'deviceSessions'),
      where('userId', '==', authStore.user.uid)
    )
    
    const querySnapshot = await getDocs(q)
    const deletePromises = []
    
    querySnapshot.forEach((doc) => {
      // Don't delete current session
      if (doc.data().sessionId !== currentSessionId.value) {
        deletePromises.push(deleteDoc(doc.ref))
      }
    })
    
    await Promise.all(deletePromises)
    
    // Refresh devices list
    await fetchDevices()
    
    statusMessage.value = 'Successfully signed out from all other devices. Users will need to sign in again on those devices.'
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('Error signing out from all devices:', error)
    errorMessage.value = 'Failed to sign out from all devices'
    showErrorModal.value = true
  } finally {
    isSigningOutAll.value = false
  }
}

// Toggle device menu
const toggleDeviceMenu = (deviceId) => {
  activeDeviceMenu.value = activeDeviceMenu.value === deviceId ? null : deviceId
}

// View device details
const viewDeviceDetails = (device) => {
  selectedDevice.value = device
  showDeviceDetails.value = true
  activeDeviceMenu.value = null
}

// Get device icon based on type
const getDeviceIcon = (deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return SmartphoneIcon
    case 'tablet':
      return TabletIcon
    case 'desktop':
    default:
      return LaptopIcon
  }
}

// Format last active time
const formatLastActive = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  
  return date.toLocaleDateString()
}

// Format date
const formatDate = (date) => {
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString()
}

// Close device menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    activeDeviceMenu.value = null
  }
}

// Update the fetchUserData function with the correct document ID format
const fetchUserData = async () => {
  isLoadingUserData.value = true
  try {
    if (!authStore.user?.uid) {
      return
    }
    
    // Use the correct document ID format: user_[UID]
    // Use only the first 8 characters of the UID
    const documentId = `user_${authStore.user.uid.substring(0, 8)}`
    const userDocRef = doc(db, 'users', documentId)
    
    const userDocSnap = await getDoc(userDocRef)
    
    if (userDocSnap.exists()) {
      userData.value = userDocSnap.data()
    } else {
      // Handle case where document doesn't exist
    }
  } catch (error) {
    // Handle error
  } finally {
    isLoadingUserData.value = false
  }
}

// Computed property to check email verification from both Firebase Auth and Firestore
const isEmailVerified = computed(() => {
  // Check Firebase Auth first
  const firebaseAuthVerified = authStore.user?.emailVerified || false
  
  // Check Firestore document
  const firestoreVerified = userData.value?.emailVerified || false
  
  // Return true if either source shows verification
  const verified = firebaseAuthVerified || firestoreVerified
  
  return verified
})

// Computed properties for password validation
const passwordsMatch = computed(() => {
  return passwordForm.value.new === passwordForm.value.confirm
})

const passwordStrength = computed(() => {
  const password = passwordForm.value.new
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  return score
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return 'Very Weak'
  if (strength === 1) return 'Weak'
  if (strength === 2) return 'Fair'
  if (strength === 3) return 'Good'
  if (strength === 4) return 'Strong'
  return 'Very Strong'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'bg-red-500'
  if (strength === 2) return 'bg-yellow-500'
  if (strength === 3) return 'bg-blue-500'
  if (strength >= 4) return 'bg-green-500'
  return 'bg-gray-300'
})

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'text-red-600'
  if (strength === 2) return 'text-yellow-600'
  if (strength === 3) return 'text-blue-600'
  if (strength >= 4) return 'text-green-600'
  return 'text-gray-600'
})

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`
})

const canChangePassword = computed(() => {
  return passwordForm.value.current && 
         passwordForm.value.new && 
         passwordForm.value.confirm && 
         passwordsMatch.value && 
         passwordStrength.value >= 3 && 
         isEmailVerified.value
})

// Password validation method
const validatePasswordStrength = () => {
  const password = passwordForm.value.new
  passwordRequirements.value = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
}

// Send email verification
const sendVerificationEmail = async () => {
  if (!auth.currentUser) return
  sendingVerification.value = true
  try {
    await sendEmailVerification(auth.currentUser)
    verificationEmailSent.value = true
    statusMessage.value = 'Verification email sent! Please check your inbox.'
    showSuccessModal.value = true
  } catch (error) {
    console.error('Error sending verification email:', error)
    errorMessage.value = 'Failed to send verification email. Please try again.'
    showErrorModal.value = true
  } finally {
    sendingVerification.value = false
  }
}

const togglePassword = (field) => {
  showPassword.value[field] = !showPassword.value[field]
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 800 * 1024) { // 800K
      errorMessage.value = 'File size exceeds 800K limit'
      showErrorModal.value = true
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const resetImage = () => {
  profileImage.value = null
}

const changePassword = async () => {
  if (!canChangePassword.value) {
    errorMessage.value = 'Please ensure your password meets all requirements and passwords match'
    showErrorModal.value = true
    return
  }

  isUpdating.value = true
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No authenticated user found')
    }
    
    // Check if email is verified (from either source)
    await reload(user)
    if (!isEmailVerified.value) {
      errorMessage.value = 'Please verify your email before changing your password.'
      showErrorModal.value = true
      return
    }
    
    // Reauthenticate user with current password
    const credential = EmailAuthProvider.credential(
      user.email,
      passwordForm.value.current
    )
    
    await reauthenticateWithCredential(user, credential)
    
    // Update password
    await firebaseUpdatePassword(user, passwordForm.value.new)
    
    // Clear form
    passwordForm.value = {
      current: '',
      new: '',
      confirm: ''
    }
    
    // Show success message
    statusMessage.value = 'Password updated successfully!'
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('Error changing password:', error)
    
    if (error.code === 'auth/wrong-password') {
      errorMessage.value = 'Current password is incorrect.'
    } else if (error.code === 'auth/weak-password') {
      errorMessage.value = 'New password is too weak.'
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage.value = 'Please log out and log back in before changing your password.'
    } else {
      errorMessage.value = error.message || 'Failed to change password. Please try again.'
    }
    
    showErrorModal.value = true
  } finally {
    isUpdating.value = false
  }
}

const autoSaveNotification = async () => {
  notificationSaved.value = false
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    notificationSaved.value = true
    
    // Hide the saved indicator after 3 seconds
    setTimeout(() => {
      notificationSaved.value = false
    }, 3000)
  } catch (error) {
    // Handle error
    console.error('Failed to save notification setting', error)
  }
}

const saveNotificationSettings = async () => {
  isSavingNotifications.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    notificationSaved.value = true
    
    // Hide the saved indicator after 3 seconds
    setTimeout(() => {
      notificationSaved.value = false
    }, 3000)
  } catch (error) {
    errorMessage.value = 'Failed to save notification settings'
    showErrorModal.value = true
  } finally {
    isSavingNotifications.value = false
  }
}

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'delete') {
    return
  }
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    statusMessage.value = 'Your account has been deleted successfully'
    showSuccessModal.value = true
    // Here you would typically redirect to a logout page or home page
  } catch (error) {
    errorMessage.value = 'Failed to delete account'
    showErrorModal.value = true
  } finally {
    showDeleteConfirmation.value = false
    deleteConfirmText.value = ''
  }
}

// Update the onMounted function
onMounted(async () => {
  // Wait a bit for auth store to be fully loaded if needed
  if (!authStore.user?.uid) {
    // Wait up to 3 seconds for auth to load
    let attempts = 0
    while (!authStore.user?.uid && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }
  
  if (authStore.user?.uid) {
    await fetchUserData()
    await registerDeviceSession()
    await fetchDevices()
  } else {
    // Handle case where user is not authenticated
  }
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

.animate-fade-out {
  animation: fadeOut 3s forwards;
}

@keyframes fadeOut {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}
</style>