// src/router/user.routes.js
import UserLayout from '@/layouts/UserLayout.vue';
import UserDashboard from '@/views/user/Dashboard.vue';
import Profile from '@/views/user/Profile.vue';
import UserAppointments from '@/views/user/Appointments.vue';
import Notifications from '@/views/user/Notifications.vue';
import UserSettings from '@/views/user/Settings.vue';
import UserTelehealth from '@/views/user/Telehealth.vue';

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
          path: 'profile',
          name: 'Profile',
          component: Profile,
       },
       {
        path: 'userappointments',
        name: 'userappointments',
        component: UserAppointments,
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: Notifications,
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
