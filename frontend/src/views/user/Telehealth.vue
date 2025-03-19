<template>
  <div class="min-h-screen bg-white rounded-2xl">
    <!-- Home View -->
    <div v-if="currentView === 'home'">
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Column -->
          <div class="space-y-8 flex flex-col justify-center h-full">
            <div class="space-y-4 mt-auto">
              <h1 class="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
                {{ slides[currentSlide].title }}
              </h1>
              <p class="text-xl text-gray-600">
                {{ slides[currentSlide].subtitle }}
              </p>
            </div>
  
            <!-- Meeting Controls -->
            <div class="space-y-4 mb-auto">
              <div class="flex flex-col sm:flex-row gap-4">
                <button 
                  @click="currentView = 'sessions'"
                  class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <VideoIcon class="w-5 h-5 mr-2" />
                  Sessions
                </button>
                <button 
                  @click="currentView = 'meetings'"
                  class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CalendarIcon class="w-5 h-5 mr-2" />
                  Add new meeting
                </button>
              </div>
              <a href="#" class="inline-flex text-blue-600 hover:underline">
                Learn more about Telehealth
              </a>
            </div>
          </div>
  
          <!-- Right Column -->
          <div class="relative">
            <!-- Navigation Arrows -->
            <button 
              @click="previousSlide" 
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-20"
            >
              <ChevronLeftIcon class="w-6 h-6 text-gray-600" />
            </button>
            <button 
              @click="nextSlide"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors z-20"
            >
              <ChevronRightIcon class="w-6 h-6 text-gray-600" />
            </button>
  
            <!-- Main Illustration -->
            <div class="relative aspect-square max-w-md mx-auto">
              <div class="absolute inset-0 bg-blue-50 rounded-full overflow-hidden">
                <TransitionGroup name="slide">
                  <div 
                    v-for="(slide, index) in slides" 
                    :key="slide.id"
                    v-show="currentSlide === index"
                    class="absolute inset-0 transition-all duration-300"
                  >
                    <div :id="`lottie-container-${index}`" class="w-full h-full"></div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
  
            <!-- Carousel Dots -->
            <div class="flex justify-center gap-2 mt-8">
              <button 
                v-for="(slide, index) in slides" 
                :key="slide.id"
                @click="goToSlide(index)"
                :class="[
                  'w-2 h-2 rounded-full transition-all',
                  currentSlide === index 
                    ? 'bg-blue-600 w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                ]"
                :aria-label="`Go to slide ${index + 1}`"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  
    <!-- Sessions View -->
    <div v-else-if="currentView === 'sessions'">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div class="space-y-6">
          <!-- Header with back arrow on left -->
          <div class="flex items-center">
            <button 
              @click="currentView = 'home'" 
              class="p-2 mr-4 rounded-full hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Meetings</h1>
          </div>
          
          <!-- Tabs -->
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button 
                @click="activeTab = 'upcoming'"
                class="py-4 px-1 border-b-2 font-medium text-sm"
                :class="activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Upcoming
              </button>
              <button 
                @click="activeTab = 'previous'"
                class="py-4 px-1 border-b-2 font-medium text-sm"
                :class="activeTab === 'previous' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Previous
              </button>
            </nav>
          </div>
          
          <!-- Meeting List -->
          <div v-if="activeTab === 'upcoming' && upcomingMeetings.length > 0" class="space-y-3">
            <div 
              v-for="meeting in upcomingMeetings" 
              :key="meeting.id"
              class="bg-blue-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div class="flex items-center space-x-4">
                <div class="bg-blue-100 p-2 rounded-lg">
                  <component :is="meeting.icon" class="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ meeting.title }}</div>
                  <div class="flex items-center text-sm text-gray-500 space-x-2">
                    <ClockIcon class="w-4 h-4" />
                    <span>{{ meeting.time }} • {{ meeting.duration }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-500 space-x-2">
                    <UserIcon class="w-4 h-4" />
                    <span>{{ meeting.doctor }}</span>
                  </div>
                </div>
              </div>
              <button 
                @click="initiateCall(meeting)"
                class="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
              >
                <VideoIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'previous' && previousMeetings.length > 0" class="space-y-3">
            <div 
              v-for="meeting in previousMeetings" 
              :key="meeting.id"
              class="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
            >
              <div class="flex items-center space-x-4">
                <div class="bg-gray-100 p-2 rounded-lg">
                  <component :is="meeting.icon" class="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ meeting.title }}</div>
                  <div class="flex items-center text-sm text-gray-500 space-x-2">
                    <ClockIcon class="w-4 h-4" />
                    <span>{{ meeting.time }} • {{ meeting.duration }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-500 space-x-2">
                    <UserIcon class="w-4 h-4" />
                    <span>{{ meeting.doctor }}</span>
                  </div>
                </div>
              </div>
              <button 
                @click="viewRecording(meeting)"
                class="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300"
              >
                <PlayIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div v-else class="text-center py-12">
            <CalendarIcon class="w-12 h-12 mx-auto text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No meetings</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ activeTab === 'upcoming' ? 'You have no upcoming meetings scheduled.' : 'You have no previous meetings.' }}
            </p>
            <div class="mt-6">
              <button
                @click="scheduleMeeting"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon class="w-5 h-5 mr-2" />
                Schedule a meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Meetings View (placeholder) -->
    <div v-else-if="currentView === 'meetings'">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div class="flex items-center mb-6">
          <button 
            @click="currentView = 'home'" 
            class="p-2 mr-4 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <h1 class="text-2xl font-bold text-gray-900">Upcoming Meetings</h1>
        </div>
        <!-- Meetings content would go here -->
        <p class="text-gray-600">Upcoming meetings view</p>
      </div>
    </div>
  
    <!-- Calling View - Modern, clean and visually appealing design -->
    <div v-else-if="currentView === 'calling'" class="h-screen w-full overflow-hidden">
      <!-- Subtle paw pattern background with gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div class="absolute inset-0 opacity-10" 
             style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMTIgMTJDOSAxMiA2IDkgNiA2QzYgMyA5IDAgMTIgMEMxNSAwIDE4IDMgMTggNkMxOCA5IDE1IDEyIDEyIDEyWk00MiAxMkMzOSAxMiAzNiA5IDM2IDZDMzYgMyAzOSAwIDQyIDBDNDUgMCA0OCAzIDQ4IDZDNDggOSA0NSAxMiA0MiAxMlpNMTIgNDJDOSA0MiA2IDM5IDYgMzZDNiAzMyA5IDMwIDEyIDMwQzE1IDMwIDE4IDMzIDE4IDM2QzE4IDM5IDE1IDQyIDEyIDQyWk00MiA0MkMzOSA0MiAzNiAzOSAzNiAzNkMzNiAzMyAzOSAzMCA0MiAzMEM0NSAzMCA0OCAzMyA0OCAzNkM0OCAzOSA0NSA0MiA0MiA0MlpNMjcgMjdDMjQgMjcgMjEgMjQgMjEgMjFDMjEgMTggMjQgMTUgMjcgMTVDMzAgMTUgMzMgMTggMzMgMjFDMzMgMjQgMzAgMjcgMjcgMjdaIiBmaWxsPSIjMzQ4MmY2IiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg=='); 
              background-repeat: repeat;"></div>
      </div>
      
      <!-- Main content container with glass effect -->
      <div class="relative h-full flex flex-col items-center justify-center p-4">
        <div class="max-w-md w-full mx-auto">
          <!-- Top status bar -->
          <div class="flex justify-between items-center mb-8">
            <button 
              @click="cancelCall" 
              class="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-300 shadow-sm"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            
            <div class="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium shadow-sm flex items-center">
              <span class="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              <span class="text-blue-700">Connecting...</span>
            </div>
          </div>
          
          <!-- Doctor profile and call info -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 mb-6 transform transition-all duration-500 ease-out">
            <!-- Doctor avatar with animated ring -->
            <div class="relative mx-auto mb-6 w-32 h-32">
              <div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-spin-slow opacity-70 blur-sm"></div>
              <div class="absolute inset-1 rounded-full bg-white"></div>
              <div class="absolute inset-2 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-1">
                <img 
                  :src="currentMeeting?.doctorAvatar || '/placeholder.svg?height=112&width=112'" 
                  alt="Doctor" 
                  class="w-full h-full object-cover rounded-full"
                />
              </div>
              <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
                <PhoneIcon class="w-5 h-5 text-white" />
              </div>
            </div>
            
            <!-- Call info -->
            <div class="text-center">
              <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ currentMeeting?.doctor || 'Doctor' }}</h2>
              <p class="text-gray-500 mb-4">{{ currentMeeting?.title || 'Video Consultation' }}</p>
              
              <!-- Animated dots -->
              <div class="flex justify-center space-x-2 mb-2">
                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
              <p class="text-sm text-gray-500 font-medium">Waiting for response</p>
            </div>
          </div>
          
          <!-- Local video preview with glass effect -->
          <div class="relative mb-8 overflow-hidden rounded-2xl shadow-lg border border-white/50 backdrop-blur-sm bg-black/10">
            <video 
              ref="localVideoPreview" 
              class="w-full h-56 object-cover" 
              autoplay 
              playsinline 
              muted
            ></video>
            
            <!-- Video overlay with gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
            
            <!-- Video label -->
            <div class="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md flex items-center">
              <VideoIcon class="w-3.5 h-3.5 mr-1.5" />
              Your camera
            </div>
          </div>
          
          <!-- Call actions -->
          <div class="flex justify-center">
            <button 
              @click="cancelCall" 
              class="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <PhoneOffIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Incoming Call View -->
    <div v-else-if="currentView === 'incomingCall'" class="h-screen bg-white">
      <div class="h-full flex flex-col items-center justify-center bg-gray-50">
        <div class="text-center">
          <div class="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6 relative">
            <img 
              :src="incomingCall?.avatar || '/placeholder.svg?height=96&width=96'" 
              alt="Caller" 
              class="w-full h-full object-cover rounded-full"
            />
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <PhoneIcon class="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">Incoming call from {{ incomingCall?.name || 'Unknown' }}</h2>
          <p class="text-gray-500 mb-8">{{ incomingCall?.title || 'Video Call' }}</p>
          
          <div class="flex justify-center space-x-8">
            <button 
              @click="rejectCall" 
              class="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none transition-colors"
            >
              <PhoneOffIcon class="w-6 h-6" />
            </button>
            <button 
              @click="answerCall" 
              class="p-4 rounded-full bg-green-600 text-white hover:bg-green-700 focus:outline-none transition-colors"
            >
              <PhoneIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Video Call View with WebRTC - Designed to match the reference image -->
    <div v-else-if="currentView === 'videoCall'" class="h-screen bg-white">
      <div class="h-full flex flex-col">
        <!-- Main Content -->
        <div class="flex-1 flex">
          <!-- Left Sidebar - Chat and Info -->
          <div class="w-64 border-r border-gray-200 flex flex-col">
            <!-- User Info -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                  <img 
                    :src="currentMeeting?.doctorAvatar || '/placeholder.svg?height=40&width=40'" 
                    alt="Doctor" 
                    class="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ currentMeeting?.doctor || 'Olivia Wild' }}</h3>
                  <div class="flex items-center text-xs text-gray-500">
                    <span>Female</span>
                    <span class="mx-1">•</span>
                    <span>{{ currentMeeting?.doctorAge || '51' }} y/o</span>
                  </div>
                </div>
              </div>
              <div class="mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center">
                <ClockIcon class="w-3 h-3 mr-1" />
                <span>Time remaining: {{ callDuration }}</span>
              </div>
            </div>
            
            <!-- Tabs -->
            <div class="flex border-b border-gray-200">
              <button 
                @click="chatTab = 'record'"
                class="flex-1 py-3 text-xs font-medium text-center"
                :class="chatTab === 'record' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
              >
                Record
              </button>
              <button 
                @click="chatTab = 'chat'"
                class="flex-1 py-3 text-xs font-medium text-center"
                :class="chatTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
              >
                Chat
              </button>
              <button 
                @click="chatTab = 'notes'"
                class="flex-1 py-3 text-xs font-medium text-center"
                :class="chatTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
              >
                Notes
              </button>
              <button 
                @click="chatTab = 'docs'"
                class="flex-1 py-3 text-xs font-medium text-center"
                :class="chatTab === 'docs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
              >
                Docs
              </button>
            </div>
            
            <!-- Chat Content -->
            <div v-if="chatTab === 'chat'" class="flex-1 overflow-y-auto p-4 bg-gray-50">
              <!-- Date Header -->
              <div class="text-center text-xs text-gray-500 uppercase mb-4">
                JUNE 1
              </div>
              
              <!-- Chat Messages -->
              <div class="space-y-4">
                <!-- Doctor Message -->
                <div class="bg-gray-200 rounded-lg p-3 max-w-[85%]">
                  <p class="text-sm text-gray-800">Good afternoon!</p>
                  <span class="text-xs text-gray-500 block mt-1">12:34</span>
                </div>
                
                <!-- Date Header -->
                <div class="text-center text-xs text-gray-500 uppercase my-4">
                  TODAY
                </div>
                
                <!-- Patient Message -->
                <div class="bg-blue-50 rounded-lg p-3 max-w-[85%] ml-auto">
                  <p class="text-sm text-gray-800">Hey, Doctor! Are you ready for our call?</p>
                  <span class="text-xs text-gray-500 block text-right mt-1">13:58</span>
                </div>
               
                <!-- Show sent messages -->
                <div v-for="(message, index) in chatMessages" :key="index" 
                  :class="[
                    'rounded-lg p-3 max-w-[85%]',
                    message.sender === 'me' ? 'bg-blue-50 ml-auto' : 'bg-gray-200'
                  ]">
                  <p class="text-sm text-gray-800">{{ message.text }}</p>
                  <span class="text-xs text-gray-500 block mt-1" :class="{ 'text-right': message.sender === 'me' }">{{ message.time }}</span>
                </div>
              </div>
            </div>
  
            <!-- Notes Content -->
            <div v-else-if="chatTab === 'notes'" class="flex-1 overflow-y-auto p-4 bg-gray-50">
              <h3 class="font-medium text-gray-900 mb-2">Session Notes</h3>
              <textarea 
                v-model="sessionNotes" 
                class="w-full h-[calc(100%-80px)] bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Add notes about this session..."
              ></textarea>
              <div class="mt-3 flex justify-end">
                <button 
                  @click="saveNotes" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <SaveIcon class="w-4 h-4 mr-1 inline-block" />
                  Save Notes
                </button>
              </div>
            </div>
  
            <!-- Record Content -->
            <div v-else-if="chatTab === 'record'" class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <VideoIcon class="w-8 h-8 text-red-500" />
                </div>
                <h3 class="font-medium text-gray-900 mb-1">Record Session</h3>
                <p class="text-sm text-gray-500 mb-4">Record this session for future reference</p>
                <button 
                  @click="toggleRecording"
                  class="px-4 py-2 rounded-lg font-medium text-sm"
                  :class="isRecording ? 'bg-red-100 text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'"
                >
                  {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
                </button>
                <p v-if="isRecording" class="text-sm text-red-500 mt-2">
                  Recording: {{ recordingTime }}
                </p>
              </div>
            </div>
  
            <!-- Docs Content -->
            <div v-else-if="chatTab === 'docs'" class="flex-1 overflow-y-auto p-4 bg-gray-50">
              <h3 class="font-medium text-gray-900 mb-3">Documents</h3>
              <div class="space-y-3">
                <div v-for="(doc, index) in documents" :key="index" class="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div class="flex items-center">
                    <FileTextIcon class="w-5 h-5 text-blue-500 mr-2" />
                    <span class="text-sm text-gray-800">{{ doc.name }}</span>
                  </div>
                  <button class="text-blue-500 hover:text-blue-600">
                    <DownloadIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="mt-4">
                <label for="document-upload" class="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center cursor-pointer">
                  <UploadIcon class="w-4 h-4 mr-2" />
                  Upload Document
                </label>
                <input 
                  id="document-upload" 
                  type="file" 
                  class="hidden" 
                  @change="uploadDocument"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            
            <!-- Message Input -->
            <div v-if="chatTab === 'chat'" class="p-3 border-t border-gray-200">
              <div class="relative">
                <input 
                  type="text" 
                  v-model="messageText"
                  placeholder="Write your message..."
                  class="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @keyup.enter="sendMessage"
                />
                <button 
                  @click="sendMessage"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                >
                  <SendIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Main Video Area -->
          <div class="flex-1 relative bg-white flex items-center justify-center overflow-hidden">
            <!-- Remote Video Container with floating effect -->
            <div class="w-[95%] h-[95%] rounded-3xl shadow-xl overflow-hidden relative">
              <!-- Remote Video -->
              <video 
                ref="remoteVideo" 
                class="w-full h-full object-cover rounded-3xl" 
                autoplay 
                playsinline
              ></video>
              
              <!-- Soft overlay for edges -->
              <div class="absolute inset-0 pointer-events-none rounded-3xl shadow-inner" 
                   style="box-shadow: inset 0 0 20px 10px rgba(255,255,255,0.2)"></div>
              
              <!-- Local Video (Small) - Now inside the remote video container -->
              <div class="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white z-10">
                <video 
                  ref="localVideo" 
                  class="w-full h-full object-cover" 
                  autoplay 
                  playsinline 
                  muted
                ></video>
              </div>
              
              <!-- Call Controls - Now inside the remote video container at the bottom -->
              <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-10">
                <button 
                  @click="toggleMute" 
                  class="p-3 rounded-full focus:outline-none transition-colors shadow-lg"
                  :class="isMuted ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                >
                  <component :is="isMuted ? MicOffIcon : MicIcon" class="w-5 h-5" />
                </button>
                <button 
                  @click="toggleVideo" 
                  class="p-3 rounded-full focus:outline-none transition-colors shadow-lg"
                  :class="isVideoOff ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                >
                  <component :is="isVideoOff ? VideoOffIcon : VideoIcon" class="w-5 h-5" />
                </button>
                <button 
                  @click="toggleScreenShare" 
                  class="p-3 rounded-full focus:outline-none transition-colors shadow-lg"
                  :class="isScreenSharing ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                >
                  <ShareIcon class="w-5 h-5" />
                </button>
                <button 
                  @click="toggleRecording" 
                  class="p-3 rounded-full focus:outline-none transition-colors shadow-lg"
                  :class="isRecording ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                >
                  <CircleRecordIcon class="w-5 h-5" />
                </button>
                <button 
                  @click="endCall" 
                  class="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none transition-colors shadow-lg"
                >
                  <PhoneOffIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- Loading state when remote video is not connected -->
            <div 
              v-if="!isRemoteConnected" 
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div class="w-16 h-16 mb-4 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <p class="text-lg">Connecting to {{ currentMeeting ? currentMeeting.doctor : 'remote user' }}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch, computed, h } from 'vue'
  import { 
  VideoIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  UserIcon, 
  ClockIcon, 
  PlayIcon, 
  PlusIcon,
  ActivityIcon,
  Syringe,
  HeartPulse,
  Stethoscope,
  ArrowLeftIcon,
  MicIcon,
  MicOffIcon,
  VideoOffIcon,
  PhoneOffIcon,
  PhoneIcon,
  MonitorIcon,
  SendIcon,
  ArrowUp,
  MessageSquareIcon,
  LayoutIcon,
  FileTextIcon,
  DumbbellIcon,
  SlidersIcon,
  MoreVerticalIcon,
  XIcon,
  DownloadIcon,
  SaveIcon,
  UploadIcon
  } from 'lucide-vue-next'
  import lottie from 'lottie-web'
  
  // Custom icons
  const CircleRecordIcon = {
  name: 'CircleRecordIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      stroke: 'none'
    }, [
      h('circle', {
        cx: '12',
        cy: '12',
        r: '8',
        fill: 'currentColor'
      })
    ])
  }
  }
  
  const ShareIcon = {
  name: 'ShareIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }, [
      h('path', {
        d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'
      }),
      h('polyline', {
        points: '16 6 12 2 8 6'
      }),
      h('line', {
        x1: '12',
        y1: '2',
        x2: '12',
        y2: '15'
      })
    ])
  }
  }
  
  // View state
  const currentView = ref('home')
  const activeTab = ref('upcoming')
  const chatTab = ref('chat')
  const messageText = ref('')
  const chatMessages = ref([])
  
  // Video call state
  const localVideo = ref(null)
  const localVideoPreview = ref(null)
  const remoteVideo = ref(null)
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  const isScreenSharing = ref(false)
  const isRemoteConnected = ref(false)
  const sessionNotes = ref('')
  const currentMeeting = ref(null)
  const callStartTime = ref(null)
  const currentTime = ref(0)
  const callState = ref('idle') // idle, calling, connected, ended
  
  // Incoming call state
  const incomingCall = ref(null)
  
  // Feature states
  const isRecording = ref(false)
  const recordingTime = ref('00:00')
  let recordingInterval = null
  const subtitlesEnabled = ref(false)
  const currentSubtitle = ref('This is what the speaker is saying right now...')
  const whiteboardActive = ref(false)
  const meetingPlanVisible = ref(false)
  
  // Documents state
  const documents = ref([
  { name: 'Medical History.pdf', url: '#' },
  { name: 'Lab Results.pdf', url: '#' },
  { name: 'Prescription.pdf', url: '#' }
  ])
  
  // WebRTC variables
  let localStream = null
  let screenStream = null
  let peerConnection = null
  let timerInterval = null
  let callTimeout = null
  let doctorStream = null // Separate stream for the doctor
  
  // Slides for home view
  const slides = [
  {
    id: 1,
    title: "Video calls and meetings for everyone",
    subtitle: "Connect, collaborate, and celebrate from anywhere",
    lottieUrl: "https://lottie.host/eef5246b-5eb6-4e59-aa95-4f876e907fbe/w8vlGAQY2p.json"
  },
  {
    id: 2,
    title: "Connect with healthcare professionals",
    subtitle: "Get expert medical advice from the comfort of your home",
    lottieUrl: "https://lottie.host/8e319c9a-aa16-4c67-9762-5e8a6f1fb661/c6cXxUKVrd.json"
  },
  {
    id: 3,
    title: "Therapy sessions",
    subtitle: "Join supportive communities and share experiences",
    lottieUrl: "https://lottie.host/1e246ac2-6990-4be8-aae7-ce4c1ca7a244/OQ88rj0UOx.json"
  },
  {
    id: 4,
    title: "Follow up consultation",
    subtitle: "Access counseling whenever you need it",
    lottieUrl: "https://lottie.host/61024576-6d81-4689-a26b-377afb392172/gNHIvH2Tin.json"
  }
  ]
  
  // Sample data for upcoming meetings
  const upcomingMeetings = [
  {
    id: 1,
    title: 'Vaccination',
    time: '9:30 AM',
    duration: '45 min',
    doctor: 'Dr. Martinez',
    doctorAvatar: '/placeholder.svg?height=40&width=40',
    doctorAge: '45',
    icon: Syringe
  },
  {
    id: 2,
    title: 'Health Check-up',
    time: '2:00 PM',
    duration: '60 min',
    doctor: 'Dr. Johnson',
    doctorAvatar: '/placeholder.svg?height=40&width=40',
    doctorAge: '52',
    icon: Stethoscope
  },
  {
    id: 3,
    title: 'Cardiology Consultation',
    time: '11:15 AM',
    duration: '30 min',
    doctor: 'Dr. Williams',
    doctorAvatar: '/placeholder.svg?height=40&width=40',
    doctorAge: '48',
    icon: HeartPulse
  }
  ];
  
  // Sample data for previous meetings
  const previousMeetings = [
  {
    id: 101,
    title: 'Annual Physical',
    time: 'Mar 15, 2025',
    duration: '60 min',
    doctor: 'Dr. Johnson',
    doctorAvatar: '/placeholder.svg?height=40&width=40',
    doctorAge: '52',
    icon: ActivityIcon
  },
  {
    id: 102,
    title: 'Follow-up Consultation',
    time: 'Mar 10, 2025',
    duration: '30 min',
    doctor: 'Dr. Martinez',
    doctorAvatar: '/placeholder.svg?height=40&width=40',
    doctorAge: '45',
    icon: Stethoscope
  }
  ];
  
  // Chat methods
  const sendMessage = () => {
  if (messageText.value.trim()) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    chatMessages.value.push({
      text: messageText.value,
      time: `${hours}:${minutes}`,
      sender: 'me'
    });
    
    messageText.value = '';
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const responseTime = new Date();
      const respHours = responseTime.getHours().toString().padStart(2, '0');
      const respMinutes = responseTime.getMinutes().toString().padStart(2, '0');
      
      chatMessages.value.push({
        text: "I've noted that down. Is there anything else you'd like to discuss?",
        time: `${respHours}:${respMinutes}`,
        sender: 'doctor'
      });
    }, 2000);
  }
  }
  
  // Save notes
  const saveNotes = () => {
  // In a real app, this would save the notes to a database
  alert("Notes saved successfully!");
  }
  
  // Upload document
  const uploadDocument = (event) => {
  const file = event.target.files[0];
  if (file) {
    // In a real app, this would upload the file to a server
    documents.value.push({
      name: file.name,
      url: '#'
    });
    
    // Reset the file input
    event.target.value = '';
    
    alert(`Document "${file.name}" uploaded successfully!`);
  }
  }
  
  // Computed call duration
  const callDuration = computed(() => {
  if (!callStartTime.value) return '11:29';
  
  const seconds = Math.floor(currentTime.value / 1000) % 60;
  const minutes = Math.floor(currentTime.value / (1000 * 60)) % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  
  // Home view state
  const currentSlide = ref(0)
  let lottieInstances = []
  
  // Home view methods
  const previousSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
  }
  
  const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
  }
  
  const goToSlide = (index) => {
  currentSlide.value = index
  }
  
  // Call methods
  const initiateCall = async (meeting) => {
  console.log('Initiating call to:', meeting);
  currentMeeting.value = meeting;
  callState.value = 'calling';
  currentView.value = 'calling';
  
  try {
    // Initialize local video stream for preview
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    localStream = stream;
    
    // Display local video preview
    if (localVideoPreview.value) {
      localVideoPreview.value.srcObject = stream;
    }
    
    // In a real app, you would send a call request to the doctor via a signaling server
    // For demo purposes, we'll simulate the doctor answering after a delay
    callTimeout = setTimeout(() => {
      // Simulate the doctor answering
      simulateCallAnswer();
    }, 5000);
    
  } catch (error) {
    console.error('Error accessing camera and microphone:', error);
    alert('Failed to access camera and microphone. Please check your permissions.');
    cancelCall();
  }
  }
  
  const simulateCallAnswer = () => {
  // In a real app, this would be triggered by signaling from the remote peer
  callState.value = 'connected';
  currentView.value = 'videoCall';
  
  // Initialize WebRTC after view change
  setTimeout(() => {
    initializeWebRTC();
  }, 0);
  }
  
  const cancelCall = () => {
  console.log('Call cancelled');
  
  // Clear timeout if it exists
  if (callTimeout) {
    clearTimeout(callTimeout);
    callTimeout = null;
  }
  
  // Stop local stream if it exists
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  // Reset state
  callState.value = 'idle';
  currentView.value = 'sessions';
  }
  
  // Simulate an incoming call
  const simulateIncomingCall = () => {
  incomingCall.value = {
    id: Date.now(),
    name: 'Dr. Smith',
    title: 'Emergency Consultation',
    avatar: '/placeholder.svg?height=96&width=96'
  };
  
  currentView.value = 'incomingCall';
  }
  
  const answerCall = async () => {
  try {
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    // Set current meeting from incoming call
    currentMeeting.value = {
      doctor: incomingCall.value.name,
      doctorAvatar: incomingCall.value.avatar,
      title: incomingCall.value.title
    };
    
    // Reset incoming call
    incomingCall.value = null;
    
    // Change view to video call
    currentView.value = 'videoCall';
    callState.value = 'connected';
    
    // Initialize WebRTC
    setTimeout(() => {
      initializeWebRTC();
    }, 0);
    
  } catch (error) {
    console.error('Error answering call:', error);
    alert('Failed to access camera and microphone. Please check your permissions.');
    rejectCall();
  }
  }
  
  const rejectCall = () => {
  incomingCall.value = null;
  currentView.value = 'sessions';
  }
  
  // Sessions view methods
  const joinMeeting = (meeting) => {
  initiateCall(meeting);
  }
  
  const viewRecording = (meeting) => {
  console.log('Viewing recording:', meeting)
  }
  
  const scheduleMeeting = () => {
  console.log('Scheduling a new meeting')
  }
  
  // Feature toggle methods
  const toggleRecording = () => {
  isRecording.value = !isRecording.value;
  
  if (isRecording.value) {
    let seconds = 0;
    recordingInterval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      recordingTime.value = `${mins}:${secs}`;
    }, 1000);
    
    // Switch to record tab
    chatTab.value = 'record';
  } else {
    clearInterval(recordingInterval);
    recordingTime.value = '00:00';
  }
  }
  
  const toggleSubtitles = () => {
  subtitlesEnabled.value = !subtitlesEnabled.value;
  
  if (subtitlesEnabled.value) {
    // In a real app, this would use speech recognition
    // For demo purposes, we'll just cycle through some sample subtitles
    const subtitles = [
      "Hello, how are you feeling today?",
      "Have you been taking your medication regularly?",
      "Let's discuss your progress since our last appointment.",
      "I think we should adjust your treatment plan."
    ];
    
    let subtitleIndex = 0;
    setInterval(() => {
      currentSubtitle.value = subtitles[subtitleIndex % subtitles.length];
      subtitleIndex++;
    }, 5000);
  }
  }
  
  const toggleWhiteboard = () => {
  whiteboardActive.value = !whiteboardActive.value;
  }
  
  const showMeetingPlan = () => {
  meetingPlanVisible.value = true;
  }
  
  const showExercises = () => {
  alert("Exercise functionality would be implemented here");
  }
  
  const showSlides = () => {
  alert("Slides functionality would be implemented here");
  }
  
  const showMoreOptions = () => {
  alert("More options would be shown here");
  }
  
  // WebRTC methods
  const initializeWebRTC = async () => {
  try {
    // If we already have a local stream from the calling screen, use it
    if (!localStream) {
      // Request permissions explicitly first
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          console.log("Permission granted for audio and video");
        })
        .catch(error => {
          console.error("Error getting permission:", error);
          alert("Please allow camera and microphone access to use the video call feature.");
          return;
        });
      
      // Get user media with constraints
      const constraints = {
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      };
      
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Display local video
    if (localVideo.value) {
      localVideo.value.srcObject = localStream;
    }
    
    // Create peer connection
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local tracks to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        // In a real app, you would send this to the remote peer via your signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        isRemoteConnected.value = true;
      }
    };
    
    // Handle incoming tracks
    peerConnection.ontrack = event => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = event.streams[0];
        isRemoteConnected.value = true;
      }
    };
    
    // Create a separate doctor stream for the remote video
    await createDoctorStream();
    
    // Start call timer
    startCallTimer();
    
  } catch (error) {
    console.error('Error initializing WebRTC:', error);
    alert("There was an error initializing the video call. Please try again.");
  }
  }
  
  // Create a separate doctor stream to simulate the doctor's video
  const createDoctorStream = async () => {
  try {
    // In a real app, this would be the doctor's stream received via WebRTC
    // For demo purposes, we'll create a fake doctor stream
    
    // We'll use a different video source to simulate the doctor
    // In a real app, this would come from the remote peer
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: { exact: "environment" } // Try to use back camera if available
      },
      audio: true
    };
    
    try {
      // Try to get a different camera if available
      doctorStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      // If environment camera is not available, create a modified stream
      // This is just for demo purposes to make it look different
      doctorStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Apply a filter to make it look different (in a real app, this would be unnecessary)
      const videoTrack = doctorStream.getVideoTracks()[0];
      
      // Set the remote video to show the doctor stream
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = doctorStream;
        
        // After a short delay, simulate connection established
        setTimeout(() => {
          isRemoteConnected.value = true;
        }, 2000);
      }
    }
  } catch (error) {
    console.error('Error creating doctor stream:', error);
    
    // Fallback: Create a simulated doctor stream using canvas
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      // Draw a placeholder for the doctor
      const drawDoctorPlaceholder = () => {
        ctx.fillStyle = '#f0f9ff'; // Light blue background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a simple avatar
        ctx.fillStyle = '#3b82f6'; // Blue
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2 - 50, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw a simple body
        ctx.fillStyle = '#3b82f6'; // Blue
        ctx.beginPath();
        ctx.ellipse(canvas.width/2, canvas.height/2 + 120, 100, 150, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text
        ctx.fillStyle = '#1e3a8a'; // Dark blue
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Dr. ${currentMeeting.value?.doctor || 'Doctor'}`, canvas.width/2, canvas.height - 50);
        
        // Add a stethoscope icon
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(canvas.width/2 + 50, canvas.height/2 + 20, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width/2 + 50, canvas.height/2 + 40);
        ctx.lineTo(canvas.width/2 + 50, canvas.height/2 + 100);
        ctx.stroke();
      };
      
      // Initial draw
      drawDoctorPlaceholder();
      
      // Create a stream from the canvas
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // Add audio track if available
      if (localStream && localStream.getAudioTracks().length > 0) {
        const audioTrack = localStream.getAudioTracks()[0].clone();
        canvasStream.addTrack(audioTrack);
      }
      
      // Set as doctor stream
      doctorStream = canvasStream;
      
      // Set the remote video to show the doctor stream
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = doctorStream;
        
        // Animate the canvas to make it look more realistic
        setInterval(() => {
          // Add some subtle animation
          const time = Date.now() / 1000;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawDoctorPlaceholder();
          
          // Add a subtle breathing effect
          ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // Light blue
          ctx.beginPath();
          ctx.arc(canvas.width/2, canvas.height/2 - 50, 85 + Math.sin(time) * 5, 0, Math.PI * 2);
          ctx.fill();
        }, 1000/30);
        
        // After a short delay, simulate connection established
        setTimeout(() => {
          isRemoteConnected.value = true;
        }, 2000);
      }
    } catch (canvasError) {
      console.error('Error creating canvas stream:', canvasError);
    }
  }
  }
  
  const startCallTimer = () => {
  callStartTime.value = Date.now();
  timerInterval = setInterval(() => {
    currentTime.value = Date.now() - callStartTime.value;
  }, 1000);
  }
  
  const toggleMute = () => {
  if (localStream) {
    isMuted.value = !isMuted.value;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted.value;
    });
  }
  }
  
  const toggleVideo = () => {
  if (localStream) {
    isVideoOff.value = !isVideoOff.value;
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !isVideoOff.value;
    });
  }
  }
  
  const toggleScreenShare = async () => {
  try {
    if (isScreenSharing.value) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      
      // Replace with camera again
      if (localStream && peerConnection) {
        const videoTrack = localStream.getVideoTracks()[0];
        const senders = peerConnection.getSenders();
        const sender = senders.find(s => s.track && s.track.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
        
        if (localVideo.value) {
          localVideo.value.srcObject = localStream;
        }
      }
      
      isScreenSharing.value = false;
      
    } else {
      // Start screen sharing
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });
        
        if (screenStream && peerConnection) {
          const videoTrack = screenStream.getVideoTracks()[0];
          
          // Replace camera with screen
          const senders = peerConnection.getSenders();
          const sender = senders.find(s => s.track && s.track.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
          
          // Show screen in local video
          if (localVideo.value) {
            localVideo.value.srcObject = new MediaStream([videoTrack]);
          }
          
          isScreenSharing.value = true;
          
          // Handle when user stops sharing screen
          videoTrack.onended = () => {
            toggleScreenShare();
          };
        }
      } catch (error) {
        console.error('Error starting screen share:', error);
        alert("Unable to share screen. Please try again.");
      }
    }
  } catch (error) {
    console.error('Error toggling screen share:', error);
  }
  }
  
  const endCall = () => {
  // Stop timer
  clearInterval(timerInterval);
  
  // Reset call state
  isRemoteConnected.value = false;
  callStartTime.value = null;
  currentTime.value = 0;
  callState.value = 'idle';
  
  // Stop all tracks
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
    screenStream = null;
  }
  
  if (doctorStream) {
    doctorStream.getTracks().forEach(track => track.stop());
    doctorStream = null;
  }
  
  // Close peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  // Reset video elements
  if (localVideo.value) {
    localVideo.value.srcObject = null;
  }
  
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null;
  }
  
  // Reset UI state
  isMuted.value = false;
  isVideoOff.value = false;
  isScreenSharing.value = false;
  isRecording.value = false;
  subtitlesEnabled.value = false;
  whiteboardActive.value = false;
  meetingPlanVisible.value = false;
  
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingTime.value = '00:00';
  }
  
  // Navigate back to sessions view
  currentView.value = 'sessions';
  }
  
  const initializeLottieAnimations = () => {
  slides.forEach((slide, index) => {
    const container = document.querySelector(`#lottie-container-${index}`);
    if (container) {
      const animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: slide.lottieUrl
      });
      lottieInstances.push(animation);
    }
  });
  }
  
  // Auto-advance slides
  let autoplayInterval;
  const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide();
  }, 5000);
  }
  
  const stopAutoplay = () => {
  clearInterval(autoplayInterval);
  }
  
  onMounted(() => {
  initializeLottieAnimations();
  startAutoplay();
  if (lottieInstances[currentSlide.value]) {
    lottieInstances[currentSlide.value].play();
  }
  
  // For demo purposes, you can uncomment this to simulate an incoming call after 10 seconds
  // setTimeout(() => {
  //   simulateIncomingCall();
  // }, 10000);
  })
  
  onUnmounted(() => {
  stopAutoplay();
  
  lottieInstances.forEach(instance => instance.destroy());
  
  // Clean up WebRTC resources
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  if (recordingInterval) {
    clearInterval(recordingInterval);
  }
  
  if (callTimeout) {
    clearTimeout(callTimeout);
  }
  
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
  }
  
  if (doctorStream) {
    doctorStream.getTracks().forEach(track => track.stop());
  }
  
  if (peerConnection) {
    peerConnection.close();
  }
  })
  
  watch(currentSlide, (newValue, oldValue) => {
  if (lottieInstances[oldValue]) {
    lottieInstances[oldValue].stop();
  }
  if (lottieInstances[newValue]) {
    lottieInstances[newValue].play();
  }
  })
  
  // Watch for view changes to reinitialize animations when returning to home
  watch(currentView, (newValue) => {
  if (newValue === 'home') {
    // Need to wait for DOM to update
    setTimeout(() => {
      initializeLottieAnimations();
      if (lottieInstances[currentSlide.value]) {
        lottieInstances[currentSlide.value].play();
      }
    }, 0);
  }
  })
  </script>
  
  <style scoped>
  .slide-enter-active,
  .slide-leave-active {
  transition: all 0.3s ease;
  }
  
  .slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
  }
  
  .slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
  }
  
  .slide-enter-to,
  .slide-leave-from {
  opacity: 1;
  transform: translateX(0);
  }
  
  @keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  }
  
  .animate-pulse {
  animation: pulse 1.5s infinite;
  }
  
  @keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  }
  
  .animate-bounce {
  animation: bounce 1s infinite;
  }
  
  @keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
  }
  
  .animate-spin-slow {
  animation: spin-slow 10s linear infinite;
  }
  </style>