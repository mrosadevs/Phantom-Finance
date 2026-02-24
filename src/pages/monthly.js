// ============================================
// PHANTOM FINANCE - MONTHLY BUDGET PAGE
// ============================================

import { getState, setState, getTotalIncome, getTotalExpenses } from '../services/store.js';
import { formatCurrency, generateId, esc, showPage } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function initMonthly() {
  renderMonthly();
}

export function renderMonthly() {
  const page = document.getElementById('page-monthly');
  if (!page) return;

  const state = getState();
  const income = getTotalIncome();
  const expenses = getTotalExpenses();
  const net = income - expenses;

  // Group expenses by category
  const categories = {};
  state.monthlyExpenses.forEach(e => {
    const cat = e.category || 'General';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(e);
  });

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">MONTHLY BUDGET</h1>
          <div class="section-subtitle">Income & Expense Tracker</div>
        </div>
        <div class="btn-group">
          <button class="btn-primary" id="add-income-btn">+ Income</button>
          <button class="btn-secondary" id="add-expense-btn">+ Expense</button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="summary-bar">
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon lime">&#128176;</div>
          <div class="stat-label">Total Income</div>
          <div class="stat-value lime">${formatCurrency(income)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon pink">&#128184;</div>
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value pink">${formatCurrency(expenses)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon ${net >= 0 ? 'success' : 'danger'}">${net >= 0 ? '&#128200;' : '&#128201;'}</div>
          <div class="stat-label">Net Balance</div>
          <div class="stat-value ${net >= 0 ? 'success' : 'danger'}">${formatCurrency(net)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.2s">
          <div class="stat-icon cyan">&#128197;</div>
          <div class="stat-label">Annual Need</div>
          <div class="stat-value cyan">${formatCurrency((expenses) * 12)}</div>
        </div>
      </div>

      <!-- Income Section -->
      <div class="card card-lime" data-animate style="animation-delay:0.1s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#128176; Income Sources</div>
          <span class="tag lime">${state.income.length} Sources</span>
        </div>
        ${state.income.length > 0 ? `
          <div class="data-list">
            ${state.income.map((inc, i) => `
              <div class="data-row" data-animate style="animation-delay:${0.15 + i * 0.04}s" data-id="${inc.id}">
                <span class="row-name">${esc(inc.name)}</span>
                <span class="tag ${inc.frequency === 'monthly' ? 'lime' : inc.frequency === 'biweekly' ? 'cyan' : 'orange'}">${inc.frequency || 'monthly'}</span>
                <span class="row-amount positive">${formatCurrency(inc.amount)}</span>
                <div class="row-actions">
                  <button class="row-action-btn edit-income" data-id="${inc.id}" title="Edit">&#9998;</button>
                  <button class="row-action-btn delete delete-income" data-id="${inc.id}" title="Delete">&#10005;</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-icon">&#128176;</div>
            <div class="empty-text">No income sources added</div>
          </div>
        `}
      </div>

      <!-- Expenses Section -->
      <div class="card card-pink" data-animate style="animation-delay:0.15s;">
        <div class="card-header">
          <div class="card-title">&#128184; Monthly Expenses</div>
          <span class="tag pink">${state.monthlyExpenses.length} Items</span>
        </div>

        ${state.monthlyExpenses.length > 0 ? `
          <!-- Budget usage bar -->
          <div style="margin-bottom:1.25rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
              <span class="stat-label">Budget Usage</span>
              <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--muted2);">
                ${income > 0 ? (expenses / income * 100).toFixed(1) + '%' : 'N/A'}
              </span>
            </div>
            <div class="progress-bar" style="height:10px;">
              <div class="progress-fill ${expenses > income ? 'danger' : expenses > income * 0.8 ? 'orange' : 'success'}"
                   style="width:${income > 0 ? Math.min(expenses / income * 100, 100) : 0}%"></div>
            </div>
          </div>

          ${Object.entries(categories).map(([cat, items]) => `
            <div style="margin-bottom:1rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                <span class="card-label">${esc(cat)}</span>
                <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--muted);">
                  ${formatCurrency(items.reduce((s, e) => s + (Number(e.amount) || 0), 0))}
                </span>
              </div>
              <div class="data-list">
                ${items.map((exp, i) => `
                  <div class="data-row" data-animate style="animation-delay:${0.2 + i * 0.03}s" data-id="${exp.id}">
                    <span class="row-name">${esc(exp.name)}</span>
                    ${exp.dueDay ? `<span class="row-meta">Day ${exp.dueDay}</span>` : ''}
                    ${exp.autoPay ? `<span class="tag success">Auto</span>` : ''}
                    <span class="row-amount negative">${formatCurrency(exp.amount)}</span>
                    <div class="row-actions">
                      <button class="row-action-btn edit-expense" data-id="${exp.id}" title="Edit">&#9998;</button>
                      <button class="row-action-btn delete delete-expense" data-id="${exp.id}" title="Delete">&#10005;</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        ` : `
          <div class="empty-state">
            <div class="empty-icon">&#128184;</div>
            <div class="empty-text">No expenses tracked yet</div>
          </div>
        `}
      </div>
    </div>
  `;

  // Bind events
  page.querySelector('#add-income-btn')?.addEventListener('click', () => showIncomeModal());
  page.querySelector('#add-expense-btn')?.addEventListener('click', () => showExpenseModal());

  page.querySelectorAll('.edit-income').forEach(btn => {
    btn.addEventListener('click', () => showIncomeModal(btn.dataset.id));
  });
  page.querySelectorAll('.delete-income').forEach(btn => {
    btn.addEventListener('click', () => deleteIncome(btn.dataset.id));
  });
  page.querySelectorAll('.edit-expense').forEach(btn => {
    btn.addEventListener('click', () => showExpenseModal(btn.dataset.id));
  });
  page.querySelectorAll('.delete-expense').forEach(btn => {
    btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
  });
}

function showIncomeModal(editId) {
  const state = getState();
  const existing = editId ? state.income.find(i => i.id === editId) : null;

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">${existing ? 'Edit' : 'Add'} Income Source</h2>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input class="form-input" id="income-name" value="${existing ? esc(existing.name) : ''}" placeholder="e.g. Salary, Freelance" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount ($)</label>
        <input class="form-input" id="income-amount" type="number" step="0.01" value="${existing ? existing.amount : ''}" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Frequency</label>
        <select class="form-input" id="income-freq">
          <option value="monthly" ${existing?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
          <option value="biweekly" ${existing?.frequency === 'biweekly' ? 'selected' : ''}>Bi-Weekly</option>
          <option value="weekly" ${existing?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-income">Save</button>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-income').addEventListener('click', () => {
        const name = modal.querySelector('#income-name').value.trim();
        const amount = parseFloat(modal.querySelector('#income-amount').value);
        const frequency = modal.querySelector('#income-freq').value;
        if (!name || isNaN(amount)) {
          toast('Please fill in all fields', 'error');
          return;
        }
        setState(s => {
          if (existing) {
            const idx = s.income.findIndex(i => i.id === editId);
            if (idx >= 0) s.income[idx] = { ...s.income[idx], name, amount, frequency };
          } else {
            s.income.push({ id: generateId(), name, amount, frequency });
          }
        });
        closeModal();
        renderMonthly();
        toast(existing ? 'Income updated!' : 'Income added!', 'success');
      });
      modal.querySelector('#income-name').focus();
    }
  });
}

function showExpenseModal(editId) {
  const state = getState();
  const existing = editId ? state.monthlyExpenses.find(e => e.id === editId) : null;

  const categoryOptions = ['Housing', 'Utilities', 'Food', 'Transportation', 'Insurance', 'Health', 'Entertainment', 'Phone', 'Internet', 'Subscriptions', 'Personal', 'Business', 'General'];

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">${existing ? 'Edit' : 'Add'} Expense</h2>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input class="form-input" id="exp-name" value="${existing ? esc(existing.name) : ''}" placeholder="e.g. Electricity, Groceries" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Amount ($)</label>
        <input class="form-input" id="exp-amount" type="number" step="0.01" value="${existing ? existing.amount : ''}" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-input" id="exp-category">
          ${categoryOptions.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Due Day (1-31)</label>
        <input class="form-input" id="exp-due" type="number" min="1" max="31" value="${existing?.dueDay || ''}" placeholder="15" />
      </div>
      <div class="form-group">
        <label class="form-label">Auto Pay</label>
        <select class="form-input" id="exp-auto">
          <option value="no" ${!existing?.autoPay ? 'selected' : ''}>No</option>
          <option value="yes" ${existing?.autoPay ? 'selected' : ''}>Yes</option>
        </select>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-expense">Save</button>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-expense').addEventListener('click', () => {
        const name = modal.querySelector('#exp-name').value.trim();
        const amount = parseFloat(modal.querySelector('#exp-amount').value);
        const category = modal.querySelector('#exp-category').value;
        const dueDay = parseInt(modal.querySelector('#exp-due').value) || 0;
        const autoPay = modal.querySelector('#exp-auto').value === 'yes';
        if (!name || isNaN(amount)) {
          toast('Please fill in name and amount', 'error');
          return;
        }
        setState(s => {
          if (existing) {
            const idx = s.monthlyExpenses.findIndex(e => e.id === editId);
            if (idx >= 0) s.monthlyExpenses[idx] = { ...s.monthlyExpenses[idx], name, amount, category, dueDay, autoPay };
          } else {
            s.monthlyExpenses.push({ id: generateId(), name, amount, category, dueDay, autoPay });
          }
        });
        closeModal();
        renderMonthly();
        toast(existing ? 'Expense updated!' : 'Expense added!', 'success');
      });
      modal.querySelector('#exp-name').focus();
    }
  });
}

function deleteIncome(id) {
  setState(s => {
    s.income = s.income.filter(i => i.id !== id);
  });
  renderMonthly();
  toast('Income removed', 'info');
}

function deleteExpense(id) {
  setState(s => {
    s.monthlyExpenses = s.monthlyExpenses.filter(e => e.id !== id);
  });
  renderMonthly();
  toast('Expense removed', 'info');
}
