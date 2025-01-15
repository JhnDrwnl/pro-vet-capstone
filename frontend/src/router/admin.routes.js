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
import AdminCalendar from '@/views/admin/AdminCalendar.vue';
import ProfileModal from '@/components/common/ProfileModal.vue';
import AdminArchive from '@/views/admin/adminsettings/Archive.vue';
import AdminAccount from '@/views/admin/adminsettings/AccountSettings.vue';

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
        path: 'adminsettings',
        children: [
          {
            path: 'adminarchive',
            name: 'adminarchive',
            component: AdminArchive
          },
          {
            path: 'adminaccount',
            name: 'adminaccount',
            component: AdminAccount
          }
        ]
      },

     
      {
        path: 'usermanagement',
        name: 'usermanagement',
        component: UserManagement,
      },
      {
        path: 'admincalendar',
        name: 'admincalendar',
        component: AdminCalendar,
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
        path: 'adminprofile',
        name: 'adminProfile',
        component: ProfileModal,
      },
    ],
  }
];