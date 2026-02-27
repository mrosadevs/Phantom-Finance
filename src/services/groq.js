// ============================================
// PHANTOM FINANCE - GROQ AI CATEGORIZATION
// ============================================

import { getState } from './store.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const _k = [71,115,107,95,105,83,72,97,71,121,112,111,74,80,76,108,52,70,88,70,76,114,52,118,87,71,100,121,98,51,70,89,82,89,97,113,105,66,67,117,75,75,106,69,118,121,111,53,54,108,74,71,104,119,88,77];
const BATCH_SIZE = 25;
const BATCH_DELAY = 250;

export function getApiKey() {
  return localStorage.getItem('phantom-finance-groq-key') || _k.map(c => String.fromCharCode(c)).join('');
}

const SYSTEM_PROMPT = `You are a financial transaction categorizer for a personal budget app. You will receive a JSON array of bank transactions. For each transaction, determine:

1. targetSection: Where this belongs in the budget app:
   - "income" for paychecks, direct deposits, freelance payments, refunds over $50, interest earned, government payments, tax refunds
   - "monthlyExpenses" for recurring bills, subscriptions, groceries, gas, dining, utilities, rent, shopping, services
   - "debts" for loan payments, credit card payments, IRS payments, collection payments
   - "businessExpenses" for business-related costs (software tools, marketing, professional services, business supplies)
   - "skip" for transfers between own accounts, ATM withdrawals, credit card payments TO a credit card (just moving money), duplicate entries

2. category: The specific sub-category. Be as specific as possible:
   For monthlyExpenses use one of: Housing, Utilities, Food, Transportation, Insurance, Health, Entertainment, Phone, Internet, Subscriptions, Personal, Business, General
   - Housing: rent, mortgage payments, HOA fees, property tax
   - Utilities: electric, water, gas, sewage, trash
   - Food: groceries, restaurants, fast food, coffee shops, food delivery
   - Transportation: gas stations, car maintenance, parking, tolls, rideshare, public transit
   - Insurance: car insurance, health insurance, renter's/homeowner's insurance, life insurance
   - Health: pharmacy, doctor visits, hospital, dental, vision, medical bills
   - Entertainment: movies, concerts, streaming services, gaming, hobbies
   - Phone: cell phone bills, mobile plans
   - Internet: ISP bills, cable/fiber
   - Subscriptions: Netflix, Spotify, Hulu, gym memberships, subscription boxes
   - Personal: clothing, haircuts, beauty, gifts, personal care
   - Business: business-related purchases from personal account
   - General: anything that doesn't fit above
   For debts use one of: general, credit-card, loan, mortgage, auto, student, medical, business, irs
   For businessExpenses use one of: Software, Subscriptions, Insurance, Accounting, Marketing, Communication, Office, Cloud, Legal, Other
   For income use: income
   For skip use: skip

3. confidence: "high" if very certain, "medium" if somewhat certain, "low" if guessing

4. suggestedName: A clean, human-readable name. Examples:
   - "AMZN MKTP US*1A2B3C" → "Amazon"
   - "NETFLIX.COM" → "Netflix"
   - "WAL-MART #1234 SOMEWHERE FL" → "Walmart"
   - "CHECK DEPOSIT" → "Check Deposit"
   - Keep it short (2-4 words max)

5. reasoning: One brief sentence explaining your choice

Respond with ONLY a valid JSON array. Each object must have exactly these keys: targetSection, category, confidence, suggestedName, reasoning. The array must be the same length and order as the input.`;

/**
 * Categorize transactions using Groq AI.
 * @param {Array} transactions - Parsed bank transactions
 * @param {Function} onProgress - Progress callback (done, total)
 * @returns {Promise<Array>} Categorization results
 */
export async function categorizeTransactions(transactions, onProgress) {
  const apiKey = getApiKey();

  if (!apiKey) {
    // No API key — return basic heuristic categorizations
    return transactions.map(t => heuristicCategorize(t));
  }

  const model = getState().settings?.groqModel || 'llama-3.3-70b-versatile';
  const results = [];
  const total = transactions.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE);
    const batchInput = batch.map((t, idx) => ({
      index: idx,
      description: t.description,
      amount: t.amount,
      type: t.type,
    }));

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(batchInput) },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (response.status === 401) {
        throw new Error('Invalid API key. Check your Groq API key in Settings.');
      }
      if (response.status === 429) {
        // Rate limited — wait and retry once
        await sleep(2000);
        const retry = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: JSON.stringify(batchInput) },
            ],
            temperature: 0.1,
            max_tokens: 4096,
          }),
        });
        if (!retry.ok) {
          // Fallback to heuristics for this batch
          results.push(...batch.map(t => heuristicCategorize(t)));
          if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total);
          continue;
        }
        const retryData = await retry.json();
        const retryParsed = parseAIResponse(retryData, batch.length);
        results.push(...retryParsed);
        if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total);
        if (i + BATCH_SIZE < total) await sleep(BATCH_DELAY);
        continue;
      }
      if (!response.ok) {
        results.push(...batch.map(t => heuristicCategorize(t)));
        if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total);
        continue;
      }

      const data = await response.json();
      const parsed = parseAIResponse(data, batch.length);
      results.push(...parsed);

    } catch (err) {
      if (err.message.includes('Invalid API key')) throw err;
      // Network error or parse failure — fallback to heuristics
      results.push(...batch.map(t => heuristicCategorize(t)));
    }

    if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total);
    if (i + BATCH_SIZE < total) await sleep(BATCH_DELAY);
  }

  return results;
}

/**
 * Test the Groq API connection.
 */
export async function testGroqConnection() {
  const apiKey = getApiKey();
  if (!apiKey) return false;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say "ok"' }],
        max_tokens: 5,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---- Parse AI Response ----
function parseAIResponse(data, expectedCount) {
  try {
    const content = data.choices?.[0]?.message?.content || '';
    let parsed = JSON.parse(content);

    // Handle if wrapped in object
    if (!Array.isArray(parsed)) {
      const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      if (key) parsed = parsed[key];
      else return Array(expectedCount).fill(null).map(() => fallbackResult());
    }

    // Validate and normalize
    return parsed.map(item => ({
      targetSection: validateSection(item.targetSection),
      category: item.category || 'Other',
      confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'low',
      suggestedName: item.suggestedName || '',
      reasoning: item.reasoning || '',
    }));
  } catch {
    return Array(expectedCount).fill(null).map(() => fallbackResult());
  }
}

function validateSection(section) {
  const valid = ['income', 'monthlyExpenses', 'debts', 'businessExpenses', 'annualBudget', 'skip'];
  return valid.includes(section) ? section : 'monthlyExpenses';
}

function fallbackResult() {
  return {
    targetSection: 'monthlyExpenses',
    category: 'Other',
    confidence: 'low',
    suggestedName: '',
    reasoning: 'Could not categorize automatically',
  };
}

// ---- Basic Heuristic Categorization (no API key fallback) ----
function heuristicCategorize(t) {
  const desc = t.description.toLowerCase();
  const amount = t.amount;

  // Income patterns
  if (t.type === 'credit') {
    const incomeKeywords = ['payroll', 'salary', 'direct dep', 'deposit', 'paycheck', 'wage', 'income', 'irs', 'tax refund', 'venmo', 'zelle'];
    if (amount > 300 || incomeKeywords.some(k => desc.includes(k))) {
      return { targetSection: 'income', category: 'income', confidence: 'low', suggestedName: '', reasoning: 'Credit transaction — likely income' };
    }
    return { targetSection: 'skip', category: 'skip', confidence: 'low', suggestedName: '', reasoning: 'Small credit — may be a refund or transfer' };
  }

  // Skip patterns
  const skipKeywords = ['transfer', 'xfer', 'atm', 'withdrawal', 'payment thank'];
  if (skipKeywords.some(k => desc.includes(k))) {
    return { targetSection: 'skip', category: 'skip', confidence: 'low', suggestedName: '', reasoning: 'Looks like a transfer or ATM withdrawal' };
  }

  // Debt patterns
  const debtKeywords = ['loan', 'mortgage', 'student', 'navient', 'sallie', 'nelnet', 'auto pay'];
  if (debtKeywords.some(k => desc.includes(k))) {
    return { targetSection: 'debts', category: 'loan', confidence: 'low', suggestedName: '', reasoning: 'Contains debt-related keywords' };
  }

  // Default: monthly expense
  let category = 'General';
  if (['grocery', 'walmart', 'target', 'costco', 'kroger', 'publix', 'aldi', 'restaurant', 'mcdonald', 'starbucks', 'chipotle', 'doordash', 'uber eat', 'grubhub', 'pizza', 'burger', 'wendy', 'taco bell', 'chick-fil'].some(k => desc.includes(k))) category = 'Food';
  else if (['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'apple.com/bill', 'youtube', 'gym', 'planet fitness'].some(k => desc.includes(k))) category = 'Subscriptions';
  else if (['gas', 'shell', 'exxon', 'chevron', 'bp ', 'fuel', 'uber', 'lyft', 'parking'].some(k => desc.includes(k))) category = 'Transportation';
  else if (['electric', 'water', 'gas bill', 'sewage', 'utility', 'duke energy', 'fpl'].some(k => desc.includes(k))) category = 'Utilities';
  else if (['comcast', 'spectrum', 'xfinity', 'fiber', 'broadband', 'isp'].some(k => desc.includes(k))) category = 'Internet';
  else if (['at&t', 'att ', 'verizon', 't-mobile', 'tmobile', 'sprint', 'cricket', 'mint mobile', 'visible', 'wireless'].some(k => desc.includes(k))) category = 'Phone';
  else if (['rent', 'mortgage', 'hoa', 'property'].some(k => desc.includes(k))) category = 'Housing';
  else if (['insurance', 'geico', 'state farm', 'allstate', 'progressive'].some(k => desc.includes(k))) category = 'Insurance';
  else if (['pharmacy', 'cvs', 'walgreen', 'doctor', 'hospital', 'medical', 'dental', 'health', 'clinic'].some(k => desc.includes(k))) category = 'Health';
  else if (['movie', 'cinema', 'theater', 'concert', 'game', 'entertainment'].some(k => desc.includes(k))) category = 'Entertainment';
  else if (['amazon', 'amzn', 'clothing', 'haircut', 'salon', 'beauty'].some(k => desc.includes(k))) category = 'Personal';

  return { targetSection: 'monthlyExpenses', category, confidence: 'low', suggestedName: '', reasoning: 'No API key — basic categorization' };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
