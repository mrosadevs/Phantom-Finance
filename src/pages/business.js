// ============================================
// PHANTOM FINANCE - BUSINESS EXPENSES PAGE
// ============================================

import { getState, setState, getTotalBusinessExpenses } from '../services/store.js';
import { formatCurrency, generateId, esc } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function initBusiness() {
  renderBusiness();
}

export function renderBusiness() {
  const page = document.getElementById('page-business');
  if (!page) return;

  const state = getState();
  const totalMonthly = getTotalBusinessExpenses();
  const totalAnnual = state.businessExpenses.reduce((s, b) => s + (Number(b.annualCost) || (Number(b.monthlyCost) || 0) * 12), 0);

  // Group by category
  const categories = {};
  state.businessExpenses.forEach(b => {
    const cat = b.category || 'General';
    if (!categories[cat]) categories[cat] = { items: [], total: 0 };
    categories[cat].items.push(b);
    categories[cat].total += Number(b.monthlyCost) || 0;
  });

  const catColors = ['lime', 'violet', 'pink', 'cyan', 'orange'];
  const catEntries = Object.entries(categories).sort((a, b) => b[1].total - a[1].total);

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">BUSINESS EXPENSES</h1>
          <div class="section-subtitle">Operational & Subscription Costs</div>
        </div>
        <button class="btn-primary" id="add-biz-btn">+ Add Expense</button>
      </div>

      <!-- Summary -->
      <div class="summary-bar">
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon cyan">&#128188;</div>
          <div class="stat-label">Monthly Total</div>
          <div class="stat-value cyan">${formatCurrency(totalMonthly)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon violet">&#128197;</div>
          <div class="stat-label">Annual Total</div>
          <div class="stat-value violet">${formatCurrency(totalAnnual)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon orange">&#128230;</div>
          <div class="stat-label">Subscriptions</div>
          <div class="stat-value orange">${state.businessExpenses.length}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.2s">
          <div class="stat-icon pink">&#128202;</div>
          <div class="stat-label">Avg Per Item</div>
          <div class="stat-value pink">${formatCurrency(state.businessExpenses.length > 0 ? totalMonthly / state.businessExpenses.length : 0)}</div>
        </div>
      </div>

      <!-- Category Breakdown -->
      ${catEntries.length > 0 ? catEntries.map(([cat, data], ci) => `
        <div class="card card-${catColors[ci % catColors.length]}" data-animate style="animation-delay:${0.1 + ci * 0.05}s;margin-bottom:1.5rem;">
          <div class="card-header">
            <div class="card-title">${esc(cat)}</div>
            <span class="tag ${catColors[ci % catColors.length]}">${formatCurrency(data.total)}/mo</span>
          </div>
          <div class="data-list">
            ${data.items.map((b, i) => `
              <div class="data-row" data-animate style="animation-delay:${0.15 + i * 0.03}s">
                <span class="row-name">${esc(b.name)}</span>
                <span class="row-meta">${formatCurrency(b.annualCost || (Number(b.monthlyCost) || 0) * 12)}/yr</span>
                <span class="row-amount">${formatCurrency(b.monthlyCost)}<span style="font-size:0.65rem;color:var(--muted)">/mo</span></span>
                <div class="row-actions">
                  <button class="row-action-btn edit-biz" data-id="${b.id}">&#9998;</button>
                  <button class="row-action-btn delete delete-biz" data-id="${b.id}">&#10005;</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('') : `
        <div class="empty-state">
          <div class="empty-icon">&#128188;</div>
          <div class="empty-text">No business expenses tracked</div>
        </div>
      `}

      <!-- Cost chart -->
      ${state.businessExpenses.length > 0 ? `
        <div class="card" data-animate style="animation-delay:0.2s;">
          <div class="card-header">
            <div class="card-title">Cost Comparison</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${state.businessExpenses.sort((a, b) => (Number(b.monthlyCost) || 0) - (Number(a.monthlyCost) || 0)).map((b, i) => {
              const pct = totalMonthly > 0 ? ((Number(b.monthlyCost) || 0) / totalMonthly * 100) : 0;
              return `
                <div class="budget-bar" data-animate style="animation-delay:${0.25 + i * 0.03}s">
                  <div class="budget-bar-header">
                    <span class="budget-bar-name">${esc(b.name)}</span>
                    <span class="budget-bar-amounts">${formatCurrency(b.monthlyCost)}</span>
                  </div>
                  <div class="budget-bar-track">
                    <div class="budget-bar-fill near" style="width:${pct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Events
  page.querySelector('#add-biz-btn')?.addEventListener('click', () => showBizModal());
  page.querySelectorAll('.edit-biz').forEach(btn => {
    btn.addEventListener('click', () => showBizModal(btn.dataset.id));
  });
  page.querySelectorAll('.delete-biz').forEach(btn => {
    btn.addEventListener('click', () => {
      setState(s => { s.businessExpenses = s.businessExpenses.filter(b => b.id !== btn.dataset.id); });
      renderBusiness();
      toast('Expense removed', 'info');
    });
  });
}

function showBizModal(editId) {
  const state = getState();
  const existing = editId ? state.businessExpenses.find(b => b.id === editId) : null;

  const catOptions = ['Software', 'Subscriptions', 'Insurance', 'Accounting', 'Marketing', 'Communication', 'Office', 'Cloud', 'Legal', 'Other'];

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">${existing ? 'Edit' : 'Add'} Business Expense</h2>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input class="form-input" id="biz-name" value="${existing ? esc(existing.name) : ''}" placeholder="e.g. QuickBooks, Zoom" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Monthly Cost ($)</label>
        <input class="form-input" id="biz-monthly" type="number" step="0.01" value="${existing ? existing.monthlyCost : ''}" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Annual Cost ($)</label>
        <input class="form-input" id="biz-annual" type="number" step="0.01" value="${existing ? existing.annualCost : ''}" placeholder="Auto-calculated" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-input" id="biz-cat">
        ${catOptions.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-biz">Save</button>
    </div>
  `, {
    onOpen: (modal) => {
      // Auto-calc annual from monthly
      const monthlyInput = modal.querySelector('#biz-monthly');
      const annualInput = modal.querySelector('#biz-annual');
      monthlyInput.addEventListener('input', () => {
        const m = parseFloat(monthlyInput.value) || 0;
        if (!annualInput.value || annualInput.dataset.autoCalc === 'true') {
          annualInput.value = (m * 12).toFixed(2);
          annualInput.dataset.autoCalc = 'true';
        }
      });
      annualInput.addEventListener('input', () => { annualInput.dataset.autoCalc = 'false'; });

      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-biz').addEventListener('click', () => {
        const name = modal.querySelector('#biz-name').value.trim();
        const monthlyCost = parseFloat(modal.querySelector('#biz-monthly').value) || 0;
        const annualCost = parseFloat(modal.querySelector('#biz-annual').value) || monthlyCost * 12;
        const category = modal.querySelector('#biz-cat').value;
        if (!name) { toast('Enter a name', 'error'); return; }
        setState(s => {
          if (existing) {
            const idx = s.businessExpenses.findIndex(b => b.id === editId);
            if (idx >= 0) s.businessExpenses[idx] = { ...s.businessExpenses[idx], name, monthlyCost, annualCost, category };
          } else {
            s.businessExpenses.push({ id: generateId(), name, monthlyCost, annualCost, category });
          }
        });
        closeModal();
        renderBusiness();
        toast(existing ? 'Expense updated!' : 'Expense added!', 'success');
      });
      modal.querySelector('#biz-name').focus();
    }
  });
}
