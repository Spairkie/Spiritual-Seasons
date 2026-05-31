import { Modal } from './modal';
import { showToast } from './toast';
import { escapeHtml } from '../utils/dom';

interface ShareData {
  scriptureRef: string;
  scriptureText: string;
  day: number;
}

export function openShareModal(data: ShareData, _triggerEl: HTMLElement): void {
  const text = `"${data.scriptureText}" — ${data.scriptureRef}`;
  const attribution = `Day ${data.day} · Spiritual Seasons`;
  const hasNativeShare = typeof navigator.share === 'function';

  const modal = new Modal({
    title: 'Share',
    content: `
      <div class="share-card-preview">
        <div class="share-card-ref">${escapeHtml(data.scriptureRef)}</div>
        <div class="share-card-text">"${escapeHtml(data.scriptureText)}"</div>
        <div class="share-card-source">${escapeHtml(attribution)}</div>
      </div>
      <div class="share-actions">
        ${hasNativeShare ? `<button class="btn btn-primary btn-full" id="btn-native-share">Share…</button>` : ''}
        <button class="btn btn-secondary btn-full" id="btn-copy-text">Copy to Clipboard</button>
      </div>
    `,
  });
  modal.open();

  document.getElementById('btn-native-share')?.addEventListener('click', async () => {
    if (typeof navigator.share !== 'function') return;
    try {
      await navigator.share({ title: data.scriptureRef, text });
    } catch (err) {
      // AbortError = user cancelled — no feedback needed
      if (err instanceof Error && err.name !== 'AbortError') {
        showToast('Could not share — try copying instead', { type: 'info', duration: 2500 });
      }
    }
  });

  document.getElementById('btn-copy-text')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${attribution}`);
      showToast('Copied to clipboard', { type: 'success', duration: 2000 });
      modal.close();
    } catch {
      showToast('Could not copy — please copy manually', { type: 'error' });
    }
  });
}
