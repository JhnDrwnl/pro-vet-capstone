// src/router/landing.routes.js
import LandingLayout from '@/layouts/LandingLayout.vue'
import Home from '@/views/landing/Home.vue'
import HomePage from '@/views/landing/HomePage.vue'
import About from '@/views/landing/About.vue'
import Services from '@/views/landing/Services.vue'
import Contact from '@/views/landing/Contact.vue'

export default [
  {
    path: '/landing',
    component: LandingLayout,
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home,
      },
      {
        path: 'homepage',
        name: 'homepage',
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