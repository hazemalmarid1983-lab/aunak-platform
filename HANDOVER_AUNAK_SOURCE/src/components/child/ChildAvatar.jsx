import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Living sovereign companion — a breathing, blinking robot friend whose eyes
 * track the child's finger/cursor and who winks + bounces when tapped.
 * No text, pure sensory presence (mood: happy | calm | celebrate).
 */
export default function ChildAvatar({ mood = 'happy', onTap, size = 168 }) {
  const wrapRef = useRef(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [wink, setWink] = useState(false);
  const [bounce, setBounce] = useState(0);

  useEffect(() => {
    const move = (clientX, clientY) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const max = 6; // px pupil travel
      setPupil({ x: (dx / dist) * Math.min(max, dist / 12), y: (dy / dist) * Math.min(max, dist / 12) });
    };
    const onMouse = (e) => move(e.clientX, e.clientY);
    const onTouch = (e) => {
      const tch = e.touches?.[0];
      if (tch) move(tch.clientX, tch.clientY);
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  const palette =
    mood === 'calm'
      ? { ring: 'from-indigo-400 to-violet-500', glow: 'rgba(129,140,248,0.5)', cheek: 'bg-indigo-300/50' }
      : mood === 'celebrate'
        ? { ring: 'from-[#e8c872] to-amber-400', glow: 'rgba(232,200,114,0.65)', cheek: 'bg-amber-300/60' }
        : { ring: 'from-[#c9a962] to-emerald-400', glow: 'rgba(52,211,153,0.5)', cheek: 'bg-emerald-300/50' };

  const handleTap = () => {
    setWink(true);
    setBounce((b) => b + 1);
    setTimeout(() => setWink(false), 420);
    onTap?.();
  };

  const eye = (delayClass) => (
    <div className="relative w-[22%] h-[26%] rounded-full bg-white overflow-hidden shadow-inner">
      <div className={`absolute inset-0 ${wink ? '' : delayClass}`} style={wink ? { transform: 'scaleY(0.1)' } : undefined}>
        <div
          className="absolute left-1/2 top-1/2 w-[55%] h-[55%] rounded-full bg-[#0a0a0c]"
          style={{ transform: `translate(calc(-50% + ${pupil.x}px), calc(-50% + ${pupil.y}px))` }}
        >
          <span className="absolute right-[18%] top-[14%] w-[28%] h-[28%] rounded-full bg-white/90" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.button
      type="button"
      ref={wrapRef}
      onClick={handleTap}
      aria-label="companion"
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-full"
      style={{ width: size, height: size }}
      animate={{ scale: bounce % 2 === 0 ? 1 : [1, 1.12, 0.96, 1] }}
      transition={{ duration: 0.45 }}
      whileTap={{ scale: 0.94 }}
    >
      <span
        className="tawasul-ring absolute inset-0 rounded-full border-2 border-emerald-300/50"
        style={{ boxShadow: `0 0 40px ${palette.glow}` }}
      />
      <span className="tawasul-ring-delay absolute inset-0 rounded-full border-2 border-[#e8c872]/40" />

      <div
        className={`tawasul-avatar-breathe relative w-full h-full rounded-[42%] bg-gradient-to-br ${palette.ring} border-4 border-white/20 flex items-center justify-center`}
        style={{ boxShadow: `0 0 48px ${palette.glow}, inset 0 -10px 24px rgba(0,0,0,0.25)` }}
      >
        {/* antenna */}
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 bg-white/60 rounded-full" />
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

        {/* face plate */}
        <div className="relative w-[74%] h-[62%] rounded-[38%] bg-[#0a0a0c]/85 border border-white/15 flex flex-col items-center justify-center gap-[8%] px-[8%]">
          <div className="flex w-full items-center justify-between px-[6%]">
            {eye('tawasul-blink')}
            {eye('tawasul-blink-delay')}
          </div>
          {/* mouth */}
          {mood === 'calm' ? (
            <span className="w-[34%] h-[10%] rounded-full bg-indigo-200/80" />
          ) : (
            <span className="w-[42%] h-[20%] rounded-b-[999px] bg-gradient-to-b from-transparent to-white/85 border-b-4 border-white/85" />
          )}
        </div>

        {/* cheeks */}
        <span className={`absolute left-[16%] top-[56%] w-[14%] h-[9%] rounded-full ${palette.cheek} blur-[1px]`} />
        <span className={`absolute right-[16%] top-[56%] w-[14%] h-[9%] rounded-full ${palette.cheek} blur-[1px]`} />
      </div>
    </motion.button>
  );
}
