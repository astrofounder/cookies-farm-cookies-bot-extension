// Content script untuk interaksi dengan website
class HumanBehaviorSimulator {
  constructor() {
    this.isSimulating = false;
    this.actions = [];
  }

  // Fungsi untuk random delay
  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Fungsi untuk random mouse movement (enhanced with trail)
  async randomMouseMove() {
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    const endX = Math.random() * window.innerWidth;
    const endY = Math.random() * window.innerHeight;

    const steps = this.randomDelay(15, 30); // More steps for smoother trail

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      // Add slight curve using easing
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const x = startX + (endX - startX) * easedProgress;
      const y = startY + (endY - startY) * easedProgress;

      // Add small random jitter for realism
      const jitterX = x + (Math.random() - 0.5) * 5;
      const jitterY = y + (Math.random() - 0.5) * 5;

      const event = new MouseEvent('mousemove', {
        clientX: jitterX,
        clientY: jitterY,
        bubbles: true
      });

      document.dispatchEvent(event);
      await this.delay(this.randomDelay(10, 50));
    }
  }

  // Simulate mouse trail before important actions
  async simulateMouseTrail() {
    // Multiple random movements to simulate human browsing
    const movements = this.randomDelay(2, 4);
    for (let i = 0; i < movements; i++) {
      await this.randomMouseMove();
      await this.delay(this.randomDelay(100, 500));
    }
  }

  // Fungsi untuk scroll halaman
  async scrollPage() {
    const scrollHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = scrollHeight - viewportHeight;

    if (maxScroll <= 0) return;

    // Scroll ke beberapa posisi random
    const scrollPositions = [
      Math.random() * maxScroll * 0.3, // 30% dari atas
      Math.random() * maxScroll * 0.6 + maxScroll * 0.2, // 20-80%
      Math.random() * maxScroll * 0.3 + maxScroll * 0.7 // 70-100%
    ];

    for (const position of scrollPositions) {
      await this.smoothScrollTo(position);
      await this.delay(this.randomDelay(1000, 3000));
      this.randomMouseMove();
    }
  }

  // Fungsi untuk smooth scroll
  smoothScrollTo(targetY) {
    return new Promise(resolve => {
      const startY = window.pageYOffset;
      const distance = targetY - startY;
      const duration = this.randomDelay(500, 1500);

      let start = null;

      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        if (progress < 1) {
          window.scrollTo(0, startY + distance * progress);
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }

  // Fungsi untuk delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fungsi untuk hover element
  async hoverRandomElement() {
    const clickableElements = document.querySelectorAll('a, button, input, [role="button"], .clickable, [onclick]');
    if (clickableElements.length === 0) return;

    const randomElement = clickableElements[Math.floor(Math.random() * clickableElements.length)];

    // Scroll ke element jika tidak visible
    const rect = randomElement.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      randomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.delay(1000);
    }

    // Hover event
    const hoverEvent = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    randomElement.dispatchEvent(hoverEvent);

    await this.delay(this.randomDelay(500, 2000));
  }

  // Handle Cookie Consents
  async handleCookieConsents() {
    console.log('Checking for cookie consents...');
    const selectors = [
      '#accept-cookies', '#cookie-accept', '#acceptAll', '#onetrust-accept-btn-handler',
      '.cc-btn', '.cc-allow', '.cc-accept', '.js-cookie-accept', '.cookie-consent__accept',
      '[aria-label="Accept cookies"]', '[aria-label="Accept all cookies"]',
      'button[data-testid="cookie-policy-manage-accept-all"]',
      'button[name="agree"]', 'button[name="accept"]',
      'button:contains("Accept")', 'button:contains("Agree")', 'button:contains("Allow All")'
    ];

    for (const selector of selectors) {
      // Handle pseudo-selector :contains manually if needed, or rely on standard selectors
      // querySelectorAll doesn't support :contains, so we filter manually for text
      if (selector.includes(':contains')) {
        const text = selector.match(/:contains\("(.*)"\)/)[1];
        const buttons = Array.from(document.querySelectorAll('button, a.btn'));
        const match = buttons.find(b => b.textContent.includes(text) && b.offsetParent !== null); // visible
        if (match) {
          console.log('Found cookie consent by text:', text);
          match.click();
          await this.delay(1000);
          return;
        }
      } else {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) { // Check visibility
          console.log('Found cookie consent:', selector);
          element.click();
          await this.delay(1000);
          return;
        }
      }
    }
  }

  // Smart Click for content
  async smartClick() {
    // Prioritize content links (articles, products)
    const contentSelectors = [
      'article a', '.post a', '.product a', '.card a',
      'a h2', 'a h3', 'a[href*="/article/"]', 'a[href*="/product/"]'
    ];

    let candidates = [];

    // Try content selectors first
    for (const sel of contentSelectors) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        candidates = [...candidates, ...Array.from(found)];
      }
    }

    // Fallback to generic links if no content links found
    if (candidates.length === 0) {
      candidates = Array.from(document.querySelectorAll('a[href]:not([href="#"]):not([href^="javascript"]):not([target="_blank"])'));
    }

    // Filter out login/signup to keep browsing
    candidates = candidates.filter(el => {
      const text = el.textContent.toLowerCase();
      return !text.includes('login') &&
        !text.includes('sign up') &&
        !text.includes('register') &&
        !text.includes('signin') &&
        el.offsetParent !== null; // Visible
    });

    if (candidates.length === 0) return;

    const target = candidates[Math.floor(Math.random() * candidates.length)];

    // Scroll and click
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.delay(1000);

    this.randomMouseMove();
    await this.delay(500);

    console.log('Smart clicking:', target.href || target.textContent);

    // Use standard click
    target.click();
    await this.delay(this.randomDelay(2000, 4000));
  }

  // Fungsi untuk click element (Wrapper for backward compatibility or generic click)
  async clickRandomElement() {
    await this.smartClick();
  }

  // Fungsi khusus untuk YouTube
  async youtubeActions() {
    // Cari video thumbnails
    const videoThumbnails = document.querySelectorAll('a#thumbnail, ytd-thumbnail, .ytd-thumbnail');
    if (videoThumbnails.length > 0) {
      const randomThumbnail = videoThumbnails[Math.floor(Math.random() * Math.min(videoThumbnails.length, 5))];
      randomThumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.delay(2000);

      // Hover thumbnail
      const hoverEvent = new MouseEvent('mouseover', { bubbles: true });
      randomThumbnail.dispatchEvent(hoverEvent);
      await this.delay(this.randomDelay(2000, 4000));
    }
  }

  // Human-like typing with typos and variable speed
  async humanType(element, text) {
    const neighborKeys = {
      'a': 'qwsz', 'b': 'vghn', 'c': 'xdfv', 'd': 'serfc', 'e': 'wsdr',
      'f': 'drtgv', 'g': 'ftyhb', 'h': 'gyujn', 'i': 'ujko', 'j': 'huikm',
      'k': 'jiolm', 'l': 'kop', 'm': 'njk', 'n': 'bhjm', 'o': 'iklp',
      'p': 'ol', 'q': 'wa', 'r': 'edft', 's': 'awedx', 't': 'rfgy',
      'u': 'yhji', 'v': 'cfgb', 'w': 'qase', 'x': 'zsdc', 'y': 'tghu',
      'z': 'asx', ' ': ' '
    };

    element.value = '';

    for (let i = 0; i < text.length; i++) {
      // 5% chance of typo
      if (Math.random() < 0.05 && text[i] in neighborKeys && text[i] !== ' ') {
        const neighbors = neighborKeys[text[i].toLowerCase()] || '';
        if (neighbors.length > 0) {
          const badChar = neighbors[Math.floor(Math.random() * neighbors.length)];

          // Type wrong char
          element.value += badChar;
          element.dispatchEvent(new Event('input', { bubbles: true }));

          // Realization delay
          await this.delay(this.randomDelay(200, 600));

          // Backspace
          element.value = element.value.slice(0, -1);
          element.dispatchEvent(new Event('input', { bubbles: true }));
          await this.delay(this.randomDelay(100, 300));
        }
      }

      // Type correct char
      element.value += text[i];
      element.dispatchEvent(new Event('input', { bubbles: true }));

      // Human-like delay variation
      // Faster for spaces, slower for complex keys
      let delay = this.randomDelay(50, 150);
      if (text[i] === ' ') delay = this.randomDelay(30, 80);
      await this.delay(delay);
    }
  }

  // Fungsi khusus untuk Google Search
  async googleSearchActions() {
    const searchBox = document.querySelector('input[name="q"], input[type="search"], .gLFyf');
    if (searchBox) {
      searchBox.focus();
      await this.delay(500);

      // Simulasi typing
      const searchQueries = ['javascript tutorial', 'web development', 'coding best practices', 'programming languages'];
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];

      await this.humanType(searchBox, randomQuery);

      await this.delay(1000);

      // Submit search
      const form = searchBox.closest('form');
      if (form) {
        form.submit();
      }
    }
  }

  // Fungsi khusus untuk social media
  async socialMediaActions() {
    // Scroll untuk melihat feed
    await this.scrollPage();

    // Hover beberapa posts
    for (let i = 0; i < 3; i++) {
      await this.hoverRandomElement();
      await this.delay(this.randomDelay(1000, 2000));
    }
  }

  // Main function untuk menjalankan aksi
  async performActions(websiteData) {
    if (this.isSimulating) return;
    this.isSimulating = true;

    console.log('Performing actions on:', window.location.href);

    try {
      // Check for cookie consents first!
      await this.handleCookieConsents();

      // Initial mouse movement
      this.randomMouseMove();
      await this.delay(this.randomDelay(1000, 2000));

      // Jalankan aksi berdasarkan website
      for (const action of websiteData.actions) {
        switch (action) {
          case 'scroll':
            await this.scrollPage();
            break;
          case 'wait':
            await this.delay(this.randomDelay(2000, 5000));
            break;
          case 'hover':
            await this.hoverRandomElement();
            break;
          case 'click':
            await this.smartClick(); // Use smart click
            break;
          case 'click_video':
            if (window.location.hostname.includes('youtube.com')) {
              await this.youtubeActions();
            } else {
              await this.smartClick();
            }
            break;
          case 'search':
            if (window.location.hostname.includes('google.com')) {
              await this.googleSearchActions();
            }
            break;
          case 'social':
            await this.socialMediaActions();
            break;
        }

        // Random delay antar aksi
        await this.delay(this.randomDelay(1000, 3000));
      }

      // Final scroll dan mouse movement
      await this.scrollPage();
      this.randomMouseMove();

    } catch (error) {
      console.error('Error performing actions:', error);
    } finally {
      this.isSimulating = false;
    }
  }
}

// Inisialisasi simulator
const simulator = new HumanBehaviorSimulator();

// Listener untuk pesan dari background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'perform_actions') {
    simulator.performActions(request.websiteData)
      .then(() => {
        sendResponse({ status: 'completed' });
      })
      .catch(error => {
        console.error('Error in perform_actions:', error);
        sendResponse({ status: 'error', error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Auto-start simulation untuk website tertentu
window.addEventListener('load', () => {
  // Tunggu beberapa detik sebelum mulai simulasi
  setTimeout(() => {
    chrome.storage.local.get(['isRunning'], (result) => {
      if (result.isRunning) {
        console.log('Auto-starting simulation on page load');
        // Jalankan simulasi dasar
        simulator.performActions({
          actions: ['scroll', 'wait', 'hover']
        });
      }
    });
  }, 3000);
});

// Deteksi perubahan URL (untuk SPA)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log('URL changed to:', currentUrl);

    // Jalankan simulasi untuk URL baru
    chrome.storage.local.get(['isRunning'], (result) => {
      if (result.isRunning) {
        setTimeout(() => {
          simulator.performActions({
            actions: ['scroll', 'wait', 'hover']
          });
        }, 2000);
      }
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});