<template>
    <aside class="fixed inset-y-0 w-64 bg-white border-r border-gray-200">
      <!-- Logo -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-blue-600">ProVet</h1>
      </div>
  
      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <a href="/vet/VetDashboard" class="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
          <LayoutDashboard class="w-5 h-5 mr-3" />
          <span>Dashboard</span>
        </a>
        <a href="/vet/VetClientPets" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <PawPrintIcon class="w-5 h-5 mr-3" />
          <span>Client and Pets</span>
        </a>
        <a href="/vet/VetAppointments" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Calendar class="w-5 h-5 mr-3" />
          <span>Appointments</span>
        </a>
        <a href="/vet/VetTelehealth" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Video class="w-5 h-5 mr-3" />
          <span>Telehealth</span>
        </a>
        <a href="/vet/VetFeedback" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <MessageCircle class="w-5 h-5 mr-3" />
          <span>Feedback</span>
        </a>
        <a href="/vet/VetHealthRiskAssessment" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Settings class="w-5 h-5 mr-3" />
          <span>Health Risk Assessment</span>
        </a>
        <a href="/vet/MedicalRecords" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Settings class="w-5 h-5 mr-3" />
          <span>Medical Records</span>
        </a>
        
      </nav>
    </aside>
  </template>
  
  <script setup>
  import {
    LayoutDashboard,
    Calendar,
    PawPrintIcon,
    Settings,
    Video,
    MessageCircle,
  } from 'lucide-vue-next';
  </script>
  