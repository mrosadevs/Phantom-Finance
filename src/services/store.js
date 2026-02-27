// ============================================
// PHANTOM FINANCE - STATE MANAGEMENT & PERSISTENCE
// ============================================

const STORAGE_KEY = 'phantom-finance-data';

const defaultState = {
  version: 1,
  profile: {
    name: '',
    currency: 'USD',
  },
  income: [
    // { id, name, amount, frequency: 'monthly'|'biweekly'|'weekly' }
  ],
  monthlyExpenses: [
    // { id, name, amount, category, dueDay, autoPay }
  ],
  debts: [
    // { id, name, monthlyPayment, totalDebt, originalDebt, dueDay, interestRate, notes, category }
  ],
  propertyExpenses: [
    // { id, name, cost, completed }
  ],
  annualBudget: [
    // { id, name, amount, isIncome }
  ],
  businessExpenses: [
    // { id, name, monthlyCost, annualCost, category }
  ],
  settings: {
    theme: 'dark',
    language: 'en',
    notificationsEnabled: false,
    reminderDaysBefore: 3,
    groqModel: 'llama-3.3-70b-versatile',
  },
};

let state = null;
let _demoMode = false; // When true, changes are NOT saved to localStorage
const listeners = new Set();

export function getState() {
  if (!state) loadState();
  return state;
}

export function setState(updater) {
  const prev = { ...state };
  if (typeof updater === 'function') {
    updater(state);
  } else {
    Object.assign(state, updater);
  }
  // Only save to localStorage if NOT in demo mode
  if (!_demoMode) {
    saveState();
  }
  listeners.forEach(fn => fn(state, prev));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw);
      // Merge with defaults for new fields
      state = deepMerge(structuredClone(defaultState), state);
    } else {
      state = structuredClone(defaultState);
    }
  } catch {
    state = structuredClone(defaultState);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ---- Demo Mode ----
// When demo mode is on, state changes stay in memory but aren't persisted
export function enterDemoMode() {
  _demoMode = true;
}

export function exitDemoMode(keepData = false) {
  _demoMode = false;
  if (keepData) {
    // Save the current (demo) data to localStorage
    saveState();
  } else {
    // Reload from localStorage (the original user data)
    loadState();
  }
  listeners.forEach(fn => fn(state, {}));
}

export function isDemoMode() {
  return _demoMode;
}

// Import state from JSON (for demo mode)
export function importJSONDemo(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data && typeof data === 'object') {
      state = deepMerge(structuredClone(defaultState), data);
      // Don't save — we're in demo mode
      listeners.forEach(fn => fn(state, {}));
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// Export full state as JSON
export function exportJSON() {
  return JSON.stringify(getState(), null, 2);
}

// Import state from JSON (permanent)
export function importJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data && typeof data === 'object') {
      _demoMode = false; // exit demo mode on real import
      state = deepMerge(structuredClone(defaultState), data);
      saveState();
      listeners.forEach(fn => fn(state, {}));
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// Generate a template JSON with mom's data pre-filled
export function exportTemplate() {
  return JSON.stringify(getState(), null, 2);
}

// Clear all data
export function clearAll() {
  _demoMode = false;
  state = structuredClone(defaultState);
  saveState();
  listeners.forEach(fn => fn(state, {}));
}

// Get total monthly income
export function getTotalIncome() {
  const s = getState();
  return s.income.reduce((sum, i) => {
    const amt = Number(i.amount) || 0;
    if (i.frequency === 'biweekly') return sum + amt * 26 / 12;
    if (i.frequency === 'weekly') return sum + amt * 52 / 12;
    return sum + amt;
  }, 0);
}

// Get total monthly expenses
export function getTotalExpenses() {
  const s = getState();
  return s.monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

// Get total monthly debt payments
export function getTotalDebtPayments() {
  const s = getState();
  return s.debts.reduce((sum, d) => sum + (Number(d.monthlyPayment) || 0), 0);
}

// Get total remaining debt
export function getTotalDebt() {
  const s = getState();
  return s.debts.reduce((sum, d) => sum + (Number(d.totalDebt) || 0), 0);
}

// Get total property expenses
export function getTotalPropertyExpenses() {
  const s = getState();
  return s.propertyExpenses.reduce((sum, p) => sum + (Number(p.cost) || 0), 0);
}

// Get total business expenses (monthly)
export function getTotalBusinessExpenses() {
  const s = getState();
  return s.businessExpenses.reduce((sum, b) => sum + (Number(b.monthlyCost) || 0), 0);
}

// Net monthly (income - expenses - debts - business)
export function getNetMonthly() {
  return getTotalIncome() - getTotalExpenses() - getTotalDebtPayments() - getTotalBusinessExpenses();
}
