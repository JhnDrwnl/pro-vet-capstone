<template>
  <div class="bg-white rounded-lg shadow-sm">
    <!-- Medical History Upload Section -->
    <div class="p-6">
      <!-- Upload Area -->
      <div 
        :class="[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200',
          isDragging ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200',
          isUploading ? 'pointer-events-none opacity-75' : ''
        ]"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div class="max-w-[300px] mx-auto">
          <!-- File Preview or Lottie Animation -->
          <div class="mb-4">
            <div v-if="selectedFile && !isUploading" class="relative inline-block">
              <div class="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileIcon v-if="['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)" class="w-8 h-8 text-gray-400" />
                <img 
                  v-else 
                  :src="filePreview" 
                  class="w-20 h-20 rounded-lg object-cover"
                  alt="File preview"
                >
              </div>
              <button 
                @click.prevent="clearFile"
                class="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <XIcon class="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div v-else ref="lottieContainer" class="w-[120px] h-[120px] mx-auto"></div>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="isUploading" class="mb-4">
            <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-600 transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-600 mt-2">Uploading... {{ uploadProgress }}%</p>
          </div>
          
          <!-- Upload Text -->
          <div v-else>
            <div class="text-gray-600">
              Drop file here or 
              <label class="text-blue-600 hover:text-blue-700 cursor-pointer">
                <span>Browse</span>
                <input 
                  type="file" 
                  class="hidden" 
                  @change="handleFileSelect"
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                >
              </label>
            </div>
            <p class="text-sm text-gray-400 mt-2">
              PNG, JPG, PDF, DOC and DOCX files are supported
            </p>
            <p class="text-sm text-gray-400 mt-1">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 rounded-lg">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4 mt-6">
        <button 
          @click="handleSave"
          class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!selectedFile || isUploading"
        >
          {{ isUploading ? 'Uploading...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Upload Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Upload Successful</h3>
          <button @click="closeSuccessModal" class="text-gray-400 hover:text-gray-500">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        <p class="text-gray-600 mb-4">Your file has been successfully uploaded.</p>
        <div class="flex justify-end">
          <button 
            @click="closeSuccessModal"
            class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { FileIcon, XIcon } from 'lucide-vue-next'
import lottie from 'lottie-web'

// Upload state
const selectedFile = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const filePreview = ref('')
const lottieContainer = ref(null)
const lottieAnimation = ref(null)
const showSuccessModal = ref(false)

const lottieUrl = "https://lottie.host/2cfea700-eb2c-4f07-b3a3-8216778e5e04/bvy8yFWAJy.json"

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

onMounted(() => {
  lottieAnimation.value = lottie.loadAnimation({
    container: lottieContainer.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: lottieUrl
  })
})

onUnmounted(() => {
  if (lottieAnimation.value) {
    lottieAnimation.value.destroy()
  }
})

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

// Handle file drop
const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

// Validate and process the file
const validateAndProcessFile = (file) => {
  // Reset error
  error.value = ''

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!validTypes.includes(file.type)) {
    error.value = 'Please upload only PNG, JPG, PDF, DOC or DOCX files'
    return
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'File size must be less than 10MB'
    return
  }

  // Set selected file
  selectedFile.value = file

  // Create preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      filePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    filePreview.value = ''
  }
}

// Clear selected file
const clearFile = () => {
  selectedFile.value = null
  filePreview.value = ''
  error.value = ''
}

// Simulate file upload
const simulateUpload = async () => {
  isUploading.value = true
  uploadProgress.value = 0

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          isUploading.value = false
          resolve()
        }, 500)
      }
    }, 300)
  })
}

// Handle save
const handleSave = async () => {
  if (!selectedFile.value) return

  try {
    await simulateUpload()
    // Here you would typically send the file to your server
    console.log('File uploaded:', selectedFile.value.name)
    showSuccessModal.value = true
    clearFile()
  } catch (err) {
    error.value = 'An error occurred while uploading the file. Please try again.'
    isUploading.value = false
  }
}

// Close success modal
const closeSuccessModal = () => {
  showSuccessModal.value = false
}
</script>

<style scoped>
/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Drag and drop highlight effect */
.border-2.border-dashed {
  transition: all 0.2s ease;
}

/* Progress bar animation */
.bg-blue-600 {
  transition: width 0.3s ease;
}
</style>