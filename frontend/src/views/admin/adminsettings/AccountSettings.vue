<!-- views/adminsettings/AccountSettings.vue -->
<template>
  <div class="min-h-screen p-6 bg-white rounded-lg ">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Account Settings</h1>
      <p class="text-gray-500 mt-1">Manage your account preferences.</p>
    </div>
  <!-- Navigation Tabs -->
  <div class="bg-white border-b px-4 pb-2 mb-6">
    <ul class="flex space-x-8 px-6">
      <li v-for="tab in tabs" :key="tab.id">
        <button
          @click="currentTab = tab.id"
       
          :class="[
                  'px-4 py-2 text-sm font-medium rounded-full transition-colors',
            currentTab === tab.id 
               ? 'bg-[#EBF5FF] text-[#0066FF]'
              : 'text-gray-800 hover:text-gray-700'
          ]"
        >
          <div class="flex items-center space-x-2">
            <component :is="tab.icon" class="w-5 h-5" />
            <span>{{ tab.name }}</span>
          </div>
        </button>
      </li>
    </ul>
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
                    <p class="text-xs sm:text-sm text-gray-500">To change your password please confirm here</p>
                  </div>
                </div>
                
                <form @submit.prevent="updatePassword" class="space-y-4 sm:space-y-5">
                  <div>
                    <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Current</label>
                    <div class="relative">
                      <input
                        v-model="passwordForm.current"
                        :type="showPassword.current ? 'text' : 'password'"
                        class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
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
                  </div>
                  
                  <div>
                    <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Confirm</label>
                    <div class="relative">
                      <input
                        v-model="passwordForm.confirm"
                        :type="showPassword.confirm ? 'text' : 'password'"
                        class="block w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
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
                  </div>

                  <button
                    type="submit"
                    class="w-full px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mt-6 sm:mt-8 text-xs sm:text-sm"
                    :disabled="isUpdating"
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

        <!-- Notification Tab Content - Improved with only Push Notification -->
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

        <!-- Security Tab Content -->
        <div v-if="currentTab === 'security'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="p-4 sm:p-6">
            <div class="flex items-center gap-3 mb-4 sm:mb-6">
              <MonitorIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <div>
                <h2 class="text-lg sm:text-xl font-semibold text-gray-900">Devices</h2>
                <p class="text-xs sm:text-sm text-gray-500">Lorem ipsum dolor sit amet consectetur adipisicing elit Rem.</p>
              </div>
            </div>
            
            <button class="w-full px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors mb-4 sm:mb-6 text-xs sm:text-sm">
              Sign Out From All Devices
            </button>

            <div class="space-y-3 sm:space-y-5 mt-4 sm:mt-6">
              <div class="flex items-start justify-between p-2 sm:p-3 bg-gray-50 rounded-xl">
                <div class="flex gap-2 sm:gap-3">
                  <SmartphoneIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1" />
                  <div>
                    <p class="text-xs sm:text-sm font-medium">iPhone 14</p>
                    <p class="text-xs sm:text-sm text-gray-500">London UK, Oct 23 at 1:15 AM</p>
                  </div>
                </div>
                <button class="text-gray-400 hover:text-gray-600">
                  <MoreVerticalIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div class="flex items-start justify-between p-2 sm:p-3 bg-gray-50 rounded-xl">
                <div class="flex gap-2 sm:gap-3">
                  <LaptopIcon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1" />
                  <div>
                    <p class="text-xs sm:text-sm font-medium">Macbook Air</p>
                    <p class="text-xs sm:text-sm text-gray-500">Gujarat India, Oct 24 at 3:15 AM</p>
                  </div>
                </div>
                <button class="text-gray-400 hover:text-gray-600">
                  <MoreVerticalIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div class="mt-6 sm:mt-8 text-center">
              <a href="#" class="text-xs sm:text-sm text-blue-500 hover:text-blue-600">Need Help?</a>
            </div>
          </div>
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
</template>

<script setup>
import { ref } from 'vue'
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
  MoreVerticalIcon,
  KeyIcon,
  AlertTriangleIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckIcon
} from 'lucide-vue-next'

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

// Delete account related refs
const showDeleteConfirmation = ref(false)
const deleteConfirmText = ref('')

// Notification settings
const pushNotificationEnabled = ref(false)
const notificationSaved = ref(false)
const isSavingNotifications = ref(false)

const loginHistory = ref([
  { device: 'MacBook Pro', location: 'San Francisco, CA', time: '2 hours ago' },
  { device: 'iPhone 12', location: 'New York, NY', time: '1 day ago' },
  { device: 'Windows PC', location: 'Chicago, IL', time: '3 days ago' },
])

const togglePassword = (field) => {
  showPassword.value[field] = !showPassword.value[field]
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 800 * 1024) { // 800K
      alert('File size exceeds 800K limit')
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

const updatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    alert('New passwords do not match')
    return
  }

  isUpdating.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Password updated successfully')
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (error) {
    alert('Failed to update password')
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
    alert('Failed to save notification settings')
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
    alert('Your account has been deleted successfully')
    // Here you would typically redirect to a logout page or home page
  } catch (error) {
    alert('Failed to delete account')
  } finally {
    showDeleteConfirmation.value = false
    deleteConfirmText.value = ''
  }
}
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