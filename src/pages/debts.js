// ============================================
// PHANTOM FINANCE - DEBT TRACKER PAGE
// ============================================

import { getState, setState, getTotalDebtPayments, getTotalDebt } from '../services/store.js';
import { formatCurrency, generateId, esc } from '../utils/helpers.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function initDebts() {
  renderDebts();
}

export function renderDebts() {
  const page = document.getElementById('page-debts');
  if (!page) return;

  const state = getState();
  const totalPayments = getTotalDebtPayments();
  const totalDebt = getTotalDebt();
  const totalOriginal = state.debts.reduce((s, d) => s + (Number(d.originalDebt) || Number(d.totalDebt) || 0), 0);
  const paidOff = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal * 100) : 0;
  const monthsToPayoff = totalPayments > 0 ? Math.ceil(totalDebt / totalPayments) : 0;
  const zeroInterestDebts = state.debts.filter(d => !d.interestRate || d.interestRate === '0' || d.interestRate === 'cero % de interest ').length;

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">DEBT TRACKER</h1>
          <div class="section-subtitle">Monitor & Eliminate Your Debts</div>
        </div>
        <button class="btn-primary" id="add-debt-btn">+ Add Debt</button>
      </div>

      <!-- Summary -->
      <div class="summary-bar">
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon danger">&#128179;</div>
          <div class="stat-label">Total Debt</div>
          <div class="stat-value danger">${formatCurrency(totalDebt)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon pink">&#128184;</div>
          <div class="stat-label">Monthly Payments</div>
          <div class="stat-value pink">${formatCurrency(totalPayments)}</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon success">&#128200;</div>
          <div class="stat-label">Paid Off</div>
          <div class="stat-value success">${paidOff.toFixed(1)}%</div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.2s">
          <div class="stat-icon cyan">&#128197;</div>
          <div class="stat-label">Est. Months Left</div>
          <div class="stat-value cyan">${monthsToPayoff}</div>
        </div>
      </div>

      <!-- Overall Progress -->
      <div class="card card-violet" data-animate style="animation-delay:0.1s;margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">Overall Debt Progress</div>
          <div style="display:flex;gap:0.5rem;">
            <span class="tag violet">${state.debts.length} Debts</span>
            <span class="tag success">${zeroInterestDebts} @ 0%</span>
          </div>
        </div>
        <div class="progress-bar" style="height:16px;margin-bottom:0.5rem;">
          <div class="progress-fill success" style="width:${Math.min(paidOff, 100)}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--success);">${formatCurrency(totalOriginal - totalDebt)} Paid</span>
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--danger);">${formatCurrency(totalDebt)} Remaining</span>
        </div>
      </div>

      <!-- Debt List -->
      <div class="data-list" style="gap:1rem;">
        ${state.debts.length > 0 ? state.debts.map((d, i) => {
          const orig = Number(d.originalDebt) || Number(d.totalDebt) || 1;
          const remaining = Number(d.totalDebt) || 0;
          const pct = ((orig - remaining) / orig * 100);
          const monthsLeft = Number(d.monthlyPayment) > 0 ? Math.ceil(remaining / Number(d.monthlyPayment)) : 0;
          const colorClass = pct > 70 ? 'success' : pct > 30 ? 'cyan' : 'pink';
          return `
            <div class="debt-row" data-animate style="animation-delay:${0.15 + i * 0.04}s">
              <div class="debt-header">
                <div class="debt-name">${esc(d.name)}</div>
                <div class="debt-payment">${formatCurrency(d.monthlyPayment)}<span style="font-size:0.65rem;color:var(--muted)">/mo</span></div>
              </div>
              <div class="debt-details">
                <div class="debt-detail">
                  <span class="debt-detail-label">Remaining</span>
                  <span class="debt-detail-value" style="color:var(--danger);">${formatCurrency(remaining)}</span>
                </div>
                <div class="debt-detail">
                  <span class="debt-detail-label">Original</span>
                  <span class="debt-detail-value">${formatCurrency(orig)}</span>
                </div>
                ${d.dueDay ? `
                  <div class="debt-detail">
                    <span class="debt-detail-label">Due Day</span>
                    <span class="debt-detail-value">${d.dueDay}${ordinal(d.dueDay)}</span>
                  </div>
                ` : ''}
                ${d.interestRate ? `
                  <div class="debt-detail">
                    <span class="debt-detail-label">Interest</span>
                    <span class="debt-detail-value">${esc(String(d.interestRate))}</span>
                  </div>
                ` : ''}
                ${monthsLeft > 0 ? `
                  <div class="debt-detail">
                    <span class="debt-detail-label">Est. Payoff</span>
                    <span class="debt-detail-value">${monthsLeft} mo (${(monthsLeft / 12).toFixed(1)} yr)</span>
                  </div>
                ` : ''}
              </div>
              <div class="debt-progress-row">
                <div class="progress-bar">
                  <div class="progress-fill ${colorClass}" style="width:${Math.min(pct, 100)}%"></div>
                </div>
                <span class="debt-percent">${pct.toFixed(1)}%</span>
              </div>
              ${d.notes ? `<div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--muted);margin-top:0.5rem;">${esc(d.notes)}</div>` : ''}
              <div class="debt-actions">
                <button class="btn-ghost btn-sm make-payment" data-id="${d.id}">Make Payment</button>
                <button class="btn-ghost btn-sm edit-debt" data-id="${d.id}">Edit</button>
                <button class="btn-ghost btn-sm delete-debt" data-id="${d.id}" style="color:var(--danger);">Delete</button>
              </div>
            </div>
          `;
        }).join('') : `
          <div class="empty-state">
            <div class="empty-icon">&#127881;</div>
            <div class="empty-text">No debts! That's amazing!</div>
          </div>
        `}
      </div>
    </div>
  `;

  // Bind events
  page.querySelector('#add-debt-btn')?.addEventListener('click', () => showDebtModal());
  page.querySelectorAll('.edit-debt').forEach(btn => {
    btn.addEventListener('click', () => showDebtModal(btn.dataset.id));
  });
  page.querySelectorAll('.delete-debt').forEach(btn => {
    btn.addEventListener('click', () => {
      setState(s => { s.debts = s.debts.filter(d => d.id !== btn.dataset.id); });
      renderDebts();
      toast('Debt removed', 'info');
    });
  });
  page.querySelectorAll('.make-payment').forEach(btn => {
    btn.addEventListener('click', () => showPaymentModal(btn.dataset.id));
  });
}

function showDebtModal(editId) {
  const state = getState();
  const existing = editId ? state.debts.find(d => d.id === editId) : null;

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">${existing ? 'Edit' : 'Add'} Debt</h2>
    <div class="form-group">
      <label class="form-label">Name / Creditor</label>
      <input class="form-input" id="debt-name" value="${existing ? esc(existing.name) : ''}" placeholder="e.g. Chase Credit Card" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Monthly Payment ($)</label>
        <input class="form-input" id="debt-payment" type="number" step="0.01" value="${existing ? existing.monthlyPayment : ''}" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Total Remaining ($)</label>
        <input class="form-input" id="debt-total" type="number" step="0.01" value="${existing ? existing.totalDebt : ''}" placeholder="0.00" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Original Debt ($)</label>
        <input class="form-input" id="debt-original" type="number" step="0.01" value="${existing ? existing.originalDebt || existing.totalDebt : ''}" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Due Day (1-31)</label>
        <input class="form-input" id="debt-due" type="number" min="1" max="31" value="${existing?.dueDay || ''}" placeholder="15" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Interest Rate</label>
        <input class="form-input" id="debt-interest" value="${existing?.interestRate || ''}" placeholder="e.g. 0%, 18.9%" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-input" id="debt-cat">
          <option value="general" ${existing?.category === 'general' ? 'selected' : ''}>General</option>
          <option value="credit-card" ${existing?.category === 'credit-card' ? 'selected' : ''}>Credit Card</option>
          <option value="loan" ${existing?.category === 'loan' ? 'selected' : ''}>Loan</option>
          <option value="mortgage" ${existing?.category === 'mortgage' ? 'selected' : ''}>Mortgage</option>
          <option value="auto" ${existing?.category === 'auto' ? 'selected' : ''}>Auto</option>
          <option value="student" ${existing?.category === 'student' ? 'selected' : ''}>Student Loan</option>
          <option value="medical" ${existing?.category === 'medical' ? 'selected' : ''}>Medical</option>
          <option value="business" ${existing?.category === 'business' ? 'selected' : ''}>Business</option>
          <option value="irs" ${existing?.category === 'irs' ? 'selected' : ''}>IRS / Tax</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <input class="form-input" id="debt-notes" value="${existing?.notes ? esc(existing.notes) : ''}" placeholder="Optional notes..." />
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-debt">Save</button>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-debt').addEventListener('click', () => {
        const name = modal.querySelector('#debt-name').value.trim();
        const monthlyPayment = parseFloat(modal.querySelector('#debt-payment').value) || 0;
        const totalDebt = parseFloat(modal.querySelector('#debt-total').value) || 0;
        const originalDebt = parseFloat(modal.querySelector('#debt-original').value) || totalDebt;
        const dueDay = parseInt(modal.querySelector('#debt-due').value) || 0;
        const interestRate = modal.querySelector('#debt-interest').value.trim();
        const category = modal.querySelector('#debt-cat').value;
        const notes = modal.querySelector('#debt-notes').value.trim();

        if (!name) {
          toast('Please enter a name', 'error');
          return;
        }

        setState(s => {
          if (existing) {
            const idx = s.debts.findIndex(d => d.id === editId);
            if (idx >= 0) s.debts[idx] = { ...s.debts[idx], name, monthlyPayment, totalDebt, originalDebt, dueDay, interestRate, category, notes };
          } else {
            s.debts.push({ id: generateId(), name, monthlyPayment, totalDebt, originalDebt, dueDay, interestRate, category, notes });
          }
        });
        closeModal();
        renderDebts();
        toast(existing ? 'Debt updated!' : 'Debt added!', 'success');
      });
      modal.querySelector('#debt-name').focus();
    }
  });
}

function showPaymentModal(debtId) {
  const state = getState();
  const debt = state.debts.find(d => d.id === debtId);
  if (!debt) return;

  openModal(`
    <button class="modal-close">&times;</button>
    <h2 class="modal-title">Record Payment for ${esc(debt.name)}</h2>
    <div style="margin-bottom:1rem;">
      <span class="stat-label">Current Balance</span>
      <div class="stat-value danger" style="font-size:1.3rem;">${formatCurrency(debt.totalDebt)}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Payment Amount ($)</label>
      <input class="form-input" id="pay-amount" type="number" step="0.01" value="${debt.monthlyPayment}" placeholder="0.00" />
    </div>
    <div class="modal-actions">
      <button class="btn-ghost modal-cancel">Cancel</button>
      <button class="btn-primary" id="save-payment">Record Payment</button>
    </div>
  `, {
    onOpen: (modal) => {
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
      modal.querySelector('#save-payment').addEventListener('click', () => {
        const amount = parseFloat(modal.querySelector('#pay-amount').value) || 0;
        if (amount <= 0) {
          toast('Enter a valid amount', 'error');
          return;
        }
        setState(s => {
          const d = s.debts.find(d => d.id === debtId);
          if (d) {
            d.totalDebt = Math.max(0, (Number(d.totalDebt) || 0) - amount);
          }
        });
        closeModal();
        renderDebts();
        toast(`Payment of ${formatCurrency(amount)} recorded!`, 'success');
      });
      modal.querySelector('#pay-amount').focus();
    }
  });
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
