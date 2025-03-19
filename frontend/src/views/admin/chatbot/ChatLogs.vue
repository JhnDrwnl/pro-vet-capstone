<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Chat Logs</h1>
      <p class="text-gray-500 mt-1">View past conversations & user queries.</p>
    </div>

    <!-- Search, Filter, and Actions -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex gap-2 items-center">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" class="w-[300px] pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" placeholder="Search conversations..." />
        </div>
        <select class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200">
          <option>All Statuses</option>
          <option>Resolved</option>
          <option>Unresolved</option>
          <option>Escalated</option>
        </select>
        <div class="flex items-center space-x-2">
          <input type="date" class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" />
          <span class="text-gray-500">to</span>
          <input type="date" class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200" />
        </div>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600">
          <Download class="w-4 h-4" />
          Export
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          <RefreshCw class="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Analytics summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
        <div class="px-4 py-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <MessageCircle class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">1,482</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
        <div class="px-4 py-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">1,257</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <ArrowUp class="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    <span class="sr-only">Increased by</span>
                    12%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
        <div class="px-4 py-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <AlertCircle class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Unresolved</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">145</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                    <ArrowUp class="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    <span class="sr-only">Increased by</span>
                    8%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
        <div class="px-4 py-5">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-100 rounded-md p-3">
              <AlertTriangle class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Escalated</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">80</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                    <ArrowDown class="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    <span class="sr-only">Decreased by</span>
                    5%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat logs list -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <ul class="divide-y divide-gray-200">
        <li v-for="(chat, index) in chatLogs" :key="index" class="hover:bg-gray-50">
          <div class="block">
            <div class="px-4 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <img class="h-10 w-10 rounded-full" :src="chat.userAvatar" alt="" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-blue-600">{{ chat.userName }}</div>
                    <div class="text-sm text-gray-500">{{ chat.lastMessage.substring(0, 60) }}{{ chat.lastMessage.length > 60 ? '...' : '' }}</div>
                  </div>
                </div>
                <div class="flex flex-col items-end">
                  <div class="flex items-center space-x-2">
                    <span :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(chat.status)}`">
                      {{ chat.status }}
                    </span>
                    <span class="text-sm text-gray-500">{{ chat.date }}</span>
                  </div>
                  <div class="mt-2 flex space-x-2">
                    <button class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Eye class="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <MessageSquare class="h-3 w-3 mr-1" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="flex items-center text-sm text-gray-500">
                  <Clock class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{{ chat.duration }}</span>
                  <div class="ml-4 flex items-center">
                    <MessageSquare class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{{ chat.messageCount }} messages</span>
                  </div>
                </div>
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <Tag class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{{ chat.tags.join(', ') }}</span>
                </div>
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
  BarChart2, 
  Bell, 
  Search, 
  Download, 
  RefreshCw, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Clock, 
  Tag, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next'

const chatLogs = ref([
  {
    userName: "Sarah Johnson",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "My dog has been scratching a lot lately. Could this be allergies?",
    date: "Today, 2:34 PM",
    status: "Resolved",
    duration: "5 min",
    messageCount: 8,
    tags: ["Dog", "Health", "Allergies"]
  },
  {
    userName: "Michael Chen",
    userAvatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "What's the best food for a 3-month-old kitten?",
    date: "Today, 11:20 AM",
    status: "Unresolved",
    duration: "3 min",
    messageCount: 5,
    tags: ["Cat", "Food", "Kitten"]
  },
  {
    userName: "Emily Rodriguez",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "Do you have any appointments available for grooming this weekend?",
    date: "Yesterday, 4:15 PM",
    status: "Escalated",
    duration: "8 min",
    messageCount: 12,
    tags: ["Grooming", "Appointment", "Service"]
  },
  {
    userName: "David Wilson",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "How often should I clean my fish tank?",
    date: "Yesterday, 10:45 AM",
    status: "Resolved",
    duration: "4 min",
    messageCount: 6,
    tags: ["Fish", "Aquarium", "Maintenance"]
  },
  {
    userName: "Jessica Taylor",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    lastMessage: "My rabbit isn't eating as much as usual. Should I be concerned?",
    date: "Mar 15, 2023",
    status: "Unresolved",
    duration: "6 min",
    messageCount: 9,
    tags: ["Rabbit", "Health", "Eating"]
  }
])

const getStatusClass = (status) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-800'
    case 'Unresolved':
      return 'bg-yellow-100 text-yellow-800'
    case 'Escalated':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>