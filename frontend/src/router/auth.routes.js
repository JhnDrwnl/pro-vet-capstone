// src/router/auth.routes
import LandingLayout from '@/layouts/LandingLayout.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

export default [
  {
    path: '/auth',
    component: LandingLayout,
    children: [
        {
            path: 'login',
            name: 'login',
            component: Login,
        },
        {
            path: 'register',
            name: 'register',
            component: Register,
        },
    ],
  }
]