// PWA install prompt — shows a banner when the browser fires beforeinstallprompt

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let bannerShown = false;

export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;

    if (!bannerShown && !localStorage.getItem('pwa-install-dismissed')) {
      // Delay slightly so the app has rendered
      setTimeout(showBanner, 3000);
    }
  });
}

function showBanner(): void {
  if (bannerShown) return;
  bannerShown = true;

  const banner = document.createElement('div');
  banner.className = 'install-banner';
  banner.setAttribute('role', 'complementary');
  banner.setAttribute('aria-label', 'Install app');
  banner.innerHTML = `
    <div class="install-banner-icon">🌿</div>
    <div class="install-banner-text">
      <strong>Add to Home Screen</strong>
      Use Spiritual Seasons offline, any time.
    </div>
    <div class="install-banner-actions">
      <button class="btn btn-primary btn-sm" id="btn-install-accept">Install</button>
      <button class="btn btn-ghost btn-sm" id="btn-install-dismiss">Not now</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('btn-install-accept')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.remove();
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-install-dismissed', '1');
    }
  });

  document.getElementById('btn-install-dismiss')?.addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('pwa-install-dismissed', '1');
  });
}
