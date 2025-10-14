// Configuration object for environment variables
const config = {
  // App Information
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Empathy',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3019',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3019',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  
  // Feature Flags
  ENABLE_WEBSOCKET: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
  ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  
  // Third-party Services
  CLOUDINARY: {
    CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  },
  
  // Performance
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  BUNDLE_ANALYZER: import.meta.env.VITE_BUNDLE_ANALYZER === 'true',
  
  // Security
  ENABLE_HTTPS: import.meta.env.VITE_ENABLE_HTTPS === 'true',
  
  // Analytics
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
  HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID,
  
  // Error Tracking
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  
  // Helper methods
  isDevelopment: () => config.ENVIRONMENT === 'development',
  isProduction: () => config.ENVIRONMENT === 'production',
  isStaging: () => config.ENVIRONMENT === 'staging',
  
  // Debug logging (only in development)
  log: (...args) => {
    if (config.ENABLE_DEBUG_MODE) {
      console.log('[Config]', ...args);
    }
  },
  
  // Validate required configuration
  validate: () => {
    const required = ['API_BASE_URL'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing);
      return false;
    }
    
    return true;
  }
};

// Validate configuration on load
if (!config.validate()) {
  console.error('Configuration validation failed');
}

export default config;