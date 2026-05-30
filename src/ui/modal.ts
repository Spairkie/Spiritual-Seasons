interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  actions?: ModalAction[];
  onClose?: () => void;
}

interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

export class Modal {
  private overlay: HTMLElement;
  private dialog: HTMLElement;
  private triggerEl: HTMLElement | null;
  private onCloseCb: (() => void) | undefined;

  constructor(options: ModalOptions) {
    this.triggerEl = document.activeElement as HTMLElement;
    this.onCloseCb = options.onClose;

    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.setAttribute('role', 'presentation');

    this.dialog = document.createElement('div');
    this.dialog.className = 'modal';
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('aria-modal', 'true');
    this.dialog.setAttribute('aria-labelledby', 'modal-title');

    const titleEl = document.createElement('div');
    titleEl.className = 'modal-header';

    const h2 = document.createElement('h2');
    h2.id = 'modal-title';
    h2.className = 'modal-title';
    h2.textContent = options.title;
    titleEl.appendChild(h2);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close btn btn-icon';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.close(), { once: true });
    titleEl.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof options.content === 'string') {
      body.innerHTML = options.content;
    } else {
      body.appendChild(options.content);
    }

    this.dialog.appendChild(titleEl);
    this.dialog.appendChild(body);

    if (options.actions?.length) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      for (const action of options.actions) {
        const btn = document.createElement('button');
        btn.className = `btn btn-${action.variant ?? 'secondary'}`;
        btn.textContent = action.label;
        btn.addEventListener('click', () => {
          action.onClick();
        });
        footer.appendChild(btn);
      }
      this.dialog.appendChild(footer);
    }

    this.overlay.appendChild(this.dialog);
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.dialog.addEventListener('keydown', (e) => this.trapFocus(e));
    document.addEventListener('keydown', this.handleEsc);
  }

  open(): void {
    document.body.appendChild(this.overlay);
    requestAnimationFrame(() => this.overlay.classList.add('modal-overlay--visible'));

    // Focus first focusable element in dialog
    const first = this.dialog.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }

  close(): void {
    this.overlay.classList.remove('modal-overlay--visible');
    this.overlay.addEventListener(
      'transitionend',
      () => {
        this.overlay.remove();
        document.removeEventListener('keydown', this.handleEsc);
        this.triggerEl?.focus();
        this.onCloseCb?.();
      },
      { once: true }
    );
  }

  private handleEsc = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  private trapFocus(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    const focusable = Array.from(this.dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

export function openModal(options: ModalOptions): Modal {
  const m = new Modal(options);
  m.open();
  return m;
}
