import { router } from '../router/router';
import { ROUTES } from '../router/routes';

export function initKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    // Skip when focus is inside a text input / textarea
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if ((e.target as HTMLElement).isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case 's':
        e.preventDefault();
        void router.navigate(ROUTES.SEARCH);
        break;

      case 'h':
        e.preventDefault();
        void router.navigate(ROUTES.HOME);
        break;

      case 'n': {
        // Next day — only on devotional page
        const nextBtn = document.getElementById('btn-next') as HTMLButtonElement | null;
        if (nextBtn && !nextBtn.hidden && !nextBtn.disabled) {
          e.preventDefault();
          nextBtn.click();
        }
        break;
      }

      case 'p': {
        // Previous day — only on devotional page
        const prevBtn = document.getElementById('btn-prev') as HTMLButtonElement | null;
        if (prevBtn && !prevBtn.disabled) {
          e.preventDefault();
          prevBtn.click();
        }
        break;
      }

      case 'f': {
        // Toggle favourite — only on devotional page
        const favBtn = document.getElementById('btn-favorite') as HTMLButtonElement | null;
        if (favBtn) {
          e.preventDefault();
          favBtn.click();
        }
        break;
      }

      case 'j': {
        // Jump to journal textarea — only on devotional page
        const journal = document.getElementById('journal-textarea') as HTMLTextAreaElement | null;
        if (journal) {
          e.preventDefault();
          journal.focus();
        }
        break;
      }

      case 'Escape': {
        // Close any open modal, or go back if on a sub-page
        const backBtn = document.getElementById('header-back-btn') as HTMLButtonElement | null;
        if (backBtn && !backBtn.hidden) {
          e.preventDefault();
          backBtn.click();
        }
        break;
      }

      case '?':
        e.preventDefault();
        showShortcutsHelp();
        break;
    }
  });
}

function showShortcutsHelp(): void {
  const shortcuts = [
    ['s', 'Search'],
    ['h', 'Go to Home'],
    ['n', 'Next day (devotional)'],
    ['p', 'Previous day (devotional)'],
    ['f', 'Toggle favourite (devotional)'],
    ['j', 'Jump to journal (devotional)'],
    ['Esc', 'Go back / close'],
    ['?', 'Show shortcuts'],
  ];

  const existing = document.getElementById('shortcuts-help-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'shortcuts-help-overlay';
  overlay.className = 'shortcuts-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Keyboard shortcuts');
  overlay.innerHTML = `
    <div class="shortcuts-card">
      <div class="shortcuts-header">
        <h2 class="shortcuts-title">Keyboard Shortcuts</h2>
        <button class="btn btn-icon shortcuts-close" aria-label="Close">✕</button>
      </div>
      <ul class="shortcuts-list">
        ${shortcuts.map(([key, label]) => `
          <li class="shortcuts-item">
            <kbd class="shortcuts-key">${key}</kbd>
            <span class="shortcuts-desc">${label}</span>
          </li>`).join('')}
      </ul>
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || (e.target as HTMLElement).closest('.shortcuts-close')) {
      overlay.remove();
    }
  });

  document.body.appendChild(overlay);
  (overlay.querySelector('.shortcuts-close') as HTMLElement)?.focus();
}
