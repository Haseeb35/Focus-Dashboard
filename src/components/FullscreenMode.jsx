import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPlayFill, BsPauseFill, BsArrowLeft, BsMoonStars, BsSun } from 'react-icons/bs';
export default function FullscreenMode({
  pomodoro, currentTask, quote, isDark, onToggleDark, onExit, isRunning, onToggle,
  activeSounds,
}) {
  const {
    focusMinutes, secondsLeft, shortMinutes, longMinutes, mode,
  } = pomodoro;

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  // Escape to exit
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onExit();
      if (e.code === 'Space') { e.preventDefault(); onToggle(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, onToggle]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 p-8"
      style={{
        background: isDark
          ? 'radial-gradient(circle at center, #1e1b4b 0%, #020617 70%)'
          : 'radial-gradient(circle at center, #eff6ff 0%, #e2e8f0 70%)',
      }}
    >
      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button onClick={onExit} className="btn btn-ghost !bg-[rgb(var(--glass)/0.3)]" aria-label="Back to dashboard">
          <BsArrowLeft /> Dashboard
        </button>
        <button onClick={onToggleDark} className="btn btn-ghost !bg-[rgb(var(--glass)/0.3)]" aria-label="Toggle theme">
          {isDark ? <BsSun /> : <BsMoonStars />}
        </button>
      </div>

      {/* Mode */}
      <div className="text-sm uppercase tracking-widest text-[rgb(var(--text-secondary))]">
        {mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}
      </div>

      {/* Timer */}
      <div className="text-[9rem] md:text-[12rem] font-bold tabular-nums leading-none">
        {minutes}:{seconds}
      </div>

      {/* Current task */}
      {currentTask && (
        <motion.div
          key={currentTask}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-medium text-[rgb(var(--text-secondary))]"
        >
          {currentTask}
        </motion.div>
      )}

      {/* Controls */}
      <button
        onClick={onToggle}
        className="btn btn-primary rounded-full px-10 py-4 text-xl"
        aria-label={isRunning ? 'Pause' : 'Resume'}
      >
        {isRunning ? <><BsPauseFill /> Pause</> : <><BsPlayFill /> Start</>}
      </button>

      {/* Quote */}
      <blockquote className="max-w-xl text-center text-lg text-[rgb(var(--text-secondary))]">
        “{quote}”
      </blockquote>

      {/* Hint */}
      <div className="text-xs text-[rgb(var(--text-secondary))] opacity-70">Press Esc to exit focus mode</div>
    </motion.div>
  );
}