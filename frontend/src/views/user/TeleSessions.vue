<template>
  <div class="min-h-screen bg-white">
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
                  See upcoming meetings
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
                @click="joinMeeting(meeting)"
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

    <!-- Video Call View with WebRTC - Redesigned to match the reference image -->
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
                  <h3 class="font-medium text-gray-900">{{ currentMeeting?.doctor || 'Dr. Smith' }}</h3>
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
            <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
              <!-- Date Header -->
              <div class="text-center text-xs text-gray-500 uppercase mb-4">
                JUNE 1
              </div>
              
              <!-- Chat Messages -->
              <div class="space-y-4">
                <!-- Doctor Message -->
                <div class="bg-blue-50 rounded-lg p-3 max-w-[85%] ml-auto">
                  <p class="text-sm text-gray-800">Good afternoon, Olivia! How are you feeling today?</p>
                  <span class="text-xs text-gray-500 block text-right mt-1">12:30</span>
                </div>
                
                <!-- Patient Message -->
                <div class="bg-gray-200 rounded-lg p-3 max-w-[85%]">
                  <p class="text-sm text-gray-800">Good afternoon, Dr. Lopez! I'm good, looking forward to the appointment.</p>
                  <span class="text-xs text-gray-500 block mt-1">12:34</span>
                </div>
                
                <!-- Date Header -->
                <div class="text-center text-xs text-gray-500 uppercase my-4">
                  TODAY
                </div>
                
                <!-- Doctor Message -->
                <div class="bg-blue-50 rounded-lg p-3 max-w-[85%] ml-auto">
                  <p class="text-sm text-gray-800">Hey, Olivia! Are you ready for a call?</p>
                  <span class="text-xs text-gray-500 block text-right mt-1">13:58</span>
                </div>
                
                <!-- Patient Message -->
                <div class="bg-gray-200 rounded-lg p-3 max-w-[85%]">
                  <p class="text-sm text-gray-800">Hello, Dr. Lopez</p>
                  <span class="text-xs text-gray-500 block mt-1">14:00</span>
                </div>
                
                <!-- Patient Message -->
                <div class="bg-gray-200 rounded-lg p-3 max-w-[85%]">
                  <p class="text-sm text-gray-800">I'm 5 minutes late, sorry!</p>
                  <span class="text-xs text-gray-500 block mt-1">14:00</span>
                </div>
                
                <!-- Doctor Message -->
                <div class="bg-blue-50 rounded-lg p-3 max-w-[85%] ml-auto">
                  <p class="text-sm text-gray-800">No worries, take your time 👍</p>
                  <span class="text-xs text-gray-500 block text-right mt-1">14:01</span>
                </div>
              </div>
            </div>
            
            <!-- Message Input -->
            <div class="p-3 border-t border-gray-200">
              <div class="relative">
                <input 
                  type="text" 
                  v-model="messageText"
                  placeholder="Write your message..."
                  class="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <div class="flex-1 relative bg-white">
            <!-- Remote Video -->
            <video 
              ref="remoteVideo" 
              class="w-full h-full object-cover" 
              autoplay 
              playsinline
            ></video>
            
            <!-- Loading state when remote video is not connected -->
            <div 
              v-if="!isRemoteConnected" 
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div class="w-16 h-16 mb-4 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <p class="text-lg">Connecting to {{ currentMeeting ? currentMeeting.doctor : 'remote user' }}...</p>
            </div>
            
            <!-- Local Video (Small) -->
            <div class="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white">
              <video 
                ref="localVideo" 
                class="w-full h-full object-cover" 
                autoplay 
                playsinline 
                muted
              ></video>
            </div>
            
            <!-- Call Controls -->
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4">
              <button 
                @click="toggleMute" 
                class="p-3 rounded-full focus:outline-none transition-colors"
                :class="isMuted ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                <component :is="isMuted ? MicOffIcon : MicIcon" class="w-5 h-5" />
              </button>
              <button 
                @click="toggleVideo" 
                class="p-3 rounded-full focus:outline-none transition-colors"
                :class="isVideoOff ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                <component :is="isVideoOff ? VideoOffIcon : VideoIcon" class="w-5 h-5" />
              </button>
              <button 
                @click="endCall" 
                class="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none transition-colors"
              >
                <PhoneOffIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Bottom Toolbar -->
        <div class="bg-white border-t border-gray-200 py-3 px-6 flex justify-between">
          <div class="flex space-x-8">
            <button class="flex flex-col items-center text-blue-600">
              <VideoIcon class="w-5 h-5" />
              <span class="text-xs mt-1">Record</span>
            </button>
            <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <Share2Icon class="w-5 h-5" />
              <span class="text-xs mt-1">Share screen</span>
            </button>
            <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <MessageSquareIcon class="w-5 h-5" />
              <span class="text-xs mt-1">Subtitles</span>
            </button>
            <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <LayoutIcon class="w-5 h-5" />
              <span class="text-xs mt-1">White board</span>
            </button>
            <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <FileTextIcon class="w-5 h-5" />
              <span class="text-xs mt-1">Meeting plan</span>
            </button>
            <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <DumbbellIcon class="w-5 h-5" />
              <span class="text-xs mt-1">Exercise</span>
            </button>
            <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
              <SlidersIcon class="w-5 h-5" />
              <span class="text-xs mt-1">Slides</span>
            </button>
          </div>
          <button class="flex flex-col items-center text-gray-500 hover:text-gray-700">
            <MoreVerticalIcon class="w-5 h-5" />
            <span class="text-xs mt-1">More</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
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
  MonitorIcon,
  SendIcon,
  Share2Icon,
  MessageSquareIcon,
  LayoutIcon,
  FileTextIcon,
  DumbbellIcon,
  SlidersIcon,
  MoreVerticalIcon
} from 'lucide-vue-next'
import lottie from 'lottie-web'

// View state
const currentView = ref('home')
const activeTab = ref('upcoming')
const chatTab = ref('chat')
const messageText = ref('')

// Video call state
const localVideo = ref(null)
const remoteVideo = ref(null)
const isMuted = ref(false)
const isVideoOff = ref(false)
const isScreenSharing = ref(false)
const isRemoteConnected = ref(false)
const sessionNotes = ref('')
const currentMeeting = ref(null)
const callStartTime = ref(null)
const currentTime = ref(0)

// WebRTC variables
let localStream = null
let screenStream = null
let peerConnection = null
let timerInterval = null

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
    console.log('Sending message:', messageText.value)
    // In a real app, you would add this message to a messages array
    // and potentially send it to the remote peer
    messageText.value = ''
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

// Sessions view methods
const joinMeeting = (meeting) => {
  console.log('Joining meeting:', meeting)
  currentMeeting.value = meeting
  currentView.value = 'videoCall'
  
  // Initialize WebRTC after view change
  setTimeout(() => {
    initializeWebRTC()
  }, 0)
}

const viewRecording = (meeting) => {
  console.log('Viewing recording:', meeting)
}

const scheduleMeeting = () => {
  console.log('Scheduling a new meeting')
}

// WebRTC methods
const initializeWebRTC = async () => {
  try {
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    
    // Display local video
    if (localVideo.value) {
      localVideo.value.srcObject = localStream
    }
    
    // Create peer connection
    peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })
    
    // Add local tracks to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })
    
    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        // In a real app, you would send this to the remote peer via your signaling server
        console.log('ICE candidate:', event.candidate)
      }
    }
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState)
      if (peerConnection.connectionState === 'connected') {
        isRemoteConnected.value = true
      }
    }
    
    // Handle incoming tracks
    peerConnection.ontrack = event => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = event.streams[0]
        isRemoteConnected.value = true
      }
    }
    
    // For demo purposes, we'll create an offer and answer locally
    // In a real app, this would be done via a signaling server
    await createLocalConnection()
    
    // Start call timer
    startCallTimer()
    
  } catch (error) {
    console.error('Error initializing WebRTC:', error)
  }
}

// For demo purposes - in a real app, signaling would be done via a server
const createLocalConnection = async () => {
  try {
    // Create offer
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    
    console.log('Created offer:', offer)
    
    // Simulate a delay for the remote peer to receive and process the offer
    setTimeout(async () => {
      // In a real app, the remote peer would receive this via a signaling server
      // and then create and send back an answer
      
      // Create a second peer connection to simulate the remote peer
      const remotePeerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })
      
      // Set up the remote peer connection
      remotePeerConnection.onicecandidate = event => {
        if (event.candidate) {
          // In a real app, this would be sent to the local peer via a signaling server
          console.log('Remote ICE candidate:', event.candidate)
          // Simulate adding the ICE candidate to the local peer
          peerConnection.addIceCandidate(event.candidate)
        }
      }
      
      // Create a fake remote stream
      const fakeRemoteStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Add the fake remote stream to the remote peer connection
      fakeRemoteStream.getTracks().forEach(track => {
        remotePeerConnection.addTrack(track, fakeRemoteStream)
      })
      
      // Set the remote description on the remote peer connection
      await remotePeerConnection.setRemoteDescription(offer)
      
      // Create an answer
      const answer = await remotePeerConnection.createAnswer()
      await remotePeerConnection.setLocalDescription(answer)
      
      console.log('Created answer:', answer)
      
      // Set the remote description on the local peer connection
      await peerConnection.setRemoteDescription(answer)
      
      // Simulate ICE candidates being exchanged
      // In a real app, this would happen via a signaling server
      
      // After a short delay, simulate connection established
      setTimeout(() => {
        isRemoteConnected.value = true
      }, 2000)
      
    }, 1000)
    
  } catch (error) {
    console.error('Error creating local connection:', error)
  }
}

const startCallTimer = () => {
  callStartTime.value = Date.now()
  timerInterval = setInterval(() => {
    currentTime.value = Date.now() - callStartTime.value
  }, 1000)
}

const toggleMute = () => {
  if (localStream) {
    isMuted.value = !isMuted.value
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted.value
    })
  }
}

const toggleVideo = () => {
  if (localStream) {
    isVideoOff.value = !isVideoOff.value
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !isVideoOff.value
    })
  }
}

const toggleScreenShare = async () => {
  try {
    if (isScreenSharing.value) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }
      
      // Replace with camera again
      if (localStream && peerConnection) {
        const videoTrack = localStream.getVideoTracks()[0]
        const senders = peerConnection.getSenders()
        const sender = senders.find(s => s.track && s.track.kind === 'video')
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack)
        }
        
        if (localVideo.value) {
          localVideo.value.srcObject = localStream
        }
      }
      
      isScreenSharing.value = false
      
    } else {
      // Start screen sharing
      screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true 
      })
      
      if (screenStream && peerConnection) {
        const videoTrack = screenStream.getVideoTracks()[0]
        
        // Replace camera with screen
        const senders = peerConnection.getSenders()
        const sender = senders.find(s => s.track && s.track.kind === 'video')
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack)
        }
        
        // Show screen in local video
        if (localVideo.value) {
          localVideo.value.srcObject = new MediaStream([videoTrack])
        }
        
        isScreenSharing.value = true
        
        // Handle when user stops sharing screen
        videoTrack.onended = () => {
          toggleScreenShare()
        }
      }
    }
  } catch (error) {
    console.error('Error toggling screen share:', error)
  }
}

const endCall = () => {
  // Stop timer
  clearInterval(timerInterval)
  
  // Reset call state
  isRemoteConnected.value = false
  callStartTime.value = null
  currentTime.value = 0
  sessionNotes.value = ''
  
  // Stop all tracks
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop())
    localStream = null
  }
  
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop())
    screenStream = null
  }
  
  // Close peer connection
  if (peerConnection) {
    peerConnection.close()
    peerConnection = null
  }
  
  // Reset video elements
  if (localVideo.value) {
    localVideo.value.srcObject = null
  }
  
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null
  }
  
  // Reset UI state
  isMuted.value = false
  isVideoOff.value = false
  isScreenSharing.value = false
  
  // Navigate back to sessions view
  currentView.value = 'sessions'
}

const initializeLottieAnimations = () => {
  slides.forEach((slide, index) => {
    const container = document.querySelector(`#lottie-container-${index}`)
    if (container) {
      const animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: slide.lottieUrl
      })
      lottieInstances.push(animation)
    }
  })
}

// Auto-advance slides
let autoplayInterval
const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoplay = () => {
  clearInterval(autoplayInterval)
}

onMounted(() => {
  initializeLottieAnimations()
  startAutoplay()
  if (lottieInstances[currentSlide.value]) {
    lottieInstances[currentSlide.value].play()
  }
})

onUnmounted(() => {
  stopAutoplay()
  lottieInstances.forEach(instance => instance.destroy())
  
  // Clean up WebRTC resources
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop())
  }
  
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop())
  }
  
  if (peerConnection) {
    peerConnection.close()
  }
})

watch(currentSlide, (newValue, oldValue) => {
  if (lottieInstances[oldValue]) {
    lottieInstances[oldValue].stop()
  }
  if (lottieInstances[newValue]) {
    lottieInstances[newValue].play()
  }
})

// Watch for view changes to reinitialize animations when returning to home
watch(currentView, (newValue) => {
  if (newValue === 'home') {
    // Need to wait for DOM to update
    setTimeout(() => {
      initializeLottieAnimations()
      if (lottieInstances[currentSlide.value]) {
        lottieInstances[currentSlide.value].play()
      }
    }, 0)
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
</style>