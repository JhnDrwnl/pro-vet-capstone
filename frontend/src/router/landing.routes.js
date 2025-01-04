// src/router/landing.routes.js
import LandingLayout from '@/layouts/LandingLayout.vue'
import Home from '@/views/landing/Home.vue'

export default [
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
      },
    ],
  }
]