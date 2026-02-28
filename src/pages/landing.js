// ============================================
// PHANTOM FINANCE - LANDING PAGE
// ============================================

import { showPage } from '../utils/helpers.js';

export function initLanding() {
  const page = document.getElementById('page-landing');
  if (!page) return;

  page.innerHTML = `
    <section class="landing-hero">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <div class="hero-badge">
        <span class="badge-dot"></span>
        <span>Smart Budget Management</span>
      </div>

      <h1 class="hero-title">
        YOUR FINANCES<br>
        <span class="gradient-text">UNDER CONTROL</span>
      </h1>

      <p class="hero-subtitle">
        Track income, expenses, debts, and property costs with an automated budget system.
        Import your data, export backups, and never lose track of your money again.
      </p>

      <div class="hero-actions">
        <button class="btn-primary" id="hero-start">GET STARTED</button>
        <button class="btn-ghost" id="hero-import">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          IMPORT DATA
        </button>
      </div>
    </section>

    <section class="landing-features">
      <div class="section-header" style="text-align:center;justify-content:center;flex-direction:column;">
        <h2 class="section-title">EVERYTHING YOU NEED</h2>
        <p class="section-subtitle">Packed with features to manage every aspect of your finances</p>
      </div>
      <div class="features-grid">
        <div class="feature-card" data-animate style="animation-delay:0.1s">
          <div class="feature-icon">&#128176;</div>
          <h3 class="feature-title">Monthly Budget</h3>
          <p class="feature-desc">Track all income sources and monthly expenses. See where your money goes with auto-calculated totals and category breakdowns.</p>
        </div>
        <div class="feature-card" data-animate style="animation-delay:0.15s">
          <div class="feature-icon">&#128179;</div>
          <h3 class="feature-title">Debt Tracker</h3>
          <p class="feature-desc">Monitor every debt with progress bars, payment schedules, and payoff estimates. Visualize your journey to being debt-free.</p>
        </div>
        <div class="feature-card" data-animate style="animation-delay:0.2s">
          <div class="feature-icon">&#127968;</div>
          <h3 class="feature-title">Property Expenses</h3>
          <p class="feature-desc">Track home renovation and repair costs. Check off completed projects and see your total investment at a glance.</p>
        </div>
        <div class="feature-card" data-animate style="animation-delay:0.25s">
          <div class="feature-icon">&#128197;</div>
          <h3 class="feature-title">Annual Overview</h3>
          <p class="feature-desc">Plan your year with income projections and major expenses. See the big picture and set annual financial goals.</p>
        </div>
        <div class="feature-card" data-animate style="animation-delay:0.3s">
          <div class="feature-icon">&#128188;</div>
          <h3 class="feature-title">Business Expenses</h3>
          <p class="feature-desc">Separate business costs from personal. Track subscriptions, software, and operational costs with monthly and annual views.</p>
        </div>
        <div class="feature-card" data-animate style="animation-delay:0.35s">
          <div class="feature-icon">&#128190;</div>
          <h3 class="feature-title">Import & Export</h3>
          <p class="feature-desc">Import from Excel or JSON templates. Export your data as Excel spreadsheets or JSON backups. Never lose your data.</p>
        </div>
      </div>
    </section>

    <section class="landing-stats">
      <div class="stats-row">
        <div class="landing-stat" data-animate style="animation-delay:0.1s">
          <div class="stat-num">100%</div>
          <div class="stat-desc">Browser Based</div>
        </div>
        <div class="landing-stat" data-animate style="animation-delay:0.2s">
          <div class="stat-num">0</div>
          <div class="stat-desc">Server Required</div>
        </div>
        <div class="landing-stat" data-animate style="animation-delay:0.3s">
          <div class="stat-num">&infin;</div>
          <div class="stat-desc">Data Privacy</div>
        </div>
      </div>
    </section>

    <section class="landing-changelog">
      <div class="changelog-container">
        <div class="section-header" style="text-align:center;justify-content:center;flex-direction:column;margin-bottom:2rem;">
          <h2 class="section-title">WHAT'S NEW</h2>
          <p class="section-subtitle">Recent updates &amp; improvements</p>
        </div>
        <div class="changelog-entries">

          <div class="changelog-entry theodore-entry" data-animate style="animation-delay:0.05s">
            <div class="changelog-dot ghost"></div>
            <div class="changelog-body">
              <div class="changelog-meta">
                <span class="changelog-tag ai">&#129302; AI Visit</span>
                <span class="changelog-date">Feb 28, 2026</span>
              </div>
              <div class="changelog-title">Theodore was here.</div>
              <div class="changelog-desc">
                Offline's AI dropped by at 2AM, poked around the codebase, decided everything looked good enough not to rewrite,
                and left this note so you'd know. No bugs introduced. Probably. — <em>Theodore</em>
              </div>
            </div>
          </div>

          <div class="changelog-entry" data-animate style="animation-delay:0.1s">
            <div class="changelog-dot lime"></div>
            <div class="changelog-body">
              <div class="changelog-meta">
                <span class="changelog-tag feature">&#10024; Feature</span>
                <span class="changelog-date">Feb 2026</span>
              </div>
              <div class="changelog-title">245+ Smart Financial Tips</div>
              <div class="changelog-desc">Contextual tips that adapt to your actual financial situation — not just generic advice. Daily rotating tip included.</div>
            </div>
          </div>

          <div class="changelog-entry" data-animate style="animation-delay:0.15s">
            <div class="changelog-dot violet"></div>
            <div class="changelog-body">
              <div class="changelog-meta">
                <span class="changelog-tag feature">&#10024; Feature</span>
                <span class="changelog-date">Feb 2026</span>
              </div>
              <div class="changelog-title">Business Expense Tracker</div>
              <div class="changelog-desc">Separate your freelance &amp; business costs from personal finances. Monthly + annual views, all in one place.</div>
            </div>
          </div>

          <div class="changelog-entry" data-animate style="animation-delay:0.2s">
            <div class="changelog-dot cyan"></div>
            <div class="changelog-body">
              <div class="changelog-meta">
                <span class="changelog-tag improvement">&#128736; Improved</span>
                <span class="changelog-date">Jan 2026</span>
              </div>
              <div class="changelog-title">Excel Import &amp; Export</div>
              <div class="changelog-desc">Full multi-sheet workbook export and .xlsx import with automatic column mapping. Your data, your format.</div>
            </div>
          </div>

          <div class="changelog-entry" data-animate style="animation-delay:0.25s">
            <div class="changelog-dot pink"></div>
            <div class="changelog-body">
              <div class="changelog-meta">
                <span class="changelog-tag improvement">&#128736; Improved</span>
                <span class="changelog-date">Jan 2026</span>
              </div>
              <div class="changelog-title">Responsive from Mobile to 8K</div>
              <div class="changelog-desc">Layout scales cleanly across every viewport. Tested from 375px phones to 7680px ultrawide displays.</div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="landing-cta">
      <div class="cta-card" data-animate>
        <h2 class="cta-title">Ready to Take Control?</h2>
        <p class="cta-text">All your data stays in your browser. No accounts, no servers, no monthly fees. Just you and your finances.</p>
        <div class="btn-group" style="justify-content:center;">
          <button class="btn-primary" id="cta-start">OPEN DASHBOARD</button>
          <button class="btn-ghost" id="cta-demo">LOAD DEMO DATA</button>
        </div>
      </div>
    </section>
  `;

  // Event listeners
  page.querySelector('#hero-start').addEventListener('click', () => showPage('dashboard'));
  page.querySelector('#hero-import').addEventListener('click', () => window._phantomShowImportModal?.());
  page.querySelector('#cta-start').addEventListener('click', () => showPage('dashboard'));
  page.querySelector('#cta-demo').addEventListener('click', () => {
    window._phantomLoadDemo?.();
  });
}
