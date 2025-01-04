import { createRouter, createWebHistory } from 'vue-router';
// import { useAuthStore } from '@/store/modules/auth'; // Update the store import as per your setup
import landingRoutes from './landing.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import veterinaryRoutes from './veterinary.routes.js'; // New veterinary routes

const routes = [
  ...landingRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...veterinaryRoutes,

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// function getRoleBasedRedirect(role) {
//   switch (role) {
//     case 'admin':
//       return { name: 'AdminDashboard' }; // Assuming 'AdminDashboard' is defined in adminRoutes
//     case 'veterinary':
//       return { name: 'VeterinaryDashboard' }; // Assuming 'VeterinaryDashboard' is defined in veterinaryRoutes
//     case 'user':
//       return { name: 'UserAccount' }; // Assuming 'UserAccount' is defined in userRoutes
//     default:
//       return { name: 'UserAccount' };
//   }
// }

// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();

//   // Always allow access to landing and user pages
//   if (to.matched.some(record => record.path === '/' || record.path.startsWith('/user'))) {
//     next();
//     return;
//   }

//   // Wait for auth initialization
//   if (!authStore.isInitialized) {
//     try {
//       await authStore.initializeAuth();
//     } catch (error) {
//       console.error('Auth initialization failed:', error);
//       next({ name: 'login' });
//       return;
//     }
//   }

//   const isAuthenticated = authStore.isAuthenticated;
//   const userRole = authStore.userRole || localStorage.getItem('userRole');
//   const userExists = authStore.userExists;

//   if (isAuthenticated && userExists) {
//     if (to.name === 'login' || to.name === 'register') {
//       // If user is authenticated and trying to access login or register, redirect to appropriate dashboard
//       const roleBasedRedirect = getRoleBasedRedirect(userRole);
//       next(roleBasedRedirect);
//     } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
//       // If the route requires specific roles and the user doesn't have access, redirect to the correct dashboard
//       const roleBasedRedirect = getRoleBasedRedirect(userRole);
//       next(roleBasedRedirect);
//     } else {
//       next();
//     }
//   } else if (to.meta.requiresAuth) {
//     // If the route requires authentication, redirect to login
//     next({ name: 'login' });
//   } else {
//     next();
//   }
// });

export default router;
