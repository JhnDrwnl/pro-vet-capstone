<template>
    <div class="bg-white p-6">
      <!-- Header Section -->
      <div class="mb-6">
        <h2 class="text-2xl font-medium text-gray-900">Appointment Approval</h2>
        <p class="text-gray-500 mt-1">Manage and approve veterinary appointments.</p>
      </div>
  
      <!-- Search and Actions -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <div class="relative">
            <input 
              v-model="search" 
              class="w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
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
            <div v-if="showFilters" class="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select v-model="filters.type" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select v-model="filters.urgencyLevel" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>
              <button 
                @click="applyFilters"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="exportToCSV"
            class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            <DownloadIcon class="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
  
      <!-- Table -->
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th v-for="header in headers" :key="header.key" 
                  @click="sortBy(header.key)"
                  class="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer">
                {{ header.label }}
                <span v-if="sortKey === header.key" class="ml-1 text-gray-400">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="appointment in paginatedAppointments" :key="appointment.id" 
                class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img 
                    :src="appointment.clientAvatar || '/placeholder.svg?height=40&width=40'" 
                    class="w-8 h-8 rounded-full mr-3"
                    alt=""
                  />
                  <span class="text-sm font-medium text-gray-900">{{ appointment.clientName }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ appointment.contactInformation }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-900">{{ formatPetDetails(appointment.petDetails) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ formatDateTime(appointment.appointmentDateTime) }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-900 truncate block max-w-xs">{{ appointment.reasonForVisit }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getAppointmentTypeClass(appointment.type)">
                  {{ appointment.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getUrgencyClass(appointment.urgencyLevel)">
                  {{ appointment.urgencyLevel }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(appointment.status)">
                  {{ appointment.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <button 
                  v-if="appointment.status === 'Pending'"
                  @click="approveAppointment(appointment)" 
                  class="text-green-600 hover:text-green-800 p-1 inline-flex items-center mr-2"
                >
                  <CheckIcon class="w-5 h-5" />
                </button>
                <button 
                  v-if="appointment.status === 'Pending'"
                  @click="openActionModal(appointment, 'cancel')" 
                  class="text-red-600 hover:text-red-800 p-1 inline-flex items-center mr-2"
                >
                  <XIcon class="w-5 h-5" />
                </button>
                <button 
                  @click="openActionModal(appointment, 'reschedule')" 
                  class="text-blue-600 hover:text-blue-800 p-1 inline-flex items-center"
                >
                  <CalendarIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredAndSortedAppointments.length }} entries
        </div>
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-2 py-1 border rounded-full text-sm"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-50'"
          >
            Previous
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-2 py-1 border rounded-full text-sm"
            :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-50'"
          >
            Next
          </button>
        </div>
      </div>
  
      <!-- Action Modal (Cancel/Reschedule) -->
      <div v-if="showActionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">
            {{ actionType === 'cancel' ? 'Cancel Appointment' : 'Reschedule Appointment' }}
          </h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              v-model="actionReason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :placeholder="actionType === 'cancel' ? 'Enter cancellation reason' : 'Enter rescheduling reason'"
            ></textarea>
          </div>
          <div v-if="actionType === 'reschedule'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">New Date & Time</label>
            <input
              v-model="newAppointmentDateTime"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="flex justify-end gap-2">
            <button
              @click="closeActionModal"
              class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              @click="confirmAction"
              class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { 
    Search as SearchIcon,
    Filter as FilterIcon,
    Download as DownloadIcon,
    Check as CheckIcon,
    X as XIcon,
    Calendar as CalendarIcon
  } from 'lucide-vue-next';
  
  const headers = [
    { key: 'clientName', label: 'Client' },
    { key: 'contactInformation', label: 'Contact' },
    { key: 'petDetails', label: 'Pet Details' },
    { key: 'appointmentDateTime', label: 'Date & Time' },
    { key: 'reasonForVisit', label: 'Reason' },
    { key: 'type', label: 'Type' },
    { key: 'urgencyLevel', label: 'Urgency' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];
  
  const appointments = ref([
    {
      id: 1,
      clientName: 'John Doe',
      clientAvatar: '/placeholder.svg?height=40&width=40',
      contactInformation: '123-456-7890',
      petDetails: {
        name: 'Max',
        species: 'Dog',
        breed: 'Labrador',
        age: '5 years'
      },
      appointmentDateTime: '2023-05-15T14:30:00',
      reasonForVisit: 'Limping after playing',
      type: 'Walk-in',
      urgencyLevel: 'Medium',
      status: 'Pending'
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      clientAvatar: '/placeholder.svg?height=40&width=40',
      contactInformation: '987-654-3210',
      petDetails: {
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Siamese',
        age: '3 years'
      },
      appointmentDateTime: '2023-05-16T10:00:00',
      reasonForVisit: 'Annual check-up',
      type: 'Online',
      urgencyLevel: 'Low',
      status: 'Approved'
    }
  ]);
  
  const search = ref('');
  const sortKey = ref('appointmentDateTime');
  const sortOrder = ref('asc');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const showFilters = ref(false);
  const filters = ref({
    type: '',
    urgencyLevel: '',
    status: ''
  });
  
  const showActionModal = ref(false);
  const actionType = ref('');
  const actionReason = ref('');
  const newAppointmentDateTime = ref('');
  const selectedAppointment = ref(null);
  
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };
  
  const formatPetDetails = (petDetails) => {
    return `${petDetails.name} (${petDetails.species}, ${petDetails.age})`;
  };
  
  const sortBy = (key) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
  };
  
  const filteredAndSortedAppointments = computed(() => {
    let filtered = appointments.value.filter(appointment => 
      (appointment.clientName.toLowerCase().includes(search.value.toLowerCase()) ||
       appointment.petDetails.name.toLowerCase().includes(search.value.toLowerCase())) &&
      (filters.value.type === '' || appointment.type === filters.value.type) &&
      (filters.value.urgencyLevel === '' || appointment.urgencyLevel === filters.value.urgencyLevel) &&
      (filters.value.status === '' || appointment.status === filters.value.status)
    );
  
    return filtered.sort((a, b) => {
      let aValue = a[sortKey.value];
      let bValue = b[sortKey.value];
  
      if (sortKey.value === 'petDetails') {
        aValue = a.petDetails.name;
        bValue = b.petDetails.name;
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
  
  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };
  
  const getAppointmentTypeClass = (type) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    return type === 'Online'
      ? `${baseClasses} bg-blue-100 text-blue-800`
      : `${baseClasses} bg-purple-100 text-purple-800`;
  };
  
  const getUrgencyClass = (urgency) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (urgency.toLowerCase()) {
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'emergency':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
  
  const getStatusClass = (status) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'rescheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };
  
  const approveAppointment = (appointment) => {
    const index = appointments.value.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments.value[index] = { ...appointments.value[index], status: 'Approved' };
    }
  };
  
  const openActionModal = (appointment, action) => {
    selectedAppointment.value = appointment;
    actionType.value = action;
    showActionModal.value = true;
    actionReason.value = '';
    if (action === 'reschedule') {
      newAppointmentDateTime.value = appointment.appointmentDateTime;
    }
  };
  
  const closeActionModal = () => {
    showActionModal.value = false;
    selectedAppointment.value = null;
    actionType.value = '';
    actionReason.value = '';
    newAppointmentDateTime.value = '';
  };
  
  const confirmAction = () => {
    if (!selectedAppointment.value) return;
  
    const index = appointments.value.findIndex(a => a.id === selectedAppointment.value.id);
    if (index !== -1) {
      if (actionType.value === 'cancel') {
        appointments.value[index] = { 
          ...appointments.value[index], 
          status: 'Cancelled',
          cancellationReason: actionReason.value
        };
      } else if (actionType.value === 'reschedule') {
        appointments.value[index] = { 
          ...appointments.value[index], 
          status: 'Rescheduled',
          appointmentDateTime: newAppointmentDateTime.value,
          reschedulingReason: actionReason.value
        };
      }
    }
  
    closeActionModal();
  };
  
  const exportToCSV = () => {
    const headers = ['Client Name', 'Contact', 'Pet Details', 'Date & Time', 'Reason', 'Type', 'Urgency', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedAppointments.value.map(appointment => [
        appointment.clientName,
        appointment.contactInformation,
        formatPetDetails(appointment.petDetails),
        formatDateTime(appointment.appointmentDateTime),
        appointment.reasonForVisit,
        appointment.type,
        appointment.urgencyLevel,
        appointment.status
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'veterinary-appointments.csv';
    link.click();
  };
  
  const applyFilters = () => {
    currentPage.value = 1;
    showFilters.value = false;
  };
  </script>
  
  <style scoped>
  .divide-y > :not([hidden]) ~ :not([hidden]) {
    --tw-divide-opacity: 1;
    border-color: rgb(229 231 235 / var(--tw-divide-opacity));
  }
  
  @media (max-width: 640px) {
    .overflow-x-auto {
      margin: 0 -1.5rem;
    }
    
    table {
      font-size: 0.875rem;
    }
  }
  </style>