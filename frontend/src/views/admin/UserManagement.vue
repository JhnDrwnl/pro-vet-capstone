<!-- views/admin/UserManagement.vue -->
<template>
  <div class="p-6 bg-white rounded-2xl">
  <!-- Header Section -->
  <div class="mb-8">
    <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
    <p class="text-gray-500 mt-1">Create, update, deactivate or delete user accounts for veterinarians and pet owners.</p>
  </div>
  
  <!-- Show loading spinner during initial data load -->
  <LoadingSpinner v-if="initialLoading" isOverlay text="Loading data..." />
  
  <!-- Only show content when data is loaded -->
  <div v-if="!initialLoading">
    <div v-if="error" class="text-center py-4 text-red-600">
      <p>Error: {{ error }}</p>
    </div>
  
    <div v-else>
      <!-- Search, Filter, and Add User -->
      <div v-if="!showForm" class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div class="flex gap-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Search users..."
              v-model="searchQuery"
              class="w-full sm:w-[300px] pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
            <SearchIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div class="relative">
            <button 
              class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              @click="toggleFilters"
            >
              <FilterIcon class="w-5 h-5 text-gray-500" />
            </button>
            <!-- Filter Dropdown -->
            <div v-if="showFilters" class="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <div class="px-4 py-2 text-sm font-medium text-gray-700">Filter by:</div>
              <button 
                v-for="filter in filters" 
                :key="filter"
                @click="toggleFilter(filter)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                :class="{'text-blue-600': isFilterActive(filter)}"
              >
                {{ filter }}
              </button>
            </div>
          </div>
        </div>
        <div>
          <button 
            @click="openAddUserForm"
            class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 w-full sm:w-auto justify-center"
          >
            <PlusCircle class="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>
  
      <!-- Table -->
      <div v-if="!showForm" class="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100">
            <tr class="border-b border-gray-200">
              <th 
                @click="sortBy('name')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Name
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'name' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'name' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'name' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'name' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th 
                @click="sortBy('email')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Email
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'email' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'email' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'email' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'email' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th 
                @click="sortBy('role')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Role
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'role' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'role' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'role' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'role' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th 
                @click="sortBy('status')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Status
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'status' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'status' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'status' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'status' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th 
                @click="sortBy('createdAt')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Created
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'createdAt' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'createdAt' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'createdAt' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'createdAt' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th 
                @click="sortBy('updatedAt')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Updated
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'updatedAt' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'updatedAt' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'updatedAt' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'updatedAt' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th 
                @click="sortBy('lastSignInTime')"
                class="text-left py-4 px-6 text-sm font-medium text-gray-500 cursor-pointer"
              >
                <div class="flex items-center">
                  Last Sign In
                  <div class="flex flex-col ml-1">
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'lastSignInTime' && sortOrder === 'asc', 'text-gray-400': !(sortKey === 'lastSignInTime' && sortOrder === 'asc') }">▲</span>
                    <span class="text-[10px] leading-none" :class="{ 'text-gray-800': sortKey === 'lastSignInTime' && sortOrder === 'desc', 'text-gray-400': !(sortKey === 'lastSignInTime' && sortOrder === 'desc') }">▼</span>
                  </div>
                </div>
              </th>
              <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in sortedUsers" :key="user.userId" class="border-b border-gray-200 last:border-b-0">
              <td class="py-4 px-6">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="py-4 px-6">
                <div class="flex items-center">
                  <!-- Provider Icons - Moved to appear before the email -->
                  <div v-if="user.providerData && user.providerData.length > 0" class="mr-2 flex">
                    <div v-for="provider in user.providerData" :key="provider.providerId" class="mr-1">
                      <!-- Google Provider -->
                      <div v-if="provider.providerId === 'google.com'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <!-- Facebook Provider -->
                      <div v-else-if="provider.providerId === 'facebook.com'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <!-- Email/Password Provider -->
                      <div v-else-if="provider.providerId === 'password'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#757575" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <!-- Phone Provider -->
                      <div v-else-if="provider.providerId === 'phone'" 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#4CAF50" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                      </div>
                      <!-- Other Providers -->
                      <div v-else 
                           class="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="#9E9E9E" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span>{{ user.email }}</span>
                </div>
              </td>
              <td class="py-4 px-6">{{ user.role }}</td>
              <td class="py-4 px-6">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': user.status?.toLowerCase() === 'active',
                    'bg-red-100 text-red-800': user.status?.toLowerCase() === 'inactive',
                    'bg-yellow-100 text-yellow-800': user.status?.toLowerCase() === 'pending'
                  }" 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-sm text-gray-600">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="py-4 px-6 text-sm text-gray-600">
                {{ formatDate(user.updatedAt) }}
              </td>
              <td class="py-4 px-6 text-sm text-gray-600">
                <span v-if="user.lastSignInTime">
                  {{ formatDate(user.lastSignInTime) }}
                </span>
                <span v-else class="text-gray-400">Never</span>
              </td>
              <td class="py-4 px-6">
                <div class="flex gap-2">
                  <button 
                    @click="editUser(user)"
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <LucideEdit class="w-5 h-5" />
                  </button>
                  <button 
                    @click="openStatusModal(user)"
                    class="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <PowerIcon class="w-5 h-5" />
                  </button>
                  <button 
                    @click="confirmDeleteUser(user)"
                    class="p-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
            <!-- Empty state with placeholder icon -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="py-8 text-center text-gray-500">
                <UserIcon class="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No users available yet.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Inline Add/Edit User Form -->
      <div v-if="showForm && !showVerificationForm" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
        
        <!-- Show pending status notice if editing a pending user -->
        <div v-if="editingUser && editingUser.status?.toLowerCase() === 'pending'" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start">
            <AlertTriangleIcon class="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 class="text-sm font-medium text-yellow-800">Pending Verification</h3>
              <p class="mt-1 text-sm text-yellow-700">
                This user account is pending email verification. You can update their details and then verify their email.
              </p>
              <button 
                @click="sendVerificationForPendingUser"
                class="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 text-sm"
              >
                Send Verification Email
              </button>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name <span class="text-red-500">*</span></label>
              <input
                type="text"
                v-model="userForm.firstName"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                v-model="userForm.lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input
              type="email"
              v-model="userForm.email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
          </div>
          <!-- Show password field for new users or pending users -->
          <div v-if="!editingUser || (editingUser && editingUser.status?.toLowerCase() === 'pending')">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password <span class="text-red-500">*</span>
              <span v-if="editingUser && editingUser.status?.toLowerCase() === 'pending'" class="text-xs text-gray-500 ml-1">
                (Required for verification)
              </span>
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="userForm.password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showPassword" class="w-4 h-4" />
                <EyeOffIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
            <select
              v-model="userForm.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="Veterinarian">Veterinarian</option>
              <option value="Pet Owner">Pet Owner</option>
            </select>
          </div>
          
          <!-- Email verification option for new users -->
          <div v-if="!editingUser" class="flex items-center">
            <input
              type="checkbox"
              id="sendVerification"
              v-model="sendVerificationEmail"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:outline-none"
            >
            <label for="sendVerification" class="ml-2 text-sm text-gray-600">
              Send email verification to user
            </label>
          </div>
          
          <div class="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              @click="closeForm"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 order-1 sm:order-2"
              :disabled="loading"
            >
              {{ editingUser ? 'Save Changes' : 'Add User' }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Email Verification Form -->
      <div v-if="showVerificationForm" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold mb-4">Verify Email</h2>
        <div class="text-center mb-6">
          <p class="text-gray-600">
            A verification code has been sent to <span class="font-semibold">{{ userForm.email }}</span>.
            Please enter the code below to verify the email address.
          </p>
        </div>
        
        <!-- OTP Input Fields -->
        <div class="flex justify-center gap-2 mb-6">
          <input
            v-for="(_, index) in 6"
            :key="index"
            type="text"
            maxlength="1"
            v-model="otpDigits[index]"
            @input="handleOtpInput($event, index)"
            @keydown="handleKeydown($event, index)"
            @paste="handlePaste"
            class="w-10 h-12 sm:w-12 text-center text-xl font-semibold rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            :class="{ 'border-red-500': verificationError }"
            ref="otpInputs"
          />
        </div>
        
        <div v-if="verificationError" class="text-red-600 text-sm text-center mb-4">
          {{ verificationError }}
        </div>
        
        <div class="flex justify-center mb-4">
          <button 
            @click="verifyOTP"
            :disabled="verifying || !isOtpComplete"
            class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            {{ verifying ? 'Verifying...' : 'Verify Email' }}
          </button>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button 
            @click="resendVerificationCode"
            :disabled="resendTimer > 0"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none disabled:opacity-50"
          >
            {{ resendTimer > 0 ? `Resend code in ${formatTime(resendTimer)}` : 'Resend code' }}
          </button>
        </div>
        
        <div class="mt-6 flex justify-center">
          <button
            @click="cancelVerification"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Status Change Confirmation Modal -->
  <div v-if="showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
        <AlertTriangleIcon class="h-6 w-6 text-blue-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Change User Status</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        Are you sure you want to {{ selectedUser?.status?.toLowerCase() === 'active' ? 'deactivate' : 'activate' }} 
        <span class="font-semibold">{{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</span>? 
        {{ selectedUser?.status?.toLowerCase() === 'active' ? 
          'This will prevent the user from accessing the system.' : 
          'This will allow the user to access the system again.' }}
      </p>
      <div class="flex justify-center gap-3">
        <button 
          @click="closeStatusModal" 
          class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="confirmToggleUserStatus" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white"
          :class="selectedUser?.status?.toLowerCase() === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
          :disabled="loading"
        >
          {{ selectedUser?.status?.toLowerCase() === 'active' ? 'Deactivate' : 'Activate' }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Delete Confirmation Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
        <AlertTriangleIcon class="h-6 w-6 text-red-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">{{ modalTitle }}</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ modalMessage }}
      </p>
      <div class="flex justify-center gap-3">
        <button 
          @click="showModal = false" 
          class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="confirmAction" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          :disabled="loading"
        >
          {{ modalAction === 'delete' ? 'Delete' : modalAction === 'restore' ? 'Restore' : 'Delete Permanently' }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Success Modal -->
  <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
        <CheckCircleIcon class="h-6 w-6 text-green-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Success</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ statusMessage }}
      </p>
      <div class="flex justify-center">
        <button 
          @click="showSuccessModal = false" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
  
  <!-- Error Modal -->
  <div v-if="showErrorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
        <XCircleIcon class="h-6 w-6 text-red-600" />
      </div>
      <h3 class="text-lg font-medium text-center text-gray-900 mb-2">Error</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        {{ statusMessage }}
      </p>
      <div class="flex justify-center">
        <button 
          @click="showErrorModal = false" 
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
  
  <!-- Loading Spinner for operations (not initial loading) -->
  <LoadingSpinner v-if="loading && !initialLoading && !showForm" isOverlay text="Processing..." />
  
  <!-- Loading Spinner Overlay - Show for all operations -->
  <LoadingSpinner v-if="loading || initialLoading" isOverlay :text="initialLoading ? 'Loading data...' : 'Processing...'" />
  </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, nextTick } from 'vue'
  import { useAuthStore } from '@/stores/modules/authStore'
  import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore'
  import { db } from '@shared/firebase'
  import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
  import emailService from '@/services/emailService'
  import axios from 'axios'
  import { 
    Filter as FilterIcon,
    PlusCircle,
    Edit as LucideEdit,
    Power as PowerIcon,
    Search as SearchIcon,
    User as UserIcon,
    AlertTriangle as AlertTriangleIcon,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon,
    Eye as EyeIcon,
    EyeOff as EyeOffIcon,
    Trash2
  } from 'lucide-vue-next'
  
  // Define your API URL here
  const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000'
  
  const authStore = useAuthStore()
  const users = ref([])
  const loading = ref(false)
  const initialLoading = ref(true)
  const error = ref(null)
  
  // Form state
  const searchQuery = ref('')
  const showForm = ref(false)
  const showFilters = ref(false)
  const editingUser = ref(null)
  const userForm = ref({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Pet Owner'
  })
  
  // Sorting state
  const sortKey = ref('firstName')
  const sortOrder = ref('asc')
  
  // Store the created user ID for verification flow
  const pendingUserId = ref(null)
  
  // Password visibility
  const showPassword = ref(false)
  
  // Email verification state
  const sendVerificationEmail = ref(true)
  const showVerificationForm = ref(false)
  const otpDigits = ref(Array(6).fill(''))
  const otpInputs = ref([])
  const verifying = ref(false)
  const verificationError = ref('')
  const resendTimer = ref(0)
  let timerInterval = null
  
  // Modal state
  const showStatusModal = ref(false)
  const showSuccessModal = ref(false)
  const showErrorModal = ref(false)
  const selectedUser = ref(null)
  const statusMessage = ref('')
  
  // Delete modal state
  const showModal = ref(false)
  const modalTitle = ref('')
  const modalMessage = ref('')
  const modalAction = ref('')
  
  const filters = ['All', 'Veterinarians', 'Pet Owners', 'Active', 'Inactive', 'Pending']
  const activeFilters = ref([])
  
  // Add this new ref to store the original password for pending users
  const pendingUserPassword = ref('')
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
  
    // Handle Firestore Timestamp objects
    const date = timestamp instanceof Date ? timestamp : 
                timestamp.toDate ? timestamp.toDate() : 
                new Date(timestamp);
  
    if (isNaN(date.getTime())) return 'Invalid date';
  
    // Format the date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  const fetchUsers = async () => {
    try {
      initialLoading.value = true
      const usersCollection = collection(db, 'users')
      const userSnapshot = await getDocs(usersCollection)
    
      // Get user sign-in data from Firebase Auth
      const userSignInData = await fetchUserSignInData();
      console.log('User sign-in data:', userSignInData);
    
      users.value = userSnapshot.docs
        .map(doc => {
          const userData = doc.data();
          const userId = doc.id;
          const uid = userData.uid; // This is the Firebase UID stored in Firestore
          
          console.log(`Processing user ${userData.firstName} ${userData.lastName}, Firestore ID: ${userId}, Firebase UID: ${uid}`);
          
          // Find sign-in data for this user if available
          const signInInfo = userSignInData.find(u => u.uid === uid);
          
          if (signInInfo) {
            console.log(`Found sign-in data for ${userData.firstName} ${userData.lastName}:`, signInInfo);
          } else {
            console.log(`No sign-in data found for ${userData.firstName} ${userData.lastName} with UID: ${uid}`);
          }
          
          return {
            userId: userId,
            ...userData,
            // Normalize status to ensure consistent capitalization
            status: (userData.status || 'Active').toString(),
            // Add last sign-in time if available
            lastSignInTime: signInInfo?.lastSignInTime || null,
            // Add provider data if available
            providerData: signInInfo?.providerData || []
          };
        })
        .filter(user => user.role !== 'admin') // Exclude admin users
        .map(user => ({
          ...user,
          role: user.role === 'user' ? 'Pet Owner' : (user.role === 'veterinary' ? 'Veterinarian' : user.role)
        }))
    
      // Log statuses to debug
      console.log('User statuses:', users.value.map(u => ({ 
        name: `${u.firstName} ${u.lastName}`, 
        status: u.status,
        uid: u.uid,
        lastSignInTime: u.lastSignInTime ? formatDate(u.lastSignInTime) : 'Never',
        providers: u.providerData?.map(p => p.providerId) || []
      })))
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = 'Failed to fetch users. Please try again.'
    } finally {
      initialLoading.value = false
    }
  }
  
  // Fetch user sign-in data from Firebase Auth via API
  const fetchUserSignInData = async () => {
    try {
      console.log('Fetching user sign-in data from API:', `${API_URL}/api/auth/users-sign-in-data`);
      const response = await axios.get(`${API_URL}/api/auth/users-sign-in-data`);
      
      if (response.data && response.data.success) {
        console.log('User sign-in data received:', response.data.users);
        return response.data.users || [];
      } else {
        console.error('API returned unsuccessful response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user sign-in data:', error);
      console.error('Error details:', error.response?.data || error.message);
      return [];
    }
  }
  
  onMounted(fetchUsers)
  
  // Sort function for table columns
  const sortBy = (key) => {
    // Special handling for name column which is a combination of firstName and lastName
    if (key === 'name') {
      if (sortKey.value === 'name') {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = 'name'
        sortOrder.value = 'asc'
      }
    } else {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }
  }
  
  // Check if a filter is active
  const isFilterActive = (filter) => {
    if (filter === 'All') {
      return activeFilters.value.length === 0;
    }
    return activeFilters.value.includes(filter);
  }
  
  // Toggle filter with new rules
  const toggleFilter = (filter) => {
    if (filter === 'All') {
      // Clear all filters when "All" is selected
      activeFilters.value = [];
    } else {
      // Handle role filters (Veterinarians, Pet Owners)
      if (filter === 'Veterinarians' || filter === 'Pet Owners') {
        // If the filter is already active, remove it
        if (activeFilters.value.includes(filter)) {
          activeFilters.value = activeFilters.value.filter(f => f !== filter);
        } else {
          // Remove the other role filter if present
          const otherRole = filter === 'Veterinarians' ? 'Pet Owners' : 'Veterinarians';
          activeFilters.value = activeFilters.value.filter(f => f !== otherRole);
          
          // Add the selected role filter
          activeFilters.value.push(filter);
        }
      }
      // Handle status filters (Active, Inactive, Pending)
      else if (filter === 'Active' || filter === 'Inactive' || filter === 'Pending') {
        // If the filter is already active, remove it
        if (activeFilters.value.includes(filter)) {
          activeFilters.value = activeFilters.value.filter(f => f !== filter);
        } else {
          // Remove conflicting status filters
          if (filter === 'Active') {
            activeFilters.value = activeFilters.value.filter(f => f !== 'Inactive' && f !== 'Pending');
          } else if (filter === 'Inactive') {
            activeFilters.value = activeFilters.value.filter(f => f !== 'Active' && f !== 'Pending');
          } else if (filter === 'Pending') {
            activeFilters.value = activeFilters.value.filter(f => f !== 'Active' && f !== 'Inactive');
          }
          
          // Add the selected status filter
          activeFilters.value.push(filter);
        }
      }
    }
    
    // Hide the filters dropdown after selection
    showFilters.value = false;
  }
  
  // Sorted users based on current sort key and order
  const sortedUsers = computed(() => {
    return [...filteredUsers.value].sort((a, b) => {
      let aValue, bValue;
      
      // Special handling for name column
      if (sortKey.value === 'name') {
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else {
        aValue = a[sortKey.value];
        bValue = b[sortKey.value];
        
        // Handle null/undefined values
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';
        
        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        // Handle date objects
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
        }
      }
      
      // Compare values
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  });
  
  const filteredUsers = computed(() => {
    return users.value.filter(user => {
      const searchLower = searchQuery.value.toLowerCase();
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower);
      
      // If no active filters, show all users that match the search
      if (activeFilters.value.length === 0) {
        return matchesSearch;
      }
      
      // Check if user matches the selected filters
      const matchesRole = 
        (activeFilters.value.includes('Veterinarians') && user.role === 'Veterinarian') ||
        (activeFilters.value.includes('Pet Owners') && user.role === 'Pet Owner') ||
        (!activeFilters.value.includes('Veterinarians') && !activeFilters.value.includes('Pet Owners'));
      
      const matchesStatus = 
        (activeFilters.value.includes('Active') && user.status?.toLowerCase() === 'active') ||
        (activeFilters.value.includes('Inactive') && user.status?.toLowerCase() === 'inactive') ||
        (activeFilters.value.includes('Pending') && user.status?.toLowerCase() === 'pending') ||
        (!activeFilters.value.includes('Active') && !activeFilters.value.includes('Inactive') && !activeFilters.value.includes('Pending'));
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  });
  
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  }
  
  const openAddUserForm = () => {
    editingUser.value = null;
    userForm.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Pet Owner'
    };
    showForm.value = true;
    showVerificationForm.value = false;
    sendVerificationEmail.value = true;
    pendingUserId.value = null;
  }
  
  // Modify the editUser function to not delete the password for pending users
  const editUser = (user) => {
    editingUser.value = user;
    userForm.value = { ...user };
    
    // Only delete password if not a pending user
    if (user.status?.toLowerCase() !== 'pending') {
      delete userForm.value.password;
    } else {
      // For pending users, initialize an empty password field
      userForm.value.password = '';
      pendingUserId.value = user.userId;
    }
    
    showForm.value = true;
    showVerificationForm.value = false;
  }
  
  // Modify the sendVerificationForPendingUser function to use the password from the form
  const sendVerificationForPendingUser = async () => {
    try {
      // Validate that we have a password
      if (!userForm.value.password) {
        showStatus('Please enter a password for this user before sending verification', 'error');
        return;
      }
      
      loading.value = true;
      
      if (!editingUser.value || !pendingUserId.value) {
        throw new Error('User information is missing');
      }
      
      // Store the password for later use
      pendingUserPassword.value = userForm.value.password;
      
      // Send OTP to user's email
      await emailService.sendOTP(userForm.value.email, userForm.value.firstName);
      
      // Show verification form
      showVerificationForm.value = true;
      
      // Start resend timer
      startResendTimer();
      
      // Focus on first OTP input
      nextTick(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      });
      
      showStatus('Verification email sent successfully', 'success');
    } catch (err) {
      console.error('Error sending verification email:', err);
      showStatus(err.message || 'Failed to send verification email. Please try again.', 'error');
    } finally {
      loading.value = false;
    }
  }
  
  const closeForm = () => {
    showForm.value = false;
    showVerificationForm.value = false;
    editingUser.value = null;
    clearOtpFields();
    stopResendTimer();
    pendingUserId.value = null;
    pendingUserPassword.value = ''; // Reset the stored password
  }
  
  // Show status message in modal
  const showStatus = (message, type = 'success') => {
    statusMessage.value = message;
    
    if (type === 'success') {
      showSuccessModal.value = true;
    } else {
      showErrorModal.value = true;
    }
  }
  
  // Open status change modal
  const openStatusModal = (user) => {
    selectedUser.value = user;
    showStatusModal.value = true;
  }
  
  // Close status change modal
  const closeStatusModal = () => {
    showStatusModal.value = false;
    selectedUser.value = null;
  }
  
  // Confirm status change from modal
  const confirmToggleUserStatus = async () => {
    if (!selectedUser.value) return;
    
    showStatusModal.value = false;
    await toggleUserStatus(selectedUser.value.userId);
    selectedUser.value = null;
  }
  
  // Confirm delete user
  const confirmDeleteUser = (user) => {
    selectedUser.value = user;
    modalTitle.value = 'Archive User';
    modalMessage.value = `Are you sure you want to archive ${user.firstName} ${user.lastName}? This user will be moved to the archive and can be restored within 30 days.`;
    modalAction.value = 'delete';
    showModal.value = true;
  }
  
  // Confirm action from modal
  const confirmAction = async () => {
    if (!selectedUser.value) return;
    
    showModal.value = false;
    
    try {
      if (modalAction.value === 'delete') {
        await archiveUser(selectedUser.value);
      } else if (modalAction.value === 'restore') {
        await restoreUser(selectedUser.value);
      } else if (modalAction.value === 'permanent-delete') {
        await permanentlyDeleteUser(selectedUser.value);
      }
    } catch (error) {
      console.error(`Error performing ${modalAction.value} action:`, error);
      showStatus(`Error: ${error.message}`, 'error');
    }
    
    selectedUser.value = null;
  }
  
  // Archive user
  const archiveUser = async (user) => {
    try {
      loading.value = true;
      const response = await axios.post(`${API_URL}/api/auth/delete-user`, { uid: user.uid });
      
      if (response.data.success) {
        showStatus(`User ${user.firstName} ${user.lastName} archived successfully`, 'success');
        await fetchUsers();
      } else {
        throw new Error(response.data.message || 'Failed to archive user');
      }
    } catch (error) {
      console.error('Error archiving user:', error);
      showStatus(`Error archiving user: ${error.message}`, 'error');
      throw error;
    } finally {
      loading.value = false;
    }
  }
  
  // OTP verification related functions
  const isOtpComplete = computed(() => {
    return otpDigits.value.every(digit => digit !== '');
  });
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const handleOtpInput = (event, index) => {
    const input = event.target;
    const value = input.value;
    
    // Ensure only numbers
    if (!/^\d*$/.test(value)) {
      otpDigits.value[index] = '';
      return;
    }
    
    // Move to next input
    if (value && index < 5) {
      nextTick(() => {
        otpInputs.value[index + 1].focus();
      });
    } else if (value && index === 5) {
      // Auto-verify when all digits are entered
      if (isOtpComplete.value) {
        verifyOTP();
      }
    }
    
    verificationError.value = ''; // Clear error when user types
  }
  
  const handleKeydown = (event, index) => {
    // Handle backspace
    if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
      nextTick(() => {
        otpInputs.value[index - 1].focus();
      });
    }
  }
  
  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    numbers.forEach((num, index) => {
      if (index < 6) {
        otpDigits.value[index] = num;
      }
    });
    
    // Focus on the next empty input or the last one if all filled
    nextTick(() => {
      const emptyIndex = otpDigits.value.findIndex(digit => digit === '');
      if (emptyIndex !== -1) {
        otpInputs.value[emptyIndex].focus();
      } else if (otpInputs.value[5]) {
        otpInputs.value[5].focus();
      }
    });
    
    // Clear error when user pastes
    verificationError.value = '';
  }
  
  const startResendTimer = () => {
    // Clear any existing timer
    stopResendTimer();
    
    resendTimer.value = 120; // 2 minutes cooldown for resend button
    timerInterval = setInterval(() => {
      if (resendTimer.value > 0) {
        resendTimer.value--;
      } else {
        stopResendTimer();
      }
    }, 1000);
  }
  
  const stopResendTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
  
  const clearOtpFields = () => {
    otpDigits.value = Array(6).fill('');
    verificationError.value = '';
  }
  
  // Modify the verifyOTP function to update the existing document
  const verifyOTP = async () => {
    try {
      verifying.value = true;
      verificationError.value = '';
    
      const otp = otpDigits.value.join('');
    
      // Verify OTP using email service
      const response = await emailService.verifyOTP(userForm.value.email, otp);
    
      if (response.success && response.valid) {
        // Update the user document to Active status
        if (pendingUserId.value) {
          const userRef = doc(db, 'users', pendingUserId.value);
          await updateDoc(userRef, {
            status: 'Active',
            emailVerified: true,
            updatedAt: new Date()
          });
          
          showStatus('User email verified successfully', 'success');
          await fetchUsers(); // Refresh the user list
          closeForm();
        } else {
          throw new Error('User ID not found for verification');
        }
      } else {
        verificationError.value = 'Invalid verification code. Please try again.';
      }
    } catch (err) {
      console.error('Verification error:', err);
    
      if (err.status === 'expired') {
        verificationError.value = 'Verification code has expired. Please request a new one.';
      } else if (err.status === 'invalid') {
        verificationError.value = 'The verification code you entered is incorrect. Please try again.';
      } else if (err.message?.includes('expired')) {
        verificationError.value = 'Verification code has expired. Please request a new one.';
      } else {
        verificationError.value = err.message || 'Failed to verify email. Please try again.';
      }
    } finally {
      verifying.value = false;
    }
  }
  
  const resendVerificationCode = async () => {
    try {
      loading.value = true;
      verificationError.value = '';
    
      // Resend OTP using email service
      await emailService.sendOTP(userForm.value.email, userForm.value.firstName);
    
      // Reset OTP inputs
      clearOtpFields();
    
      // Focus on first input
      nextTick(() => {
        if (otpInputs.value[0]) {
          otpInputs.value[0].focus();
        }
      });
    
      // Start resend timer
      startResendTimer();
    
      showStatus('Verification code resent successfully', 'success');
    } catch (err) {
      console.error('Resend error:', err);
      verificationError.value = 'Failed to resend verification code. Please try again.';
    } finally {
      loading.value = false;
    }
  }
  
  const cancelVerification = () => {
    showVerificationForm.value = false;
    clearOtpFields();
    stopResendTimer();
  }
  
  // Modify the handleSubmit function to follow the authStore pattern for creating documents
  const handleSubmit = async () => {
    try {
      loading.value = true;
    
      console.log('Form values:', {
        firstName: userForm.value.firstName,
        email: userForm.value.email,
        password: userForm.value.password,
        role: userForm.value.role
      });
    
      const roleToStore = userForm.value.role === 'Pet Owner' ? 'user' : 'veterinary';
    
      // Validation
      if (!editingUser.value && (!userForm.value.firstName || !userForm.value.email || !userForm.value.password)) {
        console.log('Validation failed')
        showStatus('Please fill in all required fields', 'error')
        loading.value = false
        return
      }
    
      if (editingUser.value) {
        // Update user in Firestore
        const userRef = doc(db, 'users', editingUser.value.userId)
        await updateDoc(userRef, {
          firstName: userForm.value.firstName || '',
          lastName: userForm.value.lastName || '',
          email: userForm.value.email || '',
          role: roleToStore,
          updatedAt: new Date()
        })
        showStatus('User updated successfully', 'success')
        await fetchUsers() // Refresh the user list
        closeForm()
      } else {
        // For new users
        try {
          if (sendVerificationEmail.value) {
            // With email verification - first create in Firebase Auth
            const response = await axios.post(`${API_URL}/api/auth/create-user`, {
              email: userForm.value.email,
              password: userForm.value.password,
              firstName: userForm.value.firstName,
              lastName: userForm.value.lastName || '',
              displayName: `${userForm.value.firstName} ${userForm.value.lastName || ''}`.trim(),
              role: roleToStore,
              emailVerified: false // Not verified yet
            })
            
            if (response.data && response.data.success && response.data.uid) {
              // Get the Firebase UID from the response
              const firebaseUid = response.data.uid;
              console.log('Firebase UID from API:', firebaseUid);
              
              // Generate the userId using the authStore pattern
              const userId = authStore.generateUserId(firebaseUid);
              console.log('Generated userId for Firestore:', userId);
              
              // Create user document in Firestore with Pending status
              await setDoc(doc(db, 'users', userId), {
                firstName: userForm.value.firstName,
                lastName: userForm.value.lastName || '',
                email: userForm.value.email,
                role: roleToStore,
                status: 'Pending',
                emailVerified: false,
                uid: firebaseUid, // Store the Firebase UID
                createdAt: new Date(),
                updatedAt: new Date()
              })
              
              // Send OTP to user's email
              await emailService.sendOTP(userForm.value.email, userForm.value.firstName)
              
              // Store the user ID for later use in verification
              pendingUserId.value = userId
              pendingUserPassword.value = userForm.value.password
              
              // Show verification form
              showVerificationForm.value = true
              startResendTimer()
              
              // Focus on first OTP input
              nextTick(() => {
                if (otpInputs.value[0]) {
                  otpInputs.value[0].focus()
                }
              })
            } else {
              throw new Error(response.data?.message || 'Failed to create user account')
            }
          } else {
            // Without email verification - create user directly
            const response = await axios.post(`${API_URL}/api/auth/create-user`, {
              email: userForm.value.email,
              password: userForm.value.password,
              firstName: userForm.value.firstName,
              lastName: userForm.value.lastName || '',
              displayName: `${userForm.value.firstName} ${userForm.value.lastName || ''}`.trim(),
              role: roleToStore,
              emailVerified: true // Mark as verified since we're not doing email verification
            })
            
            if (response.data && response.data.success && response.data.uid) {
              // Get the Firebase UID from the response
              const firebaseUid = response.data.uid;
              console.log('Firebase UID from API:', firebaseUid);
              
              // Generate the userId using the authStore pattern
              const userId = authStore.generateUserId(firebaseUid);
              console.log('Generated userId for Firestore:', userId);
              
              // Create user document in Firestore with Active status
              await setDoc(doc(db, 'users', userId), {
                firstName: userForm.value.firstName,
                lastName: userForm.value.lastName || '',
                email: userForm.value.email,
                role: roleToStore,
                status: 'Active',
                emailVerified: true,
                uid: firebaseUid, // Store the Firebase UID
                createdAt: new Date(),
                updatedAt: new Date()
              })
              
              showStatus('User added successfully', 'success')
              await fetchUsers() // Refresh the user list
              closeForm()
            } else {
              throw new Error(response.data?.message || 'Failed to create user account')
            }
          }
        } catch (err) {
          console.error('Error creating user:', err)
          showStatus(
            err.response?.data?.message || 
            err.message || 
            'Failed to create user. Please try again.', 
            'error'
          )
          loading.value = false
        }
      }
    } catch (err) {
      console.error('Error submitting user:', err)
      showStatus(err.message || 'Failed to save user. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }
  
  const toggleUserStatus = async (userId) => {
    try {
      loading.value = true
      const user = users.value.find(u => u.userId === userId)
    
      if (user) {
        // Normalize status comparison to be case-insensitive
        const newStatus = user.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active'
        
        // Check if the user has a uid property directly
        let firebaseUid = user.uid
        
        // If no direct uid property, try to extract it from userId
        if (!firebaseUid) {
          // The error suggests the userId format might be different
          // Let's log it to see what we're working with
          console.log('User ID format:', userId)
          
          // Try different extraction methods based on your actual userId format
          if (userId.startsWith('user_')) {
            firebaseUid = userId.replace('user_', '')
          } else {
            // If userId is the Firebase UID itself
            firebaseUid = userId
          }
        }
        
        console.log('Using Firebase UID:', firebaseUid)
        
        try {
          // Call the API to update Firebase Auth status
          // Make sure the endpoint matches exactly what's defined in your backend
          const response = await axios.post(`${API_URL}/api/auth/update-auth-status`, {
            uid: firebaseUid,
            disabled: newStatus.toLowerCase() === 'inactive' // true if Inactive, false if Active
          })
          
          if (response.data.success) {
            // If auth update is successful, update Firestore
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, { 
              status: newStatus,
              updatedAt: new Date()
            })
            
            // Update local state
            user.status = newStatus
            
            // Show success message
            showStatus(`User ${newStatus.toLowerCase() === 'active' ? 'activated' : 'deactivated'} successfully`, 'success')
          } else {
            throw new Error(response.data.message || 'Failed to update authentication status')
          }
        } catch (apiError) {
          console.error('API error:', apiError)
          
          // Check if this is a user not found error
          if (apiError.response?.status === 404 || 
              apiError.response?.data?.message?.includes('not found') ||
              apiError.message?.includes('not found')) {
            // If the user doesn't exist in Firebase Auth, just update Firestore
            console.warn('User not found in Firebase Auth, updating only in Firestore')
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, { 
              status: newStatus,
              updatedAt: new Date()
            })
            user.status = newStatus
            
            // Show success message with a note
            showStatus(`User status updated in database only. User not found in authentication system.`, 'success')
          } else {
            throw new Error(apiError.response?.data?.message || apiError.message || 'Failed to update authentication status')
          }
        }
      }
    } catch (err) {
      console.error('Error toggling user status:', err)
      showStatus(err.message || 'Failed to update user status. Please try again.', 'error')
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
  }
  
  input[type="number"] {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
  }
  
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
  display: none;
  }
  
  /* Remove focus ring styles and use browser defaults */
  input:focus {
  outline: none;
  }
  
  /* Add vendor prefixes for appearance property */
  input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  }
  
  button:disabled {
  opacity: 0.7;
  }
  
  /* Add vendor prefixes for any input styling */
  input[type="text"],
  input[type="email"],
  input[type="password"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0.5rem;
  }
  </style>