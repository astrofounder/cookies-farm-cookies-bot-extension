// Configuration file untuk Cookies Farm Extension
const CONFIG = {
  // Website target dengan konfigurasi detail
  WEBSITES: [

    {
      name: 'YouTube',
      url: 'https://youtube.com',
      icon: '📺',
      stayTime: 45000,
      actions: ['scroll', 'wait', 'click_video'],
      weight: 9,
      category: 'video',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      icon: '📘',
      stayTime: 40000,
      actions: ['scroll', 'wait', 'hover', 'social'],
      weight: 8,
      category: 'social',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: '🐦',
      stayTime: 35000,
      actions: ['scroll', 'wait', 'hover', 'social'],
      weight: 8,
      category: 'social',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: '📷',
      stayTime: 40000,
      actions: ['scroll', 'wait', 'hover', 'social'],
      weight: 7,
      category: 'social',
      userAgent: 'chrome-mobile' // Mobile user agent untuk Instagram
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: '💼',
      stayTime: 30000,
      actions: ['scroll', 'wait'],
      weight: 6,
      category: 'professional',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'Reddit',
      url: 'https://reddit.com',
      icon: '🤖',
      stayTime: 35000,
      actions: ['scroll', 'wait', 'hover'],
      weight: 7,
      category: 'forum',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'Amazon',
      url: 'https://amazon.com',
      icon: '🛒',
      stayTime: 45000,
      actions: ['scroll', 'wait', 'hover'],
      weight: 6,
      category: 'ecommerce',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'Wikipedia',
      url: 'https://wikipedia.org',
      icon: '📚',
      stayTime: 25000,
      actions: ['scroll', 'wait'],
      weight: 5,
      category: 'reference',
      userAgent: 'chrome-desktop'
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: '💻',
      stayTime: 30000,
      actions: ['scroll', 'wait'],
      weight: 4,
      category: 'development',
      userAgent: 'chrome-desktop'
    }
  ],

  // Pengaturan delay dan timing
  TIMING: {
    MIN_DELAY_BETWEEN_WEBSITES: 5000,   // 5 detik
    MAX_DELAY_BETWEEN_WEBSITES: 15000,  // 15 detik
    MIN_STAY_TIME: 20000,               // 20 detik
    MAX_STAY_TIME: 120000,              // 2 menit
    MIN_ACTION_DELAY: 1000,             // 1 detik
    MAX_ACTION_DELAY: 5000,             // 5 detik
    SCROLL_DURATION: {
      MIN: 500,
      MAX: 1500
    },
    TYPING_DELAY: {
      MIN: 50,
      MAX: 150
    }
  },

  // Konfigurasi anti-detect
  ANTI_DETECT: {
    RANDOM_MOUSE_MOVEMENT: true,
    VARIABLE_SCROLL_SPEED: true,
    RANDOM_CLICK_PATTERNS: true,
    HUMAN_LIKE_TIMING: true,
    RANDOM_VIEWPORT_SIZES: false, // Disabled: Redundant with Anti-Detect Browser
    RANDOM_USER_AGENTS: false,    // Disabled: Redundant with Anti-Detect Browser
    HEADLESS_DETECTION: true,
    CLICK_COOKIE_CONSENTS: true
  },

  // Selektor untuk Cookie Consent Banners
  COOKIE_CONSENT_SELECTORS: [
    // ID based
    '#accept-cookies', '#cookie-accept', '#acceptAll', '#onetrust-accept-btn-handler',
    // Class based
    '.cc-btn', '.cc-allow', '.cc-accept', '.js-cookie-accept', '.cookie-consent__accept',
    // Attribute based
    '[aria-label="Accept cookies"]', '[aria-label="Accept all cookies"]',
    'button[data-testid="cookie-policy-manage-accept-all"]',
    // Text content approximations (will be handled by logic, but common classes help)
    'button[name="agree"]', 'button[name="accept"]'
  ],

  // Konfigurasi browser behavior
  BEHAVIOR: {
    TAB_IN_BACKGROUND: true,
    TAB_MUTED: true,
    PRELOAD_IMAGES: false,
    EXECUTE_SCRIPTS: true,
    BLOCK_POPUPS: true,
    CLEAR_COOKIES: false,
    RANDOM_REFERRER: true,
    AUTO_CLOSE_OTHER_TABS: false // Disabled for RPA compatibility
  },

  // Search queries untuk Google
  SEARCH_QUERIES: [
    'javascript tutorial',
    'web development best practices',
    'programming languages comparison',
    'how to learn coding',
    'frontend development tools',
    'backend development frameworks',
    'machine learning basics',
    'data science tutorial',
    'cloud computing services',
    'cybersecurity fundamentals',
    'mobile app development',
    'software engineering principles'
  ],

  // Viewport sizes untuk randomization (experimental)
  VIEWPORT_SIZES: [
    { width: 1920, height: 1080 }, // Desktop
    { width: 1366, height: 768 },  // Laptop
    { width: 1440, height: 900 },  // Desktop
    { width: 1536, height: 864 },  // Laptop
    { width: 1280, height: 720 }   // Desktop
  ],

  // User agents untuk randomization (experimental)
  USER_AGENTS: {
    'chrome-desktop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'chrome-mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'firefox-desktop': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'safari-desktop': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  },

  // Referrers untuk randomization
  REFERRERS: [
    'https://google.com',
    'https://facebook.com',
    'https://twitter.com',
    'https://linkedin.com',
    'https://reddit.com',
    'https://youtube.com',
    'direct' // No referrer
  ],

  // Konfigurasi logging dan debugging
  LOGGING: {
    ENABLE_CONSOLE_LOGS: true,
    ENABLE_DEBUG_MODE: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    MAX_LOG_ENTRIES: 1000,
    EXPORT_FORMAT: 'json'
  },

  // Konfigurasi statistik
  STATISTICS: {
    TRACK_WEBSITE_VISITS: true,
    TRACK_ACTION_PERFORMANCE: true,
    TRACK_ERROR_RATES: true,
    TRACK_SESSION_DURATION: true,
    TRACK_SUCCESS_RATE: true,
    RESET_ON_STARTUP: false
  },

  // Konfigurasi security
  SECURITY: {
    BLOCK_MALICIOUS_SCRIPTS: true,
    SANITIZE_INPUTS: true,
    VALIDATE_URLS: true,
    HTTPS_ONLY: true,
    BLOCK_TRACKERS: false
  },

  // Konfigurasi performance
  PERFORMANCE: {
    MAX_CONCURRENT_TABS: 3,
    TAB_TIMEOUT: 60000, // 1 menit
    MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB
    CPU_THRESHOLD: 80, // 80%
    NETWORK_TIMEOUT: 30000 // 30 detik
  }
};

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

// Fungsi helper untuk mendapatkan konfigurasi dinamis
class ConfigManager {
  constructor() {
    this.config = CONFIG;
    this.userOverrides = {};
  }

  // Override konfigurasi dengan user settings
  overrideSettings(settings) {
    this.userOverrides = { ...this.userOverrides, ...settings };
  }

  // Mendapatkan konfigurasi dengan user overrides
  get(path) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  // Mendapatkan website berdasarkan kategori
  getWebsitesByCategory(category) {
    return this.config.WEBSITES.filter(site => site.category === category);
  }

  // Mendapatkan website berdasarkan weight
  getWeightedWebsites() {
    const weighted = [];
    this.config.WEBSITES.forEach(site => {
      for (let i = 0; i < site.weight; i++) {
        weighted.push(site);
      }
    });
    return weighted;
  }

  // Mendapatkan random website berdasarkan weight
  getRandomWebsite() {
    const weighted = this.getWeightedWebsites();
    const randomIndex = Math.floor(Math.random() * weighted.length);
    return weighted[randomIndex];
  }

  // Mendapatkan random search query
  getRandomSearchQuery() {
    const queries = this.config.SEARCH_QUERIES;
    return queries[Math.floor(Math.random() * queries.length)];
  }

  // Mendapatkan random delay
  getRandomDelay(minPath, maxPath) {
    const min = this.get(minPath);
    const max = this.get(maxPath);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Mendapatkan random viewport size
  getRandomViewport() {
    const viewports = this.config.VIEWPORT_SIZES;
    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  // Mendapatkan random user agent
  getRandomUserAgent(type = 'chrome-desktop') {
    return this.config.USER_AGENTS[type] || this.config.USER_AGENTS['chrome-desktop'];
  }

  // Mendapatkan random referrer
  getRandomReferrer() {
    const referrers = this.config.REFERRERS;
    return referrers[Math.floor(Math.random() * referrers.length)];
  }

  // Validasi konfigurasi
  validateConfig() {
    const errors = [];

    // Validasi website URLs
    this.config.WEBSITES.forEach((site, index) => {
      if (!site.url || !site.url.startsWith('http')) {
        errors.push(`Invalid URL for website ${index}: ${site.url}`);
      }
    });

    // Validasi timing
    if (this.config.TIMING.MIN_DELAY_BETWEEN_WEBSITES >= this.config.TIMING.MAX_DELAY_BETWEEN_WEBSITES) {
      errors.push('MIN_DELAY_BETWEEN_WEBSITES must be less than MAX_DELAY_BETWEEN_WEBSITES');
    }

    return errors;
  }
}

// Export ConfigManager
if (typeof module !== 'undefined' && module.exports) {
  module.exports.ConfigManager = ConfigManager;
} else if (typeof window !== 'undefined') {
  window.ConfigManager = ConfigManager;
}