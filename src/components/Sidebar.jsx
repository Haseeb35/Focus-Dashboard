import { motion, AnimatePresence } from 'framer-motion';
import { BsClock, BsBullseye, BsListCheck, BsSoundwave, BsQuote, BsBarChart, BsSticky } from 'react-icons/bs';

const SECTIONS = [
  { id: 'timer', label: 'Timer', icon: BsClock },
  { id: 'goals', label: 'Daily Goals', icon: BsBullseye },
  { id: 'todo', label: 'To-Do', icon: BsListCheck },
  { id: 'sounds', label: 'Ambient', icon: BsSoundwave },
  { id: 'quote', label: 'Quote', icon: BsQuote },
  { id: 'stats', label: 'Stats', icon: BsBarChart },
  { id: 'notes', label: 'Notes', icon: BsSticky },
];

export default function Sidebar({ open, current, onNavigate, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-64 z-40 glass p-4 flex flex-col gap-1 lg:static lg:translate-x-0 lg:h-auto lg:w-44 lg:glass-card"
            aria-label="Dashboard sections"
          >
            <p className="text-xs uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-2 lg:hidden">Sections</p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => { onNavigate(s.id); if (window.innerWidth < 1024) onClose(); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${current === s.id ? 'text-white' : 'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--accent)/0.1)]'}`}
                style={current === s.id ? { background: 'rgb(var(--accent))' } : {}}
              >
                <s.icon className="text-lg" aria-hidden="true" />
                {s.label}
              </button>
            ))}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}