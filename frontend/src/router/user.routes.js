// src/router/user.routes.js
import UserLayout from '@/layouts/UserLayout.vue';
import UserDashboard from '@/views/user/Dashboard.vue';
import UserAppointments from '@/views/user/Appointments.vue';
import Notifications from '@/components/common/NotificationPanel.vue';
import UserSettings from '@/views/user/Settings.vue';
import UserTelehealth from '@/views/user/Telehealth.vue';
import Profile from '@/views/user/Profile.vue';
import Calendar from '@/views/user/dashboard/Calendar.vue';
import EducationalResources from '@/views/user/dashboard/EducationalResources.vue';



export default [
    {
      path: "/user",
      component: UserLayout,
      meta: { requiresAuth: true, roles: ["user"] },
      children: [
        {
          path: "dashboard",
          name: "UserDashboard",
          component: UserDashboard,
        },
        
        {
          path: "userappointments",
          name: "UserAppointments",
          component: UserAppointments,
        },
        {
          path: "profile",
          name: "profile",
          component: Profile,
        },
        {
          path: "notifications",
          name: "Notifications",
          component: Notifications,
        },
        {
          path: "usersettings",
          name: "UserSettings",
          component: UserSettings,
        },
        {
          path: "usertelehealth",
          name: "UserTelehealth",
          component: UserTelehealth,
        },
        {
          path: "calendar",
          name: "Calendar",
          component: Calendar,
        },
        {
          path: "educational-resources",
          name: "EducationalResources",
          component: EducationalResources,
        },
      ],
    },
  ]
  