// ============================================
// PHANTOM FINANCE - MAIN ENTRY POINT
// ============================================

import { initParticles } from './components/particles.js';
import { initCursor } from './components/cursor.js';
import { toast } from './components/toast.js';
import { openModal, closeModal } from './components/modal.js';
import { getState, setState, subscribe, importJSON, importJSONDemo, enterDemoMode, isDemoMode } from './services/store.js';
import { downloadJSON, downloadExcel, handleJSONImport, handleExcelImport } from './services/exporter.js';
import { showPage } from './utils/helpers.js';
import { demoData } from './services/demo-data.js';
import { initNotifications } from './services/notifications.js';

import { initLanding } from './pages/landing.js';
import { initDashboard, renderDashboard } from './pages/dashboard.js';
import { initMonthly, renderMonthly } from './pages/monthly.js';
import { initDebts, renderDebts } from './pages/debts.js';
import { initProperty, renderProperty } from './pages/property.js';
import { initAnnual, renderAnnual } from './pages/annual.js';
import { initBusiness, renderBusiness } from './pages/business.js';
import { initSettings, renderSettings } from './pages/settings.js';

// ---- Initialize App ----
document.addEventListener('DOMContentLoaded', () => {
  // Load state
  getState();

  // Init visual effects
  initParticles();
  initCursor();

  // Init pages
  initLanding();
  initDashboard();
  initMonthly();
  initDebts();
  initProperty();
  initAnnual();
  initBusiness();
  initSettings();

  // Init notifications
  initNotifications();

  // Apply saved theme
  const state = getState();
  if (state.settings.theme === 'light') {
    document.body.classList.add('light');
  }

  // ---- Navigation ----
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) {
        showPage(page);
        refreshPage(page);
        // Close mobile menu
        document.getElementById('nav-links')?.classList.remove('mobile-open');
      }
    });
  });

  // ---- Settings button in nav-actions ----
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    showPage('settings');
    refreshPage('settings');
  });

  // ---- Demo Data button in nav-actions ----
  document.getElementById('btn-demo')?.addEventListener('click', () => {
    window._phantomLoadDemo?.();
  });

  // ---- Hamburger Menu ----
  const nav = document.querySelector('.nav');
  if (nav && !nav.querySelector('.hamburger')) {
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    hamburger.addEventListener('click', () => {
      document.getElementById('nav-links')?.classList.toggle('mobile-open');
    });
    nav.insertBefore(hamburger, nav.querySelector('.nav-actions'));
  }

  // ---- Theme Toggle ----
  document.getElementById('btn-theme')?.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    setState(s => { s.settings.theme = isLight ? 'light' : 'dark'; });
    toast(isLight ? 'Light mode enabled' : 'Dark mode enabled', 'info');
  });

  // ---- Import Button ----
  document.getElementById('btn-import')?.addEventListener('click', () => {
    showImportModal();
  });

  // ---- Export Button ----
  document.getElementById('btn-export')?.addEventListener('click', () => {
    showExportModal();
  });

  // ---- File Import Handler ----
  document.getElementById('file-import')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.json')) {
        await handleJSONImport(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        await handleExcelImport(file);
      } else {
        toast('Unsupported file type. Use .json or .xlsx', 'error');
      }
      refreshAllPages();
    } catch {
      // Error already handled in import functions
    }
    e.target.value = '';
  });

  // ---- Global helpers for onclick in templates ----
  window._phantomShowPage = (page) => {
    showPage(page);
    refreshPage(page);
  };

  window._phantomLoadDemo = () => {
    // Enter demo mode — data stays in memory only, not saved to localStorage
    enterDemoMode();
    importJSONDemo(JSON.stringify(demoData));
    refreshAllPages();
    showPage('dashboard');
    toast('Demo data loaded! Preview only — nothing saved to your browser.', 'info');
  };

  // ---- Subscribe to state changes ----
  subscribe(() => {
    // Update demo mode indicator
    updateDemoBanner();
  });

  // Check if first visit
  if (state.income.length === 0 && state.debts.length === 0) {
    showPage('landing');
  } else {
    showPage('dashboard');
  }
});

// ---- Demo Banner ----
function updateDemoBanner() {
  const existing = document.getElementById('demo-mode-bar');
  if (isDemoMode()) {
    if (!existing) {
      const bar = document.createElement('div');
      bar.id = 'demo-mode-bar';
      bar.className = 'demo-mode-bar';
      bar.innerHTML = `
        <span>&#9888; <strong>DEMO MODE</strong> — Data is not saved. Go to <a href="#" id="demo-bar-settings">Settings</a> to keep or exit.</span>
      `;
      document.body.prepend(bar);
      bar.querySelector('#demo-bar-settings')?.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('settings');
        refreshPage('settings');
      });
    }
  } else {
    existing?.remove();
  }
}

// ---- Refresh Functions ----
function refreshPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'monthly': renderMonthly(); break;
    case 'debts': renderDebts(); break;
    case 'property': renderProperty(); break;
    case 'annual': renderAnnual(); break;
    case 'business': renderBusiness(); break;
    case 'settings': renderSettings(); break;
  }
}

function refreshAllPages() {
  renderDashboard();
  renderMonthly();
  renderDebts();
  renderProperty();
  renderAnnual();
  renderBusiness();
  renderSettings();
}

// ---- Import Modal ----
function showImportModal() {
  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">Import Data</h2>
    <p style="color:var(--muted2);font-size:0.85rem;margin-bottom:1.25rem;">
      Import your budget data from a JSON template or an Excel spreadsheet. This will replace your current data.
    </p>
    <div class="export-options">
      <div class="export-option" id="import-json-opt">
        <div class="export-icon" style="background:rgba(200,255,0,0.1);color:var(--accent);">{ }</div>
        <div>
          <div class="export-label">Import JSON Template</div>
          <div class="export-desc">Load from a Phantom Finance backup file</div>
        </div>
      </div>
      <div class="export-option" id="import-excel-opt">
        <div class="export-icon" style="background:rgba(0,212,255,0.1);color:var(--accent4);">&#128196;</div>
        <div>
          <div class="export-label">Import Excel Spreadsheet</div>
          <div class="export-desc">Parse data from .xlsx files</div>
        </div>
      </div>
      <div class="export-option" id="import-demo-opt">
        <div class="export-icon" style="background:rgba(112,0,255,0.1);color:var(--accent2);">&#9733;</div>
        <div>
          <div class="export-label">Load Demo Template (Preview)</div>
          <div class="export-desc">Preview demo data without saving — try before you commit</div>
        </div>
      </div>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('#import-json-opt').addEventListener('click', () => {
        closeModal();
        const input = document.getElementById('file-import');
        if (input) { input.accept = '.json'; input.click(); }
      });
      modal.querySelector('#import-excel-opt').addEventListener('click', () => {
        closeModal();
        const input = document.getElementById('file-import');
        if (input) { input.accept = '.xlsx,.xls'; input.click(); }
      });
      modal.querySelector('#import-demo-opt').addEventListener('click', () => {
        closeModal();
        window._phantomLoadDemo();
      });
    }
  });
}

// ---- Export Modal ----
function showExportModal() {
  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">Export Data</h2>
    <p style="color:var(--muted2);font-size:0.85rem;margin-bottom:1.25rem;">
      Save your budget data as a backup or shareable file.
    </p>
    <div class="export-options">
      <div class="export-option" id="export-json-opt">
        <div class="export-icon" style="background:rgba(200,255,0,0.1);color:var(--accent);">{ }</div>
        <div>
          <div class="export-label">Export as JSON</div>
          <div class="export-desc">Full backup - can be re-imported later</div>
        </div>
      </div>
      <div class="export-option" id="export-excel-opt">
        <div class="export-icon" style="background:rgba(0,212,255,0.1);color:var(--accent4);">&#128196;</div>
        <div>
          <div class="export-label">Export as Excel</div>
          <div class="export-desc">Multi-sheet spreadsheet with all data</div>
        </div>
      </div>
      <div class="export-option" id="export-template-opt">
        <div class="export-icon" style="background:rgba(112,0,255,0.1);color:var(--accent2);">&#128230;</div>
        <div>
          <div class="export-label">Export Template for Others</div>
          <div class="export-desc">JSON template to share with someone else</div>
        </div>
      </div>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('#export-json-opt').addEventListener('click', () => {
        closeModal();
        downloadJSON();
      });
      modal.querySelector('#export-excel-opt').addEventListener('click', () => {
        closeModal();
        downloadExcel();
      });
      modal.querySelector('#export-template-opt').addEventListener('click', () => {
        closeModal();
        downloadJSON(); // Same format, different name handled inside
      });
    }
  });
}
