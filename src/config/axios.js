import axios from 'axios';

// Create axios instance with enhanced configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3019',
  timeout: 15000, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  retry: 3,
  retryDelay: (retryCount) => retryCount * 1000, // Progressive delay
});

// Request interceptor with enhanced error handling
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for timeout tracking
      config.metadata = { startTime: new Date() };

      if (import.meta.env.DEV) {
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          data: config.data,
          params: config.params
        });
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor with enhanced error handling and retry logic
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Skip retry for specific status codes
    const skipRetryStatuses = [400, 401, 403, 422];
    if (response && skipRetryStatuses.includes(response.status)) {
      return Promise.reject(error);
    }

    // Implement retry logic
    config.retryCount = config.retryCount || 0;
    if (config.retryCount < config.retry) {
      config.retryCount += 1;
      const delay = config.retryDelay(config.retryCount);

      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delay));

      console.warn(`Retrying request (${config.retryCount}/${config.retry}):`, config.url);
      return axiosInstance(config);
    }

    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        status: response?.status,
        message: error.message,
        data: response?.data,
        retryAttempts: config.retryCount
      });
    }

    // Handle specific error cases
    if (response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // You might want to redirect to login or refresh token here
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
