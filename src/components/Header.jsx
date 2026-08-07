import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BsMoonStars, BsSun, BsArrowsFullscreen, BsGear, BsList, BsX } from 'react-icons/bs';

export default function Header({ isDark, onToggleDark, onFullscreen, onOpenSettings, sidebarOpen, onSidebarToggle }) {
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState(getGreeting(new Date().getHours()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function getGreeting(h) {
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 21) return 'Good evening';
    return 'Good night';
  }

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-40 glass rounded-none sm:rounded-2xl sm:mx-4 lg:mx-8 mt-0 sm:mt-4 px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
    >
      {/* Left: logo + clock */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
          className="btn btn-ghost rounded-lg p-2 lg:hidden"
        >
          {sidebarOpen ? <BsX size={20} /> : <BsList size={20} />}
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className="text-2xl">
            🎯
          </motion.div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight truncate">Focus Dashboard</h1>
            <p className="text-xs text-[rgb(var(--text-secondary))] leading-tight">Deep work starts here.</p>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-start ml-6 pl-6 border-l border-[rgb(var(--card-border)/0.6)]">
          <div className="font-semibold tabular-nums">{formattedTime}</div>
          <div className="text-xs text-[rgb(var(--text-secondary))]">{formattedDate} · {greeting}</div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <IconButton label="Toggle theme" onClick={onToggleDark}>
          {isDark ? <BsSun className="text-amber-400" /> : <BsMoonStars className="text-indigo-400" />}
        </IconButton>
        <IconButton label="Fullscreen" onClick={onFullscreen}>
          <BsArrowsFullscreen className="text-[rgb(var(--text-secondary))]" />
        </IconButton>
        <IconButton label="Settings" onClick={onOpenSettings}>
          <BsGear className="text-[rgb(var(--text-secondary))]" />
        </IconButton>
      </div>
    </motion.header>
  );
}

function IconButton({ children, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="btn btn-ghost px-3 py-2 rounded-xl"
    >
      {children}
    </motion.button>
  );
}