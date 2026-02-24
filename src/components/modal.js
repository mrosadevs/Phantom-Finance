// ============================================
// PHANTOM FINANCE - MODAL SYSTEM
// ============================================

const overlay = () => document.getElementById('modal-overlay');
const container = () => document.getElementById('modal-container');

let currentModal = null;

export function openModal(html, opts = {}) {
  const ov = overlay();
  const ct = container();
  if (!ov || !ct) return;

  ct.innerHTML = `<div class="modal">${html}</div>`;
  currentModal = ct.querySelector('.modal');

  requestAnimationFrame(() => {
    ov.classList.add('open');
    currentModal.classList.add('open');
  });

  // Close on overlay click
  ov.onclick = () => closeModal();

  // Close button
  const closeBtn = currentModal.querySelector('.modal-close');
  if (closeBtn) closeBtn.onclick = () => closeModal();

  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  if (opts.onOpen) opts.onOpen(currentModal);

  return currentModal;
}

export function closeModal() {
  const ov = overlay();
  if (currentModal) {
    currentModal.classList.remove('open');
    ov.classList.remove('open');
    setTimeout(() => {
      const ct = container();
      if (ct) ct.innerHTML = '';
      currentModal = null;
    }, 300);
  }
}
