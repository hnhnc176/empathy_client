// Test API connectivity and CORS configuration
import axiosInstance from '../config/axios';

class APITestService {
  static async testConnection() {
    try {
      console.log('🔧 Testing API connection...');
      
      // Test basic connectivity
      const response = await axiosInstance.get('/api/test');
      console.log('✅ API connection successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ API connection failed:', error);
      
      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
        console.error('🚫 CORS Error detected - check backend configuration');
        return { 
          success: false, 
          error: 'CORS', 
          message: 'Backend CORS not configured for this origin' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.status || 'NETWORK_ERROR',
        message: error.message 
      };
    }
  }

  static async testAuth() {
    try {
      console.log('🔐 Testing auth endpoints...');
      
      // Test auth endpoints (these should work even without authentication)
      const response = await axiosInstance.post('/api/users/test', {});
      console.log('✅ Auth endpoint reachable:', response.status);
      return { success: true };
    } catch (error) {
      console.log('ℹ️ Auth test result:', error.response?.status || error.message);
      
      // 404 or 405 is actually good - means endpoint is reachable
      if (error.response?.status === 404 || error.response?.status === 405) {
        return { success: true, note: 'Endpoint reachable (404/405 expected)' };
      }
      
      return { success: false, error: error.message };
    }
  }

  static async testForgotPassword(email = 'test@example.com') {
    try {
      console.log('📧 Testing forgot password endpoint...');
      
      const response = await axiosInstance.post('/api/users/forgot-password', {
        email: email
      });
      
      console.log('✅ Forgot password endpoint working:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('ℹ️ Forgot password test:', error.response?.status, error.response?.data);
      
      // Even if the email doesn't exist, a 400/404 means the endpoint is working
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return { 
          success: true, 
          note: 'Endpoint working (validation error expected for test email)' 
        };
      }
      
      return { success: false, error: error.message };
    }
  }

  static async runAllTests() {
    console.log('🧪 Running API connectivity tests...');
    
    const results = {
      connection: await this.testConnection(),
      auth: await this.testAuth(),
      forgotPassword: await this.testForgotPassword()
    };
    
    console.log('📊 Test Results:', results);
    
    const allPassed = Object.values(results).every(result => result.success);
    
    if (allPassed) {
      console.log('🎉 All API tests passed! CORS is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check backend server and CORS configuration.');
    }
    
    return results;
  }
}

export default APITestService;