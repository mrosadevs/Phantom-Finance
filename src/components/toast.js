// ============================================
// PHANTOM FINANCE - TOAST NOTIFICATIONS
// ============================================

const icons = {
  success: '&#10003;',
  error: '&#10007;',
  warning: '&#9888;',
  info: '&#8505;',
};

export function toast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('toast-exit');
    setTimeout(() => el.remove(), 300);
  }, duration);
}
