// ============================================
// PHANTOM FINANCE - BANK STATEMENT IMPORT PAGE
// ============================================

import { getState, setState } from '../services/store.js';
import { parseBankStatement } from '../services/bank-parser.js';
import { categorizeTransactions, getApiKey } from '../services/groq.js';
import { toast } from '../components/toast.js';
import { generateId, formatCurrency, formatDate, esc, showPage } from '../utils/helpers.js';

// ---- Module State ----
let importState = {
  step: 'upload',        // upload | parsing | categorizing | review | done
  file: null,
  transactions: [],      // parsed transactions
  categorizations: [],   // AI results (1:1 with transactions)
  selected: [],          // boolean array — selected for import
  progress: { done: 0, total: 0 },
  filter: 'all',
};

function resetState() {
  importState = {
    step: 'upload', file: null, transactions: [], categorizations: [],
    selected: [], progress: { done: 0, total: 0 }, filter: 'all',
  };
}

// ---- Category Definitions ----
const SECTION_CATEGORIES = {
  income: [{ value: 'income', label: 'Income' }],
  monthlyExpenses: [
    'Housing', 'Utilities', 'Food', 'Transportation', 'Insurance',
    'Health', 'Entertainment', 'Phone', 'Internet', 'Subscriptions',
    'Personal', 'Business', 'General',
  ].map(c => ({ value: c, label: c })),
  debts: [
    { value: 'general', label: 'General' },
    { value: 'credit-card', label: 'Credit Card' },
    { value: 'loan', label: 'Loan' },
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'auto', label: 'Auto' },
    { value: 'student', label: 'Student Loan' },
    { value: 'medical', label: 'Medical' },
    { value: 'business', label: 'Business' },
    { value: 'irs', label: 'IRS / Tax' },
  ],
  businessExpenses: [
    'Software', 'Subscriptions', 'Insurance', 'Accounting', 'Marketing',
    'Communication', 'Office', 'Cloud', 'Legal', 'Other',
  ].map(c => ({ value: c, label: c })),
  annualBudget: [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ],
  skip: [{ value: 'skip', label: 'Skip' }],
};

const SECTION_LABELS = {
  income: 'Income',
  monthlyExpenses: 'Monthly Expense',
  debts: 'Debt Payment',
  businessExpenses: 'Business Expense',
  annualBudget: 'Annual Budget',
  skip: 'Skip',
};

function categoryOptionsHTML(section, selectedCat) {
  const options = SECTION_CATEGORIES[section] || SECTION_CATEGORIES.monthlyExpenses;
  return options.map(o =>
    `<option value="${esc(o.value)}" ${o.value === selectedCat ? 'selected' : ''}>${esc(o.label)}</option>`
  ).join('');
}

// ---- Init & Render ----
export function initImport() {
  renderImport();
}

export function renderImport() {
  const page = document.getElementById('page-import');
  if (!page) return;

  switch (importState.step) {
    case 'upload': renderUpload(page); break;
    case 'parsing': renderProgress(page, 'Parsing bank statement...'); break;
    case 'categorizing': renderCategorizing(page); break;
    case 'review': renderReview(page); break;
    case 'done': renderUpload(page); break;
    default: renderUpload(page);
  }
}

// ---- Step 1: Upload ----
function renderUpload(page) {
  const hasKey = !!getApiKey();

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">IMPORT BANK STATEMENT</h1>
          <div class="section-subtitle">Upload, Categorize & Import Transactions with AI</div>
        </div>
        <button class="btn-ghost" id="import-back-btn">&#8592; Back</button>
      </div>

      <div class="card card-cyan" data-animate style="animation-delay:0.1s;">
        <div class="card-header">
          <div class="card-title">&#128196; Upload Statement</div>
        </div>

        <div class="import-dropzone" id="import-dropzone">
          <div class="import-dropzone-icon">&#128451;</div>
          <div class="import-dropzone-text">Drop your bank statement here</div>
          <div class="import-dropzone-sub">or click to browse</div>
          <div class="import-dropzone-formats">Supports .xlsx, .xls, .csv</div>
          <input type="file" id="bank-file-input" accept=".xlsx,.xls,.csv" style="display:none" />
        </div>

        <div class="import-status-row" style="margin-top:1rem;">
          ${hasKey ? `
            <div class="import-status success">
              <span class="import-status-icon">&#10003;</span>
              <div>
                <div class="import-status-title">AI Categorization Ready</div>
                <div class="import-status-text">Groq AI will auto-categorize your transactions.</div>
              </div>
            </div>
          ` : `
            <div class="import-status warning">
              <span class="import-status-icon">&#9888;</span>
              <div>
                <div class="import-status-title">No AI Key Set</div>
                <div class="import-status-text">Transactions will need manual categorization. Add your Groq API key in Settings for auto-categorization.</div>
              </div>
            </div>
          `}
        </div>
      </div>

      <div class="card" data-animate style="animation-delay:0.2s;margin-top:1.5rem;">
        <div class="card-header">
          <div class="card-title">&#128161; How It Works</div>
        </div>
        <div class="import-steps-grid">
          <div class="import-step">
            <div class="import-step-num">1</div>
            <div class="import-step-title">Upload</div>
            <div class="import-step-desc">Upload your bank statement (Excel or CSV)</div>
          </div>
          <div class="import-step">
            <div class="import-step-num">2</div>
            <div class="import-step-title">AI Categorize</div>
            <div class="import-step-desc">AI reads each transaction and categorizes it</div>
          </div>
          <div class="import-step">
            <div class="import-step-num">3</div>
            <div class="import-step-title">Review</div>
            <div class="import-step-desc">Check every transaction, fix any mistakes</div>
          </div>
          <div class="import-step">
            <div class="import-step-num">4</div>
            <div class="import-step-title">Import</div>
            <div class="import-step-desc">Confirm and transactions flow into your budget</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ---- Bind Events ----
  const dropzone = page.querySelector('#import-dropzone');
  const fileInput = page.querySelector('#bank-file-input');

  page.querySelector('#import-back-btn')?.addEventListener('click', () => {
    resetState();
    showPage('dashboard');
    window._phantomRefreshPage?.('dashboard');
  });

  dropzone?.addEventListener('click', () => fileInput?.click());

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });
  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) startProcessing(file);
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) startProcessing(file);
  });
}

// ---- Step 2: Parsing ----
function renderProgress(page, message) {
  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">IMPORT BANK STATEMENT</h1>
          <div class="section-subtitle">Processing your file...</div>
        </div>
      </div>
      <div class="card card-cyan" data-animate>
        <div class="import-progress">
          <div class="import-spinner"></div>
          <div class="import-progress-text">${esc(message)}</div>
        </div>
      </div>
    </div>
  `;
}

// ---- Step 3: Categorizing with Progress ----
function renderCategorizing(page) {
  const { done, total } = importState.progress;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  page.innerHTML = `
    <div class="section">
      <div class="section-header">
        <div>
          <h1 class="section-title">IMPORT BANK STATEMENT</h1>
          <div class="section-subtitle">AI is categorizing ${total} transactions...</div>
        </div>
      </div>
      <div class="card card-cyan" data-animate>
        <div class="import-progress">
          <div class="import-spinner"></div>
          <div class="import-progress-text">Categorizing transactions with AI...</div>
          <div class="progress-bar" style="height:10px;margin:1.25rem 0;width:100%;max-width:400px;">
            <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent4),var(--accent));transition:width 0.3s;height:100%;border-radius:5px;"></div>
          </div>
          <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--muted);">${done} / ${total} transactions</div>
        </div>
      </div>
    </div>
  `;
}

// ---- Step 4: Review Table ----
function renderReview(page) {
  const { transactions, categorizations, selected, filter } = importState;

  // Calculate stats
  let totalIncome = 0, totalExpenses = 0, needsReview = 0, skipCount = 0;
  let incomeCount = 0, expenseCount = 0;

  transactions.forEach((t, i) => {
    const cat = categorizations[i];
    if (cat.confidence === 'low') needsReview++;
    if (cat.targetSection === 'skip') { skipCount++; return; }
    if (cat.targetSection === 'income') { totalIncome += t.amount; incomeCount++; }
    else { totalExpenses += t.amount; expenseCount++; }
  });

  const selectedCount = selected.filter(Boolean).length;

  // Filter transactions
  const filtered = transactions.map((t, i) => ({ ...t, _idx: i })).filter((t) => {
    const cat = categorizations[t._idx];
    if (filter === 'all') return true;
    if (filter === 'needs-review') return cat.confidence === 'low';
    if (filter === 'income') return cat.targetSection === 'income';
    if (filter === 'expense') return cat.targetSection === 'monthlyExpenses' || cat.targetSection === 'debts' || cat.targetSection === 'businessExpenses';
    if (filter === 'skip') return cat.targetSection === 'skip';
    return true;
  });

  page.innerHTML = `
    <div class="section" style="max-width:none;padding:0 2rem;">
      <div class="section-header">
        <div>
          <h1 class="section-title">REVIEW TRANSACTIONS</h1>
          <div class="section-subtitle">${transactions.length} transactions from ${esc(importState.file?.name || 'bank statement')}</div>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;">
          <button class="btn-ghost" id="import-restart-btn">&#8634; Start Over</button>
          <button class="btn-primary" id="confirm-import-btn">&#10003; Confirm & Import (${selectedCount})</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="summary-bar" style="margin-bottom:1.25rem;">
        <div class="stat-card" data-animate>
          <div class="stat-icon lime">&#128176;</div>
          <div>
            <div class="stat-label">Income</div>
            <div class="stat-value lime">${formatCurrency(totalIncome)}</div>
            <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--muted);">${incomeCount} items</div>
          </div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.05s">
          <div class="stat-icon pink">&#128184;</div>
          <div>
            <div class="stat-label">Expenses</div>
            <div class="stat-value pink">${formatCurrency(totalExpenses)}</div>
            <div style="font-family:var(--font-mono);font-size:0.6rem;color:var(--muted);">${expenseCount} items</div>
          </div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.1s">
          <div class="stat-icon orange">&#9888;</div>
          <div>
            <div class="stat-label">Needs Review</div>
            <div class="stat-value orange">${needsReview}</div>
          </div>
        </div>
        <div class="stat-card" data-animate style="animation-delay:0.15s">
          <div class="stat-icon" style="background:rgba(112,0,255,0.1);color:var(--accent2);">&#128683;</div>
          <div>
            <div class="stat-label">Skipped</div>
            <div class="stat-value" style="color:var(--accent2);">${skipCount}</div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="import-tabs">
        <button class="import-tab ${filter === 'all' ? 'active' : ''}" data-filter="all">All (${transactions.length})</button>
        <button class="import-tab ${filter === 'needs-review' ? 'active' : ''}" data-filter="needs-review">Needs Review (${needsReview})</button>
        <button class="import-tab ${filter === 'income' ? 'active' : ''}" data-filter="income">Income (${incomeCount})</button>
        <button class="import-tab ${filter === 'expense' ? 'active' : ''}" data-filter="expense">Expenses (${expenseCount})</button>
        <button class="import-tab ${filter === 'skip' ? 'active' : ''}" data-filter="skip">Skipped (${skipCount})</button>
      </div>

      <!-- Review Table -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div class="import-table-wrap">
          <table class="import-table">
            <thead>
              <tr>
                <th style="width:36px;"><input type="checkbox" id="select-all" ${selected.every(Boolean) ? 'checked' : ''} /></th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Target Section</th>
                <th>Category</th>
                <th style="width:70px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(t => {
                const i = t._idx;
                const cat = categorizations[i];
                const isLow = cat.confidence === 'low';
                const isMed = cat.confidence === 'medium';
                return `
                  <tr class="${isLow ? 'import-row-review' : ''}" data-index="${i}">
                    <td><input type="checkbox" class="row-select" data-index="${i}" ${selected[i] ? 'checked' : ''} /></td>
                    <td class="import-cell-date">${formatDate(t.date)}</td>
                    <td>
                      <div class="import-cell-name">${esc(cat.suggestedName || t.description)}</div>
                      ${cat.suggestedName && cat.suggestedName !== t.description ? `<div class="import-cell-raw">${esc(t.description)}</div>` : ''}
                    </td>
                    <td class="import-cell-amount ${t.type === 'credit' ? 'positive' : 'negative'}">
                      ${t.type === 'credit' ? '+' : '-'}${formatCurrency(t.amount)}
                    </td>
                    <td>
                      <select class="form-input import-select import-section-select" data-index="${i}">
                        ${Object.entries(SECTION_LABELS).map(([val, lab]) =>
                          `<option value="${val}" ${cat.targetSection === val ? 'selected' : ''}>${lab}</option>`
                        ).join('')}
                      </select>
                    </td>
                    <td>
                      <select class="form-input import-select import-category-select" data-index="${i}">
                        ${categoryOptionsHTML(cat.targetSection, cat.category)}
                      </select>
                    </td>
                    <td style="text-align:center;">
                      ${isLow
                        ? `<span class="tag orange" title="${esc(cat.reasoning)}">Review</span>`
                        : isMed
                        ? `<span class="tag cyan" title="${esc(cat.reasoning)}">OK</span>`
                        : `<span class="tag success" title="${esc(cat.reasoning)}">Auto</span>`
                      }
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // ---- Bind Review Events ----
  bindReviewEvents(page);
}

function bindReviewEvents(page) {
  // Select all
  page.querySelector('#select-all')?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    importState.selected = importState.selected.map(() => checked);
    page.querySelectorAll('.row-select').forEach(cb => { cb.checked = checked; });
    updateConfirmCount(page);
  });

  // Individual checkboxes (event delegation)
  page.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-select')) {
      const idx = parseInt(e.target.dataset.index);
      importState.selected[idx] = e.target.checked;
      updateConfirmCount(page);
    }
  });

  // Section dropdown change — update category dropdown
  page.addEventListener('change', (e) => {
    if (e.target.classList.contains('import-section-select')) {
      const idx = parseInt(e.target.dataset.index);
      const newSection = e.target.value;
      importState.categorizations[idx].targetSection = newSection;

      // Update adjacent category dropdown
      const catSelect = page.querySelector(`.import-category-select[data-index="${idx}"]`);
      if (catSelect) {
        const defaultCat = (SECTION_CATEGORIES[newSection] || [])[0]?.value || 'Other';
        importState.categorizations[idx].category = defaultCat;
        catSelect.innerHTML = categoryOptionsHTML(newSection, defaultCat);
      }
    }
  });

  // Category dropdown change
  page.addEventListener('change', (e) => {
    if (e.target.classList.contains('import-category-select')) {
      const idx = parseInt(e.target.dataset.index);
      importState.categorizations[idx].category = e.target.value;
    }
  });

  // Filter tabs
  page.querySelectorAll('.import-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      importState.filter = tab.dataset.filter;
      renderReview(page);
    });
  });

  // Start over
  page.querySelector('#import-restart-btn')?.addEventListener('click', () => {
    resetState();
    renderImport();
  });

  // Confirm & Import
  page.querySelector('#confirm-import-btn')?.addEventListener('click', () => {
    confirmImport();
  });
}

function updateConfirmCount(page) {
  const count = importState.selected.filter(Boolean).length;
  const btn = page.querySelector('#confirm-import-btn');
  if (btn) btn.textContent = `\u2713 Confirm & Import (${count})`;
}

// ---- Process File ----
async function startProcessing(file) {
  importState.file = file;
  importState.step = 'parsing';
  renderImport();

  try {
    importState.transactions = await parseBankStatement(file);
    toast(`Found ${importState.transactions.length} transactions`, 'success');

    // Select all by default
    importState.selected = importState.transactions.map(() => true);

    // Categorize
    importState.step = 'categorizing';
    importState.progress = { done: 0, total: importState.transactions.length };
    renderImport();

    importState.categorizations = await categorizeTransactions(
      importState.transactions,
      (done, total) => {
        importState.progress = { done, total };
        // Update progress bar without full re-render
        const fillEl = document.querySelector('.progress-fill');
        const textEl = document.querySelector('.import-progress-text + .progress-bar + div');
        if (fillEl) fillEl.style.width = `${Math.round((done / total) * 100)}%`;
        if (textEl) textEl.textContent = `${done} / ${total} transactions`;
      }
    );

    importState.step = 'review';
    renderImport();

    const lowCount = importState.categorizations.filter(c => c.confidence === 'low').length;
    if (lowCount > 0) {
      toast(`${lowCount} transactions need your review`, 'warning');
    } else {
      toast('All transactions categorized! Review and confirm.', 'success');
    }

  } catch (err) {
    toast(err.message || 'Failed to process file', 'error');
    resetState();
    renderImport();
  }
}

// ---- Confirm & Import into State ----
function confirmImport() {
  const { transactions, categorizations, selected } = importState;

  let counts = { income: 0, monthlyExpenses: 0, debts: 0, businessExpenses: 0, annualBudget: 0, skip: 0 };

  setState(s => {
    transactions.forEach((t, i) => {
      if (!selected[i]) return;
      const cat = categorizations[i];
      if (cat.targetSection === 'skip') { counts.skip++; return; }

      const name = cat.suggestedName || t.description;
      const amount = t.amount;

      switch (cat.targetSection) {
        case 'income':
          s.income.push({
            id: generateId(),
            name,
            amount,
            frequency: 'monthly',
          });
          counts.income++;
          break;

        case 'monthlyExpenses':
          s.monthlyExpenses.push({
            id: generateId(),
            name,
            amount,
            category: cat.category || 'Other',
            dueDay: t.date ? new Date(t.date).getDate() : 0,
            autoPay: false,
          });
          counts.monthlyExpenses++;
          break;

        case 'debts':
          s.debts.push({
            id: generateId(),
            name,
            monthlyPayment: amount,
            totalDebt: 0,
            originalDebt: 0,
            dueDay: t.date ? new Date(t.date).getDate() : 0,
            interestRate: '',
            notes: `Imported from bank statement ${new Date().toLocaleDateString()}`,
            category: cat.category || 'general',
          });
          counts.debts++;
          break;

        case 'businessExpenses':
          s.businessExpenses.push({
            id: generateId(),
            name,
            monthlyCost: amount,
            annualCost: Math.round(amount * 12 * 100) / 100,
            category: cat.category || 'Other',
          });
          counts.businessExpenses++;
          break;

        case 'annualBudget':
          s.annualBudget.push({
            id: generateId(),
            name,
            amount,
            isIncome: t.type === 'credit',
          });
          counts.annualBudget++;
          break;
      }
    });
  });

  // Build summary message
  const parts = [];
  if (counts.income) parts.push(`${counts.income} income`);
  if (counts.monthlyExpenses) parts.push(`${counts.monthlyExpenses} expenses`);
  if (counts.debts) parts.push(`${counts.debts} debts`);
  if (counts.businessExpenses) parts.push(`${counts.businessExpenses} business`);
  if (counts.annualBudget) parts.push(`${counts.annualBudget} annual`);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) - counts.skip;
  toast(`Imported ${total} items: ${parts.join(', ')}. ${counts.skip} skipped.`, 'success');

  // Reset and go to dashboard
  resetState();
  showPage('dashboard');
  window._phantomRefreshAll?.();
}
