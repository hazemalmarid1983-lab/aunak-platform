import { useMemo } from 'react';

const SPARK_COLORS = ['#e8c872', '#34d399', '#f59e0b', '#38bdf8', '#f472b6', '#a78bfa'];
const BALLOON_COLORS = [
  'from-rose-400 to-pink-500',
  'from-amber-300 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-indigo-500',
  'from-violet-400 to-fuchsia-500',
  'from-[#e8c872] to-amber-500',
];

function Firework({ x, y, delay }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 14;
        const radius = 70 + Math.random() * 60;
        return {
          id: i,
          fx: `${Math.cos(angle) * radius}px`,
          fy: `${Math.sin(angle) * radius}px`,
          color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        };
      }),
    []
  );
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {sparks.map((s) => (
        <span
          key={s.id}
          className="tawasul-fw-spark"
          style={{
            background: s.color,
            boxShadow: `0 0 10px ${s.color}`,
            // eslint-disable-next-line
            ['--fx']: s.fx,
            ['--fy']: s.fy,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full-screen LOCKED reward burst — only fired when the specialist sends a
 * success/star command. Fireworks + flying balloons + confetti + big Ta-da.
 */
export default function ChildCelebration({ show, lang = 'ar' }) {
  const fireworks = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        x: 12 + Math.random() * 76,
        y: 12 + Math.random() * 50,
        delay: Math.random() * 0.9,
      })),
    [show]
  );
  const balloons = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 92,
        dur: 3 + Math.random() * 2.4,
        delay: Math.random() * 0.8,
        rot: `${-18 + Math.random() * 36}deg`,
        size: 40 + Math.random() * 36,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      })),
    [show]
  );
  const confetti = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        dur: 1.4 + Math.random() * 1.4,
        delay: Math.random() * 0.6,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
      })),
    [show]
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {/* soft flash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,200,114,0.18),transparent_65%)]" />

      {fireworks.map((f) => (
        <Firework key={f.id} x={f.x} y={f.y} delay={f.delay} />
      ))}

      {confetti.map((c) => (
        <span
          key={c.id}
          className="tawasul-confetti-piece"
          style={{ left: `${c.left}%`, background: c.color, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        />
      ))}

      {balloons.map((b) => (
        <div
          key={b.id}
          className="tawasul-balloon"
          style={{ left: `${b.left}%`, ['--dur']: `${b.dur}s`, ['--rot']: b.rot, animationDelay: `${b.delay}s` }}
        >
          <div
            className={`bg-gradient-to-br ${b.color} rounded-full shadow-lg`}
            style={{ width: b.size, height: b.size * 1.2 }}
          />
          <div className="mx-auto w-px h-10 bg-white/40" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="tawasul-tada text-center">
          <div className="text-8xl drop-shadow-[0_0_24px_rgba(232,200,114,0.6)]">🎉</div>
          <div className="mt-2 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#e8c872] via-amber-300 to-emerald-300">
            {lang === 'en' ? 'Ta-da! You did it!' : '!أحسنت! نجحت'}
          </div>
        </div>
      </div>
    </div>
  );
}
