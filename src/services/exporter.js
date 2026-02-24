// ============================================
// PHANTOM FINANCE - IMPORT / EXPORT SERVICE
// ============================================

import * as XLSX from 'xlsx';
import { getState, importJSON, exportJSON } from './store.js';
import { toast } from '../components/toast.js';
import { formatCurrency } from '../utils/helpers.js';

// ---- JSON Export ----
export function downloadJSON() {
  const json = exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `phantom-finance-backup-${dateStamp()}.json`);
  toast('JSON exported successfully!', 'success');
}

// ---- JSON Import ----
export function handleJSONImport(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const success = importJSON(e.target.result);
      if (success) {
        toast('Data imported successfully!', 'success');
        resolve(true);
      } else {
        toast('Invalid JSON file', 'error');
        reject(new Error('Invalid JSON'));
      }
    };
    reader.onerror = () => {
      toast('Failed to read file', 'error');
      reject(new Error('Read error'));
    };
    reader.readAsText(file);
  });
}

// ---- Excel Export (Full Workbook) ----
export function downloadExcel() {
  const state = getState();
  const wb = XLSX.utils.book_new();

  // Sheet 1: Monthly Budget
  const monthlyData = [
    ['PHANTOM FINANCE - MONTHLY BUDGET'],
    [],
    ['INCOME'],
    ['Name', 'Amount', 'Frequency'],
    ...state.income.map(i => [i.name, Number(i.amount) || 0, i.frequency || 'monthly']),
    [],
    ['MONTHLY EXPENSES'],
    ['Name', 'Amount', 'Category', 'Due Day', 'Auto Pay'],
    ...state.monthlyExpenses.map(e => [e.name, Number(e.amount) || 0, e.category || '', e.dueDay || '', e.autoPay ? 'Yes' : 'No']),
    [],
    ['SUMMARY'],
    ['Total Income', state.income.reduce((s, i) => s + (Number(i.amount) || 0), 0)],
    ['Total Expenses', state.monthlyExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(monthlyData);
  ws1['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Monthly Budget');

  // Sheet 2: Debts
  const debtData = [
    ['PHANTOM FINANCE - DEBT TRACKER'],
    [],
    ['Name', 'Monthly Payment', 'Total Debt', 'Original Debt', 'Due Day', 'Interest Rate', 'Notes'],
    ...state.debts.map(d => [
      d.name,
      Number(d.monthlyPayment) || 0,
      Number(d.totalDebt) || 0,
      Number(d.originalDebt) || 0,
      d.dueDay || '',
      d.interestRate || '',
      d.notes || '',
    ]),
    [],
    ['TOTAL MONTHLY PAYMENTS', state.debts.reduce((s, d) => s + (Number(d.monthlyPayment) || 0), 0)],
    ['TOTAL DEBT REMAINING', state.debts.reduce((s, d) => s + (Number(d.totalDebt) || 0), 0)],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(debtData);
  ws2['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Debts');

  // Sheet 3: Property Expenses
  const propData = [
    ['PHANTOM FINANCE - PROPERTY EXPENSES'],
    [],
    ['Name', 'Cost', 'Completed'],
    ...state.propertyExpenses.map(p => [p.name, Number(p.cost) || 0, p.completed ? 'Yes' : 'No']),
    [],
    ['TOTAL', state.propertyExpenses.reduce((s, p) => s + (Number(p.cost) || 0), 0)],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(propData);
  ws3['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Property');

  // Sheet 4: Annual Budget
  const annualData = [
    ['PHANTOM FINANCE - ANNUAL BUDGET'],
    [],
    ['Name', 'Amount', 'Type'],
    ...state.annualBudget.map(a => [a.name, Number(a.amount) || 0, a.isIncome ? 'Income' : 'Expense']),
    [],
    ['TOTAL INCOME', state.annualBudget.filter(a => a.isIncome).reduce((s, a) => s + (Number(a.amount) || 0), 0)],
    ['TOTAL EXPENSES', state.annualBudget.filter(a => !a.isIncome).reduce((s, a) => s + Math.abs(Number(a.amount) || 0), 0)],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(annualData);
  ws4['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Annual Budget');

  // Sheet 5: Business Expenses
  const bizData = [
    ['PHANTOM FINANCE - BUSINESS EXPENSES'],
    [],
    ['Name', 'Monthly Cost', 'Annual Cost', 'Category'],
    ...state.businessExpenses.map(b => [b.name, Number(b.monthlyCost) || 0, Number(b.annualCost) || 0, b.category || '']),
    [],
    ['TOTAL MONTHLY', state.businessExpenses.reduce((s, b) => s + (Number(b.monthlyCost) || 0), 0)],
    ['TOTAL ANNUAL', state.businessExpenses.reduce((s, b) => s + (Number(b.annualCost) || 0), 0)],
  ];
  const ws5 = XLSX.utils.aoa_to_sheet(bizData);
  ws5['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws5, 'Business');

  XLSX.writeFile(wb, `phantom-finance-${dateStamp()}.xlsx`);
  toast('Excel exported successfully!', 'success');
}

// ---- Excel Import ----
export function handleExcelImport(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        // Try to parse known sheet structures
        const result = parseExcelWorkbook(wb);
        if (result) {
          importJSON(JSON.stringify(result));
          toast('Excel imported successfully!', 'success');
          resolve(true);
        } else {
          toast('Could not parse Excel structure', 'error');
          reject(new Error('Parse error'));
        }
      } catch (err) {
        toast('Failed to read Excel file', 'error');
        reject(err);
      }
    };
    reader.onerror = () => {
      toast('Failed to read file', 'error');
      reject(new Error('Read error'));
    };
    reader.readAsArrayBuffer(file);
  });
}

function parseExcelWorkbook(wb) {
  const state = {
    version: 1,
    profile: { name: '', currency: 'USD' },
    income: [],
    monthlyExpenses: [],
    debts: [],
    propertyExpenses: [],
    annualBudget: [],
    businessExpenses: [],
    settings: { theme: 'dark', language: 'en' },
  };

  let id = 1;
  const mkId = () => 'imp' + (id++);

  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const lower = name.toLowerCase();

    if (lower.includes('presupuestos mensual') || lower.includes('monthly')) {
      // Parse monthly budget sheet
      for (const row of data) {
        if (!row[0] || typeof row[0] !== 'string') continue;
        const label = row[0].toString().trim();
        const amount = Number(row[2]) || Number(row[1]) || 0;
        if (!label || !amount) continue;

        if (label.match(/ingreso/i)) {
          state.income.push({ id: mkId(), name: label, amount, frequency: 'monthly' });
        } else if (label.match(/total/i)) {
          continue;
        } else if (amount > 0) {
          const dueDay = Number(row[3]) || 0;
          state.monthlyExpenses.push({ id: mkId(), name: label, amount, category: 'general', dueDay, autoPay: false });
        }
      }
    } else if (lower.includes('deud') || lower.includes('debt')) {
      // Parse debts
      for (const row of data) {
        if (!row[0] || typeof row[0] !== 'string') continue;
        const label = row[0].toString().trim();
        if (label.match(/total|ingreso|estimado/i)) continue;
        const payment = Number(row[2]) || 0;
        const total = Number(row[3]) || 0;
        if (!label || (!payment && !total)) continue;

        state.debts.push({
          id: mkId(),
          name: label,
          monthlyPayment: payment,
          totalDebt: total,
          originalDebt: total,
          dueDay: Number(row[4]) || 0,
          interestRate: row[5] || '',
          notes: row[6] || '',
          category: 'general',
        });
      }
    } else if (lower.includes('casa') || lower.includes('property') || lower.includes('gastos casa')) {
      // Parse property expenses
      for (const row of data) {
        const label = (row[2] || row[0] || '').toString().trim();
        const cost = Number(row[3]) || Number(row[1]) || 0;
        if (!label || !cost || label.match(/total|gasto aprox/i)) continue;
        state.propertyExpenses.push({ id: mkId(), name: label, cost, completed: false });
      }
    } else if (lower.includes('presupuesto 2024') || lower.includes('annual') || lower.includes('2024')) {
      // Parse annual budget
      for (const row of data) {
        const label = (row[1] || row[0] || '').toString().trim();
        const amount = Number(row[2]) || Number(row[1]) || 0;
        if (!label || !amount || label.match(/total/i)) continue;
        state.annualBudget.push({
          id: mkId(),
          name: label,
          amount: Math.abs(amount),
          isIncome: amount > 0,
        });
      }
    }
  }

  return state;
}

// ---- Helpers ----
function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
