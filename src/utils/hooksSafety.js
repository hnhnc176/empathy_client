/**
 * Safety utilities for React hooks to prevent null reference errors
 */

/**
 * Safe wrapper for hooks that might fail
 * @param {Function} hookFn - Hook function to execute safely
 * @param {*} fallbackValue - Value to return if hook fails
 * @param {...any} args - Arguments to pass to the hook
 * @returns {*} Hook result or fallback value
 */
export const safeUseHook = (hookFn, fallbackValue, ...args) => {
  try {
    // Check if React and hooks are available
    if (typeof React === 'undefined' || !React.useState) {
      console.warn('React hooks not available, using fallback');
      return fallbackValue;
    }
    
    return hookFn(...args);
  } catch (error) {
    console.error('Hook execution failed:', error);
    return fallbackValue;
  }
};

/**
 * Safe socket hook that returns empty object if not available
 * @param {Object} user - User object
 * @param {string} token - Auth token
 * @returns {Object} Socket state or fallback object
 */
export const safeUseSocket = (user, token) => {
  const fallbackSocket = {
    connectionStatus: 'disconnected',
    isConnected: false,
    notifications: [],
    onlineUsers: [],
    realTimeUpdates: { posts: [], likes: [], comments: [] },
    sendLikeUpdate: () => false,
    sendCommentUpdate: () => false,
    sendPostUpdate: () => false,
    joinRoom: () => false,
    leaveRoom: () => false,
    markNotificationAsRead: () => {},
    clearNotifications: () => {},
    requestNotificationPermission: () => Promise.resolve(false),
    socketService: null
  };

  // Only use socket if user is authenticated
  if (!user || !token) {
    return fallbackSocket;
  }

  try {
    const useSocket = require('../hooks/useSocket').default;
    return useSocket(user, token);
  } catch (error) {
    console.error('useSocket hook failed:', error);
    return fallbackSocket;
  }
};

/**
 * Safe wrapper for useInfiniteScroll hook
 * @param {Function} fetchMore - Function to fetch more data
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} loading - Whether data is currently being loaded
 * @param {number} threshold - Distance from bottom to trigger load (pixels)
 * @returns {Object} Infinite scroll state or fallback object
 */
export const safeUseInfiniteScroll = (fetchMore, hasMore, loading, threshold = 100) => {
  const fallbackInfiniteScroll = {
    isFetching: false,
    setIsFetching: () => {}
  };

  // Validate parameters
  if (typeof fetchMore !== 'function') {
    console.warn('fetchMore must be a function for useInfiniteScroll');
    return fallbackInfiniteScroll;
  }

  try {
    const useInfiniteScroll = require('../hooks/useInfiniteScroll').default;
    return useInfiniteScroll(fetchMore, hasMore, loading, threshold);
  } catch (error) {
    console.error('useInfiniteScroll hook failed:', error);
    return fallbackInfiniteScroll;
  }
};

/**
 * Checks if React hooks are available
 * @returns {boolean} True if hooks are available
 */
export const areHooksAvailable = () => {
  try {
    return typeof React !== 'undefined' && 
           typeof React.useState === 'function' &&
           typeof React.useEffect === 'function';
  } catch {
    return false;
  }
};

/**
 * Safe wrapper for any hook with error boundary
 * @param {Function} hookFunction - Hook to execute
 * @param {Array} dependencies - Hook dependencies
 * @param {*} fallback - Fallback value
 * @returns {*} Hook result or fallback
 */
export const withHookErrorBoundary = (hookFunction, dependencies = [], fallback = null) => {
  if (!areHooksAvailable()) {
    return fallback;
  }

  try {
    return hookFunction();
  } catch (error) {
    console.error('Hook error boundary caught:', error);
    return fallback;
  }
};