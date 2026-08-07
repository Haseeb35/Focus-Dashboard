import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPlayFill, BsPauseFill, BsSkipForward, BsArrowCounterclockwise, BsFire } from 'react-icons/bs';
import sfx from '../audio/sfx';

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 80 }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: ['#facc15', '#f472b6', '#60a5fa', '#a78bfa', '#34d399', '#fb923c'][Math.floor(Math.random() * 6)],
      rotate: Math.random() * 360,
    }))
  ).current;

  return (
    <div className="absolute inset-[-60%] pointer-events-none overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

const FOCUS_VALUES = [15, 25, 30, 45, 60];
const SHORT_VALUES = [5, 10, 15];
const LONG_VALUES = [15, 20, 30];

export default function Timer({ pomodoro, sessionTick }) {
  const {
    mode, changeMode, focusMinutes, setFocusMinutes,
    shortMinutes, setShortMinutes, longMinutes, setLongMinutes,
    secondsLeft, isRunning, start, pause, reset, skip,
    sessionsCompleted, autoCycle, setAutoCycle,
  } = pomodoro;

  const [showConfetti, setShowConfetti] = useState(false);
  const lastTick = useRef(0);

  useEffect(() => {
    if (sessionTick > 0 && sessionTick !== lastTick.current) {
      lastTick.current = sessionTick;
      sfx.bell();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [sessionTick]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const totalSeconds = (mode === 'focus' ? focusMinutes : mode === 'short' ? shortMinutes : longMinutes) * 60;
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const running = isRunning && secondsLeft > 0;

  const toggle = () => {
    sfx.click();
    if (running) pause();
    else start();
  };

  const handleSkip = () => {
    sfx.click();
    skip();
  };

  const handleReset = () => {
    sfx.click();
    reset();
  };

  const changeModeCb = (m) => {
    sfx.click();
    changeMode(m);
  };

  const renderMode = (label, value, onChange, options) => (
    <label className="flex flex-col text-xs text-[rgb(var(--text-secondary))] gap-1">
      {label}
      <select
        value={value}
        onChange={(e) => { sfx.click(); onChange(Number(e.target.value)); }}
        disabled={running}
        className="bg-[rgb(var(--glass)/0.6)] border border-[rgb(var(--card-border)/0.6)] rounded-lg px-2 py-1.5 text-sm text-[rgb(var(--text-primary))] outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o} min</option>
        ))}
      </select>
    </label>
  );

  const modeLabels = [
    ['focus', 'Focus'],
    ['short', 'Short'],
    ['long', 'Long'],
  ];

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 h-full">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-xl gradient-text">Pomodoro</h2>
        <label className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-secondary))] cursor-pointer">
          <input
            type="checkbox"
            checked={autoCycle}
            onChange={(e) => setAutoCycle(e.target.checked)}
            className="accent-[rgb(var(--accent))]"
          />
          Auto-cycle
        </label>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-[rgb(var(--card-border)/0.25)] p-1.5 rounded-2xl gap-1 w-full">
        {modeLabels.map(([m, label]) => (
          <motion.button
            key={m}
            onClick={() => changeModeCb(m)}
            layout
            className={`btn flex-1 px-3 py-1.5 text-xs rounded-xl font-semibold transition-colors ${mode === m ? 'btn-primary shadow-lg' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'}`}
            whileTap={{ scale: 0.94 }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {/* Circular timer */}
      <div className={`relative w-56 h-56 ${running ? 'timer-halo' : ''}`}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 208 208" aria-hidden="true">
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent))" />
              <stop offset="55%" stopColor="rgb(139 92 246)" />
              <stop offset="100%" stopColor="rgb(14 165 233)" />
            </linearGradient>
          </defs>
          <circle className="text-[rgb(var(--card-border))]" stroke="currentColor" strokeWidth="10" fill="none" cx="104" cy="104" r="94" />
          <motion.circle
            stroke="url(#timerGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            cx="104"
            cy="104"
            r="94"
            strokeDasharray={2 * Math.PI * 94}
            animate={{ strokeDashoffset: 2 * Math.PI * 94 * (1 - progress), filter: running ? 'drop-shadow(0 0 6px rgb(var(--accent) / 0.6))' : 'none' }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={running ? { scale: [1, 1.01, 1] } : {}}
            transition={running ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="flex flex-col items-center"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${minutes}:${seconds}`}
                initial={{ opacity: 0.2, scale: 0.94, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-6xl font-extrabold tabular-nums tracking-tight gradient-text"
              >
                {minutes}:{seconds}
              </motion.div>
            </AnimatePresence>
            <div className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--text-secondary))] mt-1.5">
              {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'}
            </div>
          </motion.div>
        </div>
        {showConfetti && <Confetti />}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleReset} className="btn btn-ghost rounded-full p-3" aria-label="Reset session" title="Reset (ignored)">
          <BsArrowCounterclockwise />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={toggle}
          className="btn btn-primary rounded-full px-8 py-3 text-base"
        >
          {running ? (
            <><BsPauseFill /> Pause</>
          ) : secondsLeft > 0 && secondsLeft < totalSeconds ? (
            <><BsPlayFill /> Resume</>
          ) : (
            <><BsPlayFill /> Start</>
          )}
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleSkip} className="btn btn-ghost rounded-full p-3" aria-label="Skip session" title="Skip session">
          <BsSkipForward />
        </motion.button>
      </div>

      {/* Duration selects */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {renderMode('Focus', focusMinutes, setFocusMinutes, FOCUS_VALUES)}
        {renderMode('Short', shortMinutes, setShortMinutes, SHORT_VALUES)}
        {renderMode('Long', longMinutes, setLongMinutes, LONG_VALUES)}
      </div>

      {/* Sessions */}
      <div className="w-full flex items-center justify-center gap-2 text-sm" aria-live="polite">
        <BsFire className="text-[rgb(var(--accent))]" aria-hidden="true" />
        <span className="font-semibold">{sessionsCompleted}</span>
        <span className="text-[rgb(var(--text-secondary))]">sessions completed today</span>
      </div>
    </div>
  );
}