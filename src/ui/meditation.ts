import { Modal } from './modal';

const DURATIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
];

const VERSES = [
  '"Be still, and know that I am God." — Psalm 46:10',
  '"He leads me beside still waters." — Psalm 23:2',
  '"Be still before the Lord and wait patiently for him." — Psalm 37:7',
  '"In quietness and trust is your strength." — Isaiah 30:15',
];

let timerInterval: ReturnType<typeof setInterval> | null = null;
let selectedDuration = 300;
let remaining = 300;
let running = false;
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

export function openMeditationModal(_triggerEl: HTMLElement): void {
  running = false;
  selectedDuration = 300;
  remaining = 300;
  if (timerInterval !== null) { clearInterval(timerInterval); timerInterval = null; }

  const verse = VERSES[Math.floor(Math.random() * VERSES.length)] ?? VERSES[0]!;

  const modal = new Modal({
    title: 'Meditation Timer',
    content: buildContent(selectedDuration),
  });
  modal.open();
  document.querySelector('.modal')?.classList.add('meditation-modal');
  attachListeners(modal);
  renderTimer(selectedDuration, selectedDuration);
  updateVerse(verse);
}

function buildContent(duration: number): string {
  return `
    <div class="timer-ring">
      <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
        <circle class="timer-ring-track" cx="70" cy="70" r="54" stroke-width="6"/>
        <circle class="timer-ring-fill" id="timer-ring-fill" cx="70" cy="70" r="54"
          stroke-width="6"
          stroke-dasharray="${CIRCUMFERENCE}"
          stroke-dashoffset="0"/>
      </svg>
      <div class="timer-ring-label">
        <div class="timer-display" id="timer-display">${formatTime(duration)}</div>
      </div>
    </div>

    <div class="timer-duration-btns" role="group" aria-label="Select duration">
      ${DURATIONS.map(d => `
        <button class="timer-duration-btn${d.seconds === duration ? ' is-selected' : ''}"
          data-seconds="${d.seconds}">${d.label}</button>`).join('')}
    </div>

    <div class="timer-controls">
      <button class="btn btn-primary" id="btn-timer-start">Start</button>
      <button class="btn btn-ghost" id="btn-timer-reset">Reset</button>
    </div>

    <p class="timer-verse" id="timer-verse"></p>
  `;
}

function attachListeners(modal: Modal): void {
  const container = document.querySelector('.meditation-modal');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Duration button
    const durationBtn = target.closest<HTMLElement>('[data-seconds]');
    if (durationBtn) {
      if (running) return;
      selectedDuration = parseInt(durationBtn.dataset['seconds'] ?? '300', 10);
      remaining = selectedDuration;
      container.querySelectorAll('.timer-duration-btn').forEach(b => {
        b.classList.toggle('is-selected', b === durationBtn);
      });
      renderTimer(remaining, selectedDuration);
    }

    if (target.id === 'btn-timer-start') {
      if (running) {
        pauseTimer(target);
      } else {
        startTimer(target);
      }
    }

    if (target.id === 'btn-timer-reset') {
      resetTimer();
    }
  });

  // Clean up when modal closes
  const origClose = modal.close.bind(modal);
  modal.close = () => {
    stopTimer();
    origClose();
  };
}

function startTimer(btn: HTMLElement): void {
  if (remaining <= 0) remaining = selectedDuration;
  running = true;
  btn.textContent = 'Pause';
  if (timerInterval !== null) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remaining--;
    renderTimer(remaining, selectedDuration);
    if (remaining <= 0) {
      stopTimer();
      const startBtn = document.getElementById('btn-timer-start');
      if (startBtn) startBtn.textContent = 'Start';
      const display = document.getElementById('timer-display');
      if (display) display.textContent = 'Done ✓';
    }
  }, 1000);
}

function pauseTimer(btn: HTMLElement): void {
  running = false;
  if (timerInterval !== null) { clearInterval(timerInterval); timerInterval = null; }
  btn.textContent = 'Resume';
}

function stopTimer(): void {
  running = false;
  if (timerInterval !== null) { clearInterval(timerInterval); timerInterval = null; }
}

function resetTimer(): void {
  stopTimer();
  remaining = selectedDuration;
  const startBtn = document.getElementById('btn-timer-start');
  if (startBtn) startBtn.textContent = 'Start';
  renderTimer(remaining, selectedDuration);
}

function renderTimer(rem: number, total: number): void {
  const display = document.getElementById('timer-display');
  if (display) display.textContent = formatTime(rem);
  const fill = document.getElementById('timer-ring-fill');
  if (fill) {
    const pct = total > 0 ? rem / total : 1;
    fill.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - pct)));
  }
}

function updateVerse(verse: string): void {
  const el = document.getElementById('timer-verse');
  if (el) el.textContent = verse; // textContent is XSS-safe; no need to escape
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
