<!-- components/common/Calendar.vue -->
<template>
  <div class="calendar-dropdown">
    <!-- Header -->
    <div class="flex items-center justify-between p-2 border-b">
      <button 
        @click="toggleView"
        class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full text-sm font-medium"
      >
        {{ displayText }}
        <ChevronDownIcon 
          class="w-4 h-4 text-gray-500"
          :class="{ 'transform rotate-180': view !== 'days' }"
        />
      </button>
      
      <div class="flex gap-1">
        <button 
          @click="navigate('prev')"
          class="p-1.5 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeftIcon class="w-4 h-4" />
        </button>
        <button 
          @click="navigate('next')"
          class="p-1.5 hover:bg-gray-100 rounded-full"
        >
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Month View -->
    <div v-if="view === 'months'" class="p-2">
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="(month, index) in months"
          :key="month"
          @click="selectMonth(index)"
          class="text-sm py-2 px-4 rounded-full text-center"
          :class="[
            currentMonth === index 
              ? 'bg-[#0ea5e9] text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ month.slice(0, 3) }}
        </button>
      </div>
    </div>

    <!-- Year View -->
    <div v-else-if="view === 'years'" class="p-2">
      <div class="h-[280px] overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="year in displayedYears"
            :key="year"
            @click="selectYear(year)"
            class="text-sm py-2 px-4 rounded-full text-center"
            :class="[
              currentYear === year 
                ? 'bg-[#0ea5e9] text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </div>

    <!-- Days View -->
    <div v-else>
      <div class="p-2">
        <div class="grid grid-cols-7 gap-1">
          <!-- Week days -->
          <div 
            v-for="day in weekDays" 
            :key="day"
            class="text-center text-xs font-medium text-gray-500 py-1"
          >
            {{ day }}
          </div>

          <!-- Calendar days -->
          <button
            v-for="date in calendarDays"
            :key="date.fullDate"
            @click="selectDate(date)"
            :class="[
              'text-xs p-2 rounded-full hover:bg-gray-100 text-center',
              date.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
              isSelectedDate(date) ? 'bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]' : '',
              isToday(date) ? 'font-bold' : ''
            ]"
          >
            {{ date.day }}
          </button>
        </div>
      </div>
      
      <!-- Footer buttons -->
      <div class="px-2 py-2 border-t flex justify-between items-center">
        <button 
          @click="clearDate"
          class="px-3 py-1 text-sm text-[#0ea5e9] hover:text-[#0369a1] transition-colors"
        >
          Clear
        </button>
        <button 
          @click="selectToday"
          class="px-3 py-1 text-sm text-[#0ea5e9] hover:text-[#0369a1] transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'cancel']);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const view = ref('days'); // 'days', 'months', 'years'
const yearRangeStart = ref(1900);
const yearRangeEnd = ref(2100);

// Generate array of years for display
const displayedYears = computed(() => {
  return Array.from(
    { length: yearRangeEnd.value - yearRangeStart.value + 1 },
    (_, i) => yearRangeStart.value + i
  );
});

const displayText = computed(() => {
  if (view.value === 'years') {
    return `${yearRangeStart.value} - ${yearRangeEnd.value}`;
  } else if (view.value === 'months') {
    return currentYear.value.toString();
  } else {
    return `${months[currentMonth.value]} ${currentYear.value}`;
  }
});

const selectedDate = computed({
  get: () => props.modelValue ? new Date(props.modelValue) : null,
  set: (value) => {
    emit('update:modelValue', value ? formatDate(value) : '');
  }
});

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue);
    if (!isNaN(date.getTime())) {
      currentMonth.value = date.getMonth();
      currentYear.value = date.getFullYear();
    }
  }
}, { immediate: true });

const toggleView = () => {
  if (view.value === 'days') {
    view.value = 'months';
  } else if (view.value === 'months') {
    view.value = 'years';
  } else {
    view.value = 'days';
  }
};

const navigate = (direction) => {
  if (view.value === 'days') {
    if (direction === 'prev') {
      if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
      } else {
        currentMonth.value--;
      }
    } else {
      if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
      } else {
        currentMonth.value++;
      }
    }
  } else if (view.value === 'months') {
    currentYear.value += direction === 'prev' ? -1 : 1;
  } else if (view.value === 'years') {
    const increment = 20;
    if (direction === 'prev') {
      yearRangeStart.value = Math.max(1900, yearRangeStart.value - increment);
      yearRangeEnd.value = yearRangeStart.value + increment;
    } else {
      yearRangeStart.value = Math.min(2080, yearRangeStart.value + increment);
      yearRangeEnd.value = yearRangeStart.value + increment;
    }
  }
};

const selectMonth = (month) => {
  currentMonth.value = month;
  view.value = 'days';
};

const selectYear = (year) => {
  currentYear.value = year;
  view.value = 'months';
};

const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  // Previous month days
  const prevMonthDays = firstDay.getDay();
  const prevMonth = new Date(currentYear.value, currentMonth.value, 0);
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    days.push({
      day: prevMonth.getDate() - i,
      fullDate: new Date(currentYear.value, currentMonth.value - 1, prevMonth.getDate() - i),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      day: i,
      fullDate: new Date(currentYear.value, currentMonth.value, i),
      isCurrentMonth: true
    });
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      fullDate: new Date(currentYear.value, currentMonth.value + 1, i),
      isCurrentMonth: false
    });
  }
  
  return days;
});

const selectDate = (date) => {
  selectedDate.value = date.fullDate;
  const formattedDate = formatDate(date.fullDate);
  emit('update:modelValue', formattedDate);
};

const isSelectedDate = (date) => {
  return selectedDate.value && date.fullDate.toDateString() === selectedDate.value.toDateString();
};

const isToday = (date) => {
  return date.fullDate.toDateString() === today.toDateString();
};

const selectToday = () => {
  const today = new Date();
  currentMonth.value = today.getMonth();
  currentYear.value = today.getFullYear();
  selectDate({ fullDate: today, isCurrentMonth: true });
  view.value = 'days';
};

const clearDate = () => {
  emit('update:modelValue', '');
  selectedDate.value = null;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
</script>

<style scoped>
.calendar-dropdown {
  width: 300px;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: white;
  border: 1px solid #e5e7eb;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>