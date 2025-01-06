<template>
    <aside class="fixed inset-y-0 w-64 bg-white border-r border-gray-200">
      <!-- Logo -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-blue-600">ProVet</h1>
      </div>
  
      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <a href="/admin/Dashboard" class="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg">
          <LayoutDashboard class="w-5 h-5 mr-3" />
          <span>Dashboard</span>
        </a>
        <a href="/admin/Analytics" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <BarChart2 class="w-5 h-5 mr-3" />
          <span>Analytics</span>
        </a>
        <a href="/admin/Appointments" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Calendar class="w-5 h-5 mr-3" />
          <span>Appointments</span>
        </a>
        <a href="/admin/UserManagement" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Users class="w-5 h-5 mr-3" />
          <span>User Management</span>
        </a>
        <a href="/admin/DataManagement" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Database class="w-5 h-5 mr-3" />
          <span>Data Management</span>
        </a>
        <a href="/admin/Chatbot" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <MessageSquare class="w-5 h-5 mr-3" />
          <span>Chatbot</span>
        </a>
        <a href="/admin/Telehealth" class="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
          <Video class="w-5 h-5 mr-3" />
          <span>Telehealth</span>
        </a>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import {
    LayoutDashboard,
    Calendar,
    Users,
    BarChart2,
    Database,
    MessageSquare,
    Video,
  } from 'lucide-vue-next';
  </script>
  