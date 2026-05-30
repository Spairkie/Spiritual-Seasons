type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms; 0 = persistent until dismissed
}

let container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message: string, options: ToastOptions = {}): void {
  const { type = 'info', duration = 3500 } = options;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  const dismiss = document.createElement('button');
  dismiss.className = 'toast-dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss');
  dismiss.textContent = '×';
  dismiss.addEventListener('click', () => remove(toast), { once: true });

  toast.appendChild(dismiss);
  getContainer().appendChild(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  if (duration > 0) {
    setTimeout(() => remove(toast), duration);
  }
}

function remove(toast: HTMLElement): void {
  toast.classList.remove('toast--visible');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}
