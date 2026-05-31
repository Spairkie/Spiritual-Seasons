import { Modal } from './modal';

const SOUNDS = [
  { id: 'rain',   icon: '🌧',  label: 'Rain',      freq: 200, type: 'pink'   },
  { id: 'forest', icon: '🌲',  label: 'Forest',    freq: 300, type: 'brown'  },
  { id: 'waves',  icon: '🌊',  label: 'Ocean',     freq: 100, type: 'brown'  },
  { id: 'fire',   icon: '🔥',  label: 'Fireplace', freq: 150, type: 'white'  },
];

let audioCtx: AudioContext | null = null;
let activeId: string | null = null;
let gainNode: GainNode | null = null;
let sourceNode: AudioBufferSourceNode | null = null;

export function openSoundsModal(_triggerEl: HTMLElement): void {
  const modal = new Modal({
    title: 'Ambient Sounds',
    content: buildContent(),
  });
  modal.open();
  document.querySelector('.modal')?.classList.add('sounds-modal');
  attachListeners(modal);
}

function buildContent(): string {
  return `
    <div class="sounds-grid">
      ${SOUNDS.map(s => `
        <button class="sound-btn" data-sound="${s.id}" aria-pressed="false">
          <span class="sound-icon">${s.icon}</span>
          <span class="sound-label">${s.label}</span>
          <span class="sound-status" id="sound-status-${s.id}">Tap to play</span>
        </button>`).join('')}
    </div>
    <div class="volume-row">
      <span class="volume-label">Volume</span>
      <input type="range" class="volume-slider" id="volume-slider"
        min="0" max="100" value="50" aria-label="Volume" />
    </div>
  `;
}

function attachListeners(modal: Modal): void {
  document.querySelectorAll<HTMLButtonElement>('[data-sound]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset['sound'] ?? '';
      const sound = SOUNDS.find(s => s.id === id);
      if (!sound) return;

      if (activeId === id) {
        stopSound();
        btn.classList.remove('is-playing');
        btn.setAttribute('aria-pressed', 'false');
        const status = document.getElementById(`sound-status-${id}`);
        if (status) status.textContent = 'Tap to play';
      } else {
        // Stop previous
        stopSound();
        document.querySelectorAll<HTMLButtonElement>('[data-sound]').forEach(b => {
          b.classList.remove('is-playing');
          b.setAttribute('aria-pressed', 'false');
          const sid = b.dataset['sound'] ?? '';
          const st = document.getElementById(`sound-status-${sid}`);
          if (st) st.textContent = 'Tap to play';
        });
        playNoise(sound.type as 'white' | 'pink' | 'brown');
        activeId = id;
        btn.classList.add('is-playing');
        btn.setAttribute('aria-pressed', 'true');
        const status = document.getElementById(`sound-status-${id}`);
        if (status) status.textContent = '▶ Playing';
      }
    });
  });

  const volSlider = document.getElementById('volume-slider') as HTMLInputElement | null;
  volSlider?.addEventListener('input', () => {
    const vol = parseInt(volSlider.value, 10) / 100;
    if (gainNode) gainNode.gain.setTargetAtTime(vol, gainNode.context.currentTime, 0.01);
  });

  const origClose = modal.close.bind(modal);
  modal.close = () => {
    stopSound();
    origClose();
  };
}

function playNoise(type: 'white' | 'pink' | 'brown'): void {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') void audioCtx.resume();

  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate noise
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'white') {
      data[i] = white * 0.3;
    } else if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.11;
    } else {
      // Brown
      const lastOut = i > 0 ? (data[i - 1] ?? 0) : 0;
      const val = (lastOut + 0.02 * white) / 1.02;
      data[i] = val * 3.5;
    }
  }

  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.5;
  gainNode.connect(audioCtx.destination);

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = buffer;
  sourceNode.loop = true;
  sourceNode.connect(gainNode);
  sourceNode.start();
}

function stopSound(): void {
  try { sourceNode?.stop(); } catch { /* already stopped */ }
  sourceNode = null;
  gainNode?.disconnect();
  gainNode = null;
  activeId = null;
}
