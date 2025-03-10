// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/modules/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@shared/firebase';
import landingRoutes from './landing.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import veterinaryRoutes from './veterinary.routes.js';
import authRoutes from './auth.routes.js';

const routes = [
  ...landingRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...veterinaryRoutes,
  ...authRoutes,

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

function getRoleBasedRedirect(role) {
  switch (role) {
    case 'admin':
      return { name: 'AdminDashboard' };
    case 'veterinary':
      return { name: 'VetDashboard' };
    case 'user':
      return { name: 'UserDashboard' };
    default:
      return { name: 'UserDashboard' };
  }
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Always allow access to public routes
  if (to.meta.public) {
    next();
    return;
  }

  // Wait for auth initialization
  if (!authStore.isInitialized) {
    try {
      await authStore.initializeAuth();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      next({ name: 'login' });
      return;
    }
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  console.log('Router guard - isAuthenticated:', isAuthenticated);
  console.log('Router guard - userRole:', userRole);

  if (isAuthenticated) {
    // Check if user is newly logged in after verification
    if (from.name === 'login' && 
        (to.name === 'UserDashboard' || to.name === 'VetDashboard' || to.name === 'AdminDashboard')) {
      try {
        const userId = authStore.currentUser.userId;
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if this is a verified user who hasn't configured notifications
          if (userData.emailVerified && !userData.notificationsConfigured) {
            // Set flag to show notification modal
            localStorage.setItem('showNotificationModal', 'true');
            
            // Update user document to track that we've prompted for notifications
            await setDoc(userRef, {
              notificationsPrompted: true,
              updatedAt: new Date()
            }, { merge: true });
          }
        }
      } catch (error) {
        console.error('Error checking notification status:', error);
      }
    }
    
    if (to.name === 'login' || to.name === 'register') {
      // If user is authenticated and trying to access login or register, redirect to appropriate dashboard
      const roleBasedRedirect = getRoleBasedRedirect(userRole);
      next(roleBasedRedirect);
    } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      // If the route requires specific roles and the user doesn't have access, redirect to the correct dashboard
      const roleBasedRedirect = getRoleBasedRedirect(userRole);
      next(roleBasedRedirect);
    } else {
      next();
    }
  } else {
    // Allow access to login and register routes even when not authenticated
    if (to.name === 'login' || to.name === 'register') {
      next();
    } else if (to.meta.requiresAuth) {
      // If the route requires authentication, redirect to login
      next({ name: 'login' });
    } else {
      next();
    }
  }
});

export default router;