/** Safely escape HTML for injection via innerHTML */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Clear all children from an element */
export function clearElement(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/** Create an element with optional className and text */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

/** Render a loading spinner into a container */
export function showLoading(container: HTMLElement): void {
  container.innerHTML = '<div class="page-loading"><div class="loading-spinner" aria-label="Loading…"></div></div>';
}

/** Get the main content element — throws if missing (should never happen) */
export function getMain(): HTMLElement {
  const main = document.getElementById('main-content');
  if (!main) throw new Error('#main-content not found');
  return main;
}
