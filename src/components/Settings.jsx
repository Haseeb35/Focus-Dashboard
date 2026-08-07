import { motion, AnimatePresence } from 'framer-motion';
import { BsX, BsDownload, BsUpload } from 'react-icons/bs';

const ACCENTS = [
  { key: 'blue', label: 'Blue', value: '59 130 246' },
  { key: 'green', label: 'Green', value: '16 185 129' },
  { key: 'purple', label: 'Purple', value: '139 92 246' },
  { key: 'orange', label: 'Orange', value: '249 115 22' },
];

const THEMES = [
  { key: 'minimal', label: 'Minimal', from: '240 249 255', to: '226 232 240' },
  { key: 'mountains', label: 'Mountains', from: '236 254 255', to: '199 210 254' },
  { key: 'forest', label: 'Forest', from: '240 253 250', to: '187 247 208' },
  { key: 'space', label: 'Space', from: '15 23 42', to: '30 27 75' },
  { key: 'ocean', label: 'Ocean', from: '240 253 255', to: '186 229 249' },
];

export default function Settings({ open, onClose, accent, onAccent, theme, onTheme }) {

  const exportData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('fd-'));
    const data = {};
    keys.forEach((k) => (data[k] = JSON.parse(localStorage.getItem(k))));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focus-dashboard-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-md p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xl">Settings</h2>
              <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Close settings">
                <BsX />
              </button>
            </div>

            {/* Accent color */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Accent Color</h3>
              <div className="flex gap-3">
                {ACCENTS.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => onAccent(a.key, a.value)}
                    aria-label={a.label}
                    title={a.label}
                    className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 ${accent === a.key ? '!border-white ring-2 ring-offset-2' : 'border-transparent'}`}
                    style={{ background: `rgb(${a.value})`, '--tw-ring-color': `rgb(${a.value})` }}
                  />
                ))}
              </div>
            </div>

            {/* Background theme */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Background Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
onClick={() => onTheme(t.key)}
className={`flex flex-col items-center gap-1 rounded-xl p-2 border text-xs ${theme === t.key ? 'border-[rgb(var(--accent))]' : 'border-[rgb(var(--card-border)/0.5)]'}`}
style={{ background: `linear-gradient(135deg, rgb(${t.from}), rgb(${t.to}))` }}
                  >
                    <span className="capitalize">{t.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[rgb(var(--text-secondary))] mt-1">
                Note: dark background themes best combined with dark mode.
              </p>
            </div>

            {/* Backup */}
            <div className="border-t border-[rgb(var(--card-border)/0.4)] pt-4">
              <h3 className="text-sm font-semibold mb-2">Data Backup</h3>
              <div className="flex gap-2">
                <button onClick={exportData} className="btn btn-primary flex-1">
                  <BsDownload /> Export
                </button>
                <label className="btn btn-ghost flex-1 cursor-pointer">
                  <BsUpload /> Import
                  <input type="file" accept="application/json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}