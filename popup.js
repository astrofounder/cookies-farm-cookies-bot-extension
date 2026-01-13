// Popup JavaScript untuk Cookies Farm Extension
class PopupController {
  constructor() {
    this.isRunning = false;
    this.currentWebsite = 'None';
    this.statistics = {
      websitesVisited: 0,
      totalTime: 0,
      sessionStart: null
    };

    this.targetWebsites = CONFIG.WEBSITES.map(site => ({
      ...site,
      visited: false
    }));

    this.init();
  }

  async init() {
    this.bindElements();
    this.bindEvents();
    await this.loadSettings();
    await this.updateStatus();
    this.renderWebsiteList();
    this.startStatusUpdates();
  }

  bindElements() {
    // Status elements
    this.statusDot = document.getElementById('statusDot');
    this.statusText = document.getElementById('statusText');
    this.currentWebsiteEl = document.getElementById('currentWebsite');

    // Control buttons
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.exportBtn = document.getElementById('exportBtn');

    // Settings
    this.autoStartToggle = document.getElementById('autoStartToggle');
    this.delayRange = document.getElementById('delayRange');
    this.delayValue = document.getElementById('delayValue');
    this.stayTimeRange = document.getElementById('stayTimeRange');
    this.stayTimeValue = document.getElementById('stayTimeValue');

    // Statistics
    this.websitesVisitedEl = document.getElementById('websitesVisited');
    this.totalTimeEl = document.getElementById('totalTime');
    this.sessionStartEl = document.getElementById('sessionStart');

    // Website list
    this.websiteList = document.getElementById('websiteList');
  }

  bindEvents() {
    // Control buttons
    this.startBtn.addEventListener('click', () => this.startFarming());
    this.stopBtn.addEventListener('click', () => this.stopFarming());
    this.resetBtn.addEventListener('click', () => this.resetStatistics());
    this.exportBtn.addEventListener('click', () => this.exportLogs());

    // Settings
    this.autoStartToggle.addEventListener('change', () => this.saveSettings());
    this.delayRange.addEventListener('input', () => this.updateDelayDisplay());
    this.stayTimeRange.addEventListener('input', () => this.updateStayTimeDisplay());

    // Save settings on change
    this.delayRange.addEventListener('change', () => this.saveSettings());
    this.stayTimeRange.addEventListener('change', () => this.saveSettings());
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.local.get([
        'autoStart', 'delayBetweenWebsites', 'stayTimePerWebsite',
        'statistics', 'visitedWebsites'
      ]);

      this.autoStartToggle.checked = settings.autoStart !== false;
      this.delayRange.value = settings.delayBetweenWebsites || 10;
      this.stayTimeRange.value = settings.stayTimePerWebsite || 45;

      if (settings.statistics) {
        this.statistics = settings.statistics;
      }

      if (settings.visitedWebsites) {
        this.updateVisitedWebsites(settings.visitedWebsites);
      }

      this.updateDelayDisplay();
      this.updateStayTimeDisplay();
      this.updateStatisticsDisplay();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        autoStart: this.autoStartToggle.checked,
        delayBetweenWebsites: parseInt(this.delayRange.value),
        stayTimePerWebsite: parseInt(this.stayTimeRange.value)
      };

      await chrome.storage.local.set(settings);

      // Notify background script
      chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: settings
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  updateDelayDisplay() {
    this.delayValue.textContent = `${this.delayRange.value}s`;
  }

  updateStayTimeDisplay() {
    this.stayTimeValue.textContent = `${this.stayTimeRange.value}s`;
  }

  async updateStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      this.isRunning = response.isRunning;
      this.currentWebsite = response.currentWebsite;

      this.updateUI();
    } catch (error) {
      console.error('Error getting status:', error);
    }
  }

  updateUI() {
    if (this.isRunning) {
      this.statusDot.classList.add('active');
      this.statusText.textContent = 'Running';
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;

      if (this.statistics.sessionStart === null) {
        this.statistics.sessionStart = new Date();
        this.saveStatistics();
      }
    } else {
      this.statusDot.classList.remove('active');
      this.statusText.textContent = 'Stopped';
      this.startBtn.disabled = false;
      this.stopBtn.disabled = true;
    }

    this.currentWebsiteEl.innerHTML = `<small>Current: ${this.currentWebsite}</small>`;
    this.updateStatisticsDisplay();
  }

  async startFarming() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'start' });
      if (response.status === 'started') {
        this.isRunning = true;
        this.updateUI();
        this.showNotification('Cookies farming started!', 'success');
      }
    } catch (error) {
      console.error('Error starting farming:', error);
      this.showNotification('Failed to start farming', 'error');
    }
  }

  async stopFarming() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'stop' });
      if (response.status === 'stopped') {
        this.isRunning = false;
        this.currentWebsite = 'None';
        this.updateUI();
        this.showNotification('Cookies farming stopped', 'info');
      }
    } catch (error) {
      console.error('Error stopping farming:', error);
      this.showNotification('Failed to stop farming', 'error');
    }
  }

  async resetStatistics() {
    this.statistics = {
      websitesVisited: 0,
      totalTime: 0,
      sessionStart: null
    };

    this.targetWebsites.forEach(website => {
      website.visited = false;
    });

    await this.saveStatistics();
    this.updateStatisticsDisplay();
    this.renderWebsiteList();
    this.showNotification('Statistics reset', 'info');
  }

  async saveStatistics() {
    try {
      await chrome.storage.local.set({
        statistics: this.statistics,
        visitedWebsites: this.targetWebsites.filter(w => w.visited).map(w => w.url)
      });
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  }

  updateStatisticsDisplay() {
    this.websitesVisitedEl.textContent = this.statistics.websitesVisited;

    if (this.statistics.sessionStart) {
      const elapsed = Date.now() - this.statistics.sessionStart.getTime();
      const minutes = Math.floor(elapsed / 60000);
      this.totalTimeEl.textContent = `${minutes}m`;
      this.sessionStartEl.textContent = this.formatTime(this.statistics.sessionStart);
    } else {
      this.totalTimeEl.textContent = '0m';
      this.sessionStartEl.textContent = '--:--';
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderWebsiteList() {
    this.websiteList.innerHTML = '';

    this.targetWebsites.forEach(website => {
      const item = document.createElement('div');
      item.className = 'website-item fade-in';

      item.innerHTML = `
        <span class="website-icon">${website.icon}</span>
        <span class="website-url">${website.url}</span>
        <span class="website-status ${website.visited ? 'visited' : ''}">
          ${website.visited ? '✓ Visited' : 'Pending'}
        </span>
      `;

      this.websiteList.appendChild(item);
    });
  }

  updateVisitedWebsites(visitedUrls) {
    this.targetWebsites.forEach(website => {
      website.visited = visitedUrls.includes(website.url);
    });
  }

  async exportLogs() {
    try {
      const logs = {
        timestamp: new Date().toISOString(),
        statistics: this.statistics,
        settings: {
          autoStart: this.autoStartToggle.checked,
          delayBetweenWebsites: parseInt(this.delayRange.value),
          stayTimePerWebsite: parseInt(this.stayTimeRange.value)
        },
        visitedWebsites: this.targetWebsites.filter(w => w.visited).map(w => w.url)
      };

      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `cookies-farm-logs-${Date.now()}.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.showNotification('Logs exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting logs:', error);
      this.showNotification('Failed to export logs', 'error');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} slide-up`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '500',
      zIndex: '1000',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.background = '#10b981';
        break;
      case 'error':
        notification.style.background = '#ef4444';
        break;
      case 'info':
        notification.style.background = '#3b82f6';
        break;
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  startStatusUpdates() {
    // Update status every 2 seconds
    setInterval(() => {
      this.updateStatus();
    }, 2000);

    // Update statistics every 10 seconds
    setInterval(() => {
      if (this.isRunning) {
        this.statistics.websitesVisited = this.targetWebsites.filter(w => w.visited).length;
        this.updateStatisticsDisplay();
        this.saveStatistics();
      }
    }, 10000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'websiteVisited') {
    // Update visited status
    const website = popupController.targetWebsites.find(w => w.url === request.url);
    if (website) {
      website.visited = true;
      popupController.renderWebsiteList();
    }
  }
});