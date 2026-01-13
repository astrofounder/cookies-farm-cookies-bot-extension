try {
  importScripts('config.js');
} catch (e) {
  console.error(e);
}

// State management
let currentState = {
  isRunning: false,
  isPaused: false,
  currentWebsiteIndex: 0,
  currentTabId: null,
  visitedWebsites: []
};

// Initialize state from storage
chrome.storage.local.get(['isRunning', 'currentWebsiteIndex', 'activeTabId', 'visitedWebsites'], (result) => {
  currentState.isRunning = result.isRunning || false;
  currentState.currentWebsiteIndex = result.currentWebsiteIndex || 0;
  currentState.currentTabId = result.activeTabId || null;
  currentState.visitedWebsites = result.visitedWebsites || [];
});

// Helper for random delay
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulate tab switching (multitasking behavior)
async function simulateTabSwitch() {
  // Only trigger occasionally (20% chance)
  if (Math.random() > 0.2) return;

  try {
    console.log('Simulating tab switch (multitasking)...');

    // Create a dummy tab briefly
    const dummyTab = await chrome.tabs.create({
      url: 'about:blank',
      active: true
    });

    // Wait random time (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, randomDelay(1000, 3000)));

    // Close dummy tab
    await chrome.tabs.remove(dummyTab.id);

    // Focus back on farming tab
    if (currentState.currentTabId) {
      await chrome.tabs.update(currentState.currentTabId, { active: true });
    }
  } catch (e) {
    console.log('Tab switch simulation skipped:', e.message);
  }
}

// Helper for Safe Tab Closing (Anti-Suicide)
async function safeCloseTab(tabId) {
  if (!tabId) return;
  try {
    const tab = await chrome.tabs.get(tabId);
    const windowTabs = await chrome.tabs.query({ windowId: tab.windowId });

    // If it's the last tab, create a new one first
    if (windowTabs.length <= 1) {
      await chrome.tabs.create({ windowId: tab.windowId, url: 'chrome://newtab', active: true });
    }

    // Now safe to close
    await chrome.tabs.remove(tabId);
  } catch (e) {
    // Tab might already be closed or error reading it
    console.log('Safe close error (tab likely gone):', e.message);
  }
}

// Start farming
async function startCookiesFarming() {
  if (currentState.isRunning) return;

  console.log('Starting Cookies Farming...');
  currentState.isRunning = true;
  currentState.currentWebsiteIndex = 0; // Reset index for single cycle
  currentState.visitedWebsites = [];

  // CRITICAL: Clear any stale tab ID to prevent checking/closing it
  currentState.currentTabId = null;

  await chrome.storage.local.set({
    isRunning: true,
    currentWebsiteIndex: 0,
    visitedWebsites: [],
    activeTabId: null // Clear from storage too
  });

  // Start immediately with the first website (skip delay and skip closing old tab)
  chrome.alarms.create('open_next_site', { when: Date.now() + 100 });
}

// Stop farming
async function stopCookiesFarming() {
  console.log('Stopping Cookies Farming...');
  currentState.isRunning = false;
  currentState.isPaused = false;
  await chrome.storage.local.set({ isRunning: false, isPaused: false });

  chrome.alarms.clear('farming_loop');
  chrome.alarms.clear('tab_timeout');
  chrome.alarms.clear('open_next_site');

  if (currentState.currentTabId) {
    await safeCloseTab(currentState.currentTabId);
    currentState.currentTabId = null;
    await chrome.storage.local.remove('activeTabId');
  }
}

// Pause farming
async function pauseCookiesFarming() {
  if (!currentState.isRunning || currentState.isPaused) return;
  console.log('Pausing Cookies Farming...');
  currentState.isPaused = true;
  await chrome.storage.local.set({ isPaused: true });
  chrome.alarms.clear('farming_loop');
  chrome.alarms.clear('open_next_site');
}

// Resume farming
async function resumeCookiesFarming() {
  if (!currentState.isRunning || !currentState.isPaused) return;
  console.log('Resuming Cookies Farming...');
  currentState.isPaused = false;
  await chrome.storage.local.set({ isPaused: false });
  chrome.alarms.create('open_next_site', { when: Date.now() + 100 });
}

// Navigate to next website
async function browseToNextWebsite() {
  if (!currentState.isRunning) return;

  // Select next website
  const websites = CONFIG.WEBSITES;

  // Safety check
  if (currentState.currentWebsiteIndex >= websites.length) {
    stopCookiesFarming();
    return;
  }

  const website = websites[currentState.currentWebsiteIndex];

  console.log(`Browsing to: ${website.url}`);

  // Update index for next time (No modulo for single cycle)
  currentState.currentWebsiteIndex++;
  await chrome.storage.local.set({ currentWebsiteIndex: currentState.currentWebsiteIndex });

  // Retrieve referrer from config manager helper or standard way
  // Since we are in SW, we can't use ConfigManager instance easily without caching it or creating new.
  // Let's us direct CONFIG access for simplicity as it's global here.

  let referrer = 'https://google.com'; // Default
  if (CONFIG.REFERRERS && CONFIG.REFERRERS.length > 0) {
    referrer = CONFIG.REFERRERS[Math.floor(Math.random() * CONFIG.REFERRERS.length)];
  }

  // If 'direct', we don't spoof (or remove header)
  if (referrer !== 'direct') {
    try {
      // Rule ID 1 reserved for referrer spoofing
      const ruleId = 1;
      const domain = new URL(website.url).hostname;

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId],
        addRules: [{
          "id": ruleId,
          "priority": 1,
          "action": {
            "type": "modifyHeaders",
            "requestHeaders": [
              { "header": "Referer", "operation": "set", "value": referrer }
            ]
          },
          "condition": {
            "urlFilter": `||${domain}`,
            "resourceTypes": ["main_frame"]
          }
        }]
      });
      console.log(`Spoofing Referrer: ${referrer} for ${domain}`);
    } catch (e) {
      console.error("Failed to set referrer rule:", e);
    }
  } else {
    // Clear rule if direct
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1]
    });
  }

  try {
    // Open tab (Active now)
    const tab = await chrome.tabs.create({
      url: website.url,
      active: true
    });

    currentState.currentTabId = tab.id;

    // Track visited website
    if (!currentState.visitedWebsites.includes(website.url)) {
      currentState.visitedWebsites.push(website.url);
    }

    await chrome.storage.local.set({
      activeTabId: tab.id,
      visitedWebsites: currentState.visitedWebsites
    });

    // Notify popup
    try {
      chrome.runtime.sendMessage({
        action: 'websiteVisited',
        url: website.url,
        visitedCount: currentState.visitedWebsites.length
      }).catch(() => { }); // Ignore error if popup is closed
    } catch (e) { }

    // Close all other tabs ONLY if configured (Default: false for RPA comp)
    if (CONFIG.BEHAVIOR && CONFIG.BEHAVIOR.AUTO_CLOSE_OTHER_TABS) {
      try {
        const allTabs = await chrome.tabs.query({ windowId: tab.windowId });
        for (const t of allTabs) {
          if (t.id !== tab.id) {
            chrome.tabs.remove(t.id).catch(() => { });
          }
        }
      } catch (e) {
        console.error('Error closing other tabs:', e);
      }
    }

    // Set alarm to close/move on after stayTime
    const stayTime = website.stayTime || 30000;
    // Add some random variance to stay time
    const variance = randomDelay(-5000, 5000);
    const finalStayTime = Math.max(10000, stayTime + variance);

    chrome.alarms.create('farming_loop', { when: Date.now() + finalStayTime });

    // Inject logic once tab is loaded
    // Note: We rely on content scripts for actual interaction, 
    // but we can send a message to trigger specific actions.

    // Safety timeout to close tab if it hangs
    chrome.alarms.create('tab_timeout', { when: Date.now() + (finalStayTime + 30000) });

    // Occasionally simulate tab switching (multitasking)
    setTimeout(() => simulateTabSwitch(), randomDelay(5000, 15000));

  } catch (error) {
    console.error('Error in browsing loop:', error);
    // Retry shortly if something failed
    chrome.alarms.create('farming_loop', { when: Date.now() + 5000 });
  }
}

// Alarm Listener - The Heart of the Loop
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'farming_loop') {
    if (!currentState.isRunning) {
      // Double check storage in case state was lost
      const stored = await chrome.storage.local.get('isRunning');
      if (!stored.isRunning) return;
      currentState.isRunning = true;
    }

    // Clean up previous tab if it exists
    if (currentState.currentTabId) {
      await safeCloseTab(currentState.currentTabId);
      currentState.currentTabId = null;
    }

    // Check if we have finished all websites
    if (currentState.currentWebsiteIndex >= CONFIG.WEBSITES.length) {
      console.log('Cycle complete. Stopping.');
      stopCookiesFarming();
      return;
    }

    // Start next browsing step
    // Add a small random delay between sites
    const delay = randomDelay(CONFIG.TIMING.MIN_DELAY_BETWEEN_WEBSITES, CONFIG.TIMING.MAX_DELAY_BETWEEN_WEBSITES);

    // We can't block here with setTimeout easily in an alarm handler without complications,
    // but since we just closed the tab, we can schedule the NEXT browse action.
    // However, the above logic was "Do the browse NOW". 
    // Let's refine: The alarm triggers "Move to NEXT step".

    // Actually, to simulate delay BETWEEN websites:
    // 1. Alarm triggers -> Close old tab.
    // 2. Schedule new alarm for "Open new tab" (delay).
    // But we need to distinguish state.

    // Simplified flow:
    // Browsing -> Wait StayTime -> Alarm -> Close Tab -> Wait Delay -> Browse Next
    // To implement this with one alarm name, we can just proceed immediately effectively, 
    // or we can use two alarm types or check state.
    // Let's keep it simple: The alarm 'farming_loop' means "Time to move on".
    // We closed the tab. Now we wait 'delay' then open the next one.
    // Since we can't 'await' a setTimeout safely if the SW dies, we schedule another alarm.

    // But wait, if we just closed the tab, we want to wait, then open.
    // So:
    // Create 'open_next_site' alarm.
    chrome.alarms.create('open_next_site', { when: Date.now() + delay });
  }

  else if (alarm.name === 'open_next_site') {
    if (!currentState.isRunning) return;
    await browseToNextWebsite();
  }

  else if (alarm.name === 'tab_timeout') {
    // Safety mechanism
    if (currentState.currentTabId) {
      await safeCloseTab(currentState.currentTabId);
      currentState.currentTabId = null;
    }
  }
});

// Update listener to trigger actions when tab loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentState.currentTabId && changeInfo.status === 'complete') {
    // Send message to content script to start simulation
    const websites = CONFIG.WEBSITES;
    // We need to know which website we are on. 
    // Ideally we pass this data or look it up.
    // The content script monitors 'load' but we can also trigger it manually for robustness.

    // Find matching config for current URL to be precise
    const currentSite = websites.find(w => tab.url.includes(new URL(w.url).hostname));

    if (currentSite) {
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          action: 'perform_actions',
          websiteData: currentSite
        }).catch(e => console.log('Content script not ready or error:', e));
      }, 2000);
    }
  }
});

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'start':
      startCookiesFarming();
      sendResponse({ status: 'started' });
      break;
    case 'stop':
      stopCookiesFarming();
      sendResponse({ status: 'stopped' });
      break;
    case 'getStatus':
      sendResponse({
        isRunning: currentState.isRunning,
        isPaused: currentState.isPaused,
        currentWebsite: currentState.isRunning ? (CONFIG.WEBSITES[currentState.currentWebsiteIndex]?.url || 'None') : 'Ready to Start',
        progress: {
          current: currentState.currentWebsiteIndex,
          total: CONFIG.WEBSITES.length
        }
      });
      break;
    case 'pause':
      pauseCookiesFarming();
      sendResponse({ status: 'paused' });
      break;
    case 'resume':
      resumeCookiesFarming();
      sendResponse({ status: 'resumed' });
      break;
    case 'updateSettings':
      if (request.settings) {
        // Merging settings if needed
        // CONFIG overrides/manager would go here
      }
      sendResponse({ status: 'updated' });
      break;
  }
  return true;
});

// Startup check
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['isRunning', 'autoStart']);
  if (result.isRunning || result.autoStart) {
    startCookiesFarming();
  }
});

// Install check
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isRunning: false, currentWebsiteIndex: 0 });
});