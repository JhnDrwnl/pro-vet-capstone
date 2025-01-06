import AdminLayout from '../layouts/AdminLayout.vue';
import Dashboard from '../views/admin/Dashboard.vue';
import Analytics from '../views/admin/Analytics.vue';
import Appointments from '../views/admin/Appointments.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import DataManagement from '../views/admin/DataManagement.vue';
import Telehealth from '../views/admin/Telehealth.vue';
import Chatbot from '../views/admin/Chatbot.vue';


export default [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
        {
            path: 'dashboard',
            name: 'dashboard',
            component: Dashboard,
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: Analytics,
       },
       {
        path: 'appointments',
        name: 'appointments',
        component: Appointments,
      },
      {
        path: 'usermanagement',
        name: 'usermanagement',
        component: UserManagement,
      },
      {
        path: 'datamanagement',
        name: 'datamanagement',
        component: DataManagement,
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
    ],
  }
]
