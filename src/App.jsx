import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDarkMode from './hooks/useDarkMode';
import useLocalStorage from './hooks/useLocalStorage';
import usePomodoro from './hooks/usePomodoro';
import Background from './components/Background';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import DailyGoals from './components/DailyGoals';
import TodoList from './components/TodoList';
import AmbientSounds from './components/AmbientSounds';
import QuoteCard from './components/QuoteCard';
import Stats from './components/Stats';
import Notes from './components/Notes';
import FullscreenMode from './components/FullscreenMode';
import Settings from './components/Settings';
import Footer from './components/Footer';
import sfx from './audio/sfx';
import { getRandomQuote } from './data/quotes';

const ACCENT_KEYS = ['accent-blue', 'accent-green', 'accent-purple', 'accent-orange'];

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

function useFocusStats() {
  const [data, setData] = useLocalStorage('fd-focus', { heatmap: {}, totals: {} });
  const today = dayKey();

  const addSession = (seconds) => {
    setData((prev) => {
      const heatmap = { ...prev.heatmap, [today]: (prev.heatmap[today] || 0) + 1 };
      const totals = { ...prev.totals, [today]: (prev.totals[today] || 0) + seconds };
      return { heatmap, totals };
    });
  };

  const computeStreak = () => {
    let streak = 0;
    const d = new Date();
    // allow today or yesterday as anchor
    const todayCount = data.heatmap[today] || 0;
    let cursor = todayCount > 0 ? 0 : 1; // start offset
    for (let i = cursor; ; i++) {
      const day = new Date(d);
      day.setDate(d.getDate() - i);
      if (data.heatmap[dayKey(day)]) streak++;
      else break;
    }
    return streak;
  };

  const stripInactive = () => {
    // prune data older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cut = dayKey(cutoff);
    setData((prev) => {
      const heatmap = {};
      const totals = {};
      for (const k of Object.keys(prev.heatmap)) if (k >= cut) heatmap[k] = prev.heatmap[k];
      for (const k of Object.keys(prev.totals)) if (k >= cut) totals[k] = prev.totals[k];
      return { heatmap, totals };
    });
  };

  useEffect(() => { computeStreak(); }, []);

  return {
    sessionsToday: data.heatmap[today] || 0,
    todaySeconds: data.totals[today] || 0,
    totalSessions: Object.values(data.heatmap).reduce((a, b) => a + b, 0),
    heatmap: data.heatmap,
    streak: computeStreak(),
    addSession,
  };
}

export default function App() {
  const [isDark, toggleDark] = useDarkMode();
  const [accent, setAccent] = useLocalStorage('fd-accent', 'blue');
  const [theme, setTheme] = useLocalStorage('fd-bgtheme', 'minimal');
  const [todos, setTodos] = useLocalStorage('fd-todos', []);
  const [goals, setGoals] = useLocalStorage('fd-goals', []);
  const [daily, setDaily] = useLocalStorage('fd-daily', { key: '', tasks: 0, goals: 0 });

  const [fullscreen, setFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState('timer');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [sessionTick, setSessionTick] = useState(0);
  const toastTimer = useRef(null);
  const focus = useFocusStats();
  const pomodoro = usePomodoro();

  const today = dayKey();
  const quote = useMemo(() => getRandomQuote(), []);

  // Normalize daily counters to today
  useEffect(() => {
    if (daily.key !== today) setDaily({ key: today, tasks: 0, goals: 0 });
  }, [today, daily.key, setDaily]);

  // Apply theme + accent on load
  useEffect(() => {
    document.documentElement.classList.remove(...ACCENT_KEYS);
    document.documentElement.classList.add(`accent-${accent}`);
    const grad = THEME(theme, isDark);
    if (grad) {
      document.documentElement.style.setProperty('--bg-gradient-a', grad.a);
      document.documentElement.style.setProperty('--bg-gradient-b', grad.b);
      document.documentElement.style.setProperty('--bg-gradient-c', grad.c);
    }
  }, [accent, theme, isDark]);

  // Loading skeleton timeout
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Pomodoro completion events
  useEffect(() => {
    pomodoro.onEnd((modeFinished) => {
      if (modeFinished === 'focus') {
        focus.addSession(pomodoro.focusMinutes * 60);
        sfx.complete();
        setSessionTick((t) => t + 1);
        showToast('Great focus session! 🎉');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoro.onEnd]);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }, []);

  const onTaskCompleted = () => {
    setDaily((d) => (d.key === today ? { ...d, tasks: d.tasks + 1 } : d));
  };

  const toggleBrowserFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  const enterFocusMode = () => {
    sfx.click();
    setFullscreen(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (fullscreen) return; // fullscreen handles its own
      if (isTyping(e)) return; // don't hijack keys while typing
      if (e.code === 'Space') {
        e.preventDefault();
        sfx.click();
        pomodoro.isRunning ? pomodoro.pause() : pomodoro.start();
      } else if (e.key === 'f' || e.key === 'F') {
        enterFocusMode();
      } else if (e.key === 'n' || e.key === 'N') {
        document.querySelector('[aria-label="New task"]')?.focus();
      } else if (e.key === 'm' || e.key === 'M') {
        document.querySelector('[aria-label="Mute"]')?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen, pomodoro.isRunning]);

  const isTyping = (e) => {
    const el = e.target;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
  };

  // Custom cursor
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    let x = 0, y = 0;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
    };
    const raf = () => {
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      requestAnimationFrame(raf);
    };
    window.addEventListener('mousemove', move);
    requestAnimationFrame(raf);
    return () => {
      window.removeEventListener('mousemove', move);
      dot.remove();
    };
  }, []);

  const activeTask = todos.find((t) => !t.done)?.title || '';

  const cardEnter = {
    initial: { opacity: 0, y: 40, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="min-h-screen relative">
      <Background />
      {fullscreen && (
        <FullscreenMode
          pomodoro={pomodoro}
          currentTask={activeTask}
          quote={quote.text}
          isDark={isDark}
          onToggleDark={toggleDark}
          onExit={() => setFullscreen(false)}
          isRunning={pomodoro.isRunning}
          onToggle={() => (pomodoro.isRunning ? pomodoro.pause() : pomodoro.start())}
        />
      )}

      <Header
        isDark={isDark}
        onToggleDark={toggleDark}
        onFullscreen={toggleBrowserFullscreen}
        onOpenSettings={() => setSettingsOpen(true)}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 flex gap-5 mt-4">
        <Sidebar
          open={sidebarOpen}
          current={section}
          onNavigate={setSection}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card h-64 animate-pulse" style={{ background: 'rgb(var(--glass)/0.4)' }} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.05 }}><Timer pomodoro={pomodoro} sessionTick={sessionTick} /></motion.div>
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.1 }}><DailyGoals onProgress={(count) => setDaily((d) => (d.key === today ? { ...d, goals: count } : d))} /></motion.div>
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.15 }}><TodoList onTaskCompleted={onTaskCompleted} /></motion.div>
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.2 }}><AmbientSounds /></motion.div>
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.25 }}><QuoteCard /></motion.div>
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.3 }}>
                <Stats stats={{
                  todaySeconds: focus.todaySeconds,
                  sessionsToday: focus.sessionsToday,
                  totalSessions: focus.totalSessions,
                  tasksCompleted: daily.tasks,
                  goalsCompleted: daily.goals,
                  streak: focus.streak,
                  heatmap: focus.heatmap,
                }} />
              </motion.div>
              <motion.div {...cardEnter} transition={{ type: 'spring', damping: 22, stiffness: 200, delay: 0.35 }} className="md:col-span-2"><Notes /></motion.div>
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass px-6 py-3 font-semibold shadow-2xl border-2"
            style={{ borderColor: 'rgb(var(--accent) / 0.5)' }}
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accent={accent}
        onAccent={(key) => setAccent(key)}
        theme={theme}
        onTheme={(key) => setTheme(key)}
      />
    </div>
  );
}

const THEME = (theme, isDark) => {
  if (isDark) {
    return { a: '2 6 23', b: '15 23 42', c: '61 24 92' };
  }
  const map = {
    minimal: { a: '240 249 255', b: '224 242 254', c: '226 232 240' },
    mountains: { a: '236 254 255', b: '199 210 254', c: '214 219 226' },
    forest: { a: '240 253 250', b: '209 250 229', c: '187 247 208' },
    space: { a: '2 6 23', b: '30 27 75', c: '15 23 42' },
    ocean: { a: '240 253 255', b: '207 250 254', c: '186 229 249' },
  };
  return map[theme] || map.minimal;
};