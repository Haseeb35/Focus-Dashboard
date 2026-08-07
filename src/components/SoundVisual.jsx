import { useMemo } from 'react';

const rnd = (min, max) => min + Math.random() * (max - min);

function Rain({ n = 40 }) {
  const drops = useMemo(() =>
    Array.from({ length: n }, () => ({
      left: rnd(0, 100),
      delay: rnd(0, 1.4),
      dur: rnd(0.5, 1.2),
      height: rnd(16, 34),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {drops.map((d, i) => (
        <span
          key={i}
          className="rain-drop"
          style={{
            left: `${d.left}%`,
            height: d.height,
            '--delay': `${d.delay}s`,
            '--dur': `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function Ocean({ n = 10 }) {
  const bubbles = useMemo(() =>
    Array.from({ length: n }, () => ({
      left: rnd(4, 96),
      size: rnd(8, 20),
      delay: rnd(0, 3.5),
      dur: rnd(2.4, 4),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="ocean-wave" style={{ '--dur': '7s', bottom: 0, opacity: 0.9 }} />
      <div className="ocean-wave" style={{ '--dur': '9s', bottom: 14, opacity: 0.6 }} />
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            '--delay': `${b.delay}s`,
            '--dur': `${b.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function Forest({ n = 14 }) {
  const leaves = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      left: rnd(2, 94),
      delay: rnd(0, 4),
      dur: rnd(2.4, 4.2),
      sway: rnd(14, 40),
      size: rnd(7, 12),
    })), []);
  const flies = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      left: rnd(4, 92),
      top: rnd(10, 90),
      delay: rnd(0, 3),
      dur: rnd(1.8, 3.2),
    })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {leaves.map((l, i) => (
        <span
          key={`l${i}`}
          className="leaf"
          style={{
            left: `${l.left}%`,
            width: l.size,
            height: l.size,
            '--delay': `${l.delay}s`,
            '--dur': `${l.dur}s`,
            '--sway': `${l.sway}px`,
          }}
        />
      ))}
      {flies.map((f, i) => (
        <span
          key={`f${i}`}
          className="firefly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            '--delay': `${f.delay}s`,
            '--dur': `${f.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function Fireplace({ n = 18 }) {
  const embers = useMemo(() =>
    Array.from({ length: n }, () => ({
      left: rnd(18, 82),
      delay: rnd(0, 2.4),
      dur: rnd(1.4, 2.8),
      sway: rnd(-24, 24),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="fire-glow" />
      {embers.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${e.left}%`,
            '--delay': `${e.delay}s`,
            '--dur': `${e.dur}s`,
            '--sway': `${e.sway}px`,
          }}
        />
      ))}
    </div>
  );
}

function Coffee({ n = 10 }) {
  const wisps = useMemo(() =>
    Array.from({ length: n }, () => ({
      left: rnd(44, 60),
      delay: rnd(0, 2.8),
      dur: rnd(2, 3.4),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {wisps.map((w, i) => (
        <span
          key={i}
          className="steam-wisp"
          style={{
            left: `${w.left}%`,
            '--delay': `${w.delay}s`,
            '--dur': `${w.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function Wind({ n = 12 }) {
  const streaks = useMemo(() =>
    Array.from({ length: n }, () => ({
      top: rnd(8, 90),
      delay: rnd(0, 2.6),
      dur: rnd(1.6, 3),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {streaks.map((s, i) => (
        <span
          key={i}
          className="wind-streak"
          style={{
            '--top': `${s.top}%`,
            '--delay': `${s.delay}s`,
            '--dur': `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

function Birds({ n = 8 }) {
  const birds = useMemo(() =>
    Array.from({ length: n }, () => ({
      top: rnd(12, 60),
      delay: rnd(0, 3.6),
      dur: rnd(2.6, 4),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {birds.map((b, i) => (
        <span
          key={i}
          className="bird"
          style={{
            '--top': `${b.top}%`,
            '--delay': `${b.delay}s`,
            '--dur': `${b.dur}s`,
          }}
        >
          ﹏
        </span>
      ))}
    </div>
  );
}

function Piano({ n = 12 }) {
  const notes = useMemo(() =>
    Array.from({ length: n }, () => ({
      left: rnd(6, 88),
      delay: rnd(0, 3),
      dur: rnd(2.2, 3.6),
      glyph: ['♪', '♫', '♬', '♩'][Math.floor(rnd(0, 4))],
      size: rnd(12, 20),
    })), [n]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {notes.map((nd, i) => (
        <span
          key={i}
          className="music-note"
          style={{
            left: `${nd.left}%`,
            fontSize: nd.size,
            '--delay': `${nd.delay}s`,
            '--dur': `${nd.dur}s`,
          }}
        >
          {nd.glyph}
        </span>
      ))}
    </div>
  );
}

const VISUALS = {
  rain: Rain,
  ocean: Ocean,
  forest: Forest,
  fireplace: Fireplace,
  coffee: Coffee,
  wind: Wind,
  birds: Birds,
  piano: Piano,
};

export default function SoundScape({ active }) {
  const layers = active.filter((id) => VISUALS[id]);
  if (layers.length === 0) return null;
  return (
    <div className="absolute inset-0 z-0 opacity-70" aria-hidden="true">
      {layers.map((id) => {
        const V = VISUALS[id];
        return <V key={id} />;
      })}
    </div>
  );
}