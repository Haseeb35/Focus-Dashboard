// Generates high-quality, seamless-looping ambient WAV files using pure DSP.
// Run: node scripts/generate-audio.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'src', 'assets', 'audio');
const FS = 44100;
const LEN = 8;          // loop length in seconds
const FADE = 0.35;      // crossfade seconds for seamless loop

const TOTAL = Math.floor(FS * LEN);

// ---- PRNG (seeded, mulberry32) ----
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Biquad filter (RBJ cookbook) ----
function biquadCoeffs(type, f, Q) {
  const w0 = (2 * Math.PI * f) / FS;
  const cosw = Math.cos(w0);
  const sinw = Math.sin(w0);
  const alpha = sinw / (2 * Q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'lowpass') {
    b0 = (1 - cosw) / 2; b1 = 1 - cosw; b2 = (1 - cosw) / 2;
    a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
  } else if (type === 'highpass') {
    b0 = (1 + cosw) / 2; b1 = -(1 + cosw); b2 = (1 + cosw) / 2;
    a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
  } else if (type === 'bandpass') {
    b0 = alpha; b1 = 0; b2 = -alpha;
    a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
  }
  return { b0, b1, b2, a0, a1, a2 };
}

function applyBiquad(data, type, f, Q, gain = 1) {
  const c = biquadCoeffs(type, f, Q);
  const out = new Float32Array(data.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i++) {
    const x = data[i];
    const y = (c.b0 * x + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2) / c.a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y * gain;
  }
  return out;
}

// ---- Noise generators ----
function white(rng, n) {
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = rng() * 2 - 1;
  return o;
}

function pink(rng, n) {
  const o = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const w = rng() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    o[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return o;
}

function brown(rng, n) {
  const o = new Float32Array(n);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = rng() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    o[i] = last * 3.5;
  }
  return o;
}

// ---- Generic helpers ----
function add(target, src, gain = 1, offset = 0) {
  for (let i = 0; i < src.length && i + offset < target.length; i++) {
    target[i + offset] += src[i] * gain;
  }
}

function normalize(data, peak = 0.9) {
  let max = 0;
  for (let i = 0; i < data.length; i++) max = Math.max(max, Math.abs(data[i]));
  if (max === 0) return data;
  const g = peak / max;
  for (let i = 0; i < data.length; i++) data[i] *= g;
  return data;
}

// Make a buffer seamless-loopable by crossfading its tail into its head
function makeLoopable(gen, fadeSamples) {
  const L = gen.length - fadeSamples;
  const out = new Float32Array(L);
  for (let i = 0; i < fadeSamples; i++) {
    const a = i / fadeSamples;
    const head = gen[i] * a;
    const tail = gen[L + i] * (1 - a);
    out[i] = head + tail;
  }
  for (let i = fadeSamples; i < L; i++) out[i] = gen[i];
  return out;
}

// Wrap a generator so it renders TOTAL + FADE samples then crossfades
function loopable(fn) {
  return (rng) => {
    const gen = fn(rng, TOTAL + Math.floor(FADE * FS));
    return makeLoopable(gen, Math.floor(FADE * FS));
  };
}

// =====================================================================
// SOUND GENERATORS (each returns a mono Float32Array of length TOTAL)
// =====================================================================

const rain = loopable((rng, n) => {
  const out = new Float32Array(n);
  add(out, applyBiquad(pink(rng, n), 'bandpass', 1300, 0.55, 1.6), 1);
  add(out, applyBiquad(white(rng, n), 'highpass', 2400, 0.7, 0.5), 1);
  add(out, applyBiquad(brown(rng, n), 'lowpass', 220, 0.8, 2.6), 1);
  // slow gentle shimmer
  for (let i = 0; i < n; i++) {
    const wob = 0.9 + 0.1 * Math.sin((2 * Math.PI * i * 2) / FS);
    out[i] *= wob;
  }
  return out;
});

const ocean = loopable((rng, n) => {
  const out = applyBiquad(brown(rng, n), 'lowpass', 420, 0.9, 3.2);
  const foam = applyBiquad(white(rng, n), 'highpass', 2800, 0.8, 0.35);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // one full swell cycle per loop -> seamless
    const env = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
    const rattle = 0.6 + 0.4 * rng();
    out[i] = (out[i] * (0.5 + env * 0.9) + foam[i] * env * rattle) * 0.9;
  }
  return out;
});

const forest = loopable((rng, n) => {
  const out = applyBiquad(pink(rng, n), 'lowpass', 2400, 0.7, 1.6);
  // gentle breeze modulation
  for (let i = 0; i < n; i++) {
    out[i] *= 0.75 + 0.25 * Math.sin((2 * Math.PI * i * 1.4) / FS + rng() * 0.5);
  }
  // bird chirps
  const chirpCount = 5 + Math.floor(rng() * 4);
  for (let c = 0; c < chirpCount; c++) {
    const start = Math.floor(rng() * (n - 2 * FS));
    const base = 2400 + rng() * 1600;
    const dur = 0.05 + rng() * 0.07;
    const steps = Math.floor(FS * dur);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const env = Math.sin(Math.PI * t);
      const vib = 1 + 0.08 * Math.sin(2 * Math.PI * 40 * (s / FS));
      const f = base * (1 + t * 0.5) * vib;
      out[start + s] += 0.32 * env * Math.sin(2 * Math.PI * f * (s / FS));
    }
  }
  return out;
});

const fireplace = loopable((rng, n) => {
  const out = applyBiquad(brown(rng, n), 'lowpass', 500, 0.85, 2.4);
  add(out, applyBiquad(white(rng, n), 'highpass', 4200, 0.7, 0.12), 1);
  // crackles
  const crackles = 40 + Math.floor(rng() * 30);
  for (let c = 0; c < crackles; c++) {
    const start = Math.floor(rng() * (n - FS));
    const dur = 0.004 + rng() * 0.02;
    const amp = 0.25 + rng() * 0.55;
    const steps = Math.floor(FS * dur);
    const seed = Math.floor(rng() * 1e9);
    const cr = mulberry32(seed);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const env = Math.exp(-t * 7);
      out[start + s] += amp * env * (cr() * 2 - 1);
    }
  }
  // slow fire rumble
  for (let i = 0; i < n; i++) {
    out[i] *= 0.8 + 0.2 * Math.sin((2 * Math.PI * i * 1.2) / FS);
  }
  return out;
});

const coffee = loopable((rng, n) => {
  const out = applyBiquad(pink(rng, n), 'lowpass', 950, 0.8, 1.9);
  add(out, applyBiquad(brown(rng, n), 'lowpass', 160, 0.9, 1.8), 1);
  // murmur "chatter" : bandpassed noise with random syllable-like bursts
  const chatter = applyBiquad(white(rng, n), 'bandpass', 600, 0.7, 0.6);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) phase = Math.max(0, phase - 0.004);
    if (phase < 0.02 && rng() < 0.0004) phase = 0.5 + rng() * 0.5;
    out[i] += chatter[i] * phase * 0.55;
  }
  return out;
});

const wind = loopable((rng, n) => {
  const out = new Float32Array(n);
  const base = pink(rng, n);
  const sweepCount = 2; // two full sweeps per loop -> seamless
  const smooth = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const center = 280 + 260 * Math.sin(2 * Math.PI * sweepCount * t);
    // crude moving bandpass via 3 resonators weighted
    const lp = applyBiquadFloat(base, center, i);
    smooth[i] = lp;
    const env = 0.5 + 0.5 * Math.sin(2 * Math.PI * 1 * t);
    out[i] = lp * (0.35 + env * 0.65) * 2.2;
  }
  return out;
});

// helper for wind: time-varying lowpass using per-sample filter state
function applyBiquadFloat(data, freq, idx) {
  // reuse a simple one-pole lowpass at varying cutoff
  if (!applyBiquadFloat._state) applyBiquadFloat._state = 0;
  const alpha = 1 - Math.exp((-2 * Math.PI * freq) / FS);
  const s = applyBiquadFloat._state + alpha * (data[idx] - applyBiquadFloat._state);
  applyBiquadFloat._state = s;
  return s;
}

const birds = loopable((rng, n) => {
  const out = applyBiquad(pink(rng, n), 'lowpass', 1500, 0.7, 0.5);
  const callCount = 6 + Math.floor(rng() * 5);
  for (let c = 0; c < callCount; c++) {
    const start = Math.floor(rng() * (n - FS));
    const chirps = 2 + Math.floor(rng() * 4);
    for (let ch = 0; ch < chirps; ch++) {
      const off = Math.floor((0.06 + rng() * 0.12) * FS);
      const base = 2200 + rng() * 1800;
      const dur = 0.03 + rng() * 0.05;
      const steps = Math.floor(FS * dur);
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const env = Math.sin(Math.PI * t);
        const vib = 1 + 0.12 * Math.sin(2 * Math.PI * 32 * (s / FS));
        const f = base * (1 + t * 0.7) * vib;
        out[start + off + s] += 0.4 * env * Math.sin(2 * Math.PI * f * (s / FS));
      }
    }
  }
  return out;
});

const piano = loopable((rng, n) => {
  const out = new Float32Array(n);
  const chords = [
    [261.63, 329.63, 392.0],
    [329.63, 392.0, 493.88],
    [196.0, 246.94, 329.63],
    [293.66, 369.99, 440.0],
  ];
  const chordDur = n / chords.length;
  chords.forEach((chord, ci) => {
    const start = Math.floor(ci * chordDur);
    chord.forEach((f, hi) => {
      const g = hi === 0 ? 0.5 : 0.3;
      for (let i = 0; i < chordDur; i++) {
        const t = i / FS;
        const env = Math.min(1, t / 0.12) * Math.exp(-t * 0.55);
        const partial = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t);
        out[start + i] += g * env * partial * 0.5;
      }
    });
  });
  return applyBiquad(out, 'lowpass', 2200, 0.8, 1.2);
});

// =====================================================================

const SOUNDS = { rain, ocean, forest, fireplace, coffee, wind, birds, piano };

mkdirSync(OUT_DIR, { recursive: true });

for (const [name, gen] of Object.entries(SOUNDS)) {
  const left = normalize(gen(mulberry32(hash(name + ':L'))));
  const right = normalize(gen(mulberry32(hash(name + ':R'))));
  writeWav(join(OUT_DIR, `${name}.wav`), left, right);
  console.log(`generated ${name}.wav`);
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function writeWav(path, left, right) {
  const bytesPerSample = 2;
  const channels = 2;
  const dataLength = left.length * channels * bytesPerSample;
  const buf = Buffer.alloc(44 + dataLength);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataLength, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(FS, 24);
  buf.writeUInt32LE(FS * channels * bytesPerSample, 28);
  buf.writeUInt16LE(channels * bytesPerSample, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataLength, 40);
  let o = 44;
  for (let i = 0; i < left.length; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE((l * 32767) | 0, o);
    buf.writeInt16LE((r * 32767) | 0, o + 2);
    o += 4;
  }
  writeFileSync(path, buf);
}

console.log('Done.');
