// Error tracking service for production monitoring
import config from '../config/environment';

class ErrorTracker {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (config.isProduction() && config.SENTRY_DSN) {
      this.initSentry();
    } else if (config.isDevelopment()) {
      this.initDevMode();
    }
    
    // Global error handlers
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }

  async initSentry() {
    try {
      // Dynamic import for Sentry to avoid bundling in development
      const { init, configureScope } = await import('@sentry/react');
      
      init({
        dsn: config.SENTRY_DSN,
        environment: config.SENTRY_ENVIRONMENT || config.ENVIRONMENT,
        tracesSampleRate: 1.0,
        beforeSend: (event) => {
          // Filter out non-essential errors
          if (this.shouldIgnoreError(event)) {
            return null;
          }
          return event;
        },
      });

      configureScope((scope) => {
        scope.setTag('component', 'empathy-frontend');
        scope.setContext('app', {
          name: config.APP_NAME,
          version: import.meta.env.PACKAGE_VERSION || '1.0.0',
        });
      });

      console.log('Sentry initialized for error tracking');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
      this.initDevMode();
    }
  }

  initDevMode() {
    console.log('Error tracking initialized in development mode');
  }

  setupGlobalErrorHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandledrejection',
        promise: event.promise,
      });
    });

    // Catch global JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // React error boundary fallback
    window.addEventListener('react-error', (event) => {
      this.captureError(event.detail.error, {
        type: 'react',
        componentStack: event.detail.componentStack,
      });
    });
  }

  shouldIgnoreError(event) {
    const ignoredErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
      'AbortError',
    ];

    const errorMessage = event.exception?.values?.[0]?.value || event.message || '';
    return ignoredErrors.some(ignored => errorMessage.includes(ignored));
  }

  captureError(error, context = {}) {
    if (!this.isInitialized) {
      console.error('ErrorTracker not initialized:', error);
      return;
    }

    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    if (config.isProduction() && window.Sentry) {
      // Send to Sentry in production
      window.Sentry.captureException(error, {
        extra: errorInfo,
        tags: {
          component: context.component || 'unknown',
          type: context.type || 'error',
        },
      });
    } else {
      // Log to console in development
      console.group('🔴 Error Tracked');
      console.error('Error:', error);
      console.table(errorInfo);
      console.groupEnd();
    }

    // Always log to local storage for debugging
    this.logToLocalStorage(errorInfo);
  }

  captureMessage(message, level = 'info', context = {}) {
    if (config.isProduction() && window.Sentry) {
      window.Sentry.captureMessage(message, level, {
        extra: context,
      });
    } else if (config.ENABLE_DEBUG_MODE) {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  logToLocalStorage(errorInfo) {
    try {
      const errors = JSON.parse(localStorage.getItem('empathy_errors') || '[]');
      errors.push(errorInfo);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('empathy_errors', JSON.stringify(errors));
    } catch (err) {
      console.warn('Failed to log error to localStorage:', err);
    }
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('empathy_errors') || '[]');
    } catch (error) {
      return [];
    }
  }

  clearStoredErrors() {
    try {
      localStorage.removeItem('empathy_errors');
    } catch (error) {
      console.warn('Failed to clear stored errors:', error);
    }
  }

  // Performance monitoring
  measurePerformance(name, fn) {
    if (!config.ENABLE_PERFORMANCE_MONITORING) {
      return fn();
    }

    const startTime = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.logPerformance(name, startTime);
        });
      } else {
        this.logPerformance(name, startTime);
        return result;
      }
    } catch (error) {
      this.logPerformance(name, startTime, error);
      throw error;
    }
  }

  logPerformance(name, startTime, error = null) {
    const duration = performance.now() - startTime;
    
    if (config.ENABLE_DEBUG_MODE) {
      console.log(`⏱️ Performance: ${name} took ${duration.toFixed(2)}ms`, {
        error: error?.message,
      });
    }

    if (config.isProduction() && window.Sentry && duration > 1000) {
      // Log slow operations to Sentry
      window.Sentry.captureMessage(`Slow operation: ${name}`, 'warning', {
        extra: { duration, error: error?.message },
      });
    }
  }

  // User feedback collection
  showFeedbackDialog(error) {
    if (config.isProduction() && window.Sentry?.showReportDialog) {
      window.Sentry.showReportDialog({
        eventId: window.Sentry.lastEventId(),
        title: 'Something went wrong',
        subtitle: 'Our team has been notified. If you\'d like to help, tell us what happened below.',
        subtitle2: 'Your feedback helps us improve the experience.',
      });
    }
  }
}

// Create singleton instance
const errorTracker = new ErrorTracker();

// Helper functions for React components
export const withErrorTracking = (component, componentName) => {
  return (...args) => {
    try {
      return component(...args);
    } catch (error) {
      errorTracker.captureError(error, {
        component: componentName,
        type: 'component-render',
      });
      throw error;
    }
  };
};

export const trackAsyncOperation = async (operation, operationName) => {
  try {
    return await errorTracker.measurePerformance(operationName, operation);
  } catch (error) {
    errorTracker.captureError(error, {
      operation: operationName,
      type: 'async-operation',
    });
    throw error;
  }
};

export default errorTracker;