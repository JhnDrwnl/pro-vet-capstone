<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Pet Health Tracker</h1>
      
      <!-- Add New Note Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Add Doctor's Note</h2>
        <div class="space-y-4">
          <div>
            <label for="note-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="note-title"
              v-model="newNote.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter note title"
            >
          </div>
          <div>
            <label for="pet-name" class="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
            <input
              id="pet-name"
              v-model="newNote.petName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter pet name"
            >
          </div>
          <div>
            <label for="owner-name" class="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input
              id="owner-name"
              v-model="newNote.ownerName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter owner name"
            >
          </div>
          <div>
            <label for="note-content" class="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
            <textarea
              id="note-content"
              v-model="newNote.content"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your note here"
            ></textarea>
          </div>
          <button
            @click="addNote"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Note
          </button>
        </div>
      </div>

      <!-- Timeline of Notes and Responses -->
      <div class="space-y-8">
        <div v-for="(item, index) in timeline" :key="index" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-start">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              item.type === 'note' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            ]">
              <UserIcon v-if="item.type === 'note'" class="w-6 h-6" />
              <PawPrintIcon v-else class="w-6 h-6" />
            </div>
            <div class="ml-4 flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ item.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(item.date) }}</p>
              <p v-if="item.type === 'note'" class="text-sm font-medium text-blue-600 mt-1">
                Pet: {{ item.petName }} | Owner: {{ item.ownerName }}
              </p>
              <div class="mt-2 text-gray-700">{{ item.content }}</div>
              
              <!-- Add Response Section (only for notes) -->
              <div v-if="item.type === 'note'" class="mt-4">
                <div v-if="!item.showResponseForm" class="flex justify-end">
                  <button
                    @click="item.showResponseForm = true"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Add Pet Response
                  </button>
                </div>
                <div v-else class="space-y-4">
                  <textarea
                    v-model="item.responseContent"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter pet's response or update"
                  ></textarea>
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="item.showResponseForm = false"
                      class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      @click="addResponse(index)"
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserIcon, PawPrintIcon } from 'lucide-vue-next'

const newNote = ref({ title: '', content: '', petName: '', ownerName: '' })
const timeline = ref([
  {
    type: 'note',
    title: 'Initial Checkup',
    content: 'Fluffy seems to be in good health overall. Recommended annual vaccinations and dental cleaning.',
    date: new Date(2023, 5, 15),
    showResponseForm: false,
    responseContent: '',
    petName: 'Fluffy',
    ownerName: 'John Doe'
  },
  {
    type: 'response',
    title: 'Owner Update',
    content: 'Fluffy has been more active since the checkup. We\'ve scheduled the dental cleaning for next month.',
    date: new Date(2023, 5, 20)
  },
  {
    type: 'note',
    title: 'Follow-up Appointment',
    content: 'Dental cleaning completed. Fluffy\'s teeth are now in excellent condition. Continue with regular brushing at home.',
    date: new Date(2023, 6, 10),
    showResponseForm: false,
    responseContent: '',
    petName: 'Fluffy',
    ownerName: 'John Doe'
  }
])

const addNote = () => {
  if (newNote.value.title && newNote.value.content && newNote.value.petName && newNote.value.ownerName) {
    timeline.value.unshift({
      type: 'note',
      title: newNote.value.title,
      content: newNote.value.content,
      petName: newNote.value.petName,
      ownerName: newNote.value.ownerName,
      date: new Date(),
      showResponseForm: false,
      responseContent: ''
    })
    newNote.value = { title: '', content: '', petName: '', ownerName: '' }
  }
}

const addResponse = (index) => {
  const note = timeline.value[index]
  if (note.responseContent) {
    timeline.value.splice(index + 1, 0, {
      type: 'response',
      title: 'Pet Update',
      content: note.responseContent,
      date: new Date()
    })
    note.showResponseForm = false
    note.responseContent = ''
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>