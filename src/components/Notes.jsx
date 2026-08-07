import { motion } from 'framer-motion';
import { BsSticky } from 'react-icons/bs';
import useLocalStorage from '../hooks/useLocalStorage';

export default function Notes() {
  const [note, setNote] = useLocalStorage('fd-notes', '');

  return (
    <div className="glass-card p-6 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <BsSticky className="text-[rgb(var(--accent))]" /> Notes
        </h2>
        <span className="text-xs text-[rgb(var(--text-secondary))]">Auto-saved</span>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Jot down quick thoughts, ideas, or reminders..."
        aria-label="Notes scratchpad"
        className="flex-1 min-h-[120px] bg-[rgb(var(--glass)/0.5)] border border-[rgb(var(--card-border)/0.4)] rounded-xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
      />
      <div className="flex items-center justify-between text-xs text-[rgb(var(--text-secondary))]">
        <span>{note.length} characters</span>
        {note && (
          <button
            onClick={() => setNote('')}
            className="hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] rounded px-1"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}