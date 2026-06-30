import { useEffect, useState } from 'react';
import { CHILD } from '../../lib/childTheme';
import { TAWASUL_CHILD } from '../../lib/tawasulChildTheme';

const BREATH_MS = 4000;

export default function ChildCalmZone({ lang = 'ar', sovereign = false }) {
  const theme = sovereign ? TAWASUL_CHILD : CHILD;
  const [phase, setPhase] = useState('in');

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), BREATH_MS);
    return () => clearInterval(t);
  }, []);

  const copy =
    lang === 'en'
      ? { title: sovereign ? 'Neural calm pulse' : 'Calm breath', hint: phase === 'in' ? 'Breathe in…' : 'Breathe out…' }
      : { title: sovereign ? 'نبض الهدوء العصبي' : 'تنفس هادئ', hint: phase === 'in' ? 'شهيق…' : 'زفير…' };

  return (
    <div className={theme.card}>
      <h2 className={`${theme.title} text-center mb-6`}>{copy.title}</h2>
      <div className="flex flex-col items-center gap-6 py-8">
        <div
          className={`w-32 h-32 rounded-full border-4 shadow-xl transition-transform duration-[4000ms] ease-in-out ${
            sovereign
              ? `bg-gradient-to-br from-emerald-400/80 to-[#c9a962]/60 border-[#e8c872]/40 shadow-[0_0_32px_rgba(52,211,153,0.25)] ${
                  phase === 'in' ? 'scale-125' : 'scale-90'
                }`
              : `bg-gradient-to-br from-sky-300 to-indigo-400 border-white ${
                  phase === 'in' ? 'scale-125' : 'scale-90'
                }`
          }`}
        />
        <p className={`text-xl font-black ${sovereign ? 'text-emerald-300' : 'text-indigo-600'}`}>{copy.hint}</p>
      </div>
    </div>
  );
}
