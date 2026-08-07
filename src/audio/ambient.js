// Procedural ambient sound generator using the Web Audio API.
// No audio files required - all sounds are synthesized.
class AmbientEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.masterVolume = 0.8;
    this.muted = false;
    this.active = {}; // id -> { nodes:[], gain }
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AC();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setMasterVolume(v) {
    this.masterVolume = v;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(v, this.audioCtx.currentTime, 0.05);
    }
  }

  setMuted(m) {
    this.muted = m;
    if (this.masterGain) {
      const target = m ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.05);
    }
  }

  play(id, volume = 0.5) {
    this.ensureContext();
    if (this.active[id]) return;
    const graph = this.buildGraph(id);
    if (!graph) return;
    graph.gain.gain.value = 0;
    this.active[id] = graph;
    graph.gain.gain.setTargetAtTime(volume, this.audioCtx.currentTime, 0.6);
  }

  setVolume(id, volume) {
    const g = this.active[id];
    if (g) {
      g.gain.gain.setTargetAtTime(volume, this.audioCtx.currentTime, 0.05);
    }
  }

  stop(id) {
    const g = this.active[id];
    if (!g) return;
    const now = this.audioCtx.currentTime;
    g.gain.gain.cancelScheduledValues(now);
    g.gain.gain.setValueAtTime(g.gain.gain.value, now);
    g.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    const nodes = g.nodes;
    setTimeout(() => {
      nodes.forEach((n) => {
        try { n.stop && n.stop(); } catch (e) {}
        try { n.disconnect && n.disconnect(); } catch (e) {}
      });
      if (this.active[id]) delete this.active[id];
    }, 600);
  }

  buildGraph(id) {
    const ctx = this.audioCtx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.masterGain);

    switch (id) {
      case 'rain': return this.rain(ctx, gain);
      case 'ocean': return this.ocean(ctx, gain);
      case 'forest': return this.forest(ctx, gain);
      case 'fireplace': return this.fireplace(ctx, gain);
      case 'coffee': return this.coffee(ctx, gain);
      case 'wind': return this.wind(ctx, gain);
      case 'birds': return this.birds(ctx, gain);
      case 'piano': return this.piano(ctx, gain);
      default: return null;
    }
  }

  noiseBuffer(type = 'white') {
    const ctx = this.audioCtx;
    const seconds = 2;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') {
        data[i] = white;
      } else if (type === 'pink') {
        lastOut = 0.98 * lastOut + 0.02 * white;
        data[i] = lastOut;
      } else if (type === 'brown') {
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    }
    return buffer;
  }

  makeNoise(type, loop = true) {
    const ctx = this.audioCtx;
    const buffer = this.noiseBuffer(type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    return source;
  }

  rain(ctx, gain) {
    const src = this.makeNoise('pink');
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.4;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6000;
    src.connect(filter).connect(lp).connect(gain);
    src.start();
    this.addWaves(ctx, gain, [0.2, 0.35]);
    return { nodes: [src], gain };
  }

  ocean(ctx, gain) {
    const src = this.makeNoise('brown');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800;
    src.connect(lp).connect(gain);
    src.start();
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.03;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();
    return { nodes: [src, lfo], gain };
  }

  forest(ctx, gain) {
    const src = this.makeNoise('pink');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2500;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900;
    bp.Q.value = 1;
    src.connect(lp).connect(gain);
    src.connect(bp).connect(gain);
    src.start();
    return { nodes: [src], gain };
  }

  addWaves(ctx, gain, freqs) {
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g).connect(gain);
      osc.start();
    });
  }

  fireplace(ctx, gain) {
    const src = this.makeNoise('brown');
    const bp = ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.value = 700;
    src.connect(bp).connect(gain);
    src.start();
    const crackle = this.makeNoise('white');
    const cbp = ctx.createBiquadFilter();
    cbp.type = 'highpass';
    cbp.frequency.value = 3000;
    const cg = ctx.createGain();
    cg.gain.value = 0.08;
    crackle.connect(cbp).connect(cg).connect(gain);
    crackle.start();
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain).connect(gain.gain);
    lfo.start();
    return { nodes: [src, crackle, lfo], gain };
  }

  coffee(ctx, gain) {
    const src = this.makeNoise('pink');
    const bp = ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.value = 1000;
    src.connect(bp).connect(gain);
    src.start();
    this.addWaves(ctx, gain, [120, 180]);
    return { nodes: [src], gain };
  }

  wind(ctx, gain) {
    const src = this.makeNoise('pink');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 400;
    bp.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.value = 0.6;
    src.connect(bp).connect(g).connect(gain);
    src.start();
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    return { nodes: [src, lfo], gain };
  }

  birds(ctx, gain) {
    const src = this.makeNoise('pink');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2800;
    bp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.value = 0.25;
    src.connect(bp).connect(g).connect(gain);
    src.start();
    const ctxRef = this.audioCtx;
    const scheduleChirps = () => {
      if (!this.active['birds']) return;
      this.chirp(gain);
      setTimeout(scheduleChirps, 1000 + Math.random() * 3000);
    };
    setTimeout(scheduleChirps, 400);
    return { nodes: [src], gain };
  }

  chirp(destGain) {
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const base = 2500 + Math.random() * 1500;
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.linearRampToValueAtTime(base + 1500, now + 0.08);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(g).connect(destGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  piano(ctx, gain) {
    const chords = [
      [261.63, 329.63, 392.0],
      [329.63, 392.0, 493.88],
      [196.0, 246.94, 329.63],
    ];
    let i = 0;
    const playChord = () => {
      if (!this.active['piano']) return;
      const now = ctx.currentTime;
      const chord = chords[i % chords.length];
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.06, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 3);
        osc.connect(g).connect(gain);
        osc.start(now);
        osc.stop(now + 3.5);
      });
      i++;
      setTimeout(playChord, 3200 + Math.random() * 1500);
    };
    setTimeout(playChord, 300);
    return { nodes: [], gain };
  }
}

export const ambient = new AmbientEngine();