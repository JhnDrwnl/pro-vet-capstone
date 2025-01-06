// src/router/auth.routes
import AuthLayout from '@/layouts/AuthLayout.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

export default [
  {
    path: '/auth',
    component: AuthLayout,
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