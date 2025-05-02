<!-- views/admin/appointments/ApprovedAppointments.vue -->
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
              v-for="status in ['pending', 'processing', 'approved', 'cancelled']" 
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
          :disabled="isLoading"
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

    <!-- Table -->
    <div v-if="!initialLoading" class="border border-gray-200 rounded-lg overflow-x-auto">
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
                    v-if="appointment.clientAvatar && appointment.clientAvatar !== '/placeholder.svg?height=40&width=40'"
                    :src="appointment.clientAvatar" 
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
  
  <!-- Loading Spinner Overlay - Only show for initial loading or CSV export -->
  <LoadingSpinner v-if="isLoading || initialLoading" isOverlay :text="initialLoading ? 'Loading appointments...' : 'Processing...'" />
</template>
  
<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, onActivated, onDeactivated } from 'vue';
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon
} from 'lucide-vue-next';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import { useAppointmentStore } from '@/stores/modules/appointmentStore';
import { useProfileStore } from '@/stores/modules/profileStore';
import { usePetsStore } from '@/stores/modules/petsStore';
import { parseISO, format } from 'date-fns';

// Default photo URL for profile placeholder
const defaultPhotoURL = ref('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2236%22 height%3D%2236%22 viewBox%3D%220 0 36 36%22%3E%3Ccircle cx%3D%2218%22 cy%3D%2218%22 r%3D%2218%22 fill%3D%22%23f0f0f0%22%2F%3E%3Cpath d%3D%22M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5%22 stroke%3D%22%23bec3c9%22 stroke-width%3D%222%22 fill%3D%22none%22%2F%3E%3C%2Fsvg%3E');

// Default pet photo URL
const defaultPetPhotoURL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"%3E%3Ccircle cx="11" cy="4" r="2"/%3E%3Ccircle cx="18" cy="8" r="2"/%3E%3Ccircle cx="20" cy="16" r="2"/%3E%3Cpath d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045q-.64-2.065-2.7-2.705A3.5 3.5 0 0 1 5.5 10Z"/%3E%3C/g%3E%3C/svg%3E';

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

// Appointments data - Initialize with an empty array
const appointments = ref([]);

// Fetch appointments and user data with improved error handling
const fetchAppointments = async () => {
  initialLoading.value = true;

  try {
    await appointmentStore.fetchAppointments();
    
    // Get the appointments from the store
    const fetchedAppointments = [...appointmentStore.appointments];
    
    // Create an array to hold all the promises for data fetching
    const dataFetchPromises = [];
    
    // Process each appointment to prepare data fetching
    fetchedAppointments.forEach(appointment => {
      // Fetch client information
      if (appointment.userId && appointment.userId !== 'guest-user') {
        const clientPromise = profileStore.fetchUserProfile(appointment.userId)
          .then(userProfile => {
            if (userProfile) {
              // Update the appointment with client information
              appointment.clientName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
              appointment.clientAvatar = userProfile.photoURL || null;
              appointment.contactInformation = userProfile.phone || userProfile.email || '';
              appointment.clientEmail = userProfile.email || '';
              
              // Add additional client information
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
            // Set default client data to prevent UI issues
            appointment.clientName = 'Unknown Client';
            appointment.clientAvatar = null;
            appointment.contactInformation = 'No contact info';
            appointment.clientEmail = '';
          });
        
        dataFetchPromises.push(clientPromise);
      }
      
      // Fetch pet information if petId exists - with improved error handling
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
  fetchAppointments();
});

// Clean up when component is unmounted
onBeforeUnmount(() => {
  // Any cleanup needed
});

// Handle Vue keep-alive activation/deactivation
onActivated(() => {
  // When the component is activated (comes back into view)
  // Refresh data
  fetchAppointments(); // Always fetch fresh data when coming back to this view
});

onDeactivated(() => {
  // When the component is deactivated (hidden but kept alive)
  // Any cleanup needed
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

// Modified formatPetDetails function to only show breed and year
const formatPetDetails = (appointment) => {
  let details = [];

  // Only include breed and age years in the sidebar display
  if (appointment.petBreed) details.push(appointment.petBreed);

  // Format age - only include years
  const years = appointment.petAgeYears || 0;
  if (years > 0) details.push(`${years} year${years > 1 ? 's' : ''}`);

  return details.length > 0 ? details.join(' • ') : 'No details available';
};

// Format pet age for display
const formatPetAge = (appointment) => {
  const years = appointment.petAgeYears || 0;
  const months = appointment.petAgeMonths || 0;
  const weeks = appointment.petAgeWeeks || 0;

  const ageParts = [];
  if (years > 0) ageParts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) ageParts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (weeks > 0) ageParts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);

  return ageParts.length > 0 ? ageParts.join(', ') : 'Not provided';
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
  try {
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
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';

  try {
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
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Unknown';
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

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
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

const totalPagesComputed = computed(() => {
  if (!filteredAndSortedAppointments.value) {
    return 1;
  }

  if (itemsPerPage <= 0) {
    console.warn('itemsPerPage is set to a non-positive value. Returning 1 to avoid division by zero.');
    return 1;
  }

  if (filteredAndSortedAppointments.value.length === 0) {
    return 1;
  }

  const result = Math.ceil(filteredAndSortedAppointments.value.length / itemsPerPage);

  if (isNaN(result) || !isFinite(result)) {
    console.error('Computed value of totalPages is not a valid number. Check itemsPerPage and the length of filteredAndSortedAppointments.');
    return 1;
  }

  return result;
});

const totalPages = computed(() => {
  return totalPagesComputed.value > 0 ? totalPagesComputed.value : 1;
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
    case 'processing':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'approved':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'cancelled':
    case 'rejected':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'ended':
      return `${baseClasses} bg-slate-200 text-slate-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

// Watch for changes in the appointmentStore
watch(() => appointmentStore.appointments, (newAppointments) => {
  // When the store's appointments change, update the local appointments
  // This ensures reactivity when appointments are updated elsewhere
  if (newAppointments.length > 0) {
    // We need to merge the store data with our local data that has additional properties
    appointments.value = newAppointments.map(storeAppointment => {
      // Find the corresponding local appointment to preserve its additional properties
      const localAppointment = appointments.value.find(a => a.id === storeAppointment.id);
      
      if (localAppointment) {
        return {
          ...storeAppointment,
          // Preserve local-only properties
          clientName: localAppointment.clientName,
          clientAvatar: localAppointment.clientAvatar,
          clientEmail: localAppointment.clientEmail,
          contactInformation: localAppointment.contactInformation,
          petPhotoURL: localAppointment.petPhotoURL,
          petSpecies: localAppointment.petSpecies,
          petBreed: localAppointment.petBreed,
          petGender: localAppointment.petGender,
          petWeight: localAppointment.petWeight,
          petAgeYears: localAppointment.petAgeYears,
          petAgeMonths: localAppointment.petAgeMonths,
          petAgeWeeks: localAppointment.petAgeWeeks,
          // Preserve additional client information
          firstName: localAppointment.firstName,
          lastName: localAppointment.lastName,
          dateOfBirth: localAppointment.dateOfBirth,
          age: localAppointment.age,
          gender: localAppointment.gender,
          streetAddress: localAppointment.streetAddress,
        };
      }
      
      return storeAppointment;
    });
  }
}, { deep: true });

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
        appointment.serviceNames?.join('; ') || '',
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