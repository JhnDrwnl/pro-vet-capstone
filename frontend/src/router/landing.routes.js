// src/router/landing.routes.js
import LandingLayout from '@/layouts/LandingLayout.vue'
import HomePage from '@/views/landing/HomePage.vue'
import About from '@/views/landing/About.vue'
import Services from '@/views/landing/Services.vue'
import Contact from '@/views/landing/Contact.vue'

export default [
  {
    path: '/',
    component: LandingLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
      },
      {
        path: 'about',
        name: 'about',
        component: About,
      },
      {
        path: 'service',
        name: 'service',
        component: Services,
      },
      {
        path: 'contact',
        name: 'contact',
        component: Contact,
      },
    ],
  }
]