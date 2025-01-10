import AdminLayout from '@/layouts/AdminLayout.vue';
import AdminDashboard from '@/views/admin/Dashboard.vue';
import Analytics from '@/views/admin/Analytics.vue';
import PetOwners from '@/views/admin/datamanagement/PetOwners.vue';
import Veterinarians from '@/views/admin/datamanagement/Veterinarians.vue';
import PetProfiles from '@/views/admin/datamanagement/PetProfiles.vue';
import ApprovedAppointments from '@/views/admin/appointments/ApprovedAppointments.vue';
import Services from '@/views/admin/appointments/Services.vue';
import UserManagement from '@/views/admin/UserManagement.vue';
import Online from '@/views/admin/session/Online.vue';
import WalkIn from '@/views/admin/session/Walk-in.vue';
import Telehealth from '@/views/admin/Telehealth.vue';
import Chatbot from '@/views/admin/Chatbot.vue';
import AdminSettings from '@/views/admin/Settings.vue';

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: Analytics,
      },
      
      {
        path: '/admin/datamanagement',
        children: [
          {
            path: 'petowners',
            name: 'petowners',
            component: PetOwners,
          },
          {
            path: 'petprofiles',
            name: 'petprofies',
            component: PetProfiles,
          },
          {
            path: 'veterinarians',
            name: 'AdminVeterinarians',
            component: Veterinarians,
          },
        ],
      },
      
      {
        path: '/admin/session',
        children: [
          {
            path: 'online',
            name: 'online',
            component: Online
          },
          {
            path: 'walkin',
            name: 'Walk-In',
            component: WalkIn,
          }
        ]
      },
      {
        path: '/admin/appointments',
        name: 'appointments',
        children: [
          {
            path: 'approvedappointments',
            name: 'approvedappointments',
            component: ApprovedAppointments
          },
          {
            path: 'services',
            name: 'services',
            component: Services,
          }
        ]
      },
      {
        path: 'usermanagement',
        name: 'usermanagement',
        component: UserManagement,
      },

      {
        path: 'telehealth',
        name: 'telehealth',
        component: Telehealth,
      },
      {
        path: 'chatbot',
        name: 'chatbot',
        component: Chatbot,
      },
      {
        path: 'settings',
        name: 'adminsettings',
        component: AdminSettings,
      },
    ],
  }
];
