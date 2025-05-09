import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import '@/assets/styles/tailwind.css'

// Import notification services
import notificationService from './services/notificationService';
import notificationSyncService from './services/notificationSyncService';

// Import stores
import { useNotificationsStore } from './stores/modules/notifications';
import { useTelehealthStore } from './stores/modules/teleHealthStore';

// Create Vue app
const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();

// Use Pinia FIRST
app.use(pinia);

// Then use router
app.use(router);

// Set router in notification service
notificationService.setRouter(router);

// Make notification service available globally
app.config.globalProperties.$notifications = notificationService;

// Initialize the stores here, before mounting the app
const notificationsStore = useNotificationsStore();
const telehealthStore = useTelehealthStore();

// Make telehealth store available globally
app.config.globalProperties.$telehealth = telehealthStore;

// Mount the app
app.mount('#app');

// AFTER app is mounted, initialize Pinia stores and services
// This ensures Pinia is fully initialized
setTimeout(async () => {
  try {
    // Set the store in the services
    notificationService.setNotificationsStore(notificationsStore);
    notificationSyncService.setNotificationsStore(notificationsStore);
    
    // Initialize services
    await notificationService.initialize();
    await notificationSyncService.initialize();
    
    // Initialize telehealth services if needed
    if (telehealthStore.initialize && typeof telehealthStore.initialize === 'function') {
      await telehealthStore.initialize();
    }
    
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}, 100);

// Initialize Firebase Messaging Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/'
  })
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Pass Firebase config to the service worker
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      };
      
      // Wait for the service worker to be ready before sending config
      const serviceWorker = registration.installing || registration.waiting || registration.active;
      if (serviceWorker) {
        serviceWorker.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
        
        console.log('Firebase config sent to service worker');
      }
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}