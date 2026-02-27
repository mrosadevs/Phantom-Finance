// ============================================
// PHANTOM FINANCE - BANK STATEMENT PARSER
// ============================================

import * as XLSX from 'xlsx';
import { generateId } from '../utils/helpers.js';

/**
 * Parse a bank statement file (CSV or XLSX/XLS) into normalized transactions.
 */
export async function parseBankStatement(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    return parseCSV(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(file);
  }
  throw new Error('Unsupported file type. Use .csv, .xlsx, or .xls');
}

// ---- CSV Parser ----
async function parseCSV(file) {
  const text = await readFileAsText(file);
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV file appears empty or has no data rows.');

  const delimiter = detectDelimiter(lines[0]);
  const headerRow = parseCSVLine(lines[0], delimiter).map(h => h.toLowerCase().trim());
  const mapping = detectColumns(headerRow);

  const transactions = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    const tx = extractTransaction(cols, mapping, headerRow);
    if (tx) transactions.push(tx);
  }

  if (transactions.length === 0) throw new Error('No valid transactions found in the CSV file.');
  return transactions;
}

// ---- Excel Parser ----
async function parseExcel(file) {
  const buffer = await readFileAsArrayBuffer(file);
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  // Use first sheet
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('Excel file has no sheets.');

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });

  if (rows.length < 2) throw new Error('Excel sheet appears empty or has no data rows.');

  // Find header row (first row with 3+ non-empty cells)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const nonEmpty = rows[i].filter(c => String(c).trim()).length;
    if (nonEmpty >= 3) { headerIdx = i; break; }
  }

  const headerRow = rows[headerIdx].map(h => String(h).toLowerCase().trim());
  const mapping = detectColumns(headerRow);

  const transactions = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const cols = rows[i].map(c => String(c).trim());
    const tx = extractTransaction(cols, mapping, headerRow);
    if (tx) transactions.push(tx);
  }

  if (transactions.length === 0) throw new Error('No valid transactions found in the Excel file.');
  return transactions;
}

// ---- Column Detection ----
function detectColumns(headers) {
  const mapping = { date: -1, description: -1, amount: -1, debit: -1, credit: -1 };

  const datePatterns = ['date', 'fecha', 'posted', 'transaction date', 'posting date', 'trans date', 'effective date'];
  const descPatterns = ['description', 'memo', 'payee', 'details', 'narrative', 'merchant', 'name', 'transaction description', 'reference'];
  const amountPatterns = ['amount', 'monto', 'value', 'total', 'transaction amount'];
  const debitPatterns = ['debit', 'withdrawal', 'charge', 'debits', 'withdrawals'];
  const creditPatterns = ['credit', 'deposit', 'credits', 'deposits'];

  headers.forEach((h, i) => {
    if (mapping.date === -1 && datePatterns.some(p => h.includes(p))) mapping.date = i;
    if (mapping.description === -1 && descPatterns.some(p => h.includes(p))) mapping.description = i;
    if (mapping.amount === -1 && amountPatterns.some(p => h === p || h.includes(p))) mapping.amount = i;
    if (mapping.debit === -1 && debitPatterns.some(p => h.includes(p))) mapping.debit = i;
    if (mapping.credit === -1 && creditPatterns.some(p => h.includes(p))) mapping.credit = i;
  });

  // Fallback: if no specific amount but have debit/credit columns, that's fine
  if (mapping.date === -1) {
    // Try first column as date if it looks like dates
    mapping.date = 0;
  }
  if (mapping.description === -1) {
    // Try second column or the longest text column
    mapping.description = mapping.date === 0 ? 1 : 0;
  }
  if (mapping.amount === -1 && mapping.debit === -1 && mapping.credit === -1) {
    // Try last column as amount
    mapping.amount = headers.length - 1;
  }

  return mapping;
}

// ---- Transaction Extraction ----
function extractTransaction(cols, mapping, headers) {
  if (!cols || cols.length < 2) return null;

  // Get description
  const description = (cols[mapping.description] || '').trim();
  if (!description || isHeaderOrTotal(description)) return null;

  // Get amount and type
  let amount = 0;
  let type = 'debit';

  if (mapping.debit !== -1 && mapping.credit !== -1) {
    // Separate debit/credit columns
    const debitVal = parseAmount(cols[mapping.debit]);
    const creditVal = parseAmount(cols[mapping.credit]);
    if (creditVal > 0) {
      amount = creditVal;
      type = 'credit';
    } else if (debitVal > 0) {
      amount = debitVal;
      type = 'debit';
    } else {
      return null; // No amount
    }
  } else if (mapping.amount !== -1) {
    // Single amount column
    const raw = parseAmount(cols[mapping.amount]);
    if (raw === 0 || isNaN(raw)) return null;
    amount = Math.abs(raw);
    type = raw > 0 ? 'credit' : 'debit';
  } else {
    return null;
  }

  // Get date
  const dateStr = cols[mapping.date] || '';
  const date = parseDate(dateStr);

  return {
    id: generateId(),
    date: date ? date.toISOString() : new Date().toISOString(),
    description,
    amount,
    type,
    originalRow: cols,
  };
}

// ---- Amount Parsing ----
function parseAmount(val) {
  if (val === null || val === undefined || val === '') return 0;
  let str = String(val).trim();
  // Handle parenthetical negatives: (100.00) → -100.00
  const isNeg = str.startsWith('(') && str.endsWith(')');
  str = str.replace(/[($,)]/g, '').trim();
  if (!str) return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : (isNeg ? -num : num);
}

// ---- Date Parsing ----
function parseDate(val) {
  if (!val) return null;
  const str = String(val).trim();

  // Try native Date parsing first
  const d = new Date(str);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1990) return d;

  // Try MM/DD/YYYY
  const slashParts = str.split(/[/\-\.]/);
  if (slashParts.length === 3) {
    const [a, b, c] = slashParts.map(Number);
    // If c > 31, it's likely year
    if (c > 31) {
      const attempt = new Date(c, a - 1, b);
      if (!isNaN(attempt.getTime())) return attempt;
    }
    // If a > 31, it's YYYY-MM-DD
    if (a > 31) {
      const attempt = new Date(a, b - 1, c);
      if (!isNaN(attempt.getTime())) return attempt;
    }
  }

  return null;
}

// ---- Helpers ----
function isHeaderOrTotal(desc) {
  const lower = desc.toLowerCase();
  return ['total', 'balance', 'opening', 'closing', 'beginning', 'ending', 'header', 'subtotal']
    .some(w => lower.startsWith(w) || lower === w);
}

function detectDelimiter(line) {
  const counts = { ',': 0, '\t': 0, ';': 0, '|': 0 };
  for (const ch of line) {
    if (ch in counts) counts[ch]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseCSVLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
