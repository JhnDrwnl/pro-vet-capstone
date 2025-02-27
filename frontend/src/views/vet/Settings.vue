<template>
    <div class="bg-white shadow-lg rounded-lg p-4 mb-8">
    <!-- Header -->
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-semibold text-gray-900">Account Settings</h1>
      <p class="text-gray-600 mt-1">Manage your account preferences.</p>

      <!-- Navigation Tabs -->
      <div class="flex gap-2 mt-8 border-b border-gray-200">
        <button 
          v-for="tab in tabs" 
          :key="tab.name"
          @click="activeTab = tab.name"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium',
            activeTab === tab.name 
              ? 'text-white bg-blue-500' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          {{ tab.name }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="mt-8 grid grid-cols-2 gap-8">
        <!-- Change Profile Section -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">Change Profile</h2>
          <p class="text-gray-600 text-sm mt-1">Change your profile picture from here</p>

          <div class="mt-6 flex flex-col items-center">
            <div class="relative">
              <div class="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                <img 
                  v-if="previewImage"
                  :src="previewImage"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <div 
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gray-50"
                >
                  <UserIcon class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              
              <!-- Upload overlay -->
              <div 
                class="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                @click="triggerFileInput"
              >
                <CameraIcon class="w-8 h-8 text-white" />
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                @click="triggerFileInput"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <UploadIcon class="w-4 h-4" />
                Upload
              </button>
              <button
                @click="resetImage"
                class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCwIcon class="w-4 h-4" />
                Reset
              </button>
            </div>

            <p class="text-sm text-gray-500 mt-4">
              Allowed JPG, GIF or PNG. Max size of 800K
            </p>

            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept="image/jpeg,image/png,image/gif"
              @change="handleFileChange"
            >
          </div>
        </div>

        <!-- Change Password Section -->
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900">Change Password</h2>
          <p class="text-gray-600 text-sm mt-1">To change your password please confirm here</p>

          <form @submit.prevent="updatePassword" class="mt-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Current Password</label>
              <div class="relative mt-1">
                <input
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="passwords.current"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="showCurrentPassword" class="w-5 h-5" />
                  <EyeOffIcon v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="relative mt-1">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="passwords.new"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="showNewPassword" class="w-5 h-5" />
                  <EyeOffIcon v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="relative mt-1">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="passwords.confirm"
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon v-if="showConfirmPassword" class="w-5 h-5" />
                  <EyeOffIcon v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
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
  CameraIcon,
  UploadIcon,
  RefreshCwIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-vue-next'

// Tabs configuration
const tabs = [
  { name: 'Account', icon: UserIcon },
  { name: 'Notification', icon: BellIcon },
  { name: 'Security', icon: ShieldIcon }
]

const activeTab = ref('Account')

// Profile image handling
const fileInput = ref(null)
const previewImage = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 800 * 1024) { // 800K limit
      alert('File size exceeds 800K limit')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const resetImage = () => {
  previewImage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Password change handling
const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const updatePassword = () => {
  // Validate passwords
  if (!passwords.value.current || !passwords.value.new || !passwords.value.confirm) {
    alert('Please fill in all password fields')
    return
  }

  if (passwords.value.new !== passwords.value.confirm) {
    alert('New passwords do not match')
    return
  }

  // Here you would typically make an API call to update the password
  console.log('Updating password...')
  
  // Reset form
  passwords.value = {
    current: '',
    new: '',
    confirm: ''
  }
  
  alert('Password updated successfully')
}
</script>