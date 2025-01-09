<!-- components/user/Schedules.vue -->
<template>
    <div class="space-y-6">
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <!-- Calendar -->
          <div class="lg:col-span-5">
            <div class="bg-white rounded-xl border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-4">
                <button 
                  @click="previousMonth"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <h4 class="font-medium">{{ currentMonthYear }}</h4>
                <button 
                  @click="nextMonth"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight class="w-5 h-5" />
                </button>
              </div>
              <div class="grid grid-cols-7 gap-2 mb-2">
                <div 
                  v-for="day in weekDays" 
                  :key="day"
                  class="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {{ day }}
                </div>
              </div>
              <div class="grid grid-cols-7 gap-2">
                <button
                  v-for="date in calendarDays"
                  :key="date.value"
                  @click="selectDate(date)"
                  :disabled="!date.isAvailable"
                  :class="[
                    'p-2 rounded-lg text-sm relative hover:bg-[#E3FF75]/10 transition-colors',
                    date.isToday ? 'font-bold' : '',
                    selectedDate?.value === date.value ? 'bg-[#E3FF75] text-gray-900' : '',
                    !date.isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    date.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  ]"
                >
                  {{ new Date(date.value).getDate() }}
                  <div 
                    v-if="date.hasAppointments" 
                    class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-current"
                  ></div>
                </button>
              </div>
            </div>
          </div>
  
          <!-- Time slots -->
          <div class="lg:col-span-2">
            <div class="space-y-2">
              <button
                v-for="slot in timeSlots"
                :key="slot"
                @click="selectTime(slot)"
                :class="[
                  'w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200',
                  selectedTime === slot
                    ? 'bg-[#E3FF75] text-gray-900'
                    : 'bg-white border border-gray-200 hover:border-[#E3FF75] hover:shadow-md'
                ]"
              >
                {{ slot }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
  
  const props = defineProps({
    selectedDate: {
      type: Object,
      default: null
    },
    selectedTime: {
      type: String,
      default: null
    }
  })
  
  const emit = defineEmits(['selectDate', 'selectTime'])
  
  const currentDate = ref(new Date())
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ]
  
  const currentMonthYear = computed(() => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(currentDate.value)
  })
  
  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const today = new Date()
    const days = []
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        value: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isAvailable: false,
        isToday: false,
        hasAppointments: false
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isToday = date.toDateString() === today.toDateString()
      const isAvailable = date >= today
      
      days.push({
        value: date.toISOString().split('T')[0],
        isCurrentMonth: true,
        isAvailable,
        isToday,
        hasAppointments: Math.random() > 0.7
      })
    }
    
    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        value: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        isAvailable: false,
        isToday: false,
        hasAppointments: false
      })
    }
    
    return days
  })
  
  const previousMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
    )
  }
  
  const nextMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1
    )
  }
  
  const selectDate = (date) => {
    if (date.isAvailable) {
      emit('selectDate', date)
    }
  }
  
  const selectTime = (time) => {
    emit('selectTime', time)
  }
  </script>
  