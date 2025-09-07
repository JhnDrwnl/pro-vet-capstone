// Production environment configuration
const config = {
  // Chatbot Backend Configuration
  chatbot: {
    // Production URL - loaded from .env.production
    apiUrl: import.meta.env.VITE_CHATBOT_API_URL || 'https://provet-chatbot-11640508724.us-central1.run.app',
    healthUrl: import.meta.env.VITE_CHATBOT_API_URL || 'https://provet-chatbot-11640508724.us-central1.run.app',
  },
  
  // Environment detection
  isDevelopment: false,
  isProduction: true,
  
  // App environment
  appEnv: 'production',
};

export default config;

