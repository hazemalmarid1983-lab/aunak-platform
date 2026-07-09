import { MOOD_GLOW, MOOD_GRADIENTS } from '../../lib/academyTheme';

export default function AcademyLiveBackground({ mood = 'idle', calm = false }) {
  const effectiveMood = calm ? 'idle' : mood;
  const gradient = MOOD_GRADIENTS[effectiveMood] ?? MOOD_GRADIENTS.idle;
  const glow = MOOD_GLOW[effectiveMood] ?? MOOD_GLOW.idle;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-all duration-1000 ease-in-out academy-bg-shift`}
      />
      <div
        className="absolute -top-1/4 -start-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl academy-orb-float opacity-70"
        style={{ background: glow }}
      />
      <div
        className="absolute -bottom-1/4 -end-1/4 w-[50vw] h-[50vw] rounded-full blur-3xl academy-orb-float-delay opacity-60"
        style={{ background: glow }}
      />
      <div
        className={`absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vh] rounded-full blur-[100px] academy-glow-pulse opacity-40`}
        style={{ background: glow }}
      />
      {mood === 'celebrate' && !calm && (
        <div className="absolute inset-0 academy-celebrate-burst pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="academy-confetti-piece"
              style={{
                left: `${(i * 17) % 100}%`,
                animationDelay: `${(i % 8) * 0.08}s`,
                background: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa'][i % 5],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
