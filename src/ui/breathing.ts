import { Modal } from './modal';

// Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
const PHASES: Array<{ label: string; duration: number; class: string }> = [
  { label: 'Inhale',    duration: 4, class: 'is-inhale' },
  { label: 'Hold',      duration: 4, class: 'is-hold'   },
  { label: 'Exhale',    duration: 4, class: 'is-exhale'  },
  { label: 'Hold',      duration: 4, class: 'is-hold'   },
];

let breathInterval: ReturnType<typeof setInterval> | null = null;
let phaseIndex = 0;
let phaseCount = 0;
let cycleCount = 0;
let active = false;

export function openBreathingModal(_triggerEl: HTMLElement): void {
  active = false;
  phaseIndex = 0;
  phaseCount = 0;
  cycleCount = 0;
  if (breathInterval !== null) { clearInterval(breathInterval); breathInterval = null; }

  const modal = new Modal({
    title: 'Box Breathing',
    content: buildContent(),
  });
  modal.open();
  document.querySelector('.modal')?.classList.add('breathing-modal');
  attachListeners(modal);
}

function buildContent(): string {
  return `
    <div class="breath-circle-wrap">
      <div class="breath-circle" id="breath-circle">
        <div class="breath-count" id="breath-count">4</div>
      </div>
    </div>
    <div class="breath-phase-label" id="breath-phase">Ready</div>
    <p class="breath-instruction">Box breathing calms the nervous system.<br>Inhale → Hold → Exhale → Hold, each for 4 seconds.</p>
    <p class="breath-pattern-label">4-4-4-4 box breathing · <span id="breath-cycles">0 cycles</span></p>
    <button class="btn btn-primary" id="btn-breath-start">Begin</button>
  `;
}

function attachListeners(modal: Modal): void {
  document.getElementById('btn-breath-start')?.addEventListener('click', (e) => {
    const btn = e.target as HTMLButtonElement;
    if (active) {
      stopBreathing(btn);
    } else {
      startBreathing(btn);
    }
  });

  const origClose = modal.close.bind(modal);
  modal.close = () => {
    stopBreathing(null);
    origClose();
  };
}

function startBreathing(btn: HTMLButtonElement | null): void {
  active = true;
  if (btn) btn.textContent = 'Stop';
  phaseIndex = 0;
  phaseCount = 0;
  showPhase();
  if (breathInterval !== null) clearInterval(breathInterval);
  breathInterval = setInterval(() => {
    phaseCount++;
    const phase = PHASES[phaseIndex]!;
    if (phaseCount >= phase.duration) {
      phaseCount = 0;
      phaseIndex = (phaseIndex + 1) % PHASES.length;
      if (phaseIndex === 0) {
        cycleCount++;
        const cycleEl = document.getElementById('breath-cycles');
        if (cycleEl) cycleEl.textContent = `${cycleCount} cycle${cycleCount !== 1 ? 's' : ''}`;
      }
      showPhase();
    } else {
      const countEl = document.getElementById('breath-count');
      const phase2 = PHASES[phaseIndex]!;
      if (countEl) countEl.textContent = String(phase2.duration - phaseCount);
    }
  }, 1000);
}

function stopBreathing(btn: HTMLButtonElement | null): void {
  active = false;
  if (breathInterval !== null) { clearInterval(breathInterval); breathInterval = null; }
  if (btn) btn.textContent = 'Begin';
  const circle = document.getElementById('breath-circle');
  if (circle) circle.className = 'breath-circle';
  const phase = document.getElementById('breath-phase');
  if (phase) phase.textContent = 'Ready';
  const count = document.getElementById('breath-count');
  if (count) count.textContent = '4';
}

function showPhase(): void {
  const phase = PHASES[phaseIndex]!;
  const circle = document.getElementById('breath-circle');
  if (circle) {
    circle.className = `breath-circle ${phase.class}`;
  }
  const phaseEl = document.getElementById('breath-phase');
  if (phaseEl) phaseEl.textContent = phase.label;
  const countEl = document.getElementById('breath-count');
  if (countEl) countEl.textContent = String(phase.duration);
}
