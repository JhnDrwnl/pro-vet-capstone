// Import your telehealth component
import TelehealthView from '../views/user/Telehealth.vue'

// Define telehealth routes
export const telehealthRoutes = [
  {
    path: '/telehealth',
    name: 'Telehealth',
    component: TelehealthView,
    meta: {
      requiresAuth: true,
      title: 'Telehealth'
    }
  }
]