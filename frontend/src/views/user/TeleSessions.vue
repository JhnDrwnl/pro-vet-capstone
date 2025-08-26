<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Home View -->
    <div v-if="currentView === 'home'">
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left Column -->
          <div class="space-y-8 flex flex-col justify-center h-full">
            <div class="space-y-4 mt-auto">
              <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight">
                {{ slides[currentSlide].title }}
              </h1>
              <p class="text-xl text-gray-300">
                {{ slides[currentSlide].subtitle }}
              </p>
            </div>

            <!-- Meeting Controls -->
            <div class="space-y-4 mb-auto">
              <div class="flex flex-col sm:flex-row gap-4">
                <button 
                  @click="currentView = 'sessions'"
                  class="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white text-base font-medium rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <VideoIcon class="w-5 h-5 mr-2" />
                  Sessions
                </button>
                <button 
                  @click="currentView = 'meetings'"
                  class="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-gray-300 text-base font-medium rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                >
                  <CalendarIcon class="w-5 h-5 mr-2" />
                  See upcoming meetings
                </button>
              </div>
              <a href="#" class="inline-flex text-orange-400 hover:text-orange-300 transition-colors">
                Learn more about Telehealth
              </a>
            </div>
          </div>

          <!-- Right Column -->
          <div class="relative">
            <!-- Navigation Arrows -->
            <button 
              @click="previousSlide" 
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-gray-800 shadow-lg hover:bg-gray-700 transition-colors z-20 border border-gray-600"
            >
              <ChevronLeftIcon class="w-6 h-6 text-gray-300" />
            </button>
            <button 
              @click="nextSlide"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-gray-800 shadow-lg hover:bg-gray-700 transition-colors z-20 border border-gray-600"
            >
              <ChevronRightIcon class="w-6 h-6 text-gray-300" />
            </button>

            <!-- Main Illustration -->
            <div class="relative aspect-square max-w-md mx-auto">
              <div class="absolute inset-0 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
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
                    ? 'bg-orange-500 w-4' 
                    : 'bg-gray-600 hover:bg-gray-500'
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
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div class="space-y-8">
          <!-- Header with back arrow on left -->
          <div class="flex items-center">
            <button 
              @click="currentView = 'home'" 
              class="p-3 mr-4 rounded-full hover:bg-gray-800 text-gray-300 transition-colors border border-gray-600"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h1 class="text-3xl font-bold text-white">Telehealth Sessions</h1>
          </div>
          
          <!-- Tabs -->
          <div class="border-b border-gray-700">
            <nav class="-mb-px flex space-x-8">
              <button 
                @click="activeTab = 'upcoming'"
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                :class="activeTab === 'upcoming' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'"
              >
                Upcoming Sessions
              </button>
              <button 
                @click="activeTab = 'previous'"
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                :class="activeTab === 'previous' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'"
              >
                Previous Sessions
              </button>
            </nav>
          </div>
          
          <!-- Meeting List -->
          <div v-if="activeTab === 'upcoming' && upcomingMeetings.length > 0" class="space-y-4">
            <div 
              v-for="meeting in upcomingMeetings" 
              :key="meeting.id"
              class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:bg-gray-750"
            >
              <div class="flex justify-between items-start">
                <div class="flex items-start space-x-4">
                  <div class="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                    <component :is="meeting.icon" class="w-6 h-6 text-orange-400" />
                  </div>
                  <div class="space-y-2">
                    <div class="font-semibold text-white text-lg">{{ meeting.title }}</div>
                    <div class="flex items-center text-sm text-gray-400 space-x-2">
                      <ClockIcon class="w-4 h-4" />
                      <span>{{ meeting.time }} • {{ meeting.duration }}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-400 space-x-2">
                      <UserIcon class="w-4 h-4" />
                      <span>Dr. {{ meeting.doctor }}</span>
                    </div>
                  </div>
                </div>
                <!-- Status indicator with tournament-style design -->
                <div class="flex flex-col items-end gap-3">
                  <div class="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600">
                    <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    <span class="text-sm text-yellow-300 font-medium">Waiting</span>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-orange-400">{{ getQueuePosition(meeting) }}</div>
                    <div class="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
                      Queue Position
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'previous' && previousMeetings.length > 0" class="space-y-4">
            <div 
              v-for="meeting in previousMeetings" 
              :key="meeting.id"
              class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div class="flex justify-between items-start">
                <div class="flex items-start space-x-4">
                  <div class="bg-gray-600 p-3 rounded-lg border border-gray-500">
                    <component :is="meeting.icon" class="w-6 h-6 text-gray-400" />
                  </div>
                  <div class="space-y-2">
                    <div class="font-semibold text-white text-lg">{{ meeting.title }}</div>
                    <div class="flex items-center text-sm text-gray-400 space-x-2">
                      <ClockIcon class="w-4 h-4" />
                      <span>{{ meeting.time }} • {{ meeting.duration }}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-400 space-x-2">
                      <UserIcon class="w-4 h-4" />
                      <span>Dr. {{ meeting.doctor }}</span>
                    </div>
                  </div>
                </div>
                <button 
                  @click="viewRecording(meeting)"
                  class="bg-gray-700 text-gray-300 p-3 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-300 border border-gray-600"
                >
                  <PlayIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-16">
            <div class="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
              <CalendarIcon class="w-10 h-10 text-gray-500" />
            </div>
            <h3 class="text-lg font-medium text-white mb-2">No sessions found</h3>
            <p class="text-gray-400 mb-6">
              {{ activeTab === 'upcoming' ? 'You have no upcoming telehealth sessions scheduled.' : 'You have no previous telehealth sessions.' }}
            </p>
            <div class="mt-6">
              <button
                @click="scheduleMeeting"
                class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-105"
              >
                <PlusIcon class="w-5 h-5 mr-2" />
                Schedule a session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meetings View (placeholder) -->
    <div v-else-if="currentView === 'meetings'">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div class="flex items-center mb-8">
          <button 
            @click="currentView = 'home'" 
            class="p-3 mr-4 rounded-full hover:bg-gray-800 text-gray-300 transition-colors border border-gray-600"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <h1 class="text-3xl font-bold text-white">Upcoming Meetings</h1>
        </div>
        <!-- Meetings content would go here -->
        <div class="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon class="w-8 h-8 text-gray-500" />
          </div>
          <p class="text-gray-400 text-lg">Upcoming meetings view coming soon</p>
        </div>
      </div>
    </div>

    <!-- Waiting Room View -->
    <div v-else-if="currentView === 'waitingRoom' && currentMeeting" class="h-screen bg-gray-900">
      <div class="h-full flex flex-col items-center justify-center p-8">
        <!-- Tournament-style header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-3 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-full mb-4">
            <div class="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
            <span class="text-red-400 font-semibold text-sm">LIVE SESSION</span>
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">Waiting for Your Turn</h1>
          <p class="text-xl text-gray-400">Your appointment with Dr. {{ currentMeeting?.doctor }} is in progress</p>
        </div>
        
        <!-- Waiting Animation with tournament style -->
        <div class="relative mb-12">
          <div class="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
            <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center border border-gray-500">
              <div class="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                <div class="w-8 h-8 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <!-- Pulsing rings -->
          <div class="absolute inset-0 border-2 border-orange-500/20 rounded-full animate-ping"></div>
          <div class="absolute inset-0 border-2 border-orange-400/30 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
        </div>
        
        <!-- Queue Information - Tournament bracket style -->
        <div class="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 max-w-lg w-full border border-gray-700">
          <div class="text-center mb-6">
            <div class="text-4xl font-bold text-orange-400 mb-2">{{ getQueuePosition(currentMeeting) }}</div>
            <p class="text-gray-400 text-lg">Position in Queue</p>
          </div>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center py-3 border-b border-gray-700">
              <span class="text-gray-400">Estimated wait time:</span>
              <span class="font-semibold text-white">{{ getEstimatedWaitTime(currentMeeting) }}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-gray-700">
              <span class="text-gray-400">Appointment time:</span>
              <span class="font-semibold text-white">{{ currentMeeting?.time }}</span>
            </div>
            <div class="flex justify-between items-center py-3">
              <span class="text-gray-400">Service:</span>
              <span class="font-semibold text-white">{{ currentMeeting?.title }}</span>
            </div>
          </div>
        </div>
        
        <!-- Progress Bar - Tournament style -->
        <div class="w-full max-w-lg mb-8">
          <div class="flex justify-between text-sm text-gray-400 mb-3">
            <span>Queue Progress</span>
            <span class="text-orange-400 font-semibold">{{ getQueueProgress(currentMeeting) }}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-3 border border-gray-600">
            <div 
              class="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
              :style="{ width: getQueueProgress(currentMeeting) + '%' }"
            ></div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-4">
          <button 
            @click="leaveWaitingRoom"
            class="px-8 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 font-medium"
          >
            Back to Sessions
          </button>
          <button 
            @click="cancelAppointment"
            class="px-8 py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-300 font-medium"
          >
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
    
    <!-- Fallback for invalid waiting room state -->
    <div v-else-if="currentView === 'waitingRoom' && !currentMeeting" class="h-screen bg-gray-900">
      <div class="h-full flex flex-col items-center justify-center p-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white mb-4">Session Not Found</h1>
          <p class="text-gray-400 mb-8">The appointment session you're looking for is no longer available or has ended.</p>
          <button 
            @click="leaveWaitingRoom"
            class="px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 font-medium"
          >
            Return to Sessions
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

// Queue and notification state
const isInQueue = ref(false)
const queuePosition = ref(0)
const estimatedWaitTime = ref('5-10 min')
const queueProgress = ref(25)
const queueRefreshInterval = ref(null)
const showNotification = ref(false)
const notificationMessage = ref('')

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

// Queue-related computed properties
const getQueuePosition = (meeting) => {
  if (!meeting) return '--'
  return queuePosition.value === 1 ? 'Next' : `${queuePosition.value}`
}

const getEstimatedWaitTime = (meeting) => {
  if (!meeting) return '--'
  if (queuePosition.value === 1) return 'Ready now'
  if (queuePosition.value <= 3) return '5-10 min'
  if (queuePosition.value <= 5) return '10-15 min'
  return '15+ min'
}

const getQueueProgress = (meeting) => {
  if (!meeting) return 0
  return queueProgress.value
}

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
  
  // Instead of joining directly, enter waiting room
  enterWaitingRoom(meeting)
}

const enterWaitingRoom = (meeting) => {
  // Safety check: ensure we have a valid meeting
  if (!meeting || !meeting.id) {
    console.error('Invalid meeting data provided to enterWaitingRoom')
    return
  }
  
  console.log('Entering waiting room for meeting:', meeting)
  currentMeeting.value = meeting
  isInQueue.value = true
  currentView.value = 'waitingRoom'
  
  // Start queue monitoring
  startQueueMonitoring(meeting)
  
  // Show notification
  showQueueNotification(meeting)
}

const startQueueMonitoring = (meeting) => {
  // Simulate queue position updates
  queuePosition.value = Math.floor(Math.random() * 5) + 1
  queueProgress.value = Math.floor(Math.random() * 40) + 10
  
  // Set up auto-refresh interval
  queueRefreshInterval.value = setInterval(() => {
    updateQueueStatus(meeting)
  }, 30000) // 30 seconds
  
  // Initial update
  updateQueueStatus(meeting)
}

const updateQueueStatus = (meeting) => {
  // Simulate queue progress
  if (queueProgress.value < 100) {
    queueProgress.value += Math.floor(Math.random() * 10) + 5
    if (queueProgress.value > 100) queueProgress.value = 100
  }
  
  // Simulate position changes
  if (queuePosition.value > 1) {
    queuePosition.value -= Math.floor(Math.random() * 2)
    if (queuePosition.value < 1) queuePosition.value = 1
  }
  
  // Check if it's user's turn
  if (queuePosition.value === 1 && queueProgress.value >= 90) {
    // It's user's turn!
    notifyTurnToJoin(meeting)
  }
}

const notifyTurnToJoin = (meeting) => {
  // Stop queue monitoring
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value)
    queueRefreshInterval.value = null
  }
  
  // Show notification
  showNotification.value = true
  notificationMessage.value = `It's your turn! Dr. ${meeting.doctor} is ready to see you.`
  
  // Auto-join after 10 seconds if user doesn't respond
  setTimeout(() => {
    if (showNotification.value) {
      autoJoinCall(meeting)
    }
  }, 10000)
}

const autoJoinCall = (meeting) => {
  showNotification.value = false
  isInQueue.value = false
  currentView.value = 'videoCall'
  
  // Initialize WebRTC after view change
  setTimeout(() => {
    initializeWebRTC()
  }, 0)
}

const showQueueNotification = (meeting) => {
  showNotification.value = true
  notificationMessage.value = `You've been added to the queue for your appointment with Dr. ${meeting.doctor}`
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    showNotification.value = false
  }, 5000)
}

const refreshQueueStatus = () => {
  if (currentMeeting.value) {
    updateQueueStatus(currentMeeting.value)
  }
}

const manualJoinCall = () => {
  showNotification.value = false
  isInQueue.value = false
  
  if (currentMeeting.value) {
    currentView.value = 'videoCall'
    
    // Initialize WebRTC after view change
    setTimeout(() => {
      initializeWebRTC()
    }, 0)
  }
}

const viewRecording = (meeting) => {
  console.log('Viewing recording:', meeting)
}

const scheduleMeeting = () => {
  console.log('Scheduling a new meeting')
}

const cancelAppointment = () => {
  console.log('Cancelling appointment')
  
  // Clean up meeting state
  if (currentMeeting.value) {
    console.log('Cleaning up meeting state after cancellation')
    currentMeeting.value = null
  }
  
  // Stop queue monitoring
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value)
    queueRefreshInterval.value = null
    console.log('Queue monitoring stopped after cancellation')
  }
  
  // Reset queue state
  isInQueue.value = false
  queuePosition.value = 0
  queueProgress.value = 0
  estimatedWaitTime.value = '5-10 min'
  
  // Hide any notifications
  showNotification.value = false
  notificationMessage.value = ''
  
  // Navigate back to sessions view
  currentView.value = 'sessions'
  
  console.log('Appointment cancelled and all state cleaned up')
}

// Function to leave waiting room and clean up state
const leaveWaitingRoom = () => {
  console.log('Leaving waiting room')
  
  // Clean up meeting state
  if (currentMeeting.value) {
    console.log('Cleaning up meeting state after leaving waiting room')
    currentMeeting.value = null
  }
  
  // Stop queue monitoring
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value)
    queueRefreshInterval.value = null
    console.log('Queue monitoring stopped after leaving waiting room')
  }
  
  // Reset queue state
  isInQueue.value = false
  queuePosition.value = 0
  queueProgress.value = 0
  estimatedWaitTime.value = '5-10 min'
  
  // Hide any notifications
  showNotification.value = false
  notificationMessage.value = ''
  
  // Navigate back to sessions view
  currentView.value = 'sessions'
  
  console.log('Left waiting room and all state cleaned up')
}

// Comprehensive cleanup function for all states
const cleanupAllStates = () => {
  console.log('Performing comprehensive state cleanup')
  
  // Clean up meeting state
  if (currentMeeting.value) {
    currentMeeting.value = null
  }
  
  // Stop queue monitoring
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value)
    queueRefreshInterval.value = null
  }
  
  // Reset all queue states
  isInQueue.value = false
  queuePosition.value = 0
  queueProgress.value = 0
  estimatedWaitTime.value = '5-10 min'
  
  // Hide notifications
  showNotification.value = false
  notificationMessage.value = ''
  
  // Reset call states
  isRemoteConnected.value = false
  callStartTime.value = null
  currentTime.value = 0
  sessionNotes.value = ''
  isMuted.value = false
  isVideoOff.value = false
  isScreenSharing.value = false
  
  console.log('All states cleaned up successfully')
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
  
  // CRITICAL: Clean up meeting and queue state
  if (currentMeeting.value) {
    console.log('Cleaning up meeting state after call ended')
    currentMeeting.value = null
  }
  
  // Stop queue monitoring
  if (queueRefreshInterval.value) {
    clearInterval(queueRefreshInterval.value)
    queueRefreshInterval.value = null
    console.log('Queue monitoring stopped')
  }
  
  // Reset queue state
  isInQueue.value = false
  queuePosition.value = 0
  queueProgress.value = 0
  estimatedWaitTime.value = '5-10 min'
  
  // Hide any notifications
  showNotification.value = false
  notificationMessage.value = ''
  
  // Navigate back to sessions view
  currentView.value = 'sessions'
  
  console.log('Call ended and all state cleaned up')
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
  
  // Comprehensive cleanup of all states
  cleanupAllStates()
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
  
  // Safety check: if waiting room is accessed without a meeting, redirect to sessions
  if (newValue === 'waitingRoom' && !currentMeeting.value) {
    console.warn('Waiting room accessed without valid meeting, redirecting to sessions')
    currentView.value = 'sessions'
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

/* Tournament-style custom colors */
.bg-gray-750 {
  background-color: #374151;
}

/* Enhanced hover effects */
.hover\:bg-gray-750:hover {
  background-color: #374151;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Enhanced focus states */
button:focus,
input:focus {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}

/* Tournament-style glow effects */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Animated borders */
.border-orange-500\/30 {
  border-color: rgba(249, 115, 22, 0.3);
}

.border-orange-500\/50 {
  border-color: rgba(249, 115, 22, 0.5);
}
</style>