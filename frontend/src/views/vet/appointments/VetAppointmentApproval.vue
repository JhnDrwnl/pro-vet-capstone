<!-- views/vet/appointments/ApprovedAppointments.vue -->
<template>
  <div class="bg-white p-6 rounded-2xl">
    <!-- Header Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-medium text-gray-900">Appointment Approval</h2>
      <p class="text-gray-500 mt-1">Manage and approve veterinary appointments.</p>
    </div>

    <!-- Search and Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="relative flex-1 sm:flex-none">
          <input 
            v-model="search" 
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
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
          <!-- Filter Dropdown - Status Only -->
          <div v-if="showFilters" class="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
            <div class="px-4 py-2 text-sm font-medium text-gray-700">Filter by Status:</div>
            <button 
              @click="toggleStatusFilter('All')"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              :class="{ 'text-[#0066FF]': filters.status === '' }"
            >
              All Statuses
            </button>
            <button 
              v-for="status in ['pending', 'approved', 'cancelled']" 
              :key="status"
              @click="toggleStatusFilter(status)"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 capitalize"
              :class="{ 'text-[#0066FF]': filters.status === status }"
            >
              {{ status }}
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

    <!-- Active Filters Display - Status Only -->
    <div v-if="filters.status" class="mb-4 flex flex-wrap gap-2">
      <div class="text-sm text-gray-500 py-1">Active filters:</div>
      
      <div class="inline-flex items-center gap-1 px-3 py-1 bg-[#EBF5FF] text-[#0066FF] rounded-full text-xs capitalize">
        <span>{{ filters.status }}</span>
        <button @click="clearStatusFilter" class="text-[#0066FF] hover:text-blue-700">
          <XIcon class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="initialLoading" class="py-20 flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p class="mt-4 text-gray-500">Loading appointments...</p>
    </div>

    <!-- Table -->
    <div v-else class="border border-gray-200 rounded-lg overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th v-for="header in headers" :key="header.key" 
                @click="sortBy(header.key)"
                class="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer whitespace-nowrap">
              <div class="flex items-center">
                {{ header.label }}
                <div class="flex flex-col ml-1">
                  <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'asc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'asc') }">▲</span>
                  <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === header.key && sortOrder === 'desc', 'text-gray-400': !(sortKey === header.key && sortOrder === 'desc') }">▼</span>
                </div>
              </div>
            </th>
            <th class="px-6 py-4 text-right text-sm font-medium text-gray-500 whitespace-nowrap">
              Actions
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
                    v-if="appointment.clientAvatar && appointment.clientAvatar !== '/placeholder.svg?height=40&width=40'"
                    :src="appointment.clientAvatar" 
                    class="w-full h-full object-cover"
                    alt=""
                    @error="onImageError"
                  />
                  <img 
                    v-else
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' fill='%23f0f2f5'/%3E%3Cpath d='M18 20.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5' stroke='%23bec3c9' strokeWidth='2' fill='none'/%3E%3C/svg%3E"
                    class="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900">{{ appointment.clientName || 'Unknown Client' }}</span>
                    <span class="text-xs text-gray-500">(Owner)</span>
                  </div>
                  <div v-if="appointment.clientEmail" class="text-xs text-gray-500 mt-0.5">
                    {{ appointment.clientEmail }}
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
              <span class="text-sm text-gray-900">{{ appointment.doctorName }}</span>
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
                <!-- Show cancellation reason if status is cancelled -->
                <div v-if="appointment.status === 'cancelled' && appointment.cancellationReason" 
                     class="mt-1 text-xs text-gray-500 max-w-[200px] truncate" 
                     :title="appointment.cancellationReason">
                  Reason: {{ appointment.cancellationReason }}
                </div>
                <!-- Show who cancelled it -->
                <div v-if="appointment.status === 'cancelled' && appointment.cancelledBy" 
                     class="mt-1 text-xs text-gray-500">
                  By: {{ appointment.cancelledBy === 'user' ? 'Client' : 'Vet' }}
                </div>
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
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="flex justify-end gap-2">
                <!-- Approve button - only for pending appointments -->
                <button 
                  v-if="appointment.status === 'pending'"
                  @click="approveAppointment(appointment)"
                  class="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors duration-200"
                  title="Approve Appointment"
                >
                  <CheckIcon class="w-4 h-4" />
                </button>
                <!-- Cancel button - for both pending and approved appointments -->
                <button 
                  v-if="appointment.status === 'pending' || appointment.status === 'approved'"
                  @click="confirmCancel(appointment)"
                  class="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors duration-200"
                  title="Cancel Appointment"
                >
                  <XIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          
          <!-- Empty state -->
          <tr v-if="paginatedAppointments.length === 0">
            <td colspan="12" class="py-8 text-center">
              <div class="flex flex-col items-center justify-center">
                <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CalendarIcon class="w-8 h-8 text-gray-300" />
                </div>
                <p class="text-gray-500 font-medium">No appointments found</p>
                <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!initialLoading && filteredAndSortedAppointments.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
      <div class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAndSortedAppointments.length }} entries
      </div>
      <div class="flex gap-2">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
          :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-2 py-1 sm:px-3 sm:py-1 border rounded-full text-xs sm:text-sm"
          :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'"
        >
          Next
        </button>
      </div>
    </div>
  </div>

  <!-- Loading Spinner Overlay - Show for operations -->
  <LoadingSpinner v-if="isLoading" isOverlay text="Processing..." />

  <!-- Confirmation Modal -->
  <div 
    v-if="showCancelModal" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
      <div class="flex flex-col items-center text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangleIcon class="w-6 h-6 text-red-600" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h2>
        <p class="text-gray-600 mb-4">
          Are you sure you want to cancel this appointment on 
          <span class="font-medium">{{ selectedAppointment ? formatDate(selectedAppointment.date) : '' }}</span> 
          at <span class="font-medium">{{ selectedAppointment ? selectedAppointment.time : '' }}</span>?
        </p>
        
        <!-- Cancellation Reason Input -->
        <div class="w-full mb-4">
          <label for="cancellation-reason" class="block text-left text-sm font-medium text-gray-700 mb-1">
            Please provide a reason for cancellation:
          </label>
          <textarea
            id="cancellation-reason"
            v-model="cancellationReason"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            placeholder="Enter your reason for cancelling this appointment..."
            required
          ></textarea>
          <p v-if="reasonError" class="mt-1 text-left text-xs text-red-600">
            {{ reasonError }}
          </p>
        </div>
        
        <div class="flex space-x-3 w-full">
          <button 
            @click="closeCancelModal" 
            class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
          >
            No, Keep It
          </button>
          <button 
            @click="cancelAppointment" 
            :disabled="cancelLoading || !cancellationReason.trim()"
            class="flex-1 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="cancelLoading">Cancelling...</span>
            <span v-else>Yes, Cancel</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import { usePetsStore } from '@/stores/modules/petsStore';
import { parseISO, format } from 'date-fns';

const appointmentStore = useAppointmentStore();
const profileStore = useProfileStore();
const petsStore = usePetsStore();

const headers = [
  { key: 'clientName', label: 'Client' },
  { key: 'contactInformation', label: 'Contact' },
  { key: 'petName', label: 'Pet' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'doctorName', label: 'Doctor' },
  { key: 'services', label: 'Services' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' }
];

// Default pet photo URL
const defaultPetPhotoURL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik04LjM1IDNjMS4xOC0uMTcgMi40MyAxLjEyIDIuNzkgMi45Yy4zNiAxLjc3LS4yOSAzLjM1LTEuNDcgMy41M2MtMS4xNy4xOC0yLjQzLTEuMTEtMi44LTIuODljLS4zNy0xLjc3LjMtMy4zNSAxLjQ4LTMuNTRtNy4xNSAwYzEuMTkuMTkgMS44NSAxLjc3IDEuNSAzLjU0Yy0uMzggMS43OC0xLjYzIDMuMDctMi44MSAyLjg5Yy0xLjE5LS4xOC0xLjg0LTEuNzYtMS40Ny0zLjUzYy4zNi0xLjc4IDEuNjEtMy4wNyAyLjc4LTIuOU0zIDcuNmMxLjE0LS40OSAyLjY5LjQgMy41IDEuOTVjLjc2IDEuNTguNSAzLjI0LS42MyAzLjczcy0yLjY3LS4zOS0zLjQ2LTEuOTZTMS45IDguMDggMyA3LjZtMTggMGMxLjEuNDggMS4zOCAyLjE1LjU5IDMuNzJzLTIuMzMgMi44NS0zLjQ2IDEuOTZzLTEuMzktMi4xNS0uNjMtMy43M0MxOC4zMSA4IDE5Ljg2IDcuMTEgMjEgNy42bS0xLjY3IDEwLjc4Yy4wNC45NC0uNjggMS45OC0xLjU0IDIuMzdjLTEuNzkuODItMy45MS0uODgtNS45LS44OHMtNC4xMyAxLjc3LTUuODkgLjg4Yy0xLS40OS0xLjY5LTEuNzktMS41Ni0yLjg3Yy4xOC0xLjQ5IDEuOTctMi4yOSAzLjAzLTMuMzhjMS40MS0xLjQxIDIuNDEtNC4wNiA0LjQyLTQuMDZjMiAwIDMuMDYgMi42MSA0LjQxIDQuMDZjMS4xMSAxLjIyIDIuOTYgMi4yNSAzLjAzIDMuODgiLz48L3N2Zz4=';

// State variables
const search = ref('');
const sortKey = ref('date');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = 10;
const showFilters = ref(false);
const filters = ref({
  status: '',
});

// Loading states
const isLoading = ref(false);
const initialLoading = ref(true);

// Cancel modal state
const showCancelModal = ref(false);
const selectedAppointment = ref(null);
const cancellationReason = ref('');
const reasonError = ref('');
const cancelLoading = ref(false);

// Appointments data - Initialize with an empty array
const appointments = ref([]);

// Fetch appointments and user data
const fetchAppointments = async () => {
  initialLoading.value = true;

  try {
    await appointmentStore.fetchAppointments();
    
    // After fetching appointments, fetch client information for each appointment
    // Update the appointments ref with the fetched data
    appointments.value = [...appointmentStore.appointments];

    for (const appointment of appointments.value) {
      // Fetch client information
      if (appointment.userId && appointment.userId !== 'guest-user') {
        try {
          const userProfile = await profileStore.fetchUserProfile(appointment.userId);
          if (userProfile) {
            // Update the appointment with client information
            appointment.clientName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
            appointment.clientAvatar = userProfile.photoURL || null;
            appointment.contactInformation = userProfile.phone || userProfile.email || '';
            appointment.clientEmail = userProfile.email || '';
          }
        } catch (error) {
          console.error(`Error fetching user profile for appointment ${appointment.id}:`, error);
        }
      }
      
      // Fetch pet information if petId exists
      if (appointment.petId) {
        try {
          const petData = await petsStore.getPetById(appointment.userId, appointment.petId);
          if (petData) {
            appointment.petPhotoURL = petData.photoURL || null;
            // We still store these details for CSV export, but don't display them in the UI
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
        } catch (error) {
          console.error(`Error fetching pet data for appointment ${appointment.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
  } finally {
    initialLoading.value = false;
  }
};

// Initialize component
onMounted(() => {
  fetchAppointments();
});

// Toggle filters visibility
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

// Status filter functions
const toggleStatusFilter = (status) => {
  if (status === 'All') {
    filters.value.status = '';
  } else {
    filters.value.status = status;
  }
  showFilters.value = false;
  currentPage.value = 1;
};

const clearStatusFilter = () => {
  filters.value.status = '';
  currentPage.value = 1;
};

const formatPetDetails = (appointment) => {
  let details = [];
  if (appointment.petSpecies) details.push(appointment.petSpecies);
  if (appointment.petBreed) details.push(appointment.petBreed);

  // Format age
  const years = appointment.petAgeYears || 0;
  const months = appointment.petAgeMonths || 0;
  const weeks = appointment.petAgeWeeks || 0;

  const ageParts = [];
  if (years > 0) ageParts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) ageParts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (weeks > 0) ageParts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);

  if (ageParts.length > 0) details.push(ageParts.join(', '));
  if (appointment.petWeight) details.push(`${appointment.petWeight} kg`);
  if (appointment.petGender) details.push(formatGender(appointment.petGender));

  return details.length > 0 ? details.join(' • ') : 'No details available';
};

const formatGender = (gender) => {
  if (gender === 'male') return 'Male';
  if (gender === 'female') return 'Female';
  if (gender === 'unknown') return 'Unknown';
  return gender;
};

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
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
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
  event.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' fill='%23f0f2f%20width='36'%20height='36'%20viewBox='0%200%2036%2036'%3E%3Crect%20width='36'%20height='36'%20fill='%23f0f2f5'/%3E%3Cpath%20d='M18%2020.5a5.5%205.5%200%201%200%200-11a5.5%205.5%200%200%200%200%2011ZM8%2028.5c0-2.5%205-5%2010-5s10%202.5%2010%205'%20stroke='%23bec3c9'%20strokeWidth='2'%20fill='none'/%3E%3C/svg%3E";
};

const onPetImageError = (event) => {
  event.target.src = defaultPetPhotoURL;
};

// Fix for duplicate data - use a Set to track unique appointment IDs
const filteredAndSortedAppointments = computed(() => {
  // Create a Map to store unique appointments by ID
  const uniqueAppointments = new Map();

  // Process each appointment
  appointments.value.forEach(appointment => {
    // Check if it matches the search and filter criteria
    const matchesSearch =
      (appointment.clientName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
      (appointment.clientEmail?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
      (appointment.petName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
      (appointment.petSpecies?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
      (appointment.doctorName?.toLowerCase() || '').includes(search.value.toLowerCase()) ||
      (appointment.contactInformation?.toLowerCase() || '').includes(search.value.toLowerCase());

    const matchesStatus = filters.value.status === '' || appointment.status === filters.value.status;

    // Only add to the map if it matches criteria and isn't already there
    if (matchesSearch && matchesStatus) {
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

const totalPages = computed(() => Math.ceil(filteredAndSortedAppointments.value.length / itemsPerPage));

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
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'cancelled':
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// Approve appointment
const approveAppointment = async (appointment) => {
  isLoading.value = true;
  
  try {
    await appointmentStore.updateAppointmentStatus(appointment.id, 'approved');
    
    // Update local state
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index].status = 'approved';
      appointments.value[index].updatedAt = new Date();
    }
  } catch (error) {
    console.error('Error approving appointment:', error);
  } finally {
    isLoading.value = false;
  }
};

// Cancel appointment functions
const confirmCancel = (appointment) => {
  selectedAppointment.value = appointment;
  cancellationReason.value = '';
  reasonError.value = '';
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  selectedAppointment.value = null;
  cancellationReason.value = '';
  reasonError.value = '';
};

const cancelAppointment = async () => {
  if (!selectedAppointment.value) return;
  
  // Validate reason
  if (!cancellationReason.value.trim()) {
    reasonError.value = 'Please provide a reason for cancellation';
    return;
  }
  
  cancelLoading.value = true;
  
  try {
    // Update the appointment status to cancelled with reason
    await appointmentStore.updateAppointment(
      selectedAppointment.value.id, 
      {
        status: 'cancelled',
        cancellationReason: cancellationReason.value.trim(),
        cancelledBy: 'vet',
        cancelledAt: new Date()
      }
    );
    
    // Update the local state
    const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
    if (index !== -1) {
      appointments.value[index].status = 'cancelled';
      appointments.value[index].cancellationReason = cancellationReason.value.trim();
      appointments.value[index].cancelledBy = 'vet';
      appointments.value[index].cancelledAt = new Date();
    }
    
    // Close the modal
    closeCancelModal();
  } catch (err) {
    console.error('Error cancelling appointment:', err);
  } finally {
    cancelLoading.value = false;
  }
};

const exportToCSV = () => {
  isLoading.value = true;

  setTimeout(() => {
    const csvHeaders = [
      'Client Name',
      'Client Email',
      'Contact',
      'Pet Name',
      'Pet Species',
      'Pet Details',
      'Date',
      'Time',
      'Doctor',
      'Services',
      'Status',
      'Cancellation Reason',
      'Cancelled By',
      'Created',
      'Updated',
    ];
    const csvContent = [
      csvHeaders.join(','),
      ...filteredAndSortedAppointments.value.map(appointment => [
        appointment.clientName || 'Unknown Client',
        appointment.clientEmail || '',
        appointment.contactInformation || '',
        appointment.petName || '',
        appointment.petSpecies || '',
        formatPetDetails(appointment),
        formatDate(appointment.date),
        appointment.time,
        appointment.doctorName,
        appointment.serviceNames.join('; '),
        appointment.status,
        appointment.cancellationReason || '',
        appointment.cancelledBy || '',
        formatDateTime(appointment.createdAt),
        formatDateTime(appointment.updatedAt), // Updated to show date and time
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'veterinary-appointments.csv';
    link.click();

    isLoading.value = false;
  }, 1000);
};
</script>

<style scoped>
.divide-y > :not([hidden]) ~ :not([hidden]) {
  --tw-divide-opacity: 1;
  border-color: rgb(229 231 235 / var(--tw-divide-opacity));
}

@media (max-width: 640px) {
  table {
    font-size: 0.875rem;
  }
}
</style>