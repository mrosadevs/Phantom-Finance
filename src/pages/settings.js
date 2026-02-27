// ============================================
// PHANTOM FINANCE - SETTINGS PAGE
// ============================================

import { getState, setState, clearAll, isDemoMode, exitDemoMode } from '../services/store.js';
import { showPage, esc } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import {
  getNotificationStatus,
  toggleNotifications,
  sendTestNotification,
  areNotificationsEnabled,
} from '../services/notifications.js';

export function initSettings() {
  renderSettings();
}

export function renderSettings() {
  const page = document.getElementById('page-settings');
  if (!page) return;

  const state = getState();
  const notifStatus = getNotificationStatus();
  const notifEnabled = state.settings.notificationsEnabled && areNotificationsEnabled();
  const demoActive = isDemoMode();

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">SETTINGS</h1>
          <div class="section-subtitle">App Configuration & Data Management</div>
        </div>
      </div>

      ${demoActive ? `
        <div class="demo-banner" data-animate style="animation-delay:0.05s">
          <div class="demo-banner-icon">&#9888;</div>
          <div class="demo-banner-content">
            <div class="demo-banner-title">Demo Mode Active</div>
            <div class="demo-banner-text">You're viewing demo data. Changes will NOT be saved. Click "Keep Demo Data" to save it permanently, or "Exit Demo" to clear it.</div>
          </div>
          <div class="demo-banner-actions">
            <button class="btn-primary btn-sm" id="keep-demo-btn">Keep Demo Data</button>
            <button class="btn-ghost btn-sm" id="exit-demo-btn">Exit Demo</button>
          </div>
        </div>
      ` : ''}

      <!-- Notifications -->
      <div class="card card-cyan" data-animate style="animation-delay:0.1s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#128276; Notifications</div>
          <span class="tag ${notifEnabled ? 'success' : 'pink'}">${notifEnabled ? 'Active' : 'Off'}</span>
        </div>
        <p class="settings-desc">
          Receive browser notifications when payments are coming due. Works on Chrome, Edge, Firefox, Safari, and mobile devices.
        </p>

        ${notifStatus === 'unsupported' ? `
          <div class="alert-item warning" style="margin-top:0.75rem;">
            <span class="alert-icon">&#9888;</span>
            <div class="alert-content">
              <div class="alert-title">Not Supported</div>
              <div class="alert-text">Your browser doesn't support notifications. Try using Chrome, Edge, or Firefox.</div>
            </div>
          </div>
        ` : notifStatus === 'denied' ? `
          <div class="alert-item danger" style="margin-top:0.75rem;">
            <span class="alert-icon">&#128683;</span>
            <div class="alert-content">
              <div class="alert-title">Permission Denied</div>
              <div class="alert-text">You blocked notifications for this site. To enable them, click the lock icon in your browser's address bar and allow notifications.</div>
            </div>
          </div>
        ` : `
          <div class="settings-row" style="margin-top:0.75rem;">
            <div class="settings-row-info">
              <div class="settings-row-label">Enable Payment Reminders</div>
              <div class="settings-row-desc">Get notified before bills and debt payments are due</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-notifications" ${notifEnabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          ${notifEnabled ? `
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">Reminder Days Before</div>
                <div class="settings-row-desc">How many days before a due date to notify you</div>
              </div>
              <select class="form-input" id="reminder-days" style="width:auto;min-width:80px;">
                <option value="1" ${state.settings.reminderDaysBefore === 1 ? 'selected' : ''}>1 day</option>
                <option value="2" ${state.settings.reminderDaysBefore === 2 ? 'selected' : ''}>2 days</option>
                <option value="3" ${state.settings.reminderDaysBefore === 3 ? 'selected' : ''}>3 days</option>
                <option value="5" ${state.settings.reminderDaysBefore === 5 ? 'selected' : ''}>5 days</option>
                <option value="7" ${state.settings.reminderDaysBefore === 7 ? 'selected' : ''}>7 days</option>
              </select>
            </div>
            <div style="margin-top:0.75rem;">
              <button class="btn-ghost btn-sm" id="test-notification-btn">&#128276; Send Test Notification</button>
            </div>
          ` : ''}
        `}
      </div>

      <!-- AI Categorization -->
      <div class="card card-cyan" data-animate style="animation-delay:0.12s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#129302; AI Categorization</div>
          <span class="tag ${localStorage.getItem('phantom-finance-groq-key') ? 'success' : 'pink'}">${localStorage.getItem('phantom-finance-groq-key') ? 'Connected' : 'Not Set'}</span>
        </div>
        <p class="settings-desc">
          Connect to Groq AI to automatically categorize bank transactions when importing statements. Your API key is stored locally — never sent anywhere except Groq.
        </p>
        <div class="settings-row" style="margin-top:0.75rem;">
          <div class="settings-row-info">
            <div class="settings-row-label">Groq API Key</div>
            <div class="settings-row-desc">Get a free key at console.groq.com</div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center;">
            <input class="form-input" id="groq-api-key" type="password"
                   value="${localStorage.getItem('phantom-finance-groq-key') ? '••••••••••••••••' : ''}"
                   placeholder="gsk_..." style="width:220px;font-size:0.8rem;" />
            <button class="btn-ghost btn-sm" id="save-groq-key">Save</button>
            ${localStorage.getItem('phantom-finance-groq-key') ? '<button class="btn-ghost btn-sm" id="clear-groq-key" style="color:var(--danger);">Clear</button>' : ''}
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">AI Model</div>
            <div class="settings-row-desc">Model used for transaction categorization</div>
          </div>
          <select class="form-input" id="groq-model" style="width:auto;min-width:200px;">
            <option value="llama-3.3-70b-versatile" ${state.settings.groqModel === 'llama-3.3-70b-versatile' ? 'selected' : ''}>Llama 3.3 70B (Best)</option>
            <option value="llama-3.1-8b-instant" ${state.settings.groqModel === 'llama-3.1-8b-instant' ? 'selected' : ''}>Llama 3.1 8B (Faster)</option>
          </select>
        </div>
      </div>

      <!-- Appearance -->
      <div class="card card-violet" data-animate style="animation-delay:0.15s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#127912; Appearance</div>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Theme</div>
            <div class="settings-row-desc">Switch between dark and light mode</div>
          </div>
          <select class="form-input" id="theme-select" style="width:auto;min-width:120px;">
            <option value="dark" ${state.settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
            <option value="light" ${state.settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
          </select>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Currency</div>
            <div class="settings-row-desc">Display currency for all amounts</div>
          </div>
          <select class="form-input" id="currency-select" style="width:auto;min-width:120px;">
            <option value="USD" ${state.profile.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
            <option value="EUR" ${state.profile.currency === 'EUR' ? 'selected' : ''}>EUR (&euro;)</option>
            <option value="GBP" ${state.profile.currency === 'GBP' ? 'selected' : ''}>GBP (&pound;)</option>
            <option value="MXN" ${state.profile.currency === 'MXN' ? 'selected' : ''}>MXN ($)</option>
            <option value="CAD" ${state.profile.currency === 'CAD' ? 'selected' : ''}>CAD ($)</option>
          </select>
        </div>
      </div>

      <!-- Data Management -->
      <div class="card card-pink" data-animate style="animation-delay:0.2s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#128190; Data Management</div>
        </div>
        <p class="settings-desc">
          All your data is stored locally in your browser. No data is sent to any server.
        </p>

        <div class="settings-actions">
          <button class="btn-ghost" id="settings-import-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Import Data
          </button>
          <button class="btn-ghost" id="settings-export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Export Data
          </button>
          <button class="btn-ghost" id="settings-demo-btn" style="color:var(--accent2);border-color:var(--accent2);">
            &#9733; Load Demo Data
          </button>
        </div>

        <div class="divider"></div>

        <div class="settings-danger-zone">
          <div class="card-label" style="color:var(--danger);margin-bottom:0.75rem;">&#9888; Danger Zone</div>
          <p class="settings-desc" style="margin-bottom:0.75rem;">
            Permanently delete all your data. This action cannot be undone.
          </p>
          <button class="btn-danger" id="clear-all-btn">
            &#128465; Delete All Data
          </button>
        </div>
      </div>

      <!-- Data Summary -->
      <div class="card" data-animate style="animation-delay:0.25s;">
        <div class="card-header">
          <div class="card-title">&#128202; Data Summary</div>
        </div>
        <div class="data-summary-grid">
          <div class="data-summary-item">
            <span class="data-summary-label">Income Sources</span>
            <span class="data-summary-value">${state.income.length}</span>
          </div>
          <div class="data-summary-item">
            <span class="data-summary-label">Monthly Expenses</span>
            <span class="data-summary-value">${state.monthlyExpenses.length}</span>
          </div>
          <div class="data-summary-item">
            <span class="data-summary-label">Active Debts</span>
            <span class="data-summary-value">${state.debts.length}</span>
          </div>
          <div class="data-summary-item">
            <span class="data-summary-label">Property Items</span>
            <span class="data-summary-value">${state.propertyExpenses.length}</span>
          </div>
          <div class="data-summary-item">
            <span class="data-summary-label">Annual Budget Items</span>
            <span class="data-summary-value">${state.annualBudget.length}</span>
          </div>
          <div class="data-summary-item">
            <span class="data-summary-label">Business Expenses</span>
            <span class="data-summary-value">${state.businessExpenses.length}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // ---- Bind Events ----

  // Demo mode buttons
  page.querySelector('#keep-demo-btn')?.addEventListener('click', () => {
    exitDemoMode(true); // true = save data
    renderSettings();
    toast('Demo data saved! It\'s now your data.', 'success');
  });
  page.querySelector('#exit-demo-btn')?.addEventListener('click', () => {
    exitDemoMode(false); // false = clear data
    renderSettings();
    toast('Demo data cleared', 'info');
  });

  // Groq API key
  page.querySelector('#save-groq-key')?.addEventListener('click', () => {
    const input = page.querySelector('#groq-api-key');
    const val = input?.value?.trim();
    if (!val || val === '••••••••••••••••') {
      toast('Enter a valid API key', 'warning');
      return;
    }
    if (!val.startsWith('gsk_')) {
      toast('Groq API keys start with "gsk_"', 'error');
      return;
    }
    localStorage.setItem('phantom-finance-groq-key', val);
    toast('Groq API key saved!', 'success');
    renderSettings();
  });
  page.querySelector('#clear-groq-key')?.addEventListener('click', () => {
    localStorage.removeItem('phantom-finance-groq-key');
    toast('API key removed', 'info');
    renderSettings();
  });
  page.querySelector('#groq-model')?.addEventListener('change', (e) => {
    setState(s => { s.settings.groqModel = e.target.value; });
    toast('AI model updated', 'success');
  });

  // Notifications toggle
  page.querySelector('#toggle-notifications')?.addEventListener('change', async (e) => {
    const result = await toggleNotifications(e.target.checked);
    if (!result) {
      e.target.checked = false;
      toast('Could not enable notifications. Check browser permissions.', 'error');
    } else {
      renderSettings();
      toast(e.target.checked ? 'Notifications enabled!' : 'Notifications disabled', 'info');
    }
  });

  // Reminder days
  page.querySelector('#reminder-days')?.addEventListener('change', (e) => {
    setState(s => { s.settings.reminderDaysBefore = parseInt(e.target.value); });
    toast('Reminder timing updated', 'success');
  });

  // Test notification
  page.querySelector('#test-notification-btn')?.addEventListener('click', () => {
    sendTestNotification();
    toast('Test notification sent!', 'info');
  });

  // Theme
  page.querySelector('#theme-select')?.addEventListener('change', (e) => {
    const isLight = e.target.value === 'light';
    document.body.classList.toggle('light', isLight);
    setState(s => { s.settings.theme = e.target.value; });
    toast(isLight ? 'Light mode enabled' : 'Dark mode enabled', 'info');
  });

  // Currency
  page.querySelector('#currency-select')?.addEventListener('change', (e) => {
    setState(s => { s.profile.currency = e.target.value; });
    toast('Currency updated', 'success');
  });

  // Import / Export / Demo
  page.querySelector('#settings-import-btn')?.addEventListener('click', () => {
    document.getElementById('btn-import')?.click();
  });
  page.querySelector('#settings-export-btn')?.addEventListener('click', () => {
    document.getElementById('btn-export')?.click();
  });
  page.querySelector('#settings-demo-btn')?.addEventListener('click', () => {
    window._phantomLoadDemo?.();
  });

  // Clear All Data
  page.querySelector('#clear-all-btn')?.addEventListener('click', () => {
    showClearAllModal();
  });
}

function showClearAllModal() {
  openModal(`
    <button class="modal-close">&times;</button>
    <div style="text-align:center;margin-bottom:1.5rem;">
      <div style="font-size:3rem;margin-bottom:0.75rem;">&#9888;</div>
      <h2 class="modal-title" style="color:var(--danger);">Delete All Data?</h2>
    </div>
    <div class="alert-item danger" style="margin-bottom:1rem;">
      <span class="alert-icon">&#128683;</span>
      <div class="alert-content">
        <div class="alert-title">This action is permanent</div>
        <div class="alert-text">All your income, expenses, debts, property items, annual budget, and business expenses will be permanently deleted. This cannot be undone.</div>
      </div>
    </div>
    <p style="color:var(--muted2);font-size:0.85rem;margin-bottom:1.25rem;text-align:center;">
      Consider exporting your data as a backup first.
    </p>
    <div class="form-group">
      <label class="form-label" style="color:var(--danger);">Type "DELETE" to confirm</label>
      <input class="form-input" id="confirm-delete" placeholder="Type DELETE to confirm" style="border-color:var(--danger);" />
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-danger" id="confirm-clear-btn" disabled>Delete Everything</button>
    </div>
  `, {
    onOpen: (modal) => {
      const input = modal.querySelector('#confirm-delete');
      const btn = modal.querySelector('#confirm-clear-btn');

      input.addEventListener('input', () => {
        btn.disabled = input.value.trim() !== 'DELETE';
      });

      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      btn.addEventListener('click', () => {
        if (input.value.trim() === 'DELETE') {
          clearAll();
          closeModal();
          renderSettings();
          toast('All data has been deleted', 'warning');
          // Redirect to landing
          setTimeout(() => showPage('landing'), 500);
        }
      });

      input.focus();
    }
  });
}
