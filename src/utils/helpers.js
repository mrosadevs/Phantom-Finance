// ============================================
// PHANTOM FINANCE - HELPERS
// ============================================

export function $(sel, ctx = document) {
  return ctx.querySelector(sel);
}

export function $$(sel, ctx = document) {
  return [...ctx.querySelectorAll(sel)];
}

export function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Number(num) || 0);
}

export function formatPercent(num) {
  return (Number(num) || 0).toFixed(1) + '%';
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function sumBy(arr, key) {
  return arr.reduce((s, item) => s + (Number(item[key]) || 0), 0);
}

export function animateValue(el, start, end, duration = 1000) {
  const startTime = performance.now();
  const isCurrency = el.dataset.format === 'currency';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;

    if (isCurrency) {
      el.textContent = formatCurrency(current);
    } else {
      el.textContent = formatNumber(Math.round(current));
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

export function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
    page.querySelectorAll('[data-animate]').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.05}s`;
    });
  }
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export function getDayOfMonth() {
  return new Date().getDate();
}

export function getCurrentMonth() {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
