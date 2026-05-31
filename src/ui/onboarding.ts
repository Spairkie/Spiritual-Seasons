import { getQuizResults } from '../store/user';

const STEPS = [
  {
    icon: '📖',
    title: 'Your Daily Reading',
    desc: '120 days of scripture, reflection, and journaling — one beautiful day at a time.',
  },
  {
    icon: '🌱',
    title: 'Discover Your Season',
    desc: 'Take a short quiz to reveal your current spiritual season and start your journey there.',
  },
  {
    icon: '✍️',
    title: 'Journal & Reflect',
    desc: 'Write personal responses to daily prompts and weekly reflection questions.',
  },
  {
    icon: '📊',
    title: 'Track Your Journey',
    desc: 'Watch your progress grow, save favourite days, and look back on what God has done.',
  },
];

let currentStep = 0;

export async function maybeShowOnboarding(): Promise<void> {
  if (localStorage.getItem('onboarding-done')) return;
  const results = await getQuizResults();
  if (results !== null) {
    localStorage.setItem('onboarding-done', '1');
    return;
  }
  showTour();
}

function showTour(): void {
  currentStep = 0;
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Welcome to Spiritual Seasons');
  overlay.innerHTML = buildStep(0);
  document.body.appendChild(overlay);
  attachTourListeners(overlay);
}

function buildStep(step: number): string {
  const s = STEPS[step]!;
  const dots = STEPS.map((_, i) =>
    `<span class="onboarding-dot${i === step ? ' is-active' : ''}"></span>`
  ).join('');

  const isLast = step === STEPS.length - 1;
  return `
    <div class="onboarding-card">
      <button class="onboarding-skip" id="ob-skip" aria-label="Skip tour">Skip</button>
      <div class="onboarding-icon">${s.icon}</div>
      <h2 class="onboarding-title">${s.title}</h2>
      <p class="onboarding-desc">${s.desc}</p>
      <div class="onboarding-dots">${dots}</div>
      <div class="onboarding-actions">
        ${step > 0 ? '<button class="btn btn-ghost btn-sm" id="ob-prev">← Back</button>' : '<span></span>'}
        <button class="btn btn-primary" id="ob-next">
          ${isLast ? 'Get Started →' : 'Next →'}
        </button>
      </div>
    </div>
  `;
}

function attachTourListeners(overlay: HTMLElement): void {
  overlay.querySelector('#ob-skip')?.addEventListener('click', () => dismissTour(overlay));
  overlay.querySelector('#ob-next')?.addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      overlay.innerHTML = buildStep(currentStep);
      attachTourListeners(overlay);
    } else {
      dismissTour(overlay);
    }
  });
  overlay.querySelector('#ob-prev')?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      overlay.innerHTML = buildStep(currentStep);
      attachTourListeners(overlay);
    }
  });
}

function dismissTour(overlay: HTMLElement): void {
  localStorage.setItem('onboarding-done', '1');
  overlay.classList.add('is-hiding');
  setTimeout(() => overlay.remove(), 300);
}
