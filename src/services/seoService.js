// SEO optimization service for better search visibility and social sharing
import config from '../config/environment';

class SEOService {
  constructor() {
    this.defaultMeta = {
      title: 'Empathy - Community Discussion Platform',
      description: 'Join our supportive community where you can share experiences, seek advice, and connect with others who understand.',
      keywords: 'community, discussion, support, mental health, empathy, sharing',
      author: 'Empathy Team',
      type: 'website',
      image: '/assets/Logo.png',
      url: window.location.origin,
    };
    
    this.init();
  }

  init() {
    // Set default meta tags
    this.setDefaultMetaTags();
    
    // Add structured data
    this.addStructuredData();
    
    if (config.ENABLE_DEBUG_MODE) {
      console.log('SEO service initialized');
    }
  }

  setDefaultMetaTags() {
    this.updateMetaTags(this.defaultMeta);
  }

  updateMetaTags(meta) {
    const metaData = { ...this.defaultMeta, ...meta };
    
    // Update title
    document.title = metaData.title;
    
    // Update or create meta tags
    this.setMetaTag('description', metaData.description);
    this.setMetaTag('keywords', metaData.keywords);
    this.setMetaTag('author', metaData.author);
    this.setMetaTag('robots', metaData.robots || 'index,follow');
    
    // Open Graph tags for social media
    this.setMetaProperty('og:title', metaData.title);
    this.setMetaProperty('og:description', metaData.description);
    this.setMetaProperty('og:type', metaData.type);
    this.setMetaProperty('og:url', metaData.url || window.location.href);
    this.setMetaProperty('og:image', this.getFullImageUrl(metaData.image));
    this.setMetaProperty('og:site_name', config.APP_NAME);
    this.setMetaProperty('og:locale', 'vi_VN');
    
    // Twitter Card tags
    this.setMetaName('twitter:card', 'summary_large_image');
    this.setMetaName('twitter:title', metaData.title);
    this.setMetaName('twitter:description', metaData.description);
    this.setMetaName('twitter:image', this.getFullImageUrl(metaData.image));
    
    // Additional meta tags for mobile and PWA
    this.setMetaName('viewport', 'width=device-width, initial-scale=1.0');
    this.setMetaName('theme-color', '#4F46E5'); // Tailwind indigo-600
    this.setMetaName('mobile-web-app-capable', 'yes'); // Updated from apple-mobile-web-app-capable
    this.setMetaName('apple-mobile-web-app-status-bar-style', 'default');
  }

  setMetaTag(name, content) {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  setMetaProperty(property, content) {
    if (!content) return;
    
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  setMetaName(name, content) {
    if (!content) return;
    
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  getFullImageUrl(imagePath) {
    if (!imagePath) return this.defaultMeta.image;
    if (imagePath.startsWith('http')) return imagePath;
    return `${window.location.origin}${imagePath}`;
  }

  addStructuredData() {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": config.APP_NAME,
      "description": this.defaultMeta.description,
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": config.APP_NAME,
        "logo": {
          "@type": "ImageObject",
          "url": this.getFullImageUrl("/assets/Logo.png")
        }
      }
    };

    this.addJSONLD(structuredData);
  }

  addJSONLD(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Page-specific SEO updates
  updatePageSEO(pageData) {
    const { type, title, description, image, url, keywords } = pageData;
    
    const metaData = {
      title: title ? `${title} | ${config.APP_NAME}` : this.defaultMeta.title,
      description: description || this.defaultMeta.description,
      image: image || this.defaultMeta.image,
      url: url || window.location.href,
      keywords: keywords || this.defaultMeta.keywords,
      type: type || 'article',
    };
    
    this.updateMetaTags(metaData);
    
    // Add canonical link
    this.setCanonicalUrl(metaData.url);
  }

  updatePostSEO(post) {
    if (!post) return;
    
    const title = post.title || post.content?.substring(0, 60) + '...';
    const description = post.content?.substring(0, 160) + '...';
    const image = post.image || this.defaultMeta.image;
    
    this.updatePageSEO({
      type: 'article',
      title,
      description,
      image,
      keywords: `${this.defaultMeta.keywords}, ${post.tag || ''}`,
    });
    
    // Add article structured data
    const articleData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": this.getFullImageUrl(image),
      "datePublished": post.created_at,
      "dateModified": post.updated_at || post.created_at,
      "author": {
        "@type": "Person",
        "name": post.user?.username || 'Anonymous'
      },
      "publisher": {
        "@type": "Organization",
        "name": config.APP_NAME,
        "logo": {
          "@type": "ImageObject",
          "url": this.getFullImageUrl("/assets/Logo.png")
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };
    
    this.addJSONLD(articleData);
  }

  updateProfileSEO(user) {
    if (!user) return;
    
    const title = `${user.username} - Profile`;
    const description = `View ${user.username}'s profile and posts on ${config.APP_NAME}`;
    const image = user.profile_pic || this.defaultMeta.image;
    
    this.updatePageSEO({
      type: 'profile',
      title,
      description,
      image,
    });
    
    // Add person structured data
    const personData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": user.username,
      "image": this.getFullImageUrl(image),
      "url": window.location.href,
      "sameAs": []
    };
    
    this.addJSONLD(personData);
  }

  setCanonicalUrl(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  // Breadcrumb structured data
  addBreadcrumbData(breadcrumbs) {
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
    
    this.addJSONLD(breadcrumbData);
  }

  // Generate sitemap data (for client-side routes)
  generateSitemapData() {
    const routes = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/community', priority: 0.9, changefreq: 'hourly' },
      { url: '/about', priority: 0.7, changefreq: 'monthly' },
      { url: '/signin', priority: 0.5, changefreq: 'monthly' },
      { url: '/signup', priority: 0.5, changefreq: 'monthly' },
    ];
    
    return routes.map(route => ({
      ...route,
      url: `${window.location.origin}${route.url}`,
      lastmod: new Date().toISOString(),
    }));
  }

  // Performance optimization for SEO
  preloadCriticalResources() {
    // Preload critical fonts
    this.preloadResource('/fonts/inter-var.woff2', 'font', 'font/woff2');
    
    // Preload critical images
    this.preloadResource('/assets/Logo.png', 'image');
    
    // Preconnect to external domains
    this.preconnectDomain('https://fonts.googleapis.com');
    this.preconnectDomain('https://fonts.gstatic.com');
    
    if (config.CLOUDINARY.CLOUD_NAME) {
      this.preconnectDomain(`https://res.cloudinary.com`);
    }
  }

  preloadResource(href, as, type = null) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  preconnectDomain(domain) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Rich snippets for posts
  generatePostSnippet(post) {
    if (!post) return '';
    
    const snippet = {
      title: post.title || post.content?.substring(0, 60),
      description: post.content?.substring(0, 160),
      url: `${window.location.origin}/post/${post._id}`,
      image: post.image,
      author: post.user?.username,
      datePublished: post.created_at,
      interactionCount: post.likes?.length || 0,
    };
    
    return snippet;
  }

  // Social media optimization
  updateSocialTags(data) {
    const { title, description, image, url, type = 'article' } = data;
    
    // Facebook/Open Graph
    this.setMetaProperty('og:title', title);
    this.setMetaProperty('og:description', description);
    this.setMetaProperty('og:image', this.getFullImageUrl(image));
    this.setMetaProperty('og:url', url || window.location.href);
    this.setMetaProperty('og:type', type);
    
    // Twitter
    this.setMetaName('twitter:title', title);
    this.setMetaName('twitter:description', description);
    this.setMetaName('twitter:image', this.getFullImageUrl(image));
    
    // LinkedIn
    this.setMetaProperty('article:author', data.author);
    this.setMetaProperty('article:published_time', data.publishedTime);
    this.setMetaProperty('article:tag', data.tags);
  }

  // SEO-friendly URL generation
  generateSEOFriendlySlug(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 50); // Limit length
  }

  // Generate meta description from content
  generateMetaDescription(content, maxLength = 160) {
    if (!content) return this.defaultMeta.description;
    
    // Remove HTML tags if any
    const cleanContent = content.replace(/<[^>]*>/g, '');
    
    // Truncate and add ellipsis
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    
    return cleanContent.substring(0, maxLength - 3).trim() + '...';
  }
}

// Create singleton instance
const seoService = new SEOService();

export default seoService;