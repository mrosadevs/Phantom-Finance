// ============================================
// PHANTOM FINANCE - ANNUAL BUDGET PAGE
// ============================================

import { getState, setState } from '../services/store.js';
import { formatCurrency, generateId, esc } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function initAnnual() {
  renderAnnual();
}

export function renderAnnual() {
  const page = document.getElementById('page-annual');
  if (!page) return;

  const state = getState();
  const incomeItems = state.annualBudget.filter(a => a.isIncome);
  const expenseItems = state.annualBudget.filter(a => !a.isIncome);
  const totalIncome = incomeItems.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const totalExpenses = expenseItems.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const net = totalIncome - totalExpenses;
  const maxAmount = Math.max(...state.annualBudget.map(a => Math.abs(Number(a.amount) || 0)), 1);

  const barColors = ['lime', 'violet', 'pink', 'cyan', 'orange'];

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">ANNUAL BUDGET</h1>
          <div class="section-subtitle">Yearly Financial Overview</div>
        </div>
        <button class="btn-primary" id="add-annual-btn">+ Add Item</button>
      </div>

      <!-- Summary -->
      <div class="summary-bar">
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon lime">&#128176;</div>
          <div class="stat-label">Annual Income</div>
          <div class="stat-value lime">${formatCurrency(totalIncome)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon pink">&#128184;</div>
          <div class="stat-label">Annual Expenses</div>
          <div class="stat-value pink">${formatCurrency(totalExpenses)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon ${net >= 0 ? 'success' : 'danger'}">${net >= 0 ? '&#128200;' : '&#128201;'}</div>
          <div class="stat-label">Net Annual</div>
          <div class="stat-value ${net >= 0 ? 'success' : 'danger'}">${formatCurrency(net)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.2s">
          <div class="stat-icon cyan">&#128197;</div>
          <div class="stat-label">Monthly Equivalent</div>
          <div class="stat-value cyan">${formatCurrency(net / 12)}</div>
        </div>
      </div>

      <!-- Income -->
      <div class="card card-lime" data-animate style="animation-delay:0.1s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#128200; Income</div>
          <span class="tag lime">${formatCurrency(totalIncome)}</span>
        </div>
        ${incomeItems.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${incomeItems.map((item, i) => `
              <div class="annual-item" data-animate style="animation-delay:${0.15 + i * 0.04}s">
                <div class="annual-name">${esc(item.name)}</div>
                <div class="annual-bar">
                  <div class="annual-fill" style="width:${(Number(item.amount) / maxAmount * 100)}%;background:linear-gradient(90deg,var(--success),#40ff90);"></div>
                </div>
                <div class="annual-amount" style="color:var(--success);">${formatCurrency(item.amount)}</div>
                <div class="row-actions">
                  <button class="row-action-btn edit-annual" data-id="${item.id}">&#9998;</button>
                  <button class="row-action-btn delete delete-annual" data-id="${item.id}">&#10005;</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `<div class="empty-state"><div class="empty-text">No annual income items</div></div>`}
      </div>

      <!-- Expenses -->
      <div class="card card-pink" data-animate style="animation-delay:0.15s;">
        <div class="card-header">
          <div class="card-title">&#128201; Expenses</div>
          <span class="tag pink">${formatCurrency(totalExpenses)}</span>
        </div>
        ${expenseItems.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${expenseItems.map((item, i) => `
              <div class="annual-item" data-animate style="animation-delay:${0.2 + i * 0.04}s">
                <div class="annual-name">${esc(item.name)}</div>
                <div class="annual-bar">
                  <div class="annual-fill" style="width:${(Number(item.amount) / maxAmount * 100)}%;background:linear-gradient(90deg,var(--${barColors[i % barColors.length]}),rgba(${barColors[i % barColors.length] === 'lime' ? '200,255,0' : barColors[i % barColors.length] === 'violet' ? '112,0,255' : barColors[i % barColors.length] === 'pink' ? '255,45,107' : barColors[i % barColors.length] === 'cyan' ? '0,212,255' : '255,136,0'},0.4));"></div>
                </div>
                <div class="annual-amount" style="color:var(--danger);">${formatCurrency(item.amount)}</div>
                <div class="row-actions">
                  <button class="row-action-btn edit-annual" data-id="${item.id}">&#9998;</button>
                  <button class="row-action-btn delete delete-annual" data-id="${item.id}">&#10005;</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `<div class="empty-state"><div class="empty-text">No annual expenses</div></div>`}
      </div>

      <!-- Visual Chart -->
      ${state.annualBudget.length > 0 ? `
        <div class="card" data-animate style="animation-delay:0.2s;margin-top:1.5rem;">
          <div class="card-header">
            <div class="card-title">Budget Distribution</div>
          </div>
          <div class="chart-bars" style="height:160px;padding-bottom:2rem;">
            ${state.annualBudget.map((item, i) => {
              const pct = Math.abs(Number(item.amount) || 0) / maxAmount * 100;
              return `<div class="chart-bar ${item.isIncome ? 'lime' : barColors[i % barColors.length]}" style="height:${pct}%;" data-label="${esc(item.name).substring(0, 8)}" title="${esc(item.name)}: ${formatCurrency(item.amount)}"></div>`;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Events
  page.querySelector('#add-annual-btn')?.addEventListener('click', () => showAnnualModal());
  page.querySelectorAll('.edit-annual').forEach(btn => {
    btn.addEventListener('click', () => showAnnualModal(btn.dataset.id));
  });
  page.querySelectorAll('.delete-annual').forEach(btn => {
    btn.addEventListener('click', () => {
      setState(s => { s.annualBudget = s.annualBudget.filter(a => a.id !== btn.dataset.id); });
      renderAnnual();
      toast('Item removed', 'info');
    });
  });
}

function showAnnualModal(editId) {
  const state = getState();
  const existing = editId ? state.annualBudget.find(a => a.id === editId) : null;

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">${existing ? 'Edit' : 'Add'} Annual Item</h2>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input class="form-input" id="annual-name" value="${existing ? esc(existing.name) : ''}" placeholder="e.g. Revenue, Taxes" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount ($)</label>
        <input class="form-input" id="annual-amount" type="number" step="0.01" value="${existing ? existing.amount : ''}" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-input" id="annual-type">
          <option value="income" ${existing?.isIncome ? 'selected' : ''}>Income</option>
          <option value="expense" ${existing && !existing.isIncome ? 'selected' : ''}>Expense</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-annual">Save</button>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-annual').addEventListener('click', () => {
        const name = modal.querySelector('#annual-name').value.trim();
        const amount = parseFloat(modal.querySelector('#annual-amount').value) || 0;
        const isIncome = modal.querySelector('#annual-type').value === 'income';
        if (!name) { toast('Enter a name', 'error'); return; }
        setState(s => {
          if (existing) {
            const idx = s.annualBudget.findIndex(a => a.id === editId);
            if (idx >= 0) s.annualBudget[idx] = { ...s.annualBudget[idx], name, amount: Math.abs(amount), isIncome };
          } else {
            s.annualBudget.push({ id: generateId(), name, amount: Math.abs(amount), isIncome });
          }
        });
        closeModal();
        renderAnnual();
        toast(existing ? 'Item updated!' : 'Item added!', 'success');
      });
      modal.querySelector('#annual-name').focus();
    }
  });
}
