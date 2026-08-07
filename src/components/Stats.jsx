import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BsFire, BsStopwatch, BsCheck2Square, BsBullseye, BsLightningFill } from 'react-icons/bs';

const weeks = 10;

export default function Stats({ stats }) {
  const {
    todaySeconds,
    totalSessions,
    tasksCompleted,
    goalsCompleted,
    streak,
    heatmap = {}, // { "YYYY-MM-DD": count }
  } = stats;

  const hours = Math.floor(todaySeconds / 3600);
  const mins = Math.floor((todaySeconds % 3600) / 60);

  const heatData = useMemo(() => {
    const end = new Date();
    const days = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: heatmap[key] || 0 });
    }
    return days;
  }, [heatmap]);

  const counts = heatData.map((d) => d.count);
  const maxCount = Math.max(1, ...counts);

  const activeDays = heatData.filter((d) => d.count > 0).length;
  const focusPct = Math.min(100, Math.round((todaySeconds / (8 * 3600)) * 100));

  const items = [
    { icon: BsStopwatch, label: 'Focus Time', value: `${hours}h ${mins}m`, sub: `${focusPct}% of daily goal`, accent: true },
    { icon: BsLightningFill, label: 'Sessions Today', value: totalSessions, sub: `${activeDays} active day${activeDays === 1 ? '' : 's'}`, accent: true },
    { icon: BsCheck2Square, label: 'Tasks Done', value: tasksCompleted, sub: 'this view', accent: true },
    { icon: BsBullseye, label: 'Goals Done', value: goalsCompleted, sub: 'daily goals', accent: true },
  ];

  const opacity = (lvl) => ['0.12', '0.3', '0.55', '0.8', '1'][lvl];

  return (
    <div className="glass-card p-6 flex flex-col gap-5 h-full overflow-hidden">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <BsLightningFill className="text-[rgb(var(--accent))]" /> Focus Statistics
      </h2>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((s) => (
          <div key={s.label} className="flex items-center gap-3 bg-[rgb(var(--glass)/0.4)] border border-[rgb(var(--card-border)/0.35)] rounded-2xl p-3">
            <div className="w-10 h-10 rounded-xl grid place-items-center text-lg flex-shrink-0" style={{ background: 'rgb(var(--accent)/0.15)', color: 'rgb(var(--accent))' }}>
              <s.icon />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-lg leading-tight">{s.value}</div>
              <div className="text-xs text-[rgb(var(--text-secondary))] truncate">{s.label}</div>
              {s.sub && <div className="text-[11px] text-[rgb(var(--text-secondary))] truncate">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Streak flame */}
      <div className="flex items-center justify-center gap-3 p-3 rounded-xl" style={{ background: 'rgb(var(--accent)/0.1)' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl"
        >
          <BsFire className="text-orange-500" aria-hidden="true" />
        </motion.div>
        <div>
          <div className="font-bold text-xl tabular-nums">{streak} day{streak === 1 ? '' : 's'}</div>
          <div className="text-xs text-[rgb(var(--text-secondary))]">
            {streak > 0 ? 'Streak on fire — keep going!' : 'No active streak yet. Start one today!'}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-1">
        <div className="flex items-center justify-between text-xs text-[rgb(var(--text-secondary))] mb-2">
          <span>Focus sessions · last {weeks} weeks</span>
          <span className="tabular-nums">{totalSessions} today · {heatData.reduce((a, b) => a + b.count, 0)} total</span>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ minWidth: weeks * 14 }}>
            {heatData.map((d, i) => {
              const lvl = d.count <= 0 ? 0 : d.count <= maxCount * 0.25 ? 1 : d.count <= maxCount * 0.5 ? 2 : d.count <= maxCount * 0.75 ? 3 : 4;
              return (
                <motion.div
                  key={d.date}
                  className="heat-cell w-3 h-3 rounded-sm"
                  title={`${d.date}: ${d.count} session${d.count === 1 ? '' : 's'}`}
                  style={{ background: lvl > 0 ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))' }}
                  initial={{ opacity: opacityValues(lvl) }}
                  animate={{ opacity: opacityValues(lvl) }}
                  transition={{ delay: i * 0.005 }}
                />
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[rgb(var(--text-secondary))]">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="w-3 h-2 rounded" style={{ background: 'rgb(var(--accent))', opacity: opacityValues(l) }} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

const opacityValues = (i) => ['0.12', '0.3', '0.55', '0.8', '1'][i];