import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import '@/assets/styles/tailwind.css'

// Create the app
const app = createApp(App);

// Use Pinia for state management
app.use(createPinia());

// Use router for routing
app.use(router);

// Mount the app
app.mount('#app');
