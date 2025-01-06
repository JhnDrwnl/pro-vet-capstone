// src/router/auth.routes
import AuthLayout from '@/layouts/AuthLayout.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import VerifyEmail from '@/views/auth/VerifyEmail.vue'

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
        {
            path: 'verify-email',
            name: 'verify-email',
            component: VerifyEmail,
        },
    ],
  }
]