// src/router/landing.routes.js
import LandingLayout from '@/layouts/LandingLayout.vue'
import About from '@/views/landing/Home.vue'

export default [
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: About,
      },
    ],
  }
]