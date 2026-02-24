// ============================================
// PHANTOM FINANCE - PROPERTY EXPENSES PAGE
// ============================================

import { getState, setState, getTotalPropertyExpenses } from '../services/store.js';
import { formatCurrency, generateId, esc } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function initProperty() {
  renderProperty();
}

export function renderProperty() {
  const page = document.getElementById('page-property');
  if (!page) return;

  const state = getState();
  const total = getTotalPropertyExpenses();
  const completed = state.propertyExpenses.filter(p => p.completed);
  const pending = state.propertyExpenses.filter(p => !p.completed);
  const completedCost = completed.reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const pendingCost = pending.reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const progressPct = total > 0 ? (completedCost / total * 100) : 0;

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">PROPERTY EXPENSES</h1>
          <div class="section-subtitle">Home Renovation & Repair Tracker</div>
        </div>
        <button class="btn-primary" id="add-property-btn">+ Add Item</button>
      </div>

      <!-- Summary -->
      <div class="summary-bar">
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon cyan">&#127968;</div>
          <div class="stat-label">Total Investment</div>
          <div class="stat-value cyan">${formatCurrency(total)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon success">&#10003;</div>
          <div class="stat-label">Completed</div>
          <div class="stat-value success">${formatCurrency(completedCost)}</div>
          <div class="stat-change positive">${completed.length} items</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon orange">&#9200;</div>
          <div class="stat-label">Pending</div>
          <div class="stat-value orange">${formatCurrency(pendingCost)}</div>
          <div class="stat-change">${pending.length} items</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.2s">
          <div class="stat-icon violet">&#128200;</div>
          <div class="stat-label">Progress</div>
          <div class="stat-value violet">${progressPct.toFixed(1)}%</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="card card-cyan" data-animate style="animation-delay:0.1s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">Renovation Progress</div>
          <span class="tag cyan">${completed.length}/${state.propertyExpenses.length} Complete</span>
        </div>
        <div class="progress-bar" style="height:14px;margin-bottom:0.4rem;">
          <div class="progress-fill cyan" style="width:${progressPct}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--success);">${formatCurrency(completedCost)} Done</span>
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--muted);">${formatCurrency(pendingCost)} Remaining</span>
        </div>
      </div>

      <!-- Pending Items -->
      ${pending.length > 0 ? `
        <div style="margin-bottom:1.5rem;">
          <div class="card-label" style="margin-bottom:0.75rem;">&#9200; Pending (${pending.length})</div>
          <div class="data-list">
            ${pending.map((p, i) => `
              <div class="property-item" data-animate style="animation-delay:${0.15 + i * 0.03}s">
                <div class="item-check" data-id="${p.id}" title="Mark Complete">&#10003;</div>
                <div class="item-info">
                  <div class="item-name">${esc(p.name)}</div>
                </div>
                <div class="item-cost">${formatCurrency(p.cost)}</div>
                <div class="item-actions">
                  <button class="row-action-btn edit-prop" data-id="${p.id}">&#9998;</button>
                  <button class="row-action-btn delete delete-prop" data-id="${p.id}">&#10005;</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Completed Items -->
      ${completed.length > 0 ? `
        <div>
          <div class="card-label" style="margin-bottom:0.75rem;">&#10003; Completed (${completed.length})</div>
          <div class="data-list">
            ${completed.map((p, i) => `
              <div class="property-item" data-animate style="animation-delay:${0.15 + i * 0.03}s;opacity:0.7;">
                <div class="item-check checked" data-id="${p.id}" title="Mark Pending">&#10003;</div>
                <div class="item-info">
                  <div class="item-name" style="text-decoration:line-through;">${esc(p.name)}</div>
                </div>
                <div class="item-cost" style="color:var(--success);">${formatCurrency(p.cost)}</div>
                <div class="item-actions">
                  <button class="row-action-btn delete delete-prop" data-id="${p.id}">&#10005;</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${state.propertyExpenses.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">&#127968;</div>
          <div class="empty-text">No property expenses tracked</div>
        </div>
      ` : ''}
    </div>
  `;

  // Bind events
  page.querySelector('#add-property-btn')?.addEventListener('click', () => showPropertyModal());

  page.querySelectorAll('.item-check').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      setState(s => {
        const item = s.propertyExpenses.find(p => p.id === id);
        if (item) item.completed = !item.completed;
      });
      renderProperty();
      toast('Status updated!', 'success');
    });
  });

  page.querySelectorAll('.edit-prop').forEach(btn => {
    btn.addEventListener('click', () => showPropertyModal(btn.dataset.id));
  });
  page.querySelectorAll('.delete-prop').forEach(btn => {
    btn.addEventListener('click', () => {
      setState(s => { s.propertyExpenses = s.propertyExpenses.filter(p => p.id !== btn.dataset.id); });
      renderProperty();
      toast('Item removed', 'info');
    });
  });
}

function showPropertyModal(editId) {
  const state = getState();
  const existing = editId ? state.propertyExpenses.find(p => p.id === editId) : null;

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">${existing ? 'Edit' : 'Add'} Property Expense</h2>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input class="form-input" id="prop-name" value="${existing ? esc(existing.name) : ''}" placeholder="e.g. Kitchen Renovation" />
    </div>
    <div class="form-group">
      <label class="form-label">Cost ($)</label>
      <input class="form-input" id="prop-cost" type="number" step="0.01" value="${existing ? existing.cost : ''}" placeholder="0.00" />
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-prop">Save</button>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-prop').addEventListener('click', () => {
        const name = modal.querySelector('#prop-name').value.trim();
        const cost = parseFloat(modal.querySelector('#prop-cost').value) || 0;
        if (!name) { toast('Enter a description', 'error'); return; }
        setState(s => {
          if (existing) {
            const idx = s.propertyExpenses.findIndex(p => p.id === editId);
            if (idx >= 0) s.propertyExpenses[idx] = { ...s.propertyExpenses[idx], name, cost };
          } else {
            s.propertyExpenses.push({ id: generateId(), name, cost, completed: false });
          }
        });
        closeModal();
        renderProperty();
        toast(existing ? 'Item updated!' : 'Item added!', 'success');
      });
      modal.querySelector('#prop-name').focus();
    }
  });
}
