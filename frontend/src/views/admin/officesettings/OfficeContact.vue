<!-- views/admin/officesettings/OfficeContact.vue -->
<template>
    <div class="p-6 bg-white rounded-2xl">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Office Contact Information</h1>
        <p class="text-gray-500 mt-1">Manage contact details for your veterinary office.</p>
      </div>
  
      <!-- Show loading spinner during initial data load -->
      <LoadingSpinner v-if="initialLoading" isOverlay text="Loading data..." />
    
      <!-- Only show content when data is loaded -->
      <div v-else>
        <!-- Search and Add -->
        <div v-if="!showForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div class="w-full sm:w-auto">
            <div class="relative">
              <input
                type="text"
                placeholder="Search contacts..."
                class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                v-model="searchQuery"
              >
              <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
          <div>
            <button 
              @click="openAddForm"
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 w-full sm:w-auto justify-center"
            >
              <PlusCircle class="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>
  
        <!-- Table -->
        <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-100">
              <tr class="border-b border-gray-200">
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Type</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Value</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Display Label</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Status</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Notes</th>
                <th class="py-4 px-6 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="contact in filteredContacts" :key="contact.id">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-2">
                    <component :is="getContactIcon(contact.type)" class="w-5 h-5 text-gray-500" />
                    <span class="text-sm font-medium text-gray-900">{{ contact.type }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-sm text-gray-900">
                  <a 
                    v-if="isLinkType(contact.type)" 
                    :href="formatContactLink(contact.type, contact.value)" 
                    target="_blank" 
                    class="text-blue-600 hover:underline"
                  >
                    {{ contact.value }}
                  </a>
                  <span v-else>{{ contact.value }}</span>
                </td>
                <td class="py-4 px-6 text-sm text-gray-900 hidden md:table-cell">{{ contact.label }}</td>
                <td class="py-4 px-6 hidden sm:table-cell">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    contact.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ contact.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="py-4 px-6 text-sm text-gray-900 hidden lg:table-cell">{{ contact.notes || 'N/A' }}</td>
                <td class="py-4 px-6 text-sm">
                  <div class="flex items-center gap-2">
                    <button 
                      @click="editContact(contact)"
                      class="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Edit class="w-5 h-5" />
                    </button>
                    <button 
                      @click="openDeleteModal(contact)"
                      class="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="officeStore.contacts.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">
                  <Phone class="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No contact information configured yet.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Add/Edit Form -->
        <div v-if="showForm" class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-semibold mb-4">{{ isEditing ? 'Edit Contact' : 'Add Contact' }}</h2>
          <form @submit.prevent="saveContact" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Type</label>
              <select 
                v-model="formData.type" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option v-for="type in contactTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ getContactValueLabel(formData.type) }}
              </label>
              <input 
                type="text" 
                v-model="formData.value" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                :placeholder="getContactPlaceholder(formData.type)"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Display Label</label>
              <input 
                type="text" 
                v-model="formData.label" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="e.g., Main Office, Customer Support"
              >
            </div>
            
            <div class="flex items-center">
              <input 
                id="isActive" 
                type="checkbox" 
                v-model="formData.isActive" 
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="isActive" class="ml-2 block text-sm text-gray-700">
                Active (visible to clients)
              </label>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea 
                v-model="formData.notes" 
                rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Any additional information about this contact"
              ></textarea>
            </div>
            
            <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                type="button"
                @click="closeForm"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2"
                :disabled="officeStore.loading"
              >
                {{ isEditing ? 'Save Changes' : 'Add Contact' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Delete Contact</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            Are you sure you want to delete the {{ deleteItem?.type }} contact "{{ deleteItem?.label }}"? 
            This action cannot be undone.
          </p>
          <div class="flex justify-center gap-3">
            <button 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="deleteContact" 
              class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              :disabled="officeStore.loading"
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
            <CheckCircle class="h-6 w-6 text-green-600" />
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
            <XCircle class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Error</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            {{ statusMessage }}
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
  
      <!-- Loading Spinner for operations (not initial loading) -->
      <LoadingSpinner v-if="officeStore.loading && !initialLoading && !showForm" isOverlay text="Processing..." />
      
      <!-- Loading Spinner Overlay - Show for all operations -->
      <LoadingSpinner v-if="officeStore.loading || initialLoading" isOverlay :text="initialLoading ? 'Loading data...' : 'Processing...'" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useOfficeStore } from '@/stores/modules/officeStore'
  import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
  import { 
    PlusCircle, 
    Edit, 
    Trash2, 
    AlertTriangle, 
    Search,
    Phone,
    Mail,
    MapPin,
    Globe,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    Linkedin,
    MessageSquare,
    CheckCircle,
    XCircle
  } from 'lucide-vue-next'
  
  // Initialize the office store
  const officeStore = useOfficeStore()
  
  // State
  const showForm = ref(false)
  const showDeleteModal = ref(false)
  const showSuccessModal = ref(false)
  const showErrorModal = ref(false)
  const isEditing = ref(false)
  const editId = ref(null)
  const deleteItem = ref(null)
  const statusMessage = ref('')
  const statusType = ref('success')
  const searchQuery = ref('')
  const initialLoading = ref(true) // Add initialLoading state
  
  // Contact types
  const contactTypes = [
    'Phone',
    'Email',
    'Address',
    'Website',
    'Facebook',
    'Instagram',
    'Twitter',
    'YouTube',
    'LinkedIn',
    'WhatsApp',
    'Telegram',
    'Viber',
    'Other'
  ]
  
  // Form data
  const formData = ref({
    type: 'Phone',
    value: '',
    label: '',
    isActive: true,
    notes: ''
  })
  
  // Filtered contacts based on search
  const filteredContacts = computed(() => {
    if (!searchQuery.value) return officeStore.contacts
    
    const query = searchQuery.value.toLowerCase()
    return officeStore.contacts.filter(contact => 
      contact.type.toLowerCase().includes(query) || 
      contact.value.toLowerCase().includes(query) ||
      contact.label.toLowerCase().includes(query) ||
      (contact.notes && contact.notes.toLowerCase().includes(query))
    )
  })
  
  // Watch for store errors and display them
  watch(() => officeStore.error, (error) => {
    if (error) {
      showStatus(error, 'error')
    }
  })
  
  // Get icon for contact type
  const getContactIcon = (type) => {
    switch (type) {
      case 'Phone': return Phone
      case 'Email': return Mail
      case 'Address': return MapPin
      case 'Website': return Globe
      case 'Facebook': return Facebook
      case 'Instagram': return Instagram
      case 'Twitter': return Twitter
      case 'YouTube': return Youtube
      case 'LinkedIn': return Linkedin
      case 'WhatsApp': return MessageSquare
      case 'Telegram': return MessageSquare
      case 'Viber': return MessageSquare
      default: return MessageSquare
    }
  }
  
  // Check if contact type is a link
  const isLinkType = (type) => {
    return ['Email', 'Website', 'Facebook', 'Instagram', 'Twitter', 'YouTube', 'LinkedIn'].includes(type)
  }
  
  // Format contact link
  const formatContactLink = (type, value) => {
    switch (type) {
      case 'Email': return `mailto:${value}`
      case 'Website': return value.startsWith('http') ? value : `https://${value}`
      case 'Facebook': return value.startsWith('http') ? value : `https://facebook.com/${value}`
      case 'Instagram': return value.startsWith('http') ? value : `https://instagram.com/${value}`
      case 'Twitter': return value.startsWith('http') ? value : `https://twitter.com/${value}`
      case 'YouTube': return value.startsWith('http') ? value : `https://youtube.com/${value}`
      case 'LinkedIn': return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`
      default: return value
    }
  }
  
  // Get label for contact value input
  const getContactValueLabel = (type) => {
    switch (type) {
      case 'Phone': return 'Phone Number'
      case 'Email': return 'Email Address'
      case 'Address': return 'Physical Address'
      case 'Website': return 'Website URL'
      case 'Facebook': return 'Facebook Page/Profile'
      case 'Instagram': return 'Instagram Handle'
      case 'Twitter': return 'Twitter Handle'
      case 'YouTube': return 'YouTube Channel'
      case 'LinkedIn': return 'LinkedIn Profile'
      case 'WhatsApp': return 'WhatsApp Number'
      case 'Telegram': return 'Telegram Username'
      case 'Viber': return 'Viber Number'
      default: return 'Value'
    }
  }
  
  // Get placeholder for contact value input
  const getContactPlaceholder = (type) => {
    switch (type) {
      case 'Phone': return '+63 917 123 4567'
      case 'Email': return 'office@example.com'
      case 'Address': return '123 Main St, City, Province, ZIP'
      case 'Website': return 'https://example.com'
      case 'Facebook': return 'yourpagename or https://facebook.com/yourpage'
      case 'Instagram': return '@yourusername or https://instagram.com/yourusername'
      case 'Twitter': return '@yourusername or https://twitter.com/yourusername'
      case 'YouTube': return 'channelname or https://youtube.com/c/channelname'
      case 'LinkedIn': return 'username or https://linkedin.com/in/username'
      case 'WhatsApp': return '+63 917 123 4567'
      case 'Telegram': return '@username'
      case 'Viber': return '+63 917 123 4567'
      default: return 'Enter value'
    }
  }
  
  // Open add form
  const openAddForm = () => {
    isEditing.value = false
    editId.value = null
    
    // Reset form
    formData.value = {
      type: 'Phone',
      value: '',
      label: '',
      isActive: true,
      notes: ''
    }
    
    showForm.value = true
  }
  
  // Open edit form
  const editContact = (contact) => {
    isEditing.value = true
    editId.value = contact.id
    
    formData.value = {
      type: contact.type,
      value: contact.value,
      label: contact.label,
      isActive: contact.isActive,
      notes: contact.notes || ''
    }
    
    showForm.value = true
  }
  
  // Open delete modal
  const openDeleteModal = (contact) => {
    deleteItem.value = contact
    showDeleteModal.value = true
  }
  
  // Close form
  const closeForm = () => {
    showForm.value = false
  }
  
  // Save contact
  const saveContact = async () => {
    try {
      if (isEditing.value && editId.value) {
        // Update existing record
        const success = await officeStore.updateContact(editId.value, formData.value)
        if (success) {
          showStatus('Contact updated successfully', 'success')
          showForm.value = false
        }
      } else {
        // Add new record
        const newContact = await officeStore.createContact(formData.value)
        if (newContact) {
          showStatus('Contact added successfully', 'success')
          showForm.value = false
        }
      }
    } catch (error) {
      showStatus(error.message || 'Failed to save contact', 'error')
    }
  }
  
  // Delete contact
  const deleteContact = async () => {
    if (!deleteItem.value || !deleteItem.value.id) return
    
    try {
      const success = await officeStore.deleteContact(deleteItem.value.id)
      if (success) {
        showStatus(`Contact deleted successfully`, 'success')
        showDeleteModal.value = false
        deleteItem.value = null
      }
    } catch (error) {
      showStatus(error.message || 'Failed to delete contact', 'error')
    }
  }
  
  // Show status message
  const showStatus = (message, type = 'success') => {
    statusMessage.value = message
    statusType.value = type
    
    if (type === 'success') {
      showSuccessModal.value = true
    } else {
      showErrorModal.value = true
    }
  }
  
  // Fetch data on component mount
  onMounted(async () => {
    initialLoading.value = true; // Set initial loading to true
    try {
      await officeStore.fetchContacts()
    } catch (error) {
      console.error('Error loading contacts:', error)
      showStatus('Failed to load contacts. Please try again.', 'error')
    } finally {
      initialLoading.value = false; // Set initial loading to false when done
    }
  })
  </script>