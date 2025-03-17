<template>
    <div class="p-6 bg-white rounded-2xl">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Responses</h1>
        <p class="text-gray-500 mt-1">Manage predefined replies & FAQs for common pet owner questions.</p>
      </div>
  
      <!-- Search, Filter, Add -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search responses..."
              class="w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
            <Search class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div class="relative">
            <select class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option>All Categories</option>
              <option>General Questions</option>
              <option>Pet Health</option>
              <option>Pet Food</option>
              <option>Pet Training</option>
            </select>
          </div>
        </div>
        <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          <PlusCircle class="w-4 h-4" />
          Add Response
        </button>
      </div>
  
      <!-- Responses list -->
      <div class="bg-white rounded-lg border border-gray-200">
        <ul class="divide-y divide-gray-200">
          <li v-for="(response, index) in responses" :key="index">
            <div class="px-4 py-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-100 text-blue-700">
                    <MessageSquare class="h-6 w-6" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-blue-600">{{ response.trigger }}</div>
                    <div class="text-sm text-gray-500 mt-1">{{ response.response.substring(0, 100) }}{{ response.response.length > 100 ? '...' : '' }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {{ response.category }}
                  </span>
                  <button class="p-1 text-gray-500 hover:text-gray-700">
                    <LucideEdit class="h-5 w-5" />
                  </button>
                  <button class="p-1 text-gray-500 hover:text-gray-700">
                    <ArchiveIcon class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
  
      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">20</span> results
        </div>
        <div class="flex space-x-1">
          <button class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronLeft class="h-4 w-4" />
            <span class="sr-only">Previous</span>
          </button>
          <button class="inline-flex items-center justify-center w-9 h-9 rounded-full text-white bg-blue-500 font-medium shadow-sm hover:bg-blue-600 transition-colors">
            1
          </button>
          <button class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            2
          </button>
          <button class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            3
          </button>
          <button class="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight class="h-4 w-4" />
            <span class="sr-only">Next</span>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { 
    MessageSquare, 
    PlusCircle, 
    Search, 
    LucideEdit, 
    ArchiveIcon,
    ChevronLeft, 
    ChevronRight, 

  } from 'lucide-vue-next'
  
  const responses = ref([
    {
      trigger: "What food is best for puppies?",
      response: "Puppies need specially formulated food that supports their growth and development. Look for high-quality puppy food with appropriate protein levels and DHA for brain development. The best brands include Royal Canin, Hill's Science Diet, and Purina Pro Plan.",
      category: "Pet Food"
    },
    {
      trigger: "How often should I vaccinate my pet?",
      response: "Puppies and kittens need a series of vaccinations starting at 6-8 weeks, then every 3-4 weeks until 16 weeks old. Adult dogs typically need annual or triennial boosters depending on the vaccine. Always consult with your veterinarian for a personalized vaccination schedule.",
      category: "Pet Health"
    },
    {
      trigger: "How to stop my dog from barking?",
      response: "To reduce excessive barking: 1) Identify the trigger for the barking, 2) Provide adequate exercise and mental stimulation, 3) Use positive reinforcement to reward quiet behavior, 4) Consider training commands like 'quiet', 5) Ensure your dog isn't barking out of anxiety or fear.",
      category: "Pet Training"
    },
    {
      trigger: "What are your store hours?",
      response: "Our pet store is open Monday through Friday from 9am to 7pm, Saturday from 10am to 6pm, and Sunday from 12pm to 5pm. We're closed on major holidays. Feel free to visit us anytime during these hours!",
      category: "General Questions"
    },
    {
      trigger: "Do you offer grooming services?",
      response: "Yes, we offer full-service pet grooming! Services include bathing, haircuts, nail trimming, ear cleaning, and more. Our professional groomers are experienced with all breeds. You can book an appointment online or by calling our store.",
      category: "General Questions"
    }
  ])
  </script>