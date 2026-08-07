import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--bg-gradient-a))] via-[rgb(var(--bg-gradient-b))] to-[rgb(var(--bg-gradient-c))] transition-colors duration-700" />

      {/* Aurora glow - slow rotating conic light */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[120vmax] h-[120vmax] rounded-full opacity-40 blur-3xl animate-spin-slow"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgb(var(--accent) / 0.22) 80deg, transparent 160deg, rgb(139 92 246 / 0.16) 240deg, transparent 320deg)',
        }}
      />

      {/* Organic drifting blobs */}
      <motion.div
        className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full opacity-40 blur-2xl"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgb(var(--accent) / 0.4), transparent 70%)' }}
        animate={{ x: [0, 60, -20, 0], y: [0, 30, 60, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-[640px] h-[640px] rounded-full opacity-35 blur-2xl"
        style={{ background: 'radial-gradient(circle, rgb(168 85 247 / 0.4), transparent 70%)' }}
        animate={{ x: [0, -70, 10, 0], y: [0, 50, -40, 0], scale: [1, 0.9, 1.2, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute bottom-[-10rem] left-1/3 w-[560px] h-[560px] rounded-full opacity-35 blur-2xl"
        style={{ background: 'radial-gradient(circle, rgb(14 165 233 / 0.35), transparent 70%)' }}
        animate={{ x: [0, 40, -50, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Starfield / floating particles */}
      <FloatingParticles />

      {/* Soft vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(var(--bg-gradient-a)/0.4))]" />
    </div>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => ({
      left: (i * 47 + 5) % 100,
      top: (i * 29 + 3) % 100,
      size: (i % 6) + 3,
      dur: 8 + (i % 6) * 3,
      delay: i * 0.4,
      hue: i % 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.hue === 0
              ? 'rgb(var(--accent) / 0.35)'
              : p.hue === 1
                ? 'rgba(139, 92, 246, 0.3)'
                : 'rgba(14, 165, 233, 0.3)',
            boxShadow: '0 0 12px 2px currentColor',
          }}
          animate={{ y: [0, -60, 0], x: [0, 20, -10, 0], opacity: [0.2, 0.9, 0.2], scale: [1, 1.4, 1] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  );
}