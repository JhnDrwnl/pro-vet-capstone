<!-- views/vet/VetQueue.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Queue Management</h1>
      <p class="text-gray-500 mt-1">Manage today's patient consultations</p>
    </div>

    <!-- Queue Stats -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-semibold text-gray-900">{{ queueStats.total }}</div>
        <div class="text-sm text-gray-500">Total</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-semibold text-green-600">{{ queueStats.waiting }}</div>
        <div class="text-sm text-gray-500">Waiting</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-semibold text-blue-600">{{ queueStats.inProgress }}</div>
        <div class="text-sm text-gray-500">In Progress</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-2xl font-semibold text-gray-600">{{ queueStats.completed }}</div>
        <div class="text-sm text-gray-500">Completed</div>
      </div>
    </div>

    <!-- Current Patient -->
    <div v-if="currentPatient" class="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Currently Consulting</h2>
        <span class="text-sm text-gray-500">Started: {{ formatTime(currentPatient.startTime) }}</span>
      </div>
      
      <div class="mb-4">
        <div class="text-lg font-medium text-gray-900 mb-1">{{ currentPatient.ownerName }}</div>
        <div class="text-gray-600">{{ currentPatient.petName }} - {{ currentPatient.serviceName }}</div>
        <!-- Telehealth indicator -->
        <div v-if="currentPatient.isTelehealth" class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Telehealth Session
        </div>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="openCompletionForm(currentPatient)"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Mark as Done
        </button>
        <button 
          @click="skipPatient(currentPatient.id)"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Skip
        </button>
        <!-- Telehealth call button -->
        <button 
          v-if="currentPatient.isTelehealth"
          @click="router.push(`/vet/telehealth?appointmentId=${currentPatient.id}`)"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Join Video Call
        </button>
      </div>
    </div>

    <!-- Queue Controls -->
    <div class="bg-gray-50 rounded-lg p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Queue Controls</h2>
        <div class="flex items-center gap-4">
          <!-- Xirsys Status Indicator -->
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="{
              'bg-green-500': xirsysStatus === 'available',
              'bg-yellow-500': xirsysStatus === 'limited',
              'bg-red-500': xirsysStatus === 'unavailable',
              'bg-yellow-500': xirsysStatus === 'checking'
            }"></div>
            <span class="text-sm text-gray-600">
              {{ xirsysStatus === 'available' ? 'Telehealth Ready' : 
                 xirsysStatus === 'limited' ? 'Telehealth Limited' :
                 xirsysStatus === 'unavailable' ? 'Telehealth Unavailable' : 
                 'Checking Telehealth...' }}
            </span>
          </div>
          <!-- Queue Status -->
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="queuePaused ? 'bg-red-500' : 'bg-green-500'"></div>
            <span class="text-sm text-gray-600">{{ queuePaused ? 'Paused' : 'Active' }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="callNext"
          :disabled="!canCallNext"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Call Next
        </button>
        <button 
          @click="pauseQueue"
          :disabled="!canPause"
          class="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {{ queuePaused ? 'Resume' : 'Pause' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-500">Fetching today's appointments</p>
    </div>

    <!-- Waiting Queue -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Waiting Queue</h2>
      </div>
      
      <div v-if="waitingQueue.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-lg">No patients waiting</p>
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div v-for="(patient, index) in waitingQueue" :key="patient.id" 
             class="p-6 hover:bg-gray-50 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                {{ index + 1 }}
              </div>
              <div>
                <div class="font-medium text-gray-900">{{ patient.ownerName }}</div>
                <div class="text-sm text-gray-600">{{ patient.petName }}</div>
                <div class="text-xs text-gray-500">{{ patient.serviceName }}</div>
                <!-- Telehealth indicator for waiting patients -->
                <div v-if="isTelehealthAppointment(patient)" class="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Telehealth
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  Scheduled: {{ formatDateTime(patient.date, patient.time) }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right text-sm text-gray-500">
                <div>Position #{{ index + 1 }}</div>
                <div v-if="index === 0" class="text-blue-600 font-medium">Next in line</div>
                <div v-else>~{{ getEstimatedWaitTime(index + 1) }} min wait</div>
                <div class="text-xs text-gray-400">
                  Est. start: {{ getEstimatedStartTime(index + 1) }}
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="transferPatient(patient.id, 'up')"
                  :disabled="index === 0"
                  class="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button 
                  @click="transferPatient(patient.id, 'down')"
                  :disabled="index === waitingQueue.length - 1"
                  class="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
              <button 
                @click="startConsultation(patient.id)"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Completion Form Modal -->
  <div v-if="showCompletionFormModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Complete Appointment</h2>
        <button @click="closeCompletionFormModal" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="p-6">
        <!-- Appointment Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-3">Appointment Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 mb-1">Owner</div>
              <div class="font-medium text-gray-900">{{ selectedAppointment?.ownerName || 'Unknown' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Pet(s)</div>
              <div class="font-medium text-gray-900">
                {{ selectedAppointment?.petNames?.join(', ') || selectedAppointment?.petName || 'No pet info' }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Date & Time</div>
              <div class="font-medium text-gray-900">
                {{ formatDate(selectedAppointment?.date) }} at {{ selectedAppointment?.time }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500 mb-1">Services</div>
              <div class="font-medium text-gray-900">
                {{ (selectedAppointment?.['Service Names'] || selectedAppointment?.serviceNames || []).join(', ') }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Completion Form -->
        <form @submit.prevent="submitCompletionForm" class="space-y-6">
          <!-- Service Summary Section -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Service Summary
            </h3>
            
            <!-- Services with individual notes -->
            <div class="space-y-4">
              <div v-for="(service, index) in (selectedAppointment?.['Service Names'] || selectedAppointment?.serviceNames || [])" :key="index" class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-gray-900">{{ service }}</h4>
                  <span class="text-sm text-gray-500">Service {{ index + 1 }}</span>
                </div>
                
                <!-- Category Information -->
                <div v-if="getServiceCategory(service)" class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span class="text-sm font-medium text-blue-800">Category</span>
                  </div>
                  <div class="text-sm text-blue-700">
                    <div class="font-medium">{{ getServiceCategory(service)?.name }}</div>
                    <div class="text-blue-600">{{ getServiceCategory(service)?.description }}</div>
                  </div>
                </div>
                
                <!-- Service Details (if available) -->
                <div v-if="getServiceById(service) || getServiceByName(service)" class="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm font-medium text-green-800">Service Details</span>
                  </div>
                  <div class="text-sm text-green-700">
                    <div v-if="getServiceByName(service)?.fees" class="mb-1">
                      <span class="font-medium">Fees:</span> {{ getServiceByName(service)?.fees }}
                    </div>
                    <div v-if="getServiceByName(service)?.processingTime" class="mb-1">
                      <span class="font-medium">Processing Time:</span> {{ getServiceByName(service)?.processingTime }}
                    </div>
                    <div v-if="getServiceByName(service)?.classification" class="mb-1">
                      <span class="font-medium">Classification:</span> {{ getServiceByName(service)?.classification }}
                    </div>
                  </div>
                </div>
                
                <!-- Service-specific fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="completionForm.services[index].status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="completed">Completed</option>
                      <option value="partially_completed">Partially Completed</option>
                      <option value="requires_followup">Requires Follow-up</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input 
                      v-model.number="completionForm.services[index].duration" 
                      type="number" 
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Service Notes</label>
                    <textarea 
                      v-model="completionForm.services[index].notes" 
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what was done, findings, recommendations..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pet Health Assessment -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              Pet Health Assessment
            </h3>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">{{ selectedAppointment?.petName || 'Pet' }}</h4>
                    <p class="text-sm text-gray-500">Health Assessment</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Overall Health</label>
                    <select v-model="completionForm.pets[0].overallHealth" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input 
                      v-model.number="completionForm.pets[0].weight" 
                      type="number" 
                      step="0.1"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5.2"
                    />
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Health Notes</label>
                    <textarea 
                      v-model="completionForm.pets[0].healthNotes" 
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe pet's condition, any issues found, recommendations..."
                    ></textarea>
                  </div>
                  
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Follow-up Required</label>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input 
                          v-model="completionForm.pets[0].followUpRequired" 
                          type="checkbox" 
                          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm text-gray-700">Schedule follow-up appointment</span>
                      </label>
                      
                      <div v-if="completionForm.pets[0].followUpRequired" class="ml-6">
                        <input 
                          v-model="completionForm.pets[0].followUpNotes" 
                          type="text"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason for follow-up, recommended timeline..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- General Notes -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              General Notes & Recommendations
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Treatment Summary</label>
                <textarea 
                  v-model="completionForm.generalNotes.treatmentSummary" 
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Overall summary of treatments provided, procedures performed..."
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Owner Instructions</label>
                <textarea 
                  v-model="completionForm.generalNotes.ownerInstructions" 
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructions for pet owner, home care, medications, diet changes..."
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
                <textarea 
                  v-model="completionForm.generalNotes.nextSteps" 
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Recommended next steps, when to return, preventive care..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              @click="closeCompletionFormModal" 
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="completionFormLoading"
              class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <span v-if="completionFormLoading">Completing...</span>
              <span v-else>Complete Appointment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Telehealth Loading Modal -->
  <div v-if="isInitializingTelehealth" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <div class="text-center">
        <!-- Loading Animation -->
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">Initializing Telehealth</h3>
        <p class="text-sm text-gray-600 mb-4">Setting up your video consultation...</p>
        
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${telehealthProgress}%` }"
          ></div>
        </div>
        
        <!-- Current Step -->
        <div class="text-sm text-blue-600 font-medium mb-2">
          {{ telehealthSteps[Math.floor(telehealthProgress / 25)] || 'Almost ready...' }}
        </div>
        
        <!-- Progress Percentage -->
        <div class="text-xs text-gray-500">
          {{ Math.round(telehealthProgress) }}% Complete
        </div>
      </div>
    </div>
  </div>

  <!-- Telehealth Modal -->
  <div v-if="showTelehealthModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Start Telehealth Consultation</h2>
        <button @click="cancelTelehealthConsultation" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="p-6 text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Telehealth Consultation</h3>
          <p class="text-gray-600">{{ telehealthAppointment?.ownerName }} - {{ telehealthAppointment?.petName }}</p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 class="font-medium text-gray-900 mb-2">Services:</h4>
          <ul class="text-sm text-gray-600 space-y-1">
            <li v-for="service in (telehealthAppointment?.['Service Names'] || telehealthAppointment?.serviceNames || [])" :key="service" class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {{ service }}
            </li>
          </ul>
        </div>
        
        <div class="mb-6">
          <p class="text-sm text-gray-500 mb-4">
            This consultation will use Xirsys-powered video calling. Please ensure your camera and microphone are ready.
          </p>
          <!-- Xirsys Status in Modal -->
          <div class="inline-flex items-center gap-2 px-3 py-2 rounded-lg" :class="{
            'bg-green-100 text-green-800': xirsysStatus === 'available',
            'bg-yellow-100 text-yellow-800': xirsysStatus === 'limited',
            'bg-red-100 text-red-800': xirsysStatus === 'unavailable',
            'bg-yellow-100 text-yellow-800': xirsysStatus === 'checking'
          }">
            <div class="w-2 h-2 rounded-full" :class="{
              'bg-green-500': xirsysStatus === 'available',
              'bg-yellow-500': xirsysStatus === 'limited',
              'bg-red-500': xirsysStatus === 'unavailable',
              'bg-yellow-500': xirsysStatus === 'checking'
            }"></div>
            <span class="text-sm font-medium">
              {{ xirsysStatus === 'available' ? 'Xirsys TURN Ready' : 
                 xirsysStatus === 'limited' ? 'Xirsys STUN Only' :
                 xirsysStatus === 'unavailable' ? 'Xirsys Unavailable' : 
                 'Checking Xirsys...' }}
            </span>
          </div>
          
          <!-- Status description -->
          <div class="text-xs text-gray-500 mt-2">
            <span v-if="xirsysStatus === 'available'">
              ✓ Full TURN server support for reliable video calls
            </span>
            <span v-else-if="xirsysStatus === 'limited'">
              ⚠ STUN servers only - may have connectivity issues
            </span>
            <span v-else-if="xirsysStatus === 'unavailable'">
              ✗ No ICE servers available - check configuration
            </span>
            <span v-else>
              🔄 Verifying Xirsys connection...
            </span>
          </div>
        </div>
        
        <div class="flex gap-3 justify-center">
          <button 
            @click="cancelTelehealthConsultation"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="startTelehealthConsultation"
            :disabled="xirsysStatus === 'unavailable' || xirsysStatus === 'checking' || isInitializingTelehealth"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg v-if="isInitializingTelehealth" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <svg v-else-if="xirsysStatus === 'checking'" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span v-if="isInitializingTelehealth">Initializing...</span>
            <span v-else-if="xirsysStatus === 'checking'">Checking...</span>
            <span v-else-if="xirsysStatus === 'unavailable'">Service Unavailable</span>
            <span v-else>Start Video Call</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/modules/authStore'
import { collection, query, where, getDocs, orderBy, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@shared/firebase'
import XirsysService from '@/services/xirsys-service'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// State
const appointments = ref([])
const waitingQueue = ref([])
const currentPatient = ref(null)
const isLoading = ref(true)
const queuePaused = ref(false)
const currentTime = ref(new Date())

// Telehealth state
const isTelehealthEnabled = ref(false)
const telehealthAppointment = ref(null)
const showTelehealthModal = ref(false)
const xirsysStatus = ref('checking') // 'checking', 'available', 'unavailable'
const isInitializingTelehealth = ref(false)
const telehealthProgress = ref(0)
const telehealthSteps = ref([
  'Initializing Xirsys...',
  'Fetching ICE servers...',
  'Configuring WebRTC...',
  'Opening video interface...'
])

// Completion form state
const showCompletionFormModal = ref(false)
const selectedAppointment = ref(null)
const completionFormLoading = ref(false)
const completionForm = ref({
  services: [],
  pets: [{
    name: '',
    overallHealth: 'good',
    weight: '',
    healthNotes: '',
    followUpRequired: false,
    followUpNotes: ''
  }],
  generalNotes: {
    treatmentSummary: '',
    ownerInstructions: '',
    nextSteps: ''
  }
})

// Service categories state
const serviceCategories = ref({})
const servicesData = ref({})
const categoriesData = ref({})

// Computed properties
const queueStats = computed(() => ({
  total: waitingQueue.value.length + (currentPatient.value ? 1 : 0),
  waiting: waitingQueue.value.length,
  inProgress: currentPatient.value ? 1 : 0,
  completed: getCompletedAppointmentsCount()
}))

// Helper function to count completed appointments
const getCompletedAppointmentsCount = () => {
  return appointments.value.filter(appointment => appointment.status === 'completed').length
}

// Helper function to get service data from appointment
const getAppointmentServices = (appointment) => {
  return {
    serviceIds: appointment.Services || appointment.services || [],
    serviceNames: appointment['Service Names'] || appointment.serviceNames || []
  }
}

// Telehealth detection function
const isTelehealthAppointment = (appointment) => {
  console.log('🔍 Checking if appointment is telehealth:', appointment.id)
  
  // Check both possible field names for services
  const serviceIds = appointment.Services || appointment.services || []
  const serviceNames = appointment['Service Names'] || appointment.serviceNames || []
  
  console.log('  🔧 Service IDs found:', serviceIds)
  console.log('  🔧 Service Names found:', serviceNames)
  
  if (!serviceIds.length && !serviceNames.length) {
    console.log('  ❌ No services found in appointment')
    return false
  }
  
  // First try to check by service IDs (more reliable)
  if (serviceIds.length > 0) {
    console.log('  📋 Checking services by ID:', serviceIds)
    
    const hasTelehealthService = serviceIds.some(serviceId => {
      console.log(`    🔍 Checking service ID: "${serviceId}"`)
      
      const service = servicesData.value[serviceId]
      if (!service) {
        console.log(`      ❌ Service not found in services data for ID: ${serviceId}`)
        return false
      }
      
      console.log(`      ✅ Service found:`, service)
      
      if (!service.categoryId) {
        console.log(`      ❌ Service has no category ID`)
        return false
      }
      
      const category = categoriesData.value[service.categoryId]
      if (!category) {
        console.log(`      ❌ Category not found for ID: ${service.categoryId}`)
        return false
      }
      
      console.log(`      📂 Category: "${category.name}" (${category.description})`)
      
      const isTelehealth = category.name.toLowerCase().includes('telehealth')
      console.log(`      🎯 Is Telehealth: ${isTelehealth}`)
      
      return isTelehealth
    })
    
    if (hasTelehealthService) {
      console.log(`  🎯 Final Result: Appointment is TELEHEALTH (detected by service IDs)`)
      return true
    }
  }
  
  // Fallback: check by service names if no telehealth found by ID
  if (serviceNames.length > 0) {
    console.log('  📋 Checking services by name (fallback):', serviceNames)
    
    const hasTelehealthService = serviceNames.some(serviceName => {
      console.log(`    🔍 Checking service name: "${serviceName}"`)
      
      const service = getServiceByName(serviceName)
      if (!service) {
        console.log(`      ❌ Service not found in services data`)
        return false
      }
      
      console.log(`      ✅ Service found:`, service)
      
      if (!service.categoryId) {
        console.log(`      ❌ Service has no category ID`)
        return false
      }
      
      const category = categoriesData.value[service.categoryId]
      if (!category) {
        console.log(`      ❌ Category not found for ID: ${service.categoryId}`)
        return false
      }
      
      console.log(`      📂 Category: "${category.name}" (${category.description})`)
      
      const isTelehealth = category.name.toLowerCase().includes('telehealth')
      console.log(`      🎯 Is Telehealth: ${isTelehealth}`)
      
      return isTelehealth
    })
    
    if (hasTelehealthService) {
      console.log(`  🎯 Final Result: Appointment is TELEHEALTH (detected by service names)`)
      return true
    }
  }
  
  console.log(`  🎯 Final Result: Appointment is NOT telehealth`)
  return false
}

// Check Xirsys availability
const checkXirsysAvailability = async () => {
  try {
    xirsysStatus.value = 'checking'
    console.log('Checking Xirsys availability...')
    
    const iceConfig = await XirsysService.getIceServers()
    
    if (iceConfig && iceConfig.iceServers && iceConfig.iceServers.length > 0) {
      // Check if we have actual TURN servers (not just STUN)
      const hasTurnServers = iceConfig.iceServers.some(server => 
        server.urls && server.urls.some(url => url.startsWith('turn:'))
      )
      
      if (hasTurnServers) {
        xirsysStatus.value = 'available'
        isTelehealthEnabled.value = true
        console.log('Xirsys TURN servers available for telehealth')
      } else {
        // Only STUN servers available (fallback)
        xirsysStatus.value = 'limited'
        isTelehealthEnabled.value = true
        console.warn('Only STUN servers available - limited connectivity')
      }
    } else {
      xirsysStatus.value = 'unavailable'
      isTelehealthEnabled.value = false
      console.warn('No ICE servers available from Xirsys')
    }
  } catch (error) {
    console.error('Error checking Xirsys availability:', error)
    xirsysStatus.value = 'unavailable'
    isTelehealthEnabled.value = false
    
    // Check if it's a credentials issue
    if (error.message.includes('credentials') || error.message.includes('Missing Xirsys')) {
      console.warn('Xirsys credentials missing - check environment variables')
    }
  }
}

// Enhanced start consultation function
const startConsultation = async (patientId) => {
  const patient = waitingQueue.value.find(p => p.id === patientId)
  if (!patient) return
  
  console.log('=== STARTING CONSULTATION ===')
  console.log('Patient ID:', patientId)
  console.log('Patient Data:', patient)
  
  // Check both possible field names for services
  const serviceIds = patient.Services || patient.services || []
  const serviceNames = patient['Service Names'] || patient.serviceNames || []
  
  console.log('Service IDs:', serviceIds)
  console.log('Service Names:', serviceNames)
  
  // Log detailed category information for each service
  if (serviceIds.length > 0) {
    console.log('--- SERVICE CATEGORY ANALYSIS (by ID) ---')
    serviceIds.forEach((serviceId, index) => {
      console.log(`Service ${index + 1} ID: "${serviceId}"`)
      
      // Get service details by ID
      const service = servicesData.value[serviceId]
      if (service) {
        console.log(`  - Service ID: ${service.id}`)
        console.log(`  - Service Name: ${service.name}`)
        console.log(`  - Category ID: ${service.categoryId}`)
        
        // Get category details
        if (service.categoryId && categoriesData.value[service.categoryId]) {
          const category = categoriesData.value[service.categoryId]
          console.log(`  - Category Name: "${category.name}"`)
          console.log(`  - Category Description: "${category.description}"`)
          console.log(`  - Is Telehealth: ${category.name.toLowerCase().includes('telehealth')}`)
        } else {
          console.log(`  - Category: Not found or no category assigned`)
        }
      } else {
        console.log(`  - Service: Not found in services data`)
      }
    })
  }
  
  if (serviceNames.length > 0) {
    console.log('--- SERVICE CATEGORY ANALYSIS (by Name) ---')
    serviceNames.forEach((serviceName, index) => {
      console.log(`Service ${index + 1} Name: "${serviceName}"`)
      
      // Get service details by name
      const service = getServiceByName(serviceName)
      if (service) {
        console.log(`  - Service ID: ${service.id}`)
        console.log(`  - Service Name: ${service.name}`)
        console.log(`  - Category ID: ${service.categoryId}`)
        
        // Get category details
        if (service.categoryId && categoriesData.value[service.categoryId]) {
          const category = categoriesData.value[service.categoryId]
          console.log(`  - Category Name: "${category.name}"`)
          console.log(`  - Category Description: "${category.description}"`)
          console.log(`  - Is Telehealth: ${category.name.toLowerCase().includes('telehealth')}`)
        } else {
          console.log(`  - Category: Not found or no category assigned`)
        }
      } else {
        console.log(`  - Service: Not found in services data`)
      }
    })
  }
  
  // Check if this is a telehealth appointment
  const isTelehealth = isTelehealthAppointment(patient)
  console.log('--- TELEHEALTH DETECTION ---')
  console.log('Is Telehealth Appointment:', isTelehealth)
  
  if (isTelehealth) {
    console.log('→ Showing telehealth modal')
    // Store the telehealth appointment and show modal
    telehealthAppointment.value = patient
    showTelehealthModal.value = true
    return
  }
  
  console.log('→ Starting regular consultation')
  // Regular appointment - proceed as before
  currentPatient.value = {
    ...patient,
    startTime: new Date()
  }
  waitingQueue.value = waitingQueue.value.filter(p => p.id !== patientId)
  
  // Update appointment status to 'in-progress'
  updateAppointmentStatus(patientId, 'in-progress')
  
  // Update Firestore queue
  updateFirestoreQueue()
  
  console.log('=== CONSULTATION STARTED ===')
}

// Start telehealth consultation
const startTelehealthConsultation = async () => {
  if (!telehealthAppointment.value) return
  
  try {
    // Show loading modal and start progress
    isInitializingTelehealth.value = true
    telehealthProgress.value = 0
    xirsysStatus.value = 'checking'
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      if (telehealthProgress.value < 90) {
        telehealthProgress.value += Math.random() * 15
      }
    }, 300)
    
    // Step 1: Initialize Xirsys and get ICE servers
    console.log('Initializing Xirsys for telehealth consultation...')
    telehealthProgress.value = 25
    
    const iceConfig = await XirsysService.getIceServers()
    
    if (!iceConfig || !iceConfig.iceServers || iceConfig.iceServers.length === 0) {
      throw new Error('Failed to get ICE servers from Xirsys')
    }
    
    // Step 2: ICE servers fetched successfully
    telehealthProgress.value = 50
    console.log('Xirsys initialized successfully with ICE servers:', iceConfig.iceServers)
    
    // Step 3: Configure WebRTC
    telehealthProgress.value = 75
    
    // Update Xirsys status
    xirsysStatus.value = 'available'
    isTelehealthEnabled.value = true
    
    // Step 4: Update appointment status
    await updateAppointmentStatus(telehealthAppointment.value.id, 'in-progress')
    
    // Remove from waiting queue
    waitingQueue.value = waitingQueue.value.filter(p => p.id !== telehealthAppointment.value.id)
    
    // Set as current patient with telehealth flag and ICE config
    currentPatient.value = {
      ...telehealthAppointment.value,
      startTime: new Date(),
      isTelehealth: true,
      iceConfig: iceConfig // Store ICE configuration for the video call
    }
    
    // Update Firestore queue with telehealth data
    updateFirestoreQueue()
    
    // Step 5: Prepare for navigation
    telehealthProgress.value = 90
    
    // Store ICE configuration in sessionStorage for the telehealth interface
    sessionStorage.setItem('telehealth_ice_config', JSON.stringify(iceConfig))
    sessionStorage.setItem('telehealth_appointment', JSON.stringify(currentPatient.value))
    
    // Complete progress
    telehealthProgress.value = 100
    
    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Clear progress interval
    clearInterval(progressInterval)
    
    // Close modals
    showTelehealthModal.value = false
    telehealthAppointment.value = null
    isInitializingTelehealth.value = false
    
    // Navigate to telehealth interface with appointment context
    router.push({
      path: '/vet/telehealth',
      query: { 
        appointmentId: currentPatient.value.id,
        mode: 'consultation',
        iceConfig: btoa(JSON.stringify(iceConfig)) // Encode ICE config in URL
      }
    })
    
  } catch (error) {
    console.error('Error starting telehealth consultation:', error)
    
    // Clear progress interval if it exists
    if (window.progressInterval) {
      clearInterval(window.progressInterval)
    }
    
    // Hide loading modal
    isInitializingTelehealth.value = false
    telehealthProgress.value = 0
    
    xirsysStatus.value = 'unavailable'
    isTelehealthEnabled.value = false
    
    // Show detailed error message
    let errorMessage = 'Failed to start telehealth consultation. '
    if (error.message.includes('ICE servers')) {
      errorMessage += 'Xirsys ICE servers are not available. Please check your configuration.'
    } else if (error.message.includes('credentials')) {
      errorMessage += 'Xirsys credentials are missing. Please check your environment variables.'
    } else {
      errorMessage += 'Please try again or contact support.'
    }
    
    alert(errorMessage)
  }
}

// Cancel telehealth consultation
const cancelTelehealthConsultation = () => {
  showTelehealthModal.value = false
  telehealthAppointment.value = null
}

// Computed properties
const canCallNext = computed(() => 
  !queuePaused.value && waitingQueue.value.length > 0 && !currentPatient.value
)

const canPause = computed(() => 
  waitingQueue.value.length > 0 || currentPatient.value
)

// Queue status indicator
const queueStatus = computed(() => {
  if (queuePaused.value) return { text: 'PAUSED', color: 'red', icon: '⏸️' }
  if (currentPatient.value) return { text: 'IN PROGRESS', color: 'orange', icon: '👨‍⚕️' }
  if (waitingQueue.value.length > 0) return { text: 'ACTIVE', color: 'green', icon: '📋' }
  return { text: 'EMPTY', color: 'gray', icon: '🎉' }
})

// Get today's date range
const getTodayRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  return { startOfDay, endOfDay }
}

// Check for ongoing consultations
const checkForOngoingConsultations = async () => {
  try {
    // Check if there are any appointments marked as 'in-progress' for this doctor
    const { startOfDay, endOfDay } = getTodayRange()
    
    const appointmentsRef = collection(db, 'appointments')
    const q = query(
      appointmentsRef,
      where('status', '==', 'in-progress'),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay),
      where('doctorId', '==', authStore.user?.userId)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const ongoingAppointment = querySnapshot.docs[0].data()
      console.log('Found ongoing consultation:', ongoingAppointment)
      
      // If we don't have a current patient but there's an ongoing appointment,
      // restore it from the appointment data
      if (!currentPatient.value && ongoingAppointment) {
        // Get user name
        let ownerName = 'Unknown Owner'
        if (ongoingAppointment.userId) {
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', ongoingAppointment.userId)))
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data()
              ownerName = userData.firstName || userData.name || 'Unknown Owner'
            }
          } catch (error) {
            console.error('Error fetching user:', error)
          }
        }
        
        currentPatient.value = {
          id: ongoingAppointment.id,
          ...ongoingAppointment,
          ownerName,
          petName: ongoingAppointment.petNames?.[0] || 'Unknown Pet',
          serviceName: ongoingAppointment['Service Names']?.[0] || ongoingAppointment.serviceNames?.[0] || 'Unknown Service',
          startTime: ongoingAppointment.startTime || new Date(),
          isTelehealth: isTelehealthAppointment(ongoingAppointment)
        }
        
        console.log('Restored ongoing consultation as current patient:', currentPatient.value)
        
        // Update the queue to reflect this
        updateFirestoreQueue()
      }
    }
  } catch (error) {
    console.error('Error checking for ongoing consultations:', error)
  }
}

// Enhanced fetch appointments function
const fetchAppointments = async () => {
  try {
    isLoading.value = true
    
    // First, try to restore queue from Firestore
    const queueRestored = await initializeQueueFromFirestore()
    
    if (queueRestored) {
      // Queue was restored from Firestore, no need to fetch appointments again
      console.log('Queue restored from Firestore, skipping appointment fetch')
      isLoading.value = false
      return
    }
    
    // If no queue was restored, check for ongoing consultations
    await checkForOngoingConsultations()
    
    // Only fetch appointments if we don't have a current patient
    if (!currentPatient.value) {
      console.log('No current patient, fetching appointments...')
      const { startOfDay, endOfDay } = getTodayRange()
      
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('status', '==', 'approved'),
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        where('doctorId', '==', authStore.user?.userId),
        orderBy('date', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      const appointmentsData = []
      
      for (const doc of querySnapshot.docs) {
        const appointment = doc.data()
        
        // Get user name
        let ownerName = 'Unknown Owner'
        if (appointment.userId) {
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', appointment.userId)))
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data()
              ownerName = userData.firstName || userData.name || 'Unknown Owner'
            }
          } catch (error) {
            console.error('Error fetching user:', error)
          }
        }
        
        appointmentsData.push({
          id: doc.id,
          ...appointment,
          ownerName,
          petName: appointment.petNames?.[0] || 'Unknown Pet',
          serviceName: appointment['Service Names']?.[0] || appointment.serviceNames?.[0] || 'Unknown Service'
        })
      }
      
      appointments.value = appointmentsData
      waitingQueue.value = [...appointmentsData].sort((a, b) => {
        // Sort by date in ascending order (earliest first)
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
        return dateA - dateB
      })
      
      // Update Firestore queue with initial data
      updateFirestoreQueue()
    } else {
      console.log('Current patient exists, appointments already loaded')
    }
    
  } catch (error) {
    console.error('Error fetching appointments:', error)
  } finally {
    isLoading.value = false
  }
}

// Queue management methods
const callNext = () => {
  if (!canCallNext.value) return
  
  const nextPatient = waitingQueue.value[0]
  currentPatient.value = {
    ...nextPatient,
    startTime: new Date()
  }
  waitingQueue.value.shift()
  
  // Update Firestore queue
  updateFirestoreQueue()
}

// Completion form functions
const openCompletionForm = (appointment) => {
  selectedAppointment.value = appointment
  
  // Initialize completion form with appointment data
  completionForm.value = {
    services: (appointment['Service Names'] || appointment.serviceNames || []).map(service => ({
      name: service,
      status: 'completed',
      duration: 30,
      notes: '',
      category: getServiceCategory(service) // Add category information
    })),
    pets: [{
      name: appointment.petName || 'Pet',
      overallHealth: 'good',
      weight: '',
      healthNotes: '',
      followUpRequired: false,
      followUpNotes: ''
    }],
    generalNotes: {
      treatmentSummary: '',
      ownerInstructions: '',
      nextSteps: ''
    }
  }
  
  showCompletionFormModal.value = true
}

const closeCompletionFormModal = () => {
  showCompletionFormModal.value = false
  selectedAppointment.value = null
  completionForm.value = {
    services: [],
    pets: [{
      name: '',
      overallHealth: 'good',
      weight: '',
      healthNotes: '',
      followUpRequired: false,
      followUpNotes: ''
    }],
    generalNotes: {
      treatmentSummary: '',
      ownerInstructions: '',
      nextSteps: ''
    }
  }
}

const submitCompletionForm = async () => {
  if (!selectedAppointment.value) return
  
  completionFormLoading.value = true
  try {
    // Create completion data object
    const completionData = {
      appointmentId: selectedAppointment.value.id,
      completedAt: new Date(),
      completedBy: authStore.user?.userId,
      services: completionForm.value.services,
      pets: completionForm.value.pets,
      generalNotes: completionForm.value.generalNotes,
      status: 'completed'
    }
    
    // Update appointment status and add completion data
    await updateAppointmentStatus(selectedAppointment.value.id, 'completed')
    
    // Store completion data
    await storeCompletionData(completionData)
    
    // Close modal and refresh data
    closeCompletionFormModal()
    await fetchAppointments()
    
    // Show success message (you can add a toast notification here)
    console.log('Appointment completed successfully!')
    
  } catch (error) {
    console.error('Error completing appointment:', error)
    // Show error message (you can add a toast notification here)
    console.error('Failed to complete appointment. Please try again.')
  } finally {
    completionFormLoading.value = false
  }
}

const storeCompletionData = async (completionData) => {
  try {
    const appointmentRef = doc(db, 'appointments', completionData.appointmentId)
    await updateDoc(appointmentRef, {
      status: 'completed',
      completedAt: completionData.completedAt,
      completedBy: completionData.completedBy,
      completionData: {
        services: completionData.services,
        pets: completionData.pets,
        generalNotes: completionData.generalNotes
      }
    })
  } catch (error) {
    console.error('Error storing completion data:', error)
    throw error
  }
}

// Fetch service categories and services data
const fetchServiceData = async () => {
  try {
    // Fetch categories
    const categoriesRef = collection(db, 'categories')
    const categoriesSnapshot = await getDocs(categoriesRef)
    categoriesData.value = {}
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data()
      categoriesData.value[doc.id] = {
        id: doc.id,
        name: data.name,
        description: data.description,
        coverPhoto: data.coverPhoto,
        archived: data.archived
      }
    })
    
    // Fetch services
    const servicesRef = collection(db, 'services')
    const servicesSnapshot = await getDocs(servicesRef)
    servicesData.value = {}
    
    servicesSnapshot.forEach(doc => {
      const data = doc.data()
      servicesData.value[doc.id] = {
        id: doc.id,
        name: data.name,
        categoryId: data.categoryId,
        classification: data.classification,
        fees: data.fees,
        processingTime: data.processingTime,
        transactionType: data.transactionType
      }
    })
    
    // Build service-category mapping by service ID for better accuracy
    serviceCategories.value = {}
    Object.values(servicesData.value).forEach(service => {
      if (service.categoryId && categoriesData.value[service.categoryId]) {
        serviceCategories.value[service.id] = categoriesData.value[service.categoryId]
        // Also keep the name mapping for backward compatibility
        serviceCategories.value[service.name] = categoriesData.value[service.categoryId]
      }
    })
    
  } catch (error) {
    console.error('Error fetching service data:', error)
  }
}

// Get service category by service name
const getServiceCategory = (serviceName) => {
  return serviceCategories.value[serviceName] || null
}

// Helper function to get service details by ID
const getServiceById = (serviceId) => {
  return servicesData.value[serviceId] || null
}

// Helper function to get service details by name
const getServiceByName = (serviceName) => {
  return Object.values(servicesData.value).find(service => service.name === serviceName) || null
}

const skipPatient = (patientId) => {
  if (currentPatient.value?.id === patientId) {
    // Add back to end of queue
    waitingQueue.value.push(currentPatient.value)
    // Re-sort to maintain date order
    sortQueueByDate()
    currentPatient.value = null
    
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

const pauseQueue = () => {
  queuePaused.value = !queuePaused.value
  
  // Update Firestore queue
  updateFirestoreQueue()
}

// Enhanced queue management methods
const sortQueueByDate = () => {
  waitingQueue.value.sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
    return dateA - dateB
  })
}

const transferPatient = (patientId, direction) => {
  const patientIndex = waitingQueue.value.findIndex(p => p.id === patientId)
  if (patientIndex === -1) return
  
  const newIndex = direction === 'up' ? Math.max(0, patientIndex - 1) : Math.min(waitingQueue.value.length - 1, patientIndex + 1)
  
  if (newIndex !== patientIndex) {
    const patient = waitingQueue.value.splice(patientIndex, 1)[0]
    waitingQueue.value.splice(newIndex, 0, patient)
    // Re-sort to maintain date order
    sortQueueByDate()
    // Update Firestore queue
    updateFirestoreQueue()
  }
}

// Firestore queue management functions
const getQueueDocRef = () => {
  const today = new Date()
  const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
  return doc(db, 'queues', `${authStore.user?.userId}_${dateString}`)
}

const updateFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    
    // Prepare current patient data
    let currentPatientData = null
    if (currentPatient.value) {
      currentPatientData = {
        id: currentPatient.value.id,
        userId: currentPatient.value.userId,
        petNames: currentPatient.value.petNames,
        Services: currentPatient.value.Services || currentPatient.value.services || [], // Store service IDs
        'Service Names': currentPatient.value['Service Names'] || currentPatient.value.serviceNames || [], // Store service names
        startTime: currentPatient.value.startTime,
        ownerName: currentPatient.value.ownerName,
        petName: currentPatient.value.petName,
        serviceName: currentPatient.value.serviceName,
        isTelehealth: currentPatient.value.isTelehealth,
        iceConfig: currentPatient.value.iceConfig,
        // Add additional fields that might be needed
        appointmentId: currentPatient.value.id,
        status: 'in-progress'
      }
    }
    
    const queueData = {
      doctorId: authStore.user?.userId,
      date: new Date(),
      currentPatient: currentPatientData,
      waitingQueue: waitingQueue.value.map(patient => ({
        id: patient.id,
        userId: patient.userId,
        petNames: patient.petNames,
        Services: patient.Services || patient.services || [], // Store service IDs
        'Service Names': patient['Service Names'] || patient.serviceNames || [], // Store service names
        date: patient.date,
        time: patient.time,
        ownerName: patient.ownerName,
        petName: patient.petName,
        serviceName: patient.serviceName,
        duration: patient.duration
      })),
      queueStatus: queuePaused.value ? 'paused' : 'active',
      lastUpdated: new Date(),
      totalPatients: waitingQueue.value.length + (currentPatient.value ? 1 : 0)
    }
    
    await setDoc(queueDocRef, queueData, { merge: true })
    console.log('Queue updated in Firestore with current patient:', currentPatientData ? 'Yes' : 'No')
    console.log('Waiting queue length:', waitingQueue.value.length)
  } catch (error) {
    console.error('Error updating Firestore queue:', error)
  }
}

const clearFirestoreQueue = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    await deleteDoc(queueDocRef)
    console.log('Queue cleared from Firestore')
  } catch (error) {
    console.error('Error clearing Firestore queue:', error)
  }
}

const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId)
    await updateDoc(appointmentRef, {
      status: status,
      lastUpdated: new Date()
    })
    console.log(`Appointment ${appointmentId} status updated to ${status}`)
  } catch (error) {
    console.error('Error updating appointment status:', error)
  }
}

const initializeQueueFromFirestore = async () => {
  try {
    const queueDocRef = getQueueDocRef()
    const queueDoc = await getDocs(query(collection(db, 'queues'), where('__name__', '==', queueDocRef.id)))
    
    if (!queueDoc.empty) {
      const queueData = queueDoc.docs[0].data()
      console.log('Found existing queue data:', queueData)
      
      // Restore current patient if exists
      if (queueData.currentPatient) {
        console.log('Restoring current patient:', queueData.currentPatient)
        currentPatient.value = {
          ...queueData.currentPatient,
          startTime: queueData.currentPatient.startTime ? new Date(queueData.currentPatient.startTime) : new Date(),
          // Handle iceConfig properly - it might be stored as a string or object
          iceConfig: queueData.currentPatient.iceConfig ? 
            (typeof queueData.currentPatient.iceConfig === 'string' ? 
              JSON.parse(queueData.currentPatient.iceConfig) : 
              queueData.currentPatient.iceConfig) : null
        }
        
        // Mark telehealth as enabled if we have a current patient with iceConfig
        if (currentPatient.value.iceConfig) {
          isTelehealthEnabled.value = true
          xirsysStatus.value = 'available'
        }
      }
      
      // Restore waiting queue
      if (queueData.waitingQueue) {
        console.log('Restoring waiting queue with', queueData.waitingQueue.length, 'patients')
        waitingQueue.value = queueData.waitingQueue.map(patient => ({
          ...patient,
          date: patient.date?.toDate ? patient.date.toDate() : new Date(patient.date)
        }))
      }
      
      // Restore queue status
      queuePaused.value = queueData.queueStatus === 'paused'
      
      console.log('Queue restored from Firestore successfully')
      console.log('Current patient:', currentPatient.value)
      console.log('Waiting queue length:', waitingQueue.value.length)
      return true
    }
    
    console.log('No existing queue found in Firestore')
    return false
  } catch (error) {
    console.error('Error initializing queue from Firestore:', error)
    return false
  }
}

const getEstimatedWaitTime = (position) => {
  if (position === 0) return 0
  
  // Get the actual duration from the appointment data
  const getServiceDuration = (patient) => {
    // Use the duration field from the appointment, or fallback to service-based estimates
    if (patient.duration) {
      return patient.duration
    }
    
    // Service-based duration estimates (in minutes)
    const serviceDurations = {
      'General Checkup': 20,
      'Vaccination': 15,
      'Emergency': 45,
      'Surgery': 120,
      'Dental': 60,
      'Grooming': 45,
      'Treatment': 30
    }
    
    const service = patient.serviceName || ''
    for (const [key, duration] of Object.entries(serviceDurations)) {
      if (service.toLowerCase().includes(key.toLowerCase())) {
        return duration
      }
    }
    
    return 30 // Default fallback
  }
  
  // Calculate total wait time based on patients ahead
  let totalWaitTime = 0
  
  // Add time for current patient if they're still consulting
  if (currentPatient.value) {
    const currentPatientDuration = getServiceDuration(currentPatient.value)
    const consultationStartTime = currentPatient.value.startTime
    const elapsedTime = consultationStartTime ? (Date.now() - new Date(consultationStartTime).getTime()) / 60000 : 0
    const remainingTime = Math.max(0, currentPatientDuration - elapsedTime)
    totalWaitTime += remainingTime
  }
  
  // Add time for patients ahead in the queue
  for (let i = 0; i < position; i++) {
    const patient = waitingQueue.value[i]
    if (patient) {
      totalWaitTime += getServiceDuration(patient)
    }
  }
  
  // Add some buffer time between patients (5 minutes)
  const bufferTime = position * 5
  totalWaitTime += bufferTime
  
  return Math.round(totalWaitTime)
}

const getEstimatedStartTime = (position) => {
  if (position === 0) return 'Immediate'
  
  const waitMinutes = getEstimatedWaitTime(position)
  const estimatedStart = new Date(currentTime.value.getTime() + (waitMinutes * 60000))
  
  return estimatedStart.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

// Format functions
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  try {
    let date
    // Handle Firebase Timestamp
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
      // Handle Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }
    
    if (isNaN(date.getTime())) return 'Invalid Time'
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch (error) {
    console.error('Error formatting time:', error, timestamp)
    return 'Invalid Time'
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    let dateObj
    
    // Handle Firebase Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate()
    } else if (date && typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp object
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date)
      return 'Invalid Date'
    }
    
    return dateObj.toLocaleDateString()
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Invalid Date'
  }
}

const formatDateTime = (date, time) => {
  if (!date) return 'N/A'
  try {
    let dateObj
    
    // Handle Firebase Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate()
    } else if (date && typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp object
      dateObj = new Date(date.seconds * 1000)
    } else {
      dateObj = new Date(date)
    }
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date object:', date)
      return 'Invalid Date'
    }
    
    const dateStr = dateObj.toLocaleDateString()
    const timeStr = time || 'No time specified'
    
    return `${dateStr} at ${timeStr}`
  } catch (error) {
    console.error('Error formatting date:', error, date)
    return 'Invalid Date'
  }
}

// Periodic queue sync to prevent data loss
const syncQueueState = async () => {
  try {
    // If we have a current patient, ensure the queue is synced
    if (currentPatient.value) {
      console.log('Syncing queue state for current patient:', currentPatient.value.id)
      await updateFirestoreQueue()
    }
  } catch (error) {
    console.error('Error syncing queue state:', error)
  }
}

// Add end-of-day cleanup
const checkEndOfDay = () => {
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  
  if (now > endOfDay) {
    // It's a new day, clear the queue
    clearFirestoreQueue()
    // Reset local state
    currentPatient.value = null
    waitingQueue.value = []
    queuePaused.value = false
  }
}

// Lifecycle
onUnmounted(() => {
  // Clear the queue from Firestore when component unmounts
  // This ensures the queue is reset for the next day
  clearFirestoreQueue()
})

// Check end of day every hour
onMounted(async () => {
  await fetchServiceData() // Fetch service categories and services
  
  // Check Xirsys availability on mount
  await checkXirsysAvailability()
  
  // Fetch appointments and restore queue state
  await fetchAppointments()
  
  // Update current time every minute to refresh wait estimates
  const timer = setInterval(() => {
    currentTime.value = new Date()
  }, 60000) // Update every minute
  
  // Check Xirsys availability every minute
  const xirsysTimer = setInterval(checkXirsysAvailability, 60000)
  
  // Sync queue state every 30 seconds to prevent data loss
  const queueSyncTimer = setInterval(syncQueueState, 30000)
  
  // Check end of day every hour
  const endOfDayTimer = setInterval(() => {
    checkEndOfDay()
  }, 3600000) // Check every hour
  
  // Cleanup timers on unmount
  onUnmounted(() => {
    clearInterval(timer)
    clearInterval(xirsysTimer) // Clear Xirsys timer
    clearInterval(queueSyncTimer) // Clear queue sync timer
    clearInterval(endOfDayTimer)
  })
})
</script>

<style scoped>
/* Add any specific styles here */
</style>
