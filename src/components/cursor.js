// ============================================
// PHANTOM FINANCE - CUSTOM CURSOR
// ============================================

export function initCursor() {
  // Skip on touch devices
  if (!window.matchMedia('(hover: hover)').matches) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  document.addEventListener('mousedown', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(0.6)';
    ring.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    ring.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // Smooth ring follow
  function followRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(followRing);
  }
  followRing();

  // Enlarge on interactive elements
  const interactiveSelector = 'a, button, input, select, textarea, .btn-primary, .btn-secondary, .btn-ghost, .card, .data-row, .debt-row, .nav-link';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) {
      ring.style.width = '48px';
      ring.style.height = '48px';
      ring.style.borderColor = 'var(--accent4)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelector)) {
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'var(--accent)';
    }
  });
}
