// Web.config for performance optimization
const webConfig = {
  // Cache strategies
  cacheStrategies: {
    // Static assets cache for 1 year
    staticAssets: {
      pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/,
      strategy: 'cache-first',
      ttl: 365 * 24 * 60 * 60 * 1000 // 1 year
    },
    
    // API responses cache for 5 minutes
    apiResponses: {
      pattern: /\/api\//,
      strategy: 'stale-while-revalidate',
      ttl: 5 * 60 * 1000 // 5 minutes
    },
    
    // HTML pages cache for 1 day
    htmlPages: {
      pattern: /\.html$/,
      strategy: 'network-first',
      ttl: 24 * 60 * 60 * 1000 // 1 day
    }
  },
  
  // Performance budgets
  performanceBudgets: {
    // Maximum bundle sizes (in KB)
    maxJSBundle: 250,
    maxCSSBundle: 50,
    maxImageSize: 200,
    maxFontSize: 100,
    
    // Performance metrics targets
    targetLCP: 2500, // ms
    targetFID: 100,  // ms
    targetCLS: 0.1,  // score
    targetFCP: 1800, // ms
    targetTTFB: 800  // ms
  },
  
  // Image optimization
  imageOptimization: {
    // Modern formats
    supportedFormats: ['webp', 'avif'],
    
    // Responsive breakpoints
    breakpoints: [320, 640, 768, 1024, 1280, 1920],
    
    // Quality settings
    quality: {
      webp: 85,
      avif: 80,
      jpeg: 85,
      png: 90
    },
    
    // Lazy loading settings
    lazyLoading: {
      rootMargin: '50px',
      threshold: 0.1
    }
  },
  
  // Font optimization
  fontOptimization: {
    // Preload critical fonts
    preloadFonts: [
      '/fonts/inter-var.woff2'
    ],
    
    // Font display strategy
    fontDisplay: 'swap',
    
    // Subset characters (Vietnamese + English)
    subset: 'latin,vietnamese'
  },
  
  // Critical resources
  criticalResources: {
    // Above-the-fold CSS
    criticalCSS: [
      '/css/critical.css'
    ],
    
    // Essential JavaScript
    criticalJS: [
      '/js/runtime.js',
      '/js/vendors.js'
    ],
    
    // Hero images
    heroImages: [
      '/assets/hero-bg.webp'
    ]
  }
};

export default webConfig;