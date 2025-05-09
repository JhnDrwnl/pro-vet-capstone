<!-- views/vet/VetTelehealth -->
<template>
  <div class="bg-white p-6 rounded-2xl">
    <!-- Header Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-medium text-gray-900">Telehealth Appointments</h2>
      <p class="text-gray-500 mt-1">View and manage telehealth appointments.</p>
    </div>
    
    <!-- Search and Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="relative flex-1 sm:flex-none">
          <input 
            v-model="search" 
            class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Search appointments..."
          />
          <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <div class="relative">
          <button 
            @click="toggleFilters"
            class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FilterIcon class="w-5 h-5 text-gray-500" />
          </button>
          <!-- Filter Dropdown - Updated to match user's screenshot -->
          <div v-if="showFilters" class="absolute top-full mt-2 left-0 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
            <div class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border-b border-gray-100">Filter by:</div>
            <button 
              @click="toggleStatusFilter('all')"
              class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
              :class="{ 'text-blue-600': filters.status === 'all' }"
            >
              All Appointments
            </button>
            <button 
              @click="toggleStatusFilter('approved')"
              class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
              :class="{ 'text-blue-600': filters.status === 'approved' }"
            >
              Approved
            </button>
            <button 
              @click="toggleStatusFilter('pending')"
              class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
              :class="{ 'text-blue-600': filters.status === 'pending' }"
            >
              Pending
            </button>
            <button 
              @click="toggleStatusFilter('ended')"
              class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
              :class="{ 'text-blue-600': filters.status === 'ended' }"
            >
              Ended
            </button>
            <button 
              @click="toggleStatusFilter('completed')"
              class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
              :class="{ 'text-blue-600': filters.status === 'completed' }"
            >
              Completed
            </button>
            <button 
              @click="toggleStatusFilter('cancelled')"
              class="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-50"
              :class="{ 'text-blue-600': filters.status === 'cancelled' }"
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 w-full sm:w-auto">
        <button 
          @click="exportToCSV"
          class="flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white rounded-full hover:bg-green-600 text-xs sm:text-sm w-auto"
        >
          <DownloadIcon class="w-3 h-3 sm:w-4 sm:h-4" />
          Export CSV
        </button>
      </div>
    </div>
    
    <!-- Active Filters Display -->
    <div v-if="filters.status && filters.status !== 'all'" class="mb-4 flex flex-wrap gap-2">
      <div class="text-sm text-gray-500 py-1">Active filters:</div>
      
      <div class="inline-flex items-center gap-1 px-3 py-1 bg-[#EBF5FF] text-[#0066FF] rounded-full text-xs capitalize">
        <span>{{ filters.status }}</span>
        <button @click="clearStatusFilter" class="text-[#0066FF] hover:text-blue-700">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
    </div>
    
    <!-- Table -->
    <div v-if="!initialLoading && !activeCall" class="border border-gray-200 rounded-lg overflow-hidden">
      <!-- Responsive Table - Works on all screen sizes with horizontal scroll -->
      <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th v-for="header in headers" :key="header.key" 
                  @click="sortBy(header.key)"
                  class="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer whitespace-nowrap">
                <div class="flex items-center">
                  {{ header.label }}
                  <div class="flex flex-col ml-1">
                    <span :class="['text-[10px] leading-none', { 'text-gray-800': sortKey === header.key && sortOrder === 'asc' }]" >▲</span>
                    <span :class="['text-[10px] leading-none', { 'text-gray-800': sortKey === header.key && sortOrder === 'desc' }]">▼</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="appointment in paginatedAppointments" :key="appointment.id" 
                class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                    <img 
                      v-if="appointment.ownerAvatar && appointment.ownerAvatar !== '/placeholder.svg?height=40&width=40'"
                      :src="appointment.ownerAvatar" 
                      class="w-full h-full object-cover"
                      alt=""
                      @error="onImageError"
                    />
                    <img 
                      v-else
                      :src="defaultPhotoURL" 
                      class="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-900">{{ appointment.ownerName || 'Unknown Owner' }}</span>
                      <span class="text-xs text-gray-500">(Owner)</span>
                    </div>
                    <div v-if="appointment.ownerEmail" class="text-xs text-gray-500 mt-0.5">
                      {{ appointment.ownerEmail }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ appointment.contactInformation || 'No contact info' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 mr-3">
                    <img 
                      :src="appointment.petPhotoURL || defaultPetPhotoURL" 
                      :alt="appointment.petName"
                      class="h-10 w-10 rounded-full object-cover" 
                      @error="onPetImageError"
                    />
                  </div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ appointment.petName }}
                    <span v-if="appointment.petSpecies" class="text-gray-600">({{ appointment.petSpecies }})</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ formatDate(appointment.date) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ appointment.time }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(service, index) in appointment.serviceNames" 
                    :key="index"
                    class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                  >
                    {{ service }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <span :class="getStatusClass(appointment.status)">
                    {{ formatStatus(appointment.status) }}
                  </span>
                </div>
              </td>
              <!-- Video Call Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-center">
                  <a 
                    v-if="appointment.status === 'approved' && isAppointmentTime(appointment)"
                    @click="joinVideoCall(appointment)"
                    class="inline-flex items-center text-blue-500 cursor-pointer text-sm"
                  >
                    <PhoneIcon class="w-4 h-4 mr-1" />
                    <span>Join Call</span>
                  </a>
                  <span v-else-if="appointment.status === 'approved' && isAppointmentPast(appointment)" class="text-gray-400 text-sm">Appointment Ended</span>
                  <span v-else-if="appointment.status === 'approved' && !isAppointmentTime(appointment)" class="text-gray-400 text-sm">
                    {{ getTimeUntilAppointment(appointment) }}
                  </span>
                  <span v-else class="text-gray-400 text-sm">Not Available</span>
                </div>
              </td>
              <!-- Created Date Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ formatDateTime(appointment.createdAt) }}</span>
              </td>
              <!-- Updated Date Column - Now showing date and time -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ formatDateTime(appointment.updatedAt) }}</span>
              </td>
            </tr>
            
            <!-- Empty state -->
            <tr v-if="paginatedAppointments.length === 0">
              <td colspan="10" class="py-8 text-center">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <CalendarIcon class="w-8 h-8 text-gray-300" />
                  </div>
                  <p class="text-gray-500 font-medium">No telehealth appointments found</p>
                  <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Active Call View -->
    <div v-if="activeCall" class="h-full flex flex-col bg-gray-100 overflow-hidden">
      <!-- Call Header with slimmer End Call button -->
      <div class="bg-white border-b border-gray-200 px-4 py-2">
        <!-- Mobile header (visible on small screens) -->
        <div class="sm:hidden">
          <!-- Top row: Title and End Call button -->
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-900">
              Telehealth Appointment
            </h2>
            <button 
              @click="endCall" 
              class="inline-flex items-center justify-center px-3 py-0.5 bg-red-600 text-white text-xs rounded-full hover:bg-red-700"
            >
              <PhoneOffIcon class="w-3 h-3 mr-1" />
              End Call
            </button>
          </div>
          
          <!-- Bottom row: User/pet info and Connected status -->
          <div class="flex items-center justify-between mt-1">
            <div class="flex items-center text-xs text-gray-600 space-x-2">
              <span class="flex items-center">
                <UserIcon class="w-3 h-3 mr-1" /> 
                {{ currentAppointment?.ownerName }}
              </span>
              <span class="flex items-center">
                <PawPrintIcon class="w-3 h-3 mr-1" /> 
                {{ currentAppointment?.petName }}
              </span>
            </div>
            
            <!-- Connection status -->
            <div class="flex items-center">
              <span 
                class="w-2 h-2 rounded-full mr-1"
                :class="remoteStreamActive ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'"
              ></span>
              <span class="text-xs text-gray-600">{{ remoteStreamActive ? 'Connected' : 'Connecting...' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Desktop header (hidden on small screens) -->
        <div class="hidden sm:flex items-center justify-between">
          <!-- Left side: Title and patient info -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 truncate">
              Telehealth Appointment
            </h2>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span class="flex items-center"><UserIcon class="w-4 h-4 mr-1" /> {{ currentAppointment?.ownerName }}</span>
              <span class="flex items-center"><PawPrintIcon class="w-4 h-4 mr-1" /> {{ currentAppointment?.petName }}</span>
              <span class="flex items-center"><ClockIcon class="w-4 h-4 mr-1" /> Time remaining: {{ remainingTime }}</span>
            </div>
          </div>
          
          <!-- Right side: Connection status and End Call button -->
          <div class="flex items-center">
            <div class="flex items-center mr-4">
              <span 
                class="w-2 h-2 rounded-full mr-2"
                :class="remoteStreamActive ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'"
              ></span>
              <span class="text-sm text-gray-600">{{ remoteStreamActive ? 'Connected' : 'Connecting...' }}</span>
            </div>
            <button 
              @click="endCall" 
              class="inline-flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-full hover:bg-red-700"
            >
              <PhoneOffIcon class="w-4 h-4 mr-1" />
              End Call
            </button>
          </div>
        </div>
      </div>
      
      <!-- Call Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="flex flex-col md:flex-row gap-3 p-3 sm:gap-4 sm:p-4">
          <!-- Video Container - Takes full width on mobile, 2/3 on desktop -->
          <div class="flex-1 flex flex-col gap-3 sm:gap-4">
            <!-- Main Video Container - Increased height for mobile -->
            <div class="relative bg-gray-900 rounded-xl overflow-hidden md:aspect-video h-[450px] sm:h-[500px] md:h-auto">
              <!-- Remote Video -->
              <video id="remote-video" ref="remoteVideoRef" autoplay playsinline class="w-full h-full object-cover"></video>
              
              <!-- Waiting Placeholder - Responsive sizing -->
              <div v-if="!remoteStreamActive" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-4">
                <div class="relative mb-4 sm:mb-6">
                  <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center">
                    <UserIcon class="w-7 h-7 sm:w-10 sm:h-10" />
                  </div>
                  <div class="absolute inset-0 border-3 sm:border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <p class="text-base sm:text-xl font-medium mb-1 sm:mb-2 text-center">Waiting for pet owner to join...</p>
                <p class="text-xs sm:text-sm text-gray-400 text-center">The pet owner will appear here when they join</p>
              </div>
              
              <!-- Local Video (PiP) - Increased height and width -->
              <div class="absolute top-4 right-4 w-1/2 sm:w-2/5 md:w-1/4 h-[120px] sm:h-[140px] md:h-auto md:aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <video 
                  id="local-video" 
                  ref="localVideoRef" 
                  autoplay 
                  playsinline 
                  muted 
                  class="w-full h-full object-cover transform scale-x-[-1]"
                ></video>
              </div>
              
              <!-- Call Controls - Smaller for mobile with Speaker Button -->
              <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-gray-900/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
                <button 
                  @click="toggleMute" 
                  :class="[
                    'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    isMuted ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                  ]"
                >
                  <MicOffIcon v-if="isMuted" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <MicIcon v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleVideo" 
                  :class="[
                    'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    isVideoOff ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                  ]"
                >
                  <VideoOffIcon v-if="isVideoOff" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <VideoIcon v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleChatPanel" 
                  :class="[
                    'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    showChatPanel ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                  ]"
                >
                  <MessageSquareIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleScreenShare" 
                  :class="[
                    'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    isScreenSharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                  ]"
                >
                  <MonitorIcon class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  @click="toggleSpeaker" 
                  :class="[
                    'w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    isSpeakerMuted ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                  ]"
                >
                  <VolumeXIcon v-if="isSpeakerMuted" class="w-4 h-4 sm:w-5 sm:h-5" />
                  <Volume2Icon v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <!-- Time Remaining Indicator (Mobile) -->
              <div class="sm:hidden absolute top-4 left-4 bg-gray-900/80 px-2 py-1 rounded-full text-white text-xs">
                <span class="flex items-center">
                  <ClockIcon class="w-3 h-3 mr-1" />
                  {{ remainingTime }}
                </span>
              </div>
            </div>
            
            <!-- Mobile Chat Panel - Same height as video on mobile -->
            <div v-if="showChatPanel && isMobileView" class="bg-white rounded-xl shadow-sm flex flex-col h-[450px] sm:h-[500px]">
              <div class="p-2 border-b border-gray-100">
                <h3 class="text-base font-medium text-gray-900">Chat</h3>
              </div>
              
              <div class="flex-1 overflow-y-auto p-2 space-y-2" ref="mobileChatMessagesRef">
                <div 
                  v-for="message in chatMessages" 
                  :key="message.id"
                  :class="[
                    'max-w-[80%]',
                    message.sender === 'user' ? 'mr-auto' : 'ml-auto'
                  ]"
                >
                  <div 
                    :class="[
                      'px-2 py-1 rounded-xl text-xs sm:text-sm',
                      message.sender === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                    ]"
                  >
                    {{ message.text }}
                  </div>
                  <div 
                    :class="[
                      'text-[9px] mt-0.5 flex items-center',
                      message.sender === 'user' ? 'text-left text-gray-500' : 'text-right text-gray-500'
                    ]"
                  >
                    <span>{{ message.sender === 'user' ? message.senderName || 'Patient' : 'You' }}</span>
                    <span class="mx-1">•</span>
                    <span>{{ formatTime(message.timestamp) }}</span>
                    <CheckIcon v-if="message.sender === 'user' && message.read" class="w-2 h-2 ml-1 text-blue-500" />
                  </div>
                </div>
              </div>
              
              <div class="p-2 border-t border-gray-100">
                <div class="flex gap-2">
                  <input 
                    v-model="newMessage" 
                    @keyup.enter="sendMessage"
                    placeholder="Type a message..."
                    class="flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    @click="sendMessage" 
                    class="min-w-[32px] h-[32px] bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
                  >
                    <SendIcon class="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Desktop Chat Section - Fixed responsive issues -->
          <div v-if="showChatPanel && !isMobileView" class="bg-white rounded-xl shadow-sm flex flex-col md:w-1/3 max-w-sm">
            <div class="p-4 border-b border-gray-100">
              <h3 class="text-lg font-medium text-gray-900">Chat</h3>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatMessagesRef">
              <div 
                v-for="message in chatMessages" 
                :key="message.id"
                :class="[
                  'max-w-[85%]',
                  message.sender === 'user' ? 'mr-auto' : 'ml-auto'
                ]"
              >
                <div 
                  :class="[
                    'px-4 py-2 rounded-full',
                    message.sender === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                  ]"
                >
                  {{ message.text }}
                </div>
                <div 
                  :class="[
                    'text-xs mt-1 flex items-center',
                    message.sender === 'user' ? 'text-left text-gray-500' : 'text-right text-gray-500'
                  ]"
                >
                  <span>{{ message.sender === 'user' ? message.senderName || 'Patient' : 'You' }}</span>
                  <span class="mx-1">•</span>
                  <span>{{ formatTime(message.timestamp) }}</span>
                  <CheckIcon v-if="message.sender === 'user' && message.read" class="w-3 h-3 ml-1 text-blue-500" />
                </div>
              </div>
            </div>
            
            <!-- Improved responsive chat input container -->
            <div class="p-3 border-t border-gray-100">
              <div class="flex items-center gap-2 w-full">
                <input 
                  v-model="newMessage" 
                  @keyup.enter="sendMessage"
                  placeholder="Type a message..."
                  class="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  @click="sendMessage" 
                  class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <SendIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Add bottom padding to ensure content isn't hidden behind navigation -->
        <div class="h-16 sm:h-20"></div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="!initialLoading && !activeCall && filteredAndSortedAppointments.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
      <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAndSortedAppointments.length }} entries
      </div>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
          :class="[currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50']"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
          :class="[currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50']"
        >
          Next
        </button>
      </div>
    </div>
  </div>
  
  <!-- Loading Spinner Overlay -->
  <LoadingSpinner v-if="initialLoading" isOverlay text="Loading appointments..." />
  
  <!-- Incoming Call Modal -->
  <div v-if="incomingCall && !isAcceptingCall" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div class="bg-white rounded-xlxl max-w-md w-full overflow-hidden">
      <div class="p-6 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <PhoneIcon class="w-10 h-10 text-green-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ incomingCall.callerName || 'Pet Owner' }} is calling</h3>
        <p class="text-gray-600 mb-8">Telehealth Appointment</p>
        
        <div class="flex gap-4">
          <button 
            @click="acceptIncomingCall" 
            class="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            <PhoneIcon class="w-5 h-5 mr-2" />
            Accept
          </button>
          <button 
            @click="declineIncomingCall" 
            class="flex-1 inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <PhoneOffIcon class="w-5 h-5 mr-2" />
            Decline
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Call Time Expired Modal -->
  <div v-if="showCallExpiredModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full overflow-hidden">
      <div class="p-6 text-center">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClockIcon class="w-10 h-10 text-red-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Appointment Time Ended</h3>
        <p class="text-gray-600 mb-8">The scheduled time for this appointment has ended.</p>
        
        <button 
          @click="acknowledgeCallExpired" 
          class="inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          <CheckIcon class="w-5 h-5 mr-2" />
          OK
        </button>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch, nextTick, onActivated, onDeactivated, onBeforeUnmount } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { 
    Search as SearchIcon,
    Filter as FilterIcon,
    Download as DownloadIcon,
    X as XIcon,
    Calendar as CalendarIcon,
    Phone as PhoneIcon,
    PhoneOff as PhoneOffIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    Video as VideoIcon,
    VideoOff as VideoOffIcon,
    Send as SendIcon,
    User as UserIcon,
    Monitor as MonitorIcon,
    MessageSquare as MessageSquareIcon,
    PawPrint as PawPrintIcon,
    Volume2 as Volume2Icon,
    VolumeX as VolumeXIcon,
    Check as CheckIcon,
    Clock as ClockIcon
  } from 'lucide-vue-next';
  import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
  import { useAppointmentStore } from '@/stores/modules/appointmentStore';
  import { useProfileStore } from '@/stores/modules/profileStore';
  import { usePetsStore } from '@/stores/modules/petsStore';
  import { useAuthStore } from '@/stores/modules/authStore';
  import { useServiceCategoryStore } from '@/stores/modules/ServiceCategoryStore';
  import { parseISO, format, isToday, isFuture, addMinutes, subMinutes, isAfter, isBefore, differenceInMinutes, differenceInSeconds } from 'date-fns';
  import WebRTCService from '@/services/webrtc-service';
  import { db } from '@shared/firebase';
  import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, arrayUnion, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
  
  // Router and route
  const router = useRouter();
  const route = useRoute();
  
  // Default photo URL for profile placeholder
  const defaultPhotoURL = ref('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2236%22 height%3D%2236%22 viewBox%3D%220 0 36 36%22%3E%3Ccircle cx%3D%2218%22 cy%3D%2218%22 r%3D%2218%22 fill%3D%22%23f0f0f0%22%2F%3E%3Cpath d%3D%22M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5%22 stroke%3D%22%23bec3c9%22 stroke-width%3D%222%22 fill%3D%22none%22%2F%3E%3C%2Fsvg%3E');
  
  // Default pet photo URL
  const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E';
  
  const appointmentStore = useAppointmentStore();
  const profileStore = useProfileStore();
  const petsStore = usePetsStore();
  const authStore = useAuthStore();
  const serviceCategoryStore = useServiceCategoryStore();
  
  // Modified headers array - added Video Call column
  const headers = [
    { key: 'ownerName', label: 'Owner' },
    { key: 'contactInformation', label: 'Contact' },
    { key: 'petName', label: 'Pet' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'services', label: 'Services' },
    { key: 'status', label: 'Status' },
    { key: 'videoCall', label: 'Video Call' },
    { key: 'createdAt', label: 'Created' },
    { key: 'updatedAt', label: 'Updated' }
  ];
  
  // State variables
  const search = ref('');
  const sortKey = ref('date');
  const sortOrder = ref('asc');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const showFilters = ref(false);
  const filters = ref({
    status: 'all', // Changed to 'all' to show all statuses by default
  });
  
  // Loading states
  const initialLoading = ref(true);
  
  // Appointments data - Initialize with an empty array
  const appointments = ref([]);
  
  // Video call states
  const activeCall = ref(false);
  const currentAppointment = ref(null);
  const localVideoRef = ref(null);
  const remoteVideoRef = ref(null);
  const localStream = ref(null);
  const remoteStream = ref(null);
  const isMuted = ref(false);
  const isVideoOff = ref(false);
  const isScreenSharing = ref(false);
  const remoteStreamActive = ref(false);
  const showChatPanel = ref(false);
  const chatMessages = ref([]);
  const newMessage = ref('');
  const chatMessagesRef = ref(null);
  const mobileChatMessagesRef = ref(null);
  const incomingCall = ref(null);
  let incomingCallsUnsubscribe = null;
  // Add speaker mute state
  const isSpeakerMuted = ref(false);
  // Add call document unsubscribe
  let callDocUnsubscribe = null;
  // Add ice candidates unsubscribe
  let iceCandidatesUnsubscribe = null;
  // Add connection status
  const connectionStatus = ref('connecting');
  // Mobile view detection
  const isMobileView = ref(false);
  // Add flag to track when a call is being accepted
  const isAcceptingCall = ref(false);
  // Add chat messages subscription
  let chatMessagesUnsubscribe = null;
  // Add appointment time tracking
  const appointmentEndTime = ref(null);
  const remainingTime = ref('');
  let appointmentTimer = null;
  // Add call expired modal
  const showCallExpiredModal = ref(false);
  
  // Check for mobile view
  const checkMobileView = () => {
    isMobileView.value = window.innerWidth < 768;
  };
  
  // Improved fetchAppointments function to ensure pet data is fully loaded and filter by current vet
  const fetchAppointments = async () => {
    initialLoading.value = true;
  
    try {
      // First, fetch all appointments
      await appointmentStore.fetchAppointments();
      
      // Get the current user (veterinarian) ID
      const currentVetId = authStore.user?.userId;
      
      if (!currentVetId) {
        console.error('No veterinarian ID found in auth store');
        return;
      }
      
      // Fetch categories and services to identify telehealth appointments
      await serviceCategoryStore.fetchCategories();
      await serviceCategoryStore.fetchServices();
      
      // Get the appointments from the store and filter by the current veterinarian
      const fetchedAppointments = [...appointmentStore.appointments].filter(appointment => {
        // Only include appointments assigned to this veterinarian
        return appointment.doctorId === currentVetId;
      });
      
      console.log(`Filtered ${fetchedAppointments.length} appointments for veterinarian ID: ${currentVetId}`);
      
      // Create an array to hold all the promises for data fetching
      const dataFetchPromises = [];
      
      // Process each appointment to prepare data fetching
      fetchedAppointments.forEach(appointment => {
        // Prepare to fetch owner information
        if (appointment.userId && appointment.userId !== 'guest-user') {
          const ownerPromise = profileStore.fetchUserProfile(appointment.userId)
            .then(userProfile => {
              if (userProfile) {
                // Update the appointment with owner information
                appointment.ownerName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
                appointment.ownerAvatar = userProfile.photoURL || null;
                appointment.contactInformation = userProfile.phone || userProfile.email || '';
                appointment.ownerEmail = userProfile.email || '';
                
                // Add additional owner information
                appointment.firstName = userProfile.firstName || '';
                appointment.lastName = userProfile.lastName || '';
                appointment.dateOfBirth = userProfile.dateOfBirth || '';
                appointment.age = userProfile.age || '';
                appointment.gender = userProfile.gender || '';
                appointment.streetAddress = userProfile.streetAddress || '';
              }
            })
            .catch(error => {
              console.error(`Error fetching user profile for appointment ${appointment.id}:`, error);
            });
          
          dataFetchPromises.push(ownerPromise);
        }
        
        // Prepare to fetch pet information - with improved error handling
        if (appointment.petId) {
          // Validate petId before attempting to fetch
          const isValidPetId = typeof appointment.petId === 'string' && appointment.petId.trim() !== '';
          
          if (isValidPetId) {
            const petPromise = petsStore.getPetById(appointment.userId, appointment.petId)
              .then(petData => {
                if (petData) {
                  appointment.petPhotoURL = petData.photoURL || null;
                  appointment.petSpecies = petData.species || '';
                  appointment.petBreed = petData.breed || '';
                  appointment.petGender = petData.gender || '';
                  appointment.petWeight = petData.weight || '';
                  
                  // Handle different age structures
                  if (petData.ageYears !== undefined || petData.ageMonths !== undefined || petData.ageWeeks !== undefined) {
                    appointment.petAgeYears = petData.ageYears;
                    appointment.petAgeMonths = petData.ageMonths;
                    appointment.petAgeWeeks = petData.ageWeeks;
                  } else if (petData.age && typeof petData.age === 'object') {
                    appointment.petAgeYears = petData.age.years;
                    appointment.petAgeMonths = petData.age.months;
                    appointment.petAgeWeeks = petData.age.weeks;
                  }
                }
              })
              .catch(error => {
                console.error(`Error fetching pet data for appointment ${appointment.id}:`, error);
                // Set default pet data to prevent UI issues
                appointment.petPhotoURL = null;
                appointment.petSpecies = 'Unknown';
                appointment.petBreed = '';
                appointment.petGender = '';
                appointment.petWeight = '';
                appointment.petAgeYears = 0;
                appointment.petAgeMonths = 0;
                appointment.petAgeWeeks = 0;
              });
            
            dataFetchPromises.push(petPromise);
          } else {
            console.warn(`Invalid petId for appointment ${appointment.id}: ${appointment.petId}`);
            // Set default pet data
            appointment.petPhotoURL = null;
            appointment.petSpecies = 'Unknown';
            appointment.petBreed = '';
            appointment.petGender = '';
            appointment.petWeight = '';
            appointment.petAgeYears = 0;
            appointment.petAgeMonths = 0;
            appointment.petAgeWeeks = 0;
          }
        }
      });
      
      // Wait for ALL data fetching to complete before updating the UI
      await Promise.allSettled(dataFetchPromises);
      
      // Now that all data is fetched, update the appointments ref
      appointments.value = fetchedAppointments;
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      // Only set loading to false after ALL data is fetched
      initialLoading.value = false;
    }
  };
  
  // Initialize component
  onMounted(() => {
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    fetchAppointments();
    setupIncomingCallsListener();
    
    // Add event listener for screen share ended event
    window.addEventListener('webrtc-screenshare-ended', handleScreenShareEnded);
  });
  
  // Clean up when component is unmounted
  onBeforeUnmount(() => {
    // Clean up WebRTC
    if (activeCall.value) {
      endCall();
    }
    
    // Clear incoming calls interval
    if (incomingCallsUnsubscribe) {
      incomingCallsUnsubscribe();
    }
    
    // Clean up chat messages subscription
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe();
      chatMessagesUnsubscribe = null;
    }
    
    // Clear appointment timer
    if (appointmentTimer) {
      clearInterval(appointmentTimer);
      appointmentTimer = null;
    }
    
    window.removeEventListener("resize", checkMobileView);
    
    // Remove screen share ended event listener
    window.removeEventListener('webrtc-screenshare-ended', handleScreenShareEnded);
  });
  
  // Handle Vue keep-alive activation/deactivation
  onActivated(() => {
    // When the component is activated (comes back into view)
    fetchAppointments(); // Always fetch fresh data when coming back to this view
    
    // Re-add event listener for screen share ended event
    window.addEventListener('webrtc-screenshare-ended', handleScreenShareEnded);
  });
  
  onDeactivated(() => {
    // When the component is deactivated (hidden but kept alive)
    // Remove screen share ended event listener to prevent memory leaks
    window.removeEventListener('webrtc-screenshare-ended', handleScreenShareEnded);
  });
  
  // Toggle filters visibility
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };
  
  // Status filter functions - Updated to match user's screenshot
  const toggleStatusFilter = (status) => {
    filters.value.status = status;
    showFilters.value = false;
    currentPage.value = 1;
  };
  
  const clearStatusFilter = () => {
    filters.value.status = 'all';
    currentPage.value = 1;
  };
  
  // Helper function to check if an appointment is a telehealth appointment
  const isTelehealthAppointment = (appointment) => {
    // Check if the appointment has a direct category property
    if (appointment.category && appointment.category.toLowerCase().includes('telehealth')) {
      return true;
    }
  
    // If not, check if any of the services belong to the Telehealth category
    if (appointment.services && appointment.services.length > 0) {
      // Check if any service name contains "telehealth" or "follow-up"
      if (appointment.serviceNames && appointment.serviceNames.some(name => 
        name.toLowerCase().includes('telehealth') || 
        name.toLowerCase().includes('follow-up'))) {
        return true;
      }
      
      // Try to find the service in the service store
      return appointment.services.some(serviceId => {
        const service = serviceCategoryStore.services.find(s => s.id === serviceId);
        if (!service) return false;
        
        // Check if the service belongs to a telehealth category
        const category = serviceCategoryStore.categories.find(c => c.id === service.categoryId);
        return category && category.name.toLowerCase().includes('telehealth');
      });
    }
  
    return false;
  };
  
  // Function to check if it's time for the appointment
  const isAppointmentTime = (appointment) => {
    if (!appointment.date || !appointment.time) return false;
  
    try {
      // Handle date properly whether it's a string or Date object
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : parseISO(appointment.date);
      
      // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
      if (appointment.time) {
        const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
        if (timeMatch && timeMatch.length >= 3) {
          // Get the start time part
          const startTimeStr = timeMatch[1].trim();
          // Get the end time part
          const endTimeStr = timeMatch[2].trim();
          
          // Create date objects for the appointment start and end times
          const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
          const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
          
          if (startTimeParts && endTimeParts) {
            // Parse start time
            let startHours = parseInt(startTimeParts[1]);
            const startMinutes = parseInt(startTimeParts[2]);
            const startPeriod = startTimeParts[3].toUpperCase();
            
            // Convert to 24-hour format
            if (startPeriod === 'PM' && startHours < 12) startHours += 12;
            if (startPeriod === 'AM' && startHours === 12) startHours = 0;
            
            // Parse end time
            let endHours = parseInt(endTimeParts[1]);
            const endMinutes = parseInt(endTimeParts[2]);
            const endPeriod = endTimeParts[3].toUpperCase();
            
            // Convert to 24-hour format
            if (endPeriod === 'PM' && endHours < 12) endHours += 12;
            if (endPeriod === 'AM' && endHours === 12) endHours = 0;
            
            // Create appointment start and end datetime objects
            const startTime = new Date(appointmentDate);
            startTime.setHours(startHours, startMinutes, 0, 0);
            
            const endTime = new Date(appointmentDate);
            endTime.setHours(endHours, endMinutes, 0, 0);
            
            // If end time is earlier than start time, it means the appointment ends the next day
            if (endTime < startTime) {
              endTime.setDate(endTime.getDate() + 1);
            }
            
            // Get current time
            const now = new Date();
            
            // Check if current time is within the appointment time range
            return now >= startTime && now <= endTime;
          }
        }
      }
      
      // If we couldn't parse the time string, return false
      return false;
    } catch (error) {
      console.error('Error checking appointment time:', error);
      return false;
    }
  };
  
  // Function to check if an appointment is in the past
  const isAppointmentPast = (appointment) => {
    if (!appointment.date || !appointment.time) return false;
  
    try {
      // Handle date properly whether it's a string or Date object
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : parseISO(appointment.date);
      
      // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
      if (appointment.time) {
        const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
        if (timeMatch && timeMatch.length >= 3) {
          // Get the end time part
          const endTimeStr = timeMatch[2].trim();
          
          // Create date objects for the appointment end time
          const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
          
          if (endTimeParts) {
            // Parse end time
            let endHours = parseInt(endTimeParts[1]);
            const endMinutes = parseInt(endTimeParts[2]);
            const endPeriod = endTimeParts[3].toUpperCase();
            
            // Convert to 24-hour format
            if (endPeriod === 'PM' && endHours < 12) endHours += 12;
            if (endPeriod === 'AM' && endHours === 12) endHours = 0;
            
            // Create appointment end datetime object
            const endTime = new Date(appointmentDate);
            endTime.setHours(endHours, endMinutes, 0, 0);
            
            // Get current time
            const now = new Date();
            
            // Check if current time is after the appointment end time
            return now > endTime;
          }
        }
      }
      
      // If we couldn't parse the time string, return false
      return false;
    } catch (error) {
      console.error('Error checking if appointment is past:', error);
      return false;
    }
  };
  
  // Function to get time until appointment
  const getTimeUntilAppointment = (appointment) => {
    if (!appointment.date || !appointment.time) return 'N/A';
  
    try {
      // Handle date properly whether it's a string or Date object
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : parseISO(appointment.date);
      
      // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
      if (appointment.time) {
        const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
        if (timeMatch && timeMatch.length >= 3) {
          // Get the start time part
          const startTimeStr = timeMatch[1].trim();
          
          // Create date objects for the appointment start time
          const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
          
          if (startTimeParts) {
            // Parse start time
            let startHours = parseInt(startTimeParts[1]);
            const startMinutes = parseInt(startTimeParts[2]);
            const startPeriod = startTimeParts[3].toUpperCase();
            
            // Convert to 24-hour format
            if (startPeriod === 'PM' && startHours < 12) startHours += 12;
            if (startPeriod === 'AM' && startHours === 12) startHours = 0;
            
            // Create appointment start datetime object
            const startTime = new Date(appointmentDate);
            startTime.setHours(startHours, startMinutes, 0, 0);
            
            // Get current time
            const now = new Date();
            
            // Calculate the difference in minutes
            const diffInMinutes = differenceInMinutes(startTime, now);
            
            if (diffInMinutes <= 0) {
              return 'Starting now';
            } else if (diffInMinutes < 60) {
              return `Starts in ${diffInMinutes} minutes`;
            } else {
              const hours = Math.floor(diffInMinutes / 60);
              const minutes = diffInMinutes % 60;
              return `Starts in ${hours}h ${minutes}m`;
            }
          }
        }
      }
      
      // If we couldn't parse the time string, return a generic message
      return 'Check appointment time';
    } catch (error) {
      console.error('Error getting time until appointment:', error);
      return 'N/A';
    }
  };
  
  // Function to join a video call
  const joinVideoCall = async (appointment) => {
    try {
      // Check if it's time for the appointment
      if (!isAppointmentTime(appointment)) {
        alert('This appointment is not currently available for video call. You can join during the scheduled appointment time.');
        return;
      }
      
      // Set connection status to connecting
      connectionStatus.value = 'connecting';
      
      // Request camera and microphone access
      try {
        localStream.value = await WebRTCService.setupLocalStream();
        
        // Set the stream to the video element
        if (localVideoRef.value) {
          localVideoRef.value.srcObject = localStream.value;
        }
      } catch (error) {
        console.error('Error accessing camera/microphone:', error);
        return;
      }
  
      // Set current appointment and activate call view
      currentAppointment.value = appointment;
      activeCall.value = true;
      
      // Initialize chat for this session
      chatMessages.value = [];
      
      // Start appointment timer
      startAppointmentTimer(appointment);
      
      // Wait for DOM update before initializing video elements
      await nextTick();
      
      // Make sure video elements are properly set up after DOM update
      if (localVideoRef.value && localStream.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
  
      // Start the WebRTC call
      try {
        const streams = await WebRTCService.startCall(
          appointment.id, 
          authStore.user.userId, 
          appointment.userId,
          localStream.value,
          (stream) => {
            // When we receive the remote stream
            if (remoteVideoRef.value) {
              remoteVideoRef.value.srcObject = stream;
              remoteStreamActive.value = true;
            }
          }
        );
        
        // Set remote stream to video element
        if (remoteVideoRef.value && streams.remoteStream) {
          remoteVideoRef.value.srcObject = streams.remoteStream;
          remoteStream.value = streams.remoteStream;
          
          // Check if there are already tracks in the remote stream
          if (streams.remoteStream.getTracks().length > 0) {
            console.log('Remote stream already has tracks, activating');
            remoteStreamActive.value = true;
            // Update connection status to connected when remote stream is active
            connectionStatus.value = 'connected';
          }
          
          // Listen for remote tracks to update UI
          streams.remoteStream.onaddtrack = (event) => {
            console.log('New remote track added:', event.track.kind);
            remoteStreamActive.value = true;
            // Update connection status to connected when remote stream gets tracks
            connectionStatus.value = 'connected';
          };
          
          // Add a periodic check for remote stream tracks
          const checkInterval = setInterval(() => {
            if (streams.remoteStream.getTracks().length > 0) {
              console.log('Remote tracks detected in interval check');
              remoteStreamActive.value = true;
              // Update connection status to connected when remote stream gets tracks
              connectionStatus.value = 'connected';
              clearInterval(checkInterval);
            }
          }, 1000);
        }
        
        // Add a listener for call status changes in Firestore
        const callDoc = doc(db, 'calls', appointment.id);
        callDocUnsubscribe = onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data) {
            // If the call was rejected by the user, return to table view
            if (data.status === 'rejected') {
              console.log('Call was rejected by the user');
              // Clean up and return to table view
              endCall();
            }
            
            // If the call was ended by the user, return to table view
            if (data.status === 'ended') {
              console.log('Call was ended by the user');
              // Clean up and return to table view
              endCall();
            }
            
            // If the call is active and we have an answer, update connection status
            if (data.status === 'active' && data.answer) {
              // We'll wait for the remote stream to have tracks before setting to connected
              // This is handled by the onaddtrack event and periodic check above
            }
          }
        });
        
        // Listen for ICE connection state changes
        if (WebRTCService.peerConnection) {
          WebRTCService.peerConnection.oniceconnectionstatechange = () => {
            const state = WebRTCService.peerConnection.iceConnectionState;
            console.log('ICE connection state changed:', state);
            
            if (state === 'connected' || state === 'completed') {
              connectionStatus.value = 'connected';
            } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
              connectionStatus.value = 'disconnected';
            }
          };
        }
        
        // Subscribe to chat messages for this call
        subscribeToChatMessages(appointment.id);
        
      } catch (error) {
        console.error('Error starting call:', error);
        connectionStatus.value = 'disconnected';
      }
    } catch (error) {
      console.error('Error joining video call:', error);
      connectionStatus.value = 'disconnected';
    }
  };
  
  // Subscribe to chat messages
  const subscribeToChatMessages = (callId) => {
    // Clean up any existing subscription
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe();
      chatMessagesUnsubscribe = null;
    }
  
    try {
      // Create a reference to the messages collection for this call
      const messagesRef = collection(db, 'calls', callId, 'messages');
      
      // Create a query to get messages ordered by timestamp
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      
      // Subscribe to the query
      chatMessagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        // Process the snapshot to update the chat messages
        const newMessages = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Convert server timestamp to Date object
          const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
          
          // Add the message to the array
          newMessages.push({
            id: doc.id,
            text: data.text,
            sender: data.sender,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: timestamp,
            read: data.read
          });
        });
        
        // Update the chat messages
        chatMessages.value = newMessages;
        
        // Scroll to bottom of chat
        nextTick(() => {
          if (isMobileView.value) {
            if (mobileChatMessagesRef.value) {
              mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight;
            }
          } else {
            if (chatMessagesRef.value) {
              chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
            }
          }
        });
        
        // Mark messages as read
        markMessagesAsRead(newMessages);
      });
    } catch (error) {
      console.error('Error subscribing to chat messages:', error);
    }
  };
  
  // Mark messages as read
  const markMessagesAsRead = async (messages) => {
    if (!currentAppointment.value || !authStore.user) return;
  
    try {
      // Find messages that are from user (not vet) and are unread
      const unreadMessages = messages.filter(msg => 
        msg.sender === 'user' && 
        msg.senderId !== authStore.user.userId && 
        !msg.read
      );
      
      // Mark each unread message as read
      for (const message of unreadMessages) {
        const messageRef = doc(db, 'calls', currentAppointment.value.id, 'messages', message.id);
        await updateDoc(messageRef, { read: true });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
  
    let date;
    if (typeof dateString === 'string') {
      // Handle ISO string
      date = parseISO(dateString);
    } else if (dateString instanceof Date) {
      // Handle Date object
      date = dateString;
    } else {
      return 'Invalid date';
    }
  
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
  
    let date;
    if (typeof dateString === 'string') {
      // Handle ISO string
      date = parseISO(dateString);
    } else if (dateString instanceof Date) {
      // Handle Date object
      date = dateString;
    } else {
      return 'Unknown';
    }
  
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
  
    try {
      // Ensure we have a valid Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      // Format the time
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };
  
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
  
    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };
  
  const sortBy = (key) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
  };
  
  const onImageError = (event) => {
    event.target.src = defaultPhotoURL.value;
  };
  
  const onPetImageError = (event) => {
    event.target.src = defaultPetPhotoURL;
  };
  
  // Filter appointments based on selected status and search query
  const filteredAndSortedAppointments = computed(() => {
    // Create a Map to store unique appointments by ID
    const uniqueAppointments = new Map();
  
    // Process each appointment
    appointments.value.forEach(appointment => {
      // First check if it's a telehealth appointment
      if (!isTelehealthAppointment(appointment)) {
        return;
      }
      
      // Apply status filter if set
      if (filters.value.status !== 'all' && appointment.status !== filters.value.status) {
        return;
      }
      
      // Check if it matches the search criteria
      const matchesSearch =
        (appointment.ownerName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
        (appointment.ownerEmail?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
        (appointment.petName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
        (appointment.petSpecies?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
        (appointment.contactInformation?.toLowerCase() || '').includes(search.value.toLowerCase());
  
      // Only add to the map if it matches criteria and isn't already there
      if (matchesSearch) {
        uniqueAppointments.set(appointment.id, appointment);
      }
    });
  
    // Convert the Map values to an array
    let filtered = Array.from(uniqueAppointments.values());
  
    // Sort the filtered appointments
    return filtered.sort((a, b) => {
      let aValue = a[sortKey.value];
      let bValue = b[sortKey.value];
  
      if (sortKey.value === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortKey.value === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortKey.value === 'updatedAt') {
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
      }
  
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  });
  
  const totalPages = computed(() => {
    return Math.ceil(filteredAndSortedAppointments.value.length / itemsPerPage) || 1;
  });
  
  const paginatedAppointments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedAppointments.value.slice(start, end);
  });
  
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
  const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredAndSortedAppointments.value.length));
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const getStatusClass = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status?.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'ended':
      case 'completed':
        return `${baseClasses} bg-slate-200 text-slate-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
  
  // Video call functions
  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    WebRTCService.toggleMute(isMuted.value);
  };
  
  const toggleVideo = () => {
    isVideoOff.value = !isVideoOff.value;
    WebRTCService.toggleVideo(isVideoOff.value);
  };
  
  // Add speaker toggle function
  const toggleSpeaker = () => {
    isSpeakerMuted.value = !isSpeakerMuted.value;
    
    // If we have a remote video element, mute/unmute it
    if (remoteVideoRef.value) {
      remoteVideoRef.value.muted = isSpeakerMuted.value;
    }
  };
  
  // Add this function to properly handle screen share ended events
  const handleScreenShareEnded = () => {
    console.log('Screen sharing ended event received');
    // Update UI state to reflect that screen sharing has ended
    isScreenSharing.value = false;
    
    // Make sure we update the UI immediately
    nextTick(() => {
      // Force a UI update if needed
      if (isScreenSharing.value) {
        isScreenSharing.value = false;
      }
    });
  };
  
  // Modify the toggleScreenShare function to better handle state
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing.value) {
        // If we're turning off screen sharing
        localStream.value = await WebRTCService.toggleScreenShare(true);
        
        // Update video element
        if (localVideoRef.value) {
          localVideoRef.value.srcObject = localStream.value;
        }
        
        // Update state after successful toggle
        isScreenSharing.value = false;
      } else {
        // If we're turning on screen sharing
        try {
          localStream.value = await WebRTCService.toggleScreenShare(false);
          
          // Update video element
          if (localVideoRef.value) {
            localVideoRef.value.srcObject = localStream.value;
          }
          
          // Only update state if screen sharing was successfully started
          isScreenSharing.value = true;
        } catch (error) {
          // If screen sharing failed to start (e.g., user denied permission)
          console.error('Failed to start screen sharing:', error);
          isScreenSharing.value = false;
        }
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      // Ensure UI state is consistent even if there's an error
      isScreenSharing.value = false;
    }
  };
  
  // Toggle chat panel
  const toggleChatPanel = () => {
    showChatPanel.value = !showChatPanel.value;
    
    // Scroll to bottom of chat when opening
    if (showChatPanel.value) {
      nextTick(() => {
        if (isMobileView.value) {
          if (mobileChatMessagesRef.value) {
            mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight;
          }
        } else {
          if (chatMessagesRef.value) {
            chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
          }
        }
      });
    }
  };
  
  // Updated sendMessage function to use Firebase for real-time communication
  const sendMessage = async () => {
    if (newMessage.value.trim() === '' || !currentAppointment.value) return;
  
    try {
      // Create a reference to the messages collection for this call
      const messagesRef = collection(db, 'calls', currentAppointment.value.id, 'messages');
      
      // Add the new message to Firestore
      await addDoc(messagesRef, {
        text: newMessage.value,
        sender: 'vet', // 'vet' for veterinarian, 'user' for pet owner
        senderId: authStore.user.userId,
        senderName: authStore.user.displayName || 'Doctor',
        timestamp: serverTimestamp(),
        read: false
      });
      
      // Clear the input field
      newMessage.value = '';
      
      // Scroll to bottom of chat
      nextTick(() => {
        if (isMobileView.value) {
          if (mobileChatMessagesRef.value) {
            mobileChatMessagesRef.value.scrollTop = mobileChatMessagesRef.value.scrollHeight;
          }
        } else {
          if (chatMessagesRef.value) {
            chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
          }
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const endCall = () => {
    // Reset screen sharing state
    isScreenSharing.value = false;
    
    // Unsubscribe from chat messages
    if (chatMessagesUnsubscribe) {
      chatMessagesUnsubscribe();
      chatMessagesUnsubscribe = null;
    }
    
    // Stop listening for updates
    if (callDocUnsubscribe) {
      callDocUnsubscribe();
      callDocUnsubscribe = null;
    }
    
    if (iceCandidatesUnsubscribe) {
      iceCandidatesUnsubscribe();
      iceCandidatesUnsubscribe = null;
    }
    
    // Clear appointment timer
    if (appointmentTimer) {
      clearInterval(appointmentTimer);
      appointmentTimer = null;
    }
    
    // Use WebRTCService to hang up
    WebRTCService.hangUp();
    
    // Clean up local state
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop());
      localStream.value = null;
    }
    
    remoteStream.value = null;
    remoteStreamActive.value = false;
    activeCall.value = false;
    currentAppointment.value = null;
    chatMessages.value = [];
    isMuted.value = false;
    isVideoOff.value = false;
    isScreenSharing.value = false;
    isSpeakerMuted.value = false;
    showChatPanel.value = false;
    connectionStatus.value = 'connecting'; // Reset connection status
    remainingTime.value = '';
  };
  
  const acceptIncomingCall = async () => {
    if (!incomingCall.value) return;
    
    try {
      // Check if it's time for the appointment
      if (!isAppointmentTime(incomingCall.value.appointment)) {
        alert('This appointment is not currently available for video call. You can join during the scheduled appointment time.');
        declineIncomingCall();
        return;
      }
      
      // Set accepting call flag to true to hide the modal immediately
      isAcceptingCall.value = true;
      
      // Set connection status to connecting
      connectionStatus.value = 'connecting';
      
      // Request camera and microphone access
      try {
        localStream.value = await WebRTCService.setupLocalStream();
        
        // Set the stream to the video element
        if (localVideoRef.value) {
          localVideoRef.value.srcObject = localStream.value;
        }
      } catch (error) {
        console.error('Error accessing camera/microphone:', error);
        isAcceptingCall.value = false;
        return;
      }
  
      // Set current appointment and activate call view
      currentAppointment.value = incomingCall.value.appointment;
      activeCall.value = true;
      
      // Initialize chat for this session
      chatMessages.value = [];
      
      // Start appointment timer
      startAppointmentTimer(incomingCall.value.appointment);
      
      // Wait for DOM update before initializing video elements
      await nextTick();
      
      // Make sure video elements are properly set up after DOM update
      if (localVideoRef.value && localStream.value) {
        localVideoRef.value.srcObject = localStream.value;
      }
  
      // Start the WebRTC call
      try {
        const streams = await WebRTCService.answerCall(
          incomingCall.value.id,
          localStream.value,
          (stream) => {
            // When we receive the remote stream
            if (remoteVideoRef.value) {
              remoteVideoRef.value.srcObject = stream;
              remoteStreamActive.value = true;
            }
          }
        );
        
        // Set remote stream to video element
        if (remoteVideoRef.value && streams.remoteStream) {
          remoteVideoRef.value.srcObject = streams.remoteStream;
          remoteStream.value = streams.remoteStream;
          
          // Check if there are already tracks in the remote stream
          if (streams.remoteStream.getTracks().length > 0) {
            console.log('Remote stream already has tracks, activating');
            remoteStreamActive.value = true;
            // Update connection status to connected when remote stream is active
            connectionStatus.value = 'connected';
          }
          
          // Listen for remote tracks to update UI
          streams.remoteStream.onaddtrack = (event) => {
            console.log('New remote track added:', event.track.kind);
            remoteStreamActive.value = true;
            // Update connection status to connected when remote stream gets tracks
            connectionStatus.value = 'connected';
          };
          
          // Add a periodic check for remote stream tracks
          const checkInterval = setInterval(() => {
            if (streams.remoteStream.getTracks().length > 0) {
              console.log('Remote tracks detected in interval check');
              remoteStreamActive.value = true;
              // Update connection status to connected when remote stream gets tracks
              connectionStatus.value = 'connected';
              clearInterval(checkInterval);
            }
          }, 1000);
        }
        
        // Add a listener for call status changes in Firestore
        const callDoc = doc(db, 'calls', incomingCall.value.id);
        callDocUnsubscribe = onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (data) {
            // If the call was ended by the user, return to table view
            if (data.status === 'ended') {
              console.log('Call was ended by the user');
              // Clean up and return to table view
              endCall();
            }
          }
        });
        
        // Subscribe to chat messages for this call
        subscribeToChatMessages(incomingCall.value.id);
        
        // Listen for ICE connection state changes
        if (WebRTCService.peerConnection) {
          WebRTCService.peerConnection.oniceconnectionstatechange = () => {
            const state = WebRTCService.peerConnection.iceConnectionState;
            console.log('ICE connection state changed:', state);
            
            if (state === 'connected' || state === 'completed') {
              connectionStatus.value = 'connected';
            } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
              connectionStatus.value = 'disconnected';
            }
          };
        }
        
      } catch (error) {
        console.error('Error answering call:', error);
        connectionStatus.value = 'disconnected';
        isAcceptingCall.value = false;
      }
    } catch (error) {
      console.error('Error accepting incoming call:', error);
      connectionStatus.value = 'disconnected';
      isAcceptingCall.value = false;
    } finally {
      // We don't clear the incoming call here because we've already hidden the modal with isAcceptingCall
      // The call view is now active
    }
  };
  
  const declineIncomingCall = () => {
    // Decline the incoming call
    if (incomingCall.value) {
      WebRTCService.rejectCall(incomingCall.value.id);
      incomingCall.value = null;
    }
  };
  
  // Setup incoming calls listener
  const setupIncomingCallsListener = () => {
    // Clear any existing subscription
    if (incomingCallsUnsubscribe) {
      incomingCallsUnsubscribe();
      incomingCallsUnsubscribe = null;
    }
  
    // Make sure we have a valid user ID
    if (!authStore.user || !authStore.user.userId) {
      console.warn("Cannot setup incoming calls listener: No user ID available");
      return;
    }
  
    try {
      // Use the WebRTC service to listen for incoming calls
      incomingCallsUnsubscribe = WebRTCService.listenForIncomingCalls(
        authStore.user.userId,
        (callData) => {
          console.log("Incoming call detected:", callData);
          
          // Find the appointment details for this call
          const appointment = appointments.value.find(a => a.id === callData.id);
          
          if (appointment) {
            // Check if it's time for the appointment
            if (!isAppointmentTime(appointment)) {
              console.log("Ignoring incoming call outside of appointment time");
              return;
            }
            
            incomingCall.value = {
              id: callData.id,
              callerId: callData.callerId,
              callerName: appointment.ownerName || 'Pet Owner',
              appointment: appointment
            };
          } else {
            // If we can't find the appointment in our local data, 
            // we can still show the call with limited information
            incomingCall.value = {
              id: callData.id,
              callerId: callData.callerId,
              callerName: 'Pet Owner',
              appointment: {
                id: callData.id,
                userId: callData.callerId,
                ownerName: 'Pet Owner'
              }
            };
          }
          
          // Add a listener to check if the call gets canceled or ended by the user
          const callDoc = doc(db, 'calls', callData.id);
          const callStatusUnsubscribe = onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (data) {
              // If the call was rejected or ended by the user, hide the incoming call modal
              if (data.status === 'rejected' || data.status === 'ended') {
                console.log('Call was rejected or ended by the user');
                // Hide the incoming call modal
                if (incomingCall.value && incomingCall.value.id === callData.id) {
                  incomingCall.value = null;
                }
                // Unsubscribe from this listener
                callStatusUnsubscribe();
              }
            }
          });
        }
      );
      
      console.log("Incoming calls listener set up successfully for user ID:", authStore.user.userId);
    } catch (error) {
      console.error("Error setting up incoming calls listener:", error);
    }
  };
  
  // CSV Export Function
  const exportToCSV = () => {
    const csvRows = [];
  
    // Add headers
    const headers = ['Owner', 'Contact', 'Pet', 'Date', 'Time', 'Services', 'Status', 'Created', 'Updated'];
    csvRows.push(headers.join(','));
  
    // Add data rows
    filteredAndSortedAppointments.value.forEach(appointment => {
      const values = [
        `"${appointment.ownerName || ''}"`,
        `"${appointment.contactInformation || ''}"`,
        `"${appointment.petName || ''}"`,
        `"${formatDate(appointment.date) || ''}"`,
        `"${appointment.time || ''}"`,
        `"${appointment.serviceNames ? appointment.serviceNames.join('; ') : ''}"`,
        `"${formatStatus(appointment.status) || ''}"`,
        `"${formatDateTime(appointment.createdAt) || ''}"`,
        `"${formatDateTime(appointment.updatedAt) || ''}"`
      ];
      csvRows.push(values.join(','));
    });
  
    // Create CSV content
    const csvContent = csvRows.join('\n');
  
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'telehealth_appointments.csv');
    document.body.appendChild(link);
    link.click();
  
    // Clean up
    document.body.removeChild(link);
  };
  
  // Function to start the appointment timer
  const startAppointmentTimer = (appointment) => {
    if (!appointment.date || !appointment.time) return;
  
    try {
      // Parse the appointment time (e.g., "4:00 PM - 4:20 PM")
      if (appointment.time) {
        const timeMatch = appointment.time.match(/(\d+:\d+\s*[APM]+)\s*-\s*(\d+:\d+\s*[APM]+)/i);
        if (timeMatch && timeMatch.length >= 3) {
          // Get the end time part
          const endTimeStr = timeMatch[2].trim();
          
          // Create date objects for the appointment end time
          const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s*([APM]+)/i);
          
          if (endTimeParts) {
            // Parse end time
            let endHours = parseInt(endTimeParts[1]);
            const endMinutes = parseInt(endTimeParts[2]);
            const endPeriod = endTimeParts[3].toUpperCase();
            
            // Convert to 24-hour format
            if (endPeriod === 'PM' && endHours < 12) endHours += 12;
            if (endPeriod === 'AM' && endHours === 12) endHours = 0;
            
            // Create appointment end datetime object
            const appointmentDate = appointment.date instanceof Date 
              ? appointment.date 
              : parseISO(appointment.date);
            const endTime = new Date(appointmentDate);
            endTime.setHours(endHours, endMinutes, 0, 0);
            
            // If end time is earlier than start time, it means the appointment ends the next day
            
            // Set appointment end time
            appointmentEndTime.value = endTime;
            
            // Update remaining time every second
            appointmentTimer = setInterval(() => {
              const now = new Date();
              const diffInSeconds = differenceInSeconds(appointmentEndTime.value, now);
              
              if (diffInSeconds <= 0) {
                // Time is up, show modal and end call
                clearInterval(appointmentTimer);
                remainingTime.value = '00:00';
                showCallExpiredModal.value = true;
              } else {
                // Calculate remaining time
                const minutes = Math.floor(diffInSeconds / 60);
                const seconds = diffInSeconds % 60;
                remainingTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              }
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error starting appointment timer:', error);
    }
  };
  
  // Function to acknowledge call expired
  const acknowledgeCallExpired = () => {
    showCallExpiredModal.value = false;
    endCall();
  };
  </script>