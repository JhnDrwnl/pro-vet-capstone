// Environment configuration for the application
const config = {
  // Chatbot Backend Configuration
  chatbot: {
    // Use environment variable or fallback to localhost for development
    apiUrl: import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3001',
    // Health check endpoint
    healthUrl: import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:3001',
  },
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // App environment
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
};

// Log configuration for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 Environment Config:', {
    chatbotApiUrl: config.chatbot.apiUrl,
    environment: config.appEnv,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction
  });
}

export default config;
