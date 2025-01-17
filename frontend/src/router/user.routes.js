// src/router/user.routes.js
import UserLayout from '@/layouts/UserLayout.vue';
import UserDashboard from '@/views/user/UserDashboard.vue';
import PetProfiles from '@/views/user/PetProfiles.vue';
import UserAppointments from '@/views/user/UserAppointments.vue';
import Feedback from '@/views/user/Feedback.vue';
import UserSettings from '@/views/user/Settings.vue';
import UserTelehealth from '@/views/user/UserTelehealth.vue';

export default [
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true, roles: ['user'] },
    children: [
        {
            path: 'dashboard',
            name: 'UserDashboard',
            component: UserDashboard,
        },
        {
          path: 'petprofiles',
          name: 'petprofiles',
          component: PetProfiles,
       },
       {
        path: 'userappointments',
        name: 'userappointments',
        component: UserAppointments,
      },
      {
        path: 'feedback',
        name: 'feedback',
        component: Feedback,
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: UserSettings,
      },
      {
        path: 'usertelehealth',
        name: 'usertelehealth',
        component: UserTelehealth,
      },
    ],
  }
]
