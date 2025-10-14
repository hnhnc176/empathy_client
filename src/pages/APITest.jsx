import React, { useState, useEffect } from 'react';
import APITestService from '../services/apiTestService';

const APITestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      const results = await APITestService.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">API Connectivity Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">CORS & API Tests</h2>
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md"
            >
              {loading ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Testing API connectivity...</p>
            </div>
          )}
          
          {testResults && !loading && (
            <div className="space-y-4">
              {testResults.error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>Error:</strong> {testResults.error}
                </div>
              ) : (
                <div className="grid gap-4">
                  {/* Connection Test */}
                  <div className={`p-4 rounded-md ${testResults.connection?.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                    <h3 className="font-semibold flex items-center">
                      <span className={`mr-2 ${testResults.connection?.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.connection?.success ? '✅' : '❌'}
                      </span>
                      Basic Connection Test
                    </h3>
                    <p className="text-sm mt-1">
                      {testResults.connection?.success 
                        ? 'API server is reachable and CORS is working'
                        : `Failed: ${testResults.connection?.message || 'Unknown error'}`
                      }
                    </p>
                  </div>
                  
                  {/* Auth Test */}
                  <div className={`p-4 rounded-md ${testResults.auth?.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                    <h3 className="font-semibold flex items-center">
                      <span className={`mr-2 ${testResults.auth?.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.auth?.success ? '✅' : '❌'}
                      </span>
                      Auth Endpoints Test
                    </h3>
                    <p className="text-sm mt-1">
                      {testResults.auth?.success 
                        ? testResults.auth?.note || 'Auth endpoints are reachable'
                        : `Failed: ${testResults.auth?.error || 'Unknown error'}`
                      }
                    </p>
                  </div>
                  
                  {/* Forgot Password Test */}
                  <div className={`p-4 rounded-md ${testResults.forgotPassword?.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                    <h3 className="font-semibold flex items-center">
                      <span className={`mr-2 ${testResults.forgotPassword?.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.forgotPassword?.success ? '✅' : '❌'}
                      </span>
                      Forgot Password Test
                    </h3>
                    <p className="text-sm mt-1">
                      {testResults.forgotPassword?.success 
                        ? testResults.forgotPassword?.note || 'Forgot password endpoint is working'
                        : `Failed: ${testResults.forgotPassword?.error || 'Unknown error'}`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Troubleshooting CORS Issues</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Check Backend Server:</strong>
              <p>Make sure your backend is running on <code className="bg-gray-100 px-1 rounded">http://localhost:3019</code></p>
            </div>
            <div>
              <strong>2. Verify CORS Configuration:</strong>
              <p>Backend should allow origins: <code className="bg-gray-100 px-1 rounded">http://localhost:3001</code></p>
            </div>
            <div>
              <strong>3. Clear Browser Cache:</strong>
              <p>Sometimes browsers cache CORS preflight requests</p>
            </div>
            <div>
              <strong>4. Check Network Tab:</strong>
              <p>Look for OPTIONS requests and their responses in DevTools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITestPage;