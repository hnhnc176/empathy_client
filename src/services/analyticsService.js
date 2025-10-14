// Analytics service for tracking user behavior and performance metrics
import config from '../config/environment';

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.pendingEvents = [];
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      interactions: 0,
    };
    
    this.init();
  }

  async init() {
    if (!config.ENABLE_ANALYTICS) {
      console.log('Analytics disabled by configuration');
      return;
    }

    try {
      await Promise.all([
        this.initGoogleAnalytics(),
        this.initHotjar(),
      ]);
      
      this.setupPageTracking();
      this.setupPerformanceTracking();
      this.flushPendingEvents();
      this.isInitialized = true;
      
      console.log('Analytics initialized');
    } catch (error) {
      console.warn('Failed to initialize analytics:', error);
    }
  }

  async initGoogleAnalytics() {
    if (!config.GA_TRACKING_ID) {
      return;
    }

    try {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.GA_TRACKING_ID}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', config.GA_TRACKING_ID, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          custom_definition_1: 'user_type',
          custom_definition_2: 'feature_usage',
        },
      });

      console.log('Google Analytics initialized');
    } catch (error) {
      console.warn('Failed to initialize Google Analytics:', error);
    }
  }

  async initHotjar() {
    if (!config.HOTJAR_ID) {
      return;
    }

    try {
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:config.HOTJAR_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

      console.log('Hotjar initialized');
    } catch (error) {
      console.warn('Failed to initialize Hotjar:', error);
    }
  }

  setupPageTracking() {
    // Track page navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.trackPageView();
    };

    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Track initial page view
    this.trackPageView();
  }

  setupPerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPerformance();
      }, 0);
    });

    // Track Core Web Vitals
    this.trackWebVitals();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  trackPageView(path = window.location.pathname) {
    this.sessionData.pageViews++;
    
    const event = {
      type: 'page_view',
      path,
      title: document.title,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
    };

    if (this.isInitialized && window.gtag) {
      window.gtag('config', config.GA_TRACKING_ID, {
        page_path: path,
        page_title: document.title,
      });
    }

    this.trackEvent(event);
    
    if (config.ENABLE_DEBUG_MODE) {
      console.log('📊 Page view tracked:', path);
    }
  }

  trackEvent(eventData) {
    if (!config.ENABLE_ANALYTICS) return;

    const event = {
      ...eventData,
      timestamp: eventData.timestamp || Date.now(),
      sessionId: this.sessionData.sessionId,
      url: window.location.href,
    };

    if (this.isInitialized) {
      this.sendEvent(event);
    } else {
      this.pendingEvents.push(event);
    }
  }

  sendEvent(event) {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action || event.type, {
        event_category: event.category || 'user_interaction',
        event_label: event.label,
        value: event.value,
        custom_parameter_1: event.metadata?.userId,
        custom_parameter_2: event.metadata?.feature,
      });
    }

    // Send to custom analytics endpoint if needed
    if (config.isDevelopment() && config.ENABLE_DEBUG_MODE) {
      console.log('📊 Event tracked:', event);
    }
  }

  flushPendingEvents() {
    this.pendingEvents.forEach(event => this.sendEvent(event));
    this.pendingEvents = [];
  }

  // User interaction tracking
  trackUserInteraction(action, category = 'user_interaction', metadata = {}) {
    this.sessionData.interactions++;
    
    this.trackEvent({
      type: 'user_interaction',
      action,
      category,
      metadata: {
        ...metadata,
        sessionInteractions: this.sessionData.interactions,
      },
    });
  }

  // Feature usage tracking
  trackFeatureUsage(feature, action, metadata = {}) {
    this.trackEvent({
      type: 'feature_usage',
      action: `${feature}_${action}`,
      category: 'features',
      metadata: {
        feature,
        action,
        ...metadata,
      },
    });
  }

  // Error tracking (integrates with error tracker)
  trackError(error, context = {}) {
    this.trackEvent({
      type: 'error',
      action: 'error_occurred',
      category: 'errors',
      metadata: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  // Performance tracking
  trackPerformance() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const metrics = {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: this.getFirstPaint(),
      resourceLoadTime: timing.loadEventEnd - timing.domContentLoadedEventEnd,
    };

    this.trackEvent({
      type: 'performance',
      action: 'page_load_metrics',
      category: 'performance',
      metadata: metrics,
    });

    if (config.ENABLE_DEBUG_MODE) {
      console.table('📊 Performance metrics:', metrics);
    }
  }

  getFirstPaint() {
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }

  trackWebVitals() {
    // Track Largest Contentful Paint (LCP)
    this.observeWebVital('largest-contentful-paint', (entry) => {
      this.trackEvent({
        type: 'web_vital',
        action: 'lcp',
        category: 'performance',
        value: Math.round(entry.startTime),
        metadata: { element: entry.element?.tagName },
      });
    });

    // Track First Input Delay (FID)
    this.observeWebVital('first-input', (entry) => {
      this.trackEvent({
        type: 'web_vital',
        action: 'fid',
        category: 'performance',
        value: Math.round(entry.processingStart - entry.startTime),
        metadata: { eventType: entry.name },
      });
    });

    // Track Cumulative Layout Shift (CLS)
    this.observeWebVital('layout-shift', (entry) => {
      if (!entry.hadRecentInput) {
        this.trackEvent({
          type: 'web_vital',
          action: 'cls',
          category: 'performance',
          value: Math.round(entry.value * 1000),
          metadata: { sources: entry.sources?.length || 0 },
        });
      }
    });
  }

  observeWebVital(type, callback) {
    try {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(callback);
        });
        observer.observe({ type, buffered: true });
      }
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  // User journey tracking
  startUserJourney(journeyName, metadata = {}) {
    const journey = {
      name: journeyName,
      startTime: Date.now(),
      steps: [],
      metadata,
    };

    sessionStorage.setItem('current_user_journey', JSON.stringify(journey));
    
    this.trackEvent({
      type: 'user_journey',
      action: 'journey_started',
      category: 'user_flow',
      metadata: { journeyName, ...metadata },
    });
  }

  addJourneyStep(stepName, metadata = {}) {
    try {
      const journey = JSON.parse(sessionStorage.getItem('current_user_journey') || '{}');
      if (journey.name) {
        journey.steps.push({
          name: stepName,
          timestamp: Date.now(),
          metadata,
        });
        
        sessionStorage.setItem('current_user_journey', JSON.stringify(journey));
        
        this.trackEvent({
          type: 'user_journey',
          action: 'journey_step',
          category: 'user_flow',
          metadata: {
            journeyName: journey.name,
            stepName,
            stepIndex: journey.steps.length,
            ...metadata,
          },
        });
      }
    } catch (error) {
      console.warn('Failed to add journey step:', error);
    }
  }

  completeUserJourney(outcome = 'success', metadata = {}) {
    try {
      const journey = JSON.parse(sessionStorage.getItem('current_user_journey') || '{}');
      if (journey.name) {
        const duration = Date.now() - journey.startTime;
        
        this.trackEvent({
          type: 'user_journey',
          action: 'journey_completed',
          category: 'user_flow',
          metadata: {
            journeyName: journey.name,
            outcome,
            duration,
            steps: journey.steps.length,
            ...metadata,
          },
        });
        
        sessionStorage.removeItem('current_user_journey');
      }
    } catch (error) {
      console.warn('Failed to complete journey:', error);
    }
  }

  // Session tracking
  getSessionData() {
    return {
      ...this.sessionData,
      duration: Date.now() - this.sessionData.startTime,
    };
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Helper functions for React components
export const trackClick = (element, metadata = {}) => {
  analyticsService.trackUserInteraction('click', 'ui_interaction', {
    element,
    ...metadata,
  });
};

export const trackFormSubmit = (formName, success = true, metadata = {}) => {
  analyticsService.trackUserInteraction('form_submit', 'form_interaction', {
    formName,
    success,
    ...metadata,
  });
};

export const trackSearch = (query, results = 0, metadata = {}) => {
  analyticsService.trackFeatureUsage('search', 'performed', {
    query: query.substring(0, 100), // Limit query length for privacy
    resultsCount: results,
    ...metadata,
  });
};

export const trackPostInteraction = (action, postId, metadata = {}) => {
  analyticsService.trackFeatureUsage('post', action, {
    postId,
    ...metadata,
  });
};

export default analyticsService;