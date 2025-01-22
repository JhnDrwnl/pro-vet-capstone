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
               ? 'bg-blue-500 text-white'
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
  <div class="max-w-7xl mx-auto">
    <!-- Account Tab Content -->
    <div v-if="currentTab === 'account'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Change Profile Container -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          <div class="border-b border-gray-200 pb-4">
            <h2 class="text-xl font-semibold text-gray-900">Change Profile</h2>
            <p class="text-sm text-gray-500 mt-1">Change your profile picture from here</p>
          </div>
          
          <div class="mt-6 flex flex-col items-center">
            <div class="relative">
              <img
                :src="profileImage || '/placeholder.svg?height=120&width=120'"
                alt="Profile"
                class="w-32 h-32 rounded-full bg-gray-100 object-cover border-4 border-white shadow-lg"
              />
            </div>
            
            <div class="mt-6 flex space-x-3">
              <button
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <UploadIcon class="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                @click="resetImage"
                class="px-4 py-2 border border-orange-300 text-orange-400  shadow-md rounded-full hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <RefreshCcwIcon class="w-4 h-4" />
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
            
            <div class="mt-4 text-center">
              <p class="text-sm text-gray-500">
                Allowed JPG, GIF or PNG. Max size of 800K
              </p>
            </div>
          </div>
        </div>
      </div>


      <!-- Change Password Container -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="p-6">
          <div class="border-b border-gray-200 pb-4">
            <h2 class="text-xl font-semibold text-gray-900">Change Password</h2>
            <p class="text-sm text-gray-500 mt-1">To change your password please confirm here</p>
          </div>
          
          <form @submit.prevent="updatePassword" class="mt-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Current Password</label>
              <div class="mt-1 relative">
                <input
                  v-model="passwordForm.current"
                  :type="showPassword.current ? 'text' : 'password'"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
                <button 
                  type="button"
                  @click="togglePassword('current')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <component 
                    :is="showPassword.current ? EyeOffIcon : EyeIcon"
                    class="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="mt-1 relative">
                <input
                  v-model="passwordForm.new"
                  :type="showPassword.new ? 'text' : 'password'"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none  focus:ring-1 focus:ring-gray-200"
                />
                <button 
                  type="button"
                  @click="togglePassword('new')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <component 
                    :is="showPassword.new ? EyeOffIcon : EyeIcon"
                    class="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="mt-1 relative">
                <input
                  v-model="passwordForm.confirm"
                  :type="showPassword.confirm ? 'text' : 'password'"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-1 focus:ring-gray-200"
                />

                <button 
                  type="button"
                  @click="togglePassword('confirm')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <component 
                    :is="showPassword.confirm ? EyeOffIcon : EyeIcon"
                    class="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
            </div>


            <div class="mt-6">
              <button
                type="submit"
                class="w-full px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                :disabled="isUpdating"
              >
                <LoaderIcon v-if="isUpdating" class="w-4 h-4 animate-spin" />
                <span>{{ isUpdating ? 'Updating...' : 'Update Password' }}</span>
              </button>
            </div>

            
          </form>
        </div>
      </div>

    </div>

    <!-- Notification Tab Content -->
    <div v-if="currentTab === 'notification'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Notification Settings Container -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-xl font-semibold text-gray-900">Notification Settings</h2>
              <p class="text-sm text-gray-500 mt-1">Manage your notification preferences</p>
            </div>
            
            <div class="mt-6 space-y-4">
              <div v-for="(setting, index) in notificationSettings" :key="index" class="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ setting.title }}</h3>
                  <p class="text-sm text-gray-500">{{ setting.description }}</p>
                </div>
                <label class="flex items-center cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" v-model="setting.enabled" class="sr-only" />
                    <div 
                      class="block w-12 h-6 rounded-full transition-colors duration-200" 
                      :class="setting.enabled ? 'bg-blue-500' : 'bg-gray-300'"
                    ></div>
                    <div 
                      class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 transform"
                      :class="setting.enabled ? 'translate-x-6' : 'translate-x-0'"
                    ></div>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="mt-6">
              <button
                @click="saveNotificationSettings"
                class="w-full px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Language and Time Zone Container -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="p-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-xl font-semibold text-gray-900">Language and Time Zone</h2>
              <p class="text-sm text-gray-500 mt-1">Set your preferred language and time zone</p>
            </div>
            
            <div class="mt-6 space-y-4">
              <div>
                <label for="language" class="block text-md font-medium text-gray-700">Language</label>
                <select
                  id="language"
                  v-model="language"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <div>
                <label for="timezone" class="block text-md font-medium text-gray-700">Time Zone</label>
                <select
                  id="timezone"
                  v-model="timezone"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-md rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>
            </div>
            
            <div class="mt-6">
              <button
                @click="saveLanguageAndTimezone"
                class="w-full px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Save Language and Time Zone</span>
              </button>
            </div>
          </div>
        </div>
    </div>

    <!-- Security Tab Content -->
    <div v-if="currentTab === 'security'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
<!-- Left Column (2/3 width) -->
<div class="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
  <div>
    <h2 class="text-xl font-semibold text-gray-900">Two-factor Authentication</h2>
    <p class="text-sm text-gray-500 mt-1">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis sapiente sunt earum officiis laboriosam ut.</p>
    <button 
      @click="toggleTwoFactor" 
      class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
    >
      Enable
    </button>
  </div>

  <div class="border-t pt-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-base font-medium text-gray-900">Authentication App</h3>
        <p class="text-sm text-gray-500">Google auth app</p>
      </div>
      <button class="px-4 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
        Setup
      </button>
    </div>
  </div>

  <div class="border-t pt-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-base font-medium text-gray-900">Another e-mail</h3>
        <p class="text-sm text-gray-500">E-mail to send verification link</p>
      </div>
      <button class="px-4 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
        Setup
      </button>
    </div>
  </div>

  <div class="border-t pt-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="text-base font-medium text-gray-900">SMS Recovery</h3>
        <p class="text-sm text-gray-500">Your phone number or something</p>
      </div>
      <button class="px-4 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
        Setup
      </button>
    </div>
  </div>
</div>

<!-- Right Column (1/3 width) -->
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div class="flex items-center gap-2 mb-4">
    <MonitorIcon class="w-5 h-5 text-gray-400" />
    <h2 class="text-xl font-semibold text-gray-900">Devices</h2>
  </div>
  
  <p class="text-sm text-gray-500 mb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit Rem.</p>
  
  <button class="w-full px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors mb-6">
    Sign Out From All Devices
  </button>

  <div class="space-y-4">
    <div class="flex items-start justify-between">
      <div class="flex gap-3">
        <SmartphoneIcon class="w-5 h-5 text-gray-400 mt-1" />
        <div>
          <p class="font-medium">iPhone 14</p>
          <p class="text-sm text-gray-500">London UK, Oct 23 at 1:15 AM</p>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600">
        <MoreVerticalIcon class="w-5 h-5" />
      </button>
    </div>

    <div class="flex items-start justify-between">
      <div class="flex gap-3">
        <LaptopIcon class="w-5 h-5 text-gray-400 mt-1" />
        <div>
          <p class="font-medium">Macbook Air</p>
          <p class="text-sm text-gray-500">Gujarat India, Oct 24 at 3:15 AM</p>
        </div>
      </div>
      <button class="text-gray-400 hover:text-gray-600">
        <MoreVerticalIcon class="w-5 h-5" />
      </button>
    </div>
  </div>

  <div class="mt-6 text-center">
    <a href="#" class="text-blue-500 hover:text-blue-600 text-sm">Need Help?</a>
  </div>
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
UploadIcon,
RefreshCcwIcon,
EyeIcon,
EyeOffIcon,
LoaderIcon,
MonitorIcon,
SmartphoneIcon,
LaptopIcon,
MoreVerticalIcon
} from 'lucide-vue-next'

const tabs = [
{ id: 'account', name: 'Account', icon: UserIcon },
{ id: 'notification', name: 'Notification', icon: BellIcon },
{ id: 'security', name: 'Security', icon: ShieldIcon }
]

const currentTab = ref('account')
const profileImage = ref(null)
const isUpdating = ref(false)

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

const notificationSettings = ref([
{ title: 'Email Notifications', description: 'Receive email updates', enabled: true },
{ title: 'Push Notifications', description: 'Receive push notifications', enabled: false },
{ title: 'SMS Notifications', description: 'Receive text messages', enabled: true },
])

const twoFactorEnabled = ref(false)
const loginHistory = ref([
{ device: 'MacBook Pro', location: 'San Francisco, CA', time: '2 hours ago' },
{ device: 'iPhone 12', location: 'New York, NY', time: '1 day ago' },
{ device: 'Windows PC', location: 'Chicago, IL', time: '3 days ago' },
])

const language = ref('en')
const timezone = ref('UTC')

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

const saveNotificationSettings = () => {
  // Simulate API call to save notification settings
  alert('Notification settings saved successfully')
}

const saveLanguageAndTimezone = () => {
  // Simulate API call to save language and timezone settings
  alert(`Language set to ${language.value} and Time Zone set to ${timezone.value}`)
}

const toggleTwoFactor = () => {
twoFactorEnabled.value = !twoFactorEnabled.value
alert(`Two-factor authentication ${twoFactorEnabled.value ? 'enabled' : 'disabled'}`)
}

</script>

<style scoped>
/* Remove or comment out the existing .dot styles */
</style>

