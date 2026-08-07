let ctx = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, duration, volume = 0.2, type = 'sine') {
  const ac = ensureCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ac.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export const sfx = {
  click() {
    tone(600, 0, 0.08, 0.08, 'triangle');
  },
  check() {
    tone(523, 0, 0.12, 0.15);
    tone(784, 0.1, 0.18, 0.15);
  },
  complete() {
    tone(523, 0, 0.3, 0.2);
    tone(659, 0.15, 0.3, 0.2);
    tone(784, 0.3, 0.5, 0.2);
    tone(1046, 0.45, 0.6, 0.18);
  },
  bell() {
    tone(880, 0, 0.8, 0.18, 'sine');
    tone(880, 0.2, 0.8, 0.12, 'sine');
    tone(1108, 0.4, 0.8, 0.1, 'sine');
  },
  error() {
    tone(220, 0, 0.15, 0.12, 'square');
    tone(180, 0.12, 0.2, 0.12, 'square');
  },
};

export default sfx;