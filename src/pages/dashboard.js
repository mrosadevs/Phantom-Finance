// ============================================
// PHANTOM FINANCE - DASHBOARD
// ============================================

import { getState, getTotalIncome, getTotalExpenses, getTotalDebtPayments, getTotalDebt, getTotalPropertyExpenses, getTotalBusinessExpenses, getNetMonthly } from '../services/store.js';
import { formatCurrency, getGreeting, getCurrentMonth, showPage, animateValue, esc } from '../utils/helpers.js';
import { getRandomTips, getContextualTips, getDailyTip } from '../services/tips.js';

export function initDashboard() {
  renderDashboard();
}

export function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  if (!page) return;

  const state = getState();
  const income = getTotalIncome();
  const expenses = getTotalExpenses();
  const debtPayments = getTotalDebtPayments();
  const totalDebt = getTotalDebt();
  const propertyTotal = getTotalPropertyExpenses();
  const bizExpenses = getTotalBusinessExpenses();
  const net = getNetMonthly();

  const totalMonthlyOut = expenses + debtPayments + bizExpenses;
  const annualIncome = state.annualBudget.filter(a => a.isIncome).reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const annualExpenses = state.annualBudget.filter(a => !a.isIncome).reduce((s, a) => s + (Number(a.amount) || 0), 0);

  // Upcoming payments (due in next 7 days)
  const today = new Date().getDate();
  const upcoming = [
    ...state.monthlyExpenses.filter(e => e.dueDay && e.dueDay >= today && e.dueDay <= today + 7),
    ...state.debts.filter(d => d.dueDay && d.dueDay >= today && d.dueDay <= today + 7),
  ];

  // Category breakdown for expenses
  const categories = {};
  state.monthlyExpenses.forEach(e => {
    const cat = e.category || 'Other';
    categories[cat] = (categories[cat] || 0) + (Number(e.amount) || 0);
  });
  const catColors = ['lime', 'violet', 'pink', 'cyan', 'orange'];
  const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  // Financial tips: mix of contextual + random from 200+ tip library
  const contextualTips = getContextualTips(state, 2);
  const randomTips = getRandomTips(3);
  const dailyTip = getDailyTip();
  // Combine: contextual tips first, then daily tip, then random tips (deduplicated)
  const allTips = [...contextualTips, dailyTip, ...randomTips];
  const tips = [...new Set(allTips)].slice(0, 5);

  // Debt progress (paid off percentage)
  const totalOriginalDebt = state.debts.reduce((s, d) => s + (Number(d.originalDebt) || Number(d.totalDebt) || 0), 0);
  const debtPaidPercent = totalOriginalDebt > 0 ? ((totalOriginalDebt - totalDebt) / totalOriginalDebt * 100) : 0;

  page.innerHTML = `
    <div class="section">
      <div class="dashboard-hero">
        <div class="dashboard-greeting">${getGreeting()} &mdash; ${getCurrentMonth()}</div>
        <div class="dashboard-total">
          <span class="currency">$</span><span data-format="currency" class="total-value">${Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="dashboard-total-label">${net >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}</div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon lime">&#128176;</div>
          <div class="stat-label">Monthly Income</div>
          <div class="stat-value lime">${formatCurrency(income)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon pink">&#128184;</div>
          <div class="stat-label">Monthly Expenses</div>
          <div class="stat-value pink">${formatCurrency(expenses)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon violet">&#128179;</div>
          <div class="stat-label">Debt Payments</div>
          <div class="stat-value violet">${formatCurrency(debtPayments)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.2s">
          <div class="stat-icon cyan">&#128188;</div>
          <div class="stat-label">Business Costs</div>
          <div class="stat-value cyan">${formatCurrency(bizExpenses)}</div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div style="display:flex;flex-direction:column;gap:1.5rem;">
          <!-- Spending Breakdown -->
          <div class="card card-lime" data-animate style="animation-delay:0.15s">
            <div class="card-header">
              <div class="card-title">Spending Breakdown</div>
              <span class="tag lime">${state.monthlyExpenses.length} Items</span>
            </div>
            ${catEntries.length > 0 ? `
              <div class="spending-breakdown">
                <div class="spending-chart">
                  <div class="donut-chart" style="background: conic-gradient(${buildConicGradient(catEntries, totalMonthlyOut)});">
                    <div class="donut-center">
                      <div class="donut-value">${formatCurrency(totalMonthlyOut)}</div>
                      <div class="donut-label">Total Out</div>
                    </div>
                  </div>
                </div>
                <div class="spending-legend">
                  ${catEntries.map(([ cat, val ], i) => `
                    <div class="legend-item" data-animate style="animation-delay:${0.2 + i * 0.05}s">
                      <div class="legend-dot" style="background:var(--${catColors[i % catColors.length]})"></div>
                      <div class="legend-name">${esc(cat)}</div>
                      <div class="legend-value">${formatCurrency(val)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-icon">&#128202;</div>
                <div class="empty-text">No expenses tracked yet</div>
                <button class="btn-ghost" onclick="window._phantomShowPage?.('monthly')">Add Expenses</button>
              </div>
            `}
          </div>

          <!-- Debt Overview -->
          <div class="card card-violet" data-animate style="animation-delay:0.2s">
            <div class="card-header">
              <div class="card-title">Debt Progress</div>
              <span class="tag violet">${state.debts.length} Debts</span>
            </div>
            ${state.debts.length > 0 ? `
              <div style="margin-bottom:1rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                  <span class="stat-label">Total Remaining</span>
                  <span class="stat-value violet" style="font-size:1.2rem;">${formatCurrency(totalDebt)}</span>
                </div>
                <div class="progress-bar" style="height:12px;">
                  <div class="progress-fill violet" style="width:${Math.min(debtPaidPercent, 100)}%"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:0.4rem;">
                  <span class="stat-label">${debtPaidPercent.toFixed(1)}% Paid Off</span>
                  <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--muted);">${formatCurrency(totalOriginalDebt)} Original</span>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.5rem;">
                ${state.debts.slice(0, 5).map((d, i) => {
                  const orig = Number(d.originalDebt) || Number(d.totalDebt) || 1;
                  const pct = ((orig - (Number(d.totalDebt) || 0)) / orig * 100);
                  return `
                    <div class="budget-bar" data-animate style="animation-delay:${0.25 + i * 0.05}s">
                      <div class="budget-bar-header">
                        <span class="budget-bar-name">${esc(d.name)}</span>
                        <span class="budget-bar-amounts">${formatCurrency(d.monthlyPayment)}/mo</span>
                      </div>
                      <div class="budget-bar-track">
                        <div class="budget-bar-fill ${pct > 60 ? 'under' : pct > 30 ? 'near' : 'over'}" style="width:${Math.min(pct, 100)}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
                ${state.debts.length > 5 ? `<div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--muted);text-align:center;margin-top:0.5rem;">+ ${state.debts.length - 5} more debts</div>` : ''}
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-icon">&#127881;</div>
                <div class="empty-text">No debts tracked</div>
                <button class="btn-ghost" onclick="window._phantomShowPage?.('debts')">Add Debts</button>
              </div>
            `}
          </div>
        </div>

        <!-- Right Column -->
        <div style="display:flex;flex-direction:column;gap:1.5rem;">
          <!-- Alerts & Upcoming -->
          <div class="card card-orange" data-animate style="animation-delay:0.1s">
            <div class="card-header">
              <div class="card-title">Alerts & Reminders</div>
            </div>
            ${net < 0 ? `
              <div class="alert-item danger">
                <span class="alert-icon">&#9888;</span>
                <div class="alert-content">
                  <div class="alert-title">Budget Deficit</div>
                  <div class="alert-text">You're spending ${formatCurrency(Math.abs(net))} more than you earn monthly.</div>
                </div>
              </div>
            ` : ''}
            ${upcoming.length > 0 ? upcoming.map(u => `
              <div class="alert-item warning">
                <span class="alert-icon">&#128197;</span>
                <div class="alert-content">
                  <div class="alert-title">${esc(u.name)} due on the ${u.dueDay}${ordinal(u.dueDay)}</div>
                  <div class="alert-text">${formatCurrency(u.amount || u.monthlyPayment)}</div>
                </div>
              </div>
            `).join('') : ''}
            ${net >= 0 && upcoming.length === 0 ? `
              <div class="alert-item success">
                <span class="alert-icon">&#10003;</span>
                <div class="alert-content">
                  <div class="alert-title">All Clear</div>
                  <div class="alert-text">No upcoming payments in the next 7 days.</div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Tips -->
          <div class="card card-cyan" data-animate style="animation-delay:0.15s">
            <div class="card-header">
              <div class="card-title">Financial Tips</div>
              <button class="btn-ghost btn-sm" id="refresh-tips-btn" title="Get new tips">&#128260; Refresh</button>
            </div>
            ${tips.map((t, i) => `
              <div class="tip-card" data-animate style="animation-delay:${0.2 + i * 0.05}s;margin-bottom:0.5rem;">
                <div class="tip-label">&#128161; ${i === 0 ? 'Your Situation' : i === 1 ? 'Your Situation' : i === 2 ? 'Daily Tip' : 'Random Tip'}</div>
                <div class="tip-text">${t}</div>
              </div>
            `).join('')}
          </div>

          <!-- Quick Navigation -->
          <div class="card" data-animate style="animation-delay:0.2s">
            <div class="card-header">
              <div class="card-title">Quick Access</div>
            </div>
            <div class="resource-links">
              <div class="resource-link" onclick="window._phantomShowPage?.('monthly')">
                <div class="resource-icon">&#128176;</div>
                <div class="resource-name">Budget</div>
                <div class="resource-desc">Monthly Tracker</div>
              </div>
              <div class="resource-link" onclick="window._phantomShowPage?.('debts')">
                <div class="resource-icon">&#128179;</div>
                <div class="resource-name">Debts</div>
                <div class="resource-desc">${state.debts.length} Active</div>
              </div>
              <div class="resource-link" onclick="window._phantomShowPage?.('property')">
                <div class="resource-icon">&#127968;</div>
                <div class="resource-name">Property</div>
                <div class="resource-desc">${formatCurrency(propertyTotal)}</div>
              </div>
              <div class="resource-link" onclick="window._phantomShowPage?.('annual')">
                <div class="resource-icon">&#128197;</div>
                <div class="resource-name">Annual</div>
                <div class="resource-desc">Yearly View</div>
              </div>
            </div>
          </div>

          <!-- Monthly Breakdown Chart -->
          <div class="card card-pink" data-animate style="animation-delay:0.25s">
            <div class="card-header">
              <div class="card-title">Monthly Flow</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <div class="budget-bar">
                <div class="budget-bar-header">
                  <span class="budget-bar-name">Income</span>
                  <span class="budget-bar-amounts" style="color:var(--success)">${formatCurrency(income)}</span>
                </div>
                <div class="budget-bar-track" style="height:10px;">
                  <div class="budget-bar-fill under" style="width:100%"></div>
                </div>
              </div>
              <div class="budget-bar">
                <div class="budget-bar-header">
                  <span class="budget-bar-name">Expenses</span>
                  <span class="budget-bar-amounts">${formatCurrency(expenses)}</span>
                </div>
                <div class="budget-bar-track" style="height:10px;">
                  <div class="budget-bar-fill ${expenses > income * 0.5 ? 'over' : 'near'}" style="width:${income > 0 ? Math.min(expenses / income * 100, 100) : 0}%"></div>
                </div>
              </div>
              <div class="budget-bar">
                <div class="budget-bar-header">
                  <span class="budget-bar-name">Debts</span>
                  <span class="budget-bar-amounts">${formatCurrency(debtPayments)}</span>
                </div>
                <div class="budget-bar-track" style="height:10px;">
                  <div class="budget-bar-fill ${debtPayments > income * 0.4 ? 'over' : 'near'}" style="width:${income > 0 ? Math.min(debtPayments / income * 100, 100) : 0}%"></div>
                </div>
              </div>
              <div class="budget-bar">
                <div class="budget-bar-header">
                  <span class="budget-bar-name">Business</span>
                  <span class="budget-bar-amounts">${formatCurrency(bizExpenses)}</span>
                </div>
                <div class="budget-bar-track" style="height:10px;">
                  <div class="budget-bar-fill near" style="width:${income > 0 ? Math.min(bizExpenses / income * 100, 100) : 0}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Refresh tips button
  page.querySelector('#refresh-tips-btn')?.addEventListener('click', () => {
    renderDashboard();
  });
}

function buildConicGradient(entries, total) {
  const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--accent4)', 'var(--accent5)'];
  let angle = 0;
  const segments = [];
  entries.forEach(([, val], i) => {
    const pct = total > 0 ? (val / total) * 360 : 0;
    const color = colors[i % colors.length];
    segments.push(`${color} ${angle}deg ${angle + pct}deg`);
    angle += pct;
  });
  if (angle < 360) {
    segments.push(`var(--border) ${angle}deg 360deg`);
  }
  return segments.join(', ');
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
