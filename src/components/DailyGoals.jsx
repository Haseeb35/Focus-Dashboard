import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPlus, BsTrash } from 'react-icons/bs';
import useLocalStorage from '../hooks/useLocalStorage';
import sfx from '../audio/sfx';

export default function DailyGoals({ onProgress }) {
  const [goals, setGoals] = useLocalStorage('fd-goals', []);
  const [input, setInput] = useState('');

  const doneCount = goals.filter((g) => g.done).length;
  const total = goals.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && doneCount === total;

  useEffect(() => {
    if (onProgress) onProgress(doneCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount]);

  const addGoal = () => {
    const title = input.trim();
    if (!title) return;
    sfx.click();
    setGoals([...goals, { id: Date.now(), title, done: false }]);
    setInput('');
  };

  const toggleGoal = (id) => {
    const goal = goals.find(g => g.id === id);
    setGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
    if (goal && !goal.done) sfx.check();
  };

  const removeGoal = (id) => {
    sfx.click();
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Daily Goals</h2>
        <span className="text-xs text-[rgb(var(--text-secondary))]">
          {doneCount} / {total} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-[rgb(var(--card-border)/0.4)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'rgb(var(--accent))' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm py-2 rounded-xl"
          style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}
        >
          🎉 All daily goals complete. You're unstoppable!
        </motion.div>
      )}

      {/* Add goal */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a goal (e.g. Finish assignment)"
          aria-label="Add new goal"
          className="flex-1 bg-[rgb(var(--glass)/0.6)] border border-[rgb(var(--card-border)/0.6)] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
        />
        <button onClick={addGoal} className="btn btn-primary" aria-label="Add goal">
          <BsPlus size={18} />
        </button>
      </div>

      {/* Goals list */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
        <AnimatePresence initial={false}>
          {goals.length === 0 && (
            <div className="text-center text-sm text-[rgb(var(--text-secondary))] py-8">
              <div className="text-4xl mb-2">🎯</div>
              Set a few daily goals to stay on track.
            </div>
          )}
          {goals.map((g) => (
            <motion.div
              key={g.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className={`flex items-center justify-between gap-3 bg-[rgb(var(--glass)/0.5)] border border-[rgb(var(--card-border)/0.4)] rounded-xl px-3 py-2.5 ${g.done ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleGoal(g.id)}
                  aria-label={g.done ? 'Mark incomplete' : 'Mark complete'}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] ${g.done ? 'border-[rgb(var(--accent))]' : ''}`}
                  style={g.done ? { background: 'rgb(var(--accent))' } : {}}
                >
                  {g.done && (
                    <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                      <path fill="none" stroke="currentColor" strokeWidth="3" d="M4 12l5 5 11-11" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm break-words ${g.done ? 'line-through' : ''}`}>{g.title}</span>
              </div>
              <button onClick={() => removeGoal(g.id)} className="text-[rgb(var(--text-secondary))] hover:text-red-500 p-1" aria-label="Delete goal">
                <BsTrash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}