<!-- components/admin/Sidebar.vue -->
<template>
  <aside 
    ref="sidebarRef" 
    class="fixed inset-y-4 z-10 flex flex-col transition-all duration-300 bg-white border border-gray-100 rounded-2xl shadow-sm"
    :class="{ 
      'w-64': isOpen, 
      'w-16': !isOpen && !isSmallScreen,
      'w-0': !isOpen && isSmallScreen,
      'left-4': !isSmallScreen,
      'mx-4': isSmallScreen
    }"
  >
    <template v-if="isOpen || !isSmallScreen">
      <!-- Logo and Toggle Button (Shows at top when expanded) -->
      <div v-if="isOpen" class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-blue-600">ProVet</h1>
        <button @click="handleToggle" 
                class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <PanelLeftClose class="w-5 h-5" />
        </button>
      </div>
      <div v-else class="px-4 py-4 border-b border-gray-200">
        <img src="@/assets/media/images/landing/provetblue.png" alt="ProVet Logo" class="w-8 h-8 mx-auto" />
      </div>
      <!-- Navigation -->
      <nav class="flex-grow p-4 space-y-2 overflow-y-auto" :class="{ 'overflow-hidden': !isOpen }">
        <template v-for="(item, index) in navItems" :key="index">
          <div v-if="item.subItems" class="relative group">
            <button 
              @click="toggleSubmenu(item.label)"
              @mouseenter="!isOpen ? handleMouseEnter(item.label) : null"
              @mouseleave="!isOpen ? handleMouseLeave() : null"
              :ref="el => { if (el) menuItemRefs[item.label] = el }"
              class="w-full flex items-center rounded-lg transition-colors duration-200"
              :class="[
                isActiveParent(item) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50',
                isOpen ? 'px-4 py-2' : 'p-2 justify-center'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" :class="{ 'mr-3': isOpen }" v-bind="item.iconProps || {}" />
              <span v-if="isOpen" class="truncate">{{ item.label }}</span>
              <ChevronDown 
                v-if="isOpen" 
                class="w-4 h-4 ml-auto transition-transform duration-200"
                :class="{ 'rotate-180': openSubmenu === item.label }"
              />
            </button>
            <!-- Submenu for expanded state -->
            <div v-if="isOpen && openSubmenu === item.label" 
                 class="pl-4 mt-2 space-y-2 transition-all duration-200">
              <router-link v-for="subItem in item.subItems" 
                           :key="subItem.href" 
                           :to="subItem.href"
                           class="flex items-center px-4 py-2 rounded-lg transition-colors duration-200"
                           :class="[
                             'text-gray-600 hover:bg-gray-50',
                             { 'font-medium': subItem.href === currentRoute }
                           ]"
                           @click="handleItemClick(subItem)">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3"></span>
                <span>{{ subItem.label }}</span>
              </router-link>
            </div>
            <!-- Dropdown menu for collapsed state -->
            <div v-if="!isOpen && openSubmenu === item.label" 
                 @mouseenter="handleMouseEnter(item.label)"
                 @mouseleave="handleMouseLeave"
                 class="fixed py-2 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-lg transition-opacity min-w-[200px] z-50"
                 :style="getDropdownStyle(item.label)">
              <div class="px-3 py-2 font-medium border-b border-gray-200">{{ item.label }}</div>
              <div class="py-1">
                <router-link v-for="subItem in item.subItems"
                             :key="subItem.href"
                             :to="subItem.href"
                             class="flex items-center px-3 py-2 hover:bg-gray-50 transition-colors"
                             :class="{ 'font-medium': subItem.href === currentRoute }"
                             @click="handleItemClick(subItem)">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                  <span>{{ subItem.label }}</span>
                </router-link>
              </div>
            </div>
          </div>
          <router-link v-else
             :to="item.href" 
             class="flex items-center rounded-lg transition-colors duration-200 relative group"
             :class="[
               item.href === currentRoute ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50',
               isOpen ? 'px-4 py-2' : 'p-2 justify-center'
             ]"
             @click="handleItemClick(item)"
          >
            <component 
              :is="item.icon" 
              v-bind="item.iconProps || {}"
              class="w-5 h-5" 
              :class="{ 'mr-3': isOpen }" 
            />
            <span v-if="isOpen">{{ item.label }}</span>
            <!-- Tooltip for collapsed state -->
            <div v-if="!isOpen" 
                 class="fixed left-16 ml-2 px-3 py-2 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
              {{ item.label }}
            </div>
          </router-link>
        </template>
      </nav>

      <!-- Toggle Button (Shows at bottom when collapsed) -->
      <div v-if="!isOpen" class="mt-auto border-t border-gray-200 p-4">
        <button @click="handleToggle" 
                class="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <PanelRightClose class="w-5 h-5" />
        </button>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Icon } from "@iconify/vue";
import { useRoute } from 'vue-router';
import {
  BarChart,
  Calendar,
  Users,
  Clock,
  Database,
  Video,
  PanelLeftClose,
  PanelRightClose,
  Settings,
  ChevronDown,
  MessageCircleCode,
  Building
} from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isSmallScreen: {
    type: Boolean,
    required: true,
    default: false
  }
});

const emit = defineEmits(['toggle', 'item-click']);

const route = useRoute();
const currentRoute = computed(() => route.path);
const openSubmenu = ref(null);
const hoverTimeout = ref(null);
const menuItemRefs = ref({});
const sidebarRef = ref(null);

const toggleSubmenu = (label) => {
  if (props.isOpen) {
    openSubmenu.value = openSubmenu.value === label ? null : label;
  } else {
    openSubmenu.value = label;
  }
};

const handleMouseEnter = (label) => {
  clearTimeout(hoverTimeout.value);
  openSubmenu.value = label;
};

const handleMouseLeave = () => {
  hoverTimeout.value = setTimeout(() => {
    openSubmenu.value = null;
  }, 300);
};

const getDropdownStyle = (label) => {
  if (!sidebarRef.value || !menuItemRefs.value[label]) return {};
  
  const sidebarRect = sidebarRef.value.getBoundingClientRect();
  const itemRect = menuItemRefs.value[label].getBoundingClientRect();
  
  return {
    top: `${itemRect.top}px`,
    left: `${sidebarRect.width + 8}px`,
  };
};

const handleToggle = () => {
  emit('toggle');
  openSubmenu.value = null;
};

const closeOpenSubmenu = () => {
  openSubmenu.value = null;
};

const handleItemClick = (item) => {
  emit('item-click');
  if (!item.subItems) {
    closeOpenSubmenu();
  }
};

const navItems = [
  { 
    href: '/admin/dashboard', 
    icon: Icon, 
    label: 'Dashboard', 
    iconProps: { icon: "mage:dashboard-bar-notification", width: 20, height: 20 } 
  },
  { 
    href: '/admin/analytics', 
    icon: Icon, 
    label: 'Analytics', 
    iconProps: { icon: "lucide:chart-pie", width: 20, height: 20 } 
  },
  { 
    href: '/admin/usermanagement', 
    icon: Users, 
    label: 'Users' 
  },
  { 
    icon: Calendar, 
    label: 'Appointments',
    subItems: [
      { href: '/admin/appointments/approvedappointments', label: 'Appointments' },
      { href: '/admin/appointments/services', label: 'Services' }
    ]
  },
  { 
    icon: Clock, 
    label: 'Session',
    subItems: [
      { href: '/admin/session/online', label: 'Online' },
      { href: '/admin/session/walkin', label: 'Walk-in' }
    ]
  },
  { 
    icon: Database, 
    label: 'Data',
    subItems: [
      { href: '/admin/datamanagement/petowners', label: 'Pet Owners' },
      { href: '/admin/datamanagement/petprofiles', label: 'Pet Profiles' },
      { href: '/admin/datamanagement/veterinarians', label: 'Veterinarians' }
    ]
  },
  { 
    href: '/admin/telehealth', 
    icon: Video, 
    label: 'Telehealth' 
  },
  { 
    icon: MessageCircleCode,
    label: 'Chatbot',
    subItems: [
      { href: '/admin/chatbot/chatlogs', label: 'Chat Logs' },
      { href: '/admin/chatbot/responses', label: 'Responses' }
    ]
  },
  { 
    icon: Building,
    label: 'Office',
    subItems: [
      { href: '/admin/office-settings/office-hours', label: 'Office Hours' },
      { href: '/admin/office-settings/office-contact', label: 'Office Contact' }
    ]
  },
  { 
    icon: Settings,
    label: 'Settings',
    subItems: [
      { href: '/admin/adminsettings/adminarchive', label: 'Archive' },
      { href: '/admin/adminsettings/adminaccount', label: 'Account' }
    ]
  },
];

const isActiveParent = (item) => {
  if (item.subItems) {
    return item.subItems.some(subItem => subItem.href === currentRoute.value);
  }
  return false;
};

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (sidebarRef.value && !sidebarRef.value.contains(event.target)) {
      openSubmenu.value = null;
    }
  });
});

onUnmounted(() => {
  clearTimeout(hoverTimeout.value);
  document.removeEventListener('click', () => {});
});

watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    openSubmenu.value = null;
  }
});
</script>

<style scoped>
.group:hover .group-hover\:visible {
  visibility: visible;
}
</style>